/* text/streaming-text: an AI answer streams in: words arrive in bursts (two together, a pause, three more), each landing grey and inking to full
   colour over 0.27 s. Port of HyperFrames registry component streaming-text (the measured GAPS rhythm table, cycled for any word count, and the
   0.2667 s linear grey -> ink ramp, as in the source). EFFECT on a text element (usually a paragraph): its own colour is the ink; fresh grey is
   #767676 on dark ink and #5f5f5f on light ink (the source's two tones), or param fresh. */
AIMK.preset("text/streaming-text", {
  params: { fresh: "auto", speed: 1 },
  build(tl, els, p, ctx) {
    const GAPS = [0.167, 0.1, 0, 0.367, 0, 0.167, 0.133, 0.1, 0.1, 0.133, 0.167, 0.133, 0, 0.233, 0.167, 0.1, 0, 0.133, 0.133, 0.1, 0.167, 0.133, 0.1, 0.133, 0.167, 0.1, 0.133, 0.1, 0.133];
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      const ink = getComputedStyle(el).color, lum = (ink.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).reduce((s, v, i) => s + v * [0.299, 0.587, 0.114][i], 0);
      const fresh = p.fresh !== "auto" ? p.fresh : lum > 128 ? "#5f5f5f" : "#767676";
      let t = p.at;
      ctx.split(el, "words").forEach((w, i) => {
        if (i > 0) t += GAPS[i % GAPS.length] / (p.speed || 1);
        w.style.opacity = "0";
        tl.set(w, { opacity: 1 }, +t.toFixed(4));
        tl.fromTo(w, { color: fresh }, { color: ink, duration: 0.2667, ease: "none" }, +t.toFixed(4));
      });
    }
  },
});
