/* compare/before-after-wipe: two full-bleed content panels (your pictures) compare a before and an after state: the before panel is the base, the after panel wipes over it from the left edge in one
   pass and the divider rests at restSplit % for the whole hold. The divider and its handle stay hidden until the wipe starts, then fade in as they leave the left edge. Label chips mark each side.
   Port of HyperFrames registry component before-after-wipe (the divider-wipe of comparison-split on real content slots). BLOCK: built inside the target (an empty box, usually the whole frame);
   cqw / cqh of the source are taken from that box. params.before / params.after are the two pictures (path inside the film's assets); empty = the source's default wireframe card.
   Source envelope kept (D = params.duration, authored 4 s): stage 0.32 s power2.out, wipe 1.05 s sine.inOut from wipeAt (0.25 s), divider fade 0.22 s power1.out at the wipe start, optional exit
   (fade / up -6 cqh) 0.5 s power2.in at D - 0.5; the phases shrink together when D < wipeAt + 1.05 + exit. */
AIMK.preset("compare/before-after-wipe", {
  params: { before: "", after: "", labelA: "Trước", labelB: "Sau", restSplit: 50, wipeAt: 0.25, accent: "#22c55e", exit: "none", duration: 4,
    bg: "#07111f", fg: "#f8fafc", surface: "#172033", border: "#334155", muted: "#94a3b8" },
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
    ctx.css("compare/before-after-wipe", `
.baw-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.baw-stage, .baw-panel { position: absolute; inset: 0; }
.baw-stage { opacity: 0; }
.baw-panel { overflow: hidden; }
.baw-slot { position: absolute; inset: 0; }
.baw-slot > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.baw-default { position: absolute; inset: 0; display: grid; place-items: center; }
.baw-chip { position: absolute; z-index: 4; white-space: nowrap; font-weight: 600; letter-spacing: 0.08em; line-height: 1; }
.baw-div { position: absolute; z-index: 5; top: 0; bottom: 0; pointer-events: none; opacity: 0; }
.baw-knob { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 50%; }`);
    const D = Math.max(0.001, p.duration), exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none", f = v => +v.toFixed(4), t = p.at;
    const rest = Math.max(0, Math.min(100, Number.isFinite(+p.restSplit) ? +p.restSplit : 50)), wa = Math.max(0, Math.min(8, Number.isFinite(+p.wipeAt) ? +p.wipeAt : 0.25));
    const IN0 = wa + 1.05, OUT0 = exitMode === "none" ? 0 : 0.5, sc = D < IN0 + OUT0 ? D / (IN0 + OUT0) : 1, IN = IN0 * sc, OUT = OUT0 * sc, WIPE_AT = wa * sc, WIPE = 1.05 * sc, OUT_START = D - OUT;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100;
      const root = ctx.make(slot, "div", "root", { cls: "baw-root", style: { background: p.bg, color: p.fg } });
      const stage = ctx.make(root, "div", "stage", { cls: "baw-stage" });
      const panel = (name, after, label, img) => {
        const pn = ctx.make(stage, "div", name, { cls: "baw-panel", style: after ? { zIndex: 2, clipPath: "inset(0% 100% 0% 0%)" } : {} });
        const sl = ctx.make(pn, "div", "slot", { cls: "baw-slot" });
        if (img) ctx.make(sl, "img", "img", { attrs: { src: img, alt: "" } });
        else {
          const grid = after ? `linear-gradient(135deg, ${mix(p.accent, 32, p.surface)} 0%, ${p.surface} 58%, ${mix(p.accent, 22, p.surface)} 100%)` :
            `linear-gradient(${rgba(p.border, 0.34)} ${f(0.12 * cw)}px, transparent ${f(0.12 * cw)}px) 0 0 / ${f(5 * cw)}px ${f(5 * cw)}px, linear-gradient(90deg, ${rgba(p.border, 0.34)} ${f(0.12 * cw)}px, transparent ${f(0.12 * cw)}px) 0 0 / ${f(5 * cw)}px ${f(5 * cw)}px, ${p.surface}`;
          const def = ctx.make(sl, "div", "default", { cls: "baw-default", style: { background: grid } });
          const card = ctx.make(def, "div", "card", { style: { width: f(56 * cw) + "px", height: f(56 * ch) + "px", padding: `${f(4 * ch)}px ${f(4 * cw)}px`, border: `${f(0.16 * cw)}px solid ${after ? mix(p.accent, 52, p.border) : p.border}`,
            borderRadius: f(2.4 * cm) + "px", background: after ? mix(p.surface, 86, p.accent) : mix(p.surface, 88, p.bg), boxShadow: `0 ${f(2 * ch)}px ${f(5 * cw)}px ${rgba(p.bg, 0.45)}` } });
          ctx.make(card, "div", "bar", { style: { width: "34%", height: f(4.4 * ch) + "px", marginBottom: f(4 * ch) + "px", borderRadius: f(1.2 * ch) + "px", background: after ? p.accent : p.muted, opacity: after ? 0.92 : 0.5 } });
          [100, 92, 68, 44].slice(1).forEach((w, i) => ctx.make(card, "div", "l" + (i + 1), { style: { width: w + "%", height: f(2.4 * ch) + "px", marginBottom: f(2.6 * ch) + "px", borderRadius: f(1.2 * ch) + "px",
            background: after ? mix(p.accent, 70, p.fg) : p.muted, opacity: after ? 0.75 : 0.4 } }));
        }
        if (String(label).length) ctx.make(pn, "div", "chip", { cls: "baw-chip", text: String(label).toUpperCase(), style: Object.assign({ top: f(4 * ch) + "px", padding: `${f(1.2 * ch)}px ${f(2.2 * cw)}px`,
          border: `${f(0.14 * cw)}px solid ${after ? mix(p.accent, 62, p.border) : p.border}`, borderRadius: "999px", background: mix(p.surface, 88, p.bg), color: after ? p.fg : p.muted, fontSize: f(Math.min(3 * cw, 4.2 * ch)) + "px" },
          after ? { left: f(4 * cw) + "px" } : { right: f(4 * cw) + "px" }) });
        return pn;
      };
      panel("before", false, p.labelA, p.before);
      const after = panel("after", true, p.labelB, p.after);
      const th = 0.4 * cw, kn = Math.min(5 * cw, 7 * ch);
      const div = ctx.make(stage, "div", "divider", { cls: "baw-div", style: { left: f(-th / 2) + "px", width: f(th) + "px", background: p.fg } });
      ctx.make(div, "span", "knob", { cls: "baw-knob", style: { width: f(kn) + "px", height: f(kn) + "px", border: `${f(0.3 * cw)}px solid ${p.accent}`, background: p.fg } });
      ft(stage, { opacity: 0 }, { opacity: 1, duration: f(Math.min(0.32 * sc, IN)), ease: "power2.out" }, t);
      ft(after, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: `inset(0% ${f(100 - rest)}% 0% 0%)`, duration: f(WIPE), ease: "sine.inOut" }, t + f(WIPE_AT));
      ft(div, { x: 0 }, { x: f(rest * cw), duration: f(WIPE), ease: "sine.inOut" }, t + f(WIPE_AT));
      ft(div, { opacity: 0 }, { opacity: 1, duration: f(Math.min(0.22 * sc, WIPE)), ease: "power1.out" }, t + f(WIPE_AT));
      if (exitMode !== "none") {
        ft(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
        if (exitMode === "up") ft(stage, { y: 0 }, { y: f(-6 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
      }
    }
    flush();
  },
});
