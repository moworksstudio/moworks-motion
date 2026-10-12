/* ui/typed-prompt: a prompt line types itself in a human, chunked rhythm in a dark input panel behind a blinking accent caret; optionally it
   mistypes the last word, backspaces it and retypes it. Port of HyperFrames registry component typed-prompt. BLOCK: built inside the target
   (usually the whole frame); cqw / cqh / cqmin of the source are taken from that box. As in the source: panel 82 cqw, padding 3.4 cqh / 3 cqw,
   border 0.16 cqmin, radius 2.4 cqmin, surface #0b1016 with 6 % accent, shadow 0 3cqh 9cqh; the panel settles in 0.5 s (opacity power2.out, y 2.6
   cqh -> 0 power3.out); typing from 0.35 s from one text-at-time table (fixed LCG 0x7f4a7c15: 1-3 character chunks, 50-90 ms per character, 100-200
   ms between words; uniform: 1 character per 55 ms, 110 ms between words; correction: +0.4 s, 55 ms per backspace, +0.22 s); the caret blinks a whole
   number of 0.9 s cycles over the typing, then stays solid; hold drift -0.45 cqh and back ending 0.3 s before the end; exit 0.45 s power2.in.
   Font size min(max(2.2, min(4.2, 118 / longest row + 2)) cqw, 9 cqh), the kit's RMono for the source's monospace. Text and caret via ctx.code. */
