"""Shared paths and helpers for every Python tool of the kit.

KIT    = the kit folder ("Moworks Motion" on the user's Drive; repo moworks-motion; any name works: see kit-root.txt)
LOCAL  = %USERPROFILE%\\.aimotionkit (work files, caches, HyperFrames installs, kit-root.txt) - never on Drive, because Drive locks
         files while it syncs; only finished deliverables are copied into the film's folder.

A film (made by `kit.py new` in the job's own folder; 11/10/2026 layout, the user: "folder renders này chỉ để các file mp4 và mov xuất
ra thôi", "move cả rounds và still luôn"):
  <job>\\01_Client_Film\\  1. Preview.bat, 01_Brief\\ (the brief, lyrics, guideline AND the user's original files: reference video,
                                                     logos, PSD, music; never edited),
                         02_Assets\\ (what Claude makes for review: Rounds\\ = every round the user reviewed, numbered per kind,
                                     Storyboard_R01\\, Assets_R01\\, Film_v01\\ ...; Stills\\ = stills, sheets, compare sheets;
                                     Compare\\ = side-by-side videos; Music-Options\\),
                         03_HTML\\ (the film: film.json, index.html, assets\\, audio\\, presets\\, notes\\, qa\\),
                         04_Renders\\ (MP4\\ MOV\\ only: the exports, + EXPORTS.md),
                         05_AE\\ (Port to AE: the .aep, footage\\, Audio\\ = mix.wav + the stems; user 08/10/2026: outside 04_Renders)
Films made before 11/10/2026 keep 04_Renders\\Rounds\\R<n>_..., 04_Renders\\Stills\\ and their files in 02_Assets\\ until `kit.py tidy`
moves them; the kit reads both.
Every tool works on the 03_HTML folder (film_dir); the film's name is the folder above it. Older films (brief\\, renders\\ inside one
folder) keep working: film_dir returns that folder and brief_dir / renders follow it."""
import os, sys, time
from pathlib import Path

for _s in (sys.stdout, sys.stderr):                    # Windows consoles default to cp1252: Vietnamese text crashed print in v1
    try: _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

ENGINE = Path(__file__).resolve().parent
KIT = ENGINE.parent
LOCAL = Path(os.environ.get("USERPROFILE", str(Path.home()))) / ".aimotionkit"
WORK = LOCAL / "work"
# Chromium (Playwright) lives in LOCAL\ms-playwright when it is there. The Claude desktop app (an MSIX package) keeps a NEW top-level folder
# that a command run from a chat creates in %LOCALAPPDATA% / %APPDATA% in its own private copy (...\Packages\Claude_*\LocalCache\Local;
# measured 09/10/2026: a file in an existing folder, or a new folder inside one, goes to the real place). The 2D rebuild test installed the
# kit from a chat on a fresh machine: Chromium went into that copy, so the player, started by a double-click outside Claude, failed every
# export with "Executable doesn't exist". install.py puts Chromium here on a new install; a machine with Chromium in the default place keeps it.
BROWSERS = LOCAL / "ms-playwright"
if BROWSERS.is_dir() and any(BROWSERS.glob("chromium*")): os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(BROWSERS))


def claude_private(*parts):
    """the Claude desktop app's private copy of %LOCALAPPDATA%\\<parts> when one exists (see BROWSERS), else None"""
    la = os.environ.get("LOCALAPPDATA")
    if not la: return None
    return next((p for p in (Path(la) / "Packages").glob("Claude_*/LocalCache/Local") if p.joinpath(*parts).exists()), None)


def in_claude():
    """True when this command runs under Claude Code (a chat): new AppData folders and HKCU writes may land in the app's private copy"""
    return bool(os.environ.get("CLAUDECODE") or os.environ.get("CLAUDE_CODE_ENTRYPOINT"))
