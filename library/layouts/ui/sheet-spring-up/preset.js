/* ui/sheet-spring-up: a bottom-sheet card (title + body) that rushes up from below the frame on a real spring sampled frame by frame from reference footage: it overshoots its
   resting place by 192 px and settles back over 0.72 s. Port of HyperFrames registry component sheet-spring-up. BLOCK: the target is an empty box (usually the whole frame); the sheet is
   built centred inside it and animates from `from` px below its resting place (1450, the source value) up to it.
   Source timing kept: the 22-step sampled table (y px + a fade-in alpha while it travels) is played verbatim as tl.set steps from `at` (the "arrival beat"). */
AIMK.preset("ui/sheet-spring-up", {
  params: { title: "Chia sẻ", body: "Nội dung của bảng nằm ở đây.", width: 668, radius: 34, tone: "light", from: 1450 },
  build(tl, els, p, ctx) {
    ctx.css("ui/sheet-spring-up", `
.uissu { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.uissu * { box-sizing: border-box; }
.uissu-sheet { position: relative; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28); padding: 49px 43px 43px; will-change: opacity, transform; }
.uissu-title { text-align: center; font-size: 44px; font-weight: 600; line-height: 44px; letter-spacing: 0.2px; }
.uissu-body { margin-top: 24px; text-align: center; font-size: 29px; line-height: 35px; white-space: pre; }`);
    const TONE = { light: { surface: "#f9f9f9", ink: "#101010", muted: "#313131" }, dark: { surface: "#1a1a1a", ink: "#f3f3f3", muted: "#929292" } }[p.tone] || { surface: "#f9f9f9", ink: "#101010", muted: "#313131" };
    const SPRING = [[0.0, 1450, 0.0], [0.057, 1198, 0.13], [0.09, 903, 0.21], [0.123, 648, 0.36], [0.157, 437, 0.43], [0.19, 262, 0.5], [0.223, 120, 0.62], [0.257, 8, 0.78],
      [0.29, -76, 0.89], [0.323, -138, 1.0], [0.357, -175, null], [0.39, -191, null], [0.423, -192, null], [0.457, -181, null], [0.49, -159, null], [0.523, -131, null],
      [0.557, -100, null], [0.59, -68, null], [0.623, -41, null], [0.657, -18, null], [0.69, -5, null], [0.723, 0, null]];
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "uissu" });
      const sheet = ctx.make(root, "div", "sheet", { cls: "uissu-sheet", style: { width: p.width + "px", borderRadius: p.radius + "px", background: TONE.surface, color: TONE.ink } });
      ctx.make(sheet, "div", "title", { cls: "uissu-title", text: p.title });
      ctx.make(sheet, "div", "body", { cls: "uissu-body", text: p.body, style: { color: TONE.muted } });
      const t = p.at, k = p.from / 1450;
      tl.set(sheet, { y: p.from, autoAlpha: 0 }, 0);                       // before the arrival beat the sheet is below the frame
      SPRING.forEach(s => { const props = { y: s[1] >= 0 ? Math.round(s[1] * k) : s[1] }; if (s[2] !== null) props.autoAlpha = s[2]; tl.set(sheet, props, t + s[0]); });
    }
  },
});
