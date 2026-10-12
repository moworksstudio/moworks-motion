"""psd.json (kit.py psd export) -> film.json (MotionSpec): one still scene per frame, rebuilt by the Library preset intake/psd-frame.
The film then animates with other presets (each layer has an id: <frame>_f_u<NN>), or is a FAITHFUL still check against the client's
numbered previews (kit.py psd ... --compare <previews folder> "P01=1, P02=2").

Fonts: fonts.json from the export. A font file found on this machine is loaded by the film ("PSD <name>"); a MISSING font gets a stand-in
({"use": "Arial Black", "skew": 12} by default, as in v1) fitted to the ink box, and a note. Write your own stand-in into fonts.json to change it."""
import json, shutil
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent
STAND_IN = {"use": "Arial Black", "skew": 12}


def ensure_assets(proj):
    """what every v2 film loads: gsap and the default font"""
    v = proj / "assets" / "vendor"; v.mkdir(parents=True, exist_ok=True)
    if not (v / "gsap.min.js").exists(): shutil.copy2(ENGINE / "vendor" / "gsap" / "gsap.min.js", v / "gsap.min.js")
    f = proj / "assets" / "fonts"; f.mkdir(parents=True, exist_ok=True)
    if not (f / "RobotoFlex-var.woff2").exists(): shutil.copy2(ENGINE / "vendor" / "fonts" / "RobotoFlex-var.woff2", f / "RobotoFlex-var.woff2")


def make_film(proj, frames=None, hold=2.0, say=print):
    proj = Path(proj)
    from psd import data_file
    data = json.loads(data_file(proj, "psd.json").read_text(encoding="utf-8"))
    fj = data_file(proj, "fonts.json")
    fonts = json.loads(fj.read_text(encoding="utf-8")) if fj.exists() else {}
    fmap, faces, notes = {}, [], []
    for name, v in fonts.items():
        if isinstance(v, dict) and v.get("src"):
            fam = "PSD " + name; fmap[name] = {"family": fam, "real": True, "skew": v.get("skew", 0)}; faces.append({"family": fam, "src": v["src"]})
        else:
            st = v if isinstance(v, dict) and v.get("use") else STAND_IN
            if not (isinstance(v, dict) and v.get("use")):
                fonts[name] = dict(STAND_IN); notes.append(f"font {name} is MISSING: stand-in {STAND_IN['use']} (skew {STAND_IN['skew']}) fitted to the ink box. "
                                                          "Put the real file in assets/fonts (or a better stand-in in fonts.json) and build again.")
            fmap[name] = {"family": st["use"], "real": False, "skew": st.get("skew", 0)}; faces.append({"family": st["use"]})
    fj.write_text(json.dumps(fonts, ensure_ascii=False, indent=1), encoding="utf-8")
    W, H = data["canvas"]
    scenes = []
    for key, fr in data["frames"].items():
        if frames and key not in frames: continue
        slot = f"{key}_f"
        scenes.append({"id": key, "name": f"{key} {fr['path']}", "duration": hold,
                       "elements": [{"id": slot, "type": "box", "style": {"left": "0px", "top": "0px", "width": f"{W}px", "height": f"{H}px"}}],
                       "motion": [{"preset": "intake/psd-frame", "target": slot, "at": 0, "params": {"units": fr["units"], "fonts": fmap, "W": W, "H": H}}]})
    spec = {"spec": "aimk-motionspec/0", "title": f"PSD frames ({Path(data['source']).name})", "size": [W, H], "brand": None, "background": "#000000",
            "fonts": faces, "scenes": scenes}
    ensure_assets(proj)
    (proj / "film.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
    say(f"film.json: {len(scenes)} frame scene(s), {hold} s each")
    for n in notes: say("  note: " + n)
    return spec


def compare(proj, previews, pairs, say=print):
    """the built film's frames vs the client's numbered previews: side-by-side sheets + share of pixels off by more than 40/255"""
    import numpy as np
    from PIL import Image
    import sys
    if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))
    from render.capture import stills
    from render.serve import serve_in_thread
    proj = Path(proj); spec = json.loads((proj / "film.json").read_text(encoding="utf-8"))
    starts, t = {}, 0.0
    for s in spec["scenes"]: starts[s["id"]] = t + s["duration"] / 2; t += s["duration"]
    keys = [k for k in pairs if k in starts]
    base, srv = serve_in_thread(proj)
    out = proj / "qa" / "psd-compare"
    try: stills(base + "index.html", [round(starts[k], 3) for k in keys], out)
    finally: srv.shutdown()
    rows = []
    for k in keys:
        a = Image.open(out / f"t_{starts[k]:09.3f}.png").convert("RGB")
        pv = next((f for f in Path(previews).iterdir() if f.stem == str(pairs[k])), None)
        if pv is None: say(f"  {k}: no preview {pairs[k]}"); continue
        b = Image.open(pv).convert("RGB").resize(a.size, Image.LANCZOS)
        d = (np.abs(np.asarray(a).astype(int) - np.asarray(b).astype(int)).max(axis=2) > 40).mean()
        sh = Image.new("RGB", (a.width * 2 + 12, a.height), "white"); sh.paste(b, (0, 0)); sh.paste(a, (a.width + 12, 0))
        sh.thumbnail((2400, 1400)); sh.save(out / f"cmp_{k}.png")
        rows.append((k, pairs[k], d)); say(f"  {k} vs preview {pairs[k]}: {d:.2%} of pixels differ by more than 40/255 -> {out / f'cmp_{k}.png'}")
    return rows
