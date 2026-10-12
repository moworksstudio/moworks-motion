"""The v2 lint: quick warnings at the end of every kit.py build (a few seconds), also kit.py lint <project>. Test 1 (08/10/2026, U7): the
checks that found real problems ran for many minutes (verify 21 min, collide 23 min) or only by eye; these are the cheap ones, every build.

From film.json:
  logo     a logo with motion: a pack with brand.json "logoRule" (film "brand") never moves its logos; any brand: no distorting
           preset on a logo (glitch, squash, stretch, wobble, liquid, warp, shatter, melt, rgb-split)
From the built film (the kit driver, as an export renders it), two settled moments per scene (55 % and 85 % of it):
  text     two text blocks over each other (kit.py collide's own test, "text-text")
  margin   text fully visible outside the safe margin ((w + h) / 55)
  blank    a frame right after a scene cut where no scene shows
  reading  (every 0.2 s of the film) a text block of 3 words or more that can be read (visible, opacity >= 0.5, on the frame) for less
           than 0.5 s + 0.3 s a word (12/10/2026: the "Motion Lab" article's hold, before 0.3 s + 0.2 s a word; one line per scene when several
           share it); one-word blocks (lyrics word by word, counters) are not counted
  contrast (the two settled moments; 12/10/2026, WCAG 1.4.3 as the article asks: "4.5:1 contrast on every frame") a text block whose
           colour against what is behind it (the same frame with every text hidden, the 20th / 80th percentile of its box's luminance
           nearer the text) is under 4.5:1, or 3:1 for large text (24 px, or 18.7 px bold); text with an outline, a shadow or a gradient
           fill is skipped (its own edge carries it)
  product  (same samples; chat B's proposal, 08/10/2026 night) a product render (motion/image-sequence) whose box on screen (the opaque part of
           the picture shown, qa/poses.py boxes) moves or changes width while a text block next to it (under 120 px away, or over it)
           holds still: the text was placed for one pose and the turn leaves it hanging or runs into it
From film.json alone (no browser):
  jump     a motion/image-sequence that moves more than 3 render frames in one film frame (its keys too fast, or a key that jumps) where
           the two pictures really differ (a portal, the same picture, is fine): a visible jump when played (chat B's proposal)
From film.json "checks" (12/10/2026, the article's numeric audit: "71 checks, from the blink on frame 432 to the feet touching each pad"):
  check    [{ "at": 2.5 | { "beat": 8 }, "el": "logo", "expect": { "opacity": [">=", 0.99], "x": ["~", 960] }, "say": "logo lands" }] read on the
           live film (qa/motionview.py run_checks): every one that does not hold is a warning; "checks: n/n as planned" is printed
From the built film's tweens (index.html):
  bounce   opacity or a colour on an ease that overshoots or bounces (back, elastic, bounce, a custom curve leaving 0..1): position and
           size may bounce, opacity and colour never (Material 3's rule, via the "Motion Lab" article, 12/10/2026)
Warnings only, never a failed build. Off: AIMK_NO_LINT=1. -> <project>/qa/lint.json"""
import asyncio, json, math, os, re
from pathlib import Path
from urllib.parse import unquote

DISTORT = re.compile(r"glitch|squash|stretch|wobble|jelly|liquid|warp|shatter|melt|rgb-?split|chroma|distort|explode", re.I)


def _ids(target):
    """the element ids a motion's target names: "id", "#id", "#a, #b", ["a", "b"]"""
    out = []
    for t in (target if isinstance(target, list) else [target]):
        for part in str(t or "").split(","):
            m = re.fullmatch(r"\s*#?([A-Za-z_][\w-]*)\s*", part)
            if m: out.append(m.group(1))
    return out


def _walk(els):
    for e in els or []:
        yield e
        yield from _walk(e.get("children"))


def is_logo(e):
    s = " ".join(str(e.get(k) or "") for k in ("id", "class", "src")).lower()
    return bool(re.search(r"logo|lettermark|wordmark|lockup", s)) or "/logos/" in s


