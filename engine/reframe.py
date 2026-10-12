"""kit.py reframe <project> <aspect> [--name <new name>]: the same film in another aspect (plan C1, 07/10/2026), as a NEW project next to it.

What it does: copies the film's material (assets, audio, brief, presets, notes\\NOTES.md), sets film.json "size", and scales every element's
pixel positions to the new frame (x by the width ratio, y by the height ratio, sizes and type by the smaller ratio, so nothing leaves the
frame); "group" elements re-centre by themselves. A brand pack is applied again for the new canvas (its brand.json "kit" "endTagWidth" sets the end tag's width per frame shape).
A taller frame (16:9 -> 9:16, 4:5, 1:1) gets "auto stack" first (engine/relayout.py: the units of every scene measured in the built source,
stacked in reading order, scaled to the width; 1:1 / 4:5 keep a row of cards as a row). Then it builds and takes one still per scene.
The result is a first layout: Claude looks at every scene and re-composes what reads badly (bigger type, the product higher...), never by
cropping. Motion distances in params are kept (check them: a 400 px slide is a lot on a 1080 px wide frame).
A long film written in parts ({ "include": "parts/x.json" } scenes) becomes one film.json in the new project (the parts are written in).
The source's psd\\ is not copied (PSB files are big): the new project refers to the same layers in assets\\.
An approved film keeps ALL its content (user, 08/10/2026: "mọi elements và nội dung phải giữ nguyên hoàn toàn, chỉ thay đổi ratio khung
hình cho hợp lý"): reframe writes qa\\reframe-source.json (every scene, element, text, picture, motion, time and sound of the source)
and `kit.py reframe <new film> check` compares the re-composed film with it: only positions and sizes may change. When the frame turns
(landscape <-> portrait) a "group" laid out in a row becomes a column (and back), its content unchanged."""
import json, re, shutil
from pathlib import Path

POS_X = ("left", "right")
POS_Y = ("top", "bottom")
SIZE = ("width", "height", "max-width", "max-height", "min-width", "min-height", "font-size", "letter-spacing", "line-height", "gap",
        "padding", "padding-left", "padding-right", "padding-top", "padding-bottom", "border-radius", "border-width", "margin", "margin-left",
        "margin-right", "margin-top", "margin-bottom")
PX = re.compile(r"(-?\d+(?:\.\d+)?)px")


def scale_value(v, k):
    """every px number in a CSS value times k ("120px" -> "68px", "0 24px" -> "0 14px"); % and other units are kept"""
    if not isinstance(v, str): return v
    return PX.sub(lambda m: f"{round(float(m.group(1)) * k, 1):g}px", v)


def scale_els(els, sx, sy, s):
    for e in els or []:
        st = e.get("style") or {}
        for k in list(st):
            key = k.replace("_", "-")
            if key in POS_X: st[k] = scale_value(st[k], sx)
            elif key in POS_Y: st[k] = scale_value(st[k], sy)
            elif key in SIZE: st[k] = scale_value(st[k], s)
        if e.get("gap"): e["gap"] = scale_value(e["gap"], s)
        scale_els(e.get("children"), sx, sy, s)


CONTENT = ("type", "text", "html", "src", "class")       # what an element IS (may not change); its "style" is where and how big (may)


def manifest(spec):
    """the content of a film.json, without positions and sizes: scenes (ids, times, transitions, voice, sound effects, motions: preset,
    target, at, param names), every element (what it is, its children), layers, audio, song, groove targets, end tag"""
    els = {}

    def walk(L, where):
        for e in L or []:
            els[e["id"]] = dict({k: e.get(k) for k in CONTENT}, where=where, children=[c["id"] for c in e.get("children") or []])
            walk(e.get("children"), where)
    mo = lambda M: [{"preset": m.get("preset"), "target": m.get("target"), "at": m.get("at"), "params": sorted((m.get("params") or {}))} for m in M or []]
    scenes = []
    for s in spec.get("scenes", []):
        walk(s.get("elements"), s["id"])
        scenes.append({k: s.get(k) for k in ("id", "duration", "until", "hold", "transition_in", "voice", "sfx")} | {"motion": mo(s.get("motion"))})
    layers = []
    for L in spec.get("layers") or []:
        walk(L.get("elements"), L["id"])
        layers.append({k: L.get(k) for k in ("id", "z", "from", "to")} | {"motion": mo(L.get("motion"))})
    groove = sorted({str(t) for part in (spec.get("groove") or {}).get("parts", []) for t in (part["target"] if isinstance(part["target"], list) else [part["target"]])})
    return {"scenes": scenes, "elements": els, "layers": layers, "audio": spec.get("audio"), "song": spec.get("song"), "sfx": spec.get("sfx"),
            "groove": groove, "end_tag": (spec.get("end_tag") or {}).get("logo")}


