/* house/glow-card: a warm three-layer halo (tight core, mid, wide bloom) as one CSS filter string of three drop-shadows; strength 0..1 (a gallery card near the centre gets more).
   Port of Moworks v1 house style P.glowCard / P.glowCss (house.js). EFFECT, static: it only sets el.style.filter (written into the element's style, no tween).
   v2 addition: `fade` > 0 (seconds, default 0 = static) fades the halo in from nothing at `at` as one filter tween, same three layers, alpha 0 -> strength, power1.out.
   Params: size (54: the widest layer is 0.7 * size px), strength (1), color ("255,224,102" core and mid rgb), bloom ("255,180,0" wide layer rgb), fade (0). */
AIMK.preset("house/glow-card", { params: { size: 54, strength: 1, color: "255,224,102", bloom: "255,180,0", fade: 0 },
  build(tl, els, p, ctx) {
    const glow = a => { a = Math.min(1, Math.max(0, a)); return `drop-shadow(0 0 ${(p.size * 0.12).toFixed(1)}px rgba(${p.color},${a.toFixed(3)})) drop-shadow(0 0 ${(p.size * 0.32).toFixed(1)}px rgba(${p.color},${(0.9 * a).toFixed(3)})) drop-shadow(0 0 ${(p.size * 0.7).toFixed(1)}px rgba(${p.bloom},${(0.6 * a).toFixed(3)}))`; };
    for (const el of els) {
      if (p.fade > 0) tl.fromTo(el, { filter: glow(0) }, { filter: glow(p.strength), duration: p.fade, ease: "power1.out" }, p.at);
      else el.style.filter = glow(p.strength);
    }
  },
});
