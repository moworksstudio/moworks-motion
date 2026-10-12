"""Pixel regression over the whole Library: build every Gallery demo, render 3 small frames of it (480 x 270, at 30 / 60 / 95 % of its
length) and save them; then compare two such runs. Written 08/10/2026 for audit round 1 (driver, runtime and build changes touch every
preset): run it with the old engine (a backup copy of engine\\) and the current one, then compare.

python engine\\tests\\demo_pixels.py shoot <out_dir> [--engine <Engine dir>] [--filter text/] [--part 1/2] [--times 3.6,7.3]
python engine\\tests\\demo_pixels.py compare <old_dir> <new_dir>       -> <new_dir>\\compare.md (+ side-by-side PNG per changed demo)

--engine: another copy of engine\\ (e.g. the backup made before a change): its build / runtime / driver are used, with THIS kit's Library.
--times: these seconds instead of 30 / 60 / 95 % (when a change moved the length, e.g. scene cuts snapped to the frame grid)."""
import argparse, asyncio, io, json, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
REAL_ENGINE = HERE.parent
FRACS = (0.30, 0.60, 0.95)


def load_engine(engine_dir):
    engine_dir = Path(engine_dir).resolve()
    sys.path.insert(0, str(engine_dir))
    sys.dont_write_bytecode = True
    import common                                       # noqa: E402
    kit = REAL_ENGINE.parent
    common.KIT = kit
    import build, gallery                               # noqa: E402
    build.LIB = kit / "library" / "presets"; build.LIBS = [build.LIB, kit / "library" / "layouts"]
    for k, v in (("LIBP", kit / "library" / "presets"), ("LIBL", kit / "library" / "layouts"), ("GAL", kit / "library" / "gallery")):
        if hasattr(gallery, k): setattr(gallery, k, v)
    return common, build, gallery


async def shoot_one(pw, d, out, name, times=None):
    from render.serve import serve_in_thread
    from render.browser import open_film, PAINT
    from PIL import Image
    base, srv = serve_in_thread(d)
    try:
        b, pg, info = await open_film(pw, base.rstrip("/") + "/index.html", scale=0.25)
        st = await pg.query_selector(info["stage"])
        for f in (times or FRACS):
            t = f if times else round(info["duration"] * f, 3)
            await pg.evaluate(f"window.__aimk.seek({t})"); await pg.evaluate(PAINT)
            tag = f"t{t:07.3f}" if times else f"{int(f * 100):02d}"
            Image.open(io.BytesIO(await st.screenshot(type="png"))).convert("RGB").resize((480, 270)).save(out / f"{name}__{tag}.png")
        await b.close()
    finally:
        srv.shutdown()


def shoot(a):
    common, build, gallery = load_engine(a.engine or REAL_ENGINE)
    from playwright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    recs = [(n, m) for n, m in gallery.records() if not a.filter or a.filter in n]
    if a.part:
        i, n = (int(x) for x in a.part.split("/")); recs = recs[i - 1::n]
    work = common.work_dir("demo-pixels-" + out.name)
    log, t0 = {}, time.time()

    async def one(d, name):                              # build runs its own event loop, so each demo gets a fresh one here
        async with async_playwright() as pw: await shoot_one(pw, d, out, name, [float(x) for x in a.times.split(",")] if a.times else None)
    for k, (name, meta) in enumerate(recs, 1):
        d = work / gallery.slug(name)
        try:
            gallery.prepare(d, gallery.demo_spec(name, meta))
            build.build(d, say=lambda *x: None)
            asyncio.run(one(d, gallery.slug(name))); log[name] = "ok"
        except BaseException as e:
            log[name] = "FAIL " + str(e)[:200]
        if k % 25 == 0: print(f"  {k}/{len(recs)} ({time.time() - t0:.0f} s)", flush=True)
    (out / f"log{('-' + a.part.replace('/', 'of')) if a.part else ''}.json").write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"{len(recs)} demos, {sum(v != 'ok' for v in log.values())} failed, {time.time() - t0:.0f} s -> {out}")


def compare(a):
    import numpy as np
    from PIL import Image
    old, new = Path(a.old), Path(a.new)
    rows, changed = [], {}
    for f in sorted(new.glob("*__*.png")):
        g = old / f.name
        if not g.exists(): rows.append((f.name, "only new", 0, 0)); continue
        x = np.asarray(Image.open(g).convert("RGB"), np.int16); y = np.asarray(Image.open(f).convert("RGB"), np.int16)
        dd = np.abs(x - y).max(axis=2); share = float((dd > 24).mean() * 100)
        if share > 0.2: changed.setdefault(f.name.rsplit("__", 1)[0], []).append((f.name, share, int(dd.max())))
    for name, items in changed.items():                 # side-by-side sheet: old | new for each changed time
        tiles = []
        for fn, _, _ in items:
            tiles += [Image.open(old / fn).convert("RGB"), Image.open(new / fn).convert("RGB")]
        sheet = Image.new("RGB", (960, 270 * len(items)), "white")
        for i in range(len(items)): sheet.paste(tiles[2 * i], (0, 270 * i)); sheet.paste(tiles[2 * i + 1], (480, 270 * i))
        sheet.save(new / f"_diff__{name}.png")
    missing = [g.name for g in old.glob("*__*.png") if not (new / g.name).exists()]
    md = [f"# Demo pixel compare: {old.name} → {new.name}", "",
          f"- frames compared: {len(list(new.glob('*__*.png')))}; demos with a change (> 0.2 % of pixels off by > 24/255): {len(changed)}; frames missing in new: {len(missing)}", ""]
    for name, items in sorted(changed.items(), key=lambda kv: -max(s for _, s, _ in kv[1])):
        md.append(f"- `{name}`: " + ", ".join(f"{fn.rsplit('__', 1)[1][:-4]}{'' if fn.rsplit('__', 1)[1].startswith('t') else ' % length'}: {s:.1f} % px (max {m})" for fn, s, m in items) + f" → `_diff__{name}.png`")
    if missing: md += ["", "Missing in new: " + ", ".join(missing[:40])]
    (new / "compare.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print("\n".join(md[:4]) + f"\n-> {new / 'compare.md'}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("shoot"); s.add_argument("out"); s.add_argument("--engine"); s.add_argument("--filter"); s.add_argument("--part"); s.add_argument("--times")
    c = sub.add_parser("compare"); c.add_argument("old"); c.add_argument("new")
    a = ap.parse_args()
    shoot(a) if a.cmd == "shoot" else compare(a)
