/* text/tracking-in: the text fades in while its letter-spacing closes from wide to tight, rising 8 px into place.
   Port of HyperFrames registry component tracking-in (motion only: the source's tone belongs to the film).
   Source recipe: opacity 0 -> 1, letter-spacing 0.28em -> 0.02em, y 8 -> 0, 0.9 s, power3.out, stagger 0.1 s across the targets.
   The source variable "tracking" (tight 0.6 / standard 1 / wide 1.8) multiplies the whole curve: param `reach`.
   The text settles at letter-spacing `to` (0.02em), so give the film's text the same value to land exactly on its layout. */
AIMK.preset("text/tracking-in", {
  params: { duration: 0.9, stagger: 0.1, from: 0.28, to: 0.02, reach: 1, y: 8, ease: "power3.out" },
  build(tl, els, p, ctx) {
    const em = v => +(v * p.reach).toFixed(4) + "em";
    els.forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, letterSpacing: em(p.from), y: p.y }, { opacity: 1, letterSpacing: em(p.to), y: 0, duration: p.duration, ease: p.ease }, p.at + i * p.stagger);
    });
  },
});
