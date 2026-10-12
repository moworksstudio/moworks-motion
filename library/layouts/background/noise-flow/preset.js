/* background/noise-flow: a calm, seamlessly looping flow field: hundreds of soft streamlines follow a drifting noise field, colours blending
   across the frame. After iart-ai motion-design-skills, motion-background / background-recipes #4 (MIT): the noise is sampled at a point that
   travels a closed circle once per PERIOD (phase = t / PERIOD x 2 pi), so the field returns exactly to its start: a perfect loop. Each frame is
   drawn from the film's time alone (2D simplex noise, Gustavson, public domain), on a canvas in the target box, through ctx.code. */
AIMK.preset("background/noise-flow", {
  params: { colorA: "#2563eb", colorB: "#22c3a6", bg: "transparent", lines: 420, steps: 14, step: 9, width: 1.6, alpha: 0.55, scale: 0.0022, radius: 0.6, period: 10, duration: 10, seed: 7 },
  build(tl, els, p, ctx) {
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, id = ctx.id(slot, "b");
      if (p.bg !== "transparent") slot.style.background = p.bg;
      const cv = ctx.make(slot, "canvas", "flow", { attrs: { width: String(bw), height: String(bh) }, style: { position: "absolute", inset: "0px", width: "100%", height: "100%" } });
      const v = "nf_" + cv.id.replace(/\W/g, "_"), o = { id: cv.id, w: bw, h: bh, ...p };
      ctx.code(`  // noise-flow #${cv.id}: streamlines of a looping simplex field, one frame per film time
  const ${v} = { t: 0 }, ${v}_o = ${JSON.stringify(o)};
  const ${v}_draw = (() => {
    const o = ${v}_o, F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6, perm = new Uint8Array(512), g3 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    let s = o.seed >>> 0 || 1; const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
    const p0 = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p0[i], p0[j]] = [p0[j], p0[i]]; } for (let i = 0; i < 512; i++) perm[i] = p0[i & 255];
    const noise = (x, y) => { const s2 = (x + y) * F2, i = Math.floor(x + s2), j = Math.floor(y + s2), t2 = (i + j) * G2, x0 = x - (i - t2), y0 = y - (j - t2);
      const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1, x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2, ii = i & 255, jj = j & 255;
      const c = (gx, gy, a, b) => { let tt = 0.5 - a * a - b * b; if (tt < 0) return 0; tt *= tt; const g = g3[perm[gx + perm[gy]] % 8]; return tt * tt * (g[0] * a + g[1] * b); };
      return 70 * (c(ii, jj, x0, y0) + c(ii + i1, jj + j1, x1, y1) + c(ii + 1, jj + 1, x2, y2)); };
    const seeds = Array.from({ length: o.lines }, () => [rnd() * o.w, rnd() * o.h, rnd()]);
    const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }, A = hex(o.colorA), B = hex(o.colorB);
    return (t) => {
      const cv = document.getElementById(o.id); if (!cv) return; const g = cv.getContext("2d"); g.clearRect(0, 0, o.w, o.h);
      const ph = ((t % o.period) / o.period) * Math.PI * 2, ox = Math.cos(ph) * o.radius, oy = Math.sin(ph) * o.radius;
      g.lineWidth = o.width; g.lineCap = "round"; g.globalAlpha = o.alpha;
      for (const [sx, sy, k] of seeds) {
        let x = sx, y = sy; const m = (x / o.w + k * 0.3) % 1, col = A.map((a, i) => Math.round(a + (B[i] - a) * m));
        g.strokeStyle = "rgb(" + col.join(",") + ")"; g.beginPath(); g.moveTo(x, y);
        for (let n = 0; n < o.steps; n++) { const an = noise(x * o.scale + ox, y * o.scale + oy) * Math.PI * 2; x += Math.cos(an) * o.step; y += Math.sin(an) * o.step; g.lineTo(x, y); }
        g.stroke();
      }
    };
  })();
  ${v}_draw(0);
  tl.fromTo(${v}, { t: 0 }, { t: ${p.duration}, duration: ${p.duration}, ease: "none", onUpdate: () => ${v}_draw(${v}.t) }, ${p.at});`);
    }
  },
});
