"""Moworks Motion installer, run by install.bat in the kit root; safe to run again (it skips what is already there).
One question, then everything (user 10/10/2026, after a clean-machine test: "chỉ cần user nói yes rồi cài thôi"), then a short table:

  1. Python packages (engine/requirements.txt, all of them: voice and lyric timing, background removal, PDF pages included)
  2. Chromium for rendering (playwright), in %USERPROFILE%\\.aimotionkit\\ms-playwright
  3. AI models (engine/models.json: Whisper small, rembg) into engine/models/, only the missing ones
  4. Fonts for After Effects (Roboto Flex, Roboto Mono, Roboto Flex at fixed optical sizes) for this Windows user
  5. The skill for Claude Code: skill/moworks-motion.zip unpacked into %USERPROFILE%\\.claude\\skills\\moworks-motion (update.bat keeps
     it current; no upload to claude.ai needed). A claude.ai copy the Claude app also has: the table says to remove it there
  6. %USERPROFILE%\\.aimotionkit\\kit-root.txt = this kit's folder (films' launchers and the skill find the kit through it);
     .gitignore / .gitattributes / LICENSE in the kit root set hidden (the root shows only the .bat files and the folders)
  HyperFrames Studio (hand editing of a timeline) is not part of it: when the user asks Claude for it, Claude runs `install.bat --only hf`.
Only PyPI, the Playwright CDN, Hugging Face / GitHub (the models), registry.npmjs.org and winget are contacted, and only by this installer.
Run from a Claude desktop chat it opens its own window outside the app and runs there (engine/outside.py), the chat shows its log.

  python engine/install.py                    asks once, then installs everything
  python engine/install.py --yes              no question (the user already said install, e.g. in the chat)
  python engine/install.py --only skill,root  some steps: python, chromium, models, fonts, skill, root, hf
  --here                                      run in this process even inside a Claude chat (what it installs may stay in the app's copy)"""
import json, os, shutil, sys, time, urllib.request
from pathlib import Path

ENGINE = Path(__file__).resolve().parent
KIT = ENGINE.parent
sys.path.insert(0, str(ENGINE))
from common import BROWSERS, LOCAL, claude_private                    # noqa: E402  (stdlib only: runs before any package is installed)
import outside                                                         # noqa: E402
HOME = Path(os.environ.get("USERPROFILE") or Path.home())
SKILL_ZIP = KIT / "skill" / "moworks-motion.zip"                       # what users get (user 10/10/2026: the skill folder holds the zip only)
SKILL_SRC = KIT / "engine" / "skill" / "moworks-motion"                 # its source (engine/tests/pack_skill.py packs it)
SKILL_DST = HOME / ".claude" / "skills" / "moworks-motion"
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass
OPTIONAL = ("faster-whisper", "rembg", "pymupdf", "librosa")            # installed too; kit.py doctor only notes them when missing
STEPS = ("python", "chromium", "models", "fonts", "skill", "root", "hf")
NAMES = {"python": "Thư viện Python", "chromium": "Chromium (render phim)", "models": "Model AI (Whisper, rembg)",
         "fonts": "Font cho After Effects", "skill": "Skill moworks-motion", "root": "Chỗ cài kit (kit-root.txt)",
         "hf": "HyperFrames Studio"}
NOTES = {}                                                             # step -> one line for the final table


def note(step, text):
    NOTES[step] = text


def ask(q, default=True):
    """one yes / no on the console (--yes: yes, --no: no; no console: the default)"""
    if "--no" in sys.argv: return False
    if "--yes" in sys.argv: return True
    try: a = input(f"{q} [{'Y/n' if default else 'y/N'}] ").strip().lower()
    except EOFError: return default
    outside.log_only(a + "\n")
    return default if not a else a.startswith(("y", "c"))              # c = có


def run(cmd, **kw):
    return outside.run(cmd, **kw)


