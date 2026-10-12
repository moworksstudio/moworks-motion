/* flow/ui-focus-zoom: a full app surface settles in, then the camera zooms and pans to an anchored region and holds there; a soft glow blooms at the anchor as the camera arrives.
   Port of HyperFrames registry component ui-focus-zoom. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh / cqmin of the source are taken from that
   box (custom properties --cw / --ch / --cm hold one percent of its width / height / short side).
   Camera-servo law as in the source: all camera motion is ONE transform on a world wrapper, translate(x %, y %) scale(S), so a point offset o from the centre lands at S x o + T with
   T = -(anchor - 50) x S, clamped so the scaled world always covers the frame (|T| <= 50 (S - 1) - 0.36). It is written as one tween on the wrapper (xPercent, yPercent, scale).
   Source timing kept (D = params.duration, authored 4.5 s): settle IN = 0.9 s (rise 4.5 %, scale 0.965 -> 1, opacity, power3.out), camera 1.1 s power2.inOut at zoomAt (1.4 s, clamped
   inside the hold), halo 0.75 s power2.out starting halfway through the camera move, optional exit (fade / up) 0.5 s; phases shrink together when D is short.
   The surface is a skeleton app (header bar, sidebar, three cards) unless params.image is set. */
AIMK.preset("flow/ui-focus-zoom", {
  params: { anchorX: 64, anchorY: 36, zoom: 1.6, zoomAt: 1.4, halo: true, accent: "#71f5a7", exit: "none", duration: 4.5, image: "",
    bg: "transparent", base: "#05070c", fg: "#f8fafc", surface: "#0b1016", border: "#475569", shadow: "#000000", radius: 0 },
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
    ctx.css("flow/ui-focus-zoom", `
.ufz-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; display: grid; place-items: center; }
.ufz-stage { position: relative; width: 100%; height: 100%; transform-origin: 50% 60%; }
.ufz-frame { position: absolute; inset: 0; overflow: hidden; }
.ufz-world { position: absolute; inset: 0; }
.ufz-surface { position: absolute; inset: 0; overflow: hidden; }
.ufz-surface > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.ufz-halo { position: absolute; z-index: 2; border-radius: 50%; }
.ufz-skel { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
.ufz-top { display: flex; align-items: center; gap: calc(var(--cm) * 1.6); padding: calc(var(--cm) * 1.8) calc(var(--cm) * 2.6); border-bottom: calc(var(--cm) * 0.14) solid var(--ubd55); }
.ufz-mark { width: calc(var(--cm) * 2.6); height: calc(var(--cm) * 2.6); border-radius: calc(var(--cm) * 0.8); background: var(--umark); }
.ufz-line { height: calc(var(--cm) * 1.25); border-radius: 999px; background: var(--uf13); }
.ufz-spring { flex: 1; }
.ufz-chip { width: calc(var(--cm) * 8.5); height: calc(var(--cm) * 2.9); border: calc(var(--cm) * 0.14) solid var(--ua55); border-radius: 999px; background: var(--ua28); }
.ufz-avatar { width: calc(var(--cm) * 2.8); height: calc(var(--cm) * 2.8); border-radius: 50%; background: var(--uf18); }
.ufz-body { display: grid; grid-template-columns: 22% minmax(0, 1fr); min-height: 0; }
.ufz-side { display: flex; flex-direction: column; gap: calc(var(--cm) * 2); padding: calc(var(--cm) * 2.6); border-right: calc(var(--cm) * 0.14) solid var(--ubd55); }
.ufz-main { display: flex; flex-direction: column; gap: calc(var(--cm) * 1.8); min-height: 0; padding: calc(var(--cm) * 2.8); }
.ufz-heading { width: 34%; height: calc(var(--cm) * 2.5); border-radius: 999px; background: var(--uf21); }
.ufz-sub { width: 52%; height: calc(var(--cm) * 1.25); border-radius: 999px; background: var(--uf09); }
.ufz-cards { display: grid; flex: 1; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(var(--cm) * 2.1); min-height: 0; margin-top: calc(var(--cm) * 0.8); }
.ufz-card { display: flex; flex-direction: column; gap: calc(var(--cm) * 1.5); min-height: 0; padding: calc(var(--cm) * 2.1); border: calc(var(--cm) * 0.14) solid var(--ubd60); border-radius: var(--ucr); background: var(--ubg30); }
.ufz-card .ufz-line { width: 55%; }
.ufz-block { flex: 1; min-height: calc(var(--cm) * 3); border-radius: var(--ubr); background: var(--uf07); }
.ufz-card:nth-child(2) .ufz-block { background: var(--ua17); }`);
    const D = Math.max(0.001, p.duration), exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none", haloOn = !(p.halo === false || p.halo === "hide");
    const num = (v, d, lo, hi) => { const n = parseFloat(v); return Math.min(hi, Math.max(lo, isFinite(n) ? n : d)); };
    const ax = num(p.anchorX, 64, 0, 100), ay = num(p.anchorY, 36, 0, 100), zoom = num(p.zoom, 1.6, 1, 3), zoomAt = num(p.zoomAt, 1.4, 0, 30);
    const panMax = Math.max(0, 50 * (zoom - 1) - 0.16 - 0.2);
    const tx = Math.min(panMax, Math.max(-panMax, -(ax - 50) * zoom)), ty = Math.min(panMax, Math.max(-panMax, -(ay - 50) * zoom));
    const IN0 = 0.9, ZOOM0 = 1.1, OUT0 = exitMode === "none" ? 0 : 0.5, tot = IN0 + ZOOM0 + OUT0, sc = D < tot ? D / tot : 1;
    const IN = IN0 * sc, ZOOM = ZOOM0 * sc, OUT = OUT0 * sc, OUT_START = D - OUT;
    const zs = Math.min(Math.max(zoomAt, IN), Math.max(IN, OUT_START - ZOOM - 0.05)), f = v => +v.toFixed(4), t = p.at;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100;
      const rad = p.radius > 0 ? p.radius : 2.4 * cm, rad16 = p.radius > 0 ? p.radius : 1.6 * cm;
      const root = ctx.make(slot, "div", "root", { cls: "ufz-root", style: { background: p.bg, color: p.fg, "--cm": cm + "px",
        "--ubd55": rgba(p.border, 0.55), "--ubd60": rgba(p.border, 0.6), "--ubg30": rgba(p.base, 0.3), "--umark": mix(p.accent, 74, p.surface),
        "--uf07": rgba(p.fg, 0.07), "--uf09": rgba(p.fg, 0.09), "--uf13": rgba(p.fg, 0.13), "--uf18": rgba(p.fg, 0.18), "--uf21": rgba(p.fg, 0.21),
        "--ua17": rgba(p.accent, 0.17), "--ua28": rgba(p.accent, 0.28), "--ua55": rgba(p.accent, 0.55), "--ucr": f(rad16) + "px", "--ubr": f(rad16 * 0.6) + "px" } });
      const stage = ctx.make(root, "div", "stage", { cls: "ufz-stage" });
      const frame = ctx.make(stage, "div", "frame", { cls: "ufz-frame", style: { border: `${f(0.16 * cm)}px solid ${rgba(p.border, 0.85)}`, borderRadius: f(rad) + "px",
        background: mix(p.surface, 96, p.accent), boxShadow: `0 ${f(3 * ch)}px ${f(9 * ch)}px ${rgba(p.shadow, 0.45)}` } });
      const world = ctx.make(frame, "div", "world", { cls: "ufz-world" });
      const surf = ctx.make(world, "div", "surface", { cls: "ufz-surface", style: { background: mix(p.surface, 88, p.base) } });
      if (p.image) ctx.make(surf, "img", "img", { attrs: { src: p.image, alt: "" } });
      else {
        const skel = ctx.make(surf, "div", "skel", { cls: "ufz-skel" });
        const top = ctx.make(skel, "div", "top", { cls: "ufz-top" });
        ctx.make(top, "span", "mark", { cls: "ufz-mark" });
        ctx.make(top, "span", "l1", { cls: "ufz-line", style: { width: f(6.5 * cm) + "px" } });
        ctx.make(top, "span", "spring", { cls: "ufz-spring" });
        ctx.make(top, "span", "chip", { cls: "ufz-chip" });
        ctx.make(top, "span", "avatar", { cls: "ufz-avatar" });
        const body = ctx.make(skel, "div", "body", { cls: "ufz-body" });
        const side = ctx.make(body, "div", "side", { cls: "ufz-side" });
        [78, 56, 66, 44, 60].forEach((w, i) => ctx.make(side, "span", "s" + (i + 1), { cls: "ufz-line", style: i === 0 ? { width: w + "%", background: rgba(p.fg, 0.22) } : { width: w + "%" } }));
        const main = ctx.make(body, "div", "main", { cls: "ufz-main" });
        ctx.make(main, "span", "heading", { cls: "ufz-heading" });
        ctx.make(main, "span", "sub", { cls: "ufz-sub" });
        const cards = ctx.make(main, "div", "cards", { cls: "ufz-cards" });
        for (let i = 1; i <= 3; i++) { const c = ctx.make(cards, "div", "card" + i, { cls: "ufz-card" }); ctx.make(c, "span", "l", { cls: "ufz-line" }); ctx.make(c, "span", "b", { cls: "ufz-block" }); }
      }
      let halo = null;
      if (haloOn) halo = ctx.make(world, "div", "halo", { cls: "ufz-halo", style: { left: ax + "%", top: ay + "%", width: f(30 * cm) + "px", height: f(30 * cm) + "px",
        background: `radial-gradient(circle, ${rgba(p.accent, 0.26)} 0%, ${rgba(p.accent, 0.12)} 42%, rgba(${hex(p.accent).join(",")},0) 70%)` } });
      ft(stage, { opacity: 0, y: f(4.5 * ch), scale: 0.965 }, { opacity: 1, y: 0, scale: 1, duration: f(IN), ease: "power3.out" }, t);
      ft(world, { scale: 1, xPercent: 0, yPercent: 0 }, { scale: zoom, xPercent: f(tx), yPercent: f(ty), duration: f(ZOOM), ease: "power2.inOut" }, t + f(zs));
      if (halo) ft(halo, { opacity: 0, scale: 0.55, xPercent: -50, yPercent: -50 }, { opacity: 0.85, scale: 1, xPercent: -50, yPercent: -50, duration: f(0.75 * sc), ease: "power2.out" }, t + f(zs + ZOOM * 0.5));
      if (exitMode !== "none") {
        ft(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
        if (exitMode === "up") ft(stage, { y: 0 }, { y: f(-4 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
      }
    }
    flush();
  },
});
