"""Build every library preset's Gallery demo with the current build.py (no render, no clip): which demos fail to build, which have moves
that overlap on one property (build shortens the simple ones, "CHECK" for the rest), which had tweens that matched nothing.
Written 07/10/2026 when build.py started to fix in / out overlaps and to stop on a motion whose target id is missing.

python engine\\tests\\bake_library.py [filter]     -> engine\\tests\\bake_library.md (and printed)"""
import sys, time
from pathlib import Path

sys.dont_write_bytecode = True
ENGINE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ENGINE))
import build, gallery                                   # noqa: E402
from common import work_dir                             # noqa: E402


def main():
    filt = sys.argv[1] if len(sys.argv) > 1 else None
    recs = [(n, m) for n, m in gallery.records() if not filt or filt in n]
    root = work_dir("bake-library"); rows, t0 = [], time.time()
    for k, (name, meta) in enumerate(recs, 1):
        d = root / gallery.slug(name); notes, rep = [], {}
        try:
            gallery.prepare(d, gallery.demo_spec(name, meta))
            build.build(d, say=lambda *a: notes.append(" ".join(str(x) for x in a)), report=rep)
            ov = rep.get("overlaps") or {}
            rows.append((name, "ok", len(ov.get("shortened", [])), len(ov.get("check", [])), [x for x in notes if "overlap" in x or "matched no" in x]))
        except BaseException as e:                      # SystemExit from build too
            rows.append((name, "FAIL", 0, 0, [str(e)[:300]]))
        if k % 25 == 0: print(f"  {k}/{len(recs)} ({time.time() - t0:.0f} s)", flush=True)
    bad = [r for r in rows if r[1] == "FAIL"]; ovl = [r for r in rows if r[2] or r[3]]
    md = [f"# Library bake check ({time.strftime('%d/%m/%Y %H:%M')}, {len(rows)} demos, {time.time() - t0:.0f} s)", "",
          f"- failed to build: {len(bad)}", f"- demos with overlapping moves: {len(ovl)} (shortened {sum(r[2] for r in rows)}, to check {sum(r[3] for r in rows)})", ""]
    if bad: md += ["## Failed", ""] + [f"- `{r[0]}`: {r[4][0]}" for r in bad] + [""]
    if ovl: md += ["## Overlaps", ""] + [f"- `{r[0]}`: shortened {r[2]}, check {r[3]}" + "".join(f"\n  - {x.strip()}" for x in r[4][:4]) for r in ovl]
    out = Path(__file__).with_name("bake_library.md"); out.write_text("\n".join(md) + "\n", encoding="utf-8")
    print("\n".join(md[:6])); print(f"-> {out}")


if __name__ == "__main__":
    main()
