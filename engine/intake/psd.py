"""PSD / PSB artwork -> film data for FAITHFUL jobs (the PSD counterpart of ingest.py). Run through kit.py:

  python kit.py psd <file.psd|psb> <project> --list
      prints the layer tree (groups to depth 4: visibility, size, layer count) and writes <project>/psd/PSD-TREE.md. Use it to choose frames.
  python kit.py psd <file.psd|psb> <project> --frames "P01=F2/1, P02=F2/2, S10=F4" [--keep "F2/BG"] [--refs] [--width 1920]
      exports every frame (a group path inside the file; artboards: the artboard name) into the project:
        assets/psd/<frame>/NN_<layer>.png   visible layers at film scale (paint order), groups with clipped photos kept whole,
                                            other groups split down to single layers, blend modes kept per layer
        psd/psd.json                        per frame: image units (x, y, w, h, blend, opacity, kind, id shared across frames when the
                                            pixels match), text units (text, font, size, tracking, colour, rotation, ink box, shadows,
                                            gradient, faux italic), group effects (stroke, drop shadow, outer glow) that psd-tools does not draw
        psd/fonts.json                      every font of the text layers -> a font file found on this machine or "MISSING"
        psd/PSD.md                          a readable summary (frames, layers, fonts, notes)
        ref/<frame>.png (--refs)            the frame rendered by psd-tools at film size, for `kit.py compare` (slow: about 1 to 2 min per
                                            frame on a 5000 px PSB; the client's numbered previews are better references when they exist)
      --keep: sibling layers that belong to every frame of a group (for example a shared background beside numbered groups).
  Without --frames and with artboards in the file, every artboard is a frame.
The film rebuilds frames with SSPsd (engine/psd.js): SSPsd.load(F), SSPsd.frame(F, root, key), SSPsd.run(...) for a run of frames.

Traps handled here (a v1 PSD film, 3 Oct 2026): a hidden ancestor makes bbox [0,0,0,0] and composite() empty (the frame's branch is
switched on while exporting); group-level stroke / shadow / glow are read from the file and passed to the film; radial Gradient Fill
layers are marked (psd-tools paints them wrong; the film fills their shape with the stored colour); identical layers exported from two
frames differ by a few levels, so ids compare position, size and mean pixel difference (< 3/255)."""
import hashlib, json, math, os, re, sys, time
from pathlib import Path
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass

CSS_BLEND = {"NORMAL": "normal", "PASS_THROUGH": "normal", "MULTIPLY": "multiply", "SCREEN": "screen", "OVERLAY": "overlay",
             "COLOR_DODGE": "color-dodge", "LINEAR_DODGE": "plus-lighter", "SOFT_LIGHT": "soft-light", "HARD_LIGHT": "hard-light",
             "LIGHTEN": "lighten", "DARKEN": "darken", "COLOR_BURN": "color-burn", "DIFFERENCE": "difference", "EXCLUSION": "exclusion",
             "HUE": "hue", "SATURATION": "saturation", "COLOR": "color", "LUMINOSITY": "luminosity"}


def bname(l): return str(l.blend_mode).split(".")[-1]
def css_blend(l, inherited="normal"):
    b = CSS_BLEND.get(bname(l), "normal"); return inherited if b == "normal" else b
def slug(s): return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")[:40] or "x"
def clipped(l): return bool(getattr(l, "clipping", False))
def kids(g): return list(g) if hasattr(g, "__iter__") else []


def dval(v):
    v = getattr(v, "value", v)
    if isinstance(v, bytes): return v.decode("latin1")
    return v


def colour(desc):
    """a Photoshop colour descriptor (RGBC: Rd, Grn, Bl / Grsc) -> #rrggbb"""
    try:
        d = {str(dval(k)).strip(): float(dval(x)) for k, x in desc.items()}
        if "Rd" in d: return "#%02x%02x%02x" % tuple(int(round(d[k])) for k in ("Rd", "Grn", "Bl"))
        if "Grsc" in d: g = int(round(255 * (1 - d["Grsc"] / 100))); return "#%02x%02x%02x" % (g, g, g)
    except Exception: pass
    s = str(desc); m = re.findall(r"(Rd|Grn|Bl)\s*'?:\s*([\d.]+)", s)
    return "#%02x%02x%02x" % tuple(int(round(float(x))) for _, x in m[:3]) if len(m) >= 3 else "#000000"


def dget(desc, *names):
    """a descriptor value by key name (keys are bytes, str or enums depending on the psd-tools version)"""
    try: items = desc.items()
    except Exception: return None
    for k, v in items:
        kv = getattr(k, "value", k); ks = (kv.decode("latin1") if isinstance(kv, bytes) else str(kv)).strip()
        if any(ks == n or ks.endswith(n) for n in names): return v
    return None


