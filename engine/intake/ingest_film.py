"""layout.json + fonts.json (kit.py ingest, engine/intake/ingest.py) -> film.json: one still scene per slide, rebuilt by the Library preset
intake/deck-slide. The film then animates with other presets (element ids: <slide>_f_z<z>), or is checked against the deck's own slide
images with psd_film.compare (same pairing: scene key = "S01", preview file = "1" or "slide-01")."""
import json
from pathlib import Path

from psd_film import ensure_assets


def make_film(proj, slides=None, hold=2.0, say=print):
    proj = Path(proj)
    from ingest import data_file
    D = json.loads(data_file(proj, "layout.json").read_text(encoding="utf-8"))
    fj = data_file(proj, "fonts.json"); fonts = json.loads(fj.read_text(encoding="utf-8")) if fj.exists() else {}
    fmap, faces, opsz, notes = {}, [], {}, []
    for fam, v in fonts.items():
        if fam.startswith("_"): continue
        if v == "MISSING" or not v:
            notes.append(f"font {fam} is MISSING: text falls back to the film font. Put the file in assets/fonts and run kit.py ingest again."); continue
        css = "DK " + fam; fmap[fam] = css
        for f in v:
            if f.get("src"): faces.append({"family": css, "src": f["src"], "weight": f.get("weight", "400"), "style": f.get("style", "normal")})
            if f.get("opsz"): opsz[fam] = f["opsz"]
    W = D.get("canvas", [1920, 1080])[0] if isinstance(D.get("canvas"), list) else 1920
    H = D.get("canvas", [1920, 1080])[1] if isinstance(D.get("canvas"), list) else D.get("height", 1080)
    scenes = []
    for n, S in enumerate(D["slides"], 1):
        if slides and n not in slides: continue
        key = f"S{n:02d}"; slot = f"{key}_f"
        scenes.append({"id": key, "name": f"Slide {n}", "duration": hold,
                       "elements": [{"id": slot, "type": "box", "style": {"left": "0px", "top": "0px", "width": f"{W}px", "height": f"{H}px"}}],
                       "motion": [{"preset": "intake/deck-slide", "target": slot, "at": 0, "params": {"slide": S, "fonts": fmap, "opsz": opsz}}]})
    spec = {"spec": "aimk-motionspec/0", "title": f"Deck ({Path(D.get('source', 'deck')).name})", "size": [W, H], "brand": None,
            "background": "#ffffff", "fonts": faces, "scenes": scenes}
    ensure_assets(proj)
    (proj / "film.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
    say(f"film.json: {len(scenes)} slide scene(s), {hold} s each")
    for x in notes: say("  note: " + x)
    return spec
