"""kit.py build: MotionSpec (film.json) -> index.html with every tween written out (plan sections 2 and 4.3, option B).

film.json (MotionSpec v0):
{
  "spec": "aimk-motionspec/0", "title": "...", "size": [1920, 1080], "brand": "<pack in brands/>" | null, "background": "#ffffff",
  "scenes": [
    { "id": "s1", "name": "Title", "duration": 3.5 | "auto", "hold": 1.5, "bg": "#fff",
      "transition_in": { "preset": "transition/push", "duration": 0.6 },              (optional, overlaps the previous scene; "align":
                    "end" (default: the whole transition before the cut) | "center" (half before, half after: the previous scene lasts d/2
                    longer, for a cut on a voice-over word, "until": {"word": ...}))
      "elements": [ { "id": "h1", "type": "text", "text": "...", "class": "b-headline", "style": { "left": "55px", "top": "330px" } },
                    { "id": "pic", "type": "image", "src": "assets/images/a.png", "style": {...} },
                    { "id": "box", "type": "box", "style": {...} } ],
      "motion": [ { "preset": "text/mask-rise", "target": "h1" | ["a", "b"], "at": 0.3, "params": { "duration": 0.8 } } ],
      "voice": { "src": "audio/voice/S01.wav", "at": 0.3, "volume": 1, "tail": 0.6 } } ],     (optional: an "auto" scene lasts until the voice
                                                                                           ends + tail; a fixed one shorter than that is reported)
  "audio": [ { "id": "music", "src": "audio/music/bed.wav", "at": 0, "volume": 0.5, "trim": 0, "duration": null, "role": "music",
               "fade_in": 0.5, "fade_out": 1.5 } ],                       (optional; role voice | music | sfx; duration null = to the file's end)
  "end_tag": { "logo": "assets/logos/<pack>/logo-white.png", "bg": "#000", "width": 0.3, "duration": 1.5 },   (optional)
  "song": { "src": "audio/music/song.wav", "at": 0 },          (optional: a film cut to a song; audio/song.py has the time references:
                                                               {"beat": 16}, {"downbeat": 4}, {"hit": 3}, {"lyric": "..."}, {"t": 12.5})
  "layers": [ { "id": "product", "z": "above" | "below", "from": 0, "to": <ref or s>, "style": {...},
                "elements": [...], "motion": [ { "preset": ..., "target": ..., "at": <film seconds or ref>, "params": {...} } ] } ],
      (optional) elements that live across the scenes (one product through the film, a credit line): a full-frame layer above or below
      every scene, shown from "from" to "to" (default: the end of the last scene, so never on the end tag); its motion times are FILM
      seconds; scene transitions do not move it
  "css": "<film-only CSS>" | ["assets/film.css"],          (optional: the film's own classes, written once in <head>)
  "sfx": [ { "at": {"hit": 3}, "name": "thump" } ],         (optional: film-level sound effects at film seconds / references)
  "groove": { "parts": [ { "target": ["stk1"], "on": "beat", "scale": 0.06, "y": -18 } ] }   (optional: elements nudging on the song's
                                                               grid and drifting all film long, through their own inner layers: groove_config)
}
Scenes may also take "until": <ref or film second> (the scene ends there) or "duration": {"beats": 8}.
Element "type": "group" lays out its "children" with flexbox: { "id", "type": "group", "layout": "row" | "column", "gap": "40px",
"align": "center", "justify": "center", "center": true (fills the frame and centres the whole group: a text block and a product shot as one
unit, measured by the browser), "style": {...}, "children": [ elements ] } (test film 07/10/2026: 12 notes were "not centred").
Audio is written as HyperFrames <audio> clips (id, data-start, data-duration, data-media-start, data-volume, data-fade-in / -out); the kit
player plays them, kit.py mp4 / mov mix them into the file, kit.py ae adds them as audio layers (+ mix.wav and the stems in 05_AE/Audio).
How: a draft page (elements + GSAP + Library presets + spec runtime) is served from memory, the presets run on one real GSAP timeline in
Chromium, and the timeline is read back (targets by id, from / to values, duration, ease, position) and written as literal tl.fromTo / tl.to /
tl.set lines. Preset code is never copied into the film, only its result. An existing index.html is backed up to qa/backup/ first."""
import html, json, shutil, sys, time
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import FPS, KIT, say                        # noqa: E402  (FPS 60: data-fps on the root, so HyperFrames renders at 60 too)

KIT_FONTS = ["RobotoFlex-var.woff2", "RobotoMono-var.woff2", "RobotoMono-Italic-var.woff2"]   # "RFlex", "RMono": engine/vendor/fonts -> assets/fonts
LIB = KIT / "library" / "presets"
LIBS = [LIB, KIT / "library" / "layouts"]        # motion presets, layout / UI blocks (same format, separate library)


def preset_file(name, project=None):
    """<project>/presets/<name>/preset.js first (motion written for one film; it goes into the Library only when the user asks),
    then library/presets/<name>/preset.js or library/layouts/<name>/preset.js"""
    dirs = ([Path(project) / "presets"] if project else []) + LIBS
    return next((d / name / "preset.js" for d in dirs if (d / name / "preset.js").exists()), None)


def local_times(name, params, at, S, project, where):
    """a preset's preset.json "times" (11/10/2026): params that hold times in the block's own seconds (a beat-synced template's landings,
    strobe plan...). Song references in them ({"beat": 12}, {"hit": 3}, {"downbeat": 2}, {"lyric": ...}, at any depth) become seconds
    from the motion's start; plain numbers are already block seconds."""
    f = preset_file(name, project); mj = f.parent / "preset.json" if f else None
    times = (json.loads(mj.read_text(encoding="utf-8")).get("times") or []) if mj and mj.exists() else []
    if not times: return params
    from audio import song as SONG
    def conv(v):
        if SONG.is_ref(v): return round(S.time(v, where) - at, 4)
        if isinstance(v, list): return [conv(x) for x in v]
        if isinstance(v, dict): return {k: conv(x) for k, x in v.items()}
        return v
    return dict(params, **{k: conv(params[k]) for k in times if k in params})


SKIP = {"ease", "duration", "repeat", "yoyo", "repeatDelay", "delay", "immediateRender", "overwrite", "startAt", "runBackwards", "data",
        "onUpdate", "onComplete", "onStart", "callbackScope", "lazy", "id", "paused", "parent", "inherit"}

# Elements centred with a % translate (e.g. transform: translate(-50%, -50%)): GSAP reads an inline transform as a px matrix and only keeps it as
# xPercent -50 when round(offsetWidth / 2) == round(-x), so for some fractional widths (740.5 px, 740.6 px...) the first x / y tween drops the
# centring and the element jumps by half its size (found 06/10/2026: text/char-slam film vs draft). Film and draft therefore hand those % values
# to GSAP before any tween reads the element. The draft's sets are reverted before the stage is copied (the film keeps its plain inline style).
CENTER_JS = r"""document.querySelectorAll("#stage [style*='translate']").forEach(e => { if (!(e instanceof HTMLElement)) return; const m = (e.style.transform || "").trim().match(/^translate(X|Y)?\(\s*(-?[\d.]+)%\s*(?:,\s*(-?[\d.]+)%\s*)?\)(\s+(?:rotate|scale|skew)(?!.*(?:translate|matrix|perspective|3d\()).*)?$/); if (!m) return; const xp = m[1] === "Y" ? 0 : +m[2], yp = m[1] === "Y" ? +m[2] : m[1] === "X" ? 0 : +(m[3] || 0); (window.__aimkCenter = window.__aimkCenter || []).push(gsap.set(e, { xPercent: xp, yPercent: yp, x: 0, y: 0 })); });"""

