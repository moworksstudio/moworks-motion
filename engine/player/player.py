"""Review player server (kit.py preview): serves the project folder, the player page at /__player/, and the film with the kit driver
injected (/index.html?aimk=...: the same timeline the MOV / MP4 exports render, no HyperFrames). Notes go to <project>/notes/feedback.md:

  # Ghi chú xem phim (feedback.md)
  - [2.40 s · Title] chữ vào nhanh quá   _(05/10 17:40)_

Claude reads feedback.md ("đọc feedback") and fixes every open note. The USER closes notes (user, 08/10/2026: "chỉ cần 2 tác vụ là done
hoặc delete; chưa ưng thì tao không mark"): every note in the player's list has [Done] (writes "- [x] [", the note dims; pressed again it
opens again) and [Xoá] (removes a note typed by mistake). Claude does not mark notes itself: an open note is still to fix.

Export panel (user 08/10/2026: "cần 3 nút only: MP4 Export, MOV Export và Port to AE"): [MP4 Export] (kit.py mp4) and [MOV Export]
(kit.py mov, ProRes 4444, alpha), both finished films with their sound inside (the stems come with Port to AE), Blur (MP4 off, MOV on) / 4K /
Trong suốt asked when the button is pressed and remembered per film (11/10/2026: no ticks under the buttons), and a save dialog that starts in 04_Renders\\MP4\\ or 04_Renders\\MOV\\; [Port to AE] (kit.py ae --run, After Effects open). There is no PNG
sequence export (kit.py frames removed 11/10/2026). One export at a time; the step it is on (Test 1 U9) and its progress from the command's own output; a cancel button
(the whole process tree); when it ends a short coloured line and the warnings as a list (Test 1 U11). The log stays open under the buttons
(user 09/10/2026: "để cái Nhật ký ... luôn mở để xem số lượng frame đã render") and every job's whole log is saved to qa/export-<kind>.log.
The save dialog (user 09/10/2026: "nhấn nút mp4 export ... ko có gì xảy ra, vài phút sau nó mới popup lên 1 đống thông báo"): this server is
a background process, so Windows opened its dialog BEHIND the player's window; every new click waited for the hidden one. Now the dialog is
brought to the front (_front), a second one is refused while one is open, and the page covers itself while the dialog is up.
Smooth playback (user 09/10/2026: "render đc nhẹ nhàng trên laptop"): [Phát mượt] plays a small video of the film (kit.py proxy, a job like
an export, in the work folder) while the film runs, and the live film when stopped or scrubbed:
  /__api/proxy     {ok, fresh, made}: the video exists / shows the film as it is now
  /__api/pv        the video itself (Range requests, no file extension, an octet-stream type: download managers leave it alone)
Versions (user 10/10/2026: "player để duyệt các version video"): every film round Claude sent (common.rounds) can be watched again.
The lean flow (user 11/10/2026: "flow này rườm rà phức tạp quá"): design rounds (storyboard, asset sheets) are reviewed in the chat, not
here; the page reloads the film by itself when it changes; the export options are asked when an export starts:
  /__api/rounds    the film rounds in order, the older layout's versions, whether the working film moved on
  /__round/<R>/... a round's file as the user saw it (common.round_file; a film round's index.html?aimk=... gets the driver)
  /__api/info      also the number of rounds (the version list) and film = common.film_hash (the page reloads when it changes)
  /__api/prefs     the export options chosen last for this film (Blur / 4K / Trong suốt), qa/player.json
Notes carry the version they were written on ("- [ ] [v2 · 3.40 s · Scene] ...").
QA and lyrics (user 07/10/2026 after the A/B test, P0-1: "player của engine thêm lề an toàn 16:9 và QA giống player này"):
  /__api/qa.js     the JS of kit.py collide (engine/qa/collide.py), run by the page on the frame you look at: red boxes with Khung QA
                   (the Kiểm lỗi tab and its whole-film scan were dropped, user 10/10/2026: Claude runs kit.py collide)
  /__api/media     a film's audio file by its path, with no file extension in the URL and a text/plain type: the page decodes it for its
                   WebAudio clock, and download managers (IDM) do not grab it (the plain-prompt test lost three rounds to that)
  /__api/lyrics    the song's lyric lines (audio/transcript/<song>.words.json, else brief/lyrics.txt) and the taps saved before
  POST /__api/taps line starts tapped by ear in the page's lyric mode -> notes/lyric-taps.json (kit.py align uses them as --pin)"""
