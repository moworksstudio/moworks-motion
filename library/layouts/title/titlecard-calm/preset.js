/* title/titlecard-calm: a restrained title card: a small mono kicker rises first, a large headline follows, the lockup drifts barely upward during the hold and leaves with a small rise and fade.
   Port of HyperFrames registry component titlecard-calm. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh / cqmin of the source are taken from that box.
   Source envelope kept (D = params.duration, authored 4 s): kicker 0.5 s power2.out from 2.2 cqh, headline 0.72 s power3.out from 3.2 cqh at 0.28 s, hold drift to -0.65 cqh (sine.inOut over the
   whole hold), exit 0.55 s power2.in to -2.1 cqh with opacity 0 at D - 0.55; IN / OUT shrink together when D < 1.75 s. */
AIMK.preset("title/titlecard-calm", {
  params: { headline: "Ít hơn, nhưng tốt hơn", kicker: "NGUYÊN TẮC THIẾT KẾ", duration: 4, bg: "transparent", fg: "#f7f7f2", muted: "#b8c0cc" },
  build(tl, els, p, ctx) {
    const plan = [], ft = (tg, a, b, at) => plan.push({ tg, a, b, at });   // fromTo calls are collected and made in time order; a later fromTo on a property an earlier one already animates gets immediateRender: false (as the builder writes it), so the draft equals the film
    const flush = () => { const seen = new Map(), skip = ["duration", "ease", "stagger", "repeat", "yoyo", "immediateRender", "delay"];
      plan.map((q, i) => [q, i]).sort((x, y) => x[0].at - y[0].at || x[1] - y[1]).forEach(([q]) => {
        const arr = Array.isArray(q.tg) ? q.tg : [q.tg], props = Object.keys(q.a).concat(Object.keys(q.b)).filter(k => !skip.includes(k));
        const rep = arr.some(e => { const s = seen.get(e.id); return s && props.some(k => s.has(k)); });
        arr.forEach(e => { const s = seen.get(e.id) || new Set(); props.forEach(k => s.add(k)); seen.set(e.id, s); });
        tl.fromTo(q.tg, q.a, rep ? Object.assign({ immediateRender: false }, q.b) : q.b, q.at); });
      plan.length = 0; };
    ctx.css("title/titlecard-calm", `
.tcc-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; display: grid; place-items: center; }
.tcc-lock { display: flex; flex-direction: column; align-items: flex-start; transform-origin: 50% 50%; }
.tcc-kicker { display: block; width: 100%; font-family: "RMono", Consolas, "Cascadia Mono", Menlo, "SF Mono", "DejaVu Sans Mono", monospace; font-weight: 600; line-height: 1; letter-spacing: 0.18em; }
.tcc-head { display: block; width: 100%; font-weight: 600; line-height: 0.94; letter-spacing: -0.055em; overflow-wrap: anywhere; text-wrap: balance; }`);
    const D = Math.max(0.001, p.duration), IN0 = 1.2, OUT0 = 0.55, sc = D < IN0 + OUT0 ? D / (IN0 + OUT0) : 1;
    const IN = IN0 * sc, OUT = OUT0 * sc, HOLD = Math.max(0, D - IN - OUT), OUT_START = IN + HOLD, f = v => +v.toFixed(4), t = p.at;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100;
      const root = ctx.make(slot, "div", "root", { cls: "tcc-root", style: { background: p.bg, color: p.fg } });
      const lock = ctx.make(root, "div", "lockup", { cls: "tcc-lock", style: { width: f(78 * cw) + "px", gap: f(6 * ch) + "px" } });
      const kick = ctx.make(lock, "div", "kicker", { cls: "tcc-kicker", text: String(p.kicker).toUpperCase(), style: { color: p.muted, fontSize: f(3.2 * cm) + "px" } });
      const head = ctx.make(lock, "div", "headline", { cls: "tcc-head", text: p.headline, style: { color: p.fg, fontSize: f(17 * cm) + "px" } });
      ft(kick, { opacity: 0, y: f(2.2 * ch) }, { opacity: 1, y: 0, duration: f(0.5 * sc), ease: "power2.out" }, t);
      ft(head, { opacity: 0, y: f(3.2 * ch) }, { opacity: 1, y: 0, duration: f(0.72 * sc), ease: "power3.out" }, t + f(0.28 * sc));
      if (HOLD > 0) ft(lock, { y: 0 }, { y: f(-0.65 * ch), duration: f(HOLD), ease: "sine.inOut" }, t + f(IN));
      ft(lock, { opacity: 1, y: HOLD > 0 ? f(-0.65 * ch) : 0 }, { opacity: 0, y: f(-2.1 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
    }
    flush();
  },
});
