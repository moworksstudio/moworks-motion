/* flow/screen-flow-carousel: two to five app screens ride a horizontal rail; one is primary in the middle, its neighbours are smaller and dimmer. On every cue the rail advances one
   screen with a velocity-matched throw (a fast lateral move that sheds speed, then a smooth long catch onto the next centre, no overshoot), the active ring and the caption
   under the rail swap with it.
   Port of HyperFrames registry component screen-flow-carousel. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh / cqmin of the source are taken
   from that box (custom properties --cw / --ch / --cm hold one percent of its width / height / short side).
   Source envelope kept (D = params.duration, authored 5 s): stage settle IN = 0.9 s (opacity 0.63 s power2.out, rise 4 % power3.out), advances of ADV = 0.84 s (throw 42 % power4.out
   to pos - 0.14, catch power2.out) spaced evenly over the hold (or at params.cues), screens 0.94 / 0.62 -> 1 / 1 power2.out, ring and caption swaps, optional exit (fade / up) 0.45 s.
   The rail position was a CSS custom property (--sfc-pos); it is the rail's x here (same values, pos x (44 + 4) cqw). Screens are skeletons (list, cards, chart, detail cycle)
   unless params.images has a picture for them. */
AIMK.preset("flow/screen-flow-carousel", {
  params: { screens: 3, captions: ["Tổng quan", "Chi tiết", "Thống kê", "Hoạt động", "Cài đặt"], cues: [], images: [], accent: "#71f5a7", exit: "none", duration: 5,
    bg: "transparent", base: "#05070c", fg: "#f8fafc", surface: "#0f141b", border: "#475569", muted: "#8b93a3", shadow: "#000000", radius: 0 },
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
    ctx.css("flow/screen-flow-carousel", `
.sfc-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.sfc-stage { position: absolute; inset: 0; }
.sfc-rail { position: absolute; left: 0; display: flex; align-items: stretch; width: max-content; }
.sfc-screen { position: relative; flex: 0 0 auto; overflow: hidden; transform-origin: 50% 50%; }
.sfc-body { position: absolute; inset: 0; overflow: hidden; }
.sfc-body > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.sfc-ring { position: absolute; inset: 0; z-index: 2; border-radius: inherit; opacity: 0; }
.sfc-caps { position: absolute; }
.sfc-cap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: "RMono", Consolas, "Cascadia Mono", Menlo, "SF Mono", "DejaVu Sans Mono", monospace; font-weight: 500; letter-spacing: 0.12em; white-space: nowrap; }
.sfc-cap-dot { flex: 0 0 auto; border-radius: 50%; }
.sfc-skel { position: absolute; inset: 0; display: flex; flex-direction: column; gap: calc(var(--cm) * 2); padding: calc(var(--cm) * 2.8); }
.sfc-heading { flex: 0 0 auto; width: 38%; height: calc(var(--cm) * 2.3); border-radius: 999px; background: var(--sf22); }
.sfc-line { flex: 0 0 auto; height: calc(var(--cm) * 1.2); border-radius: 999px; background: var(--sf11); }
.sfc-row { display: flex; flex: 0 0 auto; align-items: center; gap: calc(var(--cm) * 1.6); }
.sfc-row .sfc-line { flex: 1 1 auto; }
.sfc-dot { flex: 0 0 auto; width: calc(var(--cm) * 1.7); height: calc(var(--cm) * 1.7); border-radius: 50%; background: var(--sf16); }
.sfc-grid { display: grid; flex: 1; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(var(--cm) * 2); min-height: 0; }
.sfc-card { display: flex; flex-direction: column; gap: calc(var(--cm) * 1.4); min-height: 0; padding: calc(var(--cm) * 2); border: calc(var(--cm) * 0.14) solid var(--sbd); border-radius: var(--scr); background: var(--sbg); }
.sfc-card .sfc-line { width: 60%; }
.sfc-block { flex: 1; min-height: calc(var(--cm) * 2.6); border-radius: var(--sbr); background: var(--sf07); }
.sfc-card:first-child .sfc-block { background: var(--sa17); }
.sfc-bars { display: flex; flex: 1; align-items: flex-end; gap: calc(var(--cm) * 2); min-height: 0; padding-top: calc(var(--cm) * 1); }
.sfc-bar { flex: 1; border-radius: calc(var(--cm) * 0.8) calc(var(--cm) * 0.8) 0 0; background: var(--sf13); }
.sfc-bar.acc { background: var(--sa62); }
.sfc-chip { flex: 0 0 auto; width: calc(var(--cm) * 11); height: calc(var(--cm) * 2.6); border: calc(var(--cm) * 0.14) solid var(--sa55); border-radius: 999px; background: var(--sa24); }`);
    const D = Math.max(0.001, p.duration), exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
    const count = Math.max(2, Math.min(5, Math.round(+p.screens) || 3));
    const caps0 = ["Tổng quan", "Chi tiết", "Thống kê", "Hoạt động", "Cài đặt"];
    const capList = (Array.isArray(p.captions) ? p.captions : String(p.captions).split(",")).map(s => String(s).trim());
    const cueList = (Array.isArray(p.cues) ? p.cues : String(p.cues).split(",")).map(v => (String(v).trim() === "" ? NaN : Number(v)));
    const IN0 = 0.9, OUT0 = exitMode === "none" ? 0 : 0.45, ADV0 = 0.84, sc = D < IN0 + OUT0 ? D / (IN0 + OUT0) : 1;
    const IN = IN0 * sc, OUT = OUT0 * sc, OUT_START = D - OUT, adv = count - 1;
    const TAIL = Math.min(0.4, Math.max(0, D - IN - OUT) * 0.12), span = Math.max(0.05, D - IN - OUT - TAIL), spacing = span / (adv + 1), ADV = Math.min(ADV0, spacing), latest = Math.max(IN, D - OUT - ADV - 0.05);
    const starts = [];
    for (let k = 0; k < adv; k++) {
      const cue = cueList[k], wanted = Number.isFinite(cue) ? cue : IN + (k + 1) * spacing, lower = k === 0 ? IN : starts[k - 1] + ADV, upper = Math.max(lower, latest - (adv - 1 - k) * ADV);
      starts.push(Math.min(Math.max(wanted, lower), upper));
    }
    const f = v => +v.toFixed(4), t = p.at, W0 = 44, GAP = 4;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100;
      const X = pos => f((50 - W0 / 2 - pos * (W0 + GAP)) * cw);
      const rad = p.radius > 0 ? p.radius : 2.4 * cm, rad2 = p.radius > 0 ? p.radius : 2 * cm;
      const root = ctx.make(slot, "div", "root", { cls: "sfc-root", style: { background: p.bg, color: p.fg, "--cw": cw + "px", "--ch": ch + "px", "--cm": cm + "px",
        "--sf22": rgba(p.fg, 0.22), "--sf11": rgba(p.fg, 0.11), "--sf16": rgba(p.fg, 0.16), "--sf07": rgba(p.fg, 0.07), "--sf13": rgba(p.fg, 0.13),
        "--sa17": rgba(p.accent, 0.17), "--sa62": rgba(p.accent, 0.62), "--sa55": rgba(p.accent, 0.55), "--sa24": rgba(p.accent, 0.24),
        "--sbd": rgba(p.border, 0.6), "--sbg": rgba(p.base, 0.3), "--scr": f(rad2 * 0.7) + "px", "--sbr": f(rad2 * 0.5) + "px" } });
      const stage = ctx.make(root, "div", "stage", { cls: "sfc-stage" });
      const rail = ctx.make(stage, "div", "rail", { cls: "sfc-rail", style: { top: f(9 * ch) + "px", gap: f(GAP * cw) + "px", height: f(64 * ch) + "px" } });
      const lines = ws => ws.map(w => `<span class="sfc-line" style="width:${w}"></span>`).join("");
      const rows = ["86%", "72%", "80%", "64%", "76%", "58%"].map(w => `<span class="sfc-row"><span class="sfc-dot"></span><span class="sfc-line" style="max-width:${w}"></span></span>`).join("");
      const card = '<span class="sfc-card"><span class="sfc-line"></span><span class="sfc-block"></span></span>';
      const bars = ["34%", "58%", "42%", "76%", "50%", "64%"].map((h, i) => `<span class="sfc-bar${i === 3 ? " acc" : ""}" style="height:${h}"></span>`).join("");
      const skels = [
        `<span class="sfc-heading"></span>${rows}<span class="sfc-block"></span>`,
        `<span class="sfc-heading"></span><span class="sfc-grid">${card}${card}${card}${card}</span>`,
        `<span class="sfc-heading"></span><span class="sfc-bars">${bars}</span>${lines(["46%"])}`,
        `<span class="sfc-chip"></span><span class="sfc-heading" style="width:56%"></span>${lines(["84%", "72%", "64%"])}<span class="sfc-block"></span>`,
      ];
      const screens = [], rings = [], capEls = [];
      const capsBand = ctx.make(stage, "div", "caps", { cls: "sfc-caps", style: { top: f(78 * ch) + "px", left: f(10 * cw) + "px", right: f(10 * cw) + "px", height: f(12 * ch) + "px" } });
      for (let i = 0; i < count; i++) {
        const sc_ = ctx.make(rail, "div", "screen" + (i + 1), { cls: "sfc-screen", style: { flex: `0 0 ${f(W0 * cw)}px`, border: `${f(0.16 * cm)}px solid ${rgba(p.border, 0.7)}`, borderRadius: f(rad) + "px",
          background: mix(p.surface, 94, p.base), boxShadow: `0 ${f(2.6 * ch)}px ${f(7 * ch)}px ${rgba(p.shadow, 0.42)}` } });
        const img = (p.images || [])[i];
        const body = ctx.make(sc_, "div", "body", { cls: "sfc-body" });
        if (img) ctx.make(body, "img", "img", { attrs: { src: img, alt: "" } });
        else ctx.make(body, "div", "skel", { cls: "sfc-skel", html: skels[i % skels.length] });
        const ring = ctx.make(sc_, "span", "ring", { cls: "sfc-ring", style: { border: `${f(0.24 * cm)}px solid ${rgba(p.accent, 0.78)}`, opacity: i === 0 ? 1 : 0 } });
        const cap = ctx.make(capsBand, "span", "cap" + (i + 1), { cls: "sfc-cap", style: { gap: f(1.4 * cm) + "px", color: p.muted, fontSize: f(2.7 * cm) + "px" } });
        ctx.make(cap, "span", "dot", { cls: "sfc-cap-dot", style: { width: f(1.1 * cm) + "px", height: f(1.1 * cm) + "px", background: p.accent } });
        ctx.make(cap, "span", "txt", { text: capList[i] || caps0[i] });
        screens.push(sc_); rings.push(ring); capEls.push(cap);
      }
      ft(stage, { opacity: 0 }, { opacity: 1, duration: f(IN * 0.7), ease: "power2.out" }, t);
      ft(stage, { y: f(4 * ch) }, { y: 0, duration: f(IN), ease: "power3.out" }, t);
      starts.forEach((at0, k) => {
        const at = t + f(at0), nx = k + 1, THROW = ADV * 0.42, CATCH = ADV - THROW;
        ft(rail, { x: X(k) }, { x: X(nx - 0.14), duration: f(THROW), ease: "power4.out" }, at);
        ft(rail, { x: X(nx - 0.14) }, { x: X(nx), duration: f(CATCH), ease: "power2.out" }, at + f(THROW));
        ft(screens[k], { scale: 1, opacity: 1 }, { scale: 0.94, opacity: 0.62, duration: f(ADV), ease: "power2.out" }, at);
        ft(screens[nx], { scale: 0.94, opacity: 0.62 }, { scale: 1, opacity: 1, duration: f(ADV), ease: "power2.out" }, at);
        ft(rings[k], { opacity: 1 }, { opacity: 0, duration: f(ADV * 0.5), ease: "power1.out" }, at);
        ft(rings[nx], { opacity: 0 }, { opacity: 1, duration: f(ADV * 0.6), ease: "power2.out" }, at + f(ADV * 0.4));
        ft(capEls[k], { opacity: 1, y: 0 }, { opacity: 0, y: f(-1.2 * ch), duration: f(ADV * 0.4), ease: "power1.in" }, at);
        ft(capEls[nx], { opacity: 0, y: f(1.2 * ch) }, { opacity: 1, y: 0, duration: f(ADV * 0.55), ease: "power2.out" }, at + f(ADV * 0.35));
      });
      if (exitMode !== "none") {
        ft(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
        if (exitMode === "up") ft(stage, { y: 0 }, { y: f(-4 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
      }
    }
    flush();
  },
});
