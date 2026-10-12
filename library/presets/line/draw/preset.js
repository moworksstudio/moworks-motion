/* line/draw: a rule or underline draws from left to right. */
AIMK.preset("line/draw", { params: { duration: 0.5, ease: "power2.inOut", origin: "0% 50%" },
  build(tl, els, p) { for (const el of els) { el.style.transformOrigin = p.origin; tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: p.duration, ease: p.ease }, p.at); } } });
