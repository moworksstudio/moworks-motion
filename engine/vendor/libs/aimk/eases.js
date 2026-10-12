/* AI Motion Kit: spring eases (plan B2, 07/10/2026; closed-form damped spring, mass 1, from the @0xMovez course's spring notes).
   A GSAP tween with ease "spring.snappy" follows the step response of a spring with stiffness k and damping d, time-scaled so the spring
   settles (within 0.1 %) exactly at the tween's end: the duration still sets the timing, the spring sets the feel.
     spring.snappy  k 320 d 30  (about 1 % overshoot: UI, buttons)       spring.default k 170 d 26 (no visible overshoot)
     spring.heavy   k 140 d 22  (slow settle, weight)                     spring.playful k 220 d 14 (clear overshoot: stickers, pops)
     springk(k, d)  any stiffness / damping
   Rule: UI may overshoot slightly; text does not (use spring.default or heavy on text).
   AIMK_SPRING.step(k, d) is the physical step response x(t) (t in seconds), used by ctx.track (sum of springs). Copied into a film as
   assets/vendor/libs/aimk/eases.js by kit.py build when the film uses a spring or the nudge; the film page, the draft, the player, the
   renderer and HyperFrames Studio all load it right after GSAP.
   nudge: a slow-fast-slow group slide in ONE ease (HyperFrames skills/hyperframes-animation/rules/nudge-curve.md, commit 0ca69472, Apache-2.0:
   there three chained tweens, here their table as one curve, 11/10/2026): power3.in ramp over 20 % of the time to 10 % of the distance,
   a linear burst over 18 % to 75 %, a power4.out tail over the last 62 %. For repositioning a composed group (rows, a card stack, a list)
   to make room or reveal content; new content appears during the burst. Not a seam between scenes. */
(function () {
  function step(k, d) {
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return t => t <= 0 ? 0 : 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
    if (z === 1) return t => t <= 0 ? 0 : 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const s = Math.sqrt(z * z - 1), r1 = -w0 * (z - s), r2 = -w0 * (z + s);
    return t => t <= 0 ? 0 : 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  }
  function settle(f) { let T = 0.05; for (let t = 0; t < 12; t += 1 / 480) if (Math.abs(1 - f(t)) > 0.001) T = t + 1 / 480; return T; }
  function ease(k, d) { const f = step(k, d), T = settle(f), e = p => p <= 0 ? 0 : p >= 1 ? 1 : f(p * T); e.settle = T; return e; }
  const P = { snappy: [320, 30], default: [170, 26], heavy: [140, 22], playful: [220, 14] };
  const T1 = 0.2, T2 = 0.38, D1 = 0.1, D2 = 0.75;      // nudge-curve.md's table: ramp 20 % / 10 %, burst 18 % / 65 %, tail 62 % / 25 %
  const nudge = p => p <= 0 ? 0 : p >= 1 ? 1 : p < T1 ? D1 * Math.pow(p / T1, 4)                            // GSAP power3.in = u^4
    : p < T2 ? D1 + (D2 - D1) * (p - T1) / (T2 - T1) : D2 + (1 - D2) * (1 - Math.pow(1 - (p - T2) / (1 - T2), 5));   // power4.out = 1 - (1-u)^5
  window.AIMK_SPRING = { step, settle, ease, P, nudge };
  const g = window.gsap;
  if (g && g.registerEase) {
    for (const n in P) g.registerEase("spring." + n, ease(P[n][0], P[n][1]));
    const f = p => p; f.config = (k, d) => ease(+k || 170, +d || 26); g.registerEase("springk", f);
    g.registerEase("nudge", nudge);
  }
})();