FPS = 60            # the kit's only frame rate: PNG, MP4, AE comps, the player's frame step (user 07/10/2026: "cứ stick với 60fps cho hình mượt.
                    # ko làm 30fps nha"); `kit.py build` writes it on the film root (data-fps) so HyperFrames renders at 60 too
RENDER_KINDS = ("mp4", "mov", "ae", "stills")   # 04_Renders/<KIND>/, 05_AE/, 02_Assets/Stills/ (older films: renders/<kind>/), one line per export in EXPORTS.md
HTML, BRIEF, ASSETS, RENDERS, AE = "03_HTML", "01_Brief", "02_Assets", "04_Renders", "05_AE"
RENDER_DIRS = {"mp4": "MP4", "mov": "MOV", "hf": "HF"}
REVIEW_DIRS = {"stills": "Stills", "compare": "Compare"}  # made for review, not deliverables: 02_Assets/<dir>/ (11/10/2026)


def film_dir(p):
    """the folder that holds the film: <film>/03_HTML when there is one, else the folder itself (older films, a 03_HTML given directly)"""
    p = Path(p)
    return p / HTML if (p / HTML).is_dir() else p


def film_root(p):
    """the film's own folder (the one with 1. Preview.bat): the parent of 03_HTML, else the folder itself"""
    p = Path(p)
    return p.parent if p.name == HTML else p


def film_name(p):
    """the film's name for exports, work folders and the player: its own folder's name (never "03_HTML")"""
    return film_root(Path(p).resolve()).name


def brief_dir(p):
    """01_Brief next to 03_HTML; brief/ inside an older film"""
    p = Path(p)
    return p.parent / BRIEF if p.name == HTML else p / "brief"


def renders_root(p):
    """04_Renders next to 03_HTML; renders/ inside an older film"""
    p = Path(p)
    return p.parent / RENDERS if p.name == HTML else p / "renders"


def in_film(p, rel):
    """a path given to a command: absolute as it is; else inside 03_HTML (audio/music/x.wav), else inside the film's own folder
    (01_Brief/song.wav, 01_Brief/lyrics.txt), else from the current folder; a pattern that matches nothing yet stays inside 03_HTML"""
    r = Path(rel)
    if r.is_absolute(): return r
    here = lambda x: x.exists() or ("#" in x.name and x.parent.is_dir())      # f####.webp: a numbered sequence's folder
    for base in (Path(p), film_root(p)):
        if here(base / r): return base / r
    return r if here(r) else Path(p) / r


def renders(p, kind):
    """04_Renders/<MP4|MOV>/, 05_AE/ for the AE port, 02_Assets/<Stills|Compare>/ for what is made for review (older films: renders/<kind>/;
    a film whose stills are still in 04_Renders/Stills keeps using them until kit.py tidy), created on demand"""
    p = Path(p)
    if p.name != HTML: d = renders_root(p) / kind
    elif kind == "ae": d = p.parent / AE
    elif kind in REVIEW_DIRS:
        old = renders_root(p) / REVIEW_DIRS[kind]
        d = old if old.is_dir() and not (p.parent / ASSETS / REVIEW_DIRS[kind]).is_dir() else p.parent / ASSETS / REVIEW_DIRS[kind]
    else: d = renders_root(p) / RENDER_DIRS.get(kind, kind)
    d.mkdir(parents=True, exist_ok=True); return d


VERSIONED = ("film.json", "index.html", "presets")      # the film itself: copied whole into every film round
ROUND_MEDIA = ("assets", "audio")                       # copied into a film round only when new or changed since the round before
BIG = 200 * 1024 * 1024                                 # a bigger file is not copied: the round reads the live film's (ROUND.md says which)
ROUND_KIND = {"storyboard": "Storyboard", "assets": "Assets"}
ROUND_LABEL = {"storyboard": "Storyboard", "assets": "Thiết kế nhân vật / bối cảnh / đồ vật", "film": "Phim"}


