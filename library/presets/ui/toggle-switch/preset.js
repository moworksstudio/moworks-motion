/* ui/toggle-switch: a switch that flips on a time (a sung word, a beat): the knob slides across with a little overshoot (or in 3 steps for
   a pixel look) and the track changes colour. The target is the track: a box 2:1 wide (its own colour = off); the preset adds the knob.
   Written for a studio lyric film (08/10/2026). params: knob (colour), on (track colour when on; "" keeps it), square (pixel look),
   pad (px between track and knob), lead (s the move starts before "at") */
AIMK.preset("ui/toggle-switch", { params: { knob: "#ffffff", on: "", square: false, pad: 18, lead: 0.06 },
  build(tl, els, p, ctx) {
    for (const el of els) {
      const w = el.offsetWidth, h = el.offsetHeight, kd = h - 2 * p.pad;
      el.style.borderRadius = p.square ? "0px" : h / 2 + "px";
      const k = ctx.make(el, "i", "knob", { style: { position: "absolute", left: p.pad + "px", top: p.pad + "px", width: kd + "px", height: kd + "px",
        borderRadius: p.square ? "0px" : kd / 2 + "px", background: p.knob, display: "block" } });
      const t = Math.max(0, +(p.at - p.lead).toFixed(4));
      tl.fromTo(k, { x: 0 }, { x: w - kd - 2 * p.pad, duration: 0.3, ease: p.square ? "steps(3)" : "back.out(1.8)" }, t);
      if (p.on) tl.fromTo(el, { backgroundColor: getComputedStyle(el).backgroundColor }, { backgroundColor: p.on, duration: 0.2, ease: "power1.out" }, t);
    }
  } });
