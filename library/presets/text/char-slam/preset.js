/* text/char-slam: the headline starts as scattered, tilted letters, holds the explosion, then the letters slam back into the word with an overshoot
   (centre letters first) and the line shakes for three frames on landing; it then drifts very slightly while it holds. Port of HyperFrames registry
   component char-slam-explode (envelope, scatter table, eases and shake as in the source: return at 0.58 s, 0.66 s back.out(1.7), stagger 0.28 s
   from the centre; shake 3 x 1/30 s power2.out to (+0.55 % W, -0.3 % H), (-0.38 % W, +0.2 % H), 0; hold drift to -0.4 % H and back, sine.inOut,
   ending 0.3 s before the hold ends; optional exit 0.4 s power2.in to opacity 0, scale 0.96). EFFECT on a text element; `duration` is the source's
   mount duration (it sets the hold and the exit). Scatter: the source's fixed LCG table (seed 0x0c5e2026), tight 9 % W / 10 % H / 12 deg, wild
   17 / 19 / 22, every letter at 82 %. Colour: the source's accent (green) with its glow and drop shadow; accent "inherit" keeps the element's colour. */
AIMK.preset("text/char-slam", {
  params: { spread: "tight", accent: "green", glow: true, duration: 3.5, exit: "none" },
  build(tl, els, p, ctx) {
    const TB = [[-0.9,-0.038,0.677],[0.61,0.716,-0.967],[0.418,0.575,0.822],[-0.76,-0.451,0.944],[-0.621,0.579,-0.215],[0.714,0.437,-0.824],[0.577,0.567,0.464],[0.902,0.346,0.016],
      [-0.526,0.743,-0.275],[-0.571,-0.353,0.954],[-0.666,0.61,-0.075],[-0.122,0.875,-0.783],[-0.141,0.726,-0.659],[0.606,-0.665,-0.713],[-0.962,0.131,0.307],[0.227,0.813,-0.979],
      [0.264,-0.754,-0.013],[-0.4,0.903,0.573],[0.393,0.542,-0.992],[0.884,-0.313,-0.834],[-0.048,0.707,-0.331],[-0.766,0.226,0.567],[0.207,0.734,-0.714],[-0.677,-0.614,0.462],
      [0.389,-0.542,-0.384],[0.497,0.716,0.414],[0.729,-0.59,-0.774],[0.665,-0.061,-0.58],[-0.758,-0.546,0.364],[0.113,0.667,-0.202],[0.963,0.171,0.47],[0.662,-0.295,0.912],
      [0.555,0.548,0.952],[-0.132,-0.677,0.685],[-0.758,0.133,-0.469],[-0.296,0.697,0.61],[-0.27,0.786,-0.677],[-0.781,-0.478,-0.384],[-0.216,-0.633,-0.949],[0.721,-0.452,-0.62],
      [-0.434,0.816,0.526],[-0.794,0.014,-0.971],[-0.683,-0.158,0.844],[-0.914,0.066,0.396],[0.157,-0.721,-0.188],[0.662,-0.087,0.573],[-0.732,0.651,-0.935],[0.35,0.605,0.152],
      [-0.317,-0.668,0.206],[0.139,0.822,-0.11],[-0.821,0.464,0.347],[-0.668,-0.527,-0.879],[-0.578,-0.444,0.673],[0.573,0.744,0.819],[-0.52,-0.449,0.256],[-0.053,-0.703,0.258],
      [-0.646,0.266,-0.551],[-0.728,-0.448,-0.488],[-0.547,-0.5,-0.099],[0.714,0.091,0.084],[-0.114,0.764,-0.357],[0.02,-0.706,-0.59],[0.144,-0.947,-0.95],[-0.851,0.232,-0.445]];
    const S = p.spread === "wild" ? { x: 17, y: 19, r: 22 } : { x: 9, y: 10, r: 12 };
    const acc = p.accent === "inherit" ? null : ({ green: "#71f5a7", blue: "#61a8ff", violet: "#b895ff" }[p.accent] || p.accent);
    const D = Math.max(0.001, +p.duration || 3.5), OUTB = p.exit === "fade" ? 0.4 : 0, base = 1.64 + 0.4, sc = D < base ? D / base : 1;
    const IN = 1.64 * sc, OUT = 0.4 * sc, RA = 0.58 * sc, RD = 0.66 * sc, ST = 0.28 * sc, LAND = RA + RD + ST, SF = +(sc / 30).toFixed(4);
    const HOLD = Math.max(0, D - IN - (OUTB ? OUT : 0)), AH = Math.max(0, HOLD - Math.min(0.3, HOLD)), T = v => +(p.at + v).toFixed(4);
    const W = ctx.W, H = ctx.H;
    for (const el of els) {
      el.textContent = el.textContent.normalize("NFC");
      const col = acc || getComputedStyle(el).color;
      if (acc) el.style.color = acc;
      if (p.glow) {
        const pr = document.createElement("span"); pr.style.color = col; document.body.appendChild(pr);
        const rgb = (getComputedStyle(pr).color.match(/[\d.]+/g) || [113, 245, 167]).slice(0, 3).join(", "); pr.remove();
        el.style.textShadow = `0 0 ${Math.round(0.028 * H)}px rgba(${rgb}, 0.28), 0 ${Math.round(0.012 * H)}px ${Math.round(0.045 * H)}px rgba(0, 0, 0, 0.58)`;
      }
      const G = ctx.split(el, "chars"), n = G.length, c = (n - 1) / 2, md = Math.max(c, 1e-9);
      const box = ctx.make(el, "span", "line", { style: { display: "inline-block" } });   // shake / drift / exit move this inner line, never the element
      while (el.firstChild !== box) box.appendChild(el.firstChild);                        // (its own transform may be a centring translate)
      G.forEach((g, i) => {
        const v = TB[i % TB.length]; g.style.transformOrigin = "50% 55%";
        tl.fromTo(g, { x: +(v[0] * S.x * W / 100).toFixed(2), y: +(v[1] * S.y * H / 100).toFixed(2), rotation: +(v[2] * S.r).toFixed(3), scale: 0.82 },
          { x: 0, y: 0, rotation: 0, scale: 1, duration: +RD.toFixed(4), ease: "back.out(1.7)" }, T(RA + (n > 1 ? ST * Math.abs(i - c) / md : 0)));
      });
      const sx = [0.0055 * W, -0.0038 * W, 0], sy = [-0.003 * H, 0.002 * H, 0];
      let px = 0, py = 0;
      sx.forEach((x, i) => { tl.fromTo(box, { x: +px.toFixed(2), y: +py.toFixed(2) }, { x: +x.toFixed(2), y: +sy[i].toFixed(2), duration: SF, ease: "power2.out" }, T(LAND + i * SF)); px = x; py = sy[i]; });
      if (AH > 0) tl.fromTo(box, { y: 0 }, { y: +(-0.004 * H).toFixed(2), duration: +(AH / 2).toFixed(4), ease: "sine.inOut", yoyo: true, repeat: 1 }, T(IN));
      if (OUTB) tl.fromTo(box, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration: +OUT.toFixed(4), ease: "power2.in" }, T(IN + HOLD));
    }
  },
});
