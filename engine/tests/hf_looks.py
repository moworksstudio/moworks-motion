"""HyperFrames' frame presets (skills/hyperframes-creative/frame-presets, commit ba08acb, Apache-2.0) as public LOOK packs in
library/looks/<name>/, applied like a brand pack: `kit.py brand <film> <name>` (engine/brand.py looks in brands\\ first, then here).
A look is a starting design for a film with no brand: its colours, its type and the atoms its FRAME.md describes (grids, borders,
shadows, components). Written 11/10/2026 (user OK); re-running rewrites them.

Each look folder:
  FRAME.md, frame-showcase.html, caption-skin.html   as shipped (SHA-256 in brand.json "sources", checked by this script's --check)
  brand.json                                         the kit's pack format, made from FRAME.md's frontmatter: every colour; the darkest
                                                     = "black", the lightest = "white", the most saturated = the accent; the display and
                                                     reading families; a type scale from its headline / subhead / body / small roles
  (fonts)                                            brand.json "fonts" "dir": a folder of engine/vendor/fonts (google/<Family>, OFL,
                                                     Vietnamese complete), copied into the film by kit.py brand.
                                                     A family with no Vietnamese is swapped for the closest one that has it (SUB below,
                                                     written in brand.json "fonts" "_swapped"); FRAME.md keeps the original name

  python engine/tests/hf_looks.py           every look
  python engine/tests/hf_looks.py --check   the shipped files still match their SHA-256"""
import colorsys, hashlib, json, os, re, shutil, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import as_shipped                                         # noqa: E402

KIT = Path(__file__).resolve().parents[2]
COMMIT = "ba08acb1f506b06757bd77a7e7f491d412647fbd"
SRC = Path(os.environ["USERPROFILE"]) / ".aimotionkit" / "sources" / f"hf-skills-{COMMIT[:7]}" / "skills" / "hyperframes-creative" / "frame-presets"
OUT = KIT / "library" / "looks"
GF = KIT / "engine" / "vendor" / "fonts" / "google"
SHIPPED = ("FRAME.md", "frame-showcase.html", "caption-skin.html")
SUB = {"Instrument Serif": "Newsreader", "Libre Baskerville": "Source Serif 4", "Shrikhand": "Lobster", "Bodoni Moda": "Playfair Display",
       "DM Mono": "JetBrains Mono", "Bebas Neue": "Oswald", "Archivo Black": "Archivo", "Fredoka One": "Baloo 2", "Fredoka": "Baloo 2"}
ROLE = {"headline": ("headline", "section-headline", "section-header", "hero-title", "title", "display"),
        "subhead": ("subtitle", "subhead", "card-title", "lead", "column-title", "label-display"),
        "body": ("body",),
        "disclaimer": ("meta", "caption", "body-small", "mono-label", "label", "kicker", "section-label", "tag-upper")}


def frontmatter(md):
    """colors {key: hex} and typography {role: {fontFamily, cqw|px, weight...}} from FRAME.md (one role per line, flow mappings)"""
    fm = md.split("---")[1]
    colors = dict(re.findall(r'^\s{2}([\w-]+):\s*"(#[0-9A-Fa-f]{6})"', fm.split("typography:")[0], re.M))
    roles = {}
    for name, body in re.findall(r"^\s{2}([\w-]+):\s*\{([^}]*)\}", fm.split("typography:")[1].split("\nspacing:")[0], re.M):
        r = dict((k, v.strip().strip('"')) for k, v in re.findall(r"(\w+):\s*(\"[^\"]*\"|[^,]+)", body))
        roles[name] = r
    return colors, roles


def size(r):
    """the role's size at 1920 x 1080, px"""
    return float(r["cqw"]) * 19.2 if "cqw" in r else float(r.get("px", 0))


def font_files(fam):
    d = GF / fam.replace(" ", "")
    fs = sorted(f for f in d.glob("*.ttf"))
    if not fs: raise SystemExit(f"no font files for {fam} in {d}: run the font download first")
    upright = [f for f in fs if "Italic" not in f.name]
    return d, upright


