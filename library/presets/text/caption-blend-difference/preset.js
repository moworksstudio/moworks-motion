/* text/caption-blend-difference: captions that invert against whatever is behind them (mix-blend-mode difference): white on dark areas, black on
   light ones, the complement on colour. Port of HyperFrames registry component caption-blend-difference, a passive CSS treatment (no motion
   of its own): EFFECT on the target text element(s) plus the source's example entrance (y 50, opacity 0 -> in, 0.6 s expo.out).
   The blend needs an isolated group holding both the text and what is behind it: the scene's inner box gets isolation: isolate.
   params.mode: difference | exclusion (soft) | screen; params.entrance false = no entrance tween. */
AIMK.preset("text/caption-blend-difference", {
  params: { mode: "difference", color: "#ffffff", entrance: true, duration: 0.6, y: 50 },
  build(tl, els, p, ctx) {
    const mode = ["difference", "exclusion", "screen"].includes(p.mode) ? p.mode : "difference";
    for (const el of els) {
      el.style.mixBlendMode = mode; el.style.color = p.color;
      const inner = el.closest(".inner") || el.parentElement;            // the scene's inner box: the isolated group the blend composites in
      if (inner) inner.style.isolation = "isolate";
      if (p.entrance) tl.fromTo(el, { y: p.y, opacity: 0 }, { y: 0, opacity: 1, duration: p.duration, ease: "expo.out" }, p.at);
    }
  },
});
