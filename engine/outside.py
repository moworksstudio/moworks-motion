"""Installs that work from a chat too (user 10/10/2026: Claude cloned the kit and ran the installer from the chat; "lỡ user cài mọi thứ
từ chat thì app vẫn hoạt động trơn tru").

A command run from a Claude desktop chat writes every NEW %LOCALAPPDATA% / %APPDATA% folder and every HKCU value into the Claude app's
private copy (...\\Packages\\Claude_*\\LocalCache, SystemAppData\\Helium): the double-clicked player, After Effects and a terminal never see
them (2D rebuild test, 09/10/2026: Chromium and the fonts installed from the chat were missing outside). Measured 10/10/2026: a .bat opened
through explorer.exe runs as the Windows shell's child, outside that copy: a folder it made was in the real place, a HKCU value it wrote was
seen by every program, and it could not see what the chat had written. So install / update / uninstall hand themselves over:

  sandboxed()                    this process writes into the copy (one empty folder made in %LOCALAPPDATA% and looked for in the copy)
  handoff(bat, args, title)      <kit>\\<bat> args in its own console window outside the copy (questions are answered there); this process
                                 prints that window's log until it ends and returns its exit code
  hidden(cmd, timeout)           one command outside, no window; its output (doctor: the real font registry)
  tee() / finish(rc) / run(cmd)  the outside run's side: its output also into the log the chat reads, the exit code when it ends

Standard library only: install.py imports it before any package is installed."""
import os, subprocess, sys, time
from pathlib import Path

ENGINE = Path(__file__).resolve().parent
KIT = ENGINE.parent
sys.path.insert(0, str(ENGINE))
from common import claude_private                                     # noqa: E402

RUN = Path(os.environ.get("TEMP") or os.environ.get("TMP") or Path.home()) / "moworks-motion-run"   # an existing folder: the same file on both sides
_SB = None
_LOG = None


def sandboxed():
    """True when what this process makes in %LOCALAPPDATA% lands in the Claude app's private copy (checked once: an empty folder made,
    looked for in the copy, removed). A Claude Code terminal outside the desktop app, a double-click, macOS: False."""
    global _SB
    if _SB is None:
        _SB = False
        la = os.environ.get("LOCALAPPDATA")
        if os.name == "nt" and la and any((Path(la) / "Packages").glob("Claude_*")):
            p = Path(la) / f"aimk-probe-{os.getpid()}"
            try:
                p.mkdir(exist_ok=True); _SB = claude_private(p.name) is not None
            except Exception: pass
            finally:
                try: p.rmdir()
                except Exception: pass
    return _SB


def _q(a):
    return '"' + str(a).replace('"', "") + '"'


def _launch(path):
    """open a .bat / .vbs through the Windows shell (explorer.exe hands it to the running shell, which starts it outside the copy)"""
    subprocess.Popen(["explorer.exe", str(path)], close_fds=True)


def handoff(bat, args, title, say=print):
    """run <kit>\\<bat> <args> in a console window of its own, outside the app's copy; print its log here until it ends.
    Returns its exit code, or 1 when it never started (then the user double-clicks <bat> in the kit folder)."""
    RUN.mkdir(parents=True, exist_ok=True)
    tag = f"{Path(bat).stem}-{time.strftime('%Y%m%d-%H%M%S')}"
    log, done, launcher = RUN / f"{tag}.log", RUN / f"{tag}.done", RUN / f"{tag}.bat"
    lines = ["@echo off", "chcp 65001 >nul", f"title Moworks Motion - {title}", f'set "AIMK_LOG={log}"', f'set "AIMK_DONE={done}"',
             f'cd /d {_q(RUN)}', f"call {_q(KIT / bat)} " + " ".join(_q(a) for a in args)]   # not the kit: uninstall moves it to the bin
    launcher.write_text("\r\n".join(lines) + "\r\n", encoding="utf-8")
    say(f"Chạy {bat} trong một cửa sổ riêng ngoài app Claude (cài từ chat thì player và After Effects không thấy). Nhật ký: {log}\n")
    sys.stdout.flush()
    _launch(launcher)
    t0, pos, seen = time.time(), 0, False
    while True:
        if log.exists():
            seen = True
            with open(log, "rb") as f:
                f.seek(pos); chunk = f.read(); pos += len(chunk)
            if chunk: sys.stdout.write(chunk.decode("utf-8", "replace")); sys.stdout.flush()
        if done.exists():
            time.sleep(0.3)
            if log.exists():
                with open(log, "rb") as f: f.seek(pos); rest = f.read()
                if rest: sys.stdout.write(rest.decode("utf-8", "replace"))
            try: rc = int((done.read_text(encoding="utf-8").strip() or "1").split()[0])
            except Exception: rc = 1
            say(f"\n[cửa sổ riêng đã xong: mã {rc}]"); return rc
        if not seen and time.time() - t0 > 90:
            say(f"\nCửa sổ riêng chưa chạy sau 90 s (Windows chặn, hoặc cần cài Python trước). Bấm đúp {bat} trong thư mục kit ({KIT})."); return 1
        time.sleep(0.5)