AIMK.preset("ui/typed-prompt", {
  params: { text: "Dựng một video ra mắt sản phẩm", glyph: ">", cadence: "human", caret: "blink", correction: "", cues: "", accent: "green", duration: 4, exit: "none",
            fg: "#f8fafc", surface: "#0b1016", border: "#475569", shadow: "#000000" },
  build(tl, els, p, ctx) {
    const acc = { green: "#71f5a7", blue: "#61a8ff", violet: "#c5a3ff" }[p.accent] || p.accent;
    const rgb = c => { const d = document.createElement("span"); d.style.color = c; document.body.appendChild(d); const m = getComputedStyle(d).color.match(/[\d.]+/g).slice(0, 3).map(Number); d.remove(); return m; };
    const text = String(p.text).normalize("NFC"), corr = String(p.correction || "").normalize("NFC").trim(), uni = p.cadence === "uniform";
    const cues = String(p.cues || "").split(",").map(parseFloat).filter(v => isFinite(v) && v >= 0).sort((a, b) => a - b);
    const D = Math.max(0.001, p.duration), OUT = p.exit === "fade" || p.exit === "up" ? Math.min(0.45, D * 0.2) : 0, TS = 0.35;
    let st = 0x7f4a7c15; const rnd = () => (st = (Math.imul(1664525, st) + 1013904223) >>> 0) / 4294967296;
    const chunks = w => { if (uni) return [...w]; const a = [...w], o = []; let i = 0; while (i < a.length) { const n = 1 + Math.floor(rnd() * 3); o.push(a.slice(i, i + n).join("")); i += n; } return o; };
    const gap = c => [...c].length * (uni ? 0.055 : 0.05 + rnd() * 0.04);
    const rows = [{ t: 0, x: "" }], words = text.split(/\s+/).filter(Boolean), fix = corr !== "" && words.length > 0;
    let t = TS, accS = "";
    words.forEach((w, wi) => {
      const last = wi === words.length - 1, typed = fix && last ? corr : w;
      if (wi > 0) accS += " ";
      if (cues[wi] != null) t = Math.max(t, cues[wi]); else if (wi > 0) t += uni ? 0.11 : 0.1 + rnd() * 0.1;
      chunks(typed).forEach(c => { t += gap(c); accS += c; rows.push({ t, x: accS }); });
      if (fix && last) {
        t += 0.4; const A = [...accS], n = [...corr].length;
        for (let b = 1; b <= n; b++) { t += 0.055; rows.push({ t, x: A.slice(0, A.length - b).join("") }); }
        accS = A.slice(0, A.length - n).join(""); t += 0.22;
        chunks(w).forEach(c => { t += gap(c); accS += c; rows.push({ t, x: accS }); });
      }
    });
    const nat = rows[rows.length - 1].t, maxEnd = Math.max(TS + 0.2, D - OUT - 0.3);
    if (nat > maxEnd) { const k = (maxEnd - TS) / (nat - TS); rows.forEach(r => { if (r.t > TS) r.t = TS + (r.t - TS) * k; }); }
    rows.forEach(r => r.t = +r.t.toFixed(4));
    const typeEnd = Math.max(rows[rows.length - 1].t, TS + 0.01), maxLen = rows.reduce((b, r) => Math.max(b, [...r.x].length), 1) + 2, f = v => +v.toFixed(4), at = p.at;
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100, id = ctx.id(slot, "b");
      const S = rgb(p.surface), Ac = rgb(acc), Bo = rgb(p.border), Sh = rgb(p.shadow), fs = f(Math.min(Math.max(2.2, Math.min(4.2, 118 / maxLen)) * cw, 9 * ch));
      const root = ctx.make(slot, "div", "root", { style: { position: "absolute", inset: "0px", display: "grid", placeItems: "center", overflow: "hidden", color: p.fg, fontFamily: '"RMono", Consolas, monospace' } });
      const stage = ctx.make(root, "div", "stage", { style: { width: f(82 * cw) + "px", opacity: "0" } });
      const shell = ctx.make(stage, "div", "shell", { style: { display: "flex", alignItems: "flex-start", gap: f(1.6 * cw) + "px", minHeight: f(18 * ch) + "px", padding: `${f(3.4 * ch)}px ${f(3 * cw)}px`,
        border: `${f(0.16 * cm)}px solid rgba(${Bo.join(", ")}, 0.72)`, borderRadius: f(2.4 * cm) + "px", background: `rgb(${S.map((v, i) => Math.round(v * 0.94 + Ac[i] * 0.06)).join(", ")})`,
        boxShadow: `0 ${f(3 * ch)}px ${f(9 * ch)}px rgba(${Sh.join(", ")}, 0.38)` } });
      if (p.glyph !== "") ctx.make(shell, "span", "glyph", { text: p.glyph, style: { flex: "0 0 auto", color: acc, fontSize: fs + "px", fontWeight: "600", lineHeight: "1.45" } });
      const line = ctx.make(shell, "span", "line", { style: { flex: "1 1 auto", minWidth: "0px", fontSize: fs + "px", fontWeight: "500", lineHeight: "1.45", overflowWrap: "anywhere", whiteSpace: "pre-wrap" } });
      const tx = ctx.make(line, "span", "text", { text: "" });
      const caret = ctx.make(line, "span", "caret", { style: { display: "inline-block", width: "0.55ch", height: "1.05em", marginLeft: "0.08ch", background: acc, verticalAlign: "text-bottom" } });
      tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, at);
      tl.fromTo(stage, { y: f(2.6 * ch) }, { y: 0, duration: 0.5, ease: "power3.out" }, at);
      const v = "tp_" + id.replace(/\W/g, "_");
      ctx.code(`  // typed-prompt #${id}: the text at each moment is read from one table (time, text), as in the source
  const ${v} = { t: 0 }, ${v}_rows = ${JSON.stringify(rows)};
  tl.fromTo(${v}, { t: 0 }, { t: ${f(typeEnd)}, duration: ${f(typeEnd)}, ease: "none", onUpdate: () => {
    let s = ""; for (let i = ${v}_rows.length - 1; i >= 0; i--) if (${v}.t >= ${v}_rows[i].t - 0.001) { s = ${v}_rows[i].x; break; }
    document.getElementById("${tx.id}").textContent = s;
  } }, ${at});`);
      if (p.caret !== "solid") {
        const cyc = Math.max(1, Math.round(typeEnd / 0.9)), T = typeEnd / cyc;
        for (let i = 0; i < cyc; i++) { tl.set(caret, { opacity: 1 }, f(at + i * T)); tl.set(caret, { opacity: 0 }, f(at + i * T + T / 2)); }
        tl.set(caret, { opacity: 1 }, f(at + typeEnd));
      }
      const OS = D - OUT, hs = OS - typeEnd;
      if (hs > 0.9) { const h = (hs - 0.3) / 2; tl.fromTo(stage, { y: 0 }, { y: f(-0.45 * ch), duration: f(h), ease: "sine.inOut" }, f(at + typeEnd)); tl.fromTo(stage, { y: f(-0.45 * ch) }, { y: 0, duration: f(h), ease: "sine.inOut" }, f(at + typeEnd + h)); }
      if (OUT) { tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, f(at + OS)); if (p.exit === "up") tl.fromTo(stage, { y: 0 }, { y: f(-4 * ch), duration: f(OUT), ease: "power2.in" }, f(at + OS)); }
    }
  },
});
