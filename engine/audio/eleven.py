"""ElevenLabs voice, music and sound effects (plan C4; the user allowed generation APIs 07/10/2026). Nothing is sent without --yes: the
command first prints what it would generate and about how many credits, so Claude can tell the user before every paid generation.

  kit.py voice   <project> [--voice <id or name>] [--lang vi] [--model eleven_multilingual_v2] [--yes]
      every scene "voice" in film.json that has a "text" (the script line) and no audio file yet -> audio/voice/<file> (WAV 48 kHz);
      then run kit.py transcribe for the word times. film.json: "voice": { "src": "audio/voice/S01.wav", "text": "...", "voice_id": "..." }
  kit.py music   <project> "<prompt>" [--length 30] [--instrumental] [--yes]   -> audio/music/<name>.wav, then kit.py beats on it
  kit.py sfx-gen <project> "<description>" [--length 2] [--name whoosh-soft] [--yes]   -> audio/sfx/<name>.wav
      (use it as a film.json "audio" clip with "role": "sfx"; the scene "sfx" names are the kit's own synthesised sounds)
  kit.py voice <project> --list-voices      the account's voices (id, name, labels)

Rules (skill rule 9): the key comes from the environment only (ELEVENLABS_API_KEY), never from chat or a file that is shared. A brand
pack whose brand.json "kit" says "confidential": true (its scripts may be secret before a launch): its films need --confidential-ok (the user said yes in chat).
Endpoints (read 07/10/2026 at elevenlabs.io/docs): POST /v1/text-to-speech/{voice_id}, POST /v1/music, POST /v1/sound-generation,
GET /v1/voices; header xi-api-key; mp3 answers are converted to WAV 48 kHz with the kit's ffmpeg. Credits: PRICE below (Test 3, 08/10/2026:
the dry run printed no number for music; the user could not see the cost before saying yes). A dry run also says whether the key is set,
so the user hears about a missing key before the first paid step, not after it."""
import json, os, re, subprocess, unicodedata, urllib.error, urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io"
# credits, read 08/10/2026 at elevenlabs.io/pricing and the help page "How much does it cost to generate sound effects?" (API: 100 per sound with
# the length left to the model, 11 per second with a length; an older copy of that page said 20 per second, so the range is printed)
PRICE = {"tts": 1.0, "tts_fast": 0.5, "music_min": 900, "sfx_auto": 100, "sfx_sec": (11, 20), "read": "08/10/2026"}


def key_note():
    """one line for a dry run: is the key there (the paid step needs it)?"""
    return ("ELEVENLABS_API_KEY: set" if os.environ.get("ELEVENLABS_API_KEY", "").strip() else
            "ELEVENLABS_API_KEY: NOT set on this machine: tell the user now (Windows > Environment Variables > New: ELEVENLABS_API_KEY, then reopen the app; never paste the key into the chat)")


def key():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not k:
        raise SystemExit("ELEVENLABS_API_KEY is not set. The user sets it once in Windows (Settings > System > About > Advanced system settings >\n"
                         "Environment Variables > New: ELEVENLABS_API_KEY), then reopens the app. Never paste the key into the chat.")
    return k


def call(method, path, body=None, query=""):
    req = urllib.request.Request(API + path + (("?" + query) if query else ""), method=method,
                                 data=json.dumps(body).encode("utf-8") if body is not None else None,
                                 headers={"xi-api-key": key(), "Content-Type": "application/json", "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=600) as r: return r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ElevenLabs {e.code}: {e.read().decode('utf-8', 'replace')[:400]}")


def to_wav(data, out):
    import imageio_ffmpeg
    out = Path(out); out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".download.mp3"); tmp.write_bytes(data)
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-v", "error", "-i", str(tmp), "-ar", "48000", "-c:a", "pcm_s16le", str(out)], check=True)
    tmp.unlink()
    return out