import collections, functools, json, os, re, subprocess, sys, threading, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENGINE = HERE.parent
# a note: "- [ ] [v2 · 2.40 s · Scene] text   _(10/10 14:20)_" (v2: the version it was written on, 10/10/2026; older notes have none)
NOTE = re.compile(r"^- (?:\[([ xX!])\] )?\[(?:(v\d+) · )?(\d+(?:\.\d+)?) s(?: · ([^\]]*))?\] (.*?)(?:\s+_\([^)]*\)_)?\s*$")
MARK = {"open": "[ ] ", "done": "[x] "}                   # open "- [ ] [" (09/10/2026: an explicit box; a line with no box, or the "- [!] ["
HIDE = 0x08000000 if os.name == "nt" else 0          # CREATE_NO_WINDOW
PY = sys.executable.replace("pythonw.exe", "python.exe")
KINDS = {"mp4": "MP4 Export", "mov": "MOV Export", "ae": "Port to AE", "proxy": "Bản phát mượt"}
# the steps of each job, found in its output (newest matching line wins): (pattern, step number, step name); progress "i/n" from the line
STEPS = {
    "mp4": (3, [(r"encod", 3, "Mã hoá MP4"), (r"no new render", 3, "Mã hoá MP4"), (r"^Audio:", 2, "Trộn tiếng"), (r"frames in ", 2, "Trộn tiếng"),
                (r"\d+/\d+ frames", 1, "Render khung")]),
    "mov": (3, [(r"encod|^  audio:", 3, "Mã hoá MOV"), (r"no new render", 3, "Mã hoá MOV"), (r"^Audio:", 2, "Trộn tiếng"), (r"frames in ", 2, "Trộn tiếng"),
                (r"\d+/\d+ frames", 1, "Render khung")]),
    # every long part of the port has its own step and progress (11/10/2026 test: 24 min of pictures and the keyframes showed
    # "bước 1/4: Ghi chuyển động" with no line, the user thought it had frozen)
    "ae": (6, [(r"copied to ", 6, "Chép vào 05_AE"), (r"^  AE:|^  check ", 5, "So khung AE với trình duyệt"),
               (r"^  data: |^  note: |^  AE build", 4, "Dựng trong After Effects"), (r"^  keyframes", 3, "Tính keyframe"),
               (r"^  pictures", 2, "Hình động thành chuỗi ảnh"), (r"sampled \d+/\d+|recorded ", 1, "Ghi chuyển động")]),
    "proxy": (2, [(r"encod|scaling them down", 2, "Mã hoá"), (r"\d+/\d+ frames", 1, "Render khung")]),
}
FIRST = {"mp4": "Mở phim", "mov": "Mở phim", "ae": "Ghi chuyển động", "proxy": "Mở phim"}


