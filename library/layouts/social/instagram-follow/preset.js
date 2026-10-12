/* social/instagram-follow: a dark rounded "follow" lower third: avatar, name with a verified tick, handle, follower count and a Follow button. The pill slides up from below, the button
   presses and springs, turns dark grey and swaps "Follow" for "Following" with a chevron, then the pill slides back out.
   Port of HyperFrames registry block instagram-follow. BLOCK: built in the target box, centred horizontally and `bottom` px above its lower edge (source: a 1080 x 1920 composition,
   bottom 160 px). Source timing kept (relative to `at`): slide in 0.5 s power3.out at 0.1 s from y 300; button press 0.15 s scale 0.92 at 1.0 s, release 0.4 s elastic.out(1, 0.4) at
   1.15 s, background to grey 0.12 s at 1.15 s, text swap (Follow out 0.08 s at 1.15 s, Following in 0.08 s at 1.18 s); slide out 0.25 s power3.in at exitAt (3.8 s; null = no exit).
   No platform artwork: the avatar is an initials disc (or your picture), the tick is a plain circle with a check. */
AIMK.preset("social/instagram-follow", {
  params: { name: "Tên Tài Khoản", handle: "@ten_tai_khoan", followers: "47,5K người theo dõi", verified: "yes", follow: "Theo dõi", following: "Đang theo dõi", avatar: "", avatarColor: "#6c5ce7",
    accent: "#0095f6", doneColor: "#2f2f2f", bottom: 160, exitAt: 3.8 },
  build(tl, els, p, ctx) {
    const t = p.at, ini = String(p.name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0]).join("").toUpperCase() || "?";
    ctx.css("social/instagram-follow", `
.sig-box { position: absolute; overflow: hidden; }
.sig-pill { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; display: flex; align-items: center; gap: 30px; background: #1a1a1a; border-radius: 75px; padding: 25px 40px 25px 25px; box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
.sig-avatar { width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0; border: 3px solid #333; overflow: hidden; display: grid; place-items: center; color: #ffffff; font-size: 44px; font-weight: 700; }
.sig-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sig-info { display: flex; flex-direction: column; gap: 2px; margin-right: 20px; }
.sig-namerow { display: flex; align-items: center; gap: 10px; }
.sig-dn { font-size: 42px; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: -0.01em; }
.sig-tick { width: 34px; height: 34px; flex-shrink: 0; }
.sig-handle { font-size: 28px; font-weight: 400; color: #a0a0a0; line-height: 1.3; }
.sig-count { font-size: 25px; font-weight: 400; color: #737373; line-height: 1.3; }
.sig-btn { position: relative; width: 250px; height: 80px; border-radius: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.sig-bt { position: absolute; font-size: 30px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; white-space: nowrap; }
.sig-bt2 { opacity: 0; display: flex; align-items: center; gap: 8px; }
.sig-chev { display: inline-block; width: 18px; height: 18px; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "ig", { cls: "sig-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "sig-pill", style: { bottom: Number(p.bottom) + "px" } });
      const av = ctx.make(card, "div", "avatar", { cls: "sig-avatar", style: { background: p.avatarColor } });
      const avSrc = p.avatar === "initials" ? "" : (p.avatar || ctx.asset("avatar.jpg"));   // the source's avatar by default; "initials" = a lettered disc
      if (avSrc) ctx.make(av, "img", "img", { attrs: { src: avSrc, alt: "" } }); else av.textContent = ini;
      const info = ctx.make(card, "div", "info", { cls: "sig-info" });
      const nr = ctx.make(info, "div", "namerow", { cls: "sig-namerow" });
      ctx.make(nr, "div", "dn", { cls: "sig-dn", text: p.name });
      if (p.verified !== "no") ctx.make(nr, "span", "tick", { cls: "sig-tick", html: `<svg viewBox="0 0 40 40" style="width:34px;height:34px;display:block" fill="none"><circle cx="20" cy="20" r="20" fill="${p.accent}"/><path d="M17.5 27.5L10 20l2.5-2.5 5 5 10-10L30 15 17.5 27.5z" fill="#fff"/></svg>` });
      ctx.make(info, "div", "handle", { cls: "sig-handle", text: p.handle });
      ctx.make(info, "div", "count", { cls: "sig-count", text: p.followers });
      const btn = ctx.make(card, "div", "btn", { cls: "sig-btn", style: { background: p.accent } });
      const f1 = ctx.make(btn, "span", "follow", { cls: "sig-bt", text: p.follow });
      const f2 = ctx.make(btn, "span", "following", { cls: "sig-bt sig-bt2" });
      ctx.make(f2, "span", "tx", { text: p.following });
      ctx.make(f2, "span", "chev", { cls: "sig-chev", html: `<svg viewBox="0 0 24 24" style="width:18px;height:18px;display:block" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>` });
      tl.fromTo(card, { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.1);
      tl.fromTo(btn, { scale: 1 }, { scale: 0.92, duration: 0.15, ease: "power2.out" }, t + 1.0);
      tl.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)", immediateRender: false }, t + 1.15);
      tl.fromTo(btn, { backgroundColor: p.accent }, { backgroundColor: p.doneColor, duration: 0.12, ease: "none" }, t + 1.15);
      tl.fromTo(f1, { opacity: 1 }, { opacity: 0, duration: 0.08, ease: "none" }, t + 1.15);
      tl.fromTo(f2, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, t + 1.18);
      if (p.exitAt != null) tl.fromTo(card, { y: 0, opacity: 1 }, { y: 300, opacity: 0, duration: 0.25, ease: "power3.in", immediateRender: false }, t + p.exitAt);
    }
  },
});
