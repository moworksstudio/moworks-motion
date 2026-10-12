/* title/wordmark-tiles: a wordmark starts as a field of unresolved colour tiles; a rolling wave crosses the grid and each tile swaps its noise face
   for its piece of the final wordmark. Port of HyperFrames registry component wordmark-tiles (power-reel 12-tile-field). BLOCK: built inside the
   target (an empty box, usually the whole frame); cqw / cqh of the source are taken from that box. As in the source: stage 86 x 48 % of the box;
   columns 8-14 (12), rows = max(4, round(columns x 5 / 12)); fixed-seed LCG 0x57a7c1e for the noise faces (muted / brand / accent mixed into the
   surface) and their start opacity 0.72-1; wave order = column + row x 0.68 + sin(row x 1.7 + column x 0.42) x 2.15; stage fades in 0.38 s
   power2.out; from 0.2 s each tile (40 ms apart in wave order, capped so the wave ends inside IN 4.8 s) resolves in 0.5 s power2.out (wordmark
   piece opacity 0 -> 1, scale 0.82 -> 1; noise opacity -> 0, scale 1 -> 1.18); hold; exit 0.5 s power2.in at `duration` - 0.5 (exit: false keeps
   it). Wordmark: 800 weight, -0.035em, upper-case, size max(7, min(19, 86 / max(4, letters x 0.62))) cqw. Theme tokens of the source are params
   (its colour-mix mixes are computed here and written as rgb()). */
AIMK.preset("title/wordmark-tiles", {
  params: { text: "RA MẮT", columns: 12, waveStagger: 40, duration: 6.5, exit: true, bg: "transparent", surface: "#15171c", border: "#2a2f39", muted: "#6b7280", brand: "#71f5a7", accent: "#61a8ff", fg: "#f8fafc", radius: 18 },
  build(tl, els, p, ctx) {
    const hex = c => { const d = document.createElement("span"); d.style.color = c; document.body.appendChild(d); const m = getComputedStyle(d).color.match(/[\d.]+/g).map(Number); d.remove(); return m; };
    const mix = (a, b, wa) => { const A = hex(a), B = hex(b); return `rgb(${[0, 1, 2].map(i => Math.round(A[i] * wa + B[i] * (1 - wa))).join(", ")})`; };
    const faces = [mix(p.surface, p.muted, 0.64), mix(p.surface, p.brand, 0.58), mix(p.surface, p.accent, 0.56)], res = mix(p.surface, p.brand, 0.92);
    const text = String(p.text).normalize("NFC").trim().slice(0, 12) || "LAUNCH";
    const cols = Math.max(8, Math.min(14, Math.round(+p.columns || 12))), rows = Math.max(4, Math.round(cols * 5 / 12)), n = cols * rows;
    const ws = Math.max(15, Math.min(50, +p.waveStagger || 40)) / 1000;
    const D = Math.max(0.001, p.duration), OUT0 = p.exit ? 0.5 : 0, sc = D < 4.8 + OUT0 ? D / (4.8 + OUT0) : 1;
    const IN = 4.8 * sc, OUT = OUT0 * sc, HOLD = Math.max(0, D - IN - OUT), f = v => +v.toFixed(4), t = p.at;
    const TD = 0.5 * sc, WS = 0.2 * sc, step = Math.min(ws * sc, Math.max(0, (IN - WS - TD) / Math.max(1, n - 1)));
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, line = Math.min(0.12 * cw, 0.22 * ch), il = Math.min(0.08 * cw, 0.14 * ch);
      const sw = f(86 * cw), sh = f(48 * ch), fs = f(Math.max(7, Math.min(19, 86 / Math.max(4, [...text].length * 0.62))) * cw);
      const root = ctx.make(slot, "div", "root", { style: { position: "absolute", inset: "0px", overflow: "hidden", display: "grid", placeItems: "center", background: p.bg } });
      const stage = ctx.make(root, "div", "stage", { style: { position: "relative", width: sw + "px", height: sh + "px" } });
      const grid = ctx.make(stage, "div", "grid", { style: { width: "100%", height: "100%", display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        overflow: "hidden", border: `${f(line)}px solid ${p.border}`, borderRadius: p.radius + "px", background: p.surface } });
      const gi = { w: sw - 2 * line, h: sh - 2 * line };
      let seed = 0x57a7c1e; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
      const T = [];
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), c = i % cols, v = Math.floor(rnd() * 3), so = +(0.72 + rnd() * 0.28).toFixed(4);
        const tile = ctx.make(grid, "span", "t" + i, { style: { position: "relative", minWidth: "0px", minHeight: "0px", overflow: "hidden", boxShadow: `inset 0 0 0 ${f(il)}px ${p.border}`, background: p.surface } });
        const rv = ctx.make(tile, "span", "res", { style: { position: "absolute", inset: "0px", display: "block", overflow: "hidden", background: res, opacity: "0" } });
        ctx.make(rv, "span", "w", { text, style: { position: "absolute", left: f(-gi.w * c / cols) + "px", top: f(-gi.h * r / rows) + "px", width: f(gi.w) + "px", height: f(gi.h) + "px", display: "grid", placeItems: "center",
          color: p.fg, fontSize: fs + "px", fontWeight: "800", lineHeight: "1", letterSpacing: "-0.035em", textAlign: "center", textTransform: "uppercase", whiteSpace: "nowrap" } });
        const nz = ctx.make(tile, "span", "nz", { attrs: { "data-lint": "ignore" }, style: { position: "absolute", inset: "0px", display: "block", background: faces[v], opacity: String(so) } });   // noise face: covers its piece by design until it flips
        T.push({ rank: c + r * 0.68 + Math.sin(r * 1.7 + c * 0.42) * 2.15, rv, nz, so });
      }
      T.sort((a, b) => a.rank - b.rank);
      tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: f(0.38 * sc), ease: "power2.out" }, t);
      T.forEach((x, k) => {
        const at = f(t + WS + k * step);
        tl.fromTo(x.rv, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: f(TD), ease: "power2.out" }, at);
        tl.fromTo(x.nz, { opacity: x.so, scale: 1 }, { opacity: 0, scale: 1.18, duration: f(TD), ease: "power2.out" }, at);
      });
      if (OUT) tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, f(t + IN + HOLD));
    }
  },
});
