"""Batch 2: HyperFrames registry "template" components (mountable sub-compositions) as kit layouts that run the component AS SHIPPED
(ctx.hf + engine/vendor/libs/hf/hf-mount.js). One table row per component; this script writes library/layouts/<group>/<name>/
(preset.js, preset.json, assets/<files of the component>). Re-running rewrites them (the table is the source of truth).

  python engine/tests/hf_templates.py            all rows
  python engine/tests/hf_templates.py push-in    rows whose registry name contains the text

Row keys commit, skill, incoming (where the files come from and where the layout goes), title / about / tags (a skill's page has no
registry-item.json), file (the page: e.g. a motion primitive's scene.html), times: engine/tests/hf_source.py."""
import json, os, re, shutil, sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[2]
REG = Path(os.environ["USERPROFILE"]) / ".aimotionkit" / "work" / "hf-registry" / "registry"
COMMIT = "0ca69472d93cf088c836bed3dc7df252247e2101"
SKIP_FILES = {"demo.html", "registry-item.json", "README.md"}

# registry name: (kit group/name, Vietnamese title, Vietnamese description, demo variable values, demo background)
ROWS = json.loads((Path(__file__).with_name("hf_templates.json")).read_text(encoding="utf-8"))


def params_vi(variables):
    out = []
    for v in variables:
        d = v.get("default")
        opts = " | ".join(str(o.get("value")) for o in v.get("options") or [])
        s = f"{v['id']}: {v.get('label', '')}"
        if opts: s += f" ({opts})"
        if d not in (None, ""): s += f", mặc định {json.dumps(d, ensure_ascii=False)}"
        out.append(s)
    return " · ".join(out + ["duration: độ dài gốc của thành phần (quyết định nhịp vào / giữ / ra)", "theme: biến màu / font của thành phần, ví dụ {\"--brand\": \"#ff5a1f\", \"--bg\": \"transparent\"} (mặc định font RFlex / RMono của kit)"])


def light_theme(html):
    """a component drawn for a light page (paper, whiteboard: light --bg or dark --fg in its own var() fallbacks) keeps its own colour
    fallbacks as the preset's default theme; ctx.hf otherwise gives the dark host tokens (light ink on its cream paper = invisible)"""
    def lum(h):
        h = h.lstrip("#"); h = "".join(c * 2 for c in h) if len(h) in (3, 4) else h[:6]
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b
    fb = {}
    for k, v in re.findall(r"var\((--[\w-]+),\s*(#[0-9a-fA-F]{3,8})\)", html): fb.setdefault(k, v)
    if not ((fb.get("--bg") and lum(fb["--bg"]) > 0.5) or (fb.get("--fg") and lum(fb["--fg"]) < 0.4)): return {}
    return {k: v for k, v in fb.items() if k in ("--fg", "--muted", "--surface", "--border", "--brand", "--accent", "--accent-2")}


