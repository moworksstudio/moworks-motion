/* text/typewriter: the line types itself out character by character behind a blinking caret.
   Port of HyperFrames registry component typewriter (motion only: the source's monospace font, size and colour tokens belong to the film).
   Source recipe: one type progress 0 -> 1 over 1.2 s with ease steps(28) (the source line has ~28 characters), and a 3 px caret whose
   opacity yoyos to 0.2 (0.24 s per half, repeat 7, linear) starting 0.2 s after the typing starts. Variable "caret": line | block | none.
   The typed and the not-yet-typed text are two spans (the second one invisible), so the line keeps its final layout the whole time
   and lands exactly on it. The per-frame text goes through ctx.code (a proxy tween whose onUpdate is a pure function of the progress). */
AIMK.preset("text/typewriter", {
  params: { duration: 1.2, steps: 0, caret: "line", caretWidth: 0, caretColor: "currentColor", blinkAt: 0.2, blinkLow: 0.2, blinkHalf: 0.24, blinkRepeat: 7 },
  build(tl, els, p, ctx) {
    ctx.css("text/typewriter", `
.twcr { display: inline-block; position: relative; width: 0; height: 0; }
.twcr-bar { position: absolute; left: 4px; bottom: -0.16em; height: 1em; border-radius: 999px; }`);
    for (const el of els) {
      const text = el.textContent.replace(/\s+/g, " ").trim(), n = Array.from(text).length;
      const steps = p.steps > 0 ? p.steps : n;
      ctx.id(el, "t"); el.textContent = "";
      const typed = ctx.make(el, "span", "typed", { text: "" });
      let caret = null;
      if (p.caret !== "none") {
        caret = ctx.make(el, "span", "caret", { cls: "twcr" });
        ctx.make(caret, "i", "bar", { cls: "twcr-bar", style: { width: (p.caretWidth || (p.caret === "block" ? 22 : 3)) + "px", background: p.caretColor } });
      }
      const rest = ctx.make(el, "span", "rest", { text, style: { visibility: "hidden" } });
      const v = "tw_" + el.id.replace(/\W/g, "_");
      ctx.code(`  // typewriter #${el.id}: typed = first k characters of the line, k from the stepped progress
  const ${v} = { v: 0 }, ${v}_text = Array.from(${JSON.stringify(text)});
  tl.fromTo(${v}, { v: 0 }, { v: 1, duration: ${p.duration}, ease: "steps(${steps})", onUpdate: () => {
    const k = Math.round(${v}.v * ${v}_text.length);
    document.getElementById("${typed.id}").textContent = ${v}_text.slice(0, k).join("");
    document.getElementById("${rest.id}").textContent = ${v}_text.slice(k).join("");
  } }, ${p.at});`);
      if (caret) tl.fromTo(caret, { opacity: 1 }, { opacity: p.blinkLow, duration: p.blinkHalf, repeat: p.blinkRepeat, yoyo: true, ease: "none" }, p.at + p.blinkAt);
    }
  },
});
