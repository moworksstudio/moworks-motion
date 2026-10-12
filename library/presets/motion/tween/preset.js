/* motion/tween: one GSAP tween written straight from film.json, for motion a film script composes word by word or beat by beat when no preset
   says it better (from the test film's motion/f8-tween, 07/10/2026).
   params: from (object, or null for tl.to), to, duration, ease, stagger, repeat, yoyo,
           set (true: tl.set of "to" at the motion's time),
           hide_before (true: hidden until the motion's time). A first fromTo draws its "from" state at once (GSAP immediateRender): a ring or
           a burst whose start state is visible showed at frame 0 in the test film; hide_before keeps it out of sight until its time.
   hide_before hides the element by its own inline style (written into the film), not by a set at 0: a zero-length set at time 0 is undone
   when the player seeks back to 0, so the ring showed at frame 0 after a backward seek (a test film, 07/10/2026). */
AIMK.preset("motion/tween", { params: { from: null, to: {}, duration: 0.4, ease: "power2.out", stagger: 0, repeat: 0, yoyo: false, set: false, hide_before: false },
  build(tl, els, p, ctx) {
    // at its time the element goes back to its parent's visibility ("inherit", not "visible"): a "visible" child shows inside a hidden
    // parent (08/10/2026 tests: words of earlier scenes stayed on screen); the scene gate also hides by opacity now (runtime/driver.js)
    if (p.hide_before) { els.forEach(e => { e.style.visibility = "hidden"; }); tl.set(els, { visibility: "inherit" }, p.at); }
    if (p.set) { tl.set(els, Object.assign({}, p.to), p.at); return; }
    const to = Object.assign({}, p.to, { duration: p.duration, ease: p.ease });
    if (p.stagger) to.stagger = p.stagger;
    if (p.repeat) { to.repeat = p.repeat; to.yoyo = !!p.yoyo; }
    if (p.from) tl.fromTo(els, Object.assign({}, p.from), to, p.at); else tl.to(els, to, p.at);
  } });
