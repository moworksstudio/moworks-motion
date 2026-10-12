"""Captions inside talking-head footage: HyperFrames' embedded captions (engine/vendor/hf-captions, as shipped; 11/10/2026, the user:
"cái nào của HF hay hơn thì ưu tiên lấy của HF"). The kit runs HF's own scripts and compilers; around them it does only what a kit film
needs:

  prepare   kit.py cutout <film> <clip> --people --captions
            The clip at its own frame rate (HF's rule: the rounded average rate) through the kit's cut-out, which is HF's matte (the same
            model and maths as `hyperframes remove-background`: u2net_human_seg, 320 px input, ImageNet normalisation, lanczos back; no
            second download): the footage frames and the person for the film (assets/video/frames|cutout/<clip>/) and HF's frames_bg/,
            frames_fg/, matte.fps in the caption project. The words: kit.py transcribe's Whisper (the same model size HF's transcribe.cjs
            runs, already on this machine) -> HF's transcript.json; the sound -> audio/voice/<clip>.wav (the scene's voice). Then HF's
            audio-envelope.cjs and safe-zones.cjs, as shipped.
  compile   kit.py build, for every text/embedded-captions layer: when theme.json / cinematic.json is newer than the pages (or the skill
            changed), HF's make-theme.cjs / make-cinematic.cjs, inject-fonts.cjs and HF's gates (check-timing, check-occlusion,
            check-overflow, check-rail-climax), as shipped; the pages, plan.json and _postfx.sh are copied into the film with captions.json
            (what the preset needs: size, frames, which layer is on top, the plate reaction read from _postfx.sh).

The film plays HF's pages live (library preset text/embedded-captions, engine/vendor/libs/hf/hf-frame.js); HF's render step (hyperframes
render + the ffmpeg composite) is not used: the kit's exports draw the same layers in the same order, and the AE port keeps the words as text.

Folders: the caption project (frames: big, never on Drive) %USERPROFILE%\\.aimotionkit\\work\\captions\\<film>\\<clip>\\; what Claude
reads and writes: 03_HTML\\assets\\captions\\<clip>\\ (transcript.json, safe-zones.json, envelope.json, sheet.jpg; theme.json or
cinematic.json; then the pages). HF's scripts find sharp and puppeteer (the HyperFrames install's, puppeteer-core with its Chrome) and GSAP
(the kit's) in work\\hf-captions\\root (HYPERFRAMES_ROOT). Fonts: HF's family names with the kit's Vietnamese faces
(engine/vendor/hf-captions-vi, made by engine/tests/hf_captions_vi.py), laid over a working copy of the skill (work\\hf-captions\\skill-<key>).
Needs node and ffmpeg + ffprobe on PATH (HF's scripts call them by name)."""
import hashlib, json, os, re, shutil, subprocess, time
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent
HF = ENGINE / "vendor" / "hf-captions"
VI = ENGINE / "vendor" / "hf-captions-vi"


def _common():
    import sys
    if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
    import common
    return common


def hf_install():
    """(node_modules of the newest HyperFrames install with puppeteer-core and sharp, its Chrome headless shell)"""
    c = _common()
    base = c.LOCAL / "hyperframes"
    vers = sorted((d for d in base.iterdir() if (d / "node_modules" / "puppeteer-core").exists() and (d / "node_modules" / "sharp").exists()),
                  key=lambda d: [int(x) for x in re.findall(r"\d+", d.name)]) if base.exists() else []
    chrome = sorted((Path.home() / ".cache" / "hyperframes" / "chrome").rglob("chrome-headless-shell.exe" if os.name == "nt" else "chrome-headless-shell"))
    if not vers or not chrome: raise SystemExit("HyperFrames (its puppeteer-core, sharp and Chrome) is not installed: run install.bat (or kit.py hf install)")
    return vers[-1] / "node_modules", chrome[-1]


def _need():
    c = _common()
    node = c.node_exe()
    if not node: raise SystemExit("Node.js is not installed: run install.bat")
    if not shutil.which("ffprobe") or not shutil.which("ffmpeg"):
        raise SystemExit("HF's caption scripts call ffmpeg and ffprobe by name and they are not on PATH: install FFmpeg (winget install Gyan.FFmpeg), "
                         "then open a new chat")
    return node


