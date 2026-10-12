/* background/aurora-drift: three oversized, softly blurred accent fields drift over a deep base under a faint vignette; slow and restrained.
   Port of HyperFrames registry component aurora-drift (BLOCK: fills its target, which should be a full-frame empty box).
   Source values: blobs a/b/c at phase offsets 0, 120, 240 deg, x = sin(phase + offset) * (4.6 | 4.1 | 3.6) % of width,
   y = sin(phase + offset + 90 deg) * (3.2 | 3.8 | 3.0) % of height, phase 0 -> 2 pi once over the whole length (exact loop); blur 12 % of the short side,
   saturate 0.84, screen blend, mood deep (base #050711, strength 0.42, vignette 0.62) or bright (#111827, 0.56, 0.46).
   The sine path is written as literal tweens: each blob moves in x on an outer box and in y on an inner box, cut at the sine's extremes
   (a half wave is exactly sine.inOut, the two partial waves at the ends use a fitted cubic Bezier). params.length = seconds for one full cycle (30). */
AIMK.preset("background/aurora-drift", { params: { accent: "green", mood: "deep", length: 30, amount: 1 },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, cw = W / 100, ch = H / 100, qm = Math.min(W, H) / 100, TAU = Math.PI * 2;
    const ACC = { green: "#34d399", blue: "#38bdf8", violet: "#a78bfa" };
    const MOOD = { deep: ["#050711", 0.42, 0.62], bright: ["#111827", 0.56, 0.46] }[p.mood] || ["#050711", 0.42, 0.62];
    const px = v => +v.toFixed(1) + "px";
    ctx.css("background/aurora-drift", `
.adr { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.adr-base, .adr-vig { position: absolute; inset: 0; }
.adr-base { background: radial-gradient(ellipse at 50% 42%, color-mix(in srgb, var(--adr-c) 8%, var(--adr-base)) 0%, var(--adr-base) 68%), var(--adr-base); }
.adr-bx { position: absolute; mix-blend-mode: screen; opacity: var(--adr-k); will-change: transform; }
.adr-by { position: absolute; inset: 0; border-radius: 50%; filter: blur(${px(12 * qm)}) saturate(0.84) opacity(var(--adr-o)); }
.adr-vig { background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,var(--adr-v)) 100%); }`);
    const BLOBS = [
      { n: "a", off: 0, ax: 4.6, ay: 3.2, o: 1, pos: { width: px(76 * cw), height: px(72 * ch), left: px(-18 * cw), top: px(-22 * ch) },
        bg: "radial-gradient(ellipse at center, color-mix(in srgb, var(--adr-c) 88%, white) 0%, color-mix(in srgb, var(--adr-c) 42%, transparent) 48%, transparent 76%)" },
      { n: "b", off: TAU / 3, ax: 4.1, ay: 3.8, o: 0.82, pos: { width: px(84 * cw), height: px(78 * ch), right: px(-28 * cw), top: px(-2 * ch) },
        bg: "radial-gradient(ellipse at center, color-mix(in srgb, var(--adr-c) 72%, #38bdf8) 0%, color-mix(in srgb, var(--adr-c) 36%, transparent) 52%, transparent 78%)" },
      { n: "c", off: TAU * 2 / 3, ax: 3.6, ay: 3, o: 0.68, pos: { width: px(72 * cw), height: px(74 * ch), left: px(18 * cw), bottom: px(-34 * ch) },
        bg: "radial-gradient(ellipse at center, color-mix(in srgb, var(--adr-c) 72%, #a78bfa) 0%, color-mix(in srgb, var(--adr-c) 32%, transparent) 50%, transparent 76%)" },
    ];
    const seen = new Set(), ft = (el, f, to, at) => { if (seen.has(el)) to = Object.assign({ immediateRender: false }, to); seen.add(el); tl.fromTo(el, f, to, at); };
    const root = ctx.make(els[0], "div", "adr", { cls: "adr" });
    root.style.setProperty("--adr-c", ACC[p.accent] || p.accent); root.style.setProperty("--adr-base", MOOD[0]);
    root.style.setProperty("--adr-k", MOOD[1]); root.style.setProperty("--adr-v", MOOD[2]);
    ctx.make(root, "div", "base", { cls: "adr-base" });
    const L = p.length;
    /* one axis of the path: amp * fn(theta), theta from th0 over one turn, cut where the slope is zero */
    for (const B of BLOBS) {
      const bx = ctx.make(root, "div", "bx" + B.n, { cls: "adr-bx", style: B.pos });
      const by = ctx.make(bx, "div", "by", { cls: "adr-by", style: { background: B.bg } });
      by.style.setProperty("--adr-o", B.o);
      const axis = (el, prop, fn, ext, th0, amp) => {
        const cuts = [th0];
        for (let k = Math.ceil((th0 - ext) / Math.PI + 1e-9); ; k++) { const th = ext + k * Math.PI; if (th >= th0 + TAU - 1e-9) break; if (th > th0 + 1e-9) cuts.push(th); }
        cuts.push(th0 + TAU);
        for (let i = 0; i < cuts.length - 1; i++) {
          const ta = cuts[i], tb = cuts[i + 1], v0 = amp * fn(ta), v1 = amp * fn(tb);
          const ease = Math.abs(tb - ta - Math.PI) < 1e-9 ? "sine.inOut" : ctx.ease(q => (fn(ta + q * (tb - ta)) - fn(ta)) / (fn(tb) - fn(ta)), "aurora " + prop + " wave");
          ft(el, { [prop]: +v0.toFixed(2) }, { [prop]: +v1.toFixed(2), duration: +(L * (tb - ta) / TAU).toFixed(4), ease }, +(p.at + L * (ta - th0) / TAU).toFixed(4));
        }
      };
      axis(bx, "x", Math.sin, Math.PI / 2, B.off, B.ax * cw);
      axis(by, "y", Math.cos, 0, B.off, B.ay * ch);
    }
    ctx.make(root, "div", "vig", { cls: "adr-vig" });
  },
});
