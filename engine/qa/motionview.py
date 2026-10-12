"""Two animator's views of a film and its numeric checks (12/10/2026, the user: follow the "Motion Lab" article: "An onion skin stacks
frames at low opacity: even spacing means robotic motion, and spacing that tightens near the keys means the easing works. A speed graph
plots position per frame: straight lines are linear motion, sharp corners are dead starts and stops"; "a numeric audit read the live scene
on all frames and compared it with the prompt's numbers").

  onion(url, t0, t1, step, out)        kit.py stills <film> --onion t0 t1 [--every 0.0417]: the frames from t0 to t1 every `step` s laid over
                                       each other (their mean: the moving parts as evenly lit ghosts, the still parts sharp) -> out
  graph(url, el, t0, t1, out)          kit.py measure <film> --graph <id> [--from s --to s]: the element's centre x / y, size and opacity on
                                       every film frame and its speed (px per frame) as a chart PNG; returns notes: linear stretches (the
                                       same speed for 8+ frames while moving) and dead stops / starts (full speed to rest within one frame)
  run_checks(url, checks)              film.json "checks": [{ "at": 2.5, "el": "logo", "expect": { "opacity": [">=", 0.99] }, "say": "..." }]
                                       at film seconds (song / word references resolved by build), read on the live film; expect keys:
                                       visible (true / false), opacity, x, y, width, height (the element's box on the stage, px), text
                                       (a substring); [op, value] with op in == >= <= > < ~ (~: within 2 px / 0.02)"""
import asyncio, json
from pathlib import Path

RECT_JS = r"""([sel, id]) => {
  const st = document.querySelector(sel), S = st.getBoundingClientRect(), e = document.getElementById(id);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  let o = 1, vis = true;
  for (let x = e; x && x !== st.parentElement; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') vis = false; o *= +cs.opacity; }
  return { x: r.left - S.left + r.width / 2, y: r.top - S.top + r.height / 2, left: r.left - S.left, top: r.top - S.top, width: r.width, height: r.height,
           opacity: vis ? o : 0, visible: vis && o > 0.01 && r.width > 0, text: e.textContent || "" }; }"""


async def _open(p, url):
    from render.browser import open_film
    return await open_film(p, url)


def onion(url, t0, t1, step, out):
    import numpy as np
    from PIL import Image
    from render.capture import stills
    times, t = [], t0
    while t <= t1 + 1e-9: times.append(round(t, 4)); t += step
    tmp = Path(out).parent / "_onion"; tmp.mkdir(parents=True, exist_ok=True); [f.unlink() for f in tmp.glob("*.png")]
    stills(url, times, tmp)
    files = sorted(tmp.glob("t_*.png"))
    acc = None
    for f in files:
        a = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)
        acc = a if acc is None else acc + a
    Image.fromarray((acc / len(files)).round().clip(0, 255).astype(np.uint8)).save(out)
    for f in files: f.unlink()
    tmp.rmdir()
    return len(files)


def graph(url, el, t0, t1, out, fps=60):
    from playwright.async_api import async_playwright

    async def go():
        async with async_playwright() as p:
            b, pg, info = await _open(p, url)
            try:
                D = info["duration"]; a, z = max(0.0, t0 or 0.0), min(D, t1 if t1 is not None else D)
                rows = []
                for k in range(int(round(a * fps)), int(round(z * fps)) + 1):
                    t = k / fps
                    await pg.evaluate(f"window.__aimk.seek({t})")
                    r = await pg.evaluate(RECT_JS, [info["stage"], el])
                    if r is None: raise SystemExit(f"--graph: no element #{el} in the film")
                    rows.append((t, r))
                return rows
            finally:
                await b.close()
    rows = asyncio.run(go())
    notes = _draw(rows, el, out, fps)
    return rows, notes


