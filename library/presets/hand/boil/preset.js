/* hand/boil: the hand-drawn "boil": a drawing that never sits perfectly still, redrawn on twos (12 times a second) with a slightly
   different offset and angle each time (plan C3, 07/10/2026; written for the kit, no outside code). Works on any element (text, a sketch, a
   sticker). The jitter is on an inner layer, so the element's own entrances and exits keep working. Written as plain sets: in After Effects
   they are hold keyframes on a live layer.
   params: duration (s), fps (10 = claude-animation's brush-watercolour boil, 12 = on twos, 8 = on threes), amp (px), rot (degrees), seed (another pattern for the same element) */
AIMK.preset("hand/boil", { params: { duration: 3, fps: 10, amp: 2, rot: 0.8, seed: 0 },
  build(tl, els, p, ctx) { for (const el of els) {
    const L = ctx.layer(el, "boil"), n = Math.max(1, Math.round(p.duration * p.fps));
    const r = k => ctx.hash(el.id + ":boil:" + p.seed + ":" + k) * 2 - 1;
    for (let i = 0; i < n; i++)
      tl.set(L, { x: +(r(3 * i) * p.amp).toFixed(2), y: +(r(3 * i + 1) * p.amp).toFixed(2), rotation: +(r(3 * i + 2) * p.rot).toFixed(3) }, +(p.at + i / p.fps).toFixed(4));
    tl.set(L, { x: 0, y: 0, rotation: 0 }, +(p.at + n / p.fps).toFixed(4));
  } } });
