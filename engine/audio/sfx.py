"""The kit's sound effects: recorded sounds, never synthesised (12/10/2026, the "sound pass" X article the user asked to follow: "don't
synthesize the music or the sound effects in code ... use the project's existing sound library first, like the one HyperFrames ships with").
The library is HyperFrames' bundled set as shipped (engine/vendor/hf-sfx: 19 sounds from Pixabay, Pixabay Content License, CREDITS.md,
CHECKSUMS.json sha256). A film gets each sound it uses decoded once into assets/sfx/<name>.wav (48 kHz stereo 16-bit): the player, mix.wav
and After Effects then start it on the same sample (an MP3's start delay differs between players); assets/sfx/sources.json says which
library file each WAV came from, so a film built before keeps nothing stale.

Names: the library's own (chime, click, click-soft, error, glitch-1..3, impact-bass-1/2, key-press, notification, ping, pop, riser, sparkle,
typing, whoosh, whoosh-short, whoosh-cinematic) and the kit's older names on top of them (swoosh, tick, tickhi, thump; impact, glitch).
The v1 sounds synthesised in code stay only as a fallback for the older names when the library is missing.

ensure(dst_dir, names)  writes <name>.wav for each name (again when its source changed)
peak(name)              seconds from the start of the sound to the moment that lands on the cue: its attack, or for a whoosh / riser the top of
                        its swell (manifest: "align so the swell peaks on the cut")
level(name)             the gain that puts the sound's hit (K-weighted, first 60 ms of its loudest part) at its kind's level, the same
                        measure `kit.py loudness` uses (a film's default gain 0.5 then sits about 3-6 dB over a voice / music bed)
duration_of(path)"""
import hashlib, json, subprocess, wave
from pathlib import Path

import numpy as np

SR = 48000
LIB = Path(__file__).resolve().parent.parent / "vendor" / "hf-sfx"
ALIAS = {"swoosh": "whoosh-short", "tick": "key-press", "tickhi": "click", "thump": "impact-bass-1", "impact": "impact-bass-1",
         "glitch": "glitch-1"}
PEAK_ALIGN = {"whoosh", "whoosh-short", "whoosh-cinematic", "riser"}         # by file name: the swell's top lands on the cue
# the hit level at gain 1 (dB, K-weighted, kit.py loudness's measure); the old synthesised sounds sat at: swoosh -22, pop -13, sparkle -12,
# tick -9, thump -5
TARGET = {"whoosh": -21, "whoosh-short": -21, "whoosh-cinematic": -20, "riser": -16, "pop": -13, "sparkle": -12, "click": -13,
          "click-soft": -16, "key-press": -14, "typing": -18, "ping": -13, "chime": -14, "notification": -14, "error": -14,
          "glitch-1": -12, "glitch-2": -12, "glitch-3": -14, "impact-bass-1": -6, "impact-bass-2": -6}


def _manifest():
    try: return json.loads((LIB / "manifest.json").read_text(encoding="utf-8"))
    except (OSError, ValueError): return {}


def source(name):
    """the library file a name plays, or None (then the synthesised v1 sound, older names only)"""
    key = ALIAS.get(name, name); e = _manifest().get(key)
    f = LIB / e["file"] if e else None
    return f if f and f.exists() else None


NAMES = sorted(set(_manifest()) | set(ALIAS))


# ---- the v1 sounds, synthesised (fallback only) -------------------------------------------------------------------------------------
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / d)


def mono(x):
    return np.stack([x, x], 1)


def swoosh(dur=0.55, seed=11):
    """white noise through a 0.6-octave band whose centre glides 260 -> 1500 -> 420 Hz, nothing above 5 kHz (no hiss), sin^2 envelope,
    equal-power pan left to right"""
    rng = np.random.default_rng(seed); n = int(dur * SR); win, hop = 2048, 256
    x = rng.standard_normal(n + win); out = np.zeros(n + win); norm = np.zeros(n + win); w = np.hanning(win); f = np.fft.rfftfreq(win, 1 / SR)
    for i0 in range(0, n, hop):
        p = i0 / n
        fc = 260 + 1240 * np.sin(np.pi * min(1, p / 0.55)) if p < 0.55 else 420 + 1080 * (1 - (p - 0.55) / 0.45) ** 2
        band = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / fc) / 0.6) ** 2) * (f < 5000)
        out[i0:i0 + win] += np.fft.irfft(np.fft.rfft(x[i0:i0 + win] * w) * band, win) * w; norm[i0:i0 + win] += w * w
    out = out[:n] / np.maximum(norm[:n], 1e-6); t = np.linspace(0, 1, n)
    s = out * np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 2 * np.clip((1 - t) / 0.1, 0, 1) ** 0.5; s /= np.abs(s).max() + 1e-9
    pan = t * np.pi / 2
    return np.stack([s * np.cos(pan), s * np.sin(pan)], 1)


