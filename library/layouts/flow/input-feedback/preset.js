/* flow/input-feedback: a form field with validation feedback: the field rises in, shakes once, a status chip pops in, the helper line settles under it.
   Port of HyperFrames registry component input-feedback (layout, colours, sizes and timing as in the source; font = the film's font, the source used Inter).
   BLOCK: the target is an empty box (usually the whole frame); the field is built in its middle and shown `scale` times larger, as the source demo does
   (a wrapper with transform: scale, never tweened). Source timing kept: widget y 22 + opacity 0.34 s power2.out at 0.3; shake x 0 -> -12, 0.06 s linear, yoyo, 5 repeats
   (6 half-shakes, back at 0) at 0.72; chip scale 0 -> 1 + opacity 0.28 s back.out(2) at 1.18; hint y -6 -> 0 + opacity 0.22 s power2.out at 1.28.
   status: "valid" (green chip and hint) or "error" (red border, chip and hint, chip says !). */
AIMK.preset("flow/input-feedback", {
  params: { status: "valid", label: "Email", value: "mia@vidu.vn", hint: "Trông ổn rồi.", clear: "x", chipOk: "OK", chipErr: "!", scale: 2.8, ink: "#18181b", labelInk: "#52525b", surface: "#ffffff",
    clearBg: "#f4f4f5", clearInk: "#71717a" },
  build(tl, els, p, ctx) {
    ctx.css("flow/input-feedback", `
.ifb-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.ifb { display: grid; gap: 10px; width: 430px; }
.ifb-label { font-size: 15px; font-weight: 850; }
.ifb-shell { display: flex; align-items: center; gap: 12px; height: 62px; padding: 0 16px; border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,.08); }
.ifb-value { flex: 1; font-size: 20px; font-weight: 760; }
.ifb-clear, .ifb-chip { display: grid; place-items: center; height: 28px; border-radius: 999px; font-size: 12px; font-weight: 900; }
.ifb-clear { width: 28px; }
.ifb-chip { min-width: 38px; padding: 0 8px; }
.ifb-hint { font-size: 14px; font-weight: 800; }`);
    const err = p.status === "error", t = p.at;
    const C = err ? { border: "#fca5a5", chipBg: "#fee2e2", chipFg: "#991b1b", hint: "#dc2626" } : { border: "#d4d4d8", chipBg: "#dcfce7", chipFg: "#166534", hint: "#16a34a" };
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "ifb-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const box = ctx.make(wrap, "div", "field", { cls: "ifb", style: { color: p.ink } });
      ctx.make(box, "div", "label", { cls: "ifb-label", text: p.label, style: { color: p.labelInk } });
      const shell = ctx.make(box, "div", "shell", { cls: "ifb-shell", style: { border: `1px solid ${C.border}`, background: p.surface } });
      ctx.make(shell, "div", "value", { cls: "ifb-value", text: p.value });
      ctx.make(shell, "div", "clear", { cls: "ifb-clear", text: p.clear, style: { background: p.clearBg, color: p.clearInk } });
      const chip = ctx.make(shell, "div", "chip", { cls: "ifb-chip", text: err ? p.chipErr : p.chipOk, style: { background: C.chipBg, color: C.chipFg } });
      const hint = ctx.make(box, "div", "hint", { cls: "ifb-hint", text: p.hint, style: { color: C.hint } });
      tl.fromTo(box, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" }, t + 0.3);
      tl.fromTo(shell, { x: 0 }, { x: -12, duration: 0.06, repeat: 5, yoyo: true, ease: "none" }, t + 0.72);
      tl.fromTo(chip, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2)" }, t + 1.18);
      tl.fromTo(hint, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, t + 1.28);
    }
  },
});
