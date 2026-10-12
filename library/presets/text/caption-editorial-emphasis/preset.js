/* text/caption-editorial-emphasis: editorial captions in blocks of one or two lines at the lower left: regular words pop in as they are said
   (opacity + scale 1.12 -> 1 from the bottom-left, 0.1 s), and an emphasis word on its own line slides in from the left in a huge bold italic
   serif (0.2 s). Each block holds until the next block starts. Port of HyperFrames registry component caption-editorial-emphasis (cream ink,
   double shadow, sizes, safe zone, fit rules and timing as in the source). Fonts: Playfair Display Bold Italic for the emphasis, the kit's shared font
   engine/vendor/fonts (variable 400-900, SIL OFL, Vietnamese complete; preset.json "fonts" with "vendor"); the film's font Roboto Flex for the rest (instead of Inter; italic = its slant axis).
   Blocks: params.blocks ([{ line1: [[i, "n"|"i"|"e"], ...], line2: [...] | null }], the source's own format) or automatic from the words:
   a block takes up to maxWords words and ends at a sentence mark, a 0.6 s pause or an emphasis word (params.keywords); words before an emphasis
   word make line 1 and the emphasis word alone makes line 2; a block without one splits into two lines when it has more than 3 words.
   BLOCK: the target is an empty box (usually the whole frame); the safe zone is 60 px from its left, 580 px from its top, 1800 x 430 px. */
AIMK.preset("text/caption-editorial-emphasis", {
  params: { words: [], blocks: null, keywords: [], italics: [], maxWords: 5, ink: "#f5f0d0", size: 86, emphasisSize: 180, left: 60, top: 580, width: 1800 },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const KEY = new Set((p.keywords || []).map(norm)), ITAL = new Set((p.italics || []).map(norm));
    const kind = i => KEY.has(norm(W[i].text)) ? "e" : ITAL.has(norm(W[i].text)) ? "i" : "n";
    let B = Array.isArray(p.blocks) && p.blocks.length ? p.blocks : null;
    if (!B) {
      B = []; let i = 0;
      while (i < W.length) {
        const take = [];
        while (i < W.length && take.length < p.maxWords) {
          take.push(i); const w = W[i]; i++;
          if (kind(take[take.length - 1]) === "e" || /[.!?…]$/.test(w.text) || (W[i] && W[i].start - w.end > 0.6)) break;
        }
        const k = take.findIndex(ix => kind(ix) === "e");
        if (k === 0) B.push({ line1: [[take[0], "e"]], line2: null });
        else if (k > 0) B.push({ line1: take.slice(0, k).map(ix => [ix, kind(ix)]), line2: [[take[k], "e"]] });
        else { const a = take.length > 3 ? Math.ceil(take.length / 2) : take.length;
               B.push({ line1: take.slice(0, a).map(ix => [ix, kind(ix)]), line2: a < take.length ? take.slice(a).map(ix => [ix, kind(ix)]) : null }); }
      }
    }
    const SERIF = '"AIMK Playfair Display", "Playfair Display", serif';
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, weight, family, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `${weight} ${s}px ${family}`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const lineSize = pairs => pairs.some(q => q[1] === "e") ? fit(pairs.map(q => W[q[0]].text).join(" "), p.emphasisSize, "italic 800", SERIF, p.width)
                                                           : fit(pairs.map(q => W[q[0]].text).join(" "), p.size, "400", "RFlex", p.width);
    ctx.css("text/caption-editorial-emphasis", `
.caped { position: absolute; inset: 0; pointer-events: none; }
.caped-safe { position: absolute; display: flex; align-items: flex-start; justify-content: flex-start; }
.caped-b { position: absolute; left: 0; top: 0; opacity: 0; transform-origin: 0% 0%; }
.caped-l { display: flex; align-items: baseline; gap: 14px; line-height: 1.1; white-space: nowrap; }
.caped-l + .caped-l { margin-top: 8px; }
.caped-w { display: inline-block; text-shadow: 0 2px 12px rgba(0,0,0,.6), 0 4px 24px rgba(0,0,0,.35); transform-origin: 0% 100%; }
.caped-n { font-weight: 400; font-style: normal; }
.caped-i { font-weight: 400; font-variation-settings: "slnt" -10; }
.caped-e { font-family: ${SERIF}; font-weight: 800; font-style: italic; line-height: 0.9; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "ed", { cls: "caped" });
      const safe = ctx.make(root, "div", "safe", { cls: "caped-safe", style: { left: p.left + "px", top: p.top + "px", width: p.width + "px", height: "430px" } });
      const T = p.at, starts = B.map(b => W[b.line1[0][0]].start);
      B.forEach((b, bi) => {
        const el = ctx.make(safe, "div", "b" + bi, { cls: "caped-b" });
        const lines = [b.line1, b.line2].filter(Boolean).map((pairs, li) => {
          const size = lineSize(pairs), line = ctx.make(el, "div", "l" + (li + 1), { cls: "caped-l" });
          const spans = pairs.map((q, wi) => ctx.make(line, "span", "w" + wi, { cls: "caped-w caped-" + q[1], text: W[q[0]].text, style: { fontSize: size + "px", color: p.ink } }));
          return { line, spans, pairs };
        });
        const maxW = Math.max(...lines.map(l => l.line.scrollWidth));            // a block wider than the safe zone is scaled down (source)
        if (maxW > p.width) el.style.transform = `scale(${+(p.width / maxW).toFixed(4)})`;
        const start = T + starts[bi], next = T + (bi + 1 < B.length ? starts[bi + 1] : W[b.line2 ? b.line2[b.line2.length - 1][0] : b.line1[b.line1.length - 1][0]].end + 0.8);
        tl.set(el, { opacity: 1 }, start);
        const pop = l => l.pairs.forEach((q, wi) => tl.fromTo(l.spans[wi], { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out" }, T + W[q[0]].start));
        pop(lines[0]);
        if (lines[1]) {
          if (lines[1].pairs.some(q => q[1] === "e")) tl.fromTo(lines[1].line, { opacity: 0, x: -1920 }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" }, T + W[lines[1].pairs[0][0]].start);
          else pop(lines[1]);
        }
        tl.set(el, { opacity: 0 }, next);
      });
    }
  },
});
