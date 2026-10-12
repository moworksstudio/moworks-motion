/* motion/chaos-shake: "unscripted chaos": each element jumps to a new hashed offset and tilt `rate` times a second, the strength decaying
   to zero by the end, so the rest state is the design. Pure function of film time (same picture at a time whatever was sought before).
   Unlike hand/shake (one element, a damped wobble) it shakes a list of elements apart, each its own way. Written for a studio film
   (08/10/2026). params: ids [...], dur, amp (px), rot (deg), rate (Hz), seed */
AIMK.preset("motion/chaos-shake", { params: { ids: [], dur: 1, amp: 14, rot: 3, rate: 15, seed: 3 },
  build(tl, els, p, ctx) {
    const ids = p.ids.length ? p.ids : els.map(e => e.id);
    const v = "mcs_" + els[0].id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // motion/chaos-shake: hashed jumps at ${p.rate} Hz, decaying (pure function of film time)
  const ${v} = { t: 0 };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const T = ${v}.t, q = Math.floor((${p.at} + T) * ${p.rate}), env = Math.pow(Math.max(0, 1 - T / ${p.dur}), 1.4);
    const H = (a, b) => { const x = Math.sin(a * 91.3 + b * 47.9 + ${p.seed} * 13.1) * 24634.6345; return x - Math.floor(x); };
    ${JSON.stringify(ids)}.forEach((id, i) => { const el = document.getElementById(id); if (!el) return;
      if (env <= 0.0001) { el.style.transform = ""; return; }
      el.style.transform = "translate(" + ((H(i, q) - 0.5) * 2 * ${p.amp} * env).toFixed(1) + "px," + ((H(i + 20, q) - 0.5) * 2 * ${p.amp} * env).toFixed(1) +
        "px) rotate(" + ((H(i + 40, q) - 0.5) * 2 * ${p.rot} * env).toFixed(2) + "deg)"; });
  } }, ${p.at});`);
  } });
