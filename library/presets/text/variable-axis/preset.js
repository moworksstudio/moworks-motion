/* text/variable-axis: the headline gains emphasis by morphing one variable-font axis: the glyphs swell from thin to black (or from narrow to wide)
   while the line itself stays put (1.4 s, expo.out). Port of HyperFrames registry component variable-axis-type (axis, endpoints, duration and ease
   as in the source: wght 200 -> 900 with wdth 100, or wdth from -> to with wght 700; opsz 96 in both). EFFECT on a text element set in a variable
   font with those axes: the kit's "RFlex" (Roboto Flex, the source's face) has wght 100-1000 and wdth 25-151. AE: png (variable-font axes). */
AIMK.preset("text/variable-axis", {
  params: { axis: "wght", from: 200, to: 900, duration: 1.4 },
  build(tl, els, p, ctx) {
    const w = p.axis === "wdth", lo = w ? 25 : 100, hi = w ? 151 : 1000, cl = v => Math.max(lo, Math.min(hi, +v));
    const s = v => w ? `"wght" 700, "wdth" ${cl(v)}, "opsz" 96` : `"wght" ${cl(v)}, "wdth" 100, "opsz" 96`;
    for (const el of els) tl.fromTo(el, { fontVariationSettings: s(p.from) }, { fontVariationSettings: s(p.to), duration: p.duration, ease: "expo.out" }, p.at);
  },
});
