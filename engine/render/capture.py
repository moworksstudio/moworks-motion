"""Backend "kit": capture film frames with Playwright Chromium (plan section 4 / 5).

Why one Chromium per worker process: measured 05/10/2026, 405-frame film, 8 workers: one browser per worker 8.3 s, HyperFrames on Windows
(8 pages in one shared browser) 23 s; per-frame capture speed is the same (.aimotionkit/archive/AI-Motion-Kit-v2/Docs/Audit/reports/spike2_hyperframes.md).

Library use:
  info = probe(url)                                            -> {contract, w, h, duration, markers, stage}
  stills(url, times, out_dir)                                  -> t_<seconds>.png per time (golden naming)
  frames(url, out_dir, fps=60, workers=8, alpha=False, scale=1) -> s_000000.png ... (0-based, the names v1 gave After Effects);
                                                                  scale 2 = 4K (twice the film's pixels, same layout)
Worker (spawned by frames):  python capture.py chunk <url> <out_dir> <fps> <i0> <i1> [alpha]"""
import asyncio, subprocess, sys, time
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import say                                  # noqa: E402
from render.browser import PAINT, open_film            # noqa: E402
from playwright.async_api import async_playwright      # noqa: E402


async def _probe(url):
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url)
        await b.close()
    return info


def probe(url):
    return asyncio.run(_probe(url))


async def _shot(pg, stage, t, path, alpha):
    await pg.evaluate(f"window.__aimk.seek({t})"); await pg.evaluate(PAINT)
    if str(path).endswith(".jpg"): await stage.screenshot(path=str(path), type="jpeg", quality=88)       # kit.py proxy (the player's smooth playback)
    else: await stage.screenshot(path=str(path), type="png", omit_background=alpha)


async def _stills(url, times, out_dir, alpha):
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url)
        st = await pg.query_selector(info["stage"])
        for t in times:
            await _shot(pg, st, t, out / f"t_{t:09.3f}.png", alpha)
        await b.close()
    return info


def stills(url, times, out_dir, alpha=False):
    return asyncio.run(_stills(url, times, out_dir, alpha))


def blur_times(t, fps, cuts, n, shutter=180.0):
    """n sample times of an After Effects-style shutter centred on the frame time t (phase -shutter/2), clamped to t's side of every cut
    so a sample never shows the neighbouring scene (Howseen H2; v1 blurred across cuts and ghosted, audit section 2)"""
    span = shutter / 360.0 / fps
    ts = [t - span / 2 + (k + 0.5) * span / n for k in range(n)]
    for c in cuts:
        if t >= c - 1e-9: ts = [max(x, c) for x in ts]                  # frame after (or on) the cut: no sample before it
        else: ts = [min(x, c - 1e-4) for x in ts]                         # frame before the cut: no sample at or after it
    return ts


async def _grabber(pg, st, alpha, scale=1.0):
    """frame grabs through CDP Page.captureScreenshot with optimizeForSpeed (fast PNG compression): 33 ms instead of 84 ms for Playwright's
    element screenshot on a 1920x1080 frame, identical pixels (measured 05/10/2026). Returns grab() -> RGB or RGBA uint8 array.
    scale = the render scale: the clip's own scale must match the page's device scale factor, or a 4K render comes back at 1920x1080
    ("scale": 1 was fixed here: every 4K export with motion blur was Full HD, 11/10/2026 test; 2 gives the element
    screenshot's pixels exactly)"""
    import base64, io
    import numpy as np
    from PIL import Image
    cdp = await pg.context.new_cdp_session(pg)
    if alpha: await cdp.send("Emulation.setDefaultBackgroundColorOverride", {"color": {"r": 0, "g": 0, "b": 0, "a": 0}})
    bb = await st.bounding_box()
    clip = {"x": round(bb["x"]), "y": round(bb["y"]), "width": round(bb["width"]), "height": round(bb["height"]), "scale": scale}

    async def grab():
        # one animation frame first: without it a grab right after a seek sometimes showed a half-updated frame (scaling shapes, frames
        # 15-23 of _Test_Spec changed from run to run); with it 3 runs were identical to each other and to Playwright's screenshot
        await pg.evaluate("new Promise(r => requestAnimationFrame(() => r()))")
        r = await cdp.send("Page.captureScreenshot", {"format": "png", "optimizeForSpeed": True, "clip": clip})
        return np.asarray(Image.open(io.BytesIO(base64.b64decode(r["data"]))).convert("RGBA" if alpha else "RGB"))
    return grab


def _png(arr):
    """PNG bytes at PIL's default compression (the fast CDP PNG is twice the size; re-encoding costs about 20 ms)"""
    import io
    from PIL import Image
    buf = io.BytesIO(); Image.fromarray(arr).save(buf, "PNG"); return buf.getvalue()


