r"""kit.py publish-check: before anything goes to GitHub, what in the files git tracks could carry client or NDA material (roadmap step 7).
Read-only: it reports, it never changes or removes a file. Exit code 1 when it finds something to look at.

What it looks at (the files `git ls-files` lists: tracked + staged):
  path     a file from a folder that stays on this machine (brands\, library\refs\, engine\models\, "Mới nhập") is tracked (their README.md
           files are meant to be there)
  media    client-type files (audio, video, PSD / PSB, decks, PDF, AI) outside the kit's own asset folders: look at each one
  term     a word of a brand pack (its folder name, brand.json "name", font family names, product keys) or of the local deny list
           %USERPROFILE%\.aimotionkit\publish-deny.txt (one word or phrase a line, # comments; it stays on this machine)
  colour   a hex colour of a brand pack's palette (not black / white / greys) in a tracked text file
The studio's own pack (moworks) and the packs listed in %USERPROFILE%\.aimotionkit\publish-allow.txt (one folder name a line) are skipped.
A hit is not always a leak (the kit names a pack in its docs on purpose): the report is for the user to decide, file by file."""
import json, os, re, subprocess
from pathlib import Path

KEEP_LOCAL = ("brands/", "library/refs/", "engine/models/", "library/incoming/", "library/gallery/incoming/")
LOCAL_OK = ("readme.md",)
MEDIA = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".mov", ".mp4", ".webm", ".mkv", ".psd", ".psb", ".pptx", ".ppt", ".key", ".pdf", ".ai",
         ".indd", ".aep", ".prproj"}
MEDIA_OK = ("library/gallery/clips/", "library/gallery/demo-assets/", "library/presets/", "library/layouts/", "engine/vendor/",
            "engine/tests/fixtures/")
TEXT = {".py", ".js", ".mjs", ".html", ".css", ".json", ".md", ".txt", ".jsx", ".ps1", ".bat", ".svg", ".yml", ".yaml", ".csv"}
SKIP_TEXT = ("engine/vendor/", "library/gallery/data.js")      # third-party code; the gallery's data repeats the presets' own files


def _hexes(x, out):
    if isinstance(x, str):
        for h in re.findall(r"#[0-9A-Fa-f]{6}\b", x): out.add(h.upper())
    elif isinstance(x, dict):
        for k, v in x.items():
            if not str(k).startswith("_"): _hexes(v, out)
    elif isinstance(x, list):
        for v in x: _hexes(v, out)


def _grey(h):
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    return max(r, g, b) - min(r, g, b) <= 6


def _lines(f):
    try: return [l.strip() for l in f.read_text(encoding="utf-8").splitlines() if l.strip() and not l.strip().startswith("#")]
    except OSError: return []


def scan(kit, say=print):
    kit = Path(kit)
    r = subprocess.run(["git", "-C", str(kit), "ls-files", "-z"], capture_output=True)
    if r.returncode: raise SystemExit("publish-check: not a git checkout (git ls-files failed)")
    files = [f for f in r.stdout.decode("utf-8", "replace").split("\0") if f]
    home = Path(os.environ.get("USERPROFILE") or Path.home()) / ".aimotionkit"
    allow = {"moworks"} | {x.lower() for x in _lines(home / "publish-allow.txt")}
    terms, colours = {}, {}
    for pack in sorted((kit / "brands").iterdir()) if (kit / "brands").is_dir() else []:
        if not pack.is_dir() or pack.name.lower() in allow: continue
        terms[pack.name.lower()] = f"brand pack folder {pack.name}"
        bj = pack / "brand.json"
        if bj.exists():
            B = json.loads(bj.read_text(encoding="utf-8"))
            if isinstance(B.get("name"), str): terms[B["name"].lower()] = f"brands/{pack.name}/brand.json name"
            for role in (B.get("fonts") or {}).values():
                if isinstance(role, dict) and isinstance(role.get("css"), str): terms[role["css"].lower()] = f"brands/{pack.name} font"
            for k in (B.get("products") or {}):
                if not str(k).startswith("_"): terms[str(k).lower()] = f"brands/{pack.name} product"
            hx = set(); _hexes(B.get("color"), hx); _hexes(B.get("products"), hx)
            for h in hx:
                if not _grey(h): colours[h] = f"brands/{pack.name}/brand.json"
    for t in _lines(home / "publish-deny.txt"): terms[t.lower()] = "publish-deny.txt"
    found = []
    for f in files:
        low = f.lower()
        if low.startswith(KEEP_LOCAL) and not low.endswith(LOCAL_OK):
            found.append(("path", f, 0, "stays on this machine (.gitignore): git rm --cached it"))
        ext = os.path.splitext(low)[1]
        if ext in MEDIA and not low.startswith(MEDIA_OK):
            found.append(("media", f, 0, f"{ext} file: client material? look at it"))
        if ext not in TEXT or low.startswith(SKIP_TEXT): continue
        try: text = (kit / f).read_text(encoding="utf-8", errors="replace")
        except OSError: continue
        tl = text.lower()
        for term, why in terms.items():
            if term and term in tl:
                for n, line in enumerate(text.splitlines(), 1):
                    if re.search(r"(?<![a-z0-9])" + re.escape(term) + r"(?![a-z0-9])", line.lower()): found.append(("term", f, n, f"\"{term}\" ({why})"))
        for h, why in colours.items():
            if h.lower() in tl:
                for n, line in enumerate(text.splitlines(), 1):
                    if h.lower() in line.lower(): found.append(("colour", f, n, f"{h} ({why})"))
    by = {}
    for k, f, n, msg in found: by.setdefault(k, []).append((f, n, msg))
    say(f"publish-check: {len(files)} tracked files, {len(terms)} words and {len(colours)} colours from the brand packs"
        f" (skipped as the studio's own: {', '.join(sorted(allow))})")
    for k in ("path", "media"):
        L = by.get(k, [])
        say(f"  {k}: {len(L)}")
        for f, n, msg in L[:100]: say(f"    {f}  {msg}")
    for k in ("term", "colour"):                       # one line per word / colour: how many lines, in which files (most first)
        L = by.get(k, []); g = {}
        for f, n, msg in L: g.setdefault(msg, {}).setdefault(f, []).append(n)
        say(f"  {k}: {len(L)} line(s)")
        for w, fs in sorted(g.items(), key=lambda x: -sum(len(v) for v in x[1].values())):
            top = sorted(fs.items(), key=lambda y: -len(y[1]))
            say(f"    {w}: {sum(len(v) for v in fs.values())} line(s) in {len(fs)} file(s): "
                + ", ".join(f"{x} ({len(v)})" for x, v in top[:8]) + (" ..." if len(top) > 8 else ""))
    if not found: say("  nothing found: OK to publish")
    return found
