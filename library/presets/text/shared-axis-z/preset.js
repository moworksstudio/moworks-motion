/* text/shared-axis-z: the words swell from 72 % to full size with a springy overshoot as they fade in (0.34 s, back.out(1.8), 0.06 s apart): the
   Material "shared axis Z" move. Port of HyperFrames registry component shared-axis-z (scale, timing and ease as in the source; its variables are
   params: direction in | out (out settles down from 128 %), depth shallow | standard | deep = x 0.5 / 1 / 1.85 of the 0.28 gap). EFFECT on the
   target text element(s); the stagger runs across all targets. */
AIMK.preset("text/shared-axis-z", {
  params: { direction: "in", depth: "standard", duration: 0.34, stagger: 0.06 },
  build(tl, els, p, ctx) {
    const s0 = +(1 - 0.28 * (p.direction === "out" ? -1 : 1) * ({ shallow: 0.5, standard: 1, deep: 1.85 }[p.depth] || 1)).toFixed(4);
    let k = 0;
    for (const el of els) for (const w of ctx.split(el, "words"))
      tl.fromTo(w, { opacity: 0, scale: s0 }, { opacity: 1, scale: 1, duration: p.duration, ease: "back.out(1.8)" }, +(p.at + k++ * p.stagger).toFixed(4));
  },
});
