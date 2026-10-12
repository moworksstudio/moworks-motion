/* lower/clean-bar: a white lower third with a coloured tab: the card wipes in from the left, the tab grows down, name and role rise in.
   Port of HyperFrames registry block lt-clean-bar (layout, colours and timing as in the source; font = the film's font, the source used
   Montserrat from the web). BLOCK: the target is an empty box (usually the whole frame); the lower third is built inside it.
   Exit (source: at 4.3 s): params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("lower/clean-bar", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", accent: "#ff5a36", left: 120, bottom: 110, exitAt: 4.2 },
  build(tl, els, p, ctx) {
    ctx.css("lower/clean-bar", `
.ltcb { position: absolute; display: flex; align-items: stretch; border-radius: 16px; overflow: hidden; box-shadow: 0 14px 44px rgba(15,17,21,.18); }
.ltcb-tab { width: 12px; flex-shrink: 0; transform-origin: 50% 0%; }
.ltcb-body { background: #ffffff; padding: 22px 40px 24px 30px; display: flex; flex-direction: column; gap: 7px; }
.ltcb-name { font-size: 52px; font-weight: 700; color: #0f1115; line-height: 1.06; letter-spacing: -0.015em; white-space: nowrap; }
.ltcb-role { font-size: 27px; font-weight: 400; color: #5a6170; line-height: 1.2; letter-spacing: 0.01em; white-space: nowrap; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltcb", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const tab = ctx.make(lt, "div", "tab", { cls: "ltcb-tab", style: { background: p.accent } });
      const body = ctx.make(lt, "div", "body", { cls: "ltcb-body" });
      const name = ctx.make(body, "div", "name", { cls: "ltcb-name", text: p.name });
      const role = ctx.make(body, "div", "role", { cls: "ltcb-role", text: p.role });
      const t = p.at;
      tl.fromTo(lt, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "power3.out" }, t + 0.1);
      tl.fromTo(tab, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "power2.out" }, t + 0.28);
      tl.fromTo(name, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.34);
      tl.fromTo(role, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.44);
      if (p.exitAt != null) tl.to(lt, { y: 18, opacity: 0, duration: 0.35, ease: "power2.in" }, t + p.exitAt);
    }
  },
});
