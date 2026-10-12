"""Loudness and true peak (plan G6; fixes v1 bug #7: v1 audio.py capped the SAMPLE peak at -1 dBFS while the skill promised
-1 dBTP true peak, so inter-sample peaks could go over).

measure(wav)                       -> {I (LUFS), LRA (LU), TP (dBTP, true peak via 4x oversampling: ffmpeg ebur128 peak=true)}
normalize(wav, out, I=-14, TP=-1)  two-pass ffmpeg loudnorm with the measured values, linear gain when possible (Howseen audio_template.py:40-44),
                                   true-peak limited; writes 48 kHz 24-bit WAV and returns (before, after)
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
    """each sound effect of a built film against everything else playing then: K-weighted level of its first 60 ms (from 10 ms before its
    loudest point) over the bed (voice + music + the other effects) in the same window, in dB. The article's target: 3 to 6 dB over the bed
    (under 3 it is lost on a phone, over 6 it jumps out). -> [(id, start s, dB over the bed)]"""
    import numpy as np
    from scipy.signal import lfilter
    from audio.media import SR, clips, load, stems
    p = Path(project); cl = clips(p / "index.html")
    if total is None:
        m = re.search(r'data-duration="([\d.]+)"', (p / "index.html").read_text(encoding="utf-8"))
        total = float(m.group(1)) if m else max([c["start"] + c["dur"] for c in cl] + [0])
    fx = [c for c in cl if c["role"] == "sfx"]
    if not fx: return []
    st = stems(p, cl, total); full = st["voice"] + st["music"] + st["sfx"]
    kw = lambda x: lfilter(*_K[1], lfilter(*_K[0], x.mean(axis=1)))
    out = []
    for c in fx:
        x = load(p / c["src"], c["media_start"], c["dur"]) * np.float32(c["volume"])
        if not len(x): continue
        pk = int(np.abs(x).max(axis=1).argmax()); a = max(0, int(c["start"] * SR) + pk - int(0.010 * SR)); b = a + int(0.060 * SR)
        hit = np.zeros_like(full[a:b]); o = a - int(c["start"] * SR); seg = x[max(0, o):max(0, o) + (b - a)]; hit[:len(seg)] = seg
        bed = full[a:b] - hit
        e_hit, e_bed = float(np.mean(kw(hit) ** 2)), float(np.mean(kw(bed) ** 2))
        out.append((c["id"], round(c["start"] + pk / SR, 3), round(10 * np.log10((e_hit + 1e-12) / (e_bed + 1e-12)), 1)))
    return out


def normalize(wav, out, I=-14.0, TP=-1.0, LRA=11.0):
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
        print(f"before: {b}\nafter:  {a}  (target -14 LUFS, true peak <= -1 dBTP)")
    else:
        print(measure(src))
