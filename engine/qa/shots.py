"""kit.py compare <film> <reference> --shots: the reference video read before a remake (workflow/remake.md; phase 0 of the origin skill's
remake mode, howseen-ai/claude-motion-design, MIT).

  kit.py compare <film> <reference video> --shots [--every 0.25] [--from a] [--to b]

  1 every native frame from --from to --to read small (192 px wide, grey, one ffmpeg pass): its mean difference to the frame before,
    the share of pixels that changed, and how far it is a mix of its two neighbours
  2 picture changes = a difference far above its neighbours (over 6 and over 3.5 x the local median + 0.5), each one named:
    - cut: most of the frame changes in that one frame and the frames around it are steady;
    - fast change (a wipe, a crossfade, or a fast move: a zoom, a scroll, a light sweep; the frames cannot tell a transition from a fast
      move, the strips can): the frame is a mix of the frames before and after, or the change runs over 2 - 10 frames (11/10/2026 test,
      11/10/2026: 7 "hard cuts" flagged in 31 s were all wipes, crossfades or fast zooms; now 0 cuts and 12 fast changes there)
  3 sheets: a frame every --every s (default 0.25) with its time and frame number, the changes in red (CUT) or orange (ĐỔI NHANH), and
    one strip per change (3 frames before, 3 after)
  4 01_Brief/SHOTS.md: one row per shot (start / end time and frame, length, how it begins) with the columns to fill: what the reference
    shows, the swap, notes. 01_Brief/ref/<name>.shots.json (fps, frames, changes, differences). The sound -> 01_Brief/ref/<name>.wav,
    for kit.py beats (tempo, drop, hits); it is never used in the film
"""
import json, re, subprocess, time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from qa.compare import _ffmpeg, video_info

SMALL_W = 192


def features(src, w, h, t_to=None):
    """per native frame up to t_to: (difference to the frame before, share of pixels changed by over 20 levels, blend: (alpha, residual)
    of the frame as a mix of the frames before and after); read as a stream, three small frames at a time"""
    sh = max(2, round(SMALL_W * h / w / 2) * 2)
    cmd = [_ffmpeg(), "-v", "error", *(["-t", f"{t_to:.4f}"] if t_to else []), "-i", str(src), "-vf", f"scale={SMALL_W}:{sh},format=gray",
           "-f", "rawvideo", "-"]
    pr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    size, win, d, share, blend = SMALL_W * sh, [], [], [], []
    while True:
        buf = pr.stdout.read(size)
        if len(buf) < size: break
        cur = np.frombuffer(buf, np.uint8).astype(np.float32)
        if win:
            dif = np.abs(cur - win[-1]); d.append(float(dif.mean())); share.append(float((dif > 20).mean()))
        else: d.append(0.0); share.append(0.0)
        if len(win) == 2:                                   # the middle frame (win[1]) as alpha * before + (1 - alpha) * after
            a, b = win[0] - cur, win[1] - cur
            aa = float((a * a).sum())
            al = float((a * b).sum() / aa) if aa > 1e-6 else 0.0
            blend.append((al, float(np.abs(b - al * a).mean())))
        win = (win + [cur])[-2:]
    pr.wait()
    blend = [(0.0, 0.0)] + blend + [(0.0, 0.0)]            # frame 0 and the last frame have no two neighbours
    return np.array(d), np.array(share), blend[:len(d)]


def find_changes(d, share, blend, f0=1):
    """[(frame, "cut" | "fast")], measured on test videos (11/10/2026):
    - a cut: ONE frame far above the motion around it (3.5 x the median of the moving frames within 12, over 6), not a mix of its two
      neighbours; how much of the frame changes does not matter (a dark scene cut to a dark scene changes 14 % of the pixels);
    - a fast change: 2 to 10 frames in a row each well above that motion (2.2 x), or one frame that is a mix of its neighbours: a wipe,
      a crossfade or a fast move, one change at its first frame (a 0.16 s crossfade was two "cuts" before);
    repeated frames (a 15 fps film in a 25 or 30 fps file: every other difference is 0) are left out of the motion and skipped inside a run"""
    n, out, i = len(d), [], max(1, f0)
    while i < n:
        lo, hi = max(1, i - 12), min(n, i + 13)
        near = np.concatenate([d[lo:i], d[i + 1:hi]]); near = near[near > 0.3]
        base = float(np.median(near)) if len(near) else 0.0
        thr = max(6.0, 2.2 * (base + 0.5))
        if d[i] <= thr: i += 1; continue
        j, run = i, 1
        while True:                                          # the frames of the same change (a repeated frame in between is skipped)
            k = j + 1 if j + 1 < n and d[j + 1] > thr else j + 2 if j + 2 < n and d[j + 1] <= 0.3 and d[j + 2] > thr else None
            if k is None: break
            j, run = k, run + 1
        if run == 1:
            al, res = blend[i]
            if d[i] > 3.5 * (base + 0.5): out.append((i, "fast" if 0.15 < al < 0.85 and res < 0.4 * d[i] else "cut"))
        elif run <= 10: out.append((i, "fast"))              # longer: a moving shot, not a change
        i = j + 1
    return out


