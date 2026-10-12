"""Smoke test of the whole job flow a new chat follows (skill v2): kit.py new -> film.json (presets, a layout, a transition, a voice,
sound effects, an end card) -> build (+ lint) -> verify -> collide -> lint -> stills -> MOV (no blur) with its sound inside ->
the MP4 reuses its frames -> qa -> the review player loads it with its audio and its 3 export buttons (60 fps, 08/10/2026).
The film is made in a throw-away job folder (%USERPROFILE%\\.aimotionkit\\work\\smoke-job) with the 11/10/2026 layout (01_Brief, 02_Assets
for rounds and stills, 03_HTML, 04_Renders for MP4 / MOV on the first export), checked, then moved to the Recycle Bin.

python engine\\tests\\smoke_new_project.py   (from the kit root; prints PASS / FAIL per step)"""
import json, os, re, shutil, subprocess, sys, time
from pathlib import Path

KIT = Path(__file__).resolve().parents[2]                   # engine/tests/ -> the kit
PY = [sys.executable, "-B", str(KIT / "engine" / "kit.py")]
ENV = {**os.environ, "PYTHONIOENCODING": "utf-8"}
results = []


def step(name, args, ok=lambda out: True, timeout=900, rcs=(0,)):
    t0 = time.time()
    r = subprocess.run(PY + args, capture_output=True, text=True, encoding="utf-8", errors="replace", env=ENV, timeout=timeout)
    out = r.stdout + r.stderr
    good = r.returncode in rcs and ok(out)
    results.append((name, good, round(time.time() - t0, 1), "" if good else out.strip().splitlines()[-3:]))
    print(f"{'PASS' if good else 'FAIL'} {name} ({time.time() - t0:.1f} s)" + ("" if good else "\n   " + "\n   ".join(out.strip().splitlines()[-6:])), flush=True)
    return out