def write(name):
    src = SRC / name
    md = (src / "FRAME.md").read_text(encoding="utf-8")
    colors, roles = frontmatter(md)
    pick = lambda keys: next((roles[k] for k in keys if k in roles and roles[k].get("fontFamily")), None)
    R = {k: pick(v) for k, v in ROLE.items()}
    if not R["body"]: R["body"] = min((r for r in roles.values() if r.get("fontFamily")), key=size)
    if not R["headline"]: R["headline"] = max((r for r in roles.values() if r.get("fontFamily")), key=size)
    R["subhead"] = R["subhead"] or R["headline"]; R["disclaimer"] = R["disclaimer"] or R["body"]
    H = size(R["headline"])
    head0, body0 = R["headline"]["fontFamily"], R["body"]["fontFamily"]
    head, body = SUB.get(head0, head0), SUB.get(body0, body0)
    d = OUT / name
    for x in (d.iterdir() if d.exists() else []):          # its generated files (the folder stays: Drive keeps a desktop.ini in it)
        if x.name.lower() != "desktop.ini": shutil.rmtree(x) if x.is_dir() else x.unlink()
    d.mkdir(parents=True, exist_ok=True)
    sums = {}
    for f in SHIPPED:
        if (src / f).exists():
            shutil.copy2(src / f, d / f); sums[f] = hashlib.sha256((src / f).read_bytes()).hexdigest()
    fonts = {}
    for role, fam in (("head", head), ("body", body)):
        fd, files = font_files(fam)
        ws = sorted({int(float(R[k].get("weight", 400))) for k in (("headline", "subhead") if role == "head" else ("body", "disclaimer"))} | {400, 700})
        named = {300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "ExtraBold"}
        by_w = {}
        for w in ws:                                    # a static family: its file of that weight; a variable one: its one file
            st = [f for f in files if f.stem.endswith("-" + named.get(w, "Regular"))]
            by_w[str(w)] = (st or [f for f in files if "[" in f.name] or files)[0].name
        fonts[role] = {"css": f"Look {fam}", "family": fam, "dir": "google/" + fam.replace(" ", ""), "files": by_w}
    fonts["_swapped"] = {a: SUB[a] for a in {head0, body0} if a in SUB}
    def sat(hx):
        r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5)); h, l, s = colorsys.rgb_to_hls(r, g, b); return s * (1 - abs(2 * l - 1))
    lum = lambda hx: sum(int(hx[i:i + 2], 16) * w for i, w in ((1, 0.2126), (3, 0.7152), (5, 0.0722)))
    keys = list(colors)
    acc = max(keys, key=lambda k: sat(colors[k]))
    B = {"_about": f"Public look '{name}' from HyperFrames' frame presets (FRAME.md here, as shipped). Made by engine/tests/hf_looks.py; the design rules beyond colours and type (grids, borders, shadows, components) are in FRAME.md.",
         "name": name, "look": True,
         "sources": {"repo": "heygen-com/hyperframes", "commit": COMMIT, "path": f"skills/hyperframes-creative/frame-presets/{name}/", "license": "Apache-2.0", "sha256": sums},
         "fonts": fonts,
         "type": {"scale": {"headlinePx1920": round(H, 1), "ratios": {k: round(size(R[k]) / H, 3) for k in ("headline", "subhead", "body", "disclaimer")}},
                  "roles": {"headline": {"family": "head", "weight": int(float(R["headline"].get("weight", 400)))},
                            "subhead": {"family": "head", "weight": int(float(R["subhead"].get("weight", 400))), "weightTwoLines": int(float(R["subhead"].get("weight", 400)))},
                            "body": {"family": "body", "weight": int(float(R["body"].get("weight", 400)))},
                            "disclaimer": {"family": "body", "weight": int(float(R["disclaimer"].get("weight", 400)))}}},
         "color": dict(colors, black=colors[min(keys, key=lambda k: lum(colors[k]))], white=colors[max(keys, key=lambda k: lum(colors[k]))]),
         "kit": {"accent": acc}}
    (d / "brand.json").write_text(json.dumps(B, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return name, head0 + (f" → {head}" if head != head0 else ""), body0 + (f" → {body}" if body != body0 else ""), acc


def check():
    bad = []
    for d in sorted(OUT.iterdir()) if OUT.exists() else []:
        if not (d / "brand.json").exists(): continue
        for f, h in json.loads((d / "brand.json").read_text(encoding="utf-8"))["sources"]["sha256"].items():
            if not as_shipped(d / f, h): bad.append(f"{d.name}/{f}")
    print("looks: every shipped file as shipped" if not bad else "NOT as shipped: " + ", ".join(bad))
    return 1 if bad else 0


if __name__ == "__main__":
    if "--check" in sys.argv: sys.exit(check())
    for n in sorted(p.name for p in SRC.iterdir() if (p / "FRAME.md").exists()):
        print(" | ".join(write(n)))
