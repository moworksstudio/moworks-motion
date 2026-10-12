/* device/parallax-device-dive: a CSS phone with a small dashboard app rises in (power3.out, past rest) and settles, floats once, then the
   camera dives into the screen: the phone scales to 6.4 (power4.in) while its header, hero card and stat cards separate in depth (parallax),
   the cutout fades, and the layers settle back.
   Port of HyperFrames registry component parallax-device-dive. BLOCK: the target is any box (sizes in container units of that box).
   Every tween is the source's, written literally (cq values converted to px of the box). */
AIMK.preset("device/parallax-device-dive", {
  params: {
    accent: "#a1a1aa", kicker: "Tổng quan", app_title: "Điều khiển", avatar: "MA",
    hero_label: "Hoạt động tuần", value: "24,8k", delta: "+18%",
    stat1_label: "Chuyển đổi", stat1_value: "8,4%", stat2_label: "Người dùng", stat2_value: "12.604",
    duration: 4.5,
  },
  build(tl, els, p, ctx) {
    const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    ctx.css("device/parallax-device-dive", `
.aimk-pdd { position: absolute; inset: 0; overflow: hidden; container-type: size; isolation: isolate; background: #0b0c0e; color: #f8fafc; font-family: inherit; }
.aimk-pdd *, .aimk-pdd *::before, .aimk-pdd *::after { box-sizing: border-box; }
.aimk-pdd .pdd-clip, .aimk-pdd .pdd-camera { position: absolute; inset: 0; }
.aimk-pdd .pdd-clip { overflow: hidden; background: radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--pdd-accent) 17%, transparent), transparent 34%), #0b0c0e; }
.aimk-pdd .pdd-camera { display: grid; place-items: center; perspective: 125cqw; }
.aimk-pdd .pdd-phone { position: relative; height: 82cqh; aspect-ratio: 9 / 19.5; padding: 0.72cqh; border: 0.08cqw solid rgba(255, 255, 255, 0.28); border-radius: 4.4cqh;
  background: linear-gradient(145deg, #3c4049, #17191e 44%, #08090c); box-shadow: 0 4.8cqh 10cqh rgba(0, 0, 0, 0.5), 0 1.4cqh 3cqh rgba(0, 0, 0, 0.4), inset 0 0.12cqh 0 rgba(255, 255, 255, 0.3), inset 0 0 0 0.08cqw rgba(0, 0, 0, 0.72);
  transform-origin: 50% 50%; will-change: transform, opacity; }
.aimk-pdd .pdd-screen { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 3.72cqh; background: #f4f6fb; box-shadow: inset 0 0 0 0.08cqw rgba(15, 23, 42, 0.28); color: #111827; isolation: isolate; }
.aimk-pdd .pdd-app-glow { position: absolute; inset: 0; background: radial-gradient(circle at 76% 8%, color-mix(in srgb, var(--pdd-accent) 28%, transparent), transparent 31%), linear-gradient(180deg, #ffffff, #eef2f8); }
.aimk-pdd .pdd-cutout { position: absolute; z-index: 10; top: 1.2cqh; left: 50%; width: 7.2cqh; height: 2.1cqh; border-radius: 1.2cqh; background: #050607; transform: translateX(-50%); }
.aimk-pdd .pdd-ui { position: absolute; inset: 0; padding: 6.2cqh 2.1cqh 2.2cqh; display: flex; flex-direction: column; gap: 1.55cqh; }
.aimk-pdd .pdd-header, .aimk-pdd .pdd-hero, .aimk-pdd .pdd-stats { position: relative; z-index: 2; transform-origin: 50% 50%; will-change: transform; }
.aimk-pdd .pdd-header { display: flex; align-items: center; justify-content: space-between; }
.aimk-pdd .pdd-heading { min-width: 0; }
.aimk-pdd .pdd-kicker { color: #788397; font-size: 0.75cqw; font-weight: 700; letter-spacing: 0.12em; line-height: 1; text-transform: uppercase; }
.aimk-pdd .pdd-title { max-width: 13cqw; overflow: hidden; color: #111827; font-size: 1.5cqw; font-weight: 780; letter-spacing: -0.04em; line-height: 1.12; text-overflow: ellipsis; white-space: nowrap; }
.aimk-pdd .pdd-avatar { flex: 0 0 auto; width: 3.7cqh; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; background: var(--pdd-accent); color: #ffffff; font-size: 0.72cqw; font-weight: 800;
  box-shadow: 0 0.55cqh 1.4cqh color-mix(in srgb, var(--pdd-accent) 32%, transparent); }
.aimk-pdd .pdd-hero { min-height: 24cqh; padding: 2.1cqh; overflow: hidden; border: 0.08cqw solid rgba(255, 255, 255, 0.12); border-radius: 2.1cqh; background: #101722; box-shadow: 0 1.7cqh 3.8cqh rgba(15, 23, 42, 0.2); }
.aimk-pdd .pdd-hero-label { color: #a9b4c7; font-size: 0.72cqw; font-weight: 650; }
.aimk-pdd .pdd-value { margin-top: 0.45cqh; color: #ffffff; font-size: 2.15cqw; font-weight: 790; letter-spacing: -0.055em; line-height: 1; }
.aimk-pdd .pdd-value span { color: var(--pdd-accent); font-size: 0.76cqw; letter-spacing: 0; }
.aimk-pdd .pdd-chart { position: absolute; left: 2.1cqh; right: 2.1cqh; bottom: 2.2cqh; height: 8.2cqh; display: flex; align-items: end; gap: 0.55cqh; }
.aimk-pdd .pdd-bar { flex: 1 1 0; min-width: 0; border-radius: 0.55cqh 0.55cqh 0.18cqh 0.18cqh; background: color-mix(in srgb, var(--pdd-accent) 38%, #263244); }
.aimk-pdd .pdd-bar:nth-child(1) { height: 38%; } .aimk-pdd .pdd-bar:nth-child(2) { height: 54%; } .aimk-pdd .pdd-bar:nth-child(3) { height: 46%; }
.aimk-pdd .pdd-bar:nth-child(4) { height: 72%; } .aimk-pdd .pdd-bar:nth-child(5) { height: 64%; }
.aimk-pdd .pdd-bar:nth-child(6) { height: 92%; background: var(--pdd-accent); box-shadow: 0 0.55cqh 1.5cqh color-mix(in srgb, var(--pdd-accent) 30%, transparent); }
.aimk-pdd .pdd-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15cqh; }
.aimk-pdd .pdd-stat { min-height: 11.5cqh; padding: 1.55cqh; border: 0.08cqw solid rgba(55, 65, 81, 0.08); border-radius: 1.7cqh; background: rgba(255, 255, 255, 0.94); box-shadow: 0 1.1cqh 2.6cqh rgba(71, 85, 105, 0.12); }
.aimk-pdd .pdd-stat-label { color: #7b8799; font-size: 0.65cqw; font-weight: 650; }
.aimk-pdd .pdd-stat-value { margin-top: 1cqh; color: #18202d; font-size: 1.25cqw; font-weight: 780; letter-spacing: -0.035em; }
.aimk-pdd .pdd-stat-value span { color: var(--pdd-accent); }`);
    const t0 = p.at;
    for (const slot of els) {
      const H = slot.offsetHeight || ctx.H, cqh = v => +(v * H / 100).toFixed(2);
      const wrap = ctx.make(slot, "div", "pdd", { cls: "aimk-pdd", style: { "--pdd-accent": p.accent } });
      const cam = ctx.make(ctx.make(wrap, "div", "clip", { cls: "pdd-clip" }), "div", "cam", { cls: "pdd-camera" });
      const phone = ctx.make(cam, "div", "phone", { cls: "pdd-phone" });
      const screen = ctx.make(phone, "div", "screen", { cls: "pdd-screen" });
      ctx.make(screen, "div", "glow", { cls: "pdd-app-glow" });
      const ui = ctx.make(screen, "div", "ui", { cls: "pdd-ui" });
      const header = ctx.make(ui, "div", "header", { cls: "pdd-header", html: `<div class="pdd-heading"><div class="pdd-kicker">${esc(p.kicker)}</div><div class="pdd-title">${esc(p.app_title)}</div></div><div class="pdd-avatar">${esc(p.avatar)}</div>` });
      const hero = ctx.make(ui, "div", "hero", { cls: "pdd-hero", html: `<div class="pdd-hero-label">${esc(p.hero_label)}</div><div class="pdd-value">${esc(p.value)} <span>${esc(p.delta)}</span></div>`
        + `<div class="pdd-chart" aria-hidden="true">${'<span class="pdd-bar"></span>'.repeat(6)}</div>` });
      const stats = ctx.make(ui, "div", "stats", { cls: "pdd-stats", html: `<div class="pdd-stat"><div class="pdd-stat-label">${esc(p.stat1_label)}</div><div class="pdd-stat-value"><span>${esc(p.stat1_value)}</span></div></div>`
        + `<div class="pdd-stat"><div class="pdd-stat-label">${esc(p.stat2_label)}</div><div class="pdd-stat-value">${esc(p.stat2_value)}</div></div>` });
      const cutout = ctx.make(phone, "div", "cutout", { cls: "pdd-cutout", attrs: { "aria-hidden": "true" } });
      /* envelope (source): IN 1.05 s (rise 78 % + settle), OUT 1.65 s (dive 72 % + depth settle), elastic hold */
      const duration = Math.max(0.001, +p.duration || 4.5), IN_BASE = 1.05, OUT_BASE = 1.65, totalBase = IN_BASE + OUT_BASE;
      const k = duration < totalBase ? duration / totalBase : 1, IN = IN_BASE * k, OUT = OUT_BASE * k, HOLD = Math.max(0, duration - IN - OUT), OUT_START = IN + HOLD;
      const RISE = IN * 0.78, SETTLE = IN - RISE, DIVE = OUT * 0.72, DEPTH_SETTLE = OUT - DIVE;
      tl.fromTo(phone, { opacity: 0, y: cqh(18), scale: 0.86 }, { opacity: 1, y: -cqh(1), scale: 1.02, duration: RISE, ease: "power3.out" }, t0);
      tl.to(phone, { y: 0, scale: 1, duration: SETTLE, ease: "power2.out" }, t0 + RISE);
      if (HOLD > 0) { tl.to(phone, { y: -cqh(0.55), duration: HOLD * 0.5, ease: "sine.inOut" }, t0 + IN); tl.to(phone, { y: 0, duration: HOLD * 0.5, ease: "sine.inOut" }, t0 + IN + HOLD * 0.5); }
      tl.to(phone, { scale: 6.4, y: cqh(2.4), duration: OUT, ease: "power4.in" }, t0 + OUT_START);
      tl.fromTo(cutout, { opacity: 1 }, { opacity: 0, duration: DIVE * 0.45, ease: "power2.out" }, t0 + OUT_START);
      tl.fromTo(header, { y: 0, scale: 1 }, { y: -cqh(1.2), scale: 1.035, duration: DIVE, ease: "power4.in" }, t0 + OUT_START);
      tl.fromTo(hero, { y: 0, scale: 1 }, { y: -cqh(2.1), scale: 1.09, duration: DIVE, ease: "power4.in" }, t0 + OUT_START);
      tl.fromTo(stats, { y: 0, scale: 1 }, { y: cqh(2.4), scale: 1.16, duration: DIVE, ease: "power4.in" }, t0 + OUT_START);
      [header, hero, stats].forEach(e => tl.to(e, { y: 0, scale: 1, duration: DEPTH_SETTLE, ease: "power4.out" }, t0 + OUT_START + DIVE));
    }
  },
});
