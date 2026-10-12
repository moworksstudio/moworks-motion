/* ui/notification-pileup: mobile notification cards arrive faster and faster, each new one landing at the top and pushing the pile down, into a dense anxious tower that breathes,
   then fades out. Port of HyperFrames registry component notification-pileup. BLOCK: the target is an empty box (usually the whole frame); the dark backdrop and the pile are built inside it.
   Sizes that were container units (cqw / cqh / cqmin) are px of the target box here (1 % of its width / height / smaller side), computed when the block is built.
   Source timing kept: stage settle 0.34 s, first card at 0.16 s, gaps 0.78 s x 0.78^n / speed (floor 0.09 s, squeezed to fit IN = 3.3 s), entry 0.38 s back.out(1.7), push 0.24 s
   power2.out, breathing 0.9 s sine.inOut half-cycles, fade-out 0.5 s power2.in. `duration` is the authored length (8 s): it sets the elastic hold and the fade-out start. */
AIMK.preset("ui/notification-pileup", {
  params: {
    count: 7, speed: 1, showBadges: "yes", duration: 8,
    items: [
      { icon: "T", title: "Tin nhắn", body: "Bạn xem giúp mình một chút nhé?", badge: "3" }, { icon: "L", title: "Lịch", body: "Họp nhóm dời sang 10:30", badge: "1" },
      { icon: "@", title: "Thư", body: "Năm phản hồi mới trong chuỗi thư", badge: "5" }, { icon: "C", title: "Cập nhật", body: "Đã có phiên bản mới", badge: "2" },
      { icon: "V", title: "Việc cần làm", body: "Hạn chót dời sang hôm nay", badge: "7" }, { icon: "D", title: "Drive", body: "Có người xin quyền truy cập", badge: "4" },
      { icon: "B", title: "Bảo mật", body: "Có lượt đăng nhập mới cần xem", badge: "1" }, { icon: "#", title: "Mạng xã hội", body: "Bạn có mười hai lượt nhắc mới", badge: "12" },
      { icon: "G", title: "Ghi chú", body: "Danh sách chung vừa được cập nhật", badge: "6" }, { icon: "N", title: "Nhắc nhở", body: "Theo dõi lại trước cuối ngày", badge: "9" },
    ],
    bg: "#0b1120", fg: "#f8fafc", surface: "#1e293b", accent: "#38bdf8", brand: "#22c55e", border: "#334155", muted: "#94a3b8",
  },
  build(tl, els, p, ctx) {
    ctx.css("ui/notification-pileup", `
.uinp { position: absolute; inset: 0; overflow: hidden; isolation: isolate; box-sizing: border-box; }
.uinp * { box-sizing: border-box; }
.uinp-backdrop, .uinp-stage { position: absolute; inset: 0; width: 100%; height: 100%; }
.uinp-stage { transform-origin: 50% 45%; will-change: transform, opacity; }
.uinp-stack { position: absolute; }
.uinp-card { position: absolute; top: 0; left: 0; display: grid; align-items: center; width: 100%; overflow: hidden; border-style: solid; transform-origin: 50% 18%; will-change: transform, opacity; }
.uinp-icon { display: grid; place-items: center; font-weight: 780; line-height: 1; }
.uinp-copy { min-width: 0; overflow: hidden; }
.uinp-title, .uinp-body { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uinp-title { font-weight: 720; line-height: 1.12; letter-spacing: -0.01em; }
.uinp-body { font-weight: 520; line-height: 1.12; }
.uinp-badge { display: grid; place-items: center; font-weight: 780; line-height: 1; }`);
    const rgb = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const mix = (a, pct, b) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(v * pct + B[i] * (1 - pct))).join(",")})`; };   // color-mix(a pct, b)
    const rgba = (c, a) => `rgba(${rgb(c).join(",")},${a})`;
    const count = Math.max(4, Math.min(10, Number.isFinite(+p.count) ? Math.round(+p.count) : 7)), speed = Math.max(0.5, Math.min(2, Number.isFinite(+p.speed) ? +p.speed : 1));
    const showBadges = p.showBadges === "no" ? "no" : "yes";
    const IN_BASE = 3.3, OUT_BASE = 0.5, STAGE_IN_BASE = 0.34, ARRIVAL_START_BASE = 0.16, ENTRY_DURATION_BASE = 0.38, PUSH_DURATION_BASE = 0.24, BASE_GAP = 0.78, GAP_DECAY = 0.78, FLOOR_GAP = 0.09;
    const BREATH_HALF = Math.max(0.65, 0.5 * 1.8);
    const duration = Math.max(0.001, p.duration), totalBase = IN_BASE + OUT_BASE, envelopeScale = duration < totalBase ? duration / totalBase : 1;
    const IN = IN_BASE * envelopeScale, OUT = OUT_BASE * envelopeScale, STAGE_IN = STAGE_IN_BASE * envelopeScale, ARRIVAL_START = ARRIVAL_START_BASE * envelopeScale;
    const ENTRY_DURATION = Math.max(0.18, Math.min(0.5, ENTRY_DURATION_BASE / speed)) * envelopeScale;
    const HOLD = Math.max(0, duration - (IN + OUT)), HOLD_START = IN, OUT_START = IN + HOLD, STACK_STEP = Math.min(9.6, 68 / Math.max(1, count - 1));
    const rawGaps = []; let rawGapTotal = 0;
    for (let g = 1; g < count; g++) { const gap = Math.max(FLOOR_GAP, BASE_GAP * Math.pow(GAP_DECAY, g - 1) / speed); rawGaps.push(gap); rawGapTotal += gap; }
    const availableGapWindow = Math.max(0, IN - ARRIVAL_START - ENTRY_DURATION), gapScale = rawGapTotal > availableGapWindow ? availableGapWindow / rawGapTotal : 1;
    const arrivalTimes = [ARRIVAL_START];
    for (let i = 0; i < rawGaps.length; i++) arrivalTimes.push(arrivalTimes[arrivalTimes.length - 1] + rawGaps[i] * gapScale);
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, cw = sw / 100, ch = sh / 100, cm = Math.min(sw, sh) / 100, f = n => +n.toFixed(2) + "px";
      const root = ctx.make(slot, "div", "root", { cls: "uinp", style: { background: p.bg, color: p.fg } });
      ctx.make(root, "div", "backdrop", { cls: "uinp-backdrop", style: { background: `radial-gradient(circle at 50% 12%, ${rgba(p.accent, 0.16)}, transparent 38%), linear-gradient(to bottom, ${mix(p.surface, 0.28, p.bg)}, ${p.bg})` } });
      const stage = ctx.make(root, "div", "stage", { cls: "uinp-stage" });
      const stack = ctx.make(stage, "div", "stack", { cls: "uinp-stack", style: { top: f(8 * ch), left: f(12 * cw), width: f(76 * cw), height: f(82 * ch) } });
      const tones = [p.brand, p.accent, mix(p.brand, 0.58, p.accent), mix(p.accent, 0.62, p.fg)];
      const cards = [];
      for (let i = 0; i < count; i++) {
        const it = p.items[i];
        const card = ctx.make(stack, "article", "c" + i, { cls: "uinp-card", style: { gridTemplateColumns: `${f(6.8 * ch)} minmax(0, 1fr) auto`, gap: f(1.5 * cw), height: f(11.5 * ch), padding: `${f(1.3 * ch)} ${f(1.8 * cw)}`,
          borderWidth: f(0.14 * cm), borderColor: rgba(p.border, 0.78), borderRadius: f(2.2 * cm), background: mix(p.surface, 0.92, p.bg),
          boxShadow: `0 ${f(1.1 * ch)} ${f(2.8 * ch)} ${rgba(p.bg, 0.42)}, inset 0 ${f(0.1 * cm)} 0 ${rgba(p.fg, 0.12)}`, zIndex: String(i + 1) } });
        ctx.make(card, "span", "icon", { cls: "uinp-icon", text: it.icon, style: { width: f(6.8 * ch), height: f(6.8 * ch), borderRadius: f(2.2 * cm * 0.72), background: tones[i % 4], color: p.bg,
          fontSize: f(Math.min(2.25 * cw, 4 * ch)), boxShadow: `inset 0 ${f(0.1 * cm)} 0 ${rgba(p.fg, 0.24)}` } });
        const copy = ctx.make(card, "span", "copy", { cls: "uinp-copy" });
        ctx.make(copy, "span", "title", { cls: "uinp-title", text: it.title, style: { display: "block", color: p.fg, fontSize: f(Math.min(2.15 * cw, 3.8 * ch)) } });
        ctx.make(copy, "span", "body", { cls: "uinp-body", text: it.body, style: { display: "block", marginTop: f(0.6 * ch), color: p.muted, fontSize: f(Math.min(1.55 * cw, 2.85 * ch)) } });
        if (showBadges === "yes") ctx.make(card, "span", "badge", { cls: "uinp-badge", text: it.badge, style: { minWidth: f(3.6 * ch), height: f(3.6 * ch), paddingInline: f(0.65 * cw), borderRadius: "999px", background: p.accent, color: p.bg, fontSize: f(Math.min(1.3 * cw, 2.3 * ch)) } });
        cards.push(card);
      }
      const t = p.at;
      tl.fromTo(stage, { opacity: 0, y: +(1.2 * ch).toFixed(2), scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: STAGE_IN, ease: "power2.out" }, t);
      cards.forEach((card, ci) => {
        const arrivalAt = arrivalTimes[ci], untilNext = ci < cards.length - 1 ? arrivalTimes[ci + 1] - arrivalAt : ENTRY_DURATION;
        const entryDuration = Math.max(0.05, Math.min(ENTRY_DURATION, untilNext * 0.78)), pushDuration = Math.max(0.04, Math.min(PUSH_DURATION_BASE * envelopeScale / speed, untilNext * 0.72));
        for (let ex = 0; ex < ci; ex++) tl.to(cards[ex], { y: +((ci - ex) * STACK_STEP * ch).toFixed(2), duration: pushDuration, ease: "power2.out" }, t + arrivalAt);
        tl.fromTo(card, { opacity: 0, y: -+(14 * ch).toFixed(2), scale: 0.94, rotation: -1.2 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: entryDuration, ease: "back.out(1.7)" }, t + arrivalAt);
      });
      if (HOLD >= BREATH_HALF) {
        const rep = Math.max(0, Math.floor(HOLD / BREATH_HALF) - 1);
        tl.fromTo(stage, { y: 0, scale: 1 }, { y: -+(0.42 * ch).toFixed(2), scale: 1.004, duration: BREATH_HALF, ease: "sine.inOut", yoyo: true, repeat: rep, immediateRender: false }, t + HOLD_START);
      }
      tl.to(stage, { opacity: 0, y: +(1.2 * ch).toFixed(2), scale: 0.985, duration: OUT, ease: "power2.in" }, t + OUT_START);
    }
  },
});
