/* house/kv-burst: a group photo cut into layers comes alive. People spring up from behind the table (y +260, scale 0.8, back.out(1.9), 0.75 s, 0.12 s apart, origin 50% 100%),
   the table slides up (y +300, back.out(1.3), 0.8 s), dishes pop on it (from their base, small turn up to 10 deg, back.out(2.4), 0.6 s, 0.08 s apart), icons pop last
   (0.5 s spread, the pop-cute feel); then the people hop now and then, the dishes bob and the icons drift.
   Port of Moworks v1 house style P.kvBurst (house.js). COMPOSITE EFFECT: the logic of house/pop-cute, house/hop, house/bob and house/deco-float is inlined here (a preset
   cannot call another preset). TARGET = the people (their layers). The other parts are named by id in params: table, items (dishes), icons: each one id or an array of ids.
   Params: table, items, icons, ambient (true = hop / bob / drift after the entrance; false = entrance only), ambientDur (30 s of ambient motion).
   Difference from v1: the ambient motion starts at the preset's `at` instead of at film time 0 (so the phase is the same in every scene). The ambient parts use
   ctx.layer (inner wrapper), so they never fight the entrance tweens. */
AIMK.preset("house/kv-burst", { params: { table: [], items: [], icons: [], ambient: true, ambientDur: 30 },
  build(tl, els, p, ctx) {
    const get = x => (x == null ? [] : Array.isArray(x) ? x : [x]).map(i => (typeof i === "string" ? document.getElementById(i) : i)).filter(Boolean).map(e => { ctx.id(e); return e; });
    const people = els, table = get(p.table), items = get(p.items), icons = get(p.icons), t0 = p.at;
    /* pop-cute, inlined (o: stagger / spread / rot / origin / dur / ease) */
    const pop = (list, at, o) => {
      const order = list.map(el => [el, ctx.hash(el)]).sort((a, b) => (o.spread != null ? a[1] - b[1] : 0));
      order.forEach(([el, s], i) => {
        const t = at + (o.spread != null ? (order.length > 1 ? o.spread * i / (order.length - 1) : 0) : i * (o.stagger ?? 0.06));
        const springy = s <= 0.5 && !o.ease, dur = o.dur ?? (springy ? 1.0 : 0.7);
        el.style.transformOrigin = o.origin || "50% 50%";
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, t);
        tl.fromTo(el, { scale: 0, rotation: (s - 0.5) * 2 * (o.rot ?? 25) }, { scale: 1, rotation: 0, duration: dur, ease: o.ease || (springy ? "elastic.out(1, 0.55)" : "back.out(3)") }, t);
      });
    };
    people.forEach((el, i) => {
      el.style.transformOrigin = "50% 100%"; const t = t0 + 0.12 * i;
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "power1.out" }, t);
      tl.fromTo(el, { y: 260, scale: 0.8 }, { y: 0, scale: 1, duration: 0.75, ease: "back.out(1.9)" }, t);
    });
    const tTable = t0 + 0.12 * Math.max(0, people.length - 1) + 0.3;
    table.forEach(el => {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" }, tTable);
      tl.fromTo(el, { y: 300 }, { y: 0, duration: 0.8, ease: "back.out(1.3)" }, tTable);
    });
    const tItems = tTable + 0.5; pop(items, tItems, { stagger: 0.08, rot: 10, ease: "back.out(2.4)", dur: 0.6, origin: "50% 100%" });
    const tIcons = tItems + 0.08 * items.length + 0.2; pop(icons, tIcons, { spread: 0.5 });
    if (p.ambient === false) return;
    const D = p.ambientDur, TAU = Math.PI * 2;
    if (people.length) {   /* hop, inlined */
      const L = people.map(el => { const l = ctx.layer(el), s = ctx.hash(el); l.style.transformOrigin = "50% 100%"; return { id: l.id, s, T: +(2.2 + 0.8 * ctx.hash(s + "h")).toFixed(5) }; });
      ctx.code(String.raw`  // kv-burst: people hop
  const hp = { t: 0 }, items = ${JSON.stringify(L)}, TAU = Math.PI * 2, height = 12;
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(hp, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => { const lt = hp.t;
    items.forEach((it, k) => { const ph = it.s * 3, T = it.T, q = (((lt + ph) % T) + T) % T / T, h = q < 0.18 ? Math.sin(Math.PI * q / 0.18) : 0;
      nodes[k].style.transform = "translate(0px, " + (-height * h).toFixed(2) + "px) scale(" + (1 + 0.012 * (1 - Math.cos(TAU * lt / 4 + ph))).toFixed(4) + ")"; }); } }, ${t0});`);
    }
    if (items.length) {    /* bob, inlined */
      const L = items.map(el => ({ id: ctx.layer(el).id, s: ctx.hash(el) }));
      ctx.code(String.raw`  // kv-burst: dishes bob
  const bb = { t: 0 }, items = ${JSON.stringify(L)}, TAU = Math.PI * 2, amp = 3, period = 2.6;
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(bb, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => { const lt = bb.t;
    items.forEach((it, k) => { nodes[k].style.transform = "translate(0px, " + (amp * Math.sin(TAU * lt / period + it.s * TAU)).toFixed(2) + "px)"; }); } }, ${t0});`);
    }
    if (icons.length) {    /* deco-float, inlined */
      const L = icons.map(el => { const s = ctx.hash(el); return { id: ctx.layer(el).id, s, T: +(2.6 + 1.2 * ctx.hash(s + "T")).toFixed(5) }; });
      ctx.code(String.raw`  // kv-burst: icons drift
  const df = { t: 0 }, items = ${JSON.stringify(L)}, TAU = Math.PI * 2, amp = 6, tilt = 2.5;
  const nodes = items.map(it => document.getElementById(it.id));
  tl.fromTo(df, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => { const lt = df.t;
    items.forEach((it, k) => { const ph = it.s * TAU; nodes[k].style.transform = "translate(0px, " + (amp * Math.sin(TAU * lt / it.T + ph)).toFixed(2) + "px) rotate(" + (tilt * Math.sin(TAU * lt / (it.T * 1.3) + ph * 1.7)).toFixed(2) + "deg)"; }); } }, ${t0});`);
    }
  },
});
