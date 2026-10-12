/* lower/dark-card: a dark rounded card slides up, the name rises, an amber underline draws left to right, the role fades in.
   Port of HyperFrames registry block lt-dark-card (layout, colours and timing as in the source; the film's font instead of Montserrat: no network
   in films). BLOCK: built inside the target box. Exit (source: 4.3 s): slide down and fade, params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("lower/dark-card", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", card: "#16181d", accent: "#f5b942", left: 120, bottom: 110, exitAt: 4.3 },
  build(tl, els, p, ctx) {
    ctx.css("lower/dark-card", `
.ltdc { position: absolute; }
.ltdc-card { border-radius: 14px; padding: 24px 38px 26px 32px; box-shadow: 0 18px 50px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
.ltdc-name { font-size: 48px; font-weight: 700; color: #ffffff; line-height: 1.02; letter-spacing: -0.015em; white-space: nowrap; }
.ltdc-line { height: 4px; width: 100%; border-radius: 2px; transform-origin: 0% 50%; }
.ltdc-role { font-size: 25px; font-weight: 400; color: #aeb6c2; line-height: 1.2; letter-spacing: 0.02em; white-space: nowrap; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltdc", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const card = ctx.make(lt, "div", "card", { cls: "ltdc-card", style: { background: p.card } });
      const name = ctx.make(card, "div", "name", { cls: "ltdc-name", text: p.name });
      const line = ctx.make(card, "div", "line", { cls: "ltdc-line", style: { background: p.accent } });
      const role = ctx.make(card, "div", "role", { cls: "ltdc-role", text: p.role });
      const t = p.at;
      tl.fromTo(card, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.1);
      tl.fromTo(name, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, t + 0.26);
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power4.out" }, t + 0.42);
      tl.fromTo(role, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, t + 0.56);
      if (p.exitAt != null) tl.to(card, { y: 24, opacity: 0, duration: 0.35, ease: "power2.in" }, t + p.exitAt);
    }
  },
});
