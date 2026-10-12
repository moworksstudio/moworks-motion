/* card/logo-wall: a "trusted by" wall of placeholder lettermark logos assembles in DOM order: each cell fades and scales (0.94 -> 1) straight into its final grid slot
   with a fixed per-cell delay, then the wall holds still and fades out at the end of `duration`.
   Port of HyperFrames registry component logo-wall. BLOCK: built inside the target box and sized from it (source: container units of its mount box). No brand artwork:
   the marks are two-letter lettermarks (params, default the source's AX, BL, CY ...), replace them with the client's marks.
   Source timing kept: assemble from 0.15 s, cell 0.55 s power2.out, `stagger` ms between cells, out 0.5 s power2.in; IN and OUT scale together when `duration` < 3 s. */
AIMK.preset("card/logo-wall", {
  params: { heading: "Được tin dùng bởi các đội nhóm", rows: 3, cols: 5, stagger: 45, marks: "AX,BL,CY,DQ,EV,FK,GN,HT,IP,JR,KS,LU,MW,NX,OZ,PA,QC,RF,SG,TJ,VK,WL,XM,YN", duration: 5,
    bg: "#080b13", fg: "#f6f8fc", muted: "#a7b0c1", surface: "#151b29", border: "#344057", radius: 18 },
  build(tl, els, p, ctx) {
    const hx = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hx(h).join(",")},${a})`;
    const t = p.at, clampN = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : d)); };
    const rows = clampN(p.rows, 2, 4, 3), cols = clampN(p.cols, 3, 6, 5), sv = Number(p.stagger), staggerMs = Math.max(20, Math.min(75, Number.isFinite(sv) ? sv : 45));
    const given = (Array.isArray(p.marks) ? p.marks.map(String) : String(p.marks || "").split(",")).map(s => s.trim()).filter(Boolean);
    const mark = i => given[i] || String.fromCharCode(65 + (i * 5 + 3) % 26) + String.fromCharCode(65 + (i * 11 + 7) % 26);
    const D = Math.max(0.001, Number(p.duration) || 5), IN_B = 2.5, OUT_B = 0.5, sc = D < IN_B + OUT_B ? D / (IN_B + OUT_B) : 1, OUT = OUT_B * sc, OUT_START = D - OUT;
    ctx.css("card/logo-wall", `
.clw-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.clw-stage { display: grid; grid-template-rows: auto minmax(0, 1fr); box-sizing: border-box; }
.clw-heading { display: flex; align-items: center; justify-content: center; font-weight: 650; letter-spacing: 0.08em; line-height: 1; text-transform: uppercase; }
.clw-grid { min-width: 0; min-height: 0; display: grid; }
.clw-cell { min-width: 0; min-height: 0; display: grid; place-items: center; overflow: hidden; box-sizing: border-box; }
.clw-mark { display: grid; place-items: center; aspect-ratio: 1; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H, cw = v => v * W / 100, ch = v => v * H / 100, m = (a, b) => Math.min(cw(a), ch(b));
      const box = ctx.make(slot, "div", "lw", { cls: "clw-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px", color: p.fg } });
      const stage = ctx.make(box, "section", "stage", { cls: "clw-stage", style: { width: cw(86) + "px", height: ch(82) + "px", gap: ch(3) + "px", padding: ch(3) + "px" } });
      const hd = ctx.make(stage, "div", "heading", { cls: "clw-heading", style: { gap: ch(1.6) + "px", color: p.muted, fontSize: m(2.6, 4.4) + "px" } });
      const rule = () => ({ width: cw(8) + "px", height: cw(0.14) + "px", background: p.border });
      ctx.make(hd, "span", "l", { style: rule() });
      ctx.make(hd, "span", "t", { text: p.heading });
      ctx.make(hd, "span", "r", { style: rule() });
      const grid = ctx.make(stage, "div", "grid", { cls: "clw-grid", style: { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, gap: ch(1.6) + "px" } });
      const cells = Array.from({ length: rows * cols }, (_, i) => {
        const c = ctx.make(grid, "div", "c" + i, { cls: "clw-cell", style: { border: `${cw(0.14)}px solid ${p.border}`, borderRadius: p.radius + "px", background: p.surface, boxShadow: `0 ${ch(1.2)}px ${ch(3)}px ${rgba(p.bg, 0.58)}` } });
        ctx.make(c, "span", "m", { cls: "clw-mark", text: mark(i), style: { width: m(5.5, 9.5) + "px", borderRadius: p.radius * 0.72 + "px", background: rgba(p.fg, 0.72), color: p.bg, fontSize: m(2.2, 4) + "px" } });
        return c;
      });
      cells.forEach((c, i) => tl.fromTo(c, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.55 * sc, ease: "power2.out" }, t + 0.15 * sc + i * staggerMs / 1000 * sc));   // source: one tween with stagger { each, from: start }
      tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: OUT, ease: "power2.in" }, t + OUT_START);
    }
  },
});
