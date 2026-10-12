/* text/blur-in: the words resolve out of a controlled blur, one after another, rising 8 px into place.
   Port of HyperFrames registry component blur-in (motion only: the source's size, tone and align belong to the film).
   Source recipe: from { opacity 0, y 8, blur 10 px } to sharp, 0.36 s per word, stagger 0.04 s, power3.out.
   The stagger runs across every word of every target (the source selects all the word spans at once). */
AIMK.preset("text/blur-in", {
  params: { duration: 0.36, stagger: 0.04, y: 8, blur: 10, ease: "power3.out" },
  build(tl, els, p, ctx) {
    let k = 0;
    for (const el of els) {
      for (const u of ctx.split(el, "words")) {
        tl.fromTo(u, { opacity: 0, y: p.y, filter: `blur(${p.blur}px)` }, { opacity: 1, y: 0, filter: "blur(0px)", duration: p.duration, ease: p.ease }, p.at + k * p.stagger);
        k++;
      }
    }
  },
});