BAKE_JS = r"""() => {
  const tl = window.__aimkTL, out = [], codeEnds = [], empty = [], skip = new Set(%SKIP%);
  const lit = v => typeof v === "number" ? +v.toFixed(4) : v;
  const obj = o => { if (!o) return null; const r = {}; for (const k in o) if (!skip.has(k) && ["number", "string", "boolean"].includes(typeof o[k])) r[k] = lit(o[k]);
                     if (o.stagger !== undefined && ["number", "object"].includes(typeof o.stagger)) r.stagger = o.stagger;
                     if (o.attr && typeof o.attr === "object") { r.attr = {}; for (const k in o.attr) if (["number", "string"].includes(typeof o.attr[k])) r.attr[k] = lit(o.attr[k]); }
                     return r; };
  const walk = (t, off) => {
    for (const c of t.getChildren(false, true, true)) {
      const at = off + c.startTime();
      if (c instanceof gsap.core.Timeline) { if (c.data !== "aimk-code") walk(c, at); else codeEnds.push({ scene: c.aimkScene || null, end: +(at + c.totalDuration()).toFixed(4) }); continue; }
      const targets = c.targets().map(x => x instanceof Element ? "#" + x.id : null);
      if (!targets.length) { empty.push(+at.toFixed(4)); continue; }   // matched nothing (an empty query): nothing to write (it was tl.set("", ...): a broken film)
      if (targets.some(x => !x || x === "#")) { out.push({ error: "tween on a non-element or an element without id (use ctx.code for proxies)", at }); continue; }
      const ease = c.duration() === 0 ? undefined : c.vars.ease; if (ease !== undefined && typeof ease !== "string") { out.push({ error: "non-string ease", at }); continue; }
      out.push({ targets, at: +at.toFixed(4), duration: +(c.vars.stagger !== undefined && typeof c.vars.duration === "number" ? c.vars.duration : c.duration()).toFixed(4), ease: ease || null, from: obj(c.vars.startAt), to: obj(c.vars),
                 repeat: c.vars.repeat || 0, yoyo: !!c.vars.yoyo, set: c.duration() === 0 && !c.vars.startAt, ir: c.vars.immediateRender === false });
    }
  };
  walk(tl, 0);
  out.sort((a, b) => a.at - b.at);
  tl.revert();          // drop the inline styles GSAP wrote (e.g. transform: translate(0%, 135%)): copied into the film they were read back as extra offsets
  (window.__aimkCenter || []).reverse().forEach(t => t.revert());   // and the centring sets (CENTER_JS): the film makes them itself
  // and what anime.js wrote (engine/vendor/libs/aimk/anime-sync.js, 12/10/2026): attributes, text, moved elements, as they were before
  if (window.AIMKAnime) AIMKAnime.reverts.splice(0).reverse().forEach(r => { try { r.revert(); } catch (e) {} });
  const stage = document.getElementById("stage");
  [...stage.querySelectorAll("[data-aimk-draft]")].forEach(e => e.removeAttribute("data-aimk-draft"));
  return { tweens: out, codes: AIMK.ctx.codes, styles: AIMK.ctx.styles, notes: AIMK.ctx.notes, sfx: AIMK.ctx.cues || [], codeEnds, empty, stage: stage.innerHTML };
}"""


def js_obj(d):
    """a JS object literal with bare keys where possible (reads like hand-written GSAP, which Studio's parser expects)"""
    import re
    parts = []
    for k, v in d.items():
        key = k if re.match(r"^[A-Za-z_$][\w$]*$", k) else json.dumps(k)
        parts.append(f"{key}: {json.dumps(v, ensure_ascii=False)}")
    return "{ " + ", ".join(parts) + " }"


def tween_line(t, seen):
    tg = json.dumps(t["targets"][0] if len(t["targets"]) == 1 else ", ".join(t["targets"]))
    to = dict(t["to"] or {})
    if t["set"]: return f"tl.set({tg}, {js_obj(to)}, {t['at']});"
    to["duration"] = t["duration"]
    if t["ease"]: to["ease"] = t["ease"]
    if t["repeat"]: to["repeat"] = t["repeat"]
    if t["yoyo"]: to["yoyo"] = True
    props = set(t["from"] or {}) | set(t["to"] or {})
    if t["from"] is not None:
        # a later fromTo that animates a property an earlier tween on the same element already animates: no immediate render (HF lint
        # rule gsap_repeated_fromto_without_baseline). A later fromTo on OTHER properties keeps it, or the element shows before its start.
        if t.get("ir") or any(props & seen.get(x, set()) for x in t["targets"]): to["immediateRender"] = False   # or the preset asked for it
        for x in t["targets"]: seen.setdefault(x, set()).update(props)
        return f"tl.fromTo({tg}, {js_obj(t['from'])}, {js_obj(to)}, {t['at']});"
    for x in t["targets"]: seen.setdefault(x, set()).update(props)
    return f"tl.to({tg}, {js_obj(to)}, {t['at']});"


ALIAS = {"scale": ("scaleX", "scaleY"), "autoAlpha": ("opacity", "visibility"), "alpha": ("opacity",), "rotate": ("rotation",),
         "rotationZ": ("rotation",), "translateX": ("x",), "translateY": ("y",)}
# GSAP keys that set how a transform is drawn, held constant, not moved: two tweens sharing one do not overlap (qa/verify.py OVERLAP_JS: the same)
SETTINGS = {"transformPerspective", "transformOrigin", "svgOrigin", "smoothOrigin", "force3D"}


