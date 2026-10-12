"""kit.py transcribe: voice-over -> words with their times (faster-whisper on this machine, model <kit>/engine/models/faster-whisper-small; v1
engine/transcribe.py, ported 06/10/2026). Nothing is uploaded; nothing is downloaded (the model came from v1, with the user's permission).

  python kit.py transcribe <project> [--lang vi|en] [--prompt "Moworks, HyperFrames"] [--force]
    every voice file film.json uses (scene "voice" + "audio" clips with role "voice"), once per file ->
      audio/transcript/<file>.words.json   [{"text": "word", "start": 0.12, "end": 0.40}, ...]  seconds from the start of the FILE
      audio/transcript/<file>.srt          captions, 3 words / 1.2 s per line at most
    A file is done again only when the WAV is newer than its words.json (or with --force). --prompt: names and brands the voice says
    (Whisper hears names badly: the times stay right, fix the words in words.json by hand and keep its times).

In film.json (kit.py build reads the words of the scene's own voice, inside its trim window):
  "at": {"word": "launch"}                        a motion or sfx starts when the voice says the word (case and punctuation ignored)
  "at": {"word": "Moworks Motion", "n": 2, "edge": "end", "offset": -0.1}    a phrase, its 2nd time, at its last word's end, 0.1 s earlier
  "params": {"words": "voice"}                    the scene voice's words, timed from the motion's own "at" (text/captions uses them)
kit.py build also writes audio/transcript/film.srt: every voice line at its time in the film (subtitles for an editor; Premiere imports SRT)."""
import json, re, subprocess, unicodedata
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent
MODEL = ENGINE / "models" / "faster-whisper-small"


def decode(src):
    """any audio file -> 16 kHz mono float32 (the kit's own ffmpeg; no PyAV)"""
    import numpy as np, imageio_ffmpeg
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "quiet", "-i", str(src), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


_model = None


def model():
    global _model
    if _model is None:
        if not (MODEL / "model.bin").exists():
            raise SystemExit(f"Whisper model missing: {MODEL}\n(it would be downloaded from Hugging Face, about 480 MB: ask the user first)")
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise SystemExit("faster-whisper is not installed: run install.bat and say yes to the optional packages (or pip install faster-whisper==1.2.1)")
        _model = WhisperModel(str(MODEL), device="cpu", compute_type="int8")
    return _model


def transcribe_file(src, lang=None, prompt=None):
    segs, info = model().transcribe(decode(src), word_timestamps=True, language=lang or None, vad_filter=True, initial_prompt=prompt or None)
    toks = []
    for s in segs:
        first = True
        for w in s.words or []:
            if not w.word.strip(): continue
            if not first and not w.word[:1].isspace():      # a piece glued to the word before it ("427" ",000", "year" "-to" "-date")
                toks[-1]["text"] += w.word.strip(); toks[-1]["end"] = round(w.end, 3); continue
            toks.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}); first = False
    return toks, info.language


def pages(toks, maxwords=3, maxspan=1.2):
    """caption lines: at most maxwords words and maxspan seconds each (v1 rule)"""
    out, cur = [], []
    for t in toks:
        if cur and (len(cur) >= maxwords or t["end"] - cur[0]["start"] > maxspan): out.append(cur); cur = []
        cur.append(t)
    return out + ([cur] if cur else [])


