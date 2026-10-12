"""kit.py doctor: is this machine ready for the kit? (chat B's proposal 07/10/2026, done 08/10/2026 night: a teammate's fresh install
should say what is missing before a film fails half-way). Reads only; installs nothing; prints one line per check and how to fix it. Inside a Claude desktop chat the font check reads the
real registry outside the app (engine/outside.py), and what a chat install left in the app's private copy is listed.

  OK      ready
  CHÚ Ý   works, but something optional is missing or slower (the fix is given)
  LỖI     a film will fail: run install.bat (or the fix given)
Exit code 1 when a LỖI is found."""
import os, shutil, subprocess, sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parents[1]
KIT = ENGINE.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
import install as I                                                     # noqa: E402  (versions, packages, models, fonts: one source)

OK, NOTE, BAD = "OK", "CHÚ Ý", "LỖI"


def _python():
    v = sys.version_info
    if v < (3, 11): return BAD, f"Python {v.major}.{v.minor}: cần 3.11 trở lên (khuyên 3.12, python.org, tick \"Add python.exe to PATH\")"
    return OK, f"Python {v.major}.{v.minor}.{v.micro}"


def _packages():
    req = [l.split("#")[0].strip() for l in (ENGINE / "requirements.txt").read_text(encoding="utf-8").splitlines()
           if l.strip() and not l.startswith("#")]
    name = lambda r: r.split(";")[0].split("[")[0].split("=")[0].split(">")[0].split("<")[0].split("~")[0].strip()
    core = [name(r) for r in req if not any(r.startswith(o) for o in I.OPTIONAL)]
    opt = [name(r) for r in req if any(r.startswith(o) for o in I.OPTIONAL)]
    miss, miss_opt = [p for p in core if not I._installed(p)], [p for p in opt if not I._installed(p)]
    out = [(BAD, f"thiếu gói: {', '.join(miss)} (chạy install.bat)") if miss else (OK, f"{len(core)} gói chính")]
    if miss_opt: out.append((NOTE, f"chưa cài gói tuỳ chọn: {', '.join(miss_opt)} (phiên âm / gắn lời, tách nền, đọc PDF: chạy lại install.bat)"))
    return out


def _chromium():
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p: exe = p.chromium.executable_path
        if not (exe and Path(exe).exists()): return BAD, "chưa có Chromium: chạy install.bat (bước Chromium)"
        trapped = I.claude_private("ms-playwright")
        if trapped and not str(exe).lower().startswith(str(I.BROWSERS).lower()):
            # what this chat sees may be only the Claude app's private copy: the player (a double-click) then cannot render
            return BAD, (f"Chromium chỉ nằm trong bản riêng của app Claude ({trapped}): player bấm Export sẽ lỗi. Chạy install.bat "
                         "(từ chat cũng được: nó tự mở cửa sổ ngoài app)")
        if str(exe).lower().startswith(str(I.BROWSERS).lower()) and os.name == "nt":
            # the kit's own Chromium: a plain Playwright script (one Claude writes in a film chat) finds it only through this variable
            import winreg
            try:
                with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as k: v = winreg.QueryValueEx(k, "PLAYWRIGHT_BROWSERS_PATH")[0]
            except OSError: v = ""
            if not v: return NOTE, f"Chromium để render ({Path(exe).parents[2]}); script Playwright tự viết chưa thấy nó: chạy install.bat"
        return OK, f"Chromium để render ({Path(exe).parents[2]})"
    except Exception as e:
        return BAD, f"Playwright / Chromium lỗi ({str(e).splitlines()[0][:80]}): chạy install.bat"


def _ffmpeg():
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        return (OK, "ffmpeg (MP4 / MOV, âm thanh)") if Path(exe).exists() else (BAD, "thiếu ffmpeg: chạy install.bat")
    except Exception:
        return BAD, "thiếu imageio-ffmpeg: chạy install.bat"


def _models():
    miss = I.models_missing()
    if not miss: return OK, "model AI (Whisper, rembg) trong engine\\models"
    return NOTE, "chưa có model: " + ", ".join(f"{m['name']} ({sum(f['size'] for f in fs) / 1e6:.0f} MB, cho {m['use']})" for m, fs in miss) + \
        ": install.bat hỏi tải khi cần"


