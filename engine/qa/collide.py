"""kit.py collide: frames where readable elements run into each other, and blank frames at scene cuts (v1 Engine/lint.py, ported 06/10/2026).

  python kit.py collide <project> [--step 0.05]      -> <project>/qa/collide.json, one line per collision run; exit 1 if anything was found

Per sampled time t the film is sought (engine/runtime/driver.js) and every visible text block is checked for
  text-text : two text blocks whose glyph boxes overlap (>= 12 % of the smaller one and >= 60 px^2)
  covered   : something painted (picture, video, canvas, SVG shape, a panel with a colour or picture) sits ABOVE the text, on its glyphs
  margin    : fully visible text outside the safe margin, (w + h) / 55 = 55 px at 1920x1080 (listed apart, runs of 0.25 s or more; 07/10/2026,
              the player's "Lỗi ở khung này" runs this same JS on the frame you look at)
A text block is the nearest block-level element holding the text, so split words / letters / inline masks count as one block.
Not reported (by design):
  - text over a picture or panel that sits BELOW it (normal layering);
  - two stacked copies of the same text (shimmer, glow, outline, echo layers);
  - anything inside [data-lint="ignore"] (film.json element "attrs": {"data-lint": "ignore"}) or [data-carrier] (transition carriers);
  - elements of different scenes while a transition runs (two scenes overlap in time);
  - parts clipped away by an overflow box or a clip-path (mask reveals, wipes), elements at opacity < 0.15;
  - full-frame layers with no text (fades, flashes, vignettes, grain; flashes are kit.py qa's job), anything with a blend mode or a CSS
    mask (an outline drawn on the border only), translucent gradient glows and gloss sweeps (every colour under 0.8 alpha), radial-gradient
    light (glow, flare), thin lines and thin SVG strokes crossing text (dividers, wipe edges, hand-drawn underline / strike);
  - "covered" while a transition runs (the incoming scene's own carriers: curtain folds, wipe panels);
  - text inside <canvas layoutsubtree> (HTML-in-Canvas: the canvas shows a picture of it);
  - a cross-fade of two labels (their opacities add up to at most 1.15: Follow -> Following);
  - text hidden at that spot by a panel between the two texts (a phone sliding over another): reported as "covered" instead.
"covered" lines say "hidden behind" when every sample point of the text was under the cover the whole run (layering: a card waiting behind
an app screen) and "covered by" when the text showed in part (a real overlap while things move).
Text on rotated or scaled elements is measured as its real quad (a client rect is only the bounding box of a rotated line).
Scene cuts: the frames on both sides of every scene start and end are sought; a frame inside the film where no scene shows (hidden, opacity 0
or moved off the frame) is a blank frame (frame 0 is skipped). It measures geometry only: judge fast moves and wipes by eye as well."""
import asyncio, json, sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent
if str(ENGINE) not in sys.path: sys.path.insert(0, str(ENGINE))

