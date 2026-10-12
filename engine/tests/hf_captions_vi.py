"""The Vietnamese font set for HyperFrames' embedded captions (engine/vendor/hf-captions, as shipped): engine/vendor/hf-captions-vi.

HF's caption pages embed their fonts from modes/standard/fonts/fonts.css, made by its own build-fonts-css.cjs from files/<slug>-latin-<weight>-
<style>.woff2: Latin-only subsets, so a Vietnamese caption falls back to another font on every accented letter. The kit keeps HF's family names
(every theme and DNA, its compilers and checks stay as they are) and gives each face the glyphs of a Vietnamese-complete font from
engine/vendor/fonts/google: the family itself when its full font has Vietnamese, else the nearest one that has (SUB). This script writes

  engine/vendor/hf-captions-vi/files/<HF's file name>.woff2   the replacing faces (instanced at the weight, Latin + Vietnamese subset)
  engine/vendor/hf-captions-vi/char-widths.json               HF's assets/fonts/char-widths.json measured again over these faces (HF's method:
                                                              canvas measureText at 100 px in headless Chrome) with the Vietnamese letters added
  engine/vendor/hf-captions-vi/fonts.json                     which font stands in for which family

engine/intake/captions.py lays them over a working copy of the skill and runs HF's build-fonts-css.cjs there. Families no theme or DNA uses
(Bangers, Cinzel, Creepster, Monoton, Rajdhani, Saira Stencil One) keep HF's files.

  python engine/tests/hf_captions_vi.py          (needs fontTools + brotli, node, and the HyperFrames install: its Chrome and puppeteer-core)
"""
import json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ENGINE))
from common import node_exe, LOCAL

HF = ENGINE / "vendor" / "hf-captions"
OUT = ENGINE / "vendor" / "hf-captions-vi"
G = ENGINE / "vendor" / "fonts" / "google"

# HF family -> (kit font folder, file, variable?) ; same family when its full Google font has Vietnamese (checked with fontTools, 11/10/2026)
SUB = {
    "anton": ("Anton", "Anton-Regular.ttf"),
    "audiowide": ("Exo2", "Exo2[wght].ttf"),                        # wide techno display
    "baloo-2": ("Baloo2", "Baloo2[wght].ttf"),
    "bodoni-moda": ("PlayfairDisplay", "PlayfairDisplay[wght].ttf"),  # high-contrast didone
    "caveat": ("PatrickHand", "PatrickHand-Regular.ttf"),            # handwriting
    "chakra-petch": ("ChakraPetch", "ChakraPetch-{w}.ttf"),
    "cormorant-garamond": ("CormorantGaramond", "CormorantGaramond[wght].ttf"),
    "fredoka": ("Baloo2", "Baloo2[wght].ttf"),                       # rounded
    "inter": ("Inter", "Inter[opsz,wght].ttf"),
    "orbitron": ("ChakraPetch", "ChakraPetch-{w}.ttf"),              # squared techno
    "permanent-marker": ("SedgwickAveDisplay", "SedgwickAveDisplay-Regular.ttf"),   # marker / graffiti
    "press-start-2p": ("VT323", "VT323-Regular.ttf"),                # pixel
    "shippori-mincho": ("Newsreader", "Newsreader[opsz,wght].ttf"),  # book serif
    "sora": ("Lexend", "Lexend[wght].ttf"),                          # geometric sans
    "space-grotesk": ("SpaceGrotesk", "SpaceGrotesk[wght].ttf"),
    "special-elite": ("IBMPlexMono", "IBMPlexMono-{w}.ttf"),         # typewriter
    "teko": ("SairaCondensed", "SairaCondensed-{w}.ttf"),            # condensed display
    "vt323": ("VT323", "VT323-Regular.ttf"),
}
STATIC = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black"}
UNICODES = [*range(0x20, 0x7F), *range(0xA0, 0x180), *range(0x1EA0, 0x1F00), *range(0x300, 0x370), *range(0x2010, 0x2070), 0x20AB, 0x20AC]
VI = "ăâđêôơưĂÂĐÊÔƠƯàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵÀẢÃÁẠẰẲẴẮẶẦẨẪẤẬÈẺẼÉẸỀỂỄẾỆÌỈĨÍỊÒỎÕÓỌỒỔỖỐỘỜỞỠỚỢÙỦŨÚỤỪỬỮỨỰỲỶỸÝỴ"


def face(slug, weight, style):
    """the woff2 bytes standing in for HF's <slug>-latin-<weight>-<style>.woff2"""
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    from fontTools import subset
    d, name = SUB[slug]
    if style == "italic":                                             # HF has italics of Inter only (500, 600)
        name = name.replace("[opsz,wght]", "-Italic[opsz,wght]")
    src = G / d / name.replace("{w}", STATIC[weight])
    f = TTFont(src)
    if "fvar" in f:
        loc = {a.axisTag: a.defaultValue for a in f["fvar"].axes}
        ax = {a.axisTag: a for a in f["fvar"].axes}
        loc["wght"] = max(ax["wght"].minValue, min(ax["wght"].maxValue, weight))
        f = instancer.instantiateVariableFont(f, loc, updateFontNames=False)
    o = subset.Options(); o.flavor = "woff2"; o.layout_features = ["*"]; o.name_IDs = ["*"]; o.notdef_outline = True
    s = subset.Subsetter(o); s.populate(unicodes=UNICODES); s.subset(f)
    with tempfile.TemporaryDirectory() as t:
        p = Path(t) / "f.woff2"; f.flavor = "woff2"; f.save(p)
        return p.read_bytes(), f"{d}/{src.name}" + (f" @{weight}" if "{w}" not in name and "[" in name else "")