def table(rows, head=("Phần", "Kết quả")):
    """a short two-column table on the console"""
    w = max(len(head[0]), *(len(a) for a, _ in rows)) + 2
    print(f"\n {head[0].ljust(w)}{head[1]}\n {'-' * (w - 2)}  {'-' * 40}")
    for a, b in rows: print(f" {a.ljust(w)}{b}")


def version():
    """engine/VERSION (the kit root held it before 08/10/2026 night)"""
    f = next((f for f in (ENGINE / "VERSION", KIT / "VERSION") if f.exists()), None)
    return f.read_text(encoding="utf-8").strip() if f else "?"


# ------------------------------------------------------------------ steps shared with update.py

def packages():
    """every package in engine/requirements.txt (the optional ones too: one question covers all)"""
    req = [l.split("#")[0].strip() for l in (ENGINE / "requirements.txt").read_text(encoding="utf-8").splitlines()
           if l.strip() and not l.lstrip().startswith("#")]
    print("   đang cài / kiểm tra (lần đầu vài phút)...")
    ok = run([sys.executable, "-m", "pip", "install", "-q", "--disable-pip-version-check", *req])
    note("python", f"{len(req)} gói" if ok else "[LỖI] xem dòng pip phía trên")
    return ok


def _installed(dist):
    try:
        from importlib.metadata import version as v
        v(dist); return True
    except Exception: return False


def models_missing():
    """[(model, [missing files])] from engine/models.json: a file is there when its size matches"""
    spec = json.loads((ENGINE / "models.json").read_text(encoding="utf-8"))
    out = []
    for m in spec["models"]:
        miss = [f for f in m["files"] if not ((ENGINE / "models" / f["to"]).exists() and (ENGINE / "models" / f["to"]).stat().st_size == f["size"])]
        if miss: out.append((m, miss))
    return out


def models_step():
    todo = models_missing()
    if not todo: note("models", "đã có"); return True
    ok, got = True, []
    for m, miss in todo:
        if not _installed(m["package"]): print(f"   {m['name']}: bỏ qua (gói {m['package']} chưa cài)"); ok = False; continue
        good = all([download(f["url"], ENGINE / "models" / f["to"], f["size"]) for f in miss])
        if good: got.append(m["name"])
        ok &= good
    note("models", ("đã tải " + ", ".join(got) if got else "") + ("" if ok else ("; " if got else "") + "[LỖI] xem phía trên"))
    return ok


def download(url, dst, size):
    """url -> dst through a .part file, progress every 10 %; the size must match"""
    dst.parent.mkdir(parents=True, exist_ok=True); part = dst.with_name(dst.name + ".part")
    print(f"   tải {dst.name} ({size / 1e6:.0f} MB)")
    try:
        with urllib.request.urlopen(url, timeout=60) as r, open(part, "wb") as out:
            done, mark = 0, 0.1
            while True:
                b = r.read(1 << 20)
                if not b: break
                out.write(b); done += len(b)
                if size and done / size >= mark: print(f"     {done / size:.0%}"); mark += 0.1
        if size and part.stat().st_size != size: raise IOError(f"size {part.stat().st_size} != {size}")
        os.replace(part, dst); return True
    except Exception as e:
        print(f"   [LỖI] {dst.name}: {e}"); part.unlink(missing_ok=True); return False


def skill_version(where):
    """the "Skill version **x**" line of a skill folder or of the kit's zip (moworks-motion/SKILL.md inside it); None when there is none"""
    import re, zipfile
    where = Path(where)
    try:
        if where.suffix.lower() == ".zip":
            if not where.exists(): return None
            with zipfile.ZipFile(where) as z: text = z.read("moworks-motion/SKILL.md").decode("utf-8")
        else:
            f = where / "SKILL.md"
            if not f.exists(): return None
            text = f.read_text(encoding="utf-8")
    except (KeyError, OSError, zipfile.BadZipFile): return None
    m = re.search(r"Skill version \*\*([^*]+)\*\*", text)
    return m.group(1) if m else "?"