class Job:
    """the one export that may run (kit.py mp4 / frames / ae as a child process); its output lines feed the progress"""
    lock = threading.Lock()
    cur = None
    asking = False                                         # a save dialog is open (one at a time)

    def __init__(self, kind, args, project):
        self.kind, self.project, self.lines, self.t0 = kind, project, collections.deque(maxlen=400), time.time()
        self.all = []                                      # the whole log -> qa/export-<kind>.log when the job ends
        self.rc, self.out, self.cancelled, self.t1, self.logf = None, None, False, None, None
        env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUNBUFFERED": "1"}
        self.proc = subprocess.Popen([PY, "-B", str(ENGINE / "kit.py")] + args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                                     text=True, encoding="utf-8", errors="replace", env=env, creationflags=HIDE)
        threading.Thread(target=self._read, daemon=True).start()

    def _read(self):
        for line in self.proc.stdout:
            line = line.rstrip()
            if not line: continue
            self.lines.append(line)
            if len(self.all) < 20000: self.all.append(line)
            m = re.search(r"(?:-> |copied to )(.+?)\s*$", line)
            if m and ("renders" in m.group(1).lower() or "05_ae" in m.group(1).lower() or m.group(1).endswith((".mp4", ".mov", ".aep"))): self.out = m.group(1).strip()
        self.rc = self.proc.wait(); self.t1 = time.time()
        try:                                               # for Claude: the panel's log is gone once the window closes
            f = Path(self.project) / "qa" / f"export-{self.kind}.log"; f.parent.mkdir(parents=True, exist_ok=True)
            head = f"# {KINDS.get(self.kind, self.kind)} · {time.strftime('%d/%m/%Y %H:%M', time.localtime(self.t0))} · " \
                   f"{round(self.t1 - self.t0)} s · exit {self.rc}{' (huỷ)' if self.cancelled else ''}\n"
            _write(f, head + "\n".join(self.all) + "\n"); self.logf = str(f)
        except Exception: pass

    def cancel(self):
        self.cancelled = True
        subprocess.run(["taskkill", "/PID", str(self.proc.pid), "/T", "/F"], capture_output=True, creationflags=HIDE)

    def step(self):
        """(step number, of how many, its name, done, total) from the newest line that names a step"""
        n, pats = STEPS.get(self.kind, (1, []))
        lines = list(self.lines)
        for line in reversed(lines):
            for pat, k, name in pats:
                if re.search(pat, line):
                    m = re.search(r"(\d+)/(\d+)", line)
                    return k, n, name, (int(m.group(1)) if m else 0), (int(m.group(2)) if m else 0)
        m = next((re.search(r"(\d+)/(\d+)", x) for x in reversed(lines) if re.search(r"\d+/\d+", x)), None)
        return 1, n, FIRST.get(self.kind, ""), (int(m.group(1)) if m else 0), (int(m.group(2)) if m else 0)

    def summary(self):
        """the end of a job in a few words, and its warnings (Test 1 U11: "✓ Port AE xong · 13 ph 28 s · 47 comp, 170 layer · 05_AE\\")"""
        L, bits, warn = list(self.lines), [], []
        for line in L:
            m = re.search(r"data: (\d+) comps .*?, (\d+) layers", line)
            if m: bits.append(f"{m.group(1)} comp, {m.group(2)} layer")
            m = re.search(r"encoded .*?: (\d+) MB", line)
            if m: bits.append(f"{int(m.group(1)) / 1000:.1f} GB" if int(m.group(1)) >= 1000 else f"{m.group(1)} MB")
            m = re.search(r"(\d+) collision run", line)
            if m: bits.append(f"{m.group(1)} chỗ đè")
            m = re.search(r"^  check ([\d.]+) s: ([\d.]+)% of pixels", line)
            if m and float(m.group(2)) > 3: warn.append(f"Khung {m.group(1)} s khác trình duyệt {m.group(2)} % (xem 05_AE hoặc nhờ Claude sửa trong AE)")
            if re.match(r"^\s*note: ", line): warn.append(line.split("note:", 1)[1].strip())
            if re.search(r"warning|ERROR|BUG", line): warn.append(line.strip())
        return bits, warn[:8]

    def state(self):
        k, n, name, done, total = self.step()
        st = {"busy": self.rc is None, "kind": self.kind, "label": KINDS.get(self.kind, self.kind), "step": k, "steps": n, "phase": name,
              "done": done, "total": total, "elapsed": round((self.t1 or time.time()) - self.t0), "rc": self.rc, "cancelled": self.cancelled, "out": self.out,
              "lines": list(self.lines)[-60:], "log": self.logf}
        if self.rc is not None: st["bits"], st["warn"] = self.summary()
        return st


def _front(title, done):
    """bring the save dialog called `title` (this process's) to the front. Windows does not let a background process take the focus: the
    dialog opened behind the player's window and the user saw nothing (09/10/2026). Joining the input of the window in front for a moment
    lets SetForegroundWindow work; the dialog is also made topmost so it stays above the player."""
    if os.name != "nt": return
    import ctypes
    from ctypes import wintypes
    u = ctypes.windll.user32
    u.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
    u.GetWindowThreadProcessId.restype = wintypes.DWORD
    found = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def each(h, _):
        pid = wintypes.DWORD()
        if u.IsWindowVisible(h) and u.GetWindowThreadProcessId(h, ctypes.byref(pid)) and pid.value == os.getpid():
            n = u.GetWindowTextLengthW(h); b = ctypes.create_unicode_buffer(n + 1); u.GetWindowTextW(h, b, n + 1)
            if b.value == title: found.append(h); return False
        return True
    t0 = time.time()
    while time.time() - t0 < 15 and not done.is_set():
        found.clear(); u.EnumWindows(each, 0)
        if found:
            h, fg = found[0], u.GetForegroundWindow()
            if fg != h:
                me, other = u.GetWindowThreadProcessId(h, None), u.GetWindowThreadProcessId(fg, None)
                joined = bool(other and other != me and u.AttachThreadInput(me, other, True))
                u.SetWindowPos(h, -1, 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0040)      # HWND_TOPMOST, no move / size, show
                u.ShowWindow(h, 5); u.BringWindowToTop(h); u.SetForegroundWindow(h)
                if joined: u.AttachThreadInput(me, other, False)
            return
        time.sleep(0.05)


