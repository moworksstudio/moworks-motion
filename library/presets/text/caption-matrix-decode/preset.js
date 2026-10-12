/* text/caption-matrix-decode: terminal-green captions; each word decodes as it is said: two scrambled strings of its length flash for 0.1 s each, then
   the real word locks in. Port of HyperFrames registry component caption-matrix-decode (colour, sizes, seeded scrambles and timing as in the
   source; the film's font instead of Space Grotesk: no network). BLOCK: the target is an empty box (usually the whole frame); captions sit 120 px
   from its bottom. Words: "params": { "words": "voice" }; groups: params.groups or automatic (sentence mark, maxWords, maxSpan, 0.6 s pause). */
AIMK.preset("text/caption-matrix-decode", {
  params: { words: [], groups: null, maxWords: 4, maxSpan: 2.0, size: 96, bottom: 120, color: "#00ff41" },
  build(tl, els, p, ctx) {
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let R = Array.isArray(p.groups) && p.groups.length ? p.groups : null;
    if (!R) { R = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.end - W[s].start > p.maxSpan || nx.start - w.end > 0.6) { R.push([s, i]); s = i + 1; } }); }
    const G = R.map(([a, b], gi) => { const nx = gi + 1 < R.length ? W[R[gi + 1][0]].start : W[b].end + 1; return { a, b, start: W[a].start, end: Math.min(W[b].end + 0.5, nx - 0.05) }; });
    const mulberry32 = seed => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const AN = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const scramble = (seed, n) => { const r = mulberry32(seed); let s = ""; for (let i = 0; i < n; i++) s += AN[Math.floor(r() * AN.length)]; return s; };
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `700 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    ctx.css("text/caption-matrix-decode", `
.capmd { position: absolute; inset: 0; pointer-events: none; }
.capmd-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 24px; padding: 0 80px; opacity: 0; visibility: hidden; }
.capmd-ww { font-weight: 700; display: inline-block; letter-spacing: 0.04em; line-height: 1; position: relative; }
.capmd-real { opacity: 0; visibility: hidden; }
.capmd-s { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; visibility: hidden; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "md", { cls: "capmd" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 160;
      G.forEach((g, gi) => {
        const ws = W.slice(g.a, g.b + 1), size = fit(ws.map(w => w.text).join(" "), p.size, maxW);
        const grp = ctx.make(root, "div", "g" + gi, { cls: "capmd-g", style: { bottom: p.bottom + "px" } });
        tl.set(grp, { visibility: "visible" }, T + g.start);
        tl.fromTo(grp, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power1.out" }, T + g.start);
        ws.forEach((w, i) => {
          const wi = g.a + i, n = [...w.text].length;
          const ww = ctx.make(grp, "span", "w" + i, { cls: "capmd-ww", style: { fontSize: size + "px", color: p.color } });
          const real = ctx.make(ww, "span", "real", { cls: "capmd-real", text: w.text });
          const s0 = ctx.make(ww, "span", "s0", { cls: "capmd-s", text: scramble(wi * 1000, n) });
          const s1 = ctx.make(ww, "span", "s1", { cls: "capmd-s", text: scramble(wi * 1000 + 1, n) });
          const t0 = T + w.start;
          tl.set(s0, { autoAlpha: 1 }, t0);
          tl.set(s1, { autoAlpha: 1 }, t0 + 0.1);
          tl.set(s0, { autoAlpha: 0 }, t0 + 0.1);
          tl.set(real, { autoAlpha: 1 }, t0 + 0.2);
          tl.set(s1, { autoAlpha: 0 }, t0 + 0.2);
        });
        tl.fromTo(grp, { opacity: 1 }, { opacity: 0, duration: 0.12, ease: "power1.out" }, T + g.end - 0.12);
        tl.set(grp, { visibility: "hidden" }, T + g.end);
      });
    }
  },
});
