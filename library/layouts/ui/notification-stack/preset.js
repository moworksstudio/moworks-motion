/* ui/notification-stack: 1 to 5 notification cards (accent dot, title, one body line) slide-settle into a vertical stack on cues, newest on top: each new card drops into the top slot
   with a fade and a smooth long-tail settle while the cards already there shift down one slot. After the last card lands, one card (`expand`) grows slightly and brightens as the focus
   while the rest dim by stack position; then the frame holds perfectly still until the optional exit.
   Port of HyperFrames registry component notification-stack. BLOCK: the target is an empty box (usually the whole frame); the stack is built centred inside it. Sizes that were container
   units (cqw / cqh / cqmin) are px of the target box here (1 % of its width / height / smaller side), computed when the block is built.
   Source timing kept: first arrival 0.2 s, 0.55 s apart (or the cues), enter 0.55 s power3.out, shift 0.45 s power3.out, resolve 0.5 s power2.out at last + 0.65 s, exit 0.45 s.
   `duration` is the authored length of the source composition (4 s): it sets the elastic hold and the exit start. */
AIMK.preset("ui/notification-stack", {
  params: { titles: ["Bản dựng đã vào hàng chờ", "Kiểm tra đã đạt", "Phim đã lên sóng"], bodies: ["Quy trình bắt đầu cho nhánh chính", "Cả 42 bước kiểm tra đều xanh", "Đang phát phiên bản 2.4"],
    expand: -1, cues: [], accent: "#71f5a7", exit: "none", duration: 4, fg: "#f8fafc", surface: "#131a24", border: "#334155", muted: "#94a3b8" },
  build(tl, els, p, ctx) {
    ctx.css("ui/notification-stack", `
.uins { position: absolute; inset: 0; overflow: hidden; isolation: isolate; box-sizing: border-box; display: grid; place-items: center; }
.uins * { box-sizing: border-box; }
.uins-stage { position: relative; will-change: transform, opacity; }
.uins-card { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; overflow: hidden; border-style: solid; will-change: transform, opacity, filter; }
.uins-dot { flex: 0 0 auto; aspect-ratio: 1; border-radius: 50%; }
.uins-text { display: flex; flex-direction: column; min-width: 0; }
.uins-title { overflow: hidden; font-weight: 600; line-height: 1.2; letter-spacing: 0.01em; white-space: nowrap; text-overflow: ellipsis; }
.uins-body { overflow: hidden; font-weight: 400; line-height: 1.25; white-space: nowrap; text-overflow: ellipsis; }`);
    const titles = (p.titles || []).filter(s => String(s).trim() !== "").slice(0, 5), count = titles.length, bodies = p.bodies || [];
    if (!count) return;
    const exit = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
    const exRaw = Math.round(Number(p.expand)), expand = Number.isFinite(exRaw) && exRaw >= 0 && exRaw < count ? exRaw : count - 1;
    const GAP_CQH = 2, cardH = Math.min(15, (74 - (count - 1) * GAP_CQH) / count), slotH = cardH + GAP_CQH;
    const BASE = 0.2, GAP = 0.55, ENTER = 0.55, SHIFT = 0.45, RESOLVE_DUR = 0.5, OUT_BASE = 0.45;
    const D = Math.max(0.001, p.duration), OUT = exit === "none" ? 0 : Math.min(OUT_BASE, D * 0.25), avail = D - OUT, latestStart = Math.max(0, avail - 1.05);
    const starts = [];
    for (let i = 0; i < count; i++) {
      const cue = Number(p.cues && p.cues[i]), hasCue = p.cues && p.cues[i] != null && String(p.cues[i]).trim() !== "" && Number.isFinite(cue);
      let s = hasCue ? cue : BASE + GAP * i;
      if (i > 0) s = Math.max(s, starts[i - 1] + 0.05);
      starts.push(Math.max(0, Math.min(s, latestStart)));
    }
    for (let i = 1; i < count; i++) starts[i] = Math.max(starts[i], starts[i - 1]);
    const last = starts[count - 1], resolve = Math.max(last + 0.1, Math.min(last + 0.65, avail - RESOLVE_DUR)), resolveDur = Math.min(RESOLVE_DUR, Math.max(0.001, avail - resolve));
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, cqw = sw / 100, cqh = sh / 100, cqm = Math.min(sw, sh) / 100;
      const cardPx = cardH * cqh, f = n => +n.toFixed(2) + "px";
      const root = ctx.make(slot, "div", "root", { cls: "uins", style: { color: p.fg } });
      const stage = ctx.make(root, "div", "stage", { cls: "uins-stage", style: { width: f(Math.min(54 * cqw, 110 * cqh)), height: f((count * cardH + (count - 1) * GAP_CQH) * cqh) } });
      const cards = titles.map((title, i) => {
        const card = ctx.make(stage, "div", "c" + i, { cls: "uins-card", style: { height: f(cardPx), gap: f(2.2 * cqm), padding: `0 ${f(2.2 * cqm)}`, borderWidth: f(0.16 * cqm), borderColor: p.border,
          borderRadius: f(1.8 * cqm), background: p.surface, boxShadow: `0 ${f(1 * cqm)} ${f(3 * cqm)} rgba(5, 7, 10, 0.45)`, zIndex: i === expand ? "2" : "1" } });
        ctx.make(card, "span", "dot", { cls: "uins-dot", style: { width: f(Math.min(1.7 * cqm, cardPx * 0.14)), background: p.accent } });
        const text = ctx.make(card, "span", "text", { cls: "uins-text", style: { gap: f(Math.min(0.7 * cqm, cardPx * 0.06)) } });
        ctx.make(text, "span", "title", { cls: "uins-title", text: String(title).trim(), style: { color: p.fg, fontSize: f(Math.min(3.2 * cqm, cardPx * 0.24)) } });
        const body = String(bodies[i] || "").trim();
        if (body !== "") ctx.make(text, "span", "body", { cls: "uins-body", text: body, style: { color: p.muted, fontSize: f(Math.min(2.5 * cqm, cardPx * 0.19)) } });
        return card;
      });
      const t = p.at, yFor = s => s * slotH * cqh, enterY = -(cardH * 0.6 * cqh);
      cards.forEach((card, index) => {
        const ev = starts[index], cap = Math.max(0.001, (index + 1 < count ? starts[index + 1] : resolve) - ev);
        tl.fromTo(card, { opacity: 0, y: +enterY.toFixed(2) }, { opacity: 1, y: 0, duration: Math.min(ENTER, cap), ease: "power3.out" }, t + ev);
        for (let j = 0; j < index; j++)
          tl.fromTo(cards[j], { y: +yFor(index - 1 - j).toFixed(2) }, { y: +yFor(index - j).toFixed(2), duration: Math.min(SHIFT, cap), ease: "power3.out", immediateRender: false }, t + ev);
      });
      cards.forEach((card, index) => {
        const stackPos = count - 1 - index;
        if (index === expand) tl.fromTo(card, { scale: 1, filter: "brightness(1)" }, { scale: 1.045, filter: "brightness(1.1)", duration: resolveDur, ease: "power2.out", immediateRender: false }, t + resolve);
        else tl.fromTo(card, { opacity: 1 }, { opacity: Math.max(0.42, 0.72 - 0.07 * stackPos), duration: resolveDur, ease: "power2.out", immediateRender: false }, t + resolve);
      });
      if (exit !== "none") {
        tl.to(stage, { opacity: 0, duration: OUT, ease: "power2.in" }, t + D - OUT);
        if (exit === "up") tl.to(stage, { y: -+(3 * cqh).toFixed(2), duration: OUT, ease: "power2.in" }, t + D - OUT);
      }
    }
  },
});