def skill():
    """a working copy of HF's skill with the kit's Vietnamese faces laid over its fonts (made once per version of both)"""
    c = _common()
    man = json.loads((HF / "MANIFEST.json").read_text(encoding="utf-8"))
    bad = [f for f, h in man["sha256"].items() if not c.as_shipped(HF / f, h)]
    if bad: raise SystemExit(f"engine/vendor/hf-captions is not as shipped (SHA-256): {', '.join(bad[:5])}")
    vi = sorted(VI.rglob("*.*"))
    key = hashlib.sha256((json.dumps(man["sha256"], sort_keys=True) + "".join(f"{f.name}{f.stat().st_size}" for f in vi if f.name != "desktop.ini")).encode()).hexdigest()[:10]
    d = c.work_dir("hf-captions") / f"skill-{key}"
    if (d / ".ready").exists(): return d, key
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(HF, d, ignore=shutil.ignore_patterns("desktop.ini", "MANIFEST.json"))
    fonts = d / "modes" / "standard" / "fonts"
    for f in (VI / "files").glob("*.woff2"): shutil.copy2(f, fonts / "files" / f.name)
    shutil.copy2(VI / "char-widths.json", d / "assets" / "fonts" / "char-widths.json")
    r = subprocess.run([_need(), str(fonts / "build-fonts-css.cjs")], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode: raise SystemExit("HF build-fonts-css.cjs: " + (r.stderr or r.stdout)[-400:])
    (d / ".ready").write_text(time.strftime("%Y-%m-%d %H:%M"), encoding="utf-8")
    return d, key


def root():
    """HYPERFRAMES_ROOT for HF's scripts: node_modules/sharp and puppeteer (the HyperFrames install's; puppeteer-core told where its Chrome
    is), node_modules/gsap/dist/gsap.min.js (the kit's copy)"""
    c = _common()
    nm, chrome = hf_install()
    r = c.work_dir("hf-captions", "root"); m = r / "node_modules"
    for name, js in (("sharp", f"module.exports = require({json.dumps(str(nm / 'sharp'))});\n"),
                     # puppeteer-core 25 is an ES module: require() gives its read-only namespace, so the shim exports a copy; a script
                     # that passes executablePath: undefined (its own Chrome not found) gets the install's Chrome too
                     ("puppeteer", f"const p = require({json.dumps(str(nm / 'puppeteer-core'))});\n"
                                   f"module.exports = Object.assign({{}}, p, {{ launch: (o = {{}}) => p.launch(Object.assign({{}}, o, "
                                   f"{{ executablePath: o.executablePath || {json.dumps(str(chrome))} }})) }});\n")):
        (m / name).mkdir(parents=True, exist_ok=True)
        (m / name / "package.json").write_text(json.dumps({"name": name, "main": "index.js"}), encoding="utf-8")
        (m / name / "index.js").write_text(f"// kit shim (engine/intake/captions.py): HF's caption scripts load {name} from here\n" + js, encoding="utf-8")
    g = m / "gsap" / "dist"; g.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ENGINE / "vendor" / "gsap" / "gsap.min.js", g / "gsap.min.js")
    return r


def run_node(script, *args, timeout=900, check=True):
    sd, _ = skill()
    env = dict(os.environ, HYPERFRAMES_ROOT=str(root()), PYTHONIOENCODING="utf-8")
    r = subprocess.run([_need(), str(sd / "scripts" / script), *map(str, args)], capture_output=True, text=True, encoding="utf-8",
                       errors="replace", env=env, timeout=timeout)
    out = (r.stdout or "") + (r.stderr or "")
    if check and r.returncode: raise SystemExit(f"HF {script} failed:\n" + out[-1500:])
    return r.returncode, out


def project_dir(p, name):
    c = _common()
    return c.work_dir("captions", c.film_name(p), name)


