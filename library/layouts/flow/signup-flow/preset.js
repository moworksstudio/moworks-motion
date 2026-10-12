/* flow/signup-flow: a sign-up card: the card rises in, its six rows (title, social button, divider, email field, password field, submit) follow one by one,
   then the submit button gives one small press.
   Port of HyperFrames registry component signup-flow (layout, colours, sizes and timing as in the source demo; font = the film's font, the source used Inter).
   BLOCK: the target is an empty box (usually the whole frame); the card is built in its middle and shown `scale` times larger, as the source demo does
   (a wrapper with transform: scale, never tweened). Source timing kept: card 0.36 s power2.out at 0.25, rows 0.24 s power2.out stagger 0.05 at 0.48,
   submit press scale 0.97 (yoyo, 0.12 s per half, power1.inOut) at 1.2. */
AIMK.preset("flow/signup-flow", {
  params: { title: "Tạo tài khoản", social: "Tiếp tục với Google", or: "hoặc", email: "ten@congty.vn", password: "Mật khẩu", submit: "Bắt đầu ngay",
    ink: "#18181b", onInk: "#ffffff", muted: "#a1a1aa", border: "#e4e4e7", surface: "#ffffff", scale: 2.2 },
  build(tl, els, p, ctx) {
    ctx.css("flow/signup-flow", `
.sgn-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.sgn { display: grid; gap: 14px; width: 430px; padding: 30px; border-radius: 28px; box-shadow: 0 28px 84px rgba(0,0,0,.12); }
.sgn-title { margin-bottom: 6px; text-align: center; font-size: 28px; font-weight: 700; }
.sgn-btn, .sgn-field { display: flex; align-items: center; height: 50px; border-radius: 14px; font-size: 15px; font-weight: 600; }
.sgn-btn { justify-content: center; }
.sgn-field { padding: 0 15px; }
.sgn-div { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; font-size: 13px; font-weight: 500; }
.sgn-div i { display: block; height: 1px; }
.sgn-div em { font-style: italic; }`);
    const t = p.at;
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "sgn-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const card = ctx.make(wrap, "div", "card", { cls: "sgn", style: { border: `1px solid ${p.border}`, background: p.surface, color: p.ink } });
      const kids = [];
      kids.push(ctx.make(card, "div", "title", { cls: "sgn-title", text: p.title }));
      kids.push(ctx.make(card, "div", "social", { cls: "sgn-btn", text: p.social, style: { border: `1px solid ${p.border}`, background: p.surface, color: p.ink } }));
      const dv = ctx.make(card, "div", "divider", { cls: "sgn-div", style: { color: p.muted } });
      ctx.make(dv, "i", "l", { style: { background: p.border } });
      ctx.make(dv, "em", "or", { text: p.or });
      ctx.make(dv, "i", "r", { style: { background: p.border } });
      kids.push(dv);
      kids.push(ctx.make(card, "div", "email", { cls: "sgn-field", text: p.email, style: { border: `1px solid ${p.border}`, background: p.surface, color: p.ink } }));
      kids.push(ctx.make(card, "div", "password", { cls: "sgn-field", text: p.password, style: { border: `1px solid ${p.border}`, background: p.surface, color: p.muted } }));
      const submit = ctx.make(card, "div", "submit", { cls: "sgn-btn", text: p.submit, style: { background: p.ink, color: p.onInk } });
      kids.push(submit);
      tl.fromTo(card, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.36, ease: "power2.out" }, t + 0.25);
      tl.fromTo(kids, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, stagger: 0.05, ease: "power2.out" }, t + 0.48);
      tl.fromTo(submit, { scale: 1 }, { scale: 0.97, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }, t + 1.2);
    }
  },
});
