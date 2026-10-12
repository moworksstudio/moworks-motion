/* text/shimmer-sweep: a soft diagonal band of light passes once across the element (1.2 s, power2.inOut), blended "overlay" so it lifts the colours
   it crosses; several targets follow 0.15 s apart. Port of HyperFrames registry component shimmer-sweep (band, angle, colour, blend and timing as in
   the source: linear-gradient 120deg, 20 % wide, rgba(255,255,255,0.6), position -20 % -> 120 %). EFFECT on any element (a card, a button, a
   picture, a line of text). On a text element without child elements the light is painted on a copy of the text (clipped to the letters), so it
   lights the letters only (the source's page would also be lit, barely, behind them); otherwise it is an overlay over the element's box. */
AIMK.preset("text/shimmer-sweep", {
  params: { color: "rgba(255, 255, 255, 0.6)", width: 20, angle: 120, duration: 1.2, stagger: 0.15 },
  build(tl, els, p, ctx) {
    const g = `linear-gradient(${p.angle}deg, transparent 0%, transparent calc(var(--shimmer-pos) - ${p.width / 2}%), ${p.color} var(--shimmer-pos), transparent calc(var(--shimmer-pos) + ${p.width / 2}%), transparent 100%)`;
    els.forEach((el, i) => {
      const cs = getComputedStyle(el); ctx.id(el, "t");
      if (cs.position === "static") el.style.position = "relative";
      const textOnly = !el.children.length && el.textContent.trim();
      const st = { position: "absolute", inset: "0px", pointerEvents: "none", mixBlendMode: "overlay", "--shimmer-pos": "-20%", backgroundImage: g, borderRadius: "inherit" };
      if (textOnly) Object.assign(st, { paddingTop: cs.paddingTop, paddingRight: cs.paddingRight, paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft,
        color: "transparent", webkitTextFillColor: "transparent", webkitBackgroundClip: "text", backgroundClip: "text", textShadow: "none" });
      const m = ctx.make(el, "span", "shimmer", { text: textOnly ? el.textContent : null, style: st });
      tl.fromTo(m, { "--shimmer-pos": "-20%" }, { "--shimmer-pos": "120%", duration: p.duration, ease: "power2.inOut" }, +(p.at + i * p.stagger).toFixed(4));
    });
  },
});
