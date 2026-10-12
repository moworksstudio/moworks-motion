"""Loudness and true peak (plan G6; fixes v1 bug #7: v1 audio.py capped the SAMPLE peak at -1 dBFS while the skill promised
-1 dBTP true peak, so inter-sample peaks could go over).

measure(wav)                       -> {I (LUFS), LRA (LU), TP (dBTP, true peak via 4x oversampling: ffmpeg ebur128 peak=true)}
normalize(wav, out, I=-16, TP=-4)  two-pass ffmpeg loudnorm with the measured values, linear gain when possible (Howseen audio_template.py:40-44),
                                   true-peak limited; writes 48 kHz 24-bit WAV and returns (before, after)
measure_mono(path), latest_export(film), cut_times(film), cue_list(film), silent_cuts(film), cue_sheet(film, video, dir), listen_points(..)
                                   the "sound pass" checks (12/10/2026, an X article the user asked to follow): the exported MP4 and its
                                   mono fold-down measured, every cut with a sound, frames before / after each cue with the waveform, five
                                   moments for the user's headphones
python loudness.py <wav> [--fix out.wav]"""
import json, re, shutil, subprocess, sys
from pathlib import Path


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe: return exe
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def measure(wav, phone=True):
    """phone: also the loudness of the 200 Hz - 6 kHz band ("Motion Lab" article, 12/10/2026: phone speakers play nothing under ~150 Hz;
    a mix at -14 LUFS full band read -22.9 LUFS there, so the hits and the voice were weak on a phone)"""
    r = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", "-i", str(wav), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    s = r.stderr[r.stderr.rfind("Summary:"):]
    g = lambda pat, s=s: float(re.search(pat, s, re.S).group(1))
    out = {"I": g(r"I:\s+(-?[\d.]+) LUFS"), "LRA": g(r"LRA:\s+(-?[\d.]+) LU"), "TP": g(r"True peak:\s+Peak:\s+(-?[\d.inf]+) dBFS")}
    if phone:
        r = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", "-i", str(wav), "-af", "highpass=f=200:poles=2,lowpass=f=6000:poles=2,ebur128",
                            "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace")
        s2 = r.stderr[r.stderr.rfind("Summary:"):]
        try: out["phone"] = g(r"I:\s+(-?[\d.]+) LUFS", s2)
        except AttributeError: pass
    return out


# K-weighting of ITU-R BS.1770 at 48 kHz (high shelf, then high-pass): the ear's loudness curve the LUFS numbers use
_K = (([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]),
      ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]))


def hits(project, total=None):
    """each sound effect of a built film: K-weighted level of its first 60 ms (from 10 ms before its loudest point) over the MUSIC bed (music +
    the other effects) in the same window, and against the voice when one speaks then, in dB. Targets: 3 to 6 dB over the music (the "Motion
    Lab" article: under 3 it is lost on a phone, over 6 it jumps out) and never over the voice (the "sound pass" article: the voice is the
    loudest thing, sound effects sit above the music). -> [(id, start s, dB over the music, dB against the voice or None)]"""
    import numpy as np
    from scipy.signal import lfilter
    from audio.media import SR, clips, load, stems
    p = Path(project); cl = clips(p / "index.html")
    if total is None:
        m = re.search(r'data-duration="([\d.]+)"', (p / "index.html").read_text(encoding="utf-8"))
        total = float(m.group(1)) if m else max([c["start"] + c["dur"] for c in cl] + [0])
    fx = [c for c in cl if c["role"] == "sfx"]
    if not fx: return []
    st = stems(p, cl, total); music = st["music"] + st["sfx"]; voice = st["voice"]
    kw = lambda x: lfilter(*_K[1], lfilter(*_K[0], x.mean(axis=1)))
    e = lambda x: float(np.mean(kw(x) ** 2)) if len(x) else 0.0
    out = []
    for c in fx:
        x = load(p / c["src"], c["media_start"], c["dur"]) * np.float32(c["volume"])
        if not len(x): continue
        i0 = int(round(c["start"] * SR))                  # the sample stems() placed it on (int() put it one sample early: a sharp
        pk = int(np.abs(x).max(axis=1).argmax()); a = max(0, i0 + pk - int(0.010 * SR)); b = a + int(0.060 * SR)   # click then left a residue)
        hit = np.zeros_like(music[a:b]); o = a - i0; seg = x[max(0, o):max(0, o) + (b - a)]; hit[:len(seg)] = seg
        e_hit, e_bed, e_vo = e(hit), e(music[a:b] - hit), e(voice[max(0, a - int(0.2 * SR)):b + int(0.2 * SR)])   # the voice around it
        over = round(10 * np.log10((e_hit + 1e-12) / (e_bed + 1e-12)), 1)
        vs = round(10 * np.log10((e_hit + 1e-12) / e_vo), 1) if e_vo > 1e-7 else None
        out.append((c["id"], round(c["start"] + pk / SR, 3), over, vs))
    return out


