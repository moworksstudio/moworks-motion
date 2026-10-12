/* shape/anime-morph: a vector shape morphs into another one: anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). svg.morphTo resamples both outlines to the same points (precision), so any two paths blend. Target: an <svg> (or a box
   holding one). params: path (the selector of the moving path inside it, default the first), to (path data "M..." or a selector of
   another path), duration, ease, precision */
AIMK.preset("shape/anime-morph", { params: { path: "path", to: "M300 60 C 424 60 540 176 540 300 C 540 424 424 540 300 540 C 176 540 60 424 60 300 C 60 176 176 60 300 60 Z",
                                             duration: 1.2, ease: "inOutQuart", precision: 0.33, seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "am");
      const path = el.matches(p.path) ? el : el.querySelector(p.path);
      if (!path) throw new Error(`shape/anime-morph: no ${p.path} in #${el.id}`);
      ctx.id(path, el.id + "_p");
      let to = p.to;
      if (/^\s*[Mm]/.test(String(to))) {                     // a path's data: an invisible path beside it to morph into
        const t = document.createElementNS("http://www.w3.org/2000/svg", "path");
        t.setAttribute("d", to); t.setAttribute("fill", "none"); t.setAttribute("visibility", "hidden"); t.id = path.id + "_to";
        path.parentNode.appendChild(t); to = "#" + t.id;
      }
      ctx.code(`  // shape/anime-morph #${path.id}
  AIMKAnime.animate(tl, ${p.at}, ${J("#" + CSS.escape(path.id))}, ${J({ d: { morphTo: to, precision: p.precision }, duration: p.duration, ease: p.ease })}, ${+p.seed || 1});`);
    }
  },
});
