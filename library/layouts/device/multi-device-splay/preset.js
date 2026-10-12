/* device/multi-device-splay: a phone, a tablet and a desktop monitor (CSS devices with skeleton app screens) fan out from one stacked point
   into a splay (back.out(1.7), 0.12 s cascade), float in counter-phase during the hold, then drop and fade out together.
   Port of HyperFrames registry component multi-device-splay. BLOCK: the target is any box (sizes in container units of that box).
   Every tween is the source's, written literally (cqw / cqh values converted to px of the box). */
AIMK.preset("device/multi-device-splay", {
  params: { accent: "#8b5cf6", duration: 4.5 },
  build(tl, els, p, ctx) {
    ctx.css("device/multi-device-splay", `
.aimk-mds { position: absolute; inset: 0; overflow: hidden; container-type: size; isolation: isolate; pointer-events: none; }
.aimk-mds *, .aimk-mds *::before, .aimk-mds *::after { box-sizing: border-box; }
.aimk-mds .mds-clip, .aimk-mds .mds-stage { position: absolute; inset: 0; }
.aimk-mds .mds-stage { perspective: 120cqw; perspective-origin: 50% 48%; }
.aimk-mds .mds-positioner { position: absolute; left: 50%; top: 50%; transform-style: preserve-3d; will-change: transform, opacity; }
.aimk-mds .mds-positioner-desktop { z-index: 1; } .aimk-mds .mds-positioner-tablet { z-index: 2; } .aimk-mds .mds-positioner-phone { z-index: 3; }
.aimk-mds .mds-device { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); transform-origin: 50% 50%; }
.aimk-mds .mds-shell, .aimk-mds .mds-monitor { background: linear-gradient(145deg, #3a3d45, #1b1d22 43%, #0f1115); border: 0.12cqh solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 4.8cqh 9cqh rgba(0, 0, 0, 0.4), 0 1.3cqh 2.5cqh rgba(0, 0, 0, 0.28), inset 0 0.12cqh 0 rgba(255, 255, 255, 0.22), inset 0 0 0 0.1cqh rgba(0, 0, 0, 0.52); }
.aimk-mds .mds-phone { width: auto; height: 59cqh; aspect-ratio: 9 / 19.5; padding: 0.65cqh; border-radius: 4.1cqh; }
.aimk-mds .mds-tablet { width: auto; height: 64cqh; aspect-ratio: 3 / 4; padding: 0.82cqh; border-radius: 3.5cqh; }
.aimk-mds .mds-desktop { width: 44cqw; }
.aimk-mds .mds-monitor { width: 100%; aspect-ratio: 16 / 10; padding: 0.7cqh; border-radius: 2.1cqh; }
.aimk-mds .mds-stand-neck { width: 4.8cqw; height: 6.2cqh; margin: -0.1cqh auto 0; background: linear-gradient(90deg, #17191e, #3c3f47 48%, #121419); clip-path: polygon(24% 0, 76% 0, 92% 100%, 8% 100%); }
.aimk-mds .mds-stand-foot { width: 15cqw; height: 1.5cqh; margin: -0.05cqh auto 0; border-radius: 1cqh 1cqh 0.45cqh 0.45cqh; background: linear-gradient(180deg, #464952, #17191e); box-shadow: 0 1.2cqh 2.3cqh rgba(0, 0, 0, 0.34); }
.aimk-mds .mds-screen { position: relative; width: 100%; height: 100%; overflow: hidden; isolation: isolate; background: #f4f7fb; box-shadow: inset 0 0 0 0.1cqh rgba(15, 23, 42, 0.22);
  --mds-l1: rgba(15, 23, 42, 0.72); --mds-l2: rgba(15, 23, 42, 0.45); --mds-l3: rgba(15, 23, 42, 0.18); --mds-l4: rgba(15, 23, 42, 0.08); }
.aimk-mds .mds-phone .mds-screen { border-radius: 3.45cqh; } .aimk-mds .mds-tablet .mds-screen { border-radius: 2.7cqh; } .aimk-mds .mds-monitor .mds-screen { border-radius: 1.42cqh; }
.aimk-mds .mds-island { position: absolute; z-index: 5; left: 50%; top: 1.1cqh; width: 5.2cqw; height: 1.7cqh; border-radius: 2cqh; background: #07080a; transform: translateX(-50%); }
.aimk-mds .mds-camera { position: absolute; z-index: 5; left: 50%; top: 0.65cqh; width: 0.55cqh; height: 0.55cqh; border-radius: 50%; background: #0a0b0e; transform: translateX(-50%); }
.aimk-mds .mds-mobile-ui, .aimk-mds .mds-tablet-ui, .aimk-mds .mds-desktop-ui { position: absolute; inset: 0; color: #172033; }
.aimk-mds .mds-mobile-ui { padding: 5.4cqh 1.4cqw 1.8cqh; background: linear-gradient(180deg, #edf4ff, #f8fafc 40%); }
.aimk-mds .mds-mobile-header, .aimk-mds .mds-tablet-header, .aimk-mds .mds-desktop-toolbar { display: flex; align-items: center; }
.aimk-mds .mds-mobile-header { justify-content: space-between; margin-bottom: 2.1cqh; }
.aimk-mds .mds-logo { width: 2.1cqh; height: 2.1cqh; border-radius: 0.65cqh; background: var(--mds-accent); box-shadow: 0 0.7cqh 1.4cqh color-mix(in srgb, var(--mds-accent) 30%, transparent); }
.aimk-mds .mds-line { height: 0.7cqh; border-radius: 1cqh; background: #c4ccda; }
.aimk-mds .mds-mobile-header .mds-line { width: 5.4cqw; }
.aimk-mds .mds-mobile-hero { height: 12cqh; margin-bottom: 1.6cqh; border-radius: 1.4cqh; background: var(--mds-l3, rgba(15, 23, 42, 0.18)); box-shadow: inset 0 0 0 0.1cqh rgba(15, 23, 42, 0.14); }
.aimk-mds .mds-mobile-row { display: grid; grid-template-columns: 2.6cqh 1fr; gap: 0.75cqw; align-items: center; height: 5.8cqh; margin-top: 1cqh; padding: 0.8cqh 0.75cqw; border-radius: 1.1cqh; background: white; box-shadow: 0 0.55cqh 1.3cqh rgba(30, 41, 59, 0.08); }
.aimk-mds .mds-mobile-icon { width: 2.6cqh; height: 2.6cqh; border-radius: 0.8cqh; background: var(--mds-l3, rgba(15, 23, 42, 0.18)); }
.aimk-mds .mds-mobile-row .mds-line:first-child { width: 70%; margin-bottom: 0.7cqh; background: #8e99ab; }
.aimk-mds .mds-mobile-row .mds-line:last-child { width: 46%; height: 0.5cqh; }
.aimk-mds .mds-tablet-ui { display: grid; grid-template-columns: 4.8cqw 1fr; background: #f6f8fc; }
.aimk-mds .mds-tablet-nav, .aimk-mds .mds-desktop-nav { background: #182033; }
.aimk-mds .mds-tablet-nav { padding: 4.4cqh 1.25cqw; }
.aimk-mds .mds-nav-mark { width: 2.3cqh; height: 2.3cqh; margin-bottom: 3cqh; border-radius: 0.7cqh; background: var(--mds-accent); }
.aimk-mds .mds-nav-line { width: 100%; height: 0.62cqh; margin-bottom: 1.5cqh; border-radius: 1cqh; background: rgba(255, 255, 255, 0.18); }
.aimk-mds .mds-nav-line-active { background: rgba(255, 255, 255, 0.72); }
.aimk-mds .mds-tablet-main { padding: 4.4cqh 1.5cqw 2.2cqh; }
.aimk-mds .mds-tablet-header { justify-content: space-between; margin-bottom: 2.5cqh; }
.aimk-mds .mds-tablet-header .mds-line:first-child { width: 8cqw; height: 1cqh; background: #657086; }
.aimk-mds .mds-tablet-header .mds-line:last-child { width: 4cqw; }
.aimk-mds .mds-tablet-hero { height: 12cqh; margin-bottom: 1.5cqh; border-radius: 1.25cqh; background: var(--mds-l4, rgba(15, 23, 42, 0.08)); box-shadow: inset 0 0 0 0.1cqh rgba(15, 23, 42, 0.14); }
.aimk-mds .mds-tablet-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.1cqh; }
.aimk-mds .mds-tablet-card { height: 10.5cqh; padding: 1.2cqh 0.9cqw; border-radius: 1.1cqh; background: white; box-shadow: 0 0.65cqh 1.5cqh rgba(30, 41, 59, 0.08); }
.aimk-mds .mds-tablet-card::before { content: ""; display: block; width: 2.2cqh; height: 2.2cqh; margin-bottom: 1.4cqh; border-radius: 0.65cqh; background: var(--mds-l3, rgba(15, 23, 42, 0.18)); }
.aimk-mds .mds-tablet-card::after { content: ""; display: block; width: 62%; height: 0.65cqh; border-radius: 1cqh; background: #aeb7c6; }
.aimk-mds .mds-desktop-ui { display: grid; grid-template-columns: 7.2cqw 1fr; grid-template-rows: 4.6cqh 1fr; background: #f6f8fc; }
.aimk-mds .mds-desktop-toolbar { grid-column: 1 / -1; gap: 0.55cqw; padding: 0 1.1cqw; border-bottom: 0.1cqh solid #dce2eb; background: white; }
.aimk-mds .mds-window-dot { width: 0.72cqh; height: 0.72cqh; border-radius: 50%; background: #c8ced8; }
.aimk-mds .mds-window-dot-accent { background: var(--mds-accent); }
.aimk-mds .mds-address { width: 13cqw; height: 1.35cqh; margin-left: 1.2cqw; border-radius: 1cqh; background: #edf0f5; }
.aimk-mds .mds-desktop-nav { padding: 2.1cqh 1.1cqw; }
.aimk-mds .mds-desktop-nav .mds-nav-mark { margin-bottom: 2.1cqh; }
.aimk-mds .mds-desktop-main { padding: 2cqh 1.4cqw; }
.aimk-mds .mds-desktop-heading { width: 10cqw; height: 1.2cqh; margin-bottom: 2cqh; border-radius: 1cqh; background: #647086; }
.aimk-mds .mds-desktop-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85cqw; margin-bottom: 1.4cqh; }
.aimk-mds .mds-desktop-stat { height: 7.5cqh; border-radius: 0.9cqh; background: white; box-shadow: 0 0.55cqh 1.25cqh rgba(30, 41, 59, 0.07); }
.aimk-mds .mds-desktop-stat:first-child { background: var(--mds-l3, rgba(15, 23, 42, 0.18)); }
.aimk-mds .mds-desktop-chart { position: relative; height: 13cqh; overflow: hidden; border-radius: 1cqh; background: linear-gradient(to top, rgba(203, 213, 225, 0.38) 0.1cqh, transparent 0.1cqh) 0 0 / 100% 3.2cqh, white;
  box-shadow: 0 0.55cqh 1.25cqh rgba(30, 41, 59, 0.07); }
.aimk-mds .mds-desktop-chart::after { content: ""; position: absolute; left: 7%; right: 7%; bottom: 18%; height: 0.42cqh; border-radius: 1cqh; background: var(--mds-l2, rgba(15, 23, 42, 0.45));
  box-shadow: 3.5cqw -2.3cqh 0 var(--mds-l2, rgba(15, 23, 42, 0.45)), 7cqw -1.1cqh 0 var(--mds-l2, rgba(15, 23, 42, 0.45)), 10.5cqw -4.6cqh 0 var(--mds-l2, rgba(15, 23, 42, 0.45)),
    14cqw -3.6cqh 0 var(--mds-l2, rgba(15, 23, 42, 0.45)), 17.5cqw -6.7cqh 0 var(--mds-l2, rgba(15, 23, 42, 0.45)); }`);
    const DESKTOP = '<div class="mds-device mds-desktop"><div class="mds-monitor"><div class="mds-screen"><div class="mds-desktop-ui"><div class="mds-desktop-toolbar"><span class="mds-window-dot mds-window-dot-accent"></span>'
      + '<span class="mds-window-dot"></span><span class="mds-window-dot"></span><span class="mds-address"></span></div><div class="mds-desktop-nav"><div class="mds-nav-mark"></div><div class="mds-nav-line mds-nav-line-active"></div>'
      + '<div class="mds-nav-line"></div><div class="mds-nav-line"></div><div class="mds-nav-line"></div></div><div class="mds-desktop-main"><div class="mds-desktop-heading"></div><div class="mds-desktop-stats">'
      + '<div class="mds-desktop-stat"></div><div class="mds-desktop-stat"></div><div class="mds-desktop-stat"></div></div><div class="mds-desktop-chart"></div></div></div></div></div><div class="mds-stand-neck"></div><div class="mds-stand-foot"></div></div>';
    const TABLET = '<div class="mds-device mds-shell mds-tablet"><div class="mds-screen"><span class="mds-camera"></span><div class="mds-tablet-ui"><div class="mds-tablet-nav"><div class="mds-nav-mark"></div>'
      + '<div class="mds-nav-line mds-nav-line-active"></div><div class="mds-nav-line"></div><div class="mds-nav-line"></div></div><div class="mds-tablet-main"><div class="mds-tablet-header"><div class="mds-line"></div><div class="mds-line"></div></div>'
      + '<div class="mds-tablet-hero"></div><div class="mds-tablet-grid">' + '<div class="mds-tablet-card"></div>'.repeat(4) + '</div></div></div></div></div>';
    const row = '<div class="mds-mobile-row"><span class="mds-mobile-icon"></span><span><span class="mds-line"></span><span class="mds-line"></span></span></div>';
    const PHONE = '<div class="mds-device mds-shell mds-phone"><div class="mds-screen"><span class="mds-island"></span><div class="mds-mobile-ui"><div class="mds-mobile-header"><span class="mds-logo"></span><span class="mds-line"></span></div>'
      + '<div class="mds-mobile-hero"></div>' + row.repeat(3) + '</div></div></div>';
    const t0 = p.at;
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cqw = v => +(v * W / 100).toFixed(2), cqh = v => +(v * H / 100).toFixed(2);
      const wrap = ctx.make(slot, "div", "mds", { cls: "aimk-mds", style: { "--mds-accent": p.accent } });
      const stage = ctx.make(ctx.make(wrap, "div", "clip", { cls: "mds-clip" }), "div", "stage", { cls: "mds-stage" });
      const desktop = ctx.make(stage, "div", "desktop", { cls: "mds-positioner mds-positioner-desktop", html: DESKTOP });
      const tablet = ctx.make(stage, "div", "tablet", { cls: "mds-positioner mds-positioner-tablet", html: TABLET });
      const phone = ctx.make(stage, "div", "phone", { cls: "mds-positioner mds-positioner-phone", html: PHONE });
      /* envelope (source): IN 1.35 s, OUT 0.55 s, elastic hold; fan 0.9 s back.out(1.7) with a 0.12 s cascade */
      const duration = Math.max(0.001, +p.duration || 4.5), IN_BASE = 1.35, OUT_BASE = 0.55, totalBase = IN_BASE + OUT_BASE;
      const k = duration < totalBase ? duration / totalBase : 1, IN = IN_BASE * k, OUT = OUT_BASE * k, HOLD = Math.max(0, duration - IN - OUT), OUT_START = IN + HOLD;
      const devices = [{ el: phone, x: -30, y: 3.5, r: -12, fy: -0.65, fr: -0.55 }, { el: tablet, x: -5, y: -1, r: 0, fy: 0.7, fr: 0.35 }, { el: desktop, x: 24, y: 2, r: 12, fy: -0.5, fr: 0.5 }];
      devices.forEach((d, i) => tl.fromTo(d.el, { x: 0, y: cqh(9), rotation: 0, scale: 0.9, opacity: 0 },
        { x: cqw(d.x), y: cqh(d.y), rotation: d.r, scale: 1, opacity: 1, duration: 0.9 * k, ease: "back.out(1.7)" }, t0 + i * 0.12 * k));
      if (HOLD > 0) devices.forEach(d => {
        tl.to(d.el, { y: cqh(d.y + d.fy), rotation: d.r + d.fr, duration: HOLD / 2, ease: "sine.inOut" }, t0 + IN);
        tl.to(d.el, { y: cqh(d.y), rotation: d.r, duration: HOLD / 2, ease: "sine.inOut" }, t0 + IN + HOLD / 2); });
      devices.forEach(d => tl.to(d.el, { y: cqh(d.y + 5), scale: 0.96, opacity: 0, duration: OUT, ease: "power2.in" }, t0 + OUT_START));
    }
  },
});
