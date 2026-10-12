"""Brand packs (plan section 7): apply a pack to a project and check a film against it.

apply(project_dir, pack)  copies the pack fonts + logos into the project (assets/fonts/<pack>, assets/logos/<pack>) and writes
                          assets/brand.css for the film's canvas: @font-face, colour variables, the margin, type-role classes sized by the
                          pack's scale (brand.json "type": a headline size at 1920x1080 and the ratios of the other roles).
check(url, pack)          renders the film with the v2 driver and reports, for TEXT and LOGO elements only:
                          forbidden motion (blur/filter, skew, non-uniform or mirrored scale, letter-spacing growth), text colours outside
                          the pack palette, a lettermark shown mid-film, and (job rule) anything visible at frame 0.
What is particular to one brand lives in its pack, never here (09/10/2026: the code goes to GitHub): brand.json "kit" gives the accent
colour's key, the words that mark a logo, whether scripts are confidential, the end tag's width per frame shape and the guideline pages
quoted in the messages; "logoRule" (logos never move) and "jobRules" (frame 0 empty) switch those checks on.
Text element = has its own text. Lettermark element = <img>/<svg> whose src/class/id/data-brand mentions "lettermark" (07/10/2026: "logo" also matched
an official product logo, a false "lettermark mid-film"). film.json "brand_colors": ["#FF5A36", ...] = the film's campaign / product colours the pack
allows on type (product colour, main USP, campaign theme), accepted by the colour check.
Colour checks added 07/10/2026 (the A/B test film mixed its own colours and listed them in "brand_colors", so the old check passed them):
  - every "brand_colors" entry must be a colour of the pack (brand.json "color" and "products", every tone);
  - big backgrounds (the scene's own, panels over a quarter of the frame, their gradient stops) must be pack colours (within 6/255);
  - a text cluster (texts within half a line of each other) showing two accent colours at once (not black / white) is reported
    (one highlight colour; user 07/10/2026: one accent colour per visible text cluster).
brand.css sets the pack's text colour on #stage (the kit's default #111 made 63 colour reports on the test film)."""
import asyncio, json, re, shutil, sys
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
from common import KIT, brief_dir                       # noqa: E402

PACKS = KIT / "brands"
LOOKS = KIT / "library" / "looks"                       # public looks (HyperFrames' frame presets, engine/tests/hf_looks.py, 11/10/2026)


def folder(pack):
    """a client's pack in brands\\ first, else a public look in library\\looks\\ (same format, brand.json "look": true)"""
    return next((d / pack for d in (PACKS, LOOKS) if (d / pack / "brand.json").exists()), None)


def load(pack):
    p = folder(pack)
    if not p: raise SystemExit(f"no brand pack '{pack}' in {PACKS} and no look '{pack}' in {LOOKS}")
    return p, json.loads((p / "brand.json").read_text(encoding="utf-8"))


def kit_rules(B):
    """the pack's brand.json "kit" block with the kit's defaults for a pack that has none"""
    k = dict(B.get("kit") or {})
    k.setdefault("logoWords", ["logo", "lettermark"]); k.setdefault("confidential", False); k.setdefault("cite", {})
    return k


def accent(B):
    """the one highlight colour allowed on type: brand.json "kit" "accent" names its key in "color" (a hex or {"hex": ...})"""
    c = (B.get("color") or {}).get(kit_rules(B).get("accent") or "accent")
    return (c.get("hex") if isinstance(c, dict) else c) or B["color"]["black"]


def cite(B, key):
    """the guideline page a message quotes (brand.json "kit" "cite"), or "" """
    c = kit_rules(B)["cite"].get(key)
    return f" ({c})" if c else ""


def pack_of(spec):
    """(name, brand.json) of the film's pack, or (None, {}) when the film has none or the pack is not on this machine"""
    name = spec.get("brand")
    if not name or not folder(name): return None, {}
    return name, load(name)[1]


