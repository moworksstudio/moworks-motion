/* flow/modal-morph: a small card grows into a full panel (shared-element morph) and its children re-flow instead of stretching.
   Port of HyperFrames registry component modal-morph (README: "shared-element grow"). BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh / cqmin
   of the source are taken from that box.
   Same FLIP method as the source: both layouts (card and panel) are real DOM, measured once; every frame is a pure function of time: the container rect is interpolated and applied
   as translate + scale from the top-left corner, every keyed child (dot, title, meta) counter-scales and travels onto the interpolation of its own two rects, the card crossfades out
   in the first 30 % of the morph, the panel furniture (tiles, chips) fades up over the back half. The per-frame part goes through ctx.code (one proxy tween that drives the
   function), the measured rects are written into the code as numbers, so the film never measures anything.
   Envelope as the source (D = params.duration, authored 4 s): card enters in 0.3 s, the morph starts at expandAt (1.2 s) and takes 0.95 s (calm: cubic inOut) or 0.6 s
   (snappy: back.out with c1 = 0.7), IN = expandAt + morph + 0.15 s, optional exit (fade / up) 0.45 s at D - 0.45; everything shrinks together when D is shorter. */
AIMK.preset("flow/modal-morph", {
  params: { fromScale: 1, expandAt: 1.2, register: "calm", accent: "#52525b", exit: "none", duration: 4, chipLead: "MỞ", chip: "CHI TIẾT",
    bg: "transparent", fg: "#f8fafc", muted: "#94a3b8", surface: "#14171c", border: "#475569", shadow: "#000000", radius: 0 },
  build(tl, els, p, ctx) {
    const hex = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hex(h).join(",")},${+a.toFixed(4)})`;
    ctx.css("flow/modal-morph", `
.mmo-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.mmo-stage { position: absolute; inset: 0; }
.mmo-cardbox { position: absolute; inset: 0; display: grid; place-items: center; }
.mmo-card { display: grid; transform-origin: 0 0; }
.mmo-panel { position: absolute; display: grid; grid-template-rows: auto 1fr auto; transform-origin: 0 0; }
.mmo-head { display: flex; align-items: center; }
.mmo-kid { transform-origin: 0 0; }
.mmo-dot { flex: none; border-radius: 50%; }
.mmo-body { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-content: stretch; }
.mmo-tile { display: grid; align-content: end; }
.mmo-foot { display: flex; }
.mmo-chip { display: grid; align-items: center; font-family: "RMono", Consolas, "Cascadia Mono", Menlo, "SF Mono", "DejaVu Sans Mono", monospace; font-weight: 500; letter-spacing: 0.08em; }`);
    const D = Math.max(0.001, p.duration), reg = p.register === "snappy" ? "snappy" : "calm", exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
    const fs = Math.min(1.5, Math.max(0.5, +p.fromScale || 1)), expandVar = isFinite(+p.expandAt) ? Math.max(0.2, +p.expandAt) : 1.2;
    const MORPH0 = reg === "snappy" ? 0.6 : 0.95, EXPAND0 = Math.min(expandVar, Math.max(0.2, D - 0.6)), IN0 = EXPAND0 + MORPH0 + 0.15, OUT0 = exitMode === "none" ? 0 : 0.45;
    const tot = Math.max(0.001, IN0 + OUT0), sc = D < tot ? D / tot : 1;
    const EXPAND = EXPAND0 * sc, MORPH = MORPH0 * sc, IN = IN0 * sc, OUT = OUT0 * sc, HOLD = Math.max(0, D - (IN + OUT)), OUT_START = IN + HOLD, ENTER = 0.3 * sc;
    const r4 = v => +v.toFixed(4);
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100, rad = p.radius > 0 ? p.radius : 2.4 * cm;
      const root = ctx.make(slot, "div", "root", { cls: "mmo-root", style: { background: p.bg, color: p.fg, "--cw": cw + "px", "--ch": ch + "px", "--cm": cm + "px" } });
      const stage = ctx.make(root, "div", "stage", { cls: "mmo-stage" });
      const cardbox = ctx.make(stage, "div", "cardbox", { cls: "mmo-cardbox" });
      const edge = `${r4(0.18 * cm)}px solid ${p.border}`;
      const card = ctx.make(cardbox, "div", "card", { cls: "mmo-card", style: { width: r4(36 * cm * fs) + "px", padding: r4(3 * cm) + "px", gap: r4(2 * cm) + "px", border: edge, borderRadius: r4(rad) + "px", background: p.surface,
        boxShadow: `0 ${r4(1.4 * cm)}px ${r4(4.5 * cm)}px ${rgba(p.shadow, 0.32)}` } });
      const host = ctx.make(card, "div", "host");
      const panel = ctx.make(stage, "div", "panel", { cls: "mmo-panel", style: { left: r4(14 * cw) + "px", right: r4(14 * cw) + "px", top: r4(13 * ch) + "px", bottom: r4(13 * ch) + "px", padding: r4(3 * cm) + "px", gap: r4(3 * cm) + "px",
        border: edge, borderRadius: r4(rad) + "px", background: p.surface, boxShadow: `0 ${r4(2.2 * cm)}px ${r4(7 * cm)}px ${rgba(p.shadow, 0.36)}` } });
      const head = ctx.make(panel, "div", "head", { cls: "mmo-head", style: { gap: r4(2 * cm) + "px" } });
      const kid = (parent, where, key, w, h, bgc, r) => ctx.make(parent, "div", where + "_" + key, { cls: "mmo-kid" + (key === "dot" ? " mmo-dot" : ""), style: { width: w, height: r4(h) + "px", borderRadius: r, background: bgc } });
      const dotC = rgba(p.fg, 0.72), titleC = rgba(p.fg, 0.3), metaC = rgba(p.fg, 0.14);
      const cardKids = { dot: kid(host, "c", "dot", r4(3.4 * cm) + "px", 3.4 * cm, dotC, "50%"), title: kid(host, "c", "title", "76%", 2.4 * cm, titleC, r4(1.2 * cm) + "px"), meta: kid(host, "c", "meta", "52%", 1.5 * cm, metaC, r4(0.75 * cm) + "px") };
      const panelKids = { dot: kid(head, "p", "dot", r4(3.4 * cm) + "px", 3.4 * cm, dotC, "50%"), title: kid(head, "p", "title", r4(24 * cm) + "px", 2.4 * cm, titleC, r4(1.2 * cm) + "px"), meta: kid(head, "p", "meta", r4(15 * cm) + "px", 1.5 * cm, metaC, r4(0.75 * cm) + "px") };
      const body = ctx.make(panel, "div", "body", { cls: "mmo-body", style: { gap: r4(2 * cm) + "px" } });
      for (let i = 1; i <= 3; i++) {
        const tile = ctx.make(body, "div", "tile" + i, { cls: "mmo-tile", style: { border: `${r4(0.16 * cm)}px solid ${p.border}`, borderRadius: r4(rad * 0.7) + "px", background: rgba(p.fg, 0.05), gap: r4(1.2 * cm) + "px", padding: r4(2 * cm) + "px" } });
        ctx.make(tile, "div", "l1", { style: { height: r4(1.3 * cm) + "px", borderRadius: r4(0.65 * cm) + "px", background: rgba(p.fg, 0.16) } });
        ctx.make(tile, "div", "l2", { style: { height: r4(1.3 * cm) + "px", width: "58%", borderRadius: r4(0.65 * cm) + "px", background: rgba(p.fg, 0.16) } });
      }
      const foot = ctx.make(panel, "div", "foot", { cls: "mmo-foot", style: { gap: r4(2 * cm) + "px" } });
      const chipCss = { height: r4(3.4 * cm) + "px", borderRadius: r4(1.7 * cm) + "px", padding: `0 ${r4(2.4 * cm)}px`, fontSize: r4(1.5 * cm) + "px" };
      ctx.make(foot, "div", "chip1", { cls: "mmo-chip", text: String(p.chipLead).toUpperCase(), style: Object.assign({ border: `${r4(0.16 * cm)}px solid ${rgba(p.accent, 0.55)}`, color: p.accent }, chipCss) });
      ctx.make(foot, "div", "chip2", { cls: "mmo-chip", text: String(p.chip).toUpperCase(), style: Object.assign({ border: `${r4(0.16 * cm)}px solid ${p.border}`, color: p.muted }, chipCss) });
      // the one-time measurement of both layouts (FLIP "first" and "last"), relative to the stage
      const sr = stage.getBoundingClientRect(), k = sr.width / bw || 1;
      const meas = el => { const r = el.getBoundingClientRect(); return { x: r4((r.left - sr.left) / k), y: r4((r.top - sr.top) / k), w: r4(Math.max(1, r.width / k)), h: r4(Math.max(1, r.height / k)) }; };
      const cardRect = meas(card), panelRect = meas(panel);
      const pairs = (own, other) => Object.keys(own).map(key => ({ id: own[key].id, home: meas(own[key]), away: meas(other[key]) }));
      const panelPairs = pairs(panelKids, cardKids), cardPairs = pairs(cardKids, panelKids);
      const fades = [ctx.id(body), ctx.id(foot)];
      ctx.code(`  // modal-morph #${slot.id}: container rect lerp + counter-scaled children, one pure function of the time
  (function () {
    const E = id => document.getElementById(id), card = E(${JSON.stringify(card.id)}), panel = E(${JSON.stringify(panel.id)}), fades = ${JSON.stringify(fades)}.map(E);
    const CARD = ${JSON.stringify(cardRect)}, PANEL = ${JSON.stringify(panelRect)};
    const PP = ${JSON.stringify(panelPairs)}.map(q => Object.assign(q, { el: E(q.id) })), CP = ${JSON.stringify(cardPairs)}.map(q => Object.assign(q, { el: E(q.id) }));
    const EXPAND = ${r4(EXPAND)}, MORPH = ${r4(MORPH)}, ENTER = ${r4(ENTER)}, SNAPPY = ${reg === "snappy"};
    const c01 = v => (v < 0 ? 0 : v > 1 ? 1 : v), lerp = (a, b, q) => a + (b - a) * q, n = v => +v.toFixed(4);
    const ease = u => SNAPPY ? 1 + 1.7 * (u - 1) * (u - 1) * (u - 1) + 0.7 * (u - 1) * (u - 1) : (u < 0.5 ? 4 * u * u * u : 1 - 4 * (1 - u) * (1 - u) * (1 - u));
    const lr = (a, b, q) => ({ x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), w: lerp(a.w, b.w, q), h: lerp(a.h, b.h, q) });
    function layer(el, home, pairs, R, q, isPanel) {
      const sx = R.w / home.w, sy = R.h / home.h;
      el.style.transform = "translate(" + n(R.x - home.x) + "px, " + n(R.y - home.y) + "px) scale(" + n(sx) + ", " + n(sy) + ")";
      pairs.forEach(pr => {
        const want = lr(pr.away, pr.home, isPanel ? q : 1 - q), bx = R.x + (pr.home.x - home.x) * sx, by = R.y + (pr.home.y - home.y) * sy;
        pr.el.style.transform = "translate(" + n((want.x - bx) / sx) + "px, " + n((want.y - by) / sy) + "px) scale(" + n(want.w / (pr.home.w * sx)) + ", " + n(want.h / (pr.home.h * sy)) + ")";
      });
    }
    function apply(T) {
      const enter = c01(ENTER > 0 ? T / ENTER : 1), u = c01(MORPH > 0 ? (T - EXPAND) / MORPH : 1), q = ease(u), R = lr(CARD, PANEL, q);
      layer(panel, PANEL, PP, R, q, true); layer(card, CARD, CP, R, q, false);
      const hand = c01(u / 0.3);
      card.style.opacity = String(n(enter * (1 - hand))); panel.style.opacity = String(u <= 0 ? 0 : n(Math.max(0.001, hand)));
      const f = c01((u - 0.55) / 0.45), fe = 1 - (1 - f) * (1 - f);
      fades.forEach(el => { el.style.opacity = String(n(fe)); el.style.transform = "translate(0px, " + n((1 - fe) * 12) + "px)"; });
    }
    apply(0);
    const drv = { t: 0 };
    tl.fromTo(drv, { t: 0 }, { t: ${r4(D)}, duration: ${r4(D)}, ease: "none", onUpdate: () => apply(drv.t) }, ${p.at});
  })();`);
      if (exitMode !== "none") {
        tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: r4(OUT), ease: "power2.in" }, p.at + r4(OUT_START));
        if (exitMode === "up") tl.fromTo(stage, { y: 0 }, { y: r4(-4 * ch), duration: r4(OUT), ease: "power2.in" }, p.at + r4(OUT_START));
      }
    }
  },
});