def fix_overlaps(tweens, say=say):
    """An earlier move still running when a later move on the same property of the same element starts (an in move and its out move).
    Played frame after frame (the player's Play, PNG / MP4 export), GSAP renders the later move to its end, then the earlier one keeps running
    and ITS end state stays on screen (07/10/2026 lyric film test: a giant word stayed over the next line for 4 s); a direct seek renders both in
    order and looks right, so stills, verify and collide missed it. The earlier move is shortened to end where the later one starts (same
    values, a little faster: "an out move starts only after its in move ends"). Only the shared properties are shortened: the earlier move's
    other properties go on in a tween of their own for the whole duration (10/10/2026: text/caption-kinetic-slam's word dropped in 0.22 s
    with y + opacity, its fade-out on opacity at 0.2 s cut the y drop short too, a 1 px jump against the preset's own motion). What cannot be
    fixed that way (the earlier move outlasts the later one, a set inside a move, repeat / stagger / several targets) is reported.
    Returns (fixed, reported) lines."""
    def props(t):     # settings that hold a constant, not a move, never make two tweens overlap (transformPerspective on per-property tweens: 11/10/2026 test)
        return {a for k in set(t["from"] or {}) | set(t["to"] or {}) if k not in ("stagger", "attr") and k not in SETTINGS for a in ALIAS.get(k, (k,))}
    def end(t): return t["at"] + t["duration"] * (1 + t["repeat"])
    def split(A, common):
        """A keeps the keys that touch `common`; the rest -> a new tween (None when nothing to split, or keys a split cannot divide)"""
        keys = set(A["from"] or {}) | set(A["to"] or {})
        if keys & {"stagger", "attr"}: return None
        rest = {k for k in keys if not set(ALIAS.get(k, (k,))) & common}
        if not rest or rest == keys: return None
        part = lambda d, ks: None if d is None else {k: v for k, v in d.items() if k in ks}
        B = dict(A, **{"from": part(A["from"], rest), "to": part(A["to"], rest)})
        A["from"], A["to"] = part(A["from"], keys - rest), part(A["to"], keys - rest)
        return B
    extra = []
    by = {}
    for i, t in enumerate(tweens):
        if t["repeat"] < 0 or "stagger" in (t["to"] or {}): continue        # endless or staggered: their per-element times are not known here
        for x in t["targets"]: by.setdefault(x, []).append(i)
    fixed, odd = [], []
    for x, idx in by.items():
        idx.sort(key=lambda i: tweens[i]["at"])
        for n, i in enumerate(idx):
            A = tweens[i]
            if A["set"]: continue
            for j in idx[n + 1:]:
                B = tweens[j]
                if B["at"] >= end(A) - 0.005: break            # under 5 ms: rounding, not an overlap
                common = props(A) & props(B)
                if not common or B["at"] <= A["at"] + 1e-4: continue
                what = f"{x} {'+'.join(sorted(common))}"
                # an in / out pair: the earlier move ends after the later one starts but not long after the later one ends (the lyric film case:
                # in 0.42-0.70 s, out 0.50-0.66 s). An earlier move that outlasts the later one by more than that (a long drift with a
                # short shake inside) is a different intent: reported, not changed
                inout = end(A) <= end(B) + max(0.25, B["duration"])
                if not A["repeat"] and len(A["targets"]) == 1 and not B["set"] and inout and B["at"] - A["at"] >= 0.02:
                    kept = split(A, common)
                    if kept: extra.append((i, kept))
                    old = A["duration"]; A["duration"] = round(B["at"] - A["at"], 4)
                    fixed.append(f"{what}: the move at {A['at']:.2f} s shortened {old:.2f} → {A['duration']:.2f} s (the next one starts at {B['at']:.2f} s)"
                                 + (f"; {'+'.join(sorted(props(kept)))} keep {old:.2f} s" if kept else ""))
                    break                                          # A changed: its later neighbours are checked on the next pass
                else:
                    odd.append(f"{what}: a {'set' if B['set'] else 'move'} at {B['at']:.2f} s inside the move {A['at']:.2f}-{end(A):.2f} s "
                               "(played and seeked frames differ there: move one of them)")
    for i, kept in sorted(extra, key=lambda e: -e[0]): tweens.insert(i + 1, kept)   # right after its part: same start, other properties
    if extra:                                                      # a kept part may meet a later move on its own properties: one more pass
        f2, o2 = fix_overlaps(tweens, say=lambda *a: None)
        fixed += f2; odd += [x for x in o2 if x not in odd]
    for k, L in (("shortened", fixed), ("CHECK", odd)):
        for line in L[:8]: say(f"  overlap {k}: {line}")
        if len(L) > 8: say(f"  ... and {len(L) - 8} more overlap(s) {k}")
    return fixed, odd


def element_html(e, child=False):
    style = ";".join(f"{k.replace('_', '-')}:{v}" for k, v in (e.get("style") or {}).items())
    if "position" not in (e.get("style") or {}): style = ("position:relative;" if child else "position:absolute;") + style   # in a group: flex item
    style = html.escape(style, quote=True)            # a value with double quotes (clip-path: path("..."), font names) ended the attribute (10/10/2026)
    cls = f' class="{html.escape(e["class"])}"' if e.get("class") else ""
    cls += "".join(f' {html.escape(k)}="{html.escape(str(v))}"' for k, v in (e.get("attrs") or {}).items())   # e.g. {"data-lint": "ignore"} (kit.py collide)
    t = e.get("type", "text")
    if t == "group":                                     # flexbox row / column: the browser measures and centres the whole group
        st = e.get("style") or {}
        flex = {"display": "flex", "flex-direction": "row" if e.get("layout", "row") == "row" else "column", "align-items": e.get("align", "center"),
                "justify-content": e.get("justify", "center"), "gap": e.get("gap", "40px")}
        if e.get("center"): flex["inset"] = "0"
        if "position" not in st: flex = {"position": "relative" if child else "absolute", **flex}
        style = html.escape(";".join(f"{k}:{v}" for k, v in {**flex, **{k.replace('_', '-'): v for k, v in st.items()}}.items()), quote=True)
        kids = "".join(element_html(c, child=True) for c in e.get("children") or [])
        return f'<div id="{e["id"]}"{cls} style="{style}">{kids}</div>'
    if t == "image": return f'<img id="{e["id"]}"{cls} src="{html.escape(e["src"])}" style="{style}" alt="">'
    if t == "box": return f'<div id="{e["id"]}"{cls} style="{style}">{e.get("html") or ""}</div>'   # "html" too (an SVG, spans: 07/10/2026 test)
    return f'<div id="{e["id"]}"{cls} style="{style}">{e.get("html") or html.escape(e.get("text", ""))}</div>'


def layout(spec, S=None):
    """scene start / duration / track; 'auto' durations are measured in the draft, so this runs twice. A song film: "until" (a time
    reference: the scene ends on that beat / word) and "duration": {"beats": n} (audio/song.py)"""
    t, track, out = 0.0, 1, []
    for i, s in enumerate(spec["scenes"]):
        tr = s.get("transition_in")
        start = max(0.0, t - (tr.get("duration", 0.6) if tr and i else 0.0))
        dur = s.get("_dur") or (s["duration"] if isinstance(s.get("duration"), (int, float)) else 3.0)
        if isinstance(s.get("duration"), dict) and "beats" in s["duration"]:
            if not (S and S.beat): raise SystemExit(f"scene {s['id']}: \"duration\": {{\"beats\": ...}} needs film.json \"song\" and kit.py beats")
            dur = s["duration"]["beats"] * S.beat
        if s.get("until") is not None:
            end = S.time(s["until"], f"scene {s['id']} until") if S else float(s["until"])
            if end <= start: raise SystemExit(f"scene {s['id']}: \"until\" {end:.3f} s is not after its start {start:.3f} s")
            dur = end - start
        nxt = spec["scenes"][i + 1].get("transition_in") if i + 1 < len(spec["scenes"]) else None
        if nxt:                                            # "center": the next transition's middle sits on this scene's cut, so this
            al = nxt.get("align", "end")                   # scene runs d/2 past it and the next starts d/2 before it (test 4, 08/10/2026:
            if al not in ("end", "center"):                # a cut on a voice word had its whole transition before the word)
                raise SystemExit(f"scene {spec['scenes'][i + 1]['id']}: transition_in \"align\": \"{al}\"? use \"end\" or \"center\"")
            if al == "center": dur += nxt.get("duration", 0.6) / 2
        if tr and i: track = 2 if track == 1 else 1
        # cuts on the 60 fps frame grid, written with 6 decimals: 16.0167 (4 decimals) for 961 / 60 kept the old scene on frame 961
        # (08/10/2026, test 3: a flash lasted 3 frames instead of 2)
        f0, f1 = round(start * FPS), round((start + dur) * FPS)
        start, dur = f0 / FPS, max(1, f1 - f0) / FPS
        out.append({"id": s["id"], "start": round(start, 6), "dur": round(dur, 6), "track": track})
        t = start + dur
    return out


def audio_clips(spec, lay, total):
    """film.json "audio" + each scene's "voice" -> clips with absolute start times (lengths from spec["_alen"], read once in build)"""
    out = []
    for i, a in enumerate(spec.get("audio") or []):
        out.append(dict(a, id=a.get("id") or f"audio{i + 1}", start=a.get("at", 0)))
    for s, L in zip(spec["scenes"], lay):
        v = s.get("voice")
        if v: out.append(dict(v, id=v.get("id") or f"{s['id']}_voice", role=v.get("role", "voice"), start=L["start"] + v.get("at", 0)))
    for c in out:
        trim = c.get("trim", 0)
        c["dur"] = c.get("duration") or max(0.0, spec["_alen"][c["src"]] - trim)
        c["dur"] = round(max(0.0, min(c["dur"], total - c["start"])), 4); c["start"] = round(c["start"], 4); c["trim"] = trim
    return [c for c in out if c["dur"] > 0]


