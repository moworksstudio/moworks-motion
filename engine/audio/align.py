"""kit.py align: known lyrics -> a time for every sung word (test film 07/10/2026: Whisper alone heard about 60 % of a Vietnamese megamix and
invented "Hãy subscribe cho kênh..." on the rest; the lyrics were known, only their times were missing).

  python kit.py align <project> <lyrics.txt|.md> [<audio>] [--lang vi]
    <lyrics>: one sung line per line, repeats written out ("Đi đi đi đi nào"); blank lines, "#" headings and list marks are skipped;
              UTF-8 or UTF-16 (a file the user saved in Word / Notepad)
    <audio>:  default film.json "song", else the first file in audio/music/
    -> audio/transcript/<audio>.words.json  [{"text", "start", "end", "line", "sure": "heard" | "placed"}]  (seconds in the FILE)
       audio/transcript/<audio>.srt
       01_Brief/LYRICS-TIMED.md   a table per line for the user to check by ear (written as LYRICS-TIMED.new.md if theirs is open)

How (nothing leaves the machine):
  1. local Whisper (engine/models/faster-whisper-small) with word times, the lyrics as its prompt, no voice filter (singing is not speech);
  2. the heard words are matched to the lyric words in order (dynamic programming on the words without tone marks, so "mua" = "múa");
     a matched lyric word takes the heard time ("heard");
  3. words in between ("placed") get the attacks (onsets of kit.py beats) inside the gap, spread evenly, else equal slices of the gap.
  Then listen in the player and fix the odd ones in words.json (keep the format): the user's ear wins (test round 6: "Shape" moved 0.28 s).
  --pin "8=17.58; 12=33.32": line starts heard by ear; the words around them follow (lines tapped in the player's lyric mode,
  notes/lyric-taps.json, are used the same way when no --pin is given).
  --snap 8 | 16: word starts on the nearest eighth / sixteenth of the song's grid (off by default: measured on the A/B song, snapping a raw
  draft pushed words late; use it once the line starts are tapped or pinned); heard words first move --lag 0.08 s earlier (Whisper's lag).
  Sections (07/10/2026 test: the whole-song pass heard 39/101 words and put lines 11-19 twenty seconds early): rough start times per part
  of the song, as a brief's script table gives them, either in the lyrics file ("[17.5] Ta cùng nhau bước tới" before a line, or
  [0:17.5]) or --sections "1=0; 8=17.5; 11=29.6" (line = seconds). Each section is then heard alone in its window (from 1 s before its start
  to 1 s after the next one starts) with only its own lines as Whisper's prompt, matched alone, and its unheard words are placed inside it.
08/10/2026 (a test song: one word sung 8 times over a held synth, 0/11 heard): unheard words are placed inside their part (not the wider window
used to hear it), voice activity that misses most of a gap is ignored, a run of the same word goes on consecutive beats, and words Whisper
gave from its prompt where nothing is sung are dropped. On that song the repeated words now land
on the beats a hand check had chosen. What Whisper heard is cached (%USERPROFILE%\\.aimotionkit\\cache\\align): a second run with --pin or the
player's taps takes about a second instead of 3 minutes per minute of song.
Measured 07/10/2026 on the test song (Vietnamese megamix, 97 words, against the times the test chat set by hand), with librosa onsets:
automatic 40/97 words within 0.25 s, 51/97 within 0.5 s, median 0.32 s (0.72 s with the numpy onsets); with 5 line starts pinned 55/97
within 0.25 s, 67/97 within 0.5 s, median 0.22 s. A DRAFT: say so, and let the user check by ear."""
import json, re, unicodedata
from pathlib import Path


def read_text(f):
    """UTF-8 / UTF-8 BOM / UTF-16 (BOM) text"""
    b = Path(f).read_bytes()
    if b[:2] in (b"\xff\xfe", b"\xfe\xff"): return b.decode("utf-16")
    try: return b.decode("utf-8-sig")
    except UnicodeDecodeError: return b.decode("cp1258", errors="replace")


MARK = re.compile(r"^\[(?:(\d+):)?(\d+(?:[.,]\d+)?)\]\s*")