def canvas(index_html):
    """the film's frame: film.json "size" first (a film made by reframe has no index.html yet when its pack is applied again: that crashed,
    09/10/2026), else the built page, else 1920 x 1080"""
    fj = Path(index_html).with_name("film.json")
    if fj.exists():
        size = json.loads(fj.read_text(encoding="utf-8")).get("size")
        if isinstance(size, list) and len(size) == 2: return int(size[0]), int(size[1])
    if not Path(index_html).exists(): return 1920, 1080
    s = Path(index_html).read_text(encoding="utf-8")
    w = re.search(r'data-width="(\d+)"', s); h = re.search(r'data-height="(\d+)"', s)
    return (int(w.group(1)), int(h.group(1))) if w and h else (1920, 1080)


def css(B, pack, w, h):
    k = (w + h) / 3000.0
    sc = B["type"]["scale"]; H = sc["headlinePx1920"] * k; r = sc["ratios"]
    lines = [f"/* generated by engine/brand.py from {'library/looks' if B.get('look') else 'brands'}/{pack}/brand.json for {w}x{h}; do not edit by hand */"]
    for fam in ("head", "body"):
        f = B["fonts"][fam]
        for wt, file in f["files"].items():
            lines.append(f'@font-face{{font-family:"{f["css"]}";font-weight:{wt};src:url("fonts/{pack}/{Path(file).name}") format("truetype");font-display:block}}')
    C = B["color"]; head, body = B["fonts"]["head"]["css"], B["fonts"]["body"]["css"]
    lines.append(":root{" + f'--b-black:{C["black"]};--b-white:{C["white"]};--b-accent:{accent(B)};'
                 + f'--b-margin:{round((w + h) / 55)}px;--b-head:"{head}",sans-serif;--b-body:"{body}",sans-serif' + "}")
    base = "font-kerning:normal;font-variant-ligatures:none;font-feature-settings:\"liga\" 0,\"clig\" 0;letter-spacing:0"
    R = B["type"]["roles"]
    roles = [("b-headline", "head", R["headline"]["weight"], H * r["headline"], 1.04), ("b-subhead", "head", R["subhead"]["weight"], H * r["subhead"], 1.15),
             ("b-subhead-2l", "head", R["subhead"]["weightTwoLines"], H * r["subhead"], 1.15), ("b-body", "body", R["body"]["weight"], H * r["body"], 1.4),
             ("b-disclaimer", "body", R["disclaimer"]["weight"], H * r["disclaimer"], 1.35)]
    for cls, fam, wt, px, lh in roles:
        lines.append(f".{cls}{{font-family:var(--b-{fam});font-weight:{wt};font-size:{round(px)}px;line-height:{lh};{base}}}")
    lines.append(".b-accent{color:var(--b-accent)}")
    lines.append("body #stage{color:var(--b-black)}")    # the pack's text colour; body # beats the kit's own #stage rule (#111) wherever it sits
    return "\n".join(lines) + "\n", {c: round(px) for c, _, _, px, _ in roles}


def palette(B, tier2=True):
    """every colour of a pack: brand.json "color" and "products" (all tones), as upper-case hex -> where it comes from. tier2=False leaves
    out a product's "wallpaper" tones (backgrounds and graphics only, never type)"""
    out = {}
    def walk(x, path):
        if isinstance(x, str) and re.fullmatch(r"#[0-9A-Fa-f]{6}", x): out.setdefault(x.upper(), "/".join(path))
        elif isinstance(x, dict):
            for k, v in x.items():
                if not k.startswith("_") and (tier2 or k != "wallpaper"): walk(v, path + [k])
        elif isinstance(x, list):
            for v in x: walk(v, path)
    walk(B.get("color", {}), ["color"]); walk(B.get("products", {}), ["products"])
    return out


