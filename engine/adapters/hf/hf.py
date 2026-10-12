"""HyperFrames versions for the kit (plan G8 installer + G9 updater). HyperFrames is NOT carried in the kit (user's decision): each machine
installs the version engine/hf_version.json names, under %USERPROFILE%\\.aimotionkit\\hyperframes\\<version>\\ (one folder per version).

  kit.py hf status              versions installed, the kit's current / previous, project pins
  kit.py hf install [version]   install a version (default: the kit's current) and smoke-test it
  kit.py hf test [version]      the smoke test only (about 1 min)
  kit.py hf update              newest version on npm -> install beside the others -> smoke test -> pass: becomes current (the old one is
                                kept as previous) / fail: removed, the kit stays on the old one. Films in progress keep their pinned version.
  kit.py hf rollback            current <- previous

Smoke test (all must pass): `hyperframes --version` answers; a small film (smoke/film.json) is built by the kit and passes `hyperframes lint`
(errors fail, warnings pass); `hyperframes preview` serves it (HTTP 200) so Studio works. Telemetry and HF's own update check stay off
(engine/policy.json env). Only registry.npmjs.org is contacted (version check + install)."""
import json, os, shutil, subprocess, sys, time, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENGINE = HERE.parent.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import LOCAL, say                 # noqa: E402

BASE = LOCAL / "hyperframes"
VF = ENGINE / "hf_version.json"
LOG = LOCAL / "logs" / "hf-update.log"
NOWIN = 0x08000000 if os.name == "nt" else 0


def vkey(v): return [int(x) for x in v.split(".") if x.isdigit()]
def env(): return dict(os.environ, **json.loads((ENGINE / "policy.json").read_text(encoding="utf-8"))["hyperframes_env"])
def state(): return json.loads(VF.read_text(encoding="utf-8"))
def save(s): VF.write_text(json.dumps(s, ensure_ascii=False, indent=2), encoding="utf-8")
def installed(): return sorted((d.name for d in BASE.iterdir() if (d / "node_modules" / ".bin").exists()), key=vkey) if BASE.exists() else []
def exe(ver): return BASE / ver / "node_modules" / ".bin" / ("hyperframes.cmd" if os.name == "nt" else "hyperframes")
def npm(): return shutil.which("npm.cmd" if os.name == "nt" else "npm") or shutil.which("npm")


def log(msg, quiet=False):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f: f.write(time.strftime("%Y-%m-%d %H:%M:%S ") + msg + "\n")
    if not quiet: say(msg)


def latest():
    """newest hyperframes version on npm (registry.npmjs.org, allowed by policy.json)"""
    with urllib.request.urlopen("https://registry.npmjs.org/hyperframes/latest", timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))["version"]


def install(ver, quiet=False):
    if exe(ver).exists(): log(f"HyperFrames {ver} already installed", quiet); return True
    if not npm(): log("npm not found: install Node.js LTS first (the kit installer does it)", quiet); return False
    d = BASE / ver; d.mkdir(parents=True, exist_ok=True)
    (d / "package.json").write_text(json.dumps({"name": f"aimk-hyperframes-{ver}", "private": True, "dependencies": {"hyperframes": ver}}), encoding="utf-8")
    log(f"installing HyperFrames {ver} into {d} (npm, about 100 MB)...", quiet)
    r = subprocess.run([npm(), "install", "--no-audit", "--no-fund", "--loglevel=error"], cwd=d, env=env(), capture_output=True, text=True,
                       encoding="utf-8", errors="replace", creationflags=NOWIN)
    if r.returncode != 0 or not exe(ver).exists():
        log(f"npm install failed: {(r.stderr or r.stdout)[-600:]}", quiet); return False
    subprocess.run([str(exe(ver)), "telemetry", "disable"], env=env(), capture_output=True, creationflags=NOWIN)
    return True


