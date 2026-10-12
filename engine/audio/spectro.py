"""kit.py spectro: a picture of the singing over time, so Claude can SEE where words start (07/10/2026 test: Whisper missed most of a
Vietnamese megamix; the test chat drew a vocal spectrum with the beat grid by hand and placed the words on it).

  python kit.py spectro <project> [<audio>] [--from 17 --to 26]
    -> 02_Assets/Stills/spectro/spectro_<from>-<to>.png: rows of 10 s; in each row the vocal band (100-4000 Hz, log frequency) of the song's
       harmonic part (drums taken out with librosa's harmonic / percussive split), the beat grid (bar lines strong, beats and eighths faint),
       the words of audio/transcript/<audio>.words.json at their times (green = heard, orange = placed / pinned), seconds under each row.
How to read it: a sung syllable is a bright stack of harmonics (parallel lines) starting at a vertical edge; a held note ("mớiiiii") is a long
horizontal band; an ad-lib under the synth is a fainter stack. A word label far from such an edge is probably misplaced."""
import json
from pathlib import Path

ROW = 10.0          # seconds per row
PPS = 160           # pixels per second
H = 300             # pixels of the spectrum per row
FMIN, FMAX = 100.0, 4000.0


def run(p, src=None, t_from=None, t_to=None, say=print):
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    import librosa
    from audio.beats import default_src, out_file as beats_file, analyse
    p = Path(p)
    spec = json.loads((p / "film.json").read_text(encoding="utf-8")) if (p / "film.json").exists() else None
    src = src or default_src(p, spec)
    from common import in_film
    f = in_film(p, src)
    y, sr = librosa.load(str(f), sr=22050, mono=True)
    D = len(y) / sr
    a = max(0.0, t_from or 0.0); b = min(D, t_to if t_to else D)
    if b <= a: raise SystemExit(f"spectro: nothing between {a} and {b} s (the song lasts {D:.1f} s)")
    seg = y[int(a * sr):int(b * sr)]
    hop = 256
    S = np.abs(librosa.stft(seg, n_fft=2048, hop_length=hop))
    Hm, _ = librosa.decompose.hpss(S, margin=2.0)            # the drums out: what is left is voice, synths, bass
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    rows_f = np.geomspace(FMIN, FMAX, H)                       # log frequency, low at the bottom
    idx = np.clip(np.searchsorted(freqs, rows_f), 0, len(freqs) - 1)
    M = librosa.amplitude_to_db(Hm[idx, :], ref=np.max)
    M = np.clip((M + 60) / 60, 0, 1)[::-1]                     # 60 dB range, high frequencies on top
    bt = json.loads(beats_file(p, f).read_text(encoding="utf-8")) if beats_file(p, f).exists() else analyse(f)
    wf = p / "audio" / "transcript" / (f.stem + ".words.json")
    words = json.loads(wf.read_text(encoding="utf-8")) if wf.exists() else []
    try: font = ImageFont.truetype("arial.ttf", 13); fsmall = ImageFont.truetype("arial.ttf", 11)
    except OSError: font = fsmall = ImageFont.load_default()
    nrow = int(np.ceil((b - a) / ROW)); W = int(ROW * PPS) + 60; RH = H + 70
    img = Image.new("RGB", (W, nrow * RH + 10), (16, 16, 20)); dr = ImageDraw.Draw(img)
    cols = M.shape[1]
    for r in range(nrow):
        r0 = a + r * ROW; r1 = min(b, r0 + ROW); y0 = 10 + r * RH
        c0, c1 = int((r0 - a) * sr / hop), min(cols, int((r1 - a) * sr / hop))
        if c1 <= c0: continue
        part = (M[:, c0:c1] * 255).astype("uint8")
        pic = Image.fromarray(part, "L").resize((int((r1 - r0) * PPS), H))
        pic = Image.merge("RGB", (pic, pic.point(lambda v: int(v * 0.85)), pic.point(lambda v: int(v * 0.55))))
        img.paste(pic, (50, y0))
        X = lambda t: 50 + int((t - r0) * PPS)
        e = bt.get("eighth") or 0
        if e:                                                  # eighth notes (faint)
            t = bt["beats"][0] if bt.get("beats") else 0.0
            while t > r0: t -= e
            while t <= r1:
                if t >= r0: dr.line([(X(t), y0), (X(t), y0 + H)], fill=(55, 55, 70))
                t += e
        for t in bt.get("beats") or []:
            if r0 <= t <= r1: dr.line([(X(t), y0), (X(t), y0 + H)], fill=(95, 95, 125))
        for t in bt.get("downbeats") or []:
            if r0 <= t <= r1: dr.line([(X(t), y0 - 4), (X(t), y0 + H + 4)], fill=(170, 170, 230), width=2)
        for s in range(int(np.ceil(r0)), int(r1) + 1):          # seconds
            dr.line([(X(s), y0 + H), (X(s), y0 + H + 6)], fill=(200, 200, 200)); dr.text((X(s) - 8, y0 + H + 8), f"{s}", fill=(200, 200, 200), font=fsmall)
        lane = 0
        for w in words:                                        # the aligned words: label + a tick at the start
            t = w.get("start")
            if t is None or not (r0 <= t <= r1): continue
            col = (90, 220, 120) if w.get("sure") == "heard" else (255, 170, 60)
            dr.line([(X(t), y0), (X(t), y0 + H)], fill=col)
            dr.text((X(t) + 2, y0 + H + 24 + 14 * (lane % 2)), w["text"], fill=col, font=font); lane += 1
        dr.text((4, y0 + 2), f"{r0:.0f}s", fill=(200, 200, 200), font=fsmall)
    from common import renders
    out = renders(p, "stills") / "spectro"; out.mkdir(parents=True, exist_ok=True)
    fn = out / f"spectro_{a:05.1f}-{b:05.1f}.png"; img.save(fn)
    say(f"spectro {a:.1f}-{b:.1f} s ({nrow} row(s) of {ROW:.0f} s; {len(words)} aligned words drawn) -> {fn}")
    return fn
