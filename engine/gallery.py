"""kit.py gallery: the preset library page (plan section 6, G4).

  kit.py gallery build [filter]   for every library/presets/<group>/<name>/preset.js (or the ones whose name contains <filter>): build its demo
                                  film (film.json made from preset.json "demo") in %USERPROFILE%\\.aimotionkit\\work\\gallery, run the machine
                                  checks, write a 480x270 15 fps preview clip + a still into library/gallery/clips and thumbs, then the page data
  kit.py gallery open             the page in its own window; each card has a Copy button (a one-line brief naming the preset). The review
                                  (Keep / Drop / Note) ended 06/10/2026 with every preset kept; its notes stay in decisions.json, shown read-only
                                  (the server stops when the window closes)

"Mới nhập" (E5, user 08/10/2026: "khi ng dùng muốn import preset hoặc layout mới vào library thì có một category ghi rõ là mới import vào.
cần final check giữ hoặc không"): a film's own preset goes to library/incoming/presets|layouts/<group>/<name>/ (kit.py library import), gets
its demo clip and checks here, and shows on the page under "Mới nhập" with Giữ (moved into library/presets|layouts, usable by every film)
and Bỏ (Recycle Bin). Until kept, films cannot use it (build only looks in the library and the film's own presets/).

The library is the kit owner's cherry-pick (user 12/10/2026: "library là không cho sửa trừ chủ repo"): only the owner's machine
(%USERPROFILE%\\.aimotionkit\\maintainer.txt, never in git) imports, keeps or drops presets, from the Gallery's buttons or kit.py library
import | keep | drop. The owner also gets Bỏ on every library card (the preset to the Recycle Bin; the next maintenance pull request takes
the removal to GitHub), except on presets the kit itself uses (in_use: its code, skill, tests, or another preset). Other machines see
Copy only, and their films keep a new effect in the film's own presets/.

Machine checks (results in library/gallery/checks/<group>__<name>.json and on each card):
  build     the preset bakes into literal tweens (no tween the builder cannot write out), no page errors
  seek      the same time renders the same pixels after jumping elsewhere (seek-safe, nothing random or wall-clock); "seek" counts pixels
            that moved by more than 8/255 (limit 0.02 %), "seek_exact" any byte change (software GL wobbles filter edges by one level)
  bake      the written-out film matches the live preset at 5 times (pixels that differ by more than 24/255, share of the frame)
  end       effect presets: the last frame matches the same layout with no motion (catches clipped diacritics and things that never land)
  static    preset.js has no Math.random / Date / performance.now / requestAnimationFrame / network URL
  ease fit  function eases from a source repo, fitted to one cubic Bezier: the largest error (0..1)
  source    a block copied as shipped with its SHA-256 in preset.json "source" (added from 11/10/2026): every file still has that hash
Vietnamese: every demo uses Vietnamese text with diacritics; "end" is where clipped marks show up."""
import asyncio, io, json, re, shutil, subprocess, sys, time
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import KIT, LOCAL, say                      # noqa: E402

LIBP = KIT / "library" / "presets"
LIBL = KIT / "library" / "layouts"                     # the layout / UI library (same format, own switch on the page)
INC = KIT / "library" / "incoming"                     # "Mới nhập": presets / layouts waiting for the user's Giữ / Bỏ (not in git)
ROOTS = {("motion", False): LIBP, ("layout", False): LIBL, ("motion", True): INC / "presets", ("layout", True): INC / "layouts"}
GAL = KIT / "library" / "gallery"
GALI = GAL / "incoming"                                # "Mới nhập" clips / thumbs / checks + incoming.js data: out of git until kept
WORKG = LOCAL / "work" / "gallery"
OWNER = LOCAL / "maintainer.txt"                       # this machine is the kit owner's: the only one that changes the library
VENDOR = ENGINE / "vendor"
FPS, SCALE, CHECK_SCALE = 15, 0.25, 0.5
BAD = [(r"Math\.random", "Math.random"), (r"Date\.now|new Date", "Date"), (r"performance\.now", "performance.now"),
       (r"requestAnimationFrame", "requestAnimationFrame"), (r"https?://", "network URL")]

