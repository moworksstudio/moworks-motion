/* text/caption-glitch-rgb: cyber captions over a darkening gradient and fine scanlines: each word, as it is said, jolts sideways with a red / cyan
   RGB split (text shadows) and snaps back; long words and figures get short aftershock pulses until the next word. Port of HyperFrames registry
   component caption-glitch-rgb (overlay, scanlines, grouping, per-word seeded glitch plan and timing as in the source; the film's font instead
   of Space Grotesk: no network). BLOCK: the target is an empty box (usually the whole frame); captions sit 120 px from its bottom.
   Words: "params": { "words": "voice" }. Groups end at a sentence mark, a 0.28 s pause, 4 words or 21 characters (source). */
AIMK.preset("text/caption-glitch-rgb", {
  params: { words: [], size: 88, upper: true, bottom: 120, color: "#ffffff", red: "#ff003c", cyan: "#00e5ff", overlay: true, scanlines: true },
  build(tl, els, p, ctx) {
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const R = []; let s0 = 0, chars = 0;
    W.forEach((w, i) => { chars += w.text.length + 1; const gap = i + 1 < W.length ? W[i + 1].start - w.end : 0;
      if (/[.!?]$/.test(w.text) || gap > 0.28 || i - s0 >= 3 || chars >= 21 || i === W.length - 1) { R.push([s0, i]); s0 = i + 1; chars = 0; } });
    const G = R.map(([a, b], gi) => { const nx = gi + 1 < R.length ? W[R[gi + 1][0]].start : W[b].end + 1; return { a, b, start: W[a].start, end: Math.min(W[b].end + 0.5, nx - 0.05) }; });
    const mulberry32 = seed => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `700 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s, DROP = "0 5px 18px rgba(0,0,0,0.52)";
    const rgb = h => { const v = parseInt(String(h).replace("#", ""), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255].join(","); };
    // rest and split share one structure (three shadows): GSAP interpolates them number by number. With the source's one-shadow rest string the
    // tween could not interpolate and showed the split or the rest depending on where the playhead came from (seek check, 06/10/2026)
    const BASE = `0px 0px 0px rgba(${rgb(p.red)},0), 0px 0px 0px rgba(${rgb(p.cyan)},0), ${DROP}`;
    const split = m => `${m}px 0px 0px rgba(${rgb(p.red)},1), -${m}px 0px 0px rgba(${rgb(p.cyan)},1), ${DROP}`;
    ctx.css("text/caption-glitch-rgb", `
.capgl { position: absolute; inset: 0; pointer-events: none; }
.capgl-ov { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.08) 0%, rgba(0,0,0,.16) 54%, rgba(0,0,0,.5) 100%); }
.capgl-sl { position: absolute; inset: 0; background: repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,.16) 3px, rgba(0,0,0,.16) 4px); opacity: .55; }
.capgl-g { position: absolute; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 14px; padding: 0 100px; opacity: 0; visibility: hidden; }
.capgl-w { font-weight: 700; display: inline-block; letter-spacing: 0.03em; line-height: 0.96; text-shadow: 0 5px 18px rgba(0,0,0,.52); }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "gl", { cls: "capgl" });
      if (p.overlay) ctx.make(root, "div", "ov", { cls: "capgl-ov" });
      if (p.scanlines) ctx.make(root, "div", "sl", { cls: "capgl-sl" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 200;
      G.forEach((g, gi) => {
        const ws = W.slice(g.a, g.b + 1), size = fit(ws.map(w => up(w.text)).join(" "), p.size, maxW);
        const grp = ctx.make(root, "div", "g" + gi, { cls: "capgl-g", style: { bottom: p.bottom + "px" } });
        tl.set(grp, { visibility: "visible" }, T + g.start);
        tl.fromTo(grp, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power2.out" }, T + g.start);
        ws.forEach((w, i) => {
          const wi = g.a + i, el = ctx.make(grp, "span", "w" + i, { cls: "capgl-w", text: up(w.text), style: { fontSize: size + "px", color: p.color } });
          const nw = W[wi + 1], ns = nw ? nw.start : w.end + 0.3, total = Math.min(0.24, Math.max(0.08, Math.min(w.end, ns) - w.start - 0.02));
          const d1 = +(total * 0.35).toFixed(4), d2 = +(total * 0.65).toFixed(4), rng = mulberry32(wi * 777 + 13);
          const travel = +(-(8 + rng() * 8)).toFixed(2), sm = (5 + rng() * 7).toFixed(1);
          const nextStart = nw ? nw.start : g.end, aEnd = Math.min(g.end - 0.08, nextStart - 0.04);
          tl.fromTo(el, { x: 0, textShadow: BASE }, { x: travel, textShadow: split(sm), duration: d1, ease: "none" }, T + w.start);
          tl.fromTo(el, { x: travel, textShadow: split(sm) }, { x: 0, textShadow: BASE, duration: d2, ease: "power3.out" }, T + w.start + d1);   // explicit starts: seek-stable
          if ((/\d|\$|%/.test(w.text) || w.text.replace(/[^\p{L}\p{N}_]/gu, "").length >= 7) && aEnd - w.end > 0.22) {   // aftershock pulses
            let ps = w.end + 0.08, k = 0;
            while (ps + 0.1 < aEnd) {
              const pt = +(-(3 + rng() * 5)).toFixed(2), sh = (3 + rng() * 5).toFixed(1);
              tl.fromTo(el, { x: 0, textShadow: BASE }, { x: pt, textShadow: split(sh), duration: 0.045, ease: "none" }, T + ps);
              tl.fromTo(el, { x: pt, textShadow: split(sh) }, { x: 0, textShadow: BASE, duration: 0.075, ease: "power3.out" }, T + ps + 0.045);
              k++; ps += k % 2 === 0 ? 0.18 : 0.24;
            }
          }
        });
        tl.fromTo(grp, { opacity: 1 }, { opacity: 0, duration: 0.1, ease: "power2.in" }, T + g.end - 0.1);
        tl.set(grp, { opacity: 0, visibility: "hidden" }, T + g.end);
      });
    }
  },
});
