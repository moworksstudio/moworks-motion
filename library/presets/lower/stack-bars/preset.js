/* lower/stack-bars: two stacked bars wipe in from opposite sides, a dark name bar from the left and a yellow role bar from the right.
   Port of HyperFrames registry block lt-stack-bars (layout, colours and timing as in the source; name in the film's font at weight 900 instead of
   Archivo Black, role in the kit's Roboto Mono instead of Space Mono: no network in films). BLOCK: built inside the target box.
   Exit (source: role 4.25 s, name 4.32 s): both wipe back out; params.exitAt is the role bar's exit, null = no exit. */
AIMK.preset("lower/stack-bars", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", nameBg: "#141518", roleBg: "#ffd23f", left: 120, bottom: 116, exitAt: 4.25 },
  build(tl, els, p, ctx) {
    ctx.css("lower/stack-bars", `
.ltsb { position: absolute; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.ltsb-namebar { padding: 14px 30px; }
.ltsb-name { font-size: 52px; font-weight: 900; color: #ffffff; line-height: 1; letter-spacing: -0.015em; text-transform: uppercase; white-space: nowrap; }
.ltsb-rolebar { padding: 9px 22px; margin-left: 14px; }
.ltsb-role { font-family: "RMono", "Space Mono", monospace; font-size: 23px; font-weight: 700; color: #141518; line-height: 1; letter-spacing: 0.06em;
  text-transform: uppercase; white-space: nowrap; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltsb", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const nb = ctx.make(lt, "div", "namebar", { cls: "ltsb-namebar", style: { background: p.nameBg } });
      ctx.make(nb, "div", "name", { cls: "ltsb-name", text: p.name });
      const rb = ctx.make(lt, "div", "rolebar", { cls: "ltsb-rolebar", style: { background: p.roleBg } });
      ctx.make(rb, "div", "role", { cls: "ltsb-role", text: p.role });
      const t = p.at;
      tl.fromTo(nb, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power4.out" }, t + 0.1);
      tl.fromTo(rb, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0% 0 0%)", duration: 0.5, ease: "power4.out" }, t + 0.34);
      if (p.exitAt != null) {
        tl.to(rb, { clipPath: "inset(0 0 0 100%)", duration: 0.32, ease: "power3.in" }, t + p.exitAt);
        tl.to(nb, { clipPath: "inset(0 100% 0 0)", duration: 0.36, ease: "power3.in" }, t + p.exitAt + 0.07);
      }
    }
  },
});
