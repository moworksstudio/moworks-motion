/* text/caption-clip-wipe: word-timed captions in groups; each word wipes on left to right as it is said, keywords flash gold, spoken words dim
   to 40 % white, and the whole group wipes off left to right before the next one. Port of HyperFrames registry component caption-clip-wipe
   (sizes, colours, eases and timing as in the source; the film's font instead of Poppins: no network). BLOCK: the target is an empty box (usually
   the whole frame); captions sit 120 px from its bottom. Words: "params": { "words": "voice" } (kit.py transcribe), times from this motion's "at".
   Groups: params.groups ([[first, last] word indexes]) or automatic (a sentence mark, maxWords words, maxSpan s or a 0.6 s pause ends a group);
   a group ends 0.5 s after its last word or 0.05 s before the next group (source rule). Keywords: params.keywords (words, any case). */
AIMK.preset("text/caption-clip-wipe", {
  params: { words: [], groups: null, maxWords: 4, maxSpan: 2.0, keywords: [], size: 88, weight: 800, upper: true, bottom: 120, color: "#ffffff", key: "#FFD700", spoken: "rgba(255,255,255,0.4)" },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    let R = Array.isArray(p.groups) && p.groups.length ? p.groups : null;
    if (!R) { R = []; let s = 0; W.forEach((w, i) => { const nx = W[i + 1];
      if (!nx || /[.!?…;:,]$/.test(w.text) || i - s + 1 >= p.maxWords || nx.end - W[s].start > p.maxSpan || nx.start - w.end > 0.6) { R.push([s, i]); s = i + 1; } }); }
    const G = R.map(([a, b], gi) => { const nx = gi + 1 < R.length ? W[R[gi + 1][0]].start : W[b].end + 1; return { a, b, start: W[a].start, end: Math.min(W[b].end + 0.5, nx - 0.05) }; });
    const KEY = new Set((p.keywords || []).map(norm));
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, weight, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `${weight} ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s;
    ctx.css("text/caption-clip-wipe", `
.capcw { position: absolute; inset: 0; pointer-events: none; }
.capcw-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 24px; padding: 0 100px; visibility: hidden; }
.capcw-w { display: inline-block; letter-spacing: 0.04em; line-height: 1; clip-path: inset(-0.4em 100% -0.3em 0); }`);
    for (const slot of els) {
      const box = ctx.make(slot, "div", "cw", { cls: "capcw" });
      const maxW = (slot.offsetWidth || ctx.W) - 200;
      G.forEach((g, gi) => {
        const ws = W.slice(g.a, g.b + 1);
        const grp = ctx.make(box, "div", "g" + gi, { cls: "capcw-g", style: { bottom: p.bottom + "px" } });
        const size = fit(ws.map(w => up(w.text)).join(" "), p.size, p.weight, maxW);
        const spans = ws.map((w, i) => ctx.make(grp, "span", "w" + i, { cls: "capcw-w", text: up(w.text), style: { fontSize: size + "px", fontWeight: p.weight, color: p.color } }));
        tl.set(grp, { visibility: "visible" }, p.at + g.start);
        ws.forEach((w, i) => {
          const s = spans[i], t0 = p.at + w.start;
          tl.fromTo(s, { clipPath: "inset(-0.4em 100% -0.3em 0em)" }, { clipPath: "inset(-0.4em 0% -0.3em 0em)", duration: 0.3, ease: "power2.out" }, t0);   // the clip reaches 0.4 em above / 0.3 em below the line: Vietnamese capitals stack marks over line-height 1
          if (KEY.has(norm(w.text))) tl.fromTo(s, { color: p.color }, { color: p.key, duration: 0.05, ease: "power1.out" }, t0 + 0.1);   // source: GSAP's default ease
          tl.to(s, { color: p.spoken, duration: 0.2, ease: "power1.out" }, p.at + w.end);
        });
        tl.to(spans, { clipPath: "inset(-0.4em 0% -0.3em 100%)", duration: 0.25, stagger: 0.04, ease: "power2.in" }, p.at + g.end - 0.2);
        tl.set(grp, { visibility: "hidden", opacity: 0 }, p.at + g.end);
      });
    }
  },
});
