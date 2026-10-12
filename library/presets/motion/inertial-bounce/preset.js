/* motion/inertial-bounce: the After Effects "inertial bounce" expression as keyframes: the element arrives with speed, overshoots and settles in a
   damped wobble (value + v x amp x sin(2 pi freq t) / e^(decay t), t = time since landing, v = arrival speed). After iart-ai
   motion-design-skills, after-effects / expression-library (MIT): amp 0.10 (0.05 subtle, 0.2 bouncy), freq 3 /s, decay 5. The arrival is a tween
   from `from` to the element's place (linear by default, so it lands with speed; power1.in / power2.in land faster); the wobble is written as
   tweens between its peaks (sine.inOut), until it is under 0.5 (px, degrees or 0.005 of scale): real keyframes, so it ports to AE as keyframes.
   EFFECT on any element. prop: x | y | scale | rotation. */
AIMK.preset("motion/inertial-bounce", {
  params: { prop: "y", from: -420, duration: 0.45, ease: "none", amp: 0.10, freq: 3, decay: 5, fade: true },
  build(tl, els, p, ctx) {
    const rest = p.prop === "scale" ? 1 : 0, d = rest - (+p.from), k = { none: 1, "power1.in": 2, "power2.in": 3, "power3.in": 4 }[p.ease] || 1;
    const v = k * d / p.duration, stop = p.prop === "scale" ? 0.005 : 0.5, f = v2 => +v2.toFixed(4);
    for (const el of els) {
      const a = {}, b = {}; a[p.prop] = +p.from; b[p.prop] = rest;
      tl.fromTo(el, a, Object.assign({ duration: p.duration, ease: p.ease }, b), p.at);
      if (p.fade) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: Math.min(0.2, p.duration), ease: "none" }, p.at);
      let t = 0, prev = rest, at = p.at + p.duration;
      for (let n = 0; n < 40; n++) {
        const tk = (2 * n + 1) / (4 * p.freq), val = rest + v * p.amp * Math.sin(2 * Math.PI * p.freq * tk) / Math.exp(p.decay * tk);
        const last = Math.abs(val - rest) < stop, to = {}, fr = {}; fr[p.prop] = f(prev); to[p.prop] = last ? rest : f(val);
        tl.fromTo(el, fr, Object.assign({ duration: f(tk - t), ease: n === 0 ? "sine.out" : "sine.inOut" }, to), f(at + t));
        if (last) break;
        prev = val; t = tk;
      }
    }
  },
});