VN = "Chuyển động mượt mà"
VN2 = "Thiết kế đẹp, dễ chỉnh sửa"
TEXT = {"color": "#f5f5f2", "font-weight": "760", "font-size": "120px", "white-space": "nowrap", "left": "50%", "top": "50%", "transform": "translate(-50%, -50%)"}
DEFAULT_DEMOS = {
    "text": {"elements": [{"id": "t1", "type": "text", "text": VN, "style": TEXT}], "motion": [{"target": "t1", "at": 0.3}]},
    "shape": {"elements": [{"id": f"d{i}", "type": "box", "style": {"left": f"{560 + i * 220}px", "top": "440px", "width": "180px", "height": "180px",
                                                                   "border-radius": "50%", "background": c}} for i, c in enumerate(["#ff5a5f", "#ffb400", "#00a699", "#3a86ff"])],
              "motion": [{"target": ["d0", "d1", "d2", "d3"], "at": 0.3}]},
    "motion": {"elements": [{"id": "card", "type": "box", "style": {"left": "660px", "top": "290px", "width": "600px", "height": "500px", "border-radius": "28px", "background": "#3a86ff"}}],
               "motion": [{"target": "card", "at": 0.3}]},
}
DEFAULT_DEMOS["line"] = {"elements": [{"id": "ln", "type": "box", "style": {"left": "460px", "top": "535px", "width": "1000px", "height": "10px", "background": "#ffb400"}}],
                         "motion": [{"target": "ln", "at": 0.3}]}
DEFAULT_DEMOS["data"] = {"elements": [{"id": "n1", "type": "text", "text": "0", "style": dict(TEXT, **{"font-size": "220px", "font-variant-numeric": "tabular-nums"})}],
                         "motion": [{"target": "n1", "at": 0.3, "params": {"to": 12480}}]}
DEFAULT_DEMOS["block"] = {"elements": [{"id": "slot", "type": "box", "style": {"left": "0px", "top": "0px", "width": "1920px", "height": "1080px"}}],
                          "motion": [{"target": "slot", "at": 0.3}]}


def records():
    """every preset in the library, then every one waiting in "Mới nhập": (name, meta) with meta from preset.json (or a minimal record);
    meta["_incoming"] is True for the waiting ones"""
    out = []
    for (lib, inc), root in ROOTS.items():
      for js in sorted(root.rglob("preset.js")) if root.exists() else []:
        name = js.parent.relative_to(root).as_posix()
        mj = js.parent / "preset.json"
        meta = json.loads(mj.read_text(encoding="utf-8")) if mj.exists() else {}
        meta.setdefault("name", name); meta.setdefault("group", name.split("/")[0]); meta.setdefault("kind", "effect" if lib == "motion" else "block")
        meta["lib"] = lib; meta["_js"] = str(js); meta["_incoming"] = inc
        out.append((name, meta))
    return out


def find(name):
    """(lib, incoming, folder) of a preset name, or None"""
    for (lib, inc), root in ROOTS.items():
        if (root / name / "preset.js").exists(): return lib, inc, root / name
    return None


def owner():
    return OWNER.exists()


def need_owner(what):
    if not owner():
        raise SystemExit(f"{what}: only the kit owner changes the library (this machine has no {OWNER}). A new effect stays in the "
                         "film's own 03_HTML/presets/ (workflow/library-intake.md)")


def in_use():
    """{library preset: [what uses it]}: the kit's own code, skill and tests (engine/, vendor aside) and the other library presets' code or
    demo (e.g. house/pop-cute is called by five others). The owner's Bỏ is refused for these: a film, the skill or a preset would break.
    Not counted: engine/tests/hf_*.json (the HyperFrames import lists name every block they made) and notes (tests/*.md).
    Read again on every call, so a preset whose last user was dropped becomes droppable."""
    recs = [(n, m) for n, m in records() if not m.get("_incoming")]
    names, used = {n for n, _ in recs}, {}
    name_rx = re.compile(r"""["'`]([a-z0-9][a-z0-9-]*/[a-z0-9][a-z0-9-]*)["'`]""")
    for f in ENGINE.rglob("*"):
        rel = f.relative_to(ENGINE).parts
        if rel[0] in ("vendor", "models", "fonts") or "__pycache__" in rel or f.suffix not in (".py", ".js", ".mjs", ".html", ".json", ".md") or not f.is_file(): continue
        if rel[0] == "tests" and (f.name.startswith("hf_") or f.suffix == ".md"): continue
        where = rel[0] if rel[0] in ("skill", "tests") else "engine"
        for x in set(name_rx.findall(f.read_text(encoding="utf-8", errors="ignore"))):
            if x in names: used.setdefault(x, set()).add(where)
    for n, m in recs:
        text = Path(m["_js"]).read_text(encoding="utf-8", errors="ignore") + json.dumps(m.get("demo") or {})
        for x in set(name_rx.findall(text)):
            if x in names and x != n: used.setdefault(x, set()).add(n)
    return {k: sorted(v) for k, v in used.items()}


