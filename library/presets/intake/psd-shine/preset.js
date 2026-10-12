/* intake/psd-shine: a band of light runs across the letters of a PSD text unit (intake/psd-frame). A copy of the unit's face is laid on
   top, filled only by a moving gradient band (background-clip: text), so the light stays inside the letters and the design's own fill,
   stroke and shadows are untouched; intake/psd-count changes the copy's text too (it sits in the same "_rot_in"). Unlike
   text/shimmer-sweep (a plain text element) it works on designed PSD text. Written for a studio film (08/10/2026, "lighting effect").
   Targets: the units' face elements (ids ending in _face). params: passes [[t from the motion's at, dur], ...], color, width (%), angle,
   stagger (s between several targets) */
AIMK.preset("intake/psd-shine", { params: { passes: [[0, 0.9]], color: "rgba(255,255,255,0.95)", width: 9, angle: 105, stagger: 0.08 },
  build(tl, els, p, ctx) {
    els.forEach((face, i) => {
      const c = face.cloneNode(true);
      c.id = face.id.replace(/_face$/, "") + "_shine";
      c.removeAttribute("class");
      Object.assign(c.style, { color: "transparent", webkitTextFillColor: "transparent", textShadow: "none", webkitTextStroke: "0px transparent",
        filter: "none", mixBlendMode: "normal", pointerEvents: "none",
        backgroundImage: `linear-gradient(${p.angle}deg, rgba(255,255,255,0) calc(var(--shp) - ${p.width}%), ${p.color} var(--shp), rgba(255,255,255,0) calc(var(--shp) + ${p.width}%))`,
        webkitBackgroundClip: "text", backgroundClip: "text" });
      c.style.setProperty("--shp", "-30%");
      face.parentElement.appendChild(c);
      p.passes.forEach(([t, d]) => tl.fromTo(c, { "--shp": "-30%" }, { "--shp": "130%", duration: d, ease: "power2.inOut" }, p.at + t + i * p.stagger));
    });
  } });
