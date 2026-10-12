/* title/titlecard-lockup: the calm breather titlecard: an optional mono kicker fades up, the wordmark settles dead-centre with one restrained move (scale 0.96 -> 1), a hairline rule
   draws left to right under it, a mono label fades in under the rule, then the finished lockup holds truly still.
   Port of HyperFrames registry component titlecard-lockup. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh / cqmin of the source are taken from that box.
   Source envelope kept (D = params.duration, authored 4 s): kicker 0.45 s power2.out from 2.2 cqh at 0; wordmark 0.85 s power3.out at 0.25; rule 0.55 s power2.out at 0.9; label 0.5 s power2.out
   from 1.8 cqh at 1.3; IN = 1.8 s; optional exit (fade / up) 0.5 s power2.in at D - 0.5 (up: -2.4 cqh); the phases shrink together when D is shorter than IN + OUT. */
AIMK.preset("title/titlecard-lockup", {
  params: { wordmark: "HYPERFRAMES", label: "VIẾT HTML. XUẤT VIDEO.", kicker: "GIỚI THIỆU", rule: true, accent: "#71f5a7", exit: "none", duration: 4, bg: "#0b0c0e", fg: "#f8fafc" },
  build(tl, els, p, ctx) {
    const hex = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const mix = (a, pa, b) => { const x = hex(a), y = hex(b); return x.map((v, i) => Math.round(v * pa / 100 + y[i] * (100 - pa) / 100)); };
    ctx.css("title/titlecard-lockup", `
.tlk-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; display: grid; place-items: center; }
.tlk-lock { display: flex; flex-direction: column; align-items: center; text-align: center; }
.tlk-mono { display: block; font-family: "RMono", Consolas, "Cascadia Mono", Menlo, "SF Mono", "DejaVu Sans Mono", monospace; font-weight: 600; }
.tlk-word { display: block; font-weight: 600; line-height: 1; letter-spacing: -0.03em; white-space: nowrap; transform-origin: 50% 50%; }
.tlk-rule { display: block; transform-origin: 0% 50%; }`);
    const D = Math.max(0.001, p.duration), exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none", norm = s => String(s == null ? "" : s).trim().replace(/\s+/g, " ");
    const IN0 = 1.8, OUT0 = exitMode === "none" ? 0 : 0.5, sc = D < IN0 + OUT0 ? D / (IN0 + OUT0) : 1, OUT = OUT0 * sc, OUT_START = D - OUT, f = v => +v.toFixed(4), t = p.at;
    const wm = norm(p.wordmark), lab = norm(p.label), kick = norm(p.kicker), ruleOn = !(p.rule === false || p.rule === "hide");
    const ink = `rgb(${mix(p.fg, 62, p.bg === "transparent" ? "#0b0c0e" : p.bg).join(",")})`, ruleC = `rgba(${mix(p.accent, 60, p.fg).join(",")},0.62)`;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100;
      const root = ctx.make(slot, "div", "root", { cls: "tlk-root", style: { background: p.bg, color: p.fg } });
      const lock = ctx.make(root, "div", "lockup", { cls: "tlk-lock", style: { maxWidth: f(92 * cw) + "px" } });
      let k = null, r = null, l = null;
      if (kick) k = ctx.make(lock, "div", "kicker", { cls: "tlk-mono", text: kick.toUpperCase(), style: { marginBottom: f(3.4 * ch) + "px", color: ink, fontSize: f(2.6 * cm) + "px", lineHeight: "1", letterSpacing: "0.3em", textIndent: "0.3em" } });
      const fit = Math.min(12, 84 / (Math.max(1, Array.from(wm).length) * 0.78));
      const w = ctx.make(lock, "div", "wordmark", { cls: "tlk-word", text: wm, style: { maxWidth: f(92 * cw) + "px", color: p.fg, fontSize: f(Math.min(fit * cw, 22 * ch)) + "px" } });
      if (ruleOn) r = ctx.make(lock, "div", "rule", { cls: "tlk-rule", style: { width: f(34 * cw) + "px", height: f(Math.max(1, 0.2 * cm)) + "px", marginTop: f(4 * ch) + "px", background: ruleC } });
      if (lab) l = ctx.make(lock, "div", "label", { cls: "tlk-mono", text: lab.toUpperCase(), style: { marginTop: f(3.2 * ch) + "px", color: ink, fontSize: f(2.2 * cm) + "px", lineHeight: "1.4", letterSpacing: "0.34em", textIndent: "0.34em" } });
      if (k) tl.fromTo(k, { opacity: 0, y: f(2.2 * ch) }, { opacity: 1, y: 0, duration: f(0.45 * sc), ease: "power2.out" }, t);
      tl.fromTo(w, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: f(0.85 * sc), ease: "power3.out" }, t + f(0.25 * sc));
      if (r) tl.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: f(0.55 * sc), ease: "power2.out" }, t + f(0.9 * sc));
      if (l) tl.fromTo(l, { opacity: 0, y: f(1.8 * ch) }, { opacity: 1, y: 0, duration: f(0.5 * sc), ease: "power2.out" }, t + f(1.3 * sc));
      if (exitMode === "fade") tl.fromTo(lock, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
      if (exitMode === "up") tl.fromTo(lock, { opacity: 1, y: 0 }, { opacity: 0, y: f(-2.4 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
    }
  },
});