def import_preset(src_dir, name, layout=False, say=say):
    """a film's preset folder -> library/incoming/<presets|layouts>/<name>/ (its AIMK.preset("...") registration renamed to <name>), then its
    demo clip and checks. The folder is copied as it is: check it first for client text, pictures, colours and names (the skill says how)."""
    import datetime
    need_owner("library import")
    src_dir = Path(src_dir)
    if not (src_dir / "preset.js").exists(): raise SystemExit(f"no preset.js in {src_dir}")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*/[a-z0-9][a-z0-9-]*", name):
        raise SystemExit(f"library import: name \"{name}\"? use <group>/<name> in lower case, e.g. text/held-note (--as)")
    if find(name): raise SystemExit(f"library import: {name} already exists ({find(name)[2]}): choose another name (--as)")
    dst = ROOTS[("layout" if layout else "motion", True)] / name
    shutil.copytree(src_dir, dst, ignore=shutil.ignore_patterns("desktop.ini", "__pycache__", "*.pyc"))
    js = dst / "preset.js"; t = js.read_text(encoding="utf-8")
    reg = re.findall(r"""AIMK\.preset\(\s*["']([^"']+)["']""", t)            # "name" or 'name'
    if len(reg) != 1: raise SystemExit(f"library import: {js} registers {len(reg)} presets (AIMK.preset(\"...\")): one per folder")
    if reg[0] != name: js.write_text(re.sub(r"""AIMK\.preset\(\s*["']""" + re.escape(reg[0]) + r"""["']""", f'AIMK.preset("{name}"', t, count=1), encoding="utf-8")
    mj = dst / "preset.json"; meta = json.loads(mj.read_text(encoding="utf-8")) if mj.exists() else {}
    meta.update(name=name, group=name.split("/")[0], kind=meta.get("kind") or ("block" if layout else "effect"),
                incoming={"at": datetime.date.today().isoformat(), "note": "viết cho một phim của studio, chờ bạn Giữ / Bỏ trên Gallery"})
    meta.setdefault("source", {"label": "Moworks Motion"}); meta.setdefault("license", "Moworks")
    mj.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    meta.update(lib="layout" if layout else "motion", _js=str(js), _incoming=True)
    say(f"  {name}: -> {dst}; building its demo and checks...")
    (GALI / "checks").mkdir(parents=True, exist_ok=True)
    c = run_one(name, meta)
    (GALI / "checks" / f"{slug(name)}.json").write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding="utf-8")
    write_data(load_checks())
    say(f"  {name}: máy kiểm {c['status']}" + (f" ({'; '.join(c.get('problems') or [])})" if c.get("problems") else "")
        + (f" {c.get('build')}" if c.get("build", "ok") != "ok" else "") + (f" {c.get('render')}" if c.get("render") else ""))
    return c


def _prune(d):
    """a group folder left empty by Giữ / Bỏ (Google Drive leaves a desktop.ini in it) -> Recycle Bin"""
    from common import trash
    d = Path(d)
    if d.is_dir() and d not in ROOTS.values() and all(x.is_file() and x.name.lower() == "desktop.ini" for x in d.iterdir()): trash([d])


def keep(name, say=say):
    """Giữ: library/incoming/.../<name> -> library/presets|layouts/<name> (films can use it now); its clip and checks stay"""
    import datetime
    need_owner("library keep")
    f = find(name)
    if not f or not f[1]: raise SystemExit(f"keep: {name} is not waiting in Mới nhập")
    dst = ROOTS[(f[0], False)] / name
    if dst.exists(): raise SystemExit(f"keep: {dst} already exists")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(f[2]), str(dst)); _prune(f[2].parent)
    s = slug(name)
    for sub, ext in (("clips", "mp4"), ("thumbs", "png"), ("checks", "json")):    # its clip, picture and checks join the library's
        x = GALI / sub / f"{s}.{ext}"
        if x.exists(): (GAL / sub).mkdir(parents=True, exist_ok=True); shutil.move(str(x), str(GAL / sub / x.name))
    mj = dst / "preset.json"
    if mj.exists():
        meta = json.loads(mj.read_text(encoding="utf-8")); inc = meta.pop("incoming", {})
        meta["kept"] = {"imported": inc.get("at"), "kept": datetime.date.today().isoformat()}
        mj.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    write_data(load_checks())
    say(f"  {name}: kept -> {dst}")
    return dst


def drop(name, say=say):
    """Bỏ: a preset waiting in Mới nhập, or (12/10/2026) one in the library: its folder, clip, picture and checks -> Recycle Bin. The kit
    owner only; a library preset the kit uses (in_use) stays. A library removal reaches GitHub with the next maintenance pull request."""
    from common import trash
    need_owner("library drop")
    f = find(name)
    if not f: raise SystemExit(f"drop: no preset {name} in the library or Mới nhập")
    if not f[1] and (by := in_use().get(name)):
        raise SystemExit(f"drop: {name} stays, the kit uses it ({', '.join(by)})")
    s, G = slug(name), (GALI if f[1] else GAL)
    trash([f[2]] + [x for x in (G / "clips" / f"{s}.mp4", G / "thumbs" / f"{s}.png", G / "checks" / f"{s}.json") if x.exists()])
    _prune(f[2].parent)
    write_data(load_checks())
    say(f"  {name}: -> Recycle Bin")


