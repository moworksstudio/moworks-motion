/* house/hop: people hop (12 px) once every 2.2 to 3 s, each at a different moment (phase and period from the element's hash), and breathe a little (scale up to 1.024 over 4 s).
   Port of Moworks v1 house style P.hop (house.js). EFFECT, ambient: ctx.code per-frame formula on the element's FLOAT layer (ctx.layer), feet fixed (origin 50% 100%).
   Params: height (12 px), dur (30 s after `at`). */
AIMK.preset("house/hop", { params: { height: 12, dur: 30 },
  build(tl, els, p, ctx) {
    const items = els.map(el => { const L = ctx.layer(el), s = ctx.hash(el); L.style.transformOrigin = "50% 100%"; return { id: L.id, s, T: +(2.2 + 0.8 * ctx.hash(s + "h")).toFixed(5) }; });
    ctx.code(String.raw`  // hop
  const hp = { t: 0 }, items = ${JSON.stringify(items)}, TAU = Math.PI * 2, height = ${p.height};
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(hp, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => { const lt = hp.t;
    items.forEach((it, k) => { const ph = it.s * 3, T = it.T, q = (((lt + ph) % T) + T) % T / T, h = q < 0.18 ? Math.sin(Math.PI * q / 0.18) : 0;
      nodes[k].style.transform = "translate(0px, " + (-height * h).toFixed(2) + "px) scale(" + (1 + 0.012 * (1 - Math.cos(TAU * lt / 4 + ph))).toFixed(4) + ")"; }); } }, ${p.at});`);
  },
});
