"""kit.py beats: the tempo grid of a song or music bed, on this machine with numpy / scipy (no librosa: the installer would have to download
numba; test film 07/10/2026 did it the same way: a fitted grid, 4 ms median error on a 135 BPM megamix).

  python kit.py beats <project> [<audio>] [--bpm 135] [--offset 0.19]
    <audio>: a file in the project (default: film.json "song", else the first file in audio/music/)
    -> audio/transcript/<file>.beats.json   (times in seconds from the start of the FILE, like <file>.words.json)
       { "bpm", "beat" (s), "eighth" (s), "phase" (first beat), "meter": 4, "downbeat_offset",
         "beats": [...], "downbeats": [...], "hits": [...] (the strongest accents: sound effects, cuts),
         "kicks": [...] (the kick drum's own hits, on the grid's heard-beat timing: a groove "on": "kick"),
         "onsets": [...] (every attack: syllables, notes), "grid_error_ms" (median distance of strong onsets to the eighth-note grid) }
    --bpm: force the tempo (the grid phase is still fitted); --offset: force the first beat too.
    --to-bpm N: first the track sped up / slowed down to N BPM, pitch kept (ffmpeg atempo) -> audio/music/<file>_<N>bpm.wav,
    then its grid (a royalty-free track fitted to a reference's tempo in a remake, workflow/remake.md; over 8 % the stretch
    is heard, so it stops there unless --force)

How: onset strength = positive spectral flux of a log spectrum (11.6 ms hops); tempo = autocorrelation peak (60-200 BPM, a mild preference
around 120), then tempo_check: that estimate, its half / double / 3/2 / 2/3 and the whole BPMs around them, the one whose eighth-note grid
the strong onsets sit nearest (08/10/2026); the grid phase is the one that collects the most onset strength; downbeats = the beat of four that
carries the most low-frequency (kick) attack. A song that changes tempo is fitted with its main tempo: check the printed BPM by ear."""
import json, subprocess
from pathlib import Path

SR, HOP, NFFT = 22050, 256, 2048


