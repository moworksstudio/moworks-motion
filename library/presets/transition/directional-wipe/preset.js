/* transition/directional-wipe: the incoming scene is revealed by a left-to-right clip wipe while it slides in from the right and settles from 1.04x,
   the outgoing scene drifts left, shrinks to 0.96x and blurs; a white light band sweeps across and a red/cyan strobe flickers four times.
   Port of HyperFrames registry component directional-wipe (targets: [out inner, in inner]).
   Source values (a 760 px card): incoming x 60 px, scale 1.04 -> 1; outgoing x -70 px, scale 0.96, blur 5 px; wipe 0.9 s power3.inOut;
   light band -110% -> 110% over 0.58 s at +0.18 s; strobe 4 x 0.07 s at +0.32 s (steps(1)), x -16 -> 16 px.
   The source distances belong to a 760 px wide card, so here they are multiplied by k = frame width / 760 (param k).
   fill (kit, 08/10/2026, test 4: "không lấp full màn hình"): true (default) keeps the outgoing scene covering the frame (it drifts and
   pushes in just enough instead of shrinking to 0.96x, which showed the background on full-frame films); false = the source's card move. */
AIMK.preset("transition/directional-wipe", { params: { duration: 0.9, ease: "power3.inOut", k: null, ring: true, accent: "rgba(255,255,255,0.28)", fill: true },
  build(tl, els, p, ctx) {
    const [a, b] = els, sc = b.parentElement, W = ctx.W;
    const k = p.k == null ? W / 760 : p.k, s = p.duration / 0.9, t = p.at;
    ctx.css("transition/directional-wipe", `
.dwp-fx { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent); mix-blend-mode: screen; }
.dwp-rgb { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: linear-gradient(90deg, rgba(239,68,68,0.35), transparent, rgba(34,211,238,0.35)); }
.dwp-ring { position: absolute; inset: 0; pointer-events: none; }`);
    const fx = ctx.make(sc, "div", "dwpfx", { cls: "dwp-fx", style: { transform: `translateX(${-1.1 * W}px)` } });
    const rgb = ctx.make(sc, "div", "dwprgb", { cls: "dwp-rgb" });
    const ring = p.ring ? ctx.make(b, "div", "dwpring", { cls: "dwp-ring", style: { boxShadow: `inset 0 0 0 ${+(2 * k).toFixed(2)}px ${p.accent}` } }) : null;
    tl.fromTo(b, { clipPath: "inset(0% 100% 0% 0%)", x: +(60 * k).toFixed(1), scale: 1.04 }, { clipPath: "inset(0% 0% 0% 0%)", x: 0, scale: 1, duration: p.duration, ease: p.ease }, t);
    const ox = p.fill ? -Math.round(0.03 * W) : -Math.round(70 * k), os = p.fill ? +(1 + 2 * Math.abs(ox) / W + 0.005).toFixed(4) : 0.96;
    tl.fromTo(a, { x: 0, scale: 1, filter: "blur(0px)" }, { x: ox, scale: os, filter: `blur(${+(5 * k).toFixed(1)}px)`, duration: p.duration, ease: p.ease }, t);
    tl.fromTo(fx, { x: -1.1 * W }, { x: 1.1 * W, duration: +(0.58 * s).toFixed(4), ease: "power2.inOut" }, +(t + 0.18 * s).toFixed(4));
    tl.fromTo(rgb, { opacity: 0, x: -Math.round(16 * k) }, { opacity: 1, x: Math.round(16 * k), repeat: 3, yoyo: true, duration: +(0.07 * s).toFixed(4), ease: "steps(1)" }, +(t + 0.32 * s).toFixed(4));
    if (ring) tl.fromTo(ring, { opacity: 1 }, { opacity: 0, duration: +(0.35 * s).toFixed(4), ease: "power1.in" }, +(t + 0.55 * s).toFixed(4));
  },
});
