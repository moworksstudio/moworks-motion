/* lower/mask-reveal: a cardless lower third: an accent bar sweeps left to right and a clip-path wipe reveals a heavy name behind it, the role fades up.
   Port of HyperFrames registry block lt-mask-reveal (layout, colours and timing as in the source; font = the film's font, the source used Montserrat
   from the web). BLOCK: built inside the target. The bar travels the width of the name, measured at build time (source: the fixed 536 px of its demo text).
   Exit (source: role at 4.25 s, name at 4.3 s): params.exitAt seconds after `at` for the role, the name wipes out 0.05 s later; null = no exit. */
AIMK.preset("lower/mask-reveal", {
  params: { name: "Nguyễn Minh Anh", role: "Người dẫn chương trình · Nhà nghiên cứu", accent: "#ffd23f", left: 130, bottom: 122, exitAt: 4.25 },
  build(tl, els, p, ctx) {
    ctx.css("lower/mask-reveal", `
.ltmr { position: absolute; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.ltmr-namewrap { position: relative; overflow: hidden; padding: 2px 0; }
.ltmr-name { font-size: 72px; font-weight: 900; color: #ffffff; line-height: 0.98; letter-spacing: -0.02em; white-space: nowrap; text-shadow: 0 2px 22px rgba(0,0,0,0.45); }
.ltmr-sweep { position: absolute; top: 0; bottom: 0; left: 0; width: 8px; opacity: 0; }
.ltmr-role { font-size: 28px; font-weight: 500; color: #e7eaf0; line-height: 1.2; letter-spacing: 0.02em; white-space: nowrap; text-shadow: 0 2px 16px rgba(0,0,0,0.45); }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltmr", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const wrap = ctx.make(lt, "div", "namewrap", { cls: "ltmr-namewrap" });
      const name = ctx.make(wrap, "div", "name", { cls: "ltmr-name", text: p.name });
      const sweep = ctx.make(wrap, "div", "sweep", { cls: "ltmr-sweep", style: { background: p.accent } });
      const role = ctx.make(lt, "div", "role", { cls: "ltmr-role", text: p.role });
      const travel = wrap.offsetWidth, t = p.at;
      tl.fromTo(name, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut" }, t + 0.16);
      tl.fromTo(sweep, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, t + 0.1);
      tl.fromTo(sweep, { x: 0 }, { x: travel, duration: 0.55, ease: "power2.inOut", immediateRender: false }, t + 0.12);
      tl.fromTo(sweep, { opacity: 1 }, { opacity: 0, duration: 0.15, ease: "none", immediateRender: false }, t + 0.6);
      tl.fromTo(role, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.55);
      if (p.exitAt != null) {
        const e = t + p.exitAt;
        tl.fromTo(role, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, e);
        tl.fromTo(name, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.4, ease: "power2.in", immediateRender: false }, +(e + 0.05).toFixed(4));
      }
    }
  },
});
