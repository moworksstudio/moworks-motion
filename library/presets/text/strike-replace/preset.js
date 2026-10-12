/* text/strike-replace: a line strikes through the old word (0.28 s, power2.out) and the replacement fades up beside it (0.3 s, power2.out, 14 px,
   0.24 s later). Port of HyperFrames registry component strikethrough-replace (timing, ease and offsets as in the source; its variables are params:
   origin left | center | right, thickness thin | standard | thick = 3 / 6 / 10 px at the source's 58 px type (scaled with the element's size here),
   tint red | amber | blue | violet or any colour). EFFECT on a text element: its own text is the old word; `to` is the replacement. The source's
   strike was 48 % of the whole pair wide; here it spans the old word exactly (6 % past each side). */
AIMK.preset("text/strike-replace", {
  params: { to: "Nhanh", origin: "left", thickness: "standard", tint: "red", gap: 0.31 },
  build(tl, els, p, ctx) {
    const col = { red: "#ef4444", amber: "#f59e0b", blue: "#38bdf8", violet: "#a78bfa" }[p.tint] || p.tint;
    const org = { left: "left center", center: "center center", right: "right center" }[p.origin] || "left center";
    for (const el of els) {
      const old = el.textContent.normalize("NFC"), fs = parseFloat(getComputedStyle(el).fontSize) || 58, k = fs / 58;
      const th = +(({ thin: 3, standard: 6, thick: 10 }[p.thickness] || 6) * k).toFixed(2);
      ctx.id(el, "t"); el.textContent = "";
      const a = ctx.make(el, "span", "old", { text: old, style: { position: "relative", display: "inline-block" } });
      const bar = ctx.make(a, "i", "strike", { style: { position: "absolute", left: "-6%", width: "112%", top: `calc(52% - ${th / 2}px)`, height: th + "px", borderRadius: "999px", background: col, transformOrigin: org } });
      const b = ctx.make(el, "span", "new", { text: String(p.to).normalize("NFC"), style: { display: "inline-block", marginLeft: p.gap + "em" } });
      tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power2.out" }, p.at);
      tl.fromTo(b, { opacity: 0, y: +(14 * k).toFixed(2) }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, +(p.at + 0.24).toFixed(4));
    }
  },
});