def decode(src, sr=SR):
    import numpy as np, imageio_ffmpeg
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "quiet", "-i", str(src), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def onset_envelopes(y):
    """(full-band flux, low-band flux) per hop, both normalised"""
    import numpy as np
    win = np.hanning(NFFT).astype(np.float32)
    y = np.concatenate([np.zeros(NFFT // 2, np.float32), y, np.zeros(NFFT // 2, np.float32)])   # frame i is centred on i * HOP
    n = 1 + max(0, (len(y) - NFFT) // HOP)
    frames = np.lib.stride_tricks.as_strided(y, shape=(n, NFFT), strides=(y.strides[0] * HOP, y.strides[0]))
    S = np.abs(np.fft.rfft(frames * win, axis=1)).astype(np.float32)
    L = np.log1p(100 * S)
    d = np.maximum(0, np.diff(L, axis=0, prepend=L[:1]))
    lowbin = int(150 / (SR / NFFT))
    P = S[:, 1:lowbin] ** 2                              # the low band in power, not log: a kick is loud there, a hi-hat is not
    full, low = d.sum(axis=1), np.maximum(0, np.diff(P, axis=0, prepend=P[:1])).sum(axis=1)

    def norm(e):
        k = int(0.4 * SR / HOP)                          # remove the slow trend (crescendos), keep the attacks
        trend = np.convolve(e, np.ones(k) / k, mode="same")
        e = np.maximum(0, e - trend)
        return e / (e.std() + 1e-9)
    return norm(full), norm(low)


LAG = 0.025          # the flux of a centred 93 ms window peaks about 25 ms before the attack (measured on click tracks, 07/10/2026)


def _interp(env, t):
    import numpy as np
    x = (np.asarray(t) - LAG) * SR / HOP
    i = np.clip(x.astype(int), 0, len(env) - 2); f = x - i
    return env[i] * (1 - f) + env[i + 1] * f


def _pool(env, t, w=0.04):
    """the strongest value of env within +-w s of each time (an attack slightly off the grid still counts)"""
    import numpy as np
    fps = SR / HOP; k = int(w * fps)
    x = ((np.asarray(t) - LAG) * fps).astype(int)
    return np.array([env[max(0, i - k):i + k + 1].max() if 0 <= i < len(env) else 0.0 for i in x])


def tempo(env):
    """the beat period from the autocorrelation of the onset envelope (60-200 BPM, log-normal preference around 120 BPM)"""
    import numpy as np
    e = env - env.mean()
    ac = np.correlate(e, e, mode="full")[len(e) - 1:]
    fps = SR / HOP
    lags = np.arange(int(fps * 60 / 200), int(fps * 60 / 60) + 1)
    bpm = 60 * fps / lags
    w = np.exp(-0.5 * (np.log2(bpm / 120) / 0.9) ** 2)
    score = ac[lags] * w
    k = int(np.argmax(score))
    if 0 < k < len(lags) - 1:                            # parabolic refinement
        a, b, c = score[k - 1], score[k], score[k + 1]; dk = 0.5 * (a - c) / (a - 2 * b + c + 1e-12)
    else: dk = 0.0
    return (lags[k] + dk) / fps


def fit_grid(env, period, dur, fix_phase=None, span=0.02):
    """period and phase of the constant grid (eighth notes = period / 2) that collect the most onset strength"""
    import numpy as np
    best = (-1, period, 0.0)
    for P in ([period] if span == 0 else np.linspace(period * (1 - span), period * (1 + span), 161)):
        g = P / 2
        phases = [fix_phase] if fix_phase is not None else np.arange(0, g, 0.002)
        for ph in phases:
            t = np.arange(ph, dur, g)
            s = _interp(env, t).mean()
            if s > best[0]: best = (s, P, ph)
    _, P, ph = best
    if fix_phase is None:                                # finer phase, 0.5 ms
        for q in np.arange(ph - 0.004, ph + 0.004, 0.0005):
            if q < 0: continue
            s = _interp(env, np.arange(q, dur, P / 2)).mean()
            if s > best[0]: best = (s, P, q)
    return best[1], best[2]


def peaks(env, thr, gap):
    """local maxima of env above thr, at least gap seconds apart (the stronger one wins) -> times"""
    import numpy as np
    fps = SR / HOP
    cand = [i for i in range(1, len(env) - 1) if env[i] >= thr and env[i] >= env[i - 1] and env[i] > env[i + 1]]
    cand.sort(key=lambda i: -env[i]); out = []
    for i in cand:
        if all(abs(i - j) > gap * fps for j in out): out.append(i)
    return sorted(round(i / fps + LAG, 3) for i in out)


PERC = 0.012         # the beat is heard about 12 ms after the kick's attack starts (the plain-prompt test's grid sat there; the user called
                     # its sync the best so far, 07/10/2026)


def kick_offset(y, ph, period, dur):
    """median time from the grid's beats to the kicks' attack starts, measured on the waveform itself (low band, zero-phase filter, 2 ms
    envelope): the spectral-flux grid sat about 30 ms before the heard beat on the A/B test song (attack +16 ms, peak +41 ms after the
    grid). None when fewer than 16 beats have a clear kick."""
    import numpy as np
    try: from scipy.signal import butter, sosfiltfilt
    except ImportError: return None, 0
    lo = np.abs(sosfiltfilt(butter(4, 150, "low", fs=SR, output="sos"), y.astype(np.float64)))
    k = max(1, int(SR * 0.002)); env = np.convolve(lo, np.ones(k) / k, "same"); top = env.max() or 1.0
    offs = []
    for t in np.arange(ph, dur, period):
        a, b = int((t - 0.09) * SR), int((t + 0.09) * SR)
        if a < 0 or b >= len(env): continue
        w = env[a:b]; pk = int(np.argmax(w)); peak = w[pk]
        if peak < 0.05 * top: continue
        j = pk
        while j > 0 and w[j] > 0.2 * peak: j -= 1
        offs.append((a + j) / SR - t)
    return (float(np.median(offs)), len(offs)) if len(offs) >= 16 else (None, len(offs))


def kicks(low, beats, period):
    """the kick drum's own hits (chat B's proposal 07/10/2026, done 08/10/2026: things bounce on the kicks you hear, not on every grid
    beat): peaks of the low-band flux at least about a sixteenth apart and at least 45 % as strong as the strong ones (the 90th percentile
    of all peaks: a bass note's leak into the low band stays under it; measured against the grid's beats instead, half of which had no
    kick on a test pattern, the threshold fell and every bass note counted), moved by the median gap between such peaks and their nearest
    beat (so a kick on the beat lands exactly on the grid's heard beat). A beat with no kick gets none; a syncopated kick stays."""
    import numpy as np
    if len(beats) < 8: return []
    pk = np.asarray(peaks(low, 0.3, 0.9 * period / 4))
    if not len(pk): return []
    h = _interp(low, pk)
    pk = pk[h >= 0.45 * np.percentile(h, 90)]
    b = np.asarray(beats); d = pk - b[np.abs(b[None, :] - pk[:, None]).argmin(axis=1)]
    on = np.abs(d) < 0.08
    off = float(np.median(d[on])) if on.sum() >= 8 else 0.0
    return [round(float(t - off), 4) for t in pk if t - off >= 0]


def tempo_check(strong, b0):
    """tempo candidates around the autocorrelation's b0: its half, double, 3/2 and 2/3 (the autocorrelation locked onto 75 and 100 BPM for a
    150 BPM track) and the whole BPMs +-3 around each; per candidate the phase that puts the strong onsets nearest its eighth-note grid.
    Test 3 (08/10/2026): the old fit said 152 BPM, 53 ms off; this check finds 150 BPM, 6 ms (what the chat found by ear). Whole BPMs win when
    they fit about as well (most music is made at one); a slower relative that fits nearly as well is the beat a person taps.
    -> (bpm, error ms, phase), the 6 best [[bpm, ms]]"""
    import numpy as np
    strong = np.asarray(strong, float)
    bases = [b for b in (b0, b0 * 2, b0 / 2, b0 * 1.5, b0 / 1.5) if 60 <= b <= 200]
    cands = {round(float(b), 2) for b in bases} | {float(k) for b in bases for k in range(int(round(b)) - 3, int(round(b)) + 4)}

    def err(bpm):
        g = 30.0 / bpm; ph = np.arange(0, g, 0.001)
        x = (strong[None, :] - ph[:, None]) / g; e = np.median(np.abs(x - np.round(x)), axis=1) * g
        k = int(np.argmin(e)); return float(e[k]) * 1000, float(ph[k])
    rows = sorted(((b,) + err(b) for b in cands if 40 <= b <= 220), key=lambda r: r[1])
    best = rows[0]
    for b in np.arange(best[0] - 0.5, best[0] + 0.51, 0.05):          # a fractional tempo, kept only when it fits clearly better
        r = (round(float(b), 2),) + err(float(b))
        if r[1] < best[1] * 0.9 - 0.5: best = r
    for r in rows:
        if (abs(r[0] * 2 - best[0]) < 0.6 or abs(r[0] * 1.5 - best[0]) < 0.6) and r[1] <= best[1] * 1.3 + 2: best = r; break
    return best, [[r[0], round(r[1], 1)] for r in rows[:6]]


LOW = 120            # Hz: under it only the kick (and the bass) remain (the "sound pass" article: plot the waveform below 120 Hz against the grid)


def _low(y):
    import numpy as np
    from scipy.signal import butter, sosfiltfilt
    return sosfiltfilt(butter(4, LOW, "low", fs=SR, output="sos"), y.astype(np.float64))


def kick_check(y, beats, period):
    """12/10/2026, the "sound pass" X article (the user: follow it): a beat tracker sometimes locks onto the off-beat (the article's grid was
    0.22 s off), caught only by looking at the waveform under 120 Hz against the grid. Share of beats with a kick attack within 40 ms, on the
    grid and on the grid moved half a beat -> (on grid, half a beat off), 0..1"""
    import numpy as np
    if len(beats) < 8: return None, None
    lo = np.abs(_low(y)); k = max(1, int(0.005 * SR)); e = np.convolve(lo, np.ones(k) / k, "same")
    att = np.maximum(0, np.diff(e, prepend=e[:1])); w = max(1, int(0.02 * SR)); att = np.convolve(att, np.ones(w), "same")
    thr = 0.3 * np.percentile(att, 99.5)

    def share(ts):
        hit = [att[max(0, int((t - 0.04) * SR)):int((t + 0.04) * SR)].max(initial=0) >= thr for t in ts if 0.05 < t < len(y) / SR - 0.05]
        return float(np.mean(hit)) if hit else 0.0
    b = np.asarray(beats, float)
    return round(share(b), 3), round(share(b + period / 2), 3)


def kick_picture(y, beats, downs, period, out, bars=4):
    """the waveform under 120 Hz with the grid (bar lines strong, beats thin, half beats dotted), three stretches of `bars` bars: after the
    first downbeat, the middle, three quarters in -> out (PNG). Kicks sitting on the thin lines = the grid is right; on the dotted ones = it
    is half a beat off"""
    import numpy as np
    from PIL import Image, ImageDraw
    lo = _low(y); dur = len(y) / SR; span = bars * 4 * period; W, H = 1600, 200
    starts = [downs[0] if downs else 0.0]
    for f in (0.5, 0.75):
        c = [t for t in downs if t >= dur * f - span / 2]
        if c and c[0] + span < dur and all(abs(c[0] - s) > span * 0.5 for s in starts): starts.append(c[0])
    img = Image.new("RGB", (W, H * len(starts)), (16, 16, 18)); d = ImageDraw.Draw(img); top = np.abs(lo).max() or 1.0
    for r, s0 in enumerate(starts):
        y0 = r * H; mid = y0 + H // 2 + 8; seg = lo[int(s0 * SR):int((s0 + span) * SR)]
        if not len(seg): continue
        cols = np.array_split(seg, W)
        for x, c in enumerate(cols):
            if len(c): d.line([(x, mid - int(c.max() / top * (H / 2 - 16))), (x, mid - int(c.min() / top * (H / 2 - 16)))], fill=(90, 160, 255))
        X = lambda t: int((t - s0) / span * W)
        for t in beats:
            if s0 <= t <= s0 + span: d.line([(X(t), y0 + 18), (X(t), y0 + H - 4)], fill=(255, 90, 90) if any(abs(t - q) < 1e-3 for q in downs) else (230, 200, 90), width=2 if any(abs(t - q) < 1e-3 for q in downs) else 1)
            h = t + period / 2
            if s0 <= h <= s0 + span:
                for yy in range(y0 + 18, y0 + H - 4, 8): d.point((X(h), yy), fill=(150, 150, 150))
        d.text((6, y0 + 3), f"{s0:.2f} - {s0 + span:.2f} s   under {LOW} Hz: kicks on the solid lines = grid right; on the dotted lines = half a beat off", fill=(220, 220, 220))
    Path(out).parent.mkdir(parents=True, exist_ok=True); img.save(out)
    return out


def analyse(src, bpm=None, offset=None):
    import numpy as np
    y = decode(src); dur = len(y) / SR
    full, low = onset_envelopes(y)
    period = 60.0 / bpm if bpm else tempo(full)
    if not bpm:                                          # the autocorrelation may lock onto half or double the beat: keep the one nearer 120
        while 60 / period > 180: period *= 2
        while 60 / period < 70: period /= 2
    check = None
    if not bpm:                                          # the tempo whose eighth-note grid the strong onsets sit nearest (Test 3, 08/10/2026)
        try:
            import librosa
            oe = librosa.onset.onset_strength(y=y.astype(np.float32), sr=SR, hop_length=HOP)
            on0 = librosa.onset.onset_detect(onset_envelope=oe, sr=SR, hop_length=HOP, backtrack=True, units="time")
        except ImportError:
            on0 = peaks(full, 0.6, 0.06)
        st0 = [t for t in on0 if _interp(full, [t])[0] > 2.0]
        if len(st0) >= 12:
            best, check = tempo_check(st0, 60 / period)
            period = 60.0 / best[0]
    period, ph = fit_grid(full, period, dur, fix_phase=offset, span=0 if bpm or check else 0.02)
    # the grid fitted eighth notes: the beat is on the stronger of the two eighth-note phases
    # the beat is the eighth-note phase where the kick (low band) lands; with no clear kick, the phase with more attack overall
    lo = [_pool(low, np.arange(q, dur, period)).mean() for q in (ph, ph + period / 2)]
    fu = [_pool(full, np.arange(q, dur, period)).mean() for q in (ph, ph + period / 2)]
    if offset is None and ((lo[1] > 1.5 * lo[0]) if max(lo) > 1.5 * min(lo) + 1e-6 else (fu[1] > fu[0])): ph += period / 2
    fix = 0.0
    if offset is None:                                   # the phase on the waveform: beats where the kick is heard (07/10/2026)
        ko, nk = kick_offset(y, ph, period, dur)
        if ko is not None and abs(ko + PERC) < period / 4: fix = ko + PERC
    ph0 = ph                                             # the onset-measured phase: the grid-fit tests below use it (onsets carry their own lag)
    ph += fix
    while ph - period >= -0.02: ph -= period
    ph = max(ph, 0.0) if ph > -0.02 else ph + period
    beats = [round(t, 4) for t in np.arange(ph, dur, period)]
    acc = [_pool(low, beats[o::4]).mean() + 0.3 * _pool(full, beats[o::4]).mean() for o in range(4)]
    o = int(np.argmax(acc)) if len(beats) >= 8 else 0
    downs = beats[o::4]
    on = peaks(full, 0.6, 0.06)
    method = "grid (numpy)"
    try:                                                  # librosa (installed 07/10/2026, user): sharper onsets (backtracked to the attack) and,
        import librosa                                    # when the constant grid fits badly (a tempo change), its dynamic beat tracker
        y22 = y.astype(np.float32)
        oenv = librosa.onset.onset_strength(y=y22, sr=SR, hop_length=HOP)
        on = [round(float(t), 3) for t in librosa.onset.onset_detect(onset_envelope=oenv, sr=SR, hop_length=HOP, backtrack=True, units="time")]
        method = "grid (numpy) + onsets (librosa)"
        strong0 = [t for t in on if _interp(full, [t])[0] > 2.0]
        g0 = period / 2
        err0 = float(np.median([abs((t - ph0) / g0 - round((t - ph0) / g0)) * g0 for t in strong0])) * 1000 if strong0 else 0.0
        if err0 > 25 and not bpm:                         # the song drifts off one tempo: follow librosa's beats instead of the grid
            _, bt = librosa.beat.beat_track(onset_envelope=oenv, sr=SR, hop_length=HOP, units="time")
            if len(bt) >= 8:
                beats = [round(float(t) + fix, 4) for t in bt]; acc = [_pool(low, beats[k::4]).mean() + 0.3 * _pool(full, beats[k::4]).mean() for k in range(4)]
                o = int(np.argmax(acc)); downs = beats[o::4]; period = float(np.median(np.diff(bt))); method = "beat tracker (librosa, tempo changes)"
    except ImportError:
        pass
    kc = None
    try:                                                  # the waveform check under 120 Hz: move the grid half a beat only on clear evidence
        on_g, off_g = kick_check(y, beats, period)
        kc = {"on_grid": on_g, "half_beat_off": off_g, "moved": False}
        if offset is None and on_g is not None and off_g >= 0.5 and off_g >= 1.5 * on_g:
            beats = [round(t + period / 2, 4) for t in beats if t + period / 2 < dur]
            acc = [_pool(low, beats[k::4]).mean() + 0.3 * _pool(full, beats[k::4]).mean() for k in range(4)]
            o = int(np.argmax(acc)) if len(beats) >= 8 else 0; downs = beats[o::4]; ph = beats[0] if beats else ph
            kc.update(moved=True, on_grid=off_g, half_beat_off=on_g)
    except ImportError:
        pass
    hits = peaks(np.maximum(full, 1.3 * low), np.percentile(full, 99.0), 0.25)
    strong = [t for t in on if _interp(full, [t])[0] > 2.0]
    g = period / 2
    err = float(np.median([abs((t - ph0) / g - round((t - ph0) / g)) * g for t in strong])) * 1000 if strong else None
    return {"duration": round(dur, 3), "bpm": round(60 / period, 3), "beat": round(period, 5), "eighth": round(period / 2, 5), "phase": round(ph, 4),
            "meter": 4, "downbeat_offset": o, "beats": beats, "downbeats": downs, "hits": hits, "kicks": kicks(low, beats, period), "onsets": on,
            "grid_error_ms": None if err is None else round(err, 1), "method": method,
            "phase_fix_ms": round(fix * 1000, 1), "tempo_check": check, "kick_check": kc}


def out_file(p, src):
    return Path(p) / "audio" / "transcript" / (Path(src).stem + ".beats.json")


def default_src(p, spec=None):
    if spec and spec.get("song"): return spec["song"]["src"]
    m = sorted((Path(p) / "audio" / "music").glob("*.*"))
    m = [x for x in m if x.suffix.lower() in (".wav", ".mp3", ".flac", ".m4a", ".aac", ".ogg")]
    if not m: raise SystemExit("no audio given and nothing in audio/music/")
    return m[0].relative_to(p).as_posix()


def run(p, src=None, bpm=None, offset=None, say=print):
    p = Path(p)
    spec = json.loads((p / "film.json").read_text(encoding="utf-8")) if (p / "film.json").exists() else None
    src = src or default_src(p, spec)
    from common import in_film
    f = in_film(p, src)
    if not f.exists(): raise SystemExit(f"no audio file {f}")
    r = analyse(f, bpm, offset)
    r["src"] = src
    out = out_file(p, f); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(r, indent=1), encoding="utf-8")
    say(f"{Path(src).name}: {r['bpm']} BPM (beat {r['beat']:.4f} s, eighth {r['eighth']:.4f} s), first beat {r['phase']:.3f} s, downbeat = beat "
        f"{r['downbeat_offset'] + 1} of 4, {len(r['beats'])} beats, {len(r['downbeats'])} bars, {len(r['hits'])} hits, {len(r['kicks'])} kicks, {len(r['onsets'])} onsets, "
        f"grid error {r['grid_error_ms']} ms (median, strong onsets)")
    if r.get("tempo_check"): say("  tempo check (median distance of strong onsets to each tempo's eighth notes): "
                                 + ", ".join(f"{b:g} BPM {e} ms" for b, e in r["tempo_check"][:4]))
    kc = r.get("kick_check") or {}
    if kc.get("on_grid") is not None:
        say(f"  kick check (waveform under {LOW} Hz): {kc['on_grid']:.0%} of the beats have a kick, {kc['half_beat_off']:.0%} half a beat off"
            + ("  -> the grid was moved half a beat" if kc.get("moved") else "  -> check the picture if these are close"))
    try:
        from common import renders
        pic = kick_picture(decode(f), r["beats"], r["downbeats"], r["beat"], renders(p, "stills") / "beats" / f"{f.stem}_kick.png")
        say(f"  kick picture: {pic}  (look at it: kicks on the solid lines)")
    except Exception as e:
        say(f"  kick picture: not drawn ({e})")
    say(f"-> {out.relative_to(p).as_posix()}   Listen: does {r['bpm']} BPM feel right? If not: --bpm <n> (and --offset <first beat s>).")
    return out

def fit_start(p, src=None, write=True, say=print):
    """12/10/2026, the "sound pass" X article: the big moves (cuts, sound effect cues) belong on the beat; "if you can't change the
    animation, move where the music starts". For the film's music clip (film.json "audio", role "music"): the "trim" (seconds skipped at the
    file's start) within half a beat of the current one that puts the built film's cuts and cues nearest the beats. Writes it into film.json
    (build again); a film cut to a song is built on the song's grid already and is left alone"""
    import numpy as np
    p = Path(p); fj = p / "film.json"
    spec = json.loads(fj.read_text(encoding="utf-8"))
    music = [a for a in spec.get("audio") or [] if a.get("role") == "music" and (not src or a.get("src") == src)]
    if not music: raise SystemExit("--fit: no music clip in film.json \"audio\" (role \"music\"); a film cut to a \"song\" is on its grid already")
    clip = music[0]
    from common import in_film
    bj = out_file(p, in_film(p, clip["src"]))
    if not bj.exists(): run(p, clip["src"], say=say)
    B = json.loads(bj.read_text(encoding="utf-8")); beats = np.asarray(B["beats"], float); period = B["beat"]
    from audio.loudness import cue_list, cut_times
    ev = np.asarray(sorted(set(cut_times(p)) | {t for t, _, _ in cue_list(p)}), float)
    if not len(ev): raise SystemExit("--fit: the built film has no cuts or sound effects to put on the beat (kit.py build first)")
    at, trim0 = float(clip.get("at", 0)), float(clip.get("trim", 0))

    def err(trim):
        film_beats = at + beats - trim
        return float(np.mean(np.min(np.abs(ev[:, None] - film_beats[None, :]), axis=1)))
    cands = [t for t in np.arange(trim0 - period / 2, trim0 + period / 2, 0.005) if t >= 0]
    best = min(cands, key=err)
    say(f"--fit {clip['src']}: {len(ev)} cuts / cues; mean distance to the nearest beat {err(trim0) * 1000:.0f} ms with \"trim\": {trim0:g}, "
        f"{err(best) * 1000:.0f} ms with \"trim\": {best:.3f}")
    if write and abs(best - trim0) > 0.004 and err(best) < err(trim0) - 0.005:
        clip["trim"] = round(float(best), 3); fj.write_text(json.dumps(spec, indent=1, ensure_ascii=False), encoding="utf-8")
        say("  film.json updated: build again, then listen at the cuts")
    else: say("  kept: the music already starts at its best place")
    return best


def stretch(p, src, to_bpm, bpm=None, force=False, say=print):
    """the track at to_bpm, pitch kept -> audio/music/<name>_<bpm>bpm.wav; its tempo from --bpm or its beats file"""
    import imageio_ffmpeg
    from common import in_film
    f = in_film(p, src)
    if not f.exists(): raise SystemExit(f"no audio file {f}")
    if not bpm:
        bj = out_file(p, f)
        if not bj.exists(): raise SystemExit(f"the track's tempo is unknown: run kit.py beats <film> {src} first, or add --bpm <its tempo>")
        bpm = json.loads(bj.read_text(encoding="utf-8"))["bpm"]
    r = to_bpm / bpm
    if abs(r - 1) > 0.08 and not force:
        raise SystemExit(f"{bpm:g} -> {to_bpm:g} BPM is a {abs(r - 1):.0%} change: over 8 % the stretch is heard. Pick a track nearer that tempo "
                         "(or half / double it), or add --force")
    out = Path(p) / "audio" / "music" / f"{f.stem}_{to_bpm:g}bpm.wav"; out.parent.mkdir(parents=True, exist_ok=True)
    res = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-y", "-i", str(f), "-filter:a", f"atempo={r:.6f}", "-ar", "48000", str(out)],
                         capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode: raise SystemExit(f"ffmpeg: {res.stderr[-300:]}")
    say(f"{f.name}: {bpm:g} -> {to_bpm:g} BPM (x{r:.4f}, pitch kept; every time in the track x{1 / r:.4f}) -> {out.relative_to(p).as_posix()}")
    say("  in film.json play it as an \"audio\" clip at 0 with \"trim\" = its drop time - the reference's drop time, so the drops land together")
    return out.relative_to(p).as_posix()
