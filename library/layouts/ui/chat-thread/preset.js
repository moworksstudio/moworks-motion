/* ui/chat-thread: a whole phone chat scene: status bar, back badge, avatar and name pill, bubbles with real tails, a Delivered receipt, big emoji rows, a media placeholder, a link card,
   typing dots that hold the beat before replies, a composer bar. Every message picks its type by prefix: "recv:" / "sent:" text, "emoji:" a big emoji row, "img" a media placeholder,
   "card:Title~domain" a link card. Messages arrive one `beat` apart, each popping in at the bottom (0.12 s power2.out) and pushing the thread up (1.0 s expo.out).
   Port of HyperFrames registry component chat-thread. BLOCK: the target is an empty box (a phone-shaped box is the natural fit); the black screen is built inside it. Sizes that were
   container units (cqw / cqh / cqmin) are relative to the target box here (CSS variables --cw / --ch / --cm = 1 % of its width / height / smaller side).
   The source measured every item's height at mount (offsetHeight). Fonts are not loaded when a preset builds, so the heights are computed from the fixed CSS metrics instead (a bubble line
   is 1.35 x font-size, a bubble is one line unless the text holds "\n", the link-card title area is two lines high, everything else has a fixed size), then rounded like offsetHeight. */
AIMK.preset("ui/chat-thread", {
  params: {
    contact: "Linh", unread: 12, time: "9:41", placeholder: "Tin nhắn", receipt_label: "Đã gửi",
    messages: ["recv:bạn đang dùng gì để làm phim vậy?", "sent:xem nè 👀", "card:Dựng phim chuyển động ngay từ trình duyệt~tenmien.vn", "recv:TRỜI ƠI NHANH VẬY", "emoji:🤯🤯🤯", "sent:xuất 4K luôn, khỏi phần mềm"],
    beat: 1.7, dots: "on", receipt: "on", duration: 12, lead: 0.4,
  },
  build(tl, els, p, ctx) {
    const w = n => `calc(${n} * var(--cw))`, h = n => `calc(${n} * var(--ch))`, m = n => `calc(${n} * var(--cm))`;
    const GRAD = "linear-gradient(165deg, #0f3a2c 0%, #0a9c6b 78%, #3ce6ac 100%)";
    ctx.css("ui/chat-thread", `
.uict { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; background: #000; isolation: isolate; box-sizing: border-box; color: #fff; }
.uict * { box-sizing: border-box; }
.uict-abs { position: absolute; }
.uict-sbtime { position: absolute; left: ${w(8)}; top: ${h(2.6)}; color: #fff; font-size: ${m(3.2)}; font-weight: 600; letter-spacing: 0.03em; line-height: 1.2; }
.uict-badge { position: absolute; left: ${w(9.5)}; top: ${h(7.6)}; height: ${m(4)}; padding: 0 ${m(2)}; background: #262628; border-radius: ${m(2)}; color: #fff; font-size: ${m(2.6)}; line-height: ${m(4)}; }
.uict-avatar { position: absolute; left: 50%; top: ${h(5.6)}; transform: translateX(-50%); width: ${m(8)}; height: ${m(8)}; border-radius: 50%; background: #9ce474; color: #12300c; font-size: ${m(4)}; font-weight: 600; display: grid; place-items: center; }
.uict-name { position: absolute; left: 50%; top: ${h(10.6)}; transform: translateX(-50%); height: ${m(4.2)}; padding: 0 ${m(1.9)}; background: #232325; border-radius: ${m(2.1)}; color: #fff; font-size: ${m(2.7)}; line-height: ${m(4.2)}; white-space: nowrap; }
.uict-name span { color: #8e8e93; font-size: ${m(2.4)}; margin-left: ${m(0.7)}; }
.uict-view { position: absolute; left: 0; top: ${h(15.5)}; width: 100%; bottom: ${h(11)}; overflow: hidden; }
.uict-item { position: absolute; top: 0; left: ${w(4)}; width: ${w(92)}; display: flex; visibility: hidden; }
.uict-item.recv { justify-content: flex-start; } .uict-item.sent { justify-content: flex-end; }
.uict-pop { position: relative; display: block; flex: none; }
.uict-item.recv .uict-pop { transform-origin: left bottom; } .uict-item.sent .uict-pop { transform-origin: right bottom; }
.uict-bubble { position: relative; display: block; max-width: ${w(72)}; padding: ${h(1.2)} ${w(3.4)}; border-radius: ${m(4.6)}; font-size: ${m(3.3)}; line-height: 1.35; color: #fff; white-space: pre; }
.uict-bubble.recv { background: #242428; } .uict-bubble.sent { background: #0a80f8; }
.uict-tr::before { content: ""; position: absolute; left: ${m(-1.1)}; bottom: 0; width: ${m(2.9)}; height: ${m(2.9)}; background: #242428; border-bottom-right-radius: ${m(2.2)} ${m(2)}; }
.uict-tr::after { content: ""; position: absolute; left: ${m(-2.9)}; bottom: ${m(-0.2)}; width: ${m(2.2)}; height: ${m(3.3)}; background: #000; border-bottom-right-radius: ${m(1.8)}; }
.uict-ts::before { content: ""; position: absolute; right: ${m(-1.1)}; bottom: 0; width: ${m(2.9)}; height: ${m(2.9)}; background: #0a80f8; border-bottom-left-radius: ${m(2.2)} ${m(2)}; }
.uict-ts::after { content: ""; position: absolute; right: ${m(-2.9)}; bottom: ${m(-0.2)}; width: ${m(2.2)}; height: ${m(3.3)}; background: #000; border-bottom-left-radius: ${m(1.8)}; }
.uict-deliv { color: #8e8e93; font-size: ${m(2.7)}; line-height: 1.3; margin-top: ${h(0.8)}; padding-right: ${w(0.7)}; text-align: right; white-space: nowrap; }
.uict-emoji { font-size: ${m(10)}; line-height: 1.3; letter-spacing: 0.02em; margin-left: ${w(1)}; white-space: nowrap; color: #fff; }
.uict-media { display: block; width: ${w(52)}; aspect-ratio: 4 / 3; border-radius: ${m(4)}; position: relative; background: ${GRAD}; }
.uict-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: ${m(10)}; height: ${m(10)}; border-radius: 50%; background: rgba(253, 253, 253, 0.94); }
.uict-play::before { content: ""; position: absolute; left: 38%; top: 30%; border-left: ${m(3.4)} solid #0d0d0d; border-top: ${m(2)} solid transparent; border-bottom: ${m(2)} solid transparent; }
.uict-card { display: block; width: ${w(55)}; border-radius: ${m(4)}; overflow: hidden; text-align: left; }
.uict-cardimg { display: block; width: 100%; aspect-ratio: 1.02; position: relative; background: ${GRAD}; }
.uict-cardmeta { background: #28282c; display: flex; align-items: center; padding: ${h(1.4)} ${w(2)} ${h(1.4)} ${w(3)}; }
.uict-cardtxt { flex: 1; min-width: 0; }
.uict-cardtitle { color: #fff; font-size: ${m(2.6)}; font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.uict-carddomain { color: #8e8e93; font-size: ${m(2.3)}; line-height: 1.3; margin-top: ${h(0.4)}; white-space: nowrap; }
.uict-cardchev { color: #8e8e93; font-size: ${m(4.6)}; padding-left: ${w(1)}; }
.uict-dotswrap { position: relative; display: block; }
.uict-dots { display: flex; align-items: center; justify-content: center; gap: ${m(1)}; width: ${m(12)}; height: ${m(6.5)}; background: #242428; border-radius: ${m(3.4)}; }
.uict-dots span { width: ${m(1.7)}; height: ${m(1.7)}; border-radius: 50%; background: #8e8e93; }
.uict-dt1 { position: absolute; left: ${m(-0.2)}; bottom: ${m(-0.4)}; width: ${m(1.8)}; height: ${m(1.8)}; border-radius: 50%; background: #242428; }
.uict-dt2 { position: absolute; left: ${m(-1.4)}; bottom: ${m(-1.4)}; width: ${m(0.9)}; height: ${m(0.9)}; border-radius: 50%; background: #242428; }
.uict-plus { position: absolute; left: ${w(3)}; bottom: ${h(2.6)}; width: ${m(8)}; height: ${m(8)}; border-radius: 50%; background: #262628; color: #8e8e93; font-size: ${m(4.6)}; font-weight: 300; display: grid; place-items: center; }
.uict-composer { position: absolute; left: ${w(13)}; bottom: ${h(2.8)}; width: ${w(83)}; height: ${m(7.6)}; border: ${m(0.35)} solid #202022; border-radius: ${m(100)}; }
.uict-ph { position: absolute; left: ${w(17)}; bottom: ${h(4.4)}; color: #8e8e93; font-size: ${m(3.1)}; line-height: 1.2; white-space: nowrap; }`);
    const SB = `<svg viewBox="0 0 86 30"><rect x="0" y="16" width="5" height="9" rx="1.5" fill="#fff"/><rect x="8" y="12" width="5" height="13" rx="1.5" fill="#fff"/><rect x="16" y="8" width="5" height="17" rx="1.5" fill="#fff"/><rect x="24" y="4" width="5" height="21" rx="1.5" fill="#fff"/><g transform="translate(44,2)"><path d="M18 21.5 L21.5 25 L25 21.5 A5 5 0 0 0 18 21.5" fill="#fff" transform="translate(-10,-2)"/><path d="M4 13 A14 14 0 0 1 23 13" stroke="#fff" stroke-width="4" fill="none" transform="translate(-2,-2)"/><path d="M8.5 17.5 A8 8 0 0 1 18.5 17.5" stroke="#fff" stroke-width="4" fill="none" transform="translate(-2,-2)"/></g></svg>`;
    const BACK = `<svg viewBox="0 0 26 48" width="100%" height="100%"><path d="M23 3 L4 24 L23 45" stroke="#e4e4e4" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const CAM = `<svg viewBox="0 0 52 34" width="100%"><rect x="0" y="1" width="36" height="32" rx="9" fill="#fff"/><path d="M38 12 L50 4 V30 L38 22 Z" fill="#fff"/></svg>`;
    const MIC = `<svg viewBox="0 0 26 42" width="100%"><rect x="8" y="0" width="10" height="22" rx="5" fill="#8e8e93"/><path d="M2 16 A11 11 0 0 0 24 16" stroke="#8e8e93" stroke-width="3.5" fill="none" transform="translate(0,2)"/><line x1="13" y1="30" x2="13" y2="38" stroke="#8e8e93" stroke-width="3.5"/><line x1="6" y1="39" x2="20" y2="39" stroke="#8e8e93" stroke-width="3.5"/></svg>`;
    const entries = (p.messages || []).map(s => String(s).trim()).filter(Boolean).slice(0, 12);
    if (!entries.length) entries.push("recv:hey");
    const beat = Math.min(3, Math.max(0.8, +p.beat || 1.7)), dotsOn = p.dots !== "off", receiptOn = p.receipt !== "off", D = p.duration;
    const parsed = entries.map((entry, idx) => {
      let kind = "recv", body = entry;
      if (entry.indexOf("recv:") === 0) body = entry.slice(5);
      else if (entry.indexOf("sent:") === 0) { kind = "sent"; body = entry.slice(5); }
      else if (entry.indexOf("emoji:") === 0) { kind = "emoji"; body = entry.slice(6); }
      else if (entry.indexOf("card:") === 0) { kind = "card"; body = entry.slice(5); }
      else if (entry === "img") { kind = "img"; body = ""; }
      return { kind, body, side: kind === "sent" || kind === "card" || kind === "img" ? "sent" : "recv" };
    });
    let lastSent = -1; parsed.forEach((e, i) => { if (e.kind === "sent" || e.kind === "card") lastSent = i; });
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, cw = sw / 100, ch = sh / 100, cm = Math.min(sw, sh) / 100;
      const root = ctx.make(slot, "div", "root", { cls: "uict", style: { "--cw": cw + "px", "--ch": ch + "px", "--cm": cm + "px" } });
      ctx.make(root, "div", "sbtime", { cls: "uict-sbtime", text: p.time });
      ctx.make(root, "div", "sbicons", { cls: "uict-abs", html: SB, style: { right: 7 * cw + "px", top: 3 * ch + "px", width: 11 * cw + "px" } });
      ctx.make(root, "div", "back", { cls: "uict-abs", html: BACK, style: { left: 4.4 * cw + "px", top: 7.4 * ch + "px", width: 2.6 * cw + "px", height: 4.4 * cw + "px" } });
      if (p.unread > 0) ctx.make(root, "div", "badge", { cls: "uict-badge", text: String(p.unread) });
      ctx.make(root, "div", "avatar", { cls: "uict-avatar", text: Array.from(p.contact)[0].toUpperCase() });
      ctx.make(ctx.make(root, "div", "name", { cls: "uict-name", text: p.contact }), "span", "chev", { text: "›" });
      ctx.make(root, "div", "cam", { cls: "uict-abs", html: CAM, style: { right: 5 * cw + "px", top: 7.8 * ch + "px", width: 4.8 * cw + "px" } });
      const view = ctx.make(root, "div", "view", { cls: "uict-view" });
      const viewH = Math.round(sh * (1 - 0.155 - 0.11));
      const items = parsed.map((e, i) => {
        const item = ctx.make(view, "div", "i" + i, { cls: "uict-item " + e.side });
        const pop = ctx.make(item, "div", "pop", { cls: "uict-pop" });
        let hpx = 0;
        if (e.kind === "img") { ctx.make(ctx.make(pop, "span", "media", { cls: "uict-media" }), "span", "play", { cls: "uict-play" }); hpx = 52 * cw * 0.75; }
        else if (e.kind === "emoji") { ctx.make(pop, "div", "emoji", { cls: "uict-emoji", text: e.body.trim() }); hpx = 10 * 1.3 * cm; }
        else if (e.kind === "card") {
          const parts = e.body.split("~"), card = ctx.make(pop, "span", "card", { cls: "uict-card" });
          ctx.make(ctx.make(card, "span", "img", { cls: "uict-cardimg" }), "span", "play", { cls: "uict-play" });
          const metaH = 2 * 1.4 * ch + 2 * 1.3 * 2.6 * cm + 0.4 * ch + 1.3 * 2.3 * cm;
          const meta = ctx.make(card, "span", "meta", { cls: "uict-cardmeta", style: { height: metaH + "px" } });
          const txt = ctx.make(meta, "span", "txt", { cls: "uict-cardtxt" });
          ctx.make(txt, "span", "title", { cls: "uict-cardtitle", text: (parts[0] || "Liên kết").trim(), style: { display: "-webkit-box", height: 2 * 1.3 * 2.6 * cm + "px" } });
          ctx.make(txt, "span", "domain", { cls: "uict-carddomain", text: (parts[1] || "").trim(), style: { display: "block" } });
          ctx.make(meta, "span", "chev", { cls: "uict-cardchev", text: "›" });
          hpx = 55 * cw / 1.02 + metaH;
        } else {
          const body = e.body.trim();
          ctx.make(pop, "div", "bubble", { cls: `uict-bubble ${e.side} uict-t${e.side === "recv" ? "r" : "s"}`, text: body });
          hpx = 2 * 1.2 * ch + 1.35 * 3.3 * cm * body.split("\n").length;
        }
        if (receiptOn && i === lastSent) { ctx.make(pop, "div", "deliv", { cls: "uict-deliv", text: p.receipt_label }); hpx += 0.8 * ch + 2.7 * 1.3 * cm; }
        const H = Math.round(hpx);
        item.style.height = H + "px";
        return { el: item, pop, H, kind: e.kind, side: e.side };
      });
      let dotsItem = null, dotsH = 0;
      if (dotsOn) {
        dotsItem = ctx.make(view, "div", "dots", { cls: "uict-item recv" });
        const pp = ctx.make(dotsItem, "div", "pop", { cls: "uict-pop" }), wr = ctx.make(pp, "span", "w", { cls: "uict-dotswrap" }), dd = ctx.make(wr, "span", "d", { cls: "uict-dots" });
        for (let n = 1; n <= 3; n++) ctx.make(dd, "span", "x" + n, {});
        ctx.make(wr, "span", "t1", { cls: "uict-dt1" }); ctx.make(wr, "span", "t2", { cls: "uict-dt2" });
        dotsH = Math.round(6.5 * cm); dotsItem.style.height = dotsH + "px";
      }
      ctx.make(root, "div", "plus", { cls: "uict-plus", text: "+" });
      ctx.make(root, "div", "composer", { cls: "uict-composer" });
      ctx.make(root, "div", "ph", { cls: "uict-ph", text: p.placeholder });
      ctx.make(root, "div", "mic", { cls: "uict-abs", html: MIC, style: { right: 6 * cw + "px", bottom: 4.2 * ch + "px", width: 2.4 * cw + "px" } });

      /* the source's choreography (measured heights replaced by the computed ones) */
      const t = p.at, gap = viewH * 0.018, L = p.lead;
      let starts = [], s0 = L;
      items.forEach((it, i) => { if (i > 0) s0 += beat; starts.push(s0); });
      const last = starts[starts.length - 1];
      if (last > D - 1.2) { const k = (D - 1.6) / last; starts = starts.map(s => L + (s - L) * k); }
      items.forEach((item, k2) => {
        const at = t + starts[k2];
        let bottom = viewH; const yK = [];
        for (let j = k2; j >= 0; j--) { bottom -= items[j].H; yK[j] = bottom; bottom -= gap; }
        for (let i = 0; i <= k2; i++) {
          if (i === k2) {
            tl.set(item.el, { y: +yK[i].toFixed(2) }, at);
            tl.set(item.el, { autoAlpha: 1 }, at);
            tl.fromTo(item.pop, { scale: 0.75, autoAlpha: 0.6 }, { scale: 1, autoAlpha: 1, duration: 0.12, ease: "power2.out" }, at);
          } else tl.to(items[i].el, { y: +yK[i].toFixed(2), duration: 1.0, ease: "expo.out" }, at);
        }
        if (dotsItem && item.side === "recv" && item.kind !== "emoji" && k2 > 0) {
          const dAt = t + Math.max(starts[k2 - 1] + 0.35, starts[k2] - beat * 0.55);
          tl.set(dotsItem, { y: viewH - dotsH }, dAt);
          tl.set(dotsItem, { autoAlpha: 1 }, dAt);
          tl.set(dotsItem, { autoAlpha: 0 }, at);
        }
      });
    }
  },
});
