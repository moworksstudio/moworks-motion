/* hand/shake: a screen shake that dies away, claude-animation's formula (Hanif, MIT, lib/fx.mjs shake(): amplitude * exp(-9 d), x on
   sin(97 d + t0), y on cos(83 d + 3 t0) * 0.8), written as one set per 60 fps frame (hold keys in AE: a live layer). A hit, a stomp, a
   slammed word. Put it on the scene's inner box (<scene id> + "in") or on a group; it moves an inner layer, so other motion keeps working.
   params: duration (s, 0.45 in the original), amp (px at the start), rot (degrees at the start, same decay), fps (60) */
AIMK.preset("hand/shake", { params: { duration: 0.45, amp: 18, rot: 1.2, fps: 60 },
  build(tl, els, p, ctx) { for (const el of els) {
    const L = ctx.layer(el, "shake"), n = Math.max(2, Math.round(p.duration * p.fps)), t0 = +p.at;
    for (let i = 0; i < n; i++) {
      const d = i / p.fps, k = Math.exp(-d * 9);
      tl.set(L, { x: +(Math.sin(d * 97 + t0) * k * p.amp).toFixed(2), y: +(Math.cos(d * 83 + t0 * 3) * k * p.amp * 0.8).toFixed(2),
                  rotation: +(Math.sin(d * 71 + t0 * 2) * k * p.rot).toFixed(3) }, +(p.at + d).toFixed(4));
    }
    tl.set(L, { x: 0, y: 0, rotation: 0 }, +(p.at + n / p.fps).toFixed(4));
  } } });
