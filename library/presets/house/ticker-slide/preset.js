/* house/ticker-slide: small header / footer text: a header (centre in the upper half of the frame) slides in from the left, a footer from the right
   (x = +-160 px -> 0, expo.out 0.7 s) with a 0.3 s fade.
   Port of Moworks v1 house style P.tickerSlide (house.js). EFFECT. Params: dist (160), dir (-1 / 1, null = by the vertical centre), stagger (0 s).
   The vertical centre comes from the layout position (offset chain up to #stage), not getBoundingClientRect (see slide-side). */
AIMK.preset("house/ticker-slide", { params: { dist: 160, dir: null, stagger: 0 },
  build(tl, els, p, ctx) {
    els.forEach((el, i) => {
      let top = 0, n = el; while (n && n.id !== "stage") { top += n.offsetTop; n = n.offsetParent; }
      const dir = p.dir ?? (((top + el.offsetHeight / 2) < ctx.H / 2) ? -1 : 1), t = p.at + i * p.stagger;
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, t);
      tl.fromTo(el, { x: dir * p.dist }, { x: 0, duration: 0.7, ease: "expo.out" }, t);
    });
  },
});