JS = r"""
(args) => {
  const [t, sel, margin] = args;
  const stage = document.querySelector(sel); if (!stage) return {err: 'no stage ' + sel};
  const SR = stage.getBoundingClientRect(), SA = SR.width * SR.height;
  const M = margin || Math.round((SR.width + SR.height) / 55);   // the safe margin: (w + h) / 55 = 55 px at 1920x1080 (a sound title-safe)
  const scenes = [...stage.querySelectorAll(':scope > .scene, :scope > .clip')].map(e => ({e, s: +e.dataset.start || 0, d: e.hasAttribute('data-duration') ? +e.dataset.duration : 1e9}));
  const inTrans = scenes.filter(c => t >= c.s - 1e-6 && t < c.s + c.d - 1e-6).length > 1;
  const sceneOf = e => { for (const c of scenes) if (c.e.contains(e)) return c.e; return null; };
  const ignored = e => !!(e.closest('[data-lint="ignore"]') || e.closest('[data-carrier]'));
  const effOp = e => { let o = 1; for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= parseFloat(cs.opacity); } return o; };
  const inter = (a, b) => ({l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b)});
  const area = r => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);
  // the area a clip-path leaves visible, in page px: inset() exactly, circle() / ellipse() / polygon() as their bounding box
  const len = (v, ref) => v.endsWith('%') ? parseFloat(v) / 100 * ref : parseFloat(v) || 0;
  const clipArea = (x, cs) => {
    const cp = cs.clipPath; if (!cp || cp === 'none') return null;
    const b = x.getBoundingClientRect(), W = b.width, H = b.height, m = cp.match(/^(inset|circle|ellipse|polygon)\((.*)\)/); if (!m) return null;
    const k = x.offsetWidth ? W / x.offsetWidth : 1;           // clip-path lengths are in the element's own px (before its scale)
    const L = (v, ref) => v.endsWith('%') ? parseFloat(v) / 100 * ref : (parseFloat(v) || 0) * k;
    if (m[1] === 'inset') {
      const v = m[2].split(' round ')[0].trim().split(/\s+/), [t, r, bo, l] = v.length === 1 ? [v[0], v[0], v[0], v[0]] : v.length === 2 ? [v[0], v[1], v[0], v[1]] : v.length === 3 ? [v[0], v[1], v[2], v[1]] : v;
      return {l: b.left + L(l, W), t: b.top + L(t, H), r: b.right - L(r, W), b: b.bottom - L(bo, H)};
    }
    if (m[1] === 'polygon') {
      const pts = m[2].replace(/^\s*(nonzero|evenodd)\s*,/, '').split(',').map(s => s.trim().split(/\s+/)).map(([px, py]) => [b.left + L(px, W), b.top + L(py, H)]);
      return {l: Math.min(...pts.map(q => q[0])), t: Math.min(...pts.map(q => q[1])), r: Math.max(...pts.map(q => q[0])), b: Math.max(...pts.map(q => q[1]))};
    }
    const [size, pos] = m[2].split(' at '), p = (pos || '50% 50%').trim().split(/\s+/), cx = b.left + L(p[0], W), cy = b.top + L(p[1] || '50%', H);
    const s2 = size.trim().split(/\s+/), rx = L(s2[0] || '50%', m[1] === 'circle' ? Math.hypot(W, H) / Math.SQRT2 : W), ry = m[1] === 'circle' ? rx : L(s2[1] || '50%', H);
    return {l: cx - rx, t: cy - ry, r: cx + rx, b: cy + ry};
  };
  const clipRect = e => {                          // what every clipping ancestor (overflow, clip-path) and the stage leave visible, as a box
    let c = {l: SR.left, t: SR.top, r: SR.right, b: SR.bottom};
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) {
      const cs = getComputedStyle(x);
      if (x !== e && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible')) { const b = x.getBoundingClientRect(); c = inter(c, {l: b.left, t: b.top, r: b.right, b: b.bottom}); }
      const ca = clipArea(x, cs); if (ca) c = inter(c, ca);
      if (c.r <= c.l || c.b <= c.t) return null;
    }
    return c;
  };
  // ---- polygons: a rotated text's client rect is only its bounding box, so each text line becomes its real (rotated) quad ----
  const lin = e => {                               // linear part [a b c d] of every transform from e up to the page
    let L = [1, 0, 0, 1];
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) {
      const cs = getComputedStyle(x); let m = new DOMMatrix();
      if (cs.rotate && cs.rotate !== 'none' && /^-?[\d.]+deg$/.test(cs.rotate)) m = m.rotate(parseFloat(cs.rotate));
      if (cs.scale && cs.scale !== 'none') { const v = cs.scale.split(/\s+/).map(parseFloat); m = m.scale(v[0], v.length > 1 ? v[1] : v[0]); }
      if (cs.transform && cs.transform !== 'none') m = m.multiply(new DOMMatrix(cs.transform));
      L = [m.a * L[0] + m.c * L[1], m.b * L[0] + m.d * L[1], m.a * L[2] + m.c * L[3], m.b * L[2] + m.d * L[3]];
    }
    return L;
  };
  const quad = (q, L, fs) => {                     // client rect of one text line -> its glyph quad (cap top to a bit of descender)
    const k1 = Math.hypot(L[0], L[1]) || 1, k2 = Math.hypot(L[2], L[3]) || 1, ux = [L[0] / k1, L[1] / k1], uy = [L[2] / k2, L[3] / k2];
    const W = q.right - q.left, H = q.bottom - q.top, cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
    let w = W, h = H; const sn = Math.abs(ux[1]), cn = Math.abs(ux[0]), den = cn * cn - sn * sn;
    if (sn > 0.02 && Math.abs(den) > 0.2) { w = (W * cn - H * sn) / den; h = (H * cn - W * sn) / den; }
    const f = fs * k2, y0 = h > f * 0.9 ? -h / 2 + f * 0.2 : -h / 2, y1 = h > f * 0.9 ? h / 2 - f * 0.15 : h / 2;
    const P = (x, y) => [cx + ux[0] * x + uy[0] * y, cy + ux[1] * x + uy[1] * y];
    return [P(-w / 2, y0), P(w / 2, y0), P(w / 2, y1), P(-w / 2, y1)];
  };
  const polyArea = P => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
  const cutBy = (P, Q) => {                        // the part of polygon P inside convex polygon Q (Sutherland-Hodgman)
    let o = 0; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; o += a[0] * b[1] - b[0] * a[1]; } const sg = o >= 0 ? 1 : -1;
    for (let i = 0; i < Q.length && P.length; i++) {
      const a = Q[i], b = Q[(i + 1) % Q.length], d = p => sg * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])), out = [];
      for (let j = 0; j < P.length; j++) { const p = P[j], q = P[(j + 1) % P.length], dp = d(p), dq = d(q);
        if (dp >= 0) out.push(p); if ((dp >= 0) !== (dq >= 0)) { const t = dp / (dp - dq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); } }
      P = out;
    }
    return P;
  };
  const box = r => [[r.l, r.t], [r.r, r.t], [r.r, r.b], [r.l, r.b]];
  const words = e => (e.textContent || '').trim().replace(/\s+/g, ' ');
  const label = e => { const s = words(e).slice(0, 30); return (e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '')) + (s ? ' "' + s + '"' : ''); };
  const block = e => { let x = e; while (x.parentElement && x !== stage && getComputedStyle(x).display.startsWith('inline')) x = x.parentElement; return x; };
  // ---- text blocks ----
  const groups = new Map();
  for (const el of stage.querySelectorAll('*')) {
    if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT') continue;
    const tns = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    if (!tns.length || ignored(el) || el.closest('canvas')) continue;      // text inside <canvas layoutsubtree> is the canvas's source, not on screen
    const cs = getComputedStyle(el);
    const cm = cs.color.match(/rgba\([^)]*,\s*([\d.]+)\)$/), plainInk = parseFloat(cs.webkitTextStrokeWidth || 0) === 0 && (cs.webkitBackgroundClip || cs.backgroundClip) !== 'text';
    if (effOp(el) < 0.15 || (plainInk && (cm ? parseFloat(cm[1]) : 1) * effOp(el) < 0.15)) continue;   // transparent text shows nothing; faint text
                                                             // (ink x opacity < 0.15: watermark, background type such as text/emphasis-type) is texture, not read
    const fs = parseFloat(cs.fontSize) || 16, cr = clipRect(el); if (!cr) continue;
    const L = lin(el), pieces = [];
    for (const tn of tns) { const rg = document.createRange(); rg.selectNode(tn);
      for (const q of rg.getClientRects()) {
        const Q = quad(q, L, fs), poly = cutBy(Q, box(cr)); if (polyArea(poly) <= 4) continue;
        const lm = [(Q[0][0] + Q[3][0]) / 2, (Q[0][1] + Q[3][1]) / 2], rm = [(Q[1][0] + Q[2][0]) / 2, (Q[1][1] + Q[2][1]) / 2];
        const pts = [0.5, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map(f => [lm[0] + f * (rm[0] - lm[0]), lm[1] + f * (rm[1] - lm[1])]).filter(p => p[0] >= cr.l && p[0] <= cr.r && p[1] >= cr.t && p[1] <= cr.b);
        pieces.push({poly, pts}); } }
    if (!pieces.length) continue;
    const key = block(el), g = groups.get(key) || {el: key, pieces: [], scene: sceneOf(key), op: 0, fs: 0};
    g.pieces.push(...pieces); g.op = Math.max(g.op, effOp(el)); g.fs = Math.max(g.fs, fs * Math.hypot(L[2], L[3])); groups.set(key, g);
  }
  const items = [...groups.values()];
  const issues = [];
  const tot = it => it.pieces.reduce((s, p) => s + polyArea(p.poly), 0);
  // ---- text covered by something painted above it ----
  const alpha = c => { if (c === 'transparent') return 0; const s = c.match(/\/\s*([\d.]+)(%?)\s*\)$/); if (s) return parseFloat(s[1]) / (s[2] ? 100 : 1);
    const m = c.match(/[\d.]+/g); return !m ? 0 : m.length > 3 ? parseFloat(m[3]) : 1; };
  const seeThrough = cs => {                       // painted only by gradients whose colours are all mostly transparent (glows, gloss sweeps)
    if (alpha(cs.backgroundColor) >= 0.5 || /url\(/.test(cs.backgroundImage)) return false;
    const cols = cs.backgroundImage.match(/(?:rgba?|color|hsla?|oklch|oklab|lab|lch)\([^)]*\)|transparent/g) || [];
    return cols.length > 0 && cols.every(c => alpha(c) < 0.8);
  };
  const paints = e => {
    if (['IMG', 'VIDEO', 'CANVAS'].includes(e.tagName)) return true;
    if (e instanceof SVGGeometryElement || e instanceof SVGTextElement) return true;      // hit testing on SVG shapes is paint-exact
    if (e instanceof SVGElement) return false;
    const cs = getComputedStyle(e);
    if ((cs.webkitMaskImage && cs.webkitMaskImage !== 'none') || (cs.maskImage && cs.maskImage !== 'none')) return false;   // a mask (outline drawn on
    // the border only): hit testing sees the whole box, the paint is somewhere inside it, so it is not counted as a cover
    if (/^radial-gradient/.test(cs.backgroundImage) && !/(linear|conic)-gradient|url\(/.test(cs.backgroundImage) && alpha(cs.backgroundColor) < 0.5
        && !(e.textContent || '').trim()) return false;                  // a glow / flash / lens flare: light, not a panel
    return alpha(cs.backgroundColor) >= 0.5 || (cs.backgroundImage !== 'none' && !seeThrough(cs));
  };
  const overlay = e => { const cs = getComputedStyle(e); if (cs.mixBlendMode !== 'normal') return true;
    if (e instanceof SVGGeometryElement && (cs.fill === 'none' || alpha(cs.fill) === 0)) {   // a stroke only (underline, strike, circle mark)
      const m = e.getScreenCTM(), k = m ? Math.hypot(m.a, m.b) : 1; if (parseFloat(cs.strokeWidth) * k <= 0.012 * Math.min(SR.width, SR.height)) return true; }
    const b = e.getBoundingClientRect();
    const th = Math.min(b.width, b.height), ln = Math.max(b.width, b.height);   // a line (divider, rule, wipe edge) crossing text leaves it readable:
    if (th <= 6 || (th <= 0.012 * Math.min(SR.width, SR.height) && ln >= 15 * th)) return true;   // up to 1.2 % of the frame thick, 15x as long
    if (ln <= 0.012 * Math.min(SR.width, SR.height)) return true;     // a speck (particle, sparkle, confetti) passing over text: still readable
    if (b.width * b.height >= 0.85 * SA && !(e.textContent || '').trim()) return true;   // a full-frame layer with no text: fade, flash, grain, effect
                                                                                          // (flashes are kit.py qa's job)
    return b.width * b.height >= 0.85 * SA && alpha(cs.backgroundColor) < 0.5 && /gradient/.test(cs.backgroundImage) && !['IMG', 'VIDEO', 'CANVAS'].includes(e.tagName); };
  // ---- text vs text ----
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j];
    if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
    if (inTrans && A.scene !== B.scene) continue;
    let ov = 0, big = null, bigA = 0;
    for (const a of A.pieces) for (const b of B.pieces) { const P = cutBy(a.poly, b.poly), ar = polyArea(P); ov += ar; if (ar > bigA) { bigA = ar; big = P; } }
    const m = Math.min(tot(A), tot(B)); if (ov < 60 || ov / m < 0.12) continue;
    if (words(A.el) === words(B.el) && ov / m >= 0.6) continue;      // stacked copies of one text: a deliberate effect
    if (A.op + B.op <= 1.15) continue;                              // a cross-fade of two labels (Follow -> Following): one is on its way out
    // the lower text hidden there by a panel between the two (a phone sliding over another): not text on text ("covered" reports it if it shows)
    const cx = big.reduce((s, p) => s + p[0], 0) / big.length, cy = big.reduce((s, p) => s + p[1], 0) / big.length, list = document.elementsFromPoint(cx, cy);
    const ia = list.findIndex(e => A.el === e || A.el.contains(e)), ib = list.findIndex(e => B.el === e || B.el.contains(e));
    if (ia >= 0 && ib >= 0) { const lo = ia > ib ? A : B, i0 = Math.min(ia, ib), i1 = Math.max(ia, ib);
      if (list.slice(i0 + 1, i1).some(e => !e.contains(lo.el) && stage.contains(e) && e !== stage && effOp(e) >= 0.2 && paints(e) && !overlay(e))) continue; }
    issues.push({kind: 'text-text', a: label(A.el), b: label(B.el), ratio: +(ov / m).toFixed(2)});
  }
  // covered: the topmost painted thing above the text at each sample point, named by its outermost painted ancestor that does not hold
  // the text (a phone, not its screen); "full" = every point of the text is under it (hidden), else the text shows in part.
  // Not while a transition runs: the incoming scene's own carriers (curtain folds, wipe panels) cover it by design.
  // a picture covers a point only where its own pixels are opaque there (a product PNG's transparent margin is not a cover; test 07/10/2026)
  const AC = window.__aimkAlpha = window.__aimkAlpha || new Map();
  // a picture that is rotated / skewed / scaled (itself or a parent) is read where the point falls in its OWN box, not in its bounding box
  // (KI-08: a tilted product PNG was read a few px off). The 2D transforms of the element and its parents are undone: each one is set to
  // none for a moment to measure the boxes, then the matrices are composed outermost first around their origins. 3D: the bounding box.
  const MC = new Map();
  const local = (e, x, y) => {
    let r = MC.get(e);
    if (r === undefined) {
      r = null;
      const chain = [];
      for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const s = getComputedStyle(a); if (s.transform && s.transform !== 'none') chain.push([a, s.transform, s.transformOrigin]); }
      if (chain.length) {
        const saved = chain.map(([a]) => [a.style.getPropertyValue('transform'), a.style.getPropertyPriority('transform')]);
        chain.forEach(([a]) => a.style.setProperty('transform', 'none', 'important'));
        const rects = chain.map(([a]) => a.getBoundingClientRect()), b = e.getBoundingClientRect();
        chain.forEach(([a], i) => { if (saved[i][0]) a.style.setProperty('transform', saved[i][0], saved[i][1]); else a.style.removeProperty('transform'); });
        let M = new DOMMatrix();
        for (let i = chain.length - 1; i >= 0 && M; i--) {
          const T = new DOMMatrix(chain[i][1]), o = chain[i][2].split(' ').map(parseFloat), ox = rects[i].left + o[0], oy = rects[i].top + o[1];
          M = T.is2D ? M.translate(ox, oy).multiply(T).translate(-ox, -oy) : null;
        }
        if (M) r = {inv: M.inverse(), b: {left: b.left, top: b.top, width: b.width, height: b.height}};
      }
      MC.set(e, r);
    }
    if (!r) return {x, y, b: e.getBoundingClientRect()};
    const p = r.inv.transformPoint(new DOMPoint(x, y)); return {x: p.x, y: p.y, b: r.b};
  };
  const imgAlpha = (e, x0, y0) => {
    if (e.tagName !== 'IMG' || !e.naturalWidth) return 1;
    try {
      let d = AC.get(e.currentSrc || e.src);
      if (!d) { const c = document.createElement('canvas'); c.width = e.naturalWidth; c.height = e.naturalHeight; const g = c.getContext('2d', {willReadFrequently: true});
        g.drawImage(e, 0, 0); d = {w: c.width, h: c.height, a: g.getImageData(0, 0, c.width, c.height).data};
        if (AC.size > 12) AC.delete(AC.keys().next().value); AC.set(e.currentSrc || e.src, d); }
      const {x, y, b} = local(e, x0, y0), fit = getComputedStyle(e).objectFit;
      let L0 = b.left, T0 = b.top, W0 = b.width, H0 = b.height;
      if (fit === 'contain' || fit === 'scale-down') { const k = Math.min(b.width / d.w, b.height / d.h); W0 = d.w * k; H0 = d.h * k; L0 += (b.width - W0) / 2; T0 += (b.height - H0) / 2; }
      const u = Math.floor((x - L0) / W0 * d.w), v = Math.floor((y - T0) / H0 * d.h);
      if (u < 0 || v < 0 || u >= d.w || v >= d.h) return 0;
      return d.a[(v * d.w + u) * 4 + 3] / 255;
    } catch (err) { return 1; }                      // not readable (another origin): counted as opaque, as before
  };
  // a canvas covers a point only where its pixels are opaque NOW (the light-sweep canvas of motion/image-sequence is see-through between
  // sweeps: "covered by #ph_img1" was a false report, lyric film test 07/10/2026). Read once per canvas per sample time. A WebGL canvas whose
  // buffer is already cleared reads as see-through.
  const CC = new Map();
  const canvasAlpha = (e, x0, y0) => {
    if (e.tagName !== 'CANVAS' || !e.width || !e.height) return 1;
    try {
      let d = CC.get(e);
      if (!d) { const c = document.createElement('canvas'); c.width = e.width; c.height = e.height; const g = c.getContext('2d', {willReadFrequently: true});
        g.drawImage(e, 0, 0); d = {w: c.width, h: c.height, a: g.getImageData(0, 0, c.width, c.height).data}; CC.set(e, d); }
      const {x, y, b} = local(e, x0, y0);
      const u = Math.floor((x - b.left) / b.width * d.w), v = Math.floor((y - b.top) / b.height * d.h);
      if (u < 0 || v < 0 || u >= d.w || v >= d.h) return 0;
      return d.a[(v * d.w + u) * 4 + 3] / 255;
    } catch (err) { return 1; }
  };
  if (!inTrans) for (const it of items) {
    const covers = new Map(); let total = 0, hit = 0;
    for (const pc of it.pieces) for (const [x, y] of pc.pts) {
      const list = document.elementsFromPoint(x, y);
      const idx = list.findIndex(e => e === it.el || it.el.contains(e)); if (idx < 0) continue;
      total++;
      let first = null, opaque = false;               // the topmost cover names the line; any opaque layer above the text hides it there
      for (let k = 0; k < idx; k++) {
        const e = list[k]; if (it.el.contains(e) || e.contains(it.el) || ignored(e)) continue;
        if (!stage.contains(e) || e === stage || effOp(e) < 0.2 || !paints(e) || overlay(e)) continue;
        if (e.tagName === 'IMG' && imgAlpha(e, x, y) < 0.3) continue;   // a see-through part of the picture
        if (e.tagName === 'CANVAS' && canvasAlpha(e, x, y) < 0.3) continue;   // a see-through part of a canvas at this time
        const cr = clipRect(e), b = e.getBoundingClientRect(); if (!cr || area(inter(cr, {l: b.left, t: b.top, r: b.right, b: b.bottom})) <= 0) continue;
        if (!first) first = e;
        if (effOp(e) >= 0.95 * it.op && (['IMG', 'VIDEO', 'CANVAS'].includes(e.tagName) || e instanceof SVGElement || alpha(getComputedStyle(e).backgroundColor) >= 0.95)) { opaque = true; break; }
      }
      if (first) {
        let top = first;
        for (let x2 = first.parentElement; x2 && x2 !== stage && !x2.contains(it.el); x2 = x2.parentElement) if (!ignored(x2) && effOp(x2) >= 0.2 && paints(x2) && !overlay(x2)) top = x2;
        covers.set(top, (covers.get(top) || 0) + (opaque ? 1 : 0)); if (opaque) hit++;
      }
    }
    for (const [top, n] of covers) if (words(top) !== words(it.el)) {     // a cover that carries the same text is another copy of it (mosaic tiles, glow layers)
      // the user's rule (07/10/2026): text under the product is fine while it stays big and clearly readable: a picture hiding at most 15 % of
      // a line of 60 px or more is a note to check on the stills, not a collision
      const pic = top.tagName === 'IMG' || top.tagName === 'VIDEO' || top.tagName === 'CANVAS' || !!top.querySelector('img,video,canvas');
      const share = total ? n / total : 0;
      issues.push({kind: pic && share <= 0.15 && it.fs >= 60 ? 'under' : 'covered', a: label(it.el), b: label(top), ratio: +share.toFixed(2), full: hit === total});
    }
  }
  // ---- text outside the safe margin (fully visible text only: an entrance from off the frame is a short run, the report skips runs < 0.25 s) ----
  for (const it of items) {
    if (it.op < 0.9) continue;
    const P = it.pieces.flatMap(pc => pc.poly), l = Math.min(...P.map(q => q[0])), r = Math.max(...P.map(q => q[0])), tp = Math.min(...P.map(q => q[1])), bt = Math.max(...P.map(q => q[1]));
    const out = {left: SR.left + M - l, right: r - (SR.right - M), top: SR.top + M - tp, bottom: bt - (SR.bottom - M)};
    const side = Object.entries(out).filter(([, v]) => v > 2).map(([k, v]) => `${k} ${Math.round(v)} px`);
    if (side.length) issues.push({kind: 'margin', a: label(it.el), b: side.join(', '), ratio: null, margin: M});
  }
  return {issues};
}
"""

