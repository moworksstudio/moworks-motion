"""Moworks Motion updater, run by update.bat in the kit root (a kit installed with `git clone`).

  1. which version is here, which is the newest (git fetch; the newest engine/VERSION on GitHub)
  2. what changed: docs/CHANGELOG.md of the versions in between, every motion preset / layout added, changed or removed (library/), other files
  3. after a yes: the whole repo is pulled (git pull --ff-only: never over the user's own edits), then
     Python packages when requirements.txt or constraints.txt changed, missing AI models (asks), the skill for Claude Code (old copy to the Recycle Bin),
     kit-root.txt (and git's two files in the kit root hidden again)
The user's own folders (brands/, library/refs/, engine/models/) are not in git: an update never touches them.
Run from a Claude desktop chat it opens its own window outside the app and runs there (engine/outside.py), the chat shows its log.

  python engine/update.py            check, show, ask, update
  python engine/update.py --check    check and show only
  --check --quiet                    one line for the skill when it loads (user 11/10/2026: "khi load skill ... scan GitHub coi là phải
                                     latest version chưa và gợi ý update"): nothing installed, never a password prompt, 20 s at most;
                                     exit 0 up to date, 10 behind, 1 no check (not a git clone, no network)
  --here                             run in this process even inside a Claude chat"""
import re, subprocess, sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parent
KIT = ENGINE.parent
sys.path.insert(0, str(ENGINE))
import install as I                                                     # noqa: E402  (shared steps: packages, models, skill, kit-root)
import outside                                                          # noqa: E402

LIB = ("library/presets/", "library/layouts/")


def git(*a, check=False, timeout=None):
    env = dict(__import__("os").environ, GIT_TERMINAL_PROMPT="0", GCM_INTERACTIVE="never") if timeout else None   # quiet: never a prompt
    try: r = subprocess.run(["git", "-C", str(KIT), *a], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout, env=env)
    except subprocess.TimeoutExpired: return None
    if check and r.returncode: raise SystemExit(f"git {' '.join(a)}: {(r.stderr or r.stdout).strip()}")
    return r.stdout.strip() if not r.returncode else None


def quick():
    """--check --quiet: one line, nothing installed (the skill reads it when it loads and tells the user)"""
    mine = I.version()
    if git("rev-parse", "--is-inside-work-tree", timeout=10) != "true": print(f"kit {mine}: not a git clone, no update check"); return 1
    br = git("rev-parse", "--abbrev-ref", "HEAD", timeout=10)
    if br and br != "main": print(f"kit {mine}: under maintenance (branch {br}), no update check"); return 1
    if git("fetch", "--quiet", timeout=20) is None: print(f"kit {mine}: GitHub not reachable, no update check"); return 1
    up = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}", timeout=10)
    if not up: print(f"kit {mine}: this branch follows no GitHub branch, no update check"); return 1
    behind = int(git("rev-list", "--count", f"HEAD..{up}", timeout=10) or 0)
    if not behind: print(f"kit {mine}: up to date"); return 0
    newest = (git("show", f"{up}:engine/VERSION", timeout=10) or "?").strip()
    last = git("log", "-1", "--format=%cd: %s", "--date=format:%d/%m/%Y", up, timeout=10) or ""
    print(f"kit {mine}: {behind} update(s) on GitHub, newest {newest} ({last[:120]}): update.bat updates it"); return 10


def library_changes(a, b):
    """{"preset" | "layout": {"mới": [...], "sửa": [...], "bỏ": [...]}} between two commits, one entry per group/name"""
    out = {}
    for line in (git("diff", "--name-status", a, b, "--", *LIB) or "").splitlines():
        parts = line.split("\t"); st = parts[0][0]
        for path in parts[1:]:
            m = re.match(r"library/(presets|layouts)/([^/]+)/([^/]+)/", path)
            if not m: continue
            kind = "preset" if m.group(1) == "presets" else "layout"; name = f"{m.group(2)}/{m.group(3)}"
            what = "mới" if st == "A" else ("bỏ" if st == "D" else "sửa")
            d = out.setdefault(kind, {"mới": set(), "sửa": set(), "bỏ": set()})
            d[what].add(name)
    for d in out.values():                                              # a preset with an added file AND changed files is "new" only if
        d["sửa"] -= d["mới"]; d["bỏ"] -= d["mới"]                        # its preset.json is new; close enough for a summary
    return out


def changelog_since(text, mine):
    """the CHANGELOG sections above the one for `mine` (newest first)"""
    out = []
    for block in re.split(r"(?m)^(?=## )", text):
        if block.startswith("## ") and (block.splitlines()[0].split() + ["", ""])[1] == mine: break     # "## 2.0.1 (date)": the version word itself (2.0.1 is not 2.0.10)
        if block.startswith("## "): out.append(block.rstrip())
    return out


