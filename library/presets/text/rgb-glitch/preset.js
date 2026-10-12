/* text/rgb-glitch: a red and a cyan copy of the text tear sideways out from under it in three quick 0.06 s flashes, then snap back in register.
   Port of HyperFrames registry component rgb-glitch-text (timing as in the source: 0.1 s after `at`, offsets -8 / +8 px held for 0.06 s, six steps
   of repeat 5 yoyo steps(1), so the copies are torn during 0.16-0.22, 0.28-0.34 and 0.40-0.46 s; here written as plain sets). Its intensity
   variable subtle | standard | extreme = x 0.5 / 1 / 2.25 is a param; the 8 px are at the source's 72 px type and scale with the element's size.
   EFFECT on a text element: the solid copy is the element's own text and colour; the red (#ef4444) and cyan (#22d3ee) copies sit under it. */
AIMK.preset("text/rgb-glitch", {
  params: { intensity: "standard", red: "#ef4444", cyan: "#22d3ee", offset: 8 },
  build(tl, els, p, ctx) {
    const r = { subtle: 0.5, standard: 1, extreme: 2.25 }[p.intensity] || 1;
    for (const el of els) {
      const txt = el.textContent.normalize("NFC"), fs = parseFloat(getComputedStyle(el).fontSize) || 72, d = +(p.offset * r * fs / 72).toFixed(2);
      ctx.id(el, "t"); el.textContent = "";
      const box = ctx.make(el, "span", "rgb", { style: { display: "inline-grid" } });
      const cp = (n, c) => ctx.make(box, "span", n, { text: txt, style: Object.assign({ gridArea: "1 / 1" }, c ? { color: c } : {}) });
      const R = cp("red", p.red), C = cp("cyan", p.cyan); cp("ink", null).style.position = "relative";   // the copies get transforms, which paint
                                                                                                          // them in the positioned layer: the ink copy must be there too, last
      [0.16, 0.28, 0.4].forEach(t => {
        tl.set(R, { x: -d }, +(p.at + t).toFixed(4)); tl.set(C, { x: d }, +(p.at + t).toFixed(4));
        tl.set(R, { x: 0 }, +(p.at + t + 0.06).toFixed(4)); tl.set(C, { x: 0 }, +(p.at + t + 0.06).toFixed(4));
      });
    }
  },
});
