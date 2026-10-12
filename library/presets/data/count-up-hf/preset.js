/* data/count-up-hf: a stat counter that arrives, counts from start to end on a sine.inOut curve in 30 fps steps, lands on the exact end value
   with one scale pulse (1.07), then drifts 0.55 % of the frame height up and back before holding still.
   Port of HyperFrames registry component count-up. BLOCK: the target is an empty box (usually the whole frame); the stat is built inside it.
   Source timing kept: arrival 0.38 s, count 1.72 s, pulse 0.165 + 0.165 s, IN = 2.05 s, stillness 0.25 s at the end of the hold.
   `duration` is the authored length of the source composition (3 s): it only sets the drift (hold - 0.25 s) and the exit start. */
AIMK.preset("data/count-up-hf", {
  params: { start: 0, end: 100, prefix: "", suffix: "%", accent: "#71f5a7", fg: "#f8fafc", glow: false, exit: "none", duration: 3, locale: "en-US" },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, t = p.at;
    const rgb = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const A = rgb(p.accent), F = rgb(p.fg);
    const mix = A.map((v, i) => Math.round(v * 0.72 + F[i] * 0.28));       // color-mix(accent 72%, fg)
    const fmt = v => Math.round(v).toLocaleString(p.locale);
    const lift = s => /^[$€£¥₹₩₫]$/.test(s) ? "-0.31em" : /^[+−±×=~<>-]+$/.test(s) ? "-0.36em" : "0";
    const chars = Math.max([...(p.prefix + fmt(p.start) + p.suffix)].length, [...(p.prefix + fmt(p.end) + p.suffix)].length, 1);
    const fontPx = Math.min(Math.min(20, 150 / chars) * W / 100, 0.34 * H);
    ctx.css("data/count-up-hf", `
.cuh { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.cuh-stage { display: flex; align-items: baseline; justify-content: center; overflow: hidden; font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1;
  font-weight: 600; line-height: 1; letter-spacing: -0.045em; text-align: center; white-space: nowrap; transform-origin: 50% 58%; }
.cuh-affix { position: relative; flex: 0 0 auto; font-size: 0.55em; font-weight: 600; letter-spacing: -0.02em; }
.cuh-pre { margin-right: 0.14em; } .cuh-suf { margin-left: 0.14em; } .cuh-affix:empty { display: none; }
.cuh-val { display: inline-block; min-width: 1ch; }`);
    const IN = 2.05, COUNT = 1.72, PULSE = 0.165, ARRIVAL = 0.38, STILL = 0.25, OUT = p.exit === "none" ? 0 : 0.45;
    const HOLD = Math.max(0, p.duration - IN - OUT), N = Math.max(1, Math.round(COUNT * 30));
    for (const slot of els) {
      const box = ctx.make(slot, "div", "cu", { cls: "cuh" });
      const stage = ctx.make(box, "div", "stage", { cls: "cuh-stage", style: { width: Math.round(0.92 * W) + "px", fontSize: fontPx.toFixed(2) + "px", color: p.accent,
        textShadow: p.glow ? `0 ${(0.024 * H).toFixed(1)}px ${(0.07 * H).toFixed(1)}px rgba(${A.join(",")},.24)` : "none" } });
      const aff = `rgb(${mix.join(",")})`;
      ctx.make(stage, "span", "pre", { cls: "cuh-affix cuh-pre", text: p.prefix, style: { color: aff, top: lift(p.prefix) } });
      const val = ctx.make(stage, "span", "val", { cls: "cuh-val", text: fmt(p.start) });
      ctx.make(stage, "span", "suf", { cls: "cuh-affix cuh-suf", text: p.suffix, style: { color: aff, top: lift(p.suffix) } });
      const y0 = +(0.022 * H).toFixed(2);
      tl.fromTo(stage, { opacity: 0, y: y0, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: ARRIVAL, ease: "power3.out" }, t);
      tl.to(stage, { scale: 1.07, duration: PULSE, ease: "power3.out" }, t + COUNT);
      tl.to(stage, { scale: 1, duration: PULSE, ease: "power2.out" }, t + COUNT + PULSE);
      const drift = Math.max(0, HOLD - STILL);
      if (drift > 0) {
        const dy = -+(0.0055 * H).toFixed(2);
        tl.to(stage, { y: dy, duration: drift / 2, ease: "sine.inOut" }, t + IN);
        tl.to(stage, { y: 0, duration: drift / 2, ease: "sine.inOut" }, t + IN + drift / 2);
      }
      const outAt = t + IN + HOLD;
      if (p.exit === "up") {
        tl.to(stage, { y: -+(0.022 * H).toFixed(2), duration: OUT, ease: "power2.in" }, outAt);
        tl.to(stage, { opacity: 0, scale: 0.985, duration: OUT, ease: "power2.in" }, outAt);
      } else if (p.exit === "fade") tl.to(stage, { opacity: 0, duration: OUT, ease: "power2.in" }, outAt);
      /* the number: a proxy runs 0..1 over the count; the shown value is a pure function of it (30 fps steps of a sine.inOut curve, as in the source) */
      const v = "c_" + val.id.replace(/\W/g, "_");
      ctx.code(`  const ${v} = { t: 0 };  // count-up-hf #${val.id}
  const ${v}_e = gsap.parseEase("sine.inOut");
  tl.fromTo(${v}, { t: 0 }, { t: 1, duration: ${COUNT}, ease: "none", onUpdate: () => { const f = Math.floor(${v}.t * ${N} + 1e-9);
    document.getElementById("${val.id}").textContent = Math.round(${p.start} + (${p.end} - ${p.start}) * ${v}_e(f / ${N})).toLocaleString("${p.locale}"); } }, ${t});`);
    }
  },
});
