/* data/audiogram: sound made visible: mirrored frequency bars (bass in the middle, splaying outward) or a smooth oscilloscope line that move
   with a voice or music file, frame by frame. After iart-ai youtube-video-skills, audiogram / waveform-render (MIT): 16 frequencies mirrored to
   32 bars, boost x4 clamped (speech rarely fills the range), ~3 frames of smoothing, 6 px gap, rounded bars; or 64 waveform points per frame.
   BLOCK: built inside the target box (bars fill its height). The sound is analysed when the film loads by engine/vendor/libs/kit/audiogram.js
   (decode + per-frame spectrum; the kit's player waits for it), so the same file gives the same picture every time. src = the sound inside the
   film folder (e.g. "audio/voice/vo.mp3"); offset = where in the sound the picture starts at `at`; duration = how long it moves. */
AIMK.preset("data/audiogram", {
  params: { src: "assets/demo/audiogram-demo.mp3", mode: "bars", bands: 16, points: 64, mirror: true, color: "#ffffff", boost: 4, smooth: 3, gap: 6, barWidth: 0,
            radius: 6, minBar: 6, stroke: 4, fLo: 70, fHi: 4000, offset: 0, duration: 7, fps: 30 },
  build(tl, els, p, ctx) {
    for (const slot of els) {
      const id = ctx.id(slot, "b"), bw = slot.offsetWidth || 1200, bh = slot.offsetHeight || 240;
      const root = ctx.make(slot, "div", "ag", { style: { position: "absolute", inset: "0px", display: "flex", alignItems: "center", justifyContent: "center", gap: p.gap + "px" } });
      if (p.mode === "wave") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("width", bw); svg.setAttribute("height", bh); svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`);
        const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        Object.entries({ points: `0,${bh / 2} ${bw},${bh / 2}`, fill: "none", stroke: p.color, "stroke-width": p.stroke, "stroke-linejoin": "round", "stroke-linecap": "round", "data-w": bw, "data-h": bh })
          .forEach(([k, v]) => pl.setAttribute(k, String(v)));
        svg.appendChild(pl); root.appendChild(svg);
      } else {
        const n = p.mirror ? 2 * p.bands : p.bands, w = p.barWidth > 0 ? p.barWidth : Math.max(2, Math.floor((bw - (n - 1) * p.gap) / n));
        for (let i = 0; i < n; i++) ctx.make(root, "div", "b" + i, { attrs: { "data-bar": "" }, style: { width: w + "px", height: p.minBar + "px", borderRadius: p.radius + "px", background: p.color, flex: "0 0 auto" } });
      }
      const o = { id: root.id, src: p.src, mode: p.mode, bands: p.bands, points: p.points, mirror: !!p.mirror, boost: p.boost, smooth: p.smooth, minBar: p.minBar,
                  fLo: p.fLo, fHi: p.fHi, offset: p.offset, duration: p.duration, fps: p.fps };
      ctx.code(`  // audiogram #${root.id}: the sound ${p.src} analysed at load (assets/vendor/libs/kit/audiogram.js), drawn from the film's time
  AIMKAudiogram.attach(tl, ${p.at}, ${JSON.stringify(o)});`);
    }
  },
});
