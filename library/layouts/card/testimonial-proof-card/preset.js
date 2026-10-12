/* card/testimonial-proof-card: a quote card. The card settles up, the quote rises line by line through soft masks (0.18 s stagger), the byline
   (avatar disc with initials, name, role, company) fades up over the last line's landing, then one hand-drawn accent underline draws under the
   emphasised words. Dead-still hold. Optional exit "fade" | "up".
   Port of HyperFrames registry component testimonial-proof-card. BLOCK: sized from the target box (source: container units cqw / cqh / cqmin of its mount).
   Source phases kept: card 0.5 s power3.out; lines 0.6 s power3.out, 0.18 s stagger from 0.15 s; byline 0.5 s at (quote end - 0.15 s); underline 0.55 s power2.inOut
   at (quote end + 0.1 s); exit 0.45 s. If `duration` is shorter than the phases, they compress together.
   Line breaks: the source measured the wrapped lines in the browser; a block cannot rely on the film font being loaded while it builds, so the quote is
   broken into balanced lines from a glyph-width estimate (or at every "|" you type in the quote). */
AIMK.preset("card/testimonial-proof-card", {
  params: { quote: "Chúng tôi hoàn thành video ra mắt chỉ trong một buổi chiều", name: "Nguyễn Minh Anh", role: "Giám đốc sản phẩm", company: "NORTHWIND", emphasis: "một buổi chiều",
    accent: "#71f5a7", fg: "#f8fafc", muted: "#94a3b8", surface: "#14171c", border: "#343a46", radius: 24, exit: "none", duration: 4.5 },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const mix = (a, b, q) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v * q / 100 + B[i] * (100 - q) / 100).toString(16).padStart(2, "0")).join(""); };
    const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const t = p.at, exit = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
    const norm = s => String(s == null ? "" : s).trim().replace(/\s+/g, " ");
    const quote = norm(p.quote), name = norm(p.name), role = norm(p.role), company = norm(p.company), emphasis = norm(p.emphasis);
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map(s => Array.from(s)[0].toUpperCase()).join("") || "?";
    // glyph width estimate (em) for a bold sans: used only to break the quote into lines
    const gw = c => c === " " ? 0.25 : "ijl.,:;!'|".includes(c) ? 0.27 : "ftr()[]-".includes(c) ? 0.36 : "mwMW".includes(c) ? 0.86 : (c !== c.toLowerCase() ? 0.64 : 0.55);
    const wid = s => Array.from(s).reduce((a, c) => a + gw(c) - 0.02, 0);
    ctx.css("card/testimonial-proof-card", `
.ctp-box { position: absolute; display: grid; place-items: center; overflow: hidden; box-sizing: border-box; }
.ctp-card { box-sizing: border-box; }
.ctp-glyph { font-weight: 600; line-height: 0.6; }
.ctp-quote { margin: 0; font-weight: 600; line-height: 1.28; letter-spacing: -0.02em; }
.ctp-lm { overflow: hidden; padding: 0.12em 0.24em 0.3em; margin: -0.12em -0.24em -0.3em; }
.ctp-line { white-space: nowrap; }
.ctp-em { position: relative; display: inline-block; white-space: nowrap; }
.ctp-emt { position: relative; z-index: 1; }
.ctp-mark { position: absolute; left: -2%; bottom: -0.14em; width: 104%; height: 0.24em; overflow: visible; z-index: 2; }
.ctp-byline { display: flex; align-items: center; }
.ctp-avatar { flex: none; border-radius: 50%; overflow: hidden; display: grid; place-items: center; box-sizing: border-box; }
.ctp-init { font-weight: 600; letter-spacing: 0.08em; }
.ctp-person { display: grid; }
.ctp-name { font-weight: 600; letter-spacing: 0.02em; }
.ctp-company { margin-left: auto; letter-spacing: 0.3em; text-transform: uppercase; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, cm = v => v * Math.min(W, H) / 100;
      const cardW = Math.min(cw(76), ch(150)), padX = cm(7), padY = cm(6), innerW = cardW - 2 * padX - 2;
      // emphasis: first case-insensitive match, expanded to whole words (the quote tokenises into words, the emphasis is one unbreakable token)
      let ms = -1, me = -1;
      if (emphasis) { const i = quote.toLowerCase().indexOf(emphasis.toLowerCase()); if (i >= 0) { ms = quote.lastIndexOf(" ", i) + 1; me = quote.indexOf(" ", i + emphasis.length); if (me < 0) me = quote.length; } }
      const toks = [], push = s => s.split(" ").forEach(w => { if (w) toks.push({ text: w, em: false }); });
      if (ms >= 0) { push(quote.slice(0, ms)); toks.push({ text: quote.slice(ms, me), em: true }); push(quote.slice(me)); } else push(quote);
      let fs = cm(Math.max(3.8, Math.min(7.2, 46 / Math.sqrt(Math.max(1, Array.from(quote).length)))));
      const SP = 0.25;
      let rows = null;
      if (quote.includes("|")) { rows = quote.split("|").map(s => s.trim()).filter(Boolean); }
      const build = () => {                                                      // balanced lines for the current font size
        const w = toks.map(k => wid(k.text) * fs), sp = SP * fs, maxW = innerW * 0.94, n = toks.length;
        if (Math.max(...w) > maxW) return null;
        let L = 1, run = 0;                                                     // greedy line count
        for (let i = 0; i < n; i++) { const add = (run ? sp : 0) + w[i]; if (run && run + add > maxW) { L++; run = w[i]; } else run += add; }
        const total = w.reduce((a, b) => a + b, 0) + sp * (n - L), target = total / L, INF = 1e18;
        const cost = Array.from({ length: L + 1 }, () => Array(n + 1).fill(INF)), from = Array.from({ length: L + 1 }, () => Array(n + 1).fill(0)); cost[0][0] = 0;
        for (let k = 1; k <= L; k++) for (let j = k; j <= n; j++) { let lw = 0; for (let i = j - 1; i >= k - 1; i--) { lw += w[i] + (i < j - 1 ? sp : 0); if (lw > maxW) break;
          if (cost[k - 1][i] < INF) { const c = cost[k - 1][i] + (lw - target) ** 2; if (c < cost[k][j]) { cost[k][j] = c; from[k][j] = i; } } } }
        if (cost[L][n] >= INF) return null;
        const out = []; let j = n; for (let k = L; k >= 1; k--) { const i = from[k][j]; out.unshift(toks.slice(i, j)); j = i; }
        return out;
      };
      let lines = null;
      if (rows) lines = rows.map(r => [{ text: r, em: false }]);
      else { for (let tries = 0; tries < 30 && !(lines = build()); tries++) fs *= 0.95; if (!lines) lines = [toks]; }
      const lineHtml = row => row.map(k => k.em ? `<span class="ctp-em"><svg class="ctp-mark" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="M 2 7 C 20 4.5, 46 8.5, 66 6 C 80 4.5, 92 7.5, 98 5.5" fill="none" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:${p.accent};opacity:0"></path></svg><span class="ctp-emt">${esc(k.text)}</span></span>` : esc(k.text)).join(" ");
      const box = ctx.make(slot, "div", "tq", { cls: "ctp-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "ctp-card", style: { width: cardW + "px", padding: `${padY}px ${padX}px`, borderRadius: p.radius + "px", border: `1px solid ${rgba(p.border, 0.6)}`, background: rgba(p.surface, 0.88), color: p.fg } });
      ctx.make(card, "div", "glyph", { cls: "ctp-glyph", text: "“", style: { fontSize: cm(9) + "px", color: p.accent, marginBottom: cm(2.4) + "px" } });
      const q = ctx.make(card, "blockquote", "quote", { cls: "ctp-quote", style: { fontSize: fs + "px" } });
      const lineEls = lines.map((row, i) => { const m = ctx.make(q, "div", "m" + i, { cls: "ctp-lm" }); return ctx.make(m, "div", "l" + i, { cls: "ctp-line", html: lineHtml(row) }); });
      const by = ctx.make(card, "div", "byline", { cls: "ctp-byline", style: { gap: cm(3) + "px", marginTop: cm(5) + "px" } });
      const av = ctx.make(by, "div", "avatar", { cls: "ctp-avatar", style: { width: cm(10) + "px", height: cm(10) + "px", border: `1px solid ${rgba(p.border, 0.7)}`, background: mix(p.accent, p.surface, 16) } });
      ctx.make(av, "span", "init", { cls: "ctp-init", text: initials, style: { fontSize: cm(3.4) + "px", color: p.fg } });
      const per = ctx.make(by, "div", "person", { cls: "ctp-person", style: { gap: cm(0.8) + "px" } });
      ctx.make(per, "span", "name", { cls: "ctp-name", text: name, style: { fontSize: cm(2.9) + "px" } });
      if (role) ctx.make(per, "span", "role", { text: role, style: { fontSize: cm(2.4) + "px", color: p.muted } });
      if (company) ctx.make(by, "span", "company", { cls: "ctp-company", text: company, style: { fontSize: cm(2.3) + "px", color: p.muted } });
      // phases (source): fixed, compress together when `duration` is too short
      const D = Math.max(0.001, Number(p.duration) || 4.5), CARD = 0.5, LINE = 0.6, STAG = 0.18, AT = 0.15, BY = 0.5, DRAW = 0.55, OUTB = exit === "none" ? 0 : 0.45;
      const quoteEnd = AT + Math.max(0, lineEls.length - 1) * STAG + LINE, byAt = Math.max(0, quoteEnd - 0.15), drawAt = quoteEnd + 0.1;
      const path = q.querySelector("path"), inEnd = Math.max(CARD, byAt + BY, path ? drawAt + DRAW : 0);
      const s = D < inEnd + OUTB ? D / (inEnd + OUTB) : 1, OUT = OUTB * s, OUT_START = D - OUT;
      tl.fromTo(card, { opacity: 0, y: ch(4) }, { opacity: 1, y: 0, duration: CARD * s, ease: "power3.out" }, t);
      lineEls.forEach((l, i) => tl.fromTo(l, { yPercent: 130, opacity: 0 }, { yPercent: 0, opacity: 1, duration: LINE * s, ease: "power3.out" }, t + (AT + i * STAG) * s));
      tl.fromTo(by, { opacity: 0, y: ch(2.5) }, { opacity: 1, y: 0, duration: BY * s, ease: "power3.out" }, t + byAt * s);
      if (path) {
        path.id = q.id + "_path";
        const len = Math.ceil(path.getTotalLength() * 100) / 100; path.style.strokeDasharray = String(len); path.style.strokeDashoffset = String(len);
        tl.set(path, { opacity: 1, ease: "none" }, t + drawAt * s);
        tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: DRAW * s, ease: "power2.inOut" }, t + drawAt * s);
      }
      if (exit === "fade") tl.to(card, { opacity: 0, duration: OUT, ease: "power2.in" }, t + OUT_START);
      else if (exit === "up") tl.to(card, { opacity: 0, y: -ch(6), duration: OUT, ease: "power2.in" }, t + OUT_START);
    }
  },
});
