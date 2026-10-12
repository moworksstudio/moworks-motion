/* card/grid-card-assemble: N capability cards assemble into a grid or a vertical list. Each card is a token card (surface with a top light, hairline border,
   radius, padding), a thin-line icon that draws on as the card lands, a wide-tracked uppercase label and an optional one-line muted body. Each card fades and
   slides 3 % of the height straight into its own slot (power3.out, no overshoot, no scatter); once assembled the layout holds perfectly still.
   Port of HyperFrames registry component grid-card-assemble. BLOCK: built inside the target box, sized from it (source: container units cqw / cqh / cqmin of its mount).
   Source logic kept: columns (0 = auto: one row up to 3 items, then ceil(sqrt(N))), row height from the 76cqh budget, text fitting, the cascade that lands the last card
   at 60 % of `duration`, per-item `cues`, six cycled line icons, optional exit fade | up (0.45 s). */
AIMK.preset("card/grid-card-assemble", {
  params: { items: "Thu thập,Dựng phim,Kết xuất,Xuất bản", layout: "grid", columns: 0, cues: "", accent: "#71f5a7", exit: "none", duration: 4.5,
    fg: "#f8fafc", muted: "#94a3b8", surface: "#141a23", border: "#38404e" },
  build(tl, els, p, ctx) {
    const t = p.at, layout = p.layout === "list" ? "list" : "grid", isList = layout === "list", exit = p.exit === "fade" || p.exit === "up" ? p.exit : "none";
    const D = Math.max(0.001, Number(p.duration) || 4.5);
    const raw = (Array.isArray(p.items) ? p.items.map(String) : String(p.items == null ? "" : p.items).split(",")).map(s => s.trim()).filter(Boolean).slice(0, 12);
    const entries = (raw.length ? raw : ["Thu thập", "Dựng phim", "Kết xuất", "Xuất bản"]).map(r => { const k = r.indexOf(":"); return k > 0 ? { label: r.slice(0, k).trim(), body: r.slice(k + 1).trim() } : { label: r, body: "" }; });
    const count = entries.length;
    const ICONS = [
      ["M24 44s16-8 16-20V10L24 4 8 10v14c0 12 16 20 16 20z", "M17 23l5 5 10-10"],
      ["M8 6v34h34", "M16 30l8-9 6 5 10-12"],
      ["M36 20h-2.5A16 16 0 1 0 18 40h18a10 10 0 0 0 0-20z"],
      ["M26 4L10 27h10l-3 17 17-24H23l3-16z"],
      ["M24 6L4 16l20 10 20-10L24 6z", "M4 24l20 10 20-10", "M4 32l20 10 20-10"],
      ["M14 4h14l8 8v32H14z", "M28 4v8h8", "M20 24h10", "M20 31h7"],
    ];
    ctx.css("card/grid-card-assemble", `
.cga-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.cga-stage { display: grid; }
.cga-card { display: flex; flex-direction: column; justify-content: space-between; min-width: 0; min-height: 0; overflow: hidden; box-sizing: border-box; }
.cga-stage[data-layout="list"] .cga-card { flex-direction: row; align-items: center; justify-content: flex-start; }
.cga-icon { flex: 0 0 auto; }
.cga-icon path { fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.cga-text { min-width: 0; }
.cga-label { overflow: hidden; font-weight: 500; line-height: 1.25; letter-spacing: 0.16em; text-transform: uppercase; white-space: nowrap; }
.cga-body { overflow: hidden; font-weight: 400; line-height: 1.4; letter-spacing: 0.01em; white-space: nowrap; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, cm = v => v * Math.min(W, H) / 100;
      // layout geometry (source): columns, row height from a 76cqh budget, text fitting
      const autoCols = count <= 3 ? count : Math.ceil(Math.sqrt(count)), req = Math.round(Number(p.columns)) || 0;
      const columns = isList ? 1 : Math.max(1, Math.min(4, req > 0 ? req : autoCols)), rows = Math.ceil(count / columns);
      const hasBodies = entries.some(e => e.body !== ""), stageW = isList ? 64 : 88, rowCap = isList ? 15 : hasBodies ? 38 : 30;
      const rowH = Math.max(6, Math.min(rowCap, (76 - 3 * (rows - 1)) / rows));
      const pad = rowH * (isList ? 0.16 : 0.12), iconSize = isList ? rowH * 0.5 : Math.min(rowH * 0.3, 9.5), bodyGap = rowH * (isList ? 0.03 : 0.035);
      const maxChars = entries.reduce((m, e) => Math.max(m, Array.from(e.label).length), 1), maxBody = entries.reduce((m, e) => Math.max(m, Array.from(e.body).length), 0);
      const cellW = stageW / columns, textW = isList ? cellW * 0.62 : cellW * 0.78;
      const labelPx = Math.min(cw(Math.min(2.6, textW / (maxChars * 0.75))), ch(rowH * (isList ? 0.23 : 0.09)));
      const bodyPx = maxBody > 0 ? Math.min(cw(Math.min(2.2, textW / (maxBody * 0.56))), ch(rowH * (isList ? 0.19 : 0.095))) : 0;
      const box = ctx.make(slot, "div", "ga", { cls: "cga-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", color: p.fg } });
      const stage = ctx.make(box, "div", "stage", { cls: "cga-stage", attrs: { "data-layout": layout }, style: { width: cw(stageW) + "px", gridAutoRows: ch(rowH) + "px", gap: cm(2.2) + "px", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } });
      const cards = entries.map((e, i) => {
        const card = ctx.make(stage, "div", "c" + i, { cls: "cga-card", style: { padding: ch(pad) + "px", border: `1px solid ${p.border}`, borderRadius: cm(1.8) + "px",
          background: `linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.01) 60%), ${p.surface}`, ...(isList ? { gap: cm(2.2) + "px" } : {}) } });
        const ic = ctx.make(card, "div", "ic", { cls: "cga-icon", style: { width: ch(iconSize) + "px", height: ch(iconSize) + "px" } });
        ic.innerHTML = `<svg viewBox="0 0 48 48" style="width:100%;height:100%;display:block">${ICONS[i % ICONS.length].map(d => `<path d="${d}" style="stroke:${p.accent}"></path>`).join("")}</svg>`;
        const tx = ctx.make(card, "div", "tx", { cls: "cga-text" });
        ctx.make(tx, "div", "label", { cls: "cga-label", text: e.label, style: { fontSize: labelPx + "px", color: p.fg } });
        if (e.body) ctx.make(tx, "div", "body", { cls: "cga-body", text: e.body, style: { marginTop: ch(bodyGap) + "px", fontSize: bodyPx + "px", color: p.muted } });
        return card;
      });
      // timing (source): fixed cascade, still hold, optional exit
      const OUT = exit === "none" ? 0 : Math.min(0.45, D * 0.25), avail = D - OUT, TILE = Math.min(0.65, Math.max(0.2, avail - 0.15)), latest = Math.max(0, avail - TILE);
      const first = Math.min(0.15, latest), lastStart = Math.min(latest, Math.max(0.6 * D - TILE, 0.15 + 0.1 * (count - 1)));
      const gap = count > 1 ? Math.max(0, lastStart - first) / (count - 1) : 0, cueList = String(p.cues == null ? "" : p.cues).split(",");
      const starts = cards.map((c, i) => { const s = (cueList[i] || "").trim(), cue = Number(s), start = s !== "" && Number.isFinite(cue) ? cue : first + gap * i; return Math.max(0, Math.min(start, latest)); });
      cards.forEach((card, i) => {
        tl.fromTo(card, { opacity: 0, y: ch(3) }, { opacity: 1, y: 0, duration: TILE, ease: "power3.out" }, t + starts[i]);
        const paths = [...card.querySelectorAll("path")], iconStart = TILE * 0.25, iconAvail = TILE * 0.7;
        paths.forEach((path, j) => {
          path.id = card.id + "_p" + j;
          const len = Math.ceil(path.getTotalLength() * 100) / 100; path.style.strokeDasharray = String(len); path.style.strokeDashoffset = String(len);
          tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: iconAvail * 0.55, ease: "power2.out" }, t + starts[i] + iconStart + (j / paths.length) * iconAvail * 0.45);
        });
      });
      if (exit !== "none") {
        tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: OUT, ease: "power2.in" }, t + D - OUT);
        if (exit === "up") tl.fromTo(stage, { y: 0 }, { y: -ch(3), duration: OUT, ease: "power2.in" }, t + D - OUT);
      }
    }
  },
});