HUES = [  # colour words in a brief (Vietnamese and English) -> hue range in degrees; None = a neutral
    (("đỏ", "red"), (345, 15)), (("cam", "orange", "đào", "peach", "coral"), (12, 45)), (("vàng", "yellow", "gold"), (45, 70)),
    (("xanh lá", "xanh lục", "green", "lime", "mint"), (75, 165)), (("xanh dương", "xanh biển", "xanh da trời", "blue", "navy", "cyan"), (185, 250)),
    (("tím", "purple", "violet", "lavender", "lilac", "oải hương"), (250, 300)), (("hồng", "pink", "magenta", "rose"), (300, 345)),
    (("nâu", "brown"), (15, 40)), (("xám", "gray", "grey", "bạc", "silver"), None)]
FONTS = ("montserrat", "roboto", "inter", "helvetica", "arial", "poppins", "futura", "gotham", "be vietnam", "open sans", "lato", "sf pro",
         "nunito", "raleway", "oswald", "bebas", "playfair", "noto sans", "source sans", "manrope", "dm sans", "avenir", "proxima")


def _hsl(hx):
    import colorsys
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s, l


def brief_conflicts(text, B, pack):
    """what a brief asks that the pack's guideline does not allow (colours above all; user 08/10/2026: list them and ask the user which wins,
    brief or guideline, before the storyboard). A helper, not a judge: it quotes the line; Claude reads the brief too."""
    import unicodedata
    pal, pal1 = palette(B), palette(B, tier2=False)
    head = B["fonts"]["head"]["css"]; sc = B["type"]["scale"]; H = sc["headlinePx1920"]
    sizes = {k: round(H * r) for k, r in sc["ratios"].items()}
    out = []
    def hue_in(h, rg): a, b = rg; return a <= h <= b if a <= b else (h >= a or h <= b)
    def has_hue(rg, P): return [c for c in P if (lambda h, s, l: s > 0.15 and 0.12 < l < 0.93 and hue_in(h, rg))(*_hsl(c))]
    lines = unicodedata.normalize("NFC", text).splitlines()
    for n, raw in enumerate(lines, 1):
        low = raw.lower()
        if not low.strip(): continue
        snip = raw.strip()[:110]
        on_type = bool(re.search(r"\b(chữ|text|type|font|tiêu đề|headline|super|montage)\b", low))
        for hx in re.findall(r"#[0-9a-fA-F]{6}\b", raw):
            hx = hx.upper()
            if not _near(hx, pal): out.append((n, snip, f"{hx} is not a colour of the {pack} pack"))
            elif on_type and not _near(hx, pal1): out.append((n, snip, f"{hx} is a background colour of the pack (tier 2), not a type colour"))
        for words, rg in HUES:
            w = next((x for x in words if re.search(r"(?<![\w])" + re.escape(x) + r"(?![\w])", low)), None)
            if not w: continue
            if rg is None: continue                           # greys: the pack's black / white / product tones cover them; Claude judges
            if w == "cam" and not re.search(r"màu cam|cam\b.*màu|cam nhạt|cam đậm", low): continue   # "cam" = orange only as a colour word
            t1, t2 = has_hue(rg, pal1), has_hue(rg, pal)
            if not t2: out.append((n, snip, f"\"{w}\": the {pack} pack has no colour of that family (pack colours: notes.md \"Colours\")"))
            elif on_type and not t1: out.append((n, snip, f"\"{w}\" on text: the pack has it only as a background tone ({', '.join(t2[:3])}), not for type"))
        if re.search(r"gradient|chuyển màu|cầu vồng|rainbow", low) and on_type:
            out.append((n, snip, "gradient / rainbow type: the pack's type is black or white, one accent colour per text cluster"))
        if re.search(r"nhiều màu|đa màu|sặc sỡ|colorful|colourful|neon", low):
            out.append((n, snip, "\"many colours\": the pack allows only its own product / campaign colours, one accent per text cluster"))
        if re.search(r"in hoa|viết hoa|all caps|uppercase|toàn bộ hoa", low):
            out.append((n, snip, "capitals: the pack writes sentence case (ALL CAPS only for small digital eyebrows)"))
        f = next((x for x in FONTS if x in low), None)
        if f and head.lower() not in low: out.append((n, snip, f"font \"{f}\": the pack's type is {head} / {B['fonts']['body']['css']}"))
        for m in re.finditer(r"(\d{2,3})\s*(?:px|pt)\b", low):
            v = int(m.group(1))
            if re.search(r"chữ|size|cỡ|font|text|tiêu đề|headline", low) and not any(abs(v - s) <= max(2, 0.05 * s) for s in sizes.values()):
                out.append((n, snip, f"type size {v}px: the pack's scale at 1920x1080 is " + ", ".join(f"{k} {s}" for k, s in sizes.items())))
        mv = r"(chuyển động|animate|bay vào|bay ra|xoay|nảy|pulse|nhún|morph|biến hình|phóng to|thu nhỏ|lắc|rung)"
        lw = "(" + "|".join(re.escape(w) for w in kit_rules(B)["logoWords"]) + ")"      # the pack's logo words
        if B.get("logoRule") and re.search(lw + r"[^.|;:]{0,25}" + mv + r"|" + mv + r"[^.|;:]{0,25}" + lw, low):
            out.append((n, snip, f"logo motion: {pack} logos never move (brand.json \"logoRule\")"))
    return out


