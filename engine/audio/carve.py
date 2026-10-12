"""Voiceover carve (11/10/2026, user OK): instead of ducking the whole music bed under a voice, the bed is dipped in the bands the voice
uses, following the speech, plus a level match. The analysis is HyperFrames' own, run as shipped: engine/vendor/hf-carve/ holds its
skills/hyperframes-audio/scripts/carve.mjs (+ lib/main-module.mjs, tag v0.8.147) and the two files of @hyperframes/core 0.8.147 it loads
(dist/audioCarve.js, dist/audioFx.js) with the package's package.json and LICENSE, unchanged; MANIFEST.json holds their SHA-256, checked
before every run. Apache-2.0 (docs/THIRD-PARTY.md).

What the kit adds here (kit code, not HyperFrames code):
  - the input: a two-track composition in a work folder, the bed as the film plays it before any ducking (loop, fade in, at its mix
    volume) and every voice summed onto the bed's clock (trims and volumes applied), so the analysis hears what the mix plays;
  - the sound: carve.mjs writes three attributes on the bed (data-fx-carve, data-fx-chain, data-automation). The chain is peaking EQ
    bands and one gain stage, each with a gain lane in dB on the bed's clock (linear between points, held outside them: HyperFrames'
    sampleAutomationLane). apply() renders them: Web Audio's peaking biquad (RBJ cookbook, as BiquadFilterNode) with its gain updated
    every 5 ms, then the gain stage per sample.
film.json: a music clip's "carve": true (strength 0.8, HyperFrames' default) or 0..1. The result is cached next to the baked bed
(audio/_built/<id>.carve.json) and reused while the bed, the voices and the strength stay the same.

carve(clip, x, v, vol, out) -> the carved bed, or None (no Node.js, files not as shipped, analysis failed: the caller ducks as before)"""
import hashlib, html, json, os, re, shutil, subprocess
from pathlib import Path

import numpy as np

from audio.media import SR, write
from audio.loudness import ffmpeg
from common import ENGINE, LOCAL, as_shipped, node_exe, say

VENDOR = ENGINE / "vendor" / "hf-carve"
BLOCK = 240                                                  # 5 ms at 48 kHz: how often a band's gain follows its lane


def _ffmpeg_dir():
    """a folder with an executable named ffmpeg (carve.mjs calls it by name); the kit's imageio-ffmpeg copy has another name"""
    f = Path(ffmpeg())
    if f.stem.lower() == "ffmpeg": return f.parent
    d = LOCAL / "work" / "carve" / "bin"; d.mkdir(parents=True, exist_ok=True)
    dst = d / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
    if not dst.exists() or dst.stat().st_size != f.stat().st_size: shutil.copy2(f, dst)
    return d


def _attr(tag, name):
    m = re.search(rf'\s{name}="([^"]*)"', tag)
    return json.loads(html.unescape(m.group(1))) if m else None


def analyse(bed, voice, strength):
    """HyperFrames' carve.mjs on a two-track composition -> {"settings", "chain", "automation", "report"}, or a reason (str)"""
    node = node_exe()
    if not node: return "Node.js is not installed"
    man = json.loads((VENDOR / "MANIFEST.json").read_text(encoding="utf-8"))
    bad = [f for f, h in man["sha256"].items() if not as_shipped(VENDOR / f, h)]
    if bad: return "engine/vendor/hf-carve is not as shipped: " + ", ".join(bad)
    key = hashlib.sha1(bed.tobytes() + voice.tobytes()).hexdigest()[:12]
    w = LOCAL / "work" / "carve" / key
    shutil.rmtree(w, ignore_errors=True); w.mkdir(parents=True)
    try:
        write(w / "music.wav", bed); write(w / "voiceover.wav", voice)
        d = round(len(bed) / SR, 3)
        (w / "index.html").write_text(
            '<!doctype html><html><body><div id="root" data-composition-id="main" data-start="0" data-duration="%s" data-width="1920" data-height="1080">\n'
            '<audio id="music" src="music.wav" data-start="0" data-duration="%s"></audio>\n'
            '<audio id="voiceover" src="voiceover.wav" data-start="0" data-duration="%s"></audio>\n</div></body></html>\n' % (d, d, d), encoding="utf-8")
        env = dict(os.environ, PATH=str(_ffmpeg_dir()) + os.pathsep + os.environ.get("PATH", ""))
        r = subprocess.run([node, str(VENDOR / "carve.mjs"), "--comp", str(w / "index.html"), "--bed", "music", "--voice", "voiceover",
                            "--strength", f"{strength:g}", "--core", str(VENDOR)], capture_output=True, text=True, encoding="utf-8",
                           errors="replace", env=env, timeout=600)
        if r.returncode: return "carve.mjs: " + ((r.stderr or r.stdout).strip().splitlines() or ["failed"])[-1]
        tag = re.search(r'<audio id="music"[^>]*>', (w / "index.html").read_text(encoding="utf-8")).group(0)
        return {"settings": _attr(tag, "data-fx-carve"), "chain": _attr(tag, "data-fx-chain"), "automation": _attr(tag, "data-automation") or {"lanes": []},
                "report": [x for x in r.stdout.splitlines() if x.split(" ")[0] in ("bands", "level", "lanes")]}
    finally:
        shutil.rmtree(w, ignore_errors=True)


