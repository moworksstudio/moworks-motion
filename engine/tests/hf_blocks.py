"""Batch 2: HyperFrames registry BLOCKS (whole composition pages) as kit layouts that run the page AS SHIPPED in an iframe kept in step with
the film (ctx.hfFrame + engine/vendor/libs/hf/hf-frame.js). One table row per block (engine/tests/hf_blocks.json); this script writes
library/layouts/<group>/<name>/ (preset.js, preset.json, assets/<the block's files>). Re-running rewrites them.

  python engine/tests/hf_blocks.py            all rows
  python engine/tests/hf_blocks.py carousel   rows whose registry name contains the text

Row keys: name (<group>/<name> in the library), title_vi, desc_vi, kind ("blocks" | "components"), file (the page, when not the only
.html), replace ([[from, to], ...] on the page, demo and default), demo_vars (demo-only params, e.g. a replace that gives an overlay a
backdrop), defaults (params), bg (demo background), needs, notes, reload (a seek back reloads the page), seek_tolerance / bake_tolerance /
thumb_at (copied into demo), length (seconds: the page's own timeline when it is shorter than its data-duration), drop (taken out of the library: why),
vendor_files (kit files copied beside the page), fix ([[from, to], ...] always applied before the film's own replace, e.g. a font the
page names that has no Vietnamese), commit, skill, incoming (where the files come from and where the layout goes: engine/tests/hf_source.py), title / about / tags (a skill's
page has no registry-item.json), times (params holding block seconds, which take song references: preset.json "times", build.py)."""
import json, os, re, shutil, sys
from pathlib import Path

from hf_source import KIT, finish, dest, item_meta, sha256s, source

ROWS = json.loads((Path(__file__).with_name("hf_blocks.json")).read_text(encoding="utf-8"))
# CDN script -> the kit's vendored copy (engine/vendor/<path>, copied into the film at assets/vendor/<path>)
LIBS = {
    "https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js": "libs/three-0.147/three.min.js",
    "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js": "libs/d3.min.js",
    "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js": "libs/topojson-client.min.js",
    "https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie_light.min.js": "libs/lottie.min.js",
    "https://cdn.jsdelivr.net/npm/d3-delaunay@6.0.4/dist/d3-delaunay.min.js": "libs/d3.min.js",
    "https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js": "libs/clipper-lib/clipper.js",
}
PREFIX = {"https://cdn.jsdelivr.net/npm/three@0.181.2/": "libs/three-0.181.2/"}   # downloaded 06/10/2026 with the user's OK (wireframe-portal-title)
DATA = {"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json": "data/countries-110m.json",
        "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json": "data/us-atlas-states-10m.json",           # downloaded 06/10/2026 with the user's OK
        "https://cdn.jsdelivr.net/npm/es-atlas@0.6.0/es/autonomous_regions.json": "data/es-atlas-autonomous_regions.json"}


