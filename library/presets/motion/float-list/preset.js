/* motion/float-list: always-on life for a set of stickers, icons or cards: each element drifts on its own sine waves (x, y, rotation) as a
   pure function of film time; the amplitude ramps in over `ramp` s so nothing pops when it starts. Unlike house/deco-float (one amplitude
   for every target, phases from a hash), every element gets its own amplitude, period and phase. Written for a studio film (08/10/2026).
   Put it on an element no tween moves (the outer box when the entrance uses an inner layer).
   params: items [[id, ax px, ay px, rot deg, period s, phase 0-1], ...], dur (s from the motion's at), ramp (s) */
AIMK.preset("motion/float-list", { params: { items: [], dur: 4, ramp: 0.6 },
  build(tl, els, p, ctx) {
    const v = "mfl_" + els[0].id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // motion/float-list: sine drift per element (pure function of film time)
  const ${v} = { t: 0, I: ${JSON.stringify(p.items)} };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const A = ${p.at} + ${v}.t, k = Math.min(1, ${v}.t / ${p.ramp});
    for (const [id, ax, ay, r, per, ph] of ${v}.I) { const el = document.getElementById(id); if (!el) continue;
      const w = 2 * Math.PI * (A / per + ph);
      el.style.transform = "translate(" + (k * ax * Math.sin(w)).toFixed(2) + "px," + (k * ay * Math.sin(w + 1.3)).toFixed(2) + "px) rotate(" + (k * r * Math.sin(w + 0.7)).toFixed(3) + "deg)"; }
  } }, ${p.at});`);
  } });
