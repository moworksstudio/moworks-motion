/* lower/accent-underline: the name slides up and in, an accent rule draws left to right under it, the role fades up beneath.
   Port of HyperFrames registry block lt-accent-underline (layout, colours and timing as in the source; fonts = the film's font, the source used
   Oswald and Space Mono from the web, so the name is set at weight 700, uppercase). BLOCK: built inside the target.
   Exit (source: role 4.25 s, rule 4.3 s, name 4.35 s): params.exitAt seconds after `at` for the role, the rule +0.05 s, the name +0.10 s; null = no exit. */
AIMK.preset("lower/accent-underline", {
  params: { name: "Nguyễn Minh Anh", role: "Người dẫn chương trình · Nhà nghiên cứu", accent: "#46e5b7", left: 130, bottom: 120, exitAt: 4.25 },
  build(tl, els, p, ctx) {
    ctx.css("lower/accent-underline", `
.ltau { position: absolute; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.ltau-name { font-size: 76px; font-weight: 700; color: #ffffff; line-height: 0.96; letter-spacing: 0.005em; text-transform: uppercase; white-space: nowrap; text-shadow: 0 2px 22px rgba(0,0,0,0.45); }
.ltau-rule { height: 6px; width: 100%; border-radius: 3px; transform-origin: 0% 50%; }
.ltau-role { font-size: 28px; font-weight: 400; color: #e7eaf0; line-height: 1.2; letter-spacing: 0.04em; white-space: nowrap; text-shadow: 0 2px 16px rgba(0,0,0,0.45); }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltau", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const name = ctx.make(lt, "div", "name", { cls: "ltau-name", text: p.name });
      const rule = ctx.make(lt, "div", "rule", { cls: "ltau-rule", style: { background: p.accent } });
      const role = ctx.make(lt, "div", "role", { cls: "ltau-role", text: p.role });
      const t = p.at;
      tl.fromTo(name, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, t + 0.1);
      tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power4.out" }, t + 0.3);
      tl.fromTo(role, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.46);
      if (p.exitAt != null) {
        const e = t + p.exitAt;
        tl.fromTo(role, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, e);
        tl.fromTo(rule, { scaleX: 1 }, { scaleX: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, +(e + 0.05).toFixed(4));
        tl.fromTo(name, { y: 0, opacity: 1 }, { y: -16, opacity: 0, duration: 0.32, ease: "power2.in", immediateRender: false }, +(e + 0.1).toFixed(4));
      }
    }
  },
});