def write(reg, row):
    kind = row.get("kind", "blocks")                     # components: their demo page (a full composition) runs
    src, commit, path = source(row, kind, reg)
    meta = item_meta(src, reg, row)
    main = row.get("file") or next(f["path"] for f in meta["files"] if f["path"].endswith(".html") and Path(f["path"]).name != "demo.html")
    html = (src / main).read_text(encoding="utf-8")
    g = lambda rx, d: float(re.search(rx, html).group(1)) if re.search(rx, html) else d
    W, H, dur = int(g(r'data-width="(\d+)"', 1920)), int(g(r'data-height="(\d+)"', 1080)), g(r'data-duration="([\d.]+)"', row.get("duration", 6))
    if row.get("length"): dur = float(row["length"])    # the page's own timeline is shorter than its data-duration (the rest is black)
    name = row["name"]; group = name.split("/")[0]
    d, waiting, old = dest(name, row)
    for x in (d.iterdir() if d.exists() else []):          # its generated files (the folder stays: a shell may sit in it)
        shutil.rmtree(x) if x.is_dir() else x.unlink()
    (d / "assets").mkdir(parents=True, exist_ok=True)
    files, copied = [], []
    for f in sorted(src.iterdir()):
        if f.name in ("registry-item.json", "desktop.ini") or (f.name == "demo.html" and main != "demo.html"): continue
        if f.is_dir(): shutil.copytree(f, d / "assets" / f.name)
        else: shutil.copy2(f, d / "assets" / f.name)
        if f.name != Path(main).name: files.append(f.name)
        copied.append(f)
    extra = Path(os.environ.get("USERPROFILE") or Path.home()) / ".aimotionkit" / "sources" / "hf-registry-assets" / kind / reg     # its remote-only files, downloaded with the user's OK (MANIFEST.json)
    if extra.exists(): shutil.copytree(extra, d / "assets", dirs_exist_ok=True)
    for v in row.get("vendor_files") or []:              # kit files a row adds beside the page (e.g. a font with Vietnamese for one it lacks)
        shutil.copy2(KIT / "engine" / "vendor" / v, d / "assets" / Path(v).name); files.append(Path(v).name)
    libs, scripts, urls = {}, ["libs/hf/hf-frame.js"], {}
    for cdn, v in LIBS.items():
        if cdn in html:
            libs[cdn] = "assets/vendor/" + v
            if v not in scripts: scripts.append(v)
    for m in re.finditer(r"https://cdn\.jsdelivr\.net/npm/gsap@[^/\"']+/dist/(\w+)\.min\.js", html):   # GSAP plugins: the kit's copies
        if m.group(1) != "gsap":
            libs[m.group(0)] = f"assets/vendor/gsap/{m.group(1)}.min.js"
            if f"gsap/{m.group(1)}.min.js" not in scripts: scripts.append(f"gsap/{m.group(1)}.min.js")
    for m in re.finditer(r'src="((?:\.\./)+[^"]*?gsap\.min\.js)"', html): libs[m.group(1)] = "assets/vendor/gsap.min.js"   # a skill page's own GSAP copy: the film's
    for u, v in DATA.items():
        if u in html: shutil.copy2(KIT / "engine" / "vendor" / v, d / "assets" / Path(v).name); urls[u] = Path(v).name
    opts = {"size": [W, H], "libs": libs, "urls": urls, "files": [f for f in files if (d / "assets" / f).is_file()] + [f + "/" for f in files if (d / "assets" / f).is_dir()]}
    opts["files"] = [f for f in opts["files"] if not f.endswith("/")]                  # folders are reached through their files' paths
    opts["dirs"] = sorted(f for f in files if (src / f).is_dir())       # sub-folders the page names relatively (assets/fonts/..., source/...)
    vendor = []
    for cdn, v in PREFIX.items():                       # module folders an import map names: "./" kept (an import map drops a bare path)
        if cdn in html: libs[cdn] = "./assets/vendor/" + v; vendor.append(v.rstrip("/"))
    if "assets/carousel-images/" in html:                # the carousels' album photos are remote-only in the registry: the kit's placeholders
        opts["imagePrefix"] = "assets/carousel-images/"   # (engine/vendor/data/placeholders), or the job's pictures through the `images` param
        opts["placeholders"] = [f"assets/vendor/data/placeholders/card-{i:02d}.jpg" for i in range(1, 25)]
        vendor.append("data/placeholders")
    if "assets/carousel-images/" not in html and any(v.get("type") == "image" for v in meta.get("variables") or []):
        opts["placeholders"] = [f"assets/vendor/data/placeholders/card-{i:02d}.jpg" for i in range(1, 25)]; vendor.append("data/placeholders")
    opts["imageVars"] = [v["id"] for v in (meta.get("variables") or []) if v.get("type") == "image"]
    if row.get("reload"): opts["reload"] = True                  # its timeline callbacks change the page for good: a seek back reloads it
    variables = [v for v in (meta.get("variables") or []) if v.get("type") != "image"]   # pictures go through `images` / placeholders
    ids = [v["id"] for v in variables]
    params = {v["id"]: v["default"] for v in variables if v.get("default") is not None}
    params.update(row.get("defaults") or {})
    params.update({"duration": dur, "replace": row.get("replace") or []})
    if vendor: params["images"] = []
    look = "var(--background" in html                   # the carousel family: kit-side patches at build (ctx.hfFrame o.look, Test 4 08/10/2026)
    if look:
        gs = re.search(r"globalScale:\s*([\d.]+)", html)
        params.update({"cardBg": "#fff", **({"scale": float(gs.group(1))} if gs else {}), "card": None})
    one_clip = look and len(re.findall(rf'data-duration="{dur:g}"', html)) == 2 and len(re.findall(rf"duration: {dur:g},", html)) == 1
    head =(f"/* {name}: {meta.get('description', '').strip()}\n"
            f"   HyperFrames {('skill ' + row['skill'] + ' page') if row.get('skill') else 'registry ' + kind[:-1]} {reg}, run as shipped (assets/{main}) in an iframe over the target box, scaled from {W} x {H} and kept in\n"
            f"   step with the film (ctx.hfFrame + engine/vendor/libs/hf/hf-frame.js). duration = the block's own length ({dur:g} s). replace: [[from, to],\n"
            f"   ...] changes copy in the page before it runs (e.g. Vietnamese text). Generated by engine/tests/hf_blocks.py. */\n")
    js = head + (f'AIMK.preset({json.dumps(name)}, {{\n  params: {json.dumps(params, ensure_ascii=False)},\n'
                 f'  build(tl, els, p, ctx) {{\n    const vars = {{}}; for (const k of {json.dumps(ids)}) if (p[k] !== undefined) vars[k] = p[k];\n'
                 f'    for (const slot of els) ctx.hfFrame(slot, {json.dumps(Path(main).name)}, p.at, p.duration, Object.assign({json.dumps(opts)}, {{ replace: ' + (f'{json.dumps(row["fix"], ensure_ascii=False)}.concat(p.replace || [])' if row.get("fix") else 'p.replace') + ', images: p.images, vars'
                 + (f', look: {{ background: p.background, cardBg: p.cardBg, scale: p.scale, card: p.card, duration: p.duration, native: {dur:g} }}' if look else '')
                 + ' }));\n  },\n});\n')
    (d / "preset.js").write_text(js, encoding="utf-8")
    pj = {
        "name": name, "kind": "block", "group": group, "title": meta.get("title", reg), "title_vi": row["title_vi"], "desc_vi": row["desc_vi"],
        "params_vi": "".join(f"{v['id']}: {v.get('label', '')}" + (f" ({' | '.join(str(o.get('value') if isinstance(o, dict) else o) for o in v['options'])})" if v.get("options") else "")
                             + (f", mặc định {json.dumps(v.get('default'), ensure_ascii=False)}" if v.get("default") not in (None, "") else "") + " · " for v in variables)
                     + ("background có hiệu lực (kit vá lúc build; \"transparent\" = nền trong suốt) · cardBg: nền thẻ, mặc định #fff (\"transparent\" cho ảnh PNG trong suốt) · "
                        + (f"scale: cỡ cả vòng, mặc định {float(gs.group(1)):g} · " if gs else "") + "card: [rộng, cao] cho mọi thẻ (trống = cỡ thẻ mẫu, vd [404, 640] thẻ dọc) · " if look else "")
                     + "duration: độ dài của block (" + f"{dur:g}" + " s" + ("; dài hơn thì block chạy chậm lại cho vừa cảnh" if one_clip else "; dài hơn thì đứng ở hình cuối" if look else "") + ") · replace: các cặp [chữ gốc, chữ mới] đổi nội dung trước khi chạy (ví dụ tiếng Việt)" + (" · images: danh sách ảnh của job cho các ô ảnh, theo thứ tự (trống = ảnh giữ chỗ của kit; ít ảnh thì lặp lại)" if vendor else ""),
        "source": {"label": "HyperFrames skill" if row.get("skill") else "HyperFrames registry", "repo": "heygen-com/hyperframes", "commit": commit,
                   "path": f"{path}/{main}", **({"sha256": sha256s(src, copied)} if row.get("incoming") else {})},
        "license": "Apache-2.0", "scripts": scripts, **({"vendor": vendor} if vendor else {}), "ae": "png", "brand_safe": False, "tags": (meta.get("tags") or [])[:6], "brand_ui": False, "needs": row.get("needs") or [],
        "check_end": False,
        "notes": ("Run as shipped: the block's own page (assets/" + main + ") in an iframe, its timeline set from the film's time. Fonts: Google / fontsource "
                  "families are drawn with the kit's RFlex / RMono. " + (row.get("notes") or "") + " Source: " + meta.get("description", "").strip()).strip(),
        "demo": {"duration": dur, "hold": 0, "elements": [{"id": "slot", "type": "box", "style": {"left": "0px", "top": "0px", "width": "1920px", "height": "1080px"}}],
                 "motion": [{"target": "slot", "at": 0, "params": {"duration": dur, **({"replace": row["replace"]} if row.get("replace") else {}), **(row.get("demo_vars") or {})}}], "bg": row.get("bg", "#0b0c0e")},
    }
    for k in ("seek_tolerance", "bake_tolerance", "thumb_at"):   # paint-level noise only (same state; the row's notes say why)
        if row.get(k): pj["demo"][k] = row[k]
    if row.get("times"): pj["times"] = row["times"]
    finish(pj, row, waiting, old)
    (d / "preset.json").write_text(json.dumps(pj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return name


if __name__ == "__main__":
    flt = sys.argv[1] if len(sys.argv) > 1 else ""
    done = [write(k, r) for k, r in ROWS.items() if flt in k and not r.get("drop")]   # "drop": taken out of the library (reason in the row)
    print(len(done), "layouts:", ",".join(done))
