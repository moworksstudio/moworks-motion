/* text/anime-roll: each letter (or word) rolls out of its clipped slot and its copy rolls in, the way anime.js 4.5.0 (engine/vendor/libs/anime, MIT, as shipped) on the film's clock through
   engine/vendor/libs/aimk/anime-sync.js (12/10/2026). splitText with a clip wrap and a clone below (or above) each letter, a stagger from where you choose; `to` puts
   another text in the copies (a word turns into a new one, letter by letter, like a slot board). params: by chars | words, dir up | down,
   each (s between letters), from first | center | last | random | index, duration, ease, to (null = the same text), seed */
AIMK.preset("text/anime-roll", { params: { by: "chars", dir: "up", each: 0.035, from: "first", duration: 0.7, ease: "outExpo", to: null, seed: 1 },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "ar");
      const by = p.by === "words" ? "words" : "chars", one = by === "words" ? "word" : "char";
      AIMKAnime.split(el, { [by]: { wrap: "clip", clone: p.dir === "down" ? "top" : "bottom" }, includeSpaces: by === "chars" });
      if (p.to != null) {                                    // the copies show the new text (padded / cut to the same count)
        const slots = [...el.querySelectorAll(`[data-${one}]`)], parts = by === "words" ? String(p.to).split(/\s+/) : [...String(p.to)];
        slots.forEach((s, i) => { const c = s.querySelector("[inert]"); if (c) c.textContent = parts[i] != null ? parts[i] : ""; });
      }
      const sel = "#" + CSS.escape(el.id) + ` [data-${one}]`;
      ctx.code(`  // text/anime-roll #${el.id}
  AIMKAnime.animate(tl, ${p.at}, ${J(sel)}, ${J({ y: p.dir === "down" ? "100%" : "-100%", duration: p.duration, ease: p.ease, delay: { stagger: p.each, from: p.from } })}, ${+p.seed || 1});`);
    }
  },
});
