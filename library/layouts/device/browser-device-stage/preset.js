/* device/browser-device-stage: a generic app surface in token-native device chrome (browser toolbar + address pill, window title bar, or a
   phone with a notch). It settles in once (fade, rise 4.5 % of the box, soft 0.965 -> 1 scale), drifts 0.5 % up and back during the hold,
   optionally swaps to a second screen (fade out, then the new screen rises in), and can exit by fade or up.
   The screen shows a picture (or the source's token-styled skeleton app when no picture is given).
   Port of HyperFrames registry component browser-device-stage. BLOCK: the target is any box (sizes in container units of that box).
   Every tween is the source's, written literally (cq values converted to px of the box). */
AIMK.preset("device/browser-device-stage", {
  params: {
    chrome: "browser", title: "app.example.com", swap_at: 0, accent: "#c5a3ff", exit: "none", screen: "", screen_b: "",
    bg: "#eef0f3", fg: "#14161b", surface: "#ffffff", border: "#d3d8e0", duration: 5,
  },
  build(tl, els, p, ctx) {
    const src = f => (/[\/:]/.test(f) ? f : ctx.asset(f));
    ctx.css("device/browser-device-stage", `
.aimk-bds { position: absolute; inset: 0; overflow: hidden; container-type: size; isolation: isolate; color: var(--fg, #f8fafc); font-family: inherit; pointer-events: none; }
.aimk-bds *, .aimk-bds *::before, .aimk-bds *::after { box-sizing: border-box; }
.aimk-bds .bds-clip { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; background: var(--bg, transparent); }
.aimk-bds .bds-stage { will-change: transform, opacity; }
.aimk-bds .bds-device { display: grid; grid-template-rows: auto minmax(0, 1fr); overflow: hidden; border: 0.16cqmin solid color-mix(in srgb, var(--border, #475569) 85%, transparent);
  border-radius: calc(var(--radius, 2cqmin) * 1.3); background: color-mix(in srgb, var(--surface, #0b1016) 96%, var(--bds-accent)); box-shadow: 0 3cqh 9cqh color-mix(in srgb, var(--bg, #000000) 45%, transparent); }
.aimk-bds .bds-browser, .aimk-bds .bds-window { width: min(82cqw, 126cqh); aspect-ratio: 16 / 10; }
.aimk-bds .bds-phone { position: relative; grid-template-rows: minmax(0, 1fr); height: min(86cqh, 168cqw); aspect-ratio: 9 / 19; padding: 1.7cqmin; border-radius: 7cqmin; }
.aimk-bds .bds-bar { display: flex; align-items: center; gap: var(--space-2, 2.2cqmin); padding: 1.5cqmin 2.4cqmin; border-bottom: 0.14cqmin solid color-mix(in srgb, var(--border, #475569) 60%, transparent);
  background: color-mix(in srgb, var(--surface, #0b1016) 80%, var(--bg, #05070c)); }
.aimk-bds .bds-phone .bds-bar { display: none; }
.aimk-bds .bds-dots, .aimk-bds .bds-bar::after { display: flex; flex: 0 0 5.5cqmin; gap: 0.95cqmin; }
.aimk-bds .bds-bar::after { content: ""; }
.aimk-bds .bds-dots i { width: 1.15cqmin; height: 1.15cqmin; border-radius: 50%; background: color-mix(in srgb, var(--fg, #f8fafc) 26%, transparent); }
.aimk-bds .bds-pill { display: block; min-width: 36%; max-width: 62%; margin: 0 auto; padding: 0.75cqmin 2.6cqmin; overflow: hidden; border: 0.14cqmin solid color-mix(in srgb, var(--border, #475569) 50%, transparent);
  border-radius: 999px; background: color-mix(in srgb, var(--bg, #05070c) 55%, var(--surface, #0b1016)); color: var(--muted, #8b93a3); font-family: "RMono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 2cqmin; line-height: 1.5; white-space: nowrap; text-align: center; text-overflow: ellipsis; }
.aimk-bds .bds-bartitle { display: block; margin: 0 auto; padding: 0.4cqmin 0; overflow: hidden; color: color-mix(in srgb, var(--fg, #f8fafc) 78%, transparent); font-size: 2.15cqmin; font-weight: 600;
  letter-spacing: 0.02em; line-height: 1.5; white-space: nowrap; text-overflow: ellipsis; }
.aimk-bds .bds-browser .bds-bartitle, .aimk-bds .bds-window .bds-pill { display: none; }
.aimk-bds .bds-notch { display: none; }
.aimk-bds .bds-phone .bds-notch { display: block; position: absolute; z-index: 2; top: 3cqmin; left: 50%; width: 26%; height: 2.2cqmin; transform: translateX(-50%); border-radius: 999px; background: color-mix(in srgb, var(--bg, #05070c) 72%, #000000); }
.aimk-bds .bds-screen { position: relative; overflow: hidden; background: color-mix(in srgb, var(--surface, #0b1016) 86%, var(--bg, #05070c)); }
.aimk-bds .bds-phone .bds-screen { border-radius: 5.4cqmin; }
.aimk-bds .bds-screen-a, .aimk-bds .bds-screen-b { position: absolute; inset: 0; overflow: hidden; }
.aimk-bds .bds-screen-a > img, .aimk-bds .bds-screen-b > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.aimk-bds .bds-skel { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
.aimk-bds .bds-skel-top { display: flex; align-items: center; gap: var(--space-1, 1.6cqmin); padding: 1.8cqmin 2.6cqmin; border-bottom: 0.14cqmin solid color-mix(in srgb, var(--border, #475569) 55%, transparent); }
.aimk-bds .bds-phone .bds-skel-top { padding-top: 6.4cqmin; }
.aimk-bds .bds-skel-mark { width: 2.6cqmin; height: 2.6cqmin; border-radius: 0.8cqmin; background: color-mix(in srgb, var(--bds-accent) 74%, var(--surface, #0b1016)); }
.aimk-bds .bds-skel-line { height: 1.25cqmin; border-radius: 999px; background: color-mix(in srgb, var(--fg, #f8fafc) 13%, transparent); }
.aimk-bds .bds-skel-top .bds-skel-line:nth-of-type(1) { width: 9cqmin; } .aimk-bds .bds-skel-top .bds-skel-line:nth-of-type(2) { width: 6.5cqmin; }
.aimk-bds .bds-skel-spring { flex: 1; }
.aimk-bds .bds-skel-chip { width: 8.5cqmin; height: 2.9cqmin; border: 0.14cqmin solid color-mix(in srgb, var(--bds-accent) 55%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--bds-accent) 28%, transparent); }
.aimk-bds .bds-skel-avatar { width: 2.8cqmin; height: 2.8cqmin; border-radius: 50%; background: color-mix(in srgb, var(--fg, #f8fafc) 18%, transparent); }
.aimk-bds .bds-skel-body { display: grid; grid-template-columns: 24% minmax(0, 1fr); min-height: 0; }
.aimk-bds .bds-phone .bds-skel-body { grid-template-columns: minmax(0, 1fr); }
.aimk-bds .bds-skel-side { display: flex; flex-direction: column; gap: 2cqmin; padding: 2.6cqmin 2.6cqmin; border-right: 0.14cqmin solid color-mix(in srgb, var(--border, #475569) 55%, transparent); }
.aimk-bds .bds-phone .bds-skel-side { display: none; }
.aimk-bds .bds-skel-side .bds-skel-line:nth-child(1) { width: 78%; background: color-mix(in srgb, var(--fg, #f8fafc) 22%, transparent); }
.aimk-bds .bds-skel-side .bds-skel-line:nth-child(2) { width: 56%; } .aimk-bds .bds-skel-side .bds-skel-line:nth-child(3) { width: 66%; }
.aimk-bds .bds-skel-side .bds-skel-line:nth-child(4) { width: 44%; } .aimk-bds .bds-skel-side .bds-skel-line:nth-child(5) { width: 60%; }
.aimk-bds .bds-skel-main { display: flex; flex-direction: column; gap: var(--space-2, 1.8cqmin); min-height: 0; padding: var(--space-3, 2.8cqmin); }
.aimk-bds .bds-skel-heading { width: 34%; height: 2.5cqmin; border-radius: 999px; background: color-mix(in srgb, var(--fg, #f8fafc) 21%, transparent); }
.aimk-bds .bds-skel-sub { width: 52%; height: 1.25cqmin; border-radius: 999px; background: color-mix(in srgb, var(--fg, #f8fafc) 9%, transparent); }
.aimk-bds .bds-skel-cards { display: grid; flex: 1; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2.1cqmin; min-height: 0; margin-top: 0.8cqmin; }
.aimk-bds .bds-phone .bds-skel-cards { grid-template-columns: minmax(0, 1fr); }
.aimk-bds .bds-skel-card { display: flex; flex-direction: column; gap: 1.5cqmin; min-height: 0; padding: 2.1cqmin; border: 0.14cqmin solid color-mix(in srgb, var(--border, #475569) 60%, transparent);
  border-radius: var(--radius, 1.6cqmin); background: color-mix(in srgb, var(--bg, #05070c) 30%, transparent); }
.aimk-bds .bds-skel-card .bds-skel-line { width: 55%; }
.aimk-bds .bds-skel-block { flex: 1; min-height: 3cqmin; border-radius: calc(var(--radius, 1.6cqmin) * 0.6); background: color-mix(in srgb, var(--fg, #f8fafc) 7%, transparent); }
.aimk-bds .bds-skel-card:nth-child(1) .bds-skel-block { background: color-mix(in srgb, var(--bds-accent) 17%, transparent); }
.aimk-bds .bds-skel-b .bds-skel-heading { width: 24%; } .aimk-bds .bds-skel-b .bds-skel-sub { width: 38%; }
.aimk-bds .bds-skel-b .bds-skel-cards { grid-template-columns: 2fr 1fr; }
.aimk-bds .bds-phone .bds-skel-b .bds-skel-cards { grid-template-columns: minmax(0, 1fr); }
.aimk-bds .bds-skel-b .bds-skel-card:nth-child(3) { grid-column: 1 / -1; }
.aimk-bds .bds-skel-b .bds-skel-card:nth-child(1) .bds-skel-block { background: color-mix(in srgb, var(--fg, #f8fafc) 7%, transparent); }
.aimk-bds .bds-skel-b .bds-skel-card:nth-child(2) .bds-skel-block { background: color-mix(in srgb, var(--bds-accent) 17%, transparent); }`);
    const card = '<div class="bds-skel-card"><span class="bds-skel-line"></span><span class="bds-skel-block"></span></div>';
    const SKEL = '<div class="bds-skel-top"><span class="bds-skel-mark"></span><span class="bds-skel-line"></span><span class="bds-skel-line"></span><span class="bds-skel-spring"></span><span class="bds-skel-chip"></span><span class="bds-skel-avatar"></span></div>'
      + '<div class="bds-skel-body"><div class="bds-skel-side">' + '<span class="bds-skel-line"></span>'.repeat(5) + '</div><div class="bds-skel-main"><span class="bds-skel-heading"></span><span class="bds-skel-sub"></span>'
      + '<div class="bds-skel-cards">' + card.repeat(3) + '</div></div></div>';
    const t0 = p.at;
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cqh = v => +(v * H / 100).toFixed(2);
      const chromeKind = ["window", "phone"].includes(p.chrome) ? p.chrome : "browser";
      const wrap = ctx.make(slot, "div", "bds", { cls: "aimk-bds", style: { "--bg": p.bg, "--fg": p.fg, "--surface": p.surface, "--border": p.border, "--bds-accent": p.accent } });
      const clip = ctx.make(wrap, "div", "clip", { cls: "bds-clip" });
      const stage = ctx.make(clip, "div", "stage", { cls: "bds-stage" });
      const device = ctx.make(stage, "div", "device", { cls: "bds-device bds-" + chromeKind });
      const bar = ctx.make(device, "div", "bar", { cls: "bds-bar", html: '<span class="bds-dots" aria-hidden="true"><i></i><i></i><i></i></span>' });
      ctx.make(bar, "span", "pill", { cls: "bds-pill", text: p.title }); ctx.make(bar, "span", "bartitle", { cls: "bds-bartitle", text: p.title });
      ctx.make(device, "span", "notch", { cls: "bds-notch", attrs: { "aria-hidden": "true" } });
      const screen = ctx.make(device, "div", "screen", { cls: "bds-screen" });
      const screenA = ctx.make(screen, "div", "a", { cls: "bds-screen-a" });
      if (p.screen) ctx.make(screenA, "img", "img", { attrs: { src: src(p.screen), alt: "" } }); else ctx.make(screenA, "div", "skel", { cls: "bds-skel", html: SKEL, attrs: { "aria-hidden": "true" } });
      const swapAt = isFinite(+p.swap_at) && +p.swap_at > 0 ? +p.swap_at : 0;
      let screenB = null;
      if (swapAt) { screenB = ctx.make(screen, "div", "b", { cls: "bds-screen-b" });
        if (p.screen_b) ctx.make(screenB, "img", "img", { attrs: { src: src(p.screen_b), alt: "" } }); else ctx.make(screenB, "div", "skel", { cls: "bds-skel bds-skel-b", html: SKEL, attrs: { "aria-hidden": "true" } }); }
      /* envelope (source): IN 0.9 s, OUT 0.5 s when exiting, swap 0.55 s, stillness 0.35 s; elastic hold */
      const exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
      const IN_BASE = 0.9, OUT_BASE = exitMode === "none" ? 0 : 0.5, SWAP_BASE = 0.55, STILLNESS = 0.35, duration = Math.max(0.001, +p.duration || 5);
      const totalBase = IN_BASE + OUT_BASE, k = duration < totalBase ? duration / totalBase : 1, IN = IN_BASE * k, OUT = OUT_BASE * k;
      const HOLD = Math.max(0, duration - (IN + OUT)), OUT_START = IN + HOLD;
      tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: IN * 0.66, ease: "power2.out" }, t0);
      tl.fromTo(stage, { y: cqh(4.5) }, { y: 0, duration: IN, ease: "power3.out" }, t0);
      tl.fromTo(stage, { scale: 0.965, transformOrigin: "50% 60%" }, { scale: 1, transformOrigin: "50% 60%", duration: IN, ease: "power2.out" }, t0);
      let driftHalf = Math.max(0, HOLD - STILLNESS) / 2;
      if (driftHalf >= 0.25) { driftHalf = Math.min(driftHalf, 1.6);
        tl.to(stage, { y: -cqh(0.5), duration: driftHalf, ease: "sine.inOut" }, t0 + IN);
        tl.to(stage, { y: 0, duration: driftHalf, ease: "sine.inOut" }, t0 + IN + driftHalf); }
      if (screenB) { const SWAP = SWAP_BASE * k, latest = Math.max(IN, duration - OUT - SWAP - 0.05), swapStart = Math.min(Math.max(swapAt, IN), latest), half = SWAP / 2;
        tl.fromTo(screenA, { opacity: 1 }, { opacity: 0, duration: half, ease: "power1.in" }, t0 + swapStart);
        tl.fromTo(screenB, { opacity: 0, y: cqh(1.6) }, { opacity: 1, y: 0, duration: half, ease: "power2.out" }, t0 + swapStart + half); }
      if (exitMode !== "none") { tl.to(stage, { opacity: 0, duration: OUT, ease: "power2.in" }, t0 + OUT_START);
        if (exitMode === "up") tl.to(stage, { y: -cqh(4), duration: OUT, ease: "power2.in" }, t0 + OUT_START); }
    }
  },
});
