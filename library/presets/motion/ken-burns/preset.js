/* motion/ken-burns: every picture gets a slow, continuous pan and zoom (Ken Burns), each one a different move chosen by a seed, so a set of
   photos has variety without chaos and renders the same every time. Port of iart-ai ecommerce-video-skills, photo-slideshow / ken-burns
   (MIT): eight moves (zoom in or out crossed with a drift direction), mulberry32 seeded by the picture's index (index x 2654435761), zoom delta
   0.06-0.12 from a 1.05 base (a drift never shows an empty edge), drift 24-60 px, sine.inOut over the whole `duration`, transform-origin at the
   subject (`anchor`, "50% 50%"; portraits read better at "50% 30%"); a move equal to the previous picture's is rolled again. EFFECT on pictures:
   an <img> is wrapped in a clipping box of its own size; any other element clips itself and moves its content. */
AIMK.preset("motion/ken-burns", {
  params: { duration: 5, anchor: "50% 50%", seed: 0 },
  build(tl, els, p, ctx) {
    const MOVES = [["in", 1, 0], ["in", -1, 0], ["in", 0, 1], ["in", 0, -1], ["out", 1, 1], ["out", -1, -1], ["out", 1, -1], ["in", -1, 1]];
    const mul = a => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let prev = -1;
    els.forEach((el, i) => {
      const r = mul((i + (+p.seed || 0)) * 2654435761); let m = Math.floor(r() * MOVES.length);
      if (m === prev) m = (m + 1 + Math.floor(r() * (MOVES.length - 1))) % MOVES.length; prev = m;
      const [z, px, py] = MOVES[m], dz = 0.06 + r() * 0.06, pan = 24 + r() * 36, base = 1.05;
      let target;
      if (el.tagName === "IMG") { const box = ctx.layer(el, "kb"); box.style.overflow = "hidden"; box.style.borderRadius = getComputedStyle(el).borderRadius; target = el; }
      else { el.style.overflow = "hidden"; target = ctx.layer(el, "kb"); }
      target.style.transformOrigin = p.anchor;
      const s0 = z === "in" ? base : base + dz, s1 = z === "in" ? base + dz : base;
      tl.fromTo(target, { scale: +s0.toFixed(4), x: 0, y: 0 }, { scale: +s1.toFixed(4), x: +(px * pan).toFixed(2), y: +(py * pan).toFixed(2), duration: p.duration, ease: "sine.inOut" }, p.at);
    });
  },
});
