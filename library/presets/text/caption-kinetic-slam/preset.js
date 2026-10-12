/* text/caption-kinetic-slam: one word at a time, huge, condensed and centred: each word slams in when it is said, cycling four entrances (drop from
   above with overshoot, whip from the left, whip from the right, pop from 40 %), keywords in gold, and blinks out at its end. Port of HyperFrames
   registry component caption-kinetic-slam (sizes, entrances, eases and timing as in the source). Font: Anton (condensed) becomes the film's font
   on a narrow width axis (wdth 30, weight 800): no network. BLOCK: the target is an empty box (usually the whole frame); words centre in it.
   Words: "params": { "words": "voice" }; params.keywords: words in gold. */
AIMK.preset("text/caption-kinetic-slam", {
  params: { words: [], keywords: [], size: 220, upper: true, color: "#ffffff", key: "#FFD700" },
  build(tl, els, p, ctx) {
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const KEY = new Set((p.keywords || []).map(norm));
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `800 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s;
    ctx.css("text/caption-kinetic-slam", `
.capks { position: absolute; inset: 0; pointer-events: none; }
.capks-w { position: absolute; left: 0; width: 100%; text-align: center; top: 50%; font-weight: 800; font-variation-settings: "wdth" 30; letter-spacing: 0.04em; line-height: 1;
  opacity: 0; visibility: hidden; }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "ks", { cls: "capks" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 200;
      W.forEach((w, wi) => {
        const el = ctx.make(root, "div", "w" + wi, { cls: "capks-w", text: up(w.text), style: { fontSize: fit(up(w.text), p.size, maxW) + "px", color: KEY.has(norm(w.text)) ? p.key : p.color } });
        tl.set(el, { yPercent: -50 }, T);
        tl.set(el, { visibility: "visible" }, T + w.start);
        const m = wi % 4, t0 = T + w.start;
        if (m === 0) tl.fromTo(el, { y: -120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "back.out(1.7)" }, t0);
        else if (m === 1) tl.fromTo(el, { x: -300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "expo.out" }, t0);
        else if (m === 2) tl.fromTo(el, { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "expo.out" }, t0);
        else tl.fromTo(el, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.24, ease: "back.out(2.2)" }, t0);
        // out: 0.1 s (source), shortened to the gap when the next word slams in sooner, so two words never share the frame (kit rule 1)
        const nx = W[wi + 1], fade = +(nx ? Math.min(0.1, Math.max(0.02, nx.start - w.end)) : 0.1).toFixed(4);
        tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: fade, ease: "power2.in" }, T + w.end);
        tl.set(el, { visibility: "hidden" }, T + w.end + fade);
      });
    }
  },
});
