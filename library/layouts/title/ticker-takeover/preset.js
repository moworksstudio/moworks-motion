/* title/ticker-takeover: a compact ticker rolls through four to six words, speeding up then braking, locks on the chosen word with an accent flash,
   then that word is promoted into a full-frame headline while the ticker falls away. Port of HyperFrames registry component ticker-takeover. BLOCK:
   built inside the target (usually the whole frame); cqw / cqh of the source are taken from that box. As in the source: ticker 76 x 18 cqh at
   (12 cqw, 55 cqh), mono label 18 cqw column, 12 cqh rows; IN 3.15 s: ticker 0.35 s power2.out from 97 %; roll from 0.32 s, 72 % of the way in
   0.82 s power4.in, the rest in 0.93 s power4.out; at the lock the final word pops from 114 % (0.3 s expo.out, accent colour) and the window flashes
   (accent 82 % -> 0, 0.34 s power2.out); 0.18 s later the headline grows from 22 % and 20 cqh below (power3.out until IN) while the ticker fades
   to 96 % (68 % of that time, power2.in); hold drift -0.7 cqh and back (sine.inOut); exit 0.45 s power2.in, -3 cqh. Theme tokens are params.
   The lock pop and the flash are written with immediateRender: false: in the source they rendered their start (green flash at 82 %, accent word)
   from frame 0, a source bug (its notes say the flash comes at the lock). */