def probe(src):
    """(fps HF's way: the rounded average rate, width, height, duration)"""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=avg_frame_rate,r_frame_rate,width,height:format=duration",
                        "-of", "json", str(src)], capture_output=True, text=True, check=True)
    j = json.loads(r.stdout); s = j["streams"][0]
    rate = lambda e: (lambda a, b: float(a) / float(b or 1))(*(str(e or "0/1").split("/") + ["1"])[:2]) if e else 0.0
    f = rate(s.get("avg_frame_rate")) or rate(s.get("r_frame_rate"))
    return max(1, round(f)) if f > 0 else 24, int(s["width"]), int(s["height"]), float(j["format"]["duration"])


def prepare(p, src, say=print, fps=0, force=False):
    """the clip -> the film's frames + the caption project (matte, words, envelope, safe zones); returns the film's caption folder"""
    from intake.cutout import video_matte, session
    from audio.transcribe import transcribe_file, words_file
    from audio.loudness import ffmpeg
    p, src = Path(p), Path(src)
    name = src.stem
    node = _need(); skill(); root()
    nat, w, h, dur = probe(src)
    fps = fps or nat
    proj, out = project_dir(p, name), p / "assets" / "captions" / name
    out.mkdir(parents=True, exist_ok=True)
    say(f"  {src.name}: {w}x{h}, {dur:.2f} s, {fps} fps ({'its own rate' if fps == nat else f'asked; its own rate is {nat}'})")
    if force or not (proj / "source.mp4").exists() or (proj / "source.mp4").stat().st_size != src.stat().st_size:
        shutil.copy2(src, proj / "source.mp4")
    fg = proj / "frames_fg"
    if force or not fg.exists() or (proj / "matte.fps").read_text(encoding="utf-8").strip() != str(fps) if (proj / "matte.fps").exists() else True:
        video_matte(p, src, session("people"), fps, say, hf=proj)
        (proj / "matte.fps").write_text(str(fps), encoding="utf-8")
    else:
        say(f"  the matte is there ({len(list(fg.glob('*.png')))} frames): kept (--force makes it again)")
    # the voice: the clip's sound for the scene (audio/voice/<clip>.wav) and its words (audio/transcript/<clip>.words.json, kit.py transcribe's file)
    wav = p / "audio" / "voice" / f"{name}.wav"
    if force or not wav.exists():
        wav.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "2", "-ar", "48000", str(wav)], check=True)
    wf = words_file(p, wav)
    if force or not wf.exists() or wf.stat().st_mtime < wav.stat().st_mtime:
        say("  words (Whisper, on this machine)...")
        toks, lang = transcribe_file(wav)
        wf.parent.mkdir(parents=True, exist_ok=True)
        wf.write_text(json.dumps(toks, ensure_ascii=False, indent=1), encoding="utf-8")
    else:
        toks, lang = json.loads(wf.read_text(encoding="utf-8")), None
    if not toks: say("  !! no words were heard: HF's rule is to refuse a clip with no speech")
    tr = {"text": " ".join(t["text"] for t in toks), "language_code": lang or "vi", "words": [dict(t, type="word") for t in toks]}
    (proj / "transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
    say("  HF audio-envelope.cjs, safe-zones.cjs...")
    run_node("audio-envelope.cjs", proj, check=False)
    _, zs = run_node("safe-zones.cjs", proj)
    # a contact sheet at 1 frame a second (HF's decision gate: burned-in text, cuts, a second speaker show up only mid-clip)
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(src), "-vf", "fps=1,scale=320:-1,tile=8x6", "-frames:v", "1", "-q:v", "4", str(out / "sheet.jpg")], check=True)
    for f in ("transcript.json", "safe-zones.json", "envelope.json"):
        if (proj / f).exists(): shutil.copy2(proj / f, out / f)
    (out / "source.json").write_text(json.dumps({"clip": os.path.relpath(src, p).replace("\\", "/") if src.drive == p.drive else str(src),
                                                 "fps": fps, "size": [w, h], "duration": round(dur, 3), "frames": len(list(fg.glob("*.png"))),
                                                 "voice": f"audio/voice/{name}.wav"}, indent=1), encoding="utf-8")
    say("\n".join("    " + x for x in zs.strip().splitlines()[-14:]))
    say(f"  -> {out.relative_to(p).as_posix()}/: transcript.json (fix names in {wf.relative_to(p).as_posix()}, then run this again), safe-zones.json, "
        f"sheet.jpg (1 frame a second); the scene's voice: audio/voice/{name}.wav. Next: pick ONE identity from "
        f"engine/vendor/hf-captions/CATALOG.md and write theme.json or cinematic.json there.")
    return out