def claude_ai_skills():
    """the copies of the skill uploaded to claude.ai that the Claude desktop app keeps on this machine: under %APPDATA%\\Claude as a chat
    sees it, physically in the app's private copy (Packages\\Claude_*\\LocalCache\\Roaming\\Claude) as anything outside the app sees it"""
    pat = "local-agent-mode-sessions/skills-plugin/*/*/skills/moworks-motion"
    bases = [Path(os.environ["APPDATA"]) / "Claude"] if os.environ.get("APPDATA") else []
    if os.environ.get("LOCALAPPDATA"): bases += sorted((Path(os.environ["LOCALAPPDATA"]) / "Packages").glob("Claude_*/LocalCache/Roaming/Claude"))
    return [d for b in bases for d in sorted(b.glob(pat)) if (d / "SKILL.md").exists()]


def skill_step():
    """skill/moworks-motion.zip -> ~/.claude/skills/moworks-motion (unpacked; an older copy goes to the Recycle Bin first). Always this
    copy: the kit runs only where Claude Code runs, and update.bat keeps it current (user 10/10/2026: install sets the skill up, no upload
    to claude.ai). A claude.ai copy the Claude app also has is a second copy: the table says to remove it there (only the user can)"""
    import zipfile
    new = skill_version(SKILL_ZIP); old = skill_version(SKILL_DST)
    if new is None: note("skill", f"[LỖI] không đọc được {SKILL_ZIP}"); return False
    web = sorted({skill_version(d) for d in claude_ai_skills()})
    extra = f"; máy còn bản claude.ai {', '.join(web)}: gỡ nó trong Settings > Capabilities > Skills (tránh hai bản)" if web else ""
    # the same version number is not the same skill: compare the files too (12/10/2026: a skill edited under 2.0.0 was never installed,
    # update.bat said "đã có")
    with zipfile.ZipFile(SKILL_ZIP) as z:
        files = {Path(*Path(n).parts[1:]): n for n in z.namelist() if n.startswith("moworks-motion/") and not n.endswith("/")}
        same = SKILL_DST.is_dir() and all((SKILL_DST / r).is_file() and (SKILL_DST / r).read_bytes() == z.read(n) for r, n in files.items())
    if same: same = {p.relative_to(SKILL_DST) for p in SKILL_DST.rglob("*") if p.is_file() and p.name.lower() != "desktop.ini"} <= set(files)
    if old == new and same: note("skill", f"{new}: đã có (trùng nội dung bản trong kit)" + extra); return True
    if SKILL_DST.exists():
        from common import trash
        if not trash([SKILL_DST]) or SKILL_DST.exists(): note("skill", f"[LỖI] không chuyển được bản cũ ({SKILL_DST}); đóng Claude rồi chạy lại"); return False
    with zipfile.ZipFile(SKILL_ZIP) as z:
        for n in z.namelist():                              # moworks-motion/<path> -> SKILL_DST/<path>; nothing outside that folder
            rel = Path(*Path(n).parts[1:]) if n.startswith("moworks-motion/") else None
            if not rel or n.endswith("/") or ".." in rel.parts: continue
            (SKILL_DST / rel).parent.mkdir(parents=True, exist_ok=True); (SKILL_DST / rel).write_bytes(z.read(n))
    note("skill", f"{new}" + (f" (thay {old})" if old and old != new else "") + (": đã cập nhật nội dung" if old == new else ": đã cài") + extra)
    return True


def root_step():
    LOCAL.mkdir(parents=True, exist_ok=True)
    f = LOCAL / "kit-root.txt"
    old = f.read_text(encoding="utf-8").strip() if f.exists() else ""
    if old != str(KIT): f.write_text(str(KIT) + "\n", encoding="utf-8")
    note("root", str(KIT))
    hide_root_files()
    return True