def ask_save(initialdir, initialfile, ext=".mp4", film=""):
    """the Windows save dialog (in front of the player), starting in 04_Renders\\MP4\\ (or mov) with a dated name; None = cancelled"""
    import tkinter as tk
    from tkinter import filedialog
    root = tk.Tk(); root.withdraw(); root.attributes("-topmost", True)
    kind = ext.strip(".").upper()
    title = f"Lưu {kind}" + (f" · {film}" if film else "")
    done = threading.Event(); threading.Thread(target=_front, args=(title, done), daemon=True).start()
    try:
        f = filedialog.asksaveasfilename(parent=root, title=title, initialdir=str(initialdir), initialfile=initialfile,
                                         defaultextension=ext, filetypes=[(kind, "*" + ext)])
    finally:
        done.set(); root.destroy()
    return f or None


def feedback_file(p):
    """notes/feedback.md (07/10/2026: notes, recap and feedback live in notes/); a project made before keeps its root feedback.md"""
    old = Path(p) / "feedback.md"
    return old if old.exists() else Path(p) / "notes" / "feedback.md"


LOCK = threading.Lock()                                # note writes (the page and Claude may touch feedback.md at the same time)
HEAD = ("# Ghi chú xem phim (feedback.md)\n\nGhi từ player (1. Preview.bat). Dòng còn mở: \"- [ ] [\". Bạn bấm Done khi đã ưng (dòng thành \"- [x] [\") hoặc Xoá dòng ghi "
        "nhầm. Claude: sửa mọi dòng còn mở (kit.py feedback <phim> in đúng các dòng đó), không tự đánh dấu xong.\n\n")


def read_notes(p):
    """every note with its state (open / done) and its line number in feedback.md (the id the page sends back)"""
    f = feedback_file(p)
    if not f.exists(): return []
    out = []
    for i, line in enumerate(f.read_text(encoding="utf-8").splitlines()):
        m = NOTE.match(line.strip())
        if m: out.append({"line": i, "ver": m.group(2) or "", "t": float(m.group(3)), "scene": m.group(4) or "", "text": m.group(5),
                          "state": "done" if (m.group(1) or "") in ("x", "X") else "open"})
    return out


def _write(f, text):
    for k in range(20):
        try: f.write_text(text, encoding="utf-8"); return True
        except PermissionError: time.sleep(0.25)              # Drive / an editor holding the file for a moment
    return False


def add_note(p, t, scene, text, ver=""):
    f = feedback_file(p); f.parent.mkdir(parents=True, exist_ok=True)
    ver = ver if re.fullmatch(r"v\d+", ver or "") else ""
    with LOCK:
        body = f.read_text(encoding="utf-8") if f.exists() else HEAD
        line = f"- [ ] [" + (f"{ver} · " if ver else "") + f"{t:.2f} s" + (f" · {scene}" if scene else "") + f"] {' '.join(text.split())}   _({time.strftime('%d/%m %H:%M')})_\n"
        return _write(f, body + ("" if body.endswith("\n") else "\n") + line)


def edit_note(p, line, text, state=None, delete=False):
    """Done / open again (state) or Xoá (delete) for the note on that line of feedback.md; when Claude changed the file since the
    page read it, the note is found again by its text. -> True when written"""
    f = feedback_file(p)
    if not f.exists(): return False
    with LOCK:
        L = f.read_text(encoding="utf-8").splitlines(keepends=True)
        same = lambda i: 0 <= i < len(L) and (m := NOTE.match(L[i].strip())) and m.group(5) == text
        i = line if same(line) else next((j for j in range(len(L)) if same(j)), -1)
        if i < 0: return False
        if delete: del L[i]
        else:
            if state not in MARK: return False
            L[i] = re.sub(r"^- (?:\[[ xX!]\] )?\[", lambda _m: "- " + MARK[state] + "[", L[i], count=1)
        return _write(f, "".join(L))


