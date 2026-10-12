/* ui/share-sheet-carousel: a phone "share" sheet over a blurred copy of the picture it offers. The sheet springs up from below (the source's frame-sampled spring, kept as 22
   literal steps), the four pictures cycle in 13 hard cuts (the blurred background cuts with them), then the right-hand button is pressed (a 3 px dip + a grey cell).
   Port of HyperFrames registry block share-sheet-carousel. BLOCK: the target is an empty box; the portrait 1080 x 1920 design is built inside it and fitted (contain, centred)
   with one static scale, so all numbers are the source pixel values (scale 1 in a 1080 x 1920 film).
   Source timing kept: spring 0.056667 -> 0.723333 s, cuts at 0.99 ... 5.156667 s, press 6.323333 -> 6.656667 s, composition length 7.2333 s (demo duration). */
AIMK.preset("ui/share-sheet-carousel", {
  params: {
    title: "Chia sẻ", sender: "Studio", message: "muốn chia sẻ một đoạn phim", strip_text: "DỰNG PHIM NHANH · TỪ Ý TƯỞNG ĐẾN FILE",
    decline: "Từ chối", accept: "Chấp nhận", accent: "#087a57",
    slides: [],
    logo: "",
  },
  build(tl, els, p, ctx) {
    ctx.css("ui/share-sheet-carousel", `
.uiss { position: absolute; width: 1080px; height: 1920px; overflow: hidden; transform-origin: 0 0; background: #000; box-sizing: border-box; }
.uiss * { box-sizing: border-box; }
.uiss-bg { position: absolute; left: -80px; top: -80px; width: 1240px; height: 2080px; object-fit: cover; filter: blur(46px) saturate(1.1) brightness(0.88); }
.uiss-card { position: absolute; left: 206px; top: 473px; width: 668px; height: 974px; background: #f9f9f9; border-radius: 34px; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28); opacity: 0; }
.uiss-clip { position: absolute; inset: 0; border-radius: 34px; overflow: hidden; }
.uiss-title { position: absolute; top: 49px; left: 0; width: 100%; text-align: center; font-size: 44px; font-weight: 600; color: #101010; line-height: 44px; letter-spacing: 0.2px; }
.uiss-sub { position: absolute; top: 117px; left: 0; width: 100%; text-align: center; font-size: 29px; font-weight: 400; color: #313131; line-height: 29px; white-space: nowrap; }
.uiss-sub b { font-weight: 700; }
.uiss-imgbox { position: absolute; left: 43px; top: 191px; width: 582px; height: 632px; border-radius: 24px; overflow: hidden; }
.uiss-slide { position: absolute; left: 0; top: 0; width: 582px; height: 476px; object-fit: cover; }
.uiss-strip { position: absolute; left: 0; top: 476px; width: 582px; height: 156px; background: #f2ecdf; display: grid; place-items: center; align-content: center; gap: 14px; }
.uiss-strip img { height: 38px; display: block; }
.uiss-striptext { font-size: 17px; font-weight: 600; letter-spacing: 2.4px; color: #4a4438; text-transform: uppercase; white-space: nowrap; line-height: 20px; }
.uiss-hdiv { position: absolute; left: 0; top: 859px; width: 100%; height: 1.5px; background: #dfdfdf; }
.uiss-vdiv { position: absolute; left: 333px; top: 861px; width: 1.5px; bottom: 0; background: #dfdfdf; }
.uiss-press { position: absolute; left: 335px; top: 861px; right: 0; bottom: 0; background: #e9e9e9; border-radius: 0 0 34px 0; opacity: 0; }
.uiss-btn { position: absolute; top: 861px; bottom: 0; display: grid; place-items: center; font-size: 34px; }`);
    const SPRING = [[0.056667, 1198, 0.13], [0.09, 903, 0.21], [0.123333, 648, 0.36], [0.156667, 437, 0.43], [0.19, 262, 0.5], [0.223333, 120, 0.62], [0.256667, 8, 0.78],
      [0.29, -76, 0.89], [0.323333, -138, 1.0], [0.356667, -175, null], [0.39, -191, null], [0.423333, -192, null], [0.456667, -181, null], [0.49, -159, null],
      [0.523333, -131, null], [0.556667, -100, null], [0.59, -68, null], [0.623333, -41, null], [0.656667, -18, null], [0.69, -5, null], [0.723333, 0, null]];
    const CUTS = [0.99, 1.356667, 1.69, 2.023333, 2.356667, 2.69, 3.09, 3.456667, 3.79, 4.123333, 4.456667, 4.79, 5.156667];
    const slides = ((p.slides && p.slides.length) ? p.slides : ["slide-01.jpg", "slide-02.jpg", "slide-03.jpg", "slide-04.jpg"].map(f => ctx.asset(f))).slice(0, 4), N = slides.length;
    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, k = Math.min(sw / 1080, sh / 1920);
      const d = ctx.make(slot, "div", "d", { cls: "uiss", style: { left: ((sw - 1080 * k) / 2).toFixed(2) + "px", top: ((sh - 1920 * k) / 2).toFixed(2) + "px", transform: k === 1 ? "" : `scale(${k.toFixed(5)})` } });
      const bgs = slides.map((s, i) => ctx.make(d, "img", "bg" + (i + 1), { cls: "uiss-bg", attrs: { src: s, alt: "" }, style: { opacity: i === 0 ? "1" : "0" } }));
      const card = ctx.make(d, "div", "card", { cls: "uiss-card" });
      const clip = ctx.make(card, "div", "clip", { cls: "uiss-clip" });
      ctx.make(clip, "div", "title", { cls: "uiss-title", text: p.title });
      const sub = ctx.make(clip, "div", "sub", { cls: "uiss-sub" });
      ctx.make(sub, "b", "who", { text: p.sender });
      sub.appendChild(document.createTextNode(" " + p.message));
      const box = ctx.make(clip, "div", "imgbox", { cls: "uiss-imgbox" });
      const pics = slides.map((s, i) => ctx.make(box, "img", "s" + (i + 1), { cls: "uiss-slide", attrs: { src: s, alt: "" }, style: { opacity: i === 0 ? "1" : "0" } }));
      const strip = ctx.make(box, "div", "strip", { cls: "uiss-strip" });
      ctx.make(strip, "img", "logo", { attrs: { src: p.logo || ctx.asset("hyperframes-logo-black.svg"), alt: "" } });
      ctx.make(strip, "div", "txt", { cls: "uiss-striptext", text: p.strip_text });
      ctx.make(clip, "div", "hdiv", { cls: "uiss-hdiv" });
      const press = ctx.make(clip, "div", "press", { cls: "uiss-press" });
      ctx.make(clip, "div", "vdiv", { cls: "uiss-vdiv" });
      ctx.make(clip, "div", "decline", { cls: "uiss-btn", text: p.decline, style: { left: "0", width: "333px", color: "#6f6f73", fontWeight: "400" } });
      ctx.make(clip, "div", "accept", { cls: "uiss-btn", text: p.accept, style: { left: "335px", right: "0", color: p.accent, fontWeight: "600" } });
      const t = p.at;
      tl.set(card, { y: 1450, autoAlpha: 0 }, t + 0.001);
      tl.set(press, { autoAlpha: 0 }, t + 0.001);
      SPRING.forEach(s => { const props = { y: s[1] }; if (s[2] !== null) props.autoAlpha = s[2]; tl.set(card, props, t + s[0]); });
      let cur = 0;
      CUTS.forEach((c, i) => {
        const next = (i + 1) % N;
        tl.set(bgs[cur], { autoAlpha: 0 }, t + c); tl.set(pics[cur], { autoAlpha: 0 }, t + c);
        tl.set(bgs[next], { autoAlpha: 1 }, t + c); tl.set(pics[next], { autoAlpha: 1 }, t + c);
        cur = next;
      });
      tl.set(card, { y: 3 }, t + 6.323333); tl.set(press, { autoAlpha: 1 }, t + 6.323333);
      tl.set(card, { y: 0 }, t + 6.656667); tl.set(press, { autoAlpha: 0 }, t + 6.656667);
    }
  },
});