# a scene shows when it is visible, its own and its .inner opacity are above 0.01 and its inner box is still on the frame
VIS_JS = r"""(sel) => { const st = document.querySelector(sel), S = st.getBoundingClientRect();
  return [...st.querySelectorAll(':scope > .scene')].some(s => { const cs = getComputedStyle(s); if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    let o = parseFloat(cs.opacity); const inn = s.querySelector(':scope > .inner') || s; if (inn !== s) o *= parseFloat(getComputedStyle(inn).opacity);
    const b = inn.getBoundingClientRect(); return o > 0.01 && b.right > S.left + 2 && b.left < S.right - 2 && b.bottom > S.top + 2 && b.top < S.bottom - 2; }); }"""

SCENES_JS = r"""(sel) => [...document.querySelector(sel).querySelectorAll(':scope > .scene')].map(e => [e.dataset.name || e.id, +e.dataset.start || 0, +e.dataset.duration || 0])"""


async def _collide(url, step, fps):
    from playwright.async_api import async_playwright
    from render.browser import open_film
    async with async_playwright() as p:
        b, pg, info = await open_film(p, url)
        await pg.add_style_tag(content=info["stage"] + " *{pointer-events:auto!important}")   # hit testing must see every element
        sel, dur = info["stage"], info["duration"]
        scenes = await pg.evaluate(SCENES_JS, sel)
        runs, open_runs, n = [], {}, 0
        for i in range(int(dur / step + 1e-9) + 1):
            t = round(i * step, 4)
            await pg.evaluate(f"window.__aimk.seek({t})")
            res = await pg.evaluate(JS, [t, sel])
            if res.get("err"): raise SystemExit("collide: " + res["err"])
            now = set()
            for it in res["issues"]:
                k = (it["kind"], it["a"], it["b"]); now.add(k)
                if k in open_runs:
                    r = open_runs[k]; r["t1"] = t; r["ratio"] = max(r["ratio"] or 0, it["ratio"] or 0) or None
                else:
                    open_runs[k] = r = {"kind": it["kind"], "a": it["a"], "b": it["b"], "t0": t, "t1": t, "ratio": it["ratio"]}
                if it["kind"] in ("covered", "under"): r["partly"] = r.get("partly", False) or not it.get("full")
            for k in [k for k in open_runs if k not in now]: runs.append(open_runs.pop(k))
            n += 1
        runs += list(open_runs.values())
        blank, last = [], int(round(dur * fps)) - 1
        frames = sorted({f + k for _, at, d in scenes for e in (at, at + d) for f in [int(round(e * fps))] for k in (-1, 0, 1)})
        for f in frames:
            if f < 1 or f > last: continue
            await pg.evaluate(f"window.__aimk.seek({f / fps})")
            if not await pg.evaluate(VIS_JS, sel): blank.append(round(f / fps, 4))
        errs = info.get("page_errors") or []
        await b.close()
    scene_at = lambda x: next((nm for nm, at, d in reversed(scenes) if at - 1e-6 <= x < at + d), "?")
    for r in runs: r["scene"] = scene_at(r["t0"])
    runs.sort(key=lambda r: (r["t0"], r["kind"]))
    return {"url": url, "step": step, "samples": n, "duration": dur, "collisions": runs, "blank_frames": blank, "page_errors": errs[:3]}


