/* text/center-build: the phrase builds word by word from the right while the words already there slide left, so every in-between phrase stays
   centred until the full line locks in place. Port of HyperFrames registry component kinetic-center-build (from remocn, MIT): first word 10 frames,
   each next word 13 frames at 30 fps, ease cubic-bezier(0.2, 0.8, 0.2, 1) (the source's CustomEase, written as a custom() ease), new words enter
   88 px to the right of their place (param entry) out of a 3.5 px blur at 99.2 % scale, the first word also from 6 px below; the pushed words blur
   to 0.8 px and back during each push. EFFECT on a one-line text element: the words keep the element's own layout (font, size, spacing) and the
   centring is computed from it, so the last step is exactly the element as laid out. */
AIMK.preset("text/center-build", {
  params: { entry: 88, first: 0.3333, push: 0.4333 },
  build(tl, els, p, ctx) {
    const E = "custom(M0,0 C 0.2,0.8 0.2,1 1,1)";
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      const W = ctx.split(el, "words"); if (!W.length) continue;
      const L = W[0].offsetLeft, R = i => W[i].offsetLeft + W[i].offsetWidth, mid = (L + R(W.length - 1)) / 2;
      const shift = W.map((w, k) => +(mid - (L + R(k)) / 2).toFixed(2));          // x of every word while words 0..k are on screen
      W.forEach((w, k) => {
        const t = +(p.at + (k === 0 ? 0 : p.first + (k - 1) * p.push)).toFixed(4), d = k === 0 ? p.first : p.push;
        tl.fromTo(w, { x: k === 0 ? shift[0] : +(shift[k] + p.entry).toFixed(2), y: k === 0 ? 6 : 0, scale: 0.992, opacity: 0, filter: "blur(3.5px)" },
          { x: shift[k], y: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: E }, t);
        for (let i = 0; i < k; i++) {
          tl.fromTo(W[i], { x: shift[k - 1] }, { x: shift[k], duration: d, ease: E }, t);
          tl.fromTo(W[i], { filter: "blur(0px)" }, { filter: "blur(0.8px)", duration: +(d / 2).toFixed(4), ease: "none" }, t);
          tl.fromTo(W[i], { filter: "blur(0.8px)" }, { filter: "blur(0px)", duration: +(d / 2).toFixed(4), ease: "none" }, +(t + d / 2).toFixed(4));
        }
      });
    }
  },
});