def export(p, kind, blur=None, alpha=False, uhd=False):
    """start an export from the panel -> (json, http code); blur: the panel's tick (MP4 off, MOV on by default), alpha: MOV only"""
    if kind not in KINDS: return {"ok": False, "msg": "không rõ loại xuất"}, 400
    busy = lambda: {"ok": False, "msg": f"Đang chạy: {Job.cur.state()['label']}. Chờ xong hoặc bấm Huỷ."} if Job.cur and Job.cur.rc is None else None
    with Job.lock:                                         # the lock is never held while a dialog is open (a second click got stuck behind it)
        if busy(): return busy(), 409
        if Job.asking: return {"ok": False, "msg": "Hộp thoại chọn chỗ lưu đang mở: chọn chỗ lưu hoặc bấm Cancel trong hộp thoại đó."}, 409
        if kind in ("mp4", "mov"): Job.asking = True
    if kind in ("mp4", "mov"):
        try:
            sys.path.insert(0, str(ENGINE))
            from common import FPS, export_name, film_name, renders
            alpha = bool(alpha) and kind == "mov"
            blur = (kind == "mov") if blur is None else bool(blur)
            f = ask_save(renders(p, kind), export_name(p, f"{FPS}fps", "4K" if uhd else "", "alpha" if alpha else "") + "." + kind, "." + kind, film_name(p))
        finally: Job.asking = False
        if not f: return {"ok": False, "cancelled": True, "msg": "Đã huỷ chọn chỗ lưu."}, 200
        args = [kind, str(p), "--out", f, "--no-open"] + (["--blur"] if blur and kind == "mp4" else []) + \
               (["--no-blur"] if not blur and kind == "mov" else []) + (["--alpha"] if alpha else []) + (["--4k"] if uhd else [])
    elif kind == "proxy": args = ["proxy", str(p)]
    else: args = ["ae", str(p), "--run", "--check", "auto"]
    with Job.lock:
        if busy(): return busy(), 409
        Job.cur = Job(kind, args, p)
    return {"ok": True}, 200


def lyrics(p):
    """the lyric lines the lyric mode taps through: the aligned words grouped by line (their times as a hint), else the lyrics file"""
    sys.path.insert(0, str(ENGINE))
    lines, times = [], []
    for wf in sorted((p / "audio" / "transcript").glob("*.words.json")):
        try: W = json.loads(wf.read_text(encoding="utf-8"))
        except ValueError: continue
        if not W or "line" not in W[0]: continue
        by = {}
        for w in W: by.setdefault(w["line"], []).append(w)
        lines = [" ".join(x["text"] for x in by[k]) for k in sorted(by)]; times = [by[k][0].get("start") for k in sorted(by)]
        break
    if not lines:
        from common import brief_dir
        for f in [brief_dir(p) / "lyrics.txt", brief_dir(p) / "lyrics.md"]:
            if f.exists():
                from audio.align import lyric_lines, read_text
                lines = [" ".join(ws) for ws in lyric_lines(read_text(f))]; times = [None] * len(lines); break
    tf = p / "notes" / "lyric-taps.json"
    taps = json.loads(tf.read_text(encoding="utf-8")).get("taps", []) if tf.exists() else []
    return {"lines": lines, "aligned": times, "taps": taps}


def save_taps(p, taps):
    f = p / "notes" / "lyric-taps.json"; f.parent.mkdir(parents=True, exist_ok=True)
    clean = [round(float(t), 3) if t is not None else None for t in taps]
    pins = "; ".join(f"{i + 1}={t:.2f}" for i, t in enumerate(clean) if t is not None)
    f.write_text(json.dumps({"_about": "line starts tapped by ear in the player (lyric mode); kit.py align uses them as --pin", "taps": clean, "pin": pins},
                            ensure_ascii=False, indent=1), encoding="utf-8")
    return {"ok": True, "n": sum(1 for t in clean if t is not None), "pin": pins}


