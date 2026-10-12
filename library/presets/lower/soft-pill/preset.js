/* lower/soft-pill: a white pill scales up from its lower-left corner with a springy overshoot, a coral dot pops in, name and role settle.
   Port of HyperFrames registry block lt-soft-pill (layout, colours and timing as in the source; the film's font instead of Montserrat: no network
   in films). BLOCK: built inside the target box. Exit (source: 4.3 s): settle down and fade, params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("lower/soft-pill", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", pill: "#ffffff", dot: "#ff5a36", left: 120, bottom: 120, exitAt: 4.3 },
  build(tl, els, p, ctx) {
    ctx.css("lower/soft-pill", `
.ltsp { position: absolute; }
.ltsp-pill { display: flex; align-items: center; gap: 22px; border-radius: 999px; padding: 20px 40px 20px 26px; box-shadow: 0 16px 46px rgba(15,17,21,.2);
  transform-origin: 0% 100%; }
.ltsp-dot { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; }
.ltsp-text { display: flex; flex-direction: column; gap: 4px; }
.ltsp-name { font-size: 46px; font-weight: 700; color: #0f1115; line-height: 1.04; letter-spacing: -0.015em; white-space: nowrap; }
.ltsp-role { font-size: 25px; font-weight: 400; color: #5a6170; line-height: 1.2; letter-spacing: 0.01em; white-space: nowrap; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltsp", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const pill = ctx.make(lt, "div", "pill", { cls: "ltsp-pill", style: { background: p.pill } });
      const dot = ctx.make(pill, "div", "dot", { cls: "ltsp-dot", style: { background: p.dot } });
      const text = ctx.make(pill, "div", "text", { cls: "ltsp-text" });
      const name = ctx.make(text, "div", "name", { cls: "ltsp-name", text: p.name });
      const role = ctx.make(text, "div", "role", { cls: "ltsp-role", text: p.role });
      const t = p.at;
      tl.fromTo(pill, { scale: 0.88, y: 18, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.7)" }, t + 0.1);
      tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, t + 0.4);
      tl.fromTo(name, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, t + 0.42);
      tl.fromTo(role, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, t + 0.5);
      if (p.exitAt != null) tl.to(pill, { scale: 0.94, y: 14, opacity: 0, duration: 0.35, ease: "power2.in" }, t + p.exitAt);
    }
  },
});
