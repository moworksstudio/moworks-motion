/* text/colorama-wipe: the After Effects "shiny wipe": a headline reveals through a feathered, leaning front that is blurred and colour-mapped
   (black -> navy -> blue -> cyan -> violet -> white) as it passes, then settles to clean type; after the hold the same front closes it again.
   Port of HyperFrames registry component colorama-wipe (masked text + compound blur + Colorama over a moving gradient, with a crisp copy fading
   on top). As in the source: in 0.75 s, hold 2 s, out 0.55 s, power2.inOut fronts, feather 2.4 x the text height, tilt 40 deg, blur 0.15 x the
   height, trail 55 % of the width, noise 0.03, crisp copy from 95 % of the entry, effect canvas at half resolution. The element is hidden and
   painted on two canvases over its box for the window [at, at + in + hold + out] (the wipe owns its on-screen life, as in the source). The painter
   is the source's code in engine/vendor/libs/hf/colorama-wipe.js; the stage and canvases are built here (saved in the film) and the text is
   measured here. Made for light type on a dark ground (the clean type is white; param ink sets the crisp copy's colour). One line per element. */
AIMK.preset("text/colorama-wipe", {
  params: { in: 0.75, hold: 2.0, out: 0.55, feather: 2.4, tilt: 40, blur: 0.15, trail: 0.55, noise: 0.03, crisp: true, scale: 0.5, ink: "#ffffff" },
  build(tl, els, p, ctx) {
    const cycle = [[0, [0, 0, 0]], [0.18, [0, 0, 0]], [0.28, [0, 2, 127]], [0.4, [8, 20, 240]], [0.5, [26, 122, 224]], [0.58, [80, 225, 240]], [0.66, [20, 24, 220]],
      [0.76, [50, 50, 240]], [0.87, [128, 128, 242]], [0.95, [200, 198, 240]], [1, [242, 238, 252]]];
    const o = { in: p.in, hold: p.hold, out: Math.max(0.01, p.out), feather: p.feather, tilt: p.tilt, blur: p.blur, trail: p.trail, noise: p.noise, crisp: !!p.crisp, scale: p.scale, cycle };
    const kk = (document.getElementById("stage").getBoundingClientRect().width / ctx.W) || 1, total = +(o.in + o.hold + o.out).toFixed(4);
    for (const el of els) {
      const id = ctx.id(el, "t"), cs = getComputedStyle(el), text = el.textContent.normalize("NFC").trim(), size = parseFloat(cs.fontSize) || 100;
      const font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`, par = el.parentElement;
      const pr = par.getBoundingClientRect(), er = el.getBoundingClientRect();
      const ex = (er.left - pr.left) / kk - par.clientLeft, ey = (er.top - pr.top) / kk - par.clientTop, ew = er.width / kk, eh = er.height / kk;
      const F = o.feather * size, MB = o.blur * size, padX = Math.ceil(F * 0.6 + MB * 3), padY = Math.ceil(MB * 3 + eh * 0.25);
      const BW = Math.round(ew + padX * 2), BH = Math.round(eh + padY * 2), FW = Math.max(2, Math.round(BW * o.scale)), FH = Math.max(2, Math.round(BH * o.scale));
      const mc = document.createElement("canvas").getContext("2d"); mc.font = font; const measured = mc.measureText(text).width || ew;
      if (getComputedStyle(par).position === "static") par.style.position = "relative";
      const st = document.createElement("div"); st.id = id + "_cw";
      Object.assign(st.style, { position: "absolute", left: (ex - padX).toFixed(2) + "px", top: (ey - padY).toFixed(2) + "px", width: BW + "px", height: BH + "px", pointerEvents: "none", overflow: "visible" });
      par.insertBefore(st, el.nextSibling);
      [["fx", FW, FH], ["crisp", BW, BH]].forEach(([n, w, h]) => { const c = ctx.make(st, "canvas", n, { attrs: { width: String(w), height: String(h) },
        style: { position: "absolute", inset: "0px", width: "100%", height: "100%", display: "block" } }); });
      el.style.visibility = "hidden";
      const g = { fx: st.id + "_fx", crisp: st.id + "_crisp", text, font, size, ink: p.ink, padX, padY, ew, eh, BW, BH, FW, FH, measured: +measured.toFixed(2), o };
      const v = "cw_" + id.replace(/\W/g, "_");
      ctx.code(`  // colorama-wipe #${id}: one linear clock; the painter (assets/vendor/libs/hf/colorama-wipe.js) draws each frame from it
  const ${v} = { t: 0 }, ${v}_draw = AIMKColorama.drawer(${JSON.stringify(g)});
  tl.fromTo(${v}, { t: 0 }, { t: ${total}, duration: ${total}, ease: "none", onUpdate: () => ${v}_draw(${v}.t) }, ${p.at});`);
    }
  },
});
