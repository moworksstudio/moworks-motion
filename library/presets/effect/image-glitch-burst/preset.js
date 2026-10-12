/* effect/image-glitch-burst: a glitch burst over the frame made from pictures of the film's own design (e.g. its "glitch" artwork, or the
   two frames of a cut): the pictures are cut into horizontal slices that jump sideways on a 30 Hz grid, with thin cyan / magenta / white /
   yellow bars and a small frame shake; strength follows a sine envelope over the burst, and it shows from its very first frame (no plain
   frame at a cut). Pure function of film time (hashed per slice and step). Unlike text/rgb-glitch (letters) or transition/shader-glitch
   (a WebGL transition) it works on any pictures, in plain HTML. Written for a studio film (08/10/2026).
   Target: a full-frame box. params: layers [[src, x, y, w, h], ...] (top first, film px), dur, slices, amp (px), seed, bars, fps */
AIMK.preset("effect/image-glitch-burst", { params: { layers: [], dur: 0.5, slices: 16, amp: 120, seed: 1, bars: 6, fps: 60 },
  build(tl, els, p, ctx) {
    const host = els[0];
    ctx.css("effect/image-glitch-burst", ".igb-wrap{position:absolute;left:0px;top:0px;width:1920px;height:1080px;overflow:hidden;pointer-events:none}" +
      ".igb-s{position:absolute;left:0px;width:1920px;overflow:hidden}.igb-i{position:absolute;left:0px;width:1920px;height:1080px}" +
      ".igb-b{position:absolute;left:0px;width:1920px;mix-blend-mode:screen}");
    const bg = p.layers.map(([s, x, y, w, h]) => `url("${s}") ${x}px ${y}px / ${w}px ${h}px no-repeat`).join(", ");
    const wrap = ctx.make(host, "div", "gw", { cls: "igb-wrap", style: { visibility: "hidden" } });
    const ids = [], bars = [], cols = ["#00f0ff", "#ff2bd6", "#ffffff", "#ffe600"];
    for (let i = 0; i < p.slices; i++) {
      const top = Math.round(i * 1080 / p.slices), hh = Math.round((i + 1) * 1080 / p.slices) - top;
      const s = ctx.make(wrap, "div", "s" + i, { cls: "igb-s", style: { top: top + "px", height: hh + "px" } });
      ids.push(ctx.make(s, "div", "i", { cls: "igb-i", style: { top: -top + "px", background: bg } }).id);
    }
    for (let j = 0; j < p.bars; j++) bars.push(ctx.make(wrap, "div", "b" + j, { cls: "igb-b", style: { background: cols[j % cols.length], opacity: "0", top: "0px", height: "6px" } }).id);
    const v = "igb_" + host.id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // effect/image-glitch-burst in #${host.id}: slices jump on a 30 Hz grid (pure function of film time)
  const ${v} = { t: 0 };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const T = ${v}.t, D = ${p.dur}, w = document.getElementById(${JSON.stringify(wrap.id)}), A = tl.time() - ${p.at};
    if (A < -0.0001 || T >= D - 0.0001) { w.style.visibility = "hidden"; return; }   // shown from its first frame (no plain frame at a cut)
    w.style.visibility = "visible";
    const f = Math.round((${p.at} + T) * ${p.fps}), q = Math.floor(f / 2), env = Math.max(0.25, Math.sin(Math.PI * T / D));
    const H = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7 + ${p.seed} * 74.7) * 43758.5453; return x - Math.floor(x); };
    ${JSON.stringify(ids)}.forEach((id, i) => { const on = H(i + 50, q) > 0.45, r = H(i, q);
      document.getElementById(id).style.transform = "translateX(" + (on ? (r - 0.5) * 2 * ${p.amp} * env : 0).toFixed(1) + "px)"; });
    ${JSON.stringify(bars)}.forEach((id, j) => { const el = document.getElementById(id), on = H(j + 100, q) > 0.5;
      el.style.opacity = on ? (0.55 * env).toFixed(3) : "0"; el.style.top = Math.round(H(j + 200, q) * 1060) + "px";
      el.style.height = Math.round(3 + H(j + 300, q) * 14) + "px"; });
    w.style.transform = "translateX(" + ((H(999, q) - 0.5) * 24 * env).toFixed(1) + "px)";
  } }, ${p.at});`);
  } });