def section_marks(text):
    """{line number: seconds} from "[17.5] ..." / "[0:17.5] ..." at the start of lyric lines (counted as lyric_lines counts them)"""
    out, n = {}, 0
    for raw in text.splitlines():
        s = raw.strip(); m = MARK.match(s)
        if m: s = s[m.end():]
        if lyric_lines(s): n += 1
        if m and lyric_lines(s): out[n] = round(int(m.group(1) or 0) * 60 + float(m.group(2).replace(",", ".")), 3)
    return out


def lyric_lines(text):
    out = []
    for raw in text.splitlines():
        s = MARK.sub("", raw.strip())
        if not s or s.startswith("#") or set(s) <= set("-|: "): continue
        if s.startswith("|"):                                # a markdown table row: the widest cell
            cells = [c.strip() for c in s.strip("|").split("|")]; s = max(cells, key=len)
        s = re.sub(r"^(?:[-*•]\s+|\d+[.)]\s+)", "", s)
        words = [w for w in s.split() if re.search(r"\w", w)]
        if words: out.append(words)
    return out


def key(w):
    """lower case, no tone marks or punctuation: Whisper often drops or swaps Vietnamese tones on sung words"""
    w = unicodedata.normalize("NFD", w.lower().replace("đ", "d"))
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def _sim(a, b):
    if a == b: return 2.0
    if not a or not b: return -1.0
    from difflib import SequenceMatcher
    r = SequenceMatcher(None, a, b).ratio()
    return 1.0 if r >= 0.75 else -1.0


def match(L, R):
    """global alignment (Needleman-Wunsch) of lyric keys L and heard keys R -> {lyric index: heard index}"""
    n, m, G = len(L), len(R), -0.6
    S = [[0.0] * (m + 1) for _ in range(n + 1)]; T = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): S[i][0] = i * G; T[i][0] = 1
    for j in range(1, m + 1): S[0][j] = j * G; T[0][j] = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            opts = (S[i - 1][j - 1] + _sim(L[i - 1], R[j - 1]), S[i - 1][j] + G, S[i][j - 1] + G)
            k = max(range(3), key=lambda x: opts[x]); S[i][j] = opts[k]; T[i][j] = k
    pairs, i, j = {}, n, m
    while i > 0 or j > 0:
        k = T[i][j] if i > 0 and j > 0 else (1 if i > 0 else 2)
        if k == 0:
            if _sim(L[i - 1], R[j - 1]) > 0: pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif k == 1: i -= 1
        else: j -= 1
    return pairs


def anchors(words, H):
    """which heard word times which lyric word: the global match (order kept), then per line only the largest group of matches that sit within
    3 s of each other (a line is sung in one go; a stray "Shape" heard in another verse is dropped), a lone match only on a line of 1-2 words,
    then in time order and not faster than about 8 words a second (measured 07/10/2026 on the test song: line-only matching was worse)"""
    pairs = match([key(w["text"]) for w in words], [key(h["text"]) for h in H])
    byline = {}
    for i, j in sorted(pairs.items()): byline.setdefault(words[i]["line"], []).append((i, j))
    nline = {}
    for w in words: nline[w["line"]] = nline.get(w["line"], 0) + 1
    good = []
    for ln, ps in byline.items():
        groups = []
        for i, j in sorted(ps, key=lambda x: H[x[1]]["start"]):
            if groups and H[j]["start"] - H[groups[-1][0][1]]["start"] <= 3.0: groups[-1].append((i, j))
            else: groups.append([(i, j)])
        g = max(groups, key=len)
        if len(g) >= 2 or nline[ln] <= 2: good += g
    keep = []
    for i, j in sorted(good):
        if keep and (H[j]["start"] <= H[keep[-1][1]]["start"] or H[j]["start"] - H[keep[-1][1]]["start"] < 0.12 * (i - keep[-1][0])): continue
        keep.append((i, j))
    return keep