def rounds_dir(p):
    """02_Assets/Rounds: every round the user reviewed, one folder each (user 10/10/2026: "asset mỗi round nên để chung folder ... đi tìm lại
    trong explorer thì nó tiện"; 11/10/2026: out of 04_Renders, which holds only the MP4 / MOV exports). Numbered per kind, so a design
    round never moves the film's numbers (user 11/10/2026: storyboard / asset rounds 1-3 made the first film "round 4"): Storyboard_R01,
    Assets_R01, Film_v01 ...; their order in time is the "- order: N" line of each ROUND.md. A film made before 11/10/2026 keeps
    04_Renders/Rounds/R<n>_<Storyboard|Assets|Film-v<k>> until kit.py tidy moves it (rounds() reads both)."""
    p = film_dir(p)
    new, old = film_root(p) / ASSETS / "Rounds", renders_root(p) / "Rounds"
    return old if old.is_dir() and not new.is_dir() else new


def rounds(p, d=None):
    """the film's rounds, oldest first: [{n: its place in time, k: its number in its kind (a film round: its version), name,
    kind: storyboard | assets | film, v (film rounds), dir, date, note, base}]; d: read that folder instead (kit.py tidy)"""
    import re
    d, out = Path(d) if d else rounds_dir(p), []
    if not d.is_dir(): return out
    for x in d.iterdir():
        if not x.is_dir(): continue
        old = re.match(r"^R(\d+)_(Storyboard|Assets|Film-v(\d+))$", x.name)
        new = re.match(r"^(?:(Storyboard|Assets)_R(\d+)|Film_v(\d+))$", x.name)
        if not (old or new): continue
        meta = {"date": "", "note": "", "base": "", "order": ""}
        f = x / "ROUND.md"
        if f.exists():
            for line in f.read_text(encoding="utf-8").splitlines():
                for k in meta:
                    if line.startswith(f"- {k}: "): meta[k] = line.split(": ", 1)[1].strip()
        order = meta.pop("order")
        if old: kind, v, k, n = ("film" if old.group(3) else old.group(2).lower()), (int(old.group(3)) if old.group(3) else None), None, int(old.group(1))
        else: kind, v, k, n = ("film" if new.group(3) else new.group(1).lower()), (int(new.group(3)) if new.group(3) else None), \
                              (int(new.group(2)) if new.group(2) else None), (int(order) if order.isdigit() else 10 ** 6 + int(x.stat().st_mtime))
        out.append({"n": n, "k": k if k is not None else v, "name": x.name, "kind": kind, "v": v, "dir": x, **meta})
    out.sort(key=lambda r: r["n"])
    seen = {}
    for r in out:                                       # an older round's number in its kind: counted in time order
        seen[r["kind"]] = seen.get(r["kind"], 0) + 1
        if r["k"] is None: r["k"] = seen[r["kind"]]
    return out


def versions(p):
    """the film's versions, oldest first: [(k, the folder with that version's film.json + index.html)]: the film rounds
    (02_Assets/Rounds/Film_v<kk>/film; before 11/10/2026 04_Renders/Rounds/R<n>_Film-v<k>/film) and, in a film made before 10/10/2026,
    03_HTML/versions/v<k>"""
    out, old = {}, Path(film_dir(p)) / "versions"
    if old.is_dir():
        for x in old.glob("v*"):
            if x.is_dir() and x.name[1:].isdigit(): out[int(x.name[1:])] = x
    for r in rounds(p):
        if r["kind"] == "film": out[r["v"]] = r["dir"] / "film"
    return sorted(out.items())


def media_state(p):
    """{rel path: [size, mtime_ns]} of every file under the film's assets/ and audio/ (what a film round compares)"""
    p, out = Path(p), {}
    for top in ROUND_MEDIA:
        for f in (p / top).rglob("*") if (p / top).is_dir() else []:
            if f.is_file() and f.name != "desktop.ini":
                s = f.stat(); out[f.relative_to(p).as_posix()] = [s.st_size, s.st_mtime_ns]
    return out