def main():
    job = Path(os.environ.get("USERPROFILE") or Path.home()) / ".aimotionkit" / "work" / "smoke-job"
    job.mkdir(parents=True, exist_ok=True)
    out = step("new", ["new", "_Smoke Test", "--aspect", "16:9", "--dir", str(job)])
    m = re.search(r"created (.+?)\s+\(", out)
    if not m: print("cannot find the new project"); return 1
    root = Path(m.group(1).strip()); p = root / "03_HTML"
    try:
        bat = (root / "1. Preview.bat").read_text(encoding="utf-8") if (root / "1. Preview.bat").exists() else ""
        results.append(("layout: 01_Brief, 02_Assets, 03_HTML, launcher reads kit-root.txt, no 04_Renders yet",
                        all((root / d).is_dir() for d in ("01_Brief", "02_Assets", "03_HTML")) and (p / "index.html").exists()
                        and "kit-root.txt" in bat and not (root / "04_Renders").exists() and not (p / "renders").exists(), 0, ""))
        (p / "audio" / "voice").mkdir(parents=True, exist_ok=True)
        shutil.copy2(KIT / "engine" / "tests" / "fixtures" / "voice" / "test_vo.wav", p / "audio" / "voice" / "vo.wav")
        (p / "audio" / "transcript").mkdir(parents=True, exist_ok=True)       # its kit.py transcribe result (Whisper itself takes about 1 min)
        shutil.copy2(KIT / "engine" / "tests" / "fixtures" / "voice" / "test_vo.words.json", p / "audio" / "transcript" / "vo.words.json")
        (p / "assets" / "logos").mkdir(parents=True, exist_ok=True)
        shutil.copy2(KIT / "engine" / "tests" / "fixtures" / "logo" / "moworks.svg", p / "assets" / "logos" / "moworks.svg")
        T = {"color": "#111", "font-weight": "760", "font-size": "120px", "white-space": "nowrap", "left": "140px", "top": "380px"}
        film = {"spec": "aimk-motionspec/0", "title": "Smoke test", "size": [1920, 1080], "brand": None, "background": "#f4f1ea",
                "scenes": [
                    {"id": "s1", "name": "Mở đầu", "duration": "auto", "hold": 1.0,
                     "elements": [{"id": "h1", "type": "text", "text": "Chuyển động rõ ràng", "style": T},
                                  {"id": "cap", "type": "box", "style": {"left": "0px", "top": "880px", "width": "1920px", "height": "120px", "font-size": "56px", "font-weight": "700"}}],
                     "motion": [{"preset": "text/mask-rise", "target": "h1", "at": 0.3},
                                {"preset": "text/captions", "target": "cap", "params": {"words": "voice", "accent": "#1d3fd8"}}],
                     "voice": {"src": "audio/voice/vo.wav", "at": 0.2, "duration": 6.0, "tail": 0.5},
                     "sfx": [{"at": 0.3, "name": "swoosh"}, {"at": {"word": "idea"}, "name": "pop"}]},
                    {"id": "s2", "name": "Số liệu", "duration": "auto", "hold": 1.2, "transition_in": {"preset": "transition/push", "duration": 0.6},
                     "elements": [{"id": "n1", "type": "text", "text": "2,450 khách hàng", "style": dict(T, top="420px")},
                                  {"id": "chat", "type": "box", "style": {"left": "1180px", "top": "60px", "width": "560px", "height": "960px"}}],
                     "motion": [{"preset": "house/count-up-text", "target": "n1", "at": 0.4, "params": {"sound": True}},
                                {"preset": "ui/chat-message", "target": "chat", "at": 0.6}]}],
                "audio": [{"id": "music", "src": "audio/voice/vo.wav", "at": 0, "trim": 30, "role": "music", "volume": 0.3}],
                "end_tag": {"logo": "assets/logos/moworks.svg", "bg": "#111", "width": 0.3, "duration": 1.5}}
        (p / "film.json").write_text(json.dumps(film, ensure_ascii=False, indent=1), encoding="utf-8")
        step("build (+ its lint), given the film's own folder", ["build", str(root)], lambda o: "built" in o and "lint:" in o)
        html = (p / "index.html").read_text(encoding="utf-8")
        results.append(("index.html has audio clips", html.count("<audio") >= 4, 0, ""))
        results.append(("voice words: captions + film.srt", "cap_cap0_w0" in html and (p / "audio" / "transcript" / "film.srt").exists(), 0, ""))
        step("verify", ["verify", str(p)])                                   # exits 1 when a BUG frame is found
        step("collide", ["collide", str(p)])                                 # exits 1 when text runs into text or a cut has a blank frame
        step("lint (v2)", ["lint", str(p)], lambda o: "lint:" in o)
        step("stills", ["stills", str(root), "1.0", "4.0", "9.0"], lambda o: True)
        results.append(("stills in 02_Assets/Stills/times", (root / "02_Assets" / "Stills" / "times" / "sheet.png").exists(), 0, ""))
        step("library", ["library", "chat"], lambda o: "ui/chat-message" in o)
        step("mov (no blur)", ["mov", str(p), "--no-blur", "--no-open", "--workers", "4"], lambda o: "MOV ->" in o, timeout=1800)
        movs = sorted((root / "04_Renders" / "MOV").glob(f"{root.name}_v1_60fps_*.mov"))   # 04_Renders/MOV/<film>_v1_60fps_<date-time>.mov, sound inside
        import imageio_ffmpeg
        probe = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-i", str(movs[-1])], capture_output=True, text=True,
                               encoding="utf-8", errors="replace").stderr if movs else ""
        results.append(("MOV with its sound inside, no stems folder", "Audio: pcm_s24le" in probe and not any((root / "04_Renders" / "MOV").glob("*_audio")), 0, ""))
        v1 = root / "02_Assets" / "Rounds" / "Film_v01"                 # 11/10/2026: every round in 02_Assets\Rounds, numbered per kind
        results.append(("the export saved version v1 as round Film_v01 (film + assets + files.json)", (v1 / "film" / "film.json").exists()
                        and (v1 / "film" / "index.html").exists() and (v1 / "files.json").exists() and (v1 / "film" / "assets" / "logos" / "moworks.svg").exists(), 0, ""))
        step("version (no change: stays v1)", ["version", str(root)], lambda o: ": v1 (no change" in o)
        step("mp4 (reuses the MOV's frames)", ["mp4", str(p), "--no-open"], lambda o: "no new render" in o and "encoded" in o, timeout=900)
        step("qa (reads the last render)", ["qa", str(p)], lambda o: "motion QA" in o, rcs=(0, 1))       # 1 = it found pops: still ran
        results.append(("mp4 file + EXPORTS.md", any((root / "04_Renders" / "MP4").glob("*_v1_60fps_*.mp4")) and (root / "04_Renders" / "EXPORTS.md").exists(), 0, ""))
        player_ok = player_check(root)
        results.append(("player loads film + audio + Export panel", player_ok, 0, ""))
    finally:
        try:
            subprocess.run(["powershell", "-NoProfile", "-Command",
                            f"Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory('{job}', 'OnlyErrorDialogs', 'SendToRecycleBin')"], check=False)
            print(f"job folder {job} moved to the Recycle Bin")
        except Exception as e:
            print("cleanup failed:", e)
    bad = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(bad)}/{len(results)} passed" + ("" if not bad else ": FAILED " + ", ".join(r[0] for r in bad)))
    return 1 if bad else 0


def player_check(p):
    import asyncio
    sys.path.insert(0, str(KIT / "engine")); sys.path.insert(0, str(KIT / "engine" / "player"))
    import player
    url, srv = player.serve(str(p), 8799)

    async def run():
        from playwright.async_api import async_playwright
        async with async_playwright() as pw:
            b = await pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
            pg = await b.new_page()
            await pg.goto(url)
            # the whole window waits while the film opens (09/10/2026: "#wait", often gone in a blink), then shows the film
            await pg.wait_for_function("document.getElementById('wait').style.display !== 'flex' && document.querySelectorAll('#scenes button').length > 0", timeout=90000)
            n = await pg.evaluate("document.querySelectorAll('#scenes button').length")
            mute = await pg.evaluate("document.getElementById('mute').style.display")
            exp = await pg.evaluate("document.querySelectorAll('#expBtns button').length")
            smooth = await pg.evaluate("!!document.querySelector('#menu .mi[data-m=smooth]')")   # in the ... menu (lean player, 11/10/2026)
            await b.close()
            return n, mute, exp, smooth
    try:
        n, mute, exp, smooth = asyncio.run(run())
        print(f"   player: {n} scene buttons, mute button {'shown' if mute == '' else 'hidden'}, {exp} export buttons, smooth playback {'yes' if smooth else 'no'}")
        return n == 3 and mute == "" and exp == 3 and smooth              # MP4 Export, MOV Export, Port to AE (08/10/2026); Phát mượt (09/10/2026)
    finally:
        srv.shutdown()


if __name__ == "__main__":
    sys.exit(main())
