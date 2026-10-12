/* device/device-frame-stage: a phone or tablet mockup staged as a physical prop: it rises onto the stage past its rest point (cubic out),
   settles (quad in-out), floats on an idle sine loop (period 3.2 s, +-0.6 % of the box height) for as long as the hold lasts, then sinks.
   The screen is a slot for any picture (or HTML) authored at the device's logical size (390 x 844 phone, 768 x 1024 tablet).
   Port of HyperFrames registry component device-frame-stage. BLOCK: the target is any box (the device sizes itself to the box height, cqh).
   The source drives the pose per frame (render(t) writes --device-y / --device-scale); the same function runs here in ctx.code. */
AIMK.preset("device/device-frame-stage", {
  params: { device: "phone", cutout: "none", body: "graphite", screen: "auto", screen_bg: "#12161d", duration: 5 },   // screen: "auto" = the neutral placeholder for the device, "" = empty slot
  build(tl, els, p, ctx) {
    const J = JSON.stringify;
    const src = f => (/[\/:]/.test(f) ? f : ctx.asset(f));
    ctx.css("device/device-frame-stage", `
.aimk-dfs { position: absolute; inset: 0; container-type: size; isolation: isolate; --border: rgba(244, 246, 248, 0.16); --muted: #8b95a4; }
.aimk-dfs *, .aimk-dfs *::before, .aimk-dfs *::after { box-sizing: border-box; }
.aimk-dfs .device-stage { --stage-perspective: 1600px; position: absolute; inset: 0; perspective: var(--stage-perspective); perspective-origin: 50% 50%; }
.aimk-dfs .device-frame { --device-color: #1b1d22; --device-color-hi: #343740; --device-color-dark: #111318; --device-radius: 46px; --device-bezel: 9px;
  --screen-radius: calc(var(--device-radius) - var(--device-bezel)); --device-aspect: 9 / 19.5; --device-y: 18cqh; --device-scale: 0.94;
  position: absolute; left: 50%; top: 50%; height: 90cqh; aspect-ratio: var(--device-aspect); border-radius: var(--device-radius); padding: var(--device-bezel);
  background: linear-gradient(145deg, var(--device-color-hi), var(--device-color) 42%, var(--device-color-dark)); border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 52px 110px rgba(7, 10, 20, 0.3), 0 18px 38px rgba(7, 10, 20, 0.22), 0 3px 9px rgba(7, 10, 20, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.24), inset 0 0 0 1px rgba(0, 0, 0, 0.48);
  transform: translate(-50%, calc(-50% + var(--device-y))) scale(var(--device-scale)); transform-style: preserve-3d; transform-origin: 50% 88%; will-change: transform; }
.aimk-dfs .device-frame[data-kind="tablet"] { --device-radius: 48px; --device-bezel: 16px; --screen-radius: 34px; --device-aspect: 3 / 4; height: 82cqh; }
.aimk-dfs .device-frame[data-body="silver"] { --device-color: #c9cdd3; --device-color-hi: #eef1f4; --device-color-dark: #9a9ea6; }
.aimk-dfs .device-screen { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: var(--screen-radius); background: var(--surface, #f5f6f8);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.42); isolation: isolate; container-type: size; }
.aimk-dfs .screen-viewport { position: absolute; left: 0; top: 0; width: calc(var(--logical-width, 390) * 1px); height: calc(var(--logical-height, 844) * 1px); transform-origin: 0 0; transform: scale(var(--screen-scale, 1)); }
.aimk-dfs .screen-safe-area { height: 100%; box-sizing: border-box; padding-top: calc(var(--logical-height, 844) * 1px * 0.03); }
.aimk-dfs .device-frame[data-cutout="island"] .screen-safe-area { padding-top: calc(var(--logical-height, 844) * 1px * 0.075); }
.aimk-dfs .device-frame[data-cutout="notch"] .screen-safe-area { padding-top: calc(var(--logical-height, 844) * 1px * 0.06); }
.aimk-dfs .device-screen-slot { position: relative; width: 100%; height: 100%; }
.aimk-dfs .device-screen-slot > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.aimk-dfs .device-screen-slot:empty { display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border, rgba(15, 23, 42, 0.16)); border-radius: calc(var(--screen-radius) * 0.4); }
.aimk-dfs .device-screen-slot:empty::before { content: "ô màn hình: thay bằng giao diện"; padding: var(--space-2, 16px); color: var(--muted, #94a3b8); font-family: inherit; font-size: 15px; text-align: center; }
.aimk-dfs .device-cutout { position: absolute; left: 50%; top: 0; z-index: 50; width: 0; height: 0; background: #050607; pointer-events: none; transform: translateX(-50%); }
.aimk-dfs .device-frame[data-cutout="island"] .device-cutout { top: 1.4%; width: 28%; height: 3.2%; border-radius: 999px; }
.aimk-dfs .device-frame[data-cutout="notch"] .device-cutout { top: 0; width: 52%; height: 3.8%; border-radius: 0 0 18px 18px; }`);
    for (const slot of els) {
      const kind = p.device === "tablet" ? "tablet" : "phone", cutout = ["island", "notch"].includes(p.cutout) ? p.cutout : "none", body = p.body === "silver" ? "silver" : "graphite";
      const LOG = { phone: [390, 844], tablet: [768, 1024] }[kind];
      const wrap = ctx.make(slot, "div", "dfs", { cls: "aimk-dfs", style: { "--surface": p.screen_bg } });
      const stage = ctx.make(wrap, "div", "stage", { cls: "device-stage" });
      const frame = ctx.make(stage, "div", "frame", { cls: "device-frame", attrs: { "data-kind": kind, "data-cutout": cutout, "data-body": body } });
      const screen = ctx.make(frame, "div", "screen", { cls: "device-screen" });
      const vp = ctx.make(screen, "div", "vp", { cls: "screen-viewport", style: { "--logical-width": String(LOG[0]), "--logical-height": String(LOG[1]) } });
      const safe = ctx.make(vp, "div", "safe", { cls: "screen-safe-area" });
      const slotEl = ctx.make(safe, "div", "slot", { cls: "device-screen-slot" });
      const shot = p.screen === "auto" ? "screen-" + kind + ".png" : p.screen;
      if (shot) ctx.make(slotEl, "img", "img", { attrs: { src: src(shot), alt: "" } });
      ctx.make(frame, "div", "cutout", { cls: "device-cutout", attrs: { "aria-hidden": "true" } });
      /* the source measures the screen box once (scene setup): the logical viewport is scaled to it */
      const sw = screen.offsetWidth; if (sw > 0) vp.style.setProperty("--screen-scale", String(+(sw / LOG[0]).toFixed(5)));
      ctx.code(`  /* device/device-frame-stage #${frame.id}: rise / settle / idle sine float / sink, written to --device-y and --device-scale (source render(t)) */
  const frame = document.getElementById(${J(frame.id)}), duration = Math.max(0.001, ${+p.duration || 5});
  const IN_DELAY = 0.18, IN_RISE = 0.72, IN_SETTLE = 0.18, IN_BASE = IN_DELAY + IN_RISE + IN_SETTLE, OUT_BASE = 0.56, totalBase = IN_BASE + OUT_BASE;
  let IN = IN_BASE, OUT = OUT_BASE; if (duration < totalBase) { const k = duration / totalBase; IN = IN_BASE * k; OUT = OUT_BASE * k; }
  const HOLD = Math.max(0, duration - (IN + OUT)), OUT_AT = IN + HOLD;
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3), easeInOutQuad = x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2), easeInQuad = x => x * x;
  const setPose = (y, s) => { frame.style.setProperty("--device-y", y.toFixed(3) + "cqh"); frame.style.setProperty("--device-scale", s.toFixed(4)); };
  const render = t => {
    if (t <= IN) { const delayEnd = IN_DELAY * (IN / IN_BASE), riseEnd = delayEnd + IN_RISE * (IN / IN_BASE);
      if (t <= delayEnd) return setPose(18, 0.94);
      if (t <= riseEnd) { const q = easeOutCubic(Math.min(1, (t - delayEnd) / Math.max(0.0001, riseEnd - delayEnd))); return setPose(18 + (-1.2 - 18) * q, 0.94 + (1.01 - 0.94) * q); }
      const q2 = easeInOutQuad(Math.min(1, (t - riseEnd) / Math.max(0.0001, IN - riseEnd))); return setPose(-1.2 + 1.2 * q2, 1.01 - 0.01 * q2); }
    if (t < OUT_AT) { const ph = (((t - IN) % 3.2) / 3.2) * Math.PI * 2; return setPose(Math.sin(ph) * 0.6, 1); }
    const e = easeInQuad(Math.min(1, (t - OUT_AT) / Math.max(0.0001, OUT))); setPose(18 * e, 1 - 0.04 * e); };
  const P = { t: 0 };
  tl.fromTo(P, { t: 0 }, { t: duration, duration, ease: "none", onUpdate: () => render(P.t) }, ${p.at});
  render(0);`);
    }
  },
});
