/* line/anime-draw: strokes draw themselves: anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). svg.createDrawable turns each path / circle / line into a 0..1 stroke you set as "start end", so a line can grow, travel
   or erase. Target: an <svg> (or a box holding one). params: paths (selector inside, default every shape), from, to ("0 1" draws
   it all; "1 1" erases forward), duration, ease, each (s between shapes) */
AIMK.preset("line/anime-draw", { params: { paths: "path, circle, line, polyline, polygon, ellipse, rect", from: "0 0", to: "0 1", duration: 1.2, ease: "inOutQuart", each: 0.15, seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "ad");
      const sel = "#" + CSS.escape(el.id) + " :is(" + p.paths + ")";
      ctx.code(`  // line/anime-draw #${el.id}
  AIMKAnime.animate(tl, ${p.at}, ${J(sel)}, ${J({ draw: [p.from, p.to], duration: p.duration, ease: p.ease, delay: { stagger: p.each }, drawable: [0, 0] })}, ${+p.seed || 1});`);
    }
  },
});