def heard(src, prompt, lang, eighth=0.25, window=None, y=None):
    """every word local Whisper hears, from two passes (one sung line often comes out only in one): the whole song with its voice filter,
    then 8 s windows (4 s apart) without it. Words under 0.25 probability are dropped; the same word twice within 0.15 s is kept once.
    Also returns the sung regions (Silero voice activity on the mix, which finds singing well enough to place unheard lines).
    window (a, b): only that part of the song (a section), times still in the file's seconds; y: the decoded song (decoded once)."""
    import hashlib
    from common import LOCAL
    st = Path(src).stat()                                # what was heard is kept: a second run (pins, taps, a fix) does not listen again
    ck = hashlib.sha1(json.dumps([str(Path(src).resolve()), st.st_size, int(st.st_mtime), prompt, lang, window, 2]).encode()).hexdigest()[:16]
    cf = LOCAL / "cache" / "align" / f"{ck}.json"
    if cf.exists():
        c = json.loads(cf.read_text(encoding="utf-8")); return c["words"], c["lang"], [tuple(v) for v in c["vad"]]
    from audio.transcribe import decode, model
    from faster_whisper.vad import VadOptions, get_speech_timestamps
    sr = 16000; y = decode(src) if y is None else y; M = model(); out = []
    off0 = 0.0
    if window:
        a0, b0 = max(0, int(window[0] * sr)), min(len(y), int(window[1] * sr)); y = y[a0:b0]; off0 = a0 / sr

    def take(segs, off):
        for s in segs:
            for w in s.words or []:
                t = w.word.strip()
                if t and (w.probability or 0) >= 0.25: out.append({"text": t, "start": round(off0 + off + w.start, 3), "end": round(off0 + off + w.end, 3),
                                                                   "prompted": bool(prompt and window)})
    segs, info = M.transcribe(y, word_timestamps=True, language=lang or None, vad_filter=True, beam_size=5, condition_on_previous_text=False,
                              initial_prompt=(prompt or None) if window else None)
    take(segs, 0.0)
    W, H = 8 * sr, 4 * sr
    for a in range(0, max(1, len(y) - H), H):
        segs, _ = M.transcribe(y[a:a + W], word_timestamps=True, language=info.language, vad_filter=False, beam_size=5, condition_on_previous_text=False,
                               initial_prompt=(prompt or None) if window else None)
        take(segs, a / sr)
    out.sort(key=lambda w: w["start"]); ded = []
    for w in out:
        if ded and key(ded[-1]["text"]) == key(w["text"]) and abs(ded[-1]["start"] - w["start"]) < 0.15: continue
        ded.append(w)
    vad = [(off0 + r["start"] / sr, off0 + r["end"] / sr) for r in get_speech_timestamps(y, VadOptions(min_silence_duration_ms=300, speech_pad_ms=120))]
    cf.parent.mkdir(parents=True, exist_ok=True); cf.write_text(json.dumps({"words": ded, "lang": info.language, "vad": vad}), encoding="utf-8")
    return ded, info.language, vad


def echo_filter(H, onsets, vad):
    """words from a pass that had the lyrics as Whisper's prompt are kept only where something is sung: an attack within 0.15 s or voice
    activity (Test 1, 08/10/2026: with the prompt, Whisper "heard" lyric words over an instrumental). -> (kept, dropped count)"""
    import bisect
    ons = sorted(onsets); keep = []
    for h in H:
        if h.get("prompted"):
            k = bisect.bisect_left(ons, h["start"] - 0.15)
            near = k < len(ons) and ons[k] <= h["start"] + 0.15
            sung = any(x - 0.1 <= h["start"] <= y + 0.1 for x, y in vad)
            if not (near or sung): continue
        keep.append(h)
    return keep, len(H) - len(keep)