def final_audio(p, spec, lay, total, cues, say=say):
    """the film's clips as heard: voice / audio clips, sound effects (scene "sfx" + presets' ctx.sfx cues, never on or after the end tag;
    recorded sounds from engine/vendor/hf-sfx, each one's attack, or a whoosh's swell, one frame after the cue), music as v1 plays it (loop, fade in, ducking under voices, tail fade), baked into
    audio/_built/<id>.wav so the player, mix.wav and the AE layers all hear the same thing"""
    from audio import sfx as SFX
    from audio.media import bake_music
    cl = audio_clips(spec, lay, total)
    cut = round(lay[-1]["start"] + lay[-1]["dur"], 6) if spec.get("end_tag") else total     # the end tag starts here: silence for sfx
    allc = [dict(c, t=round(L["start"] + c.get("at", 0), 4)) for s, L in zip(spec["scenes"], lay) for c in s.get("sfx") or []] + list(cues)
    allc += spec.get("_film_sfx") or []                                          # film-level "sfx" (film seconds / song references)
    unknown = sorted({c["name"] for c in allc if c["name"] not in SFX.MAKERS})
    if unknown: say(f"  note: unknown sound effect(s) {unknown}; known: {', '.join(SFX.NAMES)}")
    allc = [c for c in allc if c["name"] in SFX.MAKERS and c.get("gain", 0.5) > 0 and c["t"] < cut]
    voices = [c for c in cl if c.get("role") == "voice"]
    for c in cl:
        if c.get("role") != "music" or c.get("raw"): continue                     # "raw": true = play the file as it is
        out = p / "audio" / "_built" / f"{c['id']}.wav"
        bake_music(p, c, voices, total, out)
        if "volume" not in c: c["volume"] = 0.6 if voices else 1.0               # v1: music at 0.6 under a voice
        c.update(src=out.relative_to(p).as_posix(), trim=0, dur=round(total - c["start"], 4), fade_in=0, fade_out=0)
    if allc:                                                                     # v1: sfx scale with the loudest of voice / music (at least 0.5)
        import numpy as np
        from audio.media import load, stems
        ref = max([0.5] + [float(abs(load(p / c["src"], c.get("trim", 0), c["dur"])).max()) * c.get("volume", 1) for c in cl])
        SFX.ensure(p / "assets" / "sfx", {c["name"] for c in allc})
        # the bed each cue sits on, as the film plays it (music baked with its ducking, voices): every cue's level is measured against it
        bed = stems(p, [dict(c, media_start=c.get("trim", 0), volume=c.get("volume", 1), fade_in=c.get("fade_in") or 0, fade_out=c.get("fade_out") or 0)
                        for c in cl], total) if cl else {"music": None, "voice": None}
    for i, c in enumerate(sorted(allc, key=lambda c: c["t"])):
        # the loudest point lands ONE FRAME AFTER the picture's hit (12/10/2026, the "Motion Lab" article the user asked to follow: "put
        # each visual hit 1 frame before its sound, never after ... light beats sound"); before, it landed on the hit's own frame
        f = p / "assets" / "sfx" / f"{c['name']}.wav"; start = max(0.0, c["t"] + 1.0 / FPS - SFX.peak(c["name"]))
        vol = SFX.mix_volume(c["name"], start, bed["music"], bed["voice"], c.get("gain", 0.5), c.get("gain", 0.5) * SFX.level(c["name"]) * ref)
        dur = round(min(SFX.duration_of(f), total - start), 4)
        cl.append({"id": f"sfx{i + 1}_{c['name']}", "src": f"assets/sfx/{c['name']}.wav", "start": round(start, 4), "trim": 0, "role": "sfx",
                   "dur": dur, "volume": vol})
        if bed["music"] is not None and dur > 0:           # a later cue sits over this one's tail too
            s = SFX.sound(c["name"])[:int(dur * 48000)] * np.float32(vol); a = int(round(start * 48000)); n = max(0, min(len(s), len(bed["music"]) - a))
            bed["music"][a:a + n] += s[:n]
    return [c for c in cl if c["dur"] > 0]


def audio_html(cl):
    tags = []
    for i, c in enumerate(cl):
        role = c.get("role", "")
        extra = (' data-timeline-role="music"' if role == "music" else "") + (f' data-aimk-role="{html.escape(role)}"' if role else "")
        extra += "".join(f' data-fade-{k}="{c["fade_" + k]}"' for k in ("in", "out") if c.get("fade_" + k))
        tags.append(f'  <audio id="{html.escape(c["id"])}" src="{html.escape(c["src"])}" preload="auto" data-start="{c["start"]}" data-duration="{c["dur"]}"'
                    f' data-media-start="{c["trim"]}" data-volume="{c.get("volume", 1)}" data-track-index="{20 + i}"{extra}></audio>')
    return ("\n\n" + "\n".join(tags)) if tags else ""


def slideshow_island(spec, lay):
    """film.json "slides" (11/10/2026): the film is also a deck for HyperFrames' presenter (`kit.py studio <film> --present`): its JSON island
    (HyperFrames skills/slideshow, Apache-2.0), one slide per scene by its film times. "slides": true = every scene; or a list of scene ids
    (the main line, in order). A scene's "slide": {"notes": "presenter notes", "fragments": [seconds in the scene: the presenter holds there
    until the next click]}. The MP4 / MOV / AE port ignore it."""
    sl = spec.get("slides")
    if not sl: return ""
    by = {s["id"]: (s, L) for s, L in zip(spec["scenes"], lay)}
    ids = [s["id"] for s in spec["scenes"]] if sl is True else list(sl)
    out = []
    for i in ids:
        if i not in by: raise SystemExit(f"film.json \"slides\": no scene \"{i}\"")
        s, L = by[i]; o = s.get("slide") or {}
        r = {"sceneId": i, "startTime": round(L["start"], 4), "endTime": round(L["start"] + L["dur"], 4)}
        if o.get("notes"): r["notes"] = o["notes"]
        if o.get("fragments"): r["fragments"] = [round(L["start"] + float(t), 4) for t in o["fragments"]]
        out.append(r)
    return ('<script type="application/hyperframes-slideshow+json">\n'
            + json.dumps({"slides": out, "slideSequences": []}, ensure_ascii=False, indent=1).replace("</", "<\\/") + "\n</script>")


