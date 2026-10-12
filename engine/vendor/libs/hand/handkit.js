/* handkit.js: the hand-drawn look for kit films, ported to the browser from claude-animation by Hanif (@hanifproduktif), MIT License,
   https://github.com/buildwithhanif/claude-animation-skill (lib/core.mjs, lib/pen.mjs, lib/textures.mjs, lib/fx.mjs), 07/10/2026.
   The drawing code is theirs, unchanged except: canvases come from the page (document.createElement) instead of @napi-rs/canvas, the
   modules are one global (window.HANDKIT), and only the parts the kit's presets use are kept. Both run on Skia, so the marks match the
   original (checked pixel by pixel against the Node library: Docs/Audit/handkit-check/).

   MIT License, Copyright (c) 2026 Hanif (@hanifproduktif)
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
   the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions
   of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. */
(function () {
  const createCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

  // ---------------------------------------------------------------- core.mjs (numbers, easing, geometry, canvas helpers, texture)
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const rad = (d) => d * Math.PI / 180;
  const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rng = (seed) => { let s = Math.max(1, Math.floor(seed)) % 2147483647; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const noise1 = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1; };
  const eOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
  const eIn = (k) => Math.pow(clamp(k), 3);
  const eIO = (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const eBack = (k, s = 1.8) => { k = clamp(k) - 1; return 1 + (s + 1) * k * k * k + s * k * k; };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const centroid = (P) => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  const ellPts = (cx, cy, rx, ry, n = 24, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const rrect = (x, y, w, h, r) => { const p = [], k = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    for (const [cx, cy, a0] of k) for (let i = 0; i <= 4; i++) { const a = rad(a0 + i * 22.5); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
  function catmull(P, closed = false, step = 7) {
    const out = [], n = P.length, g = (i) => closed ? P[(i + n) % n] : P[clamp(i, 0, n - 1)];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2), m = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let s = 0; s < m; s++) { const t = s / m, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((c) => .5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); }
    }
    out.push(closed ? [...P[0]] : [...P[n - 1]]); return out;
  }
  function densify(P, step = 7) { const out = [];
    for (let i = 0; i < P.length - 1; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1], m = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let s = 0; s < m; s++) out.push([lerp(x0, x1, s / m), lerp(y0, y1, s / m)]); }
    out.push([...P[P.length - 1]]); return out; }
  const INK = "#1E1612";
  function poly(ctx, pts, close = true) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath(); }
  function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot, 0, Math.PI * 2); }
  function stroke(ctx, w = 3, c = INK) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
  function fill(ctx, c) { ctx.fillStyle = c; ctx.fill(); }
  function line(ctx, pts, w = 2, c = INK, dash = null) { ctx.save(); if (dash) ctx.setLineDash(dash); poly(ctx, pts, false); stroke(ctx, w, c); ctx.restore(); }
  function grainCanvas(sz = 256, amt = 60, seed = 3) {
    const c = createCanvas(sz, sz), x = c.getContext("2d"), d = x.createImageData(sz, sz), r = rng(seed);
    for (let i = 0; i < sz * sz; i++) { const v = 255 - Math.floor(Math.pow(r(), 2.2) * amt); d.data[i * 4] = v; d.data[i * 4 + 1] = v; d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    x.putImageData(d, 0, 0); return c;
  }
  function hatch(ctx, clipFn, ang, gap, c, w = 1, a = .35, box = [-600, -600, 2600, 2600]) {
    ctx.save(); clipFn(); ctx.clip(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.globalAlpha *= a;
    const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0);
    ctx.translate(cx, cy); ctx.rotate(ang); ctx.beginPath(); for (let d = -R; d < R; d += gap) { ctx.moveTo(-R, d); ctx.lineTo(R, d); } ctx.stroke(); ctx.restore();
  }

  // ---------------------------------------------------------------- pen.mjs (the hand: brush ink, pencil, watercolour, lettering)
  const idHash = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) % 100000; };
  class Pen {
    constructor(ctx) { this.ctx = ctx; this.grain = ctx.createPattern(grainCanvas(256, 70, 11), "repeat"); this.rv = 1; this.Wt = 1; this.c = 0; this.seed = 1; this.boilIx = 0; this.act = 0; this.weights = new Map(); }
    begin(name, reveal = 1, opts = {}) {
      this.name = name; this.seed = idHash(name); this.rv = clamp(reveal); this.c = 0;
      this.Wt = this.weights.get(name) || 1; this.boilIx = opts.boil ? Math.floor((opts.t ?? 0) * opts.boil) : 0; this.jitAmp = opts.jitter ?? 1;
      return this;
    }
    end() { if (this.rv >= 1) this.weights.set(this.name, Math.max(this.c, .5)); }
    next(wt = 1) {
      const OV = 1.6, c = this.c; this.c += wt; if (this.rv >= 1) return 1;
      const r = clamp((this.rv * (this.Wt + OV) - c) / (OV * wt)); if (r > 0 && r < 1) this.act += Math.min(wt, 1.5); return r;
    }
    J(i, amp) { return (hash(this.seed * 91.7 + this.boilIx * 13.37 + i * 7.13) - .5) * 2 * amp * this.jitAmp; }
    stroke(pts, o = {}) {
      const r = this.next(o.wt ?? 1); if (r <= 0 || pts.length < 2) return;
      const { w = 5, color = INK, taper = .75, jit = 1.4, closed = false, alpha = 1, smooth = true, cap = true } = o;
      const k0 = this.c * 31 + this.seed;
      let P = pts.map(([x, y], i) => [x + this.J(k0 + i * 2, jit), y + this.J(k0 + i * 2 + 1, jit)]);
      if (closed) P = [...P, P[0]];
      const D = smooth && P.length > 2 ? catmull(P, false) : densify(P);
      const cum = [0]; for (let i = 1; i < D.length; i++) cum.push(cum[i - 1] + Math.hypot(D[i][0] - D[i - 1][0], D[i][1] - D[i - 1][1]));
      const L = cum[cum.length - 1] || 1, Lr = r * L;
      const wAt = (s) => { const u = s / L, e = (u < .14 ? u / .14 : 1) * (u > .84 ? (1 - u) / .16 : 1); return w * (1 - taper + taper * e) * (1 + .14 * noise1(s * .025 + k0)); };
      const Lp = [], Rp = []; let tip = null, tw = w;
      for (let i = 0; i < D.length; i++) {
        let [x, y] = D[i], s = cum[i];
        if (s > Lr) { if (i === 0) break; const k = (Lr - cum[i - 1]) / ((s - cum[i - 1]) || 1); x = lerp(D[i - 1][0], x, k); y = lerp(D[i - 1][1], y, k); s = Lr; }
        const a = D[Math.max(0, i - 1)], b = D[Math.min(D.length - 1, i + 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const ww = wAt(s) / 2; Lp.push([x + nx * ww, y + ny * ww]); Rp.push([x - nx * ww, y - ny * ww]); tip = [x, y]; tw = ww; if (s >= Lr) break;
      }
      if (!tip) return;
      const ctx = this.ctx; ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(Lp[0][0], Lp[0][1]); for (const q of Lp) ctx.lineTo(q[0], q[1]); for (let i = Rp.length - 1; i >= 0; i--) ctx.lineTo(Rp[i][0], Rp[i][1]); ctx.closePath(); ctx.fill();
      if (cap) { ctx.beginPath(); ctx.arc(tip[0], tip[1], Math.max(tw, r < 1 ? w * .45 : 0), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    pencil(pts, o = {}) {
      const { w = 1.5, color = "#3A3430", passes = 3, alpha = .8 } = o; const r = this.next(o.wt ?? 1); if (r <= 0) return;
      const D = catmull(pts, false, 3), n = Math.max(2, Math.floor(D.length * r)), ctx = this.ctx; ctx.save(); ctx.strokeStyle = color; ctx.lineCap = "round";
      for (let p = 0; p < passes; p++) { const off = (p - 1) * w * .6; ctx.lineWidth = w * (p === 1 ? 1 : .6); ctx.beginPath(); let down = false;
        for (let i = 0; i < n; i++) { const pres = noise1(i * .09 + p * 7.3 + this.seed); if (pres < -.55) { down = false; continue; }
          ctx.globalAlpha = alpha * (.55 + .45 * (pres + 1) / 2); const x = D[i][0] + this.J(i * 3 + p, .6) + off * .3, y = D[i][1] + this.J(i * 3 + p + 1, .6) + off;
          down ? ctx.lineTo(x, y) : ctx.moveTo(x, y); down = true; }
        ctx.stroke(); }
      ctx.restore();
    }
    ring(cx, cy, rx, ry, o = {}) {
      const a0 = o.a0 ?? (-2.3 + hash(this.seed + this.c) * .8), n = Math.max(12, Math.round((rx + ry) / 7)), over = o.over ?? 1.07, pts = [];
      for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2 * over, q = 1 + .025 * Math.sin(a * 3 + this.seed); pts.push([cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q]); }
      this.stroke(pts, { taper: .5, ...o });
    }
    box(x, y, w, h, o = {}) {
      const ov = o.over ?? 8, C = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      for (let i = 0; i < 4; i++) { const a = C[i], b = C[(i + 1) % 4], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        this.stroke([[a[0] - dx / l * ov * hash(this.seed + i), a[1] - dy / l * ov * hash(this.seed + i)], [b[0] + dx / l * ov * hash(this.seed + i + 9), b[1] + dy / l * ov * hash(this.seed + i + 9)]], { smooth: false, taper: .5, ...o, wt: (o.wt ?? 1) / 4 }); }
    }
    wash(pts, color, o = {}) {
      const r = this.next(o.wt ?? .8); if (r <= 0) return;
      const { alpha = .8, ox, oy, solid = false, over = false } = o;
      const sharp = o.sharp ?? (pts.length <= 6 && !o.round), ctx = this.ctx;
      const p = new Path2D(); const D = sharp ? pts : catmull(pts, true); D.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath();
      ctx.save();
      if (r < 1) { const [cx, cy] = ox != null ? [ox, oy] : centroid(pts); let R = 0; for (const q of pts) R = Math.max(R, Math.hypot(q[0] - cx, q[1] - cy)); R *= 1.12 * eOut(r);
        const b = new Path2D(); for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 2, rr = R * (1 + .16 * noise1(a * 2.2 + this.seed + this.c)); i ? b.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : b.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
        b.closePath(); ctx.clip(b); }
      ctx.globalCompositeOperation = over ? "source-over" : "multiply"; ctx.fillStyle = color;
      if (solid) { ctx.globalAlpha *= alpha; ctx.fill(p); }
      else { const a0 = ctx.globalAlpha, base = this.seed * 7 + this.c * 13;
        for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate((hash(base + k * 3) - .5) * 7, (hash(base + k * 5 + 1) - .5) * 7); ctx.globalAlpha = a0 * alpha * .45; ctx.fill(p); ctx.restore(); }
        ctx.globalAlpha = a0 * alpha * .35; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke(p);
        ctx.globalAlpha = a0 * .55; ctx.save(); ctx.clip(p); ctx.fillStyle = this.grain; ctx.fillRect(-4000, -4000, 8000, 8000); ctx.restore(); }
      ctx.restore();
    }
    text(str, x, y, o = {}) {
      const r = this.next(o.wt ?? 2); if (r <= 0) return;
      const { size = 44, font = "sans-serif", color = INK, align = "center", rot = 0, alpha = 1 } = o, ctx = this.ctx; ctx.save(); ctx.font = `${size}px "${font}"`;
      const w = ctx.measureText(str).width, x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
      ctx.translate(x0 + this.J(this.c * 3, .9), y + this.J(this.c * 3 + 1, .9)); ctx.rotate(rot + this.J(this.c * 3 + 2, .006));
      if (r < 1) { ctx.beginPath(); ctx.rect(-10, -size * 1.3, (w + 20) * r, size * 2); ctx.clip(); }
      ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.fillText(str, 0, 0); ctx.restore();
    }
    dot(x, y, rr, color = INK, wt = .3) { const r = this.next(wt); if (r <= 0) return; const c = this.ctx; c.fillStyle = color; c.beginPath(); c.arc(x + this.J(this.c, .6), y + this.J(this.c + 1, .6), rr * eBack(r), 0, Math.PI * 2); c.fill(); }
    poly(pts, o) { this.stroke(pts, { closed: true, smooth: false, taper: .35, ...o }); }
    blob(pts, o) { this.stroke(pts, { closed: true, taper: .4, ...o }); }
  }

  // ---------------------------------------------------------------- textures.mjs (paper) and fx.mjs (shake)
  function paper(W, H, color = "#F3EEDD", grain = .35) {
    const c = createCanvas(W, H), x = c.getContext("2d"); x.fillStyle = color; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "multiply"; x.globalAlpha = grain; x.fillStyle = x.createPattern(grainCanvas(256, 40, 7), "repeat"); x.fillRect(0, 0, W, H);
    return c;
  }
  function fibrePaper(W, H, color = "#F3EBDA") {
    const c = createCanvas(W, H), x = c.getContext("2d"); x.fillStyle = color; x.fillRect(0, 0, W, H);
    x.globalAlpha = .05; x.strokeStyle = "#8A7456"; x.lineWidth = 1;
    for (let i = 0; i < W * H / 800; i++) { const px = hash(i * 3.1) * W, py = hash(i * 5.7) * H, a = hash(i * 7.3) * Math.PI, l = 6 + hash(i * 1.9) * 22;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * .5 + 3, py + Math.sin(a) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    x.globalAlpha = 1;
    for (let i = 0; i < 26; i++) { const px = hash(i * 11.1) * W, py = hash(i * 13.3) * H, r = 80 + hash(i * 2.2) * 260, g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(150,120,80,0.035)"); g.addColorStop(1, "rgba(150,120,80,0)"); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
    x.globalCompositeOperation = "multiply"; x.globalAlpha = .55; x.fillStyle = x.createPattern(grainCanvas(256, 26, 5), "repeat"); x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
    const v = x.createRadialGradient(W / 2, H * .46, H * .35, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, "rgba(90,70,40,0)"); v.addColorStop(1, "rgba(90,70,40,0.16)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }
  function lightBands(ctx, W, H, t, { alpha = .55, color = "#EEDDB4", angle = 40, width = 78, gap = 250, drift = 14 } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.translate(W / 2, H / 2); ctx.rotate(rad(angle));
    const R = Math.hypot(W, H), off = (t * drift) % gap; for (let d = -R; d < R; d += gap) ctx.fillRect(-R, d + off, R * 2, width); ctx.restore();
  }
  function filmFinish(W, H, { tiles = 4, grain = .12, flicker = .025, vignette = .18 } = {}) {
    const T = Array.from({ length: tiles }, (_, i) => grainCanvas(256, 90, 101 + i * 7));
    const v = createCanvas(W, H), vx = v.getContext("2d"), g = vx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) * .55);
    g.addColorStop(0, "rgba(40,30,20,0)"); g.addColorStop(1, `rgba(40,30,20,${vignette})`); vx.fillStyle = g; vx.fillRect(0, 0, W, H);
    return (ctx, frame) => { ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = grain; const tile = T[frame % tiles];
      const ox = Math.floor(hash(frame) * 256), oy = Math.floor(hash(frame + 5) * 256); ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(tile, "repeat"); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
      ctx.drawImage(v, 0, 0);
      const f = (hash(frame * 1.3) - .5) * 2 * flicker; if (f) { ctx.save(); ctx.globalCompositeOperation = f > 0 ? "screen" : "multiply"; ctx.fillStyle = f > 0 ? `rgba(255,250,240,${f})` : `rgba(0,0,0,${-f})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } };
  }
  function shake(t, events, dur = .45) {
    let x = 0, y = 0;
    for (const [t0, amp] of events) { const d = t - t0; if (d < 0 || d > dur) continue; const k = Math.exp(-d * 9) * amp;
      x += Math.sin(d * 97 + t0) * k; y += Math.cos(d * 83 + t0 * 3) * k * .8; }
    return [x, y];
  }

  window.HANDKIT = { createCanvas, clamp, lerp, rad, ss, hash, rng, noise1, eOut, eIn, eIO, eBack, mid, centroid, ellPts, rrect, catmull, densify, INK,
                     poly, ellipse, stroke, fill, line, grainCanvas, hatch, Pen, paper, fibrePaper, lightBands, filmFinish, shake };
})();
