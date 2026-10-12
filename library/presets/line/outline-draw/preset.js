/* line/outline-draw: a rounded outline draws itself clockwise from the top centre (an angular sweep, 0.8 s power2.out) over whatever is beneath,
   leaving the middle transparent. Port of HyperFrames registry component outline-draw. BLOCK: the outline is built inside the target (empty box, usually the whole frame).
   Same mechanic as the source: a conic-gradient sector on a transparent border, two masks (padding box / border box) combined with `exclude`,
   the registered progress number tweened directly (--od-progress 0 -> progress). Exit (source: 0.4 s fade at 3.6 s of 4 s): params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("line/outline-draw", {
  params: { progress: 100, thickness: 6, radius: 24, inset: 8, accent: "#38bdf8", exitAt: 3.6 },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, t = p.at, m = Math.min(W, H);
    const num = (v, a, b, d) => Number.isFinite(+v) ? Math.max(a, Math.min(b, +v)) : d;
    const prog = num(p.progress, 0, 100, 100), th = num(p.thickness, 1, 20, 6), rad = num(p.radius, 0, 80, 24);
    const inset = +(p.inset * m / 100).toFixed(2), bw = +(th * 0.1 * W / 100).toFixed(2), br = +(rad * 0.1 * m / 100).toFixed(2);
    ctx.css("line/outline-draw", `
.odr { position: absolute; border-style: solid; border-color: transparent; box-sizing: border-box; background-clip: border-box; background-origin: border-box; pointer-events: none;
  background: conic-gradient(from -90deg, var(--od-accent) 0deg calc(var(--od-progress) * 3.6deg), transparent calc(var(--od-progress) * 3.6deg + 0.5deg) 360deg);
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0) border-box; -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0) border-box; mask-composite: exclude; }`);
    for (const slot of els) {
      const o = ctx.make(slot, "div", "od", { cls: "odr", attrs: { style: `left:${inset}px;top:${inset}px;right:${inset}px;bottom:${inset}px;border-width:${bw}px;border-radius:${br}px;--od-progress:0;--od-accent:${p.accent}` } });
      tl.set(o, { opacity: 0, ease: "none" }, 0);
      tl.set(o, { opacity: 1, ease: "none" }, t);
      tl.fromTo(o, { "--od-progress": 0 }, { "--od-progress": prog, duration: 0.8, ease: "power2.out" }, t);
      if (p.exitAt != null) tl.to(o, { opacity: 0, duration: 0.4, ease: "power2.out" }, t + p.exitAt);
    }
  },
});