def hit_verdict(over, vs):
    if vs is not None and vs > 0: return "over the voice: lower it"
    if over < 3: return "quiet: lost under the music"
    if over > 6 and vs is None: return "loud: jumps out"
    return "ok"


def loudest_source(project, mix_wav):
    """what makes the mix's highest peak (the thing to tame when the peaks hold the film under its loudness target): reads the stems
    master() wrote beside mix.wav -> (time s, "the voice" | "the music" | "<sound effect clip id>")"""
    import numpy as np
    from audio.media import SR, clips, load
    x = np.abs(load(mix_wav)).max(axis=1)
    if not len(x): return None
    i = int(x.argmax()); t = i / SR; d = Path(mix_wav).parent / "stems"; best = (0.0, None)
    for k in ("voice", "music", "sfx"):
        f = d / f"{k}.wav"
        if f.exists():
            s = load(f, max(0.0, t - 0.002), 0.004)
            v = float(np.abs(s).max()) if len(s) else 0.0
            if v > best[0]: best = (v, k)
    who = {"voice": "the voice", "music": "the music"}.get(best[1])
    if best[1] == "sfx":
        on = [c for c in clips(Path(project) / "index.html") if c["role"] == "sfx" and c["start"] <= t <= c["start"] + c["dur"]]
        who = on[-1]["id"] if on else "a sound effect"
    return round(t, 2), who or "the mix"


def measure_mono(path):
    """the mix folded to mono (L+R)/2, as a phone speaker plays it: {I, TP}. A big drop from the stereo loudness = sounds cancelling out"""
    r = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", "-i", str(path), "-af", "pan=mono|c0=0.5*c0+0.5*c1,ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    s = r.stderr[r.stderr.rfind("Summary:"):]
    g = lambda pat: float(re.search(pat, s, re.S).group(1))
    return {"I": g(r"I:\s+(-?[\d.]+) LUFS"), "TP": g(r"True peak:\s+Peak:\s+(-?[\d.inf]+) dBFS")}


def latest_export(project):
    """the newest exported MP4 of a film (else MOV): the file people hear, AAC included (the "sound pass" article: measure the exported MP4,
    not the WAV)"""
    from common import renders
    for kind, pat in (("mp4", "*.mp4"), ("mov", "*.mov")):
        try: fs = sorted(renders(project, kind).glob(pat), key=lambda f: f.stat().st_mtime)
        except OSError: fs = []
        if fs: return fs[-1]
    return None


def cut_times(project):
    """the film's scene starts after the first (its cuts and transitions), seconds"""
    t = (Path(project) / "index.html").read_text(encoding="utf-8")
    return sorted({round(float(m), 3) for m in re.findall(r'class="clip scene"[^>]*?data-start="([\d.]+)"', t) if float(m) > 0.05})


def cue_list(project):
    """[(time the picture hits, sound name, clip id)] of every sound effect, from the built film (build.py starts a sound one frame before
    its attack / swell lands)"""
    from audio import sfx as S
    from audio.media import clips
    out = []
    for c in clips(Path(project) / "index.html"):
        if c["role"] != "sfx": continue
        name = c["id"].split("_", 1)[1] if "_" in c["id"] else c["id"]
        try: t = c["start"] + S.peak(name) - 1 / 60
        except KeyError: t = c["start"]
        out.append((round(t, 3), name, c["id"]))
    return sorted(out)


def silent_cuts(project, tol=0.35):
    """cuts with no sound effect within tol s (the article: one ready-made sound for every cut and big move)"""
    cues = [t for t, _, _ in cue_list(project)]
    return [c for c in cut_times(project) if not any(abs(c - t) <= tol for t in cues)]


