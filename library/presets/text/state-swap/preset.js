/* text/state-swap: a status label changes state: the old text lifts 18 px through an 8 px blur and fades (0.18 s, power2.in) while the new text
   rises 18 px into place out of the same blur (0.26 s, power2.out, 0.12 s later), e.g. "Saving draft" -> "Saved". Port of HyperFrames registry
   component text-state-swap (offsets, blur, timings and eases as in the source; its variables are params: to = the incoming text, distance
   close | standard | far = x 0.5 / 1 / 1.85). EFFECT on a text element: its own text is the outgoing label; `at` is the moment of the swap.
   Both labels share one grid cell inside the element (the box fits the longer one), aligned by the element's text-align. */
AIMK.preset("text/state-swap", {
  params: { to: "Đã lưu", distance: "standard" },
  build(tl, els, p, ctx) {
    const r = { close: 0.5, standard: 1, far: 1.85 }[p.distance] || 1, d = +(18 * r).toFixed(2);
    for (const el of els) {
      const id = ctx.id(el, "t"), from = el.textContent.normalize("NFC"), cs = getComputedStyle(el);
      const ji = { center: "center", right: "end", end: "end" }[cs.textAlign] || "start";
      el.textContent = "";
      const box = document.createElement("span");
      Object.assign(box.style, { display: "inline-grid", justifyItems: ji, verticalAlign: "top" });
      const [a, b] = [from, String(p.to).normalize("NFC")].map((t, i) => {
        const s = document.createElement("span"); s.textContent = t; s.id = id + (i ? "_to" : "_from");
        Object.assign(s.style, { gridArea: "1 / 1", display: "inline-block" }); box.appendChild(s); return s; });
      el.appendChild(box);
      tl.fromTo(a, { opacity: 1, y: 0, filter: "blur(0px)" }, { opacity: 0, y: -d, filter: "blur(8px)", duration: 0.18, ease: "power2.in" }, p.at);
      tl.fromTo(b, { opacity: 0, y: d, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.26, ease: "power2.out" }, +(p.at + 0.12).toFixed(4));
    }
  },
});
