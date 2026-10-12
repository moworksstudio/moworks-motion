"""kit.py compare: everything a remake does with its reference video (workflow/remake.md), one command (the 2D rebuild test, 09/10/2026:
the review loop of a 1:1 rebuild took four separate scripts per round, and every extra tool call re-reads the whole chat; the remake mode
of the origin skill, howseen-ai/claude-motion-design, MIT: shots, measuring, split screen, old brand colours).

  kit.py compare <film> <reference video> [--every 0.5] [--from 0] [--to <end>] [--offset 0] [--old-colors "#hex,..."]

  1 the reference's own frames at film time + offset, read natively in ONE ffmpeg pass (select by frame number = round(t * its fps): an
    "fps=N" filter is half a frame late, and a resampled frame lies about timing)
  2 the film's stills at the same times (one browser)
  3 sheets of 3 pairs each, reference | film, a 10 % grid on both, the time and the difference on each pair
  4 the difference per time (mean colour distance on 480 px wide copies): the worst first in compare.md, so a round starts where it differs most
  5 --old-colors: the reference brand's colours still in the film (a remake's swap), the times where they cover over 0.1 % of the frame
-> <film>/02_Assets/Stills/compare/sheet_NN.jpg + compare.md (the old ones go to the Recycle Bin first)

  --shots: the reference alone, before building: its cuts, sheets, 01_Brief/SHOTS.md, its sound for kit.py beats (qa/shots.py)
  --follow x,y,w,h: one element of the reference measured frame by frame -> moves, times, closest eases (qa/follow.py)
  --split: the film's newest MP4 export and the reference side by side, labelled "original" | "remake", 60 fps, the film's sound
           -> <film>/02_Assets/Compare/<film>_vs_<reference>_<date-time>.mp4 (nothing is rendered)"""
