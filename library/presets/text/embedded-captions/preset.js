/* text/embedded-captions: HyperFrames' embedded captions in a kit film (engine/vendor/hf-captions, as shipped; 11/10/2026, the user:
   "cái nào của HF hay hơn thì ưu tiên lấy của HF"). HF's own pages, compiled by HF's compilers from theme.json / cinematic.json
   (engine/intake/captions.py, run by kit.py build), played live in iframes (ctx.hfFrame + engine/vendor/libs/hf/hf-frame.js) and stacked
   the way HF's render-and-composite.sh stacks its renders:
     index.html  the footage + the captions behind the subject + the person cut out of the footage on top (HF: the matte overlay), unless
                 the captions sit in front (caption_layer "fg": no person);
     index_fg.html  (Cinematic, lines lifted in front) screen-blended over it;
     rail.html   (Theme) the verbatim rail and the front effects, in front of everything;
   and HF's plate reaction (_postfx.sh, read into captions.json) on the whole stack: the zoompan punch / shake / push-in with the same
   expressions, at the clip's frame rate; the RGB split; the grain (the kit's grain tile, its strength from HF's noise amount).
   The page's <video> becomes the film's picture sequences (kit.py cutout ... --captions: assets/video/frames|cutout/<clip>/), the footage
   and the person on the same frame (hf-frame.js: img[data-aimk-seq]); the sound is the scene's voice (audio/voice/<clip>.wav).
   Target: a box the size of the footage on screen (usually the whole frame; the page is scaled to fit it). params: clip (the folder
   assets/captions/<clip>/), duration (default the clip's), plate (true), dir (instead of clip: a folder of pages already compiled, not
   compiled by the build: the gallery demo, assets/lib/text/embedded-captions/demo = the 11/10/2026 test, ordnance theme). */
AIMK.preset("text/embedded-captions", { params: { clip: "", duration: null, plate: true, dir: null },
  build(tl, els, p, ctx) {
    const base = p.dir ? p.dir.replace(/\/?$/, "/") : `assets/captions/${p.clip}/`;
    const get = f => {
      const x = new XMLHttpRequest(); x.open("GET", base + f, false); x.send();
      if (x.status >= 400 || !x.responseText) throw new Error(`text/embedded-captions: ${base + f} is missing (kit.py build compiles it from theme.json / cinematic.json)`);
      return x.responseText;
    };
    const C = JSON.parse(get("captions.json")), D = +(p.duration || C.duration).toFixed(4);
    const seq = (id, dir, ext, z) => `<img id="${id}" alt="" data-aimk-seq="${dir}" data-aimk-ext="${ext}" data-aimk-fps="${C.fps}" data-aimk-first="1" ` +
      `data-aimk-last="${C.frames}" data-aimk-digits="4" src="${dir}0001${ext}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:${z}">`;
    for (const host of els) {
      ctx.id(host, "ec"); host.style.overflow = "hidden";
      const box = (parent, name, extra) => ctx.make(parent, "div", name, { style: Object.assign({ position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%" }, extra || {}) });
      const fx = box(host, "fx"), plate = box(fx, "plate", { transformOrigin: "0 0" });
      const page = (f, extra, edit) => ctx.hfFrame(box(plate, f.replace(/\W/g, "_"), extra), f, p.at, D, { page: base + f, size: [C.w, C.h], edit });
      page("index.html", null, s => {
        const v = /<video\b[^>]*\bid="a-roll"[\s\S]*?<\/video>/;
        if (!v.test(s)) throw new Error(`text/embedded-captions: ${base}index.html has no <video id="a-roll"> (HF's page changed?)`);
        return s.replace(v, () => seq("a-roll", C.footage, ".jpg", 1) + (C.layer !== "fg" ? seq("aimk-person", C.person, ".webp", 3) : ""));
      });
      if (C.pages.fg) page(C.pages.fg, { mixBlendMode: "screen" });          // HF: blend=all_mode=screen over the matted base
      if (C.pages.rail) page(C.pages.rail);                                   // HF: the transparent rail alpha-overlaid in front
      const P = p.plate ? C.plate : null;
      if (!P) continue;
      const v = "ec_" + host.id.replace(/\W/g, "_");
      let svg = "";
      if (P.rgb) {                                                            // ffmpeg rgbashift rh=-n bh=+n: red left, blue right
        const fid = host.id + "_rgb";
        svg = `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
          `<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/><feOffset id="${fid}_r" in="r" dx="0" result="r2"/>` +
          `<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/>` +
          `<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b"/><feOffset id="${fid}_b" in="b" dx="0" result="b2"/>` +
          `<feBlend in="r2" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b2" mode="screen"/></filter></svg>`;
        host.insertAdjacentHTML("afterbegin", svg);
      }
      let grain = null;
      if (P.grain) grain = box(host, "grain", { pointerEvents: "none", backgroundImage: `url("${ctx.asset("grain.png")}")`, backgroundSize: "256px 256px",
        mixBlendMode: "overlay", opacity: String(Math.min(0.35, P.grain * 0.025).toFixed(3)) });
      ctx.code(`  // text/embedded-captions #${host.id}: HF's plate reaction (_postfx.sh: zoompan with its own expressions, rgbashift, noise), on the clip's ${C.fps} fps frames
  const ${v} = { t: 0 }, ${v}P = ${JSON.stringify({ z: P.z || null, iw: P.iw || 1, ih: P.ih || 1, rgb: P.rgb || null })};
  const ${v}Z = ${P.z ? `(t, IW, IH, B) => { const Z = ${P.z}; return [Z, ${P.x}, ${P.y}]; }` : "null"};
  tl.fromTo(${v}, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => {
    const t = Math.round(${v}.t * ${C.fps}) / ${C.fps}, P = ${v}P, B = (x, a, b) => (x >= a && x <= b ? 1 : 0);
    const pl = document.getElementById(${JSON.stringify(plate.id)}), w = pl.offsetWidth, h = pl.offsetHeight;
    if (${v}Z) { const [Z, X, Y] = ${v}Z(t, P.iw, P.ih, B);                  // the window (X, Y, iw / Z wide) shown full size
      pl.style.transform = "translate(" + (-X / P.iw * w * Z).toFixed(3) + "px, " + (-Y / P.ih * h * Z).toFixed(3) + "px) scale(" + Z.toFixed(5) + ")"; }
    if (P.rgb) { const on = P.rgb.on.some(r => t >= r[0] && t <= r[1]), n = P.rgb.px * w / ${C.w};
      document.getElementById(${JSON.stringify(host.id + "_rgb_r")}).setAttribute("dx", (-n).toFixed(2));
      document.getElementById(${JSON.stringify(host.id + "_rgb_b")}).setAttribute("dx", n.toFixed(2));
      document.getElementById(${JSON.stringify(fx.id)}).style.filter = on ? "url(#${host.id}_rgb)" : "none"; }
    ${grain ? `const q = Math.floor(t * ${C.fps}), H = a => { const x = Math.sin(a * 12.9898 + 7 * 78.233) * 43758.5453; return x - Math.floor(x); };
    document.getElementById(${JSON.stringify(grain.id)}).style.backgroundPosition = Math.round(H(q) * 256) + "px " + Math.round(H(q + 0.5) * 256) + "px";` : ""}
  } }, ${p.at});`);
    }
  },
});
