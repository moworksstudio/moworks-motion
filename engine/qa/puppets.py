"""kit.py sheet <film> --puppets [a,b] [--hero <picture | video@seconds>]: the machine checks of a film's drawn puppets, run BEFORE anyone
looks (10-11/10/2026 test: three rounds of traced characters each had new holes, and the USER found them; the redrawn cast
passed these same checks, written then as film scripts, on its first round). A puppet is window.AIMK_ART[name] in presets/drawn/<name>/
(presets/traced/<name>/ and window.AIMK_TRACED in films made before 11/10/2026), drawn by AIMK_RIG.puppet / AIMK_RIG.art.

Each puppet ALONE on #00FF00 at 2x: at rest, in its own poses (AIMK_ART[name].poses = {pose: {part: degrees}}, the gestures the film needs)
and in a stress set (every part turned -30 and +30 degrees alone). In every picture:
  holes   background enclosed by the silhouette
  pieces  the silhouette broken into more than one piece
  gaps    background a small closing would fill within 40 px of a joint: an OPEN notch where a turning part uncovers its parent (an
          enclosed-hole check alone misses it: the thigh under the CV paper, 11/10/2026 test)
-> 02_Assets/Stills/puppets/<name>_poses.png   every pose, problems boxed red (look at them: a real see-through gap may be meant)
   02_Assets/Stills/puppets/<name>_parts.png   every part ALONE on a checker (the exploded view)
   02_Assets/Stills/puppets/<name>_hero.png    with --hero: the hero frame | the puppet at rest drawn at its origin over it | the difference
   02_Assets/Stills/puppets/PUPPETS.md + .json the table (kit.py round ... assets reads the .json: a puppet with holes or pieces is refused)"""
import asyncio, io, json, time
from pathlib import Path

ENGINE = Path(__file__).resolve().parents[1]
STRESS = 30                                             # degrees each part turns alone, both ways


def art_files(p):
    """{name: preset.js} of the film's drawn art (presets/drawn wins over presets/traced)"""
    out = {}
    for sub in ("traced", "drawn"):
        for f in sorted((Path(p) / "presets" / sub).glob("*/preset.js")): out[f.parent.name] = f
    return out


PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}
#stage{position:relative;overflow:hidden;background:#00FF00}</style>
<script>window.AIMK = window.AIMK || { preset() {} };</script>
%s</head><body><div id="stage"></div></body></html>"""

JS_INFO = """name => { const T = (window.AIMK_ART || {})[name] || (window.AIMK_TRACED || {})[name]; if (!T) return null;
  return { box: T.box, origin: T.origin || [0, 0], parts: (T.parts || []).map(p => ({ name: p.name, parent: p.parent || "", box: p.box })),
           poses: T.poses || {} }; }"""

# draw one pose; returns the joints' pivots in stage px (a joint is a 0 x 0 div at its pivot)
JS_DRAW = """([name, pose, W, H, ox, oy, bg]) => { const st = document.getElementById("stage");
  Object.assign(st.style, { width: W + "px", height: H + "px", background: bg });
  const T = (window.AIMK_ART || {})[name] || (window.AIMK_TRACED || {})[name];
  st.innerHTML = (T.parts && T.parts.length ? AIMK_RIG.puppet : AIMK_RIG.art)(name, "pp", ox, oy, { pose });
  const S = st.getBoundingClientRect(), out = {};
  for (const p of T.parts || []) { const e = document.getElementById("pp_" + p.name); if (!e) continue; const r = e.getBoundingClientRect();
    out[p.name] = [r.left - S.left, r.top - S.top]; }
  return out; }"""

# every part in its own flat colour, edges not blended: which part a pixel belongs to
JS_IDS = """([name, cols]) => { const T = (window.AIMK_ART || {})[name] || (window.AIMK_TRACED || {})[name];
  (T.parts || []).forEach((p, i) => { const s = document.getElementById("pp_" + p.name + "_p"); if (!s) return; s.setAttribute("shape-rendering", "crispEdges");
    s.querySelectorAll("path,circle,ellipse,rect,polygon").forEach(e => { e.setAttribute("fill", cols[i]); e.setAttribute("stroke", "none"); }); }); }"""


def part_colours(n):
    return [(40 + (i * 53) % 210, 10 + (i * 97) % 190, 40 + (i * 151) % 210) for i in range(n)]


def touching(ids_png, cols, sl, m):
    """the parts that the hole m (inside the slice sl) touches, from the part-colour picture"""
    import numpy as np
    from PIL import Image
    from scipy import ndimage as ndi
    a = np.asarray(Image.open(io.BytesIO(ids_png)).convert("RGB")).astype(int)
    ring = ndi.binary_dilation(m, iterations=4) & ~m
    px = a[ring]
    if not len(px): return set()
    C = np.array(cols); d = np.abs(px[:, None, :] - C[None, :, :]).sum(axis=2)
    near = d.min(axis=1) < 40
    idx, cnt = np.unique(d.argmin(axis=1)[near], return_counts=True)
    return {int(i) for i, c in zip(idx, cnt) if c >= 6}


# one part alone on a checker
JS_PART = """([name, part, pad]) => { const st = document.getElementById("stage");
  const T = (window.AIMK_ART || {})[name] || (window.AIMK_TRACED || {})[name], P = T.parts.find(p => p.name === part), [x, y, w, h] = P.box;
  Object.assign(st.style, { width: (w + 2 * pad) + "px", height: (h + 2 * pad) + "px",
    background: "repeating-conic-gradient(#d9dde3 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px" });
  st.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - pad} ${y - pad} ${w + 2 * pad} ${h + 2 * pad}" width="${w + 2 * pad}" height="${h + 2 * pad}" style="position:absolute;left:0;top:0">` +
    P.layers.map(l => `<path d="${l.d}" fill="${l.c}" fill-rule="evenodd"/>`).join("") +
    `<circle cx="${P.pivot[0]}" cy="${P.pivot[1]}" r="5" fill="none" stroke="#ff2d55" stroke-width="2"/></svg>`; }"""


def analyse(png, joints, scale):
    """an RGB picture of the puppet on #00FF00 -> {img, mask, holes: [(px, slice, bool mask)], pieces: [(px, slice)], gaps: {joint: (px, slice)}}"""
    import numpy as np
    from PIL import Image
    from scipy import ndimage as ndi
    im = Image.open(io.BytesIO(png)).convert("RGB"); a = np.asarray(im).astype(int)
    mask = ~((np.abs(a[..., 0]) + np.abs(a[..., 1] - 255) + np.abs(a[..., 2])) < 90)   # not the key colour (edges blend into the art)
    out = {"img": im, "mask": mask, "holes": [], "pieces": [], "gaps": {}}
    holes = ndi.binary_fill_holes(mask) & ~mask
    lab, n = ndi.label(holes)
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = lab == i; px = int(m.sum())
        if px >= 8: out["holes"].append((px, sl, m))
    lab, n = ndi.label(mask, structure=np.ones((3, 3)))
    sizes = ndi.sum(mask, lab, range(1, n + 1)) if n else []
    big = [i + 1 for i, s_ in enumerate(sizes) if s_ >= 30]
    if len(big) > 1:
        main = max(big, key=lambda i: sizes[i - 1])
        for i, sl in enumerate(ndi.find_objects(lab), 1):
            if i in big and i != main: out["pieces"].append((int(sizes[i - 1]), sl))
    yy, xx = np.ogrid[:mask.shape[0], :mask.shape[1]]
    disk = (np.arange(-5, 6)[:, None] ** 2 + np.arange(-5, 6)[None, :] ** 2) <= 25
    gap = ndi.binary_closing(np.pad(mask, 6), structure=disk)[6:-6, 6:-6] & ~mask & ~holes
    for part, (jx, jy) in joints.items():
        near = gap & ((xx - jx * scale) ** 2 + (yy - jy * scale) ** 2 <= (40 * scale / 2) ** 2)
        if near.any():
            ys, xs = np.nonzero(near)
            out["gaps"][part] = (int(near.sum()), (slice(int(ys.min()), int(ys.max()) + 1), slice(int(xs.min()), int(xs.max()) + 1)))
    return out


