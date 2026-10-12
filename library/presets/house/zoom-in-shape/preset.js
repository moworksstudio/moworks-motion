/* house/zoom-in-shape: a picture never stands still: it grows slowly (scale 1 -> `to`, default 1.06, over `dur` s, default 12) inside its own shape.
   The container is masked by the picture's alpha (`mask` = another image for the window, e.g. a card's photo window), the picture scales under the mask,
   the outline never moves. Target = the container holding one <img> (or the <img> itself: its parent is then the container).
   Port of Moworks v1 house style P.zoomInShape (house.js). EFFECT, ambient: ctx.code per-frame formula (a proxy tween 0 -> 1, ease "none", over dur);
   the mask and transform-origin are written into the styles. Before `at` the picture is at scale 1, after dur it stays at `to`. */
AIMK.preset("house/zoom-in-shape", { params: { to: 1.06, dur: 12, origin: "50% 50%", mask: null },
  build(tl, els, p, ctx) {
    for (const el of els) {
      const img = el.tagName === "IMG" ? el : el.querySelector("img"), box = el.tagName === "IMG" ? el.parentNode : el; if (!img) continue;
      const m = `url("${p.mask || img.getAttribute("src")}")`;
      Object.assign(box.style, { maskImage: m, webkitMaskImage: m, maskSize: "100% 100%", webkitMaskSize: "100% 100%" });
      img.style.transformOrigin = p.origin;
      ctx.code(String.raw`  // zoom-in-shape #${ctx.id(img)}
  const zs = { v: 0 };
  tl.fromTo(zs, { v: 0 }, { v: 1, duration: ${p.dur}, ease: "none", onUpdate: () => { document.getElementById(${JSON.stringify(img.id)}).style.transform = "scale(" + (1 + (${p.to} - 1) * zs.v).toFixed(4) + ")"; } }, ${p.at});`);
    }
  },
});