def slug(s, n=40):
    s = unicodedata.normalize("NFD", s.replace("đ", "d").replace("Đ", "D"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()[:n] or "gen"


def guard(p, confidential_ok):
    import brand
    fj = Path(p) / "film.json"
    spec = json.loads(fj.read_text(encoding="utf-8")) if fj.exists() else {}
    name, B = brand.pack_of(spec)
    if name and brand.kit_rules(B)["confidential"] and not confidential_ok:
        raise SystemExit(f"{B.get('name') or name} job: the pack marks its scripts confidential before a launch (brands/{name}/brand.json \"kit\"). "
                         "Ask the user first; with their yes, add --confidential-ok.")
    return spec


def voices(say=print):
    d = json.loads(call("GET", "/v1/voices"))
    for v in d.get("voices", []):
        say(f"{v['voice_id']}  {v['name']}  {json.dumps(v.get('labels') or {}, ensure_ascii=False)}")


def voice_id(name_or_id):
    if re.fullmatch(r"[A-Za-z0-9]{20}", name_or_id or ""): return name_or_id
    d = json.loads(call("GET", "/v1/voices"))
    for v in d.get("voices", []):
        if v["name"].lower() == (name_or_id or "").lower(): return v["voice_id"]
    raise SystemExit(f"no voice named {name_or_id!r} (kit.py voice <project> --list-voices)")


def run_voice(p, voice=None, lang=None, model=None, yes=False, confidential_ok=False, say=print):
    p = Path(p); spec = guard(p, confidential_ok); model = model or "eleven_multilingual_v2"
    todo = [(s["id"], s["voice"]) for s in spec.get("scenes", []) if (s.get("voice") or {}).get("text") and not (p / s["voice"]["src"]).exists()]
    if not todo: return say("nothing to generate: every scene voice with a \"text\" already has its file (delete a file to make it again)")
    chars = sum(len(v["text"]) for _, v in todo); per = 0.5 if ("flash" in model or "turbo" in model) else 1.0
    for sid, v in todo: say(f"  {sid}: {len(v['text'])} characters -> {v['src']}")
    say(f"ElevenLabs text to speech ({model}): {len(todo)} line(s), {chars} characters, about {chars * per:.0f} credits (prices of {PRICE['read']})")
    if not yes: say(key_note()); return say("not sent: tell the user the cost, then run again with --yes")
    for sid, v in todo:
        vid = voice_id(v.get("voice_id") or voice or "")
        body = {"text": v["text"], "model_id": model}
        if lang: body["language_code"] = lang
        if v.get("voice_settings"): body["voice_settings"] = v["voice_settings"]
        out = to_wav(call("POST", f"/v1/text-to-speech/{vid}", body, "output_format=mp3_44100_128"), p / v["src"])
        say(f"  {sid}: -> {out.relative_to(p).as_posix()}")
    say("next: kit.py transcribe <project> (word times for the motion), then build")


def run_music(p, prompt, length=30.0, instrumental=False, yes=False, confidential_ok=False, model="music_v1", say=print):
    p = Path(p); guard(p, confidential_ok)
    out = p / "audio" / "music" / f"{slug(prompt)}.wav"
    say(f"ElevenLabs music ({model}): {length:g} s{', instrumental' if instrumental else ''}: \"{prompt}\" -> {out.relative_to(p).as_posix()}, "
        f"about {PRICE['music_min'] * length / 60:.0f} credits ({PRICE['music_min']} per minute, prices of {PRICE['read']})")
    if not yes: say(key_note()); return say("not sent: tell the user the cost, then run again with --yes")
    body = {"prompt": prompt, "music_length_ms": int(max(3, min(600, length)) * 1000), "model_id": model, "force_instrumental": bool(instrumental)}
    to_wav(call("POST", "/v1/music", body, "output_format=mp3_44100_128"), out)
    say(f"-> {out.relative_to(p).as_posix()}")
    from audio.beats import run as beats
    beats(p, out.relative_to(p).as_posix(), say=say)


def run_sfx(p, text, length=None, name=None, yes=False, confidential_ok=False, say=print):
    p = Path(p); guard(p, confidential_ok)
    out = p / "audio" / "sfx" / f"{slug(name or text, 30)}.wav"
    lo, hi = PRICE["sfx_sec"]
    cost = f"about {lo * length:.0f}-{hi * length:.0f} credits ({lo}-{hi} per second)" if length else f"about {PRICE['sfx_auto']} credits (length chosen by the model)"
    say(f"ElevenLabs sound effect: \"{text}\"{f', {length:g} s' if length else ''} -> {out.relative_to(p).as_posix()}, {cost}, prices of {PRICE['read']}")
    if not yes: say(key_note()); return say("not sent: tell the user the cost, then run again with --yes")
    body = {"text": text, "model_id": "eleven_text_to_sound_v2"}
    if length: body["duration_seconds"] = max(0.5, min(30.0, float(length)))
    to_wav(call("POST", "/v1/sound-generation", body, "output_format=mp3_44100_128"), out)
    say(f"-> {out.relative_to(p).as_posix()}  (film.json \"audio\": [{{\"src\": \"{out.relative_to(p).as_posix()}\", \"at\": ..., \"role\": \"sfx\"}}])")