def slug(name): return name.replace("/", "__")


def demo_spec(name, meta):
    d = json.loads(json.dumps(meta.get("demo") or {}))
    if d.get("scenes"):
        scenes = d["scenes"]
    else:
        base = DEFAULT_DEMOS["block" if meta.get("kind") == "block" else meta["group"]] if (meta.get("kind") == "block" or meta["group"] in DEFAULT_DEMOS) else DEFAULT_DEMOS["text"]
        base = json.loads(json.dumps(base))             # a fresh copy: the defaults are shared, and setdefault("preset") below must not stick to them
        els = d.get("elements") or base["elements"]
        mot = d.get("motion") or base["motion"]
        scenes = [{"id": "s1", "name": meta.get("title", name), "duration": d.get("duration", "auto"), "hold": d.get("hold", 1.0), "elements": els, "motion": mot}]
    for s in scenes:
        for m in s.get("motion", []):
            m.setdefault("preset", name)
            pr = m.get("params") or {}
            if pr.get("words") == "demo" or pr.get("keywords") == "demo":   # caption presets: the shared Vietnamese demo transcript
                cw = json.loads((GAL / "demo-assets" / "caption-words.json").read_text(encoding="utf-8"))
                if pr.get("words") == "demo": pr["words"] = cw["words"]
                if pr.get("keywords") == "demo": pr["keywords"] = cw["keywords"]
    return {"spec": "aimk-motionspec/0", "title": f"Gallery demo: {name}", "size": [1920, 1080], "brand": None,
            "background": d.get("bg", "#111216"), "scenes": scenes}


def plain(spec):
    """the same demo with no motion (reference for the end check)"""
    s = json.loads(json.dumps(spec))
    for sc in s["scenes"]: sc["motion"] = []; sc.pop("transition_in", None); sc["duration"] = 1
    return s


def prepare(dirp, spec):
    if dirp.exists(): shutil.rmtree(dirp, ignore_errors=True)
    (dirp / "assets" / "vendor").mkdir(parents=True); (dirp / "assets" / "fonts").mkdir(parents=True)
    shutil.copy2(VENDOR / "gsap" / "gsap.min.js" if (VENDOR / "gsap" / "gsap.min.js").exists() else VENDOR / "gsap.min.js", dirp / "assets" / "vendor" / "gsap.min.js")
    font = next(iter(VENDOR.rglob("RobotoFlex-var.woff2")))
    shutil.copy2(font, dirp / "assets" / "fonts" / font.name)
    demo_assets = GAL / "demo-assets"
    if demo_assets.exists(): shutil.copytree(demo_assets, dirp / "assets" / "demo", dirs_exist_ok=True)
    (dirp / "film.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")


def _ffmpeg():
    f = shutil.which("ffmpeg")
    if f: return f
    import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()


def _arr(png):
    import numpy as np
    from PIL import Image
    return np.asarray(Image.open(io.BytesIO(png)).convert("RGB")).astype("int16")


def _diff(a, b, thr=24):
    import numpy as np
    if a.shape != b.shape: return 1.0
    return float((np.abs(a - b).max(axis=2) > thr).mean())


async def _page(br, url, scale):
    from render.browser import DRIVER, page_timeouts
    pg = page_timeouts(await br.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=scale))
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(DRIVER)
    await pg.goto(url)
    info = await pg.evaluate("window.__aimk.ready")
    if not info or info.get("error"): raise RuntimeError(f"not ready: {(info or {}).get('error')} {errs[:2]}")
    await pg.set_viewport_size({"width": int(info["w"]), "height": int(info["h"])})
    info["errs"] = errs
    return pg, info


async def _shot(pg, info, t):
    from render.browser import PAINT
    await pg.evaluate(f"window.__aimk.seek({t})"); await pg.evaluate(PAINT)
    for k in range(6):                                  # software GL at a small scale: the first capture of a page can fail once, then works
        try: return await pg.screenshot(type="png", clip={"x": 0, "y": 0, "width": info["w"], "height": info["h"]})
        except Exception:
            if k == 5: raise
            await asyncio.sleep(0.15)


