/* title/yt-end-screen: a YouTube end-screen plate (16:9): the brand quietly on the left third (logo, channel name, "subscribe" line), the right
   two-thirds left empty for YouTube's own elements (a 615 x 345 next-video card at right 90 / top 110 and a 294 x 294 subscribe circle at right
   250 / bottom 150), the bottom ~130 px clear for the mobile controls. After iart-ai youtube-video-skills, youtube-intro-outro / intro-outro
   #5-6 (MIT): plate fades in over 18 frames (0.6 s), guides only for preview (guides: true draws the dashed zones; keep false for the render).
   BLOCK: built inside a full-frame box (sizes in 1920 x 1080 px, scaled to the box). */
AIMK.preset("title/yt-end-screen", {
  params: { logo: "", name: "Moworks", cta: "Đăng ký để xem thêm →", bg: "#0b0c10", fg: "#f5f7fa", accent: "#ff3b30", guides: false, fade: 0.6 },
  build(tl, els, p, ctx) {
    for (const slot of els) {
      const bw = slot.offsetWidth || 1920, k = bw / 1920, P = v => +(v * k).toFixed(2) + "px";
      const plate = ctx.make(slot, "div", "plate", { style: { position: "absolute", inset: "0px", background: p.bg } });
      const left = ctx.make(plate, "div", "brand", { style: { position: "absolute", left: P(80), top: P(90), width: P(560) } });
      if (p.logo) ctx.make(left, "img", "logo", { attrs: { src: p.logo, alt: "" }, style: { width: P(220), display: "block" } });
      ctx.make(left, "div", "name", { text: String(p.name).normalize("NFC"), style: { color: p.fg, fontSize: P(56), fontWeight: "700", marginTop: P(24), lineHeight: "1.1" } });
      ctx.make(left, "div", "cta", { text: String(p.cta).normalize("NFC"), style: { color: p.accent, fontSize: P(30), fontWeight: "500", marginTop: P(8) } });
      if (p.guides) {
        const g = { border: `${P(2)} dashed rgba(255,255,255,.25)`, position: "absolute" };
        ctx.make(plate, "div", "card", { style: Object.assign({ width: P(615), height: P(345), right: P(90), top: P(110), borderRadius: P(12) }, g) });
        ctx.make(plate, "div", "sub", { style: Object.assign({ width: P(294), height: P(294), right: P(250), bottom: P(150), borderRadius: "999px" }, g) });
      }
      tl.fromTo(plate, { opacity: 0 }, { opacity: 1, duration: p.fade, ease: "none" }, p.at);
    }
  },
});