def rounds_info(p):
    """the player's version list (user 10/10/2026: "player để duyệt các version video"): the film rounds in order, the older layout's
    versions, and whether the working film moved on. Design rounds stay in the chat (lean flow, 11/10/2026)"""
    from common import announce, live_changed, rounds, versions
    out = [dict({k: r[k] for k in ("n", "name", "kind", "v", "date", "note", "base")}, label=announce(r)) for r in rounds(p) if r["kind"] == "film"]
    vs = versions(p)
    old = [k for k, d in vs if d.parent.name == "versions"]
    return {"rounds": out, "older": old, "latest": vs[-1][0] if vs else 0, "changed": live_changed(p) if vs else True}


def prefs_file(p):
    return p / "qa" / "player.json"


def read_prefs(p):
    try: return json.loads(prefs_file(p).read_text(encoding="utf-8"))
    except (OSError, ValueError): return {}


def save_prefs(p, d):
    """the export options last chosen for this film: {mp4: {blur, uhd}, mov: {blur, alpha, uhd}}"""
    clean = {k: {o: bool(v) for o, v in (d.get(k) or {}).items() if o in ("blur", "uhd", "alpha")} for k in ("mp4", "mov") if isinstance(d.get(k), dict)}
    f = prefs_file(p); f.parent.mkdir(parents=True, exist_ok=True)
    _write(f, json.dumps(clean, indent=1))
    return {"ok": True}


