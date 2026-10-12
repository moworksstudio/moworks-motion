/* motion/image-sequence: a pre-rendered PNG / WebP sequence (a 3D product turning or opening: a common asset of product films) played and
   scrubbed by film time. Generalised from the test film's motion/f8-seq + motion/f8-rig (07/10/2026), where the user rejected two shortcuts:
     - blending the next picture over the last one to smooth a slow move: "ghost blur" (two phones at once). Never blend: play the render's own
       motion at an even cadence (1, 2 or 3 render frames per film frame) and hold only on the render's rest poses;
     - a picture that changes inside one exported frame: the render frame follows time SNAPPED to the film's frame grid (fps), so the
       export's motion-blur samples inside a frame all show the same picture.
   Target: an empty box (its size = the picture's size on screen). The preset puts an <img> in it (and a <canvas> for the light sweep).
   params (times in seconds from the motion's "at"; in a film-level layer "at" is a film time, so keys can follow the song):
     dir "assets/images/seq/f", digits 4, ext ".png" | ".webp", first 1, last (the sequence's last frame number)
     keys  [[t, frame, ease]]        the render frame over time (ease lin | in | out | io | sin; lin keeps an even cadence)
     pos   [[t, x, y, scale, ease]]  optional: the box's own move (px from where it sits, scale), also a pure function of time
     op    [[t, opacity, ease]]      optional
     float [px, period s], sway [deg, period s]   optional gentle life (sine waves of time)
     sweep [[t, duration, direction ±1]], band [width 0-1, peak 0-1, angle deg]   optional light band across the picture, cut to its own
           alpha (canvas source-in) and blended with screen; drawn after the picture decodes ("lightsweep mỗi lần nó rotate", test round 5)
     fps 60 (the kit's frame grid), end (seconds the motion drives; default the last key)
   Every new picture's decode() promise goes to window.__aimkSeekWaits: the kit's renderer, player and collide wait for it, so a frame is never
   captured with the previous picture. A picture that fails to load is asked for again (twice).
   source (optional): the client's original files for the AE port, e.g. "J:/.../product_render.####.png" (#### = the frame number, same
   numbering as dir): the port imports those at full size as ONE image-sequence footage with Time Remap keys, instead of the film's smaller
   WebP copies (user, 07/10/2026: "nạp toàn bộ các file vào AE làm chuỗi ảnh rồi dùng time remap"). Without it the port uses the film's files. */
