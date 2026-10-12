/* data/function-plot: Manim-style graph: axes with ticks draw on, the axis labels appear, the curve of a function draws itself, then a dot rides the
   curve with a live readout of x and f(x) (and optionally its tangent line). After iart-ai manim-skills, manim / graphs-and-updaters (MIT):
   Create(axes) + Write(labels), Create(curve), a ValueTracker driving a dot and a DecimalNumber. The function is a JavaScript expression of x
   (e.g. "2 * (x - 5) ** 2", "Math.sin(x)"), sampled at build time into an SVG path; the dot and readout follow one proxy value per frame
   (ctx.code), the film's single source of truth like the ValueTracker. BLOCK: built inside the target box. */
AIMK.preset("data/function-plot", {
  params: { fn: "2 * (x - 5) ** 2", xMin: 0, xMax: 10, yMin: 0, yMax: 100, xStep: 1, yStep: 10, xLabel: "x", yLabel: "f(x)", color: "#ff6b8b", axis: "#c9d2de",
            dot: "#ffd60a", tangent: false, decimals: 1, axes: 0.8, curve: 1.6, trace: 3.0, traceFrom: 0, traceTo: 10, samples: 240 },
  build(tl, els, p, ctx) {
    const NS = "http://www.w3.org/2000/svg", f = v => +v.toFixed(2), F = new Function("x", `return (${p.fn});`);
    for (const slot of els) {
      const bw = slot.offsetWidth || 1200, bh = slot.offsetHeight || 800, id = ctx.id(slot, "b"), m = { l: 90, r: 40, t: 40, b: 70 };
      const X = x => m.l + (x - p.xMin) / (p.xMax - p.xMin) * (bw - m.l - m.r), Y = y => bh - m.b - (y - p.yMin) / (p.yMax - p.yMin) * (bh - m.t - m.b);
      const svg = document.createElementNS(NS, "svg"); svg.id = id + "_plot"; svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`); svg.setAttribute("width", bw); svg.setAttribute("height", bh);
      Object.assign(svg.style, { position: "absolute", inset: "0px", overflow: "visible", fontFamily: '"RFlex", sans-serif' }); slot.appendChild(svg);
      let ne = 0; const mk = (tag, at, idn, txt) => { const e = document.createElementNS(NS, tag); e.id = idn || `${svg.id}_e${ne++}`; for (const k in at) e.setAttribute(k, String(at[k])); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
      const axX = mk("path", { d: `M${m.l},${f(Y(Math.max(p.yMin, 0)))} H${bw - m.r}`, stroke: p.axis, "stroke-width": 3, fill: "none", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, svg.id + "_ax");
      const axY = mk("path", { d: `M${f(X(Math.max(p.xMin, 0)))},${bh - m.b} V${m.t}`, stroke: p.axis, "stroke-width": 3, fill: "none", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, svg.id + "_ay");
      const ticks = [];
      for (let x = p.xMin; x <= p.xMax + 1e-9; x += p.xStep) { ticks.push(mk("line", { x1: f(X(x)), x2: f(X(x)), y1: f(Y(Math.max(p.yMin, 0)) - 7), y2: f(Y(Math.max(p.yMin, 0)) + 7), stroke: p.axis, "stroke-width": 2, opacity: 0 }));
        ticks.push(mk("text", { x: f(X(x)), y: f(Y(Math.max(p.yMin, 0)) + 34), fill: p.axis, "font-size": 22, "text-anchor": "middle", opacity: 0 }, null, String(+x.toFixed(4)))); }
      for (let y = p.yMin; y <= p.yMax + 1e-9; y += p.yStep) { if (y === 0 && p.xMin <= 0) continue; ticks.push(mk("line", { x1: f(X(Math.max(p.xMin, 0)) - 7), x2: f(X(Math.max(p.xMin, 0)) + 7), y1: f(Y(y)), y2: f(Y(y)), stroke: p.axis, "stroke-width": 2, opacity: 0 }));
        ticks.push(mk("text", { x: f(X(Math.max(p.xMin, 0)) - 16), y: f(Y(y)), fill: p.axis, "font-size": 22, "text-anchor": "end", "dominant-baseline": "middle", opacity: 0 }, null, String(+y.toFixed(4)))); }
      const lx = mk("text", { x: bw - m.r, y: f(Y(Math.max(p.yMin, 0)) - 16), fill: p.axis, "font-size": 30, "font-style": "italic", "text-anchor": "end", opacity: 0 }, svg.id + "_lx", p.xLabel);
      const ly = mk("text", { x: f(X(Math.max(p.xMin, 0)) + 16), y: m.t + 8, fill: p.axis, "font-size": 30, "font-style": "italic", opacity: 0 }, svg.id + "_ly", p.yLabel);
      const pts = []; for (let i = 0; i <= p.samples; i++) { const x = p.xMin + (p.xMax - p.xMin) * i / p.samples, y = F(x); if (isFinite(y)) pts.push(`${f(X(x))},${f(Math.max(m.t - 200, Math.min(bh + 200, Y(y))))}`); }
      const clip = mk("clipPath", { id: svg.id + "_clip" }); const cr = document.createElementNS(NS, "rect"); Object.entries({ x: m.l, y: m.t, width: bw - m.l - m.r, height: bh - m.t - m.b }).forEach(([k, v]) => cr.setAttribute(k, v)); clip.appendChild(cr);
      const curve = mk("path", { d: "M" + pts.join(" L"), stroke: p.color, "stroke-width": 5, fill: "none", "stroke-linejoin": "round", "clip-path": `url(#${svg.id}_clip)`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, svg.id + "_curve");
      const tan = mk("line", { stroke: "#5ce1a0", "stroke-width": 3, opacity: 0, "clip-path": `url(#${svg.id}_clip)` }, svg.id + "_tan");
      const dot = mk("circle", { r: 11, fill: p.dot, opacity: 0, cx: f(X(p.traceFrom)), cy: f(Y(F(p.traceFrom))) }, svg.id + "_dot");
      const read = mk("text", { fill: p.dot, "font-size": 28, "font-weight": 700, opacity: 0 }, svg.id + "_read", "");
      const t0 = p.at, t1 = f(t0 + p.axes), t2 = f(t1 + p.curve);
      tl.fromTo([axX, axY], { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: p.axes, ease: "power2.inOut" }, t0);
      ticks.forEach((e, i) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, f(t0 + p.axes * 0.5 + i * 0.01)));
      tl.fromTo([lx, ly], { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, t1);
      tl.fromTo(curve, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: p.curve, ease: "power1.inOut" }, t1);
      tl.set([dot, read], { opacity: 1 }, t2); if (p.tangent) tl.set(tan, { opacity: 1 }, t2);
      const g = { fn: p.fn, xMin: p.xMin, xMax: p.xMax, yMin: p.yMin, yMax: p.yMax, w: bw, h: bh, m, from: p.traceFrom, to: p.traceTo, dec: p.decimals, tangent: !!p.tangent }, v = "fp_" + svg.id.replace(/\W/g, "_");
      ctx.code(`  // function-plot #${svg.id}: one tracker value (x) drives the dot, the readout and the tangent, like Manim's ValueTracker
  const ${v} = { x: ${p.traceFrom} }, ${v}_g = ${JSON.stringify(g)}, ${v}_f = new Function("x", "return (" + ${v}_g.fn + ");");
  const ${v}_draw = () => { const G = ${v}_g, m = G.m, X = x => m.l + (x - G.xMin) / (G.xMax - G.xMin) * (G.w - m.l - m.r), Y = y => G.h - m.b - (y - G.yMin) / (G.yMax - G.yMin) * (G.h - m.t - m.b);
    const x = ${v}.x, y = ${v}_f(x), d = document.getElementById("${dot.id}"), r = document.getElementById("${read.id}"), t = document.getElementById("${tan.id}");
    d.setAttribute("cx", X(x).toFixed(2)); d.setAttribute("cy", Y(y).toFixed(2));
    r.setAttribute("x", (X(x) + 22).toFixed(2)); r.setAttribute("y", (Y(y) - 22).toFixed(2)); r.textContent = "(" + x.toFixed(G.dec) + "; " + y.toFixed(G.dec) + ")";
    if (G.tangent) { const h = 1e-3, k = (${v}_f(x + h) - ${v}_f(x - h)) / (2 * h), s = (G.xMax - G.xMin) * 0.12;
      t.setAttribute("x1", X(x - s).toFixed(2)); t.setAttribute("y1", Y(y - k * s).toFixed(2)); t.setAttribute("x2", X(x + s).toFixed(2)); t.setAttribute("y2", Y(y + k * s).toFixed(2)); } };
  ${v}_draw();
  tl.fromTo(${v}, { x: ${p.traceFrom} }, { x: ${p.traceTo}, duration: ${p.trace}, ease: "none", onUpdate: ${v}_draw }, ${t2});`);
    }
  },
});
