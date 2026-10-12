"""kit.py ref: Moworks' own references (plan A3 extra, user 07/10/2026). The studio's past work is its look: when a brief asks for it, Claude
studies it before designing, so films stop looking like everyone else's AI output ("brief contagion"). Two drop folders right in library\\:

  library\\refs\\video\\   finished films (MP4, MOV...) -> how Moworks MOVES: pacing, transitions, camera, how text enters and leaves
  library\\refs\\image\\   layouts: images, PDF decks, folders of images -> how Moworks LAYS OUT: grid, type, colour, composition

  kit.py ref sync      everything new in both folders becomes a reference next to its source: <name>_ref\\ with frames\\ (a picture every
                       second of a film, every page of a PDF, every image; 640 px wide), sheet.png (up to 24 of them), ref.json, REF.md
                       (the notes Claude writes after looking); INDEX.md in each folder lists them
  kit.py ref add <file | folder> [--name "..."] [--length 1]   one source from anywhere (its reference goes into the folder of its kind)
  kit.py ref list      every reference, one line each

Only finished work is needed, never project files; the kit keeps small frames and notes (the source is not copied). Client work can be
under NDA: the references stay on this machine / Drive, never in the skill zip or any outside service."""
import json, re, subprocess, time, unicodedata
from pathlib import Path

LIB = Path(__file__).resolve().parent.parent / "library"
ROOTS = {"video": LIB / "refs" / "video", "image": LIB / "refs" / "image"}
IMG = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff")
VIDEO = (".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv")
SKIP = ("desktop.ini", "readme.md", "index.md")


def slug(s):
    s = unicodedata.normalize("NFD", s.replace("đ", "d").replace("Đ", "D"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-") or "ref"


def kind_of(src):
    src = Path(src)
    for k, r in ROOTS.items():
        try: src.resolve().relative_to(r.resolve()); return k
        except ValueError: pass
    return "video" if src.suffix.lower() in VIDEO else "image"


def add(src, name=None, every=1.0, say=print):
    from PIL import Image
    src = Path(src)
    if not src.exists(): raise SystemExit(f"no file or folder {src}")
    kind = kind_of(src)
    d = ROOTS[kind] / (slug(name or (src.stem if src.is_file() else src.name)) + "_ref")
    if (d / "ref.json").exists(): raise SystemExit(f"{d.name} already exists (pick another --name)")
    fr = d / "frames"; fr.mkdir(parents=True, exist_ok=True)
    info = {"name": name or (src.stem if src.is_file() else src.name), "kind": kind, "source": str(src), "added": time.strftime("%Y-%m-%d")}

    def thumb(im, out):
        im = im.convert("RGB"); im.thumbnail((640, 640)); im.save(out)
    if src.is_dir():
        files = sorted(f for f in src.rglob("*") if f.suffix.lower() in IMG)
        for i, f in enumerate(files, 1): thumb(Image.open(f), fr / f"f_{i:03d}.png")
        info["from"] = "images"
    elif src.suffix.lower() in IMG:
        thumb(Image.open(src), fr / "f_001.png"); info["from"] = "image"
    elif src.suffix.lower() == ".pdf":
        try: import pymupdf as fitz
        except ImportError: raise SystemExit("a PDF needs PyMuPDF (optional): ask the user, then python -m pip install pymupdf")
        for i, pg in enumerate(fitz.open(str(src)), 1):
            pm = pg.get_pixmap(dpi=72); thumb(Image.frombytes("RGB", (pm.width, pm.height), pm.samples), fr / f"f_{i:03d}.png")
        info["from"] = "pdf"
    else:
        import imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
        r = subprocess.run([ff, "-hide_banner", "-i", str(src)], capture_output=True, text=True, encoding="utf-8", errors="replace")
        m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
        info["duration"] = round(int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)), 2) if m else None
        subprocess.run([ff, "-v", "error", "-y", "-i", str(src), "-vf", f"fps=1/{every},scale=640:-2", str(fr / "f_%03d.png")], check=True)
        info["from"] = "video"; info["every"] = every
    frames = sorted(fr.glob("f_*.png")); info["count"] = len(frames)
    if not frames: raise SystemExit(f"{src.name}: no picture came out")
    pick = frames if len(frames) <= 24 else [frames[round(i * (len(frames) - 1) / 23)] for i in range(24)]
    ims = [Image.open(f) for f in pick]; tw = 320; th = round(tw * ims[0].height / ims[0].width); cols = min(6, len(ims)); rows = -(-len(ims) // cols)
    sheet = Image.new("RGB", (cols * (tw + 4) + 4, rows * (th + 4) + 4), "white")
    for i, im in enumerate(ims): sheet.paste(im.resize((tw, th)), (4 + (i % cols) * (tw + 4), 4 + (i // cols) * (th + 4)))
    sheet.save(d / "sheet.png")
    (d / "ref.json").write_text(json.dumps(info, ensure_ascii=False, indent=1), encoding="utf-8")
    what = ("pacing and scene length, transitions, camera moves, how text and graphics enter and leave, motion language (eases, energy), "
            "sound sync" if kind == "video" else "grid and margins, type (families, weights, sizes, case), palette (hex), composition, "
            "image treatment, texture")
    (d / "REF.md").write_text(f"# {info['name']}\n\n(Claude: look at sheet.png and frames/, then write the notes here: {what}; and what makes it Moworks.)\n",
                              encoding="utf-8")
    write_index(kind)
    say(f"{kind}: {d.name}, {len(frames)} frame(s) -> {d}")
    return d


def sync(every=1.0, say=print):
    """every film, PDF, image or image folder in library/refs/video and library/refs/image that has no reference yet"""
    out = []
    for kind, root in ROOTS.items():
        root.mkdir(parents=True, exist_ok=True)
        done = {json.loads(r.read_text(encoding="utf-8")).get("source") for r in root.glob("*_ref/ref.json")}
        for f in sorted(root.iterdir()):
            if f.name.lower() in SKIP or f.name.endswith("_ref") or str(f) in done: continue
            if f.is_file() and f.suffix.lower() not in VIDEO + IMG + (".pdf",): continue
            try: out.append(add(f, None, every, say))
            except SystemExit as e: say(f"  {f.name}: {e}")
    say(f"{len(out)} new reference(s)" + (": now look at each sheet.png and write its REF.md" if out else f" (drop work into {ROOTS['video']} or {ROOTS['image']})"))
    return out


def write_index(kind):
    root = ROOTS[kind]
    rows = [f"# Moworks {kind} references", "", "Made by `kit.py ref sync`. Claude reads them only when a brief asks (skill: `workflow/free-design.md`).", "",
            "| Reference | From | Frames | Notes |", "|---|---|---|---|"]
    for r in sorted(root.glob("*_ref/ref.json")):
        info = json.loads(r.read_text(encoding="utf-8"))
        lines = [l.strip() for l in (r.parent / "REF.md").read_text(encoding="utf-8").splitlines()[1:] if l.strip()] if (r.parent / "REF.md").exists() else []
        note = lines[0][:120] if lines and not lines[0].startswith("(Claude:") else "(chưa có ghi chú)"
        rows.append(f"| `{r.parent.name}` | {info.get('from')} | {info.get('count')} | {note} |")
    root.mkdir(parents=True, exist_ok=True)
    (root / "INDEX.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
    return rows[6:]


def listing(say=print):
    n = 0
    for kind in ROOTS:
        rows = write_index(kind); n += len(rows)
        for r in rows: say(f"{kind}: {r}")
    if not n: say(f"no reference yet: drop finished films into {ROOTS['video']} and layouts into {ROOTS['image']}, then kit.py ref sync")
