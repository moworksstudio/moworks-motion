/* text/captions: on-screen captions timed to the voice, word by word (burn-in karaoke). Port of v1 SSPresets.captions (engine/presets/text.js).
   The target is an empty box placed in film.json (its font, size and colour are the captions' look); the words come from the voice transcript:
     "params": { "words": "voice" }   -> kit.py build fills in the scene voice's words (kit.py transcribe), timed from this motion's "at".
   Lines of at most maxWords words / maxSpan seconds (v1: 3 words, 1.2 s). Each word pops in when it is said (opacity, scale 0.7 -> 1,
   0.18 em rise, back.out(2.2), 0.26 s: v1 values); accent (optional) colours the word being said. A line stays up until the next one when the
   pause between them is shorter than `gap`, else it goes 0.25 s after its last word. */
AIMK.preset("text/captions", {
  params: { words: [], maxWords: 3, maxSpan: 1.2, color: null, accent: null, pop: 0.26, gap: 0.4 },
  build(tl, els, p, ctx) {
    ctx.css("text/captions", ".aimk-cap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;white-space:nowrap;opacity:0}"
      + ".aimk-cap>span{display:inline-block;margin:0 0.14em}");
    const toks = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(0, +w.end) }));
    const lines = [];
    let cur = [];
    for (const t of toks) {
      if (cur.length && (cur.length >= p.maxWords || t.end - cur[0].start > p.maxSpan)) { lines.push(cur); cur = []; }
      cur.push(t);
    }
    if (cur.length) lines.push(cur);
    for (const host of els) {
      const fs = parseFloat(getComputedStyle(host).fontSize) || 48;
      lines.forEach((ln, i) => {
        const el = ctx.make(host, "div", "cap" + i, { cls: "aimk-cap" });
        if (p.color) el.style.color = p.color;
        const a = p.at + ln[0].start, next = lines[i + 1] ? p.at + lines[i + 1][0].start : Infinity, last = p.at + ln[ln.length - 1].end;
        const b = next - last < p.gap ? next : Math.min(next, last + 0.25);
        tl.set(el, { opacity: 1 }, +a.toFixed(3));
        tl.set(el, { opacity: 0 }, +b.toFixed(3));
        ln.forEach((w, j) => {
          const s = ctx.make(el, "span", "w" + j, { text: w.text });
          const t0 = +(p.at + w.start).toFixed(3);
          tl.fromTo(s, { opacity: 0, scale: 0.7, y: +(0.18 * fs).toFixed(1) }, { opacity: 1, scale: 1, y: 0, duration: p.pop, ease: "back.out(2.2)" }, t0);
          if (p.accent) {
            const base = getComputedStyle(s).color;
            tl.set(s, { color: p.accent }, t0); tl.set(s, { color: base }, +(p.at + Math.max(w.end, w.start + 0.05)).toFixed(3));
          }
        });
      });
    }
  },
});