def _draw(rows, el, out, fps):
    """the chart (PIL only: x, y / size / opacity / speed lanes over the frame grid) and the notes"""
    from PIL import Image, ImageDraw
    T = [t for t, _ in rows]; X = [r["x"] for _, r in rows]; Y = [r["y"] for _, r in rows]
    Wd = [r["width"] for _, r in rows]; O = [r["opacity"] for _, r in rows]
    sp = [0.0] + [((X[i] - X[i - 1]) ** 2 + (Y[i] - Y[i - 1]) ** 2) ** 0.5 for i in range(1, len(rows))]
    lanes = [("x px", X), ("y px", Y), ("width px", Wd), ("opacity", O), ("speed px/frame", sp)]
    W, LH, M = 1600, 180, 70
    im = Image.new("RGB", (W, M + LH * len(lanes) + 30), "white"); dr = ImageDraw.Draw(im)
    dr.text((M, 10), f"#{el}: {T[0]:.2f}-{T[-1]:.2f} s, {len(rows)} frames at {fps} fps", fill=(20, 20, 20))
    span = max(1e-6, T[-1] - T[0]); px = lambda t: M + (W - M - 20) * (t - T[0]) / span
    for li, (name, V) in enumerate(lanes):
        y0 = M + li * LH; lo, hi = min(V), max(V)
        least = 0.1 if name == "opacity" else 4.0                # sub-pixel wobble drawn flat, not blown up to the lane's height
        if hi - lo < least: mid = (hi + lo) / 2; lo, hi = mid - least / 2, mid + least / 2
        rng = hi - lo
        dr.rectangle([M, y0, W - 20, y0 + LH - 20], outline=(200, 200, 200))
        dr.text((6, y0 + 4), name, fill=(60, 60, 60)); dr.text((6, y0 + 20), f"{hi:.1f}", fill=(120, 120, 120)); dr.text((6, y0 + LH - 36), f"{lo:.1f}", fill=(120, 120, 120))
        for k in range(0, len(T), max(1, fps // 4)): x = px(T[k]); dr.line([x, y0, x, y0 + LH - 20], fill=(238, 238, 238))
        pts = [(px(t), y0 + (LH - 24) - (LH - 30) * (v - lo) / rng) for t, v in zip(T, V)]
        dr.line(pts, fill=(255, 106, 43) if name.startswith("speed") else (40, 90, 220), width=2)
        for x, y in pts: dr.point((x, y), fill=(0, 0, 0))
    for k in range(0, len(T), fps // 2 or 1): dr.text((px(T[k]) - 10, M + LH * len(lanes) - 14), f"{T[k]:.1f}", fill=(80, 80, 80))
    Path(out).parent.mkdir(parents=True, exist_ok=True); im.save(out)
    notes, run = [], 0
    moving = [s > 0.5 for s in sp]
    for i in range(1, len(sp)):                             # the same speed frame after frame while moving: linear motion
        if moving[i] and abs(sp[i] - sp[i - 1]) < 0.02 * max(sp[i], 1e-6): run += 1
        else:
            if run >= 8: notes.append(f"linear: {T[i - run - 1]:.2f}-{T[i - 1]:.2f} s at {sp[i - 1]:.1f} px/frame (an ease would start and land softer)")
            run = 0
    if run >= 8: notes.append(f"linear: {T[-run - 1]:.2f}-{T[-1]:.2f} s at {sp[-1]:.1f} px/frame")
    peak = max(sp) if sp else 0
    for i in range(1, len(sp)):                             # full speed to rest (or rest to full speed) within one frame
        if peak > 4 and ((sp[i - 1] > 0.5 * peak and sp[i] < 0.05 * peak) or (sp[i - 1] < 0.05 * peak and sp[i] > 0.5 * peak)):
            notes.append(f"dead {'stop' if sp[i] < sp[i - 1] else 'start'} at {T[i]:.2f} s ({sp[i - 1]:.1f} -> {sp[i]:.1f} px/frame)")
    return notes


OPS = {"==": lambda a, b: a == b, ">=": lambda a, b: a >= b, "<=": lambda a, b: a <= b, ">": lambda a, b: a > b, "<": lambda a, b: a < b}


def _ok(key, got, want):
    if key == "text": return str(want) in str(got)
    if key == "visible": return bool(got) == bool(want)
    op, v = (want if isinstance(want, list) else ["~", want])
    if op == "~": return abs(float(got) - float(v)) <= (0.02 if key == "opacity" else 2.0)
    return OPS[op](float(got), float(v))


def run_checks(url, checks):
    """-> [(check, ok, got)] on the live film"""
    from playwright.async_api import async_playwright

    async def go():
        async with async_playwright() as p:
            b, pg, info = await _open(p, url)
            try:
                res = []
                for c in checks:
                    await pg.evaluate(f"window.__aimk.seek({float(c['at'])})")
                    r = await pg.evaluate(RECT_JS, [info["stage"], c["el"]])
                    if r is None: res.append((c, False, {"error": f"no #{c['el']}"})); continue
                    bad = {k: r.get(k) for k, w in (c.get("expect") or {}).items() if not _ok(k, r.get(k), w)}
                    res.append((c, not bad, bad or {k: r.get(k) for k in (c.get("expect") or {})}))
                return res
            finally:
                await b.close()
    return asyncio.run(go())
