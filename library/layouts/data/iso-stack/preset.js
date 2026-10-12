/* data/iso-stack: an isometric stack of shaded slabs builds bottom-up on a drawn iso grid, each layer with a label, then the scene drifts gently:
   the classic "system architecture" picture. After iart-ai explainer-video-skills, isometric-animation / isometric-recipes (MIT): true isometric
   projection (ground axes at +-30 deg: sx = (x - z) cos30, sy = (x + z) sin30 - y), per-face shading with one fixed light (top lightest, left
   mid, right darkest), SVG polygons painted back-to-front (no z-fighting), grid lines drawn on with a 0.02 s stagger (0.6 s power2.out), layers
   rising 60 px into place bottom-up (0.5 s back.out(1.4), 0.12 s apart), slow drift (sine.inOut). BLOCK: built inside the target box. */
AIMK.preset("data/iso-stack", {
  params: { layers: "Hạ tầng|Dữ liệu|Dịch vụ|Giao diện", colors: "#3a9bff,#22c3a6,#f5a524,#ef5d8e", size: 300, thick: 46, gap: 26, grid: true, gridSize: 10,
            labelColor: "#e8edf5", gridColor: "#2a3340", drift: 6, duration: 6 },
  build(tl, els, p, ctx) {
    const L = (Array.isArray(p.layers) ? p.layers : String(p.layers).split("|")).map(s => String(s).trim().normalize("NFC")).filter(Boolean);
    const C = (Array.isArray(p.colors) ? p.colors : String(p.colors).split(",")).map(s => s.trim());
    const rgb = c => { const d = document.createElement("span"); d.style.color = c; document.body.appendChild(d); const m = getComputedStyle(d).color.match(/[\d.]+/g).slice(0, 3).map(Number); d.remove(); return m; };
    const shade = (c, k) => `rgb(${rgb(c).map(v => Math.round(v * k)).join(", ")})`;
    const c30 = Math.cos(Math.PI / 6), s30 = 0.5, P = (x, y, z) => [(x - z) * c30, (x + z) * s30 - y], f = v => +v.toFixed(2);
    const NS = "http://www.w3.org/2000/svg";
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, id = ctx.id(slot, "b");
      const svg = document.createElementNS(NS, "svg"); svg.id = id + "_iso"; svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`); svg.setAttribute("width", bw); svg.setAttribute("height", bh);
      Object.assign(svg.style, { position: "absolute", inset: "0px", overflow: "visible" }); slot.appendChild(svg);
      const S = p.size, H = L.length * (p.thick + p.gap) - p.gap, ox = bw * 0.42, oy = bh * 0.5 + H * 0.45;
      const pt = (x, y, z) => { const q = P(x, y, z); return `${f(ox + q[0])},${f(oy + q[1])}`; };
      const g0 = document.createElementNS(NS, "g"); g0.id = svg.id + "_scene"; svg.appendChild(g0);
      const mk = (parent, tag, at, idn) => { const e = document.createElementNS(NS, tag); if (idn) e.id = idn; for (const k in at) e.setAttribute(k, String(at[k])); parent.appendChild(e); return e; };
      const lines = [];
      if (p.grid) {
        const n = p.gridSize, ext = S * 1.9, st = ext / n, o0 = -ext / 2 + S / 2;
        for (let i = 0; i <= n; i++) {
          const a = o0 + i * st;
          lines.push(mk(g0, "path", { d: `M${pt(a, 0, o0)} L${pt(a, 0, o0 + ext)}`, stroke: p.gridColor, "stroke-width": 1.2, fill: "none", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, `${svg.id}_gx${i}`));
          lines.push(mk(g0, "path", { d: `M${pt(o0, 0, a)} L${pt(o0 + ext, 0, a)}`, stroke: p.gridColor, "stroke-width": 1.2, fill: "none", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, `${svg.id}_gz${i}`));
        }
      }
      const G = L.map((name, i) => {
        const y0 = i * (p.thick + p.gap), y1 = y0 + p.thick, col = C[i % C.length] || "#3a9bff";
        const g = mk(g0, "g", { opacity: 0 }, `${svg.id}_l${i}`);
        mk(g, "polygon", { points: [pt(S, y0, 0), pt(S, y0, S), pt(S, y1, S), pt(S, y1, 0)].join(" "), fill: shade(col, 0.54) });   // right face (x = S)
        mk(g, "polygon", { points: [pt(0, y0, S), pt(S, y0, S), pt(S, y1, S), pt(0, y1, S)].join(" "), fill: shade(col, 0.77) });   // left face (z = S)
        mk(g, "polygon", { points: [pt(0, y1, 0), pt(S, y1, 0), pt(S, y1, S), pt(0, y1, S)].join(" "), fill: shade(col, 1) });      // top
        const lp = P(S, y0 + p.thick / 2, 0), lx = ox + lp[0] + 40, ly = oy + lp[1];
        mk(g, "line", { x1: f(ox + lp[0] + 8), y1: f(ly), x2: f(lx + 30), y2: f(ly), stroke: p.labelColor, "stroke-width": 1.5, opacity: 0.5 });
        const t = mk(g, "text", { x: f(lx + 42), y: f(ly), fill: p.labelColor, "font-size": Math.round(S * 0.11), "font-weight": 700, "dominant-baseline": "middle", "font-family": '"RFlex", sans-serif' });
        t.textContent = name;
        return g;
      });
      const T = p.at;
      lines.forEach((l, i) => tl.fromTo(l, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.6, ease: "power2.out" }, f(T + i * 0.02)));
      const t0 = T + (lines.length ? 0.35 : 0);
      G.forEach((g, i) => tl.fromTo(g, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }, f(t0 + i * 0.12)));
      const end = t0 + (G.length - 1) * 0.12 + 0.5, rest = Math.max(0, p.duration - (end - T));
      if (p.drift && rest > 0.5) tl.fromTo(g0, { y: 0 }, { y: -p.drift, duration: f(rest / 2), ease: "sine.inOut", yoyo: true, repeat: 1 }, f(end));
    }
  },
});
