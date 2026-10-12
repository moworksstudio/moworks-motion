/* text/soft-blur-in: the whole element slides 28 px into place out of an 18 px blur while it fades in (0.8 s, power3.out); several targets follow
   0.08 s apart. Port of HyperFrames registry component soft-blur-in (offset, blur, timing and ease as in the source; its variables are params:
   distance close | standard | far = 14 / 28 / 52 px, direction up | down, blur soft | standard | heavy = 8 / 18 / 34 px). EFFECT on any element. */
AIMK.preset("text/soft-blur-in", {
  params: { distance: "standard", direction: "up", blur: "standard", duration: 0.8, stagger: 0.08 },
  build(tl, els, p, ctx) {
    const y = ({ close: 14, standard: 28, far: 52 }[p.distance] || 28) * (p.direction === "down" ? -1 : 1), b = { soft: 8, standard: 18, heavy: 34 }[p.blur] || 18;
    els.forEach((el, i) => tl.fromTo(el, { opacity: 0, y, filter: `blur(${b}px)` }, { opacity: 1, y: 0, filter: "blur(0px)", duration: p.duration, ease: "power3.out" }, +(p.at + i * p.stagger).toFixed(4)));
  },
});