def judge(r, rest, parts=None):
    """the problems of one pose against the puppet at rest: holes that are not the rest pose's see-through areas (moved a little with their
    parts) and lie inside one part or between a part and its parent (a hole closed by limbs that are not linked, crossed legs or an arm
    against the body, is a "ring": listed, not a problem), any second piece, joint gaps that grew by 12 px or more. -> [(kind, px, slice)]"""
    import numpy as np
    from scipy import ndimage as ndi
    probs = [("piece", px, sl) for px, sl in r["pieces"]]
    if rest is None: return probs
    seen = np.zeros_like(r["mask"])
    for _, _, m in rest["holes"]: seen |= m
    seen = ndi.binary_dilation(seen, iterations=24) if seen.any() else seen
    ids = parts is not None and r.get("ids") is not None and rest.get("ids") is not None
    if ids and "touch" not in rest: rest["touch"] = [(rpx, touching(rest["ids"], parts["cols"], rsl, rm)) for rpx, rsl, rm in rest["holes"]]
    for px, sl, m in r["holes"]:
        if (m & seen).sum() >= 0.3 * px: continue
        kind = "hole"
        if ids:
            t = touching(r["ids"], parts["cols"], sl, m)
            if any(rt == t and abs(px - rpx) <= 0.15 * rpx for rpx, rt in rest["touch"]): continue   # a see-through of the rest pose, moved
            linked = len(t) <= 1 or (len(t) == 2 and any(parts["parent"][i] == parts["names"][j] for i in t for j in t))
            if not linked: kind = "ring"
        probs.append((kind, px, sl))
    for part, (px, sl) in r["gaps"].items():
        if px - rest["gaps"].get(part, (0, None))[0] >= 12: probs.append((f"gap at {part}", px, sl))
    return probs


def boxed(im, probs, crop):
    from PIL import ImageDraw
    im = im.copy(); dr = ImageDraw.Draw(im)
    for _, _, sl in probs: dr.rectangle([sl[1].start - 5, sl[0].start - 5, sl[1].stop + 5, sl[0].stop + 5], outline=(255, 0, 0), width=4)
    return im.crop(crop)


