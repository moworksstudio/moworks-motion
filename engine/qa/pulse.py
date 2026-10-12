"""kit.py pulse: how much a film moves ON the music's grid (user 08/10/2026: the plain-prompt A/B film "giật bặt bặt theo nhịp kick" and
won motion 9 vs 8, sync 9 vs 6). Measures the picture, not the code:
  - picture change per frame (mean absolute difference at 192 x 108, grey);
  - by beat phase (16 bins of a beat): the "lift" = change in the first 0.14 s after a beat / change in the second half of the beat;
  - the beats followed by a visible jolt (change right after > 1.3 x the change just before);
  - still frames (almost no change).
Reference, the A/B plain-prompt film (B, 135 BPM, 0-49 s): lift 1.42, 76 % of beats with a jolt, 4.9 % still frames.
Source: the film itself rendered small in the browser (a few minutes), or an exported video (--video, seconds).
The grid: the film's song (film.json "song" + kit.py beats), or --bpm / --offset."""
import asyncio, json, subprocess, sys
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import FPS, say                              # noqa: E402

W, H = 192, 108
REF = {"lift": 1.42, "jolts": 76, "still": 4.9}


def frames_from_video(video):
    import imageio_ffmpeg
    import numpy as np
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-i", str(video), "-vf", f"fps={FPS},scale={W}:{H},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


async def _frames_from_film(url, t0, t1, every=1):
    import io
    import numpy as np
    from PIL import Image
    from playwright.async_api import async_playwright
    from render.browser import PAINT, open_film
    out = []
    async with async_playwright() as pw:
        b, pg, info = await open_film(pw, url, scale=W / 1920)
        t1 = min(t1, info["duration"]) if t1 else info["duration"]
        st = await pg.query_selector(info["stage"])
        n = int(round((t1 - t0) * FPS))
        for i in range(0, n, every):
            await pg.evaluate(f"window.__aimk.seek({t0 + i / FPS:.5f})"); await pg.evaluate(PAINT)
            im = Image.open(io.BytesIO(await st.screenshot(type="png"))).convert("L").resize((W, H))
            out.append(np.asarray(im, np.float32))
            if i and i % 600 == 0: say(f"  {i / FPS:.0f} s rendered")
        await b.close()
    return np.stack(out)


def grid_of(p, bpm=0.0, offset=None, dur=600.0):
    if bpm:
        t0 = offset or 0.0
        return [t0 + i * 60 / bpm for i in range(int((dur - t0) * bpm / 60) + 1)]
    from audio import song as SONG
    spec = json.loads((p / "film.json").read_text(encoding="utf-8")) if (p / "film.json").exists() else {}
    S = SONG.Song(p, spec)
    if not S.beats: raise SystemExit("pulse needs the film's song (film.json \"song\" + kit.py beats) or --bpm 135 --offset 2.0")
    return S.beats


def measure(fr, beats, t_from=0.0):
    import numpy as np
    mot = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))            # change into frame i+1
    t = t_from + (np.arange(len(mot)) + 1) / FPS
    B = np.array([b for b in beats if t[0] + 0.2 < b < t[-1] - 0.2])
    if len(B) < 4: raise SystemExit("fewer than 4 beats inside the measured part")
    period = float(np.median(np.diff(B)))
    sel = (t >= B[0]) & (t < B[-1])
    idx = np.searchsorted(B, t[sel], side="right") - 1
    ph = (t[sel] - B[idx]) / period
    bins = np.clip(np.floor(ph * 16).astype(int), 0, 15)
    m = mot[sel]
    prof = np.array([m[bins == k].mean() if (bins == k).any() else 0 for k in range(16)]) / max(1e-9, m.mean())
    early = int(round(0.14 / (period / 16)))
    lift = float(prof[:max(1, early)].mean() / max(1e-9, prof[8:].mean()))
    jolts = n = 0
    for b in B:
        i = int(round((b - t_from) * FPS)) - 1
        if i < 8 or i + 6 >= len(mot): continue
        n += 1; jolts += mot[i:i + 5].max() > 1.3 * max(1e-6, mot[i - 6:i - 1].mean())
    return {"frames": len(fr), "still": float((mot < 0.15).mean() * 100), "lift": lift, "jolts": 100.0 * jolts / max(1, n), "beats": n,
            "profile": [round(float(x), 2) for x in prof], "mean": float(mot.mean())}


def run(project, video=None, bpm=0.0, offset=None, t_from=None, t_to=None):
    from render.serve import serve_in_thread
    p = Path(project).resolve() if project else None
    if video:
        fr = frames_from_video(video); t0 = 0.0
        if t_from or t_to:
            a, z = int((t_from or 0) * FPS), int((t_to or len(fr) / FPS) * FPS); fr = fr[a:z]; t0 = a / FPS
        src = Path(video).name
    else:
        if not p or not (p / "index.html").exists(): raise SystemExit("pulse: a project with index.html, or --video <file>")
        base, srv = serve_in_thread(p)
        try: fr = asyncio.run(_frames_from_film(base.rstrip("/") + "/index.html", t_from or 0.0, t_to))
        finally: srv.shutdown()
        t0 = t_from or 0.0; src = "the film (rendered small)"
    beats = grid_of(p, bpm, offset, dur=t0 + len(fr) / FPS) if (p or bpm) else None
    if beats is None: raise SystemExit("pulse --video without a project: give --bpm and --offset")
    r = measure(fr, beats, t0)
    say(f"pulse of {src}: {r['frames']} frames, {r['beats']} beats")
    say(f"  lift (change in the 0.14 s after a beat / second half of the beat): {r['lift']:.2f}   (A/B film B: {REF['lift']})")
    say(f"  beats followed by a visible jolt: {r['jolts']:.0f} %   (B: {REF['jolts']} %)")
    say(f"  still frames: {r['still']:.1f} %   (B: {REF['still']} %)")
    say("  change by beat phase (16 bins, 1 = the film's mean): " + " ".join(f"{x:.2f}" for x in r["profile"]))
    tips = []
    if r["lift"] < 1.2: tips.append("the picture barely reacts to the beat: a film.json \"groove\" (stickers, bubbles, particles, rings on \"beat\"; the hero on the words)")
    if r["jolts"] < 50: tips.append("fewer than half the beats land: more grooved elements, or a stronger \"scale\" / \"y\"")
    if r["still"] > 15: tips.append("many still frames: always-on life that covers the frame (a background pattern drifting, a moving gradient, 30-60 particles; a small float alone does not count)")
    for x in tips: say("  → " + x)
    if not tips: say("  ✓ moves with the beat")
    return r