def page(spec, lay, draft):
    extra_scripts = "".join(f'<script src="assets/vendor/{x}"></script>\n' for x in spec.get("_scripts", []))
    W, H = spec.get("size", [1920, 1080])
    css_links = '<link rel="stylesheet" href="assets/brand.css">\n' if spec.get("brand") else ""
    # project fonts (film.json "fonts": [{"family": "...", "src": "assets/fonts/x.ttf"}], e.g. the PSD's own fonts)
    # several faces per family are fine ({"family", "src", "weight": "700" or "100 900", "style": "italic"}), as kit.py ingest finds them
    font_faces = "".join('  @font-face { font-family: "%s"; src: url("%s"); font-weight: %s; font-style: %s; font-display: block; }\n'
                         % (x["family"], x["src"], x.get("weight", "100 1000"), x.get("style", "normal"))
                         for x in spec.get("fonts") or [] if x.get("src"))
    total = round(lay[-1]["start"] + lay[-1]["dur"], 6) if lay else 0
    end = spec.get("end_tag")
    scenes = []
    for s, L in zip(spec["scenes"], lay):
        els = "\n      ".join(element_html(e) for e in s.get("elements", []))
        bg = f' style="background:{s["bg"]}"' if s.get("bg") else ""
        hide = ' style="visibility:hidden"' if spec.get("slides") and L["start"] > 0 else ""   # a deck: hidden until its own set (slideshow_island)
        scenes.append(f'  <div id="{s["id"]}"{hide} class="clip scene" data-start="{L["start"]}" data-duration="{L["dur"]}" data-track-index="{L["track"]}" data-name="{html.escape(s.get("name", s["id"]))}">\n'
                      f'    <div id="{s["id"]}in" class="inner"{bg}>\n      {els}\n    </div>\n  </div>')

    def layer_html(Ly):                                  # film-level layer: no data-start (not a clip: never gated, never a cut), shown by its own sets
        st = ";".join(f"{k.replace('_', '-')}:{v}" for k, v in (Ly.get("style") or {}).items())
        f0 = Ly.get("from", 0)                            # starts later: hidden by its style (a GSAP set at 0 still showed it on frame 0)
        if not (isinstance(f0, (int, float)) and f0 <= 0): st = "visibility:hidden;opacity:0;" + st   # opacity too: a child's own
        # visibility: visible would show through visibility alone (08/10/2026 tests; the same reason as the driver's scene gate)
        els = "\n      ".join(element_html(e) for e in Ly.get("elements", []))
        return (f'  <div id="{Ly["id"]}" class="layer" data-aimk-layer="{Ly.get("z", "above")}" style="position:absolute;inset:0;pointer-events:none;{st}">\n'
                f'      {els}\n  </div>')
    below = [layer_html(x) for x in spec.get("layers") or [] if x.get("z") == "below"]
    above = [layer_html(x) for x in spec.get("layers") or [] if x.get("z", "above") != "below"]
    scenes += above                                       # above every scene, under the end tag
    if end:
        ed = end.get("duration", 1.5); pct = end.get("width", 0.3)
        scenes.append(f'  <div id="endtag" class="clip scene" data-start="{total}" data-duration="{ed}" data-track-index="1" data-name="End tag">\n'
                      f'    <div class="endbg" style="position:absolute;inset:0;background:{end.get("bg", "#000")}"></div>\n'
                      f'    <img id="endmark" src="{html.escape(end["logo"])}" style="position:absolute;left:{(1 - pct) / 2 * 100:.2f}%;width:{pct * 100:.2f}%;top:50%;transform:translateY(-50%)" alt="">\n  </div>')
        total = round(total + ed, 6)
    body = "\n\n".join(below + scenes)                     # audio clips are added to the final film only (build: final_audio)
    island = slideshow_island(spec, lay)
    if island: body = island + "\n\n" + body
    fc = spec.get("css")                                  # the film's own CSS (test film 07/10/2026 needed a preset just to write it)
    if isinstance(fc, str) and fc.strip(): css_links += f'<style data-aimk-film>\n{fc.strip()}\n</style>\n'
    elif isinstance(fc, list): css_links += "".join(f'<link rel="stylesheet" href="{html.escape(x)}">\n' for x in fc)
    head = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>{html.escape(spec.get("title", "film"))}</title>
<!-- Moworks Motion film, built by `kit.py build` from film.json (MotionSpec) on {time.strftime("%Y-%m-%d %H:%M")}. From here on this file is the
     source: ask Claude, or edit it by hand in HyperFrames Studio (4. HF Studio (tuy chon).bat). Rebuilding from film.json backs this file up to
     qa/backup/ first. -->
{css_links}<style>
  @font-face {{ font-family: "RFlex"; font-weight: 100 1000; src: url("assets/fonts/RobotoFlex-var.woff2") format("woff2"); font-display: block; }}
  @font-face {{ font-family: "RMono"; font-weight: 100 700; src: url("assets/fonts/RobotoMono-var.woff2") format("woff2"); font-display: block; }}
  @font-face {{ font-family: "RMono"; font-style: italic; font-weight: 100 700; src: url("assets/fonts/RobotoMono-Italic-var.woff2") format("woff2"); font-display: block; }}
{font_faces}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ overflow: hidden; }}
  #stage {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; font-family: "RFlex", sans-serif; color: #111; font-kerning: normal; font-variant-ligatures: none; }}
  #bg {{ position: absolute; inset: 0; background: {spec.get("background", "#ffffff")}; will-change: transform; }}
  .scene {{ position: absolute; inset: 0; overflow: hidden; }}
  .inner {{ position: absolute; inset: 0; overflow: hidden; }}
</style>
%PRESET_STYLES%</head>
<body>
<div id="stage" data-composition-id="root" data-width="{W}" data-height="{H}" data-duration="{total}" data-fps="{FPS}">
  <div id="bg"></div>

