/* motion/slot-swipe: a row of DESIGNED cards (different sizes, e.g. a big centre card and smaller side cards) swipes like the iPhone photo
   gallery: on every swipe each card moves to its neighbour's designed slot and takes that slot's size, so the card reaching the centre
   grows and pushes the others out; a card leaving one end fades out half a slot beyond it and comes back at the other end (wrap), fading
   in. Between swipes the row rests on the designed slots. A small bob keeps it alive. Pure function of film time. Unlike
   house/gallery-strip (equal cards, rebuilt boxes) it keeps the cards' own boxes: it only writes each card's transform, opacity and
   z-index (put entrances on an inner layer). Written for a studio film (08/10/2026; the film used carousel/vision-5 in the end).
   params: cards [[id, designed slot index], ...], slots [[cx, cy, w], ...] left to right (film px), swipes [[t, dur], ...] (seconds from the
   motion's at), dir -1 (to the left) | 1, bob (px), dur (s the row runs), zbase */
AIMK.preset("motion/slot-swipe", { params: { cards: [], slots: [], swipes: [], dir: -1, bob: 6, dur: 10, zbase: 2 },
  build(tl, els, p, ctx) {
    const v = "mss_" + els[0].id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // motion/slot-swipe: designed cards swipe slot to slot (pure function of film time)
  const ${v} = { t: 0, C: ${JSON.stringify(p.cards)}, S: ${JSON.stringify(p.slots)}, W: ${JSON.stringify(p.swipes)} };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const T = ${v}.t, S = ${v}.S, N = S.length, A = ${p.at} + T;
    const io = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    let sh = 0; for (const [a, d] of ${v}.W) sh += io(Math.min(1, Math.max(0, (T - a) / d)));
    const slot = q => {                                    // slot q (fractional, -1 .. N): designed slots, extrapolated one step outside
      const at = i => i < 0 ? S[0].map((v0, k) => v0 - (S[1][k] - S[0][k])) : i > N - 1 ? S[N - 1].map((v0, k) => v0 + (S[N - 1][k] - S[N - 2][k])) : S[i];
      const i0 = Math.floor(q), f = q - i0, a = at(i0), b = at(i0 + 1); return a.map((v0, k) => v0 + (b[k] - v0) * f); };
    const R = ${v}.C.map(([id, s0]) => {
      let q = ((s0 + ${p.dir} * sh) % N + N) % N;          // 0 .. N
      if (q > N - 0.5) q -= N;                               // the last half slot belongs to the far end: -0.5 .. N - 0.5
      const op = q < 0 ? 1 + 2 * q : q > N - 1 ? 1 - 2 * (q - (N - 1)) : 1;
      const [cx, cy, w] = slot(q); return { id, s0, cx, cy, w, op }; });
    const order = R.slice().sort((a, b) => a.w - b.w);       // bigger cards on top, inside the cards' own z range (texts stay above)
    R.forEach(r => { const el = document.getElementById(r.id); if (!el) return;
      const [bx, by, bw] = S[r.s0], k = r.w / bw, bob = ${p.bob} * Math.sin(2 * Math.PI * (A / 3.1 + r.s0 * 0.37));
      el.style.transform = "translate(" + (r.cx - bx).toFixed(2) + "px," + (r.cy - by + bob).toFixed(2) + "px) scale(" + k.toFixed(4) + ")";
      el.style.opacity = Math.max(0, Math.min(1, r.op)).toFixed(3);
      el.style.zIndex = String(${p.zbase} + order.indexOf(r)); });
  } }, ${p.at});`);
  } });
