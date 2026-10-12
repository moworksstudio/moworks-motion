/* line/flow-connector: a wire between two things with data flowing along it: a marching dash and a glowing packet travelling end to end, over
   and over. After iart-ai explainer-video-skills, diagram-animation / diagram-and-chart-recipes #3 (MIT): dash 10 / gap 12, the dash marches one
   period (22 px) every 0.7 s, the packet travels the path in 1.6 s, both linear; reverse flips both. The CSS loops of the recipe are written as
   one linear dash tween over `duration` and a repeated packet tween (CSS offset-path), so every frame is a pure function of time. BLOCK: built
   inside the target box; `d` is the path in the box's own pixels (default: a gentle S from the left middle to the right middle). */
AIMK.preset("line/flow-connector", {
  params: { d: "", wire: "#2b3340", flow: "#0a84ff", packet: "#7cc4ff", width: 4, dash: 10, gap: 12, march: 0.7, travel: 1.6, radius: 6, reverse: false, duration: 6, drawIn: 0.6 },
  build(tl, els, p, ctx) {
    const NS = "http://www.w3.org/2000/svg", f = v => +v.toFixed(3);
    for (const slot of els) {
      const bw = slot.offsetWidth || 800, bh = slot.offsetHeight || 160, id = ctx.id(slot, "b");
      const d = p.d || `M${p.radius * 2} ${bh / 2} C ${bw * 0.35} ${bh * 0.1}, ${bw * 0.65} ${bh * 0.9}, ${bw - p.radius * 2} ${bh / 2}`;
      const svg = document.createElementNS(NS, "svg"); svg.id = id + "_fc"; svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`); svg.setAttribute("width", bw); svg.setAttribute("height", bh);
      Object.assign(svg.style, { position: "absolute", inset: "0px", overflow: "visible" }); slot.appendChild(svg);
      const mk = (tag, at, idn) => { const e = document.createElementNS(NS, tag); if (idn) e.id = idn; for (const k in at) e.setAttribute(k, String(at[k])); svg.appendChild(e); return e; };
      const wire = mk("path", { d, stroke: p.wire, "stroke-width": p.width, fill: "none", "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, svg.id + "_wire");
      const flow = mk("path", { d, stroke: p.flow, "stroke-width": p.width, fill: "none", "stroke-dasharray": `${p.dash} ${p.gap}`, "stroke-dashoffset": 0, opacity: 0 }, svg.id + "_flow");
      const pk = document.createElement("div"); pk.id = svg.id + "_pk";
      Object.assign(pk.style, { position: "absolute", left: "0px", top: "0px", width: 2 * p.radius + "px", height: 2 * p.radius + "px", borderRadius: "50%", background: p.packet,
        boxShadow: `0 0 ${p.radius * 2}px ${p.packet}`, offsetPath: `path("${d}")`, offsetRotate: "0deg", offsetDistance: p.reverse ? "100%" : "0%", opacity: "0" });
      slot.appendChild(pk);
      const t0 = p.at, t1 = f(t0 + p.drawIn), run = Math.max(0.1, p.duration - p.drawIn), per = p.dash + p.gap, laps = Math.max(1, Math.ceil(run / p.travel));
      tl.fromTo(wire, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: p.drawIn, ease: "power2.out" }, t0);
      tl.set(flow, { opacity: 1 }, t1); tl.set(pk, { opacity: 1 }, t1);
      tl.fromTo(flow, { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": f((p.reverse ? 1 : -1) * per * run / p.march) }, duration: f(run), ease: "none" }, t1);
      tl.fromTo(pk, { offsetDistance: p.reverse ? "100%" : "0%" }, { offsetDistance: p.reverse ? "0%" : "100%", duration: p.travel, ease: "none", repeat: laps - 1 }, t1);
    }
  },
});
