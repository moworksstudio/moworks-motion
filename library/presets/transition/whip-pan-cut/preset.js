/* transition/whip-pan-cut: both scenes whip sideways together (outgoing leaves, incoming docked one frame beyond arrives at the same speed),
   speed-ramped power3.inOut, with a horizontal-only motion blur that peaks mid-whip and is zero at both ends; a thin accent seam rides the
   boundary between the two scenes while the whip runs (targets: [out inner, in inner]).
   Port of HyperFrames registry component whip-pan-cut. Source values: whip 0.55 s power3.inOut over one frame width, blur = SVG feGaussianBlur
   "v 0", v 0 -> 16 px (0.275 s power3.in) then 16 -> 0 (0.275 s power3.out), seam 0.35 % of width, fades in 0.1 s and out 0.15 s before the end.
   The blur value is written per frame by a small ctx.code block (an SVG filter attribute cannot be a plain tween). */
AIMK.preset("transition/whip-pan-cut", { params: { duration: 0.55, direction: "left", accent: "#22c55e", peak: 16 },
  build(tl, els, p, ctx) {
    const [a, b] = els, sc = b.parentElement, W = ctx.W, t = p.at, D = p.duration, s = D / 0.55;
    const sign = p.direction === "right" ? 1 : -1, sw = +(0.0035 * W).toFixed(2), end = +(t + D).toFixed(4);
    const fid = sc.id + "_wpcblur", nid = sc.id + "_wpcnode";
    ctx.css("transition/whip-pan-cut", `.wpc-seam { position: absolute; top: 0; bottom: 0; left: 0; opacity: 0; pointer-events: none; }`);
    ctx.make(sc, "div", "wpcdefs", { style: { position: "absolute", width: "0px", height: "0px", overflow: "hidden" },
      html: `<svg width="0" height="0" aria-hidden="true"><defs><filter id="${fid}" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur id="${nid}" in="SourceGraphic" stdDeviation="0 0"></feGaussianBlur></filter></defs></svg>` });
    const seam = ctx.make(sc, "div", "wpcseam", { cls: "wpc-seam", style: { width: sw + "px", background: p.accent } });
    const seen = new Set(), ft = (el, f, to, at) => { if (seen.has(el)) to = Object.assign({ immediateRender: false }, to); seen.add(el); tl.fromTo(el, f, to, at); };
    for (const el of [a, b]) tl.set(el, { filter: `url(#${fid})`, ease: "none" }, t);
    ft(a, { x: 0 }, { x: sign * W, duration: D, ease: "power3.inOut" }, t);
    ft(b, { x: -sign * W }, { x: 0, duration: D, ease: "power3.inOut" }, t);
    const x0 = +((sign < 0 ? W : 0) - sw / 2).toFixed(2);
    ft(seam, { x: x0 }, { x: +(x0 + sign * W).toFixed(2), duration: D, ease: "power3.inOut" }, t);
    ft(seam, { opacity: 0 }, { opacity: 1, duration: +(0.1 * s).toFixed(4), ease: "power1.out" }, t);
    ft(seam, { opacity: 1 }, { opacity: 0, duration: +(0.15 * s).toFixed(4), ease: "power1.in" }, +(end - 0.15 * s).toFixed(4));
    for (const el of [a, b]) tl.set(el, { filter: "none", ease: "none" }, end);
    const half = +(D / 2).toFixed(4), v = "wpc_" + sc.id.replace(/\W/g, "_");
    ctx.code(`  const ${v} = { v: 0 };  // whip-pan-cut horizontal blur (feGaussianBlur stdDeviation "v 0")
  const ${v}w = () => document.getElementById("${nid}").setAttribute("stdDeviation", ${v}.v.toFixed(2) + " 0");
  tl.fromTo(${v}, { v: 0 }, { v: ${p.peak}, duration: ${half}, ease: "power3.in", onUpdate: ${v}w }, ${t});
  tl.fromTo(${v}, { v: ${p.peak} }, { v: 0, duration: ${half}, ease: "power3.out", onUpdate: ${v}w, immediateRender: false }, ${+(t + D / 2).toFixed(4)});`);
  },
});
