/* motion/anime-layout: a layout change animated by itself: the page goes from one arrangement to another (reorder, anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). row to column, a class added, a card moved into another box) and every child travels by transforms from where it was
   to where it lands (FLIP with anime.js's easing and stagger; anime.js's AutoLayout is made for live pages and cannot be seeked). Target: the box whose children move. params: changes ([{ sel, style,
   add, remove, before, after, append }]), duration, ease, each (s between children) */
AIMK.preset("motion/anime-layout", { params: { changes: [], duration: 0.9, ease: "inOutQuart", each: 0.05, seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "al");
      ctx.code(`  // motion/anime-layout #${el.id}
  AIMKAnime.layout(tl, ${p.at}, ${J("#" + CSS.escape(el.id))}, ${J(p.changes || [])}, ${J({ duration: p.duration, ease: p.ease, delay: { stagger: p.each } })}, ${+p.seed || 1});`);
    }
  },
});
