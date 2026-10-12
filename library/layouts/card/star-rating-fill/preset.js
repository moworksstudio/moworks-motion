/* card/star-rating-fill: one coloured star layer is clipped over a muted copy. A single left-to-right clip sweep resolves at the target rating, so a fractional
   value leaves the last filled star visibly partial; a number counts up in sync and small per-star pops follow the sweep. Dead-still hold, then a fixed fade-out.
   Port of HyperFrames registry component star-rating-fill. BLOCK: built inside the target box and sized from it (source: container units of its mount box).
   Source phases kept: sweep 1.1 s power2.out from 0.2 s, count in sync, pops 0.2 s (up 45 %, back 55 %) at 82 % of the sweep, IN = 1.5 s, OUT 0.4 s power2.in at the end of
   `duration` (4 s); IN and OUT scale together when `duration` < 1.9 s. */
AIMK.preset("card/star-rating-fill", {
  params: { rating: 4.8, starCount: 5, showValue: "yes", duration: 4, star: "#f5b942", fg: "#f8fafc", muted: "#94a3b8", surface: "" },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const mix = (a, b, q) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v * q / 100 + B[i] * (100 - q) / 100).toString(16).padStart(2, "0")).join(""); };
    const t = p.at, rv = p.rating === "" || p.rating == null ? NaN : Number(p.rating), req = Number.isFinite(rv) ? Math.max(0, Math.min(5, rv)) : 4.8;
    const cv = p.starCount === "" || p.starCount == null ? NaN : Number(p.starCount), count = Math.max(1, Math.min(10, Number.isFinite(cv) ? Math.round(cv) : 5));
    const rating = Math.min(req, count), showValue = p.showValue === "no" ? "no" : "yes", fillPct = rating / count * 100;
    const D = Math.max(0.001, Number(p.duration) || 4), IN_B = 1.5, OUT_B = 0.4, sc = D < IN_B + OUT_B ? D / (IN_B + OUT_B) : 1, OUT = OUT_B * sc, OUT_START = D - OUT;
    const FS = 0.2 * sc, FD = 1.1 * sc, PD = 0.2 * sc;
    const STAR = "M50 0 61.8 36.2 100 36.2 69.1 58.6 80.9 95 50 72.4 19.1 95 30.9 58.6 0 36.2 38.2 36.2Z";
    ctx.css("card/star-rating-fill", `
.csr-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.csr-stage { display: flex; align-items: center; justify-content: center; }
.csr-stars { position: relative; }
.csr-layer { width: 100%; display: flex; align-items: center; }
.csr-fill { position: absolute; left: 0; top: 0; right: 0; bottom: 0; }
.csr-cell { display: block; flex: 1 1 0; min-width: 0; transform-origin: center; }
.csr-cell svg { display: block; width: 100%; height: 100%; overflow: visible; fill: currentColor; }
.csr-value { min-width: 2.2em; font-weight: 720; font-variant-numeric: tabular-nums; letter-spacing: -0.04em; line-height: 1; text-align: right; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100;
      const starsW = Math.min(cw(68), ch(72) * count), cell = starsW / count;
      const box = ctx.make(slot, "div", "sr", { cls: "csr-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", color: p.fg } });
      const stage = ctx.make(box, "div", "stage", { cls: "csr-stage", style: { gap: cw(3) + "px" } });
      const stars = ctx.make(stage, "div", "stars", { cls: "csr-stars", style: { width: starsW + "px", height: cell + "px" } });
      const base = ctx.make(stars, "div", "base", { cls: "csr-layer", style: { color: p.surface ? mix(p.muted, p.surface, 68) : rgba(p.muted, 0.68) } });
      const fill = ctx.make(stars, "div", "fill", { cls: "csr-layer csr-fill", style: { color: p.star, clipPath: "inset(0 100% 0 0)" } });
      const cells = (layer, tag) => Array.from({ length: count }, (_, i) => ctx.make(layer, "span", tag + i, { cls: "csr-cell", html: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${STAR}"/></svg>`, style: { height: cell + "px" } }));
      const baseCells = cells(base, "b"), fillCells = cells(fill, "f");
      let val = null;
      if (showValue === "yes") val = ctx.make(stage, "div", "value", { cls: "csr-value", text: "0,0", style: { fontSize: Math.min(cw(9), ch(16)) + "px", color: p.fg } });
      tl.fromTo(fill, { clipPath: "inset(0 100% 0 0)" }, { clipPath: `inset(0 ${100 - fillPct}% 0 0)`, duration: FD, ease: "power2.out" }, t + FS);
      if (val) {
        const v = "sr_" + val.id.replace(/\W/g, "_");
        ctx.code(`  const ${v} = { v: 0 };  // star rating value #${val.id}\n  tl.fromTo(${v}, { v: 0 }, { v: ${rating}, duration: ${+FD.toFixed(4)}, ease: "power2.out", onUpdate: () => { document.getElementById("${val.id}").textContent = ${v}.v.toFixed(1).replace(".", ","); } }, ${+(t + FS).toFixed(4)});`);
      }
      for (let i = 0; i < Math.ceil(rating); i++) {
        const at = FS + FD * (i / Math.max(1, rating)) * 0.82, targets = [baseCells[i], fillCells[i]];
        tl.fromTo(targets, { scale: 1 }, { scale: 1.06, duration: PD * 0.45, ease: "power2.out" }, t + at);
        tl.fromTo(targets, { scale: 1.06 }, { scale: 1, duration: PD * 0.55, ease: "power2.out", immediateRender: false }, t + at + PD * 0.45);
      }
      tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: OUT, ease: "power2.in" }, t + OUT_START);
    }
  },
});