def stamp(t, sep=","):
    ms = max(0, round(t * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}{sep}{ms % 1000:03d}"


def srt(lines):
    """lines = [(start, end, text)] -> SRT text"""
    return "\n".join(f"{i + 1}\n{stamp(a)} --> {stamp(b)}\n{tx}\n" for i, (a, b, tx) in enumerate(lines))


def voice_srcs(spec):
    out = [s["voice"]["src"] for s in spec["scenes"] if s.get("voice")] + [a["src"] for a in spec.get("audio") or [] if a.get("role") == "voice"]
    return list(dict.fromkeys(out))


def words_file(p, src): return Path(p) / "audio" / "transcript" / (Path(src).stem + ".words.json")


def run(project, lang=None, prompt=None, force=False, say=print, files=None):
    """every voice of film.json, or the given files (a voice-over before film.json has it: test 4, 08/10/2026; a path inside the project
    or anywhere: words.json goes to the project's audio/transcript/)"""
    from common import in_film
    p = Path(project)
    fj = p / "film.json"
    spec = json.loads(fj.read_text(encoding="utf-8")) if fj.exists() else {"scenes": []}
    files = [str(in_film(p, x)) for x in files] if files else files          # 01_Brief\vo.wav: from the film's own folder
    srcs = [str(Path(x).resolve().relative_to(p.resolve())).replace("\\", "/") if Path(x).resolve().is_relative_to(p.resolve()) else str(Path(x).resolve())
            for x in files] if files else voice_srcs(spec)
    if not srcs: raise SystemExit("no voice: give the file (kit.py transcribe <project> <file.wav>) or a voice in film.json (scene \"voice\" or an \"audio\" clip with \"role\": \"voice\")")
    for src in srcs:
        from common import in_film
        wav, wf = in_film(p, src), words_file(p, src)
        if not wav.is_file(): raise SystemExit(f"voice file missing: {src}")
        if wf.exists() and wf.stat().st_mtime >= wav.stat().st_mtime and not force:
            say(f"  {src}: already done ({wf.name}; --force to redo)"); continue
        say(f"  {src}: listening ...")
        toks, got = transcribe_file(wav, lang, prompt)
        wf.parent.mkdir(parents=True, exist_ok=True)
        wf.write_text(json.dumps(toks, ensure_ascii=False, indent=1), encoding="utf-8")
        wf.with_name(Path(src).stem + ".srt").write_text(srt([(g[0]["start"], g[-1]["end"], " ".join(w["text"] for w in g)) for g in pages(toks)]), encoding="utf-8")
        say(f"  {src}: {len(toks)} words, language {got} -> audio/transcript/{wf.name} + {Path(src).stem}.srt")
        for g in pages(toks, 8, 4.0): say(f"    {g[0]['start']:6.2f}  " + " ".join(w["text"] for w in g))
    say("Names and brands are often misheard: fix the words in the .words.json (keep the times).")


# ---- used by kit.py build ----
def norm(s):
    s = unicodedata.normalize("NFC", s).lower()
    return re.sub(r"[^\w]+", "", s)                    # letters (Vietnamese too) and digits only


def scene_words(p, voice):
    """the words of one scene voice, timed from the scene start (voice "at" + file time - "trim"), inside its trim window"""
    wf = words_file(p, voice["src"])
    if not wf.exists(): raise SystemExit(f"no transcript for {voice['src']}: run kit.py transcribe {Path(p).name} first")
    trim, at = voice.get("trim", 0), voice.get("at", 0)
    end = trim + voice["duration"] if voice.get("duration") else 1e9
    toks = json.loads(wf.read_text(encoding="utf-8"))
    return [{"text": w["text"], "start": round(at + w["start"] - trim, 3), "end": round(at + w["end"] - trim, 3)}
            for w in toks if w["start"] >= trim - 0.05 and w["end"] <= end + 0.05]


def film_words(p, spec):
    """the words of the film-level voice clips ("audio" with "role": "voice"), in film seconds (clip "at" + file time - "trim")"""
    out = []
    for a in spec.get("audio") or []:
        if a.get("role") != "voice": continue
        out += scene_words(p, a)                           # same maths: "at" is a film second for a film-level clip
    return sorted(out, key=lambda w: w["start"])


def find_word(ws, ref, where):
    want = [norm(x) for x in str(ref["word"]).split() if norm(x)]
    keys = [norm(w["text"]) for w in ws]
    hits = [i for i in range(len(keys) - len(want) + 1) if keys[i:i + len(want)] == want]
    n = int(ref.get("n", 1))
    if len(hits) < n:
        raise SystemExit(f"{where}: the voice does not say \"{ref['word']}\"" + (f" {n} times" if n > 1 else "")
                         + f". It says: {' '.join(w['text'] for w in ws)[:400]}")
    i = hits[n - 1]
    t = ws[i + len(want) - 1]["end"] if ref.get("edge") == "end" else ws[i]["start"]
    return round(t + ref.get("offset", 0), 4)


def word_at(p, scene, ref, spec=None):
    """{"word": "Moworks Motion", "n": 1, "edge": "start" | "end", "offset": 0} -> seconds from the scene start (a scene voice), or
    {"t": film second} when the scene has no voice and the film has a film-level voice-over (test 4, 08/10/2026)"""
    if not scene.get("voice"):
        fw = film_words(p, spec) if spec else []
        if not fw: raise SystemExit(f"scene {scene['id']}: \"at\": {{\"word\": ...}} needs a scene \"voice\" or a film-level voice (\"audio\" with \"role\": \"voice\")")
        return {"t": find_word(fw, ref, f"scene {scene['id']}")}
    ws = scene_words(p, scene["voice"])
    return find_word(ws, ref, f"scene {scene['id']}")


def resolve(p, spec):
    """film.json word references -> numbers (motion / sfx "at", motion params "words": "voice"); returns how many were resolved"""
    n = 0
    isw = lambda x: isinstance(x, dict) and "word" in x
    fw = None
    for s in spec["scenes"]:
        for c in (s.get("motion") or []) + (s.get("sfx") or []):
            if isw(c.get("at")): c["at"] = word_at(p, s, c["at"], spec); n += 1   # song references: audio/song.py
        if isw(s.get("until")):                          # a scene ends on a word of the film-level voice-over
            fw = fw if fw is not None else film_words(p, spec)
            if not fw: raise SystemExit(f"scene {s['id']}: \"until\": {{\"word\": ...}} needs a film-level voice")
            s["until"] = {"t": find_word(fw, s["until"], f"scene {s['id']} until")}; n += 1
        for m in s.get("motion") or []:                  # captions of the scene's own voice (smoke test 08/10/2026: this block had slipped
            pr = m.get("params") or {}                   # into the film-sfx loop below and never ran for a scene voice)
            if pr.get("words") == "voice":
                if not s.get("voice"): continue          # the film-level voice: kit.py build fills it per scene (it knows the scene times)
                at = m.get("at", 0)
                pr["words"] = [dict(w, start=round(w["start"] - at, 3), end=round(w["end"] - at, 3)) for w in scene_words(p, s["voice"])]; n += 1
    for L in spec.get("layers") or []:                   # film-level layers and sfx: film seconds from the film-level voice
        for c in L.get("motion") or []:
            if isw(c.get("at")):
                fw = fw if fw is not None else film_words(p, spec)
                c["at"] = {"t": find_word(fw, c["at"], f"layer {L.get('id')}")}; n += 1
    for c in spec.get("sfx") or []:
        if isw(c.get("at")):
            fw = fw if fw is not None else film_words(p, spec)
            c["at"] = {"t": find_word(fw, c["at"], "film sfx")}; n += 1
    return n


def film_srt(p, clips):
    """audio/transcript/film.srt from the built film's voice clips (absolute film times); None when no voice has a transcript"""
    lines = []
    for c in clips:
        if c.get("role") != "voice": continue
        wf = words_file(p, c["src"])
        if not wf.exists(): continue
        a, b = c["trim"], c["trim"] + c["dur"]
        toks = [dict(w, start=w["start"] - a + c["start"], end=w["end"] - a + c["start"]) for w in json.loads(wf.read_text(encoding="utf-8"))
                if w["start"] >= a - 0.05 and w["end"] <= b + 0.05]
        lines += [(g[0]["start"], g[-1]["end"], " ".join(w["text"] for w in g)) for g in pages(toks)]
    if not lines: return None
    out = Path(p) / "audio" / "transcript" / "film.srt"
    out.write_text(srt(sorted(lines)), encoding="utf-8")
    return out