MEASURE = r"""
const fs = require("fs"), path = require("path");
const [,, puppeteerDir, chrome, css, famsJson, charsJson, out] = process.argv;
const puppeteer = require(puppeteerDir);
(async () => {
  const fams = JSON.parse(fs.readFileSync(famsJson, "utf8")), chars = JSON.parse(fs.readFileSync(charsJson, "utf8"));
  const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox"] });
  const pg = await b.newPage();
  await pg.setContent(`<style>${fs.readFileSync(css, "utf8")}</style><body></body>`);
  const res = await pg.evaluate(async (fams, chars) => {
    const r = {};
    for (const fam of fams) {
      await document.fonts.load(`100px '${fam}'`, chars.join(""));
      const c = document.createElement("canvas").getContext("2d"); c.font = `100px '${fam}'`;
      const m = c.measureText("Hg"), w = {};
      for (const ch of chars) w[ch] = +(c.measureText(ch === "&amp;" ? "&" : ch).width / 100).toFixed(4);   // HF's table keys "&" as "&amp;"
      r[fam] = { ascent: +(m.fontBoundingBoxAscent / 100).toFixed(2), descent: +(m.fontBoundingBoxDescent / 100).toFixed(2), widths: w };
    }
    return r;
  }, fams, chars);
  fs.writeFileSync(out, JSON.stringify(res));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
"""


def hf_install():
    base = LOCAL / "hyperframes"
    vers = sorted((d for d in base.iterdir() if (d / "node_modules" / "puppeteer-core").exists()), key=lambda d: [int(x) for x in re.findall(r"\d+", d.name)])
    chrome = sorted((Path.home() / ".cache" / "hyperframes" / "chrome").rglob("chrome-headless-shell.exe"))
    if not vers or not chrome: raise SystemExit("HyperFrames (its puppeteer-core and Chrome) is not installed: run install.bat")
    return vers[-1] / "node_modules" / "puppeteer-core", chrome[-1]


def main():
    files = sorted((HF / "modes" / "standard" / "fonts" / "files").glob("*.woff2"))
    if OUT.exists(): [f.unlink() for f in (OUT / "files").glob("*.woff2")] if (OUT / "files").exists() else None
    (OUT / "files").mkdir(parents=True, exist_ok=True)
    used = {}
    fam_of = dict(re.findall(r"""^\s*["']?([a-z0-9-]+)["']?:\s*"([^"]+)",""", (HF / "modes" / "standard" / "fonts" / "build-fonts-css.cjs").read_text(encoding="utf-8"), re.M))
    for f in files:
        m = re.match(r"^(.*)-latin-(\d+)-(normal|italic)\.woff2$", f.name)
        slug, w, st = m[1], int(m[2]), m[3]
        if slug not in SUB: continue
        data, src = face(slug, w, st)
        (OUT / "files" / f.name).write_bytes(data)
        # the AE port reads this: the page's CSS family (base64 inside the page) -> the kit font file AE uses (installed by install.bat)
        used[f.name] = {"css": fam_of[slug], "weight": w, "style": st, "font": src.split(" @")[0]}
        print(f"{f.name:42s} <- {src}  {len(data) // 1024} KB  ({fam_of[slug]})")
    # fonts.css of the merged set, by HF's own builder, in a scratch copy; then HF's char widths measured again over it
    with tempfile.TemporaryDirectory() as t:
        t = Path(t); fd = t / "fonts"; shutil.copytree(HF / "modes" / "standard" / "fonts", fd)
        for f in (OUT / "files").glob("*.woff2"): shutil.copy2(f, fd / "files" / f.name)
        subprocess.run([node_exe(), str(fd / "build-fonts-css.cjs")], check=True, capture_output=True)
        old = json.loads((HF / "assets" / "fonts" / "char-widths.json").read_text(encoding="utf-8"))
        fams = [k for k in old if k != "_meta"]
        chars = sorted(set(old[fams[0]]["widths"]) | set(VI))
        (t / "fams.json").write_text(json.dumps(fams), encoding="utf-8"); (t / "chars.json").write_text(json.dumps(chars, ensure_ascii=False), encoding="utf-8")
        (t / "measure.cjs").write_text(MEASURE, encoding="utf-8")
        pup, chrome = hf_install()
        subprocess.run([node_exe(), str(t / "measure.cjs"), str(pup), str(chrome), str(fd / "fonts.css"), str(t / "fams.json"), str(t / "chars.json"), str(t / "cw.json")], check=True)
        cw = json.loads((t / "cw.json").read_text(encoding="utf-8"))
    # a family that kept HF's faces must measure as HF measured it (the same method): a check of the measuring itself
    for fam in ("Bangers", "Cinzel"):
        d = max(abs(cw[fam]["widths"][c] - old[fam]["widths"][c]) for c in old[fam]["widths"])
        print(f"check {fam}: largest width difference to HF's own table {d:.4f} em")
    meta = ("Per-char advance widths (em @100px) + fontBoundingBox ascent/descent of the faces in the kit's Vietnamese fonts.css "
            "(engine/vendor/hf-captions-vi, made by engine/tests/hf_captions_vi.py): HF's table measured again the same way, with the "
            "Vietnamese letters added. " + old["_meta"])
    (OUT / "char-widths.json").write_text(json.dumps({"_meta": meta, **cw}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (OUT / "fonts.json").write_text(json.dumps({"about": "HF caption families drawn with Vietnamese-complete fonts (SIL OFL 1.1, engine/vendor/fonts/google/<folder>/OFL.txt); HF's file name -> its CSS family, weight, style and the kit font (engine/vendor/fonts/google/...) it was made from (engine/ae/port.py reads it)",
                                                "faces": used}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(used)} faces -> {OUT}")


if __name__ == "__main__":
    main()