def cue_sheet(project, video, out_dir, per_page=8):
    """for every cue: the exported frame one frame before and one after it, and the export's waveform around it (+-0.6 s, the cue marked)
    -> out_dir/cues_<k>.png. Claude cannot hear: this is what it looks at before giving the user times to check with headphones"""
    import numpy as np
    from PIL import Image, ImageDraw
    from audio.media import load, SR
    cues = cue_list(project)
    if not cues: return []
    out_dir = Path(out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("cues_*.png"): old.unlink()
    x = load(video).mean(axis=1); W, H, FW = 1500, 150, 240
    pages = []

    def frame(t):
        r = subprocess.run([ffmpeg(), "-v", "quiet", "-ss", f"{max(0.0, t):.4f}", "-i", str(video), "-frames:v", "1", "-vf", f"scale={FW}:-2",
                            "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True)
        import io
        try: return Image.open(io.BytesIO(r.stdout)).convert("RGB")
        except Exception: return Image.new("RGB", (FW, FW * 9 // 16), (40, 40, 40))
    for k in range(0, len(cues), per_page):
        rows = cues[k:k + per_page]; page = Image.new("RGB", (W, H * len(rows)), (18, 18, 20)); d = ImageDraw.Draw(page)
        for i, (t, name, cid) in enumerate(rows):
            y0 = i * H
            for j, dt in enumerate((-1 / 60, 1 / 60)):
                f = frame(t + dt); f.thumbnail((FW, H - 24)); page.paste(f, (10 + j * (FW + 10), y0 + 20))
                d.text((10 + j * (FW + 10), y0 + 4), ("before " if j == 0 else "after ") + f"{t + dt:.2f} s", fill=(200, 200, 200))
            a, b = int((t - 0.6) * SR), int((t + 0.6) * SR); seg = x[max(0, a):max(0, b)]
            gx0, gw = 2 * FW + 40, W - 2 * FW - 60
            d.text((gx0, y0 + 4), f"{t:.3f} s  {name}  ({cid})", fill=(240, 200, 120))
            if len(seg):
                n = len(seg); cols = np.array_split(np.abs(seg), gw)
                amp = np.array([c.max() if len(c) else 0 for c in cols]); mid = y0 + 20 + (H - 30) // 2
                for xx, v in enumerate(amp):
                    h = int(v * (H - 30) / 2); d.line([(gx0 + xx, mid - h), (gx0 + xx, mid + h)], fill=(110, 170, 255))
                cx = gx0 + int(gw * (t - 0.6 - (a / SR)) / 1.2 + gw * 0.5) if a >= 0 else gx0 + int(gw * t / 1.2)
                d.line([(cx, y0 + 20), (cx, y0 + H - 8)], fill=(255, 90, 90), width=2)
        f = out_dir / f"cues_{k // per_page + 1:02d}.png"; page.save(f); pages.append(f)
    return pages


def listen_points(project, mix_wav, hits_list):
    """five moments for the user to check with headphones (the article: Claude cannot hear, so it never says the sound is good): the
    quietest and the loudest effect over its bed, the first voice entrance, the loudest stretch of the mix, the ending"""
    import numpy as np
    from audio.media import clips, load, SR
    pts = []
    if hits_list:
        lo = min(hits_list, key=lambda h: h[2]); hi = max(hits_list, key=lambda h: h[2])
        pts += [(lo[1], f"the quietest effect over the music ({lo[0]}, {lo[2]:+.1f} dB): is it heard?"),
                (hi[1], f"the loudest effect over the music ({hi[0]}, {hi[2]:+.1f} dB): does it jump out?")]
    vo = [c for c in clips(Path(project) / "index.html") if c["role"] == "voice"]
    if vo: pts.append((vo[0]["start"] + 0.3, "the first voice line over the music: is every word clear?"))
    x = np.abs(load(mix_wav)).max(axis=1)
    if len(x):
        w = int(0.4 * SR); e = np.convolve(x, np.ones(w) / w, "same"); pts.append((float(e.argmax()) / SR, "the loudest moment: any harshness or distortion?"))
        pts.append((max(0.0, len(x) / SR - 2.0), "the ending: does the sound end cleanly with the picture?"))
    pts += [(t, "a cut: does its sound land with the picture?") for t in cut_times(project)]      # fillers when the list is short
    out = []
    for t, why in pts:                                    # in priority order, half a second apart, five at most
        if len(out) < 5 and all(abs(t - u) > 0.5 for u, _ in out): out.append((round(t, 2), why))
    return sorted(out)


def normalize(wav, out, I=-16.0, TP=-4.0, LRA=11.0):
    before = measure(wav)
    r = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", "-i", str(wav), "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    m = json.loads(r.stderr[r.stderr.rfind("{"):r.stderr.rfind("}") + 1])
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=summary")
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([ffmpeg(), "-hide_banner", "-nostats", "-y", "-i", str(wav), "-af", af, "-ar", "48000", "-c:a", "pcm_s24le", str(out)],
                   capture_output=True, check=True)
    return before, measure(out)


if __name__ == "__main__":
    src = sys.argv[1]
    if "--fix" in sys.argv:
        b, a = normalize(src, sys.argv[sys.argv.index("--fix") + 1])
        print(f"before: {b}\nafter:  {a}  (target -16 LUFS, true peak <= -4 dBTP)")
    else:
        print(measure(src))
