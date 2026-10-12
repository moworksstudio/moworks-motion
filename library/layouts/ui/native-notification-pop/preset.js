/* ui/native-notification-pop: ONE system-style notification banner (iOS or macOS) drops in over the scene on an underdamped spring: fast arrival, soft overshoot, settled mass, backdrop blur,
   app dot, small-caps app label, title, one body line. It holds dead still and leaves only through `exit` (up = tucks back off the top, fade).
   Port of HyperFrames registry component native-notification-pop. BLOCK: the target is an empty box (usually the whole frame); the banner is built inside it, over an optional token backdrop
   (soft colour fields + a skeleton card so the blur has something to smear; `backdrop: false` leaves the box empty so the banner drops over your own scene). Sizes that were container units
   (cqw / cqh / cqmin) are px of the target box (1 % of its width / height / smaller side).
   Spring law kept: y(t) = -offset * e^(-zeta w t) * (cos(wd t) + (zeta w / wd) sin(wd t)), w = 15, zeta = 0.74, sampled from a linear driver by ctx.code (the position is a pure function of
   time), drop 0.9 s, first contact with rest at about 0.31 s, pinned to 0 after the drop. The drop starts at `at`; exit (0.45 s power2.in) starts `exitAt` seconds after it. */
AIMK.preset("ui/native-notification-pop", {
  params: { title: "Kết xuất hoàn tất", body: "launch-cut.mp4 đã sẵn sàng để xem lại", app_label: "HyperFrames", os: "ios", accent: "#22c55e", exit: "none", exitAt: 2.25, backdrop: true,
    bg: "#07111f", fg: "#f8fafc", surface: "#172033", border: "#334155", muted: "#94a3b8", brand: "#22c55e", accent2: "#c5a3ff" },
  build(tl, els, p, ctx) {
    ctx.css("ui/native-notification-pop", `
.uinn { position: absolute; inset: 0; overflow: hidden; isolation: isolate; box-sizing: border-box; }
.uinn * { box-sizing: border-box; }
.uinn-default { position: absolute; inset: 0; display: grid; place-items: center; }
.uinn-anchor { position: absolute; inset: 0 0 auto 0; display: flex; z-index: 3; }
.uinn-banner { display: flex; align-items: center; border-style: solid; will-change: transform; }
.uinn-copy { flex: 1 1 auto; min-width: 0; }
.uinn-app, .uinn-title, .uinn-body { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.uinn-app { font-weight: 500; letter-spacing: 0.11em; line-height: 1.5; text-transform: uppercase; }
.uinn-title { font-weight: 600; line-height: 1.35; }
.uinn-body { font-weight: 400; line-height: 1.4; }`);
    const rgb = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const mix = (a, pct, b) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(v * pct + B[i] * (1 - pct))).join(",")})`; };
    const rgba = (c, a) => `rgba(${rgb(c).join(",")},${a})`;
    const mac = p.os === "macos", exit = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
    const DROP = 0.9, OUT = 0.45, OMEGA = 15, ZETA = 0.74, OMEGA_D = OMEGA * Math.sqrt(1 - ZETA * ZETA);
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, cw = sw / 100, ch = sh / 100, cm = Math.min(sw, sh) / 100, f = n => +n.toFixed(2) + "px";
      const root = ctx.make(slot, "div", "root", { cls: "uinn", style: { color: p.fg } });
      if (p.backdrop) {
        const bd = ctx.make(root, "div", "scene", { cls: "uinn-default", style: { background: `radial-gradient(${f(50 * cw)} ${f(42 * ch)} at 24% 12%, ${rgba(p.brand, 0.34)} 0%, transparent 70%), radial-gradient(${f(46 * cw)} ${f(40 * ch)} at 82% 26%, ${rgba(p.accent2, 0.3)} 0%, transparent 70%), radial-gradient(ellipse at 50% 90%, ${mix(p.surface, 0.8, p.bg)} 0%, ${p.bg} 78%)` } });
        const card = ctx.make(bd, "div", "card", { style: { width: f(52 * cw), padding: `${f(4 * ch)} ${f(4 * cw)}`, border: `${f(0.16 * cm)} solid ${p.border}`, borderRadius: f(2.4 * cm), background: mix(p.surface, 0.88, p.bg) } });
        ctx.make(card, "div", "bar", { style: { width: "34%", height: f(4.2 * ch), marginBottom: f(4 * ch), borderRadius: f(1.2 * ch), background: p.muted, opacity: "0.55" } });
        [["90%", "0.38"], ["62%", "0.38"]].forEach(([wd, op], i) => ctx.make(card, "div", "l" + i, { style: { width: wd, height: f(2.2 * ch), marginBottom: f(2.6 * ch), borderRadius: f(1.2 * ch), background: p.muted, opacity: op } }));
      }
      const anchor = ctx.make(root, "div", "anchor", { cls: "uinn-anchor", style: mac ? { justifyContent: "flex-end", padding: `${f(3.5 * ch)} ${f(2.2 * cw)} 0 0` } : { justifyContent: "center", paddingTop: f(4.5 * ch) } });
      const copyH = (p.app_label ? 1.9 * 1.5 : 0) + 2.7 * 1.35 + 2.4 * 1.4;                                  // cqmin: app + title + body lines
      const padV = mac ? 2.2 : 2.6, padH = mac ? 2.6 : 3, bannerH = copyH + 2 * padV + 0.28;
      const offset = Math.max(1, (mac ? 3.5 * ch : 4.5 * ch) + bannerH * cm + 4);
      const banner = ctx.make(anchor, "div", "banner", { cls: "uinn-banner", style: { gap: f(2.4 * cm), height: f(bannerH * cm), width: f((mac ? 38 : 58) * cw), borderRadius: f((mac ? 2.2 : 3.6) * cm), padding: `${f(padV * cm)} ${f(padH * cm)}`,
        borderWidth: f(0.14 * cm), borderColor: rgba(p.fg, 0.16), background: rgba(p.surface, 0.62), WebkitBackdropFilter: `blur(${f(3.2 * cm)}) saturate(140%)`, backdropFilter: `blur(${f(3.2 * cm)}) saturate(140%)`,
        boxShadow: `0 ${f(2.4 * ch)} ${f(7 * ch)} ${rgba(p.bg, 0.5)}` } });
      ctx.make(banner, "div", "dot", { style: { flex: "0 0 auto", width: f((mac ? 4.6 : 5.4) * cm), aspectRatio: "1", borderRadius: mac ? "24%" : "30%", background: `linear-gradient(160deg, ${mix(p.accent, 0.72, p.fg)} 0%, ${p.accent} 62%)` } });
      const copy = ctx.make(banner, "div", "copy", { cls: "uinn-copy" });
      if (p.app_label) ctx.make(copy, "div", "app", { cls: "uinn-app", text: p.app_label, style: { color: p.muted, fontSize: f(1.9 * cm) } });
      ctx.make(copy, "div", "title", { cls: "uinn-title", text: p.title, style: { color: p.fg, fontSize: f(2.7 * cm) } });
      ctx.make(copy, "div", "body", { cls: "uinn-body", text: p.body, style: { color: p.muted, fontSize: f(2.4 * cm) } });
      const t = p.at, off = +offset.toFixed(2);
      tl.set(banner, { y: -off }, 0);
      /* the spring: a linear driver samples the closed form every frame (a pure function of time), then the banner is pinned to rest */
      const v = "nn_" + banner.id.replace(/\W/g, "_");
      ctx.code(`  const ${v} = { t: 0 };  // native-notification-pop #${banner.id}
  tl.fromTo(${v}, { t: 0 }, { t: ${DROP}, duration: ${DROP}, ease: "none", onUpdate: () => { const t = ${v}.t;
    const e = Math.exp(-${ZETA} * ${OMEGA} * t) * (Math.cos(${OMEGA_D.toFixed(6)} * t) + ((${ZETA} * ${OMEGA}) / ${OMEGA_D.toFixed(6)}) * Math.sin(${OMEGA_D.toFixed(6)} * t));
    gsap.set(document.getElementById("${banner.id}"), { y: -${off} * e }); } }, ${+t.toFixed(4)});`);
      tl.set(banner, { y: 0 }, t + DROP);
      if (exit === "up") tl.to(banner, { y: -off, duration: OUT, ease: "power2.in" }, t + p.exitAt);
      else if (exit === "fade") tl.to(banner, { opacity: 0, duration: OUT, ease: "power2.in" }, t + p.exitAt);
    }
  },
});
