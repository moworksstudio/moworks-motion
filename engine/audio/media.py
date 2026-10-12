"""Audio clips of a v2 film (film.json "audio", scene "voice" and "sfx", ctx.sfx cues of presets; written into index.html as
HyperFrames <audio> clips). The sound follows v1 Engine/audio.py (05/10/2026: the user chose v1's way for music and SFX):
music loops with a 3 s crossfade when shorter than the film, fades in over 0.15 s, ducks to 25 % while a voice speaks (attack 15 ms,
release 450 ms) and fades out over the film's last 1.8 s; the master is one gain to -14 LUFS with peaks under -1 dBFS, and the stems
voice + music + sfx add up to it exactly.

probe(path)                          -> (seconds, channels)
duration(path)                       -> seconds
load(path, start=0, dur=None)        -> float32 [n, 2] at 48 kHz (mono on both sides at full level, as After Effects and browsers play it)
bake_music(project, clip, voices, total, out)
                                     -> the clip's music as heard in the film (loop, fade in, ducking, tail fade), written to out
clips(index_html)                    -> [{id, src, start, dur, media_start, volume, role, fade_in, fade_out}] read back from the film
master(project, clips, total, out_dir=None)
                                     -> master gain in dB; with out_dir: mix.wav and stems/voice|music|sfx.wav (24-bit 48 kHz, frame 0)"""
import html, json, re, subprocess, wave
from pathlib import Path

import numpy as np

from audio.loudness import ffmpeg

SR = 48000
TAIL = 1.8


def probe(path):
    """(seconds, channels): WAV header, else ffmpeg's Duration and audio stream lines"""
    p = Path(path)
    if p.suffix.lower() == ".wav":
        try:
            with wave.open(str(p)) as w: return w.getnframes() / float(w.getframerate()), w.getnchannels()
        except wave.Error:
            pass                                           # e.g. float or extensible WAV: ask ffmpeg
    r = subprocess.run([ffmpeg(), "-hide_banner", "-i", str(p)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    m = re.search(r"Duration:\s*(\d+):(\d+):([\d.]+)", r.stderr)
    if not m: raise SystemExit(f"cannot read the length of {p}: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else 'no output'}")
    ch = 1 if re.search(r"Audio:.*\bmono\b", r.stderr) else 2
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]), ch


def duration(path):
    return probe(path)[0]


def load(path, start=0.0, dur=None):
    mono = probe(path)[1] == 1
    args = [ffmpeg(), "-v", "quiet", "-ss", f"{start:.4f}", "-i", str(path)] + (["-t", f"{dur:.4f}"] if dur else [])
    args += (["-af", "pan=stereo|c0=c0|c1=c0"] if mono else ["-ac", "2"]) + ["-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def write(path, x, bits=24):
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", f"pcm_s{bits}le", str(path)],
                   input=np.ascontiguousarray(x, np.float32).tobytes(), check=True)


def _place(buf, x, t):
    i0 = int(round(t * SR)); lo, hi = max(0, i0), min(len(buf), i0 + len(x))
    if hi > lo: buf[lo:hi] += x[lo - i0:hi - i0]


