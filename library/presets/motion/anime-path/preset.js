/* motion/anime-path: an element travels along an SVG path, turned to its direction: anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). svg.createMotionPath gives translateX, translateY and rotate along the path. Place the element at the SVG's top-left
   corner (its centre there: margins of minus half its size); the path's own units are used. params: path (selector), offset (0..1
   start), duration, ease, rotate (false keeps it upright) */
AIMK.preset("motion/anime-path", { params: { path: "#route", offset: 0, duration: 2.4, ease: "inOutSine", rotate: true, seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "ap");
      const spec = { motionPath: [p.path, p.offset], duration: p.duration, ease: p.ease };
      if (!p.rotate) spec.motionPathRotate = false;
      ctx.code(`  // motion/anime-path #${el.id} along ${p.path}
  AIMKAnime.animate(tl, ${p.at}, ${J("#" + CSS.escape(el.id))}, ${J(spec)}, ${+p.seed || 1});`);
    }
  },
});