AIMK.preset("motion/image-sequence", { params: { dir: "assets/images/seq/f", digits: 4, ext: ".png", first: 1, last: 9999, keys: [[0, 1, "lin"]], pos: null, op: null,
                                                 float: null, sway: null, sweep: [], band: [0.22, 0.78, -22], fps: 60, end: null, source: null },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el, "seq");
    if (p.source) el.setAttribute("data-aimk-source", p.source);      // read by the AE port (engine/ae/port.py): the originals at full size
    if (!el.querySelector("img")) { const im = document.createElement("img"); im.alt = ""; im.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block"; el.appendChild(im); }
    const img = el.querySelector("img"); ctx.id(img, el.id + "_img");
    let cv = el.querySelector("canvas");
    if ((p.sweep || []).length && !cv) { cv = document.createElement("canvas"); cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen;pointer-events:none"; el.appendChild(cv); }
    if (cv) ctx.id(cv, el.id + "_cv");
    const K = (p.keys || [[0, p.first]]).map(k => [+(+k[0]).toFixed(4), +(+k[1]).toFixed(3), k[2] || "lin"]);
    const last = Math.max(K[K.length - 1][0], ...(p.pos || []).map(k => k[0]), ...(p.op || []).map(k => k[0]), ...(p.sweep || []).map(s => s[0] + s[1]));
    const D = Math.max(0.0001, +(p.end != null ? p.end : last).toFixed(4));
    const name = f => p.dir + String(Math.min(p.last, Math.max(p.first, f))).padStart(p.digits, "0") + p.ext;
    img.setAttribute("src", name(Math.round(K[0][1])));
    const v = "q_" + el.id.replace(/\W/g, "_");
    const R = { K, pos: p.pos, op: p.op, fl: p.float, sw: p.sway, sweep: p.sweep || [], band: p.band, fps: p.fps, first: p.first, last: p.last };
    ctx.code(`  // image sequence in #${el.id}: render frame (and the box's own move) as pure functions of time, snapped to the ${p.fps} fps grid
  const ${v} = { t: 0, cur: -1, drawn: "", R: ${JSON.stringify(R)} };
  const ${v}ez = { lin: x => x, in: x => x * x * x, out: x => 1 - Math.pow(1 - x, 3), io: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, sin: x => -(Math.cos(Math.PI * x) - 1) / 2 };
  const ${v}at = (K, t) => { const val = k => k.slice(1, -1);          // keys are [t, values..., ease]
    if (t <= K[0][0]) return val(K[0]);
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const a = K[i - 1], b = K[i], A = val(a), B = val(b);
      const x = (${v}ez[b[b.length - 1]] || ${v}ez.lin)(Math.min(1, Math.max(0, (t - a[0]) / Math.max(1e-6, b[0] - a[0])))); return A.map((q, k) => q + (B[k] - q) * x); }
    return val(K[K.length - 1]); };
  tl.fromTo(${v}, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => {
    const R = ${v}.R, T = Math.round((${p.at} + ${v}.t) * R.fps) / R.fps - ${p.at}, el = document.getElementById(${JSON.stringify(el.id)});
    if (R.pos || R.fl || R.sw) {
      const [x, y, s] = R.pos ? ${v}at(R.pos, ${v}.t) : [0, 0, 1], A = ${p.at} + ${v}.t;
      const fy = R.fl ? R.fl[0] * Math.sin(2 * Math.PI * A / R.fl[1]) : 0, rot = R.sw ? R.sw[0] * Math.sin(2 * Math.PI * A / R.sw[1] + 1) : 0;
      el.style.transform = "translate(" + x.toFixed(2) + "px," + (y + fy).toFixed(2) + "px) rotate(" + rot.toFixed(3) + "deg) scale(" + s.toFixed(4) + ")";
    }
    if (R.op) el.style.opacity = ${v}at(R.op, ${v}.t)[0].toFixed(3);
    const f = Math.min(R.last, Math.max(R.first, Math.round(${v}at(R.K, T)[0] + 1e-6)));
    let sx = null;                                                   // the light band's centre across the picture (0..1), or none
    for (const [a, d, dir] of R.sweep) if (T >= a && T <= a + d) { const q = -(Math.cos(Math.PI * (T - a) / d) - 1) / 2; sx = dir > 0 ? q : 1 - q; }
    const im = document.getElementById(${JSON.stringify(img.id)}), cv = ${cv ? `document.getElementById(${JSON.stringify(cv.id)})` : "null"};
    const key = f + "|" + (sx === null ? "-" : sx.toFixed(4));
    const draw = () => { if (!cv || ${v}.drawn === key) return; ${v}.drawn = key;
      if (!cv.width || cv.width !== im.naturalWidth) { cv.width = im.naturalWidth || 400; cv.height = im.naturalHeight || 800; }
      const g = cv.getContext("2d"), w = cv.width, h = cv.height;
      g.globalCompositeOperation = "source-over"; g.clearRect(0, 0, w, h); if (sx === null) return;
      g.drawImage(im, 0, 0, w, h); g.globalCompositeOperation = "source-in";
      const [bw, peak, ang] = R.band, th = ang * Math.PI / 180, dx = Math.cos(th), dy = Math.sin(th), B = bw * w;
      const cx = -B + sx * (w + 2 * B), cy = h / 2, gr = g.createLinearGradient(cx - dx * B, cy - dy * B, cx + dx * B, cy + dy * B);
      gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255," + peak + ")"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h); };
    if (f !== ${v}.cur) { ${v}.cur = f; ${v}.drawn = "";
      const want = ${JSON.stringify(p.dir)} + String(f).padStart(${p.digits}, "0") + ${JSON.stringify(p.ext)}; im.src = want;
      // a picture that failed to load (a busy disk once showed a broken image in a verify pass, 07/10/2026) is asked for again, twice
      const ld = n => (im.decode ? im.decode() : Promise.resolve()).catch(() => { if (n > 0 && im.getAttribute("src") === want) { im.removeAttribute("src"); im.src = want; return ld(n - 1); } });
      (window.__aimkSeekWaits = window.__aimkSeekWaits || []).push(ld(2).then(draw).catch(() => {})); }
    else draw(); } }, ${p.at});`);
  } } });
