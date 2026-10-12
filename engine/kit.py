"""Moworks Motion: one command for everything (the .bat files in each project call this).

python kit.py new     <name> [--aspect 16:9|9:16|1:1|4:5] [--dir <folder>]   new film NN_Client_Film\\ in <folder> (the job's own folder;
                                                           default: the current folder): 01_Brief, 02_Assets, 03_HTML (index.html), 1. Preview.bat;
                                                           02_Assets fills with rounds and stills; 04_Renders (MP4, MOV) and 05_AE (Port to AE) come with the first export
python kit.py round   <project> film [--note "..."] [--base vK]   a round goes to the user: the film as it is now -> 02_Assets\\Rounds\\
                                                           Film_v<kk>\\ (film.json, index.html, presets, the assets / audio new in it);
                                                           exports take the newest number (<film>_vN_60fps_...). Prints the line to say in the chat
python kit.py round   <project> storyboard [A B C] [--note]   the storyboard sheets (kit.py storyboard) -> Storyboard_R<k>\\<name>.png
python kit.py round   <project> assets [kind=]<file> ... [--note]   asset sheets (kind: characters, locations, props; no file: the kit.py sheet
                                                           pictures and videos as characters) -> Assets_R<k>\\<kind>\\
python kit.py rounds  <project>                            every round, in order (the film rounds = the player's version list)
python kit.py restore <project> vK                         version K becomes the working film again ("[vK] Sửa tiếp từ bản này"; the working
                                                           film is kept as a round first). kit.py version = kit.py round <project> film
python kit.py build   <project>                            film.json (MotionSpec) -> index.html, motion written out for Studio
python kit.py info    <project>                            what the renderer sees: contract, size, duration, scenes
python kit.py mp4     <project> [--blur] [--out file.mp4]  finished film, H.264 High, 60 fps, sound inside, no motion blur unless --blur -> 04_Renders\\MP4\\
python kit.py mov     <project> [--no-blur] [--alpha] [--out file.mov]   finished film, ProRes 4444, 60 fps, sound inside, motion blur 180 deg
                                                           by default -> 04_Renders\\MOV\\ (reuses the last render of the same film); stems: Port to AE
python kit.py storyboard <project> [A B C]                gate 1 options (qa/storyboard/<name>.json, still films) built apart, a sheet each
python kit.py stills  <project> t1 t2 ... | --beats | --strip <t> | --cuts | --phone   stills + contact sheet -> 02_Assets\\Stills\\
python kit.py doctor                                       is this machine ready: Python, packages, Chromium, ffmpeg, models,
                                                           AE fonts, kit-root, skill versions, git, After Effects, player, disk (reads only)
python kit.py trash   <path> ...                           send files / folders to the Recycle Bin (never a permanent delete)
python kit.py beats   <project> [<audio>] [--bpm] [--offset]   a song's tempo grid, beats, bars, hits -> audio/transcript/<file>.beats.json,
                                                           a kick check under 120 Hz + its picture (02_Assets/Stills/beats/);
                                                           --fit: move where the music starts so the cuts and sound cues land on the beat
python kit.py align   <project> <lyrics.txt> [<audio>] [--pin "8=17.58"]   known lyrics -> a time per sung word (draft: check by ear)
python kit.py measure "<text>" --font <family> --size 140 [--weight 700] [--in <project>]   text width in px with the real font
python kit.py pdf     <file.pdf> [--pages 3-5] [--in <project>]   PDF pages as PNG (to see a guideline's pictures; needs PyMuPDF)
python kit.py voice | music | sfx-gen <project> ... [--yes]   ElevenLabs voice-over / music / sound effect (prints the cost; sends only with --yes)
python kit.py reframe <project> 9:16 [--name X]             the same film in another aspect as a new project (a scaled start to re-compose)
python kit.py reframe <new film> check                       after re-composing: every element and all content kept, scene times identical
python kit.py tidy    <project>                            an older project's root tidied (notes/, renders/ae, old launchers to the bin)
python kit.py ref     add <film.mp4|deck.pdf|folder> --name "..." | list   Moworks' own style references (brands/moworks/style-refs)
python kit.py verify  <project> [--samples 24] [--play]    determinism check (same pixels at t whatever was sought before; --play: played frames too)
python kit.py preview <project> [--port N] [--no-open]    the kit's review player (= 1. Preview.bat): notes, Export panel (MP4 / MOV / Port to AE);
                                                           --no-open: no window, print the link and serve until Ctrl+C
python kit.py sheet   <project> [--looks a,b] [--poses p,q]  character sheets for approval: the rig in every pose (video + 2x stills)
                                                           -> 02_Assets\\Stills\\sheet\\ (cast: presets\\cast\\**\\preset.js)
python kit.py sheet   <project> --puppets [a,b] [--hero <picture|video@s>]   the film's drawn puppets checked by machine (holes,
                                                           pieces, gaps at joints, every part alone, hero-frame diff) -> 02_Assets\\Stills\\puppets\\
python kit.py compare <project> <reference video> [--every 0.5] [--from a] [--to b] [--offset s]   the film beside a reference
                                                           at the same times: sheets + the most different times -> 02_Assets\\Stills\\compare\\
python kit.py feedback <project>                         the user's open notes (notes\\feedback.md), numbered; Done ones left out
python kit.py proxy   <project> [--workers N]              the player's smooth playback: the film rendered once, small (540 px), played while
                                                           the player runs (the live film when stopped); work folder only, nothing in the film
python kit.py brand   <project> <pack | look>              apply a brand pack (fonts, logos, assets/brand.css sized for the canvas) or a
                                                           public look of library/looks (colours, type; its FRAME.md has the rest)
python kit.py brand-check <project> <pack> [--brief [f]]   check the film against the pack (logo motion, colours, fonts, lettermark, frame 0); --brief: the brief vs the guideline
python kit.py lint    <project> [--hf]                     the v2 lint (also after every build): reading time, logo motion, text over text / out of
                                                           the margin at rest, blank frames after cuts; --hf: HyperFrames' linter
python kit.py qa      <project>                            motion QA on the last MOV / MP4 render: pops, one-frame flashes, still time, > 3 flashes/s
python kit.py font    "<family>" ["<family>" ...]          where a font is (installed or in a brand pack, .ttc included) and whether it has every Vietnamese letter
python kit.py loudness <file.wav|project> [--fix out.wav]  LUFS / LRA / true peak; --fix: two-pass normalise to -16 LUFS, true peak <= -4 dBTP;
                                                           a film: the sound pass (mix, exported MP4 + mono, effects over the bed, cuts
                                                           with no sound, cue sheet, five moments to check with headphones)
python kit.py ae      <project>                            editable After Effects project -> 05_AE\\ (.aep, footage, Audio\\ mix + stems; --run builds it
                                                           in the open AE; --estimate: its size first;
                                                           --rebuild: AE step again from the saved recording; --jsx <file>: a fix on the open project)
python kit.py library [motion|layout] [word ...]         the library, one line per preset (name, verdict, description, tags), for choosing
python kit.py library import <project> <preset> [--as group/name] [--layout]   a film's own preset -> "Mới nhập" (library/incoming), demo + checks
python kit.py library incoming | keep <name> | drop <name>   what waits in "Mới nhập"; Giữ (into the library) / Bỏ (Recycle Bin), as the Gallery's buttons
                                                             (import / keep / drop: the kit owner's machine only; drop also takes a library preset the kit does not use)
python kit.py pulse   <project> [--video f.mp4] [--from s --to s]   does the picture move ON the beat (lift, jolts, still frames; the A/B film B as reference)
python kit.py collide <project> [--step 0.05]             readable elements running into each other, blank frames at scene cuts -> qa\\collide.json
python kit.py transcribe <project> [file.wav] [--lang vi] [--prompt "names"]   voice -> words with times (local Whisper) -> audio\\transcript\\ (a file: before film.json has it)
python kit.py cutout <project> <image> ... [--people] [--trim]   background removal (local rembg) -> assets\\images\\cutout\\
python kit.py cutout <project> <video> --people [--fps 30]  the person cut out of every frame -> assets\\video\\cutout\\<name>\\ (text behind them)
python kit.py cutout <project> <video> --people --captions [--force]   + HyperFrames' embedded captions: words, safe zones -> assets\\captions\\<name>\\
python kit.py spectro <project> [<audio>] [--from 17 --to 26]   the singing as a picture (vocal band, beat grid, aligned words)
python kit.py poses   <project> <folder | "assets/images/seq/f####.webp">   a render sequence read first: rest poses, portals, brief\\POSES.md
python kit.py track   <project> "<stage>" | end | report    time, tokens and API-equivalent cost per stage -> qa\\tracking.md
python kit.py ingest  <project> "<deck.pptx>" [--slides 1-8] [--no-film]   PowerPoint / Google Slides deck -> deck\\ + still scenes
python kit.py ingest  <project> <owner/repo#N | PR url>  a pull request as the film's source -> 01_Brief\\pr\\ (Node.js + gh)
python kit.py psd     <project> "<file.psb>" --list | --frames "P01=G/1" [--keep "G/BG"]   PSD / PSB -> psd\\ + layers + still scenes
python kit.py gallery build [filter] | open                the library's demo clips and checks / the gallery page (= gallery.bat)
python kit.py studio  <project>                            HyperFrames Studio, only to edit a timeline by hand (asks before installing)
python kit.py studio  <project> --present                  a deck (film.json "slides"): HyperFrames' presenter, presenter notes + audience tab
python kit.py hf      status | install | test | update | rollback   HyperFrames versions (only when HyperFrames is used)

<project> = the film's folder (the one with 1. Preview.bat; its 03_HTML holds index.html), its 03_HTML, or an older film's folder
(index.html or a v1-style film.html inside), as a path or relative to the current folder.
Renders are written on the local disk (%USERPROFILE%\\.aimotionkit\\work) and only the finished files are copied into the film's folder.
Exports go to 04_Renders\\<MP4|MOV|PNG|Stills>\\ and the AE port to 05_AE\\ (older films: renders\\<kind>\\), dated, never overwritten,
one line each in 04_Renders\\EXPORTS.md."""
import argparse, html, json, os, shutil, subprocess, sys, time
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import (ASSETS, BRIEF, FPS, HTML, KIT, LOCAL, brief_dir, copy_into, default_workers, engine_hash, export_name, film_dir,      # noqa: E402
                    film_hash, film_name, film_root, log_export, proxy_state, renders, say, snapshot, versions, work_dir)

ASPECTS = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1200, 1200), "4:5": (1080, 1350)}
FOLDERS = ["notes", "assets/images", "assets/logos", "assets/fonts", "assets/video", "assets/vendor",      # inside 03_HTML; 04_Renders comes
           "audio/voice", "audio/music", "audio/sfx", "audio/transcript", "qa"]                          # with the first export


def project(arg):
    p = film_dir(Path(arg).resolve())
    for name in ("index.html", "film.html"):
        if (p / name).exists(): return p, p / name
    raise SystemExit(f"no index.html or film.html in {p}")


def film_url(film):
    """serve the kit folder (or, for a v1-style film outside v2, the kit folder two levels up) and return (url, server)"""
    from render.serve import serve_in_thread
    try: root = KIT; rel = film.relative_to(KIT)
    except ValueError:                                    # a project in the job's own folder (kit.py new --dir): its folder is the web root
        root = film.parent if film.name == "index.html" else film.parents[2]; rel = film.relative_to(root)
    base, srv = serve_in_thread(root)
    return base + rel.as_posix(), srv


def bat(path, lines):
    path.write_text("\r\n".join(["@echo off"] + lines + [""]), encoding="utf-8")


