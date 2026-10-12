/* text/per-word-fade: text/per-word-rise without the blur: words (or characters) rise into place and fade in, same cascade and landing.
   Variant asked for in the gallery review (05/10/2026). Motion values from HyperFrames registry component per-word-rise. */
AIMK.preset("text/per-word-fade", {
  params: { split: "words", rise: 0.74, spread: 0.62, y: 0.08, exit: "none", exitAt: 2.6 },
  build(tl, els, p, ctx) {
    const SPLIT = 0.78, RES = 0.07, SEAM = ((1 - RES) / SPLIT) * 0.5;
    const land = q => { if (q <= 0) return 0; if (q >= 1) return 1;
      if (q < SPLIT) { const x = q / SPLIT, inv = 1 - x; return (1 - RES) * (0.5 * (1 - inv * inv * inv) + 0.5 * x); }
      const u = (q - SPLIT) / (1 - SPLIT), b = SEAM * (1 - SPLIT), c = 3 * RES - 2 * b, d = b - 2 * RES; return 1 - RES + b * u + c * u * u + d * u * u * u; };
    const ease = ctx.ease(land, "per-word-rise landEase");
    const y = Math.round(p.y * ctx.H);
    for (const el of els) {
      const units = ctx.split(el, p.split === "chars" ? "chars" : "words");
      const step = units.length > 1 ? p.spread / (units.length - 1) : 0;
      units.forEach((u, i) => tl.fromTo(u, { opacity: 0, y }, { opacity: 1, y: 0, duration: p.rise, ease }, p.at + i * step));
      if (p.exit === "up" || p.exit === "fade") {
        const t = p.at + p.exitAt, st = units.length > 1 ? 0.14 / (units.length - 1) : 0;
        units.forEach((u, i) => tl.to(u, Object.assign(p.exit === "up" ? { opacity: 0, y: -Math.round(0.045 * ctx.H) } : { opacity: 0 }, { duration: 0.36, ease: "power2.in" }), t + i * st));
      }
    }
  },
});
