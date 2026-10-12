/* flow/toggle-flip: an oversized switch: the stage fades in, the switch squeezes, the knob throws across with an overshoot while the track changes colour, a soft glow pulses
   as it lands, then the glow breathes during the hold and the stage fades out.
   Port of HyperFrames registry component toggle-flip. BLOCK: the switch is built inside the target (an empty box, usually the whole frame). The cqw / cqh sizes of the source
   are taken from that box (size = percent of its width), so the block can also be put into a smaller card as the source demo does.
   Source timing kept (D = params.duration, authored 4 s): stage 0.4 s power2.out, press 0.1 s + 0.1 s (power1.inOut) ending where the flip starts, flip at 0.5 s for 0.25 s
   (knob and track colour back.out(1.9)), knob scale 1.08 yoyo 0.1125 s, glow pulse 0.075 s + 0.075 s after the flip, breathing glow 0.32 (0.75 s per half, sine.inOut,
   floor(HOLD / 0.75) - 1 repeats) from 1.05 s, stage fade out 0.5 s power2.out at D - 0.5. If D < 1.4 s the phases shrink together. */
AIMK.preset("flow/toggle-flip", {
  params: { direction: "on", label: "Tự động lưu", size: 40, duration: 4, bg: "#0b1120", fg: "#f8fafc", surface: "#1e293b", border: "#334155", brand: "#22c55e", accent: "#38bdf8", muted: "#94a3b8", knob: "#f8fafc" },
  build(tl, els, p, ctx) {
    const plan = [], ft = (tg, a, b, at) => plan.push({ tg, a, b, at });   // fromTo calls are collected and made in time order; a later fromTo on a property an earlier one already animates gets immediateRender: false (as the builder writes it), so the draft equals the film
    const flush = () => { const seen = new Map(), skip = ["duration", "ease", "stagger", "repeat", "yoyo", "immediateRender", "delay"];
      plan.map((q, i) => [q, i]).sort((x, y) => x[0].at - y[0].at || x[1] - y[1]).forEach(([q]) => {
        const arr = Array.isArray(q.tg) ? q.tg : [q.tg], props = Object.keys(q.a).concat(Object.keys(q.b)).filter(k => !skip.includes(k));
        const rep = arr.some(e => { const s = seen.get(e.id); return s && props.some(k => s.has(k)); });
        arr.forEach(e => { const s = seen.get(e.id) || new Set(); props.forEach(k => s.add(k)); seen.set(e.id, s); });
        tl.fromTo(q.tg, q.a, rep ? Object.assign({ immediateRender: false }, q.b) : q.b, q.at); });
      plan.length = 0; };
    const hex = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hex(h).join(",")},${+a.toFixed(4)})`;
    const mix = (a, pa, b) => { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v * pa / 100 + y[i] * (100 - pa) / 100).toString(16).padStart(2, "0")).join(""); };
    ctx.css("flow/toggle-flip", `
.tgf-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; display: grid; place-items: center; }
.tgf-stage { display: flex; flex-direction: column; align-items: center; opacity: 0; }
.tgf-label { font-weight: 650; letter-spacing: 0.01em; text-align: center; }
.tgf-toggle { position: relative; display: block; }
.tgf-glow { position: absolute; inset: -14%; border-radius: 999px; opacity: 0; }
.tgf-track { position: absolute; inset: 0; border-radius: 999px; }
.tgf-knob { position: absolute; border-radius: 50%; }`);
    const D = Math.max(0.001, p.duration), IN0 = 0.9, OUT0 = 0.5, sc = D < IN0 + OUT0 ? D / (IN0 + OUT0) : 1;
    const IN = IN0 * sc, OUT = OUT0 * sc, STAGE_IN = 0.4 * sc, PRESS = 0.2 * sc, FLIP_AT = 0.5 * sc, FLIP = 0.25 * sc, GLOW = 0.15 * sc;
    const HOLD = Math.max(0, D - (IN + OUT)), OUT_START = IN + HOLD, SHEEN = 0.75, t = p.at;
    const toOn = p.direction !== "off", f = v => +v.toFixed(4);
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100;
      const size = Math.max(20, Math.min(70, +p.size || 40)), Wt = size * cw, Ht = Wt / 2.2, kw = size * 0.3636 * cw, ko = size * 0.0455 * cw;
      const root = ctx.make(slot, "div", "root", { cls: "tgf-root", style: { background: p.bg, color: p.fg } });
      const stage = ctx.make(root, "div", "stage", { cls: "tgf-stage", style: { gap: f(3 * ch) + "px" } });
      if (String(p.label).length) ctx.make(stage, "div", "label", { cls: "tgf-label", text: p.label, style: { color: p.muted, fontSize: f(Math.min(28, Math.max(12, 2.4 * cw))) + "px" } });
      const tog = ctx.make(stage, "div", "toggle", { cls: "tgf-toggle", style: { width: f(Wt) + "px", height: f(Ht) + "px" } });
      const glow = ctx.make(tog, "div", "glow", { cls: "tgf-glow", style: { background: `radial-gradient(closest-side, ${rgba(p.accent, 0.55)}, rgba(${hex(p.accent).join(",")},0) 72%)` } });
      const ring = `inset 0 0 0 1px ${rgba(p.border, 0.45)}`;
      const track = ctx.make(tog, "div", "track", { cls: "tgf-track", style: { border: `${f(0.15 * cw)}px solid ${p.border}`, background: p.surface, boxShadow: ring } });
      const trackOn = ctx.make(tog, "div", "trackon", { cls: "tgf-track", style: { border: `${f(0.15 * cw)}px solid ${mix(p.border, 60, p.brand)}`, background: p.brand, boxShadow: ring, opacity: toOn ? 0 : 1 } });
      const knob = ctx.make(tog, "div", "knob", { cls: "tgf-knob", style: { top: f(ko) + "px", left: f(ko) + "px", width: f(kw) + "px", height: f(kw) + "px", background: p.knob, boxShadow: `0 ${f(0.35 * cw)}px ${f(0.7 * cw)}px rgba(2,6,23,.4)` } });
      const xf = toOn ? 0 : 150, xt = toOn ? 150 : 0, of = toOn ? 0 : 1, ot = toOn ? 1 : 0;
      ft(stage, { opacity: 0 }, { opacity: 1, duration: f(STAGE_IN), ease: "power2.out" }, t);
      if (PRESS > 0) {
        const ps = Math.max(0, FLIP_AT - PRESS), ph = PRESS / 2;
        ft(tog, { scaleX: 1, scaleY: 1 }, { scaleX: 0.94, scaleY: 1.06, duration: f(ph), ease: "power1.inOut" }, t + f(ps));
        ft(tog, { scaleX: 0.94, scaleY: 1.06 }, { scaleX: 1, scaleY: 1, duration: f(ph), ease: "power1.inOut" }, t + f(ps + ph));
      }
      ft(knob, { xPercent: xf }, { xPercent: xt, duration: f(FLIP), ease: "back.out(1.9)" }, t + f(FLIP_AT));
      ft(trackOn, { opacity: of }, { opacity: ot, duration: f(FLIP), ease: "back.out(1.9)" }, t + f(FLIP_AT));
      ft(knob, { scale: 1 }, { scale: 1.08, duration: f(FLIP * 0.45), ease: "power1.out", yoyo: true, repeat: 1 }, t + f(FLIP_AT));
      ft(glow, { opacity: 0 }, { opacity: 1, duration: f(GLOW * 0.5), ease: "power1.out", yoyo: true, repeat: 1 }, t + f(FLIP_AT + FLIP));
      if (HOLD > SHEEN) ft(glow, { opacity: 0 }, { opacity: 0.32, duration: SHEEN, ease: "sine.inOut", yoyo: true, repeat: Math.max(0, Math.floor(HOLD / SHEEN) - 1) }, t + f(IN + GLOW));
      ft(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.out" }, t + f(OUT_START));
    }
    flush();
  },
});
