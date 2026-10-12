/* ui/chat-message: ONE chat message arrives on the measured entry (scale 0.75, alpha 0.6 -> 1, 0.12 s power2.out), growing from the corner nearest its sender.
   The type is a param: a received or sent bubble with a real tail, a big emoji row, a media placeholder, or a link card with a title and a domain; a "Delivered" receipt can sit
   under a sent message. Port of HyperFrames registry component chat-message. BLOCK: the target is an empty box (a phone-shaped box is the natural fit); the black chat
   ground and the message are built inside it. The source sizes are container-query units of that box (cqw / cqh / cqmin): they stay relative to the target box here
   (CSS variables --cw / --ch / --cm = 1 % of its width / height / smaller side, set from the box size), so the layout scales with the box exactly as in the source.
   Arrival at `at` (the source composition had a 0.4 s lead-in before it). */
AIMK.preset("ui/chat-message", {
  params: { type: "sent", text: "xem nè 👀", card_title: "Dựng phim chuyển động ngay từ trình duyệt", card_domain: "tenmien.vn", tail: "on", delivered: "on", delivered_label: "Đã gửi" },
  build(tl, els, p, ctx) {
    const w = n => `calc(${n} * var(--cw))`, h = n => `calc(${n} * var(--ch))`, m = n => `calc(${n} * var(--cm))`;
    ctx.css("ui/chat-message", `
.uicm { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; background: #000; isolation: isolate; box-sizing: border-box; color: #fff; }
.uicm * { box-sizing: border-box; }
.uicm-slot { position: absolute; left: ${w(6)}; right: ${w(6)}; bottom: ${h(10)}; }
.uicm-slot.sent { text-align: right; }
.uicm-pop { display: inline-block; transform-origin: left bottom; text-align: left; }
.uicm-slot.sent .uicm-pop { transform-origin: right bottom; }
.uicm-bubble { display: inline-block; position: relative; max-width: ${w(78)}; padding: ${h(2)} ${w(5)}; border-radius: ${m(6.4)}; font-size: ${m(4.6)}; line-height: 1.35; color: #fff; }
.uicm-bubble.recv { background: #242428; } .uicm-bubble.sent { background: #0a80f8; }
.uicm-tr::before { content: ""; position: absolute; left: ${m(-1.5)}; bottom: 0; width: ${m(4)}; height: ${m(4)}; background: #242428; border-bottom-right-radius: ${m(3)} ${m(2.8)}; }
.uicm-tr::after { content: ""; position: absolute; left: ${m(-4)}; bottom: ${m(-0.3)}; width: ${m(3)}; height: ${m(4.6)}; background: #000; border-bottom-right-radius: ${m(2.4)}; }
.uicm-ts::before { content: ""; position: absolute; right: ${m(-1.5)}; bottom: 0; width: ${m(4)}; height: ${m(4)}; background: #0a80f8; border-bottom-left-radius: ${m(3)} ${m(2.8)}; }
.uicm-ts::after { content: ""; position: absolute; right: ${m(-4)}; bottom: ${m(-0.3)}; width: ${m(3)}; height: ${m(4.6)}; background: #000; border-bottom-left-radius: ${m(2.4)}; }
.uicm-deliv { color: #8e8e93; font-size: ${m(3.4)}; margin-top: ${h(1.2)}; padding-right: ${w(1)}; text-align: right; }
.uicm-emoji { font-size: ${m(15)}; line-height: 1.25; letter-spacing: 0.02em; color: #fff; white-space: nowrap; }
.uicm-media { display: inline-block; width: ${w(66)}; aspect-ratio: 4 / 3; border-radius: ${m(5)}; position: relative; background: linear-gradient(165deg, #0f3a2c 0%, #0a9c6b 78%, #3ce6ac 100%); }
.uicm-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: ${m(13)}; height: ${m(13)}; border-radius: 50%; background: rgba(253, 253, 253, 0.94); }
.uicm-play::before { content: ""; position: absolute; left: 38%; top: 30%; border-left: ${m(4.4)} solid #0d0d0d; border-top: ${m(2.6)} solid transparent; border-bottom: ${m(2.6)} solid transparent; }
.uicm-card { display: inline-block; width: ${w(70)}; border-radius: ${m(5)}; overflow: hidden; text-align: left; }
.uicm-cardimg { display: block; width: 100%; aspect-ratio: 1.02; position: relative; background: linear-gradient(165deg, #0f3a2c 0%, #0a9c6b 78%, #3ce6ac 100%); }
.uicm-cardmeta { background: #28282c; display: flex; align-items: center; padding: ${h(1.8)} ${w(3)} ${h(1.8)} ${w(4)}; }
.uicm-cardtxt { flex: 1; min-width: 0; }
.uicm-cardtitle { display: block; color: #fff; font-size: ${m(3.5)}; font-weight: 600; line-height: 1.3; }
.uicm-carddomain { display: block; color: #8e8e93; font-size: ${m(3)}; margin-top: ${h(0.6)}; }
.uicm-cardchev { color: #8e8e93; font-size: ${m(6)}; padding-left: ${w(1.4)}; }`);
    const type = ["recv", "sent", "emoji", "img", "card"].includes(p.type) ? p.type : "sent";
    const side = type === "sent" || type === "img" || type === "card" ? "sent" : "recv";
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H;
      const root = ctx.make(slot, "div", "root", { cls: "uicm", style: { "--cw": sw / 100 + "px", "--ch": sh / 100 + "px", "--cm": Math.min(sw, sh) / 100 + "px" } });
      const box = ctx.make(root, "div", "msg", { cls: "uicm-slot " + side });
      const pop = ctx.make(box, "div", "pop", { cls: "uicm-pop" });
      if (type === "recv" || type === "sent") ctx.make(pop, "div", "bubble", { cls: `uicm-bubble ${type}` + (p.tail !== "off" ? ` uicm-t${type === "recv" ? "r" : "s"}` : ""), text: p.text });
      else if (type === "emoji") ctx.make(pop, "div", "emoji", { cls: "uicm-emoji", text: p.text });
      else if (type === "img") ctx.make(ctx.make(pop, "span", "media", { cls: "uicm-media" }), "span", "play", { cls: "uicm-play" });
      else {
        const card = ctx.make(pop, "span", "card", { cls: "uicm-card" });
        ctx.make(ctx.make(card, "span", "img", { cls: "uicm-cardimg" }), "span", "play", { cls: "uicm-play" });
        const meta = ctx.make(card, "span", "meta", { cls: "uicm-cardmeta" });
        const txt = ctx.make(meta, "span", "txt", { cls: "uicm-cardtxt" });
        ctx.make(txt, "span", "title", { cls: "uicm-cardtitle", text: p.card_title });
        ctx.make(txt, "span", "domain", { cls: "uicm-carddomain", text: p.card_domain });
        ctx.make(meta, "span", "chev", { cls: "uicm-cardchev", text: "›" });
      }
      if (p.delivered !== "off" && side === "sent" && type !== "recv") ctx.make(pop, "div", "deliv", { cls: "uicm-deliv", text: p.delivered_label });
      const t = p.at;
      tl.set(box, { autoAlpha: 0 }, 0);
      tl.set(box, { autoAlpha: 1 }, t);
      tl.fromTo(pop, { scale: 0.75, autoAlpha: 0.6 }, { scale: 1, autoAlpha: 1, duration: 0.12, ease: "power2.out" }, t);
    }
  },
});
