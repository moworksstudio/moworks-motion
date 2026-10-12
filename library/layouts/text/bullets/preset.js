/* text/bullets: a presentation bullet list builds in reading order: each line fades in and rises 18 px with a critically damped spring (arrives,
   never bounces), 0.27 s apart, an accent dot leading each line. After iart-ai data-animation-skills, presentation-video / slide-components (MIT):
   useEnter (spring damping 200 over 12 frames at 30 fps, opacity 0 -> 1, translateY 18 -> 0), STAGGER 8 frames, 28 px between items, 12 px dot.
   The spring is fitted to one custom() Bezier (fit error in the gallery check). BLOCK: built inside the target box (lines wrap to its width);
   items are separated by |. Optional title above. */
AIMK.preset("text/bullets", {
  params: { items: "Dựng phim từ HTML|Xuất PNG hoặc dự án After Effects|Giữ đúng font và màu thương hiệu|Kiểm tra trước khi giao", title: "",
            accent: "#0a84ff", ink: "#f5f5f2", size: 54, gap: 28, stagger: 0.267, enter: 0.4 },
  build(tl, els, p, ctx) {
    const ease = ctx.ease(u => { const a = 9.2; return u <= 0 ? 0 : u >= 1 ? 1 : (1 - (1 + a * u) * Math.exp(-a * u)) / (1 - (1 + a) * Math.exp(-a)); }, "critically damped spring (12 frames)");
    const items = (Array.isArray(p.items) ? p.items : String(p.items).split("|")).map(s => String(s).trim().normalize("NFC")).filter(Boolean), f = v => +v.toFixed(4);
    for (const slot of els) {
      const root = ctx.make(slot, "div", "list", { style: { position: "absolute", inset: "0px", display: "flex", flexDirection: "column", justifyContent: "center", gap: p.gap + "px", color: p.ink } });
      const rows = [];
      if (p.title) rows.push(ctx.make(root, "div", "title", { text: String(p.title).normalize("NFC"), style: { fontSize: Math.round(p.size * 1.35) + "px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: Math.round(p.gap * 0.6) + "px" } }));
      items.forEach((t, i) => {
        const li = ctx.make(root, "div", "i" + i, { style: { display: "flex", gap: "20px", alignItems: "baseline", fontSize: p.size + "px", fontWeight: "400", lineHeight: "1.35" } });
        ctx.make(li, "span", "dot", { style: { width: "12px", height: "12px", borderRadius: "6px", background: p.accent, flexShrink: "0", transform: "translateY(-0.18em)" } });
        ctx.make(li, "span", "t", { text: t });
        rows.push(li);
      });
      rows.forEach((r, i) => tl.fromTo(r, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: p.enter, ease }, f(p.at + i * p.stagger)));
    }
  },
});
