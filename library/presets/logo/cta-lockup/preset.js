/* logo/cta-lockup: a closing lockup with one fixed reveal order: the action line rises in, the CTA capsule pops under it with a small overshoot,
   then the microcopy settles; the finished lockup drifts 0.35 % of the frame height up and back once and holds.
   Port of HyperFrames registry component cta-lockup. BLOCK: the lockup is built inside the target (an empty box, usually the whole frame).
   Source timing kept: action 0.5 s (power3.out) at 0, capsule 0.6 s (back.out(1.7)) + opacity 0.24 s at 0.56, microcopy 0.42 s at 1.18, IN = 1.6 s,
   then the hold drift over the rest of `duration` (the authored length of the source, 4 s). */
AIMK.preset("logo/cta-lockup", {
  params: { action: "Bắt đầu ngay hôm nay", button: "Đăng ký nhận ưu đãi", micro: "Miễn phí trong giai đoạn thử nghiệm", accent: "#22c55e", fg: "#f8fafc", muted: "#cbd5e1", buttonInk: "#07110d", duration: 4 },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, t = p.at, IN = 1.6, HOLD = Math.max(0, p.duration - IN);
    const cw = v => +(v * W / 100).toFixed(2), ch = v => +(v * H / 100).toFixed(2);
    const rgb = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)).join(","); };
    ctx.css("logo/cta-lockup", `
.cll { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.cll-lock { display: flex; flex-direction: column; align-items: center; text-align: center; }
.cll-action { margin: 0; font-weight: 760; line-height: 1.02; letter-spacing: -0.045em; text-wrap: balance; }
.cll-btn { overflow: hidden; border: 0; font-weight: 760; line-height: 1; letter-spacing: -0.02em; text-overflow: ellipsis; white-space: nowrap; transform-origin: 50% 50%; }
.cll-micro { margin: 0; font-weight: 520; line-height: 1.25; letter-spacing: 0.01em; text-wrap: balance; }`);
    for (const slot of els) {
      const box = ctx.make(slot, "div", "cl", { cls: "cll" });
      const lock = ctx.make(box, "div", "lock", { cls: "cll-lock", style: { width: Math.min(cw(88), ch(150)) + "px" } });
      const act = ctx.make(lock, "div", "action", { cls: "cll-action", text: p.action, style: { maxWidth: cw(86) + "px", marginBottom: ch(6.5) + "px", color: p.fg, fontSize: Math.min(cw(10), ch(14)) + "px" } });
      const btn = ctx.make(lock, "div", "button", { cls: "cll-btn", text: p.button, style: { minWidth: cw(34) + "px", maxWidth: cw(78) + "px", marginBottom: ch(3.8) + "px",
        padding: `${ch(3.2)}px ${cw(5.5)}px`, borderRadius: ch(50) + "px", background: p.accent, boxShadow: `0 ${ch(2.2)}px ${ch(6)}px rgba(${rgb(p.accent)},.28)`,
        color: p.buttonInk, fontSize: Math.min(cw(4.3), ch(6.8)) + "px" } });
      const mic = ctx.make(lock, "div", "micro", { cls: "cll-micro", text: p.micro, style: { maxWidth: cw(76) + "px", color: p.muted, fontSize: Math.min(cw(3), ch(4.2)) + "px" } });
      tl.set(btn, { opacity: 0, ease: "none" }, 0);   // not a second fromTo: the bake would drop its immediateRender
      tl.fromTo(act, { opacity: 0, y: ch(3.4) }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t);
      tl.fromTo(btn, { scale: 0.72, y: ch(2.2) }, { scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }, t + 0.56);
      tl.to(btn, { opacity: 1, duration: 0.24, ease: "power2.out" }, t + 0.56);
      tl.fromTo(mic, { opacity: 0, y: ch(1.8) }, { opacity: 1, y: 0, duration: 0.42, ease: "power2.out" }, t + 1.18);
      if (HOLD > 0) {
        tl.fromTo(lock, { y: 0 }, { y: -ch(0.35), duration: HOLD / 2, ease: "sine.inOut" }, t + IN);
        tl.to(lock, { y: 0, duration: HOLD / 2, ease: "sine.inOut" }, t + IN + HOLD / 2);
      }
    }
  },
});
