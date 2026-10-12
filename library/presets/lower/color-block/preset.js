/* lower/color-block: a blue block slides in from the left with a slight overshoot, a tall condensed name and a mono role rise inside it.
   Port of HyperFrames registry block lt-color-block (layout, colours and timing as in the source). Fonts: League Gothic (condensed) becomes the
   film's font on its narrowest width axis (wdth 25), Space Mono the kit's Roboto Mono (no network in films). BLOCK: built inside the target box.
   Exit (source: 4.3 s): slide out left, params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("lower/color-block", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", color: "#2756ff", left: 120, bottom: 116, exitAt: 4.3 },
  build(tl, els, p, ctx) {
    ctx.css("lower/color-block", `
.ltcl { position: absolute; }
.ltcl-block { padding: 20px 36px 24px 32px; display: inline-flex; flex-direction: column; gap: 8px; }
.ltcl-name { font-size: 84px; font-weight: 600; font-variation-settings: "wdth" 25; color: #ffffff; line-height: 0.86; letter-spacing: 0.01em;
  text-transform: uppercase; white-space: nowrap; }
.ltcl-role { font-family: "RMono", "Space Mono", monospace; font-size: 24px; font-weight: 400; color: rgba(255,255,255,.86); line-height: 1.2; letter-spacing: 0.05em; white-space: nowrap; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltcl", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const block = ctx.make(lt, "div", "block", { cls: "ltcl-block", style: { background: p.color, boxShadow: `0 16px 44px color-mix(in srgb, ${p.color} 34%, transparent)` } });
      const name = ctx.make(block, "div", "name", { cls: "ltcl-name", text: p.name });
      const role = ctx.make(block, "div", "role", { cls: "ltcl-role", text: p.role });
      const t = p.at;
      tl.fromTo(block, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }, t + 0.1);
      tl.fromTo(name, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, t + 0.3);
      tl.fromTo(role, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, t + 0.4);
      if (p.exitAt != null) tl.to(block, { x: -60, opacity: 0, duration: 0.35, ease: "power2.in" }, t + p.exitAt);
    }
  },
});
