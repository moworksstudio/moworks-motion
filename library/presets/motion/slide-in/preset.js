/* motion/slide-in: slide in from the left (from < 0) or the right (from > 0) while fading in. */
AIMK.preset("motion/slide-in", { params: { duration: 0.6, ease: "power3.out", from: -260, stagger: 0.15 },
  build(tl, els, p) { els.forEach((el, i) => tl.fromTo(el, { x: p.from, opacity: 0 }, { x: 0, opacity: 1, duration: p.duration, ease: p.ease }, p.at + i * p.stagger)); } });