ROOT_HIDDEN = (".gitignore", ".gitattributes", "LICENSE", "CLAUDE.md")  # git needs the first two in the kit root, GitHub reads LICENSE there,
                                                                         # Claude Code reads CLAUDE.md there


def hide_root_files():
    """the kit root shows only the .bat files and the folders (user, 08/10/2026): git's two files stay there but hidden.
    git drops the flag whenever it rewrites a file, so install and update set it again. A hidden file cannot be overwritten
    (Python, Node, Claude's Edit: permission denied): `attrib -h <file>` before editing it, `attrib +h` after."""
    if os.name != "nt": return
    import ctypes
    k32 = ctypes.windll.kernel32
    for name in ROOT_HIDDEN:
        f = KIT / name
        a = k32.GetFileAttributesW(str(f))
        if a != -1 and not a & 0x2: k32.SetFileAttributesW(str(f), (a & ~0x80) | 0x2)     # 0x80 NORMAL is valid only alone


def hf_step(asked=False):
    """HyperFrames Studio: installed only when the user asks Claude for it (Claude runs install.bat --only hf); a plain install reports it.
    Node.js missing: winget installs it and this run goes on with its folder added to PATH (no second run)"""
    sys.path.insert(0, str(ENGINE)); sys.path.insert(0, str(ENGINE / "adapters" / "hf"))
    import hf
    have = hf.installed()
    if not asked:
        note("hf", f"đã có {', '.join(have)}" if have else "không cài (không bắt buộc; cần thì báo Claude để cài)"); return True
    if not shutil.which("node"):
        if not shutil.which("winget"): note("hf", "chưa có Node.js: cài bản LTS ở nodejs.org rồi báo Claude cài lại"); return False
        if not run(["winget", "install", "--id", "OpenJS.NodeJS.LTS", "-e", "--accept-package-agreements", "--accept-source-agreements"]):
            note("hf", "[LỖI] cài Node.js không được"); return False
        for d in (Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "nodejs", Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "nodejs"):
            if (d / "node.exe").exists(): os.environ["PATH"] = f"{d}{os.pathsep}{os.environ.get('PATH', '')}"
        if not shutil.which("node"): note("hf", "Node.js vừa cài nhưng chưa thấy: báo Claude cài lại"); return False
    v = hf.state()["current"]
    if not hf.install(v): note("hf", f"[LỖI] cài HyperFrames {v} không được"); return False
    good, why = hf.smoke(v)
    note("hf", f"{v}: " + ("đạt" if good else f"[LỖI] {why}")); return good


def chromium_step():
    """Chromium for rendering (Playwright's chromium + headless shell). Where: %USERPROFILE%\\.aimotionkit\\ms-playwright (common.BROWSERS)
    when it is already there or when the default place (%LOCALAPPDATA%\\ms-playwright) has no Chromium of its own; a machine whose Chromium
    is in the default place keeps it. Never the default place from a chat on a new machine: the Claude app keeps that folder in its private
    copy, where the player cannot see it (2D rebuild test, 09/10/2026). The place is set for the rest of this run too: on a new machine
    common.py found no Chromium when it loaded, and the HyperFrames test looked in the default place (clean-machine test, 10/10/2026)."""
    default = Path(os.environ.get("LOCALAPPDATA", "")) / "ms-playwright"
    trapped = claude_private("ms-playwright")
    own = default.is_dir() and any(default.glob("chromium*")) and not trapped
    here = BROWSERS if (BROWSERS.is_dir() and any(BROWSERS.glob("chromium*"))) or not own else default
    had = here.is_dir() and any(here.glob("chromium*"))
    ok = run([sys.executable, "-m", "playwright", "install", "chromium"], env={**os.environ, "PLAYWRIGHT_BROWSERS_PATH": str(here)})
    env = ""
    if ok:
        os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(here)
        # every Playwright program of this Windows user finds this Chromium, not only the kit's (a script Claude wrote in a film chat looked
        # in the default place and failed: 11/10/2026 test); a value the user set to another folder is left alone
        if here == BROWSERS: env = user_env("PLAYWRIGHT_BROWSERS_PATH", str(here))
    note("chromium", ("[LỖI] xem phía trên" if not ok else ("đã có" if had else "đã cài")) + f" ({here})"
         + (" (bản cũ kẹt trong app Claude, đã cài lại ra ngoài)" if trapped else "") + env)
    return ok


