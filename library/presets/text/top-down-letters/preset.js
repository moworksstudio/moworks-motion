/* text/top-down-letters: the letters of a word drop into place from 42 px above, one after another (0.22 s each, 0.035 s apart, power3.out),
   appearing from behind the line's top edge. Port of HyperFrames registry component top-down-letters (drop, stagger and ease as in the source;
   its variable distance close | standard | far = 0.5 / 1 / 1.8 is a param). The source clips the row with overflow: hidden at line-height 0.9;
   here the clip is ctx.mask with 0.3 em of room above and below, so Vietnamese marks are not cut. EFFECT on the target text element(s). */
AIMK.preset("text/top-down-letters", {
  params: { distance: "standard", drop: 42, duration: 0.22, stagger: 0.035, pad: 0.3 },
  build(tl, els, p, ctx) {
    const k = { close: 0.5, standard: 1, far: 1.8 }[p.distance] || 1, y0 = +(-p.drop * k).toFixed(2);
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      ctx.mask(el, p.pad);
      ctx.split(el, "chars").forEach((c, i) => tl.fromTo(c, { opacity: 0, y: y0 }, { opacity: 1, y: 0, duration: p.duration, ease: "power3.out" }, +(p.at + i * p.stagger).toFixed(4)));
    }
  },
});
