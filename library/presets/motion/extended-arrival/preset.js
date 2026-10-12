/* motion/extended-arrival: the "never fully lands" arrival: the element covers most of its way in the first fifth of the move and creeps the rest
   (After Effects' extended last keyframe), then leaves along the vector it came on while it is still creeping. Port of HyperFrames registry
   component extended-keyframe (EK ease and attachExtendedArrival): ease profile reach 0.87 at 20 % of the time, velocity ramp 4 %, slow share 10 %,
   tau2 29 % (the source's integrated table, written as two tweens: the fast fifth and the creep, each fitted to one custom() Bezier;
   with an exit the creep stops where the exit takes over, so no tween runs under it); arrival 2.5 s from `from` to rest with a
   0.25 s linear fade-in; exit at 60 % of the arrival, 0.5 s power2.in to the mirrored state (x / y flipped, scale below 1 -> 2, above -> 0.4) with
   opacity -> 0 over 80 % of it, 20 % in, power1.in. The source's per-element shutter blur is left to the kit's render blur (kit.py frames --blur).
   EFFECT on any element. Chain arrivals so the next one starts when the exit has cleared: at + 0.6 x duration + exitDuration. */
AIMK.preset("motion/extended-arrival", {
  params: { x: -1400, y: 0, scale: 1, duration: 2.5, exit: true, exitDuration: 0.5, fadeIn: 0.25 },
  build(tl, els, p, ctx) {
    const o = { reach: 0.87, at: 0.2, ramp: 0.04, slow: 0.1, tau2: 0.29, samples: 512 };
    const table = tau => { const N = o.samples, v = new Float64Array(N + 1), pr = new Float64Array(N + 1), c = (o.slow / (1 - o.slow)) * (tau / o.tau2);
      for (let i = 0; i <= N; i++) { const t = i / N; v[i] = (1 - Math.exp(-t / o.ramp)) * (Math.exp(-t / tau) + c * Math.exp(-t / o.tau2)); }
      for (let i = 1; i <= N; i++) pr[i] = pr[i - 1] + (v[i - 1] + v[i]) / 2; const T = pr[N]; for (let i = 0; i <= N; i++) pr[i] /= T; return pr; };
    let lo = 0.005, hi = 5; const k = Math.round(o.at * o.samples);
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (table(mid)[k] > o.reach) lo = mid; else hi = mid; }
    const T = table((lo + hi) / 2), N = o.samples, fn = q => { if (q <= 0) return 0; if (q >= 1) return 1; const f = q * N, i = Math.floor(f), u = f - i; return T[i] + (T[i + 1] - T[i]) * u; };
    const from = {}; if (+p.x) from.x = +p.x; if (+p.y) from.y = +p.y; if (+p.scale !== 1) from.scale = +p.scale;
    const start = Object.assign({ x: 0, y: 0, scale: 1 }, from), mir = {};
    if ("x" in from) mir.x = -from.x; if ("y" in from) mir.y = -from.y; if ("scale" in from) mir.scale = from.scale < 1 ? 2 : 0.4;
    const ex = +(p.at + 0.6 * p.duration).toFixed(4), e6 = fn(0.6);
    for (const el of els) {
      const segs = p.exit ? [[0, 0.2], [0.2, 0.6]] : [[0, 0.2], [0.2, 1]];        // the fast phase and the creep, each fitted to its own Bezier
      const at = q => { const e = fn(q), r = {}; for (const kk in start) r[kk] = +(start[kk] + ((kk === "scale" ? 1 : 0) - start[kk]) * e).toFixed(3); return r; };
      segs.forEach(([a, b], i) => { const va = fn(a), vb = fn(b);
        tl.fromTo(el, at(a), Object.assign(at(b), { duration: +((b - a) * p.duration).toFixed(4), ease: ctx.ease(u => (fn(a + (b - a) * u) - va) / (vb - va), "EK ease " + (i ? "creep" : "fast")) }), +(p.at + a * p.duration).toFixed(4)); });
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: p.fadeIn, ease: "none" }, p.at);
      if (p.exit) {
        const now = {}; for (const kk in mir) now[kk] = +(start[kk] + ((kk === "scale" ? 1 : 0) - start[kk]) * e6).toFixed(3);
        tl.fromTo(el, now, Object.assign({ duration: p.exitDuration, ease: "power2.in" }, mir), ex);
        tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: +(p.exitDuration * 0.8).toFixed(4), ease: "power1.in" }, +(ex + p.exitDuration * 0.2).toFixed(4));
      }
    }
  },
});