def _near(hx, pal, tol=6):
    try: c = [int(hx[i:i + 2], 16) for i in (1, 3, 5)]
    except ValueError: return True
    return any(max(abs(c[i] - int(q[1 + 2 * i:3 + 2 * i], 16)) for i in range(3)) <= tol for q in pal)


def apply(project_dir, pack):
    p = Path(project_dir); src, B = load(pack)
    w, h = canvas(p / "index.html")
    fd, ld = p / "assets" / "fonts" / pack, p / "assets" / "logos" / pack
    fd.mkdir(parents=True, exist_ok=True); ld.mkdir(parents=True, exist_ok=True)
    for f in (src / "fonts").iterdir() if (src / "fonts").is_dir() else []: shutil.copy2(f, fd / f.name)
    for fam in ("head", "body"):                          # a look's families live once in engine/vendor/fonts (brand.json "fonts" "dir")
        dd = B["fonts"][fam].get("dir")
        for fn in set(B["fonts"][fam]["files"].values()) if dd else []: shutil.copy2(ENGINE / "vendor" / "fonts" / dd / fn, fd / fn)
    for f in (src / "logo").iterdir() if (src / "logo").is_dir() else []: shutil.copy2(f, ld / f.name)
    text, sizes = css(B, pack, w, h)
    (p / "assets" / "brand.css").write_text(text, encoding="utf-8")
    brief_dir(p).mkdir(parents=True, exist_ok=True)
    (brief_dir(p) / "brand.txt").write_text(f"brand pack: {pack}\nrules: {src.relative_to(KIT).as_posix()}/brand.json"
                                            + (" and FRAME.md (the look's design rules)\n" if B.get("look") else " and notes.md\n"), encoding="utf-8")
    return w, h, sizes


