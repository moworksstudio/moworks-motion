"""Moworks Motion uninstaller, run by uninstall.bat in the kit root. One question, then everything install.bat put on the machine goes to
the Recycle Bin (never a permanent delete: Windows asks first when something is too big for the bin), then a short table
(user 10/10/2026, after a clean-machine test: no item-by-item questions):

  1. the skill for Claude Code: %USERPROFILE%\\.claude\\skills\\moworks-motion
  2. the kit's fonts for After Effects: the files in %LOCALAPPDATA%\\Microsoft\\Windows\\Fonts + their HKCU values
  3. what an install run inside a Claude chat left in the Claude app's private copy of AppData (Chromium, the font files)
  4. %USERPROFILE%\\.aimotionkit: Chromium for rendering, work files, caches, HyperFrames, kit-root.txt, archive
  5. the kit folder itself (the clone), last. Kept, with the reason in the table, when it has work not on GitHub (changed files, commits
     not pushed) or keeps its git data elsewhere (the maintainer's machine)
Kept: Python, Git, Node.js, the Python packages (other programs share them), the films' job folders, the skill uploaded to claude.ai.
--all also removes the kit's Python packages and Chromium in Playwright's default place (%LOCALAPPDATA%\\ms-playwright).
Run from a Claude desktop chat it opens its own window outside the app and runs there (engine/outside.py), the chat shows its log.

  python engine/uninstall.py     asks once
  --yes                          no question (the user already said uninstall, e.g. in the chat)
  --here                         run in this process even inside a Claude chat"""
import os, re, subprocess, sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parent
KIT = ENGINE.parent
sys.path.insert(0, str(ENGINE))
from common import LOCAL, trash                                         # noqa: E402  (stdlib only)
import install as I                                                     # noqa: E402  (where the installer put things)
import outside                                                          # noqa: E402


def gone(paths):
    """to the Recycle Bin -> (moved, [paths that stayed])"""
    paths = [Path(p) for p in paths if Path(p).exists()]
    trash(paths)
    left = [p for p in paths if p.exists()]
    for p in left: print(f"   [LỖI] không chuyển được {p} (một chương trình đang mở nó?)")
    return len(paths) - len(left), left


def skill_item():
    if not I.SKILL_DST.exists(): return True, "không có"
    n, left = gone([I.SKILL_DST])
    return not left, "-> Thùng rác" if not left else "[LỖI] đóng Claude rồi chạy lại"


def fonts_item():
    if os.name != "nt": return True, "bỏ qua"
    import ctypes, winreg
    found = [(name, I.USER_FONTS / Path(fn).name, I.font_registered(name, I.USER_FONTS / Path(fn).name)) for fn, name in I.KIT_TTF]
    found = [x for x in found if x[1].exists() or x[2]]
    if not found: return True, "không có"
    ok = True
    for name, f, reg in found:
        if reg:
            try:
                with winreg.OpenKey(winreg.HKEY_CURRENT_USER, I.FONTS_KEY, 0, winreg.KEY_SET_VALUE) as k: winreg.DeleteValue(k, f"{name} (TrueType)")
            except FileNotFoundError: pass
            except Exception as e: print(f"   [LỖI] {name}: {e}"); ok = False
        if f.exists():
            for _ in range(4):                                          # Windows keeps a signed-in user's fonts loaded: unload, then move
                if not ctypes.windll.gdi32.RemoveFontResourceW(str(f)): break
            ok &= not gone([f])[1]
    try: ctypes.windll.user32.SendMessageTimeoutW(0xFFFF, 0x001D, 0, 0, 0x2, 1000, None)   # WM_FONTCHANGE to every window
    except Exception: pass
    return ok, f"gỡ {len(found)} font" if ok else "[LỖI] đóng After Effects rồi chạy lại"


def claude_copy_item():
    la = os.environ.get("LOCALAPPDATA")
    items = []
    for base in (Path(la) / "Packages").glob("Claude_*/LocalCache/Local") if la else []:
        if (base / "ms-playwright").exists(): items.append(base / "ms-playwright")
        items += [base / "Microsoft" / "Windows" / "Fonts" / Path(fn).name for fn, _ in I.KIT_TTF if (base / "Microsoft" / "Windows" / "Fonts" / Path(fn).name).exists()]
    if not items: return True, "không có"
    n, left = gone(items)
    return not left, f"{n} mục -> Thùng rác" + (f", [LỖI] còn {len(left)}" if left else "")


