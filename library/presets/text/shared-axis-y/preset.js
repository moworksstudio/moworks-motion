/* text/shared-axis-y: the words rise 32 px into place one after another, quick and plain (0.22 s, power2.out, 0.075 s apart): the Material
   "shared axis Y" move. Port of HyperFrames registry component shared-axis-y (offset, timing and ease as in the source; its variables are params:
   direction up | down, distance close | standard | far = x 0.5 / 1 / 1.85). EFFECT on the target text element(s); the stagger runs across all targets. */
AIMK.preset("text/shared-axis-y", {
  params: { direction: "up", distance: "standard", offset: 32, duration: 0.22, stagger: 0.075 },
  build(tl, els, p, ctx) {
    const y = +(p.offset * (p.direction === "down" ? -1 : 1) * ({ close: 0.5, standard: 1, far: 1.85 }[p.distance] || 1)).toFixed(2);
    let k = 0;
    for (const el of els) for (const w of ctx.split(el, "words"))
      tl.fromTo(w, { opacity: 0, y }, { opacity: 1, y: 0, duration: p.duration, ease: "power2.out" }, +(p.at + k++ * p.stagger).toFixed(4));
  },
});