AIMK.preset("title/ticker-takeover", {
  params: { options: "nhanh hơn,thông minh hơn,cùng nhau,mọi nơi", final: "cùng nhau", label: "TÍN HIỆU", accent: "green", duration: 4.5, exit: true,
            bg: "transparent", fg: "#f8fafc", muted: "#94a3b8", surface: "#172033", shadow: "#0b0c0e" },
  build(tl, els, p, ctx) {
    const acc = { green: "#22c55e", blue: "#38bdf8", violet: "#a78bfa" }[p.accent] || p.accent;
    const rgb = c => { const d = document.createElement("span"); d.style.color = c; document.body.appendChild(d); const m = getComputedStyle(d).color.match(/[\d.]+/g).slice(0, 3).join(", "); d.remove(); return m; };
    const fin = String(p.final).normalize("NFC").trim() || "cùng nhau", key = fin.toLowerCase(), opts = [];
    const add = w => { const n = w.toLowerCase(); if (n !== key && !opts.some(o => o.toLowerCase() === n) && opts.length < 5) opts.push(w); };
    (Array.isArray(p.options) ? p.options : String(p.options).split(",")).map(s => String(s).trim().normalize("NFC")).filter(Boolean).forEach(add);
    ["faster", "smarter", "together", "everywhere"].forEach(w => { if (opts.length < 3) add(w); });
    opts.push(fin);
    const D = Math.max(0.001, p.duration), OUT0 = p.exit ? 0.45 : 0, sc = D < 3.15 + OUT0 ? D / (3.15 + OUT0) : 1;
    const IN = 3.15 * sc, OUT = OUT0 * sc, HOLD = Math.max(0, D - IN - OUT), f = v => +v.toFixed(4), t = p.at;
    const RS = 0.32 * sc, AC = 0.82 * sc, DC = 0.93 * sc, LOCK = RS + AC + DC, PROM = LOCK + 0.18 * sc, PD = Math.max(0.001, IN - PROM);
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100;
      const M = rgb(p.muted), S = rgb(p.surface), B = rgb(p.shadow);
      const root = ctx.make(slot, "div", "root", { style: { position: "absolute", inset: "0px", overflow: "hidden", background: p.bg, color: p.fg } });
      const tk = ctx.make(root, "div", "ticker", { style: { position: "absolute", top: f(55 * ch) + "px", left: f(12 * cw) + "px", width: f(76 * cw) + "px", height: f(18 * ch) + "px",
        display: "grid", gridTemplateColumns: `${f(18 * cw)}px 1fr`, alignItems: "center", overflow: "hidden", border: `${f(0.12 * cw)}px solid rgba(${M}, 0.38)`, borderRadius: f(3 * ch) + "px",
        background: `rgba(${S}, 0.92)`, boxShadow: `0 ${f(3 * ch)}px ${f(9 * ch)}px rgba(${B}, 0.52)` } });
      ctx.make(tk, "div", "label", { text: String(p.label).toUpperCase(), style: { display: "grid", placeItems: "center", height: f(12 * ch) + "px", borderRight: `${f(0.12 * cw)}px solid rgba(${M}, 0.3)`,
        color: p.muted, fontFamily: '"RMono", Consolas, monospace', fontSize: f(2.4 * ch) + "px", fontWeight: "700", letterSpacing: "0.18em" } });
      const win = ctx.make(tk, "div", "window", { style: { position: "relative", height: f(12 * ch) + "px", overflow: "hidden" } });
      const reel = ctx.make(win, "div", "reel", { style: { width: "100%" } });
      const items = opts.map((w, i) => ctx.make(reel, "span", "i" + i, { text: w, style: { display: "flex", alignItems: "center", height: f(12 * ch) + "px", padding: `0px ${f(4 * cw)}px`, color: p.fg,
        fontFamily: '"RMono", Consolas, monospace', fontSize: f(4.2 * ch) + "px", fontWeight: "650", letterSpacing: "-0.025em", whiteSpace: "nowrap", transformOrigin: "left center" } }));
      const flash = ctx.make(tk, "div", "flash", { attrs: { "data-lint": "ignore" }, style: { position: "absolute", inset: "0px", background: acc, opacity: "0" } });
      const head = ctx.make(root, "div", "headline", { text: fin, style: { position: "absolute", top: f(30 * ch) + "px", left: f(7 * cw) + "px", width: f(86 * cw) + "px", height: f(30 * ch) + "px",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", color: acc, fontSize: f(15 * ch) + "px", fontWeight: "820", lineHeight: "0.9", letterSpacing: "-0.065em",
        textAlign: "center", whiteSpace: "nowrap", transformOrigin: "50% 50%", opacity: "0" } });
      const fo = -(opts.length - 1) * 12 * ch;
      tl.fromTo(tk, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: f(0.35 * sc), ease: "power2.out" }, t);
      tl.fromTo(reel, { y: 0 }, { y: f(fo * 0.72), duration: f(AC), ease: "power4.in" }, f(t + RS));
      tl.fromTo(reel, { y: f(fo * 0.72) }, { y: f(fo), duration: f(DC), ease: "power4.out" }, f(t + RS + AC));
      tl.fromTo(items[items.length - 1], { scale: 1.14, color: acc }, { scale: 1, color: acc, duration: f(0.3 * sc), ease: "expo.out", immediateRender: false }, f(t + LOCK));
      tl.fromTo(flash, { opacity: 0.82 }, { opacity: 0, duration: f(0.34 * sc), ease: "power2.out", immediateRender: false }, f(t + LOCK));
      tl.fromTo(head, { opacity: 0, scale: 0.22, y: f(20 * ch) }, { opacity: 1, scale: 1, y: 0, duration: f(PD), ease: "power3.out" }, f(t + PROM));
      tl.fromTo(tk, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration: f(PD * 0.68), ease: "power2.in" }, f(t + PROM));
      if (HOLD > 0) tl.fromTo(head, { y: 0 }, { y: f(-0.7 * ch), duration: f(HOLD / 2), ease: "sine.inOut", yoyo: true, repeat: 1 }, f(t + IN));
      if (OUT) tl.fromTo(head, { opacity: 1, y: 0 }, { opacity: 0, y: f(-3 * ch), duration: f(OUT), ease: "power2.in" }, f(t + IN + HOLD));
    }
  },
});
