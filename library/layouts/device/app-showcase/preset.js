/* device/app-showcase: a fitness-app showcase with three phones: the centre phone (dashboard) pops up (back.out), the two side phones fan out
   from behind it (x +-340, rotation +-12, expo.out); then the weekly-goal ring fills to 2/3, three activity bars grow, the calorie graph draws
   on with its area and dots, the left phone's tagline and button rise in, the whole stage pushes in 2 %, and the lime accents pulse once.
   Port of HyperFrames registry block app-showcase (5.5 s). BLOCK: the target is an empty box (designed for a 1920 x 1080 frame).
   Every tween is the source's, written literally (gsap.set start states -> fromTo; the dot stagger with its power2.in ease -> 7 tweens). */
AIMK.preset("device/app-showcase", {
  params: {
    tagline: "Bứt phá giới hạn", cta: "BẮT ĐẦU",
    initials: "MA", name: "Minh Anh", member: "Thành viên cao cấp",
    goal_label: "Mục tiêu tuần", goal_done: 2, goal_total: 3, days: ["2", "3", "4", "5", "6", "7", "CN"],
    progress_title: "Tiến độ của bạn", progress_link: "Xem tất cả",
    bars: [{ name: "Chạy bộ", value: "5,2 km", width: "75%" }, { name: "Đạp xe", value: "12,8 km", width: "50%" }, { name: "Sức mạnh", value: "45 phút", width: "90%" }],
    cal_title: "Calo đã đốt", cal_value: "740", cal_unit: "kcal", week: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    stats: [{ label: "Vận động", value: "540" }, { label: "Nghỉ", value: "200" }],
    accent: "#e4fa72",
  },
  build(tl, els, p, ctx) {
    const t0 = p.at, A = p.accent;
    const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    ctx.css("device/app-showcase", `
.aimk-as { position: absolute; inset: 0; overflow: hidden; font-family: inherit; color: #271f15; }
.aimk-as .s3-bg { position: absolute; inset: 0; background: linear-gradient(160deg, #f1f2ec 0%, #e8ecda 40%, #f1f2ec 100%); }
.aimk-as .s3-bg-glow { position: absolute; width: 900px; height: 900px; top: 90px; left: 510px; background: radial-gradient(circle, rgba(228, 250, 114, 0.18) 0%, transparent 70%); border-radius: 50%; }
.aimk-as .s3-stage { position: absolute; inset: 0; transform-origin: center center; }
.aimk-as .s3-phone { position: absolute; width: 320px; height: 650px; top: 215px; left: 800px; }
.aimk-as .s3-phone-center { z-index: 30; } .aimk-as .s3-phone-left, .aimk-as .s3-phone-right { z-index: 20; }
.aimk-as .s3-bezel { width: 100%; height: 100%; border-radius: 42px; background: #271f15; padding: 8px; box-shadow: 0 24px 64px rgba(39, 31, 21, 0.35), 0 4px 16px rgba(39, 31, 21, 0.15); position: relative; overflow: hidden; }
.aimk-as .s3-notch { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 100px; height: 26px; background: #271f15; border-radius: 0 0 18px 18px; z-index: 5; }
.aimk-as .s3-screen { width: 100%; height: 100%; border-radius: 36px; overflow: hidden; position: relative; }
.aimk-as .s3-screen-left { background: linear-gradient(160deg, #d9e0bc 0%, #c8d4a0 50%, #b8c78a 100%); display: flex; flex-direction: column; justify-content: flex-end; }
.aimk-as .left-shapes { position: absolute; top: 40px; left: 0; width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; }
.aimk-as .left-shapes svg { width: 200px; height: 280px; }
.aimk-as .left-bottom { padding: 0 28px 40px; position: relative; z-index: 2; }
.aimk-as .left-tagline { font-size: 28px; font-weight: 700; color: #271f15; line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.02em; }
.aimk-as .left-cta { display: inline-block; background: #271f15; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; padding: 10px 28px; border-radius: 24px; }
.aimk-as .s3-screen-center { background: #1a1a1a; padding: 42px 22px 22px; display: flex; flex-direction: column; gap: 18px; }
.aimk-as .center-header { display: flex; align-items: center; gap: 10px; }
.aimk-as .center-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #271f15; flex-shrink: 0; }
.aimk-as .center-user-info { flex: 1; }
.aimk-as .center-name { font-size: 18px; font-weight: 700; color: #f1f2ec; line-height: 1.2; }
.aimk-as .center-subtitle { font-size: 12px; font-weight: 400; color: #7c857c; margin-top: 1px; }
.aimk-as .center-bell { flex-shrink: 0; }
.aimk-as .center-goal { background: #242424; border-radius: 20px; padding: 18px 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.aimk-as .goal-label { font-size: 15px; font-weight: 500; color: #7c857c; align-self: flex-start; }
.aimk-as .goal-ring-wrap { position: relative; width: 130px; height: 130px; }
.aimk-as .goal-ring { width: 100%; height: 100%; }
.aimk-as .ring-track { opacity: 0.3; }
.aimk-as .goal-count { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }
.aimk-as .goal-num { font-size: 36px; font-weight: 700; }
.aimk-as .goal-sep { font-size: 24px; font-weight: 400; color: #7c857c; margin: 0 2px; }
.aimk-as .goal-den { font-size: 24px; font-weight: 400; color: #7c857c; }
.aimk-as .goal-days { display: flex; gap: 8px; }
.aimk-as .day { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: #7c857c; background: #1a1a1a; }
.aimk-as .day.done { color: #271f15; font-weight: 700; }
.aimk-as .center-progress { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.aimk-as .progress-header { display: flex; justify-content: space-between; align-items: center; }
.aimk-as .progress-title { font-size: 15px; font-weight: 500; color: #f1f2ec; }
.aimk-as .progress-link { font-size: 12px; font-weight: 400; }
.aimk-as .progress-bars { display: flex; flex-direction: column; gap: 12px; }
.aimk-as .bar-row { display: flex; align-items: center; gap: 10px; }
.aimk-as .bar-icon { width: 28px; height: 28px; border-radius: 8px; background: #2a2a2a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aimk-as .bar-info { width: 70px; flex-shrink: 0; }
.aimk-as .bar-name { display: block; font-size: 12px; font-weight: 500; color: #f1f2ec; line-height: 1.2; white-space: nowrap; }
.aimk-as .bar-val { display: block; font-size: 10px; font-weight: 400; color: #7c857c; white-space: nowrap; }
.aimk-as .bar-track { flex: 1; height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden; }
.aimk-as .bar-value { height: 100%; border-radius: 4px; width: 0%; }
.aimk-as .s3-screen-right { background: #f1f2ec; padding: 42px 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.aimk-as .right-header { display: flex; flex-direction: column; gap: 4px; }
.aimk-as .right-title { font-size: 14px; font-weight: 500; color: #7c857c; }
.aimk-as .right-value { font-size: 40px; font-weight: 700; color: #271f15; line-height: 1; letter-spacing: -0.03em; }
.aimk-as .right-unit { font-size: 20px; font-weight: 400; color: #7c857c; }
.aimk-as .right-graph-wrap { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.aimk-as .right-graph { width: 100%; flex: 1; }
.aimk-as .right-labels { display: flex; justify-content: space-between; padding: 0 6px; font-size: 10px; font-weight: 400; color: #7c857c; }
.aimk-as .right-stats { display: flex; gap: 12px; }
.aimk-as .stat-pill { display: flex; align-items: center; gap: 6px; background: #e8ecda; border-radius: 20px; padding: 8px 14px; }
.aimk-as .stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.aimk-as .stat-label { font-size: 12px; font-weight: 400; color: #7c857c; }
.aimk-as .stat-num { font-size: 13px; font-weight: 700; color: #271f15; }`);
    const PTS = [[10, 105], [50, 80], [90, 90], [130, 45], [170, 60], [210, 25], [250, 35]];
    for (const slot of els) {
      const wrap = ctx.make(slot, "div", "as", { cls: "aimk-as" }), id = wrap.id;
      const bg = ctx.make(wrap, "div", "bg", { cls: "s3-bg" });
      const glow = ctx.make(wrap, "div", "glow", { cls: "s3-bg-glow" });
      const stage = ctx.make(wrap, "div", "stage", { cls: "s3-stage" });
      const bez = (ph, screenCls, inner) => { const b = ctx.make(ph, "div", "bez", { cls: "s3-bezel" }); ctx.make(b, "div", "notch", { cls: "s3-notch" }); return ctx.make(b, "div", "screen", { cls: "s3-screen " + screenCls, html: inner }); };
      const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#271f15" stroke-width="6" stroke-linecap="round" opacity="0.15"/>`;
      const left = ctx.make(stage, "div", "left", { cls: "s3-phone s3-phone-left" });
      bez(left, "s3-screen-left", `<div class="left-shapes"><svg viewBox="0 0 304 400" xmlns="http://www.w3.org/2000/svg" fill="none"><circle cx="152" cy="80" r="28" fill="#271f15" opacity="0.15"/>`
        + line(152, 108, 152, 200) + line(152, 145, 115, 175) + line(152, 145, 195, 165) + line(152, 200, 120, 260) + line(152, 200, 190, 255)
        + `<path d="M60 300 Q152 240 244 300" stroke="${A}" stroke-width="3" fill="none" opacity="0.5"/><path d="M40 330 Q152 260 264 330" stroke="${A}" stroke-width="2" fill="none" opacity="0.3"/></svg></div>`
        + `<div class="left-bottom"><div id="${id}_tagline" class="left-tagline">${esc(p.tagline)}</div><div id="${id}_cta" class="left-cta" style="color: ${A}">${esc(p.cta)}</div></div>`);
      const center = ctx.make(stage, "div", "center", { cls: "s3-phone s3-phone-center" });
      const icons = [`<path d="M8 2l1.5 3H13l-2.5 2 1 3L8 8.5 4.5 10l1-3L3 5h3.5z" fill="${A}"/>`, `<circle cx="8" cy="8" r="5" stroke="${A}" stroke-width="2"/>`,
        `<rect x="3" y="6" width="10" height="6" rx="1" stroke="${A}" stroke-width="1.5"/><path d="M6 6V4a2 2 0 014 0v2" stroke="${A}" stroke-width="1.5"/>`];
      bez(center, "s3-screen-center",
        `<div class="center-header"><div class="center-avatar" style="background: linear-gradient(135deg, ${A}, #d9e0bc)">${esc(p.initials)}</div><div class="center-user-info"><div class="center-name">${esc(p.name)}</div><div class="center-subtitle">${esc(p.member)}</div></div>`
        + `<div class="center-bell"><svg viewBox="0 0 20 20" width="20" height="20" fill="none"><path d="M10 2a5 5 0 00-5 5v3l-1.5 2.5h13L15 10V7a5 5 0 00-5-5z" stroke="#7c857c" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 16.5a2 2 0 004 0" stroke="#7c857c" stroke-width="1.4" stroke-linecap="round"/><circle cx="14" cy="5" r="3" fill="${A}"/></svg></div></div>`
        + `<div class="center-goal"><div class="goal-label">${esc(p.goal_label)}</div><div class="goal-ring-wrap"><svg class="goal-ring" viewBox="0 0 140 140"><circle class="ring-track" cx="70" cy="70" r="52" fill="none" stroke="#333" stroke-width="10"/>`
        + `<circle id="${id}_ring" class="ring-fill" cx="70" cy="70" r="52" fill="none" stroke="${A}" stroke-width="10" stroke-linecap="round" transform="rotate(-90 70 70)"/></svg>`
        + `<div class="goal-count"><span class="goal-num" style="color: ${A}">${esc(p.goal_done)}</span><span class="goal-sep">/</span><span class="goal-den">${esc(p.goal_total)}</span></div></div>`
        + `<div class="goal-days">${p.days.map((d, i) => `<span class="day${i < p.goal_done ? " done" : ""}"${i < p.goal_done ? ` style="background: ${A}"` : ""}>${esc(d)}</span>`).join("")}</div></div>`
        + `<div class="center-progress"><div class="progress-header"><span class="progress-title">${esc(p.progress_title)}</span><span class="progress-link" style="color: ${A}">${esc(p.progress_link)}</span></div><div class="progress-bars">`
        + p.bars.slice(0, 3).map((b, i) => `<div class="bar-row"><div class="bar-icon"><svg viewBox="0 0 16 16" width="14" height="14" fill="none">${icons[i]}</svg></div><div class="bar-info"><span class="bar-name">${esc(b.name)}</span><span class="bar-val">${esc(b.value)}</span></div>`
          + `<div class="bar-track"><div id="${id}_bar${i}" class="bar-value" style="background: ${A}"></div></div></div>`).join("") + `</div></div>`);
      const right = ctx.make(stage, "div", "right", { cls: "s3-phone s3-phone-right" });
      const grid = [25, 55, 85, 115].map(y => `<line x1="10" y1="${y}" x2="250" y2="${y}" stroke="#d9e0bc" stroke-width="0.5" opacity="0.5"/>`).join("");
      bez(right, "s3-screen-right",
        `<div class="right-header"><div class="right-title">${esc(p.cal_title)}</div><div class="right-value">${esc(p.cal_value)} <span class="right-unit">${esc(p.cal_unit)}</span></div></div>`
        + `<div class="right-graph-wrap"><svg class="right-graph" viewBox="0 0 260 130" xmlns="http://www.w3.org/2000/svg">${grid}`
        + `<path id="${id}_area" d="M10,105 L50,80 90,90 130,45 170,60 210,25 250,35 250,115 10,115 Z" fill="${A}" opacity="0.15"/>`
        + `<polyline id="${id}_gline" points="${PTS.map(q => q.join(",")).join(" ")}" fill="none" stroke="${A}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
        + PTS.map((q, i) => `<circle id="${id}_dot${i}" cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${A}"/>`).join("") + `</svg>`
        + `<div class="right-labels">${p.week.map(w => `<span>${esc(w)}</span>`).join("")}</div></div>`
        + `<div class="right-stats">${p.stats.slice(0, 2).map((s, i) => `<div class="stat-pill"><span class="stat-dot" style="background: ${i ? "#7c857c" : A}"></span><span class="stat-label">${esc(s.label)}</span><span class="stat-num">${esc(s.value)}</span></div>`).join("")}</div>`);
      const $ = n => document.getElementById(id + "_" + n);
      const ring = $("ring"), gline = $("gline"), area = $("area"), bars = [0, 1, 2].map(i => $("bar" + i)), dots = PTS.map((q, i) => $("dot" + i));
      const LEN = +gline.getTotalLength().toFixed(3), CIRC = 2 * 3.14159265 * 52;
      const fr = Math.max(0, Math.min(1, (+p.goal_done || 0) / (+p.goal_total || 1)));
      /* BUILD (0-2 s) */
      tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out" }, t0);
      tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power1.out" }, t0 + 0.2);
      tl.fromTo(center, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.4)" }, t0 + 0.2);
      tl.fromTo(left, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "back.out(1.4)" }, t0 + 0.3);
      tl.fromTo(left, { x: 0, rotation: 0 }, { x: -340, rotation: -12, duration: 1.2, ease: "expo.out" }, t0 + 0.3);
      tl.fromTo(right, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "back.out(1.4)" }, t0 + 0.4);
      tl.fromTo(right, { x: 0, rotation: 0 }, { x: 340, rotation: 12, duration: 1.2, ease: "expo.out" }, t0 + 0.4);
      /* BREATHE (2-4 s) */
      tl.fromTo(ring, { strokeDasharray: CIRC, strokeDashoffset: CIRC }, { strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - fr), duration: 1.2, ease: "circ.out" }, t0 + 1.8);
      p.bars.slice(0, 3).forEach((b, i) => tl.fromTo(bars[i], { width: "0%" }, { width: b.width, duration: 0.8, ease: "power3.out" }, t0 + 2.1 + i * 0.2));
      tl.fromTo(gline, { strokeDasharray: LEN, strokeDashoffset: LEN }, { strokeDasharray: LEN, strokeDashoffset: 0, duration: 1.4, ease: "sine.inOut" }, t0 + 2.0);
      tl.fromTo(area, { opacity: 0 }, { opacity: 0.15, duration: 0.8, ease: "power1.out" }, t0 + 2.6);
      dots.forEach((d, i) => tl.fromTo(d, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t0 + 3.0 + +(0.36 * (i / 6) * (i / 6)).toFixed(4)));
      tl.fromTo($("tagline"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, t0 + 2.2);
      tl.fromTo($("cta"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, t0 + 2.5);
      tl.fromTo(stage, { scale: 1 }, { scale: 1.02, duration: 3.5, ease: "sine.inOut" }, t0 + 2.0);
      /* RESOLVE (4-5.5 s): accent pulse */
      tl.fromTo(ring, { opacity: 1 }, { opacity: 0.65, duration: 0.6, ease: "sine.inOut" }, t0 + 4.0);
      tl.to(ring, { opacity: 1, duration: 0.6, ease: "sine.inOut" }, t0 + 4.6);
      bars.forEach(b => { tl.fromTo(b, { opacity: 1 }, { opacity: 0.7, duration: 0.6, ease: "sine.inOut" }, t0 + 4.1); tl.to(b, { opacity: 1, duration: 0.6, ease: "sine.inOut" }, t0 + 4.7); });
      tl.fromTo(gline, { opacity: 1 }, { opacity: 0.65, duration: 0.6, ease: "sine.inOut" }, t0 + 4.05);
      tl.to(gline, { opacity: 1, duration: 0.6, ease: "sine.inOut" }, t0 + 4.65);
    }
  },
});