CHECK_JS = r"""([lettermarkWords, logoWords]) => {
  const A = window.__aimk, tl = A.timeline, out = { tweens: [], texts: [], logos: [], anyLogos: [], grooved: [] };
  const label = e => ((e.getAttribute && (e.getAttribute("src") || "")) + " " + (e.id || "") + " " + (typeof e.className === "string" ? e.className : "") + " " + ((e.dataset && e.dataset.brand) || "")).toLowerCase();
  const pic = e => e.tagName === "IMG" || e.tagName.toLowerCase() === "svg";
  const isLogo = e => pic(e) && lettermarkWords.some(w => label(e).includes(w));
  // any logo (the lettermark, a product logotype, a lockup): a picture from assets/logos/ or named with one of the pack's logo words
  const anyLogo = e => pic(e) && (/assets\/logos\//.test(e.getAttribute("src") || "") || logoWords.some(w => label(e).includes(w)) || (e.dataset && e.dataset.brand));
  const logos2 = [...document.querySelectorAll("#stage img, #stage svg")].filter(anyLogo);
  out.anyLogos = logos2.map(e => e.id ? "#" + e.id : e.tagName.toLowerCase());
  out.grooved = [...document.querySelectorAll("#stage [data-aimk-layer=groove]")].filter(g => logos2.some(l => g.contains(l))).map(g => "#" + g.id);
  const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const tag = e => e.id ? "#" + e.id : e.tagName.toLowerCase();
  const inside = (e, set) => set.some(x => x === e || x.contains(e) || e.contains(x));
  const texts = [...document.querySelectorAll("#stage *")].filter(hasText), logos = [...document.querySelectorAll("#stage img, #stage svg")].filter(isLogo);
  if (tl) for (const t of tl.getChildren(true, true, false)) {
    const v = Object.assign({}, t.vars.startAt || {}, t.vars), props = Object.keys(v).filter(k => !["ease","duration","onUpdate","immediateRender","repeat","yoyo","delay","startAt","overwrite"].includes(k));
    for (const x of t.targets()) if (x instanceof Element) {
      const box = x.id === "stage" || (x.classList && ["scene", "inner", "layer"].some(c => x.classList.contains(c)));   // a scene / layer moving as a whole
      const kind = inside(x, logos) || logos2.some(l => l === x || l.contains(x) || (x.contains(l) && !box)) ? "logo" : inside(x, texts) ? "text" : null; if (!kind) continue;
      out.tweens.push({ target: tag(x), kind, start: +t.startTime().toFixed(3), dur: +t.duration().toFixed(3), props, from: t.vars.startAt || null, to: Object.fromEntries(props.map(k => [k, typeof v[k] === "object" ? String(v[k]) : v[k]])) });
    }
  }
  const shown = e => { for (let p = e; p && p.id !== "stage"; p = p.parentElement) { const c = getComputedStyle(p); if (c.visibility === "hidden" || c.display === "none" || +c.opacity < 0.05) return false; } return true; };
  out.texts = texts.map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return { el: tag(e), color: cs.color, font: cs.fontFamily, text: e.textContent.trim().slice(0, 30), on: shown(e) && r.width > 0, box: [r.left, r.top, r.right, r.bottom], fs: parseFloat(cs.fontSize) || 20 }; });
  out.logos = logos.map(tag);
  // big painted backgrounds: the stage, scene roots and panels over a quarter of the frame (solid colour and gradient stops)
  const st = document.getElementById("stage"), S = st.getBoundingClientRect(), area = S.width * S.height;
  out.bgs = [];
  for (const e of [st, ...st.querySelectorAll("*")]) {
    if (e.tagName === "IMG" || e.tagName === "CANVAS" || e.tagName === "VIDEO" || !shown(e)) continue;
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    const w = Math.max(0, Math.min(r.right, S.right) - Math.max(r.left, S.left)), h = Math.max(0, Math.min(r.bottom, S.bottom) - Math.max(r.top, S.top));
    if (w * h < 0.25 * area) continue;
    const cols = [];
    if (!/rgba\([^)]*,\s*0(\.0+)?\)/.test(cs.backgroundColor) && cs.backgroundColor !== "transparent") cols.push(cs.backgroundColor);
    if (cs.backgroundImage && cs.backgroundImage.includes("gradient")) cols.push(...(cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []).filter(c => !/,\s*0(\.0+)?\)$/.test(c)));
    if (cols.length) out.bgs.push({ el: tag(e), cols });
  }
  return out;
}"""


def _hex(c):
    m = re.match(r"rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)", c)
    return ("#%02X%02X%02X" % tuple(int(x) for x in m.groups()[:3])) if m else c


