/* ui/macos-notification: a macOS-style notification banner (top right): it slides in from the right with a fade, holds, then slides back out.
   Port of HyperFrames registry block macos-notification. BLOCK: the target is an empty box (usually the whole frame); the banner is built inside it.
   Source timing kept: slide in 0.2 s (0.5 s, power3.out), slide out at 4.2 s (0.3 s, power3.in). The app icon is the source's own (05/10/2026): a 36 px SVG square (rx 8) with the
   violet gradient #6366f1 -> #8b5cf6 and the bold "HF" mark; icon_letter, icon_from, icon_to replace the mark text and the colours. exitAt: seconds after `at` for the slide-out, null = stays. */
AIMK.preset("ui/macos-notification", {
  params: { app_name: "Nhắc việc", time_label: "bây giờ", title: "Bản dựng đã xong", body: "Phim giới thiệu sản phẩm đã sẵn sàng để duyệt, bấm để mở và gửi cho khách.",
    icon_letter: "HF", icon_from: "#6366f1", icon_to: "#8b5cf6", right: 24, top: 24, exitAt: 4.2 },
  build(tl, els, p, ctx) {
    ctx.css("ui/macos-notification", `
.uimn { position: absolute; width: 380px; background: rgba(30, 30, 30, 0.82); -webkit-backdrop-filter: blur(40px); backdrop-filter: blur(40px); border-radius: 16px;
  padding: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 0.5px rgba(255, 255, 255, 0.1); display: flex; gap: 12px; align-items: flex-start; box-sizing: border-box; }
.uimn-icon { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; overflow: hidden; }
.uimn-content { flex: 1; min-width: 0; }
.uimn-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.uimn-app { font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.02em; }
.uimn-time { font-size: 13px; font-weight: 400; color: rgba(255, 255, 255, 0.35); }
.uimn-title { font-size: 15px; font-weight: 600; color: #ffffff; line-height: 1.3; margin-bottom: 2px; }
.uimn-body { font-size: 13px; font-weight: 400; color: rgba(255, 255, 255, 0.6); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`);
    for (const slot of els) {
      const card = ctx.make(slot, "div", "mn", { cls: "uimn", style: { top: p.top + "px", right: p.right + "px" } });
      const icon = ctx.make(card, "div", "icon", { cls: "uimn-icon" });
      const gid = icon.id + "_grad", mark = String(p.icon_letter).replace(/&/g, "&amp;").replace(/</g, "&lt;");
      icon.innerHTML = `<svg viewBox="0 0 36 36" style="width:36px;height:36px;display:block" fill="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${p.icon_from}"/><stop offset="100%" stop-color="${p.icon_to}"/></linearGradient></defs><rect width="36" height="36" rx="8" fill="url(#${gid})"/><text x="18" y="23" text-anchor="middle" style="font-family:inherit" font-size="14" font-weight="700" fill="#fff">${mark}</text></svg>`;   // the source's app icon
      const c = ctx.make(card, "div", "content", { cls: "uimn-content" });
      const head = ctx.make(c, "div", "head", { cls: "uimn-head" });
      ctx.make(head, "span", "app", { cls: "uimn-app", text: p.app_name });
      ctx.make(head, "span", "time", { cls: "uimn-time", text: p.time_label });
      ctx.make(c, "div", "title", { cls: "uimn-title", text: p.title });
      ctx.make(c, "div", "body", { cls: "uimn-body", text: p.body });
      const t = p.at;
      tl.fromTo(card, { x: 420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t + 0.2);
      if (p.exitAt != null) tl.to(card, { x: 420, opacity: 0, duration: 0.3, ease: "power3.in" }, t + p.exitAt);
    }
  },
});