def enum(v):
    """an Enumerated descriptor value (b'GrdT' / b'Rflc') or an enum (GradientType.REFLECTED) -> its text; str() of an Enumerated is only
    "<... object at 0x...>" (Test 4, 08/10/2026: every reflected text gradient came out linear because of that)"""
    if v is None: return ""
    e = getattr(v, "enum", None)
    if e is not None: return e.decode("latin1") if isinstance(e, bytes) else str(e)
    return str(dval(v))


def grad_spec(desc, e=None):
    """a gradient (gradient overlay effect or gradient fill layer) -> {type, angle, reversed, scale, align, offset [h %, v %], stops [[0..1, #hex]]}
    align False = the gradient is laid over the whole canvas, not the layer's box (Test 4's Gradient Fill: psd-tools drew a stripe in each box,
    Photoshop shows the box in the colour of that part of the canvas-wide gradient)"""
    g = dget(desc, "Grad", "Gradient") or (getattr(e, "gradient", None) if e is not None else None) or {}
    stops = []
    for c in dget(g, "Clrs", "Colors") or []:
        try: stops.append([round(float(dval(dget(c, "Lctn", "Location"))) / 4096, 4), colour(dget(c, "Clr", "Color"))])
        except Exception: pass
    typ = (enum(getattr(e, "type", None)) + " " + enum(dget(desc, "Type"))).lower()
    ang = dget(desc, "Angl", "Angle"); ang = float(dval(ang)) if ang is not None else float(dval(getattr(e, "angle", 90)) or 90)
    rev = dget(desc, "Rvrs", "Reverse"); rev = bool(dval(rev)) if rev is not None else bool(dval(getattr(e, "reversed", False)))
    sc = dget(desc, "Scl", "Scale"); sc = float(dval(sc)) if sc is not None else 100.0
    al = dget(desc, "Algn", "Align"); al = bool(dval(al)) if al is not None else bool(dval(getattr(e, "aligned", True)))
    of = dget(desc, "Ofst", "Offset") or {}
    off = [round(float(dval(dget(of, "Hrzn") or 0)), 3), round(float(dval(dget(of, "Vrtc") or 0)), 3)]
    return {"type": "radial" if "rdl" in typ or "radial" in typ else "reflected" if "rflc" in typ or "reflect" in typ else "angle" if "angl" in typ else "linear",
            "angle": ang, "reversed": rev, "scale": sc, "align": al, "offset": off, "stops": stops}


def effects(l, S):
    """layer / group effects as plain dicts in film px: stroke, shadow, glow, gradient"""
    out = []
    try: fx = list(l.effects)
    except Exception: return out
    for e in fx:
        if not getattr(e, "enabled", True): continue
        k = type(e).__name__; op = float(getattr(e, "opacity", 100) or 100) / 100
        try:
            if k == "Stroke": out.append({"k": "stroke", "r": round(float(e.size) * S, 2), "color": colour(e.color), "op": op})
            elif k == "DropShadow":
                a = math.radians(float(e.angle)); d = float(e.distance) * S
                out.append({"k": "shadow", "dx": round(-math.cos(a) * d, 2), "dy": round(math.sin(a) * d, 2), "blur": round(float(e.size) * S, 2), "color": colour(e.color), "op": op})
            elif k == "OuterGlow": out.append({"k": "glow", "size": round(float(e.size) * S, 1), "color": colour(getattr(e, "color", {})), "op": op,
                                               "blend": str(getattr(e, "blend_mode", "")).split(".")[-1].split(":")[0], "spread": float(getattr(e, "choke", 0) or 0)})
            elif k == "GradientOverlay":
                out.append(dict(grad_spec(getattr(e, "value", None) or {}, e), k="gradient", op=op))
        except Exception as ex:
            out.append({"k": "unread", "type": k, "err": str(ex)[:80]})
    return out