def bake_music(project, c, voices, total, out):
    """v1 music: from the clip's trim point, looped with a 3 s crossfade up to the film's end (loop false: once), 0.15 s fade in (or the
    clip's fade_in), ducked under the voices (duck false: not; "carve": dipped in the voice's bands instead, audio/carve.py, 11/10/2026),
    the film's last 1.8 s faded out (or the clip's fade_out)"""
    n = int(round(max(0.0, total - c["start"]) * SR))
    m = load(Path(project) / c["src"], c.get("trim", 0)); xf = int(3 * SR)
    if c.get("loop", True) and len(m) > 2 * xf:
        while len(m) < n + SR:
            a = np.linspace(0, 1, xf, dtype=np.float32)[:, None]; m = np.concatenate([m[:-xf], m[-xf:] * (1 - a) + m[:xf] * a, m[xf:]])
    x = np.zeros((n, 2), np.float32); k = min(n, len(m)); x[:k] = m[:k]
    fi = min(int(max(c.get("fade_in") or 0.15, 0.0) * SR), n)
    if fi: x[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)[:, None]
    carved = False
    if voices and (c.get("carve") or c.get("duck", True)):
        v = np.zeros((n, 2), np.float32)
        for vc in voices: _place(v, load(Path(project) / vc["src"], vc.get("trim", 0), vc["dur"]) * vc.get("volume", 1), vc["start"] - c["start"])
        if c.get("carve") and np.abs(v).max() > 1e-6:     # "carve": room for the voice in its own bands (HyperFrames' analysis, audio/carve.py)
            from audio.carve import carve
            y = carve(c, x, v, c.get("volume", 0.6), out)
            if y is not None: x, carved = y, True
    if voices and c.get("duck", True) and not carved:     # music down to 25 % while a voice speaks (50 ms RMS, attack 15 ms, release 450 ms)
        if np.abs(v).max() > 1e-6:
            kk = int(0.05 * SR); lvl = np.sqrt(np.convolve((v ** 2).mean(1), np.ones(kk) / kk, "same"))
            target = 1 - 0.75 * np.clip(lvl / 0.03, 0, 1); att, rel = np.exp(-1 / (0.015 * SR)), np.exp(-1 / (0.45 * SR))
            g = np.empty_like(target); y = 1.0
            for i, d in enumerate(target):
                y = d + (att if d < y else rel) * (y - d); g[i] = y
            x *= g[:, None].astype(np.float32)
    fo = int(min(c.get("fade_out") or TAIL, n / SR) * SR)
    if fo: x[n - fo:] *= (np.linspace(1, 0, fo, dtype=np.float32) ** 1.4)[:, None]
    write(out, x)
    return out


def clips(index_html):
    """the <audio> clips of a built film (attributes as kit.py build writes them, HyperFrames names)"""
    text = Path(index_html).read_text(encoding="utf-8")
    out = []
    for tag in re.findall(r"<audio\b[^>]*>", text):
        a = {k: html.unescape(v) for k, v in re.findall(r'([\w-]+)="([^"]*)"', tag)}
        if "src" not in a or "data-start" not in a: continue
        out.append({"id": a.get("id", ""), "src": a["src"], "start": float(a["data-start"]), "dur": float(a.get("data-duration", 0) or 0),
                    "media_start": float(a.get("data-media-start", 0) or 0), "volume": float(a.get("data-volume", 1) or 1),
                    "role": a.get("data-aimk-role") or a.get("data-timeline-role", ""), "fade_in": float(a.get("data-fade-in", 0) or 0),
                    "fade_out": float(a.get("data-fade-out", 0) or 0)})
    return out


def stems(project, cl, total):
    """{voice, music, sfx}: each role summed on the film's timeline (clip volume and fades applied), float32 [N, 2]"""
    N = int(round(total * SR)); out = {k: np.zeros((N, 2), np.float32) for k in ("voice", "music", "sfx")}
    for c in cl:
        x = load(Path(project) / c["src"], c["media_start"], c["dur"]) * np.float32(c["volume"]); n = len(x)
        m = min(n, int(c["fade_in"] * SR))
        if m: x[:m] *= np.linspace(0, 1, m, dtype=np.float32)[:, None]
        m = min(n, int(c["fade_out"] * SR))
        if m: x[n - m:] *= np.linspace(1, 0, m, dtype=np.float32)[:, None]
        _place(out[c["role"] if c["role"] in out else "sfx"], x, c["start"])
    return out


def master(project, cl, total, out_dir=None):
    """one gain for the whole mix: -14 LUFS, peaks under -1 dBFS (v1). Returns the gain in dB (0 when there is no sound)."""
    if not cl: return 0.0
    st = stems(project, cl, total); mix = st["voice"] + st["music"] + st["sfx"]
    if not np.abs(mix).max() > 1e-6: return 0.0
    tmp = Path(out_dir or Path(project) / "qa") / "_master_raw.wav"; write(tmp, mix)
    m = subprocess.run([ffmpeg(), "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    tmp.unlink(missing_ok=True)
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    g = min(10 ** ((-14 - float(j["input_i"])) / 20), 10 ** (-1 / 20) / (np.abs(mix).max() + 1e-9))
    if out_dir:
        d = Path(out_dir); write(d / "mix.wav", mix * g)
        for k, x in st.items():
            if np.abs(x).max() > 1e-6: write(d / "stems" / f"{k}.wav", x * g)
            else: (d / "stems" / f"{k}.wav").unlink(missing_ok=True)
    return round(float(20 * np.log10(g)), 2)
