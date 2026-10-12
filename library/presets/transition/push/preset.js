/* transition/push: the outgoing scene leaves to the left while the incoming one enters from the right (targets: [out inner, in inner]).
   hit > 0: a collision (HyperFrames skills/hyperframes-animation/rules/reactive-displacement.md, commit 0ca69472, Apache-2.0; 11/10/2026):
   ONE back.out(bounce) curve drives both sides: the incoming one over the whole duration, the outgoing one knocked out (and faded) within
   the first `hit` of it (0.4-0.5: under 0.4 it vanishes before the impact reads, over 0.6 it reads as parallel, not causal). `hit` is a
   share of the TIME, as in the rules index and the rule's example composition (examples/takeover-ticker-displace.html: push over 50 %,
   fade over 40 % of the hero's duration); the rule's snippet reads it on the eased value instead, which empties the frame in about 12 %.
   The rule's single onUpdate becomes literal tweens: the incoming x / rotation take back.out itself, the knocked-out side and the incoming
   fade take the same curve cut at their end (ctx.ease). Made for two cards / blocks in one scene ("target": [old, new]); on whole scenes
   the bounce overshoots past the frame edge and shows the film background for a moment. */
AIMK.preset("transition/push", { params: { duration: 0.6, ease: "power3.inOut", distance: 1920, hit: 0, bounce: 1.5, tilt: 0, fade: 5 },
  build(tl, els, p, ctx) {
    const [a, b] = els;
    if (!(p.hit > 0)) { tl.fromTo(a, { x: 0 }, { x: -p.distance, duration: p.duration, ease: p.ease }, p.at); tl.fromTo(b, { x: p.distance }, { x: 0, duration: p.duration, ease: p.ease }, p.at); return; }
    const c = p.bounce, f = u => { u -= 1; return u * u * ((c + 1) * u + c) + 1; };               // GSAP back.out(c)
    const when = v => { let lo = 0, hi = 1; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (f(m) < v) lo = m; else hi = m; } return hi; };   // first time f reaches v
    const hit = Math.min(Math.max(p.hit, 0.05), 1 - 2 * c / (3 * (c + 1))), D = p.duration;   // back.out peaks at u = 1 - 2c / 3(c+1) (0.6 at 1.5): it rises until then
    tl.fromTo(b, { x: p.distance, rotation: -p.tilt }, { x: 0, rotation: 0, duration: D, ease: `back.out(${c})` }, p.at);
    if (p.fade > 1) { const uo = when(1 / p.fade); tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: +(uo * D).toFixed(4), ease: ctx.ease(u => f(u * uo) * p.fade, "push hit: incoming fade") }, p.at); }
    tl.fromTo(a, { x: 0, opacity: 1 }, { x: -p.distance, opacity: 0, duration: +(hit * D).toFixed(4), ease: ctx.ease(u => f(u * hit) / f(hit), "push hit: knocked out") }, p.at);
  } });