def spec_checks(spec, lay):
    out = []
    import brand
    pack, B = brand.pack_of(spec)
    still = bool(B.get("logoRule"))                      # the film's pack says its logos never move
    for s, L in zip(spec["scenes"], lay):
        els = list(_walk(s.get("elements")))
        logos = {e["id"]: e for e in els if is_logo(e)}
        for m in s.get("motion", []):
            pr = m.get("params") or {}
            if pr.get("set") or pr.get("duration") == 0: continue        # an instant set (a hard-cut appearance) is not motion (Test 1's s19 logo)
            for i in _ids(m.get("target")):
                if i not in logos: continue
                if still: out.append({"kind": "logo", "scene": s["id"], "msg": f"logo #{i} has motion ({m['preset']}): {B.get('name') or pack} logos never move (fade the scene or cut instead)"})
                elif DISTORT.search(m["preset"]): out.append({"kind": "logo", "scene": s["id"], "msg": f"logo #{i} gets a distorting preset ({m['preset']}): a logo enters / leaves whole, never distorted"})
    return out


SHOWN_JS = r"""(sel) => {                                  // text blocks that can be read now: visible, opacity >= 0.5 on the way up, on the frame
  const st = document.querySelector(sel), S = st.getBoundingClientRect(), out = {};
  if (!window.__aimkTxt) {                                  // the text blocks once: nearest ancestor with an id that holds text of its own
    const m = new Map();
    for (const e of st.querySelectorAll('*')) {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      let b = e; while (b !== st && !b.id) b = b.parentElement;
      if (b === st || b.closest('[data-lint="ignore"],[data-carrier],[data-aimk-block]')) continue;
      // words of the text you can read: not the hidden copies a letter roll keeps beside each letter (inert, anime.js splitText clone)
      const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let s = '', n;
      while ((n = tw.nextNode())) if (!n.parentElement.closest('[inert]')) s += n.textContent;
      if (!m.has(b)) m.set(b, (s.match(/[\p{L}\p{N}]+/gu) || []).length);
    }
    window.__aimkTxt = [...m.entries()];
  }
  for (const [b, n] of window.__aimkTxt) {
    let o = 1, ok = true;
    for (let x = b; x && x !== st.parentElement; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') { ok = false; break; } o *= +cs.opacity; }
    if (!ok || o < 0.5) continue;
    const r = b.getBoundingClientRect(); if (r.width < 2 || r.right < S.left || r.left > S.right || r.bottom < S.top || r.top > S.bottom) continue;
    out[b.id] = [n, r.left - S.left, r.top - S.top, r.width, r.height];
  }
  return out; }"""

SEQ_JS = r"""(sel) => {                                  // motion/image-sequence pictures now: file, the picture's rect on the stage (object-fit: contain)
  const st = document.querySelector(sel), S = st.getBoundingClientRect(), out = {};
  for (const im of st.querySelectorAll('img[id*="_img"]')) {             // the preset's own picture: id <box>_img + the kit's counter
    const el = im.parentElement; if (!el || !el.id || !/^_img\d*$/.test(im.id.slice(el.id.length)) || !im.id.startsWith(el.id)
                                     || !/\d+\.(png|webp|jpe?g)$/i.test(im.getAttribute("src") || "")) continue;
    let o = 1, ok = true;
    for (let x = el; x && x !== st.parentElement; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') { ok = false; break; } o *= +cs.opacity; }
    if (!ok || o < 0.3 || !im.naturalWidth) continue;
    const R = el.getBoundingClientRect(), s = Math.min(R.width / im.naturalWidth, R.height / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    out[el.id] = [im.getAttribute("src"), R.left - S.left + (R.width - w) / 2, R.top - S.top + (R.height - h) / 2, w, h];
  }
  return out; }"""


TEXTCOL_JS = r"""(sel) => {                               // per shown text block: [colour, px, weight, opacity, rect of the text itself]
  const st = document.querySelector(sel), S = st.getBoundingClientRect(), out = {};   // of the element that holds the most letters (a
  for (const [b] of window.__aimkTxt || []) {                                         // block's id may sit on a card around its text);
    if (!b.id) continue;                                                              // null when an edge carries the text
    let best = null, most = 0;
    for (const e of [b, ...b.querySelectorAll('*')]) {
      const n = [...e.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent.trim()).join('').length;
      if (n > most) { most = n; best = e; }
    }
    if (!best) continue;
    const cs = getComputedStyle(best);
    const edge = (cs.textShadow && cs.textShadow !== 'none') || parseFloat(cs.webkitTextStrokeWidth) > 0
      || (cs.webkitBackgroundClip || cs.backgroundClip) === 'text' || cs.mixBlendMode !== 'normal';
    let o = 1; for (let x = best; x && x !== st.parentElement; x = x.parentElement) o *= +getComputedStyle(x).opacity;
    const rg = document.createRange(); rg.selectNodeContents(best); const r = rg.getBoundingClientRect();
    out[b.id] = edge ? null : [cs.color, parseFloat(cs.fontSize), parseInt(cs.fontWeight) || 400, o, [r.left - S.left, r.top - S.top, r.width, r.height]];
  }
  return out; }"""
