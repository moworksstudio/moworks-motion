/* data/animated-bar-chart: a white data card; all bars grow from the baseline together while the trend line draws on (1.2 s, power3.out).
   Port of HyperFrames registry component animated-bar-chart (card, bars and line from the component; header paragraph, footer labels and
   baseline from the component's demo page, which shows it at 1.6x). BLOCK: the card is built inside the target (an empty box, usually the whole frame).
   Source tween: --hf-grow 0 -> 1 and --hf-dash 900 -> 0, duration 1.2 s, ease power3.out, starting at `at` + params.delay (the demo starts it 0.5 s in). */
AIMK.preset("data/animated-bar-chart", {
  params: { title: "Doanh thu theo tháng", sub: "Thẻ dữ liệu gọn, cột lớn dần và đường xu hướng vẽ theo.", value: "+42%",
    values: [42, 72, 56, 88, 64, 95, 78], labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"], ink: "#111827", accent: "#111827", scale: 1.6, delay: 0.5, grow: 1.2, fade: 0 },
  build(tl, els, p, ctx) {
    const t = p.at, n = p.values.length;
    const c = ctx.css, rgb = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, x => x + x) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)).join(","); };
    ctx.css("data/animated-bar-chart", `
.abc { position: absolute; inset: 0; display: grid; place-items: center; }
.abc-card { width: 760px; min-height: 420px; border-radius: 28px; background: #fff; padding: 34px; box-shadow: 0 28px 80px rgba(15,23,42,.16); display: grid; gap: 22px; box-sizing: border-box; transform-origin: 50% 50%; }
.abc-head { display: flex; justify-content: space-between; align-items: end; }
.abc-title { margin: 0; font-size: 34px; letter-spacing: -0.04em; font-weight: 700; }
.abc-sub { margin: 6px 0 0; font-size: 16px; color: #6b7280; font-weight: 400; }
.abc-value { font-size: 54px; letter-spacing: -0.06em; font-weight: 700; }
.abc-bars { height: 210px; display: grid; align-items: end; gap: 14px; }
.abc-bar { border-radius: 14px 14px 5px 5px; }
.abc-foot { display: grid; gap: 6px; }
.abc-svg { width: 100%; height: 180px; overflow: visible; }
.abc-labels { display: grid; text-align: center; font-size: 13px; font-weight: 500; color: #9ca3af; padding: 0 2px; }`);
    for (const slot of els) {
      const wrap = ctx.make(slot, "div", "abc", { cls: "abc" });
      const card = ctx.make(wrap, "div", "card", { cls: "abc-card", style: { color: p.ink, transform: `scale(${p.scale})` } });
      const head = ctx.make(card, "div", "head", { cls: "abc-head" });
      const left = ctx.make(head, "div", "hl");
      ctx.make(left, "div", "title", { cls: "abc-title", text: p.title });
      ctx.make(left, "div", "sub", { cls: "abc-sub", text: p.sub });
      ctx.make(head, "div", "value", { cls: "abc-value", text: p.value, style: { color: p.accent } });
      const bars = ctx.make(card, "div", "bars", { cls: "abc-bars", style: { gridTemplateColumns: `repeat(${n}, 1fr)` } });
      const bl = [];
      p.values.forEach((v, i) => bl.push(ctx.make(bars, "div", "b" + i, { cls: "abc-bar", style: { height: "0px", background: `rgba(${rgb(p.ink)},.72)` } })));
      const foot = ctx.make(card, "div", "foot", { cls: "abc-foot" });
      const svg = ctx.make(foot, "div", "line", { html: `<svg class="abc-svg" viewBox="0 0 700 210"><line x1="20" y1="185" x2="680" y2="185" stroke="#e4e4e7" stroke-width="1.5"/>` +
        `<path id="${foot.id}_line_p" d="M20 172 C120 90, 190 118, 260 74 S430 112, 508 42 S620 82, 680 30" fill="none" stroke="rgba(${rgb(p.ink)},.45)" stroke-width="10" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900"/></svg>` });
      const path = document.getElementById(foot.id + "_line_p");
      ctx.make(foot, "div", "labels", { cls: "abc-labels", html: p.labels.map(s => `<span>${s}</span>`).join(""), style: { gridTemplateColumns: `repeat(${n}, 1fr)` } });
      if (p.fade > 0) tl.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: p.fade, ease: "power2.out" }, t);
      else { tl.set(wrap, { opacity: 0, ease: "none" }, 0); tl.set(wrap, { opacity: 1, ease: "none" }, t); }
      const g = t + p.delay;
      bl.forEach((b, i) => tl.fromTo(b, { height: 0 }, { height: +(210 * p.values[i] / 100).toFixed(2), duration: p.grow, ease: "power3.out" }, g));
      tl.fromTo(path, { strokeDashoffset: 900 }, { strokeDashoffset: 0, duration: p.grow, ease: "power3.out" }, g);
    }
  },
});
