/* text/line-by-line-slide: a stack of lines slides in one after another, each fading in from the side, rising 18 px out of a 6 px blur.
   Port of HyperFrames registry component line-by-line-slide (motion only: the source's size, tone and density belong to the film).
   Source recipe: every line from { opacity 0, x -36, y 18, blur 6 px } to rest, 0.34 s, stagger 0.08 s, power3.out; variable "direction"
   (left | right) mirrors the x offset. Each target element is one line (the source's span per line). A single target whose text
   contains line breaks ("\n") is split into one block line per row. */
AIMK.preset("text/line-by-line-slide", {
  params: { duration: 0.34, stagger: 0.08, x: 36, y: 18, blur: 6, direction: "left", ease: "power3.out" },
  build(tl, els, p, ctx) {
    let lines = els;
    if (els.length === 1 && /\n/.test(els[0].textContent)) {
      const el = els[0], rows = el.textContent.split(/\n/).map(s => s.trim()).filter(Boolean);
      ctx.id(el, "t"); el.textContent = "";
      lines = rows.map((s, i) => ctx.make(el, "span", "l" + i, { text: s, style: { display: "block" } }));
    }
    const x0 = p.direction === "right" ? p.x : -p.x;
    lines.forEach((u, i) => {
      tl.fromTo(u, { opacity: 0, x: x0, y: p.y, filter: `blur(${p.blur}px)` }, { opacity: 1, x: 0, y: 0, filter: "blur(0px)", duration: p.duration, ease: p.ease }, p.at + i * p.stagger);
    });
  },
});
