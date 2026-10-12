/* text/film-timecode: a running camera timecode (HH:MM:SS:FF) that IS the film's time, frame by frame, for a viewfinder / REC look: one
   code block, a pure function of film time (the same frame always shows the same number). Pair it with a viewfinder frame (corner brackets,
   a blinking REC dot: `blink`) or effect/camcorder-hud. Written for a studio film (08/10/2026, the viewfinder storyboard).
   Target: the text element that shows the code (its own text is replaced). params: fps (frames in the code, 60), start (s added: a code
   that does not start at 0), dur (s it runs), prefix (e.g. "REC  "), blink (id of a dot that blinks once a second, or "") */
AIMK.preset("text/film-timecode", { params: { fps: 60, start: 0, dur: 10, prefix: "", blink: "" },
  build(tl, els, p, ctx) {
    const el = els[0], v = "tft_" + el.id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // text/film-timecode in #${el.id}: HH:MM:SS:FF of film time (pure function of film time)
  const ${v} = { t: 0 };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const f = Math.round((${p.start} + ${v}.t) * ${p.fps}), s = Math.floor(f / ${p.fps}), pad = n => String(n).padStart(2, "0");
    const el = document.getElementById(${JSON.stringify(el.id)});
    if (el) el.textContent = ${JSON.stringify(p.prefix)} + pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60) + ":" + pad(f % ${p.fps});
    const b = ${JSON.stringify(p.blink)} && document.getElementById(${JSON.stringify(p.blink)});
    if (b) b.style.opacity = ((${p.at} + ${v}.t) % 1) < 0.5 ? "1" : "0.15";
  } }, ${p.at});`);
  } });
