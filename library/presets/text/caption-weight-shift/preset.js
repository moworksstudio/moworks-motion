/* text/caption-weight-shift: minimal lowercase captions on one or two balanced lines: the line being spoken is bold and the other light; when the
   voice reaches the second line, the weights swap (0.1 s). Groups pop in from 85 % (0.1 s). Port of HyperFrames registry component
   caption-weight-shift (sizes, shadow, grouping with no single-word groups, line balancing and timing as in the source; the film's font Roboto Flex
   instead of Montserrat: it is variable, so the 700 <-> 300 weight change is smooth). BLOCK: the target is an empty box (usually the whole frame);
   the 1400 x 278 safe zone sits 100 px from its bottom. Words: "params": { "words": "voice" }. */
AIMK.preset("text/caption-weight-shift", {
  params: { words: [], maxWords: 4, pause: 0.1, size: 72, width: 1400, bottom: 100, color: "#ffffff", light: 300, bold: 700 },
  build(tl, els, p, ctx) {
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const MAXL = p.width - 40, ENTRY = 0.1;
    const c2d = document.createElement("canvas").getContext("2d");
    const ww = w => { c2d.font = `700 ${p.size}px RFlex`; return c2d.measureText(w.text.toLowerCase()).width * 1.14; };
    const lw = ws => ws.reduce((t, w, i) => t + ww(w) + (i ? 12 : 0), 0);
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `700 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const lines = ws => { if (ws.length < 2) return [ws];
      let best = Math.ceil(ws.length / 2), bd = Infinity;
      for (let k = 1; k < ws.length; k++) { const a = lw(ws.slice(0, k)), b = lw(ws.slice(k)); if (a <= MAXL && b <= MAXL && Math.abs(a - b) < bd) { bd = Math.abs(a - b); best = k; } }
      return [ws.slice(0, best), ws.slice(best)].filter(l => l.length); };
    let G = [], cur = [];
    const close = () => { if (cur.length) G.push(cur); cur = []; };
    W.forEach((w, i) => { const nx = W[i + 1], test = cur.concat([w]);
      if (test.length > p.maxWords || lw(test) > MAXL * 1.8) { close(); cur = [w]; return; }
      cur.push(w);
      if (!nx || /[,.:!?]$/.test(w.text) || nx.start - w.end >= p.pause || cur.length >= p.maxWords) close(); });
    close();
    const out = [];                                                       // no single-word groups (source: merge into a neighbour with room)
    G.forEach(g => { if (g.length === 1 && out.length && out[out.length - 1].length < p.maxWords) out[out.length - 1] = out[out.length - 1].concat(g); else out.push(g); });
    for (let i = 0; i < out.length; i++) { if (out[i].length !== 1) continue;
      if (i + 1 < out.length && out[i + 1].length < p.maxWords) { out[i] = out[i].concat(out[i + 1]); out.splice(i + 1, 1); }
      else if (i > 0 && out[i - 1].length < p.maxWords) { out[i - 1] = out[i - 1].concat(out[i]); out.splice(i, 1); i--; } }
    G = out;
    ctx.css("text/caption-weight-shift", `
.capws { position: absolute; inset: 0; pointer-events: none; }
.capws-safe { position: absolute; left: 50%; transform: translateX(-50%); height: 278px; }
.capws-g { position: absolute; left: 0; top: 0; width: 100%; height: 278px; display: flex; align-items: center; justify-content: center; opacity: 0; transform-origin: 50% 50%; }
.capws-c { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.capws-l { display: flex; align-items: center; justify-content: center; gap: 12px; width: max-content; line-height: 1.1; white-space: nowrap; letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0,0,0,.3); text-transform: lowercase; }
.capws-l > span { display: inline-block; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "ws", { cls: "capws" });
      const safe = ctx.make(root, "div", "safe", { cls: "capws-safe", style: { width: p.width + "px", bottom: p.bottom + "px" } });
      const T = p.at;
      const vis = G.map((g, gi) => { const prev = G[gi - 1]; const gap = prev ? Math.max(0, g[0].start - prev[prev.length - 1].end) : ENTRY; return Math.max(0, g[0].start - Math.min(ENTRY, gap)); });
      G.forEach((g, gi) => {
        const size = fit(g.map(w => w.text.toLowerCase()).join(" "), p.size, MAXL), ls = lines(g);
        const grp = ctx.make(safe, "div", "g" + gi, { cls: "capws-g" }), copy = ctx.make(grp, "div", "c", { cls: "capws-c", style: { maxWidth: p.width + "px" } });
        const els2 = ls.map((ln, li) => { const line = ctx.make(copy, "div", "l" + li, { cls: "capws-l", style: { fontSize: size + "px", fontWeight: li === 0 ? p.bold : p.light, color: p.color } });
          ln.forEach((w, k) => ctx.make(line, "span", "w" + k, { text: w.text.toLowerCase() })); return line; });
        const vs = vis[gi], ve = gi < G.length - 1 ? vis[gi + 1] : g[g.length - 1].end + 0.5;
        tl.fromTo(grp, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: ENTRY, ease: "power3.out" }, T + vs);
        if (ls.length === 2) {
          const sw = T + ls[1][0].start;
          tl.fromTo(els2[0], { fontWeight: p.bold }, { fontWeight: p.light, duration: 0.1, ease: "power2.out" }, sw);
          tl.fromTo(els2[1], { fontWeight: p.light }, { fontWeight: p.bold, duration: 0.1, ease: "power2.out" }, sw);
        }
        tl.set(grp, { opacity: 0 }, T + ve);
      });
    }
  },
});
