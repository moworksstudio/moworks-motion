/* social/tiktok-follow: a dark rounded "follow" lower third: avatar, name, handle, follower count and a Follow button. The pill slides up from below, the button presses and springs,
   turns dark grey and swaps "Follow" for "Following" with a check mark, then the pill slides back out.
   Port of HyperFrames registry block tiktok-follow. BLOCK: built in the target box, centred horizontally and `bottom` px above its lower edge (source: a 1080 x 1920 composition,
   bottom 160 px). Source timing kept (relative to `at`): slide in 0.5 s power3.out at 0.1 s from y 300; button press 0.15 s scale 0.92 at 1.0 s, release 0.4 s elastic.out(1, 0.4) at
   1.15 s, background to grey 0.12 s at 1.15 s, text swap (Follow out 0.08 s at 1.15 s, Following in 0.08 s at 1.18 s); slide out 0.25 s power3.in at exitAt (3.8 s; null = no exit).
   No platform artwork: the avatar is an initials disc (or your picture). */
AIMK.preset("social/tiktok-follow", {
  params: { name: "Tên Tài Khoản", handle: "@ten.tai.khoan", followers: "1.999 người theo dõi", follow: "Theo dõi", following: "Đang theo dõi", avatar: "", avatarColor: "#e17055",
    accent: "#fe2c55", doneColor: "#2f2f2f", bottom: 160, exitAt: 3.8 },
  build(tl, els, p, ctx) {
    const t = p.at, ini = String(p.name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0]).join("").toUpperCase() || "?";
    ctx.css("social/tiktok-follow", `
.stk-box { position: absolute; overflow: hidden; }
.stk-pill { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; display: flex; align-items: center; gap: 30px; background: #1a1a1a; border-radius: 75px; padding: 25px 40px 25px 25px; box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
.stk-avatar { width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0; border: 3px solid #333; overflow: hidden; display: grid; place-items: center; color: #ffffff; font-size: 44px; font-weight: 700; }
.stk-avatar img { width: 100%; height: 100%; object-fit: cover; }
.stk-info { display: flex; flex-direction: column; gap: 2px; margin-right: 20px; }
.stk-dn { font-size: 42px; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: -0.01em; }
.stk-handle { font-size: 28px; font-weight: 400; color: #a0a0a0; line-height: 1.3; }
.stk-count { font-size: 25px; font-weight: 400; color: #737373; line-height: 1.3; }
.stk-btn { position: relative; width: 250px; height: 80px; border-radius: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.stk-bt { position: absolute; font-size: 30px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; white-space: nowrap; }
.stk-bt2 { opacity: 0; display: flex; align-items: center; gap: 8px; }
.stk-check { display: inline-block; width: 22px; height: 22px; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "tk", { cls: "stk-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "stk-pill", style: { bottom: Number(p.bottom) + "px" } });
      const av = ctx.make(card, "div", "avatar", { cls: "stk-avatar", style: { background: p.avatarColor } });
      const avSrc = p.avatar === "initials" ? "" : (p.avatar || ctx.asset("avatar.jpg"));   // the source's avatar by default; "initials" = a lettered disc
      if (avSrc) ctx.make(av, "img", "img", { attrs: { src: avSrc, alt: "" } }); else av.textContent = ini;
      const info = ctx.make(card, "div", "info", { cls: "stk-info" });
      ctx.make(info, "div", "dn", { cls: "stk-dn", text: p.name });
      ctx.make(info, "div", "handle", { cls: "stk-handle", text: p.handle });
      ctx.make(info, "div", "count", { cls: "stk-count", text: p.followers });
      const btn = ctx.make(card, "div", "btn", { cls: "stk-btn", style: { background: p.accent } });
      const f1 = ctx.make(btn, "span", "follow", { cls: "stk-bt", text: p.follow });
      const f2 = ctx.make(btn, "span", "following", { cls: "stk-bt stk-bt2" });
      ctx.make(f2, "span", "tx", { text: p.following });
      ctx.make(f2, "span", "check", { cls: "stk-check", html: `<svg viewBox="0 0 24 24" style="width:22px;height:22px;display:block" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` });
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
