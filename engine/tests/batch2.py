"""Batch 2 port tracker (user 06/10/2026: port every HyperFrames registry item still missing, then the iart motions HF lacks).

  python engine/tests/batch2.py                       refresh %USERPROFILE%/.aimotionkit/sources/hf-batch2.md from hf-batch2.json there (+ the ported presets)
  python engine/tests/batch2.py set <item> <status>   status: todo | ported:<group/name> | merged:<group/name> | skip:<reason>

The JSON keeps one row per registry item (kind, title, tags, size, libraries). An item counts as ported when a Library preset.json names it
in "source.path" (so the table follows the library by itself); "merged" = folded into another preset (variants), "skip" needs a reason."""
import json, os, sys, zipfile
from pathlib import Path

KIT = Path(__file__).resolve().parents[2]
SOURCES = Path(os.environ.get("USERPROFILE") or Path.home()) / ".aimotionkit" / "sources"   # the maintainer's sources, not in the kit (08/10/2026)
DB = SOURCES / "hf-batch2.json"
MD = SOURCES / "hf-batch2.md"
ZIP = SOURCES / "hyperframes-registry-0ca6947.zip"


def ported_map():
    out = {}
    for root in (KIT / "library" / "presets", KIT / "library" / "layouts"):
        for pj in root.rglob("preset.json"):
            m = json.loads(pj.read_text(encoding="utf-8")); s = m.get("source") or {}
            paths = s.get("paths") or ([s["path"]] if s.get("path") else [])
            if "hyperframes" not in (s.get("repo") or ""): continue
            for p in paths:
                parts = p.split("/")
                if len(parts) > 2: out.setdefault(parts[2], m.get("name"))
    return out


def build_db():
    z = zipfile.ZipFile(ZIP); items = {}
    for n in z.namelist():
        p = n.split("/")
        if len(p) > 3 and p[0] == "registry" and p[1] in ("blocks", "components", "examples") and p[3] == "registry-item.json":
            meta = json.loads(z.read(n).decode("utf-8"))
            items[p[2]] = {"kind": p[1][:-1], "title": meta.get("title", ""), "tags": (meta.get("tags") or [])[:6], "status": "todo"}
    return items


def main():
    db = json.loads(DB.read_text(encoding="utf-8")) if DB.exists() else build_db()
    if len(sys.argv) > 3 and sys.argv[1] == "set":
        db[sys.argv[2]]["status"] = sys.argv[3]
    pm = ported_map()
    for k, r in db.items():
        if k in pm and not r["status"].startswith(("merged", "skip")): r["status"] = "ported:" + pm[k]
    DB.parent.mkdir(parents=True, exist_ok=True)
    DB.write_text(json.dumps(db, indent=1, ensure_ascii=False), encoding="utf-8")
    done = sum(1 for r in db.values() if not r["status"].startswith("todo"))
    lines = [f"# Đợt 2: port registry HyperFrames ({done}/{len(db)} mẫu đã xử lý)", "",
             "Sinh bởi `python engine\\tests\\batch2.py`. Trạng thái: todo = chưa làm; ported = đã port thành mẫu trong Library;",
             "merged = gộp vào một mẫu khác (biến thể); skip = bỏ, có lý do.", "", "| Mẫu HF | Loại | Trạng thái | Tiêu đề | Tag |", "|---|---|---|---|---|"]
    for k in sorted(db, key=lambda k: (db[k]["status"].startswith("todo"), db[k]["kind"], k)):
        r = db[k]; lines.append(f"| {k} | {r['kind']} | {r['status']} | {r['title']} | {', '.join(r['tags'])} |")
    MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{done}/{len(db)} handled -> {MD}")


if __name__ == "__main__":
    main()