def smoke(ver, quiet=False):
    """about 1 minute: version, kit build + hf lint of a small film, preview server answers"""
    from build import build
    t0 = time.time(); x = str(exe(ver)); e = env()
    try:
        r = subprocess.run([x, "--version"], env=e, capture_output=True, text=True, timeout=60, creationflags=NOWIN)
        if ver not in (r.stdout or ""): return False, f"--version answered {r.stdout.strip()!r}"
        w = LOCAL / "work" / "hf-smoke"
        if w.exists(): shutil.rmtree(w, ignore_errors=True)
        (w / "assets" / "vendor").mkdir(parents=True); (w / "assets" / "fonts").mkdir(parents=True)
        shutil.copy2(HERE / "smoke" / "film.json", w / "film.json")
        shutil.copy2(ENGINE / "vendor" / "gsap" / "gsap.min.js", w / "assets" / "vendor" / "gsap.min.js")
        shutil.copy2(ENGINE / "vendor" / "fonts" / "RobotoFlex-var.woff2", w / "assets" / "fonts" / "RobotoFlex-var.woff2")
        build(w, say=lambda *a: None)
        r = subprocess.run([x, "lint", str(w)], env=e, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120, creationflags=NOWIN)
        out = (r.stdout or "") + (r.stderr or "")
        if r.returncode != 0 and "error" in out.lower(): return False, "lint: " + out[-400:]
        from render.serve import free_port
        port = free_port()
        srv = subprocess.Popen([x, "preview", str(w), "--port", str(port), "--no-open", "--foreground"], env=e, stdout=subprocess.DEVNULL,
                               stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, creationflags=NOWIN)
        ok = False
        try:
            for _ in range(90):
                try: urllib.request.urlopen(f"http://localhost:{port}", timeout=1); ok = True; break
                except Exception:
                    if srv.poll() is not None: break
                    time.sleep(0.5)
        finally:
            subprocess.run(["taskkill", "/PID", str(srv.pid), "/T", "/F"], capture_output=True, creationflags=NOWIN) if os.name == "nt" else srv.kill()
        if not ok: return False, "preview server did not answer"
        return True, f"ok in {time.time() - t0:.0f} s"
    except Exception as ex:
        return False, f"{type(ex).__name__}: {ex}"


def update(quiet=False):
    s = state(); cur = s.get("current")
    s["checked"] = time.strftime("%Y-%m-%d %H:%M"); save(s)
    try: new = latest()
    except Exception as ex: log(f"update check failed (offline?): {ex}", quiet); return cur
    if cur and vkey(new) <= vkey(cur): log(f"HyperFrames {cur} is the newest ({new} on npm)", quiet); return cur
    if not install(new, quiet): return cur
    ok, why = smoke(new, quiet)
    if not ok:
        log(f"HyperFrames {new} FAILED the smoke test ({why}): removed, the kit stays on {cur}", quiet)
        shutil.rmtree(BASE / new, ignore_errors=True)
        s = state(); s.setdefault("rejected", {})[new] = why[:300]; save(s)
        return cur
    s = state(); s.update(previous=cur, current=new, tested=f"{time.strftime('%Y-%m-%d')}: smoke test {why}"); save(s)
    log(f"HyperFrames updated {cur} -> {new} (smoke test {why}); previous {cur} kept for rollback and for projects pinned to it", quiet)
    return new


def rollback():
    s = state()
    if not s.get("previous"): raise SystemExit("no previous HyperFrames version to roll back to")
    s["current"], s["previous"] = s["previous"], s["current"]; save(s)
    say(f"HyperFrames current = {s['current']} (was {s['previous']})")


# ---------------------------------------------------------------- projects keep their version
def pin_file(project):
    """qa/hf.json (07/10/2026: the project root keeps only the film and its folders); a project made before keeps its root hf.json"""
    old = Path(project) / "hf.json"
    return old if old.exists() else Path(project) / "qa" / "hf.json"


def version_for(project=None):
    """the version a project uses: its pin when installed, else the kit's current (a new pin is written then)"""
    cur = state().get("current")
    if project:
        pf = pin_file(project)
        if pf.exists():
            v = json.loads(pf.read_text(encoding="utf-8")).get("version")
            if v and exe(v).exists(): return v
            if v: say(f"note: this project was made with HyperFrames {v}, which is not installed here; using {cur}")
        elif Path(project).exists() and cur:
            pf.parent.mkdir(parents=True, exist_ok=True); pf.write_text(json.dumps({"version": cur, "_about": "HyperFrames version this project uses (kit.py hf). Delete to follow the kit's current."}, indent=1), encoding="utf-8")
    return cur


def status():
    s = state()
    say(f"kit current: {s.get('current')}   previous: {s.get('previous')}   last check: {s.get('checked', '-')}")
    say(f"installed here ({BASE}): {', '.join(installed()) or 'none'}")
    if s.get("rejected"): say(f"rejected by the smoke test: {', '.join(s['rejected'])}")
    say("a film keeps the version it was made with in its qa/hf.json (films live in the job folders, so they are not listed here)")


def due(hours=24):
    """the daily background check is due"""
    c = state().get("checked")
    if not c: return True
    try: return time.time() - time.mktime(time.strptime(c, "%Y-%m-%d %H:%M")) > hours * 3600
    except Exception: return True
