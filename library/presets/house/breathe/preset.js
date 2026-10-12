/* house/breathe: a slow scale 1 -> 1 + amp and back (default amp 0.03, period 5 s), feet fixed (origin bottom) so a character breathes without leaving the ground.
   For a burst behind a number use amp 0.02, origin "50% 60%", period 4. The phase comes from the element's hash.
   Port of Moworks v1 house style P.breathe (house.js). EFFECT, ambient: ctx.code per-frame formula on the element's FLOAT layer (ctx.layer), origin written into
   the layer's style. Params: amp, origin, period, dur (30 s after `at`). */
AIMK.preset("house/breathe", { params: { amp: 0.03, origin: "50% 100%", period: 5, dur: 30 },
  build(tl, els, p, ctx) {
    const items = els.map(el => { const L = ctx.layer(el); L.style.transformOrigin = p.origin; return { id: L.id, s: ctx.hash(el) }; });
    ctx.code(String.raw`  // breathe
  const br = { t: 0 }, items = ${JSON.stringify(items)}, TAU = Math.PI * 2, T = ${p.period}, a = ${p.amp} / 2;
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(br, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => { const lt = br.t;
    items.forEach((it, k) => { nodes[k].style.transform = "scale(" + (1 + a * (1 - Math.cos(TAU * lt / T + it.s * TAU))).toFixed(4) + ")"; }); } }, ${p.at});`);
  },
});
