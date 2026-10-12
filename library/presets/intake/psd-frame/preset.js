/* intake/psd-frame: rebuilds one Photoshop frame (PSD / PSB, exported by `kit.py psd`) inside its target, layer by layer: every picture at
   its place with its blend mode and opacity, every text as live text fitted to the PSD ink box, layer and group effects (stroke + drop
   shadow as one SVG filter, outer glow as a warm halo, gradient overlay on text). No motion: other presets animate the layers afterwards
   (every layer gets an id: <target>_u<NN>, its text face <target>_u<NN>_face).
   Port of v1 Engine/psd.js (SSPsd text(), image(), place(), filters; a v1 PSD film, 3 Oct 2026), same maths.
   params.units = the frame's units from psd.json; params.fonts = { "<PSD font name>": { family, skew } } (family: a CSS font family that
   the film loads, either the real font from assets/fonts or a stand-in such as "Arial Black"; skew: faux italic degrees for a stand-in). */
AIMK.preset("intake/psd-frame", {
  params: { units: [], fonts: {}, W: 1920, H: 1080 },
  build(tl, els, p, ctx) {
    const cv = document.createElement("canvas").getContext("2d");
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rgba = (hex, a) => { const v = parseInt(String(hex).slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${(+a).toFixed(3)})`; };
    const host = els[0];
    let defs = null; const FILTERS = {};
    const svgFilter = list => {                       // stroke (outside) then drop shadow cast by layer + stroke, the Photoshop order
      const ops = (list || []).filter(e => e.k === "stroke" || e.k === "shadow");
      if (!ops.length) return "";
      const key = JSON.stringify(ops); if (FILTERS[key]) return FILTERS[key];
      if (!defs) {
        const s = ctx.make(host, "div", "fxdefs", { style: { position: "absolute", width: "0px", height: "0px", overflow: "hidden" } });
        s.innerHTML = '<svg width="0" height="0"><defs></defs></svg>'; defs = s.querySelector("defs");
      }
      const id = host.id + "_fx" + Object.keys(FILTERS).length; let src = "SourceGraphic", n = 0, body = "";
      ops.slice().sort((a, b) => (a.k === "stroke" ? 0 : 1) - (b.k === "stroke" ? 0 : 1)).forEach(e => {
        const r = `r${n++}`;
        if (e.k === "stroke") body += `<feMorphology in="${src}" operator="dilate" radius="${e.r}" result="${r}d"/><feFlood flood-color="${e.color}" flood-opacity="${e.op ?? 1}"/><feComposite in2="${r}d" operator="in" result="${r}s"/><feMerge result="${r}"><feMergeNode in="${r}s"/><feMergeNode in="${src}"/></feMerge>`;
        else body += `<feOffset in="${src}" dx="${e.dx}" dy="${e.dy}" result="${r}o"/>` + (e.blur > 0.5 ? `<feGaussianBlur in="${r}o" stdDeviation="${(e.blur / 2).toFixed(2)}" result="${r}o"/>` : "") +
          `<feFlood flood-color="${e.color}" flood-opacity="${e.op ?? 1}"/><feComposite in2="${r}o" operator="in" result="${r}s"/><feMerge result="${r}"><feMergeNode in="${r}s"/><feMergeNode in="${src}"/></feMerge>`;
        src = r;
      });
      defs.insertAdjacentHTML("beforeend", `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">${body}</filter>`);
      return (FILTERS[key] = `url(#${id})`);
    };
    // outer glow -> three soft halos in the glow's colour. Measured on a PSD test (08/10/2026, a card glow, colour dodge 23 % / 14 %, size
    // 54.5 px, against the client's preview in distance bands): radii 0.29 / 0.73 / 1.1 x size, strength about 4 x opacity; a dodge glow
    // brightens what it falls on, so its colour is pushed lighter (#eea516 read as #ffcd1e). The earlier halo (0.12 / 0.32 / 0.7) was too tight.
    const lift = hex => { const v = parseInt(String(hex).slice(1), 16), f = x => Math.min(255, Math.round(x * 1.15 + 20)); return "#" + [v >> 16, (v >> 8) & 255, v & 255].map(f).map(x => x.toString(16).padStart(2, "0")).join(""); };
    const glowCss = (list, k = 1) => (list || []).filter(e => e.k === "glow" && e.size >= 3).map(e => { const o = (e.op ?? 1) * k, c0 = e.color || "#ffe066";
      const c = /DODGE|SCREEN|LIGHTEN|ADD/i.test(e.blend || "DODGE") ? lift(c0) : c0, a = [Math.min(1, o * 3.9), Math.min(1, o * 4.4), Math.min(1, o * 2.8)];
      return `drop-shadow(0 0 ${(e.size * 0.29).toFixed(1)}px ${rgba(c, a[0])}) drop-shadow(0 0 ${(e.size * 0.73).toFixed(1)}px ${rgba(c, a[1])}) drop-shadow(0 0 ${(e.size * 1.1).toFixed(1)}px ${rgba(c, a[2])})`; }).join(" ");
    const filterOf = fx => [svgFilter(fx), glowCss(fx)].filter(Boolean).join(" ");
    // gradient overlay / fill -> CSS gradient (Photoshop angle 90 = bottom to top; reflected = first stop in the middle); b = paint box + ink box
    const gradCss = (g, b) => {
      let st = (g.stops || []).slice(); if (!st.length) return null; if (g.reversed) st = st.map(([q, c]) => [1 - q, c]).reverse();
      const ang = 90 - (g.angle ?? 90);
      if (b && !/radial/.test(g.type)) {
        const r = ang * Math.PI / 180, dx = Math.sin(r), dy = -Math.cos(r), L = Math.abs(b.W * dx) + Math.abs(b.H * dy);
        const tc = (b.x - b.W / 2) * dx + (b.y - b.H / 2) * dy + L / 2, h = (Math.abs(dx) * b.w / 2 + Math.abs(dy) * b.h / 2) * (g.scale ?? 100) / 100;
        const px = v => `${v.toFixed(1)}px`;
        if (/reflect/.test(g.type)) return `linear-gradient(${ang}deg, ${st.slice().reverse().map(([q, c]) => `${c} ${px(tc - q * h)}`).concat(st.map(([q, c]) => `${c} ${px(tc + q * h)}`)).join(", ")})`;
        return `linear-gradient(${ang}deg, ${st.map(([q, c]) => `${c} ${px(tc - h + 2 * h * q)}`).join(", ")})`;
      }
      if (b && /radial/.test(g.type)) {               // centre and radius from the reference box (layer or canvas), radius = closest side x scale
        const R = Math.min(b.w, b.h) / 2 * (g.scale ?? 100) / 100;
        return `radial-gradient(circle ${R.toFixed(1)}px at ${b.x.toFixed(1)}px ${b.y.toFixed(1)}px, ${st.map(([q, c]) => `${c} ${(q * R).toFixed(1)}px`).join(", ")})`;
      }
      if (/radial/.test(g.type)) return `radial-gradient(circle closest-side, ${st.map(([q, c]) => `${c} ${(q * 100).toFixed(1)}%`).join(", ")})`;
      if (/reflect/.test(g.type)) return `linear-gradient(${ang}deg, ${st.slice().reverse().map(([q, c]) => `${c} ${(50 - q * 50).toFixed(1)}%`).concat(st.map(([q, c]) => `${c} ${(50 + q * 50).toFixed(1)}%`)).join(", ")})`;
      return `linear-gradient(${ang}deg, ${st.map(([q, c]) => `${c} ${(q * 100).toFixed(1)}%`).join(", ")})`;
    };

    const text = (parent, s, name) => {
      const F = p.fonts[s.font] || {}, fam = F.family ? `"${F.family}"` : "Arial", stand = !F.real, skew = F.skew ?? (s.fauxItalic ? 12 : 0);
      const t = Math.tan(skew * Math.PI / 180), th = s.rot * Math.PI / 180, lines = s.text.split("\n");
      const c = Math.cos(th), sn = Math.abs(Math.sin(th)), bw = s.box[2] - s.box[0], bh = s.box[3] - s.box[1], den = c * c - sn * sn;
      const W0 = Math.abs(den) > 0.2 ? (bw * c - bh * sn) / den : bw, H0 = Math.abs(den) > 0.2 ? (bh * c - bw * sn) / den : bh;   // ink size before rotation
      cv.font = `${s.fauxBold ? "bold " : ""}100px ${fam}`;
      let fs, ls, cx, cy, yb, lh = 0, inkA = 0, inkD = 0, inkX0 = 0, inkX1 = 0, inkH = 0;
      if (lines.length === 1) {                       // one line: size from the ink height, tracking from the ink width (works for stand-in fonts)
        const m = cv.measureText(s.text), n = [...s.text].length, H100 = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || 70;
        fs = stand ? 100 * H0 / H100 : s.size; let k = fs / 100;
        const inkW = () => (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) * k + H100 * k * t;
        ls = n > 1 ? (W0 - inkW()) / (n - 1) : 0;
        const lo = -0.06 * fs, hi = 0.2 * fs;
        if (ls < lo || ls > hi) { ls = clamp(ls, lo, hi); if (stand) { fs = fs * W0 / (inkW() + ls * (n - 1)); k = fs / 100; } ls = n > 1 ? clamp((W0 - inkW()) / (n - 1), lo, hi) : 0; }
        const asc = m.actualBoundingBoxAscent * k, desc = m.actualBoundingBoxDescent * k;
        const xL = -m.actualBoundingBoxLeft * k, xR = m.actualBoundingBoxRight * k + ls * (n - 1);
        inkA = asc; inkD = desc; inkX0 = xL; inkX1 = xR;
        cx = (xL + xR) / 2 + (asc - desc) * t / 2; cy = (desc - asc) / 2;
        const fA = m.fontBoundingBoxAscent * k, fD = m.fontBoundingBoxDescent * k; yb = (fs - (fA + fD)) / 2 + fA;
      } else {                                        // several lines: the PSD size and leading, widest line fitted to the box width (stand-in fonts)
        fs = s.size; ls = (s.tracking || 0) / 1000 * fs;
        const wid = Math.max(...lines.map(l => cv.measureText(l).width)) / 100 * fs + ls * Math.max(...lines.map(l => [...l].length));
        if (stand && wid > 0) fs *= clamp(W0 / wid, 0.7, 1.3);
        lh = s.leading ? s.leading * fs / s.size : 1.2 * fs;
        const m = cv.measureText("H"), asc = m.actualBoundingBoxAscent * fs / 100, fA = m.fontBoundingBoxAscent * fs / 100, fD = m.fontBoundingBoxDescent * fs / 100;
        yb = (lh - (fA + fD)) / 2 + fA;
        inkH = (lines.length - 1) * lh + asc; inkA = asc;
        cx = 0; cy = asc - yb - inkH / 2;
      }
      const pad = Math.round(fs * 0.5);
      const d = ctx.make(parent, "div", name, { style: { position: "absolute", left: "0px", top: "0px", mixBlendMode: s.blend || "normal", opacity: String(s.opacity ?? 1) } });
      const rot = ctx.make(d, "div", "rot", { style: { position: "absolute", left: (s.box[0] + s.box[2]) / 2 + "px", top: (s.box[1] + s.box[3]) / 2 + "px", width: "0px", height: "0px", transform: `rotate(${s.rot}deg)` } });
      const slide = ctx.make(rot, "div", "in", { style: { position: "absolute", left: "0px", top: "0px" } });     // entrance layer: moves along the text's baseline
      const multi = lines.length > 1, align = s.align || "left";
      const base = { position: "absolute", top: (multi ? cy : -(yb + cy)) - pad + "px", padding: `${pad}px 0px`, whiteSpace: "pre", fontFamily: fam, fontSize: fs + "px",
        lineHeight: (multi ? lh : fs) + "px", letterSpacing: ls + "px", transform: `skewX(${-skew}deg)`, transformOrigin: `0px ${yb + pad}px`, fontKerning: "normal",
        fontWeight: s.fauxBold ? "bold" : "normal", textAlign: align };   // the font's own digits, as Photoshop (tabular-nums made "61,313" wider, Test 4)
      if (multi) Object.assign(base, align === "center" ? { left: -W0 / 2 + "px", width: W0 + "px" } : align === "right" ? { right: -W0 / 2 + "px" } : { left: -W0 / 2 + "px" });
      else base.left = -cx + "px";
      const fx = s.fx || [];
      const shadows = fx.filter(e => e.k === "shadow"), stroke = fx.find(e => e.k === "stroke"), grad = fx.find(e => e.k === "gradient"), glow = fx.filter(e => e.k === "glow");
      if (shadows.length) {                           // drop shadows are canvas-space in Photoshop: bring them into the rotated + skewed frame
        const inv = new DOMMatrix().rotate(s.rot).skewX(-skew).inverse(), o0 = inv.transformPoint({ x: 0, y: 0 });
        const sh = shadows.map(e => { const q = inv.transformPoint({ x: e.dx, y: e.dy }); return `${(q.x - o0.x).toFixed(2)}px ${(q.y - o0.y).toFixed(2)}px ${(e.blur || 0).toFixed(1)}px ${rgba(e.color, e.op ?? 1)}`; }).join(", ");
        ctx.make(slide, "div", "shadow", { text: s.text, style: Object.assign({}, base, { color: "transparent", textShadow: sh }) });
      }
      if (stroke) ctx.make(slide, "div", "stroke", { text: s.text, style: Object.assign({}, base, { color: stroke.color, webkitTextStroke: `${2 * stroke.r}px ${stroke.color}`, opacity: String(stroke.op ?? 1) }) });
      const face = ctx.make(slide, "div", "face", { text: s.text, style: Object.assign({}, base, { color: s.fill }) });
      const ink = multi ? { x: align === "center" || align === "left" ? W0 / 2 : face.offsetWidth - W0 / 2, y: pad + (yb - inkA) + inkH / 2, w: W0, h: inkH }
        : { x: (inkX0 + inkX1) / 2, y: pad + yb - (inkA - inkD) / 2, w: inkX1 - inkX0, h: inkA + inkD };
      if (grad && gradCss(grad)) Object.assign(face.style, { color: "transparent", backgroundImage: gradCss(grad, Object.assign({ W: face.offsetWidth, H: face.offsetHeight }, ink)), webkitBackgroundClip: "text", backgroundClip: "text" });
      if (glow.length) slide.style.filter = glowCss(glow);
      return d;
    };
    const image = (parent, u, name) => {
      const d = ctx.make(parent, "div", name, { style: { position: "absolute", left: u.x + "px", top: u.y + "px", width: u.w + "px", height: u.h + "px", mixBlendMode: u.blend || "normal" } });
      const inner = ctx.make(d, "div", "in", { style: { position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%" } });     // entrance layer
      if (u.fx) d.style.filter = filterOf(u.fx);
      if (u.grad && (u.grad.stops || []).length && ("align" in u.grad || /radial/.test(u.grad.type))) {
        // psd-tools paints gradient fills wrong (radial, and linear too: Test 4's stripe): the stored gradient inside the layer's own shape,
        // laid over the layer's box or, when "align with layer" is off, over the whole canvas (+ offset %). Only for exports that carry
        // "align" (kit.py psd from 08/10/2026): older psd.json read the type wrongly (Test 4 fixed its PNGs by hand: those stay as they are)
        const g = u.grad, al = g.align !== false, off = g.offset || [0, 0];
        const ref = al ? { x: u.w / 2, y: u.h / 2, w: u.w, h: u.h } : { x: p.W / 2 - u.x, y: p.H / 2 - u.y, w: p.W, h: p.H };
        ref.x += off[0] / 100 * ref.w; ref.y += off[1] / 100 * ref.h;
        const m = `url("${u.src}")`;
        ctx.make(inner, "div", "img", { style: { position: "absolute", left: "0px", top: "0px", width: u.w + "px", height: u.h + "px", background: gradCss(g, Object.assign({ W: u.w, H: u.h }, ref)), maskImage: m, webkitMaskImage: m, maskSize: "100% 100%", webkitMaskSize: "100% 100%", opacity: String(u.opacity) } });
      } else ctx.make(inner, "img", "img", { attrs: { src: u.src, alt: "" }, style: { position: "absolute", left: "0px", top: "0px", width: u.w + "px", height: u.h + "px", opacity: String(u.opacity) } });
      return d;
    };
    const groups = {};
    for (const u of p.units) {
      let parent = host;
      // the wrapper carries the group's effects; its filter makes it a stacking context, so it needs the group's own place in the paint
      // order (z-index of its first layer), or the whole group falls under the layers painted after it (v1 place() did this too)
      if (u.gfx) parent = groups[u.gfx.id] || (groups[u.gfx.id] = ctx.make(host, "div", "g" + u.gfx.id, { style: { position: "absolute", left: "0px", top: "0px", width: p.W + "px", height: p.H + "px", zIndex: String(u.i), filter: filterOf(u.gfx.fx) } }));
      const name = "u" + String(u.i).padStart(2, "0");
      const d = u.kind === "text" ? text(parent, u, name) : image(parent, u, name);
      d.style.zIndex = String(u.i); d.dataset.psd = u.name || ""; if (u.kind === "text") d.dataset.text = u.text;
    }
  },
});
