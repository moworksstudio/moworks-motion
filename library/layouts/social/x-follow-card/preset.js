/* social/x-follow-card: a dark social follow card: avatar tile, name and handle line, a huge follower number that pops up (back.out), and a row of overlapping
   follower avatars that rise one after another.
   Port of HyperFrames registry component x-follow-card (catalog component, fixed px sizes, card 700 px wide; its demo shows it at 1.9x, which is the default of `scale`).
   BLOCK: the card is built centred in the target box. Source motion kept: the number rises 28 px with opacity (0.46 s, back.out(1.6)) at the start, the six avatars rise 18 px
   with opacity (0.28 s, power2.out, 0.05 s apart) from 0.22 s later. Source artwork: the source has no logo or icon (05/10/2026 check), its avatar tiles and discs are plain shapes and are kept as shipped. */
AIMK.preset("social/x-follow-card", {
  params: { name: "Tên tài khoản", text: "Thẻ theo dõi có avatar, tên và số người theo dõi.", stat: "30,6K", count: 6, scale: 1.9, bg: "#0f172a", fg: "#ffffff", muted: "#94a3b8" },
  build(tl, els, p, ctx) {
    const t = p.at, s = Number(p.scale) > 0 ? Number(p.scale) : 1, u = v => +(v * s).toFixed(2), n = Math.max(1, Math.min(12, Math.round(Number(p.count)) || 6));
    ctx.css("social/x-follow-card", `
.sxf-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.sxf-card { box-sizing: border-box; }
.sxf-head { display: flex; align-items: center; }
.sxf-name { margin: 0; letter-spacing: -0.04em; font-weight: 700; }
.sxf-text { margin: 0; }
.sxf-stat { font-weight: 900; letter-spacing: -0.08em; }
.sxf-row { display: flex; }
.sxf-av { border-radius: 999px; box-sizing: border-box; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "xf", { cls: "sxf-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "sxf-card", style: { width: u(700) + "px", borderRadius: u(30) + "px", padding: u(34) + "px", background: p.bg, color: p.fg, boxShadow: `0 ${u(28)}px ${u(80)}px rgba(15,23,42,0.2)` } });
      const head = ctx.make(card, "div", "head", { cls: "sxf-head", style: { gap: u(16) + "px" } });
      ctx.make(head, "div", "avatar", { style: { width: u(70) + "px", height: u(70) + "px", borderRadius: u(22) + "px", background: "rgba(255,255,255,0.72)", flex: "none" } });
      const tx = ctx.make(head, "div", "tx");
      ctx.make(tx, "h3", "name", { cls: "sxf-name", text: p.name, style: { fontSize: u(36) + "px" } });
      ctx.make(tx, "p", "text", { cls: "sxf-text", text: p.text, style: { marginTop: u(4) + "px", color: p.muted, fontSize: u(18) + "px" } });
      const stat = ctx.make(card, "div", "stat", { cls: "sxf-stat", text: p.stat, style: { marginTop: u(30) + "px", fontSize: u(82) + "px" } });
      const row = ctx.make(card, "div", "avatars", { cls: "sxf-row", style: { marginTop: u(18) + "px" } });
      const avs = Array.from({ length: n }, (_, i) => ctx.make(row, "span", "a" + i, { cls: "sxf-av", style: { width: u(46) + "px", height: u(46) + "px", border: `${u(3)}px solid ${p.bg}`, marginLeft: u(-10) + "px",
        background: i === 0 ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.45)" } }));
      tl.fromTo(stat, { y: u(28), opacity: 0 }, { y: 0, opacity: 1, duration: 0.46, ease: "back.out(1.6)" }, t);
      avs.forEach((a, i) => tl.fromTo(a, { y: u(18), opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power2.out" }, t + 0.22 + i * 0.05));
    }
  },
});
