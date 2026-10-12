/* title/cta-close: the action-only close: a display-scale action line lands word by word, one generous button capsule pops under it with a single restrained overshoot, then the finished
   lockup holds dead still until the cut. Monotone: ink on ground, the accent only on the capsule.
   Port of HyperFrames registry component cta-close. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh of the source are taken from that box.
   Source envelope kept (D = params.duration, authored 3.5 s): words rise from 8 cqh with opacity, 0.62 s power3.out, stagger 0.1 s, from 0.06 s; capsule scale 0.85 -> 1 and y 3 cqh -> 0
   0.6 s back.out(1.5) plus opacity 0.22 s power2.out at 0.72 s; settled by 1.32 s; no hold motion; optional exit (fade / up -5 cqh) 0.45 s power2.in at D - 0.45; shrinks if D is short.
   Sizes are fitted by character count as in the source: action = min(min(24, 76 / (0.47 x characters)) cqw, 30 cqh), button text = min(min(3.5, 50 / (0.5 x characters)) cqw, 6 cqh). */
AIMK.preset("title/cta-close", {
  params: { action: "Hãy bắt đầu ngay", button: "Đăng ký miễn phí", accent: "#71f5a7", exit: "none", duration: 3.5, bg: "#0b0c0e", fg: "#f8fafc", buttonInk: "" },
  build(tl, els, p, ctx) {
    ctx.css("title/cta-close", `
.ctc-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; display: grid; place-items: center; }
.ctc-lock { display: flex; flex-direction: column; align-items: center; text-align: center; }
.ctc-action { font-weight: 600; line-height: 1.02; letter-spacing: -0.035em; white-space: nowrap; }
.ctc-btn { overflow: hidden; border-radius: 999px; font-weight: 600; line-height: 1; letter-spacing: -0.01em; white-space: nowrap; transform-origin: 50% 50%; }`);
    const norm = s => String(s == null ? "" : s).trim().replace(/\s+/g, " ");
    const D = Math.max(0.001, p.duration), exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none", IN0 = 1.32, OUT0 = exitMode === "none" ? 0 : 0.45;
    const sc = Math.min(1, D / (IN0 + OUT0)), OUT = OUT0 * sc, OUT_START = D - OUT, f = v => +v.toFixed(4), t = p.at;
    const act = norm(p.action), btn = norm(p.button), ink = p.buttonInk || (p.bg === "transparent" ? "#0b0c0e" : p.bg);
    const aSize = Math.min(24, 76 / (Math.max(1, Array.from(act).length) * 0.47)), bSize = Math.min(3.5, 50 / (Math.max(1, Array.from(btn).length) * 0.5));
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100;
      const root = ctx.make(slot, "div", "root", { cls: "ctc-root", style: { background: p.bg, color: p.fg } });
      const lock = ctx.make(root, "div", "lockup", { cls: "ctc-lock", style: { gap: f(7 * ch) + "px", maxWidth: f(96 * cw) + "px" } });
      const line = ctx.make(lock, "div", "action", { cls: "ctc-action", text: act, style: { color: p.fg, fontSize: f(Math.min(aSize * cw, 30 * ch)) + "px" } });
      const words = ctx.split(line, "words");
      const button = ctx.make(lock, "div", "button", { cls: "ctc-btn", text: btn, style: { padding: `${f(2.9 * ch)}px ${f(5 * cw)}px`, background: p.accent, color: ink, fontSize: f(Math.min(bSize * cw, 6 * ch)) + "px" } });
      tl.fromTo(words, { opacity: 0, y: f(8 * ch) }, { opacity: 1, y: 0, duration: f(0.62 * sc), ease: "power3.out", stagger: f(0.1 * sc) }, t + f(0.06 * sc));
      tl.fromTo(button, { scale: 0.85, y: f(3 * ch) }, { scale: 1, y: 0, duration: f(0.6 * sc), ease: "back.out(1.5)" }, t + f(0.72 * sc));
      tl.fromTo(button, { opacity: 0 }, { opacity: 1, duration: f(0.22 * sc), ease: "power2.out" }, t + f(0.72 * sc));
      if (exitMode === "fade") tl.fromTo(lock, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
      if (exitMode === "up") tl.fromTo(lock, { opacity: 1, y: 0 }, { opacity: 0, y: f(-5 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
    }
  },
});