def _peaking(f0, gdb, q):
    """Web Audio BiquadFilterNode "peaking" (the RBJ cookbook): (b, a) normalised"""
    A = 10 ** (gdb / 40); w0 = 2 * np.pi * min(f0, SR / 2 * 0.999) / SR; al = np.sin(w0) / (2 * max(q, 1e-4)); c = np.cos(w0)
    b = np.array([1 + al * A, -2 * c, 1 - al * A]); a = np.array([1 + al / A, -2 * c, 1 - al / A])
    return b / a[0], a / a[0]


def apply(x, res):
    """the carve's chain and lanes on the bed x (float32 [n, 2])"""
    from scipy.signal import lfilter
    lanes = {L["target"]: L["points"] for L in res["automation"].get("lanes", [])}
    n = len(x); y = x.astype(np.float64)
    for nd in res["chain"]["nodes"]:
        if not nd.get("enabled", True): continue
        pts = lanes.get(f"fx.{nd.get('id')}.gain"); g0 = float(nd["params"].get("gain", 0))
        lane = (lambda t, P=pts: np.interp(t, [p["t"] for p in P], [p["v"] for p in P])) if pts else (lambda t: np.full(np.shape(t), g0))
        if nd["type"] == "peaking":
            f0, q = float(nd["params"]["frequency"]), float(nd["params"].get("q", 1))
            zi = np.zeros((2, 2)); gs = lane((np.arange(0, n, BLOCK) + BLOCK / 2) / SR)
            for k, i in enumerate(range(0, n, BLOCK)):
                b, a = _peaking(f0, float(gs[k]), q)
                y[i:i + BLOCK], zi = lfilter(b, a, y[i:i + BLOCK], axis=0, zi=zi)
        elif nd["type"] == "gain":
            y *= (10 ** (lane(np.arange(n) / SR) / 20))[:, None]
        else:
            say(f"  carve: node type {nd['type']!r} not rendered by the kit (skipped)")
    return y.astype(np.float32)


def carve(c, x, v, vol, out):
    """the music clip c's bed x (before ducking) carved for the voices v (same clock), or None; vol = the bed's mix volume"""
    s = c.get("carve"); strength = 0.8 if s is True else float(s)
    cache = Path(out).with_suffix(".carve.json")
    bed = (x * np.float32(vol)).astype(np.float32)
    key = hashlib.sha1(bed.tobytes() + v.tobytes() + json.dumps([strength, json.loads((VENDOR / "MANIFEST.json").read_text(encoding="utf-8"))["sha256"]]).encode()).hexdigest()
    res = None
    if cache.exists():
        try:
            old = json.loads(cache.read_text(encoding="utf-8"))
            if old.get("key") == key: res = old
        except ValueError: pass
    if res is None:
        res = analyse(bed, v.astype(np.float32), strength)
        if isinstance(res, str):
            say(f"  carve ({c['id']}): {res}; the music ducks to 25 % under the voice instead"); return None
        res["key"] = key; cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
        for line in res.get("report", []): say(f"  carve ({c['id']}, strength {strength:g}): {line}")
    return apply(x, res)
