/* lower/kicker-name: a coloured kicker tag drops in, the name slams up with a small overshoot, an accent baseline draws left to right.
   Port of HyperFrames registry block lt-kicker-name (layout, colours and timing as in the source; fonts = the film's font, the source used
   Space Mono and Archivo Black from the web, so the name is set at weight 900). BLOCK: the lower third is built inside the target.
   Exit (source: baseline at 4.25 s, name at 4.3 s, kicker at 4.32 s): params.exitAt seconds after `at` for the baseline, the name follows
   0.05 s later and the kicker 0.07 s later; null = no exit. */
AIMK.preset("lower/kicker-name", {
  params: { kicker: "Tập 47", name: "Nguyễn Minh Anh", accent: "#46e5b7", left: 130, bottom: 122, exitAt: 4.25 },
  build(tl, els, p, ctx) {
    ctx.css("lower/kicker-name", `
.ltkn { position: absolute; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.ltkn-kickwrap { overflow: hidden; }
.ltkn-kicker { display: inline-block; font-size: 22px; font-weight: 700; color: #141518; padding: 6px 14px; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
.ltkn-name { font-size: 70px; font-weight: 900; color: #ffffff; line-height: 0.98; letter-spacing: -0.015em; text-transform: uppercase; white-space: nowrap; text-shadow: 0 2px 22px rgba(0,0,0,0.5); }
.ltkn-baseline { height: 5px; width: 100%; border-radius: 3px; transform-origin: 0% 50%; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltkn", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const wrap = ctx.make(lt, "div", "kickwrap", { cls: "ltkn-kickwrap" });
      const kicker = ctx.make(wrap, "span", "kicker", { cls: "ltkn-kicker", text: p.kicker, style: { background: p.accent } });
      const name = ctx.make(lt, "div", "name", { cls: "ltkn-name", text: p.name });
      const base = ctx.make(lt, "div", "baseline", { cls: "ltkn-baseline", style: { background: p.accent } });
      const t = p.at;
      tl.fromTo(kicker, { y: -40 }, { y: 0, duration: 0.42, ease: "back.out(2)" }, t + 0.1);
      tl.fromTo(name, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }, t + 0.32);
      tl.fromTo(base, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power4.out" }, t + 0.5);
      if (p.exitAt != null) {
        const e = t + p.exitAt;
        tl.fromTo(base, { scaleX: 1 }, { scaleX: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, e);
        tl.fromTo(name, { y: 0, opacity: 1 }, { y: -16, opacity: 0, duration: 0.32, ease: "power2.in", immediateRender: false }, +(e + 0.05).toFixed(4));
        tl.fromTo(kicker, { y: 0 }, { y: -40, duration: 0.3, ease: "power2.in", immediateRender: false }, +(e + 0.07).toFixed(4));
      }
    }
  },
});
