/* motion/object-sweep: a band of light crosses ONE object (a card, a photo, a sticker, a product cut-out) and stays inside its shape: a
   layer is added inside the object, masked by the object's own picture (mask-image = its <img> src, so a transparent PNG keeps its
   outline), filled by a moving gradient band and blended "screen". Several objects follow `stagger` apart. Unlike
   background/light-sweep-pass (a band across the whole frame) the light only touches the object (user, 08/10/2026: "lightsweep chỉ
   apply lên object, không quét qua toàn phim"). Written for a studio film.
   Targets: boxes that hold an <img> (an image unit's entrance layer). params: passes [[t, dur], ...], color, width (%), angle, stagger, blend */
AIMK.preset("motion/object-sweep", { params: { passes: [[0, 0.9]], color: "rgba(255,246,220,0.75)", width: 14, angle: 115, stagger: 0.08, blend: "screen" },
  build(tl, els, p, ctx) {
    els.forEach((el, i) => {
      const img = el.querySelector("img"); if (!img) return;
      const src = img.getAttribute("src"), m = `url("${src}")`;
      const L = ctx.make(el, "div", "osw", { style: { position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", pointerEvents: "none",
        mixBlendMode: p.blend, maskImage: m, webkitMaskImage: m, maskSize: "100% 100%", webkitMaskSize: "100% 100%",
        backgroundImage: `linear-gradient(${p.angle}deg, rgba(255,255,255,0) calc(var(--osp) - ${p.width}%), ${p.color} var(--osp), rgba(255,255,255,0) calc(var(--osp) + ${p.width}%))`,
        "--osp": "-40%" } });
      p.passes.forEach(([t, d]) => tl.fromTo(L, { "--osp": "-40%" }, { "--osp": "140%", duration: d, ease: "power2.inOut" }, p.at + t + i * p.stagger));
    });
  } });
