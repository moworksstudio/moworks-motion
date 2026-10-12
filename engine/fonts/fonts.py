"""Font discovery shared by brand packs, PSD and PPTX intake (plan G3; v1 had two different copies in psd.py and ingest.py and both
skipped .ttc collections such as Cambria, Microsoft YaHei, Yu Gothic, Nirmala: audit section 6 #9-10).

find(family, weight=400, italic=False, extra_dirs=())  -> best match {path, index, family, style, weight, italic, ps} or None
vietnamese_missing(path, index=0)                      -> Vietnamese letters the font cannot draw ("" = full coverage)
Search order: extra_dirs (project assets/fonts, brand pack fonts), %WINDIR%\\Fonts, %LOCALAPPDATA%\\Microsoft\\Windows\\Fonts.
The index of every font file is cached in %USERPROFILE%\\.aimotionkit\\cache\\fonts.json (rebuilt when a file's size or date changes)."""
import json, os, sys
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import LOCAL                                # noqa: E402

VIETNAMESE = ("ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ"
              "àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ")
EXT = {".ttf", ".otf", ".ttc", ".otc"}
CACHE = LOCAL / "cache" / "fonts.json"


def adobe_dirs():
    """fonts activated from Adobe Fonts (Creative Cloud): %APPDATA%\\Adobe\\CoreSync\\plugins\\livetype\\r and \\w hold plain OpenType files
    named by number, no extension (\\e is encrypted). Test 4 (08/10/2026): Proxima Nova was there and kit.py font did not see it.
    Licence: Adobe Fonts are for this Adobe account; a copy in a project's assets\\fonts stays on this machine, never handed out."""
    base = Path(os.environ.get("APPDATA", "")) / "Adobe" / "CoreSync" / "plugins" / "livetype"
    return [d for d in (base / "r", base / "w") if d.is_dir()] if os.environ.get("APPDATA") else []


def system_dirs():
    d = [Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"]
    if os.environ.get("LOCALAPPDATA"): d.append(Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "Windows" / "Fonts")
    return [x for x in d if x.exists()] + adobe_dirs()


MAGIC = {b"OTTO": ".otf", b"\x00\x01\x00\x00": ".ttf", b"true": ".ttf", b"ttcf": ".ttc"}


def font_ext(p):
    """the font extension of a file: its own (.ttf / .otf / .ttc / .otc), or from its first bytes for Adobe's files without one; None = not a font"""
    p = Path(p)
    if p.suffix.lower() in EXT: return p.suffix.lower()
    if p.suffix or not p.is_file(): return None
    try:
        with open(p, "rb") as fh: return MAGIC.get(fh.read(4))
    except OSError: return None


def copy_name(p, ps=""):
    """the file name for a copy in assets\\fonts: Adobe's numbered files become <PostScript name>.otf"""
    p = Path(p)
    return p.name if p.suffix.lower() in EXT else f"{ps or p.name}{font_ext(p) or '.otf'}"


def _faces(path):
    from fontTools.ttLib import TTCollection, TTFont
    fonts = TTCollection(str(path), lazy=True).fonts if font_ext(path) in (".ttc", ".otc") else [TTFont(str(path), lazy=True)]
    out = []
    for i, f in enumerate(fonts):
        n = f["name"]
        get = lambda *ids: next((str(n.getDebugName(k)) for k in ids if n.getDebugName(k)), "")
        os2 = f["OS/2"] if "OS/2" in f else None
        out.append({"path": str(path), "index": i, "family": get(16, 1), "style": get(17, 2), "full": get(4), "ps": get(6),
                    "weight": int(os2.usWeightClass) if os2 else 400, "italic": bool(os2.fsSelection & 1) if os2 else "italic" in get(17, 2).lower()})
    return out


def index(dirs):
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    faces, changed = [], False
    for d in dirs:
        for p in Path(d).rglob("*"):
            if not font_ext(p): continue
            st = p.stat(); key = str(p); sig = f"{st.st_size}:{int(st.st_mtime)}"
            if cache.get(key, {}).get("sig") != sig:
                try: cache[key] = {"sig": sig, "faces": _faces(p)}
                except Exception as e: cache[key] = {"sig": sig, "faces": [], "error": str(e)[:120]}
                changed = True
            faces += cache[key]["faces"]
    if changed: CACHE.parent.mkdir(parents=True, exist_ok=True); CACHE.write_text(json.dumps(cache), encoding="utf-8")
    return faces


def find(family, weight=400, italic=False, extra_dirs=()):
    fam = family.strip().strip('"').lower()
    cands = [f for f in index(list(extra_dirs) + system_dirs()) if fam in (f["family"].lower(), f["full"].lower(), f["ps"].lower())
             or f["family"].lower().replace(" ", "") == fam.replace(" ", "")]
    if not cands: return None
    return min(cands, key=lambda f: (f["italic"] != italic, abs(f["weight"] - weight)))


def measure(text, family, size, weight=400, italic=False, tracking=0.0, extra_dirs=()):
    """width and height in px of one line of text set in a real font file (brand pack, project or installed), for film scripts that place
    text (test film 07/10/2026: a three-word line at 140 px was 1184 px wide; eyeballing put it off centre). Variable fonts get their weight.
    The browser shapes text slightly differently: allow about 1 %. -> (width, height, font file) or None"""
    from PIL import ImageFont
    m = find(family, weight, italic, extra_dirs)
    if not m: return None
    f = ImageFont.truetype(m["path"], size=max(1, round(size)), index=m["index"])
    try:
        axes = f.get_variation_axes()
        if axes: f.set_variation_by_axes([weight if (a.get("name") in (b"Weight", "Weight") or str(a.get("name")).lower().endswith("weight")) else a.get("default", a["minimum"]) for a in axes])
    except Exception: pass
    k = size / max(1, round(size))
    w = f.getlength(text) * k + tracking * max(0, len(text) - 1)
    l, t, r, b = f.getbbox(text)
    return round(w, 1), round((b - t) * k, 1), m["path"]


def vietnamese_missing(path, index_=0):
    from fontTools.ttLib import TTCollection, TTFont
    p = Path(path)
    f = TTCollection(str(p), lazy=True).fonts[index_] if p.suffix.lower() in (".ttc", ".otc") else TTFont(str(p), lazy=True)
    cmap = f.getBestCmap() or {}
    return "".join(ch for ch in VIETNAMESE if ord(ch) not in cmap)


if __name__ == "__main__":
    for fam in sys.argv[1:] or ["Arial"]:
        m = find(fam)
        if not m: print(f"{fam}: not found"); continue
        miss = vietnamese_missing(m["path"], m["index"])
        print(f"{fam}: {m['family']} {m['style']} ({m['weight']}) -> {m['path']}#{m['index']}  Vietnamese: {'full' if not miss else 'MISSING ' + miss}")