def _authored(d):
    a = [d / f for f in ("theme.json", "cinematic.json") if (d / f).exists()]
    if len(a) > 1: raise SystemExit(f"{d}: theme.json AND cinematic.json: keep one (the identity's engine)")
    return a[0] if a else None


JS_NAMES = {"time": "t", "iw": "IW", "ih": "IH", "zoom": "Z", "exp": "Math.exp", "sin": "Math.sin", "cos": "Math.cos", "between": "B", "PI": "Math.PI"}


def _js(expr):
    """an ffmpeg zoompan expression (HF's _postfx.sh) -> the same maths in JS; anything but numbers, operators and these names is refused"""
    e = re.sub(r"\s+", "", expr)
    if not re.fullmatch(r"[0-9.+\-*/(),A-Za-z_]*", e) or set(re.findall(r"[A-Za-z_]+", e)) - set(JS_NAMES):
        raise SystemExit(f"_postfx.sh: an expression the kit does not know: {expr[:120]}")
    return re.sub(r"[A-Za-z_]+", lambda m: JS_NAMES[m.group(0)], e)


def plate(sh):
    """HF's plate reaction (_postfx.sh: zoompan punch / shake / push-in, rgbashift, grain) as data for the preset"""
    if not sh.exists(): return None
    t = sh.read_text(encoding="utf-8")
    out = {}
    m = re.search(r"zoompan=\s*z='([^']*)':\s*x='([^']*)':\s*y='([^']*)':\s*d=1:s=(\d+)x(\d+)", t)
    if m: out.update(z=_js(m[1]), x=_js(m[2]), y=_js(m[3]), iw=int(m[4]), ih=int(m[5]))
    m = re.search(r"rgbashift=rh=-?([\d.]+):bh=[\d.]+:enable='([^']*)'", t)
    if m: out["rgb"] = {"px": float(m[1]), "on": [[float(a), float(b)] for a, b in re.findall(r"between\(t,([\d.]+),([\d.]+)\)", m[2])]}
    m = re.search(r"noise=alls=([\d.]+)", t)
    if m: out["grain"] = float(m[1])
    return out or None


def _attr(html, name):
    m = re.search(rf'<div[^>]*id="root"[^>]*\s{name}="([^"]+)"', html, re.S) or re.search(rf'\s{name}="([^"]+)"', html)
    return m.group(1) if m else None


