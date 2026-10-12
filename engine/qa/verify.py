"""Determinism check (v1 verify.py method, on the v2 driver): a film must give the same pixels at time t whatever was sought before.

  A  ascending sweep over the sample times (the way an export worker moves)
  B  jump to the end, then the sample times in reverse (the way a player scrubs back)
  C  fresh page, a few probes jumped to directly (a worker's cold first frame)
Sample times = evenly spread + start / start+0.1 s / end-0.1 s of every scene.
Per differing time: NOISE (no pixel > 3 levels; the outer 1 px is ignored), MINOR (< 24 px above 3 levels), EDGE (more, but only thin lines
along picture borders, no solid region, at most 80 levels: sub-pixel edges of a scaled / drifting picture, 08/10/2026), BUG. Exit code 1 on BUG.
Also (plan B3, 07/10/2026; warnings, not failures):
  - text scaled up more than 1.15x inside an element with will-change: transform: Chromium rasterises such a layer once at its first scale,
    so the text goes soft when a camera push or a zoom scales it up (the course's "blurry text on zoom"); drop will-change there;
  - --loop: the seam in position AND speed: the change across it (last frame -> first) against the changes into and out of it
    (share of pixels more than 8 levels apart; a jump, a speed change or a repeated frame each show);
  - overlaps: two moves on the same property of the same element whose times overlap (07/10/2026 lyric film test: an in move still running when
    its out move started left a giant word on screen in playback and exports, while seeks looked right). kit.py build fixes the simple ones
    in written tweens; this lists what is left (code blocks, a set inside a move, an earlier move that outlasts the later one).
  P  --play: every frame from 0 played one after another (as the player's Play and every export render), screenshots at the sample
     frames, against the same frames jumped to on a fresh page: catches what only shows in playback (the overlap above)."""
import asyncio, io, sys
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
import numpy as np                                      # noqa: E402
from PIL import Image                                   # noqa: E402
from playwright.async_api import async_playwright      # noqa: E402
from render.browser import open_film                   # noqa: E402

NOISE, MINOR = 3, 24


def sample_times(info, n):
    dur = info["duration"]; ts = {round(dur * (k + 0.5) / n, 3) for k in range(n)}
    marks = [m[1] for m in info["markers"]] + [dur]
    for a, b in zip(marks, marks[1:]):
        ts |= {round(a, 3), round(min(b, a + 0.1), 3), round(max(a, b - 0.1), 3)}
    return sorted(t for t in ts if 0 <= t < dur)


def edges_only(d):
    """True when the differing pixels are thin lines only (sub-pixel edges of a picture that is scaled or drifts: 1-2 px along its border,
    invisible) and never a solid region (a real difference: an element in another state, a wrong frame). Test 1 (08/10/2026): 14-19 BUG
    lines per film were such edges (max 43/255, mean 0.29)."""
    m = d > 12
    solid = m[1:-1, 1:-1] & m[:-2, 1:-1] & m[2:, 1:-1] & m[1:-1, :-2] & m[1:-1, 2:]     # the pixel and its 4 neighbours all differ
    return int(solid.sum()) < MINOR and int(d.max()) <= 80


def classify(pa, pb):
    a = np.asarray(Image.open(io.BytesIO(pa)).convert("RGB"), dtype=np.int16)
    b = np.asarray(Image.open(io.BytesIO(pb)).convert("RGB"), dtype=np.int16)
    d = np.abs(a - b).max(axis=2)
    if not d.any(): return "SAME", 0, None
    strong = int((d[1:-1, 1:-1] > NOISE).sum())
    ys, xs = np.nonzero(d > (NOISE if strong else 0))
    kind = ("EDGE" if edges_only(d) else "BUG") if strong >= MINOR else "MINOR" if strong else "NOISE"
    return kind, strong, [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]


SOFT_JS = r"""(sel) => {                                   // text scaled > 1.15x under a will-change: transform layer
  const st = document.querySelector(sel), out = [];
  for (const e of st.querySelectorAll('*')) {
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    let wc = null; for (let x = e; x && x !== st; x = x.parentElement) if (/transform/.test(getComputedStyle(x).willChange)) { wc = x; break; }
    if (!wc || !e.offsetWidth || getComputedStyle(e).visibility === 'hidden') continue;
    const k = e.getBoundingClientRect().width / e.offsetWidth;
    if (k > 1.15) out.push({el: e.id ? '#' + e.id : e.tagName.toLowerCase(), layer: wc.id ? '#' + wc.id : wc.tagName.toLowerCase(), k: +k.toFixed(2), text: e.textContent.trim().slice(0, 30)});
  }
  return out; }"""