def thump():
    n = int(0.5 * SR); t = np.arange(n) / SR
    return mono(np.sin(2 * np.pi * np.cumsum(95 * np.exp(-t * 6) + 45) / SR) * env(n, 0.004, 0.16))


def tick(freq=2300):
    n = int(0.06 * SR); t = np.arange(n) / SR
    return mono(np.sin(2 * np.pi * freq * t) * env(n, 0.0015, 0.012))


def pop():
    """a short round "bloop": a sine gliding 380 -> 920 Hz in 80 ms with a soft second harmonic"""
    n = int(0.12 * SR); t = np.arange(n) / SR; f = 380 + 540 * np.clip(t / 0.08, 0, 1) ** 0.6
    ph = 2 * np.pi * np.cumsum(f) / SR
    return mono((np.sin(ph) + 0.25 * np.sin(2 * ph)) * env(n, 0.003, 0.035))


def sparkle(seed=5):
    """five quick high chimes (2.6-5.2 kHz) over 0.3 s, each decaying, slightly spread left / right"""
    rng = np.random.default_rng(seed); n = int(0.45 * SR); out = np.zeros((n, 2))
    for k in range(5):
        i0 = int((0.06 * k + 0.01 * rng.random()) * SR); m = n - i0; t = np.arange(m) / SR; fr = 2600 + 2600 * rng.random()
        s = np.sin(2 * np.pi * fr * t) * env(m, 0.002, 0.07) * (0.9 ** k); pan = 0.25 + 0.5 * rng.random()
        out[i0:, 0] += s * np.cos(pan * np.pi / 2); out[i0:, 1] += s * np.sin(pan * np.pi / 2)
    return out


SYNTH = {"swoosh": swoosh, "whoosh": swoosh, "thump": thump, "tick": tick, "tickhi": lambda: tick(3100), "pop": pop, "sparkle": sparkle}
SYNTH_LEVEL = {"swoosh": 0.32, "whoosh": 0.32, "pop": 0.6, "sparkle": 0.5}
SYNTH_PEAK = {"thump", "tick", "tickhi"}
MAKERS = {n: None for n in NAMES} | SYNTH          # every name a film may use (build.py checks names against it)


# ---- the sounds as a film plays them ------------------------------------------------------------------------------------------------
_CACHE = {}


def _ffmpeg():
    from audio.media import ffmpeg
    return ffmpeg()


