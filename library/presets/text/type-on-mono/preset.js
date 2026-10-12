/* text/type-on-mono: camera-screen text typed on, one character after another over `duration` seconds, no caret: each character is a
   span (ctx.split) shown by a 0.01 s opacity step, so it ports to After Effects as plain keyframes. Unlike text/typewriter (a caret, a
   code block) it is keyframes only. Written for a studio film (08/10/2026, mono labels of a viewfinder HUD).
   params: duration (s to type the whole line) */
AIMK.preset("text/type-on-mono", { params: { duration: 0.6 },
  build(tl, els, p, ctx) {
    for (const el of els) {
      const ch = ctx.split(el, "chars"), n = Math.max(1, ch.length);
      ch.forEach((c, i) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none" }, +(p.at + i * p.duration / n).toFixed(4)));
    }
  } });
