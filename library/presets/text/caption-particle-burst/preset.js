/* text/caption-particle-burst: captions in dimmed white (45 %); the word being said brightens to white and grows a little, keywords turn gold, grow
   more and fire a burst of 10 coloured dots out of a point at the lower centre; spoken words settle at 40 %. Groups pop in with a slight
   overshoot. Port of HyperFrames registry component caption-particle-burst (colours, sizes, seeded particle angles / distances / sizes and timing
   as in the source; the film's font at weight 900 instead of Outfit: no network). BLOCK: the target is an empty box (usually the whole frame);
   captions sit 120 px from its bottom, the burst starts 960 px from its left and 180 px from its bottom (source).
   Words: "params": { "words": "voice" }; groups automatic (sentence mark, maxWords, maxSpan, 0.6 s pause) or params.groups; params.keywords. */
AIMK.preset("text/caption-particle-burst", {
  params: { words: [], groups: null, keywords: [], maxWords: 4, maxSpan: 2.0, size: 88, upper: true, bottom: 120, rest: "rgba(255,255,255,0.45)", spoken: "rgba(255,255,255,0.4)",
            on: "#ffffff", key: "#FFD700", burstX: 960, burstBottom: 180, particles: 10, colors: ["#FFD700", "#FF6B35", "#FF3C78", "#9B5DE5", "#00BBF9", "#00F5D4", "#ffffff", "#F15BB5"] },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const KEY = new Set((p.keywords || []).map(norm));
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let R = Array.isArray(p.groups) && p.groups.length ? p.groups : null;
    if (!R) { R = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.end - W[s].start > p.maxSpan || nx.start - w.end > 0.6) { R.push([s, i]); s = i + 1; } }); }
    const G = R.map(([a, b], gi) => { const nx = gi + 1 < R.length ? W[R[gi + 1][0]].start : W[b].end + 1; return { a, b, start: W[a].start, end: Math.min(W[b].end + 0.5, nx - 0.05) }; });
    const mulberry32 = seed => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `900 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s;
    ctx.css("text/caption-particle-burst", `
.cappb { position: absolute; inset: 0; pointer-events: none; }
.cappb-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 24px; padding: 0 100px; opacity: 0; visibility: hidden; }
.cappb-w { font-weight: 900; display: inline-block; letter-spacing: 0.05em; line-height: 1; }
.cappb-p { position: absolute; border-radius: 50%; opacity: 0; z-index: 20; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "pb", { cls: "cappb" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 200, spans = {};
      G.forEach((g, gi) => {
        const ws = W.slice(g.a, g.b + 1), size = fit(ws.map(w => up(w.text)).join(" "), p.size, maxW);
        const grp = ctx.make(root, "div", "g" + gi, { cls: "cappb-g", style: { bottom: p.bottom + "px" } });
        ws.forEach((w, i) => { spans[g.a + i] = ctx.make(grp, "span", "w" + i, { cls: "cappb-w", text: up(w.text), style: { fontSize: size + "px", color: p.rest } }); });
        g.el = grp;
      });
      const dots = {};                                                     // particles for keyword words (seeded as in the source)
      W.forEach((w, wi) => { if (!KEY.has(norm(w.text))) return; const rng = mulberry32(wi * 137 + 99); dots[wi] = [];
        for (let k = 0; k < p.particles; k++) {
          const ang = (k / p.particles) * Math.PI * 2 + rng() * 0.6, dist = 120 + rng() * 200, sz = 4 + rng() * 8;
          const el = ctx.make(root, "div", `p${wi}_${k}`, { cls: "cappb-p", style: { left: p.burstX + "px", bottom: p.burstBottom + "px", width: sz.toFixed(1) + "px", height: sz.toFixed(1) + "px",
            backgroundColor: p.colors[k % p.colors.length] } });
          dots[wi].push({ el, dx: +(Math.cos(ang) * dist).toFixed(2), dy: +(-Math.sin(ang) * dist).toFixed(2) });
        } });
      G.forEach(g => {
        tl.set(g.el, { visibility: "visible" }, T + g.start);
        tl.fromTo(g.el, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.5)" }, T + g.start);
        for (let wi = g.a; wi <= g.b; wi++) {
          const w = W[wi], el = spans[wi], kw = KEY.has(norm(w.text)), col = kw ? p.key : p.on, sc = kw ? 1.12 : 1.05;
          tl.fromTo(el, { color: p.rest, scale: 1 }, { color: col, scale: sc, duration: 0.08, ease: "power1.out" }, T + w.start);
          tl.fromTo(el, { color: col, scale: sc }, { color: p.spoken, scale: 1, duration: 0.1, ease: "power1.out" }, T + w.end);
          (dots[wi] || []).forEach((d, k) => {
            tl.fromTo(d.el, { x: 0, y: 0, opacity: 0 }, { x: d.dx, y: d.dy, opacity: 1, duration: 0.12, ease: "power3.out" }, T + w.start + k * 0.018);
            tl.fromTo(d.el, { opacity: 1 }, { opacity: 0, duration: 0.45, ease: "power1.in" }, T + w.start + 0.12 + k * 0.018);
            tl.set(d.el, { x: 0, y: 0 }, T + w.start + 0.7);
          });
        }
        tl.fromTo(g.el, { opacity: 1 }, { opacity: 0, duration: 0.14, ease: "power2.in" }, T + g.end - 0.14);
        tl.set(g.el, { visibility: "hidden" }, T + g.end);
      });
    }
  },
});
