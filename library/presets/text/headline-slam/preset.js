/* text/headline-slam: the headline scales down from 1.6 to rest with expo.out weight, its landing shakes the stage for three frames,
   then a quiet drift, and (optional) a fast upward exit.
   Port of HyperFrames registry component headline-slam (motion only: the source's size fitting, weight, shadow and colours belong to the film;
   the accent word colour is kept because it is part of the look: params accentWord / accent).
   Source envelope: slam 0.58 s (scale 1.6 -> 1 + opacity 0 -> 1, expo.out), shake of 3 x 1/30 s starting at the landing
   (+0.55 % w, -0.3 % h, then -0.38 % w, +0.2 % h, then 0), drift -0.55 % of the height (sine.inOut yoyo) across the hold,
   exit y -120 % of the height over 0.46 s with power4.in. Structure: target > stage (shake) > headline (scale, opacity, drift, exit) > words,
   so no property is owned by two tweens and nothing fights a CSS centring transform on the target. */
AIMK.preset("text/headline-slam", {
  params: { landAt: 0.58, scale: 1.6, accentWord: 1, accent: "#71f5a7", hold: 2.32, drift: 0.0055, exit: "none", exitDur: 0.46, inDur: 0.72 },
  build(tl, els, p, ctx) {
    const F = +(1 / 30).toFixed(4), W = ctx.W, H = ctx.H, r2 = v => +v.toFixed(2);
    for (const el of els) {
      const text = el.textContent.trim().replace(/\s+/g, " ");
      ctx.id(el, "t"); el.textContent = "";
      const stage = ctx.make(el, "span", "stage", { style: { display: "inline-block" } });
      const head = ctx.make(stage, "span", "head", { text, style: { display: "inline-block" } });
      const words = ctx.split(head, "words");
      if (p.accentWord >= 0 && words[p.accentWord]) words[p.accentWord].style.color = p.accent;
      const t = p.at, L = p.landAt;
      tl.fromTo(head, { scale: p.scale, opacity: 0 }, { scale: 1, opacity: 1, duration: L, ease: "expo.out" }, t);
      tl.fromTo(stage, { x: 0, y: 0 }, { x: r2(0.0055 * W), y: r2(-0.003 * H), duration: F, ease: "power2.out" }, t + L);
      tl.to(stage, { x: r2(-0.0038 * W), y: r2(0.002 * H), duration: F, ease: "power2.out" }, t + L + F);
      tl.to(stage, { x: 0, y: 0, duration: F, ease: "power2.out" }, t + L + 2 * F);
      if (p.hold > 0) tl.fromTo(head, { y: 0 }, { y: -r2(p.drift * H), duration: p.hold / 2, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, t + p.inDur);
      if (p.exit === "up") tl.to(head, { y: -Math.round(1.2 * H), duration: p.exitDur, ease: "power4.in" }, t + p.inDur + p.hold);
    }
  },
});
