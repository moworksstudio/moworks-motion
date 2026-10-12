/* text/caption-emoji-pop: social-style captions, up to 3 words a group in heavy uppercase with a black outline; words are white or one of three
   accents (pink, red, ice blue; keywords always accented, short function words always white, the rest picked by a fixed seed), each with a matching
   glow, and a group with an emoji word shows that emoji above the line. Each group pops in (scaleX 0.8 -> 1, 4 frames) and squashes out (3 frames).
   Port of HyperFrames registry component caption-emoji-pop (colours, stroke, shadows, sizes, grouping and timing as in the source; the film's font
   at weight 900 instead of Gabarito: no network). BLOCK: the target is an empty box (usually the whole frame); the 1400 x 280 safe zone sits
   80 px from its bottom. Words: "params": { "words": "voice" }. params.emoji: { word: emoji } (any case, punctuation ignored). */
AIMK.preset("text/caption-emoji-pop", {
  params: { words: [], keywords: [], emoji: {}, emojiLift: 96, maxWords: 3, pause: 0.1, size: 72, width: 1400, bottom: 80, primary: "#FFFFFF", accents: ["#FF76FF", "#FF0002", "#B2F7FF"], fps: 30 },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const FUNC = new Set(("the a an and or but is are was were to of in on at for with by from as it its this that these those be been have has had do does did will would could " +
      "should may might must can if then so just not no yes up out about và là của có cho với thì mà những các một này đó được bị đã sẽ đang rồi cũng từ trong trên dưới ra vào không chỉ nào").split(" "));
    const KEY = new Set((p.keywords || []).map(norm)), EMO = {};
    for (const k in p.emoji || {}) EMO[norm(k)] = p.emoji[k];
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const ENTRY = 4 / p.fps, EXIT = 3 / p.fps;
    const c2d = document.createElement("canvas").getContext("2d");
    const lineW = ws => ws.reduce((t, w, i) => { c2d.font = `900 ${p.size}px RFlex`; return t + c2d.measureText(w.text.toUpperCase()).width * 1.14 + (i ? 14 : 0); }, 0);
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `900 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const seeded = seed => { const x = Math.sin(seed * 9999) * 10000; return x - Math.floor(x); };
    const G = [];
    let cur = [];
    const close = () => { if (cur.length) G.push(cur); cur = []; };
    W.forEach((w, i) => {                                   // the source's grouping: max words, fits the line, a mark or a pause ends a group
      const nx = W[i + 1];
      if (cur.length + 1 > p.maxWords || lineW(cur.concat([w])) > p.width) { close(); cur = [w]; return; }
      cur.push(w);
      if (!nx || /[,.:!?]$/.test(w.text) || nx.start - w.end >= p.pause || cur.length >= p.maxWords) close();
    });
    close();
    const colors = (ws, gi) => ws.map((w, i) => { const c = norm(w.text);
      if (KEY.has(c)) return p.accents[Math.floor(seeded(gi * 23 + i * 31) * p.accents.length)];
      if (FUNC.has(c)) return p.primary;
      const r = seeded(gi * 13 + i); return r > 0.55 ? p.accents[Math.floor(r * p.accents.length) % p.accents.length] : p.primary; });
    const shadow = col => { const h = col.replace("#", ""), r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return `0 4px 8px rgba(0,0,0,0.7), 0 0 2px rgba(${r},${g},${b},1), 0 0 8px rgba(${r},${g},${b},0.6)`; };
    ctx.css("text/caption-emoji-pop", `
.capep { position: absolute; inset: 0; pointer-events: none; }
.capep-safe { position: absolute; left: 50%; transform: translateX(-50%); height: 280px; }
.capep-g { position: absolute; left: 0; top: 0; width: 100%; height: 280px; display: flex; align-items: center; justify-content: center; opacity: 0; transform-origin: 50% 50%; }
.capep-emo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, calc(-50% - var(--lift, 96px))); font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif; font-size: 56px; line-height: 1; text-align: center; }
.capep-l { display: flex; align-items: center; justify-content: center; gap: 14px; width: max-content; line-height: 1.1; white-space: nowrap; }
.capep-w { display: inline-block; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; -webkit-text-stroke: 3px #000000; paint-order: stroke fill; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "ep", { cls: "capep" });
      const safe = ctx.make(root, "div", "safe", { cls: "capep-safe", style: { width: p.width + "px", bottom: p.bottom + "px" } });
      const T = p.at;
      const vis = G.map((ws, gi) => { const prev = G[gi - 1]; const gap = prev ? Math.max(0, ws[0].start - prev[prev.length - 1].end) : ENTRY; return Math.max(0, ws[0].start - Math.min(ENTRY, gap)); });
      G.forEach((ws, gi) => {
        const size = fit(ws.map(w => w.text.toUpperCase()).join(" "), p.size, p.width), cols = colors(ws, gi);
        const grp = ctx.make(safe, "div", "g" + gi, { cls: "capep-g" });
        const emo = ws.map(w => EMO[norm(w.text)]).find(Boolean);
        if (emo) ctx.make(grp, "div", "emo", { cls: "capep-emo", text: emo, style: { "--lift": p.emojiLift + "px" } });   // source 70 px: Vietnamese capitals need room for their marks
        const line = ctx.make(grp, "div", "l", { cls: "capep-l", style: { maxWidth: p.width + "px" } });
        ws.forEach((w, i) => ctx.make(line, "span", "w" + i, { cls: "capep-w", text: w.text.toUpperCase(), style: { color: cols[i], fontSize: size + "px", textShadow: shadow(cols[i]) } }));
        const vs = vis[gi], ve = gi < G.length - 1 ? vis[gi + 1] : ws[ws.length - 1].end + 0.5, ex = Math.max(vs, ve - EXIT);
        tl.fromTo(grp, { opacity: 0, scaleX: 0.8, scaleY: 1 }, { opacity: 1, scaleX: 1, duration: +ENTRY.toFixed(4), ease: "power3.out" }, T + vs);
        tl.to(grp, { scaleX: 0.75, opacity: 0.8, duration: +EXIT.toFixed(4), ease: "power2.in" }, T + ex);
        tl.set(grp, { opacity: 0 }, T + ve);
      });
    }
  },
});
