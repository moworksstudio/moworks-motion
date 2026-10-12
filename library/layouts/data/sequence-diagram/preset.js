/* data/sequence-diagram: a sequence diagram tells a request's story: participant boxes with dashed lifelines, then each message arrow draws
   from one lifeline to the other in order, its label dropping in as the arrow lands, with a hold so it reads. After iart-ai
   explainer-video-skills, diagram-animation / diagram-and-chart-recipes #2 (MIT): arrow draw 0.5 s power1.inOut (dash offset 1 -> 0), label
   from 4 px above 0.3 s overlapping the arrow's last 0.2 s, 0.6 s hold between messages. BLOCK: built inside the target box; participants
   spread across its width. messages: "From>To: text" lines separated by |; a reply (dashed) is written "To<From: text". */
AIMK.preset("data/sequence-diagram", {
  params: { participants: "Người dùng|Ứng dụng|Máy chủ|Cơ sở dữ liệu",
            messages: "Người dùng>Ứng dụng: Bấm Đặt hàng|Ứng dụng>Máy chủ: POST /orders|Máy chủ>Cơ sở dữ liệu: Lưu đơn|Máy chủ<Cơ sở dữ liệu: OK|Ứng dụng<Máy chủ: 201 Created|Người dùng<Ứng dụng: Đặt hàng thành công",
            accent: "#0a84ff", ink: "#e8edf5", muted: "#5b6575", box: "#18202b", draw: 0.5, hold: 0.6 },
  build(tl, els, p, ctx) {
    const parts = String(p.participants).split("|").map(s => s.trim().normalize("NFC")).filter(Boolean);
    const msgs = String(p.messages).split("|").map(s => s.trim().normalize("NFC")).filter(Boolean).map(s => {
      const m = s.match(/^(.+?)\s*([<>])\s*(.+?)\s*:\s*(.*)$/); if (!m) return null;
      return m[2] === ">" ? { a: m[1], b: m[3], text: m[4], reply: false } : { a: m[3], b: m[1], text: m[4], reply: true };
    }).filter(Boolean);
    const NS = "http://www.w3.org/2000/svg", f = v => +v.toFixed(2);
    const REPLY = Array(42).fill("0.0119 0.0119").join(" ") + " 0.0004 1";   // a dashed reply that still reveals with offset 1 -> 0 (pattern sums to 1, then a gap of 1)
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, id = ctx.id(slot, "b"), n = parts.length;
      const svg = document.createElementNS(NS, "svg"); svg.id = id + "_seq"; svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`); svg.setAttribute("width", bw); svg.setAttribute("height", bh);
      Object.assign(svg.style, { position: "absolute", inset: "0px", overflow: "visible", fontFamily: '"RFlex", sans-serif' }); slot.appendChild(svg);
      const mk = (parent, tag, at, idn, txt) => { const e = document.createElementNS(NS, tag); if (idn) e.id = idn; for (const k in at) e.setAttribute(k, String(at[k])); if (txt != null) e.textContent = txt; parent.appendChild(e); return e; };
      const defs = mk(svg, "defs", {});
      const ar = mk(defs, "marker", { id: svg.id + "_ah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
      mk(ar, "path", { d: "M0,0 L10,5 L0,10 z", fill: p.accent });
      const fs = Math.round(Math.min(bw / (n * 9), bh / 22)), top = bh * 0.08, boxH = fs * 2.4, x = i => bw * (i + 0.5) / n;
      const life0 = top + boxH, life1 = bh * 0.96, step = (life1 - life0 - fs * 2) / Math.max(1, msgs.length);
      const heads = parts.map((name, i) => {
        const g = mk(svg, "g", { opacity: 0 }, `${svg.id}_p${i}`), w = Math.min(bw / n * 0.82, fs * (name.length * 0.62 + 2.4));
        mk(g, "rect", { x: f(x(i) - w / 2), y: f(top), width: f(w), height: f(boxH), rx: f(fs * 0.4), fill: p.box, stroke: p.muted, "stroke-width": 1.5 });
        mk(g, "text", { x: f(x(i)), y: f(top + boxH / 2), fill: p.ink, "font-size": fs, "font-weight": 700, "text-anchor": "middle", "dominant-baseline": "central" }, null, name);
        mk(g, "line", { x1: f(x(i)), y1: f(life0), x2: f(x(i)), y2: f(life1), stroke: p.muted, "stroke-width": 1.5, "stroke-dasharray": "6 6" });
        return g;
      });
      let t = p.at;
      heads.forEach((g, i) => tl.fromTo(g, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, f(t + i * 0.08)));
      t += 0.4 + (n - 1) * 0.08 + 0.2;
      msgs.forEach((m, k) => {
        const ia = parts.indexOf(m.a), ib = parts.indexOf(m.b); if (ia < 0 || ib < 0) return;
        const y = life0 + fs * 1.6 + k * step, x1 = x(ia), x2 = x(ib), dir = Math.sign(x2 - x1) || 1;
        const line = mk(svg, "path", { d: `M${f(x1 + dir * 4)},${f(y)} L${f(x2 - dir * 6)},${f(y)}`, stroke: p.accent, "stroke-width": 2.5, fill: "none", pathLength: 1,
          "stroke-dasharray": m.reply ? REPLY : "1 1", "stroke-dashoffset": 1, opacity: 0 }, `${svg.id}_m${k}`);
        const lab = mk(svg, "text", { x: f((x1 + x2) / 2), y: f(y - fs * 0.55), fill: p.ink, "font-size": f(fs * 0.82), "text-anchor": "middle", opacity: 0 }, `${svg.id}_t${k}`, m.text);
        tl.set(line, { opacity: 1 }, f(t));
        tl.fromTo(line, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: p.draw, ease: "power1.inOut" }, f(t));
        tl.set(line, { attr: { "marker-end": `url(#${svg.id}_ah)` } }, f(t + p.draw * 0.85));   // the head appears as the line arrives
        tl.fromTo(lab, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, f(t + p.draw - 0.2));
        t += p.draw - 0.2 + 0.3 + p.hold;
      });
    }
  },
});
