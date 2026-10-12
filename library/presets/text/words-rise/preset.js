/* text/words-rise: each word rises out of its own mask, one after another. */
AIMK.preset("text/words-rise", { params: { duration: 0.7, ease: "expo.out", stagger: 0.06, from: 135 },
  build(tl, els, p, ctx) { for (const el of els) { const ws = ctx.split(el, "words"); ws.forEach((w, i) => { ctx.mask(w); tl.fromTo(w, { yPercent: p.from }, { yPercent: 0, duration: p.duration, ease: p.ease }, p.at + i * p.stagger); }); } } });
