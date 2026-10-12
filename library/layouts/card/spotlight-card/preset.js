/* card/spotlight-card: a dark glass card over a slowly moving blurred light mesh, with a soft spotlight that drifts across the card.
   Port of HyperFrames registry component spotlight-card (catalog component, fixed px sizes 760 x 428; its demo shows it at 1.65x, which is the
   default of `scale`). BLOCK: the card is built centred in the target box. Source motion kept: the three mesh lights drift from (18/28, 78/46, 44/80 %)
   to (34/42, 62/60, 58/64 %) over 4 s sine.inOut; the spotlight travels (-120, -70) -> (190, 90) px over 3 s sine.inOut, both from `at`. */
AIMK.preset("card/spotlight-card", {
  params: { title: "Thẻ ánh sáng", text: "Thẻ có vệt đèn rọi chạy qua và viền sáng lên.", scale: 1.65, bg: "#080b12", fg: "#ffffff", radius: 30 },
  build(tl, els, p, ctx) {
    const t = p.at, s = Number(p.scale) > 0 ? Number(p.scale) : 1, u = v => +(v * s).toFixed(2);
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    ctx.css("card/spotlight-card", `
.csl-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.csl-card { position: relative; overflow: hidden; box-sizing: border-box; }
.csl-mesh { position: absolute; inset: -22%; opacity: 0.88;
  background:
    radial-gradient(circle at var(--hf-x1, 20%) var(--hf-y1, 30%), rgba(255,255,255,0.45) 0 18%, transparent 32%),
    radial-gradient(circle at var(--hf-x2, 76%) var(--hf-y2, 52%), rgba(255,255,255,0.18) 0 16%, transparent 34%),
    radial-gradient(circle at var(--hf-x3, 46%) var(--hf-y3, 78%), rgba(255,255,255,0.08) 0 18%, transparent 34%); }
.csl-inner { position: absolute; display: grid; place-items: center; text-align: center; overflow: hidden; box-sizing: border-box; }
.csl-spot { position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto; border-radius: 50%; mix-blend-mode: screen;
  background: radial-gradient(circle, rgba(255,255,255,0.5), transparent 65%); transform: translate(var(--hf-spot-x, 0px), var(--hf-spot-y, 0px)); }
.csl-h { margin: 0; letter-spacing: -0.04em; font-weight: 700; }
.csl-p { margin: 0; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "sl", { cls: "csl-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "csl-card", style: { width: u(760) + "px", height: u(428) + "px", borderRadius: u(p.radius) + "px", background: p.bg, boxShadow: `0 ${u(28)}px ${u(80)}px rgba(15,23,42,0.2)`, color: p.fg } });
      const mesh = ctx.make(card, "div", "mesh", { cls: "csl-mesh", style: { filter: `blur(${u(44)}px)` } });
      const inner = ctx.make(card, "div", "inner", { cls: "csl-inner", style: { left: u(92) + "px", right: u(92) + "px", top: u(74) + "px", bottom: u(74) + "px",
        border: `${Math.max(1, u(1))}px solid rgba(255,255,255,0.16)`, borderRadius: u(26) + "px", background: "rgba(255,255,255,0.08)" } });
      const spot = ctx.make(inner, "div", "spot", { cls: "csl-spot", style: { width: u(260) + "px", height: u(260) + "px" } });
      const txt = ctx.make(inner, "div", "txt");
      ctx.make(txt, "h3", "h", { cls: "csl-h", text: p.title, style: { fontSize: u(44) + "px" } });
      ctx.make(txt, "p", "p", { cls: "csl-p", text: p.text, style: { marginTop: u(8) + "px", fontSize: u(18) + "px", color: "rgba(255,255,255,0.7)" } });
      tl.fromTo(mesh, { "--hf-x1": "18%", "--hf-y1": "28%", "--hf-x2": "78%", "--hf-y2": "46%", "--hf-x3": "44%", "--hf-y3": "80%" },
        { "--hf-x1": "34%", "--hf-y1": "42%", "--hf-x2": "62%", "--hf-y2": "60%", "--hf-x3": "58%", "--hf-y3": "64%", duration: 4, ease: "sine.inOut" }, t);
      tl.fromTo(spot, { "--hf-spot-x": u(-120) + "px", "--hf-spot-y": u(-70) + "px" }, { "--hf-spot-x": u(190) + "px", "--hf-spot-y": u(90) + "px", duration: 3, ease: "sine.inOut" }, t);
    }
  },
});
