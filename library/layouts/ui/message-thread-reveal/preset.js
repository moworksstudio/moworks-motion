/* ui/message-thread-reveal: a messaging app on a phone (portrait 1080 x 1920 design). A conversation plays out: incoming bubbles, typing dots, the user's replies typed into the
   composer one prefix at a time, a shared link card and a big emoji row, the thread scrolling up in hard steps; at 23.27 s a light end card (logo, stars, proof line, three
   icon features, button) fades over the phone.
   Port of HyperFrames registry block message-thread-reveal. BLOCK: the target is an empty box; the 1080 x 1920 design is built inside it and fitted (contain, centred) with one
   static scale, so every number is the source pixel value (scale 1 in a 1080 x 1920 film).
   Source timing kept: every event time, the pop-ins (0.12 s / 0.1 s power2.out, 0.0667 s linear), the typed-frame schedule (11 / 24 / 9 / 28 / 25 frames) and the y position of every
   bubble at every step are the source's literal values (all bubbles are 81 px high, so they do not depend on the text), composition length 25.7667 s (demo duration).
   Keep every message to one short line (about 36 characters at most): the bubbles do not wrap. */
AIMK.preset("ui/message-thread-reveal", {
  params: {
    contact: "Linh", unread: 12, time: "9:41", placeholder: "Tin nhắn", delivered: "Đã gửi",
    question: "bạn đang dùng gì để làm phim vậy?", teaser: "xem nè 👀",
    card_title: "Dựng phim chuyển động ngay từ trình duyệt", card_domain: "tenmien.vn", card_image: "",
    reaction: "TRỜI ƠI NHANH VẬY", reaction_emoji: "🤯🤯🤯",
    benefit: "xuất 4K luôn, khỏi phần mềm", discovery: "bạn tìm ra cái này ở đâu vậy", source: "mình mới tìm ra", workflow: "chỉ cần viết vài dòng mã là xong",
    ownership: "mã nguồn là của bạn mãi mãi", install: "mình cài liền đây", thanks: "cảm ơn nha 💚",
    end_logo: "", end_proof: "Hơn 12.000 nhà sáng tạo", end_features: ["Viết|bằng HTML", "Xuất|chuẩn từng pixel", "Sở hữu|từng dòng mã"], end_cta: "Dùng thử miễn phí",
  },
  build(tl, els, p, ctx) {
    ctx.css("ui/message-thread-reveal", `
.uimt { position: absolute; width: 1080px; height: 1920px; overflow: hidden; transform-origin: 0 0; box-sizing: border-box; }
.uimt * { box-sizing: border-box; }
.uimt-abs { position: absolute; }
.uimt-plate { position: absolute; inset: 0; background: radial-gradient(ellipse 90% 60% at 30% 20%, rgba(60, 230, 172, 0.1) 0%, rgba(60, 230, 172, 0) 60%), linear-gradient(168deg, #23262b 0%, #17191d 55%, #101114 100%); }
.uimt-body { position: absolute; left: 124px; top: 64px; width: 832px; height: 1797px; border-radius: 112px; background: #3a3d42; box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.25), 0 40px 90px rgba(0, 0, 0, 0.6); }
.uimt-screen { position: absolute; left: 140px; top: 80px; width: 800px; height: 1765px; border-radius: 100px; background: #000; overflow: hidden; }
.uimt-time { position: absolute; left: 88px; top: 57px; color: #fff; font-size: 34px; font-weight: 600; letter-spacing: 0.5px; line-height: 40px; }
.uimt-badge { position: absolute; left: 112px; top: 163px; height: 44px; padding: 0 22px; background: #262628; border-radius: 22px; color: #fff; font-size: 28px; line-height: 44px; }
.uimt-avatar { position: absolute; left: 356px; top: 122px; width: 86px; height: 86px; border-radius: 50%; background: #9ce474; color: #12300c; font-size: 44px; font-weight: 600; display: grid; place-items: center; }
.uimt-name { position: absolute; left: 400px; top: 213px; transform: translateX(-50%); height: 46px; padding: 0 20px; background: #232325; border-radius: 23px; color: #fff; font-size: 29px; line-height: 46px; white-space: nowrap; }
.uimt-name span { color: #8e8e93; font-size: 26px; margin-left: 8px; }
.uimt-view { position: absolute; left: 0; top: 265px; width: 800px; height: 1367px; overflow: hidden; }
.uimt-item { position: absolute; left: 0; top: 0; width: 100%; display: flex; visibility: hidden; }
.uimt-recv { padding-left: 44px; justify-content: flex-start; } .uimt-sent { padding-right: 45px; justify-content: flex-end; }
.uimt-pop { position: relative; display: block; flex: none; }
.uimt-recv .uimt-pop { transform-origin: left bottom; } .uimt-sent .uimt-pop { transform-origin: right bottom; }
.uimt-bubble { position: relative; display: block; max-width: 720px; padding: 0 28px; height: 81px; line-height: 81px; border-radius: 40px; font-size: 32.9px; color: #fff; white-space: nowrap; text-align: left; }
.uimt-bubble.uimt-r { background: #242428; } .uimt-bubble.uimt-s { background: #0a80f8; }
.uimt-tr::before { content: ""; position: absolute; left: -10px; bottom: 0; width: 26px; height: 26px; background: #242428; border-bottom-right-radius: 20px 18px; }
.uimt-tr::after { content: ""; position: absolute; left: -26px; bottom: -2px; width: 20px; height: 30px; background: #000; border-bottom-right-radius: 16px; }
.uimt-ts::before { content: ""; position: absolute; right: -10px; bottom: 0; width: 26px; height: 26px; background: #0a80f8; border-bottom-left-radius: 20px 18px; }
.uimt-ts::after { content: ""; position: absolute; right: -26px; bottom: -2px; width: 20px; height: 30px; background: #000; border-bottom-left-radius: 16px; }
.uimt-deliv { color: #8e8e93; font-size: 28px; line-height: 34px; margin-top: 12px; padding-right: 7px; text-align: right; white-space: nowrap; }
.uimt-emoji { font-size: 105.5px; line-height: 140px; letter-spacing: 2px; margin-left: 12px; white-space: nowrap; color: #fff; }
.uimt-dotswrap { position: relative; display: block; width: 124px; height: 67px; }
.uimt-dotsbubble { width: 124px; height: 67px; background: #242428; border-radius: 34px; display: flex; align-items: center; justify-content: center; gap: 10px; }
.uimt-dot { width: 17px; height: 17px; border-radius: 50%; background: #8e8e93; display: block; }
.uimt-dt1 { position: absolute; left: -2px; bottom: -4px; width: 18px; height: 18px; border-radius: 50%; background: #242428; }
.uimt-dt2 { position: absolute; left: -14px; bottom: -14px; width: 9px; height: 9px; border-radius: 50%; background: #242428; }
.uimt-card { display: block; width: 443px; border-radius: 36px; overflow: hidden; text-align: left; }
.uimt-cardimg { display: block; width: 443px; height: 432px; object-fit: cover; }
.uimt-cardmeta { height: 178px; background: #28282c; display: flex; align-items: center; padding: 0 18px 0 26px; }
.uimt-cardtxt { flex: 1; min-width: 0; }
.uimt-cardtitle { color: #fff; font-size: 26.8px; font-weight: 600; line-height: 34px; max-width: 318px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.uimt-carddomain { color: #8e8e93; font-size: 23.3px; line-height: 28px; margin-top: 4px; white-space: nowrap; }
.uimt-cardchev { color: #8e8e93; font-size: 48px; padding-left: 8px; }
.uimt-plus { position: absolute; left: 12px; top: 1653px; width: 86px; height: 86px; border-radius: 50%; background: #262628; color: #8e8e93; font-size: 52px; font-weight: 300; display: grid; place-items: center; }
.uimt-field { position: absolute; left: 124px; top: 1646px; width: 665px; height: 93px; border: 2px solid #202022; border-radius: 47px; }
.uimt-ph { position: absolute; left: 158px; top: 1668px; color: #8e8e93; font-size: 35px; line-height: 48px; white-space: nowrap; }
.uimt-typedwrap { position: absolute; left: 158px; top: 1668px; width: 600px; height: 48px; white-space: pre; }
.uimt-typed { position: absolute; left: 0; top: 0; visibility: hidden; color: #fff; font-size: 36px; line-height: 48px; white-space: pre; }
.uimt-caret { display: inline-block; width: 4px; height: 42px; background: #0a80f8; vertical-align: -8px; margin-left: 2px; border-radius: 2px; }
.uimt-send { position: absolute; left: 698px; top: 1660px; width: 54px; height: 54px; border-radius: 50%; background: #0a80f8; visibility: hidden; display: grid; place-items: center; }
.uimt-end { position: absolute; inset: 0; background: #f9f2e7; z-index: 5; }
.uimt-ec-logo { position: absolute; left: 308px; top: 500px; width: 464px; height: 139px; object-fit: contain; }
.uimt-ec-stars { position: absolute; left: 372px; top: 714px; width: 336px; display: flex; gap: 15px; }
.uimt-ec-proof { position: absolute; left: 0; top: 796px; width: 100%; text-align: center; color: #185450; font-size: 35.5px; font-weight: 700; line-height: 44px; }
.uimt-ec-icon { position: absolute; top: 934px; width: 140px; height: 140px; border-radius: 50%; background: #185450; display: grid; place-items: center; }
.uimt-ec-label { position: absolute; top: 1098px; width: 240px; text-align: center; color: #205048; font-size: 31px; line-height: 40px; }
.uimt-ec-cta { position: absolute; left: 200px; top: 1298px; width: 680px; height: 118px; border-radius: 59px; background: #3ce6ac; color: #0d3b2b; font-weight: 700; font-size: 46px; display: grid; place-items: center; white-space: nowrap; }`);
    /* [id, side, height] in thread order; every item is bottom-anchored at y = 1345 - height */
    const ORDER = [["m1", "recv", 81], ["dots", "recv", 67], ["m2", "sent", 127], ["m3", "sent", 610], ["m4", "recv", 81], ["m5", "recv", 140], ["m6", "sent", 127],
      ["dots2", "recv", 67], ["m7", "recv", 81], ["m8", "sent", 81], ["m9", "sent", 81], ["m10", "sent", 127], ["m11", "recv", 81], ["m12", "recv", 81]];
    const STEPS = [
      { t: 0.7662, y: { m1: 1179, dots: 1278 }, show: ["dots"] },
      { t: 2.9662, y: { m1: 1036, dots: 1135, m2: 1218 }, show: ["m2"] },
      { t: 3.6995, y: { m1: 416, dots: 515, m2: 598, m3: 735 }, show: ["m3"] },
      { t: 7.2995, y: { m1: 400, m2: 499, m3: 636, m4: 1264 }, show: ["m4"], hide: ["dots"] },
      { t: 8.0328, y: { m1: 250, m2: 349, m3: 486, m4: 1114, m5: 1205 }, show: ["m5"] },
      { t: 10.5995, y: { m1: 113, m2: 212, m3: 349, m4: 977, m5: 1068, m6: 1218 }, show: ["m6"] },
      { t: 11.3662, y: { m1: 28, m2: 127, m3: 264, m4: 892, m5: 983, m6: 1133, dots2: 1278 }, show: ["dots2"] },
      { t: 12.3662, y: { m1: 14, m2: 113, m3: 250, m4: 878, m5: 969, m6: 1119, m7: 1264 }, show: ["m7"], hide: ["dots2"] },
      { t: 14.0662, y: { m1: -85, m2: 14, m3: 151, m4: 779, m5: 870, m6: 1020, m7: 1165, m8: 1264 }, show: ["m8"] },
      { t: 17.0995, y: { m1: -176, m2: -77, m3: 60, m4: 688, m5: 779, m6: 929, m7: 1074, m8: 1173, m9: 1264 }, show: ["m9"] },
      { t: 19.8995, y: { m1: -313, m2: -214, m3: -77, m4: 551, m5: 642, m6: 792, m7: 937, m8: 1036, m9: 1127, m10: 1218 }, show: ["m10"] },
      { t: 20.6662, y: { m1: -412, m2: -313, m3: -176, m4: 452, m5: 543, m6: 693, m7: 838, m8: 937, m9: 1028, m10: 1119, m11: 1264 }, show: ["m11"] },
      { t: 21.4328, y: { m1: -503, m2: -404, m3: -267, m4: 361, m5: 452, m6: 602, m7: 747, m8: 846, m9: 937, m10: 1028, m11: 1173, m12: 1264 }, show: ["m12"] },
    ];
    /* the user's replies, typed in the composer: [text, frame on-times, end time] (the source's frame schedule per reply; the text is spread over the frames) */
    const TYPED = [
      { key: "teaser", on: [2.0328, 2.0995, 2.1662, 2.2328, 2.2995, 2.3995, 2.4328, 2.4995, 2.5662, 2.5995, 2.7995], end: 2.9662 },
      { key: "benefit", on: [8.8662, 8.9662, 8.9995, 9.0662, 9.1662, 9.2328, 9.2662, 9.3662, 9.3995, 9.4328, 9.5662, 9.5995, 9.6662, 9.7995, 9.8662, 9.8995, 9.9662, 9.9995, 10.0662, 10.1662, 10.2328, 10.2995, 10.3995, 10.4662], end: 10.5995 },
      { key: "source", on: [13.3995, 13.4328, 13.4995, 13.5995, 13.6662, 13.6995, 13.7995, 13.9662, 14.0328], end: 14.0662 },
      { key: "workflow", on: [15.1662, 15.1995, 15.2328, 15.2995, 15.3995, 15.4328, 15.4995, 15.5662, 15.6328, 15.6662, 15.6995, 15.7995, 15.8662, 15.8995, 16.0662, 16.0995, 16.2328, 16.2662, 16.2995, 16.3995, 16.4662, 16.4995, 16.5662, 16.6328, 16.6995, 16.7995, 16.8328, 16.8995], end: 17.0995 },
      { key: "ownership", on: [18.1662, 18.2328, 18.2662, 18.3662, 18.4328, 18.4995, 18.5995, 18.6662, 18.7328, 18.7995, 18.8328, 18.9995, 19.0328, 19.0995, 19.1662, 19.1995, 19.2662, 19.3662, 19.4328, 19.4995, 19.5328, 19.5995, 19.6662, 19.7662, 19.7995], end: 19.8995 },
    ];
    const SVG = {
      sb: `<svg width="86" height="30" viewBox="0 0 86 30"><rect x="0" y="16" width="5" height="9" rx="1.5" fill="#fff"/><rect x="8" y="12" width="5" height="13" rx="1.5" fill="#fff"/><rect x="16" y="8" width="5" height="17" rx="1.5" fill="#fff"/><rect x="24" y="4" width="5" height="21" rx="1.5" fill="#fff"/><g transform="translate(44,2)"><path d="M18 21.5 L21.5 25 L25 21.5 A5 5 0 0 0 18 21.5" fill="#fff" transform="translate(-10,-2)"/><path d="M4 13 A14 14 0 0 1 23 13" stroke="#fff" stroke-width="4" fill="none" transform="translate(-2,-2)"/><path d="M8.5 17.5 A8 8 0 0 1 18.5 17.5" stroke="#fff" stroke-width="4" fill="none" transform="translate(-2,-2)"/></g></svg>`,
      back: `<svg width="26" height="48" viewBox="0 0 26 48"><path d="M23 3 L4 24 L23 45" stroke="#E4E4E4" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      cam: `<svg width="52" height="34" viewBox="0 0 52 34"><rect x="0" y="1" width="36" height="32" rx="9" fill="#fff"/><path d="M38 12 L50 4 V30 L38 22 Z" fill="#fff"/></svg>`,
      mic: `<svg width="26" height="42" viewBox="0 0 26 42"><rect x="8" y="0" width="10" height="22" rx="5" fill="#8E8E93"/><path d="M2 16 A11 11 0 0 0 24 16" stroke="#8E8E93" stroke-width="3.5" fill="none" transform="translate(0,2)"/><line x1="13" y1="30" x2="13" y2="38" stroke="#8E8E93" stroke-width="3.5"/><line x1="6" y1="39" x2="20" y2="39" stroke="#8E8E93" stroke-width="3.5"/></svg>`,
      send: `<svg width="26" height="30" viewBox="0 0 26 30"><path d="M13 28 V4 M3 13 L13 3 L23 13" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      star: `<svg width="55" height="53" viewBox="0 0 24 23"><path d="M12 0 L15 8.2 L23.4 8.2 L16.6 13.4 L19.2 21.8 L12 16.8 L4.8 21.8 L7.4 13.4 L0.6 8.2 L9 8.2 Z" fill="#FED059"/></svg>`,
      pencil: `<svg width="58" height="58" viewBox="0 0 24 24"><path d="M3 17.2 V21 h3.8 L18 9.8 l-3.8-3.8 L3 17.2 Z M20.7 7.1 c0.4-0.4 0.4-1 0-1.4 l-2.4-2.4 c-0.4-0.4-1-0.4-1.4 0 l-1.8 1.8 3.8 3.8 1.8-1.8 Z" fill="#F9F2E7"/></svg>`,
      heart: `<svg width="60" height="56" viewBox="0 0 24 22"><path d="M12 21 C12 21 1 14.4 1 7.6 C1 3.9 3.9 1 7.5 1 C9.4 1 11.1 1.9 12 3.3 C12.9 1.9 14.6 1 16.5 1 C20.1 1 23 3.9 23 7.6 C23 14.4 12 21 12 21 Z" fill="#F9F2E7"/></svg>`,
      palette: `<svg width="60" height="60" viewBox="0 0 24 24"><path d="M12 2 C6.5 2 2 6.5 2 12 s4.5 10 10 10 c0.9 0 1.6-0.7 1.6-1.6 0-0.4-0.2-0.8-0.4-1.1 -0.3-0.3-0.4-0.7-0.4-1.1 0-0.9 0.7-1.6 1.6-1.6 h1.9 c3.1 0 5.7-2.6 5.7-5.7 C22 7 17.5 2 12 2 Z M6.5 12 c-0.8 0-1.5-0.7-1.5-1.5 S5.7 9 6.5 9 8 9.7 8 10.5 7.3 12 6.5 12 Z M9.5 8 C8.7 8 8 7.3 8 6.5 S8.7 5 9.5 5 s1.5 0.7 1.5 1.5 S10.3 8 9.5 8 Z M14.5 8 c-0.8 0-1.5-0.7-1.5-1.5 S13.7 5 14.5 5 16 5.7 16 6.5 15.3 8 14.5 8 Z M17.5 12 c-0.8 0-1.5-0.7-1.5-1.5 S16.7 9 17.5 9 19 9.7 19 10.5 18.3 12 17.5 12 Z" fill="#F9F2E7"/></svg>`,
    };
    const text = {
      m1: p.question, m2: p.teaser, m4: p.reaction, m5: p.reaction_emoji, m6: p.benefit, m7: p.discovery, m8: p.source, m9: p.workflow, m10: p.ownership, m11: p.install, m12: p.thanks,
    };
    const TAILS = { m2: "ts", m6: "ts", m10: "ts", m7: "tr", m12: "tr" }, DELIV = { m2: 1, m6: 1, m10: 1 };
    const prefixes = (str, n) => { const ch = Array.from(String(str)); return Array.from({ length: n }, (_, i) => ch.slice(0, Math.max(1, Math.ceil(ch.length * (i + 1) / n))).join("")); };
    const TY = { teaser: p.teaser, benefit: p.benefit, source: p.source, workflow: p.workflow, ownership: p.ownership };
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, k = Math.min(sw / 1080, sh / 1920);
      const d = ctx.make(slot, "div", "d", { cls: "uimt", style: { left: ((sw - 1080 * k) / 2).toFixed(2) + "px", top: ((sh - 1920 * k) / 2).toFixed(2) + "px", transform: k === 1 ? "" : `scale(${k.toFixed(5)})` } });
      const plate = ctx.make(d, "div", "plate", { cls: "uimt-plate" });
      ctx.make(plate, "div", "body", { cls: "uimt-body" });
      const screen = ctx.make(d, "div", "screen", { cls: "uimt-screen" });
      ctx.make(screen, "div", "time", { cls: "uimt-time", text: p.time });
      ctx.make(screen, "div", "sb", { cls: "uimt-abs", html: SVG.sb, style: { left: "578px", top: "66px" } });
      ctx.make(screen, "div", "back", { cls: "uimt-abs", html: SVG.back, style: { left: "48px", top: "158px" } });
      if (p.unread > 0) ctx.make(screen, "div", "badge", { cls: "uimt-badge", text: String(p.unread) });
      ctx.make(screen, "div", "avatar", { cls: "uimt-avatar", text: Array.from(p.contact)[0].toUpperCase() });
      ctx.make(ctx.make(screen, "div", "name", { cls: "uimt-name", text: p.contact }), "span", "chev", { text: "›" });
      ctx.make(screen, "div", "cam", { cls: "uimt-abs", html: SVG.cam, style: { left: "699px", top: "166px" } });
      const view = ctx.make(screen, "div", "view", { cls: "uimt-view" });
      const it = {}, pop = {};
      for (const [id, side, h] of ORDER) {
        const item = it[id] = ctx.make(view, "div", "it_" + id, { cls: "uimt-item uimt-" + (side === "recv" ? "recv" : "sent"), style: { height: h + "px" } });
        const pp = pop[id] = ctx.make(item, "div", "pop", { cls: "uimt-pop" });
        if (id === "dots" || id === "dots2") {
          const w = ctx.make(pp, "div", "w", { cls: "uimt-dotswrap" });
          const b = ctx.make(w, "div", "b", { cls: "uimt-dotsbubble" });
          for (let n = 1; n <= 3; n++) ctx.make(b, "span", "d" + n, { cls: "uimt-dot" });
          ctx.make(w, "div", "t1", { cls: "uimt-dt1" }); ctx.make(w, "div", "t2", { cls: "uimt-dt2" });
        } else if (id === "m3") {
          const c = ctx.make(pp, "div", "card", { cls: "uimt-card" });
          ctx.make(c, "img", "img", { cls: "uimt-cardimg", attrs: { src: p.card_image || ctx.asset("card-image.jpg"), alt: "" } });
          const meta = ctx.make(c, "div", "meta", { cls: "uimt-cardmeta" });
          const tx = ctx.make(meta, "div", "txt", { cls: "uimt-cardtxt" });
          ctx.make(tx, "div", "title", { cls: "uimt-cardtitle", text: p.card_title });
          ctx.make(tx, "div", "domain", { cls: "uimt-carddomain", text: p.card_domain });
          ctx.make(meta, "div", "chev", { cls: "uimt-cardchev", text: "›" });
        } else if (id === "m5") {
          ctx.make(pp, "div", "emoji", { cls: "uimt-emoji", text: text.m5 });
        } else {
          ctx.make(pp, "div", "bubble", { cls: "uimt-bubble " + (side === "recv" ? "uimt-r" : "uimt-s") + (TAILS[id] ? " uimt-" + TAILS[id] : ""), text: text[id] });
          if (DELIV[id]) ctx.make(pp, "div", "deliv", { cls: "uimt-deliv", text: p.delivered });
        }
      }
      ctx.make(screen, "div", "plus", { cls: "uimt-plus", text: "+" });
      ctx.make(screen, "div", "field", { cls: "uimt-field" });
      const ph = ctx.make(screen, "div", "ph", { cls: "uimt-ph", text: p.placeholder });
      const wrap = ctx.make(screen, "div", "typed", { cls: "uimt-typedwrap" });
      const typed = TYPED.map(g => prefixes(TY[g.key], g.on.length).map((s, i) => {
        const sp = ctx.make(wrap, "span", g.key + i, { cls: "uimt-typed", text: s });
        ctx.make(sp, "span", "c", { cls: "uimt-caret" });
        return sp;
      }));
      const mic = ctx.make(screen, "div", "mic", { cls: "uimt-abs", html: SVG.mic, style: { left: "724px", top: "1664px" } });
      const send = ctx.make(screen, "div", "send", { cls: "uimt-send", html: SVG.send });
      /* end card */
      const end = ctx.make(d, "div", "end", { cls: "uimt-end" });
      ctx.make(end, "img", "logo", { cls: "uimt-ec-logo", attrs: { src: p.end_logo || ctx.asset("hyperframes-logo-black.svg"), alt: "" } });
      ctx.make(end, "div", "stars", { cls: "uimt-ec-stars", html: SVG.star.repeat(5) });
      ctx.make(end, "div", "proof", { cls: "uimt-ec-proof", text: p.end_proof });
      [["pencil", 150, 100], ["heart", 470, 420], ["palette", 790, 740]].forEach(([ic, xi, xl], i) => {
        ctx.make(end, "div", "icon" + i, { cls: "uimt-ec-icon", html: SVG[ic], style: { left: xi + "px" } });
        const lines = String((p.end_features || [])[i] || "").split("|").slice(0, 2);
        const lab = ctx.make(end, "div", "label" + i, { cls: "uimt-ec-label", style: { left: xl + "px" } });
        lines.forEach((ln, j) => ctx.make(lab, "div", "l" + j, { text: ln }));
      });
      ctx.make(end, "div", "cta", { cls: "uimt-ec-cta", text: p.end_cta });

      const t = p.at;
      /* arrivals: first bubble, then the stepped y table */
      tl.set(it.m1, { y: 1264, autoAlpha: 1 }, t);
      tl.fromTo(pop.m1, { scale: 0.75, autoAlpha: 0.6 }, { scale: 1, autoAlpha: 1, duration: 0.12, ease: "power2.out" }, t);
      STEPS.forEach(s => {
        for (const id in s.y) tl.set(it[id], { y: s.y[id] }, t + s.t);
        (s.hide || []).forEach(id => tl.set(it[id], { autoAlpha: 0 }, t + s.t));
        (s.show || []).forEach(id => {
          if (id === "dots" || id === "dots2") tl.fromTo(pop[id], { scale: 0.6, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.1, ease: "power2.out" }, t + s.t);
          else if (id === "m5") tl.fromTo(pop[id], { scale: 0.5, autoAlpha: 0.3 }, { scale: 1, autoAlpha: 1, duration: 0.1, ease: "power2.out" }, t + s.t);
          else tl.fromTo(pop[id], { autoAlpha: 0.55 }, { autoAlpha: 1, duration: 0.0667, ease: "none" }, t + s.t);
          tl.set(it[id], { autoAlpha: 1 }, t + s.t);
        });
      });
      /* composer: placeholder + mic <-> send button + typed prefixes */
      TYPED.forEach((g, gi) => {
        const a = t + g.on[0], b = t + g.end;
        tl.set(ph, { autoAlpha: 0 }, a); tl.set(mic, { autoAlpha: 0 }, a); tl.set(send, { autoAlpha: 1 }, a);
        tl.set(ph, { autoAlpha: 1 }, b); tl.set(mic, { autoAlpha: 1 }, b); tl.set(send, { autoAlpha: 0 }, b);
        typed[gi].forEach((sp, i) => { tl.set(sp, { autoAlpha: 1 }, t + g.on[i]); tl.set(sp, { autoAlpha: 0 }, t + (i + 1 < g.on.length ? g.on[i + 1] : g.end)); });
      });
      tl.fromTo(end, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, t + 23.2667);
    }
  },
});
