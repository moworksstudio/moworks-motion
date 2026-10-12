/* card/talking-card: a card of HyperFrames' talking-head-recut design library (adapted there from vtake-skills, MIT: assets/NOTICE.md;
   HyperFrames Apache-2.0), for graphics over a talking head (recipes 6), 11/10/2026.
   style: academic | audit | editorial | geom | minimal | spotlight | swiss | terminal | whiteboard | xhs (assets/DESIGN_INDEX.md says
   which tone each fits). Its .card fragment runs as shipped (assets/styles/<style>.html), its copy changed by `replace` ([[from, to],
   ...]: the shipped copy is a placeholder), drawn at `size` (its design box: 1920 x 1080, a full-frame card for the pip and overlay
   layouts) and scaled to fit the target box. Its data-anim declarations become tweens by HyperFrames' own table (the skill's "GSAP
   Statement Cheat Sheet"; blur-in, typewriter and morph-to from its kinds table), their data-anim-at counted from the motion's start.
   The card fades in over `enter` and, when `duration` > 0, out over `exit` so it is gone at `duration`. The video's own moves between
   layouts: motion/talking-layout. Fonts the styles name without Vietnamese (Caveat, Virgil, LXGW WenKai TC) are drawn with Patrick
   Hand, Inter with Inter (preset.json "fonts"). */
AIMK.preset("card/talking-card", { params: { style: "editorial", replace: [], size: [1920, 1080], duration: 0, enter: 0.4, exit: 0.35 },
  build(tl, els, p, ctx) {
    const x = new XMLHttpRequest(); x.open("GET", ctx.asset("styles/" + p.style + ".html"), false); x.send();
    if (x.status !== 200) throw new Error("card/talking-card: no style \"" + p.style + "\"");
    let s = x.responseText; for (const [a, b] of p.replace || []) s = s.split(a).join(b);
    const card = new DOMParser().parseFromString(s, "text/html").querySelector(".card");
    for (const st of card.querySelectorAll("style")) {   // its scoped CSS goes to the page's head (in the card, its text counted as words to read)
      ctx.css("talking-card-" + p.style + "-" + ctx.hash(st.textContent).toFixed(4).slice(2), st.textContent); st.remove(); }
    const [W, H] = p.size, num = (v, d) => (v == null || v === "" ? d : +v);
    for (const slot of els) {
      const P = ctx.id(slot, "b") + "_";
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, k = Math.min(bw / W, bh / H);
      if (getComputedStyle(slot).position === "static") slot.style.position = "relative";
      const host = ctx.make(slot, "div", "card", { html: card.outerHTML.replace(/\sid="([^"]+)"/g, (m, i) => ` id="${P}${i}"`),   // ids unique per card
        style: { position: "absolute", left: ((bw - W * k) / 2).toFixed(2) + "px", top: ((bh - H * k) / 2).toFixed(2) + "px", width: W + "px",
                 height: H + "px", transformOrigin: "0 0", transform: `scale(${+k.toFixed(5)})` } });
      Object.assign(host.firstElementChild.style, { width: "100%", height: "100%" });
      tl.fromTo(host, { opacity: 0 }, { opacity: 1, duration: p.enter, ease: "power2.out" }, p.at);
      if (p.duration > 0) tl.to(host, { opacity: 0, duration: p.exit, ease: "power2.in" }, +(p.at + p.duration - p.exit).toFixed(4));
      for (const el of host.querySelectorAll("[data-anim]")) {
        const a = n => el.getAttribute("data-anim-" + n), kind = el.getAttribute("data-anim");
        const T = +(p.at + num(a("at"), 0)).toFixed(4), D = num(a("duration"), 0.5), E = a("ease");
        ctx.id(el, P + "a");
        if (kind === "fade-in") tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: D, ease: E || "power2.out" }, T);
        else if (kind === "fade-out") tl.to(el, { opacity: 0, duration: D, ease: E || "power2.in" }, T);
        else if (kind === "slide-in") {
          const from = a("from") || "left", ax = from === "left" || from === "right" ? "x" : "y", d = num(a("distance"), 80) * (from === "left" || from === "top" ? -1 : 1);
          tl.fromTo(el, { opacity: 0, [ax]: d }, { opacity: 1, [ax]: 0, duration: D, ease: E || "power2.out" }, T);
        } else if (kind === "kinetic-chars" || kind === "typewriter") {
          const S = num(a("stagger"), kind === "typewriter" ? 0.06 : 0.04), pop = (a("pattern") || (kind === "typewriter" ? "fade" : "pop")) === "pop";
          [...el.querySelectorAll(".char")].forEach((c, i) => { ctx.id(c, P + "c");
            tl.fromTo(c, pop ? { opacity: 0, y: 8, scale: 0.8 } : { opacity: 0 }, Object.assign({ opacity: 1, duration: D, ease: "power2.out" }, pop ? { y: 0, scale: 1 } : {}), +(T + i * S).toFixed(4)); });
        } else if (kind === "count-up") {                // a number that changes text: in the film's code, as HyperFrames writes it
          const fmt = a("format") || ".0f";
          ctx.code(`  { const o = { v: ${num(a("from"), 0)} }, el = document.getElementById(${JSON.stringify(el.id)}), f = ${JSON.stringify(fmt)};
    const fm = v => f === ",d" ? Math.round(v).toLocaleString("en-US") : v.toFixed(+(f.match(/\\.(\\d)f/) || [0, 0])[1]);
    tl.fromTo(o, { v: ${num(a("from"), 0)} }, { v: ${num(a("to"), 0)}, duration: ${D}, ease: "power2.out", onUpdate: () => { el.textContent = fm(o.v); } }, ${T}); }`);
        } else if (kind === "draw-path") {
          const L = el.getTotalLength ? +el.getTotalLength().toFixed(2) : 1000;
          tl.fromTo(el, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: D, ease: E || "power2.inOut" }, T);
        } else if (kind === "grow-x") tl.fromTo(el, { width: 0 }, { width: num(a("target-w"), 100), duration: D, ease: E || "power2.out" }, T);
        else if (kind === "grow-y") tl.fromTo(el, { height: 0 }, { height: num(a("target-h"), 100), duration: D, ease: E || "power2.out" }, T);
        else if (kind === "scale-pop") tl.fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: D, ease: E || "back.out(1.6)" }, T);
        else if (kind === "blur-in") tl.fromTo(el, { opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)", duration: D, ease: E || "power2.out" }, T);
        else if (kind === "mask-reveal") {
          const from = { left: "inset(0 100% 0 0)", right: "inset(0 0 0 100%)", top: "inset(0 0 100% 0)", bottom: "inset(100% 0 0 0)" }[a("direction") || "left"];
          tl.fromTo(el, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: D, ease: E || "power2.inOut" }, T);
        } else if (kind === "morph-to") tl.to(el, Object.assign(JSON.parse(a("props") || "{}"), { duration: D, ease: E || "power2.inOut" }), T);
      }
    }
  } });
