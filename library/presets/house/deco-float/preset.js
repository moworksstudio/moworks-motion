/* house/deco-float: icons and stickers never stand still: they drift up and down (amp px, default 6) and tilt (tilt deg, default 2.5), each with its own period
   (2.6 to 3.8 s, from the element's hash) and phase.
   Port of Moworks v1 house style P.decoFloat (house.js). EFFECT, ambient: a per-frame formula that is a pure function of time, written into the film as a ctx.code
   block (a proxy tween t: 0 -> dur with ease "none" and an onUpdate). It moves the element's FLOAT layer (ctx.layer = v1 P.floatLayer: an inner wrapper that
   takes over the children, an <img> is wrapped), so an entrance on the element itself (pop, slide) never fights it. Params: amp, tilt, dur (seconds of motion
   after `at`, default 30; v1 ran 600 s). Before `at` the layer rests at its start pose. */
AIMK.preset("house/deco-float", { params: { amp: 6, tilt: 2.5, dur: 30 },
  build(tl, els, p, ctx) {
    const items = els.map(el => { const s = ctx.hash(el); return { id: ctx.layer(el).id, s, T: +(2.6 + 1.2 * ctx.hash(s + "T")).toFixed(5) }; });
    ctx.code(String.raw`  // deco-float
  const df = { t: 0 }, items = ${JSON.stringify(items)}, TAU = Math.PI * 2, amp = ${p.amp}, tilt = ${p.tilt};
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(df, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => { const lt = df.t;
    items.forEach((it, k) => { const ph = it.s * TAU; nodes[k].style.transform = "translate(0px, " + (amp * Math.sin(TAU * lt / it.T + ph)).toFixed(2) + "px) rotate(" + (tilt * Math.sin(TAU * lt / (it.T * 1.3) + ph * 1.7)).toFixed(2) + "deg)"; }); } }, ${p.at});`);
  },
});
