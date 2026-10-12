/* house/slide-side: a picture or a character slides in from its nearer side of the frame (x = +-min(0.4 * width, max) -> 0, expo.out 0.9 s) while it fades in (0.35 s).
   Port of Moworks v1 house style P.slideSide (house.js). EFFECT. A wide picture (width >= fadeWidth, default 1500 px) only fades (0.6 s).
   Params: stagger (0.1 s between elements), dir (-1 from the left, 1 from the right; null = the nearer side by the element's centre), max (380 px), dur, ease, fadeWidth.
   v1 measured the centre with getBoundingClientRect; here the layout position (offset chain up to #stage) is used, so a parent that is already scaled by another
   pop at build time does not flip the side. */
AIMK.preset("house/slide-side", { params: { stagger: 0.1, dir: null, max: 380, dur: 0.9, ease: "expo.out", fadeWidth: 1500 },
  build(tl, els, p, ctx) {
    els.forEach((el, i) => {
      const t = p.at + i * p.stagger, w = el.offsetWidth;
      if (w >= p.fadeWidth) { tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, t); return; }
      let left = 0, n = el; while (n && n.id !== "stage") { left += n.offsetLeft; n = n.offsetParent; }
      const dir = p.dir ?? ((left + w / 2) < ctx.W / 2 ? -1 : 1);
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" }, t);
      tl.fromTo(el, { x: dir * Math.min(0.4 * w, p.max) }, { x: 0, duration: p.dur, ease: p.ease }, t);
    });
  },
});
