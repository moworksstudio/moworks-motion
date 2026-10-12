/* text/marker-highlight: a short line of display text rises into place, then ONE hand-drawn marker stroke draws over the emphasised word,
   with a small settle pop on that word as the ink lands.
   Port of HyperFrames registry component marker-highlight (motion + the four stroke shapes; the source's background, font and fitting belong to the film).
   Source envelope: line rises 6 % of the height (opacity 0 -> 1, power3.out, 0.55 s); the stroke draws at draw_at (0.9 s) with a dash tween
   (strokeDashoffset length -> 0, power2.inOut, 0.6 s; the ink stays invisible until the cue); the word pops to 1.045 (power1.out, 0.16 s up and back)
   at 70 % of the draw; optional exit "fade" | "up" (0.45 s: opacity 0, y -7 % of the height, power2.in).
   Stroke shapes (highlight | circle | underline | scribble) are the source's paths, authored in a fixed viewBox and stretched into a box around the
   word with preserveAspectRatio="none" (that distortion is the marker-nib look). The target keeps its text; the first case-insensitive match of
   `word` inside it gets the marker. No match: only the rise. */
AIMK.preset("text/marker-highlight", {
  params: { word: "", style: "highlight", accent: "#71f5a7", drawAt: 0.9, draw: 0.6, pop: 0.32, rise: 0.55, exit: "none", exitAt: 3.05 },
  build(tl, els, p, ctx) {
    const STYLES = {
      highlight: { vb: "0 0 100 40", d: "M 3 24 C 22 20.5, 47 25.5, 68 22.5 C 79 21, 90 23, 97 21.5", w: 26, o: 0.5 },
      circle: { vb: "0 0 100 40", d: "M 22 7 C 58 1, 95 8, 97 20 C 99 31, 74 38, 44 37 C 16 36, 2 29, 3 19 C 4 10, 22 4, 52 4.5", w: 2.8, o: 1 },
      underline: { vb: "0 0 100 12", d: "M 2 7 C 20 4.5, 46 8.5, 66 6 C 80 4.5, 92 7.5, 98 5.5", w: 4.5, o: 1 },
      scribble: { vb: "0 0 100 40", d: "M 6 13 C 34 9.5, 66 11, 94 9 C 60 15, 26 16, 7 20 C 36 18, 68 21, 93 18 C 62 25, 28 27, 8 29", w: 5, o: 0.65 },
    };
    const S = STYLES[p.style] || STYLES.highlight, name = STYLES[p.style] ? p.style : "highlight";
    ctx.css("text/marker-highlight", `
.mhk-em { position: relative; display: inline-block; white-space: nowrap; isolation: isolate; }
.mhk-t { position: relative; z-index: 1; }
.mhk-mark { position: absolute; overflow: visible; z-index: 0; }
.mhk-em[data-marker-style="highlight"] .mhk-mark { left: -3%; top: 14%; width: 106%; height: 76%; }
.mhk-em[data-marker-style="underline"] .mhk-mark { left: -2%; bottom: -14%; width: 105%; height: 22%; z-index: 2; }
.mhk-em[data-marker-style="circle"] .mhk-mark { left: -13%; top: -26%; width: 126%; height: 152%; z-index: 2; }
.mhk-em[data-marker-style="scribble"] .mhk-mark { left: -2%; top: 12%; width: 104%; height: 76%; z-index: 2; }`);
    const up = Math.round(0.06 * ctx.H), t = p.at;
    for (const el of els) {
      const text = el.textContent.trim().replace(/\s+/g, " ");
      const i = p.word ? text.toLowerCase().indexOf(p.word.trim().toLowerCase()) : -1;
      ctx.id(el, "t"); el.textContent = "";
      let em = null, path = null, L = 0;
      if (i < 0) el.textContent = text;
      else {
        const n = p.word.trim().length;
        if (i > 0) el.appendChild(document.createTextNode(text.slice(0, i)));
        em = ctx.make(el, "span", "em", { cls: "mhk-em", attrs: { "data-marker-style": name } });
        em.insertAdjacentHTML("beforeend", `<svg id="${em.id}_svg" class="mhk-mark" viewBox="${S.vb}" preserveAspectRatio="none" aria-hidden="true"><path id="${em.id}_path" d="${S.d}" fill="none" stroke-width="${S.w}" stroke-linecap="round" stroke-linejoin="round" style="stroke:${p.accent};opacity:0"></path></svg>`);
        ctx.make(em, "span", "t", { cls: "mhk-t", text: text.slice(i, i + n) });
        if (i + n < text.length) el.appendChild(document.createTextNode(text.slice(i + n)));
        path = document.getElementById(em.id + "_path");
        L = Math.ceil(path.getTotalLength() * 100) / 100;
        path.style.strokeDasharray = String(L); path.style.strokeDashoffset = String(L);
      }
      tl.fromTo(el, { opacity: 0, y: up }, { opacity: 1, y: 0, duration: p.rise, ease: "power3.out" }, t);
      let da = p.drawAt;
      if (p.exit !== "none") da = Math.min(da, Math.max(0, p.exitAt - (p.draw + p.pop)));
      if (path) {
        tl.set(path, { opacity: S.o, ease: "none" }, t + da);
        tl.fromTo(path, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: p.draw, ease: "power2.inOut" }, t + da);
        tl.fromTo(em, { scale: 1 }, { scale: 1.045, duration: p.pop / 2, ease: "power1.out", yoyo: true, repeat: 1 }, t + da + p.draw * 0.7);
      }
      if (p.exit === "fade") tl.to(el, { opacity: 0, duration: 0.45, ease: "power2.in" }, t + p.exitAt);
      else if (p.exit === "up") tl.to(el, { opacity: 0, y: -Math.round(0.07 * ctx.H), duration: 0.45, ease: "power2.in" }, t + p.exitAt);
    }
  },
});
