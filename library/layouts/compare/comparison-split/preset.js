/* compare/comparison-split: two full-bleed treatments share one frame: the muted "before" panel is the base, the vivid "after" panel wipes over it from the leading edge, a persistent divider with a
   round handle marks the clip boundary and rests at the split position for the whole hold.
   Port of HyperFrames registry component comparison-split. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh of the source are taken from that box.
   Source envelope kept (D = params.duration, authored 4 s): stage 0.32 s power2.out, wipe 1.05 s sine.inOut from 0.25 s (clip and divider move together, 0 -> split), release fade 0.5 s power2.out
   at D - 0.5; the phases shrink together when D < 1.9 s. orientation: horizontal (vertical divider, left -> right) or vertical (horizontal divider, top -> bottom).
   The panels hold the source's wireframe windows (toolbar dots, text lines, a blob) unless params.imageA / imageB give a picture. */
AIMK.preset("compare/comparison-split", {
  params: { split: 50, orientation: "horizontal", labelA: "Trước", labelB: "Sau", imageA: "", imageB: "", duration: 4,
    bg: "#07111f", fg: "#f8fafc", surface: "#172033", border: "#40506b", muted: "#94a3b8", accent: "#e4e4e7" },
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
    ctx.css("compare/comparison-split", `
.cmp-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.cmp-stage, .cmp-panel { position: absolute; inset: 0; }
.cmp-stage { opacity: 0; }
.cmp-panel > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.cmp-win { position: absolute; overflow: hidden; }
.cmp-bar { display: flex; align-items: center; }
.cmp-dot { border-radius: 50%; flex: none; }
.cmp-content { position: relative; }
.cmp-copy { position: absolute; }
.cmp-blob { position: absolute; }
.cmp-label { position: absolute; z-index: 4; white-space: nowrap; font-weight: 700; letter-spacing: 0.08em; line-height: 1; }
.cmp-div { position: absolute; z-index: 5; pointer-events: none; }
.cmp-knob { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 50%; }`);
    const D = Math.max(0.001, p.duration), IN0 = 1.4, OUT0 = 0.5, sc = D < IN0 + OUT0 ? D / (IN0 + OUT0) : 1, IN = IN0 * sc, OUT = OUT0 * sc, HOLD = Math.max(0, D - (IN + OUT)), OUT_START = IN + HOLD;
    const split = Math.max(0, Math.min(100, Number.isFinite(+p.split) ? +p.split : 50)), vert = p.orientation === "vertical", f = v => +v.toFixed(4), t = p.at;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100;
      const sp1 = 1.2 * cw, sp2 = 2.4 * cw, sp3 = 4 * cw;                       // the source demo's spacing tokens (--space-1 / 2 / 3, in cqw)
      const root = ctx.make(slot, "div", "root", { cls: "cmp-root", style: { background: p.bg, color: p.fg } });
      const stage = ctx.make(root, "div", "stage", { cls: "cmp-stage" });
      const panel = (name, after, label, img) => {
        const pn = ctx.make(stage, "div", name, { cls: "cmp-panel", style: after ? { zIndex: 2, background: mix(p.fg, 18, p.surface) } :
          { background: `linear-gradient(${rgba(p.border, 0.38)} ${f(0.12 * cw)}px, transparent ${f(0.12 * cw)}px) 0 0 / ${f(5 * cw)}px ${f(5 * cw)}px, linear-gradient(90deg, ${rgba(p.border, 0.38)} ${f(0.12 * cw)}px, transparent ${f(0.12 * cw)}px) 0 0 / ${f(5 * cw)}px ${f(5 * cw)}px, ${p.surface}` } });
        const lab = ctx.make(pn, "div", "label", { cls: "cmp-label", text: String(label).toUpperCase(), style: Object.assign({ padding: `${f(sp1)}px ${f(sp2)}px`, border: `${f(0.14 * cw)}px solid ${after ? rgba(p.fg, 0.45) : p.border}`,
          borderRadius: "999px", background: after ? mix(p.fg, 8, p.surface) : p.surface, color: after ? p.fg : p.muted, fontSize: f(Math.min(3 * cw, 4.2 * ch)) + "px" },
          after ? { left: f(sp3) + "px", top: f(sp3) + "px" } : (vert ? { right: f(sp3) + "px", bottom: f(sp3) + "px" } : { right: f(sp3) + "px", top: f(sp3) + "px" })) });
        if (img) { ctx.make(pn, "img", "img", { attrs: { src: img, alt: "" } }); return pn; }
        const win = ctx.make(pn, "div", "win", { cls: "cmp-win", style: { left: f(14 * cw) + "px", top: f(18 * ch) + "px", width: f(72 * cw) + "px", height: f(64 * ch) + "px", borderRadius: f(Math.min(3 * cw, 5 * ch)) + "px",
          border: `${f(0.16 * cw)}px solid ${after ? rgba(p.fg, 0.45) : p.border}`, background: after ? mix(p.fg, 8, p.surface) : mix(p.surface, 90, p.muted),
          boxShadow: after ? `0 ${f(2.2 * ch)}px ${f(7 * cw)}px rgba(0,0,0,.18)` : `0 ${f(2.2 * ch)}px ${f(6 * cw)}px ${rgba(p.bg, 0.5)}` } });
        const bar = ctx.make(win, "div", "bar", { cls: "cmp-bar", style: { gap: f(sp1) + "px", height: f(12 * ch) + "px", padding: `0 ${f(sp2)}px`, borderBottom: `${f(0.14 * cw)}px solid ${p.border}` } });
        for (let i = 1; i <= 3; i++) ctx.make(bar, "span", "d" + i, { cls: "cmp-dot", style: { width: f(Math.min(2.2 * cw, 3.2 * ch)) + "px", height: f(Math.min(2.2 * cw, 3.2 * ch)) + "px", background: after ? p.accent : p.muted, opacity: after ? 1 : 0.55 } });
        const content = ctx.make(win, "div", "content", { cls: "cmp-content", style: { height: f(52 * ch) + "px" } });
        const copy = ctx.make(content, "div", "copy", { cls: "cmp-copy", style: { left: f(7 * cw) + "px", top: f(9 * ch) + "px", width: f(31 * cw) + "px" } });
        [94, 72, 48].forEach((w, i) => ctx.make(copy, "div", "l" + (i + 1), { style: { width: w + "%", height: f(2.3 * ch) + "px", marginBottom: f(sp2) + "px", borderRadius: f(2 * ch) + "px",
          background: after ? rgba(p.fg, 0.72) : p.muted, opacity: after ? 1 : 0.48 } }));
        const vs = Math.min(22 * cw, 32 * ch);
        ctx.make(content, "div", "blob", { cls: "cmp-blob", style: { right: f(7 * cw) + "px", top: f(7 * ch) + "px", width: f(vs) + "px", height: f(vs) + "px", borderRadius: "36% 64% 58% 42%", border: `${f(0.3 * cw)}px solid ${after ? rgba(p.fg, 0.45) : p.border}`,
          background: after ? rgba(p.fg, 0.72) : p.muted, boxShadow: after ? `0 0 ${f(5 * cw)}px rgba(0,0,0,.18)` : "none", opacity: after ? 1 : 0.5 } });
        return pn;
      };
      panel("before", false, p.labelA, p.imageA);
      const after = panel("after", true, p.labelB, p.imageB);
      after.style.clipPath = vert ? "inset(0% 0% 100% 0%)" : "inset(0% 100% 0% 0%)";
      const th = 0.45 * (vert ? ch : cw), kn = Math.min(5 * cw, 7 * ch);
      const div = ctx.make(stage, "div", "divider", { cls: "cmp-div", style: Object.assign({ background: p.fg, boxShadow: `0 0 ${f(1.4 * cw)}px ${rgba(p.fg, 0.45)}, 0 0 ${f(3 * cw)}px rgba(0,0,0,.45)` },
        vert ? { left: "0px", right: "0px", top: f(-th / 2) + "px", height: f(th) + "px" } : { top: "0px", bottom: "0px", left: f(-th / 2) + "px", width: f(th) + "px" }) });
      ctx.make(div, "span", "knob", { cls: "cmp-knob", style: { width: f(kn) + "px", height: f(kn) + "px", border: `${f(0.3 * cw)}px solid ${p.bg}`, background: p.fg, boxShadow: `0 0 ${f(2.2 * cw)}px ${rgba(p.fg, 0.45)}` } });
      ft(stage, { opacity: 0 }, { opacity: 1, duration: f(0.32 * sc), ease: "power2.out" }, t);
      ft(after, { clipPath: vert ? "inset(0% 0% 100% 0%)" : "inset(0% 100% 0% 0%)" }, { clipPath: vert ? `inset(0% 0% ${f(100 - split)}% 0%)` : `inset(0% ${f(100 - split)}% 0% 0%)`, duration: f(1.05 * sc), ease: "sine.inOut" }, t + f(0.25 * sc));
      ft(div, vert ? { y: 0 } : { x: 0 }, Object.assign(vert ? { y: f(split * ch) } : { x: f(split * cw) }, { duration: f(1.05 * sc), ease: "sine.inOut" }), t + f(0.25 * sc));
      ft(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.out" }, t + f(OUT_START));
    }
    flush();
  },
});
