/* text/caret-swap: a gradient caret appears at the end of the line, sweeps back over it like a selection that wipes the text away, collapses to a
   caret at the start, then the new line types itself out (faster and faster) while the line glides so it ends centred; the caret then blinks.
   Port of HyperFrames registry component caret-swap (from remocn, MIT). Frames at 30 fps from `at`, as in the source: cover shows at 13, expands
   over the line 20 -> 26 (ease M0,0 C0.6,0 0.8,0.4 1,1) while its mask fades its right side (stop 100 % -> 10 %), the old text is gone at 26, the
   cover collapses to caret width 26 -> 33 (ease M0,0 C0.2,0.7 0.3,1 1,1), the typing starts at 40 with character i at 40 + (1 - 0.96^i) / 0.04,
   the caret blinks every 8 frames after the last character + 8 until `duration` (all frames shrink together when duration is too short).
   EFFECT on a one-line text element: its own text is the old line; `to` is the new line. Caret 0.08 em wide, 1.1 em tall, 0.06 em after the text,
   gradient caretColor -> caretColorEnd. The source's bundled Geist (Latin only) is the film element's font. */
AIMK.preset("text/caret-swap", {
  params: { to: "Đó là lúc ai cũng bỏ cuộc", caretColor: "#ff4daa", caretColorEnd: "#8a5cf6", duration: 3.3333 },
  build(tl, els, p, ctx) {
    const te = c => (1 - Math.pow(0.96, c)) / 0.04;
    for (const el of els) {
      const from = el.textContent.normalize("NFC").replace(/\s+/g, " ").trim(), to = String(p.to).normalize("NFC").replace(/\s+/g, " ").trim();
      const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 72, cw = +(fs * 0.08).toFixed(2), gap = +(fs * 0.06).toFixed(2);
      const grad = `linear-gradient(180deg, ${p.caretColor}, ${p.caretColorEnd})`;
      ctx.id(el, "t"); el.textContent = ""; el.style.whiteSpace = "pre";
      if (cs.position === "static") el.style.position = "relative";
      const src = ctx.make(el, "span", "from", { text: from, style: { display: "inline-block" } });
      ctx.make(el, "span", "spacer", { style: { display: "inline-block", width: cw + "px", marginLeft: gap + "px", height: "1px" } });
      const cover = ctx.make(el, "span", "cover", { style: { position: "absolute", left: "0px", top: "calc(50% - 0.55em)", height: "1.1em", width: cw + "px", borderRadius: "0.03em",
        background: grad, opacity: "0", "--cs-stop": "100%", webkitMaskImage: "linear-gradient(90deg, black var(--cs-stop), transparent 100%)", maskImage: "linear-gradient(90deg, black var(--cs-stop), transparent 100%)" } });
      const tgt = ctx.make(el, "span", "to", { style: { position: "absolute", left: "0px", top: "0px", height: "100%", display: "flex", alignItems: "center", opacity: "0" } });
      const line = ctx.make(tgt, "span", "line", { style: { position: "relative", display: "inline-block" } });
      const G = [...new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(to)].map(s => s.segment);
      const C = G.map((g, i) => ctx.make(line, "span", "c" + i, { text: g, style: { opacity: "0" } }));
      const caret = ctx.make(tgt, "span", "caret", { style: { position: "absolute", left: "0px", top: "calc(50% - 0.55em)", height: "1.1em", width: cw + "px", marginLeft: gap + "px", borderRadius: "0.03em", background: grad } });
      const AW = el.offsetWidth, TW = line.offsetWidth, shift = (AW - TW - cw - gap) / 2;
      const pre = C.map(c => c.offsetLeft + c.offsetWidth);
      const end = 40 + te(G.length), k = Math.min(1, (p.duration * 30) / (end + 8)), F = f => +(p.at + (f / 30) * k).toFixed(4);
      tl.set(cover, { opacity: 1 }, F(13));
      tl.fromTo(cover, { width: cw, x: +(AW - cw).toFixed(2), "--cs-stop": "100%" }, { width: AW, x: 0, "--cs-stop": "10%", duration: +((6 / 30) * k).toFixed(4), ease: "custom(M0,0 C 0.6,0 0.8,0.4 1,1)" }, F(20));
      tl.set(src, { opacity: 0 }, F(26));
      tl.fromTo(cover, { width: AW, "--cs-stop": "10%" }, { width: cw, "--cs-stop": "100%", duration: +((7 / 30) * k).toFixed(4), ease: "custom(M0,0 C 0.2,0.7 0.3,1 1,1)" }, F(26));
      tl.set(cover, { opacity: 0 }, F(40));
      tl.set(tgt, { opacity: 1 }, F(40));
      C.forEach((c, i) => {
        const t = F(40 + te(i));
        tl.set(c, { opacity: 1 }, t);
        tl.set(caret, { x: +pre[i].toFixed(2) }, t);
        tl.set(tgt, { x: +((shift * (i + 1)) / C.length).toFixed(2) }, t);
      });
      for (let f = end + 8, b = 0; (f / 30) * k < p.duration; f += 8, b++) tl.set(caret, { opacity: b % 2 }, F(f));
    }
  },
});