def text_spec(l, S):
    ed, rs = l.engine_dict, l.resource_dict
    names = [str(dval(f["Name"])) for f in rs["FontSet"]]
    runs = []
    for r, n in zip(ed["StyleRun"]["RunArray"], ed["StyleRun"]["RunLengthArray"]):
        ss = r["StyleSheet"]["StyleSheetData"]; fc = ss.get("FillColor")
        runs.append({"len": int(n), "font": names[int(ss.get("Font", 0))], "size": float(ss.get("FontSize", 0)), "tracking": float(ss.get("Tracking", 0)),
                     "fauxItalic": bool(ss.get("FauxItalic", False)), "fauxBold": bool(ss.get("FauxBold", False)), "caps": int(ss.get("FontCaps", 0)),
                     "leading": None if ss.get("AutoLeading", True) else float(ss.get("Leading", 0)),
                     "fill": "#%02x%02x%02x" % tuple(int(round(float(v) * 255)) for v in list(fc["Values"])[1:4]) if fc else "#000000"})
    try: just = int(ed["ParagraphRun"]["RunArray"][0]["ParagraphSheet"]["Properties"].get("Justification", 0))
    except Exception: just = 0
    a, b, c, d, tx, ty = [float(x) for x in l.transform]
    sc = math.hypot(a, b); r0 = max(runs, key=lambda r: r["len"])
    txt = "\n".join(x.strip() for x in l.text.replace("\r", "\n").strip("\n").split("\n"))     # outer spaces would skew the ink-box fit
    if r0["caps"] == 2: txt = txt.upper()
    return {"text": txt, "font": r0["font"], "size": round(r0["size"] * sc * S, 2), "tracking": r0["tracking"], "fill": r0["fill"],
            "fauxItalic": r0["fauxItalic"], "fauxBold": r0["fauxBold"], "rot": round(math.degrees(math.atan2(b, a)), 2),
            "leading": round(r0["leading"] * sc * S, 2) if r0["leading"] else None, "box": [round(v * S, 1) for v in l.bbox], "align": ["left", "right", "center", "justify"][just] if just < 4 else "left",
            "runs": runs, "fx": effects(l, S)}


def tree(psd):
    lines = []
    def walk(g, depth, path):
        for l in kids(g):
            p = path + [l.name]; n = len(list(l.descendants())) if l.is_group() else 0
            x0, y0, x1, y1 = l.bbox
            lines.append(f"{'  ' * depth}- `{'/'.join(p)}` {l.kind}{'' if l.visible else ' (hidden)'} {x1 - x0}x{y1 - y0}" + (f", {n} layers" if n else "") + (f": \"{l.text.strip()[:40]}\"" if l.kind == "type" else ""))
            if l.is_group() and depth < 3: walk(l, depth + 1, p)
    walk(psd, 0, [])
    return lines


def find(psd, path):
    g = psd
    for name in path:
        g = next((l for l in kids(g) if l.name == name), None)
        if g is None: return None
    return g


def isolate(psd, path, keep):
    """show only the branch `path` (and the --keep siblings); returns the visibility changes to undo"""
    saved = []
    def setv(l, v): saved.append((l, l.visible)); l.visible = v
    g, trail = psd, []
    for name in path:
        for l in kids(g):
            here = "/".join(trail + [l.name])
            setv(l, l.name == name or here in keep)
        trail.append(name); g = next(l for l in kids(g) if l.name == name)
    return saved


def data_dir(proj):
    """<project>/psd/: psd.json, fonts.json, PSD.md, PSD-TREE.md (Test 4, 08/10/2026: the project root keeps only the launcher, film.json,
    index.html and folders)"""
    d = Path(proj) / "psd"; d.mkdir(parents=True, exist_ok=True); return d


def data_file(proj, name):
    """psd/<name>, or <project>/<name> in a project made before 08/10/2026"""
    new, old = Path(proj) / "psd" / name, Path(proj) / name
    return new if new.exists() or not old.exists() else old