def write(reg_name, row):
    from hf_source import dest, finish, item_meta, sha256s, source
    kind = "components" if (REG / "components" / reg_name).exists() else "blocks"
    src, commit, path = source(row, kind, reg_name)
    meta = item_meta(src, reg_name, row)
    main = next(f["path"] for f in meta["files"] if f["path"].endswith(".html"))
    html = (src / main).read_text(encoding="utf-8")
    m = re.search(r'data-composition-id="[^"]+"[^>]*data-duration="([\d.]+)"|data-duration="([\d.]+)"[^>]*data-composition-id', html)
    dur = float((m.group(1) or m.group(2)) if m else 4)
    variables = meta.get("variables") or []
    name = row["name"]; group = name.split("/")[0]
    d, waiting, old = dest(name, row)
    for x in (d.iterdir() if d.exists() else []):          # its generated files (the folder stays: a shell may sit in it)
        shutil.rmtree(x) if x.is_dir() else x.unlink()
    (d / "assets").mkdir(parents=True, exist_ok=True)
    copied = []
    for f in src.iterdir():
        if f.name in SKIP_FILES or f.name.endswith((".test.mjs", ".md")) or f.name == "desktop.ini": continue
        if row.get("skill") and f.name == "index.html" and main != "index.html": continue   # the skill's own page that mounts it
        copied.append(f)
        if f.is_dir(): shutil.copytree(f, d / "assets" / f.name)
        else: shutil.copy2(f, d / "assets" / f.name)
    ids = [v["id"] for v in variables]
    dirs = sorted(f.name for f in copied if f.is_dir())          # sub-folders the component names relatively (fonts, pictures)
    defaults = {v["id"]: v.get("default") for v in variables if v.get("default") is not None}
    defaults.update(row.get("defaults") or {})
    params = dict(defaults); params["duration"] = dur; params["theme"] = light_theme(html)
    if row.get("skill"): params["replace"] = row.get("replace") or []   # a skill's scene has fixed copy: [[from, to], ...] (ctx.hf replace)
    slot_names = sorted(set(re.findall(r'data-slot="([\w-]+)"', html)))   # content slots (its own [data-slot] elements, or host templates it looks up)
    if slot_names: params.setdefault("slots", {})                         # a row's "defaults" may give default slot content
    head = (f"/* {name}: {meta.get('description', '').strip()}\n"
            f"   HyperFrames {('skill ' + row['skill'] + ' scene') if row.get('skill') else 'registry component'} {reg_name}, run as shipped (assets/{main}, through ctx.hf and engine/vendor/libs/hf/hf-mount.js:\n"
            f"   own ids, variables and timeline). BLOCK: the component fills the target box (its cqw / cqh are that box). Params = the component's\n"
            f"   variables ({', '.join(ids) or 'none'}); duration = its mount duration ({dur:g} s), which sets its envelope. Generated by\n"
            f"   engine/tests/hf_templates.py. */\n")
    js = head + (f'AIMK.preset({json.dumps(name)}, {{\n  params: {json.dumps(params, ensure_ascii=False)},\n'
                 f'  build(tl, els, p, ctx) {{\n    const vars = {{}}; for (const k of {json.dumps(ids)}) if (p[k] !== undefined) vars[k] = p[k];\n'
                 + (f'    ctx.css({json.dumps(name)}, {json.dumps(row["css"], ensure_ascii=False)});   // kit-side fix, the row\'s notes say why\n' if row.get("css") else '')
                 + f'    for (const slot of els) ctx.hf(slot, {json.dumps(main)}, p.at, vars, p.duration, p.theme, {json.dumps(dirs)}'
                 + (', p.slots' if slot_names else ', undefined' if row.get('skill') else '') + (', p.replace' if row.get('skill') else '')
                 + ');\n  },\n});\n')
    (d / "preset.js").write_text(js, encoding="utf-8")
    demo_dur = row.get("demo_duration", dur)
    pj = {
        "name": name, "kind": "block", "group": group, "title": meta.get("title", reg_name),
        "title_vi": row["title_vi"], "desc_vi": row["desc_vi"],
        "params_vi": params_vi(variables) + (" · slots: nội dung HTML của job cho các ô của thành phần ({\"tên ô\": \"<div>...</div>\"}; ô: "
                                             + ", ".join(slot_names) + "), để trống thì thành phần dùng nội dung mặc định" if slot_names else "")
                     + (" · replace: các cặp [chữ gốc, chữ mới] đổi chữ của cảnh mẫu (ví dụ tiếng Việt)" if row.get("skill") else ""),
        "source": {"label": "HyperFrames skill" if row.get("skill") else "HyperFrames registry", "repo": "heygen-com/hyperframes", "commit": commit,
                   "path": f"{path}/{main}", **({"sha256": sha256s(src, copied)} if row.get("incoming") else {})},
        "license": "Apache-2.0", "scripts": ["libs/hf/hf-mount.js"], "ae": "png", "brand_safe": False,
        "tags": (meta.get("tags") or [])[:6], "brand_ui": False, "needs": [],
        "notes": ("Run as shipped: the component's own HTML, CSS and script (assets/" + main + ") in a kit film, mounted by ctx.hf. "
                  + (row.get("notes") or "") + " Source: " + meta.get("description", "").strip()).strip(),
        "demo": {"duration": demo_dur, "hold": 0, "elements": [{"id": "slot", "type": "box", "style": row.get("box") or {"left": "0px", "top": "0px", "width": "1920px", "height": "1080px"}}],
                 "motion": [{"target": "slot", "at": 0, "params": dict(row.get("demo") or {}, duration=demo_dur)}], "bg": row.get("bg", "#0b0c0e")},
    }
    if row.get("demo_multi"):                       # a short component shown several times (one box per mount: a mount replaces its box's content)
        box = row.get("box") or {"left": "0px", "top": "0px", "width": "1920px", "height": "1080px"}
        pj["demo"]["elements"] = [{"id": f"slot{i + 1}", "type": "box", "style": box} for i in range(len(row["demo_multi"]))]
        pj["demo"]["motion"] = [{"target": f"slot{i + 1}", "at": m["at"], "params": dict(m.get("params") or {}, duration=m.get("duration", dur))}
                                for i, m in enumerate(row["demo_multi"])]
    if row.get("check_end") is not None: pj["check_end"] = row["check_end"]
    if row.get("seek_tolerance"): pj["demo"]["seek_tolerance"] = row["seek_tolerance"]
    if row.get("thumb_at"): pj["demo"]["thumb_at"] = row["thumb_at"]
    if row.get("times"): pj["times"] = row["times"]
    finish(pj, row, waiting, old)
    (d / "preset.json").write_text(json.dumps(pj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return name


if __name__ == "__main__":
    flt = sys.argv[1] if len(sys.argv) > 1 else ""
    done = [write(k, r) for k, r in ROWS.items() if flt in k]
    print(len(done), "layouts:", ",".join(done))
