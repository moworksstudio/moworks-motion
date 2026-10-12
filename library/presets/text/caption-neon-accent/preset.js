/* text/caption-neon-accent: social captions, up to 4 words a group on one or two balanced lines, heavy uppercase with a deep drop shadow; some
   words (keywords always, others by a fixed seed) are 1.2x larger in neon lime / red / yellow with a four-step glow. Each group pops in from 65 %
   (7 frames) and, while held, sways diagonally by 14 px (sine, 1.54 s a cycle, alternating direction per group). Port of HyperFrames registry
   component caption-neon-accent (colours, glow, sizes, grouping, line balancing and timing as in the source; the film's font at weight 800 instead
   of Montserrat: no network). Note: the sway moves text while it is read (against the kit's rule 2): params.wiggle false keeps it still.
   BLOCK: the target is an empty box (usually the whole frame); the 1400 x 260 safe zone sits 100 px from its bottom. Words: "words": "voice". */
AIMK.preset("text/caption-neon-accent", {
  params: { words: [], keywords: [], maxWords: 4, pause: 0.1, size: 88, minSize: 62, width: 1400, bottom: 100, wiggle: true, distance: 14,
            primary: "#FFFFFF", accents: ["#53FF01", "#FF0002", "#FCFF00"], fps: 30 },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}']+/gu, "");
    const FUNC = new Set(("the a an and or but is are was were to of in on at for with by from as it its this that these those be been have has had do does did will would could " +
      "should may might must can if then so just not no yes up out about và là của có cho với thì mà những các một này đó được bị đã sẽ đang rồi cũng từ trong trên dưới ra vào không chỉ nào").split(" "));
    const KEY = new Set((p.keywords || []).map(norm));
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const ENTRY = 7 / p.fps, CYCLE = 2 / 1.3;
    const seeded = seed => { const x = Math.sin(seed * 9999) * 10000; return x - Math.floor(x); };
    const colorsOf = (ws, gi) => ws.map((w, i) => { const c = norm(w.text);
      if (KEY.has(c)) return p.accents[Math.floor(seeded(gi * 23 + 7) * p.accents.length)];
      if (FUNC.has(c)) return p.primary;
      const r = seeded(gi * 7 + i); return r > 0.6 ? p.accents[Math.floor(r * p.accents.length) % p.accents.length] : p.primary; });
    const c2d = document.createElement("canvas").getContext("2d");
    const wordW = (w, col, fs) => { c2d.font = `800 ${col === p.primary ? fs : fs * 1.2}px RFlex`; return c2d.measureText(w.text.toUpperCase()).width * 1.14; };
    const lineW = (ws, cs, fs) => ws.reduce((t, w, i) => t + wordW(w, cs[i], fs) + (i ? 16 : 0), 0);
    const split = (ws, cs, fs) => {                                   // one line, or two lines as balanced as possible, each within the width
      if (ws.some((w, i) => wordW(w, cs[i], fs) > p.width)) return null;
      if (lineW(ws, cs, fs) <= p.width) return [{ ws, cs }];
      let best = null, bd = Infinity;
      for (let k = 1; k < ws.length; k++) { const a = lineW(ws.slice(0, k), cs.slice(0, k), fs), b = lineW(ws.slice(k), cs.slice(k), fs);
        if (a <= p.width && b <= p.width && Math.abs(a - b) < bd) { bd = Math.abs(a - b); best = [{ ws: ws.slice(0, k), cs: cs.slice(0, k) }, { ws: ws.slice(k), cs: cs.slice(k) }]; } }
      return best;
    };
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `800 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const G = []; let cur = [];
    const close = () => { if (!cur.length) return; const gi = G.length, cs = colorsOf(cur, gi);
      let fs = fit(cur.map(w => w.text.toUpperCase()).join(" "), p.size, p.width); while (fs > p.minSize && !split(cur, cs, fs)) fs -= 2;
      G.push({ ws: cur, cs, fs, lines: split(cur, cs, fs) || [{ ws: cur, cs }], start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
    W.forEach((w, i) => { const nx = W[i + 1], test = cur.concat([w]);
      if (test.length > p.maxWords || !split(test, colorsOf(test, G.length), p.size)) { close(); cur = [w]; return; }
      cur.push(w);
      if (!nx || /[,.:!?]$/.test(w.text) || nx.start - w.end >= p.pause || cur.length >= p.maxWords) close(); });
    close();
    const shadow = col => { const h = col.replace("#", ""), r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16), c = `${r},${g},${b}`;
      return `0 8px 16px rgba(0,0,0,0.8), 0 16px 40px rgba(0,0,0,0.6), 0 0 4px rgba(${c},1), 0 0 10px rgba(${c},0.9), 0 0 20px rgba(${c},0.7), 0 0 40px rgba(${c},0.4)`; };
    ctx.css("text/caption-neon-accent", `
.capna { position: absolute; inset: 0; pointer-events: none; }
.capna-safe { position: absolute; left: 50%; transform: translateX(-50%); height: 260px; }
.capna-g { position: absolute; left: 0; top: 0; width: 100%; height: 260px; display: flex; align-items: center; justify-content: center; opacity: 0; transform-origin: 50% 50%; }
.capna-c { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.capna-l { display: flex; align-items: center; justify-content: center; gap: 16px; width: max-content; line-height: 1.1; white-space: nowrap; }
.capna-w { display: inline-block; font-weight: 800; line-height: 1.1; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "na", { cls: "capna" });
      const safe = ctx.make(root, "div", "safe", { cls: "capna-safe", style: { width: p.width + "px", bottom: p.bottom + "px" } });
      const T = p.at;
      const vis = G.map((g, gi) => { const prev = G[gi - 1]; const gap = prev ? Math.max(0, g.start - prev.end) : ENTRY; return Math.max(0, g.start - Math.min(ENTRY, gap)); });
      G.forEach((g, gi) => {
        const grp = ctx.make(safe, "div", "g" + gi, { cls: "capna-g" }), copy = ctx.make(grp, "div", "c", { cls: "capna-c", style: { maxWidth: p.width + "px" } });
        g.lines.slice(0, 2).forEach((ln, li) => { const line = ctx.make(copy, "div", "l" + li, { cls: "capna-l" });
          ln.ws.forEach((w, i) => { const col = ln.cs[i] || p.primary;
            ctx.make(line, "span", "w" + i, { cls: "capna-w", text: w.text.toUpperCase(), style: { color: col, fontSize: (col === p.primary ? g.fs : +(g.fs * 1.2).toFixed(2)) + "px", textShadow: shadow(col) } }); }); });
        const vs = vis[gi], ve = gi < G.length - 1 ? vis[gi + 1] : g.end + 0.5, D = p.distance * (gi % 2 === 0 ? -1 : 1);
        tl.fromTo(grp, { opacity: 0, scale: 0.65 }, { opacity: 1, scale: 1, duration: +ENTRY.toFixed(4), ease: "power3.out" }, T + vs);
        if (p.wiggle) { const cycles = Math.max(1, Math.ceil((ve - vs) / CYCLE));
          tl.fromTo(grp, { x: 0, y: 0 }, { x: D, y: D, duration: +(CYCLE / 2).toFixed(4), ease: "sine.inOut", yoyo: true, repeat: Math.max(0, cycles * 2 - 1) }, T + vs); }
        tl.set(grp, { opacity: 0 }, T + ve);
      });
    }
  },
});
