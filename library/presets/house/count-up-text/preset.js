/* house/count-up-text: the FIRST number inside a text counts up to its value (1.2 s, power2.out) while the rest of the line stays put: decimals and
   thousands separators are kept, and tabular figures (font-variant-numeric) keep the line's width.
   Port of Moworks v1 house style P.countUpText (house.js). EFFECT with per-frame text: written into the film as a small ctx.code block (a text that changes
   every frame cannot be a plain tween). It starts at max(10^(digits-1), 70 % of the value), or at `from` when that is smaller than the value and has the same
   number of digits. Values under 10 do not count (the text is left alone). Number format is the v1 one: comma = thousands, dot = decimals ("2,450,000", "31.3").
   Params: from (null), dur (1.2 s), ease ("power2.out"), copies (ids of other elements that show the same text, e.g. an extruded copy),
   sound (false; true = v1 counter sound: 8 ticks that slow down with the count and a thump when it lands, through ctx.sfx). */
AIMK.preset("house/count-up-text", { params: { from: null, dur: 1.2, ease: "power2.out", copies: [], sound: false },
  build(tl, els, p, ctx) {
    for (const el of els) {
      const txt = el.textContent, m = txt.match(/\d[\d,.]*\d|\d/); if (!m) continue;
      const str = m[0], comma = /,\d{3}/.test(str), dec = (str.match(/\.(\d+)$/) || ["", ""])[1].length, target = parseFloat(str.replace(/,/g, ""));
      if (!(target >= 10)) continue;
      const digits = String(Math.floor(target)).length;
      let start = Math.max(Math.pow(10, digits - 1), target * 0.7);
      if (p.from != null && p.from < target && String(Math.floor(p.from)).length === digits) start = p.from;
      const fmt = v => { let s = v.toFixed(dec); if (comma) { const [a, b] = s.split("."); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b ? "." + b : ""); } return s; };
      const ids = [ctx.id(el)].concat((p.copies || []).map(String));
      if (p.sound) { for (let k = 0; k < 8; k++) ctx.sfx(p.at + p.dur * (1 - Math.sqrt(1 - k / 8)), k % 2 ? "tickhi" : "tick"); ctx.sfx(p.at + p.dur, "thump"); }
      ids.forEach(i => { const x = document.getElementById(i); if (x) { x.style.fontVariantNumeric = "tabular-nums"; x.textContent = txt.replace(str, fmt(start)); } });
      ctx.code(String.raw`  // count-up-text #${el.id}
  const cu = { p: 0 }, ids = ${JSON.stringify(ids)}, txt = ${JSON.stringify(txt)}, str = ${JSON.stringify(str)};
  const start = ${start}, target = ${target}, dec = ${dec}, comma = ${comma};
  const fmt = v => { let s = v.toFixed(dec); if (comma) { const [a, b] = s.split("."); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b ? "." + b : ""); } return s; };
  const nodes = ids.map(i => document.getElementById(i));
  tl.fromTo(cu, { p: 0 }, { p: 1, duration: ${p.dur}, ease: ${JSON.stringify(p.ease)}, onUpdate: () => { const shown = txt.replace(str, fmt(cu.p >= 1 ? target : start + (target - start) * cu.p)); nodes.forEach(x => { if (x.textContent !== shown) x.textContent = shown; }); } }, ${p.at});`);
    }
  },
});
