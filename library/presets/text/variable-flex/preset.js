/* text/variable-flex: a word lands while its variable-font axes flex: each letter rises from hairline-condensed to black-wide with a small carve-in
   overshoot, one after another, and the word's size eases back as the letters gain mass, so the ink swells while the box barely grows. Port of
   HyperFrames registry component variable-font-flex (Wave M5): as in the source, wght 120 -> 840 and wdth 40 -> 128 (axis both; weight holds wdth
   100, width holds wght 620), lead 0.12 s, 1.15 s per letter, stagger 0.06 s, carve ease 1 + 1.9 x^3 + 0.9 x^2 (x = u - 1), opacity smoothstep
   over the first 22 %, rise 0.14 em, size compensation 0.16 / 0.12 / 0.08 of the mean progress. EFFECT on a text element set in "RFlex" (Roboto
   Flex, the source's pinned face). The element's font size is the landing size (the source fitted the word and shrank it by the compensation).
   Per-frame axes go through ctx.code (a proxy tween whose onUpdate is a pure function of its time, the source's painter). AE: png. */
AIMK.preset("text/variable-flex", {
  params: { axis: "both", stagger: 0.06, flex: 1.15, lead: 0.12 },
  build(tl, els, p, ctx) {
    const ax = p.axis === "weight" || p.axis === "width" ? p.axis : "both";
    const WF = ax === "width" ? 620 : 120, WT = ax === "width" ? 620 : 840, DF = ax === "weight" ? 100 : 40, DT = ax === "weight" ? 100 : 128;
    const COMP = ax === "both" ? 0.16 : ax === "width" ? 0.12 : 0.08, st = Math.min(0.25, Math.max(0, +p.stagger || 0));
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      const fs = parseFloat(getComputedStyle(el).fontSize) || 200, base = +(fs / (1 - COMP)).toFixed(3), id = ctx.id(el, "t");
      const C = ctx.split(el, "chars");
      C.forEach(c => Object.assign(c.style, { position: "relative", top: "0.14em", opacity: "0", fontVariationSettings: `"wght" ${WF.toFixed(1)}, "wdth" ${DF.toFixed(2)}` }));
      el.style.fontSize = base + "px";
      const total = +(p.lead + Math.max(0, C.length - 1) * st + p.flex).toFixed(4), v = "vf_" + id.replace(/\W/g, "_");
      ctx.code(`  // variable-flex #${id}: every letter's axes, opacity and rise, and the word's compensated size, from the proxy time
  const ${v} = { t: 0 }, ${v}_ids = ${JSON.stringify(C.map(c => c.id))};
  const ${v}_f = (t) => {
    const cl = (x, a, b) => x < a ? a : x > b ? b : x, carve = u => { const x = u - 1; return 1 + 1.9 * x * x * x + 0.9 * x * x; };
    let sum = 0;
    ${v}_ids.forEach((cid, c) => {
      const e0 = document.getElementById(cid), s = ${p.lead} + c * ${st}, u = cl((t - s) / ${p.flex}, 0, 1), e = u <= 0 ? 0 : u >= 1 ? 1 : carve(u), se = e > 1 ? 1 : e;
      sum += se;
      e0.style.fontVariationSettings = '"wght" ' + cl(${WF} + ${WT - WF} * e, 100, 1000).toFixed(1) + ', "wdth" ' + cl(${DF} + ${DT - DF} * e, 25, 151).toFixed(2);
      const o = cl((t - s) / (${p.flex} * 0.22), 0, 1); e0.style.opacity = (o * o * (3 - 2 * o)).toFixed(4);
      e0.style.top = ((1 - se) * 0.14).toFixed(4) + "em";
    });
    document.getElementById("${id}").style.fontSize = (${base} * (1 - ${COMP} * (${v}_ids.length ? sum / ${v}_ids.length : 1))).toFixed(3) + "px";
  };
  tl.fromTo(${v}, { t: 0 }, { t: ${total}, duration: ${total}, ease: "none", onUpdate: () => ${v}_f(${v}.t) }, ${p.at});`);
    }
  },
});