def grid(cells, cw, ch, cols, bg=(244, 246, 248)):
    """[(label, PIL image)] -> one sheet, each cell fitted into cw x ch with its label under it"""
    from PIL import Image, ImageDraw
    rows = -(-len(cells) // cols); out = Image.new("RGB", (cols * (cw + 8) + 8, rows * (ch + 34) + 8), bg); dr = ImageDraw.Draw(out)
    for k, (lab, im) in enumerate(cells):
        im = im.copy(); im.thumbnail((cw, ch))
        x, y = 8 + (k % cols) * (cw + 8), 8 + (k // cols) * (ch + 34)
        out.paste(im, (x + (cw - im.width) // 2, y + (ch - im.height) // 2)); dr.text((x + 4, y + ch + 6), lab, fill=(200, 20, 20) if "·" in lab else (40, 40, 50))
    return out


def hero_frame(spec):
    """'<picture>' or '<video>@<seconds>' -> PIL RGB"""
    from PIL import Image
    path, at = (spec.rsplit("@", 1) + [None])[:2] if "@" in spec and not Path(spec).exists() else (spec, None)
    if at is None: return Image.open(path).convert("RGB")
    import subprocess, imageio_ffmpeg
    r = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-ss", str(float(at)), "-i", path, "-frames:v", "1",
                        "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True)
    if not r.stdout: raise SystemExit(f"--hero: no frame at {at} s in {path}")
    return Image.open(io.BytesIO(r.stdout)).convert("RGB")


def run(p, names=None, hero=None, say=print):
    from common import renders
    from playwright.async_api import async_playwright
    from PIL import Image
    files = art_files(p)
    if names: files = {k: v for k, v in files.items() if k in names}
    if not files: raise SystemExit("no drawn puppet in presets/drawn/<name>/preset.js (window.AIMK_ART; workflow/characters.md section 5)")
    url = lambda f: Path(f).resolve().as_uri()
    scripts = [ENGINE / "vendor" / "gsap" / "gsap.min.js", ENGINE / "vendor" / "libs" / "aimk" / "rig.js"] + list(files.values())
    page = Path(p) / "qa" / "puppets.html"; page.parent.mkdir(parents=True, exist_ok=True)
    page.write_text(PAGE % "\n".join(f'<script src="{url(s)}"></script>' for s in scripts), encoding="utf-8")
    dst = renders(p, "stills") / "puppets"; dst.mkdir(parents=True, exist_ok=True)
    report = {}
    hero_im = hero_frame(hero) if hero else None

    async def go():
        async with async_playwright() as pw:
            b = await pw.chromium.launch()
            pg = await b.new_page(device_scale_factor=2, viewport={"width": 2400, "height": 2400})
            await pg.goto(url(page)); await pg.wait_for_timeout(200)
            for name in files:
                T = await pg.evaluate(JS_INFO, name)
                if not T: say(f"  {name}: not found in its preset.js (window.AIMK_ART[{name!r}])"); continue
                bx, by, bw, bh = T["box"]; m = int(max(bw, bh) * 0.45) + 20
                W, H, ox, oy = bw + 2 * m, bh + 2 * m, -bx + m, -by + m
                poses = [("rest", {})] + [(k, v) for k, v in T["poses"].items()]
                kids = [q["name"] for q in T["parts"] if q["parent"]]
                poses += [(f"{q} {s:+d}", {q: s}) for q in kids for s in (-STRESS, STRESS)]
                shots, res = [], []
                st = await pg.query_selector("#stage")
                cols = part_colours(len(T["parts"]))
                parts = {"cols": cols, "names": [q["name"] for q in T["parts"]], "parent": [q["parent"] for q in T["parts"]]}
                for pname, pose in poses:
                    joints = await pg.evaluate(JS_DRAW, [name, pose, W, H, ox, oy, "#00FF00"])
                    r = analyse(await st.screenshot(), {k: v for k, v in joints.items() if k in kids}, 2)
                    if T["parts"]:
                        await pg.evaluate(JS_IDS, [name, ["rgb(%d,%d,%d)" % c for c in cols]]); r["ids"] = await st.screenshot()
                    shots.append((pname, r))
                import numpy as np
                rest = shots[0][1]; allm = np.zeros_like(rest["mask"])
                for _, r in shots: allm |= r["mask"]
                if not allm.any(): raise SystemExit(f"{name}: the puppet draws nothing (empty layers, or drawn outside its box): "
                                                    f"look at presets/drawn/{name}/preset.js")
                ys, xs = np.nonzero(allm); crop = (max(0, xs.min() - 30), max(0, ys.min() - 30), xs.max() + 31, ys.max() + 31)
                see = [(px, sl) for px, sl, _ in rest["holes"]]
                cells = [("rest" + (f" · see-through {sum(px for px, _ in see)}px: as in the master?" if see else ""),
                          boxed(rest["img"], [("see", px, sl) for px, sl in see], crop))]
                res.append({"pose": "rest", "problems": [], "see_through": [px for px, _ in see]})
                for pname, r in shots[1:]:
                    found = judge(r, rest, parts)
                    probs = [x for x in found if x[0] != "ring"]; rings = [x for x in found if x[0] == "ring"]
                    res.append({"pose": pname, "problems": [{"kind": k, "px": px} for k, px, _ in probs], "rings": [px for _, px, _ in rings]})
                    lab = pname + ("" if not probs else " · " + ", ".join(f"{k} {px}px" for k, px, _ in probs)) +                           (f" (ring {sum(px for _, px, _ in rings)}px)" if rings else "")
                    cells.append((lab, boxed(r["img"], probs, crop)))
                grid(cells, 280, 420, 8).save(dst / f"{name}_poses.png")
                parts = []
                for q in T["parts"]:
                    await pg.evaluate(JS_PART, [name, q["name"], 12])
                    parts.append((q["name"] + (f" (in {q['parent']})" if q["parent"] else ""), Image.open(io.BytesIO(await st.screenshot())).convert("RGB")))
                if parts: grid(parts, 300, 300, 6).save(dst / f"{name}_parts.png")
                hero_res = None
                if hero_im is not None:                   # the puppet at rest where its origin is, over the hero frame
                    hw, hh = hero_im.size
                    await pg.set_viewport_size({"width": hw, "height": hh})
                    await pg.evaluate(JS_DRAW, [name, {}, hw, hh, T["origin"][0], T["origin"][1], "transparent"])
                    shot = Image.open(io.BytesIO(await st.screenshot(omit_background=True))).convert("RGBA").resize((hw, hh), Image.LANCZOS)
                    await pg.set_viewport_size({"width": 2400, "height": 2400})
                    import numpy as np
                    A = np.asarray(shot).astype(float); Hf = np.asarray(hero_im).astype(float); al = A[..., 3] > 128
                    if al.any():
                        d = np.abs(A[..., :3] - Hf).max(axis=2)
                        ys, xs = np.nonzero(al); y0, y1, x0, x1 = max(0, ys.min() - 20), min(hh, ys.max() + 21), max(0, xs.min() - 20), min(hw, xs.max() + 21)
                        over = hero_im.copy(); over.paste(shot, (0, 0), shot)
                        heat = Image.fromarray(np.where(al, np.clip(d * 3, 0, 255), 0).astype("uint8")).convert("RGB")
                        crop = lambda im: im.crop((x0, y0, x1, y1))
                        grid([("hero frame", crop(hero_im)), ("puppet at rest over it", crop(over)), ("difference x3", crop(heat))], 600, 600, 3).save(dst / f"{name}_hero.png")
                        hero_res = {"mean": round(float(d[al].mean()), 2), "over40": round(float((d[al] > 40).mean()) * 100, 2)}
                report[name] = {"poses": res, "hero": hero_res, "see_through": sum(res[0]["see_through"]),
                                "holes": sum(1 for r in res for x in r["problems"] if x["kind"] == "hole"),
                                "pieces": sum(1 for r in res for x in r["problems"] if x["kind"] == "piece"),
                                "gaps": sum(1 for r in res for x in r["problems"] if x["kind"].startswith("gap"))}
            await b.close()
    asyncio.run(go())
    # one entry per puppet with its own check time: checking a few (--puppets a,b) keeps the others' results (kit.py round ... assets
    # reads each puppet's time against its preset.js)
    now, jf = time.time(), dst / "PUPPETS.json"
    try: old = json.loads(jf.read_text(encoding="utf-8")) if jf.exists() else {}
    except ValueError: old = {}
    every = art_files(p)
    merged = {k: dict(r, checked=r.get("checked", old.get("checked", 0))) for k, r in (old.get("puppets") or {}).items() if k in every}
    merged.update({k: dict(r, checked=now) for k, r in report.items()})
    jf.write_text(json.dumps({"checked": now, "files": {k: str(v) for k, v in every.items()}, "puppets": merged}, indent=1), encoding="utf-8")
    report = merged
    md = ["# Puppet check (kit.py sheet --puppets)", "", f"{time.strftime('%d/%m/%Y %H:%M')}. Every puppet alone on #00FF00 at 2x, at rest, in its own "
          f"poses and every part turned {STRESS} deg both ways, each pose against the rest pose. New holes and pieces must be 0 (a hole a pose "
          "makes between two limbs can be real: look); a gap is a notch beside a joint that opened when a part turned; the see-through areas "
          "at rest must be in the master too.", "",
          "| Puppet | Poses | New holes | Pieces | Gaps at joints | See-through at rest (px at 2x) | Hero frame (mean diff / % over 40) |",
          "|---|---|---|---|---|---|---|"]
    for k, r in report.items():
        h = r["hero"]; hs = f"{h['mean']} / {h['over40']} %" if h else "-"
        md.append(f"| {k} | {len(r['poses'])} | {r['holes']} | {r['pieces']} | {r['gaps']} | {r['see_through']} | {hs} |")
    (dst / "PUPPETS.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    for line in md[4:]: say("  " + line)
    say(f"puppets checked -> {dst} (<name>_poses.png, <name>_parts.png{', <name>_hero.png' if hero else ''}, PUPPETS.md)")
    return report