import io, json, re, subprocess, time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def _ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def video_info(src):
    """(fps, duration, width, height) read from ffmpeg's banner"""
    r = subprocess.run([_ffmpeg(), "-hide_banner", "-i", str(src)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    s = r.stderr
    fps = float((re.search(r"(\d+(?:\.\d+)?) fps", s) or re.search(r"(\d+(?:\.\d+)?) tbr", s)).group(1))
    h, m, sec = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", s).groups()
    w, hh = map(int, re.search(r"Video: .*?(\d{2,5})x(\d{2,5})", s).groups())
    return fps, int(h) * 3600 + int(m) * 60 + float(sec), w, hh


def ref_frames(src, times, out, size):
    """the reference's native frames nearest to each time -> out/r_<i>.jpg (size = (w, h) to scale to)"""
    fps, dur, _, _ = video_info(src)
    nums = [min(int(round(t * fps)), int(dur * fps) - 1) for t in times]
    uniq = sorted(set(nums))
    expr = "+".join(f"eq(n\\,{n})" for n in uniq)
    cmd = [_ffmpeg(), "-v", "error", "-y", "-i", str(src), "-vf", f"select='{expr}',scale={size[0]}:{size[1]}", "-vsync", "0", "-q:v", "3", str(out / "u_%05d.jpg")]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode: raise SystemExit(f"ffmpeg could not read the reference: {r.stderr[-300:]}")
    got = sorted(out.glob("u_*.jpg"))
    by = {n: got[i] for i, n in enumerate(uniq) if i < len(got)}
    return [by.get(n) for n in nums], fps


def _grid(im, step=0.1, col=(255, 60, 60)):
    d = ImageDraw.Draw(im); w, h = im.size
    for k in range(1, int(1 / step)):
        x, y = round(w * k * step), round(h * k * step)
        d.line([(x, 0), (x, h)], fill=col if k == 5 else (255, 160, 160), width=1); d.line([(0, y), (w, y)], fill=col if k == 5 else (255, 160, 160), width=1)
    return im


def run(p, film, src, every=0.5, t_from=0.0, t_to=None, offset=0.0, say=print, old_colors=None):
    from common import film_name, renders, trash, work_dir
    from kit import film_url
    from render.capture import probe, stills
    url, srv = film_url(film)
    try:
        info = probe(url)
        fps, rdur, _, _ = video_info(src)
        end = min(info["duration"], rdur - offset) if t_to is None else min(t_to, info["duration"])
        # every pair at one of the reference's own frame times: a film time between two reference frames put the film half a frame away from
        # what the reference shows (11/10/2026 test: --every 0.04 started off the 25 fps grid inflated every difference)
        times = sorted({round(round((t + offset) * fps) / fps - offset, 4) for t in np.arange(t_from, end - 1e-6, every)})
        times = [t for t in times if 0 <= t < info["duration"]]
        if not times: raise SystemExit("no time to compare (check --from / --to / --offset)")
        work = work_dir("compare", film_name(p))
        for x in list(work.glob("*.png")) + list(work.glob("*.jpg")): x.unlink()
        W, H = 640, round(640 * info["h"] / info["w"])
        say(f"compare: {len(times)} times every {every} s, {times[0]} - {times[-1]} s; the reference at {fps:g} fps, offset {offset:+g} s")
        refs, _ = ref_frames(src, [t + offset for t in times], work, (W, H))
        stills(url, times, work)
    finally:
        srv.shutdown()
    films = sorted(work.glob("t_*.png"))
    rows, left = [], []
    olds = [np.array([int(h.strip().lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)], np.int16) for h in (old_colors or "").split(",") if h.strip()]
    for t, rf, ff in zip(times, refs, films):
        a = Image.open(rf).convert("RGB").resize((W, H)) if rf else Image.new("RGB", (W, H), "#000000")
        b = Image.open(ff).convert("RGB").resize((W, H))
        bs = np.asarray(b.resize((480, round(480 * H / W))), np.int32)
        diff = float(np.abs(np.asarray(a.resize((480, round(480 * H / W))), np.int16) - bs).mean())
        rows.append((t, a, b, diff))
        if olds: left.append((t, float(np.mean(np.min([np.sqrt(((bs - c) ** 2).sum(axis=2)) for c in olds], axis=0) < 40))))
    dst = renders(p, "stills") / "compare"; dst.mkdir(parents=True, exist_ok=True)
    trash([x for x in dst.glob("sheet_*.jpg")] + [x for x in dst.glob("compare.md")])
    per = 3
    for s in range(0, len(rows), per):
        chunk = rows[s:s + per]
        sheet = Image.new("RGB", (2 * W + 30, len(chunk) * (H + 34) + 10), "#E8E8EC"); d = ImageDraw.Draw(sheet)
        for k, (t, a, b, diff) in enumerate(chunk):
            y = 10 + k * (H + 34)
            sheet.paste(_grid(a.copy()), (10, y + 24)); sheet.paste(_grid(b.copy()), (W + 20, y + 24))
            d.text((10, y + 4), f"reference {t + offset:.2f} s", fill=(30, 30, 40)); d.text((W + 20, y + 4), f"film {t:.2f} s   difference {diff:.1f}", fill=(30, 30, 40))
        sheet.save(dst / f"sheet_{s // per + 1:02d}.jpg", quality=88)
    worst = sorted(rows, key=lambda r: -r[3])
    md = [f"# Film vs reference ({time.strftime('%d/%m/%Y %H:%M')})", "", f"Reference: `{Path(src).name}`, offset {offset:+g} s, every {every} s, "
          f"{len(rows)} times. Difference = mean colour distance (0-255) on 480 px copies: over ~25 something visible differs.", "",
          "| Film time | Difference | Sheet |", "|---|---|---|"]
    md += [f"| {t:.2f} s | {diff:.1f} | sheet_{rows.index((t, a, b, diff)) // per + 1:02d}.jpg |" for t, a, b, diff in worst[:20]]
    hits = [(t, s) for t, s in left if s > 0.001]
    if olds:
        md += ["", f"## The reference's colours still in the film ({old_colors})", ""]
        md += ["| Film time | Share of the frame |", "|---|---|"] + [f"| {t:.2f} s | {s:.1%} |" for t, s in hits] if hits else ["None at the compared times."]
    (dst / "compare.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    say(f"{len(rows)} pairs on {-(-len(rows) // per)} sheets -> {dst}; the most different: " + ", ".join(f"{t:.2f} s ({d_:.0f})" for t, _, _, d_ in worst[:5]))
    if olds: say("  the reference's colours: " + (f"still at {len(hits)} time(s): " + ", ".join(f"{t:.2f} s ({s:.1%})" for t, s in hits[:8]) + " (compare.md)"
                                                   if hits else "none left at the compared times"))
    return dst


def split(p, src, offset=0.0, t_from=0.0, t_to=None, say=print):
    """the film's newest MP4 export | the reference, side by side, labelled, 60 fps, the film's sound; nothing is rendered"""
    from PIL import ImageFont
    from common import film_name, renders_root, stamp, work_dir
    base = renders_root(p)
    mp4s = sorted((base / "MP4").glob("*.mp4"), key=lambda x: x.stat().st_mtime) if (base / "MP4").is_dir() else []
    if not mp4s: raise SystemExit("no MP4 export of the film yet: press MP4 Export in the player (or kit.py mp4 <film>), then run this again")
    mp4 = mp4s[-1]
    built = max((x.stat().st_mtime for x in (p / "index.html", p / "film.json") if x.exists()), default=0)
    if mp4.stat().st_mtime < built: say(f"  note: {mp4.name} is older than the film's last build: export again to compare the current version")
    _, fdur, fw, fh = video_info(mp4)
    a = fw / fh
    pw = 880; ph = round(pw / a / 2) * 2
    if ph > 880: ph = 880; pw = round(880 * a / 2) * 2
    y = (1080 - ph) // 2 + 20; x1 = (1920 - 2 * pw - 40) // 2; x2 = x1 + pw + 40
    work = work_dir("compare", film_name(p))
    bg = Image.new("RGB", (1920, 1080), "#EDEDF0"); d = ImageDraw.Draw(bg)
    try: font = ImageFont.truetype(str(Path(__file__).resolve().parents[1] / "vendor" / "fonts" / "RobotoFlex-var.ttf"), 28)
    except Exception: font = ImageFont.load_default()
    for x, label in ((x1, "original"), (x2, "remake")):
        tw = d.textlength(label, font=font)
        d.rectangle([x, y - 52, x + tw + 28, y - 10], fill="#16161A"); d.text((x + 14, y - 47), label, fill="#FFFFFF", font=font)
    bgp = work / "split_bg.png"; bg.save(bgp)
    t0 = t_from or 0.0
    dur = (min(t_to, fdur) if t_to else fdur) - t0
    if dur <= 0: raise SystemExit("nothing to show (check --from / --to)")
    rs = t0 + (offset or 0.0)
    pad = f",tpad=start_duration={-rs:.4f}:color=black" if rs < 0 else ""
    fc = (f"[1:v]fps=60,scale={pw}:{ph}:force_original_aspect_ratio=decrease,pad={pw}:{ph}:(ow-iw)/2:(oh-ih)/2:black{pad},setsar=1[r];"
          f"[2:v]fps=60,scale={pw}:{ph},setsar=1[f];[0:v][r]overlay={x1}:{y}[a];[a][f]overlay={x2}:{y},format=yuv420p,setsar=1[v]")
    out = base / "Compare"; out.mkdir(parents=True, exist_ok=True)
    dst = out / f"{film_name(p)}_vs_{Path(src).stem}_{stamp()}.mp4"
    cmd = [_ffmpeg(), "-v", "error", "-y", "-loop", "1", "-framerate", "60", "-i", str(bgp), *(["-ss", f"{rs:.4f}"] if rs > 0 else []), "-i", str(src),
           *(["-ss", f"{t0:.4f}"] if t0 > 0 else []), "-i", str(mp4), "-filter_complex", fc, "-map", "[v]", "-map", "2:a?", "-t", f"{dur:.4f}",
           "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-profile:v", "high",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst)]
    say(f"split: {mp4.name} (film) | {Path(src).name} (reference, offset {offset or 0:+g} s), {dur:.2f} s ...")
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode: raise SystemExit(f"ffmpeg: {r.stderr[-400:]}")
    say(f"-> {dst}")
    return dst
