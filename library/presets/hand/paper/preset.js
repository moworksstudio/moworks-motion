/* hand/paper: paper for a hand-drawn film, drawn with the claude-animation library (Hanif, MIT; engine/vendor/libs/hand/handkit.js):
   "fibre" = warm paper with fibres, faint blotches, printed grain and a soft vignette (their brush-ink look), "plain" = paper + printed grain
   (their textured-editorial look). Optional: their diagonal light bands drifting across (editorial skies) and their film finish (grain
   tiles cycled, tiny exposure flicker, vignette). Target: a full-frame box, first in the scene (the paper is under everything).
   params: look "fibre" | "plain", color, bands (false | true | { alpha, color, angle, width, gap, drift }), finish (false | true |
           { grain, flicker, vignette }), fps (finish / bands redraws a second: 12 = on twos), duration (s the bands / finish run) */
AIMK.preset("hand/paper", { params: { look: "fibre", color: null, bands: false, finish: false, fps: 12, duration: 4 },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el);
    const W = el.offsetWidth || ctx.W, H = el.offsetHeight || ctx.H;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.id = el.id + "_paper";
    Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none" });
    el.insertBefore(cv, el.firstChild);
    const color = p.color || (p.look === "plain" ? "#F3EEDD" : "#F3EBDA"), live = !!(p.bands || p.finish);
    const bands = p.bands === true ? {} : p.bands, finish = p.finish === true ? {} : p.finish;
    const v = "pp_" + el.id.replace(/\W/g, "_");
    ctx.code(`  // hand/paper #${el.id}: claude-animation's ${p.look === "plain" ? "paper()" : "fibrePaper()"}${bands ? " + lightBands" : ""}${finish ? " + filmFinish" : ""} (MIT, assets/vendor/libs/hand/handkit.js)
  const ${v} = { t: 0, cv: document.getElementById(${JSON.stringify(cv.id)}) };
  ${v}.g = ${v}.cv.getContext("2d"); ${v}.base = HANDKIT.${p.look === "plain" ? "paper" : "fibrePaper"}(${W}, ${H}, ${JSON.stringify(color)});
  ${v}.fin = ${finish ? `HANDKIT.filmFinish(${W}, ${H}, ${JSON.stringify(finish)})` : "null"};
  ${v}.draw = (t) => { const g = ${v}.g; g.drawImage(${v}.base, 0, 0);${bands ? `
    HANDKIT.lightBands(g, ${W}, ${H}, Math.floor(t * ${p.fps}) / ${p.fps}, ${JSON.stringify(bands)});` : ""}
    if (${v}.fin) ${v}.fin(g, Math.floor(t * ${p.fps})); };
  ${v}.draw(0);${live ? `
  tl.fromTo(${v}, { t: 0 }, { t: ${p.duration}, duration: ${p.duration}, ease: "none", onUpdate: () => ${v}.draw(${v}.t) }, ${p.at});` : ""}`);
  } } });
