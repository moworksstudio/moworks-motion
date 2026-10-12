/* motion/drag-release: a cursor grabs a card, drags it, lets go; the card follows the cursor on a spring (it lags, tilts with its speed) and,
   once released, springs home (or to a drop spot) with an overshoot (plan B2, 07/10/2026; the @0xMovez course's "drag and release" for UI
   films). Pure function of time: the spring is integrated from the motion's start at a fixed 1/480 s step on every frame.
   Target: the card. params (times in s from "at", positions in px from where the card sits):
     path      [[t, x, y], ...]   the cursor: the first key grabs, the last key releases (smoothstep between keys)
     follow    "snappy" | "default" | "heavy" | "playful" | [k, d]   the spring that pulls the card toward the cursor while dragged
     release   the spring after letting go (default "playful": a visible bounce, UI only, never on text)
     drop      [x, y]  where it settles after release (default [0, 0] = back home)
     tilt      degrees per 100 px/s of horizontal speed (default 1.2, at most 12 degrees)
     lift      scale while held (default 1.04)
     cursor    id of a cursor element to move along the path (optional; it sits on the grab point, pressed while held)
     settle    seconds after the release the spring keeps running (default 1.2)  */
AIMK.preset("motion/drag-release", { params: { path: [[0, 0, 0], [0.8, 360, -40]], follow: "snappy", release: "playful", drop: [0, 0], tilt: 1.2, lift: 1.04,
                                               cursor: null, settle: 1.2 },
  build(tl, els, p, ctx) { for (const el of els) {
    const SP = { snappy: [320, 30], default: [170, 26], heavy: [140, 22], playful: [220, 14] }, kd = s => Array.isArray(s) ? s : SP[s] || SP.snappy;
    const K = p.path.map(k => [+k[0], +k[1], +k[2]]), t0 = K[0][0], t1 = K[K.length - 1][0], D = +(t1 + p.settle).toFixed(4);
    const cur = p.cursor ? document.getElementById(p.cursor) : null; if (cur) ctx.id(cur);
    const v = "dr_" + ctx.id(el).replace(/\W/g, "_");
    const R = { K, f: kd(p.follow), r: kd(p.release), drop: p.drop, tilt: p.tilt, lift: p.lift, t0, t1 };
    ctx.code(`  // drag and release #${el.id}${cur ? " with cursor #" + cur.id : ""}: a spring toward the cursor while held, a spring to the drop spot after
  const ${v} = { t: 0, R: ${JSON.stringify(R)} };
  const ${v}c = t => { const K = ${v}.R.K; if (t <= K[0][0]) return [K[0][1], K[0][2]]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
      const a = K[i - 1], b = K[i], u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]), s = u * u * (3 - 2 * u); return [a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s]; }
    const L = K[K.length - 1]; return [L[1], L[2]]; };
  tl.fromTo(${v}, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => {
    const R = ${v}.R, T = ${v}.t, dt = 1 / 480; let x = 0, y = 0, vx = 0, vy = 0;
    for (let s = 0; s < T; s += dt) {                              // the whole history again: the frame depends on time only
      const held = s >= R.t0 && s <= R.t1, [k, d] = held ? R.f : R.r, g = held ? ${v}c(s) : (s > R.t1 ? R.drop : [0, 0]);
      const h = Math.min(dt, T - s); vx += (k * (g[0] - x) - d * vx) * h; vy += (k * (g[1] - y) - d * vy) * h; x += vx * h; y += vy * h; }
    const held = T >= R.t0 && T <= R.t1, up = held ? Math.min(1, (T - R.t0) / 0.12) : Math.max(0, 1 - (T - R.t1) / 0.2);
    const rot = Math.max(-12, Math.min(12, vx / 100 * R.tilt)), sc = 1 + (R.lift - 1) * (T < R.t0 ? 0 : up);
    gsap.set(${JSON.stringify("#" + el.id)}, { x, y, rotation: rot, scale: sc });${cur ? `
    const c = ${v}c(Math.min(T, R.t1));
    gsap.set(${JSON.stringify("#" + cur.id)}, { x: c[0], y: c[1], scale: held ? 0.86 : 1 });` : ""} } }, ${p.at});`);
  } } });