def _fonts():
    """a kit font counts when Windows has it for every user, or this user's copy is registered in HKCU. Inside a Claude chat the HKCU this
    process reads includes the app's private copy, so the real one is read outside the app (engine/outside.py hidden; about 1 s)"""
    if os.name != "nt": return OK, "bỏ qua (không phải Windows)"
    import outside
    sysf = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    todo = [(Path(fn).name, n) for fn, n in I.KIT_TTF if not (sysf / Path(fn).name).exists()]
    if not todo: return OK, "font của kit cho After Effects (cho mọi tài khoản)"
    if outside.sandboxed():
        out = outside.hidden(f'reg query "HKCU\\{I.FONTS_KEY}"')
        if out is None: real = lambda fn, n: (I.USER_FONTS / fn).exists()          # could not look outside: the file at least
        else: real = lambda fn, n: (I.USER_FONTS / fn).exists() and any(f"{n} (TrueType)" in l and fn.lower() in l.lower() for l in out.splitlines())
    else: real = lambda fn, n: (I.USER_FONTS / fn).exists() and I.font_registered(n, I.USER_FONTS / fn)
    miss = [n for fn, n in todo if not real(fn, n)]
    if not miss: return OK, "font của kit cho After Effects"
    base = [n for n in miss if " Opsz" not in n]; op = len(miss) - len(base)
    return NOTE, ("After Effects chưa thấy font " + ", ".join(base + ([f"{op} cỡ quang học Roboto Flex"] if op else []))
                  + ": chạy install.bat (bước Font)")


def _claude_copy():
    """what an install run inside a Claude chat (before 10/10/2026, or with --here) left only in the Claude app's private copy of AppData:
    the double-clicked player, After Effects and terminals do not see it"""
    la = os.environ.get("LOCALAPPDATA")
    if os.name != "nt" or not la: return []
    hits = []
    for base in (Path(la) / "Packages").glob("Claude_*/LocalCache"):
        for rel, what in (("Local/ms-playwright", "Chromium"), ("Local/Programs/Python", "Python"), ("Roaming/Python", "gói Python")):
            if (base / rel).exists(): hits.append(what)
        if any((base / "Local/Microsoft/Windows/Fonts" / Path(fn).name).exists() for fn, _ in I.KIT_TTF): hits.append("font của kit")
    if not hits: return []
    return [(NOTE, f"còn {', '.join(dict.fromkeys(hits))} cài từ chat nằm trong bản riêng của app Claude (ngoài app không thấy): chạy install.bat "
                   "(từ chat cũng được, nó tự mở cửa sổ ngoài app); uninstall.bat dọn được phần sót")]


def _root():
    f = I.LOCAL / "kit-root.txt"
    have = f.read_text(encoding="utf-8").strip() if f.exists() else ""
    if not have: return BAD, "chưa có kit-root.txt (launcher của phim và skill không tìm được kit): chạy install.bat"
    if Path(have).resolve() != KIT.resolve(): return NOTE, f"kit-root.txt trỏ {have}, không phải kit này ({KIT}): chạy install.bat ở kit đang dùng"
    out = [(OK, f"kit-root.txt -> {KIT}")]
    if "My Drive" in str(KIT) or "Google Drive" in str(KIT): out.append((NOTE, "kit nằm trên Google Drive: chạy được, nhưng chậm hơn ổ máy"))
    return out