def sound(name):
    """float32 [n, 2] at 48 kHz: the library file decoded (no -ss: ffmpeg cannot seek inside the shortest MP3s), else the v1 sound"""
    if name in _CACHE: return _CACHE[name]
    f = source(name)
    if f:
        raw = subprocess.run([_ffmpeg(), "-v", "quiet", "-i", str(f), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        s = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        s *= np.float32(10 ** (-1 / 20) / (np.abs(s).max() + 1e-9))   # every file peaks at -1 dBFS: its gain stays <= 1 (the player's limit)
    elif name in SYNTH:
        s = SYNTH[name](); s = (s / (np.abs(s).max() + 1e-9)).astype(np.float32)
    else: raise KeyError(f"unknown sound effect {name}")
    _CACHE[name] = s
    return s


def _hit_db(x):
    from scipy.signal import lfilter
    from audio.loudness import _K
    pk = int(np.abs(x).max(axis=1).argmax()); a = max(0, pk - int(0.010 * SR)); seg = x[a:a + int(0.060 * SR)]
    k = lfilter(*_K[1], lfilter(*_K[0], seg.mean(axis=1)))
    return float(10 * np.log10(np.mean(k ** 2) + 1e-12))


def level(name):
    f = source(name)
    if not f: return SYNTH_LEVEL.get(name, 1.0)
    # at most 1: a browser plays an <audio> no louder than its file, and mix.wav must sound as the player does. A short transient (a key
    # press, a click) carries little energy in 60 ms for its peak, so it may stay under its kind's level: kit.py loudness says so per cue
    return float(min(1.0, 10 ** ((TARGET.get(f.stem, -13) - _hit_db(sound(name))) / 20)))


def peak(name):
    f = source(name); x = sound(name); a = np.abs(x).max(axis=1)
    if not f: return float(a.argmax()) / SR if name in SYNTH_PEAK else 0.0
    if f.stem in PEAK_ALIGN:                                        # the top of the swell, K-weighted over 50 ms (what is heard)
        from scipy.signal import lfilter
        from audio.loudness import _K
        k = lfilter(*_K[1], lfilter(*_K[0], x.mean(axis=1))); w = int(0.05 * SR)
        return float(np.convolve(k ** 2, np.ones(w) / w, "same").argmax()) / SR
    n = int(0.01 * SR); e = np.convolve(a, np.ones(n) / n, "same")   # the attack: where the sound first reaches 10 % of its loudest
    return float(np.argmax(e > 0.1 * e.max())) / SR


OVER_MUSIC, UNDER_VOICE = 4.0, 2.0      # dB: a hit sits this far over the music bed, and at least this far under a voice speaking then


def mix_volume(name, start, music, voice, gain=0.5, fallback=1.0):
    """the <audio> volume of a cue, measured, not guessed (12/10/2026, the "sound pass" X article: the voice is the loudest thing, the music
    drops under it, sound effects sit above the music): the sound's hit (K-weighted, 60 ms from 10 ms before its loudest point, the measure
    `kit.py loudness` checks) lands OVER_MUSIC dB over the music bed there and at least UNDER_VOICE dB under the voice around it. gain is
    an offset on that: 0.5 (the default) = the measured level, 1.0 = +6 dB, 0.25 = -6 dB. No music and no voice there: fallback (the kit's
    older way). At most 1 (a browser cannot play a file louder)."""
    from scipy.signal import lfilter
    from audio.loudness import _K
    x = sound(name); pk = int(np.abs(x).max(axis=1).argmax()); a0 = max(0, pk - int(0.010 * SR)); hit = x[a0:a0 + int(0.060 * SR)]
    e = lambda y: float(np.mean(lfilter(*_K[1], lfilter(*_K[0], y.mean(axis=1))) ** 2)) if len(y) else 0.0
    a = int(round(start * SR)) + a0; b = a + int(0.060 * SR)
    em = e(music[max(0, a):max(0, b)]) if music is not None else 0.0
    ev = e(voice[max(0, a - int(0.2 * SR)):max(0, b + int(0.2 * SR))]) if voice is not None else 0.0
    eh = e(hit)
    if eh <= 1e-12 or (em <= 1e-8 and ev <= 1e-8): return round(min(1.0, fallback), 4)
    want = em * 10 ** (OVER_MUSIC / 10) if em > 1e-8 else ev * 10 ** (-(UNDER_VOICE + 6) / 10)
    if ev > 1e-8: want = min(want, ev * 10 ** (-UNDER_VOICE / 10))
    return round(float(min(1.0, (want / eh) ** 0.5 * (max(gain, 0.0) / 0.5))), 4)


def duration_of(path):
    with wave.open(str(path)) as w: return w.getnframes() / float(w.getframerate())


def _tag(name):
    f = source(name)
    return f"{f.name} {hashlib.sha256(f.read_bytes()).hexdigest()[:16]}" if f else f"synth {name}"


def ensure(dst_dir, names=None):
    """<name>.wav for each name used (all known names when None); a WAV whose source changed (a film built with the v1 sounds) is
    written again"""
    d = Path(dst_dir); d.mkdir(parents=True, exist_ok=True)
    rec_f = d / "sources.json"
    try: rec = json.loads(rec_f.read_text(encoding="utf-8"))
    except (OSError, ValueError): rec = {}
    for name in sorted(set(names or NAMES)):
        if not (source(name) or name in SYNTH): continue
        f = d / f"{name}.wav"; tag = _tag(name)
        if f.exists() and rec.get(name) == tag: continue
        x = (np.clip(sound(name), -1, 1) * 32767).round().astype("<i2")
        with wave.open(str(f), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
        rec[name] = tag
    rec_f.write_text(json.dumps(rec, indent=1, sort_keys=True), encoding="utf-8")
    return d
