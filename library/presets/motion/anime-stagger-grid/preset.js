/* motion/anime-stagger-grid: the children of a box arrive as a wave across their grid: anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). anime.js stagger with the grid measured from where each child really is (any layout, not just even rows), a start
   point (center, first, last, random, [col, row]), an axis, a seeded jitter and a spring ease. Target: the box; its direct children move.
   params: props (anime.js values), each, from, grid (true = measured, or [cols, rows]), axis (null | x | y), jitter (s), duration, ease, seed */
AIMK.preset("motion/anime-stagger-grid", { params: { props: { scale: [0, 1], opacity: [0, 1] }, each: 0.06, from: "center", grid: true, axis: null, jitter: 0.02,
                                                     duration: 0.8, ease: { spring: { bounce: 0.45, duration: 0.6 } }, seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "ag");
      const d = { stagger: p.each, from: p.from, grid: p.grid };
      if (p.axis) d.axis = p.axis; if (p.jitter) { d.jitter = p.jitter; d.seed = +p.seed || 1; }
      ctx.code(`  // motion/anime-stagger-grid #${el.id}
  AIMKAnime.animate(tl, ${p.at}, ${J("#" + CSS.escape(el.id) + " > *")}, ${J(Object.assign({}, p.props, { duration: p.duration, ease: p.ease, delay: d }))}, ${+p.seed || 1});`);
    }
  },
});
