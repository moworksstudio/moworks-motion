/* text/focus-blur-resolve: each word pulls into focus, shrinking from 108 % to its size out of a 16 px blur (0.52 s, power3.out, 0.05 s apart),
   like a lens racking onto the line. Port of HyperFrames registry component focus-blur-resolve (scale, blur, timing and ease as in the source; its
   blur variable soft | standard | heavy = x 0.45 / 1 / 2.2 is a param). EFFECT on the target text element(s); the stagger runs across all targets. */
AIMK.preset("text/focus-blur-resolve", {
  params: { blur: "standard", scale: 1.08, duration: 0.52, stagger: 0.05 },
  build(tl, els, p, ctx) {
    const b = +(16 * ({ soft: 0.45, standard: 1, heavy: 2.2 }[p.blur] || 1)).toFixed(2);
    let k = 0;
    for (const el of els) for (const w of ctx.split(el, "words"))
      tl.fromTo(w, { opacity: 0, scale: p.scale, filter: `blur(${b}px)` }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: p.duration, ease: "power3.out" }, +(p.at + k++ * p.stagger).toFixed(4));
  },
});
