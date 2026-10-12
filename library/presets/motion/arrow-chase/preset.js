/* motion/arrow-chase: a row of arrows / chevrons lights up one after another from left to right, again and again: each in turn brightens,
   glows (a coloured drop-shadow halo) and nudges forward, then settles back dim. Pure function of film time. Written for a studio film
   (08/10/2026: "mũi tên chạy từ trái qua phải, enhance lighting / glowing"). Put it on the outer boxes (entrances on an inner layer).
   params: ids (left to right; default the targets), period (s for one run across), lag (0-1 of the period between neighbours), push (px),
   color ("r,g,b" of the glow), dur */
AIMK.preset("motion/arrow-chase", { params: { ids: [], period: 1.1, lag: 0.16, push: 22, color: "255,190,60", dur: 4 },
  build(tl, els, p, ctx) {
    const ids = p.ids.length ? p.ids : els.map(e => e.id);
    const v = "mac_" + els[0].id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    ctx.code(`  // motion/arrow-chase: arrows light up left to right (pure function of film time)
  const ${v} = { t: 0 };
  tl.fromTo(${v}, { t: 0 }, { t: ${p.dur}, duration: ${p.dur}, ease: "none", onUpdate: () => {
    const T = ${v}.t, ramp = Math.min(1, T / 0.4);
    ${JSON.stringify(ids)}.forEach((id, k) => { const el = document.getElementById(id); if (!el) return;
      const f = ((T / ${p.period} - k * ${p.lag}) % 1 + 1) % 1, q = ramp * Math.pow(Math.max(0, Math.sin(Math.PI * f)), 6);
      el.style.transform = "translateX(" + (${p.push} * q).toFixed(2) + "px)";
      el.style.opacity = (0.6 + 0.4 * q + 0.4 * (1 - ramp)).toFixed(3);
      el.style.filter = "brightness(" + (1 + 0.9 * q).toFixed(3) + ") drop-shadow(0px 0px " + (6 + 18 * q).toFixed(1) + "px rgba(${p.color}," + (0.35 + 0.6 * q).toFixed(3) + "))"; });
  } }, ${p.at});`);
  } });
