/* house/burst-pop: starbursts behind a number pop from their lower middle (no turn, back.out(1.7), 0.7 s, origin 50% 60%).
   Port of Moworks v1 house style P.burstPop (house.js, a v1 film, 3 Oct 2026). EFFECT: animates the target elements (a pop is scale 0 -> 1 plus a short fade-in).
   Every element has its own spring feel by hash: s = ctx.hash(el) (the v1 hash of data-seed / id / text); half of them (s <= 0.5) get
   the soft elastic, the others back.out(3), unless `ease` forces one. The turn at the start is (s - 0.5) * 2 * rot degrees.
   Params (v1 option names): stagger = seconds between elements; spread = total seconds shared in hash order (replaces stagger when set);
   rot = max start turn in degrees (0 = no turn); origin = transform-origin (written into the element's style); dur, ease = force one value. */
AIMK.preset("house/burst-pop", { params: { stagger: 0.06, spread: null, rot: 0, origin: "50% 60%", dur: 0.7, ease: "back.out(1.7)" },
  build(tl, els, p, ctx) {
    const order = els.map(el => [el, ctx.hash(el)]).sort((a, b) => (p.spread != null ? a[1] - b[1] : 0));
    order.forEach(([el, s], i) => {
      const t = p.at + (p.spread != null ? (order.length > 1 ? p.spread * i / (order.length - 1) : 0) : i * p.stagger);
      const springy = s <= 0.5 && !p.ease, dur = p.dur ?? (springy ? 1.0 : 0.7);
      el.style.transformOrigin = p.origin;
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, t);
      const from = { scale: 0 }, to = { scale: 1, duration: dur, ease: p.ease || (springy ? "elastic.out(1, 0.55)" : "back.out(3)") };
      if (p.rot) { from.rotation = (s - 0.5) * 2 * p.rot; to.rotation = 0; }
      tl.fromTo(el, from, to, t);
    });
  },
});