def _skill():
    kit_v, src_v, zip_v = I.version(), I.skill_version(I.SKILL_SRC), I.skill_version(I.SKILL_ZIP)
    out = [(OK, f"kit {kit_v}, skill trong kit {zip_v}") if kit_v == zip_v else (BAD, f"kit {kit_v} nhưng skill\\moworks-motion.zip {zip_v}: đóng gói lại skill")]
    if src_v and src_v != zip_v: out.append((BAD, f"bản nguồn skill {src_v} khác zip {zip_v}: python engine\\tests\\pack_skill.py"))
    cc = I.skill_version(I.SKILL_DST)
    web_v = sorted({I.skill_version(d) for d in I.claude_ai_skills()})
    if cc and web_v: out.append((NOTE, f"có hai bản skill: Claude Code {cc} và claude.ai {', '.join(web_v)}: gỡ bản claude.ai (Settings > Capabilities > Skills): bản Claude Code do update.bat tự cập nhật"))
    for where, v in ([("Claude Code", cc)] if cc else []) + [("claude.ai", v) for v in web_v]:
        out.append((OK, f"skill {where}: {v}") if v == kit_v else (NOTE, f"skill {where} {v} khác kit {kit_v}: "
                   + ("chạy update.bat" if where == "Claude Code" else "upload lại skill\\moworks-motion.zip")))
    if not cc and not web_v: out.append((NOTE, "chưa thấy skill moworks-motion trên máy (install.bat, hoặc upload zip lên claude.ai)"))
    return out


def _git():
    if not shutil.which("git"): return NOTE, "chưa có Git: update.bat cần nó (git-scm.com/download/win)"
    r = lambda *a: subprocess.run(["git", "-C", str(KIT), *a], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r("rev-parse", "--is-inside-work-tree").stdout.strip() != "true": return NOTE, "kit không cài bằng git clone: update.bat không tự cập nhật được"
    remote = r("remote").stdout.strip()
    dirty = len([l for l in r("status", "--porcelain", "--untracked-files=no").stdout.splitlines() if l.strip()])
    return (OK if remote else NOTE), ("git: " + (f"remote {remote.splitlines()[0]}" if remote else "chưa có remote (update.bat chưa có nơi để hỏi)")
                                      + (f"; {dirty} file trong kit đã bị sửa" if dirty else ""))


def _after_effects():
    pf = Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Adobe"
    exes = sorted(pf.glob("Adobe After Effects*/Support Files/AfterFX*.exe")) if pf.exists() else []
    if not exes: return NOTE, "không thấy After Effects (chỉ cần cho Port to AE)"
    return OK, "After Effects: " + ", ".join(e.parent.parent.name for e in exes)


def _edge(browser):
    b = browser()                                                       # kit.py's own lookup (the player opens its window with it)
    return (OK, f"cửa sổ player: {Path(b).name}") if b else (BAD, "không có Edge / Chrome cho cửa sổ player")


def _env():
    out = [(OK, "ELEVENLABS_API_KEY: có") if os.environ.get("ELEVENLABS_API_KEY") else
           (OK, "ElevenLabs: chưa có key (không bắt buộc; chỉ cần khi tạo giọng / nhạc)")]
    I.LOCAL.mkdir(parents=True, exist_ok=True)
    free = shutil.disk_usage(I.LOCAL).free / 1e9
    out.append((OK, f"ổ chứa bộ đệm render ({I.LOCAL.drive or I.LOCAL}): trống {free:.0f} GB") if free >= 10 else
               (NOTE, f"ổ chứa bộ đệm render chỉ còn {free:.1f} GB (MOV dài cần vài GB)"))
    return out


def run(browser, say=print):
    checks = [("Python", _python), ("Thư viện", _packages), ("Chromium", _chromium), ("ffmpeg", _ffmpeg), ("Model AI", _models),
              ("Font AE", _fonts), ("Cài từ chat", _claude_copy), ("Chỗ cài kit", _root), ("Skill", _skill), ("Git", _git),
              ("After Effects", _after_effects), ("Player", lambda: _edge(browser)), ("Máy", _env)]
    rows = []
    for name, f in checks:
        try: res = f()
        except Exception as e: res = (BAD, f"không kiểm được ({type(e).__name__}: {str(e)[:80]})")
        for st, msg in (res if isinstance(res, list) else [res]): rows.append((st, name, msg))
    say(f"Moworks Motion {I.version()}: kiểm máy ({KIT})")
    w = max(len(n) for _, n, _ in rows)
    for st, name, msg in rows: say(f"  {st:<6} {name:<{w}}  {msg}")
    bad, note = sum(st == BAD for st, *_ in rows), sum(st == NOTE for st, *_ in rows)
    say(f"\n{bad} lỗi, {note} chú ý." + (" Chạy install.bat rồi chạy lại lệnh này." if bad else " Máy đã sẵn sàng làm phim."))
    return 1 if bad else 0
