/* text/text-stagger: the words rise 48 px out of a 14 px blur one after another (0.54 s, power3.out, 0.09 s apart), then a coloured shimmer sweeps
   across each word (0.72 s, power2.inOut, 0.04 s apart). Port of HyperFrames registry component text-stagger (rise, blur, sweep, timings and eases as
   in the source, sweep 0.7 s after the rise starts; its accent variable blue | green | violet is the param accent). EFFECT on the target text
   element(s). Each word is painted with a gradient (text colour, text colour, accent, text colour; 240 % wide) clipped to the letters; the sweep
   moves it from 0 % to 100 %, so the words end with a touch of the accent, as in the source. Words get 0.3 em / 0.2 em of paint room above / below
   (balanced by negative margins, the layout does not move) so Vietnamese marks and descenders are painted. */
AIMK.preset("text/text-stagger", {
  params: { accent: "#38bdf8", rise: 48, blur: 14, duration: 0.54, stagger: 0.09, shimmerAt: 0.7, shimmer: 0.72, shimmerStagger: 0.04 },
  build(tl, els, p, ctx) {
    const acc = { blue: "#38bdf8", green: "#34d399", violet: "#a78bfa" }[p.accent] || p.accent;
    let k = 0;
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      const ink = getComputedStyle(el).color;
      for (const w of ctx.split(el, "words")) {
        Object.assign(w.style, { backgroundImage: `linear-gradient(90deg, ${ink}, ${ink}, ${acc}, ${ink})`, backgroundSize: "240% 100%", backgroundPosition: "0% 0%",
          webkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", webkitTextFillColor: "transparent",
          paddingTop: "0.3em", paddingBottom: "0.2em", marginTop: "-0.3em", marginBottom: "-0.2em" });
        tl.fromTo(w, { opacity: 0, y: p.rise, filter: `blur(${p.blur}px)` }, { opacity: 1, y: 0, filter: "blur(0px)", duration: p.duration, ease: "power3.out" }, +(p.at + k * p.stagger).toFixed(4));
        tl.fromTo(w, { backgroundPosition: "0% 0%" }, { backgroundPosition: "100% 0%", duration: p.shimmer, ease: "power2.inOut" }, +(p.at + p.shimmerAt + k * p.shimmerStagger).toFixed(4));
        k++;
      }
    }
  },
});
