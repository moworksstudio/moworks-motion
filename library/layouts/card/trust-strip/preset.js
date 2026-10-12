/* card/trust-strip: a monochrome trust row: N text wordmarks in wide-tracked uppercase, one centred row with wide gaps, no boxes, no borders (wraps to a second centred
   row above what fits). The marks fade in with an opacity-only stagger from left to right, then the strip holds dead still. Optional exit fade | up.
   Port of HyperFrames registry component trust-strip. BLOCK: built inside the target box and sized from it (source: container units of its mount box). No brand artwork:
   the marks are plain text (params), replace them with the client names.
   Source timing kept: first mark at 0.2 s, 0.15 s gap (or the `cues` seconds), 0.5 s power2.out fade each, exit 0.45 s power2.in; everything compresses together
   when `duration` is shorter than IN + OUT. */
AIMK.preset("card/trust-strip", {
  params: { marks: "Sao Mai,An Phú,Hải Long,Việt Tín,Đại Phát", tone: "muted", cues: "", accent: "#1d4ed8", exit: "none", duration: 3.5, fg: "#14161b", muted: "#93939f" },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const mix = (a, b, q) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v * q / 100 + B[i] * (100 - q) / 100).toString(16).padStart(2, "0")).join(""); };
    const t = p.at, exit = p.exit === "fade" || p.exit === "up" ? p.exit : "none", tone = p.tone === "ink" ? p.fg : p.muted, color = mix(tone, p.accent, 90);
    let marks = (Array.isArray(p.marks) ? p.marks.map(String) : String(p.marks == null ? "" : p.marks).split(",")).map(s => s.trim()).filter(Boolean);
    if (!marks.length) marks = ["Sao Mai", "An Phú", "Hải Long", "Việt Tín", "Đại Phát"];
    const LEAD = 0.2, GAP = 0.15, FADE = 0.5, OUT_B = exit === "none" ? 0 : 0.45, D = Math.max(0.001, Number(p.duration) || 3.5);
    const cues = String(p.cues == null ? "" : p.cues).split(",").map(parseFloat).filter(c => isFinite(c) && c >= 0);
    const starts = marks.map((m, i) => i < cues.length ? cues[i] : cues.length > 0 ? cues[cues.length - 1] + GAP * (i - cues.length + 1) : LEAD + GAP * i);
    const IN_B = Math.max(...starts) + FADE, sc = D < IN_B + OUT_B ? D / (IN_B + OUT_B) : 1, FD = FADE * sc, OUT = OUT_B * sc;
    ctx.css("card/trust-strip", `
.cts-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.cts-strip { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; }
.cts-mark { font-weight: 400; line-height: 1; letter-spacing: 0.32em; text-transform: uppercase; white-space: nowrap; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100;
      const box = ctx.make(slot, "div", "ts", { cls: "cts-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const strip = ctx.make(box, "div", "strip", { cls: "cts-strip", style: { width: cw(86) + "px", maxWidth: cw(86) + "px", columnGap: cw(4.8) + "px", rowGap: ch(4.2) + "px" } });
      const spans = marks.map((m, i) => ctx.make(strip, "span", "m" + i, { cls: "cts-mark", text: m, style: { color, fontSize: Math.min(cw(1.9), ch(6.4)) + "px" } }));
      spans.forEach((s, i) => tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: FD, ease: "power2.out" }, t + starts[i] * sc));
      if (exit !== "none") {
        tl.fromTo(strip, { opacity: 1 }, { opacity: 0, duration: OUT, ease: "power2.in" }, t + D - OUT);
        if (exit === "up") tl.fromTo(strip, { y: 0 }, { y: -ch(1.6), duration: OUT, ease: "power2.in" }, t + D - OUT);
      }
    }
  },
});
