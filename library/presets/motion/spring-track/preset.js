/* motion/spring-track: properties that move to new values over time as a sum of springs (ctx.track; plan B2 07/10/2026, from the
   @0xMovez course): a retarget keeps its momentum instead of restarting an ease.
   params:
     tracks { prop: [[t, value, spring?], ...] }   e.g. { "x": [[0, 0], [0.8, 420], [1.6, 160, "playful"]] } (t from the motion's "at"; the
                                                   first key should be where the element already is)
     spring "snappy" | "default" | "heavy" | "playful" | [k, d]
     indicator [[t, left, right], ...]             a tab / progress indicator: its left edge (x) and width follow two springs, the edge in front
                                                   on "lead", the edge behind on "trail", so it stretches while it travels, then settles
     lead "snappy", trail "heavy"
   Rule: UI may overshoot a little; text should not (default / heavy on text). */
AIMK.preset("motion/spring-track", { params: { tracks: {}, spring: "snappy", indicator: null, lead: "snappy", trail: "heavy" },
  build(tl, els, p, ctx) { for (const el of els) {
    for (const prop in p.tracks || {}) ctx.track(el, prop, p.tracks[prop], p.spring, p.at);
    const I = p.indicator;
    if (I && I.length > 1) {                       // left and right edges, each key on the leading or trailing spring by the move's direction
      const L = [[I[0][0], I[0][1]]], R = [[I[0][0], I[0][2]]];
      for (let i = 1; i < I.length; i++) {
        const right = (I[i][1] + I[i][2]) > (I[i - 1][1] + I[i - 1][2]);
        L.push([I[i][0], I[i][1], right ? p.trail : p.lead]); R.push([I[i][0], I[i][2], right ? p.lead : p.trail]);
      }
      // both edges as their own sums of springs in one code block: x = left, width = right - left (the stretch comes from the two springs)
      const SP = window.AIMK_SPRING, kd = s => Array.isArray(s) ? s : SP.P[s] || SP.P.default;
      const Lk = L.map(k => [k[0], k[1], kd(k[2] || p.lead)]), Rk = R.map(k => [k[0], k[1], kd(k[2] || p.lead)]);
      let tail = 0; for (const k of Lk.concat(Rk)) tail = Math.max(tail, SP.settle(SP.step(k[2][0], k[2][1])));
      const D = +(I[I.length - 1][0] + tail).toFixed(4), v = "ind_" + ctx.id(el).replace(/\W/g, "_");
      ctx.code(`  // spring indicator #${el.id}: left edge and right edge on two springs (lead / trail), x = left, width = right - left
  const ${v} = { t: 0, L: ${JSON.stringify(Lk)}, R: ${JSON.stringify(Rk)} };
  const ${v}f = K => { const S = K.map(k => AIMK_SPRING.step(k[2][0], k[2][1])); return t => { let x = K[0][1]; for (let i = 1; i < K.length; i++) x += (K[i][1] - K[i - 1][1]) * S[i](t - K[i][0]); return x; }; };
  const ${v}l = ${v}f(${v}.L), ${v}r = ${v}f(${v}.R);
  tl.fromTo(${v}, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => { const a = ${v}l(${v}.t), b = ${v}r(${v}.t);
    gsap.set(${JSON.stringify("#" + el.id)}, { x: a, width: Math.max(0, b - a) }); } }, ${p.at});`);
    }
  } } });
