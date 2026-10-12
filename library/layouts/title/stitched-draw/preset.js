/* title/stitched-draw: a word sewn in thread: each letter is stitched along its strokes, a needle dot leads the front, needle holes appear at
   every stitch, and each stroke ends with a tiny thread tail pulled snug; letters follow one another. Port of HyperFrames registry component
   stitched-text-draw (Wave M experiment M6). BLOCK: built inside the target (usually the whole frame); the stitched word fills 92 x 56 % of it.
   The source's whole build and painter run in the film from engine/vendor/libs/hf/stitched-text-draw.js (single-stroke alphabet A-Z 0-9, fixed
   LCG jitter, double-dash reveal, schedule by stroke length: 0.15 s lead, 2.9 s draw, 0.05 s between letters; fine | coarse stitches); this
   preset only makes the empty <svg> and the optional exit (0.45 s power2.in, fade or rise 4 % of the box). Latin capitals and digits only:
   Vietnamese marks are dropped (the letters are drawn without them), other characters are spaces, at most 12. */
AIMK.preset("title/stitched-draw", {
  params: { text: "MOWORKS", stitch: "fine", accent: "#71f5a7", fg: "#f8fafc", duration: 4, exit: "none" },
  build(tl, els, p, ctx) {
    const rgb = c => { const d = document.createElement("span"); d.style.color = c; document.body.appendChild(d); const m = getComputedStyle(d).color.match(/[\d.]+/g).slice(0, 3).join(", "); d.remove(); return m; };
    const text = String(p.text).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    const D = Math.max(0.001, +p.duration || 4), OUTB = p.exit === "fade" || p.exit === "up" ? 0.45 : 0, sc = D < 3.2 + OUTB ? D / (3.2 + OUTB) : 1;
    const IN = 3.2 * sc, OUT = OUTB * sc, OS = IN + Math.max(0, D - IN - OUT);
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H;
      const root = ctx.make(slot, "div", "root", { style: { position: "absolute", inset: "0px", display: "grid", placeItems: "center", overflow: "hidden" } });
      const stage = ctx.make(root, "div", "stage", { style: { display: "grid", placeItems: "center" } });
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.id = stage.id + "_svg";
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); svg.setAttribute("aria-hidden", "true");
      Object.assign(svg.style, { display: "block", width: (0.92 * bw).toFixed(2) + "px", height: (0.56 * bh).toFixed(2) + "px" });
      stage.appendChild(svg);
      const o = { text, stitch: p.stitch, accent: p.accent, fg: p.fg, holeFill: `rgba(${rgb(p.fg)}, 0.34)`, needleStroke: `rgba(${rgb(p.accent)}, 0.6)`, duration: D, exit: p.exit };
      ctx.code(`  // stitched-draw #${svg.id}: the source's build + painter (assets/vendor/libs/hf/stitched-text-draw.js), one proxy tween from ${p.at} s
  AIMKStitched.mount(document.getElementById("${svg.id}"), tl, ${p.at}, ${JSON.stringify(o)});`);
      if (OUT) tl.fromTo(stage, p.exit === "up" ? { opacity: 1, y: 0 } : { opacity: 1 }, Object.assign({ opacity: 0, duration: +OUT.toFixed(4), ease: "power2.in" }, p.exit === "up" ? { y: +(-0.04 * bh).toFixed(2) } : {}), +(p.at + OS).toFixed(4));
    }
  },
});
