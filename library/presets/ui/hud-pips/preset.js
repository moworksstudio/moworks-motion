/* ui/hud-pips: a row of small HUD pips (a game-style counter) that light up one per word / beat: the target box gets `n` pips; pip k turns
   on at times[k] (seconds from the motion's at) and stays on. Written for a studio 8-bit lyric film (08/10/2026: one pip per sung word of
   a line). params: n, times [s, ...], on (colour), off (colour), size (px), gap (px), round (true: circles) */
AIMK.preset("ui/hud-pips", { params: { n: 6, times: [], on: "#ffffff", off: "rgba(255,255,255,0.22)", size: 34, gap: 12, round: false },
  build(tl, els, p, ctx) {
    for (const el of els) {
      for (let k = 0; k < p.n; k++) {
        const d = ctx.make(el, "div", "pip" + k, { style: { position: "absolute", left: k * (p.size + p.gap) + "px", top: "0px", width: p.size + "px",
          height: p.size + "px", background: p.off, borderRadius: p.round ? "50%" : "0px" } });
        if (k < p.times.length) tl.set(d, { backgroundColor: p.on }, +(p.at + +p.times[k]).toFixed(4));
      }
    }
  } });
