/* hand/comic-text: a comic sound word ("BAM!", "RẦM!"): heavy slanted letters with a thick ink outline and a hard drop shadow, on a
   jagged starburst filled with halftone dots. It slams in with claude-animation's timing (Hanif, MIT, lib/fx.mjs comicText(): scale
   eBack(d / 0.16, 2.6) = GSAP back.out(2.6) over 0.16 s, tilted -0.12 rad, the star turning slowly); "steps": true slams on twos instead
   (hand-drawn frames). The letters stay live text (an editable layer in AE). Target: a text element (its font and size are the look).
   params: color (letters), ink (outline / shadow), burst (starburst colour, "" = none), dots (halftone colour), outline (px), shadow (px),
           tilt (degrees, -7 = the original), points (starburst points), duration (s of the slam, 0.16), steps, hold_wobble (s of a small
           on-twos wobble after it lands, 0 = still like the original) */
AIMK.preset("hand/comic-text", { params: { color: "#ffd84a", ink: "#141414", burst: "#d6342b", dots: "#ffffff", outline: 10, shadow: 10, tilt: -7, points: 12,
                                           duration: 0.16, steps: false, hold_wobble: 0 },
  build(tl, els, p, ctx) { for (const el of els) {
    ctx.id(el);
    ctx.css("hand/comic-text", `.hd-comic { font-style: italic; font-weight: 900; line-height: 1; paint-order: stroke fill; -webkit-text-stroke: var(--hd-o) var(--hd-ink);
      text-shadow: var(--hd-s) var(--hd-s) 0 var(--hd-ink); white-space: nowrap; }
      .hd-comic-burst { position: absolute; left: -35%; top: -65%; width: 170%; height: 230%; transform-origin: 50% 50%; z-index: -1;
      background-image: radial-gradient(var(--hd-dots) 22%, transparent 24%); background-size: 26px 26px; }`);
    el.classList.add("hd-comic");
    el.style.setProperty("--hd-o", p.outline + "px"); el.style.setProperty("--hd-s", p.shadow + "px"); el.style.setProperty("--hd-ink", p.ink);
    el.style.color = p.color;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.isolation = "isolate";
    if (p.burst) {
      const b = document.createElement("div"); b.className = "hd-comic-burst"; b.id = el.id + "_burst";
      b.style.setProperty("--hd-dots", p.dots); b.style.backgroundColor = p.burst;
      const n = Math.max(6, p.points), pts = [];
      for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = (i % 2 ? 0.62 : 1) * (0.92 + ctx.hash(el.id + ":burst:" + i) * 0.16) * 50;
        pts.push(`${(50 + Math.cos(a) * rr).toFixed(1)}% ${(50 + Math.sin(a) * rr).toFixed(1)}%`); }
      b.style.clipPath = `polygon(${pts.join(", ")})`;
      el.insertBefore(b, el.firstChild);
      tl.fromTo(b, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: p.duration * 1.2, ease: p.steps ? "steps(4)" : "back.out(2.6)" }, p.at);
      tl.to(b, { rotation: 23, duration: 2, ease: "none" }, +(p.at + p.duration * 1.2).toFixed(4));        // the star keeps turning (2 rad/s in the original, slower here)
    }
    if (p.steps) {
      tl.fromTo(el, { scale: 0, rotation: p.tilt - 14 }, { scale: 1.22, rotation: p.tilt + 4, duration: p.duration * 0.55, ease: "steps(2)" }, p.at);
      tl.to(el, { scale: 1, rotation: p.tilt, duration: p.duration * 0.45, ease: "steps(2)" }, +(p.at + p.duration * 0.55).toFixed(4));
    } else tl.fromTo(el, { scale: 0, rotation: p.tilt }, { scale: 1, rotation: p.tilt, duration: p.duration, ease: "back.out(2.6)" }, p.at);
    const n = Math.round(p.hold_wobble * 12);                   // a small wobble on twos after it lands
    for (let i = 1; i <= n; i++) tl.set(el, { rotation: +(p.tilt + (ctx.hash(el.id + ":wob:" + i) * 2 - 1) * 1.6).toFixed(2) }, +(p.at + p.duration + i / 12).toFixed(4));
  } } });
