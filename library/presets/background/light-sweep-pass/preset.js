/* background/light-sweep-pass: a traveling key light re-shades a scene: a soft diagonal light band crosses the frame once while every lit element's
   highlight and shadow shifts with it, then the light settles to a resting key from the upper third. Quiet; the scene never moves.
   Port of HyperFrames registry component light-sweep-pass (BLOCK: fills its target, which should be a full-frame empty box; the source's default
   scene, a hero card + three cards, is built when scene = "cards"; scene = "plain" gives only the dark base, ambient lift and band).
   Source values: light position --light-x -35 -> 118 (1.6 s sine.inOut, starting sweepAt = 0.9 s) -> 62 (0.55 s power2.out); band opacity 0 -> 1 over 0.3 s,
   1 -> 0 over its last 0.35 s; stage 0 -> 1 and 1.5 % of height up over 0.5 s power2.out; band, highlights, shadows and ambient lift are static CSS that read
   --light-x through calc(), so the only per-frame code is the proxy that writes --light-x (ctx.code). Elements inside the block opt in with data-lit and
   an inline --lsp-x (their centre along the sweep, % of width). */
AIMK.preset("background/light-sweep-pass", { params: { angle: 115, sweepAt: 0.9, strength: "standard", accent: "#22c55e", scene: "cards", band: "inside" },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, cw = W / 100, ch = H / 100, qm = Math.min(W, H) / 100, px = v => +v.toFixed(2) + "px";
    ctx.css("background/light-sweep-pass", `
.lsp { --light-x: -35; --lsp-angle: 115; --lsp-strength: 1; position: absolute; inset: 0; overflow: hidden; isolation: isolate; background: #0b0c0e; color: #f8fafc; }
.lsp-stage, .lsp-scene, .lsp-ambient, .lsp-band { position: absolute; inset: 0; }
.lsp-stage { opacity: 0; will-change: transform, opacity; }
.lsp-scene { overflow: hidden; }
.lsp [data-lit] { --lsp-d: calc(var(--light-x) - var(--lsp-x, 50)); --lsp-abs: max(var(--lsp-d), calc(-1 * var(--lsp-d))); --lsp-glow: clamp(0, calc(1 - var(--lsp-abs) / 26), 1);
  position: relative; box-shadow: calc(clamp(-30, var(--lsp-d), 30) * ${px(-0.05 * cw)}) calc(${px(0.8 * ch)} + var(--lsp-glow) * ${px(0.7 * ch)}) calc(${px(2.2 * ch)} + var(--lsp-glow) * ${px(2.4 * ch)}) color-mix(in srgb, #000000 26%, transparent); }
.lsp [data-lit]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(calc(var(--lsp-angle) * 1deg), color-mix(in srgb, #ffffff 86%, var(--lsp-accent)) 0%, transparent 62%); opacity: calc(var(--lsp-glow) * 0.32 * var(--lsp-strength)); }
.lsp-ambient { pointer-events: none; background: #000000; opacity: calc(clamp(0, (26 - var(--light-x)) / 130, 0.16) * var(--lsp-strength)); }
.lsp-in [data-lit] { overflow: hidden; }
.lsp-bandin { position: absolute; pointer-events: none; mix-blend-mode: screen; opacity: 0; z-index: 1;
  background: linear-gradient(calc(var(--lsp-angle) * 1deg), transparent 36%, color-mix(in srgb, #ffffff 24%, transparent) 46%, color-mix(in srgb, #ffffff 78%, var(--lsp-accent)) 50%, color-mix(in srgb, #ffffff 24%, transparent) 54%, transparent 64%);
  transform: translateX(calc((var(--light-x) - 50) * ${px(1.4 * cw)})); }
.lsp-band { inset: -55%; pointer-events: none; mix-blend-mode: screen; opacity: 0;
  background: linear-gradient(calc(var(--lsp-angle) * 1deg), transparent 36%, color-mix(in srgb, #ffffff 24%, transparent) 46%, color-mix(in srgb, #ffffff 78%, var(--lsp-accent)) 50%, color-mix(in srgb, #ffffff 24%, transparent) 54%, transparent 64%);
  transform: translateX(calc((var(--light-x) - 50) * ${px(1.4 * cw)})); }
.lsp-default { position: absolute; inset: 0; display: grid; grid-template-rows: auto auto; align-content: center; justify-items: center; row-gap: ${px(5 * ch)}; padding: ${px(6 * ch)} ${px(10 * cw)};
  background: linear-gradient(calc(var(--lsp-angle) * 1deg), color-mix(in srgb, #f8fafc 3%, #0b0c0e) 0%, #0b0c0e 55%, color-mix(in srgb, #000000 6%, #0b0c0e) 100%); }
.lsp-hero { display: grid; align-content: center; row-gap: ${px(2.4 * ch)}; width: ${px(58 * cw)}; height: ${px(30 * ch)}; padding: ${px(4 * ch)} ${px(3 * cw)}; border: ${px(0.16 * cw)} solid #343a46; border-radius: ${px(2.4 * qm)}; background: #14171c; }
.lsp-hero-bar { width: 46%; height: ${px(4.6 * ch)}; border-radius: ${px(1.4 * ch)}; background: color-mix(in srgb, #f8fafc 82%, #14171c); }
.lsp-hero-line { height: ${px(2.2 * ch)}; border-radius: ${px(1.1 * ch)}; background: #94a3b8; opacity: 0.55; }
.lsp-hero-line:nth-of-type(3) { width: 72%; }
.lsp-row { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: ${px(2 * cw)}; width: ${px(58 * cw)}; }
.lsp-card { display: grid; align-content: start; row-gap: ${px(1.6 * ch)}; height: ${px(24 * ch)}; padding: ${px(2.6 * ch)} ${px(1.6 * cw)}; border: ${px(0.16 * cw)} solid #343a46; border-radius: ${px(2.4 * qm)}; background: #14171c; }
.lsp-dot { width: ${px(3.4 * ch)}; height: ${px(3.4 * ch)}; border-radius: 50%; background: color-mix(in srgb, var(--lsp-accent) 72%, #14171c); }
.lsp-line { height: ${px(1.9 * ch)}; border-radius: ${px(1 * ch)}; background: #94a3b8; opacity: 0.5; }
.lsp-line:nth-of-type(3) { width: 64%; }`);
    const root = ctx.make(els[0], "div", "lsp", { cls: "lsp" });
    root.style.setProperty("--lsp-angle", String(p.angle)); root.style.setProperty("--lsp-accent", p.accent);
    root.style.setProperty("--lsp-strength", p.strength === "subtle" ? "0.55" : "1"); root.style.setProperty("--light-x", "-35");
    const stage = ctx.make(root, "div", "stage", { cls: "lsp-stage" });
    const scene = ctx.make(stage, "div", "scene", { cls: "lsp-scene" });
    if (p.scene !== "plain") {
      const d = ctx.make(scene, "div", "def", { cls: "lsp-default" });
      const hero = ctx.make(d, "div", "hero", { cls: "lsp-hero", attrs: { "data-lit": "", style: "--lsp-x: 50" } });
      ctx.make(hero, "div", "bar", { cls: "lsp-hero-bar" }); ctx.make(hero, "div", "l1", { cls: "lsp-hero-line" }); ctx.make(hero, "div", "l2", { cls: "lsp-hero-line" });
      const row = ctx.make(d, "div", "row", { cls: "lsp-row" });
      [31, 50, 69].forEach((x, i) => { const c = ctx.make(row, "div", "c" + i, { cls: "lsp-card", attrs: { "data-lit": "", style: "--lsp-x: " + x } });
        ctx.make(c, "div", "dot", { cls: "lsp-dot" }); ctx.make(c, "div", "l1", { cls: "lsp-line" }); ctx.make(c, "div", "l2", { cls: "lsp-line" }); });
    }
    ctx.make(stage, "div", "amb", { cls: "lsp-ambient" });
    let band = ctx.make(stage, "div", "band", { cls: "lsp-band" });
    if (p.band === "inside") {
      /* gallery review 05/10: the light passes through the lit cards only. Each lit element gets its own copy of the frame-sized band, placed so
         that it lines up with the frame (one light for all cards), clipped by the card (overflow hidden). */
      root.classList.add("lsp-in"); band.style.display = "none";
      const rb = root.getBoundingClientRect(), k = rb.width / W || 1;
      band = [...root.querySelectorAll("[data-lit]")].map((el, i) => { const r = el.getBoundingClientRect(), x = (r.left - rb.left) / k, y = (r.top - rb.top) / k;
        return ctx.make(el, "div", "bandin", { cls: "lsp-bandin", style: { left: px(-x - 0.55 * W), top: px(-y - 0.55 * H), width: px(2.1 * W), height: px(2.1 * H) } }); });
    }
    const t = p.at, sw = +(t + p.sweepAt).toFixed(4), end = +(sw + 1.6).toFixed(4);
    tl.fromTo(stage, { opacity: 0, y: +(1.5 * ch).toFixed(2) }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, t);
    tl.fromTo(band, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, sw);
    tl.fromTo(band, { opacity: 1 }, { opacity: 0, duration: 0.35, ease: "power1.in", immediateRender: false }, +(end - 0.35).toFixed(4));
    const v = "lsp_" + root.id.replace(/\W/g, "_");
    ctx.code(`  const ${v} = { x: -35 };  // light-sweep-pass: the light position (frame percent); the CSS reads it as --light-x
  const ${v}w = () => document.getElementById("${root.id}").style.setProperty("--light-x", ${v}.x.toFixed(3));
  tl.fromTo(${v}, { x: -35 }, { x: 118, duration: 1.6, ease: "sine.inOut", onUpdate: ${v}w }, ${sw});
  tl.fromTo(${v}, { x: 118 }, { x: 62, duration: 0.55, ease: "power2.out", onUpdate: ${v}w, immediateRender: false }, ${end});`);
  },
});
