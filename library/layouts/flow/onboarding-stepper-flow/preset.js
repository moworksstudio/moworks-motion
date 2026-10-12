/* flow/onboarding-stepper-flow: an onboarding step: a rail of numbered milestones pops in one by one, the step card rises under it, the active milestone gives one pulse.
   Port of HyperFrames registry component onboarding-stepper-flow (layout, colours, sizes and timing as in the source demo; font = the film's font, the source used Inter).
   BLOCK: the target is an empty box (usually the whole frame); the flow is built in its middle and shown `scale` times larger, as the source demo does
   (a wrapper with transform: scale, never tweened). Source timing kept: steps 0.28 s back.out(1.8) stagger 0.08 at 0.3, card 0.42 s power3.out at 0.62,
   active pulse scale 1.16 (yoyo, 0.16 s per half, power1.inOut) at 1.1. */
AIMK.preset("flow/onboarding-stepper-flow", {
  params: { steps: 3, active: 2, small: "Bước 2 / 3", title: "Chọn phong cách hình ảnh", text: "Chọn một hướng đi để trợ lý tạo ra các chuyển động phù hợp.", button: "Tiếp tục",
    ink: "#18181b", onInk: "#ffffff", muted: "#71717a", border: "#e4e4e7", surface: "#ffffff", scale: 2.3 },
  build(tl, els, p, ctx) {
    const plan = [], ft = (tg, a, b, at) => plan.push({ tg, a, b, at });   // fromTo calls are collected and made in time order; a later fromTo on a property an earlier one already animates gets immediateRender: false (as the builder writes it), so the draft equals the film
    const flush = () => { const seen = new Map(), skip = ["duration", "ease", "stagger", "repeat", "yoyo", "immediateRender", "delay"];
      plan.map((q, i) => [q, i]).sort((x, y) => x[0].at - y[0].at || x[1] - y[1]).forEach(([q]) => {
        const arr = Array.isArray(q.tg) ? q.tg : [q.tg], props = Object.keys(q.a).concat(Object.keys(q.b)).filter(k => !skip.includes(k));
        const rep = arr.some(e => { const s = seen.get(e.id); return s && props.some(k => s.has(k)); });
        arr.forEach(e => { const s = seen.get(e.id) || new Set(); props.forEach(k => s.add(k)); seen.set(e.id, s); });
        tl.fromTo(q.tg, q.a, rep ? Object.assign({ immediateRender: false }, q.b) : q.b, q.at); });
      plan.length = 0; };
    ctx.css("flow/onboarding-stepper-flow", `
.onb-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.onb { display: grid; gap: 22px; width: 520px; }
.onb-steps { display: flex; justify-content: center; gap: 18px; }
.onb-step { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 999px; font-size: 15px; font-weight: 600; }
.onb-card { display: grid; gap: 14px; padding: 34px; border-radius: 28px; box-shadow: 0 24px 70px rgba(0,0,0,.1); }
.onb-small { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; }
.onb-title { font-size: 30px; font-weight: 700; line-height: 1.1; }
.onb-text { font-size: 16px; line-height: 1.5; }
.onb-btn { display: flex; align-items: center; justify-self: start; height: 46px; padding: 0 22px; border-radius: 12px; font-size: 15px; font-weight: 600; }`);
    const n = Math.max(1, Math.round(p.steps)), act = Math.min(n, Math.max(1, Math.round(p.active))), t = p.at;
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "onb-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const flow = ctx.make(wrap, "div", "flow", { cls: "onb" });
      const rail = ctx.make(flow, "div", "steps", { cls: "onb-steps" });
      const steps = [];
      for (let i = 0; i < n; i++) {
        const on = i + 1 <= act;
        steps.push(ctx.make(rail, "div", "s" + (i + 1), { cls: "onb-step", text: String(i + 1),
          style: { border: `2px solid ${on ? p.ink : p.border}`, background: on ? p.ink : p.surface, color: on ? p.onInk : p.muted } }));
      }
      const card = ctx.make(flow, "div", "card", { cls: "onb-card", style: { border: `1px solid ${p.border}`, background: p.surface, color: p.ink } });
      ctx.make(card, "div", "small", { cls: "onb-small", text: p.small.toUpperCase(), style: { color: p.muted } });
      ctx.make(card, "div", "title", { cls: "onb-title", text: p.title });
      ctx.make(card, "div", "text", { cls: "onb-text", text: p.text, style: { color: p.muted } });
      ctx.make(card, "div", "btn", { cls: "onb-btn", text: p.button, style: { background: p.ink, color: p.onInk } });
      ft(steps, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.28, stagger: 0.08, ease: "back.out(1.8)" }, t + 0.3);
      ft(card, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, t + 0.62);
      ft(steps[act - 1], { scale: 1 }, { scale: 1.16, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" }, t + 1.1);
    }
    flush();
  },
});
