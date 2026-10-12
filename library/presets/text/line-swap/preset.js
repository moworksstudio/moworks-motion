/* text/line-swap: a whole line rises into a mask and holds; on the beat it leaves upward through the mask while a second line rises into its place,
   then an accent bar draws under one word of the new line. Port of HyperFrames registry component line-swap (phases, eases and the underline as in
   the source: line A in 0.5 s power4.out; at the beat A out 0.35 s power2.in, B in 0.22 s later 0.5 s power4.out; bar 0.15 s after B lands, 0.45 s
   power2.out, scaleX from the left; optional exit fade | up, 0.45 s power2.in at the end). EFFECT on a text element: its own text is line A.
   The source's mask was 1.42 em tall with the lines moving 115 %; here the mask has `pad` em of room above and below (Vietnamese marks, the bar) and
   the lines travel one line plus that room, so they are fully hidden outside it. The source's character-count font fit is the film element's size. */
AIMK.preset("text/line-swap", {
  params: { lineB: "Nhưng hiếm ai hứa trao bạn quyền kiểm soát.", underline: "kiểm soát", accent: "#71f5a7", swapAt: 1.5, exit: "none", duration: 3.5, pad: 0.3 },
  build(tl, els, p, ctx) {
    const acc = { green: "#71f5a7", blue: "#61a8ff", violet: "#c5a3ff" }[p.accent] || p.accent, swap = Math.max(0.5, +p.swapAt || 0);
    for (const el of els) {
      const id = ctx.id(el, "t"), A = el.textContent.normalize("NFC"), B = String(p.lineB).normalize("NFC"), cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize) || 48, lh = parseFloat(cs.lineHeight) || fs * 1.2, pad = Math.round(fs * p.pad), T = Math.ceil(lh + pad + 0.25 * fs);
      const ji = { center: "center", right: "end", end: "end" }[cs.textAlign] || "start";
      el.textContent = "";
      const box = document.createElement("span"); box.id = id + "_mask";
      Object.assign(box.style, { display: "inline-grid", justifyItems: ji, verticalAlign: "top", overflow: "hidden", padding: `${pad}px 0`, margin: `-${pad}px 0` });
      const line = suf => { const s = document.createElement("span"); s.id = id + suf; Object.assign(s.style, { gridArea: "1 / 1", display: "block" }); box.appendChild(s); return s; };
      const a = line("_a"); a.textContent = A;
      const b = line("_b"), u = String(p.underline || "").normalize("NFC"), m = u ? B.toLowerCase().indexOf(u.toLowerCase()) : -1;
      let bar = null;
      if (m >= 0) {
        if (m > 0) b.appendChild(document.createTextNode(B.slice(0, m)));
        const wrap = document.createElement("span"); Object.assign(wrap.style, { position: "relative", display: "inline-block", whiteSpace: "nowrap" });
        wrap.appendChild(document.createTextNode(B.slice(m, m + u.length)));
        bar = document.createElement("span"); bar.id = id + "_bar";
        Object.assign(bar.style, { position: "absolute", left: "0.02em", right: "0.02em", bottom: "-0.14em", height: "0.055em", borderRadius: "0.03em", background: acc, transformOrigin: "left center" });
        wrap.appendChild(bar); b.appendChild(wrap);
        if (m + u.length < B.length) b.appendChild(document.createTextNode(B.slice(m + u.length)));
      } else b.textContent = B;
      el.appendChild(box);
      const t0 = p.at, land = t0 + swap + 0.22 + 0.5;
      tl.fromTo(a, { y: T }, { y: 0, duration: 0.5, ease: "power4.out" }, t0);
      tl.fromTo(b, { y: T }, { y: 0, duration: 0.5, ease: "power4.out" }, +(t0 + swap + 0.22).toFixed(4));
      tl.fromTo(a, { y: 0 }, { y: -T, duration: 0.35, ease: "power2.in" }, +(t0 + swap).toFixed(4));
      if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, +(land + 0.15).toFixed(4));
      if (p.exit === "fade" || p.exit === "up") {
        const to = { opacity: 0, duration: 0.45, ease: "power2.in" }; if (p.exit === "up") to.y = -Math.round(0.07 * ctx.H);
        tl.fromTo(box, p.exit === "up" ? { opacity: 1, y: 0 } : { opacity: 1 }, to, +(t0 + Math.max(p.duration, land + 0.6 - t0 + 0.45) - 0.45).toFixed(4));
      }
    }
  },
});