def local_item():
    env = I.user_env("PLAYWRIGHT_BROWSERS_PATH", None)                  # install pointed every Playwright program at the kit's Chromium
    if not LOCAL.exists(): return True, "không có" + env
    n, left = gone(list(LOCAL.iterdir()))
    try:
        if LOCAL.exists() and not any(LOCAL.iterdir()): LOCAL.rmdir()
    except OSError: pass
    return not left, f"{n} mục -> Thùng rác" + (f", [LỖI] còn {len(left)}" if left else "") + env


def kit_item():
    """the clone, unless it holds work that is not on GitHub"""
    git = lambda *a: subprocess.run(["git", "-C", str(KIT), *a], capture_output=True, text=True, encoding="utf-8", errors="replace")
    why = []
    try:
        if (KIT / ".git").is_file(): why.append("git của kit để ở chỗ khác (máy làm kit)")
        ch = [l for l in git("status", "--porcelain").stdout.splitlines() if l.strip()]
        ahead = git("rev-list", "--count", "@{u}..HEAD").stdout.strip()
        if ch: why.append(f"{len(ch)} file sửa / mới chưa lên GitHub")
        if ahead and ahead != "0": why.append(f"{ahead} lần lưu chưa đẩy")
    except Exception: pass
    if why: return True, "giữ lại: " + "; ".join(why)
    os.chdir(os.environ.get("TEMP") or str(Path.home()))                 # not inside the folder that goes
    n, left = gone([KIT])
    return not left, "-> Thùng rác (cả brands\\ và model đã tải)" if not left else "[LỖI] đóng các cửa sổ đang mở trong thư mục kit"


def packages_item():
    names = [re.split(r"[\[=<>~!;\s]", l.strip())[0] for l in (ENGINE / "requirements.txt").read_text(encoding="utf-8").splitlines()
             if l.strip() and not l.lstrip().startswith("#")]
    have = [n for n in names if I._installed(n)]
    if not have: return True, "không có"
    ok = I.run([sys.executable, "-m", "pip", "uninstall", "-y", "-q", "--disable-pip-version-check", *have])
    return ok, f"gỡ {len(have)} gói" if ok else "[LỖI] xem dòng pip phía trên"


def default_chromium_item():
    d = Path(os.environ.get("LOCALAPPDATA", "")) / "ms-playwright"
    if not os.environ.get("LOCALAPPDATA") or not d.exists(): return True, "không có"
    n, left = gone([d])
    return not left, "-> Thùng rác" if not left else "[LỖI] còn lại"


def main():
    if outside.sandboxed() and "--here" not in sys.argv:
        return outside.handoff("uninstall.bat", sys.argv[1:], "go cai dat")
    outside.tee()
    full = "--all" in sys.argv
    print(f"Moworks Motion {I.version()} ({KIT})")
    if not I.ask("Gỡ Moworks Motion khỏi máy này? (skill, font, Chromium, thư mục .aimotionkit, rồi thư mục kit; tất cả vào Thùng rác)", False):
        print("Chưa gỡ gì."); return 0
    steps = [("Skill cho Claude Code", skill_item), ("Font cho After Effects", fonts_item), ("Phần kẹt trong app Claude", claude_copy_item),
             (".aimotionkit (Chromium, file làm việc)", local_item)]
    if full: steps += [("Gói Python của kit", packages_item), ("Chromium chỗ mặc định", default_chromium_item)]
    steps += [("Thư mục kit", kit_item)]
    ok, rows = True, []
    for name, fn in steps:
        try: good, text = fn()
        except Exception as e: good, text = False, f"[LỖI] {e}"
        ok &= bool(good); rows.append((name, text))
    rows.append(("Giữ lại", "Python, Git" + ("" if full else ", gói Python") + ", thư mục phim, skill trên claude.ai"))
    I.table(rows)
    print("\n" + ("XONG. Muốn xoá hẳn: dọn Thùng rác." if ok else "CÓ MỤC CHƯA GỠ ĐƯỢC (dòng [LỖI] ở bảng trên)."))
    return 0 if ok else 1


if __name__ == "__main__":
    rc = 1
    try: rc = main()
    except SystemExit as e: rc = e.code if isinstance(e.code, int) else 1
    except BaseException:
        import traceback; traceback.print_exc()
    finally: outside.finish(rc)
    sys.exit(rc)
