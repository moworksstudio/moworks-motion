/* data/countdown: a real countdown timer (mm:ss, ss or hh:mm:ss) whose digits roll like an odometer: each changing digit glides from its old value
   to the new one over the last 30 % of every second, so the number settles exactly on the beat. After iart-ai tiktok-video-skills,
   countdown-video / digit-flip (MIT): a stack of 0-9 per digit translated by -digit x height; roll from 0.7 to 1.0 of each second with
   Easing.bezier(0.22, 1, 0.36, 1); tabular figures. EFFECT on a text element (its own text is replaced; its font, size and colour are kept).
   from = seconds shown at `at`; it counts down once per second to `to`. */
AIMK.preset("data/countdown", {
  params: { from: 10, to: 0, format: "mm:ss", roll: 0.3 },
  build(tl, els, p, ctx) {
    const E = "custom(M0,0 C 0.22,1 0.36,1 1,1)", f = v => +v.toFixed(4);
    const fmt = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60, z = n => String(n).padStart(2, "0");
      return p.format === "ss" ? String(s).padStart(2, "0") : p.format === "hh:mm:ss" ? `${z(h)}:${z(m)}:${z(x)}` : `${z(Math.floor(s / 60))}:${z(x)}`; };
    for (const el of els) {
      const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 120, lh = Math.round((parseFloat(cs.lineHeight) || fs * 1.15));
      ctx.id(el, "t"); el.textContent = ""; el.style.fontVariantNumeric = "tabular-nums";
      const first = fmt(+p.from), reels = [];
      [...first].forEach((ch, i) => {
        if (!/\d/.test(ch)) { ctx.make(el, "span", "s" + i, { text: ch, style: { display: "inline-block", verticalAlign: "top", height: lh + "px", lineHeight: lh + "px" } }); reels.push(null); return; }
        const win = ctx.make(el, "span", "w" + i, { style: { display: "inline-block", verticalAlign: "top", overflow: "hidden", boxSizing: "content-box", height: lh + "px" } });
        const stack = ctx.make(win, "span", "r", { style: { display: "block" } });
        for (let n = 0; n <= 9; n++) ctx.make(stack, "span", "n" + n, { text: String(n), style: { display: "block", height: lh + "px", lineHeight: lh + "px", textAlign: "center" } });
        reels.push(stack);
      });
      const step = +p.from >= +p.to ? -1 : 1;
      reels.forEach((r, i) => { if (r) tl.set(r, { y: -(+first[i]) * lh }, p.at); });
      for (let s = +p.from, k = 0; s !== +p.to; s += step, k++) {
        const a = fmt(s), b = fmt(s + step), t1 = p.at + k + 1, t0 = f(t1 - p.roll);
        reels.forEach((r, i) => { if (r && a[i] !== b[i]) tl.fromTo(r, { y: -(+a[i]) * lh }, { y: -(+b[i]) * lh, duration: p.roll, ease: E }, t0); });
      }
    }
  },
});
