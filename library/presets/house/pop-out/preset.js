/* house/pop-out: little things leave by shrinking to nothing (scale 1 -> 0, back.in(2), 0.35 s).
   Port of Moworks v1 house style P.popOut (house.js). EFFECT. Params: stagger (s between elements, default 0), dur, ease, origin (written into the element's style). */
AIMK.preset("house/pop-out", { params: { stagger: 0, dur: 0.35, ease: "back.in(2)", origin: "50% 50%" },
  build(tl, els, p, ctx) {
    els.forEach((el, i) => {
      el.style.transformOrigin = p.origin;
      tl.fromTo(el, { scale: 1 }, { scale: 0, duration: p.dur, ease: p.ease, immediateRender: false }, p.at + i * p.stagger);
    });
  },
});
