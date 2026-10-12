/* text/texture-mask: cuts the letterforms with a material texture used as a luminance mask (lava, rock, concrete, brick, wood, metal, snow,
   marble, grass, fabric... 66 textures), so the type looks eroded, carved or printed on that surface. Port of HyperFrames registry component
   texture-mask-text (the source's 66 mask PNGs, ambientCG CC0 and its own, shipped in assets/; mask-size cover, mask-position center,
   mask-mode luminance, filter contrast as in the source). A STYLE, not a motion: it is applied when the film builds and `at` is not used; pair it
   with any text motion. EFFECT on a text element (light text reads best; the source paints it white). */
AIMK.preset("text/texture-mask", {
  params: { texture: "lava", size: "cover", position: "center", contrast: 1 },
  build(tl, els, p, ctx) {
    const url = `url("${ctx.asset(String(p.texture).replace(/^hf-texture-/, "") + ".png")}")`;
    for (const el of els) Object.assign(el.style, { webkitMaskImage: url, maskImage: url, webkitMaskSize: p.size, maskSize: p.size, webkitMaskPosition: p.position, maskPosition: p.position,
      webkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", maskMode: "luminance", filter: +p.contrast !== 1 ? `contrast(${p.contrast})` : "" });
  },
});
