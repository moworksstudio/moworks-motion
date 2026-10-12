/* ui/typing-indicator: the three-dot chat bubble that says someone is writing. It pops in (scale 0.6 -> 1, alpha 0.4 -> 1, 0.10 s power2.out, exactly as measured in the source),
   the dots hold still or breathe on the source's optional bounded wave, and the bubble vanishes (a hard cut) when `hold` seconds have passed (null = stays).
   Port of HyperFrames registry component typing-indicator. BLOCK: the target is an empty box; the bubble is built at its centre (x / y in px move it).
   Source sizes kept: bubble 1 em x 0.54 em with size = 124 px, dots 0.137 em, gap 0.081 em, tail circles 0.145 em / 0.073 em, wave y -9 px at 124 px
   (0.28 s sine.inOut yoyo, 6 half-cycles, dots offset 0.14 s, starting 0.15 s after the pop). */
AIMK.preset("ui/typing-indicator", {
  params: { size: 124, tone: "dark", tail: "on", wave: true, hold: 2.2, x: null, y: null },
  build(tl, els, p, ctx) {
    ctx.css("ui/typing-indicator", `
.uiti { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.uiti-box { position: relative; display: inline-block; }
.uiti-wrap { position: relative; display: inline-block; will-change: opacity, transform; }
.uiti-bubble { width: 1em; height: 0.54em; border-radius: 0.274em; display: flex; align-items: center; justify-content: center; gap: 0.081em; }
.uiti-dot { width: 0.137em; height: 0.137em; border-radius: 50%; display: inline-block; }
.uiti-t1 { position: absolute; left: -0.016em; bottom: -0.032em; width: 0.145em; height: 0.145em; border-radius: 50%; }
.uiti-t2 { position: absolute; left: -0.113em; bottom: -0.113em; width: 0.073em; height: 0.073em; border-radius: 50%; }`);
    const TONE = { dark: { surface: "#242428", dot: "#8e8e93" }, light: { surface: "#e9e9eb", dot: "#8e8e93" } }[p.tone] || { surface: "#242428", dot: "#8e8e93" };
    const size = Math.max(80, Math.min(220, +p.size || 124));
    for (const slot of els) {
      const place = (p.x != null || p.y != null) ? { position: "absolute", left: (p.x || 0) + "px", top: (p.y || 0) + "px" } : {};
      const root = ctx.make(slot, "div", "root", { cls: "uiti" });
      const box = ctx.make(root, "div", "box", { cls: "uiti-box", style: place });
      const wrap = ctx.make(box, "div", "wrap", { cls: "uiti-wrap", style: { fontSize: size + "px" } });
      const bubble = ctx.make(wrap, "div", "bubble", { cls: "uiti-bubble", style: { background: TONE.surface } });
      const dots = [1, 2, 3].map(n => ctx.make(bubble, "span", "d" + n, { cls: "uiti-dot", style: { background: TONE.dot } }));
      if (p.tail !== "off") { ctx.make(wrap, "div", "t1", { cls: "uiti-t1", style: { background: TONE.surface } }); ctx.make(wrap, "div", "t2", { cls: "uiti-t2", style: { background: TONE.surface } }); }
      const t = p.at;
      tl.set(box, { autoAlpha: 0 }, 0);
      tl.set(box, { autoAlpha: 1 }, t);
      tl.fromTo(wrap, { scale: 0.6, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.1, ease: "power2.out" }, t);
      if (p.wave) dots.forEach((dot, i) => tl.to(dot, { y: -+(9 * size / 124).toFixed(2), duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: 5 }, t + 0.15 + i * 0.14));
      if (p.hold != null) tl.set(box, { autoAlpha: 0 }, t + p.hold);
    }
  },
});
