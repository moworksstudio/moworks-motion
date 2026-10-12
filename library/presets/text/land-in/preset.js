/* text/land-in: 20 entrances whose impact LANDS on the motion's time: "at" is the beat / the sung word, and each style starts a few
   hundredths before it (its own lead), so the hit is heard and seen together (lyric films: "đập ĐÚNG chữ"). One style per call; several
   targets can follow `stagger` apart. Written for a studio lyric film (08/10/2026), where every word of a montage had its own entrance.
   Styles: stomp, stomp2, stompS, flip, spin, drop, rise_big, rise, zoom, slideL, slideR, inL, inR, squash, track, pageL, pageR, pop, steps,
   stepsup, fade. params: style, dur (override), origin (transform-origin), stagger (s) */
AIMK.preset("text/land-in", { params: { style: "stomp", dur: null, origin: null, stagger: 0 },
  build(tl, els, p, ctx) {
    const S = {                                         // [lead (s, negative: starts before "at"), from, to, duration, ease]
      stomp: [-0.06, { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1 }, 0.22, "expo.out"],
      stomp2: [-0.07, { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1 }, 0.26, "expo.out"],
      stompS: [-0.05, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1 }, 0.18, "expo.out"],
      flip: [-0.08, { rotationX: -95, opacity: 0, transformPerspective: 900, transformOrigin: "50% 100%" }, { rotationX: 0, opacity: 1 }, 0.26, "back.out(1.5)"],
      spin: [-0.08, { rotation: -38, scale: 0.3, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1 }, 0.28, "back.out(2)"],
      drop: [-0.10, { y: -360, opacity: 0 }, { y: 0, opacity: 1 }, 0.34, "bounce.out"],
      rise_big: [-0.08, { y: 340, opacity: 0 }, { y: 0, opacity: 1 }, 0.28, "back.out(1.4)"],
      rise: [-0.04, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0.2, "expo.out"],
      zoom: [-0.05, { scale: 0.12, opacity: 0 }, { scale: 1, opacity: 1 }, 0.24, "expo.out"],
      slideL: [-0.05, { x: -560, opacity: 0 }, { x: 0, opacity: 1 }, 0.24, "expo.out"],
      slideR: [-0.05, { x: 560, opacity: 0 }, { x: 0, opacity: 1 }, 0.24, "expo.out"],
      inL: [-0.04, { x: 160, opacity: 0 }, { x: 0, opacity: 1 }, 0.2, "expo.out"],
      inR: [-0.04, { x: -160, opacity: 0 }, { x: 0, opacity: 1 }, 0.2, "expo.out"],
      squash: [-0.06, { scaleX: 1.7, scaleY: 0.35, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: 1 }, 0.34, "elastic.out(1, 0.45)"],
      track: [-0.05, { letterSpacing: "0.45em", opacity: 0 }, { letterSpacing: "0em", opacity: 1 }, 0.3, "expo.out"],
      pageL: [-0.05, { rotationY: 100, opacity: 0, transformPerspective: 1400, transformOrigin: "100% 50%" }, { rotationY: 0, opacity: 1 }, 0.26, "expo.out"],
      pageR: [-0.05, { rotationY: -100, opacity: 0, transformPerspective: 1400, transformOrigin: "0% 50%" }, { rotationY: 0, opacity: 1 }, 0.26, "expo.out"],
      pop: [-0.06, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, 0.36, "back.out(2.2)"],
      steps: [-0.03, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, 0.2, "steps(4)"],
      stepsup: [-0.03, { y: 90, opacity: 0 }, { y: 0, opacity: 1 }, 0.2, "steps(4)"],
      fade: [-0.02, { opacity: 0 }, { opacity: 1 }, 0.12, "power1.out"] };
    const s = S[p.style];
    if (!s) throw new Error(`text/land-in: style "${p.style}"? one of ${Object.keys(S).join(", ")}`);
    const [lead, frm, to, d0, ease] = s;
    els.forEach((el, i) => tl.fromTo(el, Object.assign({}, frm, p.origin ? { transformOrigin: p.origin } : {}),
      Object.assign({}, to, { duration: p.dur || d0, ease }), Math.max(0, +(p.at + lead + i * p.stagger).toFixed(4))));
  } });