def place(words, onsets, dur, eighth, vad, t0=0.0, beats=None):
    """times for the words not heard, gap by gap between heard words: the gap's sung time (voice activity) is shared by its lines in order,
    in proportion to their word counts; inside its share a line is sung on consecutive attacks, at most an eighth note apart, from the share's
    first attack (lyrics sit on the grid; a line is never stretched over an instrumental).
    A test song (08/10/2026, one word x8 sung over a held synth, 0/11 heard): voice activity found singing only in the last second of the part and all
    11 words were crammed 53 ms apart there. Now voice activity that covers under a third of the gap is ignored (the whole gap is used), a run
    of the same word (3 or more: "la la la...") goes on consecutive beats (eighths when beats do not fit) from the first beat
    of its share, and the line after it starts on the next beat (where a hand placement would put them)."""
    n = len(words); i = 0; T0 = t0                      # t0 is reused for each line's share below: the part's start is T0
    while i < n:
        if words[i].get("start") is not None: i += 1; continue
        j = i
        while j < n and words[j].get("start") is None: j += 1
        a = words[i - 1]["end"] if i > 0 else T0
        b = words[j]["start"] if j < n else dur
        span = [(max(a, x), min(b, y)) for x, y in vad if min(b, y) - max(a, x) > 0.1]
        if not span or sum(y - x for x, y in span) < (b - a) / 3: span = [(a, max(b, a + 0.05))]   # singing over a synth: voice activity misses it
        tot = sum(y - x for x, y in span)
        groups = []                                          # runs of the same line
        for k in range(i, j):
            if groups and words[groups[-1][-1]]["line"] == words[k]["line"]: groups[-1].append(k)
            else: groups.append([k])
        per = tot / (j - i); acc = 0.0; chain = None
        for g in groups:
            share0, share1 = acc, acc + per * len(g); acc = share1

            def at(q):                                       # position q on the concatenated sung time -> film time
                for x, y in span:
                    if q <= y - x: return x + q
                    q -= y - x
                return span[-1][1]
            t0, t1 = at(share0), at(share1)
            if chain is not None: t0 = min(t0, chain); chain = None
            prev = words[g[0] - 1]["start"] + 0.12 if g[0] > 0 and words[g[0] - 1].get("start") is not None else t0
            t0 = max(t0, prev)
            run = 1
            while run < len(g) and key(words[g[run]]["text"]) == key(words[g[0]]["text"]): run += 1
            if run >= 3 and beats:                           # a repeated word: one per beat (or eighth), from the share's first beat
                limit = b - 0.05
                step = next((s for s in (beats[1] - beats[0] if len(beats) > 1 else 2 * eighth, eighth, eighth / 2)
                             if t0 + s * (run - 1) <= max(limit, t1)), eighth / 2)
                grid = [beats[0] + k * step for k in range(int((dur - beats[0]) / step) + 2)]
                g0 = next((x for x in grid if x >= t0 - 0.06), t0)
                for q in range(run): words[g[q]].update(start=round(g0 + q * step, 3), sure="placed")
                t = g0 + run * step
                g_rest = g[run:]
                if not g_rest: chain = t                     # the next line starts on the next step
            else:
                ons = [t for t in onsets if t0 - 0.02 <= t <= max(t1, t0 + 0.3)]
                t = max(ons[0], prev) if ons else t0
                g_rest = g
            for k in g_rest:
                words[k].update(start=round(t, 3), sure="placed")
                nxt = [o for o in onsets if t + 0.12 <= o <= t + eighth * 1.6]
                t = nxt[0] if nxt else t + min(eighth, max(0.12, (t1 - t0) / len(g)))
            for q, k in enumerate(g):
                e = words[g[q + 1]]["start"] if q + 1 < len(g) else min(b, words[k]["start"] + eighth * 2)
                words[k]["end"] = round(max(words[k]["start"] + 0.05, e), 3)
        i = j
    return repair(words, dur, T0)


def repair(words, dur, t0=0.0):
    """placed words that ran past the next fixed word (heard or pinned): spread evenly between their fixed neighbours"""
    n = len(words); i = 0
    while i < n:
        if words[i]["sure"] != "placed": i += 1; continue
        j = i
        while j < n and words[j]["sure"] == "placed": j += 1
        a = words[i - 1]["start"] if i > 0 else t0
        b = words[j]["start"] if j < n else dur
        ts = [words[k]["start"] for k in range(i, j)]
        if any(t <= a for t in ts) or any(t >= b for t in ts) or any(ts[k] >= ts[k + 1] for k in range(len(ts) - 1)):
            for q, k in enumerate(range(i, j)): words[k]["start"] = round(a + (b - a) * (q + 1) / (j - i + 1), 3)
        i = j
    for k in range(n): words[k]["end"] = round(min(words[k]["end"], words[k + 1]["start"]) if k + 1 < n else words[k]["end"], 3)
    for w in words: w["end"] = max(w["end"], round(w["start"] + 0.05, 3))
    return words


WHISPER_LAG = 0.08   # Whisper's word starts land about 80 ms after the sung attack (the plain-prompt test measured it on the A/B song)


