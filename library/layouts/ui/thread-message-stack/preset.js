/* ui/thread-message-stack: a chat conversation stacking up over a slowly drifting warm gradient. Each message pops in at the bottom (from its own side, with a back-out
   overshoot) and pushes the earlier ones up. Port of HyperFrames registry block thread-message-stack. BLOCK: the target is an empty box (usually the whole frame).
   Source timing kept: first message at 0.25 s, stagger min(0.86, (duration - hold - 0.35) / count), entry 0.28 s back.out(1.45), push 0.24 s power3.out, background
   drift over `duration` (8 s) x -54 / y -22 / scale 1.12 -> 1.18 sine.inOut.
   The source measured each row's height at mount. Fonts are not loaded when a preset builds, so the height is computed instead: bubble = 54.6 px per line + 48 px,
   sender line = 32 px (rounded like offsetHeight), row pitch = max(118, height) + 22 (the source formula). A message is one line unless it holds "\n": break long lines yourself. */
AIMK.preset("ui/thread-message-stack", {
  params: {
    messages: [
      { side: "incoming", text: "ủa khoan, cái này đỉnh thật đó", sender: "Chăm sóc khách hàng" },
      { side: "outgoing", text: "bạn sửa giúp mình được không?" },
      { side: "incoming", text: "tụi mình xử lý xong rồi nè" },
      { side: "outgoing", text: "đỉnh quá trời luôn" },
      { side: "incoming", text: "tối nay nhớ mời anh ấy bữa tối nha" },
      { side: "outgoing", text: "mình đặt bàn rồi" },
    ],
    stagger: 0.86, hold: 1, duration: 8, out_fill: "#2d89e1", out_ink: "#ffffff", in_fill: "rgba(240, 240, 245, 0.82)", in_ink: "#101216",
  },
  build(tl, els, p, ctx) {
    ctx.css("ui/thread-message-stack", `
.uitms { position: absolute; inset: 0; overflow: hidden; background: #2e241a; color: #ffffff; isolation: isolate; box-sizing: border-box; }
.uitms * { box-sizing: border-box; }
.uitms-roll { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 50%; will-change: transform;
  background: radial-gradient(circle at 18% 20%, #f0d3a6 0, transparent 31%), radial-gradient(circle at 75% 18%, #e8a86a 0, transparent 34%),
    radial-gradient(circle at 62% 74%, #2e6a8c 0, transparent 32%), radial-gradient(circle at 18% 82%, #6b4a7a 0, transparent 35%), #2e241a; }
.uitms-scrim { position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 0, rgba(0, 0, 0, 0.18) 42%, rgba(0, 0, 0, 0.38) 100%), linear-gradient(to right, rgba(0, 0, 0, 0.32), rgba(0, 0, 0, 0) 78%); }
.uitms-view { position: absolute; inset: 0; overflow: hidden; -webkit-mask-image: linear-gradient(to bottom, transparent 5%, #000 24%, #000 100%); mask-image: linear-gradient(to bottom, transparent 5%, #000 24%, #000 100%); }
.uitms-col { position: absolute; inset: 0; }
.uitms-row { position: absolute; right: 6%; bottom: 10%; left: 6%; display: flex; flex-direction: column; will-change: transform, opacity; }
.uitms-row.uitms-in { align-items: flex-start; } .uitms-row.uitms-out { align-items: flex-end; }
.uitms-sender { height: 32px; padding: 0 18px 8px; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 24px; white-space: nowrap; text-shadow: 0 3px 12px rgba(0, 0, 0, 0.72); }
.uitms-bubble { max-width: min(72%, 920px); padding: 24px 38px; border-radius: 42px; font-size: 42px; font-weight: 500; letter-spacing: -0.015em; line-height: 54.6px; white-space: pre; }
.uitms-in .uitms-bubble { transform-origin: 0 100%; box-shadow: 0 12px 34px rgba(0, 0, 0, 0.3); }
.uitms-out .uitms-bubble { transform-origin: 100% 100%; box-shadow: 0 12px 38px rgba(0, 0, 0, 0.38); }`);
    const msgs = p.messages || [];
    const avail = Math.max(0.2, p.duration - Math.max(0, p.hold) - 0.35);
    const stagger = msgs.length <= 1 ? 0 : Math.min(Math.max(0, p.stagger), avail / msgs.length);
    const heights = msgs.map(m => Math.max(118, Math.round((m.sender !== undefined ? 32 : 0) + 54.6 * String(m.text).split("\n").length + 48)) + 22);   // offsetHeight rounds
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "uitms" });
      const roll = ctx.make(root, "div", "roll", { cls: "uitms-roll" });
      ctx.make(root, "div", "scrim", { cls: "uitms-scrim" });
      const view = ctx.make(root, "div", "view", { cls: "uitms-view" });
      const col = ctx.make(view, "div", "col", { cls: "uitms-col" });
      const rows = msgs.map((m, i) => {
        const inc = m.side === "incoming";
        const row = ctx.make(col, "div", "m" + i, { cls: "uitms-row " + (inc ? "uitms-in" : "uitms-out") });
        if (m.sender !== undefined) ctx.make(row, "div", "sender", { cls: "uitms-sender", text: m.sender });
        ctx.make(row, "div", "bubble", { cls: "uitms-bubble", text: m.text,
          style: inc ? { color: p.in_ink, background: `linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.05)), ${p.in_fill}` }
                     : { color: p.out_ink, background: `linear-gradient(180deg, rgba(255,255,255,0.2), rgba(0,0,0,0.17)), ${p.out_fill}` } });
        return row;
      });
      const t = p.at;
      tl.fromTo(roll, { x: 0, y: 0, scale: 1.12 }, { x: -54, y: -22, scale: 1.18, duration: p.duration, ease: "sine.inOut" }, t);
      rows.forEach((row, i) => {
        const at = t + 0.25 + i * stagger, dir = msgs[i].side === "incoming" ? -1 : 1;
        tl.fromTo(row, { x: dir * 34, y: 0, scale: 0.94, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.28, ease: "back.out(1.45)" }, at);
        let offset = 0;
        for (let prev = i - 1; prev >= 0; prev--) { offset += heights[prev + 1]; tl.to(rows[prev], { y: -offset, duration: 0.24, ease: "power3.out" }, at); }
      });
    }
  },
});
