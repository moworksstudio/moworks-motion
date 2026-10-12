/* card/gloss-sweep: a compact label card lands with a restrained slam (from 5 % of the height up and 1.06x), receives ONE diagonal specular sweep, then holds
   perfectly still. The gloss is the whole celebration: no pulse, confetti, drift or exit.
   Port of HyperFrames registry component gloss-sweep. BLOCK: the card is built centred in the target box and sized from it (source: container units of its mount box).
   Source timing kept: landing 0.5 s expo.out at 0; sweep at 0.65 s for 0.7 s (power2.out) on the custom property --gs-sweep -30 -> 130, gloss visible only during
   the sweep; if `duration` < 1.35 s landing and sweep compress together. */
AIMK.preset("card/gloss-sweep", {
  params: { text: "Cao cấp", accent: "green", sweepAngle: 25, duration: 2.5, bg: "#05070d", fg: "#f8fafc" },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const PAL = {
      green: { surface: "#123b2c", bright: "#1a513c", edge: "#39d98a", label: "#ecfff5" },
      blue: { surface: "#123554", bright: "#19486f", edge: "#4db5ff", label: "#eef8ff" },
      violet: { surface: "#31205b", bright: "#463078", edge: "#a98cff", label: "#f7f2ff" },
    };
    const pal = PAL[p.accent] || PAL.green, t = p.at;
    const av = Number(p.sweepAngle), angle = Number.isFinite(av) ? Math.max(-60, Math.min(60, av)) : 25;
    const D = Math.max(0.001, Number(p.duration) || 2.5), sc = D < 1.35 ? D / 1.35 : 1, LAND = 0.5 * sc, SWEEP_AT = 0.65 * sc, SWEEP = 0.7 * sc;
    ctx.css("card/gloss-sweep", `
.cgs-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.cgs-card { position: relative; display: grid; place-items: center; overflow: hidden; box-sizing: border-box; transform-origin: 50% 50%; }
.cgs-label { position: relative; z-index: 1; overflow: hidden; font-weight: 780; line-height: 1; letter-spacing: -0.04em; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
.cgs-gloss { --gs-sweep: -30; position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 2; opacity: 0; pointer-events: none; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, cm = v => v * Math.min(W, H) / 100;
      const box = ctx.make(slot, "div", "gs", { cls: "cgs-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", color: p.fg } });
      const card = ctx.make(box, "div", "card", { cls: "cgs-card", style: { minWidth: cw(48) + "px", maxWidth: cw(78) + "px", minHeight: ch(34) + "px", padding: `${ch(7)}px ${cw(9)}px`,
        border: `${cm(0.22)}px solid ${pal.edge}`, borderRadius: cm(5) + "px", background: `linear-gradient(145deg, ${pal.bright}, ${pal.surface})`,
        boxShadow: `0 ${ch(3)}px ${ch(8)}px ${rgba(p.bg, 0.62)}, inset 0 0 0 ${cm(0.12)}px rgba(255,255,255,0.12)` } });
      const fs = Math.max(cm(8), Math.min(cm(15), cm(18))), pv = fs * 0.15;
      ctx.make(card, "span", "label", { cls: "cgs-label", text: p.text, style: { maxWidth: cw(62) + "px", color: pal.label, fontSize: fs + "px", padding: `${pv}px ${fs * 0.1}px`, margin: `${-pv}px ${-fs * 0.1}px` } });
      const s = "var(--gs-sweep)";
      const gloss = ctx.make(card, "span", "gloss", { cls: "cgs-gloss", attrs: { "aria-hidden": "true" }, style: { background: `linear-gradient(${angle}deg, transparent calc(${s} * 1% - 22%), rgba(255,255,255,0.06) calc(${s} * 1% - 9%), rgba(255,255,255,0.72) calc(${s} * 1%), rgba(255,255,255,0.08) calc(${s} * 1% + 9%), transparent calc(${s} * 1% + 22%))` } });
      tl.fromTo(card, { y: -ch(5), scale: 1.06 }, { y: 0, scale: 1, duration: LAND, ease: "expo.out" }, t);
      tl.set(gloss, { opacity: 1, ease: "none" }, t + SWEEP_AT);
      tl.fromTo(gloss, { "--gs-sweep": -30 }, { "--gs-sweep": 130, duration: SWEEP, ease: "power2.out" }, t + SWEEP_AT);
      tl.set(gloss, { opacity: 0, ease: "none" }, t + SWEEP_AT + SWEEP);
    }
  },
});
