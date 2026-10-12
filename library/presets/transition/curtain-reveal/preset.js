/* transition/curtain-reveal: two pleated stage curtains close over the outgoing scene, then gather outward (folds narrow hardest at the outer edge,
   the hem sweeps up slightly) and reveal the incoming scene; a warm spotlight blooms as they part (targets: [out inner, in inner]).
   Port of HyperFrames registry component curtain-reveal. Source values: 11 folds per curtain (fixed width tables, sum 1075 px at 1920), fold scale
   sx = 1 - p(0.86 - 0.16u), sy = 1 - 0.07 p u^2, shade 0.34(1 - sx), p = power2.inOut over 1.1 s; every fold pose is linear in p, so each fold is one
   literal tween. Spotlight 0 -> 0.9 over 0.75 x draw starting at 0.25 x draw (power1.out); pelmet static (11 % high, scalloped hem).
   Added for a scene change (the source starts on closed curtains): the curtains fade in over `cover` s, and curtains + spotlight fade out over the last
   `out` s. params.duration = cover + draw + out (default 0.3 + 1.1 + 0.3 = 1.7 s). */
AIMK.preset("transition/curtain-reveal", { params: { duration: 1.7, cover: 0.3, out: 0.3, tone: "burgundy", pelmet: true, spotlight: true },
  build(tl, els, p, ctx) {
    const [a, b] = els, sc = b.parentElement, W = ctx.W, H = ctx.H, cw = W / 100, ch = H / 100, qm = Math.min(W, H) / 100, k = W / 1920;
    const TONES = { red: { f: ["#3d0810", "#8a1a26", "#b23345", "#cc5c6e"], pel: "#4a0e1a" }, burgundy: { f: ["#2b0912", "#5c1a2c", "#7d2c42", "#a04c62"], pel: "#3a0f1e" },
      navy: { f: ["#070d1f", "#152a5c", "#274a8f", "#4f72b4"], pel: "#0c1836" }, forest: { f: ["#0c1f13", "#1f4a2b", "#356b3f", "#5c9166"], pel: "#12291a" } };
    const tn = TONES[p.tone] || TONES.burgundy, cover = p.cover, out = p.out, draw = Math.max(0.2, +(p.duration - cover - out).toFixed(4));
    const t0 = +(p.at + cover).toFixed(4), tEnd = +(p.at + cover + draw).toFixed(4);
    const px = v => +v.toFixed(2) + "px";
    ctx.css("transition/curtain-reveal", `
.cvr-cv { position: absolute; inset: 0; opacity: 0; pointer-events: none; will-change: transform, opacity; }
.cvr-curtain { position: absolute; inset: 0; }
.cvr-fold { position: absolute; top: 0; left: 0; height: 100%; transform-origin: 0 0; border-radius: 0 0 50% 50% / 0 0 ${px(1.6 * ch)} ${px(1.6 * ch)}; }
.cvr-shade { position: absolute; inset: 0; border-radius: inherit; background: rgba(0,0,0,0); }
.cvr-r .cvr-fold { left: auto; right: 0; transform-origin: 100% 0; }
.cvr-last { box-shadow: ${px(1.2 * cw)} 0 ${px(2.4 * cw)} rgba(0,0,0,0.55); }
.cvr-r .cvr-last { box-shadow: ${px(-1.2 * cw)} 0 ${px(2.4 * cw)} rgba(0,0,0,0.55); }
.cvr-pelmet { position: absolute; top: 0; left: 0; right: 0; height: 11%; box-shadow: 0 ${px(0.6 * qm)} ${px(1.4 * qm)} rgba(0,0,0,0.55); }
.cvr-spot { position: absolute; inset: 0; pointer-events: none; opacity: 0; mix-blend-mode: screen; background: radial-gradient(34% 52% at 50% 44%, rgba(255,196,128,0.42) 0%, rgba(255,196,128,0) 72%); }`);
    const seen = new Set(), ft = (el, f, to, at) => { if (seen.has(el)) to = Object.assign({ immediateRender: false }, to); seen.add(el); tl.fromTo(el, f, to, at); };
    const spot = p.spotlight ? ctx.make(sc, "div", "cvrspot", { cls: "cvr-spot" }) : null;
    const cv = ctx.make(sc, "div", "cvrcv", { cls: "cvr-cv" });
    const curtain = (name, dir, widths) => {
      const host = ctx.make(cv, "div", name, { cls: "cvr-curtain" + (dir < 0 ? " cvr-r" : "") });
      const total = widths.reduce((x, y) => x + y, 0) * k;
      let x0 = 51 * cw - total, x1 = x0;
      widths.forEach((w0, i) => {
        const u = i / (widths.length - 1), w = w0 * k, crest = 44 + ((i * 5) % 13);
        const bg = `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.5) 100%), linear-gradient(90deg, ${tn.f[0]} 0%, ${tn.f[1]} 20%, ${tn.f[2]} ${crest - 14}%, ${tn.f[3]} ${crest}%, ${tn.f[2]} ${crest + 10}%, ${tn.f[1]} 80%, ${tn.f[0]} 100%)`;
        const fold = ctx.make(host, "div", "f" + i, { cls: "cvr-fold" + (i === widths.length - 1 ? " cvr-last" : ""), style: { width: px(w + 0.2 * cw), background: bg } });
        const shade = ctx.make(fold, "div", "sh", { cls: "cvr-shade" });
        const sx = 1 - (0.86 - 0.16 * u), sy = 1 - 0.07 * u * u;
        ft(fold, { x: +(dir * x0).toFixed(2), scaleX: 1, scaleY: 1 }, { x: +(dir * x1).toFixed(2), scaleX: +sx.toFixed(4), scaleY: +sy.toFixed(4), duration: draw, ease: "power2.inOut" }, t0);
        ft(shade, { backgroundColor: "rgba(0,0,0,0)" }, { backgroundColor: `rgba(0,0,0,${+(0.34 * (1 - sx)).toFixed(3)})`, duration: draw, ease: "power2.inOut" }, t0);
        x0 += w; x1 += w * sx;
      });
    };
    curtain("cl", 1, [88, 124, 70, 106, 136, 80, 112, 62, 98, 130, 69]);
    curtain("cr", -1, [104, 66, 128, 84, 120, 62, 100, 134, 76, 112, 89]);
    if (p.pelmet) {
      const pts = ["0% 0%", "100% 0%"];
      for (let i = 0; i <= 24; i++) { const q = i / 24; pts.push((100 - q * 100).toFixed(2) + "% " + (78 + Math.sin(q * Math.PI * 5) * 14).toFixed(2) + "%"); }
      ctx.make(cv, "div", "pelmet", { cls: "cvr-pelmet", style: { background: tn.pel, clipPath: `polygon(${pts.join(", ")})` } });
    }
    if (cover > 0) tl.set(b, { opacity: 0, ease: "none" }, p.at);
    tl.set(b, { opacity: 1, ease: "none" }, t0);
    ft(cv, { opacity: 0 }, { opacity: 1, duration: cover || 0.001, ease: "power1.out" }, p.at);
    ft(cv, { opacity: 1 }, { opacity: 0, duration: out, ease: "power2.in" }, +(tEnd).toFixed(4));
    if (spot) {
      const ss = +(0.25 * draw).toFixed(4), sd = +(0.75 * draw).toFixed(4);
      ft(spot, { opacity: 0 }, { opacity: 0.9, duration: sd, ease: "power1.out" }, +(t0 + ss).toFixed(4));
      ft(spot, { opacity: 0.9 }, { opacity: 0, duration: out, ease: "power2.in" }, tEnd);
    }
  },
});
