/* text/anime-scramble: text scrambles through a character set and settles letter by letter: anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). scrambleText (reveal rate, settle, perturbation, cursor, direction) with a fixed seed. Character sets:
   lowercase, uppercase, numbers, symbols, braille, blocks, shades, or your own ("a-z0-9"). params: chars, text (null = its own text),
   cursor, revealRate (letters a second), settleDuration (s), settleRate, perturbation (0..1), from left | right | center | random, seed */
AIMK.preset("text/anime-scramble", { params: { chars: "blocks", text: null, cursor: null, revealRate: 24, settleDuration: 0.35, settleRate: 30, perturbation: 0, from: "left", seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "as");
      const s = { chars: p.chars, revealRate: p.revealRate, settleDuration: p.settleDuration, settleRate: p.settleRate, perturbation: p.perturbation, from: p.from, seed: +p.seed || 1 };
      if (p.text != null) s.text = p.text;
      if (p.cursor) s.cursor = p.cursor;
      ctx.code(`  // text/anime-scramble #${el.id}
  AIMKAnime.animate(tl, ${p.at}, ${J("#" + CSS.escape(el.id))}, ${J({ textContent: { scramble: s } })}, ${+p.seed || 1});`);
    }
  },
});