def turn_groups(els, to_portrait, say=print):
    """landscape -> portrait: a group in a row becomes a column (portrait -> landscape: back); its children and order stay"""
    for e in els or []:
        if e.get("type") == "group":
            a, b = ("row", "column") if to_portrait else ("column", "row")
            if e.get("layout", "row") == a: e["layout"] = b; say(f"  group {e['id']}: {a} -> {b}")
        turn_groups(e.get("children"), to_portrait, say)


def scene_times(html):
    """[(scene id, start, duration)] of a built index.html"""
    return [(m.group(1), float(m.group(2)), float(m.group(3))) for m in
            re.finditer(r'<div id="([^"]+)" class="clip scene" data-start="([\d.]+)" data-duration="([\d.]+)"', html)]


def check(p, say=print):
    """the re-composed film against its source: same content (manifest), same scene times once built; positions / sizes are free.
    Returns the number of differences (0 = every element and all content kept)"""
    p = Path(p); f = p / "qa" / "reframe-source.json"
    if not f.exists(): raise SystemExit(f"{p}: no qa/reframe-source.json (made by kit.py reframe): nothing to compare with")
    src = json.loads(f.read_text(encoding="utf-8")); spec = json.loads((p / "film.json").read_text(encoding="utf-8"))
    a, b = src["content"], manifest(spec); bad = []
    ea, eb = a["elements"], b["elements"]
    for i in sorted(set(ea) - set(eb)): bad.append(f"element {i} ({ea[i]['type']}, scene {ea[i]['where']}) is missing")
    for i in sorted(set(eb) - set(ea)): bad.append(f"element {i} was added")
    for i in sorted(set(ea) & set(eb)):
        for k in CONTENT + ("where", "children"):
            if ea[i].get(k) != eb[i].get(k): bad.append(f"element {i}: {k} changed ({str(ea[i].get(k))[:60]!r} -> {str(eb[i].get(k))[:60]!r})")
    for k in ("scenes", "layers", "audio", "song", "sfx", "groove", "end_tag"):
        if a.get(k) != b.get(k):
            if k in ("scenes", "layers") and len(a.get(k) or []) == len(b.get(k) or []):
                for x, y in zip(a[k], b[k]):
                    for kk in x:
                        if x.get(kk) != y.get(kk): bad.append(f"{k[:-1]} {x['id']}: {kk} changed")
            else: bad.append(f"{k} changed")
    sh, nh = Path(src["source"]) / "index.html", p / "index.html"
    if sh.exists() and nh.exists():
        ta, tb = scene_times(sh.read_text(encoding="utf-8")), scene_times(nh.read_text(encoding="utf-8"))
        if ta != tb: bad.append(f"scene times differ once built: {ta[:3]} ... vs {tb[:3]} ... (build both films)")
    else: bad.append("scene times not compared (build the new film; the source's index.html is missing)" if not nh.exists() else "the source film's index.html is gone: times not compared")
    say(f"reframe check {p.parent.name if p.name == '03_HTML' else p.name}: " + ("every element and all content kept, scene times identical" if not bad else f"{len(bad)} difference(s):"))
    for x in bad: say(f"  - {x}")
    return len(bad)


