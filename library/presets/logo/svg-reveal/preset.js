/* logo/svg-reveal: a client's SVG logo revealed the classic ways: its outlines draw on then fill in (draw), a soft wipe sweeps it in (wipe), or
   its pieces pop in one after another and the whole mark settles with a tiny overshoot (build). After iart-ai motion-design-skills,
   logo-animation / logo-patterns (MIT): draw 1.1 s cubic-bezier(.65,0,.35,1) with 0.15 s between paths, fill 0.3 s from 0.9 s, strokes fade as the
   fill lands; wipe 0.8 s cubic-bezier(.22,1,.36,1); build 0.45 s back.out(1.6) from 70 % with 0.08 s between pieces, then the mark 1.04 -> 1.00
   (0.12 s power2.out + 0.14 s power2.inOut). Brand rules from the recipe: uniform scale only, brand colours never animated away. EFFECT on an
   empty box: the SVG file (src, inside the film folder) is read when the film builds and placed in the box, keeping its aspect. */
AIMK.preset("logo/svg-reveal", {
  params: { src: "assets/demo/logo-demo.svg", mode: "draw", stroke: 0, direction: "right", stagger: 0.15, duration: 1.1, settle: true },
  build(tl, els, p, ctx) {
    const x = new XMLHttpRequest(); x.open("GET", p.src, false); x.send();
    const f = v => +v.toFixed(4), DRAW = "custom(M0,0 C 0.65,0 0.35,1 1,1)", WIPE = "custom(M0,0 C 0.22,1 0.36,1 1,1)";
    for (const slot of els) {
      const id = ctx.id(slot, "b"), holder = ctx.make(slot, "div", "logo", { html: x.status === 200 ? x.responseText.replace(/<\?xml[^>]*>/, "") : "", style: { position: "absolute", inset: "0px" } });
      const svg = holder.querySelector("svg"); if (!svg) continue;
      svg.id = id + "_svg"; Object.assign(svg.style, { width: "100%", height: "100%", overflow: "visible" }); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      const shapes = [...svg.querySelectorAll("path, circle, rect, ellipse, polygon, polyline, line")].filter(e => !e.closest("defs, clipPath, mask"));
      shapes.forEach((e, i) => { e.id = e.id ? `${id}_${e.id}` : `${id}_s${i}`; });
      const t = p.at;
      if (p.mode === "wipe") {
        const vb = (svg.getAttribute("viewBox") || "0 0 100 100").split(/[\s,]+/).map(Number), NS = "http://www.w3.org/2000/svg";
        const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild);
        const cp = document.createElementNS(NS, "clipPath"); cp.id = id + "_wipe"; const r = document.createElementNS(NS, "rect"); r.id = id + "_wiper";
        const horiz = p.direction === "right" || p.direction === "left";
        Object.entries({ x: vb[0], y: vb[1], width: horiz ? 0 : vb[2], height: horiz ? vb[3] : 0 }).forEach(([k, v]) => r.setAttribute(k, v));
        cp.appendChild(r); defs.appendChild(cp);
        const g = document.createElementNS(NS, "g"); g.id = id + "_g"; g.setAttribute("clip-path", `url(#${cp.id})`);
        [...svg.childNodes].filter(n => n !== defs).forEach(n => g.appendChild(n)); svg.appendChild(g);
        const a = horiz ? { width: 0, x: p.direction === "left" ? vb[0] + vb[2] : vb[0] } : { height: 0, y: p.direction === "up" ? vb[1] + vb[3] : vb[1] };
        const b = horiz ? { width: vb[2], x: vb[0] } : { height: vb[3], y: vb[1] };
        tl.fromTo(r, { attr: a }, { attr: b, duration: 0.8, ease: WIPE }, t);
      } else if (p.mode === "build") {
        shapes.forEach((e, i) => { e.style.transformBox = "fill-box"; e.style.transformOrigin = "50% 50%";
          tl.fromTo(e, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.6)" }, f(t + i * 0.08)); });
        if (p.settle) { const e0 = t + (shapes.length - 1) * 0.08 + 0.45; svg.style.transformOrigin = "50% 50%";
          tl.fromTo(svg, { scale: 1 }, { scale: 1.04, duration: 0.12, ease: "power2.out" }, f(e0)); tl.fromTo(svg, { scale: 1.04 }, { scale: 1, duration: 0.14, ease: "power2.inOut" }, f(e0 + 0.12)); }
      } else {
        shapes.forEach((e, i) => {
          const cs = getComputedStyle(e), fill = cs.fill, hasFill = fill && fill !== "none" && !/rgba\(.*,\s*0\)$/.test(fill), st = cs.stroke !== "none" ? cs.stroke : fill;
          const sw = p.stroke || +cs.strokeWidth.replace("px", "") || 3, t0 = f(t + i * p.stagger);
          e.setAttribute("pathLength", "1");
          if (hasFill) { e.style.fill = fill; e.style.fillOpacity = "0"; e.style.stroke = st; e.style.strokeWidth = (p.stroke || 3) + "px"; }
          else { e.style.strokeWidth = sw + "px"; }
          e.style.strokeDasharray = "1 1"; e.style.strokeDashoffset = "1";
          tl.fromTo(e, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: p.duration, ease: DRAW }, t0);
          if (hasFill) { tl.fromTo(e, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.3, ease: "power1.inOut" }, f(t0 + p.duration * 0.82));
            tl.fromTo(e, { strokeOpacity: 1 }, { strokeOpacity: 0, duration: 0.3, ease: "power1.inOut" }, f(t0 + p.duration * 0.82)); }
        });
      }
    }
  },
});
