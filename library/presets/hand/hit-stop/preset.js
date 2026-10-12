/* hand/hit-stop: the animator's hit-stop: at the moment of impact the hit thing freezes for a few frames at its most squashed / punched
   pose, then springs back, often with a one-frame flash (plan C3, 07/10/2026). Target: the thing that is hit (or that lands).
   params: punch (scale at impact), squash (0-1: flatter and wider at impact), hold (s frozen at impact: 3-5 frames at 60 fps),
           recover (s back to rest), flash ("" = none, else a colour: one frame over the target's scene), flash_on (id of the box the flash
           covers, default the target's scene inner box) */
AIMK.preset("hand/hit-stop", { params: { punch: 1.18, squash: 0.25, hold: 0.07, recover: 0.22, flash: "#ffffff", flash_on: null },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el);
    const sx = p.punch * (1 + p.squash * 0.5), sy = p.punch * (1 - p.squash * 0.5), t = p.at;
    tl.set(el, { scaleX: +sx.toFixed(3), scaleY: +sy.toFixed(3) }, t);                                 // impact pose, frozen
    tl.to(el, { scaleX: 1, scaleY: 1, duration: p.recover, ease: "back.out(2.2)" }, +(t + p.hold).toFixed(4));
    if (p.flash) {
      const host = (p.flash_on && document.getElementById(p.flash_on)) || el.closest(".inner") || el.parentElement;
      const f = document.createElement("div"); f.id = el.id + "_flash";
      Object.assign(f.style, { position: "absolute", inset: "0", background: p.flash, opacity: "0", pointerEvents: "none", zIndex: "50" });
      f.setAttribute("data-lint", "ignore"); host.appendChild(f);
      tl.set(f, { opacity: 0.85 }, t); tl.set(f, { opacity: 0 }, +(t + 1 / 60).toFixed(4));
    }
  } } });
