/* text/mask-rise: the line rises out of a mask. Mask hides by 135 % (Vietnamese stacked diacritics peeked out at the usual 110 %, 05/10/2026). */
AIMK.preset("text/mask-rise", { params: { duration: 0.8, ease: "expo.out", from: 135 },
  build(tl, els, p, ctx) { for (const el of els) { ctx.mask(el); tl.fromTo(el, { yPercent: p.from }, { yPercent: 0, duration: p.duration, ease: p.ease }, p.at); } } });
