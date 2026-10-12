/* hand/watercolor: a watercolour wash that blooms into a box, with the claude-animation pen (Hanif, MIT; engine/vendor/libs/hand/handkit.js):
   three offset translucent passes multiplied, a pooled edge, paper granulation, revealed by a noisy front growing from a point.
   Target: a box (the wash fills it; put it behind a word or a picture). params:
     color, alpha (0-1), shape "round" (a soft rounded box) | "ellipse" | "points" (points [[x, y], ...] in px from the box's top-left),
     from "center" | "left" | "right" | "top" | "bottom" | "bottom-left" | "top-left" (where it blooms from), duration, ease, pad, seed */
AIMK.preset("hand/watercolor", { params: { color: "#4F8FD6", alpha: 0.8, shape: "round", points: null, from: "center", duration: 1.2, ease: "none", pad: 30, seed: "",
                                           wobble: 0.035 },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el);
    const W = el.offsetWidth, H = el.offsetHeight, P = p.pad, CW = W + 2 * P, CH = H + 2 * P;
    const cv = document.createElement("canvas"); cv.width = CW; cv.height = CH; cv.id = el.id + "_wash";
    Object.assign(cv.style, { position: "absolute", left: -P + "px", top: -P + "px", width: CW + "px", height: CH + "px", pointerEvents: "none" });
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.insertBefore(cv, el.firstChild);
    const pts = p.shape === "points" && p.points ? p.points.map(q => [q[0] + P, q[1] + P])
      : p.shape === "ellipse" ? null : null;
    const shapeJs = pts ? JSON.stringify(pts)
      : p.shape === "ellipse" ? `HANDKIT.ellPts(${CW / 2}, ${CH / 2}, ${W / 2}, ${H / 2}, 22)`
      : `HANDKIT.rrect(${P}, ${P}, ${W}, ${H}, ${Math.round(Math.min(W, H) * 0.22)})`;
    const o = { center: [0.5, 0.5], left: [0, 0.5], right: [1, 0.5], top: [0.5, 0], bottom: [0.5, 1], "bottom-left": [0, 1], "top-left": [0, 0] }[p.from] || [0.5, 0.5];
    const v = "wc_" + el.id.replace(/\W/g, "_"), name = el.id + ":wash:" + p.seed;
    ctx.code(`  // hand/watercolor #${el.id}: claude-animation's Pen.wash (MIT, assets/vendor/libs/hand/handkit.js)
  const ${v} = { t: 0, cv: document.getElementById(${JSON.stringify(cv.id)}) };
  ${v}.g = ${v}.cv.getContext("2d"); ${v}.pen = new HANDKIT.Pen(${v}.g); ${v}.pts = ${shapeJs};
  { const A = ${(p.wobble * Math.min(W, H)).toFixed(1)}, s = ${(ctx.hash(name) * 100).toFixed(2)}, D = HANDKIT.densify(${v}.pts.concat([${v}.pts[0]]), ${Math.max(24, Math.round(Math.min(W, H) / 6))});   // a hand-painted outline, not a perfect shape
    ${v}.pts = D.slice(0, -1).map((q, i) => [q[0] + HANDKIT.noise1(i * 0.55 + s) * A, q[1] + HANDKIT.noise1(i * 0.55 + s + 50) * A]); }
  ${v}.ease = gsap.parseEase(${JSON.stringify(p.ease)});
  ${v}.marks = (r) => { const pen = ${v}.pen; pen.begin(${JSON.stringify(name)}, r); pen.wash(${v}.pts, ${JSON.stringify(p.color)}, { alpha: ${p.alpha}, ox: ${(P + W * o[0]).toFixed(1)}, oy: ${(P + H * o[1]).toFixed(1)}, round: true }); pen.end(); };
  ${v}.marks(1); ${v}.g.clearRect(0, 0, ${CW}, ${CH});
  ${v}.draw = (t) => { const r = ${v}.ease(Math.min(1, Math.max(0, t / ${p.duration}))); ${v}.g.clearRect(0, 0, ${CW}, ${CH}); if (r > 0) ${v}.marks(r); };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.duration}, duration: ${p.duration}, ease: "none", onUpdate: () => ${v}.draw(${v}.t) }, ${p.at});`);
  } } });
