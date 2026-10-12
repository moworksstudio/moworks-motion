/* intake/deck-slide: rebuilds one PowerPoint / Google Slides slide (read by `kit.py ingest`) inside its target, pixel-exact: every shape,
   picture (crop, rotation) and text box (insets, anchor, paragraphs, runs, fonts, tracking, colour) at the canvas px measured from the deck.
   No motion: other presets animate the elements afterwards (ids: <target>_z<z id from LAYOUT.md>, text paragraphs <..>_p<N>, runs <..>_r<N>,
   pictures' motion layer <..>_in).
   Port of v1 Engine/deck.js (SSDeck.slide, text model measured on Google Slides renders, credentials film 2 Oct 2026): line pitch =
   lh * 1.2 * size, first baseline = min(lh, 1) * 0.95 * size (Anton 0.96); params.asc / params.nudge adjust them per font / element.
   params.slide = one slide of layout.json; params.fonts = { "<deck family>": "<CSS family the film loads>" }. */
AIMK.preset("intake/deck-slide", {
  params: { slide: null, fonts: {}, opsz: {}, pitch: 1.2, asc0: 0.95, asc: { "Anton": 0.96 }, nudge: {} },
  build(tl, els, p, ctx) {
    const ALIGN = { l: "left", ctr: "center", r: "right", just: "justify", dist: "justify" }, ANCHOR = { t: "flex-start", ctr: "center", b: "flex-end" };
    const host = els[0], S = p.slide; if (!S) return;
    const colour = c => {
      if (!c || c === "none") return "none";
      if (c.startsWith("scheme:") || c === "gradient" || c === "image/other") return null;
      const [hex, a] = c.split("@"); if (!a) return hex;
      const v = parseInt(hex.slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${parseFloat(a) / 100})`;
    };
    const lineOf = l => { if (!l || l === "none") return null; const [c, w] = l.split(" "); return { c: colour(c) || "#000", w: parseFloat(w) || 1 }; };
    const famOf = f => { const v = p.fonts[f] || p.fonts["(default)"] || Object.values(p.fonts)[0]; return v ? `"${v}"` : "sans-serif"; };
    const pending = [];
    const shape = (d, e) => {
      const ln = lineOf(e.line), fill = colour(e.fill), pad = ln ? ln.w : 0, w = e.w, h = e.h;
      const adj = e.adj ? parseInt(String(Object.values(e.adj)[0]).replace("val ", "")) : null;
      let g;
      if (e.geom === "roundRect") { const r = Math.min(w, h) * (adj ?? 16667) / 100000; g = `<rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"`; }
      else if (e.geom === "ellipse") g = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"`;
      else if (e.geom === "triangle") g = `<polygon points="${w * (adj ?? 50000) / 100000},0 ${w},${h} 0,${h}"`;
      else if (e.geom === "line" || e.geom === "straightConnector1") g = `<line x1="0" y1="0" x2="${w}" y2="${h}"`;
      else g = `<rect x="0" y="0" width="${w}" height="${h}"`;
      g += ` fill="${!fill || fill === "none" ? "none" : fill}"` + (ln ? ` stroke="${ln.c}" stroke-width="${ln.w}"` : "") + "/>";
      const sv = ctx.make(d, "div", "svg", { style: { position: "absolute", left: -pad + "px", top: -pad + "px", width: w + 2 * pad + "px", height: h + 2 * pad + "px",
        transform: e.rot ? `rotate(${e.rot}deg)` : "", transformOrigin: "50% 50%" } });
      sv.innerHTML = `<svg viewBox="${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}" width="${w + 2 * pad}" height="${h + 2 * pad}" style="overflow:visible;display:block">${g}</svg>`;
    };
    const picture = (d, e) => {
      const c = e.crop || { left: 0, top: 0, right: 0, bottom: 0 };
      const lw = e.w / (1 - c.left - c.right), lh = e.h / (1 - c.top - c.bottom), fp = e.img_film_px;
      const exact = fp && Math.abs(fp[0] - lw) < 2 && Math.abs(fp[1] - lh) < 2, iw = exact ? fp[0] : lw, ih = exact ? fp[1] : lh;
      d.style.overflow = "hidden"; if (e.geom === "ellipse") d.style.borderRadius = "50%";
      const inner = ctx.make(d, "div", "in", { style: { position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", transform: e.rot ? `rotate(${e.rot}deg)` : "" } });
      ctx.make(inner, "img", "img", { attrs: { src: e.img_film || e.img, alt: "" },
        style: { position: "absolute", left: -c.left * iw + "px", top: -c.top * ih + "px", width: iw + "px", height: ih + "px", maxWidth: "none" } });
    };
    const text = (d, e) => {
      const t = e.text, I = t.insets;
      const gx = e.geom === "ellipse" ? e.w * (1 - Math.SQRT1_2) / 2 : 0, gy = e.geom === "ellipse" ? e.h * (1 - Math.SQRT1_2) / 2 : 0;
      const box = ctx.make(d, "div", "tx", { style: { position: "absolute", left: I.lIns + gx + "px", top: I.tIns + gy + "px", right: I.rIns + gx + "px", bottom: I.bIns + gy + "px",
        display: "flex", flexDirection: "column", justifyContent: ANCHOR[t.anchor] || "flex-start" } });
      let lastS = 16, pi = 0;
      for (const para of t.paras) {
        const runs = para.runs.filter(r => !r.field);
        if (!runs.length && para.runs.some(r => r.field)) continue;                     // slide-number field
        const Sz = Math.max(0, ...runs.map(r => r.px || 0)) || para.end_px || lastS; lastS = Sz;
        const big = runs.reduce((a, r) => (r.px || 0) > (a.px || 0) ? r : a, runs[0] || {});
        const lh = typeof para.line === "number" ? para.line * (1 - (t.lnSpcReduction || 0)) : 1, L = typeof para.line === "string" ? parseFloat(para.line) : lh * p.pitch * Sz;
        const pe = ctx.make(box, "div", "p" + (pi++), { style: { position: "relative", flex: "none", textAlign: ALIGN[para.align] || "left", whiteSpace: t.wrap === "none" ? "pre" : "pre-wrap",
          overflowWrap: "break-word", fontFamily: famOf(big.font), fontSize: Sz + "px", lineHeight: L + "px", fontWeight: big.bold ? "700" : "400", fontStyle: big.italic ? "italic" : "normal",
          fontOpticalSizing: p.opsz[big.font] || "auto", marginTop: (para.before || 0) + "px", marginBottom: (para.after || 0) + "px", color: colour(big.color) || "#000" } });
        const marker = document.createElement("span"); Object.assign(marker.style, { display: "inline-block", width: "0px", height: "0px", verticalAlign: "baseline" }); pe.appendChild(marker);
        if (!runs.length) pe.appendChild(document.createTextNode(" "));
        let ri = 0;
        for (const r of runs) {
          if (r.br) { pe.appendChild(document.createElement("br")); continue; }
          ctx.make(pe, "span", "r" + (ri++), { text: r.text, style: { fontFamily: famOf(r.font), fontSize: (r.px || Sz) + "px", fontWeight: r.bold ? "700" : "400",
            fontStyle: r.italic ? "italic" : "normal", fontOpticalSizing: p.opsz[r.font] || "auto", color: colour(r.color) || colour(big.color) || "#000",
            letterSpacing: r.tracking_px ? r.tracking_px + "px" : "normal", lineHeight: "0", textDecoration: r.underline && r.underline !== "none" ? "underline" : "none",
            textTransform: r.cap === "all" ? "uppercase" : "none", background: r.highlight ? colour(r.highlight) || "none" : "none" } });
        }
        pending.push({ pe, marker, want: Math.min(lh, 1) * ((p.asc || {})[big.font] ?? p.asc0) * Sz + (((p.nudge || {})[e.z] || {}).y || 0) });
      }
    };
    const bg = colour(S.bg); if (bg && bg !== "none") host.style.background = bg;
    const build = (list, parent, ox, oy) => {
      for (const e of list) {
        const id = "z" + String(e.z).replace(/[^\w]/g, "_");
        if (e.children) { const g = ctx.make(parent, "div", id, { style: { position: "absolute", left: e.x - ox + "px", top: e.y - oy + "px", width: e.w + "px", height: e.h + "px" } });
          g.dataset.z = e.z; build(e.children, g, e.x, e.y); continue; }
        if (e.text && !e.img && !(e.fill && e.fill !== "none") && e.text.paras.every(q => q.runs.every(r => r.field || !String(r.text || "").trim()))) continue;   // slide number only
        const d = ctx.make(parent, "div", id, { style: { position: "absolute", left: e.x - ox + "px", top: e.y - oy + "px", width: e.w + "px", height: e.h + "px" } });
        d.dataset.z = e.z;
        if (e.img) picture(d, e);
        else if ((e.fill && e.fill !== "none") || (e.line && e.line !== "none")) shape(d, e);
        if (e.text) text(d, e);
      }
    };
    build(S.elements, host, 0, 0);
    // first baselines where the slide app puts them (fonts are loaded before presets run: film.json "fonts")
    for (const q of pending) { const got = q.marker.offsetTop; q.pe.style.top = (q.want - got) + "px"; q.marker.remove(); }
  },
});
