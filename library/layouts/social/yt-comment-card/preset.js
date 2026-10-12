/* social/yt-comment-card: creator-style comment cards typing on over footage: for each comment the avatar chip pops, the name and age fade in, the text types on character by character,
   then the like and reply row fades in; comments enter one after another in a left-aligned column, the column fades out and the layer is hidden at the end of `duration`.
   Port of HyperFrames registry block yt-comment-card. BLOCK: built in the target box (source: a 1920 x 1080 composition). The `scheme` is "overlay" (white text with a soft shadow, for footage)
   or "light" (ink on a light board). Source timing kept: first comment at 0.3 s; per comment avatar 0.45 s back.out(1.6), name 0.4 s power2.out 0.12 s later, typing at 0.024 s per character
   (capped so a comment types in at most 2.2 s) starting 0.4 s after the comment, the row 0.35 s power2.out 0.15 s after the last character, 0.5 s before the next comment; exit
   opacity + y -18 over clamp(6 % of duration, 0.25 s, 0.6 s) ending 0.05 s before the end, then the layer is hidden. The source's own artwork is the default (05/10/2026): the thumb-up icon
   path is the source's; avatars are the source's initials chips (or your pictures via `avatar`). */
AIMK.preset("social/yt-comment-card", {
  params: { scheme: "overlay", x: 140, y: null, typeCharDelay: 0.024, scanlines: false, animationIn: true, animationOut: true, duration: 8, reply: "TRẢ LỜI",
    comments: [
      { avatar: null, initials: "PW", avatarHue: 210, username: "@pixelwaves", time: "2 ngày trước", text: "Video của bạn tuyệt nhất luôn!", likes: 47 },
      { avatar: null, initials: "FR", avatarHue: 340, username: "@framerate", time: "1 ngày trước", text: "Cú máy ở giây 0:12 đỉnh thật sự!", likes: 12 },
    ] },
  build(tl, els, p, ctx) {
    const t = p.at, light = p.scheme === "light", D = Math.max(0.5, Number(p.duration) || 8), clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), OUT = clamp(D * 0.06, 0.25, 0.6);
    const THUMB = `<svg viewBox="0 0 24 24"><path d="M7 11v9M7 11l3.2-6.4a2 2 0 0 1 3.6 1.2V9h4.6a2 2 0 0 1 2 2.4l-1.2 6a2 2 0 0 1-2 1.6H7M7 11H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3"/></svg>`;
    const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    ctx.css("social/yt-comment-card", `
.syc-box { position: absolute; overflow: hidden; }
.syc-scan { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 3px); }
.syc-wrap { position: absolute; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }
.syc-col { display: flex; flex-direction: column; gap: 40px; }
.syc-card { display: flex; gap: 22px; align-items: flex-start; }
.syc-av { flex: none; width: 64px; height: 64px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 26px; color: #ffffff; box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
.syc-av img { width: 100%; height: 100%; object-fit: cover; }
.syc-meta { display: flex; align-items: baseline; gap: 14px; }
.syc-user { font-weight: 700; font-size: 27px; }
.syc-time { font-weight: 400; font-size: 23px; }
.syc-text { margin-top: 8px; font-weight: 500; font-size: 34px; line-height: 1.35; letter-spacing: -0.01em; max-width: 860px; }
.syc-ch { opacity: 0; }
.syc-row { margin-top: 12px; display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 22px; opacity: 0; }
.syc-row svg { width: 24px; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
.syc-reply { margin-left: 18px; letter-spacing: 0.1em; }
.syc-overlay .syc-user, .syc-overlay .syc-text { color: #ffffff; text-shadow: 0 2px 16px rgba(0,0,0,0.55); }
.syc-overlay .syc-time, .syc-overlay .syc-row { color: rgba(255,255,255,0.72); text-shadow: 0 2px 12px rgba(0,0,0,0.5); }
.syc-overlay .syc-row svg { stroke: rgba(255,255,255,0.72); }
.syc-light .syc-user, .syc-light .syc-text { color: #1d1d1f; }
.syc-light .syc-time, .syc-light .syc-row { color: #5a5a5f; }
.syc-light .syc-row svg { stroke: #5a5a5f; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "yc", { cls: "syc-box " + (light ? "syc-light" : "syc-overlay"), style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      if (p.scanlines) ctx.make(box, "div", "scan", { cls: "syc-scan" });
      const wrap = ctx.make(box, "div", "wrap", { cls: "syc-wrap", style: p.y == null ? { left: Number(p.x) + "px" } : { left: Number(p.x) + "px", justifyContent: "flex-start", top: Number(p.y) + "px" } });
      const col = ctx.make(wrap, "div", "col", { cls: "syc-col" });
      let at = p.animationIn ? 0.3 : 0;
      (p.comments || []).forEach((c, i) => {
        const card = ctx.make(col, "div", "c" + i, { cls: "syc-card" });
        const av = ctx.make(card, "div", "av", { cls: "syc-av" });
        if (c.avatar) ctx.make(av, "img", "img", { attrs: { src: c.avatar, alt: "" } });
        else { av.textContent = c.initials || "?"; const h = c.avatarHue == null ? 210 : c.avatarHue; av.style.background = `linear-gradient(135deg, hsl(${h}, 62%, 52%), hsl(${h + 40}, 62%, 42%))`; }
        const body = ctx.make(card, "div", "body");
        const meta = ctx.make(body, "div", "meta", { cls: "syc-meta" });
        ctx.make(meta, "span", "user", { cls: "syc-user", text: c.username || "" });
        ctx.make(meta, "span", "time", { cls: "syc-time", text: c.time || "" });
        const text = ctx.make(body, "div", "text", { cls: "syc-text" });
        const chars = Array.from(String(c.text || "")).map((ch, k) => ctx.make(text, "span", "k" + k, { cls: "syc-ch", text: ch }));
        const row = ctx.make(body, "div", "row", { cls: "syc-row", html: THUMB + `<span>${esc(c.likes || 0)}</span><span class="syc-reply">${esc(p.reply)}</span>` });
        const delay = Math.min(Number(p.typeCharDelay), 2.2 / Math.max(1, chars.length));
        tl.fromTo(av, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, t + at);
        tl.fromTo(meta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t + at + 0.12);
        at += 0.4;
        chars.forEach((ch, k) => tl.fromTo(ch, { opacity: 0 }, { opacity: 1, duration: 0.02, ease: "none" }, t + at + k * delay));
        at += chars.length * delay + 0.15;
        tl.fromTo(row, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, t + at);
        at += 0.5;
      });
      if (p.animationOut) tl.fromTo(col, { opacity: 1, y: 0 }, { opacity: 0, y: -18, duration: OUT, ease: "power2.in" }, t + D - OUT - 0.05);
      tl.set(box, { visibility: "hidden", ease: "none" }, t + D - 0.02);
    }
  },
});
