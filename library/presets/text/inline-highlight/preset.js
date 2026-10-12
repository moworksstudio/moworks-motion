/* text/inline-highlight: a flat highlighter band grows behind the text from one edge (0.55 s, power2.out); several targets follow 0.12 s apart.
   Port of HyperFrames registry component inline-highlight (band 0.38 em tall, 0.05 em above the text's bottom, 0.08 em past each side, behind the
   text; its variables are params: tint yellow #fff06a | green | blue | violet or any colour, thickness thin | standard | thick = 0.22 / 0.38 /
   0.62 em, origin left | right | center). EFFECT on a text element: the whole text, or only `word` inside it when given. */
AIMK.preset("text/inline-highlight", {
  params: { word: "", tint: "yellow", thickness: "standard", origin: "left", duration: 0.55, stagger: 0.12 },
  build(tl, els, p, ctx) {
    const col = { yellow: "#fff06a", green: "#34d399", blue: "#38bdf8", violet: "#a78bfa" }[p.tint] || p.tint;
    const h = { thin: "0.22em", standard: "0.38em", thick: "0.62em" }[p.thickness] || "0.38em";
    const org = { left: "left center", right: "right center", center: "center center" }[p.origin] || "left center";
    els.forEach((el, i) => {
      const txt = el.textContent.normalize("NFC"), w = String(p.word || "").normalize("NFC"), m = w ? txt.toLowerCase().indexOf(w.toLowerCase()) : -1;
      const cs = getComputedStyle(el); ctx.id(el, "t"); el.textContent = "";
      if (cs.position === "static") el.style.position = "relative";
      if (!el.style.zIndex) el.style.zIndex = "0";                              // the band sits behind the text, inside the element
      const [a, b, c] = m >= 0 ? [txt.slice(0, m), txt.slice(m, m + w.length), txt.slice(m + w.length)] : ["", txt, ""];
      if (a) el.appendChild(document.createTextNode(a));
      const hl = ctx.make(el, "span", "hl", { text: b, style: { position: "relative", display: "inline-block" } });
      if (c) el.appendChild(document.createTextNode(c));
      const band = ctx.make(hl, "span", "band", { style: { position: "absolute", left: "-0.08em", right: "-0.08em", bottom: "0.05em", height: h, background: col, transformOrigin: org, zIndex: "-1" } });
      tl.fromTo(band, { scaleX: 0 }, { scaleX: 1, duration: p.duration, ease: "power2.out" }, +(p.at + i * p.stagger).toFixed(4));
    });
  },
});