def main():
    global I                                                   # reloaded after the pull (below)
    check_only = "--check" in sys.argv
    if check_only and "--quiet" in sys.argv: return quick()
    if not check_only and outside.sandboxed() and "--here" not in sys.argv:   # --check installs nothing: it stays in the chat
        return outside.handoff("update.bat", sys.argv[1:], "cap nhat")
    outside.tee()
    mine = I.version()
    print(f"Moworks Motion: bản đang có {mine} ({KIT})")
    if git("rev-parse", "--is-inside-work-tree") != "true":
        print("Kit này không cài bằng git clone nên không tự cập nhật được: tải bản mới từ GitHub, hoặc clone lại rồi chạy install.bat."); return 1
    br = git("rev-parse", "--abbrev-ref", "HEAD")              # a maintenance chat works on its own branch until its pull request is merged
    if br and br != "main": print("Kit đang bảo trì, vui lòng update lại sau."); return 1
    print("Đang hỏi GitHub ...");
    if git("fetch", "--quiet") is None: print("[LỖI] Không kết nối được GitHub (mạng, hoặc chưa đăng nhập git cho repo riêng)."); return 1
    up = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")
    if not up: print("[LỖI] Nhánh hiện tại không theo dõi nhánh nào trên GitHub (git branch -u origin/main)."); return 1
    newest = (git("show", f"{up}:engine/VERSION") or git("show", f"{up}:VERSION") or "?").strip()       # VERSION was in the root before 08/10
    behind = int(git("rev-list", "--count", f"HEAD..{up}") or 0)
    ahead = int(git("rev-list", "--count", f"{up}..HEAD") or 0)
    print(f"Bản mới nhất: {newest}" + ("" if behind else "  → đang ở bản mới nhất"))
    if not behind:
        I.skill_step(); I.root_step()
        print(f"Skill: {I.NOTES.get('skill', '')}"); return 0
    print(f"\n=== Thay đổi ({behind} lần cập nhật) ===")
    for sec in changelog_since(git("show", f"{up}:docs/CHANGELOG.md") or git("show", f"{up}:CHANGELOG.md") or "", mine): print(sec + "\n")
    lib = library_changes("HEAD", up)
    for kind, label in (("preset", "Mẫu chuyển động (presets)"), ("layout", "Mẫu layout")):
        d = lib.get(kind)
        if not d: continue
        print(f"{label}: {len(d['mới'])} mới, {len(d['sửa'])} sửa, {len(d['bỏ'])} bỏ")
        for what in ("mới", "sửa", "bỏ"):
            if d[what]: print(f"   {what}: " + ", ".join(sorted(d[what])))
    other = [l for l in (git("diff", "--stat", "--stat-width=100", "HEAD", up, "--", ".", ":!library/presets", ":!library/layouts") or "").splitlines()]
    if other: print(f"Phần khác: {other[-1].strip()}")
    mod = [l[3:] for l in (git("status", "--porcelain", "--untracked-files=no") or "").splitlines()]
    if mod: print(f"\nBạn có sửa {len(mod)} file trong kit ({', '.join(mod[:5])}{' ...' if len(mod) > 5 else ''}): nếu bản mới cũng sửa chúng, cập nhật sẽ dừng và không ghi đè.")
    if ahead: print(f"Máy này có {ahead} lần lưu chưa đẩy lên GitHub: cập nhật sẽ dừng nếu hai bên khác nhau.")
    if check_only: return 0
    if not I.ask(f"\nCập nhật lên {newest}?", True): print("Chưa cập nhật."); return 0
    req_changed = bool(git("diff", "--name-only", "HEAD", up, "--", "engine/requirements.txt", "engine/constraints.txt"))
    if git("pull", "--ff-only", "--quiet") is None:
        print("[LỖI] Không cập nhật được (file bạn sửa trùng với bản mới, hoặc lịch sử khác nhau). Chụp màn hình gửi Claude, đừng xoá gì."); return 1
    I = __import__("importlib").reload(I)                     # the steps below run the code just pulled, not the copy loaded at start
    print(f"\nĐã kéo bản {I.version()}.")
    ok = True
    steps = ([("python", I.packages)] if req_changed else []) + [("chromium", I.chromium_step), ("models", I.models_step),
                                                                 ("skill", I.skill_step), ("root", I.root_step)]
    for s, fn in steps:                                        # Chromium: a new Playwright needs its own; a no-op when it is there
        print(f"{I.NAMES[s]} ...")
        try: ok &= bool(fn())
        except Exception as e: I.note(s, f"[LỖI] {e}"); ok = False
    I.table([(I.NAMES[s], I.NOTES.get(s, "xong")) for s, _ in steps])
    print("\n" + ("XONG." if ok else "CÓ BƯỚC CHƯA XONG (dòng [LỖI] ở bảng trên)."))
    return 0 if ok else 1


if __name__ == "__main__":
    rc = 1
    try: rc = main()
    except SystemExit as e: rc = e.code if isinstance(e.code, int) else 1
    except BaseException:
        import traceback; traceback.print_exc()
    finally: outside.finish(rc)
    sys.exit(rc)
