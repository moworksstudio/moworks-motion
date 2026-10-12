"""film.json "song": a film cut to a song (test film 07/10/2026, a lyric film over a megamix). Times from kit.py beats / kit.py align become
ABSOLUTE film times, so a scene, a motion or a sound can sit on a beat or a sung word wherever the song is.

  "song": { "src": "audio/music/song.wav", "at": 0, "volume": 1 }
      the song plays from film time "at" as it is (no loop, no ducking); its analysis files are found by name:
      audio/transcript/<file>.beats.json (kit.py beats) and audio/transcript/<file>.words.json (kit.py align)

References (anywhere a motion / sfx "at" or a scene's "until" takes a number):
  { "t": 12.5 }                          film second 12.5 (no song needed)
  { "beat": 16 }  { "downbeat": 4 }  { "hit": 3 }   the 16th beat, the 4th bar's first beat, the 3rd hit (counted from 1)
  { "lyric": "cùng nhau", "n": 2, "line": 10, "edge": "start" | "end" }   a sung word or phrase (its 2nd time, inside line 10)
  any of them + "offset": -0.05
A motion's "at" that is a reference is absolute; a plain number stays seconds from the scene start (as before).
Scenes: "until": <reference or film second> ends the scene there; "duration": { "beats": 8 } lasts 8 beats.
Motion params "words": "song": the song's words inside the scene, timed from the motion's "at" (text/captions sings along)."""
import json
from pathlib import Path

KEYS = ("t", "beat", "downbeat", "hit", "lyric")


def is_ref(x):
    return isinstance(x, dict) and any(k in x for k in KEYS)


class Song:
    def __init__(self, p, spec):
        s = spec.get("song") or {}
        self.src, self.at = s.get("src"), float(s.get("at", 0))
        self.beats = self.downbeats = self.hits = self.kicks = []; self.words = []; self.beat = None
        if not self.src: return
        stem = Path(self.src).stem
        bf = Path(p) / "audio" / "transcript" / f"{stem}.beats.json"
        if bf.exists():
            b = json.loads(bf.read_text(encoding="utf-8"))
            self.beats, self.downbeats, self.hits = ([self.at + t for t in b[k]] for k in ("beats", "downbeats", "hits"))
            self.kicks = [self.at + t for t in b.get("kicks", [])]          # beats.json before 08/10/2026 night has none: run kit.py beats again
            self.beat = b["beat"]
        wf = Path(p) / "audio" / "transcript" / f"{stem}.words.json"
        if wf.exists():
            self.words = [dict(w, start=self.at + w["start"], end=self.at + w["end"]) for w in json.loads(wf.read_text(encoding="utf-8"))]

    def time(self, ref, where=""):
        """a reference -> absolute film seconds"""
        if isinstance(ref, (int, float)): return float(ref)
        off = float(ref.get("offset", 0))
        if "t" in ref: return float(ref["t"]) + off
        for k, lst in (("beat", self.beats), ("downbeat", self.downbeats), ("hit", self.hits)):
            if k in ref:
                if not lst: raise SystemExit(f"{where}: {{\"{k}\": ...}} needs film.json \"song\" and kit.py beats")
                n = int(ref[k])
                if not 1 <= n <= len(lst): raise SystemExit(f"{where}: {k} {n} does not exist (the song has {len(lst)})")
                return round(lst[n - 1] + off, 4)
        if "lyric" in ref:
            from audio.transcribe import norm
            if not self.words: raise SystemExit(f"{where}: {{\"lyric\": ...}} needs film.json \"song\" and kit.py align")
            ws = [w for w in self.words if "line" not in ref or w.get("line") == int(ref["line"])]
            want = [norm(x) for x in str(ref["lyric"]).split() if norm(x)]
            keys = [norm(w["text"]) for w in ws]
            hits = [i for i in range(len(keys) - len(want) + 1) if keys[i:i + len(want)] == want]
            n = int(ref.get("n", 1))
            if len(hits) < n:
                raise SystemExit(f"{where}: the song does not sing \"{ref['lyric']}\"" + (f" {n} times" if n > 1 else "") + (f" in line {ref['line']}" if "line" in ref else ""))
            i = hits[n - 1]
            return round((ws[i + len(want) - 1]["end"] if ref.get("edge") == "end" else ws[i]["start"]) + off, 4)
        raise SystemExit(f"{where}: unknown time reference {ref}")

    def words_between(self, a, b):
        return [w for w in self.words if a - 0.02 <= w["start"] < b]


def clip(spec):
    """the song as an audio clip (raw: played as it is), unless film.json "audio" already plays that file"""
    s = spec.get("song")
    if not s or any(a.get("src") == s["src"] for a in spec.get("audio") or []): return None
    return {"id": "song", "src": s["src"], "at": float(s.get("at", 0)), "role": "music", "raw": True, "volume": s.get("volume", 1)}
