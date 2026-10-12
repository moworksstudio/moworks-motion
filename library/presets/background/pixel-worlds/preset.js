/* background/pixel-worlds: an arcade world of 64 px pixel cells, drawn on one canvas as a pure function of film time. A new world
   arrives as a wave of cells flipping from an origin (a product, a word), cell by cell; a world may be a checkerboard of two colours.
   Pulses: a ring of lit cells running out from a point (on hits). Also: grid lines drifting diagonally, pixel stairs in the corners
   stepping on the downbeats, plus-shaped sparkles that twinkle on the beat only in free space (keep-outs). Before the first world the
   frame is black. Written for a studio 8-bit lyric film (08/10/2026).
   params: worlds [{t, A, B?, ox, oy (cells), sp (cells / s; 0 = cut)}], pulses [[t, ox, oy, colour]], downs [t], keep [[t0, t1, x, y, w, h]],
           sparks (count), stairs [4 colours], spark_dark / spark_light (2 sparkle colours on dark / light worlds), dur */
AIMK.preset("background/pixel-worlds", { params: { worlds: [], pulses: [], beats: [], downs: [], keep: [], sparks: 34, stairs: ["#7CC4FF", "#EF476F", "#FFD166", "#06D6A0"], spark_dark: ["#FFFFFF", "#7CC4FF"], spark_light: ["#2B2B3A", "#3A3A8C"], dur: 51 },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el, "bgc");
    let cv = el.querySelector("canvas");
    if (!cv) { cv = document.createElement("canvas"); cv.width = 1920; cv.height = 1080; cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:pixelated"; el.appendChild(cv); }
    ctx.id(cv, el.id + "_cv");
    const v = "bgc_" + el.id.replace(/\W/g, "_");
    const P = { W: p.worlds, PU: p.pulses, B: p.beats, D: p.downs, K: p.keep, N: p.sparks, ST: p.stairs, SD: p.spark_dark, SL: p.spark_light };
    ctx.code(String.raw`  // background/pixel-worlds: pixel worlds arriving as waves of flipping cells, pulses, stairs, sparkles (one canvas, a pure function of film time)
  const ${v} = { t: 0, P: ${JSON.stringify(P)} };
  ${v}.draw = T => {
    const cv = document.getElementById(${JSON.stringify(cv.id)}); if (!cv) return; const g = cv.getContext("2d"), P = ${v}.P;
    const C = 64, NX = 30, NY = 17;
    const hash = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const lum = h => { const n = parseInt(h.slice(1), 16), r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255; return 0.2126 * r + 0.7152 * gg + 0.0722 * b; };
    const col = (w, i, j) => (w.B && (i + j) % 2) ? w.B : w.A;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = "#000"; g.fillRect(0, 0, 1920, 1080);
    if (!P.W.length || T < P.W[0].t) return;              // before the first world: black
    const arr = (w, i, j) => w.sp > 0 ? w.t + Math.hypot(i + 0.5 - w.ox, j + 0.5 - w.oy) / w.sp + hash(i * 37 + j * 91 + w.t) * 0.05 : w.t;
    const SX = T * 22, SY = T * 11, FX = Math.floor(SX / C), FY = Math.floor(SY / C), OX = SX - FX * C, OY = SY - FY * C;   // the grid drifts diagonally (always moving)
    for (let j = -1; j <= NY; j++) for (let i = -1; i <= NX; i++) {
      let k = -1, ka = 0;
      for (let q = 0; q < P.W.length; q++) { const a = arr(P.W[q], i, j); if (T >= a) { k = q; ka = a; } }
      if (k < 0) continue;
      const cur = col(P.W[k], i + FX, j + FY), x = i * C - OX, y = j * C - OY, e = T - ka;
      if (e < 0.09 && k > 0) {                                     // the cell flips: old colour, the new one popping from its centre in 3 steps
        g.fillStyle = col(P.W[k - 1], i + FX, j + FY); g.fillRect(x, y, C, C);
        const s = [0.35, 0.7, 1][Math.min(2, Math.floor(e / 0.03))] * C; g.fillStyle = cur; g.fillRect(x + (C - s) / 2, y + (C - s) / 2, s, s);
      } else { g.fillStyle = cur; g.fillRect(x, y, C, C); }
    }
    // pulses: a ring of lit cells running out from a point
    for (const [pt, ox, oy, pc] of P.PU) { const e = T - pt; if (e < 0 || e > 0.7) continue; if (P.W.some(w => w.sp > 0 && Math.abs(w.t - pt) < 0.15)) continue; const r = e * 26;
      g.fillStyle = pc;
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const d = Math.hypot(i + 0.5 - ox, j + 0.5 - oy) - r; if (d < 0 && d > -1.2) { g.globalAlpha = 0.55 * (1 - e / 0.7); g.fillRect(i * C + 6, j * C + 6, C - 12, C - 12); } }
      g.globalAlpha = 1; }
    // grid lines: white on dark worlds, black on light ones (by the colour under the centre)
    const dark = (() => { let k = 0; for (let q = 0; q < P.W.length; q++) if (T >= P.W[q].t) k = q; return lum(P.W[k] ? P.W[k].A : "#000000") < 140; })();
    // round 1 (user): the background jolts only on the downbeats, softer, and not while a world wave runs (the wave is its beat there)
    const quiet = P.W.some(w => w.sp > 0 && T >= w.t - 0.1 && T < w.t + 0.8);
    let lb = -9; for (const b of P.D) { if (b <= T) lb = b; else break; } const kick = (!quiet && T - lb < 0.5) ? Math.exp(-(T - lb) / 0.13) : 0;
    g.fillStyle = dark ? "rgba(255,255,255," + (0.08 + 0.12 * kick).toFixed(3) + ")" : "rgba(0,0,0," + (0.12 + 0.1 * kick).toFixed(3) + ")";
    for (let i = 0; i <= NX; i++) g.fillRect(i * C - OX - 1, 0, 2, 1080);
    for (let j = 0; j <= NY; j++) g.fillRect(0, j * C - OY - 1, 1920, 2);
    // pixel stairs in the corners: 2 to 4 steps, one more on every downbeat (a stepped bounce)
    let db = 0; for (const d of P.D) if (T >= d) db++;
    const n = 2 + (db % 3);
    const stairs = (cx, cy, sx, sy, c) => { g.fillStyle = c; g.globalAlpha = 0.62;
      for (let a = 0; a < n; a++) for (let b = 0; b < n - a; b++) g.fillRect(cx + sx * a * C - (sx < 0 ? C : 0), cy + sy * b * C - (sy < 0 ? C : 0), C, C);
      g.globalAlpha = 1; };
    stairs(0, 0, 1, 1, P.ST[0]); stairs(1920, 0, -1, 1, P.ST[1]); stairs(0, 1088, 1, -1, P.ST[2]); stairs(1920, 1088, -1, -1, P.ST[3]);
    // sparkles: plus shapes of 8 px pixels, on for a beat, off for a beat, each its own phase; never inside the keep-outs (+60 px)
    let bt = 0; for (const b of P.D) if (T >= b) bt++;
    const act = P.K.filter(b => T >= b[0] && T <= b[1]);
    for (let s = 0; s < P.N; s++) {
      const tw = 0.45 + 0.45 * Math.sin(T * 3.1 + s * 1.9) + ((bt + s) % 3 === 0 ? -0.5 : 0); if (tw <= 0.05) continue;
      const x = Math.floor(hash(s + 7) * 236) * 8, y = Math.floor((((hash(s + 77) * 1080 - T * (24 + 20 * hash(s + 9))) % 1080) + 1080) % 1080 / 8) * 8;   // sparkles rise slowly
      let ok = true; for (const b of act) if (x > b[2] - 60 && x < b[2] + b[4] + 60 && y > b[3] - 60 && y < b[3] + b[5] + 60) { ok = false; break; }
      if (!ok) continue;
      g.fillStyle = dark ? P.SD[s % 2] : P.SL[s % 2]; g.globalAlpha = 0.85 * Math.min(1, tw);
      const z = 8 + Math.round(2 * kick);
      g.fillRect(x, y - z, z, z * 3); g.fillRect(x - z, y, z * 3, z);
    }
    g.globalAlpha = 1;
  };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => ${v}.draw(${p.at} + ${v}.t) }, ${p.at});`);
  } } });
