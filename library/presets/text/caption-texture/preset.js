/* text/caption-texture: one word at a time, huge, condensed and centred, filled with a photographic texture (lava by default; also concrete,
   marble, metal, rock, wood: shipped in assets/) through a luminance mask that slowly pans across the word while it is said, with a warm glow;
   each word grows in from 88 % (0.18 s) and swells out to 108 % at its end (0.1 s). Port of HyperFrames registry component caption-texture
   (textures, mask, colours, glow, sizes and timing as in the source). Font: Anton (condensed) becomes the film's font on a narrow width axis
   (wdth 30, weight 800): no network. BLOCK: the target is an empty box (usually the whole frame); words centre in it.
   Words: "params": { "words": "voice" }; params.keywords: words in the hotter orange; params.texture: lava | concrete | marble | metal | rock | wood. */
AIMK.preset("text/caption-texture", {
  params: { words: [], keywords: [], texture: "lava", size: 200, upper: true, color: "#ffd0a0", key: "#FFAA44", glow: "rgba(255,100,20,0.55)" },
  build(tl, els, p, ctx) {
    const TEX = { lava: "lava.png", concrete: "concrete-042-a.png", marble: "marble-012.png", metal: "metal-046-b.png", rock: "rock-058.png", wood: "wood-066.png" };
    const url = ctx.asset(TEX[p.texture] || TEX.lava);
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const KEY = new Set((p.keywords || []).map(norm));
    const W = (p.words || []).filter(w => w && String(w.text).trim()).map(w => ({ text: String(w.text).trim(), start: Math.max(0, +w.start), end: Math.max(+w.start, +w.end) }));
    const c2d = document.createElement("canvas").getContext("2d");
    const fit = (text, base, maxW) => { let s = base; const min = Math.floor(base * 0.45); while (s > min) { c2d.font = `800 ${s}px RFlex`; if (c2d.measureText(text).width <= maxW) return s; s -= 2; } return min; };
    const up = s => p.upper ? s.toUpperCase() : s;
    ctx.css("text/caption-texture", `
.captx { position: absolute; inset: 0; pointer-events: none; }
.captx-s { position: absolute; left: 0; width: 100%; text-align: center; top: 50%; opacity: 0; visibility: hidden; }
.captx-w { display: inline-block; font-weight: 800; font-variation-settings: "wdth" 30; letter-spacing: 0.04em; line-height: 1;
  -webkit-mask-size: 200% 200%; mask-size: 200% 200%; -webkit-mask-position: var(--mask-position, 0% 50%); mask-position: var(--mask-position, 0% 50%);
  -webkit-mask-mode: luminance; mask-mode: luminance; filter: contrast(1.2); }`);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "tx", { cls: "captx" });
      const T = p.at, maxW = (slot.offsetWidth || ctx.W) - 200;
      W.forEach((w, wi) => {
        const txt = up(w.text);
        const sh = ctx.make(root, "div", "s" + wi, { cls: "captx-s", style: { filter: `drop-shadow(0 4px 24px ${p.glow})` } });
        const el = ctx.make(sh, "div", "w" + wi, { cls: "captx-w", text: txt, style: { fontSize: fit(txt, p.size, maxW) + "px", color: KEY.has(norm(w.text)) ? p.key : p.color,
          webkitMaskImage: `url("${url}")`, maskImage: `url("${url}")` } });
        const dur = +Math.max(w.end - w.start + 0.3, 0.4).toFixed(4), t0 = T + w.start;
        tl.set(sh, { yPercent: -50 }, T);
        tl.set(sh, { visibility: "visible" }, t0);
        tl.fromTo(sh, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power3.out" }, t0);
        tl.fromTo(el, { "--mask-position": "0% 50%" }, { "--mask-position": "100% 50%", duration: dur, ease: "sine.inOut" }, t0);
        // out: 0.1 s at the word end (source), shortened when the next word arrives sooner, so two words never share the centre (kit rule 1)
        const nx = W[wi + 1], out = +(nx ? Math.min(0.1, Math.max(0.02, nx.start - w.end)) : 0.1).toFixed(4);
        tl.fromTo(sh, { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.08, duration: out, ease: "power2.in" }, T + w.end);
        tl.set(sh, { visibility: "hidden" }, T + w.end + out);
      });
    }
  },
});