def user_env(name, value):
    """a user environment variable (HKCU\\Environment; value None removes it), announced to running programs; -> a few words for the table.
    Only when it is unset or already the kit's: another value is the user's own and stays"""
    if os.name != "nt": return ""
    import ctypes, winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment", 0, winreg.KEY_READ | winreg.KEY_SET_VALUE) as k:
            try: old = winreg.QueryValueEx(k, name)[0]
            except FileNotFoundError: old = None
            mine = old is None or Path(old).resolve() == BROWSERS.resolve()
            if value is None:
                if old is None or not mine: return ""
                winreg.DeleteValue(k, name); what = f"; bỏ biến {name}"
            else:
                if old == value: return ""
                if not mine: return f"; biến {name} của bạn trỏ chỗ khác, để nguyên"
                winreg.SetValueEx(k, name, 0, winreg.REG_SZ, value); what = f"; biến {name} cho mọi script Playwright"
        ctypes.windll.user32.SendMessageTimeoutW(0xFFFF, 0x001A, 0, "Environment", 0x2, 2000, None)   # WM_SETTINGCHANGE
        return what
    except OSError as e:
        return f"; [LỖI] biến {name}: {e}"


KIT_TTF = [("RobotoFlex-var.ttf", "Roboto Flex"), ("RobotoMono-var.ttf", "Roboto Mono"), ("RobotoMono-Italic-var.ttf", "Roboto Mono Italic")]
# Roboto Flex at fixed optical sizes for AE (engine/tests/make_opsz_fonts.py; KI-02, 10/10/2026): port.py picks the one nearest each text's size
KIT_TTF += [(f"opsz/{f.name}", f"Roboto Flex Opsz{f.stem.split('opsz')[-1]}")
            for f in sorted((ENGINE / "vendor" / "fonts" / "opsz").glob("RobotoFlex-opsz*.ttf"), key=lambda f: int(f.stem.split("opsz")[-1]))]
# the Google families of the public looks, the talking-head cards and the caption DNA (11/10/2026), so the AE port finds them by name
KIT_TTF += [(f"google/{f.parent.name}/{f.name}", f.stem.replace("[", " ").replace("]", "").replace(",", " "))
            for f in sorted((ENGINE / "vendor" / "fonts" / "google").glob("*/*.ttf"))]
FONTS_KEY = r"Software\Microsoft\Windows NT\CurrentVersion\Fonts"
USER_FONTS = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "Windows" / "Fonts"


def font_registered(name, dst):
    """HKCU names the kit's font file (a copied file alone is not installed: the 2D rebuild test's chat install left the file and kept
    the registry value in the Claude app's copy, After Effects saw no font)"""
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, FONTS_KEY) as k:
            v, _ = winreg.QueryValueEx(k, f"{name} (TrueType)")
        return Path(v).name.lower() == Path(dst).name.lower()
    except Exception: return False