{body}
</div>
<script src="assets/vendor/gsap.min.js"></script>
{extra_scripts}"""
    return head, total


GROOVE_ON = "beat | eighth | downbeat | hit | kick | word, a time reference, {\"lyric\": \"...\", \"all\": true}, {\"bpm\": 120, \"offset\": 0} or a list of these"


def groove_config(spec, S, end):
    """film.json "groove": listed elements nudge on the song's grid all film long (test 07/10/2026: the plain-prompt film moved on 76 % of
    its beats, 21-33 % more picture change in the 0.14 s after a beat, and the user called it the liveliest and best-synced yet).
      "groove": { "from": 0, "to": <ref or s> (default: the end tag), "decay": 0.16,
                  "parts": [ { "target": ["stk1", "bubble1"], "on": "beat", "scale": 0.03, "y": -18, "squash": 0.06, "origin": "50% 100%" },
                             { "target": "hero", "on": {"lyric": "nhảy", "all": true}, "offset": -0.02, "scale": 0.08 } ] }
    Per part: "on" (GROOVE_ON, default "beat"; "none" = drift only), "offset" (s), the PEAK values "scale" (0.03 = 3 %), "x" / "y" (px),
    "squash" (wider + flatter), "rotate" (deg), "decay" (s), "attack" (s, 0.012); "drift": {"y": 7, "x": 0, "rotate": 0.7, "scale": 0,
    "period": 3.3} = an always-on slow float (two sine waves, each target its own phase). Parts on one target add up. Resolved here to plain
    film times; AIMK.groove writes them."""
    g = spec["groove"]
    a = S.time(g.get("from", 0), "groove from")
    b = S.time(g["to"], "groove to") if g.get("to") is not None else end

    def grid(on, where):
        if isinstance(on, list): return sorted({t for x in on for t in grid(x, where)})
        if on == "none": return []                         # drift only
        if isinstance(on, str):
            lst = {"beat": S.beats, "downbeat": S.downbeats, "hit": S.hits, "kick": S.kicks, "word": [w["start"] for w in S.words],
                   "eighth": sorted(S.beats + [(x + y) / 2 for x, y in zip(S.beats, S.beats[1:])])}.get(on)
            if lst is None: raise SystemExit(f"{where}: \"on\": \"{on}\"? use {GROOVE_ON}")
            if not lst: raise SystemExit(f"{where}: \"on\": \"{on}\" needs film.json \"song\" and kit.py " + ("align" if on == "word" else "beats"))
            return list(lst)
        if isinstance(on, dict) and "bpm" in on:
            step, t0 = 60 / float(on["bpm"]), float(on.get("offset", 0))
            return [round(t0 + i * step, 4) for i in range(int(max(0.0, b - t0) / step) + 1)]
        if isinstance(on, dict) and on.get("all") and "lyric" in on:
            if not S.words: raise SystemExit(f"{where}: {{\"lyric\": ...}} needs film.json \"song\" and kit.py align")
            out, n = [], 1
            while True:
                try: out.append(S.time(dict(on, n=n), where))
                except SystemExit: break
                n += 1
            if not out: raise SystemExit(f"{where}: the song does not sing \"{on['lyric']}\"")
            return out
        from audio import song as SONG
        if SONG.is_ref(on) or isinstance(on, (int, float)): return [S.time(on, where)]
        raise SystemExit(f"{where}: \"on\": {on}? use {GROOVE_ON}")

    parts = []
    for i, pt in enumerate(g.get("parts") or []):
        where = f"groove part {i + 1}"
        if not pt.get("target"): raise SystemExit(f"{where}: no \"target\"")
        ts = sorted(round(t + float(pt.get("offset", 0)), 4) for t in grid(pt.get("on", "none" if "drift" in pt else "beat"), where))
        ts = [t for t in ts if a - 1 <= t <= b]
        dr = pt.get("drift")
        if dr is not None and not (isinstance(dr, dict) and any(k in dr for k in ("x", "y", "rotate", "scale"))):
            raise SystemExit(f"{where}: \"drift\" is {{\"y\": 7, \"x\": 0, \"rotate\": 0.7, \"scale\": 0, \"period\": 3.3}} (px, deg, 0.01 = 1 %, s)")
        parts.append({"ids": pt["target"] if isinstance(pt["target"], list) else [pt["target"]], "t": ts,
                      **{k: float(pt.get(k, d)) for k, d in (("scale", 0.0 if any(x in pt for x in ("x", "y", "squash", "rotate", "drift")) else 0.03),
                                                             ("x", 0), ("y", 0), ("squash", 0), ("rotate", 0), ("attack", 0.012))},
                      "decay": float(pt.get("decay", g.get("decay", 0.16))), "origin": pt.get("origin"), "drift": dr})
    if not parts: raise SystemExit("film.json \"groove\" has no \"parts\"")
    return {"from": round(a, 4), "to": round(b, 4), "parts": parts}


def expand_parts(p, spec):
    """a scene entry { "include": "parts/s05-s08.json" } is replaced by that file's "scenes" (in place, in order); its "layers" join the film's.
    Long films are written in parts by several helpers at once (plan C2, 07/10/2026): each owns its part file, nobody edits film.json."""
    out = []
    for s in spec["scenes"]:
        if not (isinstance(s, dict) and s.get("include")): out.append(s); continue
        f = Path(p) / s["include"]
        if not f.exists(): raise SystemExit(f"film.json includes {s['include']}, which does not exist")
        part = json.loads(f.read_text(encoding="utf-8"))
        out += part.get("scenes") or []
        spec.setdefault("layers", []).extend(part.get("layers") or [])
    if not out: raise SystemExit("film.json has no scenes")
    return out


RESERVED_IDS = {"stage", "bg", "endtag", "endmark"}      # the page's own elements (index.html): an element with one of these ids breaks them


def reserved_ids(spec):
    """element ids the page already uses (#stage, #bg, the end tag) or a scene's inner box (<scene id>in): test 1 of 08/10/2026 named a
    canvas "bg" and the stage's #bg rule painted it black"""
    inner = {s.get("id", "") + "in" for s in spec["scenes"]}
    bad = []

    def walk(els):
        for e in els or []:
            i = e.get("id") or ""
            if i in RESERVED_IDS or i in inner or i.startswith("__aimk"): bad.append(i)
            walk(e.get("children"))
    for s in spec["scenes"]: walk(s.get("elements"))
    for L in spec.get("layers") or []:
        if L.get("id") in RESERVED_IDS: bad.append(L["id"])
        walk(L.get("elements"))
    return bad


def duplicate_ids(spec):
    seen, dup = set(), []

    def walk(els):
        for e in els or []:
            i = e.get("id")
            if i in seen: dup.append(i)
            seen.add(i); walk(e.get("children"))
    for s in spec["scenes"]:
        if s.get("id") in seen: dup.append(s["id"])
        seen.add(s.get("id")); walk(s.get("elements"))
    for L in spec.get("layers") or []:
        if L.get("id") in seen: dup.append(L["id"])
        seen.add(L.get("id")); walk(L.get("elements"))
    return dup


def build(project_dir, force=False, say=say, draft_out=None, report=None, spec=None, out=None):
    """film.json -> index.html. spec / out (kit.py storyboard, 08/10/2026): another film spec, written to another file, film.json and
    index.html untouched"""
    from playwright.async_api import async_playwright
    import asyncio
    from render.browser import launch, page_timeouts
    from render.serve import Quiet, serve_in_thread
    p = Path(project_dir); spec = spec if spec is not None else json.loads((p / "film.json").read_text(encoding="utf-8"))
    from audio import song as SONG
    spec["scenes"] = expand_parts(p, spec)               # long films: { "include": "parts/s05-s08.json" } entries (plan C2)
    dup = duplicate_ids(spec)
    if dup: raise SystemExit(f"element ids used twice (parts written apart must prefix their ids): {dup[:8]}")
    rsv = reserved_ids(spec)
    if rsv: raise SystemExit(f"element ids the page itself uses: {rsv[:8]} (stage, bg, endtag, endmark, <scene id>in, __aimk*): rename them")
    sc = SONG.clip(spec)                                 # film.json "song": played as it is from its "at"
    if sc: spec.setdefault("audio", []).append(sc)
    S = SONG.Song(p, spec)
    fd = p / "assets" / "fonts"; fd.mkdir(parents=True, exist_ok=True)
    for f in KIT_FONTS:                                   # the kit's own fonts, also for projects made before a font was added, and replaced when
        src = ENGINE / "vendor" / "fonts" / f             # the film's copy differs (an older film kept v1's 59 KB Latin-only Roboto Flex: Vietnamese
        if not (fd / f).exists() or (fd / f).stat().st_size != src.stat().st_size: shutil.copy2(src, fd / f)   # marks fell apart, 09/10/2026)
    from audio.media import duration as audio_len
    srcs = {a["src"] for a in spec.get("audio") or []} | {s["voice"]["src"] for s in spec["scenes"] if s.get("voice")}
    lost = sorted(x for x in srcs if not (p / x).is_file())
    if lost: raise SystemExit(f"audio files not in the project: {lost}")
    spec["_alen"] = {x: round(audio_len(p / x), 4) for x in srcs}
    for s in spec["scenes"]:                              # a scene with a voice lasts at least until the voice ends + tail
        v = s.get("voice")
        if not v: continue
        s["_vneed"] = round(v.get("at", 0) + (v.get("duration") or spec["_alen"][v["src"]] - v.get("trim", 0)) + v.get("tail", 0.6), 3)
        if isinstance(s.get("duration"), (int, float)) and s["duration"] < s["_vneed"]:
            say(f"  note: scene {s['id']} lasts {s['duration']} s but its voice needs {s['_vneed']} s (\"duration\": \"auto\" fits the voice)")
    from audio.transcribe import film_srt, resolve
    nref = resolve(p, spec)                              # "at": {"word": ...} and "words": "voice" -> times from audio/transcript (kit.py transcribe)
    if nref: say(f"  {nref} time(s) taken from the voice transcript")
    names = sorted({m["preset"] for s in spec["scenes"] for m in s.get("motion", [])} | {s["transition_in"]["preset"] for s in spec["scenes"] if s.get("transition_in")}
                   | {m["preset"] for Ly in spec.get("layers") or [] for m in Ly.get("motion", [])})
    missing = [n for n in names if not preset_file(n, p)]
    if missing: raise SystemExit(f"presets not in <project>/presets, library/presets or library/layouts: {missing}")
    if "text/embedded-captions" in names:                 # HyperFrames' embedded captions: its compilers and gates run first (intake/captions.py)
        from intake.captions import compile_film
        compile_film(p, spec, say)
    preset_js = "\n".join(preset_file(n, p).read_text(encoding="utf-8") for n in names)
    import re as _re
    # drawn art (presets/drawn/<name>/preset.js: window.AIMK_ART; presets/traced/ in films made before 11/10/2026): every one is added
    # when any preset draws it by code (AIMK_RIG.art / puppet, or R.art(...) with R = AIMK_RIG)
    if _re.search(r"AIMK_ART|AIMK_TRACED|\.(?:art|traced|puppet)\(", preset_js):
        for sub in ("drawn", "traced"):
            for f in sorted((p / "presets" / sub).glob("*/preset.js")):
                if f"{sub}/{f.parent.name}" not in names: preset_js += "\n" + f.read_text(encoding="utf-8")
    scripts = []
    if "AIMK_RIG" in preset_js:                           # the character rig (engine/vendor/libs/aimk/rig.js): before every preset that uses it
        x = "libs/aimk/rig.js"; scripts.append(x); dst = p / "assets" / "vendor" / x; dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ENGINE / "vendor" / x, dst)
    for n in names:                                       # libraries a preset needs (preset.json "scripts": paths under engine/vendor)
        mj = preset_file(n, p).parent / "preset.json"
        for x in (json.loads(mj.read_text(encoding="utf-8")).get("scripts", []) if mj.exists() else []):
            if x not in scripts:
                scripts.append(x); dst = p / "assets" / "vendor" / x; dst.parent.mkdir(parents=True, exist_ok=True)
                src = ENGINE / "vendor" / x                    # replaced when the kit's copy changed (hf-frame.js learned picture sequences, 11/10/2026)
                if not dst.exists() or dst.stat().st_size != src.stat().st_size or x == "libs/aimk/rig.js": shutil.copy2(src, dst)
    # spring eases / ctx.track (plan B2), the nudge ease (11/10/2026): engine/vendor/libs/aimk/eases.js right after GSAP
    if _re.search(r"spring\.(snappy|default|heavy|playful)|springk\(|ctx\.track\(|AIMK_SPRING|[\"']nudge[\"']", json.dumps(spec, ensure_ascii=False) + preset_js):
        x = "libs/aimk/eases.js"; scripts.insert(0, x); dst = p / "assets" / "vendor" / x; dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ENGINE / "vendor" / x, dst)
    spec["_scripts"] = scripts
    for n in names:                                       # shared files a preset needs, not scripts (preset.json "vendor": files or folders under
        mj = preset_file(n, p).parent / "preset.json"     # engine/vendor, e.g. the kit's placeholder pictures): copied to assets/vendor/<path>
        for x in (json.loads(mj.read_text(encoding="utf-8")).get("vendor", []) if mj.exists() else []):
            src, dst = ENGINE / "vendor" / x, p / "assets" / "vendor" / x
            if src.is_dir(): shutil.copytree(src, dst, dirs_exist_ok=True)
            elif not dst.exists(): dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
    for n in names:                                       # files a preset ships (ctx.asset): into the project, next to its other assets
        a = preset_file(n, p).parent / "assets"
        if a.is_dir(): shutil.copytree(a, p / "assets" / "lib" / n, dirs_exist_ok=True)
    have = {(x.get("family"), x.get("src")) for x in spec.get("fonts") or []}
    for n in names:                                       # fonts a preset ships (preset.json "fonts": [{family, file (in its assets/), weight,
        mj = preset_file(n, p).parent / "preset.json"     # style}]): declared in the film like project fonts and loaded before the presets
        for f in (json.loads(mj.read_text(encoding="utf-8")).get("fonts", []) if mj.exists() else []):   # run, so a preset can measure text
            if f.get("vendor"):                           # a font several presets share: engine/vendor/<path> -> <project>/assets/vendor/<path>
                dst = p / "assets" / "vendor" / f["vendor"]; dst.parent.mkdir(parents=True, exist_ok=True)
                if not dst.exists(): shutil.copy2(ENGINE / "vendor" / f["vendor"], dst)
                src = f"assets/vendor/{f['vendor']}"
            else: src = f"assets/lib/{n}/{f['file']}"
            x = {"family": f["family"], "src": src, "weight": f.get("weight", "400"), "style": f.get("style", "normal")}
            if (x["family"], x["src"]) not in have: spec.setdefault("fonts", []).append(x); have.add((x["family"], x["src"]))
    runtime = (ENGINE / "runtime" / "spec-runtime.js").read_text(encoding="utf-8")
    base, srv = serve_in_thread(p)                       # the project folder is the web root: films only use paths inside it
    import hashlib
    rel = "/__aimk_draft_" + hashlib.sha1(str(p).encode()).hexdigest()[:8] + ".html"

    async def run(lay):
        head, total = page(spec, lay, True)
        calls = []
        for s, L in zip(spec["scenes"], lay):
            calls.append(f'window.__aimkScene = {json.dumps(s["id"])};')        # ctx.code timelines remember their scene (its "auto" length)
            if s.get("transition_in") and calls is not None and s is not spec["scenes"][0]:
                prev = spec["scenes"][spec["scenes"].index(s) - 1]
                tr = s["transition_in"]
                calls.append(f'AIMK.run(tl, {json.dumps(tr["preset"])}, [{json.dumps(prev["id"] + "in")}, {json.dumps(s["id"] + "in")}], {L["start"]}, {json.dumps({"duration": tr.get("duration", 0.6), **tr.get("params", {})})});')
            for m in s.get("motion", []):
                at = m.get("at", 0)
                at = S.time(at, f"scene {s['id']} {m['preset']}") if SONG.is_ref(at) else L["start"] + at     # a reference is a film time
                pr = local_times(m["preset"], m.get("params", {}), at, S, p, f"scene {s['id']} {m['preset']}")
                if pr.get("words") == "song":                # the song's words inside the scene, timed from the motion's start
                    pr = dict(pr, words=[{"text": w["text"], "start": round(w["start"] - at, 3), "end": round(w["end"] - at, 3)}
                                         for w in S.words_between(L["start"], L["start"] + L["dur"])])
                elif pr.get("words") == "voice":             # no scene voice: the film-level voice-over's words inside the scene
                    from audio.transcribe import film_words
                    fw = [w for w in film_words(p, spec) if L["start"] - 0.02 <= w["start"] < L["start"] + L["dur"]]
                    if not fw: raise SystemExit(f"scene {s['id']}: \"words\": \"voice\" found no voice words in this scene (scene voice or film-level voice)")
                    pr = dict(pr, words=[{"text": w["text"], "start": round(w["start"] - at, 3), "end": round(w["end"] - at, 3)} for w in fw])
                calls.append(f'AIMK.run(tl, {json.dumps(m["preset"])}, {json.dumps(m["target"])}, {round(at, 4)}, {json.dumps(pr)});')
        scenes_end = round(lay[-1]["start"] + lay[-1]["dur"], 6)
        if spec.get("slides"):                               # a deck: HyperFrames' presenter only seeks the root timeline (no clip gating there),
            calls.append("window.__aimkScene = null;")       # so each scene shows itself on its own window (hidden before by its style)
            for s, L in zip(spec["scenes"], lay):
                el = f'document.getElementById({json.dumps(s["id"])})'
                if L["start"] > 0: calls.append(f'tl.set({el}, {{ visibility: "visible" }}, {round(L["start"], 4)});')
                if L["start"] + L["dur"] < total - 1e-4: calls.append(f'tl.set({el}, {{ visibility: "hidden" }}, {round(L["start"] + L["dur"], 4)});')
        for Ly in spec.get("layers") or []:                 # film-level layers: shown from "from" to "to" (default: until the end tag)
            a = S.time(Ly.get("from", 0), f"layer {Ly['id']} from"); b = S.time(Ly["to"], f"layer {Ly['id']} to") if Ly.get("to") is not None else scenes_end
            el = f'document.getElementById({json.dumps(Ly["id"])})'
            calls.append(f'window.__aimkScene = null;')
            if a > 0: calls.append(f'tl.set({el}, {{ visibility: "visible", opacity: 1 }}, {round(a, 4)});')   # hidden before by its own style (layer_html)
            if b < total - 1e-4: calls.append(f'tl.set({el}, {{ visibility: "hidden", opacity: 0 }}, {round(b, 4)});')
            for m in Ly.get("motion", []):
                at = S.time(m.get("at", 0), f"layer {Ly['id']} {m['preset']}")
                pr = local_times(m["preset"], m.get("params", {}), at, S, p, f"layer {Ly['id']} {m['preset']}")
                calls.append(f'AIMK.run(tl, {json.dumps(m["preset"])}, {json.dumps(m["target"])}, {round(at, 4)}, {json.dumps(pr)});')
        if spec.get("groove"):                              # after every scene and layer motion (masks and layers exist): the groove layers
            calls.append('window.__aimkScene = null;')
            calls.append(f'AIMK.groove(tl, {json.dumps(groove_config(spec, S, scenes_end), ensure_ascii=False)});')
        draft =(head + f"<script>{runtime}</script>\n<script>{preset_js}</script>\n<script>\n(async () => {{ try {{ await Promise.all(" + json.dumps(["40px \"RFlex\"", "40px \"RMono\"", "italic 40px \"RMono\""] + [f'{x.get("style", "normal")} {str(x.get("weight", "400")).split()[0]} 40px "{x["family"]}"' for x in spec.get("fonts") or []]) + ".map(f => document.fonts.load(f).catch(() => {{}}))); await document.fonts.ready;\n"
                 "const tl = gsap.timeline({ paused: true }); window.__aimkTL = tl;\n" + CENTER_JS + "\n" + "\n".join(calls) + "\nwindow.__timelines = { root: tl }; window.__aimkDone = true; } catch (e) { window.__aimkErr = String((e && e.stack) || e); } })();\n</script>\n</body>\n</html>\n").replace("%PRESET_STYLES%", "")
        if draft_out: Path(draft_out).write_text(draft, encoding="utf-8")
        Quiet.overrides[rel] = draft.encode("utf-8")
        async with async_playwright() as pw:
            b = await launch(pw); pg = page_timeouts(await b.new_page(viewport={"width": 1920, "height": 1080}))
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(base.rstrip("/") + rel)
            try: await pg.wait_for_function("window.__aimkDone === true || window.__aimkErr", timeout=120000)
            except Exception:                            # 08/10/2026 (test 4): a preset error inside the async draft script left only
                await b.close()                          # "Timeout 60000ms"; now the page's own errors are printed
                raise SystemExit("the draft never finished (120 s)" + (": " + errs[0] if errs else ": no page error; a preset may wait forever"))
            err = await pg.evaluate("window.__aimkErr || null")
            if err or errs: await b.close(); raise SystemExit("preset error: " + (err or errs[0]))
            res = await pg.evaluate(BAKE_JS.replace("%SKIP%", json.dumps(sorted(SKIP))))
            # scene ends: last tween end inside each scene (for "auto")
            res["ends"] = {}
            for s, L in zip(spec["scenes"], lay):
                ids = await pg.evaluate("id => [...document.getElementById(id).querySelectorAll('[id]')].map(e => '#' + e.id).concat(['#' + id + 'in'])", s["id"])
                ends = [t["at"] + t["duration"] * (1 + t["repeat"]) - L["start"] for t in res["tweens"] if "error" not in t and set(t["targets"]) & set(ids)]
                ends += [c["end"] - L["start"] for c in res.get("codeEnds") or [] if c["scene"] == s["id"]]   # ctx.code proxies (typewriter, morph-text...)
                res["ends"][s["id"]] = max(ends) if ends else 0.0
            await b.close()
        return res, total

    lay = layout(spec, S)
    res, total = asyncio.run(run(lay))
    if any(isinstance(s.get("duration"), str) for s in spec["scenes"]):          # "auto": last motion + hold, then build again
        for s in spec["scenes"]:
            if s.get("duration") == "auto": s["_dur"] = round(max(res["ends"][s["id"]] + s.get("hold", 1.5), s.get("_vneed", 0)), 3)
        lay = layout(spec, S); res, total = asyncio.run(run(lay))
    srv.shutdown()
    for s, L in zip(spec["scenes"], lay):                # sound effects on song references -> seconds from their scene's start
        for c in s.get("sfx") or []:
            if SONG.is_ref(c.get("at")): c["at"] = round(S.time(c["at"], f"scene {s['id']} sfx") - L["start"], 4)
    spec["_film_sfx"] = [dict(c, t=round(S.time(c.get("at", 0), "film sfx"), 4)) for c in spec.get("sfx") or []]
    errs = [t for t in res["tweens"] if "error" in t]
    if errs: raise SystemExit(f"cannot write out {len(errs)} tween(s): {errs[:3]}")
    if res.get("empty"): say(f"  note: {len(res['empty'])} tween(s) matched no element (an empty query in a preset), left out: at {res['empty'][:6]}")
    ovl = fix_overlaps(res["tweens"], say)
    head, total = page(spec, lay, False)
    head = head.replace("%PRESET_STYLES%", "".join(f'<style data-aimk-preset="{html.escape(k)}">\n{v.strip()}\n</style>\n' for k, v in res["styles"].items()))
    clips = final_audio(p, spec, lay, total, res.get("sfx") or [], say)
    stage_html = res["stage"].strip("\n") + audio_html(clips)
    subs = film_srt(p, clips)                            # every transcribed voice line at its film time
    if subs: say(f"  subtitles: {subs.relative_to(p).as_posix()}")
    head = head[:head.index('<div id="stage"')] + f'<div id="stage" data-composition-id="root" data-width="{spec.get("size", [1920, 1080])[0]}" data-height="{spec.get("size", [1920, 1080])[1]}" data-duration="{total}" data-fps="{FPS}">\n' + stage_html.strip("\n") + "\n</div>\n<script src=\"assets/vendor/gsap.min.js\"></script>\n" + "".join(f'<script src="assets/vendor/{x}"></script>\n' for x in spec.get("_scripts", []))
    seen = {}
    lines = [tween_line(t, seen) for t in res["tweens"]]
    script = ("<script>\n  " + CENTER_JS + "\n  const tl = gsap.timeline({ paused: true });\n" + "\n".join("  " + l for l in lines)
              + ("\n" + "\n".join("  {\n" + c + "\n  }" for c in res["codes"]) if res["codes"] else "") + '\n  window.__timelines = window.__timelines || {};\n  window.__timelines["root"] = tl;\n</script>\n</body>\n</html>\n')
    out = Path(out) if out else p / "index.html"
    if out.exists() and out.name == "index.html" and out.parent == p:
        bk = p / "qa" / "backup"; bk.mkdir(parents=True, exist_ok=True)
        shutil.copy2(out, bk / f"index.{time.strftime('%Y%m%d-%H%M%S')}.html")
    out.write_text(head + script, encoding="utf-8")
    if report is not None: report.update(tweens=len(lines), codes=len(res["codes"]), styles=sorted(res["styles"]), notes=res["notes"], duration=total,
                                         overlaps={"shortened": ovl[0], "check": ovl[1]})
    say(f"built {out}: {len(spec['scenes'])} scenes, {len(lines)} tweens, {total:.2f} s" + (f", {len(res['codes'])} code block(s)" if res["codes"] else ""))
    return out