def round_manifest(d):
    """files.json of a film round's film/ folder: {rel: [round holding the file | "live", size, mtime_ns]}; None for an older version"""
    import json
    f = Path(d).parent / "files.json"
    return json.loads(f.read_text(encoding="utf-8")) if Path(d).name == "film" and f.exists() else None


def round_file(p, name, rel):
    """a file of a round as the user saw it, or None: a design round's picture; a film round's file from its own film/ copy, the earlier
    round that holds it (files.json), else the live film's; an older film's 03_HTML/versions/v<k>: its own file, else the live film's"""
    import re
    p = Path(film_dir(p)); rel = rel.lstrip("/").replace("\\", "/")
    if ".." in rel.split("/"): return None
    if re.fullmatch(r"v\d+", name):                     # an older film's version
        f = p / "versions" / name / rel
        return f if f.is_file() else (p / rel if (p / rel).is_file() else None)
    R = rounds_dir(p) / name
    if not (R / "film").is_dir():                       # a design round: its pictures and videos
        f = R / rel
        return f if f.is_file() else None
    f = R / "film" / rel
    if f.is_file(): return f
    held = (round_manifest(R / "film") or {}).get(rel)
    if held and held[0] != "live":
        f = rounds_dir(p) / held[0] / "film" / rel
        if f.is_file(): return f
    return p / rel if (p / rel).is_file() else None


def _round_md(order, title, note="", base="", extra=()):
    """ROUND.md: the round's title, date, note, base, and its place in time ("- order: N": the folders are numbered per kind)"""
    return (f"# {title}\n\n- date: {time.strftime('%d/%m/%Y %H:%M')}\n" + (f"- note: {note}\n" if note else "")
            + (f"- base: {base}\n" if base else "") + f"- order: {order}\n" + "".join(f"- {x}\n" for x in extra))


def announce(r):
    """the line Claude says in the chat when a round goes to the user (user 10/10/2026: "khi bắt đầu mỗi round hoặc đổi round chỉnh sửa
    claude cũng phải thông báo trong chat"), the same words the player shows: "Storyboard · round 2", "Phim v1" (11/10/2026: numbered per
    kind)"""
    what = f"Phim v{r['v']}" if r["kind"] == "film" else f"{ROUND_LABEL[r['kind']]} · round {r['k']}"
    return what + (f" (sửa tiếp từ {r['base']})" if r.get("base") else "") + (f": {r['note']}" if r.get("note") else "")


def _next_order(rs):
    return (max(r["n"] for r in rs if r["n"] < 10 ** 6) + 1) if any(r["n"] < 10 ** 6 for r in rs) else len(rs) + 1


def new_round(p, kind, files, note=""):
    """a design round (storyboard options, asset sheets) -> 02_Assets/Rounds/<Storyboard|Assets>_R<k>/ holding [(source, name in the round)]
    and ROUND.md; returns the round (as rounds() lists it)"""
    import shutil
    p = film_dir(Path(p)); rs = rounds(p); n = _next_order(rs)
    # the next free number of its kind, never a count: a round the user removed by hand in Explorer leaves a gap, not a clash (rounds
    # are never removed by the kit, user 11/10/2026: "cứ giữ lại hết")
    k = max((r["k"] or 0 for r in rs if r["kind"] == kind), default=0) + 1
    while (rounds_dir(p) / f"{ROUND_KIND[kind]}_R{k:02d}").exists(): k += 1
    R = rounds_dir(p) / f"{ROUND_KIND[kind]}_R{k:02d}"; R.mkdir(parents=True)
    for src, name in files:
        (R / name).parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, R / name)
    (R / "ROUND.md").write_text(_round_md(n, f"{ROUND_LABEL[kind]} · round {k}", note, extra=[f"file: {name}" for _, name in files]), encoding="utf-8")
    return next(r for r in rounds(p) if r["name"] == R.name)