OVERLAP_JS = r"""() => {                                // moves on the same property of the same element whose times overlap
  const tl = window.__aimk && window.__aimk.timeline; if (!tl) return [];
  const AL = { scale: ["scaleX", "scaleY"], autoAlpha: ["opacity", "visibility"], alpha: ["opacity"], rotate: ["rotation"], rotationZ: ["rotation"],
               translateX: ["x"], translateY: ["y"] };
  const NOT = new Set(["ease", "duration", "delay", "repeat", "yoyo", "repeatDelay", "stagger", "immediateRender", "overwrite", "startAt", "runBackwards",
                       "data", "onUpdate", "onComplete", "onStart", "callbackScope", "lazy", "id", "paused", "parent", "inherit", "attr", "keyframes",
                       "transformPerspective", "transformOrigin", "svgOrigin", "smoothOrigin", "force3D"]);   // settings, not moves (build.py SETTINGS)
  const by = new Map();
  const walk = (t, off) => { for (const c of t.getChildren(false, true, true)) {
    const at = off + c.startTime();
    if (c instanceof gsap.core.Timeline) { walk(c, at); continue; }
    if (c.vars.stagger !== undefined || (c.vars.repeat || 0) < 0) continue;
    const props = Object.keys(c.vars).filter(k => !NOT.has(k)).flatMap(k => AL[k] || [k]);
    for (const e of c.targets()) { if (!(e instanceof Element)) continue;
      for (const pr of props) { const k = (e.id || e.tagName) + "|" + pr; if (!by.has(k)) by.set(k, []);
        by.get(k).push({ a: at, b: at + c.totalDuration(), set: c.duration() === 0 }); } }
  } };
  walk(tl, 0);
  const out = [];
  for (const [k, L] of by) { L.sort((x, y) => x.a - y.a);
    for (let i = 0; i < L.length; i++) { const A = L[i]; if (A.set) continue;
      for (let j = i + 1; j < L.length && L[j].a < A.b - 0.005; j++) { const B = L[j]; if (B.a <= A.a + 1e-4) continue;
        const [id, pr] = k.split("|"); out.push({ id, prop: pr, a: +A.a.toFixed(3), b: +A.b.toFixed(3), at: +B.a.toFixed(3), set: B.set }); } } }
  out.sort((x, y) => x.at - y.at);
  return out; }"""