async def _render_and_check(base, kind, clip_out, thumb_out, check_end, thumb_at=0.82):
    from playwright.async_api import async_playwright
    from render.browser import launch
    res = {}
    async with async_playwright() as pw:
        br = await launch(pw)
        # preview clip
        pg, info = await _page(br, base + "index.html", SCALE)
        D = info["duration"]; n = max(1, int(round(D * FPS)))
        ff = subprocess.Popen([_ffmpeg(), "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                               "-crf", "26", "-preset", "medium", "-movflags", "+faststart", str(clip_out)], stdin=subprocess.PIPE)
        for i in range(n):
            ff.stdin.write(await _shot(pg, info, i / FPS))
        ff.stdin.close(); ff.wait()
        thumb_out.write_bytes(await _shot(pg, info, round(D * thumb_at, 3)))   # preset.json demo.thumb_at: when 82 % is already the outro
        res["page_errors"] = info["errs"][:3]
        await pg.close()
        # checks at half size
        pg, info = await _page(br, base + "index.html", CHECK_SCALE)
        times = [round(D * k, 3) for k in (0.1, 0.3, 0.5, 0.7, 0.95)]
        baked = [_arr(await _shot(pg, info, t)) for t in times]
        res["blank"] = all(float(x.std()) < 0.5 for x in baked)   # every sample one flat colour: nothing drawn (06/10/2026: a broken ctx.hf passed all checks)
        a = _arr(await _shot(pg, info, times[1])); await _shot(pg, info, D); await _shot(pg, info, 0); b = _arr(await _shot(pg, info, times[1]))
        res["seek_exact"] = _diff(a, b, 0)               # share of pixels not byte-identical (software GL: filter/gradient edges can wobble by 1 level)
        res["seek"] = _diff(a, b, 8)                     # what counts: pixels that moved by more than 8/255
        end_frame = _arr(await _shot(pg, info, max(0, D - 0.04)))
        await pg.close()
        pg, dinfo = await _page(br, base + "draft.html", CHECK_SCALE)
        res["bake"] = 0.0
        for x, t in zip(baked, times): res["bake"] = max(res["bake"], _diff(x, _arr(await _shot(pg, dinfo, t))))
        await pg.close()
        if check_end:
            pg, pinfo = await _page(br, base + "plain/index.html", CHECK_SCALE)
            res["end"] = _diff(end_frame, _arr(await _shot(pg, pinfo, 0)), 40)
            await pg.close()
        await br.close()
    res["duration"] = D
    return res


def static_problems(meta):
    """what a preset's files say without a browser: the BAD rules its preset.js breaks (comments left out), and its files copied as
    shipped whose SHA-256 changed (None when it has none; engine/tests/hf_blocks.py, blocks added from 11/10/2026)"""
    js = re.sub(r"/\*.*?\*/|//[^\n]*", "", Path(meta["_js"]).read_text(encoding="utf-8"), flags=re.S)
    static = [lab for rx, lab in BAD if re.search(rx, js)]
    sums = (meta.get("source") or {}).get("sha256") or {}
    if not sums: return static, None
    from common import as_shipped
    return static, [f for f, h in sums.items() if not as_shipped(Path(meta["_js"]).parent / "assets" / f, h)]


def run_one(name, meta, say=say, out=None):
    """one demo built, rendered (clip + thumbnail) and checked; out = a scratch folder for the clip, thumbnail and work files (gallery check)"""
    from build import build
    from render.serve import serve_in_thread
    t0 = time.time()
    s = slug(name); d = (Path(out) / "work" if out else WORKG) / s
    spec = demo_spec(name, meta)
    prepare(d, spec)
    if meta.get("_incoming"):                            # a "Mới nhập" preset is not in the library yet: the demo film carries its own copy
        shutil.copytree(Path(meta["_js"]).parent, d / "presets" / name, ignore=shutil.ignore_patterns("desktop.ini"))
    chk = {"name": name, "at": time.strftime("%Y-%m-%d %H:%M")}
    chk["static"], src = static_problems(meta)
    if src is not None: chk["source"] = src
    rep = {}
    quiet = lambda *a: None
    try:
        build(d, say=quiet, draft_out=d / "draft.html", report=rep)
    except SystemExit as e:
        chk.update(build=f"FAIL: {e}", status="fail"); return chk
    except Exception as e:
        chk.update(build=f"FAIL: {type(e).__name__}: {e}", status="fail"); return chk
    chk["build"] = "ok"; chk["tweens"] = rep.get("tweens"); chk["codes"] = rep.get("codes")
    chk["ease_fit"] = max([n["maxErr"] for n in rep.get("notes", []) if "maxErr" in n] or [0])
    check_end = meta.get("check_end", meta.get("kind") == "effect" and meta["group"] == "text")
    if check_end:
        pd = d / "plain"; prepare(pd, plain(spec))
        try: build(pd, say=quiet)
        except BaseException as e: chk["end_error"] = str(e)[:200]; check_end = False
    G = Path(out) if out else GALI if meta.get("_incoming") else GAL
    (G / "clips").mkdir(parents=True, exist_ok=True); (G / "thumbs").mkdir(parents=True, exist_ok=True)
    base, srv = serve_in_thread(d)
    try:
        r = asyncio.run(_render_and_check(base, meta.get("kind"), G / "clips" / f"{s}.mp4", G / "thumbs" / f"{s}.png", check_end,
                                          (meta.get("demo") or {}).get("thumb_at", 0.82)))
    except Exception as e:
        chk.update(render=f"FAIL: {type(e).__name__}: {str(e)[:300]}", status="fail"); return chk
    finally:
        srv.shutdown()
    chk.update({k: (round(v, 5) if isinstance(v, float) else v) for k, v in r.items()})
    problems = []
    if r.get("page_errors"): problems.append("page errors")
    if r.get("blank"): problems.append("blank: nothing drawn at any sample")
    stol = float((meta.get("demo") or {}).get("seek_tolerance", 0.0002))   # demo.seek_tolerance: paint-level noise of an as-shipped component (same state, notes say why)
    if r["seek"] > stol: problems.append(f"seek not stable {r['seek']:.3%}")
    if r["bake"] > 0.002: problems.append(f"bake differs {r['bake']:.2%}")
    if check_end and r.get("end", 0) > 0.003: problems.append(f"end differs from layout {r['end']:.2%}")
    if chk["static"]: problems.append("uses " + ", ".join(chk["static"]))
    if chk.get("source"): problems.append("not as shipped (SHA-256): " + ", ".join(chk["source"]))
    if chk["ease_fit"] > 0.03: problems.append(f"ease fit off by {chk['ease_fit']:.3f}")
    chk["problems"] = problems
    chk["status"] = "ok" if not problems else ("fail" if r["seek"] > stol or r.get("page_errors") or chk.get("source") else "warn")
    chk["seconds"] = round(time.time() - t0, 1)
    return chk


# Page categories (11/10/2026, the user: "thư viện ... hơi messy", "làm lại category thôi, và may be là phân theo skill"): preset names and
# their folders stay; the page sorts them by what they are FOR. cat = one category, from the folder (group) and the name; uses = the
# skillsets of the kit (workflow/start.md) a preset is made for, from its tags, folder and source. Order = the page's chip order.
CATS = ["text-in", "captions", "emphasis", "title", "lower", "numbers", "logo", "transition", "pop", "ambient", "impact", "hand",
        "background", "effect", "ui", "cards", "code", "map", "camera", "talking", "intake", "character", "tool"]


def category(name, group):
    n = name.split("/", 1)[-1]
    if name in ("motion/talking-layout", "card/talking-card"): return "talking"
    if group == "text":
        if n.startswith("caption") or n == "embedded-captions": return "captions"
        if re.search(r"highlight|marker|strike|swap|morph|variable|shimmer|glitch|scan-band|texture|emphasis|number-bar|timecode|math|colorama", n): return "emphasis"
        return "text-in"
    if group == "house":
        if re.search(r"count", n): return "numbers"
        if re.search(r"bob|breathe|hop|float|twinkle|zoom|gallery|glow", n): return "ambient"
        return "pop"
    if group == "motion":
        if re.search(r"shake", n): return "impact"
        if re.search(r"float|ken-burns|slot-swipe|arrow|object-sweep|path", n): return "ambient"
        if re.search(r"tween|image-sequence|^anime$", n): return "tool"
        if re.search(r"layout", n): return "ui"
        return "pop"
    if group == "hand": return "impact" if re.search(r"shake|hit-stop|comic", n) else "hand"
    if group == "intake": return "numbers" if "count" in n else "intake"
    return {"lower": "lower", "title": "title", "data": "numbers", "logo": "logo", "transition": "transition", "background": "background",
            "effect": "effect", "line": "hand", "shape": "pop", "ui": "ui", "glass": "ui", "device": "ui", "flow": "ui", "cursor": "ui",
            "card": "cards", "carousel": "cards", "social": "cards", "compare": "cards", "code": "code", "map": "map", "camera": "camera",
            "character": "character"}.get(group, "effect")


def uses(name, group, cat, tags, source):
    """the skillsets a preset is made for (several or none: every preset serves the free-design films)"""
    t, src = " ".join(tags or []).lower(), json.dumps(source or {}).lower()
    u = []
    if cat in ("captions", "lower", "talking") or re.search(r"talking-head|interview|podcast", t): u.append("talking")
    if "music-to-video" in src or re.search(r"\b(lyric|song|music|beat)\b", t): u.append("song")
    if cat == "intake" or re.search(r"\bpsd\b|faithful", t): u.append("keep")
    if cat == "character" or group == "hand": u.append("character")
    if cat == "code" or re.search(r"terminal|github|developer", t): u.append("code")
    if re.search(r"presentation|slides|slideshow|pptx", t) or name == "intake/deck-slide": u.append("deck")
    if cat == "ui" or re.search(r"product", t): u.append("product")
    return u


def write_data(checks):
    """data.js (the library, in git) and incoming.js ("Mới nhập", out of git) for the page"""
    pres, inc = [], []
    for name, meta in records():
        s = slug(name)
        item = {k: meta.get(k) for k in ("name", "lib", "group", "kind", "title", "title_vi", "desc_vi", "source", "license", "ae", "brand_safe", "params_vi", "tags", "notes", "brand_ui", "needs")}
        G, pre = (GALI, "incoming/") if meta.get("_incoming") else (GAL, "")
        item["clip"] = f"{pre}clips/{s}.mp4" if (G / "clips" / f"{s}.mp4").exists() else None
        item["thumb"] = f"{pre}thumbs/{s}.png" if (G / "thumbs" / f"{s}.png").exists() else None
        item["check"] = checks.get(name)
        item["cat"] = category(name, meta.get("group") or name.split("/")[0])
        item["uses"] = uses(name, meta.get("group") or name.split("/")[0], item["cat"], meta.get("tags"), meta.get("source"))
        if meta.get("_incoming"): item["incoming"] = (meta.get("incoming") or {}).get("at") or True; inc.append(item); continue
        pres.append(item)
    data = {"generated": time.strftime("%Y-%m-%d %H:%M"), "presets": pres}
    (GAL / "data.js").write_text("window.GALLERY = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    GALI.mkdir(parents=True, exist_ok=True)
    (GALI / "incoming.js").write_text("window.GALLERY_INCOMING = " + json.dumps({"presets": inc}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    return len(pres) + len(inc)


def load_checks():
    """one file per preset in library/gallery/checks/ (several gallery builds can run at once)"""
    out = {}
    for f in [x for d in (GAL / "checks", GALI / "checks") if d.exists() for x in sorted(d.glob("*.json"))]:
        c = json.loads(f.read_text(encoding="utf-8")); out[c["name"]] = c
    return out


def build_all(filt=None, say=say):
    (GAL / "checks").mkdir(parents=True, exist_ok=True)
    recs = [(n, m) for n, m in records() if (not filt or any(f in n for f in filt.split(","))) and not (m.get("demo") or {}).get("skip")]
    say(f"gallery: {len(recs)} preset(s)")
    for i, (name, meta) in enumerate(recs, 1):
        for k in range(3):                              # the Library on a synced drive (Google Drive) can drop a path for a moment: retry the item
            try:
                c = run_one(name, meta)
                G = GALI if meta.get("_incoming") else GAL; (G / "checks").mkdir(parents=True, exist_ok=True)
                (G / "checks" / f"{slug(name)}.json").write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding="utf-8")
                break
            except OSError as e:
                if k == 2: c = {"name": name, "status": "fail", "render": f"FAIL: {type(e).__name__}: {e}"}; break
                say(f"  {name}: {type(e).__name__} ({e}), retrying in 20 s"); time.sleep(20)
        say(f"  [{i}/{len(recs)}] {name}: {c['status']}" + (f"  ({'; '.join(c.get('problems') or [])})" if c.get("problems") else "")
            + (f"  {c.get('build')}" if c.get("build", "ok") != "ok" else "") + (f"  {c.get('render')}" if c.get("render") else "") + f"  {c.get('seconds', '')}s")
    n = write_data(load_checks())
    say(f"gallery data: {n} presets -> {GAL / 'data.js'}")


def check_all(filt=None, say=say, sample=0):
    """kit.py gallery check [filter] [--random N]: every demo built, rendered and checked as `gallery build` does, but into a scratch
    folder: the library's clips, thumbnails and checks are not touched. Lists every preset whose result differs from its stored check.
    Final audit 09/10/2026: an engine change that breaks a preset in the film and the draft alike (text/mask-rise since 06/10) passed an
    old-vs-new engine pixel compare, but not this. sample: N presets picked at random (12/10/2026: the whole library takes about 1.5 h;
    it runs only when what films look like may change, a sample when unsure). Returns the changed presets."""
    out = LOCAL / "work" / "gallery-check"
    if out.exists(): shutil.rmtree(out, ignore_errors=True)
    old, changed = load_checks(), []
    recs = [(n, m) for n, m in records() if (not filt or any(f in n for f in filt.split(","))) and not (m.get("demo") or {}).get("skip")]
    if sample and sample < len(recs):
        import random
        recs = sorted(random.sample(recs, sample), key=lambda r: r[0])
    say(f"gallery check: {len(recs)} preset(s) into {out} (the library is not touched)")
    for i, (name, meta) in enumerate(recs, 1):
        c = run_one(name, meta, out=out); o = old.get(name) or {}
        same = (o.get("status"), o.get("problems") or []) == (c.get("status"), c.get("problems") or [])
        if not same: changed.append((name, o.get("status"), c.get("status"), c.get("problems") or [c.get("build") or c.get("render")]))
        say(f"  [{i}/{len(recs)}] {name}: {c['status']}" + (f"  ({'; '.join(c.get('problems') or [])})" if c.get("problems") else "")
            + ("" if same else f"  <- stored: {o.get('status', '-')}" + (f" ({'; '.join(o.get('problems') or [])})" if o.get("problems") else "")))
    say(f"gallery check: {len(changed)} of {len(recs)} differ from the stored checks" + (": look at each (kit.py gallery build <name> once it is right)" if changed else ""))
    for n, a, b, pr in changed: say(f"  {n}: {a} -> {b} {'; '.join(str(x) for x in pr if x)}")
    return changed


def check_static(filt=None, say=say):
    """kit.py gallery check --static: the part of the check that needs no browser, for GitHub's checks on every pull request (audit
    12/10/2026): every preset.json reads, no preset.js breaks the BAD rules (a frame must be a function of time: no Math.random, Date,
    requestAnimationFrame, network), files copied as shipped keep their SHA-256. A problem its stored check already names passes.
    Returns [(name, [problems])]."""
    bad = []
    for root in (LIBP, LIBL):
        for mj in sorted(root.rglob("preset.json")):
            try: json.loads(mj.read_text(encoding="utf-8"))
            except ValueError as e: bad.append((mj.parent.relative_to(root).as_posix(), [f"preset.json does not read: {e}"]))
    if bad:
        for n, pr in bad: say(f"  {n}: {'; '.join(pr)}")
        return bad
    old, recs = load_checks(), [(n, m) for n, m in records() if not m.get("_incoming") and (not filt or any(f in n for f in filt.split(",")))]
    for name, meta in recs:
        static, src = static_problems(meta)
        probs = (["uses " + ", ".join(static)] if static else []) + (["not as shipped (SHA-256): " + ", ".join(src)] if src else [])
        new = [x for x in probs if x not in ((old.get(name) or {}).get("problems") or [])]
        if new: bad.append((name, new))
    say(f"gallery check --static: {len(recs)} preset(s), {len(bad)} with a new problem")
    for n, pr in bad: say(f"  {n}: {'; '.join(pr)}")
    return bad


def open_page(port=None, say=say):
    """serve library/gallery (plus api/decisions: the review notes, read-only), open it in an app window, stop when the window closes"""
    url, srv = serve_page(port)
    from kit import _app_window, _browser
    br = _browser()
    try:
        if br:
            _app_window(url, LOCAL / "studio-browser" / "gallery", "1600,1000")
        else:
            import webbrowser; webbrowser.open(url); input("Gallery is open in your browser. Press Enter here to stop it.")
    finally:
        srv.shutdown()


def serve_page(port=None):
    """the gallery server alone: (url, server)"""
    import functools, threading
    from render.serve import Quiet, Server, free_port
    dec = GAL / "decisions.json"

    class H(Quiet):
        def _json(self, code, obj):
            body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
            self.send_response(code); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(body))); self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path.startswith("/api/decisions"):
                body = dec.read_bytes() if dec.exists() else b"{}"
                self.send_response(200); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(body))); self.end_headers()
                self.wfile.write(body); return
            if self.path.startswith("/api/owner"):          # the owner's machine: its buttons, and the presets the kit uses (no Bỏ on those)
                return self._json(200, {"owner": True, "in_use": in_use()} if owner() else {"owner": False})
            return super().do_GET()

        def do_POST(self):                                  # Giữ / Bỏ of "Mới nhập", Bỏ of a library card: {"name": "<group>/<name>"} (the owner only)
            act = {"/api/incoming/keep": keep, "/api/incoming/drop": drop, "/api/library/drop": drop}.get(self.path.split("?")[0])
            if not act: return self._json(404, {"ok": False, "msg": "unknown"})
            try:
                name = json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)) or b"{}").get("name", "")
                act(name, say=lambda *a: None)
                return self._json(200, {"ok": True})
            except SystemExit as e: return self._json(400, {"ok": False, "msg": str(e)})
            except Exception as e: return self._json(500, {"ok": False, "msg": f"{type(e).__name__}: {e}"})

    port = port or free_port()
    srv = Server(("127.0.0.1", port), functools.partial(H, directory=str(GAL)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{port}/index.html", srv
