/* text/kinetic-type-swap: a held sentence with one rolling word: the sentence fades in, then the accent word rolls through a list of options inside
   a mask (the old word whips up and out, the next rises in; the last one lands with a small overshoot) and the final word pulses softly while it holds.
   Port of HyperFrames registry component kinetic-type-swap (envelope, eases and swap schedule as in the source: arrival 0.3 s power2.out; swaps from
   0.48 s spread evenly up to 2.25 s - 0.18 - 0.46, or at the given cues; each roll 0.46 s (shorter when swaps are close), out 55 % power4.in, in 55 %
   power4.out / back.out(1.7) for the last; hold pulse to 90 % opacity, sine.inOut; optional exit fade | up 0.45 s power2.in).
   EFFECT on a text element: its own text is the fixed text before the slot (the source's prefix); suffix is a param. Every option sits in one grid
   cell, so the slot keeps the widest option's width and the sentence never reflows. The mask has `pad` em of room for Vietnamese marks; words
   travel one line + that room (the source: 112 %). */
AIMK.preset("text/kinetic-type-swap", {
  params: { options: "nhanh hơn,thông minh hơn,cùng nhau", suffix: "", cues: "", accent: "#71f5a7", glow: true, exit: "none", duration: 4, pad: 0.3 },
  build(tl, els, p, ctx) {
    const acc = { green: "#71f5a7", blue: "#61a8ff", violet: "#c5a3ff" }[p.accent] || p.accent;
    const probe = document.createElement("span"); probe.style.color = acc; document.body.appendChild(probe);
    const rgb = (getComputedStyle(probe).color.match(/[\d.]+/g) || [113, 245, 167]).slice(0, 3).join(", "); probe.remove();
    const opts = (Array.isArray(p.options) ? p.options : String(p.options).split(",")).map(s => String(s).trim().normalize("NFC")).filter(Boolean);
    if (!opts.length) return;
    const cues = String(p.cues || "").split(",").map(s => s.trim()).filter(s => s !== "").map(Number).filter(n => isFinite(n) && n >= 0).sort((a, b) => a - b);
    const D = Math.max(0.001, +p.duration || 4), OUTB = p.exit === "fade" || p.exit === "up" ? 0.45 : 0, sc = D < 2.25 + OUTB ? D / (2.25 + OUTB) : 1;
    const IN = 2.25 * sc, OUT = OUTB * sc, ARR = 0.3 * sc, S0 = 0.48 * sc, ROLL = 0.46 * sc, TAIL = 0.18 * sc, n = opts.length - 1;
    const swaps = []; let roll = ROLL;
    if (n > 0 && cues.length) {
      const last = cues[cues.length - 1], gap = cues.length >= 2 ? Math.max(0.05, (last - cues[0]) / (cues.length - 1)) : ROLL, latest = Math.max(0, D - OUT - ROLL - TAIL);
      for (let i = 0; i < n; i++) swaps.push(Math.min(latest, Math.max(0, i < cues.length ? cues[i] : last + (i - (cues.length - 1)) * gap)));
      let mg = Infinity; for (let i = 1; i < swaps.length; i++) mg = Math.min(mg, swaps[i] - swaps[i - 1]);
      if (isFinite(mg)) roll = Math.min(ROLL, Math.max(0.04, mg * 0.72));
    } else if (n > 0) {
      const lastS = Math.max(S0, IN - TAIL - ROLL), step = n === 1 ? 0 : (lastS - S0) / (n - 1);
      roll = n <= 2 ? ROLL : Math.min(ROLL, Math.max(0.04, step * 0.72));
      for (let i = 1; i <= n; i++) swaps.push(n === 1 ? lastS : S0 + (i - 1) * step);
    }
    const end = swaps.length ? swaps[swaps.length - 1] + roll + TAIL : IN;
    const HS = Math.min(Math.max(0, D - OUT), Math.max(IN, end)), HOLD = Math.max(0, D - (HS + OUT)), OS = HS + HOLD;
    const T = (v) => +(p.at + v).toFixed(4);
    for (const el of els) {
      const prefix = el.textContent.normalize("NFC").trim(), cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize) || 48, lh = parseFloat(cs.lineHeight) || fs * 1.2, pad = Math.round(fs * p.pad), Y = Math.ceil(lh + pad + 0.25 * fs);
      ctx.id(el, "t"); el.textContent = "";
      if (prefix) ctx.make(el, "span", "pre", { text: prefix + " " });
      const slot = ctx.make(el, "span", "slot", { style: { display: "inline-grid", overflow: "hidden", verticalAlign: "top", padding: `${pad}px 0`, margin: `-${pad}px 0`, color: acc,
        textShadow: p.glow ? `0 0 ${Math.round(0.028 * ctx.H)}px rgba(${rgb}, 0.28)` : "none" } });
      const W = opts.map((o, i) => ctx.make(slot, "span", "w" + i, { text: o, style: { gridArea: "1 / 1", justifySelf: "center", width: "max-content", display: "block", opacity: i ? "0" : "1" } }));
      if (p.suffix) ctx.make(el, "span", "suf", { text: " " + String(p.suffix).normalize("NFC") });
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: +ARR.toFixed(4), ease: "power2.out" }, T(0));
      const od = +(roll * 0.55).toFixed(4);
      W.forEach((w, i) => {
        if (i > 0) {                                   // comes in at swap i - 1
          const s = swaps[i - 1], inS = s + roll - od;
          tl.set(w, { opacity: 1 }, T(inS));
          tl.fromTo(w, { y: Y }, { y: 0, duration: od, ease: i === W.length - 1 ? "back.out(1.7)" : "power4.out" }, T(inS));
        }
        if (i < W.length - 1) {                        // leaves at swap i
          tl.fromTo(w, { y: 0 }, { y: -Y, duration: od, ease: "power4.in" }, T(swaps[i]));
          tl.set(w, { opacity: 0 }, T(swaps[i] + od));
        }
      });
      const half = Math.min(0.5, HOLD / 2);
      if (half > 0) {
        const mr = Math.floor(HOLD / half) - 1, rep = mr % 2 === 1 ? mr : mr - 1;
        if (rep >= 1) tl.fromTo(W[W.length - 1], { opacity: 1 }, { opacity: 0.9, duration: +half.toFixed(4), ease: "sine.inOut", yoyo: true, repeat: rep }, T(HS));
      }
      if (OUT > 0) tl.fromTo(el, p.exit === "up" ? { opacity: 1, y: 0 } : { opacity: 1 },
        Object.assign({ opacity: 0, duration: +OUT.toFixed(4), ease: "power2.in" }, p.exit === "up" ? { y: -Math.round(0.03 * ctx.H) } : {}), T(OS));
    }
  },
});
