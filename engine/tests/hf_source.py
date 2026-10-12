"""Shared by engine/tests/hf_blocks.py and hf_templates.py (11/10/2026): where a HyperFrames item's files come from, where its kit preset
goes, the SHA-256 of what is copied as shipped, and the registry-item.json a skill's page does not have.

Sources (a table row's keys):
  (none)            the registry snapshot, commit 0ca69472: %USERPROFILE%/.aimotionkit/work/hf-registry/registry/<kind>/<name>/
  "commit"          a newer registry commit: %USERPROFILE%/.aimotionkit/sources/hf-registry-<first 7>/registry/<kind>/<name>/
  "skill"           a folder inside a HyperFrames skill, e.g. "music-to-video/references/templates" (with "commit"):
                    %USERPROFILE%/.aimotionkit/sources/hf-skills-<first 7>/skills/<skill>/<name>/
  "incoming"        added from 11/10/2026: written to library/incoming/layouts/ ("Mới nhập") until the user keeps it on the Gallery
                    (then re-runs write it in the library); its preset.json "source" carries "sha256" of every file copied as shipped,
                    which kit.py gallery checks (common.as_shipped)."""
import datetime, hashlib, html, json, os, re
from pathlib import Path

KIT = Path(__file__).resolve().parents[2]
LOCAL = Path(os.environ["USERPROFILE"]) / ".aimotionkit"
COMMIT = "0ca69472d93cf088c836bed3dc7df252247e2101"


def source(row, kind, reg):
    """(the item's folder, its commit, its path in the repo)"""
    commit = row.get("commit") or COMMIT
    if row.get("skill"):
        return LOCAL / "sources" / f"hf-skills-{commit[:7]}" / "skills" / row["skill"] / reg, commit, f"skills/{row['skill']}/{reg}"
    root = LOCAL / "work" / "hf-registry" / "registry" if commit == COMMIT else LOCAL / "sources" / f"hf-registry-{commit[:7]}" / "registry"
    return root / kind / reg, commit, f"registry/{kind}/{reg}"


def item_meta(src, reg, row):
    """registry-item.json, or for a skill's page (none there): the row's title / "about" / tags, the page's data-composition-variables"""
    f = src / "registry-item.json"
    if f.exists(): return json.loads(f.read_text(encoding="utf-8"))
    main = row.get("file") or "index.html"
    page = (src / main).read_text(encoding="utf-8")
    m = re.search(r"data-composition-variables='([^']*)'", page) or re.search(r'data-composition-variables="([^"]*)"', page)
    return {"title": row.get("title") or reg, "description": row.get("about", ""), "tags": row.get("tags") or [],
            "variables": json.loads(html.unescape(m.group(1))) if m else [], "files": [{"path": main}]}


def dest(name, row):
    """(folder, waiting, its old preset.json): library/layouts/<name>, or "Mới nhập" for an incoming row not kept yet"""
    d = KIT / "library" / "layouts" / name
    waiting = bool(row.get("incoming")) and not (d / "preset.js").exists()
    if waiting: d = KIT / "library" / "incoming" / "layouts" / name
    old = json.loads((d / "preset.json").read_text(encoding="utf-8")) if (d / "preset.json").exists() else {}
    return d, waiting, old


def sha256s(src, copied):
    """{path under assets/: SHA-256} of the files copied from src (folders: every file in them)"""
    out = {}
    for f in copied:
        for x in ([f] if f.is_file() else sorted(y for y in f.rglob("*") if y.is_file() and y.name != "desktop.ini")):
            out[x.relative_to(src).as_posix()] = hashlib.sha256(x.read_bytes()).hexdigest()
    return out


def finish(pj, row, waiting, old):
    """the incoming / kept record of preset.json"""
    if waiting: pj["incoming"] = old.get("incoming") or {"at": datetime.date.today().isoformat(), "note": "mẫu HyperFrames mới, chờ bạn Giữ / Bỏ trên Gallery"}
    elif old.get("kept"): pj["kept"] = old["kept"]
    return pj