async def _check(url, pack, extra_colors=(), motion_bans=False, squash_ids=()):
    """Logos: a pack with brand.json "logoRule" has logos that never move; any pack: no logo in the groove (user 08/10/2026). Text is free: the guideline's text-motion
    bans (glitch, stretch, blur, track-out...) are checked only when film.json "brand_motion_bans": true (the user asked for them in a job).
    squash_ids: targets of film.json "groove" parts with a "squash" (a non-uniform scale): reported when they hold text."""
    from playwright.async_api import async_playwright
    from render.browser import open_film
    _, B = load(pack)
    pal, pal1 = palette(B), palette(B, tier2=False)      # backgrounds may use tier 2 (a product's wallpaper tones); type only tier 1
    issues = [f"colour: film.json \"brand_colors\" {c.upper()} is not a type colour of the {pack} pack (product and campaign colours: "
              f"brands/{pack}/brand.json \"color\" / \"products\", notes.md \"Colours\"); a colour you mixed is not allowed on type"
              for c in extra_colors if c.upper() not in pal1]
    extra_colors = [c for c in extra_colors if c.upper() in pal1]
    K = kit_rules(B); acc_hex = accent(B); C = K["cite"]
    allowed_colors = {B["color"]["black"].upper(), B["color"]["white"].upper(), acc_hex.upper()} | {c.upper() for c in extra_colors}
    plain = {B["color"]["black"].upper(), B["color"]["white"].upper()}
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url)
        d = await pg.evaluate(CHECK_JS, [["lettermark"], K["logoWords"]])
        logo_seen, still = set(), bool(B.get("logoRule"))   # a pack whose logos never move says so in brand.json "logoRule"
        for tw in d["tweens"]:
            if tw["kind"] == "logo":
                moved = [k for k in tw["to"] if k not in ("visibility", "display", "zIndex")]
                if still and moved and tw.get("dur", 1) > 0 and (tw["target"], tuple(moved)) not in logo_seen:   # a set (0 s) is a cut: allowed
                    logo_seen.add((tw["target"], tuple(moved)))
                    issues.append(f"logo: {tw['target']} at {tw['start']} s animates {', '.join(moved)}; {pack} logos never move "
                                  "(brand.json \"logoRule\": they arrive and leave with their scene)")
                continue
            if not motion_bans: continue
            bad = []
            for k, v in tw["to"].items():
                if k in ("filter", "webkitFilter") and "blur" in str(v): bad.append("smudge/blur")
                if k in ("skewX", "skewY", "skew"): bad.append("skew")
                if k == "letterSpacing": bad.append("letter-spacing animated (track-out)")
                if k in ("scaleX", "scaleY") and "scale" not in tw["to"]: bad.append("non-uniform scale (stretch)")
                if k in ("scale", "scaleX", "scaleY") and isinstance(v, (int, float)) and v < 0: bad.append("mirrored (reflect)")
            for x in bad: issues.append(f"motion: {tw['kind']} {tw['target']} at {tw['start']} s uses {x} (forbidden for {pack} {tw['kind']}" + (f", {C['textEffects']}" if C.get("textEffects") else "") + ")")
        for g in d.get("grooved") or []:                  # any brand: a logo never pulses in the groove (SKILL.md rule 5)
            issues.append(f"logo: {g} makes a logo pulse with the groove; logos are never in the groove (take it out of film.json \"groove\")")
        if motion_bans and squash_ids:
            txt = await pg.evaluate("""ids => ids.filter(id => { const e = document.getElementById(id);
                return e && [e, ...e.querySelectorAll('*')].some(x => [...x.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())); })""", list(squash_ids))
            for t in txt: issues.append(f"motion: text #{t} is stretched by the groove (\"squash\": a non-uniform scale, a banned text effect): use \"scale\" / \"y\" on text")
        # colours at the settled end of every scene
        ends = [m[1] for m in info["markers"][1:]] + [info["duration"]]
        seen = set()
        for t in ends:
            await pg.evaluate(f"window.__aimk.seek({max(0, t - 0.05)})")
            dd = await pg.evaluate(CHECK_JS, [["lettermark"], K["logoWords"]])
            for bgx in dd.get("bgs") or []:                       # big backgrounds off the pack's palette
                for c in bgx["cols"]:
                    hx = _hex(c).upper()
                    if not _near(hx, pal) and (bgx["el"], hx) not in seen:
                        seen.add((bgx["el"], hx)); issues.append(f"background: {bgx['el']} uses {hx} near {t:.2f} s, not a colour of the {pack} pack "
                                                             "(backgrounds and graphics: product / campaign colours, black, white; notes.md \"Colours\")")
            vis = [x for x in dd["texts"] if x.get("on")]         # text clusters with two accent colours at once
            grp = list(range(len(vis)))
            def root(i):
                while grp[i] != i: grp[i] = grp[grp[i]]; i = grp[i]
                return i
            for i in range(len(vis)):
                for j in range(i + 1, len(vis)):
                    a, b2 = vis[i]["box"], vis[j]["box"]; m = 0.5 * min(vis[i]["fs"], vis[j]["fs"])
                    if a[0] - m <= b2[2] and b2[0] - m <= a[2] and a[1] - m <= b2[3] and b2[1] - m <= a[3]: grp[root(i)] = root(j)
            cl = {}
            for i, x in enumerate(vis): cl.setdefault(root(i), []).append(x)
            for xs in cl.values():
                acc = sorted({_hex(x["color"]).upper() for x in xs} - plain)
                key = ("cluster", tuple(sorted(x["el"] for x in xs)))
                if len(acc) >= 2 and key not in seen:
                    seen.add(key); issues.append(f"colour cluster: {', '.join(x['el'] for x in xs[:5])} near {t:.2f} s show {len(acc)} accent colours at once "
                                                 f"({', '.join(acc)}): one accent colour per visible text cluster{cite(B, 'typeColour')}")
            for x in dd["texts"]:
                hx = _hex(x["color"]).upper()
                if hx not in allowed_colors and (x["el"], hx) not in seen:
                    seen.add((x["el"], hx)); issues.append(f"colour: text {x['el']} '{x['text']}' is {hx}; {pack} text is black, white or {acc_hex}{cite(B, 'typeColour')}"
                                  + ("; a campaign / product colour goes in film.json \"brand_colors\"" + cite(B, "campaignColours") if not extra_colors else ""))
                if B["fonts"]["head"]["css"] not in x["font"] and B["fonts"]["body"]["css"] not in x["font"] and (x["el"], "font") not in seen:
                    seen.add((x["el"], "font")); issues.append(f"font: text {x['el']} uses {x['font']} (not {B['fonts']['head']['css']} / {B['fonts']['body']['css']})")
        # lettermark only in the first or the last scene
        if d["logos"] and len(info["markers"]) > 2:
            mids = [(info["markers"][i][1], info["markers"][i + 1][1]) for i in range(1, len(info["markers"]) - 1)]
            for a, z in mids:
                await pg.evaluate(f"window.__aimk.seek({(a + z) / 2})")
                vis = await pg.evaluate("ids => ids.filter(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); let p = e, v = true; while (p) { const c = getComputedStyle(p); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity === 0) v = false; p = p.parentElement; } return v && r.width > 0; })", d["logos"])
                for s in vis: issues.append(f"lettermark: {s} visible mid-film at {(a + z) / 2:.2f} s (only front tag / end tag" + (f", {C['midFilmLettermark']}" if C.get("midFilmLettermark") else "") + ")")
        if "jobRules" in B:                          # the pack's job rule: frame 0 shows nothing
            from render.browser import PAINT
            await pg.evaluate("window.__aimk.seek(0)"); await pg.evaluate(PAINT)
            st = await pg.query_selector(info["stage"]); png = await st.screenshot(type="png")
            import io
            import numpy as np
            from PIL import Image
            a = np.asarray(Image.open(io.BytesIO(png)).convert("RGB"), dtype=np.int16)
            bg = a[2, 2]; n = int((np.abs(a - bg).max(axis=2) > 8).sum())
            if n: issues.append(f"frame 0: {n} pixels differ from the background colour (job rule: frame 0 empty)")
        await b.close()
    return info, d, issues


def check(url, pack, extra_colors=(), motion_bans=False, squash_ids=()):
    return asyncio.run(_check(url, pack, extra_colors, motion_bans, squash_ids))
