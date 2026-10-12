/* ui/notification-cascade: a phone notification stack (portrait 1080 x 1920 design). Four banners land one after another on a 2 s beat and push each other up one pitch
   (214 px, expo.out); a "show less" pill rides the stack; the group lifts away and a dark end card with a two-line headline, a logo and a footer fades in.
   Port of HyperFrames registry block notification-cascade. BLOCK: the target is an empty box; the 1080 x 1920 design is built inside it and fitted (contain, centred) to the
   box with one static scale, so every number below is the source pixel value. In a 1080 x 1920 film the scale is 1.
   Source timing kept: fade from black 0.5 s, backdrop push-in 1 -> 1.105 (linear, 0.5333 -> 14 s), banners at 1.6033 / 3.6033 / 5.6033 / 7.6033 (fade 0.3333 linear + rise 22 px
   expo.out 0.9 s), restacks 1.0 s expo.out, group exit at 9.2033 (up 560 px 0.5 s expo.out, fade 0.37 s), end card at 9.9033. */
AIMK.preset("ui/notification-cascade", {
  params: {
    title: "Bản dựng mới",
    messages: ["Phim giới thiệu đã sẵn sàng.", "Mọi bước kiểm tra đều đạt.", "Kết xuất 4K xong trong 92 giây.", "Đã đăng lên kênh của bạn."],
    app_name: "Studio", now_label: "BÂY GIỜ", less_label: "Thu gọn", icon_letter: "", icon_from: "#5ae458", icon_to: "#1fc83f",
    headline_top: "PHIM XONG", headline_accent: "GỬI KHÁCH NGAY", footer: "tenmien.vn", logo: "", backdrop: "",
    bg_from: "#f7ead8", bg_mid: "#ecd2b0", bg_to: "#c99a6c", end_ink: "#f7ece5", end_accent: "#3ce6ac",
  },
  build(tl, els, p, ctx) {
    ctx.css("ui/notification-cascade", `
.uinc { position: absolute; width: 1080px; height: 1920px; overflow: hidden; transform-origin: 0 0; background: #000; box-sizing: border-box; }
.uinc * { box-sizing: border-box; }
.uinc-abs { position: absolute; }
.uinc-backdrop { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.uinc-vig { position: absolute; inset: 0; background: radial-gradient(ellipse 120% 90% at 50% 42%, rgba(0, 0, 0, 0) 58%, rgba(50, 25, 8, 0.18) 100%); }
.uinc-inner { position: absolute; inset: 0; }
.uinc-banner { position: absolute; left: 135px; width: 810px; height: 176px; border-radius: 26px; background: rgba(250, 246, 241, 0.94); box-shadow: 0 10px 26px rgba(50, 25, 8, 0.18); }
.uinc-icon { position: absolute; left: 23px; top: 38px; width: 100px; height: 100px; border-radius: 24px; display: grid; place-items: center; color: #ffffff; font-size: 56px; font-weight: 700; line-height: 1; }
.uinc-title { position: absolute; left: 148px; top: 37px; font-size: 35px; font-weight: 700; color: #1c1c1e; letter-spacing: 0.25px; line-height: 42px; white-space: nowrap; }
.uinc-sub { position: absolute; left: 148px; top: 85px; font-size: 33px; font-weight: 400; color: #464040; letter-spacing: -0.75px; line-height: 40px; white-space: nowrap; }
.uinc-now { position: absolute; right: 26px; top: 32px; font-size: 22px; font-weight: 400; color: #5a5450; letter-spacing: 1px; line-height: 26px; }
.uinc-credit { position: absolute; right: 26px; bottom: 10px; font-size: 24px; font-style: italic; color: #5a5450; line-height: 30px; }
.uinc-pillrow { position: absolute; left: 0; top: 1164px; width: 1080px; height: 72px; }
.uinc-pill { position: absolute; left: 615px; top: 0; width: 241px; height: 72px; border-radius: 36px; background: rgba(250, 246, 242, 0.85); display: flex; align-items: center; justify-content: flex-start;
  padding-left: 20px; gap: 9px; font-size: 27px; font-weight: 500; color: #3f3a38; box-shadow: 0 8px 20px rgba(50, 25, 8, 0.14); white-space: nowrap; }
.uinc-x { position: absolute; left: 873px; top: 0; width: 73px; height: 72px; border-radius: 50%; background: rgba(250, 246, 242, 0.85); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(50, 25, 8, 0.14); }
.uinc-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, #14110e 0%, #221b13 100%); }
.uinc-end { position: absolute; inset: 0; text-align: center; }
.uinc-ec1 { position: absolute; left: 0; top: 662px; width: 1080px; font-weight: 800; font-size: 93px; line-height: 112px; letter-spacing: 4px; text-shadow: 2.5px 3px 1px rgba(0, 0, 0, 0.66); white-space: nowrap; }
.uinc-ec2 { position: absolute; left: 0; top: 784px; width: 1080px; font-weight: 800; font-size: 67px; line-height: 80px; letter-spacing: 3px; text-shadow: 2.5px 3px 1px rgba(0, 0, 0, 0.64); white-space: nowrap; }
.uinc-mark { position: absolute; left: 277px; top: 990px; width: 526px; height: 158px; object-fit: contain; }
.uinc-foot { position: absolute; left: 0; top: 1190px; width: 1080px; font-size: 35px; font-weight: 600; line-height: 42px; }
.uinc-black { position: absolute; inset: 0; background: #000; }`);
    const PITCH = 214, ENTRY = [1.6033, 3.6033, 5.6033, 7.6033], FADE_D = 0.3333, RISE = 22, RESTACK_D = 1.0, EXIT_T = 9.2033, ENDCARD_T = 9.9033, ENDCARD_D = 0.5667;
    const msgs = (p.messages || []).slice(0, 4);
    const ICON_BUBBLE = `<svg width="64" height="60" viewBox="0 0 64 60" fill="none" style="position:absolute;left:18px;top:20px"><path d="M32 2 C15 2 2 13 2 27 c0 8 4.6 15 12 19.6 -0.7 3.6 -2.9 7.4 -6.4 10.2 5.8 -0.6 10.9 -2.8 14.6 -5.5 3.1 0.8 6.4 1.2 9.8 1.2 17 0 30 -11 30 -25.5 S49 2 32 2 Z" fill="#fff"/></svg>`;
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, k = Math.min(sw / 1080, sh / 1920);
      const d = ctx.make(slot, "div", "d", { cls: "uinc", style: { left: ((sw - 1080 * k) / 2).toFixed(2) + "px", top: ((sh - 1920 * k) / 2).toFixed(2) + "px", transform: k === 1 ? "" : `scale(${k.toFixed(5)})` } });
      const base = ctx.make(d, "div", "base", { cls: "uinc-abs", style: { inset: "0" } });
      const backdrop = ctx.make(base, "div", "backdrop", { cls: "uinc-backdrop",
        style: p.backdrop === "gradient" ? { background: `radial-gradient(ellipse 70% 40% at 78% 18%, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%), radial-gradient(ellipse 60% 35% at 15% 72%, rgba(255,255,255,0.28), rgba(255,255,255,0) 70%), linear-gradient(170deg, ${p.bg_from} 0%, ${p.bg_mid} 48%, ${p.bg_to} 100%)` }
          : { background: `url("${p.backdrop || ctx.asset("desk-backdrop.jpg")}") center / cover no-repeat` } });   // the source's desk photo by default
      ctx.make(base, "div", "vig", { cls: "uinc-vig" });
      const stack = ctx.make(d, "div", "stack", { cls: "uinc-inner" });
      const pillrow = ctx.make(stack, "div", "pillrow", { cls: "uinc-pillrow" });
      ctx.make(ctx.make(pillrow, "div", "pill", { cls: "uinc-pill" }), "span", "less", { text: p.less_label }).insertAdjacentHTML("beforebegin",
        `<svg width="25" height="25" viewBox="0 0 26 26" fill="none"><path d="M4 8 L13 18 L22 8" stroke="#3f3a38" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
      ctx.make(pillrow, "div", "x", { cls: "uinc-x", html: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none"><path d="M6 6 L28 28 M28 6 L6 28" stroke="#4a4442" stroke-width="4.2" stroke-linecap="round"/></svg>` });
      const banners = msgs.map((m, i) => {
        const b = ctx.make(stack, "div", "b" + (i + 1), { cls: "uinc-banner", style: { top: "1260px" } });
        const ic = ctx.make(b, "div", "icon", { cls: "uinc-icon", style: { background: `linear-gradient(180deg, ${p.icon_from} 0%, ${p.icon_to} 100%)` } });
        if (p.icon_letter) ic.textContent = p.icon_letter;   // a film's own one-letter mark
        else ic.innerHTML = ICON_BUBBLE;                      // default: the source's own white speech-bubble glyph
        ctx.make(b, "div", "title", { cls: "uinc-title", text: p.title });
        ctx.make(b, "div", "sub", { cls: "uinc-sub", text: m });
        ctx.make(b, "div", "now", { cls: "uinc-now", text: p.now_label });
        ctx.make(b, "div", "credit", { cls: "uinc-credit", text: p.app_name });
        return b;
      });
      const scrim = ctx.make(d, "div", "scrim", { cls: "uinc-scrim" });
      const end = ctx.make(d, "div", "end", { cls: "uinc-end" });
      ctx.make(end, "div", "ec1", { cls: "uinc-ec1", text: p.headline_top, style: { color: p.end_ink } });
      ctx.make(end, "div", "ec2", { cls: "uinc-ec2", text: p.headline_accent, style: { color: p.end_accent } });
      ctx.make(end, "img", "mark", { cls: "uinc-mark", attrs: { src: p.logo || ctx.asset("hyperframes-logo-white.svg"), alt: "" } });
      ctx.make(end, "div", "foot", { cls: "uinc-foot", text: p.footer, style: { color: p.end_accent } });
      const fade = ctx.make(d, "div", "fade", { cls: "uinc-black" });
      const t = p.at;
      tl.fromTo(fade, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, ease: "none" }, t);
      tl.fromTo(backdrop, { scale: 1.0, transformOrigin: "525px 950px" }, { scale: 1.105, duration: 13.4667, ease: "none" }, t + 0.5333);
      banners.forEach((b, i) => {
        tl.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE_D, ease: "none" }, t + ENTRY[i]);
        tl.fromTo(b, { y: RISE }, { y: 0, duration: 0.9, ease: "expo.out" }, t + ENTRY[i]);
      });
      tl.fromTo(pillrow, { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE_D, ease: "none" }, t + ENTRY[0]);
      const up = (el, n, i) => tl.to(el, { y: -n * PITCH, duration: RESTACK_D, ease: "expo.out" }, t + ENTRY[i]);
      if (banners[0]) { up(banners[0], 1, 1); up(pillrow, 1, 1); up(banners[0], 2, 2); up(pillrow, 2, 2); up(banners[0], 3, 3); up(pillrow, 3, 3); }
      if (banners[1]) { up(banners[1], 1, 2); up(banners[1], 2, 3); }
      if (banners[2]) up(banners[2], 1, 3);
      tl.to(stack, { y: -560, duration: 0.5, ease: "expo.out" }, t + EXIT_T);
      tl.to(stack, { autoAlpha: 0, duration: 0.37, ease: "none" }, t + EXIT_T);
      tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, t + ENDCARD_T);
      tl.fromTo(end, { autoAlpha: 0 }, { autoAlpha: 1, duration: ENDCARD_D, ease: "none" }, t + ENDCARD_T);
    }
  },
});
