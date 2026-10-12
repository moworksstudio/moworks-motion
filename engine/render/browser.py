"""Chromium launch settings shared by every v2 tool that opens a film (same flags as v1 Engine/browser.py, measured on Windows).

--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist   software WebGL (ANGLE on SwiftShader): shaders and
                     three.js render the same on any machine. The older --use-gl=swiftshader (v1) gives the same renderer, but a fresh
                     Chromium then lost its first WebGL context about 0.15 s after creation and restored it about 1 s later (measured
                     05/10/2026, Chromium 153); with the ANGLE flags there is no loss.
--enable-blink-features=CanvasDrawElement   HTML-in-Canvas (drawElementImage): the HyperFrames liquid-glass / device blocks draw live HTML
                     into WebGL textures with it (without it their phone screens stay black, measured 05/10/2026)
--disable-lcd-text   greyscale text anti-aliasing. Without it Chromium on Windows draws LCD subpixel text (orange/blue fringes on every glyph)
                     whenever the layer under the text is opaque; HyperFrames has no such flag (.aimotionkit/archive/AI-Motion-Kit-v2/Docs/Audit/reports/spike2_hyperframes.md)."""
from pathlib import Path

LAUNCH = {"args": ["--use-gl=angle", "--use-angle=swiftshader", "--disable-gpu-compositing", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-lcd-text",
                     "--enable-blink-features=CanvasDrawElement"]}
DRIVER = (Path(__file__).resolve().parent.parent / "runtime" / "driver.js").read_text(encoding="utf-8")
# wait for one animation frame after a seek, before any screenshot: without it a capture can show the frame painted before the seek
# (a text-shadow change with no layout change was missed: caption-glitch-rgb seek check, 06/10/2026; capture.py found the same on _Test_Spec)
PAINT = "new Promise(r => requestAnimationFrame(() => r()))"
# Playwright's own 30 s defaults (page load, screenshot) killed films on Google Drive while it synced and heavy PSD frames (one
# screenshot took 7-24 s: 08/10/2026, test 4). Every kit page uses this instead; the AIMK_TIMEOUT environment variable (seconds) overrides.
import os
TIMEOUT_MS = int(float(os.environ.get("AIMK_TIMEOUT", "300")) * 1000)


def page_timeouts(pg, ms=None):
    pg.set_default_timeout(ms or TIMEOUT_MS); pg.set_default_navigation_timeout(ms or TIMEOUT_MS)
    return pg


async def launch(pw):
    """Chromium with the kit's flags. One retry after 3 s (a browser file held for a moment by a parallel render or an antivirus scan), then
    a plain message: the 2D rebuild test (09/10/2026) got Playwright's "Executable doesn't exist" from the player's Export because Chromium had
    been installed from a chat into the Claude app's private copy of AppData (see common.BROWSERS)."""
    import asyncio
    for k in range(2):
        try: return await pw.chromium.launch(**LAUNCH)
        except Exception as e:
            if k == 0: await asyncio.sleep(3); continue
            if "Executable doesn't exist" in str(e):
                raise RuntimeError("Không thấy Chromium để render. Bấm đúp install.bat trong thư mục kit (chạy ngoài Claude), bước Chromium; "
                                   "đóng các bản render khác đang chạy rồi thử lại.\n" + str(e).splitlines()[0]) from None
            raise


async def open_film(pw, url, timeout_ms=180000, scale=1.0):
    """new Chromium + page with the v2 driver injected; returns (browser, page, info) once the film is ready.
    info = {contract, w, h, duration, markers, stage} (see engine/runtime/driver.js). Raises with the page errors if it never gets ready."""
    b = await launch(pw)
    pg = page_timeouts(await b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=scale))
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(DRIVER)
    await pg.goto(url)
    info = await pg.evaluate("window.__aimk.ready", )
    if not info or info.get("error"):
        await b.close()
        raise RuntimeError(f"film not ready: {(info or {}).get('error')} page errors: {errs[:3]}")
    await pg.set_viewport_size({"width": int(info["w"]), "height": int(info["h"])})
    info["page_errors"] = errs
    info["broken"] = await pg.evaluate("window.__aimk.broken ? window.__aimk.broken() : []")   # pictures still broken after 2 retries
    return b, pg, info