def _version_sig(d):
    """what a version is: film.json, presets/ and index.html without its build time (a rebuild of the same film.json is the same film)"""
    import hashlib, re
    h = hashlib.sha1()
    for name in VERSIONED:
        f = Path(d) / name
        for x in (sorted(f.rglob("*")) if f.is_dir() else [f]):
            if not x.is_file() or x.name == "desktop.ini": continue
            b = x.read_bytes()
            if name == "index.html": b = re.sub(rb"\(MotionSpec\) on \d{4}-\d\d-\d\d \d\d:\d\d", b"(MotionSpec)", b, count=1)
            h.update(x.relative_to(d).as_posix().encode("utf-8") + b"|" + b)
    return h.hexdigest()


def live_changed(p):
    """True when the working film differs from its newest version (Claude is editing, the round is not out yet)"""
    p = film_dir(Path(p)); vs = versions(p)
    if not vs: return True
    man = round_manifest(vs[-1][1])
    return _version_sig(vs[-1][1]) != _version_sig(p) or (man is not None and {r: v[1:] for r, v in man.items()} != media_state(p))


def snapshot(p, note="", base=""):
    """the film as the user sees it now -> a film round 02_Assets/Rounds/Film_v<kk>/ (user 08/10/2026: one per round the user saw, so an
    earlier one can be watched and brought back; 10/10/2026: the whole round in one folder). film/ holds film.json, index.html and presets/
    whole, and of assets/ and audio/ only what is new or changed since the version before; files.json says which round holds every file,
    so the player opens any version as it was. Nothing new when the newest version is already this film. Returns k."""
    import json, shutil
    p = film_dir(Path(p)); vs = versions(p)
    if vs and not live_changed(p): return vs[-1][0]
    k = vs[-1][0] + 1 if vs else 1
    n = _next_order(rounds(p))
    R = rounds_dir(p) / f"Film_v{k:02d}"; fd = R / "film"; fd.mkdir(parents=True)
    for name in VERSIONED:
        f = p / name
        if f.is_dir(): shutil.copytree(f, fd / name, ignore=shutil.ignore_patterns("desktop.ini"))
        elif f.is_file(): shutil.copy2(f, fd / name)
    before = (round_manifest(vs[-1][1]) or {}) if vs else {}
    man, big = {}, []
    for rel, (size, mt) in media_state(p).items():
        old = before.get(rel)
        if old and old[1] == size and old[2] == mt: man[rel] = old                     # the same file: the earlier round keeps it
        elif size > BIG: man[rel] = ["live", size, mt]; big.append(rel)
        else:
            (fd / rel).parent.mkdir(parents=True, exist_ok=True); shutil.copy2(p / rel, fd / rel); man[rel] = [R.name, size, mt]
    (R / "files.json").write_text(json.dumps(man, ensure_ascii=False, indent=0), encoding="utf-8")
    (R / "ROUND.md").write_text(_round_md(n, f"Phim v{k}", note, base, [f"not copied (over {BIG >> 20} MB, the live film's): {b}" for b in big]),
                                encoding="utf-8")
    return k


def restore(p, k):
    """version k becomes the working film again (a "[vK] Sửa tiếp từ bản này" note): the working film is kept as a round first when it
    changed, then film.json, index.html, presets/ and the assets / audio files version k used are put back. Returns the files put back."""
    import shutil
    p = film_dir(Path(p)); d = dict(versions(p)).get(int(k))
    if d is None: raise SystemExit(f"no version v{k} (kit.py rounds {p})")
    snapshot(p, note=f"bản đang sửa trước khi quay lại v{k}")
    back = []
    for name in VERSIONED:
        src, dst = d / name, p / name
        if src.is_dir():
            if dst.is_dir(): shutil.rmtree(dst)
            shutil.copytree(src, dst, ignore=shutil.ignore_patterns("desktop.ini")); back.append(name + "/")
        elif src.is_file(): shutil.copy2(src, dst); back.append(name)
    for rel, held in (round_manifest(d) or {}).items():
        if held[0] == "live": continue
        src, dst = rounds_dir(p) / held[0] / "film" / rel, p / rel
        if src.is_file() and (not dst.is_file() or dst.stat().st_size != held[1] or dst.stat().st_mtime_ns != held[2]):
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst); back.append(rel)
    return back