def font_step():
    """per-user font install (no admin): copy into %LOCALAPPDATA%\\Microsoft\\Windows\\Fonts and register it under HKCU.
    The kit's fonts: Roboto Flex (every film) and Roboto Mono (code / terminal blocks), so After Effects shows the films' fonts.
    Inside a Claude chat (only with --here: install hands itself over to a window outside) the registry value would land in the Claude app's
    private copy of HKCU and After Effects would not see the font: the step then says to run install.bat by a double-click."""
    if os.name != "nt": note("fonts", "bỏ qua (không phải Windows)"); return True
    dst_dir = USER_FONTS
    sysf = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    todo = []
    for fn, name in KIT_TTF:
        src = ENGINE / "vendor" / "fonts" / fn
        if not src.exists(): continue
        dst = dst_dir / Path(fn).name
        if (sysf / Path(fn).name).exists() or (dst.exists() and dst.stat().st_size == src.stat().st_size and font_registered(name, dst)): continue
        todo.append((src, dst, name))
    if not todo: note("fonts", f"đã có ({len(KIT_TTF)} font)"); return True
    if outside.sandboxed():
        note("fonts", "chưa cài: chạy trong chat thì After Effects không thấy font; bấm đúp install.bat trong thư mục kit"); return True
    ok, bad = True, []
    for src, dst, name in todo:
        try:
            import winreg
            dst_dir.mkdir(parents=True, exist_ok=True)
            if not (dst.exists() and dst.stat().st_size == src.stat().st_size): shutil.copy2(src, dst)   # a font AE has open stays as it is
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, FONTS_KEY, 0, winreg.KEY_SET_VALUE) as k:
                winreg.SetValueEx(k, f"{name} (TrueType)", 0, winreg.REG_SZ, str(dst))
        except Exception as ex:
            print(f"   [LỖI] {name}: {ex}"); bad.append(name); ok = False
    note("fonts", f"đã cài {len(todo) - len(bad)} font (mở lại After Effects nếu đang mở)" + (f"; [LỖI] {', '.join(bad)}: chuột phải file font > Install" if bad else ""))
    return ok


def main():
    only = next((a.split("=", 1)[1] if "=" in a else sys.argv[sys.argv.index(a) + 1] for a in sys.argv if a.startswith("--only")), "")
    want = [s.strip() for s in only.split(",") if s.strip()] or list(STEPS)
    bad = [s for s in want if s not in STEPS]
    if bad: print(f"--only: {', '.join(bad)}? (one of {', '.join(STEPS)})"); return 2
    if outside.sandboxed() and "--here" not in sys.argv:
        return outside.handoff("install.bat", sys.argv[1:], "cai dat")
    outside.tee()
    print(f"Moworks Motion {version()} ({KIT})")
    if sys.version_info < (3, 11): print(f"Python {sys.version.split()[0]} quá cũ: cần Python 3.11 trở lên."); return 1
    if not only and not ask("Cài Moworks Motion vào máy này? (thư viện Python, Chromium, model AI, font cho After Effects, skill; "
                            "khoảng 2 GB, cần internet, 5-15 phút)", True):
        print("Chưa cài gì."); return 0
    funcs = {"python": packages, "chromium": chromium_step, "models": models_step, "fonts": font_step, "skill": skill_step,
             "root": root_step, "hf": lambda: hf_step(asked=bool(only))}
    ok = True; t0 = time.time()
    for i, s in enumerate(want, 1):
        print(f"[{i}/{len(want)}] {NAMES[s]}")
        try: ok &= bool(funcs[s]())
        except Exception as e: note(s, f"[LỖI] {e}"); ok = False
    table([(NAMES[s], NOTES.get(s, "xong")) for s in want])
    print("\n" + (f"Đã cài xong ({time.time() - t0:.0f} s). Chạy dự án mới trong Claude Code (không dùng Claude Chat). Thư viện mẫu trong file gallery.bat." if ok else
                  "CÓ BƯỚC CHƯA XONG (dòng [LỖI] ở bảng trên). Chụp màn hình cửa sổ này gửi Claude."))
    return 0 if ok else 1


if __name__ == "__main__":
    rc = 1
    try: rc = main()
    except SystemExit as e: rc = e.code if isinstance(e.code, int) else 1
    except BaseException:
        import traceback; traceback.print_exc()
    finally: outside.finish(rc)
    sys.exit(rc)
