/* effect/film-grain: fine film grain over a picture or footage: a noise tile (shipped with the preset: assets/grain.png, or `src`) repeated
   over the target box and blended "overlay", its offset jumping to a hashed place `fps` times a second (film cadence): a pure function of
   film time, so seeks and renders agree. With a grade (a CSS filter on the footage) and a vignette it gives the "cinematic filter" look.
   Unlike effect/grain-overlay (an animated full-frame layout) it sits on one box and can be any strength. Written for a studio film
   (08/10/2026). Target: a box over the footage. params: src (noise tile; default the shipped one), size (px), opacity, fps (24), dur, seed */
AIMK.preset("effect/film-grain", { params: { src: null, size: 256, opacity: 0.16, fps: 24, dur: 5, seed: 11 },
  build(tl, els, p, ctx) {
    const host = els[0], src = p.src || ctx.asset("grain.png");
    const g = ctx.make(host, "div", "grain", { style: { position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", pointerEvents: "none",
      backgroundImage: `url("${src}")`, backgroundSize: `${p.size}px ${p.size}px`, mixBlendMode: "overlay", opacity: String(p.opacity) } });
    const v = "efg_" + host.id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // effect/film-grain: noise offset per film frame at ${p.fps} fps
  const ${v} = { t: 0 };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const q = Math.floor((${p.at} + ${v}.t) * ${p.fps}), H = a => { const x = Math.sin(a * 12.9898 + ${p.seed} * 78.233) * 43758.5453; return x - Math.floor(x); };
    document.getElementById(${JSON.stringify(g.id)}).style.backgroundPosition = Math.round(H(q) * ${p.size}) + "px " + Math.round(H(q + 0.5) * ${p.size}) + "px";
  } }, ${p.at});`);
  } });