def project_name(raw, parent):
    """naming rule (user 05/10/2026): NN_Client_Project-Name - a running number, every word capitalised, words joined by '-', client and project by '_',
    ASCII only (no diacritics, no spaces: safe for After Effects, scripts and URLs). Test projects start with _Test_. The number counts the
    films already in `parent` (the job folder)."""
    import unicodedata
    s = unicodedata.normalize("NFD", raw.replace("đ", "d").replace("Đ", "D"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    parts = []
    for chunk in s.split("_"):
        words = [w for w in "".join(c if c.isalnum() else " " for c in chunk).split() if w]
        parts.append("-".join(w[:1].upper() + w[1:] for w in words))
    name = "_".join(p for p in parts if p) or "Untitled"
    if raw.startswith("_"): return "_" + name                         # test projects: _Test_..., no number
    if name.split("_")[0].isdigit(): return name                      # already numbered
    nums = [int(d.name.split("_")[0]) for d in parent.iterdir() if d.is_dir() and d.name.split("_")[0].isdigit()] if parent.exists() else []
    return f"{(max(nums) + 1) if nums else 1:02d}_{name}"             # 01_Client_Project-Name (user 05/10/2026)


def launcher(dst):
    """1. Preview.bat: the kit player (no HyperFrames), with the Export panel. It finds the kit through %USERPROFILE%\\.aimotionkit\\kit-root.txt
    (written by install.bat / update.bat), so a kit moved or updated keeps every film's launcher working; this kit's path is the fallback."""
    bat(dst / "1. Preview.bat", ["chcp 65001 >nul", 'set "KIT="',
                                 r'if exist "%USERPROFILE%\.aimotionkit\kit-root.txt" set /p KIT=<"%USERPROFILE%\.aimotionkit\kit-root.txt"',
                                 rf'if not exist "%KIT%\engine\kit.py" set "KIT={KIT}"',
                                 r'start "" pythonw "%KIT%\engine\kit.py" preview "%~dp0."'])


def cmd_ref(a):
    """kit.py ref sync | add <file | folder> [--name "..."] [--length 1] | list: Moworks' own references in library/refs/video (films: motion)
    and library/refs/image (layouts) (engine/refs.py)"""
    import refs
    if a.project == "list": return refs.listing(say)
    if a.project == "sync": return refs.sync(a.length or 1.0, say)
    if a.project == "add" and a.times: return refs.add(a.times[0], a.name or None, a.length or 1.0, say)
    raise SystemExit('usage: kit.py ref sync | kit.py ref add <film.mp4 | deck.pdf | image | folder> [--name "Client Film 2025"] [--length 1] | kit.py ref list')


def cmd_reframe(a):
    """kit.py reframe <project> <aspect> [--name X]: the same film in another aspect as a new project next to it (engine/reframe.py; a taller
    frame: engine/relayout.py "auto stack"); then build + one still per scene. Claude re-composes what reads badly (never a crop).
    kit.py reframe <new film> check: every element and all content of the source kept, scene times identical (only positions / sizes moved)"""
    import reframe as R
    from build import build
    p = _proj_dir(a.project)
    if not a.times: raise SystemExit("usage: kit.py reframe <project> 9:16 [--name <new name>] | kit.py reframe <new film> check")
    if a.times[0] == "check": sys.exit(1 if R.check(p, say) else 0)
    dst, spec = R.reframe(p, a.times[0], a.name or None, ASPECTS, FOLDERS, launcher, say)
    if spec.get("brand"):
        import brand
        brand.apply(dst, spec["brand"]); say(f"  {spec['brand']} pack applied again for {spec['size'][0]}x{spec['size'][1]}")
    build(dst, say=say)
    a2 = argparse.Namespace(project=str(dst), times=[], beats=True, phone=False, strip=None, cuts=False)
    cmd_stills(a2)
    say(f"Now look at every scene of {film_name(dst)} for {a.times[0]} ({renders(dst, 'stills') / 'beats' / 'sheet.png'}) and re-compose what "
        f"reads badly; then kit.py reframe \"{dst}\" check.")


def cmd_new(a):
    """a new film in the job's own folder (the chat's folder; default: the current folder), 08/10/2026 layout:
    NN_Client_Film\\ 1. Preview.bat, 01_Brief\\ (brief, lyrics, the user's original files), 02_Assets\\ (rounds and stills made for
    review), 03_HTML\\ (the film), and 04_Renders\\ (MP4 / MOV) on the first export (11/10/2026 layout). One launcher only (user 07/10/2026): the player, whose Export panel has MP4 Export, MOV Export and
    Port to AE."""
    w, h = ASPECTS[a.aspect]
    parent = Path(a.dir).resolve() if a.dir else Path.cwd()
    if not parent.is_dir(): raise SystemExit(f"--dir: no folder {parent}")
    a.project = project_name(a.project, parent)
    root = parent / a.project; dst = root / HTML
    if (dst / "index.html").exists() or (root / "index.html").exists(): raise SystemExit(f"{root} already has a film")
    for d in (BRIEF, ASSETS): (root / d).mkdir(parents=True, exist_ok=True)
    for d in FOLDERS: (dst / d).mkdir(parents=True, exist_ok=True)
    tpl = (ENGINE / "templates" / "film.html").read_text(encoding="utf-8")
    (dst / "index.html").write_text(tpl.replace("{{TITLE}}", html.escape(a.project)).replace("{{W}}", str(w)).replace("{{H}}", str(h)), encoding="utf-8")
    shutil.copy2(ENGINE / "vendor" / "gsap" / "gsap.min.js", dst / "assets" / "vendor" / "gsap.min.js")
    shutil.copy2(ENGINE / "vendor" / "fonts" / "RobotoFlex-var.woff2", dst / "assets" / "fonts" / "RobotoFlex-var.woff2")
    launcher(root)
    say(f"created {root}  ({a.aspect} {w}x{h}, {FPS} fps)\n  01_Brief: brief, lyrics + your files (never edited) · 02_Assets: rounds and stills for review · "
        f"03_HTML: the film (film.json -> 'kit.py build') · 04_Renders: MP4 / MOV · 05_AE: Port to AE\n'1. Preview.bat' opens the kit player "
        "(notes for Claude, and the Export panel: MP4 Export, MOV Export, Port to AE).")


def cmd_version(a):
    """kit.py version <project> [--note "..."] = kit.py round <project> film (kept for older notes and skills)"""
    a.kind, a.files = "film", []
    cmd_round(a)


def cmd_round(a):
    """kit.py round <project> film | storyboard [names] | assets [kind=]files: a round goes to the user (user 10/10/2026: every round in one
    folder, announced in the chat and shown in the player). Prints "Phim v3: ..." / "Storyboard · round 2: ...": Claude says that line in the chat."""
    from common import announce, new_round, rounds
    p, _ = project(a.project)
    if a.kind == "film":
        before = versions(p); k = snapshot(p, a.note or "", (a.base or "").strip())
        if before and k == before[-1][0]:
            say(f"{film_name(p)}: v{k} (no change since that version: no new round)"); return
        r = next(x for x in rounds(p) if x["kind"] == "film" and x["v"] == k)
        say(announce(r) + f"  -> {r['dir']}"); return
    files = []
    if a.kind == "storyboard":
        base = renders(p, "stills") / "storyboard"
        names = a.files or (sorted(x.name for x in base.iterdir() if (x / "sheet.png").is_file()) if base.is_dir() else [])
        for nm in names:
            f = base / nm / "sheet.png"
            if not f.is_file(): raise SystemExit(f"no storyboard sheet {f} (kit.py storyboard {a.project} {nm} first)")
            files.append((f, f"{nm}.png"))
    else:                                                # assets: kind=file or file (characters), or the kit.py sheet outputs
        specs = a.files or [f"characters={f}" for f in sorted((renders(p, "stills") / "sheet").glob("*")) if f.suffix.lower() in (".png", ".mp4", ".jpg")]
        for s in specs:
            kind, _, f = s.partition("=") if "=" in s and not Path(s).exists() else ("characters", "", s)
            if kind not in ("characters", "locations", "props"): raise SystemExit(f"{s}: the kind is characters, locations or props")
            f = Path(f) if Path(f).is_absolute() else (Path.cwd() / f if (Path.cwd() / f).exists() else p / f)
            if not f.is_file(): raise SystemExit(f"no file {f}")
            files.append((f, f"{kind}/{f.name}"))
    if not files: raise SystemExit("nothing to put in the round (make the sheets first)")
    if a.kind == "assets": _puppets_checked(p, a.force)
    r = new_round(p, a.kind, files, a.note or "")
    say(announce(r) + f"  -> {r['dir']}")
    for _, nm in files: say(f"  {nm}")


def _puppets_checked(p, force):
    """an asset round with drawn puppets goes out only after kit.py sheet --puppets checked them as they are now, with no hole and no loose
    piece (11/10/2026 test, the user: "vụ này tao đã fix code rồi mà sao giờ vẫn bị ta ?": a written rule was skipped twice, so it is a
    machine gate). --force: the problems were looked at and are meant (say so in the round's note)"""
    from qa.puppets import art_files
    files = art_files(p)
    if not files: return
    from common import renders
    f = renders(p, "stills") / "puppets" / "PUPPETS.json"
    rep = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    got = rep.get("puppets") or {}
    # each puppet against its own check time (older reports: one time for all)
    stale = [k for k, x in files.items() if k not in got or got[k].get("checked", rep.get("checked", 0)) < x.stat().st_mtime]
    if stale:
        msg = (f"drawn puppets changed since their check, or never checked: {', '.join(stale)}: kit.py sheet <film> --puppets "
               f"{','.join(stale)} first, look at the sheets")
    else:
        bad = [f"{k}: {got[k]['holes']} hole(s), {got[k]['pieces']} loose piece(s)" for k in files if got[k]["holes"] or got[k]["pieces"]]
        if not bad: return
        msg = "puppets with holes or loose pieces (" + "; ".join(bad) + "): fix them, or look at <name>_poses.png and add --force when they are meant"
    if force: say(f"  (--force: {msg})"); return
    raise SystemExit(msg)


def _round_args(a):
    """kit.py round <project> <film|storyboard|assets> [names / files]: the words after the project come in a.times"""
    if not a.times or a.times[0] not in ("film", "storyboard", "assets"):
        raise SystemExit("kit.py round <project> film | storyboard [A B C] | assets [kind=]<file> ...")
    a.kind, a.files = a.times[0], a.times[1:]
    return a


def _restore_args(a):
    if not a.times: raise SystemExit("kit.py restore <project> v2")
    a.version = a.times[0]
    return a


def cmd_rounds(a):
    from common import announce, live_changed, rounds
    p, _ = project(a.project)
    rs = rounds(p); old = [(k, d) for k, d in versions(p) if d.parent.name == "versions"]
    if not rs and not old: say(f"{film_name(p)}: no round yet"); return
    for k, d in old: say(f"  v{k} (older layout) -> {d}")
    for r in rs: say(f"  {announce(r)}  · {r['date']}  -> {r['dir'].name}")
    if versions(p) and live_changed(p): say(f"  (being edited: the working film differs from v{versions(p)[-1][0]}; kit.py round {a.project} film when it goes to the user)")


def cmd_restore(a):
    from common import restore
    p, _ = project(a.project)
    k = a.version.lstrip("vV")
    if not k.isdigit(): raise SystemExit("restore: a version like v2")
    back = restore(p, int(k))
    say(f"{film_name(p)}: v{k} is the working film again ({len(back)} file(s) put back). Rebuild nothing: its index.html came back too. "
        f"Fix the notes, then: kit.py round {a.project} film --base v{k} --note \"...\"")


def cmd_info(a):
    from render.capture import probe
    p, film = project(a.project); url, srv = film_url(film)
    info = probe(url); srv.shutdown()
    say(json.dumps({k: info[k] for k in ("contract", "w", "h", "duration", "markers", "stage")}, ensure_ascii=False, indent=1))


def render_png(p, film, blur, alpha, workers, tag="png", scale=1):
    """every frame at FPS on the local disk -> (info, local dir, frames, seconds); render.json there says what they show (film, blur, alpha,
    scale: 2 = 4K, the browser drawing twice the film's pixels on the same layout)"""
    from render.capture import frames, probe
    url, srv = film_url(film)
    try:
        info = probe(url)
        local = work_dir("render", film_name(p), f"{tag}_{FPS}fps" + ("_alpha" if alpha else "") + ("_blur" if blur else "") + ("_4k" if scale == 2 else ""))
        (local / "render.json").unlink(missing_ok=True)
        say(f"{film_name(p)}: {info['contract']} film, {info['w']}x{info['h']}" + (f" rendered at {int(info['w'] * scale)}x{int(info['h'] * scale)} (4K)" if scale != 1 else "")
            + f", {info['duration']:.2f} s -> {int(round(info['duration'] * FPS))} frames at {FPS} fps, "
            f"{workers} workers" + (", motion blur 180 deg" if blur else ""))
        n, secs = frames(url, local, FPS, workers, alpha, info, blur=blur, scale=scale)
    finally:
        srv.shutdown()
    from PIL import Image
    with Image.open(local / "s_000000.png") as im: px = list(im.size)        # what was really rendered (a 4K export with blur came out
    want = [int(round(info["w"] * scale)), int(round(info["h"] * scale))]     # 1920x1080 and was named "4K": 11/10/2026 test)
    if px != want: raise SystemExit(f"the frames came out {px[0]}x{px[1]}, not the {want[0]}x{want[1]} asked: nothing exported (a kit bug: tell Claude)")
    (local / "render.json").write_text(json.dumps({"frames": n, "fps": FPS, "alpha": bool(alpha), "blur": bool(blur), "scale": scale, "film": film_hash(p), "engine": engine_hash(),
                                                   "duration": info["duration"], "px": px}, indent=1), encoding="utf-8")
    return info, local, n, secs


def mix_audio(p, film, duration, dst):
    """the film's <audio> clips -> dst/mix.wav + stems (from frame 0, the film's loudness target, default -16 LUFS); returns the clip count"""
    if film.name != "index.html": return 0
    from audio.media import clips, master, targets
    cl = clips(film)
    if not cl: return 0
    g = master(p, cl, duration, dst); I, P = targets(p)
    say(f"Audio: {len(cl)} clip(s) -> {dst / 'mix.wav'} + stems\\voice|music|sfx.wav (from frame 0, {I:g} LUFS, true peaks under {P:g} dBTP, gain {g:+.1f} dB).")
    return len(cl)


VIDEO = {   # the player's [MP4 Export] [MOV Export] (user 08/10/2026: three buttons, MP4 / MOV / Port to AE; the PNG button is gone; MP4 and
            # MOV are finished films with their sound inside, MOV blur on by default and alpha; the stems come with Port to AE)
    "mp4": {"label": "MP4 Export", "ext": ".mp4", "pix": "yuv420p", "codec": "H.264 High CRF 12",
            "v": ["-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", "12", "-profile:v", "high", "-g", str(FPS * 2)],
            "a": ["-c:a", "aac", "-b:a", "320k", "-ar", "48000"], "tail": ["-movflags", "+faststart"]},
    "mov": {"label": "MOV Export", "ext": ".mov", "pix": "yuv444p10le", "codec": "ProRes 4444",
            "v": ["-c:v", "prores_ks", "-profile:v", "4", "-vendor", "apl0"],
            "a": ["-c:a", "pcm_s24le", "-ar", "48000"], "tail": []},
}


def encode_gif(frames_dir, out, n, width=1200, fps=24):
    """kit.py mp4 <film> --gif: a GIF for an X post / article (12/10/2026, the "Motion Lab" article): the 60 fps frames taken at 24 fps, 1200 px
    wide, ONE palette for the whole clip (no colour flicker between frames), ordered (bayer) dither; then the frame delays are rewritten
    5 x 40 ms + 1 x 50 ms, because a GIF stores hundredths of a second: 41.7 ms each rounds to 40 and the loop would run 4 % fast, off the
    beat. X's limits: 15 MB, 350 frames (about 14.5 s at 24 fps), up to 1280 x 1080."""
    import imageio_ffmpeg
    k = max(1, int(n * fps / FPS))
    pick = Path(out).parent / "_gif_frames"; pick.mkdir(parents=True, exist_ok=True)
    for i in range(k): shutil.copy2(Path(frames_dir) / f"s_{min(n - 1, round(i * FPS / fps)):06d}.png", pick / f"g_{i:05d}.png")
    vf = (f"scale={width}:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];"
          f"[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle")
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error", "-framerate", str(fps), "-i", str(pick / "g_%05d.png"),
                    "-vf", vf, "-loop", "0", str(out)], check=True)
    shutil.rmtree(pick, ignore_errors=True)
    b = bytearray(Path(out).read_bytes()); i = 13; f = 0                    # the GIF's blocks: each Graphic Control Extension gets its delay
    if b[10] & 0x80: i += 3 * (2 << (b[10] & 7))
    pattern = [4, 4, 4, 4, 4, 5] if fps == 24 else [round(100 / fps)]
    while i < len(b) and b[i] != 0x3B:
        if b[i] == 0x21:
            if b[i + 1] == 0xF9: d = pattern[f % len(pattern)]; b[i + 4], b[i + 5] = d & 0xFF, d >> 8; f += 1
            i += 2
            while b[i]: i += b[i] + 1
            i += 1
        elif b[i] == 0x2C:
            pk = b[i + 9]; i += 10
            if pk & 0x80: i += 3 * (2 << (pk & 7))
            i += 1
            while b[i]: i += b[i] + 1
            i += 1
        else: break
    Path(out).write_bytes(bytes(b))
    mb = Path(out).stat().st_size / 1e6
    say(f"GIF {k} frames at {fps} fps, {width} px wide, {mb:.1f} MB -> {out}" + ("  (over X's 15 MB: shorter, smaller or fewer colours)" if mb > 15 else "")
        + ("  (over X's 350 frames)" if k > 350 else ""))
    return out


