/* text/caption-gradient-fill: word-timed captions in white; the word being said fills with a moving Siri-style gradient (orange, coral, pink,
   magenta, violet) for exactly as long as it is spoken and grows to 1.04, then turns white again. Port of HyperFrames registry component
   caption-gradient-fill (gradient, sizes, spacing and timing as in the source; the film's font at weight 900 instead of Montserrat: no network).
   The fill is the text itself (background-clip: text); the word box gets 0.15 em of extra room on top (cancelled by a negative margin) so
   Vietnamese stacked marks are still painted. BLOCK: the target is an empty box (usually the whole frame); captions sit 120 px from its bottom.
   Words: "params": { "words": "voice" }; groups: params.groups or automatic (sentence mark, maxWords, maxSpan, 0.6 s pause). */
AIMK.preset("text/caption-gradient-fill", {
  params: { words: [], groups: null, maxWords: 4, maxSpan: 2.0, size: 100, bottom: 120,
            gradient: "linear-gradient(90deg, #fe9f1b 0%, #f76e49 10%, #ff2063 20%, #fd56cb 30%, #ef7aff 40%, #fe9f1b 50%, white 50.5%, white 100%)" },
  build(tl, els, p, ctx) {
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let R = Array.isArray(p.groups) && p.groups.length ? p.groups : null;
    if (!R) { R = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.end - W[s].start > p.maxSpan || nx.start - w.end > 0.6) { R.push([s, i]); s = i + 1; } }); }
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `900 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    ctx.css("text/caption-gradient-fill", `
.capgf { position: absolute; inset: 0; pointer-events: none; }
.capgf-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 24px; padding: 0 80px; opacity: 0; visibility: hidden; }
.capgf-w { font-weight: 900; display: inline-block; letter-spacing: 0.04em; line-height: 1.15; padding: 0.15em 0 0.05em; margin-top: -0.15em;
  -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 350% 100%; background-position: 100% 0; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "gf", { cls: "capgf" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 160;
      R.forEach(([a, b], gi) => {
        const ws = W.slice(a, b + 1), size = fit(ws.map(w => w.text).join(" "), p.size, maxW);
        const grp = ctx.make(root, "div", "g" + gi, { cls: "capgf-g", style: { bottom: p.bottom + "px" } });
        const last = ws[ws.length - 1].end, next = gi < R.length - 1 ? W[R[gi + 1][0]].start : last + 0.5;
        const fade = +Math.min(0.25, (next - last) * 0.8).toFixed(4);
        tl.set(grp, { visibility: "visible", opacity: 1 }, T + ws[0].start);
        ws.forEach((w, i) => {
          const el = ctx.make(grp, "span", "w" + i, { cls: "capgf-w", text: w.text, style: { fontSize: size + "px", backgroundImage: p.gradient } });
          tl.set(el, { backgroundPosition: "100% 0%", scale: 1 }, T + ws[0].start);   // white until said (source: set at the group start)
          tl.set(el, { scale: 1.04 }, T + w.start);
          // the jump to 45 % is its own set, inserted before the sweep: seeking backward, a set restores the value before it (100 %, white)
          // while a fromTo would show its "from" (45 %, coloured) before its start (gallery seek check, 06/10/2026)
          tl.set(el, { backgroundPosition: "45% 0%" }, T + w.start);
          tl.fromTo(el, { backgroundPosition: "45% 0%" }, { backgroundPosition: "0% 0%", duration: +(w.end - w.start).toFixed(4), ease: "none" }, T + w.start);
          tl.set(el, { backgroundPosition: "100% 0%" }, T + w.end);
          tl.fromTo(el, { scale: 1.04 }, { scale: 1, duration: 0.15, ease: "power2.out" }, T + w.end);
        });
        if (fade > 0) tl.fromTo(grp, { opacity: 1 }, { opacity: 0, duration: fade, ease: "power1.out" }, T + next - fade);
        tl.set(grp, { visibility: "hidden" }, T + next);
      });
    }
  },
});
