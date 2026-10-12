/* line/hw-underline: a hand-drawn mark (wobbly underline, double-pass strike-through or bracket) draws on over text and "boils" (jitters every 3rd frame).
   Port of HyperFrames registry component hw-underline (helpers hwMarkPath / hwMarkOn / hwMarkOff / hwBoil, same maths). BLOCK: each call builds ONE mark
   inside the target (an empty box, usually the whole frame); the box is placed over the text with left / top / width / height (px).
   Source: path drawn by strokeDashoffset len -> 0 in 0.55 s power2.inOut, boil = x,y in +-1.6 px and rotation +-0.5 deg re-rolled every 3 frames at 30 fps,
   mark off = 0.3 s opacity fade power2.in. Give two marks in one film different `seed`s. */
(() => {
  let seq = 0;
  AIMK.preset("line/hw-underline", {
    params: { style: "underline", left: 470, top: 350, width: 620, height: 34, seed: 4, color: "#ffb020", strokeWidth: 7, drawTime: 0.55,
      boil: true, boilAmp: 1.6, boilRot: 0.5, boilFrameDrop: 3, boilSeed: 5, exitAt: 3.1 },
    build(tl, els, p, ctx) {
      const hh = (n, seed) => { const x = Math.sin(n * 127.1 + (seed || 1) * 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
      const markPath = (w, h, style, seed) => {
        seed = seed || 1;
        const wob = (n, range) => hh(n, seed) * (range === undefined ? 5 : range), mid = h / 2;
        if (style === "bracket")
          return "M " + (w * 0.9 + wob(1, 3)) + " " + (2 + wob(2, 3)) + " Q " + wob(3, 4) + " " + (2 + wob(4)) + " " + (4 + wob(5, 3)) + " " + (h * 0.5 + wob(6)) +
            " Q " + wob(7, 4) + " " + (h - 2 + wob(8)) + " " + (w * 0.9 + wob(9, 3)) + " " + (h - 2 + wob(10, 3));
        if (style === "strike")
          return "M " + (2 + wob(1, 3)) + " " + (mid + wob(2)) + " L " + (w - 4 + wob(3, 3)) + " " + (mid - 3 + wob(4)) +
            " M " + (w - 10 + wob(5, 4)) + " " + (mid + 7 + wob(6)) + " L " + (8 + wob(7, 4)) + " " + (mid + 3 + wob(8));
        const segs = Math.max(5, Math.round(w / 95));
        let d = "M 2 " + (mid + wob(0, 4));
        for (let i = 1; i <= segs; i++) {
          const x = (w / segs) * i;
          d += " Q " + (x - w / segs / 2 + wob(i * 4 + 1, 9)) + " " + (mid + (i % 2 ? -1 : 1) * (9 + wob(i * 4 + 2, 4))) + " " + x.toFixed(1) + " " + (mid + wob(i * 4 + 3, 4));
        }
        return d;
      };
      ctx.css("line/hw-underline", ".hwm { position: absolute; pointer-events: none; } .hwm svg { width: 100%; height: 100%; overflow: visible; }");
      const t = p.at;
      for (const slot of els) {
        const i = seq++;
        const d = markPath(p.width, p.height, p.style, p.seed).replace(/(\d+\.\d{3})\d+/g, "$1");
        const mk = ctx.make(slot, "div", "mk" + i, { cls: "hwm", style: { left: p.left + "px", top: p.top + "px", width: p.width + "px", height: p.height + "px" },
          html: `<svg viewBox="0 0 ${p.width} ${p.height}"><path id="${slot.id}_mk${i}_p" d="${d}" fill="none" stroke="${p.color}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>` });
        const path = document.getElementById(mk.id + "_p");
        const len = Math.ceil(path.getTotalLength() * 100) / 100;
        tl.set(mk, { opacity: 0, ease: "none" }, 0);
        tl.set(mk, { opacity: 1, ease: "none" }, t);
        tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: p.drawTime, ease: "power2.inOut" }, t);
        if (p.exitAt != null) tl.to(mk, { opacity: 0, duration: 0.3, ease: "power2.in" }, t + p.exitAt);
        if (p.boil) {
          const life = p.exitAt != null ? p.exitAt + 0.3 : 10, v = "b_" + mk.id.replace(/\W/g, "_");
          ctx.code(`  const ${v} = { t: 0 };  // hw-underline boil #${mk.id}
  const ${v}_h = (n, seed) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
  tl.fromTo(${v}, { t: 0 }, { t: ${life}, duration: ${life}, ease: "none", onUpdate: () => { const step = Math.floor((${v}.t * 30) / ${p.boilFrameDrop} + 1e-6);
    gsap.set(document.getElementById("${mk.id}"), { x: ${v}_h(step * 3 + ${i * 97}, ${p.boilSeed}) * ${p.boilAmp}, y: ${v}_h(step * 3 + 1 + ${i * 97}, ${p.boilSeed}) * ${p.boilAmp}, rotation: ${v}_h(step * 3 + 2 + ${i * 97}, ${p.boilSeed}) * ${p.boilRot} }); } }, ${t});`);
        }
      }
    },
  });
})();