def encode_video(frames_dir, wav, out, n, fmt="mp4", say=say, alpha=False):
    """lossless PNG -> MP4 (H.264 High 4:2:0, CRF 12, tune animation: small, plays everywhere; the test film's export_mp4.py, 07/10/2026) or
    MOV (ProRes 4444 10-bit, no chroma subsampling: close to the player's pixels, big files; what HyperFrames' MOV gave). BT.709 tagged,
    accurate RGB -> YUV; the film's mix.wav (AAC 320k in the MP4, PCM 24-bit in the MOV). alpha (MOV): ProRes 4444 with its alpha channel
    from RGBA frames. Progress lines "encoding i/n"."""
    import imageio_ffmpeg
    V = VIDEO[fmt]
    rgb2yuv = "scale=out_color_matrix=bt709:out_range=tv:flags=spline+accurate_rnd+full_chroma_int+full_chroma_inp"
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error", "-nostats", "-progress", "pipe:1",
           "-framerate", str(FPS), "-start_number", "0", "-i", str(Path(frames_dir) / "s_%06d.png")]
    has_audio = bool(wav and Path(wav).exists())
    if has_audio: cmd += ["-i", str(wav), "-map", "0:v", "-map", "1:a"]
    pix = V["pix"].replace("yuv444", "yuva444") if alpha and fmt == "mov" else V["pix"]
    cmd += ["-vf", f"{rgb2yuv},format={pix},setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv", *V["v"],
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv"]
    if has_audio: cmd += V["a"]
    cmd += ["-t", f"{n / FPS:.4f}", *V["tail"], str(out)]
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    t0 = time.time(); last = 0
    pr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    for line in pr.stdout:
        if line.startswith("frame="):
            f = int(line.split("=")[1] or 0)
            if f - last >= max(1, n // 50) or f >= n: last = f; say(f"  encoding {f}/{n}")
    err = pr.stderr.read(); pr.wait()
    if pr.returncode: raise SystemExit(f"ffmpeg failed: {err.strip()[-400:]}")
    say(f"  encoded {Path(out).name}: {Path(out).stat().st_size / 1e6:.0f} MB in {time.time() - t0:.0f} s")


def export_video(a, fmt):
    """the player's [MP4 Export] / [MOV Export], both finished films with their sound inside (user, 08/10/2026: no stems beside them; the
    stems come with Port to AE). MP4: H.264, no motion blur unless --blur. MOV: ProRes 4444, motion blur 180 deg by default (--no-blur: off,
    e.g. pixel art or hand-drawn frames), --alpha: transparent where the film has no background. Frames are rendered on the local disk; the
    last render of the same film (same blur / alpha, same renderer) is reused.
    -> 04_Renders/<MP4|MOV>/<film>_vN_60fps_<date-time>.<ext> (or --out)"""
    V = VIDEO[fmt]
    p, film = project(a.project)
    blur = bool(a.mp4blur if fmt == "mp4" else a.blur)
    alpha = bool(a.alpha) and fmt == "mov"
    sc = 2 if getattr(a, "uhd", False) else 1                 # 4K: twice the film's pixels (3840x2160 for 16:9)
    h, eng = film_hash(p), engine_hash(); src = None
    cands = [d for d in work_dir("render", film_name(p)).glob(f"*_{FPS}fps*") if d.is_dir()]
    for d in sorted(cands, key=lambda d: d.stat().st_mtime, reverse=True):
        try: rj = json.loads((d / "render.json").read_text(encoding="utf-8"))
        except Exception: continue
        if (rj.get("film"), rj.get("engine"), rj.get("fps"), bool(rj.get("alpha")), bool(rj.get("blur")), rj.get("scale", 1)) == (h, eng, FPS, alpha, blur, sc) \
                and len(list(d.glob("s_*.png"))) == rj.get("frames") and (sc == 1 or rj.get("px")):   # a 4K render made before the size check: never reused
            src = d; n = rj["frames"]; px = rj.get("px"); break
    if src:
        say(f"{film_name(p)}: the frames in {src.name} show this film ({'blur' if blur else 'no blur'}{', alpha' if alpha else ''}): encoding them (no new render)")
        frames_dir = src
        if not (src / "mix.wav").exists():
            from render.capture import probe
            url, srv = film_url(film)
            try: mix_audio(p, film, probe(url)["duration"], src)
            finally: srv.shutdown()
    else:
        info, frames_dir, n, secs = render_png(p, film, blur, alpha, a.workers, tag="video", scale=sc)
        px = json.loads((frames_dir / "render.json").read_text(encoding="utf-8"))["px"]
        say(f"{n} frames in {secs:.0f} s")
        mix_audio(p, film, info["duration"], frames_dir)
    wav = frames_dir / "mix.wav"
    out = Path(a.out) if a.out else renders(p, fmt) / (export_name(p, f"{FPS}fps", "4K" if sc == 2 else "", "alpha" if alpha else "") + V["ext"])
    # the sound goes inside the file, no stems beside it (user, 08/10/2026: MOV and MP4 are finished films; the stems come with Port to AE)
    encode_video(frames_dir, wav, out, n, fmt, alpha=alpha)
    log_export(p, V["label"], out, fps=FPS, codec=V["codec"] + (" + alpha" if alpha else ""), blur="180°" if blur else "không", frames=n,
               **({"khung": f"4K {px[0]}x{px[1]} (gấp đôi khung phim)"} if sc == 2 else {}))
    say(f"{fmt.upper()} -> {out}")
    if fmt == "mp4" and getattr(a, "gif", False): encode_gif(frames_dir, out.with_suffix(".gif"), n)   # an X post / article loop beside the MP4
    if os.name == "nt" and not a.no_open: subprocess.Popen(["explorer", "/select,", str(out)])


def cmd_mp4(a): export_video(a, "mp4")


PROXY_H = 540                                               # the smooth-playback video's short side (16:9 -> 960 x 540, 9:16 -> 540 x 960)


def cmd_sheet(a):
    """character sheets for approval (the user's hard rule, 09/10/2026: character sheets come rigged and animated in every pose, to catch
    broken hands, limbs, anatomy and joints BEFORE any animation). One scene per look (library preset character/sheet on the library rig):
    the character big, acting through every pose; every pose small; the expression and hand sets.
      kit.py sheet <film> [--looks anna,ben] [--poses stand,wave,sitDesk]
    Looks: --looks, else every look the film's cast defines (presets/cast/**/preset.js: AIMK_RIG.LOOK.<name> = ...), else the library's.
    The sheet film is built in the work folder with the film's own presets (nothing in the film changes) ->
      02_Assets/Stills/sheet/<look>_poses.png   every pose of the big figure at 2x (joints, hands, feet: look closely)
      02_Assets/Stills/sheet/sheet.mp4          the sheets playing (light H.264): show it to the user with the stills"""
    import asyncio, re as _re
    from PIL import Image, ImageDraw
    p = _proj_dir(a.project)                                 # the film need not be built yet: only its presets (the cast) are used
    if a.puppets is not None:                               # the film's own drawn puppets: machine checks (engine/qa/puppets.py)
        from qa.puppets import run
        return run(p, [x.strip() for x in a.puppets.split(",") if x.strip() and x.strip() != "*"] or None, a.hero or None, say)
    cast = sorted((p / "presets" / "cast").rglob("preset.js")) if (p / "presets" / "cast").is_dir() else []
    found = []
    for f in cast: found += _re.findall(r"AIMK_RIG\.LOOK(?:\.([A-Za-z_][\w]*)|\[\s*[\"']([^\"']+)[\"']\s*\])\s*=", f.read_text(encoding="utf-8"))
    looks = [x.strip() for x in a.looks.split(",") if x.strip()] if a.looks else [x or y for x, y in found] or ["man", "woman", "boy", "girl"]
    poses = [x.strip() for x in a.poses.split(",") if x.strip()] if a.poses else None
    w = work_dir("sheet", film_name(p))
    for x in ("film.json", "index.html"): (w / x).unlink(missing_ok=True)
    if (w / "presets").exists(): shutil.rmtree(w / "presets")                 # our own work copy, rebuilt every time
    if (p / "presets").is_dir(): shutil.copytree(p / "presets", w / "presets")
    (w / "assets" / "vendor").mkdir(parents=True, exist_ok=True)
    shutil.copy2(ENGINE / "vendor" / "gsap" / "gsap.min.js", w / "assets" / "vendor" / "gsap.min.js")
    cast_names = sorted({f.parent.relative_to(p / "presets").as_posix() for f in cast})
    scenes = []
    for i, L in enumerate(looks):
        mo = [{"preset": c, "target": f"slot{i}", "at": 0} for c in cast_names] + \
             [{"preset": "character/sheet", "target": f"slot{i}", "at": 0, "params": {"look": L, "title": f"{film_name(p)} · {L}", **({"poses": poses} if poses else {})}}]
        scenes.append({"id": f"s{i}", "name": L, "duration": "auto", "bg": "#E9EEF3",
                       "elements": [{"id": f"slot{i}", "type": "box", "style": {"left": "0px", "top": "0px", "width": "1920px", "height": "1080px"}}], "motion": mo})
    (w / "film.json").write_text(json.dumps({"spec": "aimk-motionspec/0", "title": f"Character sheet: {film_name(p)}", "size": [1920, 1080],
                                             "background": "#E9EEF3", "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf-8")
    from build import build
    os.environ["AIMK_NO_LINT"] = "1"
    build(w, say=lambda s: None)
    film = w / "index.html"
    # the joint check: the big figure in every pose (the middle of each hold), drawn at 2x
    from render.browser import PAINT, open_film
    from playwright.async_api import async_playwright
    step_s = 0.35 + 0.55
    rows = {}

    async def shots():
        url, srv = film_url(film)
        try:
            async with async_playwright() as pw:
                b, pg, info = await open_film(pw, url, scale=2)
                st = await pg.query_selector(info["stage"]); bb = await st.bounding_box()
                starts = dict((m[0], m[1]) for m in info["markers"])
                for i, L in enumerate(looks):
                    t0 = starts.get(f"s{i}", 0); n = len(poses or await pg.evaluate("AIMK_RIG.STRESS"))
                    names = poses or await pg.evaluate("AIMK_RIG.STRESS")
                    rows[L] = []
                    for j in range(n):
                        t = t0 + 0.4 + j * step_s + 0.35 + 0.27
                        await pg.evaluate(f"window.__aimk.seek({t})"); await pg.evaluate(PAINT)
                        png = await pg.screenshot(clip={"x": bb["x"], "y": bb["y"] + 60, "width": 640, "height": 1000})   # the big figure's column
                        rows[L].append((names[j], png))
                await b.close()
        finally: srv.shutdown()
    asyncio.run(shots())
    dst = renders(p, "stills") / "sheet"; dst.mkdir(parents=True, exist_ok=True)
    import io
    for L, cells in rows.items():
        cw, ch, cols = 384, 600, 7; r_ = -(-len(cells) // cols)
        sheet = Image.new("RGB", (cols * (cw + 8) + 8, r_ * (ch + 36) + 8), "#F4F6F8"); dr = ImageDraw.Draw(sheet)
        for k, (nm, png) in enumerate(cells):
            im = Image.open(io.BytesIO(png)).convert("RGB").resize((cw, ch), Image.LANCZOS)
            x, y = 8 + (k % cols) * (cw + 8), 8 + (k // cols) * (ch + 36)
            sheet.paste(im, (x, y)); dr.text((x + 6, y + ch + 8), nm, fill=(40, 40, 50))
        sheet.save(dst / f"{_re.sub(r'[^A-Za-z0-9_-]+', '-', L)}_poses.png")
    n = small_frames(film, w / "frames", a.workers, f"character sheet video ({len(looks)} look(s))")
    small_mp4(w / "frames", "s_%06d.jpg", n, dst / "sheet.mp4")
    for x in (w / "frames").glob("s_*.jpg"): x.unlink()
    say(f"character sheets: {', '.join(looks)} -> {dst} (sheet.mp4 + <look>_poses.png at 2x). Show both to the user and wait for the OK "
        f"before any animation (workflow/characters.md).")


def small_frames(film, out, workers, what):
    """every frame of a film at PROXY_H (its short side), JPEG, into out -> the frame count"""
    from render.capture import frames, probe
    url, srv = film_url(film)
    try:
        info = probe(url); sc = round(PROXY_H / max(1, min(info["w"], info["h"])), 4)
        say(f"{what}, {round(info['w'] * sc)}x{round(info['h'] * sc)}, {info['duration']:.2f} s, {workers} workers")
        n, secs = frames(url, out, FPS, workers, False, info, scale=sc, ext="jpg")
    finally: srv.shutdown()
    say(f"{n} frames in {secs:.0f} s")
    return n


def small_mp4(src, pat, n, out_file):
    """numbered frames -> a light H.264 (short side PROXY_H, a keyframe every 0.25 s for quick seeks, no sound) at out_file"""
    import imageio_ffmpeg
    tmp = Path(out_file).with_suffix(".tmp.mp4")
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error", "-nostats", "-progress", "pipe:1", "-framerate", str(FPS),
           "-start_number", "0", "-i", str(Path(src) / pat), "-vf", f"scale='if(gt(iw,ih),-2,min({PROXY_H},iw))':'if(gt(iw,ih),min({PROXY_H},ih),-2)':flags=bicubic:out_range=tv,format=yuv420p",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-g", str(FPS // 4), "-an", "-movflags", "+faststart", "-f", "mp4", str(tmp)]
    pr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace"); last = 0
    for line in pr.stdout:
        if line.startswith("frame="):
            f = int(line.split("=")[1] or 0)
            if f - last >= max(1, n // 25) or f >= n: last = f; say(f"  encoding {f}/{n}")
    err = pr.stderr.read(); pr.wait()
    if pr.returncode: raise SystemExit(f"ffmpeg failed: {err.strip()[-400:]}")
    tmp.replace(out_file)


def cmd_proxy(a):
    """the player's smooth playback (user 09/10/2026: "player preview ... render nhẹ nhàng trên laptop"; the 2D rebuild test saw dropped frames
    at 76 s, where 20 strings of digits are laid out along curves every frame: live playback cannot keep 60 fps there on a laptop). The film
    rendered once, small (540 px high), 60 fps, JPEG frames, fast H.264 with a keyframe every 0.25 s (quick seeks), no sound (the player plays
    the film's own sound) -> %USERPROFILE%\\.aimotionkit\\work\\proxy\\<film>\\preview.mp4 + preview.json (the film's fingerprint). The player
    plays it while running and shows the live film when stopped or scrubbed. Frames of a matching full render (an export) are scaled down
    instead of rendering again. Nothing is written into the film's folder."""
    import imageio_ffmpeg
    p, film = project(a.project)
    st = proxy_state(p)
    if st["fresh"]: return say(f"smooth playback video: up to date ({st['file']})")
    h, eng = film_hash(p), engine_hash(); src = None
    for d in sorted(work_dir("render", film_name(p)).glob(f"*_{FPS}fps*"), key=lambda d: d.stat().st_mtime, reverse=True):
        try: rj = json.loads((d / "render.json").read_text(encoding="utf-8"))
        except Exception: continue
        if (rj.get("film"), rj.get("engine"), rj.get("fps")) == (h, eng, FPS) and len(list(d.glob("s_*.png"))) == rj.get("frames"):
            src, n, pat = d, rj["frames"], "s_%06d.png"; break
    out = st["file"].parent
    if src: say(f"{film_name(p)}: the frames of {src.name} show this film: scaling them down (no new render)")
    else: n = small_frames(film, out, a.workers, f"{film_name(p)}: smooth playback video"); src, pat = out, "s_%06d.jpg"
    small_mp4(src, pat, n, st["file"])
    for x in out.glob("s_*.jpg"): x.unlink()                 # the JPEG frames were only for this video
    (out / "preview.json").write_text(json.dumps({"film": h, "engine": eng, "frames": n, "fps": FPS, "made": time.strftime("%Y-%m-%d %H:%M")}, indent=1), encoding="utf-8")
    say(f"smooth playback video ready: {st['file'].stat().st_size / 1e6:.0f} MB ({st['file']})")


def cmd_mov(a): export_video(a, "mov")


def cmd_stills(a):
    """stills + a contact sheet for looking at the film (Claude's self-review, plan A1; the user's stills):
      kit.py stills <p> 1.5 4 8      those times                         -> 02_Assets\\Stills\\times\\
      kit.py stills <p> --beats      one frame per scene, settled (65 %)  -> 02_Assets\\Stills\\beats\\
      kit.py stills <p> --strip 12.3 12 frames in a row around 12.3 s (60 fps): stutter, overlaps in a fast change -> 02_Assets\\Stills\\strip_12.30\\
      kit.py stills <p> --phone      the --beats frames at 360 px wide: can it be read on a phone? -> 02_Assets\\Stills\\phone\\
      kit.py stills <p> --cuts       12 frames around EVERY scene change, one row per change (self-review, every round) -> 02_Assets\\Stills\\cuts\\
      kit.py stills <p> --onion 2.0 2.8 [--every 0.0417]   onion skin: those frames laid over each other (even ghosts = robotic, ghosts that
                                     tighten near the keys = the easing works; the "Motion Lab" article, 12/10/2026) -> 02_Assets\\Stills\\onion_*.png
    (older films: renders\\stills\\...)"""
    from PIL import Image
    from render.capture import probe, stills
    p, film = project(a.project); url, srv = film_url(film)
    if getattr(a, "onion", False):                          # (reframe calls this with its own arguments, no --onion)
        from qa.motionview import onion
        try:
            if len(a.times) != 2: raise SystemExit("--onion: give two times, e.g. kit.py stills myfilm --onion 2.0 2.8")
            t0, t1 = sorted(float(t) for t in a.times)
            out = renders(p, "stills") / f"onion_{t0:.2f}-{t1:.2f}.png"
            n = onion(url, t0, t1, a.every or 1 / 24, out)
        finally: srv.shutdown()
        return say(f"onion skin: {n} frames ({t0:.2f}-{t1:.2f} s, every {a.every or 1 / 24:.4f} s) -> {out}")
    try:
        times, tw, cols, mode = [float(t) for t in a.times], 480, 4, "times"
        if a.beats or a.phone or a.cuts or a.strip is not None:
            info = probe(url); D = info["duration"]; cuts = sorted({m[1] for m in info["markers"]} | {0.0}); ends = cuts[1:] + [D]
            if a.cuts:                                       # 6 frames before + 6 after each scene change: one row per change
                times = [max(0, min(D - 1e-3, (round(c * FPS) + k) / FPS)) for c in cuts[1:] for k in range(-6, 6)]
                cols, tw, mode = 12, 240, "cuts"
                if not times: raise SystemExit("the film has one scene: no scene change to look at (use --strip <t> for a fast move)")
            elif a.strip is not None:
                c = round(a.strip * FPS); times = [max(0, min(D - 1e-3, (c + k) / FPS)) for k in range(-6, 6)]; cols, tw, mode = 6, 400, f"strip_{a.strip:.2f}"
            else:
                times = [round(s + (e - s) * 0.65, 3) for s, e in zip(cuts, ends) if e > s]
                mode = "phone" if a.phone else "beats"
                if a.phone: tw, cols = 360, 5
        if not times: raise SystemExit("give the times in seconds (kit.py stills myfilm 0.5 2 4.2), or --beats, --strip <t>, --cuts, --phone")
        local = work_dir("stills", film_name(p), mode); [f.unlink() for f in local.glob("*.png")]
        stills(url, times, local)
    finally:
        srv.shutdown()
    files = sorted(local.glob("t_*.png"))
    ims = [Image.open(f).convert("RGB") for f in files]
    th = round(tw * ims[0].height / ims[0].width); cols = min(cols, len(ims)); rows = -(-len(ims) // cols)
    lab = 22 if mode != "times" else 0
    sheet = Image.new("RGB", (cols * (tw + 6) + 6, rows * (th + 6 + lab) + 6), "white")
    from PIL import ImageDraw
    dr = ImageDraw.Draw(sheet)
    for i, (f, im) in enumerate(zip(files, ims)):
        x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 6 + lab)
        sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
        if lab: dr.text((x + 2, y + 3), f"{float(f.stem[2:]):.3f} s", fill=(40, 40, 40))
    sheet.save(local / "sheet.png")
    dst = renders(p, "stills") / mode
    n = copy_into(local, dst, "*.png")
    say(f"{n - 1} stills + sheet.png -> {dst}")


def cmd_storyboard(a):
    """kit.py storyboard <project> [A B C]: gate 1's options side by side. Claude writes each option as a still film (a film.json with no
    motion) in <project>/qa/storyboard/<name>.json; each is built WITHOUT touching film.json or index.html (Test 1 copied every option over
    film.json, Test 3 wrote its own runner) -> qa/storyboard/<name>.html, then one still per scene (settled, 65 %) and a sheet with the scene
    names -> 02_Assets/Stills/storyboard/<name>/ (sheet.png is what the user sees). No names: every .json in qa/storyboard/."""
    from PIL import Image, ImageDraw
    from build import build
    from render.capture import probe, stills
    from render.serve import Quiet, serve_in_thread
    p = _proj_dir(a.project); src = p / "qa" / "storyboard"
    files = [src / (x if x.endswith(".json") else x + ".json") for x in a.times] if a.times else sorted(src.glob("*.json"))
    if not files: raise SystemExit(f"no options: write {src}/A.json, B.json, C.json (each a film.json without motion), then run this again")
    for f in files:
        if not f.exists(): raise SystemExit(f"no option file {f}")
    for f in files:
        name = f.stem; t0 = time.time()
        out = src / f"{name}.html"
        build(p, say=lambda *x: None, spec=json.loads(f.read_text(encoding="utf-8")), out=out)
        rel = f"/__aimk_storyboard_{name}.html"
        base, srv = serve_in_thread(p); Quiet.overrides[rel] = out.read_bytes()      # served from memory at the project root (its asset paths)
        try:
            url = base.rstrip("/") + rel; info = probe(url); D = info["duration"]
            marks = sorted(info["markers"], key=lambda m: m[1]); ends = [m[1] for m in marks[1:]] + [D]
            times = [round(m[1] + (e - m[1]) * 0.65, 3) for m, e in zip(marks, ends) if e > m[1]]
            local = work_dir("storyboard", film_name(p), name); [x.unlink() for x in local.glob("*.png")]
            stills(url, times, local)
        finally:
            srv.shutdown(); Quiet.overrides.pop(rel, None)
        sc = {s["id"]: s.get("name") or s["id"] for s in json.loads(f.read_text(encoding="utf-8"))["scenes"]}
        labels = [sc.get(m[0], m[0]) for m, e in zip(marks, ends) if e > m[1]]
        ims = [Image.open(x).convert("RGB") for x in sorted(local.glob("t_*.png"))]
        tw = 400; th = round(tw * ims[0].height / ims[0].width); cols = min(5, len(ims)); rows = -(-len(ims) // cols); lab = 24
        sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 8 + lab) + 8 + 30), "white"); dr = ImageDraw.Draw(sheet)
        dr.text((10, 8), f"Option {name}  ({len(ims)} scenes)", fill=(20, 20, 20))
        for i, (im, lb) in enumerate(zip(ims, labels)):
            x, y = 8 + (i % cols) * (tw + 8), 38 + (i // cols) * (th + 8 + lab)
            sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab)); dr.text((x + 2, y + 5), f"{i + 1}. {lb}"[:60], fill=(40, 40, 40))
        sheet.save(local / "sheet.png")
        dst = renders(p, "stills") / "storyboard" / name
        copy_into(local, dst, "*.png")
        say(f"option {name}: {len(ims)} scenes, {time.time() - t0:.0f} s -> {dst / 'sheet.png'}")


def cmd_verify(a):
    from qa.verify import report, verify
    p, film = project(a.project); url, srv = film_url(film)
    out = work_dir("verify", film_name(p)); [f.unlink() for f in out.glob("*.png")]
    info, res = verify(url, a.samples, out, a.loop, a.play); srv.shutdown()
    report(info, res, say)
    if res["BUG"]: say(f"differing frames saved in {out}"); raise SystemExit(1)


def hf_cli(project=None):
    """the HyperFrames CLI for a project (its pinned version, engine/adapters/hf/hf.py) or the kit's current one (engine/hf_version.json).
    HyperFrames is not carried in the kit (user's decision): `install.bat` / `kit.py hf install` put it in %USERPROFILE%\\.aimotionkit\\hyperframes"""
    sys.path.insert(0, str(ENGINE / "adapters" / "hf"))
    import hf
    ver = hf.version_for(project)
    if not ver:
        vs = hf.installed()
        if not vs: raise SystemExit("HyperFrames is not installed: run install.bat (or kit.py hf install)")
        ver = vs[-1]
    exe = hf.exe(ver)
    if not exe.exists(): raise SystemExit(f"HyperFrames {ver} is not installed on this machine: run install.bat (or kit.py hf install {ver})")
    return exe, hf.env()


def cmd_hf(a):
    """kit.py hf status | install [version] | test [version] | update | rollback   (engine/adapters/hf/hf.py)"""
    sys.path.insert(0, str(ENGINE / "adapters" / "hf"))
    import hf
    sub, ver = a.project, (a.times[0] if a.times else None)
    if sub == "status": hf.status()
    elif sub == "install":
        v = ver or hf.state()["current"]
        if hf.install(v):
            ok, why = hf.smoke(v); say(f"smoke test {v}: {'PASS' if ok else 'FAIL'} ({why})")
            if not ok: raise SystemExit(1)
        else: raise SystemExit(1)
    elif sub == "test":
        v = ver or hf.state()["current"]; ok, why = hf.smoke(v); say(f"smoke test {v}: {'PASS' if ok else 'FAIL'} ({why})")
    elif sub == "update": hf.update(quiet=a.quiet)
    elif sub == "rollback": hf.rollback()
    else: raise SystemExit("usage: kit.py hf status | install [version] | test [version] | update | rollback")


def _msg(text):
    """a message box (preview runs under pythonw, so there is no console to print to)"""
    try:
        import ctypes; ctypes.windll.user32.MessageBoxW(0, text, "Moworks Motion", 0x40)
    except Exception: say(text)


def _browser():
    for c in (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe"):
        if Path(c).exists(): return c
    return None


def _ask(text):
    """Yes / No message box (the launchers run under pythonw)"""
    try:
        import ctypes; return ctypes.windll.user32.MessageBoxW(0, text, "Moworks Motion", 0x24) == 6
    except Exception: return input(text + " [y/N] ").strip().lower().startswith("y")


# the kit's app windows (player, Studio, gallery) run in their own browser profile. Test 1 (08/10/2026, U3): extensions synced into it opened
# sign-in tabs, Edge asked to import settings and to translate the page -> no extensions, no sync, no first run, no translate
APP_FLAGS = ["--no-first-run", "--no-default-browser-check", "--disable-extensions", "--disable-sync",
             "--disable-features=Translate,msImplicitSignin,msEdgeFRE,msEdgeTranslate"]


def _profile_open(profile):
    """True while a window of this browser profile is open: Edge / Chrome hold <profile>\\lockfile open and delete it on exit
    (a lockfile that opens is left over from a crash)"""
    f = Path(profile) / "lockfile"
    if not f.exists(): return False
    try: os.close(os.open(str(f), os.O_RDWR)); return False
    except OSError: return True


def _fit_window(size):
    """(--window-size, --window-position) for an app window: 90 % of the main screen's work area (the taskbar left out), centred; `size` when
    the work area cannot be read. Before 09/10/2026 the player always opened at 1700 x 1000: past the edges of a laptop screen, small on a
    big one. The process is not DPI aware, so Windows gives the work area in the scaled pixels the browser's flags use."""
    try:
        import ctypes
        from ctypes import wintypes
        r = wintypes.RECT()
        if ctypes.windll.user32.SystemParametersInfoW(0x30, 0, ctypes.byref(r), 0):                # SPI_GETWORKAREA
            aw, ah = r.right - r.left, r.bottom - r.top
            if aw > 600 and ah > 400:
                w, h = int(aw * 0.9), int(ah * 0.9)
                return f"{w},{h}", f"{r.left + (aw - w) // 2},{r.top + (ah - h) // 2}"
    except Exception: pass
    return size, None


def _app_window(url, profile, size="1600,1000"):
    """the page in an app window; returns when every window of that profile is closed. msedge.exe returns at once when it hands the URL to a
    window of the same profile that is already open, and on a new profile it restarts itself (measured 08/10/2026): Test 1's player stopped
    its server at that moment (U4, "film B's player did not load"), so the profile's lockfile says when the window is gone"""
    br = _browser()
    if br:
        Path(profile).mkdir(parents=True, exist_ok=True)
        st = Path(profile) / "Local State"                    # no background mode: the profile ends with its last window
        if not st.exists(): st.write_text(json.dumps({"background_mode": {"enabled": False}}), encoding="utf-8")
        wsize, wpos = _fit_window(size)
        subprocess.run([br, f"--app={url}", f"--user-data-dir={profile}", *APP_FLAGS, f"--window-size={wsize}"] + ([f"--window-position={wpos}"] if wpos else []))
        t0 = time.time()
        while time.time() - t0 < 20 and not _profile_open(profile): time.sleep(0.5)
        while _profile_open(profile): time.sleep(1)
    else:
        import webbrowser; webbrowser.open(url); _msg("The page is open in your browser. Press OK here when you are done to stop it.")


def cmd_preview(a):
    """the kit's review player (default, no HyperFrames): the film in its own app window, scrub / scenes / frame step / loop, and notes at a
    moment saved to <project>/feedback.md for Claude. Closing the window stops it. (HyperFrames Studio, optional: kit.py studio)"""
    import hashlib
    try:
        p, film = project(a.project)
        if film.name != "index.html" or "data-composition-id" not in film.read_text(encoding="utf-8"):
            return _msg("This is a v1-style film: open it with the v1 player.")
    except SystemExit as e:
        return _msg(str(e))
    # from a Claude chat the window would open inside the app's private copy and the server stopped at once (11/10/2026 test:
    # "kit.py preview" from a background shell exited with no window): the film's own launcher runs outside the app instead, as a
    # double-click does (engine/outside.py)
    import outside
    bat = film_root(p) / "1. Preview.bat"
    if not a.no_open and bat.exists() and outside.sandboxed():
        subprocess.Popen(["explorer.exe", str(bat)])
        return say(f"player: opened in its own window outside the Claude app ({bat.name}); closing that window stops it")
    sys.path.insert(0, str(ENGINE / "player"))
    import player
    url, srv = player.serve(p, a.port)
    if a.no_open:                                         # Claude's own browser, or a second screen (Test 1 K5): the link only
        say(f"player: {url}  (Ctrl+C stops it)")
        try:
            while True: time.sleep(1)
        except KeyboardInterrupt: pass
        finally: srv.shutdown()
        return
    try: _app_window(url, LOCAL / "studio-browser" / ("player-" + hashlib.sha1(str(p).encode()).hexdigest()[:10]), "1700,1000")
    finally:
        srv.shutdown()
        if player.Job.cur and player.Job.cur.rc is None: player.Job.cur.cancel()     # closing the player cancels its export (the panel says so)


def cmd_feedback(a):
    """the user's OPEN notes in notes\\feedback.md, numbered; the ones the user marked Done are left out. The 2D rebuild test (09/10/2026)
    picked each round's notes by their place in the file, never by the Done marks: it happened to match. Read this at the start of every
    round of fixes; never mark a note done (the user does, in the player)."""
    p, _ = project(a.project)
    sys.path.insert(0, str(ENGINE / "player"))
    import player
    notes = player.read_notes(p); op = [n for n in notes if n["state"] == "open"]
    say(f"{player.feedback_file(p)}: {len(op)} open, {len(notes) - len(op)} done (not shown)")
    for i, n in enumerate(op, 1):                       # [v2 · ...]: the version the user watched when writing it (10/10/2026)
        say(f"{i}. [" + (f"{n['ver']} · " if n.get("ver") else "") + f"{n['t']:.2f} s" + (f" · {n['scene']}" if n["scene"] else "") + f"] {n['text']}   (line {n['line'] + 1})")
    back = [n["ver"] for n in op if n.get("ver") and "Sửa tiếp từ bản này" in n["text"]]
    if back: say(f"-> the user wants to go on from {back[-1]}: kit.py restore {a.project} {back[-1]} first, fix the other notes, then "
                 f"kit.py round {a.project} film --base {back[-1]} and say its line in the chat")


def cmd_studio(a):
    """HyperFrames Studio (OPTIONAL, user's decision 05/10/2026: the kit works without HyperFrames). Not installed yet: asks first, then installs
    it (Node.js + about 110 MB). Studio runs hidden in its own app window; closing that window stops the server.
    Log: %USERPROFILE%\\.aimotionkit\\logs\\studio-<project>.log"""
    import hashlib, urllib.parse, urllib.request
    try:
        p, film = project(a.project)
        if film.name != "index.html" or "data-composition-id" not in film.read_text(encoding="utf-8"):
            return _msg("This is a v1-style film: open it with the v1 player.")
        sys.path.insert(0, str(ENGINE / "adapters" / "hf")); import hf
        if not hf.installed():
            if not _ask("HyperFrames Studio (tự sửa tay timeline, keyframe, chữ) chưa có trên máy này.\n\n"
                        "Cần tải HyperFrames khoảng 110 MB (và Node.js nếu máy chưa có). Phim, xuất PNG và port AE không cần nó.\n\nTải và cài bây giờ?"):
                return
            if not shutil.which("node"):
                return _msg("Máy chưa có Node.js. Chạy install.bat ở gốc kit và chọn dùng HyperFrames Studio, rồi mở lại.")
            subprocess.run(["cmd", "/c", "start", "/wait", "Moworks Motion - cai HyperFrames", sys.executable.replace("pythonw", "python"),
                            str(ENGINE / "kit.py"), "hf", "install"])
        exe, env = hf_cli(p)
    except SystemExit as e:
        return _msg(str(e))
    try:                                                              # once a day: look for a newer HyperFrames in the background
        sys.path.insert(0, str(ENGINE / "adapters" / "hf")); import hf
        if hf.due(): subprocess.Popen([sys.executable, str(ENGINE / "kit.py"), "hf", "update", "--quiet"], creationflags=0x08000000 | 0x00000008 if os.name == "nt" else 0,
                                      stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception: pass
    hide = 0x08000000 if os.name == "nt" else 0                       # CREATE_NO_WINDOW
    vids = lambda: {f for f in (p / "renders").glob("*") if f.is_file() and f.suffix.lower() in (".mp4", ".mov", ".webm", ".gif")} if (p / "renders").exists() else set()
    before = vids()                                                   # Studio saves its renders in renders\: moved to renders\hf\ when it closes
    logd = LOCAL / "logs"; logd.mkdir(parents=True, exist_ok=True)
    log = open(logd / f"studio-{film_name(p)}.log", "w", encoding="utf-8")
    port = a.port or 3010
    if a.present:                                                     # a deck (film.json "slides"): HyperFrames' presenter, not Studio (11/10/2026)
        if "hyperframes-slideshow+json" not in film.read_text(encoding="utf-8"):
            log.close(); return _msg('This film is not a deck: add "slides": true to film.json (workflow/film.md, "A deck"), then kit.py build.')
        srv = subprocess.Popen([str(exe), "present", str(p), "--port", str(port), "--no-open"], env=env,
                               stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, creationflags=hide)
        base = f"http://localhost:{port}"
        for _ in range(120):
            try: urllib.request.urlopen(base, timeout=1); break
            except Exception:
                if srv.poll() is not None: log.close(); return _msg(f"The presenter did not start. See {logd / ('studio-' + film_name(p) + '.log')}")
                time.sleep(0.5)
        say(f"presenter: {base} (P or the Present button opens the audience view; share that tab in Meet / that window in Zoom)")
        try: _app_window(base, LOCAL / "studio-browser" / ("present-" + hashlib.sha1(str(p).encode()).hexdigest()[:10]))
        finally:
            subprocess.run(["taskkill", "/PID", str(srv.pid), "/T", "/F"], capture_output=True, creationflags=hide); log.close(); hide_hf(p)
        return
    srv = subprocess.Popen([str(exe), "preview", str(p), "--port", str(port), "--no-open", "--foreground"], env=env,
                           stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, creationflags=hide)
    base = f"http://localhost:{port}"
    for _ in range(120):
        try: urllib.request.urlopen(base, timeout=1); break
        except Exception:
            if srv.poll() is not None: return _msg(f"Studio did not start. See {logd / ('studio-' + film_name(p) + '.log')}")
            time.sleep(0.5)
    url = f"{base}/#project/{urllib.parse.quote(p.name)}"
    try:
        _app_window(url, LOCAL / "studio-browser" / hashlib.sha1(str(p).encode()).hexdigest()[:10])
    finally:
        subprocess.run(["taskkill", "/PID", str(srv.pid), "/T", "/F"], capture_output=True, creationflags=hide)
        log.close()
        hide_hf(p)                                                    # Studio's .hyperframes / .thumbnails / .waveform-cache: out of sight
        for f in sorted(vids() - before):
            try:
                dst = renders(p, "hf") / f.name; shutil.move(str(f), str(dst))
                log_export(p, "HyperFrames Studio", dst, note="bản nháp: HF chụp khung JPEG q80 trừ MOV (ProRes)")
            except Exception: pass


HF_DIRS = (".hyperframes", ".thumbnails", ".waveform-cache")


def hide_hf(p):
    """HyperFrames Studio's own folders in a project: hidden in Explorer (Studio still finds them)"""
    if os.name != "nt": return
    for d in HF_DIRS:
        if (p / d).exists(): subprocess.run(["attrib", "+h", str(p / d)], capture_output=True)


def cmd_tidy(a):
    """kit.py tidy <project>: the project root keeps only 1. Preview.bat, film.json, index.html and its folders (user 07/10/2026: "gom lai
    cho gon"). Notes, recaps, feedback and handoffs -> notes/; the old ae/ -> renders/ae/; HyperFrames Studio videos in renders/ ->
    renders/hf/; renders/previews -> renders/stills/previews; hf.json -> qa/; the old launchers 2. / 3. / 4. ... .bat (the player's Export
    panel does their work) -> Recycle Bin; Studio's dot folders hidden. Nothing is deleted for good; a file already at the destination is kept."""
    from common import trash
    p = _proj_dir(a.project); moved = []
    if p.name == HTML: return _tidy_layout(p)

    def move(src, dst):
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists(): say(f"  kept (already there): {dst.relative_to(p)}"); return
        try: os.rename(src, dst)                          # same drive: a rename, never a copy (a big video stays one file)
        except PermissionError:
            say(f"  in use, left where it is (close it and run tidy again): {src.relative_to(p)}"); return
        moved.append(f"{src.relative_to(p)} -> {dst.relative_to(p)}")
    for f in sorted(p.iterdir()):
        n = f.name
        if f.is_file() and (n.lower().endswith(".md") or n.upper().startswith("HANDOFF")) and n.lower() != "readme.md": move(f, p / "notes" / n)
    if (p / "ae").is_dir():
        for f in sorted((p / "ae").iterdir()):
            if f.name != "desktop.ini": move(f, p / "renders" / "ae" / f.name)
        if not [x for x in (p / "ae").iterdir() if x.name != "desktop.ini"]: trash([p / "ae"]); moved.append("ae/ (empty) -> Recycle Bin")
    if (p / "renders").is_dir():
        for f in sorted((p / "renders").iterdir()):
            if f.is_file() and f.suffix.lower() in (".mp4", ".mov", ".webm", ".gif", ".json") and f.name != "EXPORTS.md": move(f, p / "renders" / "hf" / f.name)
        if (p / "renders" / "previews").is_dir(): move(p / "renders" / "previews", p / "renders" / "stills" / "previews")
    if (p / "hf.json").exists(): move(p / "hf.json", p / "qa" / "hf.json")
    old = [f for f in p.glob("*.bat") if f.name[:2] in ("2.", "3.", "4.")]
    if old: trash(old); moved += [f"{f.name} -> Recycle Bin (the player's Export panel does it)" for f in old]
    for d in ("notes", "renders/mp4", "renders/mov", "renders/png", "renders/ae", "renders/stills"): (p / d).mkdir(parents=True, exist_ok=True)
    hide_hf(p)
    for m in moved: say("  " + m)
    left = sorted(x.name for x in p.iterdir() if x.name != "desktop.ini" and not x.name.startswith("."))
    say(f"{p.name}: {len(moved)} item(s) moved; the root now holds: {', '.join(left)}")


def _tidy_layout(p):
    """a film made before 11/10/2026 -> the 11/10/2026 layout (user: "folder renders này chỉ để các file mp4 và mov xuất ra thôi", "move cả
    rounds và still luôn", rounds numbered per kind): the user's files in 02_Assets -> 01_Brief (film.json / index.html paths that named
    them follow, both backed up to qa/backup/ first); 04_Renders/Rounds -> 02_Assets/Rounds, the old R<n>_Storyboard / R<n>_Assets / R<n>_Film-v<k>
    renamed Storyboard_R<k> / Assets_R<k> / Film_v<kk>, their order in time written into ROUND.md, files.json following the new names;
    02_Assets/Stills and Compare -> 02_Assets. Moves only (same drive: renames), nothing deleted; a name already at the destination is
    kept where it was and reported. Running it again does nothing."""
    import re
    from common import ROUND_KIND, ROUND_LABEL, RENDERS, rounds, stamp
    root = p.parent; A, B, R = root / ASSETS, root / BRIEF, root / RENDERS
    done, kept = [], []

    def merge(src, dst):                                  # a rename when the destination is free, else folder by folder
        if not src.exists(): return
        if not dst.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            try: os.rename(src, dst); done.append(f"{src.relative_to(root)} -> {dst.relative_to(root)}")
            except OSError as e: kept.append(f"{src.relative_to(root)} ({e.strerror}: close what holds it and run tidy again)")
            return
        if src.is_dir() and dst.is_dir():
            for x in sorted(src.iterdir()): merge(x, dst / x.name)
            try:
                if not any(x for x in src.iterdir() if x.name != "desktop.ini"):
                    for x in src.iterdir(): x.unlink()
                    src.rmdir()
            except OSError: pass
        elif src.name != "desktop.ini": kept.append(f"{src.relative_to(root)} (a file of that name is already in {dst.parent.relative_to(root)})")

    # 1. the user's own files: 02_Assets -> 01_Brief (what the kit makes for review stays in 02_Assets)
    user = [x for x in sorted(A.iterdir()) if x.name not in ("Rounds", "Stills", "Compare", "Music-Options", "desktop.ini")] if A.is_dir() else []
    if user:
        bk = p / "qa" / "backup"; bk.mkdir(parents=True, exist_ok=True)
        for f in ("film.json", "index.html"):
            if (p / f).is_file(): shutil.copy2(p / f, bk / f"{f}.before-tidy.{stamp()}")
        for x in user: merge(x, B / x.name)
        for f in ("film.json", "index.html"):           # paths that named the moved files: 02_Assets/<name> -> 01_Brief/<name>
            if not (p / f).is_file(): continue
            s = (p / f).read_text(encoding="utf-8"); s2 = s
            for x in user:
                if (B / x.name).exists(): s2 = re.sub(r"02_Assets([/\\]+)" + re.escape(x.name), lambda m: "01_Brief" + m.group(1) + x.name, s2)
            if s2 != s: (p / f).write_text(s2, encoding="utf-8"); done.append(f"{f}: paths 02_Assets -> 01_Brief")
    # 2. the rounds: renamed per kind, order kept
    old = R / "Rounds"
    if old.is_dir():
        rs = rounds(p, old)
        names = {r["name"]: (f"Film_v{r['v']:02d}" if r["kind"] == "film" else f"{ROUND_KIND[r['kind']]}_R{r['k']:02d}") for r in rs}
        for r in rs:
            merge(r["dir"], A / "Rounds" / names[r["name"]])
            d = A / "Rounds" / names[r["name"]]
            if not d.is_dir(): continue
            md = d / "ROUND.md"
            if md.exists():
                t = md.read_text(encoding="utf-8")
                title = f"Phim v{r['v']}" if r["kind"] == "film" else f"{ROUND_LABEL[r['kind']]} · round {r['k']}"
                t = re.sub(r"^# Round \d+ · .*$", f"# {title}", t, count=1, flags=re.M)
                if "\n- order: " not in t: t = t.rstrip("\n") + f"\n- order: {r['n']}\n"
                md.write_text(t, encoding="utf-8")
            fj = d / "files.json"
            if fj.exists():
                man = json.loads(fj.read_text(encoding="utf-8"))
                for rel, held in man.items():
                    if held and held[0] in names: held[0] = names[held[0]]
                fj.write_text(json.dumps(man, ensure_ascii=False, indent=0), encoding="utf-8")
        merge(old, A / "Rounds")                          # anything else that was in it
    # 3. stills and side-by-side videos
    for sub in ("Stills", "Compare"): merge(R / sub, A / sub)
    for m in done: say("  " + m)
    for m in kept: say("  kept: " + m)
    say(f"{film_name(p)}: " + ("already in the 11/10/2026 layout, nothing to move" if not done and not kept else
                               f"{len(done)} moved, {len(kept)} kept where they were") + "  (01_Brief: brief + your files · 02_Assets: rounds, stills · 04_Renders: MP4 / MOV)")


def cmd_brand(a):
    import brand
    p, film = project(a.project)
    names = lambda root: ", ".join(d.name for d in root.iterdir() if (d / "brand.json").exists()) if root.exists() else ""
    if not a.times: raise SystemExit(f"usage: kit.py brand <project> <pack | look>   (packs: {names(brand.PACKS)}; public looks: {names(brand.LOOKS)})")
    w, h, sizes = brand.apply(p, a.times[0])
    src = brand.folder(a.times[0]); look = (src / "FRAME.md").exists()
    say(f"{a.times[0]} {'look' if look else 'pack'} applied to {film_name(p)} ({w}x{h}): fonts{'' if look else ' and logos'} in assets, assets/brand.css with " + ", ".join(f"{k} {v}px" for k, v in sizes.items()))
    say('add <link rel="stylesheet" href="assets/brand.css"> to index.html and use the .b-* classes; rules: '
        + (f"library/looks/{a.times[0]}/FRAME.md (colours, type, grids, borders, shadows, components)" if look else f"brands/{a.times[0]}/notes.md"))


def cmd_brand_check(a):
    import brand
    if not a.times: raise SystemExit("usage: kit.py brand-check <project> <pack> [--brief <file>]")
    _, B = brand.load(a.times[0])
    p = film_dir(Path(a.project).resolve())
    if a.brief is not None:                               # brief vs guideline (user 08/10/2026: list the conflicts, ask brief or guideline)
        files = [Path(x) for x in a.brief.split(";") if x.strip()] if a.brief else sorted(
            f for f in brief_dir(p).glob("*") if f.suffix.lower() in (".md", ".txt") and f.stem.upper() not in ("POSES", "LYRICS-TIMED", "BRAND"))
        if not files: raise SystemExit(f"no brief: --brief <file> (or put the brief in {brief_dir(p)} as .md / .txt)")
        n = 0
        for f in files:
            if not f.exists(): raise SystemExit(f"no file {f}")
            cf = brand.brief_conflicts(f.read_text(encoding="utf-8", errors="replace"), B, a.times[0])
            say(f"brief vs {a.times[0]} guideline: {f.name}: {len(cf)} point(s) to ask")
            for ln, snip, why in cf: say(f"  ? line {ln}: \"{snip}\"\n      guideline: {why}"); n += 1
        say("  ✓ nothing in the brief contradicts the pack (read it yourself too)" if not n else
            f"{n} point(s): ask the user, one list, brief or guideline for each; write the answers in notes\\NOTES.md")
        if not any((p / x).exists() for x in ("index.html", "film.html")): return   # before the storyboard: the brief only
    p, film = project(a.project)
    url, srv = film_url(film)
    fj = p / "film.json"
    spec = json.loads(fj.read_text(encoding="utf-8")) if fj.exists() else {}
    extra = spec.get("brand_colors") or []                # campaign / product colours the pack allows on type
    squash = [t for pt in (spec.get("groove") or {}).get("parts") or [] if float(pt.get("squash", 0) or 0)
              for t in (pt["target"] if isinstance(pt.get("target"), list) else [pt.get("target")]) if t]
    info, d, issues = brand.check(url, a.times[0], extra, bool(spec.get("brand_motion_bans")), squash); srv.shutdown()
    say(f"brand check ({a.times[0]}): {len(d['texts'])} text elements, {len(d['logos'])} lettermark elements, {len(d['tweens'])} tweens on text/logo")
    for i in issues: say("  ✗ " + i)
    say("  ✓ no issue" if not issues else f"{len(issues)} issue(s)")
    if issues: raise SystemExit(1)


def cmd_font(a):
    from fonts.fonts import find, vietnamese_missing
    extra = [d for d in (KIT / "brands").glob("*/fonts")]
    for fam in [a.project] + a.times:
        m = find(fam, extra_dirs=extra)
        if not m: say(f"{fam}: not found (installed fonts + brand packs)"); continue
        miss = vietnamese_missing(m["path"], m["index"])
        say(f"{fam}: {m['family']} {m['style']} ({m['weight']}) {m['path']}#{m['index']}  Vietnamese: {'full' if not miss else 'MISSING ' + miss}"
            + ("  [Adobe Fonts: licensed to this Adobe account; a copy in a project stays on this machine]" if "CoreSync" in m["path"] else ""))


def cmd_lint(a):
    """the v2 lint (engine/qa/buildlint.py, also run by every kit.py build): reading time, logo motion, text over text / outside the margin
    at rest, blank frames after cuts. --hf: HyperFrames' own linter instead (local, no network: seek-safety, structure, fonts, media)"""
    p, film = project(a.project)
    if not a.hf:
        from qa.buildlint import lint
        return lint(p, say=say)
    exe, env = hf_cli(p)
    r = subprocess.run([str(exe), "lint", str(p), "--verbose"], env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    import re as _re
    say(_re.sub(r"\x1b\[[0-9;]*m", "", (r.stdout or "") + (r.stderr or "")).strip())
    raise SystemExit(r.returncode)


def cmd_qa(a):
    """motion QA on the last render of the project (the frames of its last MOV / MP4 export, on the local disk): pops, one-frame flashes, still time,
    photosensitivity; scene cuts are allowed jumps"""
    from qa.motion_qa import analyse, report
    from render.capture import probe
    p, film = project(a.project)
    done = [d for d in work_dir("render", film_name(p)).glob(f"*_{FPS}fps*") if any(d.glob("s_*.png"))]   # the newest MOV / MP4 / PNG render
    if not done: raise SystemExit(f"no render yet: export a MOV (or MP4) of {film_name(p)} first")
    local = max(done, key=lambda d: d.stat().st_mtime)
    url, srv = film_url(film); info = probe(url); srv.shutdown()
    r = analyse(local, FPS, [m[1] for m in info["markers"] if m[1] > 0])
    report(r, say)
    (p / "qa").mkdir(exist_ok=True); (p / "qa" / "motion_qa.json").write_text(json.dumps(r, indent=1), encoding="utf-8")
    if r["fail"]: raise SystemExit(1)


def cmd_loudness(a):
    """measure a WAV / MP4 (LUFS, LRA, true peak, the 200 Hz - 6 kHz phone band); with --fix <out.wav>: two-pass normalise to -16 LUFS, true
    peak <= -4 dBTP. A film (its folder): the "sound pass" (12/10/2026, X articles the user asked to follow): its mix against the film's
    target (default -16 LUFS, true peaks under -4 dBTP), the latest exported MP4 measured as people hear it (AAC) and folded to mono (a
    phone speaker), every sound effect's level over the bed (want 3 to 6 dB, the "Motion Lab" article), the cuts with no sound, a cue sheet
    (02_Assets/Stills/audio/cues_*.png: the exported frame before / after each cue + the waveform) and five moments for the user's headphones"""
    from audio.loudness import cue_sheet, hit_verdict, hits, latest_export, listen_points, loudest_source, measure, measure_mono, normalize, silent_cuts
    if a.fix:
        b, x = normalize(a.project, a.fix); say(f"before {b}\nafter  {x}  -> {a.fix}"); return
    src = Path(a.project)
    if src.is_dir() or not src.suffix:
        import re
        from audio.media import clips, master, targets
        from common import renders, work_dir
        p = film_dir(src.resolve())
        if not (p / "index.html").exists(): raise SystemExit(f"no built film in {p}: kit.py build first")
        m = re.search(r'data-duration="([\d.]+)"', (p / "index.html").read_text(encoding="utf-8")); total = float(m.group(1)) if m else 0
        d = work_dir("loudness", film_name(p)); master(p, clips(p / "index.html"), total, out_dir=d)
        if not (d / "mix.wav").exists(): raise SystemExit("the film has no sound")
        I, P = targets(p); M = measure(d / "mix.wav")
        flag = lambda v, lim: "ok" if v <= lim + 0.05 else "OVER"
        under = ""
        if M["I"] < I - 1:
            ls = loudest_source(p, d / "mix.wav")
            if ls:
                fix = {"the voice": "a voice-over with lower peaks (compressed / limited when it is recorded or generated)",
                       "the music": "a lower music volume does not help: a track with lower peaks, or accept a quieter film"}.get(ls[1], "lower its gain")
                under = f"; the peaks hold the gain down: the highest is {ls[0]} s, made by {ls[1]} ({fix})"
        say(f"mix: {M['I']:.1f} LUFS (target {I:g}{under}), "
            f"true peak {M['TP']:.1f} dBTP (<= {P:g}: {flag(M['TP'], P)}), LRA {M['LRA']:.1f} LU, phone band (200 Hz - 6 kHz) "
            f"{M.get('phone', float('nan')):.1f} LUFS ({M.get('phone', 0) - M['I']:+.1f} LU from the full mix: a big drop = the weight sits in the sub)")
        v = latest_export(p)
        if v:
            E, Mo = measure(v, phone=False), measure_mono(v)
            loss = Mo["I"] - E["I"] + 3.0                    # a centred (mono) mix folds down exactly 3 LU quieter: that part is normal
            say(f"export {v.name}: {E['I']:.1f} LUFS, true peak {E['TP']:.1f} dBTP (<= {P:g}: {flag(E['TP'], P)}, after AAC); folded to mono (a "
                f"phone speaker): {loss:+.1f} LU beyond the normal 3 LU{': sounds cancel out in mono, check the stereo effects' if loss < -3 else ' (ok)'}, "
                f"true peak {Mo['TP']:.1f} dBTP")
        else: say("export: none yet. Measure again after MP4 Export (the article: measure the exported MP4, not the WAV)")
        H = hits(p, total)
        if H:
            say("sound effects (K-weighted, first 60 ms): over the music, want 3 to 6 dB; against the voice, never over it:")
            for i, t, over, vs in H:
                say(f"  {t:7.2f} s  {i:28s} {over:+5.1f} dB over the music" + (f", {vs:+5.1f} dB against the voice" if vs is not None else "")
                    + f"  {hit_verdict(over, vs)}")
        sc = silent_cuts(p)
        say(f"cuts with no sound effect within 0.35 s: {', '.join(f'{t:.2f} s' for t in sc)}" if sc else "every cut has a sound effect")
        if v:
            pages = cue_sheet(p, v, renders(p, "stills") / "audio")
            if pages: say(f"cue sheet (frame before / after each cue + the waveform; look at every page): {pages[0].parent}  ({len(pages)} page(s))")
        pts = listen_points(p, d / "mix.wav", H)
        if pts:
            say("check with headphones (give the user these five, never say the sound is good):")
            for t, why in pts: say(f"  {t:7.2f} s  {why}")
        return
    M = measure(src)
    say(str(M))


def cmd_build(a):
    """film.json (MotionSpec) -> index.html with every tween written out (existing index.html backed up to qa/backup/)"""
    from build import build
    p = film_dir(Path(a.project).resolve())
    if not (p / "film.json").exists(): raise SystemExit(f"no film.json in {p}")
    build(p, say=say)
    from qa.buildlint import enabled, lint                # quick warnings, every build (Test 1 U7); AIMK_NO_LINT=1 skips them
    if enabled(): lint(p, say=say)


def cmd_gallery(a):
    """kit.py gallery build [filter] | kit.py gallery check [filter] [--static | --random N] | kit.py gallery open   (engine/gallery.py)
    --static: only what needs no browser (preset.json reads, the frame rules of preset.js, as-shipped SHA-256): GitHub runs it
    --random N: N presets picked at random (the whole library takes about 1.5 h)"""
    import gallery
    if a.project == "build": gallery.build_all(a.times[0] if a.times else None)
    elif a.project == "check" and a.static: sys.exit(1 if gallery.check_static(a.times[0] if a.times else None) else 0)
    elif a.project == "check": sys.exit(1 if gallery.check_all(a.times[0] if a.times else None, sample=a.random) else 0)
    elif a.project == "open": gallery.open_page()
    elif a.project == "data":
        gallery.write_data(gallery.load_checks())
    else: raise SystemExit("usage: kit.py gallery build [filter] | check [filter] [--static | --random N] | open | data")


def cmd_library(a):
    """kit.py library [motion|layout] [word ...]: the library as one line per preset, for choosing (Claude reads this, not the 300 KB gallery data):
    name [flags] title: description {tags}; the user's review notes are shown (review ended 06/10/2026: every preset kept, so no verdict
    column; a Drop verdict in decisions.json would still leave the preset out)"""
    import gallery
    words = [w for w in ([a.project] + a.times) if w]
    if words and words[0] in ("import", "keep", "drop", "incoming"): return _library_intake(a, words, gallery)
    lib = words.pop(0) if words and words[0] in ("motion", "layout") else None
    dec = json.loads((gallery.GAL / "decisions.json").read_text(encoding="utf-8")) if (gallery.GAL / "decisions.json").exists() else {}
    chk = gallery.load_checks()
    rows, dropped, group, waiting = [], 0, None, 0
    for name, m in gallery.records():
        if m.get("_incoming"): waiting += 1; continue      # not usable by films until the user keeps it
        if lib and m["lib"] != lib: continue
        text = " ".join([name, m.get("title", ""), m.get("title_vi", ""), m.get("desc_vi", ""), " ".join(m.get("tags") or [])]).lower()
        if words and not all(w.lower() in text for w in words): continue
        d = dec.get(name, {})
        if d.get("decision") == "drop": dropped += 1; continue
        if (m["lib"], m["group"]) != group:
            group = (m["lib"], m["group"]); rows.append(f"\n## {m['lib']} / {m['group']}")
        flags = []
        if m.get("ae") and m["ae"] != "keyframes": flags.append(f"AE: {m['ae']}")
        if m.get("needs"): flags.append("cần " + ", ".join(m["needs"]))
        st = (chk.get(name) or {}).get("status")
        if st and st != "ok": flags.append(f"máy kiểm: {st}")
        tags = f" {{{', '.join(m['tags'])}}}" if m.get("tags") else ""
        note = f" | ghi chú của bạn: {d['note']}" if d.get("note") else ""
        rows.append(f"{name}{' [' + '; '.join(flags) + ']' if flags else ''} {m.get('title_vi') or m.get('title', '')}: {m.get('desc_vi', '')}{tags}{note}")
    n = sum(1 for r in rows if not r.startswith("\n"))
    say(f"# Thư viện: {n} mẫu{' (lọc: ' + ' '.join(([lib] if lib else []) + words) + ')' if lib or words else ''}" + (f"; {dropped} mẫu bạn đã Bỏ không hiện" if dropped else "")
        + (f"; {waiting} mẫu đang chờ trong Mới nhập (kit.py library incoming)" if waiting else "") + "\n".join([""] + rows))


def _library_intake(a, words, gallery):
    """kit.py library import | incoming | keep | drop (E5, "Mới nhập": gallery.py); import / keep / drop on the kit owner's machine only"""
    cmd, rest = words[0], words[1:]
    if cmd == "incoming":
        recs = [(n, m) for n, m in gallery.records() if m.get("_incoming")]
        chk = gallery.load_checks()
        say(f"# Mới nhập: {len(recs)} mẫu chờ bạn Giữ / Bỏ (Gallery, thẻ Mới nhập)")
        for n, m in recs:
            say(f"{n} [{m['lib']}; nhập {(m.get('incoming') or {}).get('at', '?')}; máy kiểm {(chk.get(n) or {}).get('status', 'chưa')}] "
                f"{m.get('title_vi') or m.get('title', '')}")
        return
    if cmd in ("keep", "drop"):
        if not rest: raise SystemExit(f"library {cmd} <group/name>")
        for n in rest: (gallery.keep if cmd == "keep" else gallery.drop)(n)
        return
    if len(rest) != 2: raise SystemExit("library import <project> <preset> [--as group/name] [--layout]")
    p = _proj_dir(rest[0])
    gallery.import_preset(p / "presets" / rest[1], a.as_name or rest[1], a.layout)


def _ingest_pr(p, ref):
    """kit.py ingest <film> <owner/repo#N | PR url>: a code change as a film's source (11/10/2026): HyperFrames' pr-to-video ingest run as
    shipped (engine/vendor/hf-pr, MANIFEST.json; needs Node.js and gh logged in) -> 01_Brief/pr/pr.json + diff.patch, 01_Brief/pr/
    extracted/ (people.json: contributors, visible-text.txt, tokens.json), the contributors' avatars in 03_HTML/assets/<login>.png
    (best effort). No film.json: the film is a free design from it (workflow/story.md, "A code change")."""
    from common import as_shipped, node_exe
    V = ENGINE / "vendor" / "hf-pr"
    bad = [f for f, h in json.loads((V / "MANIFEST.json").read_text(encoding="utf-8"))["sha256"].items() if not as_shipped(V / f, h)]
    if bad: raise SystemExit("engine/vendor/hf-pr is not as shipped: " + ", ".join(bad))
    node = node_exe()
    if not node: raise SystemExit("ingest of a pull request needs Node.js (install it from nodejs.org, LTS) and GitHub CLI logged in (gh auth login)")
    out = brief_dir(p) / "pr"; out.mkdir(parents=True, exist_ok=True)
    if "#" in ref and not ref.startswith("http"):        # gh pr view takes a URL or a number, not owner/repo#N outside a clone of that repo
        repo, n = ref.split("#"); ref = f"https://github.com/{repo}/pull/{n}"
    run = lambda *args: subprocess.run([node, *map(str, args)], cwd=str(p), capture_output=True, text=True, encoding="utf-8", errors="replace")
    r = run(V / "fetch-pr.mjs", "--pr", ref, "--out-dir", out)
    if r.returncode: raise SystemExit("fetch-pr: " + (r.stderr or r.stdout).strip() + "\n(do not invent the PR's content: fix gh access, or ask the user)")
    r = run(V / "ingest.mjs", "--pr-json", out / "pr.json", "--diff", out / "diff.patch", "--out-dir", out / "extracted")
    if r.returncode: raise SystemExit("ingest: " + (r.stderr or r.stdout).strip())
    run(V / "fetch-people-avatars.mjs", "--people", out / "extracted" / "people.json", "--project-dir", p)
    pr = json.loads((out / "pr.json").read_text(encoding="utf-8"))
    people = json.loads((out / "extracted" / "people.json").read_text(encoding="utf-8"))
    people = people.get("people", people) if isinstance(people, dict) else people
    say(f"PR {ref}: \"{pr.get('title', '')}\" ({pr.get('state', '')}), {len(pr.get('files') or [])} files, {len(people)} people "
        f"-> {out} (pr.json, diff.patch, extracted/); avatars in {p / 'assets'}. Next: workflow/story.md, \"A code change\".")


def cmd_ingest(a):
    """kit.py ingest <project> <deck.pptx> [--slides 1-6] [--compare <slide images> --pairs "S01=1, ..."]: a PowerPoint / Google Slides deck
    (Google Slides: File > Download > PowerPoint) -> deck/layout.json, deck/LAYOUT.md, deck/fonts.json, pictures (engine/intake/ingest.py, v1
    measuring), then film.json with one still scene per slide (Library preset intake/deck-slide) and the build. --no-film: the data only (a
    free-design film that uses the deck's content; Test 3 got a 21-scene film.json it did not want)"""
    import re
    p = film_dir(Path(a.project).resolve())
    if a.times and re.fullmatch(r"(https://github\.com/[\w.-]+/[\w.-]+/pull/\d+|[\w.-]+/[\w.-]+#\d+)/?", a.times[0].strip()):
        return _ingest_pr(p, a.times[0].strip())
    sys.path.insert(0, str(ENGINE / "intake"))
    import ingest, ingest_film, psd_film
    if a.times:
        p.mkdir(parents=True, exist_ok=True)
        ingest.ingest(a.times[0], p, say=say)
    if a.no_film:
        say(f"--no-film: data in {p / 'deck'} (LAYOUT.md to read); no film.json, no build"); return
    sl = None
    if a.slides:
        sl = set()
        for part in a.slides.split(","):
            x, _, y = part.strip().partition("-"); sl.update(range(int(x), int(y or x) + 1))
    ingest_film.make_film(p, slides=sl, say=say)
    from build import build
    build(p, say=say)
    if a.compare:
        pairs = {k.strip(): v.strip() for k, v in (x.split("=") for x in a.pairs.split(",") if "=" in x)} if a.pairs else \
                {s["id"]: str(int(s["id"][1:])) for s in json.loads((p / "film.json").read_text(encoding="utf-8"))["scenes"]}
        psd_film.compare(p, a.compare, pairs, say=say)


def cmd_psd(a):
    """kit.py psd <project> <file.psd|psb> --list | --frames "P01=F2/1, ..." [--keep "F2/BG"] [--film] [--compare <previews> --pairs "P01=1, ..."]
    (engine/intake/psd.py = v1 export, engine/intake/psd_film.py = film.json with the Library preset intake/psd-frame)"""
    sys.path.insert(0, str(ENGINE / "intake"))
    import psd, psd_film
    p = film_dir(Path(a.project).resolve())
    src = a.times[0] if a.times else None
    if a.list:
        if not src: raise SystemExit("usage: kit.py psd <project> <file.psb> --list")
        return psd.list_tree(src, p, say=say)
    if a.frames:
        if not src: raise SystemExit("usage: kit.py psd <project> <file.psb> --frames \"P01=Group/Sub, ...\"")
        psd.export(src, p, psd.parse_frames(a.frames), keep=[k.strip() for k in a.keep.split(",") if k.strip()], say=say)
    if a.film or a.frames:
        psd_film.make_film(p, say=say)
        from build import build
        build(p, say=say)
    if a.compare:
        pairs = {k.strip(): v.strip() for k, v in (x.split("=") for x in a.pairs.split(",") if "=" in x)}
        psd_film.compare(p, a.compare, pairs, say=say)


def cmd_ae(a):
    """editable After Effects project from a v2 film (engine/ae/port.py); --run builds it in the open AE, --check t1,t2 compares frames"""
    sys.path.insert(0, str(ENGINE / "ae"))
    import port
    if a.jsx: return port.fix(a.project, a.jsx, a.check or "auto")           # a script on the open project (no new port)
    est = port.run(a.project, run_ae=a.run, check=a.check, save=not a.no_save, estimate_only=a.estimate, rebuild=a.rebuild)
    if a.estimate: say("  (size only: nothing was recorded or built; run it with --run --check auto)")


def cmd_collide(a):
    """readable elements that run into each other on any sampled frame, and blank frames at scene cuts (v1 lint.py; rule 1 of the skill)"""
    from qa.collide import collide, report
    p, film = project(a.project); url, srv = film_url(film)
    try: res = collide(url, a.step, FPS, p / "qa" / "collide.json")
    finally: srv.shutdown()
    bad = report(res, say)
    say(f"-> {p / 'qa' / 'collide.json'}")
    if bad: raise SystemExit(1)


def cmd_transcribe(a):
    """every voice file of film.json -> audio/transcript/<file>.words.json + .srt (faster-whisper, engine/models/faster-whisper-small, this machine only)"""
    from audio.transcribe import run
    run(_proj_dir(a.project), a.lang or None, a.prompt or None, a.force, say, files=a.times or None)   # files: a voice-over before film.json has it


def cmd_cutout(a):
    """background removal with rembg and the models in engine/models/rembg (this machine only) -> assets/images/cutout/<name>.png + .mask.png"""
    from intake.cutout import cutout
    p = _proj_dir(a.project)
    if not a.times: raise SystemExit("give the image(s) or a video, e.g. kit.py cutout myfilm assets/images/photo.jpg [--people] [--trim]; kit.py cutout myfilm assets/video/talk.mp4 --people [--fps 30] [--captions]")
    if a.captions:                                      # HyperFrames' embedded captions: the clip at its own rate + HF's caption project
        from intake.captions import prepare
        from common import in_film
        for v in a.times: prepare(p, in_film(p, Path(v)), say, fps=int(a.fps or 0), force=a.force)
        return
    cutout(p, a.times, "people" if a.people else "objects", a.trim, say, fps=int(a.fps or 30))


def cmd_compare(a):
    """a reference video: the film beside it at the same times (sheets, the most different first, --old-colors); --shots: the reference
    alone (cuts, sheets, 01_Brief/SHOTS.md); --follow x,y,w,h: one element measured per frame; --split: side-by-side video (engine/qa/compare.py)"""
    from common import in_film
    if not a.times: raise SystemExit("give the reference video, e.g. kit.py compare myfilm 01_Brief/Reference/ref.mp4 --every 0.5")
    if a.shots or a.follow:                                   # the reference alone: the film needs no index.html yet
        p = _proj_dir(a.project); src = in_film(p, Path(a.times[0]))
        if not src.exists(): raise SystemExit(f"no such file: {a.times[0]}")
        if a.shots:
            from qa.shots import run as shots
            return shots(p, src, a.every or 0.25, say, a.t_from or 0.0, a.t_to)
        from qa.follow import run as follow
        box = [int(round(float(v))) for v in a.follow.split(",")]
        if len(box) != 4: raise SystemExit("--follow x,y,w,h: the element's box in the reference's own pixels")
        return follow(p, src, box, a.t_from or 0.0, a.t_to, a.color or None, a.bg, a.tol, a.name, say)
    p, film = project(a.project)
    src = in_film(p, Path(a.times[0]))
    if not src.exists(): raise SystemExit(f"no such file: {a.times[0]}")
    if a.split:
        from qa.compare import split
        return split(p, src, a.offset or 0.0, a.t_from or 0.0, a.t_to, say)
    from qa.compare import run
    run(p, film, src, a.every or 0.5, a.t_from or 0.0, a.t_to, a.offset or 0.0, say, a.old_colors or None)


def cmd_track(a):
    """time and tokens per stage of a film: kit.py track <project> "<stage>" | end | report (qa/track.py; asked by the user 07/10/2026)"""
    from qa import track
    p = _proj_dir(a.project)
    what = " ".join(a.times).strip()
    if not what: raise SystemExit('give a stage name, "end" or "report", e.g. kit.py track myfilm "First cut"')
    if what.lower() == "end": track.end(p, say)
    elif what.lower() == "report": track.report(p, say)
    else: track.mark(p, what, say)


def _proj_dir(arg):
    """the film's folder (03_HTML when the film has one; an older film's own folder), from a path or a name in the current folder"""
    p = Path(arg)
    if not p.is_dir(): raise SystemExit(f"no project {arg}")
    return film_dir(p.resolve())


def cmd_beats(a):
    """the song's tempo grid -> audio/transcript/<file>.beats.json (engine/audio/beats.py; numpy / scipy, this machine only)"""
    from audio.beats import fit_start, run, stretch
    p = _proj_dir(a.project); src = a.times[0] if a.times else None
    if a.fit: return fit_start(p, src, True, say)
    if a.to_bpm:
        if not src: raise SystemExit("--to-bpm: give the track, e.g. kit.py beats myfilm audio/music/track.mp3 --to-bpm 124")
        return run(p, stretch(p, src, a.to_bpm, a.bpm or None, a.force, say), a.to_bpm, None, say)
    run(p, src, a.bpm or None, a.offset, say)


def cmd_align(a):
    """known lyrics -> a time for every sung word -> audio/transcript/<file>.words.json + 01_Brief/LYRICS-TIMED.md (engine/audio/align.py)"""
    from audio.align import run
    if not a.times: raise SystemExit("usage: kit.py align <project> <lyrics.txt> [<audio>] [--lang vi]")
    pins = {int(k): float(v.replace(",", ".")) for k, v in (x.split("=") for x in a.pin.split(";") if "=" in x)} if a.pin else None
    secs = {int(k): float(v.replace(",", ".")) for k, v in (x.split("=") for x in a.sections.split(";") if "=" in x)} if a.sections else None
    snap = "auto" if a.snap in (None, "auto") else (int(a.snap) or None)
    run(_proj_dir(a.project), a.times[0], a.times[1] if len(a.times) > 1 else None, a.lang or None, say, pins, secs, snap, a.lag)


def cmd_spectro(a):
    """the singing as a picture with the beat grid and the aligned words -> 02_Assets/Stills/spectro/ (engine/audio/spectro.py)"""
    from audio.spectro import run
    run(_proj_dir(a.project), a.times[0] if a.times else None, a.t_from, a.t_to, say)


def cmd_pulse(a):
    """how much the film moves on the music's grid: lift after the beat, beats with a jolt, still frames (engine/qa/pulse.py)"""
    from qa.pulse import run
    run(a.project or None, a.video or None, a.bpm, a.offset, a.t_from, a.t_to)


def cmd_poses(a):
    """a product render sequence read before use: rest poses, a numbered sheet, 01_Brief/POSES.md to fill in (engine/qa/poses.py)"""
    from qa.poses import run
    if not a.times: raise SystemExit('usage: kit.py poses <project> <folder | "assets/images/seq/f####.webp"> [--every 8]')
    run(_proj_dir(a.project), a.times[0], int(a.every or 8), say)


def _locate(a):
    """kit.py measure <image> --locate overlay | region | final | mark [--vids 4,5 --hids 6,7 | --region x0,y0,x1,y1 | --box ...] [--out DIR]:
    where an object is in a picture, as a box normalised 0..1 (11/10/2026): HyperFrames' locate.mjs run as shipped (engine/vendor/hf-locate,
    its PROTOCOL.md is the loop: pick numbered strips, never guess pixels, check the box drawn on the picture). Node.js, ffmpeg + ffprobe."""
    from common import as_shipped, node_exe, work_dir
    V = ENGINE / "vendor" / "hf-locate"
    bad = [f for f, h in json.loads((V / "MANIFEST.json").read_text(encoding="utf-8"))["sha256"].items() if not as_shipped(V / f, h)]
    if bad: raise SystemExit("engine/vendor/hf-locate is not as shipped: " + ", ".join(bad))
    node = node_exe()
    if not node: raise SystemExit("locate needs Node.js (nodejs.org, LTS)")
    if not shutil.which("ffprobe"): raise SystemExit("locate needs ffmpeg and ffprobe on PATH (winget install Gyan.FFmpeg, then reopen the terminal)")
    img = Path(a.project).resolve()
    if not img.exists(): raise SystemExit(f"no picture {img}")
    out = a.out or str(work_dir("locate", img.stem))
    # locate.mjs (written for macOS / Linux) draws the strip numbers with /tmp/locate-font.ttf, a copy of Arial Bold it looks for in the
    # Mac / Linux font folders: on Windows "/tmp" is \tmp on the drive the script runs from. The kit runs it from C: and puts Windows' own
    # Arial Bold there (C:\tmp\locate-font.ttf, user OK 11/10/2026), so the script runs unchanged.
    drive = Path(os.environ.get("SystemDrive", "C:") + "\\")
    font = drive / "tmp" / "locate-font.ttf"
    if not font.exists():
        src = next((f for f in (Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "arialbd.ttf", ENGINE / "vendor" / "fonts" / "google" / "Archivo" / "Archivo[wdth,wght].ttf") if f.exists()), None)
        if not src: raise SystemExit("locate: no font to give it (Arial Bold)")
        font.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, font)
    step = a.locate; args = [node, str(V / "locate.mjs"), step, str(img)]
    if step == "mark": args += ["--box", a.box, "--out", str(Path(out) / "check.png") if not out.endswith(".png") else out]
    else:
        if a.vids: args += ["--vids", a.vids]
        if a.hids: args += ["--hids", a.hids]
        if a.region: args += ["--region", a.region]
        if step in ("overlay", "region"): args += ["--out", out]
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", cwd=str(LOCAL))   # LOCAL is on the system drive
    say((r.stdout + r.stderr).strip() + (f"\n(read the pictures in {out}; the loop: engine/vendor/hf-locate/PROTOCOL.md)" if step in ("overlay", "region", "mark") else ""))
    if r.returncode: raise SystemExit(r.returncode)


def cmd_measure(a):
    """kit.py measure "<text>" ["<text>" ...] --font "Roboto Flex" --weight 700 --size 140 [--in <project>]: the width of each line in px
    with the real font (brand packs, the project's assets/fonts, installed fonts), to centre text and pictures as one group.
    kit.py measure <film> --graph <element id> [--from s --to s]: the element's x / y / size / opacity and speed on every film frame as a
    chart (02_Assets\\Stills\\graph_<id>.png) + linear stretches and dead stops (qa/motionview.py; the "Motion Lab" article, 12/10/2026)"""
    if a.locate: return _locate(a)
    if getattr(a, "graph", ""):
        from qa.motionview import graph
        p, film = project(a.project); url, srv = film_url(film)
        try: rows, notes = graph(url, a.graph.lstrip("#"), a.t_from, a.t_to, renders(p, "stills") / f"graph_{a.graph.lstrip('#')}.png")
        finally: srv.shutdown()
        say(f"#{a.graph.lstrip('#')}: {len(rows)} frames -> {renders(p, 'stills') / ('graph_' + a.graph.lstrip('#') + '.png')}")
        for n in notes or ["no linear stretch, no dead stop"]: say("  " + n)
        return
    from fonts.fonts import measure
    texts = [x for x in [a.project] + a.times if x]
    if not texts or not a.font: raise SystemExit('usage: kit.py measure "<text>" ... --font "<family>" --size 140 [--weight 700] [--in <project>]')
    extra = [d for d in (KIT / "brands").glob("*/fonts")]
    if a.into: extra.append(_proj_dir(a.into) / "assets" / "fonts")
    for t in texts:
        r = measure(t, a.font, a.size, a.weight, False, 0.0, extra)
        if not r: raise SystemExit(f"font not found: {a.font} (kit.py font \"{a.font}\")")
        say(f"{r[0]:8.1f} px wide  {r[1]:6.1f} px ink height  \"{t}\"  ({a.font} {a.weight} {a.size:g} px, {Path(r[2]).name})")


def cmd_pdf(a):
    """kit.py pdf <file.pdf> [--pages 3-5,12] [--in <project>]: PDF pages -> PNG (150 dpi) so the pictures in a guideline can be looked at
    (test 07/10/2026: only the PDF text could be read). Needs PyMuPDF (optional package; ask before installing it). -> 01_Brief/pdf/ (older films: brief/pdf/)
    or next to the PDF in a <name>_pages folder"""
    try: import pymupdf as fitz
    except ImportError: raise SystemExit("PyMuPDF is not installed (optional, about 20 MB): ask the user, then: python -m pip install pymupdf")
    src = Path(a.project)
    if not src.exists(): raise SystemExit(f"no file {src}")
    out = (brief_dir(_proj_dir(a.into)) / "pdf" / src.stem) if a.into else src.with_name(src.stem + "_pages")
    out.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(str(src)); want = set()
    for part in (a.slides or f"1-{doc.page_count}").split(","):
        x, _, y = part.strip().partition("-"); want.update(range(int(x), int(y or x) + 1))
    for n in sorted(i for i in want if 1 <= i <= doc.page_count):
        doc[n - 1].get_pixmap(dpi=150).save(str(out / f"p{n:03d}.png"))
    say(f"{len(want)} page(s) -> {out}")


def cmd_voice(a):
    """ElevenLabs voice-over for every scene "voice" with a "text" (engine/audio/eleven.py); prints the cost, sends only with --yes"""
    from audio import eleven
    if a.list_voices: return eleven.voices(say)
    eleven.run_voice(_proj_dir(a.project), a.voice or None, a.lang or None, a.model or None, a.yes, a.confidential_ok, say)


def cmd_music(a):
    from audio import eleven
    if not a.times: raise SystemExit('usage: kit.py music <project> "<prompt>" [--length 30] [--instrumental] [--yes]')
    eleven.run_music(_proj_dir(a.project), " ".join(a.times), a.length or 30.0, a.instrumental, a.yes, a.confidential_ok, say=say)


def cmd_sfx_gen(a):
    from audio import eleven
    if not a.times: raise SystemExit('usage: kit.py sfx-gen <project> "<description>" [--length 2] [--name x] [--yes]')
    eleven.run_sfx(_proj_dir(a.project), " ".join(a.times), a.length or None, a.name or None, a.yes, a.confidential_ok, say)


def cmd_publish_check(a):
    """kit.py publish-check: what in the files git tracks could carry client or NDA material, before a push (qa/publish_check.py,
    roadmap step 7); read-only, exit 1 when it finds something"""
    from qa.publish_check import scan
    sys.exit(1 if scan(KIT, say) else 0)


def cmd_doctor(a):
    """is this machine ready for the kit (qa/doctor.py; chat B proposal, 08/10/2026): one line per check with its fix; exit 1 on an error"""
    from qa.doctor import run
    sys.exit(run(_browser, say))


def cmd_trash(a):
    """files / folders to the Recycle Bin (the user's rule: nothing is ever deleted for good; test 07/10/2026: Claude used unlink)"""
    from common import trash
    paths = [x for x in [a.project] + a.times if x]
    done = trash(paths)
    for x in done: say(f"  -> Thùng rác: {x}")
    left = [x for x in paths if Path(x).exists()]
    if left: raise SystemExit(f"not moved (still there): {left}")


def main():
    ap = argparse.ArgumentParser(description="Moworks Motion")
    ap.add_argument("cmd", choices=["new", "build", "info", "mp4", "stills", "verify", "lint", "qa", "preview", "brand", "brand-check", "font", "loudness", "ae", "gallery", "psd", "hf", "studio", "ingest", "library", "collide", "transcribe", "cutout", "track", "trash", "beats", "align", "measure", "pdf", "voice", "music", "sfx-gen", "tidy", "reframe", "ref", "mov", "spectro", "poses", "pulse", "storyboard", "version", "round", "rounds", "restore", "doctor", "publish-check", "proxy", "feedback", "sheet", "compare"])
    ap.add_argument("project", nargs="?", default=""); ap.add_argument("times", nargs="*")
    ap.add_argument("--aspect", default="16:9", choices=list(ASPECTS))
    ap.add_argument("--dir", default="", help="new: make the film inside this folder (the job's own folder; default: the current folder)")
    ap.add_argument("--note", default="", help="round / version: a line saved with the round (what changed this round)")
    ap.add_argument("--base", default="", help="round film: the version this round was fixed from (after kit.py restore), e.g. v2")
    ap.add_argument("--blur", dest="mp4blur", action="store_true", help="mp4: bake the 180-degree motion blur (slower); default = the player's pixels (mov: on already)")
    ap.add_argument("--out", default="", help="mp4: the file to write (default renders\\mp4\\<film>_60fps_<date-time>.mp4)")
    ap.add_argument("--beats", action="store_true", help="stills: one frame per scene (settled)")
    ap.add_argument("--strip", type=float, default=None, help="stills: 12 frames in a row around this second")
    ap.add_argument("--phone", action="store_true", help="stills: one frame per scene at phone width (360 px)")
    ap.add_argument("--cuts", action="store_true", help="stills: 12 frames around every scene change, one row per change")
    ap.add_argument("--onion", action="store_true", help="stills <t0> <t1>: onion skin of the frames between (--every s, default 1/24)")
    ap.add_argument("--graph", default="", help="measure <film> --graph <element id>: position / size / opacity / speed per frame as a chart")
    ap.add_argument("--yes", action="store_true", help="voice / music / sfx-gen: send it (paid); without it the command only prints the cost")
    ap.add_argument("--confidential-ok", dest="confidential_ok", action="store_true", help="voice / music / sfx-gen: the user agreed to send the text of a job whose brand pack marks scripts confidential")
    ap.add_argument("--voice", default="", help="voice: ElevenLabs voice id or name (scene voice_id wins)")
    ap.add_argument("--model", default="", help="voice: ElevenLabs model (default eleven_multilingual_v2)")
    ap.add_argument("--list-voices", action="store_true", help="voice: list the account's voices")
    ap.add_argument("--length", type=float, default=0, help="music / sfx-gen: seconds; ref: seconds between frames (default 1)")
    ap.add_argument("--instrumental", action="store_true", help="music: no vocals")
    ap.add_argument("--name", default="", help="sfx-gen: file name; ref add: the reference's name; reframe: the new film's folder name; compare --follow: the measure's name")
    ap.add_argument("--font", default="", help="measure: the font family")
    ap.add_argument("--fps", type=int, default=0, help="cutout <video>: frames a second of the person matte (default 30; --captions: the clip's own)")
    ap.add_argument("--captions", action="store_true", help="cutout <video> --people: HyperFrames' embedded captions (engine/intake/captions.py): matte, words, safe zones")
    ap.add_argument("--present", action="store_true", help="studio: a deck (film.json \"slides\") in HyperFrames' presenter")
    ap.add_argument("--locate", default="", help="measure <image>: overlay | region | final | mark (where an object is: engine/vendor/hf-locate/PROTOCOL.md)")
    ap.add_argument("--vids", default="", help="measure --locate: the vertical strips the object spans, e.g. 4,5")
    ap.add_argument("--hids", default="", help="measure --locate: the horizontal strips, e.g. 6,7")
    ap.add_argument("--region", default="", help="measure --locate final: the region printed by the region step")
    ap.add_argument("--box", default="", help="measure --locate mark: the box to draw, x0,y0,x1,y1")
    ap.add_argument("--size", type=float, default=100, help="measure: font size in px")
    ap.add_argument("--weight", type=int, default=400, help="measure: font weight")
    ap.add_argument("--in", dest="into", default="", help="measure / pdf: the project (its fonts; where the pages go)")
    ap.add_argument("--pin", default="", help='align: line starts heard by ear, e.g. "8=17.58; 12=33.32" (line number = seconds in the song)')
    ap.add_argument("--every", type=float, default=None, help="poses: one frame in N on the sheet (default 8); compare: seconds between pairs (default 0.5; --shots: between sheet frames, default 0.25)")
    ap.add_argument("--shots", action="store_true", help="compare: the reference alone before a remake: hard cuts, sheets with times and frames, 01_Brief/SHOTS.md, its sound for beats")
    ap.add_argument("--follow", default="", help="compare: x,y,w,h (reference px): one element measured frame by frame -> its moves, times, closest eases (01_Brief/ref/follow/)")
    ap.add_argument("--color", default="", help="compare --follow: the element's colour (#hex); default: what differs from the background (--bg)")
    ap.add_argument("--split", action="store_true", help="compare: the film's newest MP4 export beside the reference as one video (02_Assets/Compare/)")
    ap.add_argument("--old-colors", dest="old_colors", default="", help='compare: the reference brand\'s colours, e.g. "#FF6A2A,#38BDF8": the times where they are still in the film')
    ap.add_argument("--to-bpm", dest="to_bpm", type=float, default=0, help="beats: first speed the track up / down to this tempo, pitch kept (-> audio/music/<file>_<N>bpm.wav)")
    ap.add_argument("--from", dest="t_from", type=float, default=None, help="spectro: from this second")
    ap.add_argument("--to", dest="t_to", type=float, default=None, help="spectro: to this second")
    ap.add_argument("--snap", default=None, help="align: word starts on the grid: 8 (eighths) or 16 (sixteenths); off by default, use it after the line starts are tapped")
    ap.add_argument("--lag", type=float, default=0.08, help="align: heard words move this much earlier first (Whisper's lag, default 0.08 s)")
    ap.add_argument("--sections", default="", help='align: rough start of each part of the song, e.g. "1=0; 8=17.5; 11=29.6": each part heard alone')
    ap.add_argument("--bpm", type=float, default=0, help="beats: force the tempo; pulse: the grid when the film has no song")
    ap.add_argument("--video", default="", help="pulse: measure this exported video instead of rendering the film small")
    ap.add_argument("--offset", type=float, default=None, help="beats: force the first beat (seconds)")
    ap.add_argument("--fit", action="store_true", help="beats: move where the music starts (its \"trim\") so the built film's cuts and sound cues land on the beat")
    ap.add_argument("--workers", type=int, default=default_workers(), help="mp4 / mov / proxy: render processes at once (default: by cores and free memory)")
    ap.add_argument("--4k", dest="uhd", action="store_true", help="mp4 / mov: 4K, twice the film's pixels on the same layout (3840x2160 for 16:9, 2160x3840 for 9:16)")
    ap.add_argument("--alpha", action="store_true", help="mov: transparent where the film has no background (ProRes 4444 alpha)")
    ap.add_argument("--gif", action="store_true", help="mp4: also a GIF beside it for X (24 fps, 1200 px, one palette, exact delays)")
    ap.add_argument("--samples", type=int, default=24)
    ap.add_argument("--loop", action="store_true", help="verify: the film loops: its seam in position and speed (last frame -> first vs the frames around it)")
    ap.add_argument("--play", action="store_true", help="verify: also play every frame from 0 (as an export does) and compare with direct seeks")
    ap.add_argument("--port", type=int, default=None, help="preview: serve the player on this port (default: one per project); studio: 3010")
    ap.add_argument("--no-open", action="store_true", help="mp4 / mov: do not open Explorer at the end; preview: no window, print the link and serve until Ctrl+C")
    ap.add_argument("--fix", default="", help="loudness: write a normalised copy to this WAV")
    ap.add_argument("--no-blur", dest="blur", action="store_false", help="mov: no motion blur (default bakes a 180-degree shutter, never across cuts; off for pixel art / hand-drawn)")
    ap.add_argument("--run", action="store_true", help="ae: build the project inside the open After Effects")
    ap.add_argument("--check", default="", help="ae: film seconds to render in AE and compare with the browser, e.g. 1.5,4")
    ap.add_argument("--static", action="store_true", help="gallery check: only what needs no browser (preset.json, frame rules, as-shipped SHA-256)")
    ap.add_argument("--random", type=int, default=0, help="gallery check: N presets picked at random")
    ap.add_argument("--no-save", action="store_true", help="ae: do not save the .aep")
    ap.add_argument("--estimate", action="store_true", help="ae: only the size of the port (layers x samples, MB, minutes), in seconds")
    ap.add_argument("--rebuild", action="store_true", help="ae: the AE step again from the saved recording (after a port code change)")
    ap.add_argument("--jsx", default=None, help="ae: run this script on the project open in AE (copy first, check frames before / after)")
    ap.add_argument("--no-film", action="store_true", help="ingest: only the deck's data (deck/LAYOUT.md, layout.json, pictures, fonts), no film.json")
    ap.add_argument("--slides", "--pages", default="", help="ingest: only these slides, e.g. 1-6,9; pdf: these pages")
    ap.add_argument("--quiet", action="store_true", help="hf update: log only (background check)")
    ap.add_argument("--hf", action="store_true", help="lint: HyperFrames' own linter instead of the v2 lint")
    ap.add_argument("--list", action="store_true", help="psd: print the layer tree (PSD-TREE.md)")
    ap.add_argument("--frames", default="", help="psd: frames to export, e.g. \"P01=F2/1, P02=F2/2\" (then film.json + build)")
    ap.add_argument("--keep", default="", help="psd: layers shared by every frame of a group, e.g. \"F2/BG\"")
    ap.add_argument("--film", action="store_true", help="psd: film.json from an existing psd.json, then build")
    ap.add_argument("--compare", default="", help="psd: folder of the client's numbered previews")
    ap.add_argument("--pairs", default="", help="psd: frame = preview number, e.g. \"P01=1, P02=2\"")
    ap.add_argument("--step", type=float, default=0.05, help="collide: seconds between samples")
    ap.add_argument("--brief", nargs="?", const="", default=None, help="brand-check: also the brief vs the guideline (a file, several joined with ';'; empty = <project>\\brief\\*.md|txt)")
    ap.add_argument("--lang", default="", help="transcribe: language of the voice (vi, en; empty = detect)")
    ap.add_argument("--prompt", default="", help="transcribe: names and brands the voice says, e.g. \"Moworks, HyperFrames\"")
    ap.add_argument("--force", action="store_true", help="transcribe: do every voice again; beats --to-bpm: allow a change over 8 %%; cutout --captions: matte and words again")
    ap.add_argument("--people", action="store_true", help="cutout: the people model (u2net_human_seg) instead of objects (isnet-general-use)")
    ap.add_argument("--trim", action="store_true", help="cutout: crop to the cut-out (+8 px)")
    ap.add_argument("--as", dest="as_name", default="", help="library import: the name in the library, <group>/<name> (default: the film's preset name)")
    ap.add_argument("--layout", action="store_true", help="library import: a layout / UI block (library/layouts), not a motion preset")
    ap.add_argument("--bg", default="auto", help="compare --follow: auto (the box border's colour is left out) | none | #hex")
    ap.add_argument("--looks", default="", help="sheet: the looks to show, e.g. anna,ben (default: the film's cast, else the library's)")
    ap.add_argument("--poses", default="", help="sheet: the poses, e.g. stand,wave,sitDesk (default: the joint-check set AIMK_RIG.STRESS)")
    ap.add_argument("--puppets", nargs="?", const="*", default=None, help="sheet: check the film's drawn puppets (presets/drawn/<name>): every pose alone on #00FF00, holes, pieces, gaps at joints, every part alone; a,b: only those")
    ap.add_argument("--hero", default="", help="sheet --puppets: the hero frame (a picture, or video@seconds): each puppet at rest drawn at its origin over it, with the difference")
    ap.add_argument("--tol", type=float, default=40.0, help="compare --follow: the colour distance that still counts as the element (default 40)")
    a = ap.parse_args()
    if not a.project and a.cmd not in ("library", "doctor", "publish-check") and not (a.cmd == "pulse" and a.video): ap.error(f"{a.cmd}: missing <project>")
    {"new": cmd_new, "version": cmd_version, "round": lambda a: cmd_round(_round_args(a)), "rounds": cmd_rounds, "restore": lambda a: cmd_restore(_restore_args(a)), "build": cmd_build, "info": cmd_info, "mp4": cmd_mp4, "stills": cmd_stills, "verify": cmd_verify, "preview": cmd_preview,
     "brand": cmd_brand, "brand-check": cmd_brand_check, "font": cmd_font, "lint": cmd_lint, "qa": cmd_qa, "loudness": cmd_loudness, "ae": cmd_ae, "gallery": cmd_gallery, "psd": cmd_psd, "hf": cmd_hf, "studio": cmd_studio, "ingest": cmd_ingest, "library": cmd_library,
     "collide": cmd_collide, "transcribe": cmd_transcribe, "cutout": cmd_cutout, "track": cmd_track, "trash": cmd_trash, "beats": cmd_beats, "align": cmd_align, "measure": cmd_measure, "pdf": cmd_pdf, "voice": cmd_voice, "music": cmd_music, "sfx-gen": cmd_sfx_gen, "tidy": cmd_tidy, "reframe": cmd_reframe, "ref": cmd_ref, "mov": cmd_mov, "spectro": cmd_spectro, "poses": cmd_poses, "pulse": cmd_pulse, "storyboard": cmd_storyboard, "doctor": cmd_doctor, "publish-check": cmd_publish_check, "proxy": cmd_proxy, "feedback": cmd_feedback, "sheet": cmd_sheet, "compare": cmd_compare}[a.cmd](a)


if __name__ == "__main__":
    main()
