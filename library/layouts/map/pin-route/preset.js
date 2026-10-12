/* map/pin-route: a vector world map: the camera flies to a region, a country lights up, pins drop in and settle with labels, and flight routes draw
   themselves along great-circle arcs. After iart-ai map-animation-skills, map-animation / vector-maps (MIT): camera = one transform on the map
   group (centre the target, scale in), labels counter-scaled so the type keeps its size, pins dropping 40 px with a springy settle and a soft
   ring, routes densified with geoInterpolate and drawn on with pathLength 1, focus country lit / the rest muted. The basemap is the kit's
   Natural Earth 110m (engine/vendor/data/countries-110m.json) drawn with d3 + topojson while the film builds; the film keeps the SVG. BLOCK:
   built inside the target box. places "Name:lng,lat|..."; routes "From>To|..." by place name; highlight = country names (English, "|"). */
AIMK.preset("map/pin-route", {
  params: { places: "Hà Nội:105.85,21.03|TP.HCM:106.70,10.78|Singapore:103.82,1.35|Tokyo:139.69,35.69", routes: "Hà Nội>Tokyo|TP.HCM>Singapore",
            highlight: "Vietnam", focus: "120,22", zoom: 2.6, land: "#1b2330", edge: "#0b0f14", lit: "#0a84ff", pin: "#0a84ff", route: "#ff9f0a", label: "#f5f7fa",
            ocean: "transparent", camera: 2.0, pinStagger: 0.25, draw: 1.2 },
  build(tl, els, p, ctx) {
    const x = new XMLHttpRequest(); x.open("GET", ctx.asset("countries-110m.json"), false); x.send();
    const world = JSON.parse(x.responseText), feats = topojson.feature(world, world.objects.countries).features, f = v => +(+v).toFixed(3), NS = "http://www.w3.org/2000/svg";
    const places = String(p.places).split("|").map(s => s.trim().normalize("NFC")).filter(Boolean).map(s => { const [n, c] = s.split(":"); const [lng, lat] = c.split(",").map(Number); return { n: n.trim(), lng, lat }; });
    const byName = Object.fromEntries(places.map(q => [q.n, q])), hl = new Set(String(p.highlight || "").split("|").map(s => s.trim()).filter(Boolean));
    const routes = String(p.routes || "").split("|").map(s => s.split(">").map(t => t.trim().normalize("NFC"))).filter(r => r.length === 2 && byName[r[0]] && byName[r[1]]);
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, id = ctx.id(slot, "b");
      const proj = d3.geoNaturalEarth1().fitSize([bw, bh], { type: "Sphere" }), path = d3.geoPath(proj);
      const svg = document.createElementNS(NS, "svg"); svg.id = id + "_map"; svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`); svg.setAttribute("width", bw); svg.setAttribute("height", bh);
      Object.assign(svg.style, { position: "absolute", inset: "0px", overflow: "hidden", background: p.ocean, fontFamily: '"RFlex", sans-serif' }); slot.appendChild(svg);
      let ne = 0; const mk = (parent, tag, at, txt) => { const e = document.createElementNS(NS, tag); e.id = `${svg.id}_${ne++}`; for (const k in at) e.setAttribute(k, String(at[k])); if (txt != null) e.textContent = txt; parent.appendChild(e); return e; };
      const cam = mk(svg, "g", {});
      const base = mk(cam, "g", { opacity: 0 });
      const lit = [];
      feats.forEach(ft => { const on = hl.has(ft.properties.name), d = path(ft); if (!d) return;
        const e = mk(base, "path", { d, fill: on ? p.lit : p.land, "fill-opacity": on ? 0.25 : 0.85, stroke: on ? p.lit : p.edge, "stroke-width": on ? 1.5 : 0.5, "vector-effect": "non-scaling-stroke" });
        if (on) lit.push(e); });
      const [fx, fy] = String(p.focus || "").split(",").map(Number), Z = p.focus ? +p.zoom || 1 : 1, T = p.at;
      const fp = p.focus ? proj([fx, fy]) : [bw / 2, bh / 2], cx = bw / 2 - fp[0] * Z, cy = bh / 2 - fp[1] * Z;
      tl.fromTo(base, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, T);
      if (Z !== 1) tl.fromTo(cam, { x: 0, y: 0, scale: 1, transformOrigin: "0px 0px" }, { x: f(cx), y: f(cy), scale: Z, duration: p.camera, ease: "power2.inOut" }, f(T + 0.3));
      const tPins = T + 0.3 + (Z !== 1 ? p.camera * 0.85 : 0.4);
      lit.forEach(e => tl.fromTo(e, { attr: { "fill-opacity": 0.25 } }, { attr: { "fill-opacity": 0.8 }, duration: 0.4, ease: "power1.out" }, f(tPins - 0.3)));
      const routeLayer = mk(cam, "g", {}), pinLayer = mk(cam, "g", {});
      routes.forEach(([a, b], i) => {
        const A = byName[a], B = byName[b], it = d3.geoInterpolate([A.lng, A.lat], [B.lng, B.lat]), pts = d3.range(41).map(k => proj(it(k / 40)));
        const r = mk(routeLayer, "path", { d: "M" + pts.map(q => q.map(v => v.toFixed(2)).join(" ")).join(" L"), fill: "none", stroke: p.route, "stroke-width": f(3 / Z), "stroke-linecap": "round",
          pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 });
        tl.fromTo(r, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: p.draw, ease: "power1.inOut" }, f(tPins + places.length * p.pinStagger + 0.2 + i * 0.3));
      });
      places.forEach((q, i) => {
        const [px, py] = proj([q.lng, q.lat]), g = mk(pinLayer, "g", { transform: `translate(${f(px)} ${f(py)}) scale(${f(1 / Z)})` }), inner = mk(g, "g", { opacity: 0 });   // pins and type keep their size at the final zoom
        mk(inner, "circle", { r: 13, fill: "none", stroke: p.pin, "stroke-width": 2, opacity: 0.45 }); mk(inner, "circle", { r: 7, fill: p.pin });
        const lab = mk(inner, "g", { opacity: 0 }); mk(lab, "line", { x1: 0, y1: -14, x2: 0, y2: -32, stroke: p.label, "stroke-width": 1.5 });
        mk(lab, "text", { y: -40, "text-anchor": "middle", fill: p.label, "font-size": 28, "font-weight": 600 }, q.n);
        const t0 = f(tPins + i * p.pinStagger);
        tl.fromTo(inner, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }, t0);
        tl.fromTo(lab, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, f(t0 + 0.4));
      });
    }
  },
});
