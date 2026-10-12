/* text/caption-neon-glow: captions as unlit neon tubes (14 % cyan); each word lights up as it is said, cyan or hot pink for keywords, with a
   three-layer glow, and goes dark again at its end; groups flicker on (one step) with a small slide and blink off. Port of HyperFrames registry
   component caption-neon-glow (colours, glow, sizes and timing as in the source; the film's font at weight 900 instead of Outfit: no network).
   The unlit glow is written as the same three shadows at zero alpha so GSAP interpolates it (the source used "none", which it cannot).
   BLOCK: the target is an empty box (usually the whole frame); captions sit 120 px from its bottom. Words: "params": { "words": "voice" }. */
AIMK.preset("text/caption-neon-glow", {
  params: { words: [], groups: null, maxWords: 4, maxSpan: 2.0, keywords: [], size: 96, upper: true, bottom: 120, off: "rgba(0,255,240,0.14)", on: "#00FFF0", key: "#FF0099" },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const KEY = new Set((p.keywords || []).map(norm));
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let R = Array.isArray(p.groups) && p.groups.length ? p.groups : null;
    if (!R) { R = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.end - W[s].start > p.maxSpan || nx.start - w.end > 0.6) { R.push([s, i]); s = i + 1; } }); }
    const G = R.map(([a, b], gi) => { const nx = gi + 1 < R.length ? W[R[gi + 1][0]].start : W[b].end + 1; return { a, b, start: W[a].start, end: Math.min(W[b].end + 0.5, nx - 0.05) }; });
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `900 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s;
    const rgb = h => { const v = parseInt(String(h).replace("#", ""), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255].join(","); };
    const glow = (col, a) => `0 0 10px rgba(${rgb(col)},${a}), 0 0 35px rgba(${rgb(col)},${a}), 0 0 90px rgba(${rgb(col)},${a})`;
    ctx.css("text/caption-neon-glow", `
.capng { position: absolute; inset: 0; pointer-events: none; }
.capng-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 24px; padding: 0 80px; opacity: 0; visibility: hidden; }
.capng-w { font-weight: 900; display: inline-block; letter-spacing: 0.04em; line-height: 1; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "ng", { cls: "capng" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 160;
      G.forEach((g, gi) => {
        const ws = W.slice(g.a, g.b + 1), size = fit(ws.map(w => up(w.text)).join(" "), p.size, maxW);
        const grp = ctx.make(root, "div", "g" + gi, { cls: "capng-g", style: { bottom: p.bottom + "px" } });
        tl.set(grp, { visibility: "visible" }, T + g.start);
        tl.fromTo(grp, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "steps(1)" }, T + g.start);
        tl.fromTo(grp, { x: -8 }, { x: 0, duration: 0.14, ease: "power3.out" }, T + g.start + 0.05);
        ws.forEach((w, i) => {
          const col = KEY.has(norm(w.text)) ? p.key : p.on;
          const el = ctx.make(grp, "span", "w" + i, { cls: "capng-w", text: up(w.text), style: { fontSize: size + "px", color: p.off, textShadow: glow(col, 0) } });
          tl.fromTo(el, { color: p.off, textShadow: glow(col, 0) }, { color: col, textShadow: glow(col, 1), duration: 0.06, ease: "power1.out" }, T + w.start);
          tl.fromTo(el, { color: col, textShadow: glow(col, 1) }, { color: p.off, textShadow: glow(col, 0), duration: 0.06, ease: "power1.out" }, T + w.end);
        });
        tl.fromTo(grp, { opacity: 1, x: 0 }, { opacity: 0, x: 6, duration: 0.1, ease: "steps(1)" }, T + g.end - 0.1);
        tl.set(grp, { visibility: "hidden" }, T + g.end);
      });
    }
  },
});
