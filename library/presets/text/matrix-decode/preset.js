/* text/matrix-decode: a row of glowing green cells rises in one after another as zeros (0.18 s, power2.out, from 12 px below, 0.035 s apart), then
   each cell flickers through a few code glyphs and locks onto its letter, left to right. Port of HyperFrames registry component matrix-decode:
   the rise, colours, glow and cell width are the source's (accent green #16a34a / blue #2563eb / violet #7c3aed, glow none | standard 18 px 28 %
   | strong 34 px 55 %, cells at least 0.64 em wide, 3 px apart); the source stops at the zeros and leaves the final word in data-final "which a
   decode routine can read": the decode here (decode: true) is that routine, written by the kit: `flips` glyphs per cell `flip` s apart, chosen by
   ctx.hash (the same every build), starting `decodeAt` s after `at`, cells `decodeStagger` s apart. EFFECT on a text element: its text is the word. */
AIMK.preset("text/matrix-decode", {
  params: { accent: "green", glow: "standard", decode: true, decodeAt: 0.6, decodeStagger: 0.05, flips: 3, flip: 0.05, glyphs: "01アイウエオカキクケコ#%&*+=<>" },
  build(tl, els, p, ctx) {
    const A = { green: ["#16a34a", "22, 163, 74"], blue: ["#2563eb", "37, 99, 235"], violet: ["#7c3aed", "124, 58, 237"] }[p.accent] || ["#16a34a", "22, 163, 74"];
    const Gl = { none: [0, 0], standard: [18, 0.28], strong: [34, 0.55] }[p.glow] || [18, 0.28], gs = [...p.glyphs];
    for (const el of els) {
      const txt = el.textContent.normalize("NFC").trim(), fs = parseFloat(getComputedStyle(el).fontSize) || 64, k = fs / 64;
      ctx.id(el, "t"); el.textContent = "";
      Object.assign(el.style, { color: A[0], textShadow: Gl[0] ? `0 0 ${Math.round(Gl[0] * k)}px rgba(${A[1]}, ${Gl[1]})` : "none" });
      let n = 0;
      [...txt].forEach((ch, i) => {
        const cell = ctx.make(el, "span", "c" + i, { style: { display: "inline-grid", minWidth: "0.64em", justifyItems: "center", marginRight: (3 * k).toFixed(2) + "px" } });
        if (/\s/.test(ch)) { cell.textContent = " "; return; }
        const seq = ["0"].concat(p.decode ? Array.from({ length: p.flips }, (_, j) => gs[Math.floor(ctx.hash(el.id + ":" + i + ":" + j) * gs.length)]) : []).concat(p.decode ? [ch] : []);
        const L = seq.map((g, j) => ctx.make(cell, "span", "g" + j, { text: g, style: { gridArea: "1 / 1", opacity: j ? "0" : "1" } }));
        tl.fromTo(cell, { opacity: 0, y: +(12 * k).toFixed(2) }, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, +(p.at + n * 0.035).toFixed(4));
        if (p.decode) L.forEach((g, j) => { if (!j) return; const t = +(p.at + p.decodeAt + n * p.decodeStagger + (j - 1) * p.flip).toFixed(4); tl.set(L[j - 1], { opacity: 0 }, t); tl.set(g, { opacity: 1 }, t); });
        n++;
      });
    }
  },
});