def grab(src, f0, n, step, extra, out, tw, th, t_to=None):
    """every step-th native frame from f0 plus the frames in extra -> {frame: path}; one ffmpeg pass, the select expression kept short"""
    for x in out.glob("g_*.jpg"): x.unlink()
    extra = sorted({f for f in extra if f0 <= f < n and (f - f0) % step})
    expr = f"gte(n\\,{f0})*not(mod(n-{f0}\\,{step}))" + "".join(f"+eq(n\\,{f})" for f in extra)
    cmd = [_ffmpeg(), "-v", "error", "-y", *(["-t", f"{t_to:.4f}"] if t_to else []), "-i", str(src), "-vf", f"select='{expr}',scale={tw}:{th}",
           "-vsync", "0", "-q:v", "3", str(out / "g_%06d.jpg")]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode: raise SystemExit(f"ffmpeg could not read the reference: {r.stderr[-300:]}")
    got = sorted(out.glob("g_*.jpg"))
    sel = sorted(set(range(f0, n, step)) | set(extra))
    return {f: g for f, g in zip(sel, got)}


def _font(size):
    from PIL import ImageFont
    f = Path(__file__).resolve().parents[1] / "vendor" / "fonts" / "RobotoFlex-var.ttf"
    try: return ImageFont.truetype(str(f), size)
    except Exception: return ImageFont.load_default()


LABEL = {"cut": ("CUT", (220, 30, 30)), "fast": ("ĐỔI NHANH", (230, 130, 20))}
STARTS = {"cut": "cut", "fast": "đổi nhanh"}


