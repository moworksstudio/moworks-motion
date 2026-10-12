/* text/text-shimmer: the headline stays fixed while one narrow specular band crosses its glyphs once; clean text before and after.
   Port of HyperFrames registry component text-shimmer. Source recipe: the text is painted by a 300 %-wide gradient clipped to the glyphs
   (110deg: base 0-40 %, accent 58 % mixed with the highlight at 47 %, the highlight at 50 %, accent 72 % mixed at 53 %, base 60-100 %);
   background-position 100% 50% -> 0% 50% over 0.9 s (sine.inOut) starting at sweep_at (1.2 s, source range 0.2-2), then a slow drift
   to 4% 50% (sine.inOut) across the rest of the clip. The band colours are computed here (no color-mix in the film). base "auto" = the
   target's own text colour, so the text is exactly its normal colour outside the band. */
AIMK.preset("text/text-shimmer", {
  params: { accent: "#22c55e", highlight: "#ffffff", base: "auto", sweepAt: 1.2, sweep: 0.9, hold: 0.9, ease: "sine.inOut" },
  build(tl, els, p, ctx) {
    const rgb = c => { const m = String(c).match(/[\d.]+/g); if (m && /^rgb/.test(c)) return m.slice(0, 3).map(Number); const h = c.replace("#", ""); const f = h.length === 3 ? h.split("").map(x => x + x).join("") : h; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const mix = (a, b, t) => "rgb(" + a.map((v, i) => Math.round(v * t + b[i] * (1 - t))).join(",") + ")";
    const hi = rgb(p.highlight), ac = rgb(p.accent);
    for (const el of els) {
      ctx.id(el, "t");
      const baseC = p.base === "auto" ? getComputedStyle(el).color : p.base, base = "rgb(" + rgb(baseC).join(",") + ")";
      const grad = `linear-gradient(110deg, ${base} 0%, ${base} 40%, ${mix(ac, hi, 0.58)} 47%, rgb(${hi.join(",")}) 50%, ${mix(ac, hi, 0.72)} 53%, ${base} 60%, ${base} 100%)`;
      // background-clip:text paints glyphs only inside the background box, so descenders and stacked Vietnamese marks that overflow a tight
      // line box disappeared (y, g, the dot under ộ). The gradient goes on an inner inline-block padded 0.35em / 0.1em with equal negative
      // margins: the box covers the overflow, the text and the layout stay where they were (baseline-aligned, same line-box height).
      const ink = ctx.make(el, "span", "ink", { style: { display: "inline-block", padding: "0.35em 0.1em", margin: "-0.35em -0.1em" } });
      while (el.firstChild !== ink) ink.appendChild(el.firstChild);
      Object.assign(ink.style, { color: "transparent", backgroundImage: grad, backgroundSize: "300% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "100% 50%", backgroundClip: "text" });
      ink.style.setProperty("-webkit-background-clip", "text"); ink.style.setProperty("-webkit-text-fill-color", "transparent");
      tl.fromTo(ink, { backgroundPosition: "100% 50%" }, { backgroundPosition: "0% 50%", duration: p.sweep, ease: p.ease }, p.at + p.sweepAt);
      if (p.hold > 0) tl.to(ink, { backgroundPosition: "4% 50%", duration: p.hold, ease: p.ease }, p.at + p.sweepAt + p.sweep);
    }
  },
});
