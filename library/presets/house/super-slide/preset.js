/* house/super-slide: headline lines enter top to bottom, alternating: the upper line from the left, the next from the right, and so on
   (x = +-520 px -> 0, expo.out 0.85 s, 0.12 s apart) with a 0.3 s fade-in.
   Port of Moworks v1 house style P.superSlide (house.js). EFFECT: target = the lines (any order, they are sorted by their top edge).
   Params: first (-1 = the upper line from the left, 1 = from the right), stagger (0.12), dist (520), dur (0.85), ease ("expo.out").
   For rotated text, put the line inside a wrapper rotated like the text and target the inner element: it slides along its own baseline. */
AIMK.preset("house/super-slide", { params: { first: -1, stagger: 0.12, dist: 520, dur: 0.85, ease: "expo.out" },
  build(tl, els, p, ctx) {
    const L = els.slice().sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    L.forEach((el, i) => {
      const t = p.at + i * p.stagger, dir = p.first * (i % 2 ? -1 : 1);
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, t);
      tl.fromTo(el, { x: dir * p.dist }, { x: 0, duration: p.dur, ease: p.ease }, t);
    });
  },
});
