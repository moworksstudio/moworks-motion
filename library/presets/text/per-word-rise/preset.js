/* text/per-word-rise: words (or characters) rise into place in a blur-to-sharp cascade and land with a soft settle, then hold still.
   Port of HyperFrames registry component per-word-rise (motion only: the source's colours, font and fitting belong to the film).
   Source values: rise 0.74 s per unit, landings spread over 0.62 s, from y 8 % of the frame height + blur 1.4 % of the height,
   landEase = a piecewise cubic that keeps 7 % of the travel for the last 22 % of the time (fitted here to one cubic Bezier).
   Optional exit (source variable "exit"): "fade" or "up", 0.5 s with a 0.14 s stagger, starting params.exitAt seconds after `at`. */
AIMK.preset("text/per-word-rise", {
  params: { split: "words", rise: 0.74, spread: 0.62, y: 0.08, blur: 0.014, exit: "none", exitAt: 2.6 },
  build(tl, els, p, ctx) {
    const SPLIT = 0.78, RES = 0.07, SEAM = ((1 - RES) / SPLIT) * 0.5;
    const land = q => { if (q <= 0) return 0; if (q >= 1) return 1;
      if (q < SPLIT) { const x = q / SPLIT, inv = 1 - x; return (1 - RES) * (0.5 * (1 - inv * inv * inv) + 0.5 * x); }
      const u = (q - SPLIT) / (1 - SPLIT), b = SEAM * (1 - SPLIT), c = 3 * RES - 2 * b, d = b - 2 * RES; return 1 - RES + b * u + c * u * u + d * u * u * u; };
    const ease = ctx.ease(land, "per-word-rise landEase");
    const y = Math.round(p.y * ctx.H), blur = +(p.blur * ctx.H).toFixed(1);
    for (const el of els) {
      const units = ctx.split(el, p.split === "chars" ? "chars" : "words");
      const step = units.length > 1 ? p.spread / (units.length - 1) : 0;
      units.forEach((u, i) => {
        tl.fromTo(u, { opacity: 0, y, filter: `blur(${blur}px)` }, { opacity: 1, y: 0, filter: "blur(0px)", duration: p.rise, ease }, p.at + i * step);
      });
      if (p.exit === "up" || p.exit === "fade") {
        const t = p.at + p.exitAt, st = units.length > 1 ? 0.14 / (units.length - 1) : 0;
        units.forEach((u, i) => {
          const to = p.exit === "up" ? { opacity: 0, y: -Math.round(0.045 * ctx.H), filter: `blur(${(0.007 * ctx.H).toFixed(1)}px)` } : { opacity: 0 };
          tl.to(u, Object.assign(to, { duration: 0.36, ease: "power2.in" }), t + i * st);
        });
      }
    }
  },
});