NOTEXT_CSS = ("{sel} *, {sel} *::before, {sel} *::after {{ color: transparent !important; -webkit-text-fill-color: transparent !important; "
              "text-shadow: none !important; -webkit-text-stroke: 0 !important; text-decoration-color: transparent !important; caret-color: transparent !important }}")


def _lum(rgb):
    """WCAG relative luminance of sRGB values 0..255 (array, last axis = RGB)"""
    import numpy as np
    c = np.asarray(rgb, dtype=np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return c[..., 0] * 0.2126 + c[..., 1] * 0.7152 + c[..., 2] * 0.0722


def _ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def contrast_checks(shot, blocks, cols, t, scene, full=None):
    """shot: the frame with every text hidden, full: the same frame as it is (PNG bytes); blocks: {id: [n, x, y, w, h]}; cols: {id: [css
    colour, px, weight, opacity, text rect] | None}. Only the background where the letters really show is measured: the pixels the text
    changes (with a 3 px ring), so text cut by a mask or covered by another layer is not judged on what it does not touch"""
    import io as _io, numpy as np
    from PIL import Image
    img = np.asarray(Image.open(_io.BytesIO(shot)).convert("RGB"))
    ink = None
    if full is not None:
        f = np.asarray(Image.open(_io.BytesIO(full)).convert("RGB"))
        if f.shape == img.shape:
            ink = np.abs(f.astype(np.int16) - img).max(axis=2) > 24
            from PIL import ImageFilter
            ink = np.asarray(Image.fromarray(ink.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(7))) > 0
    H, W = img.shape[:2]; out = []
    for i, r in blocks.items():
        c = cols.get(i)
        if not c: continue
        m = re.match(r"rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?", c[0])
        if not m: continue
        q = c[4] if len(c) > 4 else r[1:]                   # the text's own box (TEXTCOL_JS), else the block's
        x0, y0 = max(0, int(q[0])), max(0, int(q[1])); x1, y1 = min(W, int(q[0] + q[2])), min(H, int(q[1] + q[3]))
        if x1 - x0 < 4 or y1 - y0 < 4: continue
        px = img[y0:y1, x0:x1].reshape(-1, 3)
        if ink is not None:
            sel_ = ink[y0:y1, x0:x1].reshape(-1)
            if sel_.sum() < 20: continue                       # the text does not show here (covered, cut, faded out)
            px = px[sel_]
        bg = _lum(px)
        lt = float(_lum([float(m.group(1)), float(m.group(2)), float(m.group(3))]))
        a = (float(m.group(4)) if m.group(4) else 1.0) * c[3]
        p20, p80 = float(np.percentile(bg, 20)), float(np.percentile(bg, 80))
        b = p20 if abs(p20 - lt) < abs(p80 - lt) else p80        # the part of the background nearer the text: the worse case
        eff = a * lt + (1 - a) * b                                  # a see-through text is partly its background
        ratio = _ratio(eff, b)
        large = c[1] >= 24 or (c[1] >= 18.66 and c[2] >= 700)
        need = 3.0 if large else 4.5
        if ratio < need:
            out.append({"kind": "contrast", "scene": scene, "t": t,
                        "msg": f"#{i}: contrast {ratio:.1f}:1 against what is behind it (needs {need:g}:1{' for large text' if large else ''}): "
                               f"darker / lighter text, a scrim or a shadow behind it"})
    return out


EASE_RX = re.compile(r"""tl\.(?:fromTo|to|from)\(\s*("[^"]*"|\[[^\]]*\])\s*,\s*(\{[^{}]*\})(?:\s*,\s*(\{[^{}]*\}))?\s*,\s*([\d.]+)\s*\)""")
COLOR_KEYS = ("opacity", "autoAlpha", "color", "backgroundColor", "background", "fill", "stroke", "borderColor")


def bounce_checks(html_text):
    """tweens that put opacity or a colour on an ease that overshoots or bounces"""
    hits = {}                                               # one line per ease and property set (a caption's every word shares one)
    for m in EASE_RX.finditer(html_text):
        to = m.group(3) or m.group(2)
        e = re.search(r"""ease:\s*"([^"]+)\"""", to)
        if not e: continue
        ease = e.group(1)
        over = bool(re.match(r"(back|elastic|bounce)\b", ease))
        cm = re.match(r"custom\(M0,0 C\s*([-\d.]+),([-\d.]+)\s+([-\d.]+),([-\d.]+)\s+1,1\)", ease)
        if cm: over = any(not (-0.001 <= float(v) <= 1.001) for v in (cm.group(2), cm.group(4)))
        if not over: continue
        keys = tuple(k for k in COLOR_KEYS if re.search(r"(?:^|[{,\s])" + k + r"\s*:", to))
        if not keys: continue
        h = hits.setdefault((ease, keys), [float(m.group(4)), []])
        if m.group(1) not in h[1]: h[1].append(m.group(1))
    return [{"kind": "bounce", "scene": "", "t": t0,
             "msg": f"{', '.join(ids[:3])}{f' and {len(ids) - 3} more' if len(ids) > 3 else ''}: {', '.join(keys)} on \"{ease}\" (it overshoots / "
                    f"bounces): position and size may bounce, opacity and colour never; give them their own plain ease-out"}
            for (ease, keys), (t0, ids) in hits.items()]


def _gap(a, b):
    """px between two rects [x, y, w, h] (0 when they touch or overlap)"""
    dx = max(0.0, max(a[0], b[0]) - min(a[0] + a[2], b[0] + b[2]))
    dy = max(0.0, max(a[1], b[1]) - min(a[1] + a[3], b[1] + b[3]))
    return (dx * dx + dy * dy) ** 0.5


def product_checks(p, samples, scenes):
    """samples: [(t, {text id: [n, x, y, w, h]}, {seq id: [src, x, y, w, h]})] every `step` s -> warnings: a product that moves or turns
    (its opaque box: centre > 24 px or width / height > 8 % in one step) next to a text block (< 120 px away) that holds still (< 2 px)"""
    from qa.poses import boxes
    files = {s[0] for _, _, q in samples for s in q.values()}
    paths = {f: Path(p) / unquote(f.split("?")[0]) for f in files}
    bx = boxes(p, [x for x in paths.values() if x.exists()])

    def box(q):                                          # the opaque part of the picture shown, on the stage
        b = bx.get(paths[q[0]], [0, 0, 1, 1])
        return [q[1] + b[0] * q[3], q[2] + b[1] * q[4], (b[2] - b[0]) * q[3], (b[3] - b[1]) * q[4]]
    hits = {}
    for (t0, T0, Q0), (t1, T1, Q1) in zip(samples, samples[1:]):
        for sid in set(Q0) & set(Q1):
            A, B = box(Q0[sid]), box(Q1[sid])
            if B[2] < 2 or A[2] < 2: continue
            moved = max(abs(A[0] + A[2] / 2 - B[0] - B[2] / 2), abs(A[1] + A[3] / 2 - B[1] - B[3] / 2)) > 24 or \
                abs(B[2] - A[2]) > 0.08 * A[2] or abs(B[3] - A[3]) > 0.08 * A[3]
            if not moved: continue
            for tid in set(T0) & set(T1):
                a, b = T0[tid][1:], T1[tid][1:]
                if max(abs(x - y) for x, y in zip(a, b)) >= 2: continue      # the text moves too: placed with the product
                g0, g1 = _gap(a, A), _gap(b, B)
                if min(g0, g1) >= 120: continue
                sc = next((nm for nm, s0, d in reversed(scenes) if s0 - 1e-6 <= t1), "")
                h = hits.setdefault((sc, sid, tid), [t0, t1, g0, g1, min(g0, g1)]); h[1] = t1; h[3] = g1; h[4] = min(h[4], g0, g1)
    return [{"kind": "product", "scene": sc, "t": round(v[0], 2),
             "msg": f"#{sid} moves / turns while #{tid} holds next to it ({v[0]:.1f}-{v[1]:.1f} s, gap {v[2]:.0f} -> {v[3]:.0f} px, closest "
                    f"{v[4]:.0f} px): place the text by the product's widest pose there (01_Brief/POSES.md) or move it with the product"}
            for (sc, sid, tid), v in hits.items()]


def _ease(name, x):
    return {"in": x ** 3, "out": 1 - (1 - x) ** 3, "io": 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2,
            "sin": (1 - math.cos(math.pi * x)) / 2}.get(name, x)


def _key_at(K, t):
    """motion/image-sequence's own interpolation of [t, value, ease] keys (preset.js `at`)"""
    if t <= K[0][0]: return K[0][1]
    for a, b in zip(K, K[1:]):
        if t <= b[0]:
            x = min(1.0, max(0.0, (t - a[0]) / max(1e-6, b[0] - a[0])))
            return a[1] + (b[1] - a[1]) * _ease(b[2] if len(b) > 2 else "lin", x)
    return K[-1][1]


def jump_checks(p, spec, lay):
    """every motion/image-sequence of the film (scenes and layers), frame by film frame as the preset computes it: a step of more than 3
    render frames where the two pictures differ (mean difference >= 0.6 % at 96 px, the slow-point threshold of kit.py poses) -> warnings"""
    import numpy as np
    from PIL import Image
    from audio.song import Song, is_ref
    S = Song(p, spec); out = []
    runs = []
    for s, L in zip(spec["scenes"], lay):
        for m in s.get("motion", []):
            if m.get("preset") == "motion/image-sequence":
                at = m.get("at", 0); runs.append((s["id"], m, S.time(at) if is_ref(at) else L["start"] + at))
    for Ly in spec.get("layers") or []:
        for m in Ly.get("motion", []):
            if m.get("preset") == "motion/image-sequence": runs.append((Ly["id"], m, S.time(m.get("at", 0))))
    small = {}

    def pic(path):
        if path not in small:
            with Image.open(path) as im:
                im = im.convert("RGBA"); im = np.asarray(im.resize((96, max(1, round(im.height * 96 / im.width)))), dtype=np.float32) / 255
            small[path] = np.concatenate([im[..., :3] * im[..., 3:4], im[..., 3:4]], axis=2)
        return small[path]
    for where, m, at in runs:
        q = dict({"dir": "assets/images/seq/f", "digits": 4, "ext": ".png", "first": 1, "last": 9999, "keys": [[0, 1, "lin"]], "fps": 60, "end": None},
                 **(m.get("params") or {}))
        K = [[float(k[0]), float(k[1]), k[2] if len(k) > 2 else "lin"] for k in q["keys"]]
        D = float(q["end"]) if q["end"] is not None else max([K[-1][0]] + [float(k[0]) for k in (q.get("pos") or []) + (q.get("op") or [])]
                                                            + [float(w[0]) + float(w[1]) for w in q.get("sweep") or []])
        fps, prev, bad = float(q["fps"]), None, []
        for k in range(int(round(D * fps)) + 1):
            T = round((at + k / fps) * fps) / fps - at
            f = int(min(q["last"], max(q["first"], round(_key_at(K, T) + 1e-6))))
            if prev is not None and abs(f - prev) > 3:
                fa, fb = (Path(p) / f"{q['dir']}{str(n).zfill(int(q['digits']))}{q['ext']}" for n in (prev, f))
                diff = float(np.abs(pic(fa) - pic(fb)).mean()) if fa.exists() and fb.exists() and pic(fa).shape == pic(fb).shape else None
                if diff is None or diff >= 0.006: bad.append((round(at + k / fps, 3), prev, f, diff))
            prev = f
        if bad:
            t0, a0, b0, d0 = max(bad, key=lambda x: abs(x[2] - x[1]))
            out.append({"kind": "jump", "scene": where, "t": bad[0][0],
                        "msg": f"#{','.join(_ids(m.get('target')))}: {len(bad)} film frame(s) skip more than 3 render frames ({bad[0][0]:.2f}-{bad[-1][0]:.2f} s; "
                               f"largest {a0} -> {b0} at {t0:.2f} s" + (f", pictures {d0 * 100:.1f} % apart" if d0 is not None else "")
                               + "): slow that key (1-3 render frames per film frame) or cut on a portal (kit.py poses)"})
    return out


async def _film_checks(url, spec, proj):
    from playwright.async_api import async_playwright
    from render.browser import open_film
    from qa.collide import JS, SCENES_JS, VIS_JS
    out = []
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url)
        try:
            await pg.add_style_tag(content=info["stage"] + " *{pointer-events:auto!important}")
            sel, fps = info["stage"], info.get("fps") or 60
            seen = set()
            sc = sorted(await pg.evaluate(SCENES_JS, sel), key=lambda x: x[1])
            for k, (name, at, d) in enumerate(sc):
                # settled moments: 55 % and 85 % of the part of the scene that no transition overlaps (08/10/2026: a 0.5 s push into a 2 s
                # scene put the 85 % sample inside the transition, and a word sliding out was reported "outside the safe margin")
                a0 = at + (max(0.0, sc[k - 1][1] + sc[k - 1][2] - at) if k else 0.0)
                a1 = at + d - (max(0.0, at + d - sc[k + 1][1]) if k + 1 < len(sc) else 0.0)
                if a1 - a0 < 0.1: a0, a1 = at, at + d
                for f in (0.55, 0.85):
                    t = round(a0 + (a1 - a0) * f, 3)
                    await pg.evaluate(f"window.__aimk.seek({t})")
                    res = await pg.evaluate(JS, [t, sel])
                    for it in res.get("issues") or []:
                        if it["kind"] not in ("text-text", "margin"): continue
                        key = (it["kind"], it["a"], it["b"])
                        if key in seen: continue
                        seen.add(key)
                        out.append({"kind": "text" if it["kind"] == "text-text" else "margin", "scene": name, "t": t,
                                    "msg": f"{it['a']} over {it['b']}" if it["kind"] == "text-text" else f"{it['a']} outside the safe margin ({it['b']})"})
                    # contrast: the same frame with every text hidden is what each text block sits on
                    blocks = await pg.evaluate(SHOWN_JS, sel)
                    if blocks:
                        cols = await pg.evaluate(TEXTCOL_JS, sel)
                        S = await pg.evaluate("(s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }", sel)
                        clip = {"x": S[0], "y": S[1], "width": S[2], "height": S[3]}
                        full = await pg.screenshot(type="png", clip=clip)
                        tag = await pg.add_style_tag(content=NOTEXT_CSS.format(sel=sel))
                        try: shot = await pg.screenshot(type="png", clip=clip)
                        finally: await tag.evaluate("e => e.remove()")
                        for it in contrast_checks(shot, blocks, cols, t, name, full):
                            key = ("contrast", it["msg"].split(":")[0])
                            if key not in seen: seen.add(key); out.append(it)
                if at > 0:
                    t = round((round(at * fps) + 1) / fps, 4)
                    await pg.evaluate(f"window.__aimk.seek({t})")
                    if not await pg.evaluate(VIS_JS, sel): out.append({"kind": "blank", "scene": name, "t": t, "msg": "no scene shows right after the cut"})
            # reading: how long each text block can be read, sampled every 0.2 s (a word-by-word lyric is one word a block: not counted)
            shown, words, first, step, samples = {}, {}, {}, 0.2, []
            for k in range(int(info["duration"] / step) + 1):
                t = round(k * step, 3)
                await pg.evaluate(f"window.__aimk.seek({t})")
                T = await pg.evaluate(SHOWN_JS, sel)
                for i, v in T.items():
                    shown[i] = shown.get(i, 0) + step; words[i] = v[0]; first.setdefault(i, t)
                samples.append((t, T, await pg.evaluate(SEQ_JS, sel)))
            scenes = await pg.evaluate(SCENES_JS, sel); fast = {}
            if any(q for _, _, q in samples): out += product_checks(proj, samples, scenes)
            for i, sec in shown.items():
                n = words[i]; need = 0.5 + 0.3 * n
                if n >= 3 and sec < need - 1e-6:
                    sc = next((nm for nm, a, d in reversed(scenes) if a - 1e-6 <= first[i]), "")
                    fast.setdefault(sc, []).append((first[i], i, n, sec, need))
            for sc, L in fast.items():                       # one line per scene when several texts share it (a showcase of titles)
                if len(L) <= 2:
                    for t, i, n, sec, need in L: out.append({"kind": "reading", "scene": sc, "t": t, "msg": f"#{i}: {n} words readable for about {sec:.1f} s (needs about {need:.1f} s)"})
                else:
                    out.append({"kind": "reading", "scene": sc, "t": min(x[0] for x in L),
                                "msg": f"{len(L)} text blocks of {min(x[2] for x in L)}-{max(x[2] for x in L)} words readable for {min(x[3] for x in L):.1f}-{max(x[3] for x in L):.1f} s "
                                       f"each (need about {min(x[4] for x in L):.1f}-{max(x[4] for x in L):.1f} s): fine if the pace was chosen, e.g. a fast showcase"})
        finally:
            await b.close()
    return out


