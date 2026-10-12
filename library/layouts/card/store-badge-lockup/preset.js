/* card/store-badge-lockup: a mobile end card: a short headline settles first, then two equal download badges rise and fade in with a small stagger, then hold;
   a fixed 0.45 s fade releases the lockup at the end of `duration`.
   Port of HyperFrames registry component store-badge-lockup. BLOCK: built inside the target box and sized from it (source: container units of its mount box).
   The badges are plain rounded badges with a placeholder glyph (a letter in a rounded square, or a play triangle) and two lines of text, both params: no store logo artwork.
   Source timing kept: headline 0.48 s at 0.05 s, badges 0.68 s with 0.1 s stagger at 0.22 s (power2.out, from 22 % / 28 % of their own height), out 0.45 s; if
   `duration` < 1.65 s IN and OUT scale together. */
AIMK.preset("card/store-badge-lockup", {
  params: { headline: "Tải ứng dụng ngay", showA: "yes", showB: "yes", microA: "Tải về trên", labelA: "App Store", glyphA: "A", microB: "TẢI VỀ TRÊN", labelB: "Google Play", glyphB: "play",
    duration: 4, bg: "#080b13", fg: "#f7f9fc", muted: "#aab4c5", surface: "#151c29", border: "#3b4659", brand: "#7c6cff" },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const mix = (a, b, q) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v * q / 100 + B[i] * (100 - q) / 100).toString(16).padStart(2, "0")).join(""); };
    const t = p.at, showA = p.showA !== "no", showB = p.showB !== "no";
    const D = Math.max(0.001, Number(p.duration) || 4), IN_B = 1.2, OUT_B = 0.45, sc = D < IN_B + OUT_B ? D / (IN_B + OUT_B) : 1, OUT = OUT_B * sc, OUT_START = D - OUT;
    ctx.css("card/store-badge-lockup", `
.csb-box { position: absolute; display: grid; place-items: center; overflow: hidden; box-sizing: border-box; }
.csb-lock { display: grid; justify-items: center; }
.csb-head { margin: 0; font-weight: 750; line-height: 1; letter-spacing: -0.045em; text-align: center; text-wrap: balance; }
.csb-badges { width: 100%; display: flex; align-items: center; justify-content: center; }
.csb-badge { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; box-sizing: border-box; }
.csb-glyph { display: grid; place-items: center; flex: none; box-sizing: border-box; }
.csb-mark { font-weight: 800; line-height: 1; }
.csb-play { width: 42%; aspect-ratio: 0.88; clip-path: polygon(8% 0, 100% 50%, 8% 100%); background: currentColor; }
.csb-copy { min-width: 0; display: grid; }
.csb-micro { font-weight: 600; line-height: 1; letter-spacing: 0.04em; white-space: nowrap; }
.csb-label { font-weight: 720; line-height: 1; letter-spacing: -0.025em; white-space: nowrap; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, m = (a, b) => Math.min(cw(a), ch(b)), R = ch(2.4);
      const box = ctx.make(slot, "div", "sb", { cls: "csb-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", padding: ch(4.8) + "px", color: p.fg } });
      const lock = ctx.make(box, "div", "lock", { cls: "csb-lock", style: { width: Math.min(cw(88), ch(154)) + "px", gap: m(6, 7) + "px" } });
      const head = ctx.make(lock, "div", "head", { cls: "csb-head", text: p.headline, style: { maxWidth: cw(82) + "px", fontSize: m(8.2, 12.5) + "px", color: p.fg } });
      const row = ctx.make(lock, "div", "badges", { cls: "csb-badges", style: { gap: ch(2.4) + "px" } });
      const badge = (k, micro, label, glyph) => {
        const b = ctx.make(row, "div", "badge" + k, { cls: "csb-badge", style: { width: m(40, 67) + "px", aspectRatio: "3.12 / 1", gap: ch(1.2) + "px", padding: `${m(2.2, 3.2)}px ${m(3, 4.8)}px`,
          border: `${ch(0.16)}px solid ${p.border}`, borderRadius: R * 4 + "px", background: p.surface, color: p.fg, boxShadow: `0 ${ch(1.5)}px ${ch(3.8)}px ${rgba(p.bg, 0.7)}` } });
        const g = ctx.make(b, "span", "glyph", { cls: "csb-glyph", style: { width: m(6.7, 10.5) + "px", aspectRatio: "1", border: `${ch(0.16)}px solid ${rgba(p.fg, 0.28)}`, borderRadius: R * 0.72 + "px", background: mix(p.brand, p.surface, 20), color: p.fg } });
        if (glyph === "play") ctx.make(g, "span", "mark", { cls: "csb-play" }); else ctx.make(g, "span", "mark", { cls: "csb-mark", text: glyph, style: { fontSize: m(3.2, 5.2) + "px" } });
        const c = ctx.make(b, "span", "copy", { cls: "csb-copy", style: { gap: m(0.4, 0.6) + "px" } });
        ctx.make(c, "span", "micro", { cls: "csb-micro", text: micro, style: { fontSize: m(1.65, 2.65) + "px", color: p.muted } });
        ctx.make(c, "span", "label", { cls: "csb-label", text: label, style: { fontSize: m(3.75, 5.8) + "px", color: p.fg } });
        return b;
      };
      const badges = [];
      if (showA) badges.push(badge("a", p.microA, p.labelA, p.glyphA));
      if (showB) badges.push(badge("b", p.microB, p.labelB, p.glyphB));
      tl.fromTo(head, { yPercent: 22, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.48 * sc, ease: "power2.out" }, t + 0.05 * sc);
      badges.forEach((b, i) => tl.fromTo(b, { yPercent: 28, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.68 * sc, ease: "power2.out" }, t + (0.22 + i * 0.1) * sc));   // source: one tween with stagger 0.1 s
      tl.fromTo(lock, { opacity: 1 }, { opacity: 0, duration: OUT, ease: "power2.in" }, t + OUT_START);
    }
  },
});
