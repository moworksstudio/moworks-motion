/* card/testimonial-card: a customer testimonial card. The star rating and the quote rise into reading position first (0.7 s, power2.out),
   then avatar, author name and handle settle beneath with a 0.06 s stagger; a fixed 0.45 s fade releases the card at the end of `duration`.
   Port of HyperFrames registry component testimonial-card. BLOCK: the card is built inside the target box and sized from that box
   (the source used container units, cqw / cqh of its mount box). Timings of the source kept: proof 0.7 s at 0.12, attribution 0.56 s with
   0.06 s stagger at 0.82, out 0.45 s; if `duration` < 1.95 s IN and OUT scale together. */
AIMK.preset("card/testimonial-card", {
  params: { quote: "Video ra mắt của chúng tôi xong chỉ trong một buổi chiều.", author: "Trần Thu Hà", handle: "@thuha.tran", rating: 4.6,
    bg: "#070a12", fg: "#f8fafc", muted: "#a8b3c7", surface: "#151c2c", border: "#34405a", radius: 28, duration: 4 },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const mix = (a, b, q) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v * q / 100 + B[i] * (100 - q) / 100).toString(16).padStart(2, "0")).join(""); };
    const t = p.at;
    const rr = Number(p.rating), rating = Number.isFinite(rr) ? Math.max(0, Math.min(5, rr)) : 5;
    const ratingText = (Number.isInteger(rating) ? String(rating) : rating.toFixed(1)).replace(".", ",");
    const initials = String(p.author).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(s => Array.from(s)[0]).join("").toUpperCase() || "?";
    const D = Math.max(0.001, Number(p.duration) || 4), sc = D < 1.95 ? D / 1.95 : 1, OUT = 0.45 * sc, OUT_START = D - OUT;
    const STAR = "M50 0 61.8 36.2 100 36.2 69.1 58.6 80.9 95 50 72.4 19.1 95 30.9 58.6 0 36.2 38.2 36.2Z";
    ctx.css("card/testimonial-card", `
.ctc-box { position: absolute; display: grid; place-items: center; overflow: hidden; box-sizing: border-box; }
.ctc-card { display: grid; overflow: hidden; box-sizing: border-box; }
.ctc-proof { display: grid; }
.ctc-rating { display: flex; align-items: center; width: max-content; font-weight: 650; line-height: 1; font-variant-numeric: tabular-nums; }
.ctc-stars { position: relative; display: block; }
.ctc-row { display: flex; align-items: center; }
.ctc-fill { position: absolute; left: 0; top: 0; bottom: 0; overflow: hidden; }
.ctc-fill .ctc-row { width: max-content; }
.ctc-quote { margin: 0; font-weight: 650; line-height: 1.23; letter-spacing: -0.025em; text-wrap: balance; }
.ctc-attr { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto; align-items: center; }
.ctc-avatar { grid-row: 1 / 3; display: grid; place-items: center; box-sizing: border-box; border-radius: 50%; font-weight: 780; letter-spacing: 0.03em; }
.ctc-author { min-width: 0; align-self: end; font-weight: 700; line-height: 1.08; }
.ctc-handle { min-width: 0; align-self: start; line-height: 1.15; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, m = (a, b) => Math.min(cw(a), ch(b));
      const box = ctx.make(slot, "div", "tc", { cls: "ctc-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", padding: `${ch(6)}px ${cw(6)}px` } });
      const card = ctx.make(box, "div", "card", { cls: "ctc-card", style: { width: Math.min(cw(86), ch(128)) + "px", gap: m(4.6, 4.6) + "px", padding: m(6.5, 6.5) + "px",
        border: `${ch(0.16)}px solid ${p.border}`, borderRadius: p.radius + "px", background: p.surface, boxShadow: `0 ${ch(3)}px ${ch(8)}px ${rgba(p.bg, 0.68)}`, color: p.fg } });
      const proof = ctx.make(card, "div", "proof", { cls: "ctc-proof", style: { gap: m(3.2, 3.2) + "px" } });
      const rat = ctx.make(proof, "div", "rating", { cls: "ctc-rating", style: { gap: m(2, 2) + "px", color: p.muted, fontSize: m(2.4, 2.4) + "px" } });
      const fs = m(3.4, 3.4), cell = fs * 1.18, star = (col) => `<svg viewBox="0 0 100 100" style="width:${fs}px;height:${fs}px;margin-right:${(fs * 0.18).toFixed(2)}px;flex:none;fill:${col}"><path d="${STAR}"/></svg>`;
      const stars = ctx.make(rat, "div", "stars", { cls: "ctc-stars", style: { width: cell * 5 + "px", height: fs + "px" } });
      ctx.make(stars, "div", "base", { cls: "ctc-row", html: star(p.muted).repeat(5) });
      ctx.make(stars, "div", "fill", { cls: "ctc-fill", html: `<div class="ctc-row">${star(p.fg).repeat(5)}</div>`, style: { width: cell * 5 * rating / 5 + "px" } });
      ctx.make(rat, "span", "val", { text: ratingText + " / 5" });
      ctx.make(proof, "blockquote", "quote", { cls: "ctc-quote", text: p.quote, style: { color: p.fg, fontSize: m(5.2, 5.2) + "px" } });
      const attr = ctx.make(card, "div", "attr", { cls: "ctc-attr", style: { columnGap: m(2.7, 2.7) + "px", rowGap: m(0.65, 0.65) + "px" } });
      const av = ctx.make(attr, "div", "avatar", { cls: "ctc-avatar", text: initials, style: { width: m(8.4, 8.4) + "px", height: m(8.4, 8.4) + "px",
        border: `${ch(0.16)}px solid ${rgba(p.fg, 0.2)}`, background: mix(p.fg, p.surface, 72), color: p.bg, fontSize: m(2.65, 2.65) + "px" } });
      const au = ctx.make(attr, "div", "author", { cls: "ctc-author", text: p.author, style: { color: p.fg, fontSize: m(3.2, 3.2) + "px" } });
      const ha = ctx.make(attr, "div", "handle", { cls: "ctc-handle", text: p.handle, style: { color: p.muted, fontSize: m(2.35, 2.35) + "px" } });
      tl.fromTo(proof, { yPercent: 18, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7 * sc, ease: "power2.out" }, t + 0.12 * sc);
      [av, au, ha].forEach((e, i) => tl.fromTo(e, { yPercent: 34, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.56 * sc, ease: "power2.out" }, t + (0.82 + i * 0.06) * sc));   // source: one tween with stagger 0.06 s
      tl.fromTo(card, { opacity: 1 }, { opacity: 0, duration: OUT, ease: "power2.in" }, t + OUT_START);
    }
  },
});