async def _verify(url, samples, out_dir, loop=False, play=False):
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url)
        st = await pg.query_selector(info["stage"]); ts = sample_times(info, samples)

        async def shot(page, stage, t):
            from render.browser import PAINT
            await page.evaluate(f"window.__aimk.seek({t})"); await page.evaluate(PAINT); return await stage.screenshot(type="png")
        A, soft = {}, {}
        for t in ts:
            A[t] = await shot(pg, st, t)
            for w in await pg.evaluate(SOFT_JS, info["stage"]):
                k = (w["el"], w["layer"])
                if k not in soft or w["k"] > soft[k][0] + 1e-6: soft[k] = (w["k"], t, w["text"])      # the first time at its largest scale
        loopd = loopv = None
        if loop:
            from render.browser import PAINT
            T = info["duration"]
            a0 = A.get(0.0) or await shot(pg, st, 0.0)
            seq = [await shot(pg, st, max(0.0, T - 2 / 60)), await shot(pg, st, max(0.0, T - 1 / 60)), a0, await shot(pg, st, 1 / 60)]
            x, y, z, w = (np.asarray(Image.open(io.BytesIO(v)).convert("RGB"), dtype=np.int16) for v in seq)
            step = lambda m, n: float((np.abs(m - n).max(axis=2) > 8).mean())
            loopd = step(z, y)                                # the last frame vs the first: what played at the seam
            loopv = (step(y, x), loopd, step(w, z))           # the steps into, across and out of the seam: a speed change shows here
        overlaps = await pg.evaluate(OVERLAP_JS)
        await shot(pg, st, info["duration"] - 1e-3)
        B = {t: await shot(pg, st, t) for t in reversed(ts)}
        await b.close()
        b2, pg2, _ = await open_film(p, url); st2 = await pg2.query_selector(info["stage"])
        probes = ts[len(ts) // 2::max(1, len(ts) // 6)][:6]
        C = {}
        for t in probes:                                     # each probe on a fresh page = a true cold seek
            await b2.close(); b2, pg2, _ = await open_film(p, url); st2 = await pg2.query_selector(info["stage"])
            C[t] = await shot(pg2, st2, t)
        await b2.close()
        P, J = {}, {}
        if play:                                              # every frame played in order vs the same frames jumped to
            from render.browser import PAINT
            fps = info.get("fps") or 60
            frames = sorted({min(int(round(t * fps)), int(info["duration"] * fps) - 1) for t in ts})
            b3, pg3, _ = await open_film(p, url); st3 = await pg3.query_selector(info["stage"]); last = 0
            for k in frames:
                await pg3.evaluate("async ([a, b, f]) => { for (let i = a; i <= b; i++) await window.__aimk.seek(i / f); }", [last, k, fps])
                await pg3.evaluate(PAINT); P[k] = await st3.screenshot(type="png"); last = k + 1
            await b3.close()
            b3, pg3, _ = await open_film(p, url); st3 = await pg3.query_selector(info["stage"])
            for k in frames: J[k] = await shot(pg3, st3, k / fps)
            await b3.close()
    res = {"times": len(ts), "BUG": [], "MINOR": [], "EDGE": [], "NOISE": [], "soft": [{"el": k[0], "layer": k[1], "scale": v[0], "t": v[1], "text": v[2]} for k, v in soft.items()],
           "loop": loopd, "loop_steps": loopv, "overlaps": overlaps, "played": len(P)}
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    for name, other in (("reverse", B), ("cold", C)):
        for t, png in other.items():
            k, px, box = classify(A[t], png)
            if k == "SAME": continue
            res[k].append({"pass": name, "t": t, "px": px, "box": box})
            if k == "BUG": (out / f"{name}_{t:08.3f}_A.png").write_bytes(A[t]); (out / f"{name}_{t:08.3f}_B.png").write_bytes(png)
    fps = info.get("fps") or 60
    for f, png in P.items():                                 # played (B side) against jumped to (A side)
        k, px, box = classify(J[f], png)
        if k == "SAME": continue
        res[k].append({"pass": "play", "t": round(f / fps, 3), "px": px, "box": box})
        if k == "BUG": (out / f"play_{f / fps:08.3f}_A.png").write_bytes(J[f]); (out / f"play_{f / fps:08.3f}_B.png").write_bytes(png)
    return info, res


def verify(url, samples=24, out_dir=".", loop=False, play=False):
    return asyncio.run(_verify(url, samples, out_dir, loop, play))


def report(info, res, say):
    say(f"verify ({info['contract']} film, {info['duration']:.2f} s): {res['times']} sample times; BUG {len(res['BUG'])}, MINOR {len(res['MINOR'])}, "
        f"EDGE {len(res.get('EDGE') or [])}, NOISE {len(res['NOISE'])}" + (" (EDGE: only 1-2 px lines along moving / scaled pictures, invisible: not a bug)" if res.get("EDGE") else ""))
    if info.get("broken"): say(f"  BUG pictures that did not load (after 2 retries): {info['broken'][:5]}")
    for r in res["BUG"] + res["MINOR"]:
        say(f"  {r['pass']:7s} t={r['t']:.3f}  {r['px']} px above noise  box {r['box']}")
    for w in res.get("soft") or []:
        say(f"  warning: text {w['el']} \"{w['text']}\" scaled {w['scale']}x at {w['t']:.2f} s inside {w['layer']} (will-change: transform): it renders soft; "
            "remove will-change there or scale the text's font-size instead")
    ov = res.get("overlaps") or []
    for o in ov[:10]:
        say(f"  overlap: #{o['id']} {o['prop']}: a {'set' if o['set'] else 'move'} at {o['at']:.2f} s inside a move {o['a']:.2f}-{o['b']:.2f} s "
            "(playback keeps the earlier move's end: end it before the next one starts)")
    if len(ov) > 10: say(f"  ... and {len(ov) - 10} more overlap(s)")
    if res.get("played"): say(f"  play: {res['played']} frames reached by playing every frame from 0, compared with direct seeks (pass 'play' above)")
    if res.get("loop") is not None:
        a, s, b = res.get("loop_steps") or (0.0, res["loop"], 0.0)
        near = max(a, b)
        if s < 0.002 and near < 0.002: v = "seamless (still at the seam)"
        elif s <= 2 * near + 0.002 and (near < 0.002 or s > 0.3 * min(a, b)): v = "seamless: the seam moves like the frames around it"
        elif s > 2 * near + 0.002: v = "the loop jumps: make the end meet the start (position AND speed)"
        else: v = "the loop holds a frame at the seam: the last frame repeats the first (end one frame earlier)"
        say(f"  loop: pixels changing into / across / out of the seam {a:.2%} / {s:.2%} / {b:.2%}: {v}")