def postprocess(words, beats, snap=None, lag=WHISPER_LAG):
    """heard words moved earlier by Whisper's lag; then, with snap 8 / 16, every word but the user's pins to the nearest eighth / sixteenth
    of the song's grid (lyrics sit on the grid: the plain-prompt test snapped to eighths and its sync was called the best so far,
    07/10/2026), kept in order: a word never lands on the step of the one before"""
    for w in words:
        if w.get("sure") == "heard" and lag: w["start"] = round(max(0.0, w["start"] - lag), 3)
    if snap in (8, 16) and beats.get("beat"):
        step = beats["beat"] / (2 if snap == 8 else 4)
        g0 = beats["beats"][0] if beats.get("beats") else beats.get("phase", 0.0)
        prev = -1e9
        for w in words:
            if w.get("sure") == "pinned": prev = w["start"]; continue
            t = g0 + round((w["start"] - g0) / step) * step
            if t <= prev + 1e-6: t = prev + step
            w["start"] = round(t, 3); prev = t
    for k, w in enumerate(words):
        nxt = words[k + 1]["start"] if k + 1 < len(words) else None
        w["end"] = round(max(w["start"] + 0.05, min(w.get("end") or w["start"] + 0.2, nxt) if nxt is not None else (w.get("end") or w["start"] + 0.2)), 3)
    return words