def lint(p, spec=None, lay=None, say=print):
    """the checks above on a built project -> list of warnings (also qa/lint.json)"""
    import sys
    p = Path(p)
    engine = Path(__file__).resolve().parent.parent
    if str(engine) not in sys.path: sys.path.insert(0, str(engine))
    if spec is None or lay is None:                      # kit.py lint: the scene times of the built film (its "auto" lengths are resolved there)
        from build import expand_parts
        spec = json.loads((p / "film.json").read_text(encoding="utf-8")); spec["scenes"] = expand_parts(p, spec)
        h = (p / "index.html").read_text(encoding="utf-8")
        at = {m.group(1): (float(m.group(2)), float(m.group(3))) for m in re.finditer(r'<div id="([^"]+)" class="clip scene" data-start="([\d.]+)" data-duration="([\d.]+)"', h)}
        lay = [{"start": at.get(s["id"], (0, 0))[0], "dur": at.get(s["id"], (0, 0))[1]} for s in spec["scenes"]]
    W = spec_checks(spec, lay)
    try: W += jump_checks(p, spec, lay)
    except (OSError, ValueError, KeyError, SystemExit) as e: W.append({"kind": "jump", "scene": "", "msg": f"image-sequence check skipped: {e}"})
    if (p / "index.html").exists(): W += bounce_checks((p / "index.html").read_text(encoding="utf-8"))
    from render.serve import serve_in_thread
    base, srv = serve_in_thread(p)
    try:
        W += asyncio.run(_film_checks(base.rstrip("/") + "/index.html", spec, p))
        if spec.get("checks"):                           # film.json "checks": the motion spec's numbers read on the live film (qa/motionview.py)
            from qa.motionview import run_checks
            from audio.song import Song, is_ref
            S = Song(p, spec)
            cks = [dict(c, at=round(S.time(c["at"]) if is_ref(c["at"]) else float(c["at"]), 4)) for c in spec["checks"]]
            res = run_checks(base.rstrip("/") + "/index.html", cks)
            for c, ok, got in res:
                if not ok: W.append({"kind": "check", "scene": "", "t": c["at"], "msg": f"#{c['el']}{(' (' + c['say'] + ')') if c.get('say') else ''}: "
                                                                                    f"expected {json.dumps(c.get('expect'), ensure_ascii=False)}, got {json.dumps(got, ensure_ascii=False)}"})
            say(f"  checks: {sum(1 for _, ok, _ in res if ok)}/{len(res)} as planned")
    except SystemExit as e: W.append({"kind": "film", "scene": "", "msg": f"film checks skipped: {e}"})
    finally: srv.shutdown()
    (p / "qa").mkdir(exist_ok=True)
    (p / "qa" / "lint.json").write_text(json.dumps(W, indent=1, ensure_ascii=False), encoding="utf-8")
    if W:
        say(f"  lint: {len(W)} warning(s) (qa/lint.json; warnings only, look at a still):")
        for w in W[:12]: say(f"    {w['kind']:7s} {w['scene']}{' %.2fs' % w['t'] if w.get('t') is not None else ''}: {w['msg']}")
        if len(W) > 12: say(f"    ... and {len(W) - 12} more")
    else: say("  lint: no warnings")
    return W


def enabled():
    return os.environ.get("AIMK_NO_LINT", "") in ("", "0")