def run(p, src, every=0.25, say=print, t_from=0.0, t_to=None):
    from common import brief_dir, film_name, film_root, renders, trash, work_dir
    fps, dur, w, h = video_info(src)
    t_to = min(t_to, dur) if t_to else None
    f0 = max(0, int(round((t_from or 0) * fps)))
    say(f"shots: {Path(src).name}, {w}x{h}, {fps:g} fps, {dur:.2f} s" + (f", {f0 / fps:.2f} - {t_to or dur:.2f} s" if f0 or t_to else "") + ": reading every frame ...")
    d, share, blend = features(src, w, h, t_to)
    n = len(d)
    if n - f0 < 2: raise SystemExit("could not read frames from the reference (check --from / --to)")
    ch = find_changes(d, share, blend, f0 + 1)
    kind = dict(ch)
    work = work_dir("shots", film_name(p))
    tw, th = 240, max(2, round(240 * h / w / 2) * 2)
    step = max(1, int(round(every * fps)))
    shot = grab(src, f0, n, step, [f for c, _ in ch for f in range(c - 3, c + 3)], work, tw, th, t_to)
    dst = renders(p, "stills") / "shots"; dst.mkdir(parents=True, exist_ok=True)
    trash(list(dst.glob("sheet_*.jpg")) + list(dst.glob("cuts_*.jpg")))
    f12 = _font(12)

    def tile(f, mark):
        im = Image.open(shot[f]).convert("RGB") if f in shot else Image.new("RGB", (tw, th), "#000")
        c = Image.new("RGB", (tw, th + 18), "#FFFFFF"); c.paste(im, (0, 18)); dr = ImageDraw.Draw(c)
        dr.text((3, 2), f"{f / fps:.2f} s · f{f}", fill=(30, 30, 40), font=f12)
        if mark is not None:
            word, col = LABEL[kind[mark]]
            lab = word if mark == f else f"{word} f{mark}"
            dr.text((tw - 6 - dr.textlength(lab, font=f12), 2), lab, fill=col, font=f12)
            dr.rectangle([0, 18, tw - 1, th + 17], outline=col, width=3)
        return c
    grid = list(range(f0, n, step))
    cols, rows = 8, 8
    pages = 0
    for s in range(0, len(grid), cols * rows):
        chunk = grid[s:s + cols * rows]
        r_ = -(-len(chunk) // cols)
        sheet = Image.new("RGB", (cols * (tw + 6) + 6, r_ * (th + 24) + 6), "#E8E8EC")
        for k, f in enumerate(chunk):
            hit = next((c for c, _ in ch if f <= c < f + step), None)  # a change inside this tile's time step
            sheet.paste(tile(f, hit), (6 + (k % cols) * (tw + 6), 6 + (k // cols) * (th + 24)))
        pages += 1; sheet.save(dst / f"sheet_{pages:02d}.jpg", quality=86)
    strips = 0
    for s in range(0, len(ch), 8):
        chunk = ch[s:s + 8]
        sheet = Image.new("RGB", (6 * (tw + 6) + 6, len(chunk) * (th + 24) + 6), "#E8E8EC")
        for k, (c, _) in enumerate(chunk):
            for j, f in enumerate(range(c - 3, c + 3)):
                if f0 <= f < n: sheet.paste(tile(f, c if f == c else None), (6 + j * (tw + 6), 6 + k * (th + 24)))
        strips += 1; sheet.save(dst / f"cuts_{strips:02d}.jpg", quality=86)
    bd = brief_dir(p); ref = bd / "ref"; ref.mkdir(parents=True, exist_ok=True)
    stem = re.sub(r"[^\w.-]+", "_", Path(src).stem)
    (ref / f"{stem}.shots.json").write_text(json.dumps({"src": str(src), "fps": fps, "from": f0, "frames": n, "duration": round(n / fps, 4),
                                                        "size": [w, h], "changes": [[c, k] for c, k in ch],
                                                        "diff": [round(float(x), 2) for x in d]}, indent=0), encoding="utf-8")
    banner = subprocess.run([_ffmpeg(), "-hide_banner", "-i", str(src)], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    wav = None
    if "Audio:" in banner:
        wav = ref / f"{stem}.wav"
        subprocess.run([_ffmpeg(), "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "2", "-ar", "48000", str(wav)], check=True)
    root = film_root(Path(p))
    rel = lambda x: Path(x).relative_to(root).as_posix() if str(x).startswith(str(root)) else str(x)
    cuts = [c for c, k in ch if k == "cut"]; fast = [c for c, k in ch if k == "fast"]
    edges = [f0] + [c for c, _ in ch] + [n]
    md = [f"# Shots of the reference ({time.strftime('%d/%m/%Y %H:%M')})", "",
          f"Reference: `{Path(src).name}` ({w}x{h}, {fps:g} fps, frames f{f0}-f{n - 1}, {f0 / fps:.2f} - {n / fps:.2f} s). Picture changes found by "
          f"the frame difference: {len(cuts)} cut(s), {len(fast)} fast change(s) (a wipe, a crossfade, or a fast move: zoom, scroll, light sweep). Check each on "
          f"`{rel(dst)}/cuts_NN.jpg`; a morph or a slow camera move is not found. Split a long shot into beats where the picture changes "
          "state. Film frames are at 60 fps: film frame = time x 60.", "",
          "Fill in **REF shows** (layout, sizes, what moves and how), **Swap** (what the client's version shows instead: brand, copy, "
          "pictures; never the reference's people, music or voice) and **Notes** (camera, easing, blur, cursor, typing). This table is the "
          "motion spec the user approves before building.", "",
          "| Shot | Start | End | Frames | Length | Begins with | REF shows | Swap | Notes |", "|---|---|---|---|---|---|---|---|---|"]
    for i in range(len(edges) - 1):
        a, b = edges[i], edges[i + 1]
        md.append(f"| S{i + 1:02d} | {a / fps:.3f} s | {b / fps:.3f} s | f{a}-f{b - 1} | {(b - a) / fps:.2f} s | {STARTS.get(kind.get(a), '')} |  |  |  |")
    out_md = bd / "SHOTS.md"
    if out_md.exists(): out_md = bd / "SHOTS.auto.md"                   # SHOTS.md may hold the filled table: never overwritten
    out_md.write_text("\n".join(md) + "\n", encoding="utf-8")
    lst = lambda xs: ", ".join(f"{c / fps:.2f} s" for c in xs[:10]) + (" ..." if len(xs) > 10 else "")
    say(f"{n - f0} frames: {len(cuts)} cut(s)" + (f" ({lst(cuts)})" if cuts else "") + f", {len(fast)} fast change(s) (wipe / crossfade / fast move)"
        + (f" ({lst(fast)})" if fast else "") + f"; {len(edges) - 1} shot(s)")
    say(f"-> {rel(dst)} ({pages} sheet(s) every {step / fps:.2f} s, {strips} strip(s)); {rel(out_md)}; {rel(ref / (stem + '.shots.json'))}")
    if wav: say(f"   the reference's sound -> {rel(wav)} (analysis only): kit.py beats <film> {rel(wav)}")
    return dst
