/* text/scan-band: one slanted distortion band sweeps across a clean wordmark; inside the band the text splits into red and cyan copies with a small
   sideways shift, outside it stays clean. Port of HyperFrames registry component scan-band (as in the source: fade in 0.45 s power2.out, then the
   band sweeps from -60 % to 160 % of the frame width in 1.65 s power2.out; band 12 % of the frame wide, its slant from band_angle (12 deg) the way
   the source computes it (lean = tan(angle) x 50 % of the width over the full height); copies red #ff3158 at -0.8 % W and cyan #36efff at +1.7 % W
   (90 % opacity) under a text-colour copy at +0.65 % W; optional exit fade 0.45 s power2.in at `duration`). EFFECT on a text element: the band is
   computed in frame coordinates, so it crosses the text where the source's frame-wide band would. AE: png (clip-path). */
AIMK.preset("text/scan-band", {
  params: { angle: 12, fadeIn: true, sweep: 1.65, exit: "none", duration: 3.5 },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, stage = document.getElementById("stage"), k = (stage.getBoundingClientRect().width / W) || 1;
    const a = Math.max(-30, Math.min(30, +p.angle || 0)), slope = Math.tan(a * Math.PI / 180) * W / H, half = 0.06 * W;
    const IN = p.fadeIn ? 0.45 : 0;
    for (const el of els) {
      const txt = el.textContent.normalize("NFC"), cs = getComputedStyle(el);
      const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(), left = (r.left - s.left) / k, h = el.offsetHeight, lean = +(slope * h / 2).toFixed(2);
      ctx.id(el, "t"); el.textContent = txt;
      if (cs.position === "static") el.style.position = "relative";
      const band = ctx.make(el, "span", "band", { style: { position: "absolute", inset: "0px", overflow: "hidden", "--sb-pos": `${(-0.6 * W - left).toFixed(2)}px`,
        clipPath: `polygon(calc(var(--sb-pos) - ${half}px - ${lean}px) 0%, calc(var(--sb-pos) + ${half}px - ${lean}px) 0%, calc(var(--sb-pos) + ${half}px + ${lean}px) 100%, calc(var(--sb-pos) - ${half}px + ${lean}px) 100%)` } });
      const pad = { paddingTop: cs.paddingTop, paddingRight: cs.paddingRight, paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft };
      [["red", "#ff3158", -0.008, 0.9], ["cyan", "#36efff", 0.017, 0.9], ["core", cs.color, 0.0065, 1]].forEach(([n, c, dx, o]) =>
        ctx.make(band, "span", n, { text: txt, style: Object.assign({ position: "absolute", inset: "0px", color: c, opacity: String(o), transform: `translateX(${(dx * W).toFixed(2)}px)`, textShadow: "none" }, pad) }));
      if (IN) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: IN, ease: "power2.out" }, p.at);
      tl.fromTo(band, { "--sb-pos": `${(-0.6 * W - left).toFixed(2)}px` }, { "--sb-pos": `${(1.6 * W - left).toFixed(2)}px`, duration: p.sweep, ease: "power2.out" }, +(p.at + IN).toFixed(4));
      if (p.exit === "fade") tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.45, ease: "power2.in" }, +(p.at + Math.max(p.duration, IN + p.sweep + 0.45) - 0.45).toFixed(4));
    }
  },
});
