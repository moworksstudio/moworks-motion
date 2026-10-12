"""The kit's own sound effects, synthesised in code (no licensed library needed), the same every build.
Port of v1 Engine/audio.py (sounds, levels, peak alignment; a v1 film, 3 Oct 2026); v1 is not changed.

Names: swoosh (soft band-pass sweep, left to right; "whoosh" is the same sound), pop (cute pop), sparkle (lights), tick, tickhi
(counters), thump (a number lands).
ensure(dst_dir)   writes <name>.wav (48 kHz stereo 16-bit, peak at full scale) for every name that is missing
LEVEL[name]       v1's mix level of the sound (swooshes sit about 16 dB under voice / music at gain 0.5)
peak(name)        seconds from the start of the sound to its loudest point: PEAK_ALIGN sounds land with that point on the cue"""
import wave
from pathlib import Path

import numpy as np

SR = 48000
PEAK_ALIGN = {"thump", "tick", "tickhi"}
LEVEL = {"swoosh": 0.32, "whoosh": 0.32, "pop": 0.6, "sparkle": 0.5}


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


MAKERS = {"swoosh": swoosh, "whoosh": swoosh, "thump": thump, "tick": tick, "tickhi": lambda: tick(3100), "pop": pop, "sparkle": sparkle}
NAMES = sorted(MAKERS)


def sound(name):
    s = MAKERS[name](); return s / (np.abs(s).max() + 1e-9)


def peak(name):
    return float(np.abs(sound(name)).sum(1).argmax()) / SR if name in PEAK_ALIGN else 0.0


def duration_of(path):
    with wave.open(str(path)) as w: return w.getnframes() / float(w.getframerate())


def ensure(dst_dir):
    d = Path(dst_dir); d.mkdir(parents=True, exist_ok=True)
    for name in NAMES:
        f = d / f"{name}.wav"
        if f.exists(): continue
        x = (np.clip(sound(name), -1, 1) * 32767).round().astype("<i2")
        with wave.open(str(f), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
    return d
