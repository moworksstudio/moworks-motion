/* text/slot-roll: every character is a slot-machine reel that starts on a zero and rolls one row to land on its character (0.52 s, power3.inOut,
   reels 0.06 s apart). Port of HyperFrames registry component slot-machine-roll (timing and ease as in the source; its variables are params:
   direction up | down, start = the character every reel starts on, "0" in the source). EFFECT on a text element: its own text is the result
   (one reel per character, spaces stay gaps). Each reel window has `pad` em of room above and below so Vietnamese marks are not cut; the reel rolls
   one row plus that room (the source: exactly one 1-em row). The source's monospace face: use the kit's "RMono" on the element for the same look. */
AIMK.preset("text/slot-roll", {
  params: { direction: "up", start: "0", duration: 0.52, stagger: 0.06, pad: 0.3 },
  build(tl, els, p, ctx) {
    const up = p.direction !== "down";
    for (const el of els) {
      const txt = el.textContent.normalize("NFC"), cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 74;
      const lh = parseFloat(cs.lineHeight) || fs * 1.2, pad = Math.round(fs * p.pad), T = Math.round(lh + 2 * pad);
      ctx.id(el, "t"); el.textContent = "";
      let k = 0;
      [...txt].forEach((ch, i) => {
        if (/\s/.test(ch)) { el.appendChild(document.createTextNode(ch)); return; }
        const slot = ctx.make(el, "span", "s" + i, { style: { display: "inline-block", verticalAlign: "top", overflow: "hidden", boxSizing: "content-box", height: lh + "px", padding: `${pad}px 0`, margin: `-${pad}px 0` } });
        const reel = ctx.make(slot, "span", "reel", { style: { display: "block" } });
        const rows = up ? [p.start, ch] : [ch, p.start];
        rows.forEach((r, j) => ctx.make(reel, "span", "r" + j, { text: r, style: { display: "block", textAlign: "center", height: lh + "px", marginTop: j ? 2 * pad + "px" : "0px" } }));
        tl.fromTo(reel, { y: up ? 0 : -T }, { y: up ? -T : 0, duration: p.duration, ease: "power3.inOut" }, +(p.at + k++ * p.stagger).toFixed(4));
      });
    }
  },
});
