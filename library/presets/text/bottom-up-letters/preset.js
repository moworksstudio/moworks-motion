/* text/bottom-up-letters: each letter (or word) rises from 0.85 em below its place with a springy overshoot (back.out(1.7), 0.48 s), 0.025 s apart.
   Port of HyperFrames registry component bottom-up-letters (travel, ease, stagger as in the source; its variables are params: unit letter | word,
   direction up | down, travel close | standard | far = 0.45 / 0.85 / 1.5 em). EFFECT on the target text element(s); letters are split by grapheme
   so Vietnamese letters keep their marks. */
AIMK.preset("text/bottom-up-letters", {
  params: { unit: "letter", direction: "up", travel: "standard", duration: 0.48, stagger: 0.025 },
  build(tl, els, p, ctx) {
    const em = { close: 0.45, standard: 0.85, far: 1.5 }[p.travel] || 0.85, dir = p.direction === "down" ? -1 : 1;
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      const fs = parseFloat(getComputedStyle(el).fontSize) || 48, y0 = +(em * fs * dir).toFixed(2);
      const units = ctx.split(el, p.unit === "word" ? "words" : "chars");
      units.forEach((u, i) => tl.fromTo(u, { opacity: 0, y: y0 }, { opacity: 1, y: 0, duration: p.duration, ease: "back.out(1.7)" }, +(p.at + i * p.stagger).toFixed(4)));
    }
  },
});