def reframe(p, aspect, name, aspects, folders, bat, say=print):
    from common import ASSETS, BRIEF, HTML, film_root
    p = Path(p); spec = json.loads((p / "film.json").read_text(encoding="utf-8"))
    if any(isinstance(s, dict) and s.get("include") for s in spec.get("scenes", [])):    # parts are not copied: write them into the new film.json
        from build import expand_parts
        spec["scenes"] = expand_parts(p, spec); say("  long-film parts written into the new film.json")
    if aspect not in aspects: raise SystemExit(f"aspect {aspect}: one of {', '.join(aspects)}")
    W, H = spec.get("size", [1920, 1080]); W2, H2 = aspects[aspect]
    root = film_root(p); new = p.name == HTML                 # the 4-folder layout: the new film gets 01_Brief / 02_Assets / 03_HTML too
    if (W, H) == (W2, H2): raise SystemExit(f"{root.name} is already {aspect}")
    dst_root = root.parent / (name or f"{root.name}_{aspect.replace(':', 'x')}")
    dst = dst_root / HTML if new else dst_root
    if (dst / "index.html").exists(): raise SystemExit(f"{dst} already exists")
    for d in folders: (dst / d).mkdir(parents=True, exist_ok=True)
    if new:
        (dst_root / ASSETS).mkdir(exist_ok=True)              # the originals stay in the first film's 02_Assets (the film uses its copies in assets/)
        if (root / BRIEF).is_dir(): shutil.copytree(root / BRIEF, dst_root / BRIEF, dirs_exist_ok=True, ignore=shutil.ignore_patterns("desktop.ini"))
    for sub in ("assets", "audio", "presets") + (() if new else ("brief",)):
        if (p / sub).is_dir(): shutil.copytree(p / sub, dst / sub, dirs_exist_ok=True, ignore=shutil.ignore_patterns("desktop.ini", "_built"))
    for f in ("notes/NOTES.md", "NOTES.md"):
        if (p / f).exists(): shutil.copy2(p / f, dst / "notes" / "NOTES.md"); break
    content = manifest(spec)                                       # before anything moves: what must stay
    sx, sy = W2 / W, H2 / H; s = min(sx, sy)
    if H2 / W2 > H / W + 0.01 and (p / "index.html").exists():   # a taller frame: stack the units of every scene (engine/relayout.py)
        try:
            import relayout
            n = relayout.stack(spec, relayout.measure(p, spec), W, H, W2, H2, scale_els, scale_value, say)
            say(f"  auto stack: {n} scene(s)")
        except Exception as e: say(f"  auto stack skipped ({type(e).__name__}: {e}): plain scaling")
    for sc in spec.get("scenes", []):
        if not sc.pop("_stacked", False): scale_els(sc.get("elements"), sx, sy, s)
    for L in spec.get("layers") or []: scale_els(L.get("elements"), sx, sy, s)
    if (W > H) != (W2 > H2):                                      # the frame turns: rows of a group become columns (or back)
        for sc in spec.get("scenes", []): turn_groups(sc.get("elements"), H2 >= W2, say)
        for L in spec.get("layers") or []: turn_groups(L.get("elements"), H2 >= W2, say)
    if isinstance(spec.get("css"), str): spec["css"] = scale_value(spec["css"], s)     # the film's own classes (type sizes)
    spec["size"] = [W2, H2]
    spec["title"] = f"{spec.get('title', root.name)} ({aspect})"
    if spec.get("end_tag"):                                       # the pack's end tag width for this frame shape
        import brand
        etw = brand.kit_rules(brand.pack_of(spec)[1]).get("endTagWidth")
        if etw: spec["end_tag"]["width"] = etw["landscape"] if W2 > H2 else etw["portrait"]
    (dst / "film.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
    (dst / "qa").mkdir(parents=True, exist_ok=True)
    (dst / "qa" / "reframe-source.json").write_text(json.dumps({"source": str(p), "size_from": [W, H], "size_to": [W2, H2], "content": content},
                                                            ensure_ascii=False, indent=1), encoding="utf-8")
    bat(dst_root)
    note = dst / "notes" / "NOTES.md"
    note.write_text((note.read_text(encoding="utf-8") if note.exists() else f"# {dst_root.name}\n") +
                    f"\n\n## Reframe\nMade from `{root.name}` ({W}x{H}) by `kit.py reframe` for {aspect} ({W2}x{H2}): a first layout (auto stack on a "
                    "taller frame, else positions scaled); every scene looked at and re-composed where it reads badly (never cropped); "
                    "`kit.py reframe <this film> check` keeps every element and all content.\n", encoding="utf-8")
    say(f"{dst_root.name}: {W}x{H} -> {W2}x{H2}; positions x{sx:.3f} / y{sy:.3f}, sizes and type x{s:.3f}")
    return dst, spec
