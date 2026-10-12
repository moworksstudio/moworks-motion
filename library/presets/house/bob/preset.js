/* house/bob: small items float up and down (amp 3 px, period 2.6 s), each with its own phase from its hash.
   Port of Moworks v1 house style P.bob (house.js). EFFECT, ambient: ctx.code per-frame formula on the element's FLOAT layer (ctx.layer).
   Params: amp, period, dur (30 s after `at`). */
AIMK.preset("house/bob", { params: { amp: 3, period: 2.6, dur: 30 },
  build(tl, els, p, ctx) {
    const items = els.map(el => ({ id: ctx.layer(el).id, s: ctx.hash(el) }));
    ctx.code(String.raw`  // bob
  const bb = { t: 0 }, items = ${JSON.stringify(items)}, TAU = Math.PI * 2, amp = ${p.amp}, period = ${p.period};
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(bb, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => { const lt = bb.t;
    items.forEach((it, k) => { nodes[k].style.transform = "translate(0px, " + (amp * Math.sin(TAU * lt / period + it.s * TAU)).toFixed(2) + "px)"; }); } }, ${p.at});`);
  },
});