def hidden(cmd, timeout=20):
    """run one command line outside the app's copy with no window (through a .vbs the shell opens); its output, or None when it did not
    run in time (Windows Script Host turned off by a policy, a slow machine)"""
    RUN.mkdir(parents=True, exist_ok=True)
    tag = f"q-{os.getpid()}-{int(time.time() * 1000)}"
    out, done, vbs = RUN / f"{tag}.txt", RUN / f"{tag}.done", RUN / f"{tag}.vbs"
    line = f'cmd /c {cmd} > "{out}" 2>&1 & echo ok> "{done}"'
    vbs.write_text('CreateObject("WScript.Shell").Run "' + line.replace('"', '""') + '", 0, False\r\n', encoding="utf-8")
    _launch(vbs)
    t0 = time.time()
    while time.time() - t0 < timeout:
        if done.exists():
            time.sleep(0.2)
            try: return out.read_text(encoding="utf-8", errors="replace") if out.exists() else ""
            finally:
                for f in (out, done, vbs): f.unlink(missing_ok=True)
        time.sleep(0.25)
    for f in (vbs, out, done): f.unlink(missing_ok=True)       # still running or never started: nothing to read
    return None


# ------------------------------------------------------------------ the outside run's side

class _Tee:
    def __init__(self, a, f): self.a, self.f = a, f
    def write(self, s):
        self.a.write(s); self.f.write(s); self.f.flush(); return len(s)
    def flush(self): self.a.flush(); self.f.flush()
    def __getattr__(self, k): return getattr(self.a, k)


def tee():
    """AIMK_LOG set (a handoff): everything printed also goes into that log, for the chat"""
    global _LOG
    p = os.environ.get("AIMK_LOG")
    if not p or _LOG: return
    _LOG = open(p, "a", encoding="utf-8")
    sys.stdout = _Tee(sys.stdout, _LOG); sys.stderr = _Tee(sys.stderr, _LOG)


def log_only(s):
    """a line for the log alone (the answer typed in the window: the console already shows it)"""
    if _LOG: _LOG.write(s); _LOG.flush()


def run(cmd, **kw):
    """a subprocess; under a handoff its output goes through print (window + log), else straight to the console. True when it worked"""
    if not _LOG: return subprocess.run(cmd, **kw).returncode == 0
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, **kw)
    for raw in iter(p.stdout.readline, b""):
        try: s = raw.decode("utf-8")
        except UnicodeDecodeError: s = raw.decode("mbcs" if os.name == "nt" else "latin-1", "replace")
        sys.stdout.write(s.replace("\r\n", "\n")); sys.stdout.flush()
    return p.wait() == 0


def finish(rc):
    """AIMK_DONE set (a handoff): the exit code, so the chat stops waiting"""
    p = os.environ.get("AIMK_DONE")
    if p:
        try: Path(p).write_text(f"{rc}\n", encoding="utf-8")
        except Exception: pass
    return rc
