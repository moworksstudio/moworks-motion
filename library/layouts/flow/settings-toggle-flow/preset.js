/* flow/settings-toggle-flow: a settings card: the card rises in, the preference rows slide in one after another, the switches that are on settle with a small overshoot.
   Port of HyperFrames registry component settings-toggle-flow (layout, colours, sizes and timing as in the source; font = the film's font, the source used Inter).
   BLOCK: the target is an empty box (usually the whole frame); the card is built in its middle and shown `scale` times larger, as the source demo does
   (a wrapper with transform: scale, never tweened). Source timing kept: card 0.34 s power2.out at 0.28, rows 0.28 s power2.out stagger 0.08 at 0.55,
   switches that are on: scale 0.92 -> 1, 0.28 s back.out(1.8), stagger 0.08 at 0.88. */
AIMK.preset("flow/settings-toggle-flow", {
  params: { rows: [ { title: "Phụ đề tự động", sub: "Tạo phụ đề có thời gian", on: true }, { title: "Bộ nhận diện", sub: "Áp dụng màu đã lưu", on: true }, { title: "Hiệu ứng âm thanh", sub: "Thêm âm thanh giao diện nhẹ", on: false } ],
    ink: "#18181b", muted: "#71717a", border: "#e4e4e7", surface: "#ffffff", rowBg: "#f8fafc", off: "#d4d4d8", knob: "#ffffff", scale: 1.2 },
  build(tl, els, p, ctx) {
    ctx.css("flow/settings-toggle-flow", `
.stf-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.stf { display: grid; gap: 12px; width: 520px; padding: 18px; border-radius: 28px; box-shadow: 0 26px 80px rgba(0,0,0,.1); }
.stf-row { display: flex; align-items: center; justify-content: space-between; min-height: 72px; padding: 0 16px; border-radius: 18px; }
.stf-txt { display: grid; gap: 4px; }
.stf-title { font-size: 18px; font-weight: 700; }
.stf-sub { font-size: 13px; font-weight: 500; }
.stf-sw { position: relative; width: 50px; height: 28px; border-radius: 999px; }
.stf-knob { position: absolute; top: 4px; width: 20px; height: 20px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,.18); }`);
    const t = p.at;
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "stf-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const card = ctx.make(wrap, "div", "card", { cls: "stf", style: { border: `1px solid ${p.border}`, background: p.surface, color: p.ink } });
      const rows = [], ons = [];
      p.rows.forEach((r, i) => {
        const row = ctx.make(card, "div", "row" + (i + 1), { cls: "stf-row", style: { background: p.rowBg } });
        const txt = ctx.make(row, "div", "txt", { cls: "stf-txt" });
        ctx.make(txt, "div", "title", { cls: "stf-title", text: r.title });
        ctx.make(txt, "div", "sub", { cls: "stf-sub", text: r.sub, style: { color: p.muted } });
        const sw = ctx.make(row, "div", "sw", { cls: "stf-sw", style: { background: r.on ? p.ink : p.off } });
        ctx.make(sw, "div", "knob", { cls: "stf-knob", style: { left: (r.on ? 26 : 4) + "px", background: p.knob } });
        rows.push(row); if (r.on) ons.push(sw);
      });
      tl.fromTo(card, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" }, t + 0.28);
      tl.fromTo(rows, { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, stagger: 0.08, ease: "power2.out" }, t + 0.55);
      if (ons.length) tl.fromTo(ons, { scale: 0.92 }, { scale: 1, duration: 0.28, stagger: 0.08, ease: "back.out(1.8)" }, t + 0.88);
    }
  },
});
