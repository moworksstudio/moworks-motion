/* social/yt-lower-third: a white pill "channel" lower third: avatar, channel name, subscriber count and a dark Subscribe button. The pill slides up from below, the button presses and
   springs and swaps "Subscribe" for "Subscribed" with a check mark, then the pill slides back out.
   Port of HyperFrames registry block yt-lower-third. BLOCK: built in the target box, centred horizontally and `bottom` px above its lower edge (source: a 1920 x 1080 composition,
   bottom 80 px). Source timing kept (relative to `at`): slide in 0.5 s power3.out at 0.1 s from y 300; button press 0.15 s scale 0.92 at 1.0 s, release 0.4 s elastic.out(1, 0.4) at
   1.15 s, text swap (Subscribe out 0.08 s at 1.15 s, Subscribed in 0.08 s at 1.18 s); slide out 0.25 s power3.in at exitAt (3.8 s; null = no exit).
   No platform artwork: the avatar is an initials disc (or your picture). */
AIMK.preset("social/yt-lower-third", {
  params: { name: "Tên Kênh", subs: "82,2K người đăng ký", subscribe: "Đăng ký", subscribed: "Đã đăng ký", avatar: "", avatarColor: "#e8505b", bottom: 80, exitAt: 3.8 },
  build(tl, els, p, ctx) {
    const t = p.at, ini = String(p.name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0]).join("").toUpperCase() || "?";
    ctx.css("social/yt-lower-third", `
.syl-box { position: absolute; overflow: hidden; }
.syl-pill { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; display: flex; align-items: center; gap: 28px; background: #ffffff; border-radius: 60px; padding: 20px 32px 20px 20px; box-shadow: 0 6px 32px rgba(0,0,0,0.14); }
.syl-avatar { width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0; overflow: hidden; display: grid; place-items: center; color: #ffffff; font-size: 36px; font-weight: 700; }
.syl-avatar img { width: 100%; height: 100%; object-fit: cover; }
.syl-info { display: flex; flex-direction: column; gap: 2px; margin-right: 20px; }
.syl-name { font-size: 34px; font-weight: 700; color: #0f0f0f; line-height: 1.3; letter-spacing: -0.01em; }
.syl-subs { font-size: 22px; font-weight: 400; color: #606060; line-height: 1.3; }
.syl-btn { position: relative; width: 220px; height: 68px; border-radius: 34px; background: #0f0f0f; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.syl-bt { position: absolute; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; white-space: nowrap; }
.syl-bt2 { opacity: 0; display: flex; align-items: center; gap: 8px; }
.syl-check { display: inline-block; width: 24px; height: 24px; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "yl", { cls: "syl-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const card = ctx.make(box, "div", "card", { cls: "syl-pill", style: { bottom: Number(p.bottom) + "px" } });
      const av = ctx.make(card, "div", "avatar", { cls: "syl-avatar", style: { background: p.avatarColor } });
      const avSrc = p.avatar === "initials" ? "" : (p.avatar || ctx.asset("avatar.jpg"));   // the source's avatar by default; "initials" = a lettered disc
      if (avSrc) ctx.make(av, "img", "img", { attrs: { src: avSrc, alt: "" } }); else av.textContent = ini;
      const info = ctx.make(card, "div", "info", { cls: "syl-info" });
      ctx.make(info, "div", "name", { cls: "syl-name", text: p.name });
      ctx.make(info, "div", "subs", { cls: "syl-subs", text: p.subs });
      const btn = ctx.make(card, "div", "btn", { cls: "syl-btn" });
      const f1 = ctx.make(btn, "span", "sub", { cls: "syl-bt", text: p.subscribe });
      const f2 = ctx.make(btn, "span", "subd", { cls: "syl-bt syl-bt2" });
      ctx.make(f2, "span", "check", { cls: "syl-check", html: `<svg viewBox="0 0 24 24" style="width:24px;height:24px;display:block" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` });
      ctx.make(f2, "span", "tx", { text: p.subscribed });
      tl.fromTo(card, { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.1);
      tl.fromTo(btn, { scale: 1 }, { scale: 0.92, duration: 0.15, ease: "power2.out" }, t + 1.0);
      tl.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)", immediateRender: false }, t + 1.15);
      tl.fromTo(f1, { opacity: 1 }, { opacity: 0, duration: 0.08, ease: "none" }, t + 1.15);
      tl.fromTo(f2, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, t + 1.18);
      if (p.exitAt != null) tl.fromTo(card, { y: 0, opacity: 1 }, { y: 300, opacity: 0, duration: 0.25, ease: "power3.in", immediateRender: false }, t + p.exitAt);
    }
  },
});
