"""The README's diagrams as PNG pictures: docs/images/<name>.mmd (Mermaid source) -> docs/images/<name>.png at 2x.
GitHub's web page draws Mermaid code blocks, its mobile app shows them as code (user, 09/10/2026), so the README shows pictures and
keeps the source here for the next change. Needs the network once (Mermaid from jsDelivr, a pinned version).

python engine/tests/readme_diagrams.py            every .mmd in docs/images
python engine/tests/readme_diagrams.py 9-tiers    the ones whose name contains the text"""
import asyncio, html, sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[2]
IMG = KIT / "docs" / "images"
MERMAID = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs"


async def render(files):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1100, "height": 900}, device_scale_factor=2)
        for f in files:
            page = (f'<!doctype html><meta charset="utf-8"><body style="margin:0;padding:12px;background:#ffffff;width:1000px">'
                    f'<pre class="mermaid">{html.escape(f.read_text(encoding="utf-8"))}</pre>'
                    f'<script type="module">import mermaid from "{MERMAID}"; mermaid.initialize({{startOnLoad: false}});'
                    f'await mermaid.run(); document.title = "done";</script>')
            await pg.set_content(page)
            await pg.wait_for_function("document.title === 'done'", timeout=30000)
            svg = await pg.query_selector("svg")
            out = f.with_suffix(".png")
            await svg.screenshot(path=str(out))
            box = await svg.bounding_box()
            print(f"{out.relative_to(KIT)}: {round(box['width'])} x {round(box['height'])} px (shown), 2x pixels")
        await b.close()


if __name__ == "__main__":
    flt = sys.argv[1] if len(sys.argv) > 1 else ""
    files = sorted(f for f in IMG.glob("*.mmd") if flt in f.stem)
    if not files: raise SystemExit(f"no .mmd in {IMG}")
    asyncio.run(render(files))
