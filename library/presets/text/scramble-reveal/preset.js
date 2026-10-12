/* text/scramble-reveal: the line starts as deterministic wrong glyphs and resolves one character at a time, left to right.
   Port of HyperFrames registry component scramble-reveal (motion only: the source's terminal frame, ">_" prefix, monospace font and colours
   belong to the film). Source envelope: arrival 0.42 s (opacity power2.out, x -4 % of the width power3.out, y 2.4 % of the height sine.inOut),
   the glyph rows change at 30 fps and lock left to right (first lock at frame 6, last lock at frame 45 = 1.5 s), a drift of -0.55 % of the
   height (sine.inOut yoyo) fills the hold and ends with 0.3 s of stillness, optional exit "fade" | "up" (0.45 s).
   The glyph rows come from the source's fixed-seed LCG (0x27c0ffee), computed here at build time and written into the film as a literal
   table; the film code only reads row floor(progress x 30). The scrambled glyphs are an overlay on top of an invisible copy of the real
   text (the copy keeps the layout), left-aligned to it, so the locked prefix sits exactly where the final text will be.
   The x / y motion is on that inline-block copy (not on the target), so it never fights a CSS centring transform of the target. */
AIMK.preset("text/scramble-reveal", {
  params: { glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+?<>", seed: 0x27c0ffee, fps: 30, inDur: 1.65, arrival: 0.42, lockTail: 0.15, firstLock: 0.2,
            x: 0.04, y: 0.024, hold: 1.35, stillness: 0.3, drift: 0.0055, exit: "none" },
  build(tl, els, p, ctx) {
    const FPS = p.fps, last = Math.max(1, Math.round(Math.max(0, p.inDur - p.lockTail) * FPS));
    const x0 = +(p.x * ctx.W).toFixed(1), y0 = +(p.y * ctx.H).toFixed(1), drift = +(p.drift * ctx.H).toFixed(2);
    for (const el of els) {
      const text = el.textContent, chars = Array.from(text);
      /* the source's frame table: LCG, left-to-right monotonic lock frames */
      let state = p.seed >>> 0;
      const firstLock = Math.min(last, Math.max(1, Math.round(p.firstLock * FPS)));
      const lock = chars.map((c, i) => /\s/.test(c) ? 0 : Math.round(firstLock + (chars.length <= 1 ? 1 : i / (chars.length - 1)) * (last - firstLock)));
      const rows = [];
      for (let f = 0; f <= last; f++) {
        rows.push(chars.map((c, i) => {
          if (/\s/.test(c) || f >= lock[i]) return c;
          state = (Math.imul(1664525, state) + 1013904223) >>> 0;
          const gi = state % p.glyphs.length; let g = p.glyphs.charAt(gi);
          if (g === c) g = p.glyphs.charAt((gi + 1) % p.glyphs.length);
          return g;
        }).join(""));
      }
      ctx.id(el, "t"); el.textContent = "";
      const base = ctx.make(el, "span", "base", { text, style: { display: "inline-block", position: "relative", visibility: "hidden" } });
      const ov = ctx.make(base, "span", "ov", { text: rows[0], style: { position: "absolute", left: "0px", top: "0px", visibility: "visible", whiteSpace: "pre" } });
      const v = "sc_" + el.id.replace(/\W/g, "_");
      ctx.code(`  // scramble-reveal #${el.id}: glyph row = floor(progress x ${FPS}) of the fixed-seed table
  const ${v} = { f: 0 }, ${v}_rows = ${JSON.stringify(rows)};
  tl.fromTo(${v}, { f: 0 }, { f: ${last}, duration: ${+(last / FPS).toFixed(4)}, ease: "none", onUpdate: () => {
    document.getElementById("${ov.id}").textContent = ${v}_rows[Math.min(${last}, Math.floor(${v}.f + 1e-6))];
  } }, ${p.at});`);
      const A = p.arrival, t = p.at;
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: A, ease: "power2.out" }, t);
      tl.fromTo(base, { x: -x0 }, { x: 0, duration: A, ease: "power3.out" }, t);
      tl.fromTo(base, { y: y0 }, { y: 0, duration: A, ease: "sine.inOut" }, t);
      const half = Math.max(0, p.hold - p.stillness) / 2;
      if (half > 0) tl.fromTo(base, { y: 0 }, { y: -drift, duration: half, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, t + p.inDur);
      const outAt = t + p.inDur + p.hold;
      if (p.exit === "up") {
        tl.to(base, { x: +(0.05 * ctx.W).toFixed(1), duration: 0.45, ease: "power2.in" }, outAt);
        tl.to(base, { y: -+(0.035 * ctx.H).toFixed(1), duration: 0.45, ease: "sine.inOut" }, outAt);
        tl.to(el, { opacity: 0, duration: 0.45, ease: "power2.in" }, outAt);
      } else if (p.exit === "fade") tl.to(el, { opacity: 0, duration: 0.45, ease: "power2.in" }, outAt);
    }
  },
});