def export_name(p, *bits):
    """an export's name: <film>_vN_<bits>_<date-time>; vN = the newest version, saved now when the film changed since (user 08/10/2026)"""
    return "_".join([film_name(p), f"v{snapshot(p)}"] + [b for b in bits if b] + [stamp()])


def say(*a):
    print(*a, flush=True)


def work_dir(*parts):
    """a folder under %USERPROFILE%\\.aimotionkit\\work, created on demand"""
    p = WORK.joinpath(*parts); p.mkdir(parents=True, exist_ok=True); return p


def stamp():
    """date and time for export names (never overwrite an export): 2026-10-07_1403"""
    return time.strftime("%Y-%m-%d_%H%M")


def film_hash(p):
    """a short fingerprint of what the film looks like now: index.html + every file under assets/ and audio/ (name, size, time). An export whose
    render.json has the same hash shows the current film (kit.py mp4 reuses it instead of rendering again)"""
    import hashlib
    p = Path(p); h = hashlib.sha1((p / "index.html").read_bytes() if (p / "index.html").exists() else b"")
    for sub in ("assets", "audio"):
        for f in sorted((p / sub).rglob("*")) if (p / sub).exists() else []:
            if f.is_file() and f.name != "desktop.ini":
                st = f.stat(); h.update(f"{f.relative_to(p).as_posix()}|{st.st_size}|{int(st.st_mtime)}".encode("utf-8"))
    return h.hexdigest()[:12]


def engine_hash():
    """the renderer's own code (driver.js): frames rendered before a driver fix do not show the film as it renders now"""
    import hashlib
    return hashlib.sha1((ENGINE / "runtime" / "driver.js").read_bytes()).hexdigest()[:10]


def proxy_state(p):
    """the player's smooth-playback video of this film (kit.py proxy) -> {file, json, fresh}: fresh = made from the film as it is now (same
    picture, same renderer); a rebuilt film needs a new one"""
    import json
    d = work_dir("proxy", film_name(p)); f, j = d / "preview.mp4", d / "preview.json"
    try: rj = json.loads(j.read_text(encoding="utf-8")) if j.exists() and f.exists() else None
    except ValueError: rj = None
    return {"file": f, "json": rj, "fresh": bool(rj and (rj.get("film"), rj.get("engine")) == (film_hash(p), engine_hash()))}


def default_workers():
    """render processes (Chromium) at once: half the logical cores (2 - 8), and no more than the free memory holds at ~1 GB each (a heavy
    film's page took 0.6 - 0.9 GB in the 2D rebuild test; a laptop with 8 GB and 8 workers swapped instead of rendering faster)"""
    n = max(2, min(8, (os.cpu_count() or 8) // 2))
    if os.name == "nt":
        try:
            import ctypes

            class MS(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), ("ullTotalPhys", ctypes.c_ulonglong),
                            ("ullAvailPhys", ctypes.c_ulonglong), ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong), ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]
            m = MS(); m.dwLength = ctypes.sizeof(MS)
            if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m)): n = max(2, min(n, int(m.ullAvailPhys / 1e9)))
        except Exception: pass
    return n