def collide(url, step=0.05, fps=60, out_json=None):
    res = asyncio.run(_collide(url, step, fps))
    if out_json:
        Path(out_json).parent.mkdir(parents=True, exist_ok=True)
        Path(out_json).write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")
    return res


def report(res, say=print):
    notes = [r for r in res["collisions"] if r["kind"] == "under"]
    margin = [r for r in res["collisions"] if r["kind"] == "margin" and r["t1"] - r["t0"] >= 0.25 - 1e-6]
    runs = [r for r in res["collisions"] if r["kind"] not in ("under", "margin")]
    say(f"collide: {res['samples']} samples every {res['step']} s over {res['duration']:.2f} s, {len(runs)} collision run(s)")
    lines, cover = [], {}
    for r in runs:                                         # text on text: one line each; covered: one line per cover (all the texts it hides)
        if r["kind"] == "covered":
            g = cover.setdefault((r["scene"], r["b"]), {"t0": r["t0"], "t1": r["t1"], "a": [], "partly": False})
            g["t0"] = min(g["t0"], r["t0"]); g["t1"] = max(g["t1"], r["t1"]); g["partly"] = g["partly"] or r.get("partly", False)
            if r["a"] not in g["a"]: g["a"].append(r["a"])
        else:
            lines.append((r["t0"], f"  {r['t0']:.2f}-{r['t1']:.2f}s [{r['scene']}] text-text: {r['a']}  <>  {r['b']} overlap {int((r['ratio'] or 0) * 100)}%"))
    for (sc, b), g in cover.items():
        a = ", ".join(g["a"][:6]) + (f" and {len(g['a']) - 6} more" if len(g["a"]) > 6 else "")
        how = "covered by" if g["partly"] else "hidden behind (all of it, never in part)"
        lines.append((g["t0"], f"  {g['t0']:.2f}-{g['t1']:.2f}s [{sc}] {how} {b}: {a}"))
    for _, ln in sorted(lines, key=lambda x: x[0]): say(ln)
    if not runs: say("  none found (geometry only: still judge fast moves and wipes by eye)")
    for r in notes: say(f"  note {r['t0']:.2f}-{r['t1']:.2f}s [{r['scene']}] under a picture, at most {int((r['ratio'] or 0) * 100)}% hidden (allowed when big and "
                        f"readable: look at a still): {r['a']} under {r['b']}")
    for r in margin: say(f"  margin {r['t0']:.2f}-{r['t1']:.2f}s [{r['scene']}] outside the safe margin ((w+h)/55): {r['a']} ({r['b']})")
    bl = res["blank_frames"]
    say(f"blank frames at scene cuts: {len(bl)}" + (": " + ", ".join(f"{x:.3f}s" for x in bl[:20]) if bl else ""))
    if res.get("page_errors"): say("film page error: " + res["page_errors"][0])
    return bool(runs or bl)