def serve(project, port=None):
    from render.serve import Quiet, Server, free_port
    from common import film_dir, film_hash, film_name, film_root, proxy_state, round_file, rounds, versions
    p = film_dir(Path(project).resolve())
    driver = (ENGINE / "runtime" / "driver.js").read_bytes()
    page = (HERE / "index.html").read_bytes()
    from urllib.parse import unquote

    def round_path(path):                                    # /__round/<Film_v03 | v2>/<file> -> the file as that round had it
        m = re.match(r"^/__round/([^/]+)/(.+)$", unquote(path.split("?")[0]))
        return round_file(p, m.group(1), m.group(2)) if m else None

    class H(Quiet):
        def translate_path(self, path):                     # /__api/pv = the smooth-playback video, served with Range like any file
            if path.split("?")[0] == "/__api/pv": return str(proxy_state(p)["file"])
            if path.startswith("/__round/"):                # a round's file, with Range too (a design round's videos)
                f = round_path(path); return str(f) if f else str(p / "__no_such_file__")
            return super().translate_path(path)

        def guess_type(self, path):
            return "application/octet-stream" if str(path).endswith("preview.mp4") else super().guess_type(path)

        def _send(self, body, ctype):
            self.send_response(200); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

        def do_GET(self):
            path = self.path.split("?")[0]
            if path in ("/__player/", "/__player/index.html"): return self._send(page, "text/html; charset=utf-8")
            if path == "/__aimk/driver.js": return self._send(driver, "text/javascript; charset=utf-8")
            if path == "/__api/notes": return self._send(json.dumps(read_notes(p), ensure_ascii=False).encode("utf-8"), "application/json")
            if path == "/__api/info":                      # polled every 4 s: the round folders' names and the film's fingerprint
                rs = [r for r in rounds(p) if r["kind"] == "film"]
                try: fh = film_hash(p)
                except OSError: fh = ""                     # a file being written right now: next time
                return self._send(json.dumps({"name": film_name(p), "version": (versions(p) or [(0, None)])[-1][0], "rounds": len(rs),
                                              "last": rs[-1]["name"] if rs else "", "film": fh}, ensure_ascii=False).encode("utf-8"), "application/json")
            if path == "/__api/prefs": return self._json(read_prefs(p))
            if path == "/__api/rounds": return self._send(json.dumps(rounds_info(p), ensure_ascii=False).encode("utf-8"), "application/json")
            if path.startswith("/__round/") and path.endswith("/index.html") and "aimk=" in self.path:
                f = round_path(path)
                if not f: self.send_error(404); return
                html = re.sub(r"(<head[^>]*>)", r'\1<script src="/__aimk/driver.js"></script>', f.read_text(encoding="utf-8"), count=1, flags=re.I)
                return self._send(html.encode("utf-8"), "text/html; charset=utf-8")
            if path == "/__api/export":
                j = Job.cur
                return self._send(json.dumps(j.state() if j else {"busy": False}, ensure_ascii=False).encode("utf-8"), "application/json")
            if path == "/__api/qa.js":
                sys.path.insert(0, str(ENGINE)); from qa.collide import JS
                return self._send(JS.encode("utf-8"), "text/javascript; charset=utf-8")
            if path == "/__api/lyrics": return self._send(json.dumps(lyrics(p), ensure_ascii=False).encode("utf-8"), "application/json")
            if path == "/__api/proxy":
                st = proxy_state(p)
                return self._send(json.dumps({"ok": st["json"] is not None, "fresh": st["fresh"], "made": (st["json"] or {}).get("made", "")}).encode("utf-8"), "application/json")
            if path == "/__api/pv":
                if not proxy_state(p)["file"].is_file(): self.send_error(404); return
                return super().do_GET()
            if path == "/__api/media":
                from urllib.parse import parse_qs, urlparse
                q = parse_qs(urlparse(self.path).query); rel = (q.get("f") or [""])[0]
                if q.get("r"):                             # a version being watched: its own sound files
                    f = round_file(p, q["r"][0], rel)
                    if not f: self.send_error(404); return
                    return self._send(f.read_bytes(), "text/plain")
                f = (p / rel).resolve()
                try: f.relative_to(p.resolve())
                except ValueError: self.send_error(403); return
                if not f.is_file(): self.send_error(404); return
                return self._send(f.read_bytes(), "text/plain")
            if path == "/index.html" and "aimk=" in self.path:
                html = (p / "index.html").read_text(encoding="utf-8")
                # the driver must run before the film's own scripts (it hooks gsap as it loads): first thing in <head>
                html = re.sub(r"(<head[^>]*>)", r'\1<script src="/__aimk/driver.js"></script>', html, count=1, flags=re.I)
                return self._send(html.encode("utf-8"), "text/html; charset=utf-8")
            return super().do_GET()

        def _json(self, d, code=200):
            body = json.dumps(d, ensure_ascii=False).encode("utf-8")
            self.send_response(code); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

        def do_POST(self):
            path = self.path.split("?")[0]
            n = int(self.headers.get("Content-Length", 0)); d = json.loads(self.rfile.read(n) or b"{}")
            if path == "/__api/note":
                ok = add_note(p, float(d.get("t", 0)), str(d.get("scene", "")), str(d.get("text", "")), str(d.get("ver", "")))
                return self._send(json.dumps({"ok": ok}).encode(), "application/json")
            if path == "/__api/note/edit":
                ok = edit_note(p, int(d.get("line", -1)), str(d.get("text", "")), d.get("state"), bool(d.get("delete")))
                return self._json({"ok": ok}, 200 if ok else 409)
            if path == "/__api/export":
                return self._json(*export(p, str(d.get("kind", "")), d.get("blur"), d.get("alpha"), bool(d.get("uhd"))))
            if path == "/__api/taps":
                return self._json(save_taps(p, d.get("taps") or []))
            if path == "/__api/prefs":
                return self._json(save_prefs(p, d))
            if path == "/__api/export/cancel":
                if Job.cur and Job.cur.rc is None: Job.cur.cancel()
                return self._json({"ok": True})
            if path == "/__api/open":                     # show an export in Explorer, or open a job's log (view) (only files inside this project)
                f = Path(str(d.get("path", ""))); f = f if f.is_absolute() else p / f
                mine = bool(Job.cur and Job.cur.out and f.resolve() == Path(Job.cur.out).resolve())   # an export saved outside the project
                try: f.resolve().relative_to(film_root(p.resolve()))              # 03_HTML and 04_Renders next to it
                except ValueError:
                    if not mine: return self._json({"ok": False}, 403)
                if f.exists() and d.get("view") and f.is_file() and f.suffix.lower() == ".log": os.startfile(str(f))   # the [Log] button
                elif f.exists(): subprocess.Popen(["explorer", "/select,", str(f)] if f.is_file() else ["explorer", str(f)])
                return self._json({"ok": f.exists()})
            self.send_error(404)

    if not port:                                          # the same port for the same project when it is free (a link that stays)
        import socket, zlib
        port = 5200 + zlib.crc32(str(p.resolve()).lower().encode()) % 300
        with socket.socket() as sk:
            if sk.connect_ex(("127.0.0.1", port)) == 0: port = free_port()
    srv = Server(("127.0.0.1", port), functools.partial(H, directory=str(p)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{port}/__player/", srv
