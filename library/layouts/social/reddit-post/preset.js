/* social/reddit-post: a dark forum post card (community icon, community and author line, title, body, vote pill, comment pill, share pill). The card slides up from below, the
   upvote button presses and springs (elastic), the arrow and the vote count turn orange and the count goes up by one, then the card slides back out.
   Port of HyperFrames registry block reddit-post. BLOCK: built centred in the target box (source: a 1920 x 1080 composition). Source timing kept (relative to `at`): slide in 0.6 s
   power3.out at 0.1 s from y 400; upvote press 0.12 s scale 0.85 at 1.5 s, release 0.4 s elastic.out(1, 0.4) at 1.62 s; arrow and count colour 0.12 s at 1.62 s;
   slide out 0.3 s power3.in at exitAt (4.2 s; null = no exit). The source's own artwork is the default (05/10/2026): the community icon is the source's 48 x 48 SVG (disc #4A90D9 with the bold
   "r/" text, the text and the disc colour are the params icon and iconColor); the action icons are the source's own glyphs. */
AIMK.preset("social/reddit-post", {
  params: { community: "r/thietkechuyendong", author: "u/nguoi_dung · 3 giờ", icon: "r/", title: "Đổi tiêu đề này thành bất cứ điều gì bạn muốn",
    text: "Đổi nội dung này, tên cộng đồng, tên người dùng và số lượt bình chọn cho khớp với nội dung của bạn.", votes: "4,2k", votesAfter: "4,3k", comments: "328", share: "Chia sẻ",
    accent: "#ff4500", iconColor: "#4a90d9", exitAt: 4.2 },
  build(tl, els, p, ctx) {
    const t = p.at;
    const stroke = { fill: "none", stroke: "#818384", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" };
    const svg = (size, inner, a) => `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;display:block" ${Object.entries(a || {}).map(([k, v]) => `${k}="${v}"`).join(" ")}>${inner}</svg>`;
    ctx.css("social/reddit-post", `
.srp-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.srp-card { width: 860px; box-sizing: border-box; background: #1a1a2e; border-radius: 16px; padding: 32px; box-shadow: 0 12px 60px rgba(0,0,0,0.6); }
.srp-head { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.srp-icon { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; overflow: hidden; }
.srp-meta { display: flex; flex-direction: column; gap: 2px; }
.srp-sub { font-size: 28px; font-weight: 700; color: #d7dadc; line-height: 1.3; }
.srp-author { font-size: 24px; font-weight: 400; color: #818384; line-height: 1.3; }
.srp-title { font-size: 38px; font-weight: 700; color: #d7dadc; line-height: 1.35; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.srp-body { font-size: 28px; font-weight: 400; color: #818384; line-height: 1.45; margin-bottom: 28px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.srp-actions { display: flex; align-items: center; gap: 28px; padding-top: 20px; border-top: 1px solid #343536; }
.srp-votes { display: flex; align-items: center; gap: 10px; background: #272729; border-radius: 24px; padding: 8px 16px; }
.srp-vbtn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.srp-vcount { font-size: 26px; font-weight: 700; color: #d7dadc; min-width: 50px; text-align: center; display: grid; }
.srp-vcount > span { grid-area: 1 / 1; }
.srp-abtn { display: flex; align-items: center; gap: 8px; background: #272729; border-radius: 24px; padding: 10px 20px; }
.srp-abtn span { font-size: 24px; font-weight: 400; color: #818384; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "rp", { cls: "srp-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "srp-card" });
      const head = ctx.make(card, "div", "head", { cls: "srp-head" });
      ctx.make(head, "div", "icon", { cls: "srp-icon", html: `<svg viewBox="0 0 48 48" style="width:48px;height:48px;display:block" fill="none"><circle cx="24" cy="24" r="24" fill="${p.iconColor}"/><text x="24" y="30" text-anchor="middle" style="font-family:inherit" font-size="22" font-weight="700" fill="#fff">${String(p.icon).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>` });   // the source's community icon SVG
      const meta = ctx.make(head, "div", "meta", { cls: "srp-meta" });
      ctx.make(meta, "span", "sub", { cls: "srp-sub", text: p.community });
      ctx.make(meta, "span", "author", { cls: "srp-author", text: p.author });
      ctx.make(card, "div", "title", { cls: "srp-title", text: p.title });
      ctx.make(card, "div", "body", { cls: "srp-body", text: p.text });
      const act = ctx.make(card, "div", "actions", { cls: "srp-actions" });
      const votes = ctx.make(act, "div", "votes", { cls: "srp-votes" });
      const up = ctx.make(votes, "div", "up", { cls: "srp-vbtn" });
      up.innerHTML = svg(28, `<path id="${up.id}_arrow" d="M12 4L3 14h5v6h8v-6h5L12 4z" fill="#818384"/>`, { fill: "none" });
      const arrow = document.getElementById(up.id + "_arrow");
      const vc = ctx.make(votes, "span", "vc", { cls: "srp-vcount" });
      const v1 = ctx.make(vc, "span", "v1", { text: p.votes });
      const v2 = ctx.make(vc, "span", "v2", { text: p.votesAfter, style: { opacity: "0" } });
      const down = ctx.make(votes, "div", "down", { cls: "srp-vbtn" });
      down.innerHTML = svg(28, `<path d="M12 20l9-10h-5V4H8v6H3l9 10z" fill="#818384"/>`, { fill: "none" });
      const cm = ctx.make(act, "div", "cm", { cls: "srp-abtn" });
      cm.innerHTML = svg(26, `<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>`, stroke) + `<span>${String(p.comments).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`;
      const sh = ctx.make(act, "div", "sh", { cls: "srp-abtn" });
      sh.innerHTML = svg(26, `<path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>`, stroke) + `<span>${String(p.share).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`;
      tl.fromTo(card, { y: 400, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, t + 0.1);
      tl.fromTo(up, { scale: 1 }, { scale: 0.85, duration: 0.12, ease: "power2.out" }, t + 1.5);
      tl.fromTo(up, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)", immediateRender: false }, t + 1.62);
      arrow.id = up.id + "_arrow";
      tl.fromTo(arrow, { fill: "#818384" }, { fill: p.accent, duration: 0.12, ease: "none" }, t + 1.62);
      tl.set(v1, { opacity: 0, ease: "none" }, t + 1.62);
      tl.set(v2, { opacity: 1, ease: "none" }, t + 1.62);
      tl.fromTo(v2, { color: "#d7dadc" }, { color: p.accent, duration: 0.12, ease: "none" }, t + 1.62);
      if (p.exitAt != null) tl.fromTo(card, { y: 0, opacity: 1 }, { y: 400, opacity: 0, duration: 0.3, ease: "power3.in", immediateRender: false }, t + p.exitAt);
    }
  },
});
