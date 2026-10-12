/* house/gallery-strip: a row of cards moving continuously like the iPhone / iTunes gallery. Every card has the side size (w x h); the card passing the centre grows to
   `scale` (cosine bump over half a pitch) and pushes its neighbours out by exactly that growth, so EVERY GAP STAYS `gap`. The strip is rebuilt each frame from the card
   nearest the centre outwards; cards wrap round off screen.
   Port of Moworks v1 house style P.galleryStrip (house.js). EFFECT, ambient: the TARGET = the cards (give each card its own box and put the content inside it at 100 %
   size: an image, a gradient, text). The cards are laid out in the row's own parent (or params.host = an element id); extra copies of the cards are cloned to fill the
   frame (ids get a "_g<n>" suffix, also on their children) and baked into the film. The per-frame layout is a ctx.code block (a proxy tween t: 0 -> dur, ease "none"),
   a pure function of time that writes left / top / width / height / z-index (and the optional glow filter) of every card.
   Params (v1 option names): w, h (side size, default the first card's size), gap (40), scale (1.18), speed (pitches per second, 0.35), cx (centre x, default the frame
   centre), cy (centre y, default the frame centre), glow (0 = none, else the halo size; the centre card gets the strongest halo), dur (30 s after `at`; v1 ran 600 s). */
AIMK.preset("house/gallery-strip", { params: { w: null, h: null, gap: 40, scale: 1.18, speed: 0.35, cx: null, cy: null, glow: 0, host: null, dur: 30 },
  build(tl, els, p, ctx) {
    const C = els, host = p.host ? document.getElementById(p.host) : C[0].parentElement, W = ctx.W, H = ctx.H;
    const w0 = p.w ?? C[0].offsetWidth, h0 = p.h ?? C[0].offsetHeight, G = p.gap, k = p.scale;
    const pitch = w0 + G, n = Math.max(C.length, Math.ceil(2 * (W / 2 + w0 * k + G) / pitch) + 1), A = n * pitch / 2, off = Math.floor(n / 2), v = p.speed;
    const cxs = p.cx ?? W / 2, cy = p.cy ?? H / 2;
    const items = [];
    for (let j = 0; j < n; j++) {
      const src = C[j % C.length]; let el = src;
      if (j >= C.length) { el = src.cloneNode(true); el.id = src.id + "_g" + j; el.querySelectorAll("[id]").forEach(c => { c.id = c.id + "_g" + j; }); host.appendChild(el); }
      Object.assign(el.style, { position: "absolute", transformOrigin: "50% 50%" });
      items.push({ id: el.id, j });
    }
    ctx.code(String.raw`  // gallery-strip
  const gs = { t: 0 }, items = ${JSON.stringify(items)}, nodes = items.map(it => document.getElementById(it.id));
  const w0 = ${w0}, h0 = ${h0}, G = ${G}, k = ${k}, pitch = ${pitch}, A = ${A}, off = ${off}, v = ${v}, cxs = ${cxs}, cy = ${cy}, glow = ${p.glow};
  const glowCss = (size, a) => { a = Math.min(1, Math.max(0, a)); return "drop-shadow(0 0 " + (size * 0.12).toFixed(1) + "px rgba(255,224,102," + a.toFixed(3) + ")) drop-shadow(0 0 " + (size * 0.32).toFixed(1) + "px rgba(255,224,102," + (0.9 * a).toFixed(3) + ")) drop-shadow(0 0 " + (size * 0.7).toFixed(1) + "px rgba(255,180,0," + (0.6 * a).toFixed(3) + "))"; };
  const bump = d => (d < 0.5 ? 0.5 + 0.5 * Math.cos(2 * Math.PI * d) : 0);
  tl.fromTo(gs, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => { const lt = gs.t;
    const q = items.map((it, i) => { const x = ((((it.j - off) * pitch + v * pitch * lt + A) % (2 * A)) + 2 * A) % (2 * A) - A, g = bump(Math.abs(x) / pitch);
      return { el: nodes[i], xn: cxs + x, g, w: w0 * (1 + (k - 1) * g), h: h0 * (1 + (k - 1) * g) }; }).sort((a, b) => a.xn - b.xn);
    const m = q.reduce((b, c, i) => (Math.abs(c.xn - cxs) < Math.abs(q[b].xn - cxs) ? i : b), 0); q[m].cx = q[m].xn;
    for (let i = m + 1; i < q.length; i++) q[i].cx = q[i - 1].cx + q[i - 1].w / 2 + G + q[i].w / 2;
    for (let i = m - 1; i >= 0; i--) q[i].cx = q[i + 1].cx - q[i + 1].w / 2 - G - q[i].w / 2;
    q.forEach(c => { const st = c.el.style; st.left = (c.cx - c.w / 2).toFixed(2) + "px"; st.top = (cy - c.h / 2).toFixed(2) + "px"; st.width = c.w.toFixed(2) + "px"; st.height = c.h.toFixed(2) + "px";
      st.zIndex = Math.round(100 + 100 * c.g); if (glow) st.filter = glowCss(glow, 0.3 + 0.7 * c.g); }); } }, ${p.at});`);
  },
});