def compile(p, name, say=print, force=False):
    """theme.json / cinematic.json -> HF's pages in the film (only when the authored file or the skill changed); returns captions.json's data"""
    p = Path(p); d = p / "assets" / "captions" / name
    a = _authored(d)
    if not a: raise SystemExit(f"text/embedded-captions: {d.relative_to(p).as_posix()} has no theme.json or cinematic.json yet "
                               f"(kit.py cutout <film> <clip> --people --captions first, then write one)")
    sd, key = skill()
    cj = d / "captions.json"
    old = json.loads(cj.read_text(encoding="utf-8")) if cj.exists() else {}
    if not force and old.get("skill") == key and old.get("authored") == a.name and (d / "index.html").exists() \
            and (d / "index.html").stat().st_mtime >= a.stat().st_mtime and cj.stat().st_mtime >= a.stat().st_mtime:
        return old
    src = json.loads((d / "source.json").read_text(encoding="utf-8")) if (d / "source.json").exists() else None
    proj = project_dir(p, name)
    if not (proj / "frames_fg").exists() or not (proj / "transcript.json").exists():
        if not src: raise SystemExit(f"{d}: no source.json: run kit.py cutout <film> <clip> --people --captions")
        c = _common()
        say(f"  {name}: the caption project is not on this machine: preparing it again from {src['clip']}")
        prepare(p, c.in_film(p, Path(src["clip"])), say, fps=src.get("fps") or 0)
    # the words Claude may have corrected in the film win over the project's
    if (d / "transcript.json").exists(): shutil.copy2(d / "transcript.json", proj / "transcript.json")
    for f in ("index.html", "rail.html", "index_fg.html", "plan.json", "_postfx.sh", "theme.json", "cinematic.json"):
        if (proj / f).exists(): (proj / f).unlink()
    shutil.copy2(a, proj / a.name)
    say(f"  {name}: HF {'make-theme' if a.name == 'theme.json' else 'make-cinematic'}.cjs ...")
    _, log = run_node("make-theme.cjs" if a.name == "theme.json" else "make-cinematic.cjs", proj)
    run_node("inject-fonts.cjs", proj, check=False)
    gates = _gates(proj)
    for f in ("index.html", "rail.html", "index_fg.html", "plan.json", "_postfx.sh"):
        if (proj / f).exists(): shutil.copy2(proj / f, d / f)
        elif (d / f).exists(): (d / f).unlink()                 # a page the new compile no longer makes (generated: no user data)
    html = (d / "index.html").read_text(encoding="utf-8")
    plan = json.loads((d / "plan.json").read_text(encoding="utf-8")) if (d / "plan.json").exists() else {}
    layer = plan.get("caption_layer") or _attr(html, "data-caption-layer") or "bg"
    nfr = len(list((proj / "frames_fg").glob("*.png")))
    fps = int((proj / "matte.fps").read_text(encoding="utf-8").strip() or 30)
    data = {"about": "written by kit.py build (engine/intake/captions.py) for the preset text/embedded-captions: do not edit",
            "skill": key, "authored": a.name, "clip": name,
            "w": int(float(_attr(html, "data-width") or 1280)), "h": int(float(_attr(html, "data-height") or 720)),
            "duration": float(_attr(html, "data-duration") or 0), "fps": fps, "frames": nfr,
            "footage": f"assets/video/frames/{name}/f", "person": f"assets/video/cutout/{name}/f",
            "pages": {"index": "index.html", "rail": "rail.html" if (d / "rail.html").exists() else None,
                      "fg": "index_fg.html" if (d / "index_fg.html").exists() else None},
            "layer": layer, "plate": plate(d / "_postfx.sh"), "gates": gates,
            "log": [x for x in log.splitlines() if x.strip()][-12:]}
    cj.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    (d / "gates.txt").write_text("\n".join(gates) + "\n", encoding="utf-8")
    for x in data["log"][-4:]: say("    " + x)
    for g in gates: say(("  !! " if " FAIL" in g else "    ") + g)
    return data


def _gates(proj):
    """HF's gates on the compiled pages (render-and-composite.sh's list and order); one line each: '<gate> PASS|FAIL|skipped ...'"""
    out = []
    def gate(label, script, *args, timeout=240):
        try:
            rc, log = run_node(script, proj, *args, check=False, timeout=timeout)
        except subprocess.TimeoutExpired:
            out.append(f"{label} skipped (no answer in {timeout} s)"); return
        last = [x for x in log.splitlines() if x.strip()]
        if script == "check-occlusion.cjs": rc = 2 if "cap(s) FAIL" in log else 0     # HF reads the verdict, not the exit code
        out.append(f"{label} {'PASS' if rc == 0 else 'FAIL'}" + (f": {' | '.join(last[-3:])[:400]}" if rc else ""))
    if (proj / "plan.json").exists():
        gate("timing", "check-timing.cjs", "--strict")
        gate("occlusion+overflow", "check-occlusion.cjs", "--strict", timeout=180)
    elif (proj / "index.html").exists():
        gate("overflow(index)", "check-overflow.cjs")
    if (proj / "rail.html").exists():
        gate("overflow(rail)", "check-overflow.cjs", "rail.html")
        if (proj / "index.html").exists(): gate("rail-climax", "check-rail-climax.cjs")
    return out


def compile_film(p, spec, say=print):
    """kit.py build: every text/embedded-captions layer's clip compiled (when needed) before the film is built"""
    names = set()
    def walk(x):
        if isinstance(x, dict):
            pr = x.get("params") or {}
            if x.get("preset") == "text/embedded-captions" and not pr.get("dir"): names.add(str(pr.get("clip") or ""))   # dir: pages made elsewhere
            for v in x.values(): walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
    walk(spec)
    for n in sorted(names):
        if not n: raise SystemExit('text/embedded-captions: params.clip (the clip\'s name: assets/captions/<clip>/) is missing')
        compile(p, n, say)
