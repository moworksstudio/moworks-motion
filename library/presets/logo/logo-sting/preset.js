/* logo/logo-sting: a wordmark (or your logo image) lands from scale 1.15 on a hard ease-out; at the impact one accent ring expands and fades and
   exactly one frame of white flashes, then the lockup holds completely still.
   Port of HyperFrames registry component logo-sting. BLOCK: the lockup is built inside the target (an empty box, usually the whole frame).
   Source timing kept: land 0.55 s (expo.out, 1.15 -> 1), ring 0.40 s (scale 0.34 -> 2.4, opacity 0.92 -> 0, power3.out) from the impact, flash 1/30 s.
   No brand logo is shipped: the default mark is the word "LOGO"; params.image (a path like "assets/logo.png") replaces it. */
AIMK.preset("logo/logo-sting", {
  params: { wordmark: "LOGO", image: "", imageHeight: 190, accent: "#5df28b", fg: "#f8fafc" },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, t = p.at, IMPACT = 0.55, RING = 0.4, FLASH = 1 / 30;
    const ringPx = +Math.min(0.42 * W, 0.72 * H).toFixed(1), ringBorder = +Math.min(0.0034 * W, 0.0062 * H).toFixed(2);
    const fs = +Math.min(0.105 * W, 0.18 * H).toFixed(1);
    ctx.css("logo/logo-sting", `
.lgs { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.lgs-ring { position: absolute; z-index: 1; aspect-ratio: 1; border-style: solid; border-radius: 50%; opacity: 0; box-sizing: border-box; }
.lgs-mark { position: relative; z-index: 2; font-weight: 850; line-height: 0.9; letter-spacing: -0.055em; text-align: center; white-space: nowrap; transform-origin: 50% 50%; }
.lgs-flash { position: absolute; inset: 0; z-index: 3; background: #ffffff; opacity: 0; }`);
    for (const slot of els) {
      const box = ctx.make(slot, "div", "ls", { cls: "lgs" });
      const ring = ctx.make(box, "div", "ring", { cls: "lgs-ring", style: { width: ringPx + "px", borderWidth: ringBorder + "px", borderColor: p.accent } });
      const mark = p.image
        ? ctx.make(box, "img", "mark", { cls: "lgs-mark", attrs: { src: p.image, alt: "" }, style: { height: p.imageHeight + "px", maxWidth: Math.round(0.9 * W) + "px" } })
        : ctx.make(box, "div", "mark", { cls: "lgs-mark", text: p.wordmark, style: { color: p.fg, fontSize: fs + "px", maxWidth: Math.round(0.9 * W) + "px" } });
      const flash = ctx.make(box, "div", "flash", { cls: "lgs-flash" });
      tl.set(mark, { opacity: 0, ease: "none" }, 0);
      tl.set(ring, { scale: 0.34, opacity: 0, ease: "none" }, 0);
      tl.set(mark, { opacity: 1, ease: "none" }, t);
      tl.fromTo(mark, { scale: 1.15 }, { scale: 1, duration: IMPACT, ease: "expo.out" }, t);
      tl.set(ring, { opacity: 0.92, ease: "none" }, t + IMPACT);
      tl.to(ring, { scale: 2.4, opacity: 0, duration: RING, ease: "power3.out" }, t + IMPACT);
      tl.set(flash, { opacity: 1, ease: "none" }, t + IMPACT);
      tl.set(flash, { opacity: 0, ease: "none" }, t + IMPACT + FLASH);
    }
  },
});
