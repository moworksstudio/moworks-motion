/* text/caption-pill-karaoke: lowercase captions on a soft light-grey pill (one or two balanced lines, up to 4 words); words start grey and darken
   one by one just before they are said (karaoke), staying dark until the pill changes. Port of HyperFrames registry component caption-pill-karaoke
   (pill, colours, sizes, padding rules, grouping and timing as in the source; the film's font at weight 700 instead of Poppins: no network).
   BLOCK: the target is an empty box (usually the whole frame); the pill centres in a 1600 x 220 zone 100 px from its bottom.
   Words: "params": { "words": "voice" }. A group stays until the next one, or 0.3 s after its last word if that is sooner. */
AIMK.preset("text/caption-pill-karaoke", {
  params: { words: [], maxWords: 4, pause: 0.1, size: 72, minSize: 52, pillMax: 1400, bottom: 100, pill: "#e7e5e7", inactive: "#A6A6A6", active: "#1C1E1D", lower: true },
  build(tl, els, p, ctx) {
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const tx = s => p.lower ? s.toLowerCase() : s;
    const c2d = document.createElement("canvas").getContext("2d");
    const ww = (t, fs) => { c2d.font = `700 ${fs}px RFlex`; return c2d.measureText(tx(t)).width * 1.18; };
    const lw = (ws, fs) => ws.reduce((t, w, i) => t + ww(w.text, fs) + (i ? 16 : 0), 0);
    const maxLine = p.pillMax - 60;
    const split = (ws, fs) => {
      if (ws.some(w => ww(w.text, fs) > maxLine)) return null;
      if (lw(ws, fs) <= maxLine) return [ws];
      let best = null, bd = Infinity;
      for (let k = 1; k < ws.length; k++) { const a = lw(ws.slice(0, k), fs), b = lw(ws.slice(k), fs); if (a <= maxLine && b <= maxLine && Math.abs(a - b) < bd) { bd = Math.abs(a - b); best = [ws.slice(0, k), ws.slice(k)]; } }
      return best;
    };
    const G = []; let cur = [];
    const close = () => { if (cur.length) G.push(cur); cur = []; };
    W.forEach((w, i) => { const nx = W[i + 1], test = cur.concat([w]);
      if (test.length > p.maxWords || !split(test, p.size)) { close(); cur = [w]; return; }
      cur.push(w);
      if (cur.length >= p.maxWords || !nx || /[,.:!?]$/.test(w.text) || nx.start - w.end >= p.pause) close(); });
    close();
    ctx.css("text/caption-pill-karaoke", `
.cappk { position: absolute; inset: 0; pointer-events: none; }
.cappk-safe { position: absolute; left: 50%; transform: translateX(-50%); width: 1600px; height: 220px; }
.cappk-g { position: absolute; left: 0; top: 0; width: 100%; height: 220px; display: flex; align-items: center; justify-content: center; opacity: 0; }
.cappk-pill { padding-top: 18px; padding-bottom: 20px; border-radius: 22px; box-shadow: 0 2px 8px rgba(0,0,0,.12); text-align: center; }
.cappk-c { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; font-weight: 700; line-height: 1.16; white-space: nowrap; }
.cappk-l { display: flex; justify-content: center; gap: 16px; width: 100%; line-height: 1.16; white-space: nowrap; }
.cappk-w { display: inline-block; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "pk", { cls: "cappk" });
      const safe = ctx.make(root, "div", "safe", { cls: "cappk-safe", style: { bottom: p.bottom + "px" } });
      const T = p.at;
      G.forEach((ws, gi) => {
        let fs = p.size; while (fs > p.minSize && !split(ws, fs)) fs -= 2;
        const lines = split(ws, fs) || [ws], widest = Math.max(...lines.map(l => lw(l, fs)));
        const padX = Math.max(30, Math.min(60, Math.floor((p.pillMax - widest) / 2))), pillW = Math.min(p.pillMax, Math.ceil(widest + padX * 2));
        const grp = ctx.make(safe, "div", "g" + gi, { cls: "cappk-g" });
        const pill = ctx.make(grp, "div", "pill", { cls: "cappk-pill", style: { width: pillW + "px", paddingLeft: padX + "px", paddingRight: padX + "px", background: p.pill } });
        const copy = ctx.make(pill, "div", "c", { cls: "cappk-c", style: { fontSize: fs + "px", color: p.inactive } });
        let k = 0;
        lines.slice(0, 2).forEach((ln, li) => { const line = ctx.make(copy, "div", "l" + li, { cls: "cappk-l" });
          ln.forEach(w => { const el = ctx.make(line, "span", "w" + k, { cls: "cappk-w", text: tx(w.text), style: { color: k === 0 ? p.active : p.inactive } });
            if (k > 0) tl.fromTo(el, { color: p.inactive }, { color: p.active, duration: 0.1, ease: "none" }, T + Math.max(ws[0].start, w.start - 0.05));
            k++; }); });
        const next = G[gi + 1], vs = ws[0].start, ve = Math.max(vs + 0.01, next ? Math.min(next[0].start, ws[ws.length - 1].end + 0.3) : ws[ws.length - 1].end + 0.5);
        tl.set(grp, { opacity: 1 }, T + vs);
        tl.set(grp, { opacity: 0 }, T + ve);
      });
    }
  },
});
