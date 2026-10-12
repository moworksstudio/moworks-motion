/* card/split-tilt-cards: two equal cards arrive from opposite wings, each carrying a mirrored book-open tilt (rotateY +18 left, -18 right) under one shared stage
   perspective, with shadows falling outward. A pill badge spring-pops at each card's inner edge (left, then right), then the pair holds with a barely-there
   phase-opposed idle float and settles dead still. Optional exit "fade" | "up".
   Port of HyperFrames registry component split-tilt-cards. BLOCK: built inside the target box and sized from it (source: container units of its mount box).
   Source phases kept: left card 0 to 1.1 s (power3.out) with a 0.5 s fade, right card 0.2 s later, badge A at 1.45 s and badge B at 1.75 s (0.4 s back.out(1.9)),
   IN = 2.15 s; whole 2 s idle cycles (+-0.6cqh, sine.inOut, opposed) inside HOLD minus a 0.3 s stillness; exit 0.5 s. Card bodies: a skeleton wireframe, or a picture
   (params imgA / imgB, cover). */
AIMK.preset("card/split-tilt-cards", {
  params: { labelA: "Trước", labelB: "Sau", badgeA: "v1", badgeB: "v2", imgA: "", imgB: "", accent: "#22c55e", exit: "none", duration: 4.5,
    bg: "#0b1016", fg: "#f8fafc", muted: "#94a3b8", surface: "#172033", border: "#334155" },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const mix = (a, b, q) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v * q / 100 + B[i] * (100 - q) / 100).toString(16).padStart(2, "0")).join(""); };
    const t = p.at, exit = p.exit === "fade" || p.exit === "up" ? p.exit : "none", acc = p.accent;
    ctx.css("card/split-tilt-cards", `
.cst-box { position: absolute; overflow: hidden; }
.cst-glow { position: absolute; border-radius: 50%; pointer-events: none; }
.cst-stage { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: grid; grid-template-columns: 1fr 1fr; align-items: center; justify-items: center; box-sizing: border-box; }
.cst-wing { position: relative; width: 100%; transform-style: preserve-3d; }
.cst-float { position: absolute; left: 0; top: 0; right: 0; bottom: 0; transform-style: preserve-3d; }
.cst-card { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
.cst-label { flex: 0 0 auto; font-weight: 600; letter-spacing: 0.12em; line-height: 1; text-transform: uppercase; white-space: nowrap; }
.cst-slot { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; }
.cst-slot > img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; }
.cst-def { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }
.cst-pos { position: absolute; top: 50%; z-index: 3; display: flex; }
.cst-badge { font-weight: 600; letter-spacing: 0.04em; line-height: 1; white-space: nowrap; box-sizing: border-box; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, cm = v => v * Math.min(W, H) / 100;
      const R = cm(2.4), D = Math.max(0.001, Number(p.duration) || 4.5);
      const box = ctx.make(slot, "div", "st", { cls: "cst-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", color: p.fg } });
      const clip = ctx.make(box, "div", "clip", { style: { position: "absolute", left: "0px", top: "0px", right: "0px", bottom: "0px", overflow: "hidden" } });
      ctx.make(clip, "div", "ga", { cls: "cst-glow", style: { top: ch(14) + "px", left: cw(2) + "px", width: cw(52) + "px", height: ch(72) + "px", filter: `blur(${cm(6)}px)`,
        background: `radial-gradient(ellipse at 50% 50%, ${rgba(p.muted, 0.11)} 0%, transparent 70%)` } });
      const stage = ctx.make(clip, "div", "stage", { cls: "cst-stage", style: { gap: cw(5) + "px", padding: `0 ${cw(8)}px`, perspective: cw(120) + "px" } });
      const side = (k, tilt, label, badge, img) => {
        const B = k === "b", wing = ctx.make(stage, "div", "wing" + k, { cls: "cst-wing", style: { maxWidth: cw(38) + "px", height: ch(58) + "px" } });
        const fl = ctx.make(wing, "div", "float" + k, { cls: "cst-float" });
        const card = ctx.make(fl, "section", "card" + k, { cls: "cst-card", style: { padding: `${ch(3.6)}px ${cw(2.4)}px`, border: `${cw(0.16)}px solid ${B ? mix(acc, p.border, 46) : p.border}`, borderRadius: R + "px",
          background: B ? mix(p.surface, acc, 88) : mix(p.surface, p.bg, 90), transform: `rotateY(${tilt}deg)`, boxShadow: `${B ? -cw(2.4) : cw(2.4)}px ${ch(3)}px ${ch(7)}px ${rgba(p.bg, 0.52)}` } });
        if (label) ctx.make(card, "div", "label", { cls: "cst-label", text: label, style: { marginBottom: ch(2.4) + "px", fontSize: Math.min(cw(2.1), ch(3.4)) + "px", color: B ? mix(acc, p.fg, 72) : p.muted } });
        const sl = ctx.make(card, "div", "slot", { cls: "cst-slot", style: { borderRadius: R * 0.6 + "px" } });
        if (img) ctx.make(sl, "img", "img", { attrs: { src: img, alt: "" } });
        else {
          const def = ctx.make(sl, "div", "def", { cls: "cst-def", style: { padding: `${ch(2)}px ${cw(1)}px` } });
          ctx.make(def, "div", "bar", { style: { width: "42%", height: ch(4) + "px", marginBottom: ch(2.6) + "px", borderRadius: ch(1.2) + "px", background: B ? acc : p.muted, opacity: B ? 0.9 : 0.5 } });
          [88, 64, 42].forEach((w, i) => ctx.make(def, "div", "line" + i, { style: { width: w + "%", height: ch(2.2) + "px", marginBottom: ch(1.8) + "px", borderRadius: ch(1.1) + "px", background: B ? mix(acc, p.fg, 62) : p.muted, opacity: B ? 0.66 : 0.38 } }));
        }
        let bd = null;
        if (badge) {
          const pos = ctx.make(fl, "div", "pos" + k, { cls: "cst-pos", style: B ? { left: "0px", transform: "translate(-32%, -50%)" } : { right: "0px", transform: "translate(32%, -50%)" } });
          bd = ctx.make(pos, "div", "badge", { cls: "cst-badge", text: badge, style: { padding: `${ch(1.4)}px ${cw(1.8)}px`, border: `${cw(0.16)}px solid ${B ? mix(acc, p.border, 62) : p.border}`, borderRadius: cw(999) + "px",
            background: B ? mix(acc, p.surface, 26) : mix(p.surface, p.bg, 82), color: p.fg, fontSize: Math.min(cw(2.2), ch(3.6)) + "px" } });
        }
        return { wing, fl, card, bd };
      };
      const A = side("a", 18, p.labelA, p.badgeA, p.imgA), B = side("b", -18, p.labelB, p.badgeB, p.imgB);
      ctx.make(clip, "div", "gb", { cls: "cst-glow", style: { top: ch(14) + "px", right: cw(2) + "px", width: cw(52) + "px", height: ch(72) + "px", filter: `blur(${cm(6)}px)`,
        background: `radial-gradient(ellipse at 50% 50%, ${rgba(acc, 0.13)} 0%, transparent 70%)` } });
      // phases (source): IN 2.15 s fixed, HOLD elastic, OUT 0.5 s only for fade / up; IN and OUT scale together when `duration` is too short
      const CARD = 1.1, B_DELAY = 0.2, FADE = 0.5, BA = 1.45, BB = 1.75, BD = 0.4, IN_B = BB + BD, OUT_B = exit === "none" ? 0 : 0.5, STILL = 0.3, CYCLE = 2.0;
      const sc = D < IN_B + OUT_B ? D / (IN_B + OUT_B) : 1, IN = IN_B * sc, OUT = OUT_B * sc, HOLD = Math.max(0, D - (IN + OUT)), OUT_START = IN + HOLD;
      [[A, 0, -26], [B, B_DELAY * sc, 26]].forEach(([e, at, x]) => {
        tl.fromTo(e.card, { opacity: 0 }, { opacity: 1, duration: 0.5 * sc, ease: "power2.out" }, t + at);
        tl.fromTo(e.wing, { x: cw(x), scale: 0.85 }, { x: 0, scale: 1, duration: CARD * sc, ease: "power3.out" }, t + at);
      });
      [[A, BA], [B, BB]].forEach(([e, at]) => { if (e.bd) tl.fromTo(e.bd, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: BD * sc, ease: "back.out(1.9)" }, t + at * sc); });
      const cycles = Math.floor(Math.max(0, HOLD - STILL) / CYCLE), half = CYCLE / 2;
      for (let i = 0; i < cycles; i++) {                                              // later tweens on the same property: no immediate render (the draft must equal the baked film)
        const t0 = t + IN + i * CYCLE, nr = i > 0 ? { immediateRender: false } : {};
        tl.fromTo(A.fl, { y: 0 }, { y: -ch(0.6), duration: half, ease: "sine.inOut", ...nr }, t0);
        tl.fromTo(A.fl, { y: -ch(0.6) }, { y: 0, duration: half, ease: "sine.inOut", immediateRender: false }, t0 + half);
        tl.fromTo(B.fl, { y: 0 }, { y: ch(0.6), duration: half, ease: "sine.inOut", ...nr }, t0);
        tl.fromTo(B.fl, { y: ch(0.6) }, { y: 0, duration: half, ease: "sine.inOut", immediateRender: false }, t0 + half);
      }
      if (exit !== "none") {
        tl.fromTo(clip, { opacity: 1 }, { opacity: 0, duration: FADE * sc, ease: "power2.in" }, t + OUT_START);
        if (exit === "up") tl.fromTo(clip, { y: 0 }, { y: -ch(6), duration: FADE * sc, ease: "power2.in" }, t + OUT_START);
      }
    }
  },
});
