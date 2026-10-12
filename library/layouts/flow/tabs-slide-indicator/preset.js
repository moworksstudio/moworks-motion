/* flow/tabs-slide-indicator: a row of tabs with a dark pill that slides from one tab to the next; the label text turns white exactly where the pill covers it.
   Port of HyperFrames registry component tabs-slide-indicator (layout, colours, sizes and timing as in the source; font = the film's font, the source used Inter).
   BLOCK: the target is an empty box (usually the whole frame); the tab row is built in its middle and shown `scale` times larger, as the source demo does
   (a wrapper with transform: scale, never tweened). Source timing kept: the pill slides one tab, 0.42 s power3.inOut, at 0.5.
   The source animates one CSS custom property (--hf-tab-x) that drives the pill and a text-clipped gradient on every label. Here the pill is a plain `x` tween and
   each label has a white copy on top of the grey one that is cut with a clip-path tween: the same pixels, written as ordinary tweens.
   More than one slide: params.slides lists the tab indexes to visit (default [1]); every slide moves exactly one tab, a longer jump is split into one-tab slides. */
AIMK.preset("flow/tabs-slide-indicator", {
  params: { labels: ["Kế hoạch", "Gỡ lỗi", "Hỏi đáp"], accent: "#18181b", width: 86, radius: 999, from: 0, slides: [1], slideAt: 0.5, slideDur: 0.42, every: 1.0,
    track: "#f4f4f5", border: "#e4e4e7", inactive: "#6f6f78", active: "#ffffff", scale: 3.5 },
  build(tl, els, p, ctx) {
    const plan = [], ft = (tg, a, b, at) => plan.push({ tg, a, b, at });   // fromTo calls are collected and made in time order; a later fromTo on a property an earlier one already animates gets immediateRender: false (as the builder writes it), so the draft equals the film
    const flush = () => { const seen = new Map(), skip = ["duration", "ease", "stagger", "repeat", "yoyo", "immediateRender", "delay"];
      plan.map((q, i) => [q, i]).sort((x, y) => x[0].at - y[0].at || x[1] - y[1]).forEach(([q]) => {
        const arr = Array.isArray(q.tg) ? q.tg : [q.tg], props = Object.keys(q.a).concat(Object.keys(q.b)).filter(k => !skip.includes(k));
        const rep = arr.some(e => { const s = seen.get(e.id); return s && props.some(k => s.has(k)); });
        arr.forEach(e => { const s = seen.get(e.id) || new Set(); props.forEach(k => s.add(k)); seen.set(e.id, s); });
        tl.fromTo(q.tg, q.a, rep ? Object.assign({ immediateRender: false }, q.b) : q.b, q.at); });
      plan.length = 0; };
    ctx.css("flow/tabs-slide-indicator", `
.tsi-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.tsi { position: relative; display: inline-grid; padding: 4px; }
.tsi-pill { position: absolute; top: 4px; left: 4px; height: 36px; box-shadow: 0 12px 26px rgba(0,0,0,.18); }
.tsi-tab { position: relative; z-index: 1; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 13.333px; font-weight: 850; white-space: nowrap; }
.tsi-on { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }`);
    let labels = Array.isArray(p.labels) ? p.labels.slice() : String(p.labels).split(",").map(s => s.trim()).filter(Boolean);
    if (labels.length < 2) labels = ["Kế hoạch", "Gỡ lỗi", "Hỏi đáp"];
    const n = labels.length, w = p.width, t = p.at;
    const cl = v => Math.min(n - 1, Math.max(0, Math.round(v)));
    const emptyL = `inset(0px ${w}px 0px 0px)`, emptyR = `inset(0px 0px 0px ${w}px)`, full = "inset(0px 0px 0px 0px)";
    const st = (i, c) => i === c ? full : (i > c ? emptyL : emptyR);          // clip of the white copy of tab i while the pill rests on tab c
    const hops = []; let cur = cl(p.from);
    (Array.isArray(p.slides) ? p.slides : [p.slides]).forEach(to => { to = cl(to); while (cur !== to) { const nx = cur + Math.sign(to - cur); hops.push([cur, nx]); cur = nx; } });
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "tsi-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const track = ctx.make(wrap, "div", "track", { cls: "tsi", style: { gridTemplateColumns: `repeat(${n}, ${w}px)`, border: `1px solid ${p.border}`, borderRadius: p.radius + "px", background: p.track } });
      const pill = ctx.make(track, "div", "pill", { cls: "tsi-pill", style: { width: w + "px", borderRadius: p.radius + "px", background: p.accent } });
      const on = [];
      labels.forEach((lab, i) => {
        const tab = ctx.make(track, "div", "tab" + (i + 1), { cls: "tsi-tab", text: lab, style: { color: p.inactive } });
        on.push(ctx.make(tab, "div", "on", { cls: "tsi-on", text: lab, style: { color: p.active, clipPath: st(i, cl(p.from)) } }));
      });
      hops.forEach(([a, b], j) => {
        const at = t + p.slideAt + j * p.every;
        ft(pill, { x: a * w }, { x: b * w, duration: p.slideDur, ease: "power3.inOut" }, at);
        ft(on[a], { clipPath: st(a, a) }, { clipPath: st(a, b), duration: p.slideDur, ease: "power3.inOut" }, at);
        ft(on[b], { clipPath: st(b, a) }, { clipPath: st(b, b), duration: p.slideDur, ease: "power3.inOut" }, at);
      });
    }
    flush();
  },
});
