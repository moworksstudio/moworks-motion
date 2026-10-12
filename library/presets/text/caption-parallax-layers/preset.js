/* text/caption-parallax-layers: two caption layers: emphasis words fill the upper half as one huge red serif word, stretched to the frame width and
   2.8x tall with a hard 3D shadow (behind the subject, if the film puts footage above this layer), while the other words of the block appear in
   white serif along the lower third (front layer). Behind words fade in (0.1 s) and front words cut in as they are said; each block holds until
   the next. Port of HyperFrames registry component caption-parallax-layers (colours, stroke, shadows, sizes, stretch and timing as in the source).
   Font: Instrument Serif (no Vietnamese) becomes Playfair Display, the kit's shared serif (engine/vendor/fonts, OFL, Vietnamese complete).
   Blocks: params.blocks ([{ behind: [i...] | null, front: [i...] | null }]) or automatic: a group (sentence mark, maxWords, 0.6 s pause) puts its
   keywords behind and the rest in front. params.italics: front words in italic. BLOCK: the target is an empty box (usually the whole frame). */
AIMK.preset("text/caption-parallax-layers", {
  params: { words: [], blocks: null, keywords: [], italics: [], maxWords: 4, red: "#e50914", shadow: "#a30610", ink: "#eeeeee", behindSize: 220, frontSize: 130,
            behindWidth: 1800, frontWidth: 1750, stretch: 2.8, behindTop: 40, frontTop: 700 },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const KEY = new Set((p.keywords || []).map(norm)), ITAL = new Set((p.italics || []).map(norm));
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let B = Array.isArray(p.blocks) && p.blocks.length ? p.blocks : null;
    if (!B) { B = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.start - w.end > 0.6) {
        const ix = Array.from({ length: i - s + 1 }, (_, k) => s + k), be = ix.filter(k => KEY.has(norm(W[k].text))), fr = ix.filter(k => !KEY.has(norm(W[k].text)));
        B.push({ behind: be.length ? be : null, front: fr.length ? fr : null }); s = i + 1; } }); }
    const SERIF = '"AIMK Playfair Display", "Playfair Display", serif';
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `400 ${s}px ${SERIF}`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    ctx.css("text/caption-parallax-layers", `
.cappl { position: absolute; inset: 0; pointer-events: none; }
.cappl-zone { position: absolute; left: 0; width: 100%; }
.cappl-b { position: absolute; left: 50%; top: 0; transform: translateX(-50%); opacity: 0; transform-origin: 50% 50%; }
.cappl-l { display: flex; align-items: baseline; justify-content: center; gap: 14px; line-height: 1.1; white-space: nowrap; }
.cappl-behind { transform-origin: 50% 0%; }
.cappl-w { display: inline-block; font-family: ${SERIF}; font-weight: 400; }
.cappl-wb { line-height: 0.9; }
.cappl-wf { text-shadow: 0 2px 12px rgba(0,0,0,.6), 0 4px 24px rgba(0,0,0,.35); }`);
    for (const slot of els) {
      const FW = slot.offsetWidth || ctx.W;
      const root = ctx.make(slot, "div", "pl", { cls: "cappl" });
      const back = ctx.make(root, "div", "back", { cls: "cappl-zone", style: { top: p.behindTop + "px", height: "500px" } });
      const front = ctx.make(root, "div", "front", { cls: "cappl-zone", style: { top: p.frontTop + "px", height: "300px" } });
      const T = p.at, first = b => W[(b.behind || b.front)[0]].start;
      B.forEach((b, bi) => {
        const be = ctx.make(back, "div", "b" + bi, { cls: "cappl-b" }), fe = ctx.make(front, "div", "b" + bi, { cls: "cappl-b" });
        const start = T + first(b), next = T + (bi + 1 < B.length ? first(B[bi + 1]) : W[Math.max(...(b.behind || []).concat(b.front || []))].end + 0.8);
        if (b.behind) {
          const size = fit(b.behind.map(k => W[k].text).join(" "), p.behindSize, p.behindWidth);
          const line = ctx.make(be, "div", "l", { cls: "cappl-l cappl-behind" });
          const spans = b.behind.map((k, wi) => ctx.make(line, "span", "w" + wi, { cls: "cappl-w cappl-wb", text: W[k].text,
            style: { fontSize: size + "px", color: p.red, webkitTextStroke: `5px ${p.red}`, textShadow: `2px 4px 4px ${p.shadow}` } }));
          const nat = line.scrollWidth;                                   // stretched to the full width, 2.8x tall (source)
          line.style.transform = `scaleX(${nat > 0 ? +(p.behindWidth / nat).toFixed(4) : 1}) scaleY(${p.stretch})`;
          tl.set(be, { opacity: 1 }, start);
          b.behind.forEach((k, wi) => tl.fromTo(spans[wi], { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power2.out" }, T + W[k].start));
          tl.set(be, { opacity: 0 }, next);
        }
        if (b.front) {
          const size = fit(b.front.map(k => W[k].text).join(" "), p.frontSize, p.frontWidth);
          const line = ctx.make(fe, "div", "l", { cls: "cappl-l" });
          const spans = b.front.map((k, wi) => ctx.make(line, "span", "w" + wi, { cls: "cappl-w cappl-wf", text: W[k].text,
            style: { fontSize: size + "px", color: p.ink, fontStyle: ITAL.has(norm(W[k].text)) ? "italic" : "normal", opacity: 0 } }));
          tl.set(fe, { opacity: 1 }, start);
          b.front.forEach((k, wi) => tl.set(spans[wi], { opacity: 1 }, T + W[k].start));
          tl.set(fe, { opacity: 0 }, next);
        }
      });
      void FW;
    }
  },
});
