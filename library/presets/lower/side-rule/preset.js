/* lower/side-rule: a vertical mint bar draws top to bottom, a tall condensed name and a mono role slide in from the left beside it.
   Port of HyperFrames registry block lt-side-rule (layout, colours and timing as in the source). Fonts: League Gothic (condensed) becomes the
   film's font on its narrowest width axis (wdth 25), JetBrains Mono the kit's Roboto Mono (no network in films). For text over footage: both
   lines carry the source's soft dark text shadow. BLOCK: built inside the target box. Exit (source: role 4.25, name 4.3, bar 4.32 s):
   params.exitAt is when the name leaves (the others keep the source's offsets), null = no exit. */
AIMK.preset("lower/side-rule", {
  params: { name: "Nguyễn Minh Anh", role: "Giám đốc sáng tạo · Moworks", accent: "#46e5b7", left: 130, bottom: 120, exitAt: 4.3 },
  build(tl, els, p, ctx) {
    ctx.css("lower/side-rule", `
.ltsr { position: absolute; display: flex; align-items: stretch; gap: 26px; }
.ltsr-bar { width: 8px; border-radius: 4px; transform-origin: 50% 0%; flex-shrink: 0; }
.ltsr-text { display: flex; flex-direction: column; justify-content: center; gap: 12px; }
.ltsr-name { font-size: 92px; font-weight: 600; font-variation-settings: "wdth" 25; color: #ffffff; line-height: 0.86; letter-spacing: 0.01em;
  text-transform: uppercase; white-space: nowrap; text-shadow: 0 2px 22px rgba(0,0,0,.5); }
.ltsr-role { font-family: "RMono", "JetBrains Mono", monospace; font-size: 26px; font-weight: 400; color: #e7eaf0; line-height: 1.2; letter-spacing: 0.04em;
  white-space: nowrap; text-shadow: 0 2px 16px rgba(0,0,0,.5); }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltsr", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const bar = ctx.make(lt, "div", "bar", { cls: "ltsr-bar", style: { background: p.accent } });
      const text = ctx.make(lt, "div", "text", { cls: "ltsr-text" });
      const name = ctx.make(text, "div", "name", { cls: "ltsr-name", text: p.name });
      const role = ctx.make(text, "div", "role", { cls: "ltsr-role", text: p.role });
      const t = p.at;
      tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power3.out" }, t + 0.1);
      tl.fromTo(name, { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.26);
      tl.fromTo(role, { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.38);
      if (p.exitAt != null) {
        const e = t + p.exitAt;
        tl.to(role, { opacity: 0, duration: 0.3, ease: "power2.in" }, e - 0.05);
        tl.to(name, { y: -14, opacity: 0, duration: 0.32, ease: "power2.in" }, e);
        tl.to(bar, { scaleY: 0, duration: 0.32, ease: "power2.in" }, e + 0.02);
      }
    }
  },
});
