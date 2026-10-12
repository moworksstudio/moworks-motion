/* text/caption-highlight: word-timed captions in groups; behind the word being said a red rounded highlight grows left to right (and the word
   flashes a touch brighter), then shrinks away at the word's end. Port of HyperFrames registry component caption-highlight (sizes, gradient,
   shadows, eases and timing as in the source; the film's font instead of Montserrat: no network). BLOCK: the target is an empty box (usually
   the whole frame); captions sit 140 px from its bottom. Words: "params": { "words": "voice" } (kit.py transcribe), times from this motion's "at".
   Groups: params.groups ([[first, last] word indexes]) or automatic (a sentence mark, maxWords words, maxSpan s or a 0.6 s pause ends a group);
   a group ends 0.5 s after its last word or 0.05 s before the next group (source rule). */
AIMK.preset("text/caption-highlight", {
  params: { words: [], groups: null, maxWords: 4, maxSpan: 2.0, size: 80, weight: 800, upper: true, bottom: 140, color: "#ffffff", hl: ["#ff1745", "#df1238"] },
  build(tl, els, p, ctx) {
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let R = Array.isArray(p.groups) && p.groups.length ? p.groups : null;
    if (!R) { R = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.end - W[s].start > p.maxSpan || nx.start - w.end > 0.6) { R.push([s, i]); s = i + 1; } }); }
    const G = R.map(([a, b], gi) => { const nx = gi + 1 < R.length ? W[R[gi + 1][0]].start : W[b].end + 1; return { a, b, start: W[a].start, end: Math.min(W[b].end + 0.5, nx - 0.05) }; });
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, weight, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `${weight} ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s;
    const [h1, h2] = Array.isArray(p.hl) ? p.hl : [p.hl, p.hl];
    ctx.css("text/caption-highlight", `
.caphl { position: absolute; inset: 0; pointer-events: none; }
.caphl-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 8px; padding: 0 100px; opacity: 0; visibility: hidden; }
.caphl-w { display: inline-block; letter-spacing: 0.02em; line-height: 1; position: relative; padding: 6px 12px 8px; text-shadow: 0 6px 18px rgba(0,0,0,.45); transform-origin: 50% 58%; }
.caphl-bg { position: absolute; inset: 0; border-radius: 10px; opacity: 0; transform: scaleX(0); transform-origin: 0% 50%; z-index: -1; }
.caphl-t { position: relative; z-index: 1; }`);
    for (const slot of els) {
      const box = ctx.make(slot, "div", "hl", { cls: "caphl" });
      const maxW = (slot.offsetWidth || ctx.W) - 300;
      G.forEach((g, gi) => {
        const ws = W.slice(g.a, g.b + 1);
        const grp = ctx.make(box, "div", "g" + gi, { cls: "caphl-g", style: { bottom: p.bottom + "px" } });
        const size = fit(ws.map(w => up(w.text)).join(" "), p.size, p.weight, maxW);
        const T = p.at;
        tl.set(grp, { visibility: "visible" }, T + g.start);
        tl.fromTo(grp, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power2.out" }, T + g.start);
        ws.forEach((w, i) => {
          const word = ctx.make(grp, "span", "w" + i, { cls: "caphl-w", style: { fontSize: size + "px", fontWeight: p.weight, color: p.color } });
          const bg = ctx.make(word, "span", "bg", { cls: "caphl-bg", style: { background: `linear-gradient(135deg, ${h1} 0%, ${h2} 100%)`, boxShadow: `0 12px 30px color-mix(in srgb, ${h2} 32%, transparent)` } });
          ctx.make(word, "span", "t", { cls: "caphl-t", text: up(w.text) });
          tl.fromTo(bg, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.15, ease: "power2.out" }, T + w.start);
          tl.fromTo(word, { filter: "brightness(1)" }, { filter: "brightness(1.05)", duration: 0.08, ease: "power2.out" }, T + w.start);
          tl.to(word, { filter: "brightness(1)", duration: 0.16, ease: "power2.out" }, T + w.start + 0.08);
          tl.to(bg, { opacity: 0, scaleX: 1.02, duration: 0.1, ease: "power2.in" }, T + w.end);
          tl.set(bg, { scaleX: 0 }, T + w.end + 0.1);
        });
        tl.to(grp, { opacity: 0, duration: 0.1, ease: "power2.in" }, T + g.end - 0.1);
        tl.set(grp, { visibility: "hidden" }, T + g.end);
      });
    }
  },
});
