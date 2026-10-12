/* transition/iris-reveal: a circle opens from a chosen point and reveals the incoming scene over the outgoing one; the outgoing scene is dimmed
   and desaturated first (register "color"); a thin accent ring rides the circle edge and dissolves just before the circle clears the frame.
   Port of HyperFrames registry component iris-reveal (targets: [out inner, in inner]).
   Source values: iris_x/iris_y 50 %, open_at 0.35 s, circle 0 -> farthest corner x 1.02 + 2 px over 1.1 s power2.inOut, outgoing
   grayscale(1) brightness(0.76) (source: static, here eased in over 0.32 s), ring stroke max(2, 0.21 % of width), ring fades in 0.18 s and out 0.24 s before the end.
   params.duration is the whole overlap (open + 1.1 s = 1.45 s); other durations scale every time proportionally, as the source does. */
AIMK.preset("transition/iris-reveal", { params: { duration: 1.45, x: 50, y: 50, open: 0.35, register: "color", accent: "#22c55e", rim: true },
  build(tl, els, p, ctx) {
    const [a, b] = els, sc = b.parentElement, W = ctx.W, H = ctx.H, t = p.at;
    const s = p.duration / (p.open + 1.1), op = +(p.open * s).toFixed(4), dur = +(1.1 * s).toFixed(4);
    const cx = +(p.x / 100 * W).toFixed(1), cy = +(p.y / 100 * H).toFixed(1);
    const R = Math.round(Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.02 + 2), sw = +Math.max(2, W * 0.0021).toFixed(2);
    const seen = new Set(), ft = (el, f, to, at) => { if (seen.has(el)) to = Object.assign({ immediateRender: false }, to); seen.add(el); tl.fromTo(el, f, to, at); };
    if (p.register !== "plain") a.style.willChange = "filter";
    if (p.register !== "plain") ft(a, { filter: "grayscale(0) brightness(1)" }, { filter: "grayscale(1) brightness(0.76)", duration: +(0.32 * s).toFixed(4), ease: "power2.out" }, t);
    ft(b, { clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${R}px at ${cx}px ${cy}px)`, duration: dur, ease: "power2.inOut" }, +(t + op).toFixed(4));
    if (p.rim) {
      ctx.css("transition/iris-reveal", `.irv-rim { position: absolute; box-sizing: border-box; border-radius: 50%; pointer-events: none; opacity: 0; }`);
      const rim = ctx.make(sc, "div", "irvrim", { cls: "irv-rim", style: { border: `${sw}px solid ${p.accent}` } });
      ft(rim, { left: cx - sw, top: cy - sw, width: 2 * sw, height: 2 * sw }, { left: +(cx - R - sw / 2).toFixed(1), top: +(cy - R - sw / 2).toFixed(1), width: 2 * R + sw, height: 2 * R + sw, duration: dur, ease: "power2.inOut" }, +(t + op).toFixed(4));
      ft(rim, { opacity: 0 }, { opacity: 1, duration: +(0.18 * s).toFixed(4), ease: "power1.out" }, +(t + op).toFixed(4));
      ft(rim, { opacity: 1 }, { opacity: 0, duration: +(0.24 * s).toFixed(4), ease: "power1.in" }, +(t + op + dur - 0.24 * s).toFixed(4));
    }
  },
});