async def _blur_frame(pg, grab, t, fps, cuts, dur, alpha, base):
    """adaptive accumulation: two probes at the shutter edges; identical -> the plain frame, else 8 / 16 / 32 samples by how far it moved"""
    import numpy as np

    async def at(x):
        await pg.evaluate(f"window.__aimk.seek({min(dur - 1e-3, max(0.0, x))})")
        return await grab()
    edges = blur_times(t, fps, cuts, 2)
    a, b = await at(edges[0]), await at(edges[-1])
    diff = float(np.abs(a.astype(np.int16) - b).sum()) / (a.shape[0] * a.shape[1] * 4)   # mean over RGBA, as the thresholds were set
    if diff == 0.0:
        return _png(await at(t)), 1
    n = base if diff < 1.5 else base * 2 if diff < 6 else base * 4
    # every sample is a full frame. Tried 05/10: sampling only the region that changes (edges + centre) was just 1.4-1.5x faster and
    # still wrong on 17/360 frames of the test film (count-up digits and overlapping tweens change mid-window), so it was dropped.
    # The samples are averaged in LINEAR light (12/10/2026, the user: follow the "Motion Lab" article: "blended in linear light, which is how
    # a 180-degree film shutter records motion blur"): a bright edge streaks as bright as film shows it; averaging the sRGB numbers (AE's
    # 8-bpc way, used before) darkened streaks of light over dark. Alpha stays a plain average (premultiplied colour).
    L = _lin()
    acc = np.zeros(a.shape, np.float32); four = a.shape[2] == 4          # opaque grabs are RGB, alpha ones RGBA
    for x in blur_times(t, fps, cuts, n):
        s = await at(x)
        lin = L[s[..., :3]]
        if alpha and four: w = s[..., 3:4].astype(np.float32) / 255.0; acc[..., :3] += lin * w; acc[..., 3] += s[..., 3]
        else:
            acc[..., :3] += lin
            if four: acc[..., 3] += s[..., 3]
    acc /= n
    if alpha and four: lin = np.where(acc[..., 3:4] > 0, acc[..., :3] * 255.0 / np.maximum(acc[..., 3:4], 1e-6), 0)
    else: lin = acc[..., :3]
    out = _srgb(lin) if not four else np.concatenate([_srgb(lin), acc[..., 3:4].round().clip(0, 255)], axis=2)
    return _png(out.astype(np.uint8)), n


_LIN = None


def _lin():
    """sRGB byte -> linear light (0..1), a 256-entry table"""
    global _LIN
    if _LIN is None:
        import numpy as np
        c = np.arange(256, dtype=np.float64) / 255.0
        _LIN = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4).astype(np.float32)
    return _LIN


def _srgb(lin):
    """linear light (0..1) -> sRGB bytes (as floats, rounded)"""
    import numpy as np
    l = np.clip(lin, 0.0, 1.0)
    return np.rint(np.where(l <= 0.0031308, l * 12.92, 1.055 * np.power(l, 1 / 2.4) - 0.055) * 255.0)


async def _chunk(url, out_dir, fps, i0, i1, alpha, blur=False, base_samples=8, scale=1.0, ext="png"):
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url, scale=scale)    # scale 2: the browser draws twice the pixels (text, vectors sharp; 4K)
        if info.get("broken"):                               # never write frames with a broken picture (08/10/2026, test 3)
            await b.close()
            raise SystemExit(f"pictures that did not load (after 2 retries): {info['broken'][:5]}: is the project folder still syncing? try again")
        st = await pg.query_selector(info["stage"])
        dur = info["duration"]
        cuts = sorted({m[1] for m in info["markers"] if m[1] > 0})
        grab = await _grabber(pg, st, alpha, scale) if blur else None
        stats = []
        for i in range(i0, i1):
            t = min(dur - 1e-3, i / fps)                     # frame START time, v1 and HyperFrames agree (hf03 9.1)
            if blur:                                         # blur: 90 s -> 46 s on _Test_Spec (351 frames, 8 workers), same pixels (05/10/2026)
                png, n = await _blur_frame(pg, grab, t, fps, cuts, dur, alpha, base_samples)
                (out / f"s_{i:06d}.png").write_bytes(png); stats.append(n)
            else:                                            # no blur: one grab per frame, the CDP grab was not faster (8 s either way)
                await _shot(pg, st, t, out / f"s_{i:06d}.{ext}", alpha)
        await b.close()
    if blur:
        (out / f"blur_{i0:06d}.json").write_text(__import__("json").dumps({"from": i0, "samples": stats}), encoding="utf-8")


def frames(url, out_dir, fps=60, workers=8, alpha=False, info=None, rng=None, blur=False, scale=1, ext="png"):
    """render every frame to out_dir (local disk) with `workers` Chromium processes; returns (n_frames, seconds).
    blur=True: 180-degree shutter motion blur, adaptive samples, never across a scene cut (blur_times / _blur_frame); ext="jpg": JPEG frames
    (kit.py proxy, no blur / alpha)"""
    info = info or probe(url)
    n = int(round(info["duration"] * fps))
    i0, i1 = rng or (0, n)
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    for old in list(out.glob("s_*.png")) + list(out.glob("s_*.jpg")) + list(out.glob("blur_*.json")): old.unlink()
    step = -(-(i1 - i0) // max(1, workers))
    t0 = time.time()
    flags = (["alpha"] if alpha else []) + (["blur"] if blur else []) + ([f"scale={scale}"] if scale != 1 else []) + (["jpg"] if ext == "jpg" else [])
    procs = [subprocess.Popen([sys.executable, "-B", __file__, "chunk", url, str(out), str(fps), str(a), str(min(i1, a + step))] + flags)
             for a in range(i0, i1, step)]
    while any(p.poll() is None for p in procs):
        time.sleep(2)
        say(f"  {len(list(out.glob('s_*.' + ext)))}/{i1 - i0} frames  ({time.time() - t0:.0f} s)")
    if any(p.returncode for p in procs): raise SystemExit("a render worker failed (see its messages above)")
    have = {int(f.stem[2:]) for f in out.glob("s_*." + ext)}
    missing = sorted(set(range(i0, i1)) - have)
    if missing: raise SystemExit(f"{len(missing)} frames missing, first {missing[:5]}")
    return i1 - i0, time.time() - t0


if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "chunk":
    _, _, url, out_dir, fps, i0, i1, *rest = sys.argv
    sc = next((float(x.split("=")[1]) for x in rest if x.startswith("scale=")), 1.0)
    asyncio.run(_chunk(url, out_dir, int(fps), int(i0), int(i1), "alpha" in rest, "blur" in rest, scale=sc, ext="jpg" if "jpg" in rest else "png"))
