/* house/twinkle: lights and sparkles shimmer: brightness 1.15 to 1.7, a warm glow that grows and shrinks, opacity 0.8 to 1 and a small drift; small ones
   (narrower than 260 px) also pulse in scale (0.94 to 1.08). Each has its own period (2.6 to 3.8 s) and phase from its hash.
   Port of Moworks v1 house style P.twinkle (house.js). EFFECT, ambient: ctx.code per-frame formula on the element's FLOAT layer (ctx.layer), so the artwork
   (an <img> or the children) carries the filter and an entrance on the element never fights it. Params: color ("255,224,102" = the glow's rgb), dur (30 s after `at`). */
AIMK.preset("house/twinkle", { params: { color: "255,224,102", dur: 30 },
  build(tl, els, p, ctx) {
    const items = els.map(el => { const s = ctx.hash(el); return { id: ctx.layer(el).id, s, T: +(2.6 + 1.2 * ctx.hash(s + "T")).toFixed(5), small: el.offsetWidth < 260 }; });
    ctx.code(String.raw`  // twinkle
  const tw = { t: 0 }, items = ${JSON.stringify(items)}, TAU = Math.PI * 2, col = ${JSON.stringify(p.color)};
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(tw, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => { const lt = tw.t;
    items.forEach((it, k) => { const ph = it.s * TAU, q = 0.5 + 0.5 * Math.sin(TAU * lt / (it.T * 0.6) + ph), st = nodes[k].style;
      st.transform = "translate(0px, " + (4 * Math.sin(TAU * lt / it.T + ph)).toFixed(2) + "px) scale(" + (it.small ? (0.94 + 0.14 * q).toFixed(3) : 1) + ")";
      st.filter = "brightness(" + (1.15 + 0.55 * q).toFixed(3) + ") drop-shadow(0 0 " + (6 + 12 * q).toFixed(1) + "px rgba(" + col + "," + (0.55 + 0.4 * q).toFixed(3) + "))";
      st.opacity = (0.8 + 0.2 * q).toFixed(3); }); } }, ${p.at});`);
  },
});