def log_export(p, kind, path, **info):
    """one line per export in 04_Renders/EXPORTS.md (older films: renders/EXPORTS.md): when, what, settings, size, where"""
    f = renders_root(p) / "EXPORTS.md"; f.parent.mkdir(parents=True, exist_ok=True)
    head = "# Các lần xuất (kit ghi tự động)\n\n| Lúc | Loại | Thiết lập | Dung lượng | Ở đâu |\n|---|---|---|---|---|\n"
    body = f.read_text(encoding="utf-8") if f.exists() else head
    path = Path(path)
    size = sum(x.stat().st_size for x in path.rglob("*") if x.is_file()) if path.is_dir() else (path.stat().st_size if path.exists() else 0)
    try: where = path.relative_to(film_root(p)).as_posix()
    except ValueError: where = str(path)
    sets = ", ".join(f"{k} {v}" for k, v in info.items())
    line = f"| {time.strftime('%d/%m/%Y %H:%M')} | {kind} | {sets} | {size / 1e6:.0f} MB | `{where}` |\n"
    for _ in range(20):
        try: f.write_text(body + ("" if body.endswith("\n") else "\n") + line, encoding="utf-8"); return
        except PermissionError: time.sleep(0.25)


def trash(paths):
    """send files / folders to the Recycle Bin (never a permanent delete: the user's rule). Returns the paths that were moved."""
    done = []
    for x in paths:
        x = Path(x).resolve()
        if not x.exists(): continue
        if os.name == "nt":
            import ctypes
            from ctypes import wintypes

            class SHFILEOPSTRUCTW(ctypes.Structure):
                _fields_ = [("hwnd", wintypes.HWND), ("wFunc", wintypes.UINT), ("pFrom", wintypes.LPCWSTR), ("pTo", wintypes.LPCWSTR),
                            ("fFlags", ctypes.c_ushort), ("fAnyOperationsAborted", wintypes.BOOL), ("hNameMappings", ctypes.c_void_p),
                            ("lpszProgressTitle", wintypes.LPCWSTR)]
            # FO_DELETE 3; FOF_SILENT 4 | FOF_NOCONFIRMATION 0x10 | FOF_ALLOWUNDO 0x40 | FOF_NOERRORUI 0x400 | FOF_WANTNUKEWARNING 0x4000:
            # something too big for the Recycle Bin (kit.py uninstall: the kit, Chromium) was deleted for good without a word; now Windows asks
            op = SHFILEOPSTRUCTW(None, 3, str(x) + "\0", None, 0x4 | 0x10 | 0x40 | 0x400 | 0x4000, False, None, None)
            if ctypes.windll.shell32.SHFileOperationW(ctypes.byref(op)) == 0 and not x.exists(): done.append(x)
        else:
            raise SystemExit("trash: Windows only (send the file to the bin by hand)")
    return done


def copy_into(src_dir, dst_dir, pattern="*"):
    """copy finished files into a project folder on Drive: replace matching old files one by one, never delete the folder itself
    (Drive chokes on delete + recreate of a synced folder, v1 note in kit.py render)"""
    import shutil
    dst_dir.mkdir(parents=True, exist_ok=True)
    for old in dst_dir.glob(pattern):
        if old.is_file(): old.unlink()
    n = 0
    for f in sorted(src_dir.glob(pattern)):
        if f.is_file(): shutil.copy2(f, dst_dir / f.name); n += 1
    return n


def node_exe():
    """node.exe (PATH, then where the Node.js installer puts it), or None: HyperFrames scripts the kit runs as shipped need it"""
    import shutil
    n = shutil.which("node")
    if n: return n
    for d in (Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "nodejs", Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "nodejs"):
        if (d / "node.exe").exists(): return str(d / "node.exe")
    return None


def as_shipped(path, sha256):
    """True when a file copied from a source repo is still that file: its SHA-256 as recorded, or the same after CRLF -> LF (git on
    Windows checks text files out with CRLF line ends; the content must still match byte for byte). Used by kit.py gallery (blocks with
    preset.json "source" "sha256") and audio/carve.py (engine/vendor/hf-carve/MANIFEST.json), 11/10/2026."""
    import hashlib
    p = Path(path)
    if not p.is_file(): return False
    b = p.read_bytes()
    return sha256 in (hashlib.sha256(b).hexdigest(), hashlib.sha256(b.replace(b"\r\n", b"\n")).hexdigest())