def run(p, lyrics, src=None, lang=None, say=print, pins=None, sections=None, snap="auto", lag=WHISPER_LAG):
    from audio.beats import analyse, default_src, out_file as beats_file
    from audio.transcribe import pages, srt
    p = Path(p)
    spec = json.loads((p / "film.json").read_text(encoding="utf-8")) if (p / "film.json").exists() else None
    src = src or default_src(p, spec)
    from common import in_film
    f = in_film(p, src)
    lf = in_film(p, lyrics)
    text = read_text(lf); lines = lyric_lines(text)
    if not lines: raise SystemExit(f"no lyric lines in {lf}")
    sections = dict(sections or section_marks(text))
    if sections and 1 not in sections: sections[1] = 0.0
    words = [{"text": w, "line": li + 1} for li, ws in enumerate(lines) for w in ws]
    say(f"{len(lines)} lines, {len(words)} words; listening (local Whisper, two passes: about 3 min per minute of song)...")
    bf = beats_file(p, f)
    b = json.loads(bf.read_text(encoding="utf-8")) if bf.exists() else analyse(f)
    for w in words: w["start"] = None
    if sections:                                          # each section alone: its window, its lines as the prompt, its words matched alone
        from audio.transcribe import decode
        y = decode(f); D = b["duration"]; marks = sorted(sections.items())
        if any(ln > len(lines) for ln, _ in marks): raise SystemExit(f"sections: the lyrics have {len(lines)} lines")
        say(f"  {len(marks)} sections: " + ", ".join(f"line {ln} ~{t:.1f} s" for ln, t in marks))
        H, vad, got, win = [], [], lang, []
        for k, (ln, t) in enumerate(marks):
            ln2 = marks[k + 1][0] if k + 1 < len(marks) else len(lines) + 1
            a, bb = max(0.0, t - 1.0), min(D, (marks[k + 1][1] + 1.0) if k + 1 < len(marks) else D)
            sub = [w for w in words if ln <= w["line"] < ln2]
            Hk, got, vk = heard(f, " ".join(" ".join(lines[i - 1]) for i in range(ln, ln2)), lang, b["eighth"], (a, bb), y)
            Hk = [h for h in Hk if a <= h["start"] <= bb]
            Hk, nd = echo_filter(Hk, b["onsets"], vk)
            if nd: say(f"  lines {ln}-{ln2 - 1}: {nd} word(s) Whisper gave where nothing is sung (taken from the prompt?): not used")
            for i, j in anchors(sub, Hk): sub[i].update(start=Hk[j]["start"], end=Hk[j]["end"], sure="heard")
            # unheard words are placed inside the part itself (from just before its rough start to the next part's start), not in the wider
            # window used for hearing it (a test song: the repeated words landed in the next part's first second)
            H += Hk; vad += vk; win.append((ln, ln2, max(0.0, t - 0.5), marks[k + 1][1] if k + 1 < len(marks) else D))
            say(f"  lines {ln}-{ln2 - 1} ({a:.1f}-{bb:.1f} s): heard {sum(1 for w in sub if w.get('sure') == 'heard')}/{len(sub)} words")
    else:
        H, got, vad = heard(f, " ".join(" ".join(ws) for ws in lines), lang, b["eighth"]); win = None
        for i, j in anchors(words, H): words[i].update(start=H[j]["start"], end=H[j]["end"], sure="heard")
    first = {}
    for i, w in enumerate(words): first.setdefault(w["line"], i)
    if not pins and (p / "notes" / "lyric-taps.json").exists():   # line starts the user tapped by ear in the player's lyric mode
        tp = json.loads((p / "notes" / "lyric-taps.json").read_text(encoding="utf-8")).get("taps") or []
        pins = {i + 1: t for i, t in enumerate(tp) if t is not None and i < len(lines)}
        if pins: say(f"  {len(pins)} line starts tapped in the player (notes/lyric-taps.json) used as pins")
    for ln, t in sorted((pins or {}).items()):            # the user's ear: line N starts here (wins over what was heard around it)
        if ln not in first: raise SystemExit(f"--pin: no line {ln}")
        i0 = first[ln]
        for i, w in enumerate(words):
            if w["start"] is not None and w.get("sure") == "heard" and ((i < i0 and w["start"] >= t) or (i > i0 and w["start"] <= t)): w["start"] = None; w.pop("sure")
        words[i0].update(start=round(t, 3), end=round(t + 0.2, 3), sure="pinned")
    if win:                                               # unheard words placed inside their own section's window
        for ln, ln2, a, bb in win:
            idx = [i for i, w in enumerate(words) if ln <= w["line"] < ln2]
            sub = place([words[i] for i in idx], b["onsets"], bb, b["eighth"], vad, a, b.get("beats"))
            for i, w in zip(idx, sub): words[i] = w
    else: words = place(words, b["onsets"], b["duration"], b["eighth"], vad, beats=b.get("beats"))
    if snap == "auto": snap = None                        # measured 07/10/2026: snapping a raw draft pushed words late; use it after taps
    words = postprocess(words, b, snap, lag)
    if snap: say(f"  word starts on the song's grid ({'eighth' if snap == 8 else 'sixteenth'} notes); heard words {int(lag * 1000)} ms earlier (Whisper's lag)")
    for k in range(len(words) - 1):                       # no overlaps
        if words[k]["end"] > words[k + 1]["start"]: words[k]["end"] = words[k + 1]["start"]
    out = p / "audio" / "transcript" / (f.stem + ".words.json"); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(words, ensure_ascii=False, indent=0), encoding="utf-8")
    (out.with_suffix("").with_suffix(".srt")).write_text(srt([(g[0]["start"], g[-1]["end"], " ".join(w["text"] for w in g)) for g in pages(words)]), encoding="utf-8")
    nh = sum(1 for w in words if w["sure"] == "heard")
    md = [f"# Lời bài hát có mốc thời gian ({f.name})", "",
          f"Máy nghe ra {nh}/{len(words)} từ (\"nghe\"); các từ còn lại đặt theo điểm bật âm giữa hai từ nghe được (\"đặt\"). "
          "Mở Preview nghe lại; mốc nào lệch thì ghi chú ở player hoặc sửa thẳng trong `audio/transcript/" + out.name + "` (giữ định dạng).", "",
          "| Câu | Lời | Mốc (giây) | Độ chắc |", "|---|---|---|---|"]
    for li, ws in enumerate(lines, 1):
        ww = [w for w in words if w["line"] == li]
        sure = ("ghim" if ww[0]["sure"] == "pinned" else "nghe" if all(w["sure"] == "heard" for w in ww) else "đặt" if all(w["sure"] == "placed" for w in ww)
                else f"{sum(w['sure'] == 'heard' for w in ww)}/{len(ww)} nghe")
        md.append(f"| {li} | {' '.join(ws)} | {', '.join(format(w["start"], '.2f') for w in ww)} | {sure} |")
    from common import brief_dir
    md_f = brief_dir(p) / "LYRICS-TIMED.md"; md_f.parent.mkdir(parents=True, exist_ok=True)
    try: md_f.write_text("\n".join(md) + "\n", encoding="utf-8")
    except PermissionError:                               # the user has it open: theirs (test 07/10/2026), write next to it
        md_f = md_f.with_name("LYRICS-TIMED.new.md"); md_f.write_text("\n".join(md) + "\n", encoding="utf-8")
    say(f"heard {nh}/{len(words)} words (language {got}); the rest placed on the song's attacks")
    say(f"-> {out.relative_to(p).as_posix()} + .srt, {md_f.relative_to(p).as_posix()}")
    return out
