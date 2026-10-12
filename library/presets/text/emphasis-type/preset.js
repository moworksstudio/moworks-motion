/* text/emphasis-type: an oversized, low-contrast background word fades in (1 s, power2.out) and drifts slowly sideways behind the subject for the
   whole hold (sine.inOut); optionally it fades out (0.5 s, power2.in). Port of HyperFrames registry component mk-emphasis-type (minimal kit "EMPHASIS"
   texture type; helpers mkEmphasisIn / mkEmphasisOut: start x +40 px, drift -100 px over `hold` 5 s). EFFECT on a text element styled as the
   background word (huge, upper-case, ~7 % ink, behind the content); `out` = seconds after `at` for the fade-out (0 = none). */
AIMK.preset("text/emphasis-type", {
  params: { drift: -100, hold: 5, out: 0 },
  build(tl, els, p, ctx) {
    for (const el of els) {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "power2.out" }, p.at);
      tl.fromTo(el, { x: 40 }, { x: 40 + p.drift, duration: p.hold, ease: "sine.inOut" }, p.at);
      if (p.out > 0) tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "power2.in" }, +(p.at + p.out).toFixed(4));
    }
  },
});
