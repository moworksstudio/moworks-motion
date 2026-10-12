/* lower/news-ticker: a broadcast news bar: a dark glass panel rises in, a red LIVE brand block slides in with a pulsing dot, the headline wipes in
   with one accent phrase, a time pill drops in, a BREAKING label rises, a light flash sweeps the panel twice, and the ticker row scrolls items
   with red separators and highlighted figures. Port of HyperFrames registry block news-ticker (layout, colours, gradients and timing as in the
   source; the film's font instead of Inter: no network). BLOCK: built inside the target box (1920 x 1080 positions: 96 px side margins, 72 px
   from the bottom). Text: in `headline` and in each ticker item, [square brackets] mark the accent phrase / the highlighted figure.
   Exit (source: 6.62 s): the panel drops away, params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("lower/news-ticker", {
  params: { live: "Trực tiếp", desk: "Bàn tin quốc tế", headline: "Video AI từ [thử nghiệm] đến sản xuất", time: "09:41 GMT+7",
            label: "Tin nóng", items: ["Đội sáng tạo rút ngắn thời gian ra mắt [38%]", "Hàng đợi kết xuất xong trong chưa tới [2 phút]",
            "Các mẫu thư viện mới được dùng nhiều trong demo sản phẩm", "Biên tập viên chuyển sang làm chuyển động bằng HTML"],
            red: "#e11d2e", exitAt: 6.62 },
  build(tl, els, p, ctx) {
    ctx.css("lower/news-ticker", `
.ntk { position: absolute; left: 96px; right: 96px; bottom: 72px; height: 216px; filter: drop-shadow(0 28px 44px rgba(0,0,0,.32)); color: #f8fafc; }
.ntk-panel { position: absolute; inset: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.18); border-radius: 28px;
  background: linear-gradient(180deg, rgba(21,31,48,.96), rgba(7,13,24,.98)), linear-gradient(90deg, rgba(201,31,45,.72), transparent 38%); }
.ntk-panel::before { position: absolute; inset: 0; content: ""; background: radial-gradient(circle at 14% 0%, rgba(255,255,255,.2), transparent 26%),
  linear-gradient(110deg, transparent 0 42%, rgba(255,255,255,.06) 42% 43%, transparent 43% 100%); opacity: .72; pointer-events: none; }
.ntk-top { position: absolute; left: 0; right: 0; top: 0; height: 126px; display: flex; align-items: stretch; }
.ntk-brand { width: 294px; display: flex; align-items: center; justify-content: center; gap: 16px; box-shadow: inset -1px 0 0 rgba(255,255,255,.16); }
.ntk-dot { width: 18px; height: 18px; border-radius: 999px; background: #ffffff; box-shadow: 0 0 0 0 rgba(255,255,255,.55); }
.ntk-bt { display: flex; flex-direction: column; gap: 4px; text-transform: uppercase; }
.ntk-live { font-size: 22px; font-weight: 900; line-height: 1; letter-spacing: .16em; }
.ntk-desk { font-size: 15px; font-weight: 700; line-height: 1; letter-spacing: .22em; color: #ffffff; }
.ntk-hw { position: relative; flex: 1; display: flex; align-items: center; padding: 0 250px 0 44px; overflow: hidden; }
.ntk-head { position: relative; z-index: 1; font-size: 48px; font-weight: 850; line-height: 1.02; white-space: nowrap; color: #ffffff; text-shadow: 0 2px 14px rgba(0,0,0,.34); }
.ntk-acc { color: #ff4455; }
.ntk-time { position: absolute; top: 25px; right: 38px; padding: 10px 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.74); font-size: 18px; font-weight: 700; line-height: 1; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.ntk-bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 90px; display: flex; align-items: center; border-top: 1px solid rgba(255,255,255,.11); background: rgba(2,6,13,.58); }
.ntk-label { width: 294px; height: 100%; display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,.14); background: #5f0712;
  color: #ffffff; font-size: 24px; font-weight: 900; line-height: 1; letter-spacing: .14em; text-transform: uppercase; }
.ntk-win { position: relative; flex: 1; height: 100%; overflow: hidden; background: #050b15; }
.ntk-win::before, .ntk-win::after { position: absolute; top: 0; bottom: 0; z-index: 2; width: 90px; content: ""; pointer-events: none; }
.ntk-win::before { left: 0; background: linear-gradient(90deg, #050b15, transparent); }
.ntk-win::after { right: 0; background: linear-gradient(270deg, #050b15, transparent); }
.ntk-track { position: absolute; left: 34px; top: 0; height: 100%; display: flex; align-items: center; gap: 34px; white-space: nowrap; }
.ntk-item { display: inline-flex; align-items: center; gap: 14px; padding: 13px 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 999px; background: #08111f;
  color: #ffffff; font-size: 31px; font-weight: 650; line-height: 1; }
.ntk-sep { width: 9px; height: 9px; border-radius: 999px; }
.ntk-metric { padding: 4px 8px; border-radius: 8px; background: #063344; color: #c8f8ff; font-weight: 850; font-variant-numeric: tabular-nums; }
.ntk-flash { position: absolute; top: 0; bottom: 0; left: -260px; z-index: 3; width: 210px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent); }`);
    const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const mark = (s, cls) => esc(s).replace(/\[([^\]]*)\]/g, `<span class="${cls}">$1</span>`);
    const red = p.red;
    for (const slot of els) {
      const shell = ctx.make(slot, "section", "nt", { cls: "ntk" });
      const panel = ctx.make(shell, "div", "panel", { cls: "ntk-panel" });
      const flash = ctx.make(panel, "div", "flash", { cls: "ntk-flash" });
      const top = ctx.make(panel, "div", "top", { cls: "ntk-top" });
      const brand = ctx.make(top, "div", "brand", { cls: "ntk-brand", style: { background: `linear-gradient(135deg, ${red}, color-mix(in srgb, ${red} 62%, #000))` } });
      const dot = ctx.make(brand, "div", "dot", { cls: "ntk-dot" });
      const bt = ctx.make(brand, "div", "bt", { cls: "ntk-bt" });
      ctx.make(bt, "div", "live", { cls: "ntk-live", text: p.live });
      ctx.make(bt, "div", "desk", { cls: "ntk-desk", text: p.desk });
      const hw = ctx.make(top, "div", "hw", { cls: "ntk-hw" });
      const head = ctx.make(hw, "h1", "head", { cls: "ntk-head", html: mark(p.headline, "ntk-acc") });
      const time = ctx.make(hw, "div", "time", { cls: "ntk-time", text: p.time });
      const bottom = ctx.make(panel, "div", "bottom", { cls: "ntk-bottom" });
      const label = ctx.make(bottom, "div", "label", { cls: "ntk-label", text: p.label });
      const win = ctx.make(bottom, "div", "win", { cls: "ntk-win" });
      const track = ctx.make(win, "div", "track", { cls: "ntk-track" });
      const items = (p.items || []).length ? p.items : ["…"];
      const list = items.concat(items.slice(0, 2));                       // the source repeats the first two so the row never runs dry
      list.forEach((s, i) => ctx.make(track, "span", "i" + i, { cls: "ntk-item",
        html: `<span class="ntk-sep" style="background:${red};box-shadow:0 0 22px color-mix(in srgb, ${red} 75%, transparent)"></span>` + mark(s, "ntk-metric") }));
      const t = p.at;
      tl.fromTo(shell, { y: 260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.52, ease: "power4.out" }, t);
      tl.fromTo(brand, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, t + 0.08);
      tl.fromTo(head, { y: 26, opacity: 0, clipPath: "inset(0 100% 0 0)" }, { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.62, ease: "power3.out" }, t + 0.18);
      tl.fromTo(flash, { x: 0, skewX: -16 }, { x: 2040, skewX: -16, duration: 0.86, ease: "power2.inOut" }, t + 0.34);
      tl.fromTo(time, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" }, t + 0.5);
      tl.fromTo(label, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power2.out" }, t + 0.55);
      tl.fromTo(dot, { scale: 1, boxShadow: "0 0 0 0px rgba(255,255,255,0.55)" }, { scale: 1.32, boxShadow: "0 0 0 18px rgba(255,255,255,0)", duration: 0.42, repeat: 11, yoyo: true, ease: "sine.inOut" }, t + 0.58);
      tl.fromTo(track, { x: 1260 }, { x: -1120, duration: 6.05, ease: "none" }, t + 0.62);
      tl.to(flash, { x: 4080, duration: 0.72, ease: "power2.inOut" }, t + 3.42);
      if (p.exitAt != null) tl.to(shell, { y: 170, opacity: 0, duration: 0.34, ease: "power3.in" }, t + p.exitAt);
    }
  },
});
