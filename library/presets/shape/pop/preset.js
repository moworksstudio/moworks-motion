/* shape/pop: scale up from 0 with a small overshoot and rotation (deco, stickers, icons). */
AIMK.preset("shape/pop", { params: { duration: 0.5, ease: "back.out(2.2)", rotation: 12, stagger: 0.08 },
  build(tl, els, p) { els.forEach((el, i) => tl.fromTo(el, { scale: 0, rotation: (i % 2 ? 1 : -1) * p.rotation }, { scale: 1, rotation: 0, duration: p.duration, ease: p.ease }, p.at + i * p.stagger)); } });
