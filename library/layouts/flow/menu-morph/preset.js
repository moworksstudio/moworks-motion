/* flow/menu-morph: a round menu button pops in, its three bars cross into an X, and a row of action pills fans out under it one after another.
   Port of HyperFrames registry component menu-morph (layout, colours, sizes and timing as in the source; font = the film's font, the source used Inter).
   BLOCK: the target is an empty box (usually the whole frame); the 360 x 220 widget is built in its middle and shown `scale` times larger, as the source demo does
   (a wrapper with transform: scale, never tweened). Source timing kept: button 0.34 s back.out(1.8) at 0.3; bars 0.24 s power2.inOut (outer bars y +-8 and rotation +-45)
   and the middle bar fading in 0.18 s power1.out at 0.78; pills y 28 + scale 0.86 + opacity, 0.26 s back.out(1.6), stagger 0.06 at 0.96. */
AIMK.preset("flow/menu-morph", {
  params: { actions: ["Văn bản", "Hình ảnh", "Âm thanh"], tone: "#18181b", size: 68, scale: 3.4, bar: "#ffffff", pill: "#ffffff", pillInk: "#18181b" },
  build(tl, els, p, ctx) {
    ctx.css("flow/menu-morph", `
.mnm-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.mnm { position: relative; width: 360px; height: 220px; display: grid; place-items: center; }
.mnm-btn { position: relative; z-index: 2; display: grid; place-items: center; align-content: center; gap: 5px; border-radius: 999px; box-shadow: 0 22px 58px rgba(0,0,0,.22); }
.mnm-bar { height: 3px; border-radius: 999px; }
.mnm-acts { position: absolute; left: 0; right: 0; bottom: 20px; display: flex; justify-content: center; gap: 10px; }
.mnm-pill { padding: 9px 13px; border-radius: 999px; font-size: 13px; font-weight: 850; white-space: nowrap; box-shadow: 0 14px 34px rgba(0,0,0,.12); }`);
    let acts = (Array.isArray(p.actions) ? p.actions : String(p.actions).split(",")).map(s => String(s).trim()).filter(Boolean).slice(0, 6);
    if (!acts.length) acts = ["Văn bản", "Hình ảnh", "Âm thanh"];
    const size = Math.min(112, Math.max(52, +p.size || 68)), t = p.at;
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "mnm-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const box = ctx.make(wrap, "div", "menu", { cls: "mnm" });
      const btn = ctx.make(box, "div", "btn", { cls: "mnm-btn", style: { width: size + "px", height: size + "px", background: p.tone } });
      const bars = [1, 2, 3].map(i => ctx.make(btn, "div", "bar" + i, { cls: "mnm-bar", style: { width: +(size * 6 / 17).toFixed(3) + "px", background: p.bar } }));
      const row = ctx.make(box, "div", "acts", { cls: "mnm-acts" });
      const pills = acts.map((a, i) => ctx.make(row, "div", "p" + (i + 1), { cls: "mnm-pill", text: a, style: { background: p.pill, color: p.pillInk } }));
      tl.fromTo(btn, { scale: 0.72, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "back.out(1.8)" }, t + 0.3);
      tl.fromTo(bars[0], { y: 0, rotation: 0 }, { y: 8, rotation: 45, duration: 0.24, ease: "power2.inOut" }, t + 0.78);
      tl.fromTo(bars[1], { opacity: 1 }, { opacity: 0, duration: 0.18, ease: "power1.out" }, t + 0.78);
      tl.fromTo(bars[2], { y: 0, rotation: 0 }, { y: -8, rotation: -45, duration: 0.24, ease: "power2.inOut" }, t + 0.78);
      tl.fromTo(pills, { y: 28, opacity: 0, scale: 0.86 }, { y: 0, opacity: 1, scale: 1, duration: 0.26, stagger: 0.06, ease: "back.out(1.6)" }, t + 0.96);
    }
  },
});
