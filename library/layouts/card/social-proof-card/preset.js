/* card/social-proof-card: an app-store style closing card: wordmark, five stars, a proof line, three feature icons with two-line labels, a CTA capsule.
   Built in a quiet stagger and held (the source has no exit).
   Port of HyperFrames registry component social-proof-card. BLOCK: the card fills the target box (a full box paints `bg`, the source painted its root with the
   surface token) and is sized from that box (source: container units cqh / cqmin of its mount). Source timing kept: wordmark 0.4 s at 0.25; stars 0.3 s
   back.out(2.4) at 0.55 + 0.08 s each; proof line 0.35 s at 1.05; features 0.4 s at 1.3 + 0.15 s each; CTA 0.45 s back.out(1.8) at 1.95. */
AIMK.preset("card/social-proof-card", {
  params: { brand: "Lumina", proof: "12.000+ nhà sáng tạo tin dùng", cta: "Dùng thử miễn phí", f1: "Thiết kế|dễ dàng", f2: "Xuất bản|chuẩn từng pixel", f3: "Làm chủ|từng chi tiết",
    bg: "#f9f2e7", fg: "#1c3a34", accent: "#185450", brandColor: "#3ce6ac", ctaInk: "#0d3b2b", star: "#f5b942" },
  build(tl, els, p, ctx) {
    const t = p.at, esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const STAR = "M12 0 L15 8.2 L23.4 8.2 L16.6 13.4 L19.2 21.8 L12 16.8 L4.8 21.8 L7.4 13.4 L0.6 8.2 L9 8.2 Z";
    const ICONS = [
      "M3 17.2 V21 h3.8 L18 9.8 l-3.8-3.8 L3 17.2 Z M20.7 7.1 c0.4-0.4 0.4-1 0-1.4 l-2.4-2.4 c-0.4-0.4-1-0.4-1.4 0 l-1.8 1.8 3.8 3.8 1.8-1.8 Z",
      "M12 21 C12 21 1 14.4 1 7.6 C1 3.9 3.9 1 7.5 1 C9.4 1 11.1 1.9 12 3.3 C12.9 1.9 14.6 1 16.5 1 C20.1 1 23 3.9 23 7.6 C23 14.4 12 21 12 21 Z",
      "M12 2 C6.5 2 2 6.5 2 12 s4.5 10 10 10 c0.9 0 1.6-0.7 1.6-1.6 0-0.4-0.2-0.8-0.4-1.1 -0.3-0.3-0.4-0.7-0.4-1.1 0-0.9 0.7-1.6 1.6-1.6 h1.9 c3.1 0 5.7-2.6 5.7-5.7 C22 7 17.5 2 12 2 Z M6.5 12 c-0.8 0-1.5-0.7-1.5-1.5 S5.7 9 6.5 9 8 9.7 8 10.5 7.3 12 6.5 12 Z M9.5 8 C8.7 8 8 7.3 8 6.5 S8.7 5 9.5 5 s1.5 0.7 1.5 1.5 S10.3 8 9.5 8 Z M14.5 8 c-0.8 0-1.5-0.7-1.5-1.5 S13.7 5 14.5 5 16 5.7 16 6.5 15.3 8 14.5 8 Z M17.5 12 c-0.8 0-1.5-0.7-1.5-1.5 S16.7 9 17.5 9 19 9.7 19 10.5 18.3 12 17.5 12 Z",
    ];
    ctx.css("card/social-proof-card", `
.csp-box { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; box-sizing: border-box; }
.csp-brand { font-weight: 700; letter-spacing: -0.01em; }
.csp-stars { display: flex; }
.csp-proof { font-weight: 600; }
.csp-feats { display: flex; }
.csp-feat { display: flex; flex-direction: column; align-items: center; }
.csp-icon { border-radius: 50%; display: grid; place-items: center; }
.csp-label { line-height: 1.35; }
.csp-cta { font-weight: 700; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, ch = v => v * H / 100, cm = v => v * Math.min(W, H) / 100;
      const box = ctx.make(slot, "div", "sp", { cls: "csp-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", gap: ch(4.2) + "px", background: p.bg, color: p.fg } });
      const brand = ctx.make(box, "div", "brand", { cls: "csp-brand", text: p.brand, style: { fontSize: Math.min(cm(9), ch(7)) + "px", color: p.fg } });
      const stars = ctx.make(box, "div", "stars", { cls: "csp-stars", style: { gap: cm(1.6) + "px" } });
      const starEls = [0, 1, 2, 3, 4].map(i => ctx.make(stars, "div", "s" + i, { html: `<svg viewBox="0 0 24 23" style="display:block;width:${cm(5.4)}px;height:${cm(5.2)}px"><path d="${STAR}" fill="${p.star}"/></svg>` }));
      const proof = ctx.make(box, "div", "proof", { cls: "csp-proof", text: p.proof, style: { fontSize: Math.min(cm(4.2), ch(3.4)) + "px", color: p.accent } });
      const feats = ctx.make(box, "div", "feats", { cls: "csp-feats", style: { gap: cm(8) + "px", marginTop: ch(1) + "px" } });
      const featEls = [p.f1, p.f2, p.f3].map((raw, i) => {
        const f = ctx.make(feats, "div", "f" + i, { cls: "csp-feat", style: { gap: ch(1.6) + "px" } });
        ctx.make(f, "div", "icon", { cls: "csp-icon", html: `<svg viewBox="0 0 24 24" style="width:46%;height:46%"><path d="${ICONS[i]}" fill="${p.bg}"/></svg>`, style: { width: cm(12) + "px", height: cm(12) + "px", background: p.accent } });
        ctx.make(f, "div", "label", { cls: "csp-label", html: String(raw).split("|").map(esc).join("<br>"), style: { fontSize: Math.min(cm(3.4), ch(2.8)) + "px", color: p.fg } });
        return f;
      });
      const cta = ctx.make(box, "div", "cta", { cls: "csp-cta", text: p.cta, style: { marginTop: ch(2.4) + "px", padding: `${ch(2.4)}px ${cm(9)}px`, borderRadius: cm(100) + "px", background: p.brandColor, color: p.ctaInk, fontSize: Math.min(cm(4.6), ch(3.8)) + "px" } });
      tl.fromTo(brand, { opacity: 0, y: ch(1.6) }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t + 0.25);
      starEls.forEach((s, i) => tl.fromTo(s, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" }, t + 0.55 + i * 0.08));
      tl.fromTo(proof, { opacity: 0, y: ch(1.2) }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t + 1.05);
      featEls.forEach((f, i) => tl.fromTo(f, { opacity: 0, y: ch(1.6) }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t + 1.3 + i * 0.15));
      tl.fromTo(cta, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, t + 1.95);
    }
  },
});
