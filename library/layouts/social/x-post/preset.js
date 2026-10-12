/* social/x-post: a dark social post card (header with avatar, name, verified tick and a platform mark; post text with a coloured hashtag; time stamp; a metrics row with
   reply, repost, like, views, bookmark and share). The card slides up from below, the like button presses and springs (elastic), the heart fills and the like count
   turns pink and goes up by one, then the card slides back out.
   Port of HyperFrames registry block x-post. BLOCK: built centred in the target box (source: a 1920 x 1080 composition). Source timing kept (relative to `at`): slide in 0.6 s
   power3.out at 0.1 s from y 400; like press 0.12 s scale 0.85 at 1.5 s, release 0.4 s elastic.out(1, 0.4) at 1.62 s, heart swap and count colour 0.12 s at 1.62 s;
   slide out 0.3 s power3.in at exitAt (4.2 s; null = no exit). The source's own artwork is the default (05/10/2026): X logo, the six action icon paths, the grey avatar
   silhouette; avatar = "initials" gives an initials disc instead. */
AIMK.preset("social/x-post", {
  params: { name: "Studio Mo", handle: "@studio_mo", verified: "yes", text: "Thay đoạn này bằng nội dung bài đăng của bạn. Đổi tên hiển thị, tài khoản, thời gian và số tương tác cho khớp.", tag: "#ChuDeCuaBan",
    time: "13:10 · 07 Thg 4, 2026", replies: "34", reposts: "2,3K", likes: "10,9K", likesAfter: "11,0K", views: "150K", avatarColor: "#536471", avatar: "silhouette", exitAt: 4.2 },
  build(tl, els, p, ctx) {
    const t = p.at, esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const ini = String(p.name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0]).join("").toUpperCase() || "?";
    const IC = {   // the source's own icon paths (24 x 24, filled)
      reply: "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z",
      repost: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
      heart: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
      heartOn: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
      views: "M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z",
      bookmark: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
      share: "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z",
      logo: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    };
    const ico = (d, fill) => `<svg viewBox="0 0 24 24" style="width:35px;height:35px;display:block" fill="${fill}"><path d="${d}"/></svg>`;
    ctx.css("social/x-post", `
.sxp-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.sxp-card { position: relative; width: 880px; box-sizing: border-box; background: #15202b; border-radius: 20px; padding: 36px 36px 28px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); border: 1px solid #38444d; overflow: hidden; }
.sxp-glow { position: absolute; left: 0; right: 0; bottom: 0; height: 80px; background: linear-gradient(to top, rgba(29,155,240,0.08), transparent); pointer-events: none; }
.sxp-head { position: relative; display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
.sxp-avatar { width: 52px; height: 52px; flex-shrink: 0; border-radius: 50%; overflow: hidden; display: grid; place-items: center; color: #e7e9ea; font-size: 20px; font-weight: 700; }
.sxp-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.sxp-namerow { display: flex; align-items: center; gap: 6px; }
.sxp-dn { font-size: 26px; font-weight: 700; color: #e7e9ea; line-height: 1.3; }
.sxp-handle { font-size: 22px; font-weight: 400; color: #8b98a5; line-height: 1.3; }
.sxp-mark { position: absolute; top: 2px; right: 0; width: 32px; height: 32px; }
.sxp-body { font-size: 30px; font-weight: 400; color: #e7e9ea; line-height: 1.45; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.sxp-tag { color: #1d9bf0; }
.sxp-time { font-size: 22px; color: #8b98a5; padding-bottom: 20px; border-bottom: 1px solid #38444d; margin-bottom: 16px; }
.sxp-bar { display: flex; align-items: center; position: relative; z-index: 1; }
.sxp-left { display: flex; align-items: center; flex: 1; justify-content: space-between; padding-right: 60px; }
.sxp-right { display: flex; align-items: center; gap: 20px; }
.sxp-metric { display: flex; align-items: center; gap: 8px; }
.sxp-icon { width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; position: relative; }
.sxp-count { font-size: 20px; font-weight: 400; color: #8b98a5; }
.sxp-cnt2 { display: grid; }
.sxp-cnt2 > span { grid-area: 1 / 1; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "xp", { cls: "sxp-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "sxp-card" });
      ctx.make(card, "div", "glow", { cls: "sxp-glow" });
      const head = ctx.make(card, "div", "head", { cls: "sxp-head" });
      if (p.avatar === "initials") ctx.make(head, "div", "avatar", { cls: "sxp-avatar", text: ini, style: { background: p.avatarColor } });
      else ctx.make(head, "div", "avatar", { cls: "sxp-avatar", html: `<svg viewBox="0 0 52 52" style="width:52px;height:52px;display:block" fill="none"><circle cx="26" cy="26" r="26" fill="${p.avatarColor}"/><circle cx="26" cy="21" r="10" fill="#8b98a5"/><ellipse cx="26" cy="42" rx="16" ry="12" fill="#8b98a5"/></svg>` });   // the source's grey silhouette
      const info = ctx.make(head, "div", "info", { cls: "sxp-info" });
      const nr = ctx.make(info, "div", "namerow", { cls: "sxp-namerow" });
      ctx.make(nr, "span", "dn", { cls: "sxp-dn", text: p.name });
      if (p.verified !== "no") ctx.make(nr, "span", "tick", { html: `<svg viewBox="0 0 22 22" style="width:22px;height:22px;display:block" fill="none"><circle cx="11" cy="11" r="11" fill="#1d9bf0"/><path d="M9.5 14.25L6.25 11l1.06-1.06 2.19 2.19 4.69-4.69L15.25 8.5 9.5 14.25z" fill="#fff"/></svg>` });
      ctx.make(info, "span", "handle", { cls: "sxp-handle", text: p.handle });
      ctx.make(head, "div", "mark", { cls: "sxp-mark", html: `<svg viewBox="0 0 24 24" style="width:32px;height:32px;display:block" fill="#e7e9ea"><path d="${IC.logo}"/></svg>` });   // the platform's own logo path from the source
      ctx.make(card, "div", "body", { cls: "sxp-body", html: esc(p.text) + (p.tag ? ` <span class="sxp-tag">${esc(p.tag)}</span>` : "") });
      ctx.make(card, "div", "time", { cls: "sxp-time", text: p.time });
      const bar = ctx.make(card, "div", "bar", { cls: "sxp-bar" });
      const left = ctx.make(bar, "div", "left", { cls: "sxp-left" });
      const metric = (parent, name, icon, count) => { const m = ctx.make(parent, "div", name, { cls: "sxp-metric" }); ctx.make(m, "div", "icon", { cls: "sxp-icon", html: ico(icon, "#8b98a5") }); if (count != null) ctx.make(m, "span", "count", { cls: "sxp-count", text: count }); return m; };
      metric(left, "reply", IC.reply, p.replies);
      metric(left, "repost", IC.repost, p.reposts);
      const like = ctx.make(left, "div", "like", { cls: "sxp-metric" });
      const lic = ctx.make(like, "div", "icon", { cls: "sxp-icon" });
      const heart = ctx.make(lic, "div", "heart", { html: ico(IC.heart, "#8b98a5"), style: { position: "absolute", left: "0px", top: "0px" } });
      const heartOn = ctx.make(lic, "div", "hon", { html: ico(IC.heartOn, "#f91880"), style: { position: "absolute", left: "0px", top: "0px", opacity: "0" } });
      const cnt = ctx.make(like, "div", "cnt", { cls: "sxp-cnt2" });
      const c1 = ctx.make(cnt, "span", "c1", { cls: "sxp-count", text: p.likes });
      const c2 = ctx.make(cnt, "span", "c2", { cls: "sxp-count", text: p.likesAfter, style: { opacity: "0" } });
      metric(left, "views", IC.views, p.views);
      const right = ctx.make(bar, "div", "right", { cls: "sxp-right" });
      metric(right, "bookmark", IC.bookmark, null);
      metric(right, "share", IC.share, null);
      tl.fromTo(card, { y: 400, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, t + 0.1);
      tl.fromTo(like, { scale: 1 }, { scale: 0.85, duration: 0.12, ease: "power2.out" }, t + 1.5);
      tl.fromTo(like, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)", immediateRender: false }, t + 1.62);
      tl.fromTo(heart, { opacity: 1 }, { opacity: 0, duration: 0.01, ease: "none" }, t + 1.62);
      tl.fromTo(heartOn, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, t + 1.62);
      tl.set(c1, { opacity: 0, ease: "none" }, t + 1.62);
      tl.set(c2, { opacity: 1, ease: "none" }, t + 1.62);
      tl.fromTo(c2, { color: "#8b98a5" }, { color: "#f91880", duration: 0.12, ease: "none" }, t + 1.62);
      if (p.exitAt != null) tl.fromTo(card, { y: 0, opacity: 1 }, { y: 400, opacity: 0, duration: 0.3, ease: "power3.in", immediateRender: false }, t + p.exitAt);
    }
  },
});
