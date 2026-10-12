/* lower/neon-border: a dark glass panel with name and role, framed by a rounded rectangle along which two neon light arcs (on opposite
   corners) hop from corner to corner with a snapping ease (or glide), each with a tapered tail and a three-layer bloom.
   Port of HyperFrames registry block lt-neon-border: geometry, bloom layers, easing, arc taper and timing as in the source.
   How it runs: the SVG (rail, fill, tapered dash segments in <defs>, <use> bloom layers) is built once here; the light is a per-frame formula
   (ctx.code: a proxy tween whose onUpdate sets every segment's dash offset from the time alone, so seeking anywhere gives the same frame).
   BLOCK: built inside the target box (1920 x 1080 positions). params.runFor: seconds the light runs (source: the clip, 4.8 s); it then holds.
   Exit (source: role 4.24, name 4.3, frame 4.36 s): params.exitAt is the role's exit (others keep the source's offsets), null = no exit. */
AIMK.preset("lower/neon-border", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", accent: "#cc9149", movement: "step", speed: 1.6, cornerRadius: 26,
            thickness: 5, arcLength: 22, glow: 1, left: 50, bottom: 56, runFor: 4.8, exitAt: 4.24 },
  build(tl, els, p, ctx) {
    const NS = "http://www.w3.org/2000/svg", W = 820, H = 210;
    const accent = /^#[0-9a-fA-F]{6}$/.test(String(p.accent)) ? String(p.accent) : "#cc9149";
    const thickness = Math.max(0.5, +p.thickness || 5), glow = Math.max(0, +p.glow || 0), r = Math.min(Math.min(W, H) / 2, Math.max(0, +p.cornerRadius || 0));
    const towardWhite = (hex, a) => { const v = parseInt(hex.slice(1), 16); let o = "#"; for (let s = 16; s >= 0; s -= 8) { const c = (v >> s) & 255, m = Math.round(c + (255 - c) * a); o += (m < 16 ? "0" : "") + m.toString(16); } return o; };
    const hot = towardWhite(accent, 0.78);
    const arc = `A ${r} ${r} 0 0 1 `;
    const d = [`M ${r} 0`, `H ${W - r}`, arc + `${W} ${r}`, `V ${H - r}`, arc + `${W - r} ${H}`, `H ${r}`, arc + `0 ${H - r}`, `V ${r}`, arc + `${r} 0`, "Z"].join(" ");
    ctx.css("lower/neon-border", `
.ltnb { position: absolute; width: 1120px; height: 510px; transform-origin: 0% 100%; }
.ltnb-svg { position: absolute; inset: 0; display: block; overflow: visible; }
.ltnb-panel { position: absolute; left: 150px; top: 150px; width: 820px; height: 210px; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 0 52px; }
.ltnb-name { display: block; font-size: 54px; font-weight: 700; color: #ffffff; line-height: 1; letter-spacing: -0.015em; white-space: nowrap; text-shadow: 0 2px 20px rgba(0,0,0,.75); }
.ltnb-role { display: block; font-size: 25px; font-weight: 400; color: #d5dae3; line-height: 1.2; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; text-shadow: 0 2px 16px rgba(0,0,0,.75); }`);
    const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    for (const slot of els) {
      const wrap = ctx.make(slot, "div", "nb", { cls: "ltnb", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const id = wrap.id;
      const svg = svgEl("svg", { class: "ltnb-svg", width: 1120, height: 510, viewBox: "0 0 1120 510", fill: "none", "aria-hidden": "true" }, wrap);
      const defs = svgEl("defs", {}, svg);
      const G = {};
      for (const k of ["a_glow", "a_core", "b_glow", "b_core"]) G[k] = svgEl("g", { id: `${id}_${k}` }, defs);
      const root = svgEl("g", { transform: "translate(150,150)" }, svg);
      const under = svgEl("g", {}, root);
      svgEl("path", { d, fill: "rgba(9,11,15,0.78)" }, root);
      svgEl("path", { id: `${id}_rail`, d, fill: "none", "stroke-linejoin": "round", stroke: accent, "stroke-width": thickness, "stroke-opacity": 0.14 }, root);
      const over = svgEl("g", {}, root);
      const segs = (g, count, falloff) => { for (let i = 0; i < count; i++) svgEl("path", { d, fill: "none", "stroke-linecap": i === 0 ? "round" : "butt", opacity: Math.pow(1 - i / count, falloff) }, g); };
      segs(G.a_glow, 20, 2.6); segs(G.a_core, 26, 1.4); segs(G.b_glow, 20, 2.6); segs(G.b_core, 26, 1.4);
      const LAYERS = [{ blur: 30, spread: 1, opacity: 0.18, stroke: accent, deep: true }, { blur: 15, spread: 0.6, opacity: 0.3, stroke: accent, deep: true },
        { blur: 8, spread: 0.3, opacity: 0.5, stroke: accent, deep: true }, { blur: 4, spread: 0.05, opacity: 0.9, stroke: hot, core: true },
        { blur: 0, spread: -0.012, opacity: 1, stroke: "#ffffff", core: true }];
      for (const tag of ["a", "b"]) for (const L of LAYERS) {
        const u = svgEl("use", { href: `#${id}_${tag}_${L.core ? "core" : "glow"}`, stroke: L.stroke, "stroke-width": Math.max(0.5, thickness + 2 * L.spread * 36 * glow),
                                 opacity: Math.min(1, L.opacity * glow) }, L.deep ? under : over);
        if (L.blur > 0) u.style.filter = `blur(${L.blur}px)`;
      }
      const panel = ctx.make(wrap, "div", "panel", { cls: "ltnb-panel" });
      const name = ctx.make(panel, "span", "name", { cls: "ltnb-name", text: p.name });
      const role = ctx.make(panel, "span", "role", { cls: "ltnb-role", text: p.role });
      const C = { id, W, H, r, arc: Math.min(1, Math.max(0.02, (+p.arcLength || 22) / 100)), speed: Math.max(0.05, +p.speed || 1.6), glide: p.movement === "glide",
                  at: +p.at.toFixed(4), run: Math.max(0.1, +p.runFor || 4.8) };
      ctx.code(`  const C = ${JSON.stringify(C)};  // lower/neon-border #${id}: the two light arcs, a pure function of time
  const rail = document.getElementById(C.id + "_rail"), r = C.r, SW = C.W - 2 * r, SH = C.H - 2 * r, AC = Math.PI * r / 2, PA = 2 * SW + 2 * SH + 4 * AC;
  const P = rail.getTotalLength() || PA, K = P / PA;
  const CORNERS = [(SW + AC / 2) * K, (SW + SH + 1.5 * AC) * K, (2 * SW + SH + 2.5 * AC) * K, (2 * SW + 2 * SH + 3.5 * AC) * K];
  const cornerPos = k => { const lap = Math.floor(k / 4); return CORNERS[k - lap * 4] + lap * P; };
  const bez = (x1, y1, x2, y2) => { const ax = (t, a, b) => { const u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; };
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 32; i++) { t = (lo + hi) / 2; if (ax(t, x1, x2) < x) lo = t; else hi = t; } return ax(t, y1, y2); }; };
  const ease = C.glide ? bez(0.65, 0, 0.35, 1) : bez(0.72, 0.16, 0.18, 1.05), beat = 1 / C.speed;
  const headAt = t => { const tot = t / beat, k = Math.floor(tot), u = tot - k, a = cornerPos(k), b = cornerPos(k + 1); return a + (b - a) * ease(u); };
  const glowLen = C.arc * P, coreLen = 0.34 * glowLen;
  const pick = g => Array.from(document.querySelectorAll("#" + C.id + "_" + g + " > path"));
  const arcs = [{ off: 0, glow: pick("a_glow"), core: pick("a_core") }, { off: 2, glow: pick("b_glow"), core: pick("b_core") }];
  const lay = (segs, head, len) => { const step = len / segs.length; segs.forEach((s, i) => { let st = head - (i + 1) * step; st = ((st % P) + P) % P;
    s.setAttribute("stroke-dasharray", step + " " + (P - step)); s.setAttribute("stroke-dashoffset", String(-st)); }); };
  const render = t => arcs.forEach(a => { const h = headAt(t + a.off * beat); lay(a.glow, h, glowLen); lay(a.core, h, coreLen); });
  const drv = { t: 0 };
  render(0);
  tl.fromTo(drv, { t: 0 }, { t: C.run, duration: C.run, ease: "none", onUpdate: () => render(drv.t) }, C.at);`);
      const t = p.at;
      tl.fromTo(wrap, { opacity: 0, scale: 0.965 }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" }, t + 0.08);
      tl.fromTo(name, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.3);
      tl.fromTo(role, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.44);
      if (p.exitAt != null) {
        const e = t + p.exitAt;
        tl.to(role, { y: -10, opacity: 0, duration: 0.3, ease: "power2.in" }, e);
        tl.to(name, { y: -14, opacity: 0, duration: 0.32, ease: "power2.in" }, e + 0.06);
        tl.to(wrap, { opacity: 0, scale: 0.985, duration: 0.36, ease: "power2.in" }, e + 0.12);
      }
    }
  },
});
