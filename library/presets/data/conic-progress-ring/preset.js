/* data/conic-progress-ring: a progress ring fills clockwise from the top while the centre number counts up in step with it (power2.out, 1.4 s).
   Port of HyperFrames registry component conic-progress-ring. BLOCK: the ring is built inside the target (an empty box, usually the whole frame).
   Source geometry: ring = min(68cqw, 68cqh) square, stroke = `thickness` % of the radius, centre text = min(18cqw, 18cqh), weight 700.
   The source fills a conic gradient; here the same ring is an SVG circle whose stroke-dashoffset is tweened (same angle, same ease), the number is a proxy.
   Exit (source: fade-out of the whole stage, 0.5 s power2.in, 4 s - 0.5 s): params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("data/conic-progress-ring", {
  params: { progress: 100, thickness: 12, label: "100", brand: "#35d6a0", surface: "#1b2938", fg: "#f4f7fb", exitAt: 3.5, fade: 0 },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, t = p.at, IN = 1.4, OUT = 0.5;
    const target = Math.max(0, Math.min(100, Number.isFinite(+p.progress) ? +p.progress : 100));
    const th = Math.max(4, Math.min(30, Number.isFinite(+p.thickness) ? +p.thickness : 12));
    const S = Math.round(0.68 * Math.min(W, H)), fs = +(0.18 * Math.min(W, H)).toFixed(1);
    const text = String(p.label == null ? "100" : p.label), m = text.trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/);
    const num = m ? Number(m[1]) : null, suf = m ? m[2] : "";
    ctx.css("data/conic-progress-ring", `
.cpr { position: absolute; inset: 0; display: grid; place-items: center; }
.cpr-stage { position: relative; aspect-ratio: 1; }
.cpr-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.cpr-label { position: absolute; inset: 0; display: grid; place-items: center; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.04em; line-height: 1; text-align: center; }`);
    for (const slot of els) {
      const box = ctx.make(slot, "div", "cpr", { cls: "cpr" });
      const stage = ctx.make(box, "div", "stage", { cls: "cpr-stage", style: { width: S + "px", height: S + "px" } });
      const r = (100 - th / 2).toFixed(2);
      const svg = ctx.make(stage, "div", "svg", { cls: "cpr-svg", html:
        `<svg viewBox="0 0 200 200" width="100%" height="100%" style="overflow:visible"><g transform="translate(100 100)">` +
        `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${p.surface}" stroke-width="${th}"/>` +
        `<circle id="${stage.id}_ring" cx="0" cy="0" r="${r}" fill="none" stroke="${p.brand}" stroke-width="${th}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90)"/></g></svg>` });
      const ring = document.getElementById(stage.id + "_ring");
      const label = ctx.make(stage, "div", "label", { cls: "cpr-label", text: num == null ? text : Math.round(0) + suf, style: { color: p.fg, fontSize: fs + "px" } });
      if (p.fade > 0) tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: p.fade, ease: "power2.out" }, t);
      else { tl.set(stage, { opacity: 0, ease: "none" }, 0); tl.set(stage, { opacity: 1, ease: "none" }, t); }
      tl.fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: +(100 - target).toFixed(3), duration: IN, ease: "power2.out" }, t);
      if (p.exitAt != null) tl.to(stage, { opacity: 0, duration: OUT, ease: "power2.in" }, t + p.exitAt);
      if (num != null) {
        const v = "c_" + label.id.replace(/\W/g, "_");
        ctx.code(`  const ${v} = { v: 0 };  // conic-progress-ring #${label.id}
  tl.fromTo(${v}, { v: 0 }, { v: 1, duration: ${IN}, ease: "power2.out", onUpdate: () => { document.getElementById("${label.id}").textContent = Math.round(${num} * ${target > 0 ? v + ".v" : "1"}) + ${JSON.stringify(suf)}; } }, ${t});`);
      }
    }
  },
});
