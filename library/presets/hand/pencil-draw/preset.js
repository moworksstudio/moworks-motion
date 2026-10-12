/* hand/pencil-draw: a line drawn on by hand around, under, through or along an element, with the claude-animation pen (Hanif, MIT;
   engine/vendor/libs/hand/handkit.js): tool "brush" = their tapered, pressure-wobbled brush ink drawn on by a round nib; tool "pencil" =
   their graphite (three thin broken passes, gaps where the pressure drops). Boxes are drawn edge by edge with overshooting corners, circles
   start at a random angle and overshoot their start, marks are seeded from a name (a held drawing keeps its marks).
   Target: any element; the drawing goes on a canvas over it (pad around). params:
     tool "brush" | "pencil", mode "box" | "circle" | "underline" | "strike" | "path", points [[x, y], ...] (mode "path", px from the element's
     top-left), color, w (line width), pad (px around), duration (s to draw it on), ease, boil (redraws a second while it holds: 0 = still,
     10 = the brush-watercolour look), hold (s the boil keeps running after it is drawn), seed (another hand for the same element) */
AIMK.preset("hand/pencil-draw", { params: { tool: "brush", mode: "box", points: null, color: "#1E1612", w: 5, pad: 22, duration: 0.9, ease: "power1.inOut",
                                            boil: 0, hold: 2, seed: "" },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el);
    const W = el.offsetWidth, H = el.offsetHeight, P = p.pad, CW = W + 2 * P, CH = H + 2 * P;
    const cv = document.createElement("canvas"); cv.width = CW; cv.height = CH; cv.id = el.id + "_pen";
    Object.assign(cv.style, { position: "absolute", left: -P + "px", top: -P + "px", width: CW + "px", height: CH + "px", pointerEvents: "none", overflow: "visible" });
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(cv);
    const v = "pd_" + el.id.replace(/\W/g, "_"), name = el.id + ":" + p.mode + ":" + p.seed, D = p.duration + (p.boil ? p.hold : 0);
    const shape = {                                           // the marks, in canvas px (the element sits at P, P)
      box: `pen.${p.tool === "pencil" ? "pencil" : "stroke"}([[${P}, ${P}], [${P + W}, ${P}], [${P + W}, ${P + H}], [${P}, ${P + H}], [${P + 4}, ${P - 2}]], o)`,
      circle: p.tool === "pencil" ? `pen.pencil(HANDKIT.ellPts(${CW / 2}, ${CH / 2}, ${W / 2 + P * 0.7}, ${H / 2 + P * 0.7}, 40, -2.2).concat([HANDKIT.ellPts(${CW / 2}, ${CH / 2}, ${W / 2 + P * 0.7}, ${H / 2 + P * 0.7}, 40, -2.2)[3]]), o)`
                                    : `pen.ring(${CW / 2}, ${CH / 2}, ${W / 2 + P * 0.7}, ${H / 2 + P * 0.7}, o)`,
      underline: `pen.${p.tool === "pencil" ? "pencil" : "stroke"}([[${P - 6}, ${P + H + 6}], [${P + W * 0.5}, ${P + H + 2}], [${P + W + 8}, ${P + H + 8}]], o)`,
      strike: `pen.${p.tool === "pencil" ? "pencil" : "stroke"}([[${P - 8}, ${P + H * 0.58}], [${P + W * 0.5}, ${P + H * 0.5}], [${P + W + 8}, ${P + H * 0.46}]], o)`,
      path: `pen.${p.tool === "pencil" ? "pencil" : "stroke"}(${JSON.stringify((p.points || [[0, 0], [W, H]]).map(q => [q[0] + P, q[1] + P]))}, o)`,
    }[p.mode];
    const boxBrush = p.mode === "box" && p.tool !== "pencil";
    ctx.code(`  // hand/pencil-draw #${el.id}: claude-animation's Pen.${p.tool === "pencil" ? "pencil" : boxBrush ? "box" : p.mode === "circle" ? "ring" : "stroke"} (MIT, assets/vendor/libs/hand/handkit.js)
  const ${v} = { t: 0, cv: document.getElementById(${JSON.stringify(cv.id)}) };
  ${v}.g = ${v}.cv.getContext("2d"); ${v}.pen = new HANDKIT.Pen(${v}.g);
  ${v}.ease = gsap.parseEase(${JSON.stringify(p.ease)});
  ${v}.marks = (r, t) => { const pen = ${v}.pen, o = { w: ${p.w}, color: ${JSON.stringify(p.color)} };
    pen.begin(${JSON.stringify(name)}, r, ${p.boil ? `{ boil: ${p.boil}, t }` : "{}"}); ${boxBrush ? `pen.box(${P}, ${P}, ${W}, ${H}, o)` : shape}; pen.end(); };
  ${v}.marks(1, 0); ${v}.g.clearRect(0, 0, ${CW}, ${CH});      // once in full: the pen learns how many marks the drawing has (reveal order)
  ${v}.draw = (t) => { const r = ${v}.ease(Math.min(1, Math.max(0, t / ${p.duration}))); ${v}.g.clearRect(0, 0, ${CW}, ${CH}); if (r > 0) ${v}.marks(r, t); };
  tl.fromTo(${v}, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => ${v}.draw(${v}.t) }, ${p.at});`);
  } } });
