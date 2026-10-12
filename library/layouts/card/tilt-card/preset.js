/* card/tilt-card: a gradient card with a corner glow rises in, then tilts (rotateX -7, rotateY 10) while its glow drifts the other way.
   Port of HyperFrames registry component tilt-card (catalog component, fixed px sizes 420 x 260; its demo shows it at 2.5x, which is the default of `scale`).
   BLOCK: the card is built centred in the target box. Source motion kept: rise 0.38 s power2.out at the start (from opacity 0, y 30), tilt 0.72 s power3.inOut
   0.45 s later, glow xPercent 12 / yPercent 10 with the tilt. */
AIMK.preset("card/tilt-card", {
  params: { eyebrow: "Mẫu thử", headline: "Chuyển động dễ dùng", glow: "standard", accent: "indigo", scale: 2.5 },
  build(tl, els, p, ctx) {
    const t = p.at, s = Number(p.scale) > 0 ? Number(p.scale) : 1, u = v => +(v * s).toFixed(2);
    const INSETS = { tight: "-18%", standard: "-30%", wide: "-46%" };
    const ACC = {
      indigo: { accent: "#312e81", glow: "rgba(125, 211, 252, 0.5)", label: "#a5b4fc", shadow: "rgba(49, 46, 129, 0.34)" },
      emerald: { accent: "#065f46", glow: "rgba(110, 231, 183, 0.5)", label: "#6ee7b7", shadow: "rgba(6, 95, 70, 0.34)" },
      violet: { accent: "#5b21b6", glow: "rgba(216, 180, 254, 0.5)", label: "#d8b4fe", shadow: "rgba(91, 33, 182, 0.34)" },
    };
    const inset = INSETS[p.glow] || INSETS.standard, a = ACC[p.accent] || ACC.indigo;
    ctx.css("card/tilt-card", `
.ctl-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.ctl-card { position: relative; overflow: hidden; box-sizing: border-box; color: #ffffff; transform-style: preserve-3d; }
.ctl-glow { position: absolute; }
.ctl-content { position: relative; display: grid; align-content: end; box-sizing: border-box; transform: translateZ(38px); }
.ctl-eyebrow { font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
.ctl-head { font-weight: 700; line-height: 0.96; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "tc", { cls: "ctl-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "ctl-card", style: { width: u(420) + "px", height: u(260) + "px", border: `${Math.max(1, u(1))}px solid rgba(255,255,255,0.18)`, borderRadius: u(30) + "px",
        background: `linear-gradient(135deg, #18181b, ${a.accent})`, boxShadow: `0 ${u(32)}px ${u(90)}px ${a.shadow}` } });
      const glow = ctx.make(card, "div", "glow", { cls: "ctl-glow", style: { left: inset, right: inset, top: inset, bottom: inset, background: `radial-gradient(circle at 30% 20%, ${a.glow}, transparent 36%)` } });
      const con = ctx.make(card, "div", "content", { cls: "ctl-content", style: { gap: u(10) + "px", height: "100%", padding: u(34) + "px" } });
      ctx.make(con, "span", "eyebrow", { cls: "ctl-eyebrow", text: p.eyebrow, style: { color: a.label, fontSize: u(13) + "px" } });
      ctx.make(con, "strong", "head", { cls: "ctl-head", text: p.headline, style: { maxWidth: u(280) + "px", fontSize: u(34) + "px" } });
      tl.fromTo(card, { opacity: 0, y: u(30) }, { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" }, t);
      tl.fromTo(card, { rotateX: 0, rotateY: 0 }, { rotateX: -7, rotateY: 10, duration: 0.72, ease: "power3.inOut" }, t + 0.45);
      tl.fromTo(glow, { xPercent: 0, yPercent: 0 }, { xPercent: 12, yPercent: 10, duration: 0.72, ease: "power3.inOut" }, t + 0.45);
    }
  },
});