def find_font_files(proj, names):
    """PostScript names from the PSD -> font files on this machine (project assets/fonts first)"""
    try: from fontTools.ttLib import TTFont
    except ImportError: return {n: "MISSING" for n in names}
    kit = Path(__file__).resolve().parents[2]                       # engine/intake/psd.py -> the kit (was parent.parent + "Guidelines", a v1 path)
    sys.path.insert(0, str(kit / "engine")); from fonts.fonts import adobe_dirs, copy_name, font_ext
    dirs = [proj / "assets" / "fonts", Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "Windows" / "Fonts", Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts",
            kit / "brands"] + adobe_dirs()                # Adobe Fonts (Creative Cloud): numbered files, no extension (Test 4)
    want = {n.lower(): n for n in names}; out = {n: "MISSING" for n in names}
    (proj / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    for d in dirs:
        if not d.exists(): continue
        for f in d.rglob("*"):
            if not want: break
            if font_ext(f) not in (".ttf", ".otf"): continue
            try:
                t = TTFont(str(f), lazy=True, fontNumber=0); ps0 = t["name"].getDebugName(6) or ""; ps = ps0.lower(); t.close()
            except Exception: continue
            if ps in want:
                n = want.pop(ps); dst = proj / "assets" / "fonts" / copy_name(f, ps0)
                if not dst.exists():
                    import shutil; shutil.copy2(f, dst)
                out[n] = {"src": "assets/fonts/" + dst.name, "from": str(f)}
    return out


def export(src, proj, frames, keep=(), refs=False, width=1920, say=print):
    from psd_tools import PSDImage
    from PIL import Image
    import numpy as np
    proj = Path(proj); t0 = time.time(); psd = PSDImage.open(str(src))
    W, H = psd.size; S = width / W; say(f"psd: opened {Path(src).name} {W}x{H} in {time.time() - t0:.1f}s, scale {S:.4f}")
    if not frames:
        frames = {slug(l.name): [l.name] for l in kids(psd) if l.kind == "artboard"}
        if not frames: raise SystemExit("psd: give --frames \"KEY=Group/Sub, ...\" (see --list); the file has no artboards")
    keep = list(keep) + [l.name for l in kids(psd) if l.name == "Background" and l.name not in keep]   # the file's background layer belongs to every frame
    seen, data, fonts, notes = [], {"source": str(src), "canvas": [width, round(H * S)], "frames": {}}, set(), []

    def ident(png, x, y, w, h):
        a = np.asarray(png, np.int16)
        for (sx, sy, sw, sh, b, i) in seen:
            if abs(sx - x) < 1 and abs(sy - y) < 1 and sw == w and sh == h and np.abs(a - b).mean() < 3: return i
        i = hashlib.md5(a.tobytes()).hexdigest()[:10]; seen.append((x, y, w, h, a, i)); return i

    def gfx_of(stack):
        for g in reversed(stack):
            fx = [e for e in effects(g, S) if e["k"] in ("stroke", "shadow", "glow")]
            if fx: return {"id": hashlib.md5("/".join(x.name for x in stack).encode()).hexdigest()[:8], "fx": fx}
        return None

    order = {id(l): i for i, l in enumerate(psd.descendants())}   # bottom to top
    for key, path in frames.items():
        t = time.time(); g = find(psd, path)
        if g is None: notes.append(f"frame {key}: path {'/'.join(path)} not found"); continue
        saved = isolate(psd, path, set(keep))
        out = proj / "assets" / "psd" / key; out.mkdir(parents=True, exist_ok=True); units = []

        def emit(l, stack, inherited):
            n = len(units)
            if l.kind == "type":
                try: s = text_spec(l, S)
                except Exception as ex: notes.append(f"{key}: text layer {l.name!r} not read ({ex})"); return
                s.update({"i": n, "kind": "text", "name": l.name, "blend": css_blend(l, inherited), "opacity": round(l.opacity / 255, 3)})
                gx = gfx_of(stack)
                if gx: s["gfx"] = gx
                fonts.add(s["font"]); units.append(s); return
            im = l.composite()
            if im is None or im.size[0] == 0: return
            x0, y0, x1, y1 = l.bbox; w, h = max(1, round((x1 - x0) * S)), max(1, round((y1 - y0) * S))
            im = im.convert("RGBA").resize((w, h), Image.LANCZOS); fn = f"{n:02d}_{slug(l.name)}.png"; im.save(out / fn)
            al = np.asarray(im)[..., 3]
            u = {"i": n, "kind": "img", "lk": l.kind, "name": l.name, "src": f"assets/psd/{key}/{fn}", "x": round(x0 * S, 1), "y": round(y0 * S, 1), "w": w, "h": h,
                 "blend": css_blend(l, inherited), "opacity": round(l.opacity / 255, 3), "id": ident(im, round(x0 * S, 1), round(y0 * S, 1), w, h),
                 "fill": round(float((al > 8).mean()), 3), "path": "/".join(x.name for x in stack + [l])}
            fx = [e for e in effects(l, S) if e["k"] in ("stroke", "shadow", "glow")]
            if fx: u["fx"] = fx
            if l.kind == "gradientfill" or "GradientFill" in type(l).__name__:
                u["gradientFill"] = True
                try: u["grad"] = grad_spec(getattr(l, "_data", None) or {})
                except Exception as ex: notes.append(f"{key}: gradient fill {l.name!r} not read ({ex})")
            gx = gfx_of(stack)
            if gx: u["gfx"] = gx
            units.append(u)

        def walk(grp, stack, inherited):
            for l in kids(grp):                                   # bottom to top = paint order
                if not l.visible or clipped(l): continue
                if l.is_group():
                    has_text = any(d.kind == "type" for d in l.descendants() if d.visible)
                    has_blend = any(bname(d) not in ("NORMAL", "PASS_THROUGH") for d in l.descendants() if d.visible)
                    whole = any(c.visible and clipped(c) for c in kids(l)) and not has_text and not has_blend
                    if not whole: walk(l, stack + [l], css_blend(l, inherited)); continue
                emit(l, stack, inherited)

        kls = [kl for kp in keep for kpath in [kp.split("/")] if kpath[:-1] == path[:len(kpath) - 1] for kl in [find(psd, kpath)] if kl is not None]
        kls.sort(key=lambda x: order[id(x)])                  # shared layers (--keep, Background) in the file's own paint order,
        for kl in kls:                                        # under or over the frame's group as they sit in the file
            if order[id(kl)] < order[id(g)]: emit(kl, [], "normal")
        if g.is_group(): walk(g, [g], css_blend(g))
        else: emit(g, [], "normal")                          # a frame that is one smart object / pixel layer (Test 4: F1/1, F6/1 came out empty)
        for kl in kls:
            if order[id(kl)] > order[id(g)]: emit(kl, [], "normal")
        if refs:
            (proj / "ref").mkdir(exist_ok=True)
            psd.composite(force=True).convert("RGB").resize((width, round(H * S)), Image.LANCZOS).save(proj / "ref" / f"{key}.png")
        for l, v in reversed(saved): l.visible = v
        data["frames"][key] = {"path": "/".join(path), "units": units}
        say(f"  {key} ({'/'.join(path)}): {sum(u['kind'] == 'img' for u in units)} pictures, {sum(u['kind'] == 'text' for u in units)} texts, {time.time() - t:.1f}s")

    D = data_dir(proj); (D / "psd.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    fmap = find_font_files(proj, sorted(fonts))
    fj = data_file(proj, "fonts.json"); old = json.loads(fj.read_text(encoding="utf-8")) if fj.exists() else {}
    for k, v in old.items():                                      # keep replacements chosen earlier ({"use": "Arial Black", ...})
        if k in fmap and fmap[k] == "MISSING" and v != "MISSING": fmap[k] = v
        elif k not in fmap: fmap[k] = v                           # and fonts of frames exported in an earlier run
    (D / "fonts.json").write_text(json.dumps(fmap, ensure_ascii=False, indent=1), encoding="utf-8")
    md = [f"# PSD (written by kit.py psd)", "", f"Source: `{src}` {W}x{H}, film scale {S:.4f}. Frames and units: `psd.json`.", ""]
    for k, f in data["frames"].items():
        md.append(f"## {k} `{f['path']}`")
        for u in f["units"]:
            md.append(f"- {u['i']:02d} " + (f"TEXT \"{u['text'][:50]}\" {u['font']} {u['size']}px {u['fill']} rot {u['rot']}" + (" +fx" if u['fx'] else "") if u["kind"] == "text"
                      else f"{u['lk']} `{u['name']}` @ {u['x']},{u['y']} {u['w']}x{u['h']} {u['blend']}" + (" +fx" if u.get('fx') else "") + (" (gradient fill)" if u.get("gradientFill") else "")))
        md.append("")
    md.append("## Fonts"); md += [f"- {k}: " + (v if isinstance(v, str) else v.get("src") or ("use " + v.get("use", "?"))) for k, v in fmap.items()]
    if notes: md += ["", "## Notes"] + [f"- {n}" for n in notes]
    (D / "PSD.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    miss = [k for k, v in fmap.items() if v == "MISSING"]
    say(f"psd: {len(data['frames'])} frames -> {D / 'psd.json'}; fonts: {len(fmap) - len(miss)} found" + (f", MISSING: {', '.join(miss)} (ask the user for the files, or set a replacement in fonts.json: {{\"use\": \"Arial Black\", \"skew\": 12}})" if miss else ""))
    for n in notes: say("  note: " + n)
    return data


def list_tree(src, proj, say=print):
    from psd_tools import PSDImage
    t0 = time.time(); psd = PSDImage.open(str(src)); W, H = psd.size
    lines = [f"# Layer tree of `{src}` ({W}x{H}, opened in {time.time() - t0:.1f}s)", "",
             "Frame candidates are usually groups whose children are numbered groups shown one at a time, or artboards.", ""] + tree(psd)
    out = data_dir(proj) / "PSD-TREE.md"; out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    for l in lines[4:80]: say(l)
    if len(lines) > 84: say(f"... {len(lines) - 84} more lines in {out}")


def parse_frames(s):
    out = {}
    for part in re.split(r",\s*(?=[^,=/]+=)", s or ""):          # commas inside group names ("61,313 UGC PIECES") are kept
        if "=" in part: k, p = part.split("=", 1); out[k.strip()] = [x.strip() for x in p.strip().split("/") if x.strip()]
    return out
