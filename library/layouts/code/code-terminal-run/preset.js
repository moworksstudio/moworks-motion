/* code/code-terminal-run: a terminal panel runs one command: the prompt line types itself behind a blinking caret, the command "executes" after a beat, output lines print one by one, then a fresh
   prompt with a solid caret appears and the panel holds still (a barely-there drift ends in stillness).
   Port of HyperFrames registry component code-terminal-run. BLOCK: built inside the target (an empty box, usually the whole frame); cqw / cqh / cqmin of the source are taken from that box.
   Source envelope kept (D = params.duration, authored 5 s): panel settle 0.5 s (opacity power2.out, rise from 2.6 cqh power3.out), typing from 0.4 s with the source's seeded cadence (fixed LCG seed
   0x51ec0ded; "human" 1 - 3 character chunks, "uniform" one character per 0.05 s), execute beat 0.22 s, output lines print (opacity 0.12 s) 0.3 s after execute and then every 0.3 s (or at params.cues),
   the new prompt 0.35 s after the last line; the schedule shrinks proportionally only if it would overflow D - OUT - 0.3 s; hold drift -0.45 cqh (sine.inOut halves) then 0.3 s of stillness;
   optional exit (fade / up -4 cqh) 0.45 s.
   The command line is typed by ctx.code (a proxy tween whose onUpdate is a pure function of time: characters shown across the coloured segments, caret blink and caret state); the schedule table is
   computed when the block is built and written into the code as numbers. Colour markup in params: <s>string</s> <f>flag</f> <p>path</p> <o>ok</o> <m>muted</m>. */
AIMK.preset("code/code-terminal-run", {
  params: { command: "build <p>src/app</p> <f>--minify</f> <f>--out</f> <s>\"dist/app\"</s>",
    output: ["<m>-</m> đang phân giải 128 mô-đun", "<m>-</m> đang gói <p>src/app</p>", "<o>ok</o> 128 mô-đun trong 412 ms", "<o>ok</o> đã ghi <p>dist/app</p> <m>(96 kB)</m>"],
    glyph: "$", cadence: "human", cues: [], accent: "#71f5a7", exit: "none", duration: 5,
    colStr: "#71f5a7", colFlag: "#61a8ff", colPath: "#c5a3ff", colOk: "#71f5a7", colMuted: "#94a3b8",
    bg: "transparent", base: "#000000", fg: "#f8fafc", surface: "#0b1016", border: "#475569", shadow: "#000000", radius: 0 },
  build(tl, els, p, ctx) {
    const plan = [], ft = (tg, a, b, at) => plan.push({ tg, a, b, at });   // fromTo calls are collected and made in time order; a later fromTo on a property an earlier one already animates gets immediateRender: false (as the builder writes it), so the draft equals the film
    const flush = () => { const seen = new Map(), skip = ["duration", "ease", "stagger", "repeat", "yoyo", "immediateRender", "delay"];
      plan.map((q, i) => [q, i]).sort((x, y) => x[0].at - y[0].at || x[1] - y[1]).forEach(([q]) => {
        const arr = Array.isArray(q.tg) ? q.tg : [q.tg], props = Object.keys(q.a).concat(Object.keys(q.b)).filter(k => !skip.includes(k));
        const rep = arr.some(e => { const s = seen.get(e.id); return s && props.some(k => s.has(k)); });
        arr.forEach(e => { const s = seen.get(e.id) || new Set(); props.forEach(k => s.add(k)); seen.set(e.id, s); });
        tl.fromTo(q.tg, q.a, rep ? Object.assign({ immediateRender: false }, q.b) : q.b, q.at); });
      plan.length = 0; };
    const hex = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    const rgba = (h, a) => `rgba(${hex(h).join(",")},${+a.toFixed(4)})`;
    const mix = (a, pa, b) => { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v * pa / 100 + y[i] * (100 - pa) / 100).toString(16).padStart(2, "0")).join(""); };
    ctx.css("code/code-terminal-run", `
.ctr-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; display: grid; place-items: center; font-family: "RMono", Consolas, "Cascadia Mono", Menlo, "SF Mono", "DejaVu Sans Mono", monospace; }
.ctr-stage { opacity: 0; }
.ctr-panel { overflow: hidden; }
.ctr-bar { display: flex; align-items: center; }
.ctr-dot { border-radius: 50%; flex: none; }
.ctr-line { font-weight: 500; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
.ctr-glyph { font-weight: 600; }
.ctr-ok { font-weight: 600; }
.ctr-caret { display: inline-block; vertical-align: text-bottom; }`);
    const TAGS = { s: "colStr", f: "colFlag", p: "colPath", o: "colOk", m: "colMuted" };
    const parse = str => { const out = []; let i = 0, m; const re = /<(s|f|p|o|m)>([\s\S]*?)<\/\1>/g; while ((m = re.exec(str))) { if (m.index > i) out.push([null, str.slice(i, m.index)]); out.push([m[1], m[2]]); i = re.lastIndex; } if (i < str.length) out.push([null, str.slice(i)]); return out; };
    const D = Math.max(0.001, p.duration), exitMode = p.exit === "fade" || p.exit === "up" ? p.exit : "none", uniform = p.cadence === "uniform", f = v => +v.toFixed(4), t = p.at;
    const ENTER = 0.5, TYPE_START = 0.4, EXEC_BEAT = 0.22, LEAD_BEAT = 0.3, OUT_STEP = 0.3, TAIL_GAP = 0.35, PRINT = 0.12, STILL = 0.3;
    const OUT = exitMode === "none" ? 0 : Math.min(0.45, D * 0.2), maxEnd = Math.max(TYPE_START + 0.3, D - OUT - STILL), OUT_START = D - OUT;
    const cmdSegs = parse(String(p.command)), outLines = (Array.isArray(p.output) ? p.output : [p.output]).map(s => parse(String(s)));
    const fullText = cmdSegs.map(s => s[1]).join("");
    // fixed-seed LCG (the source's), consumed in one deterministic order while the block is built
    let lcg = 0x51ec0ded;
    const rnd = () => { lcg = (Math.imul(1664525, lcg) + 1013904223) >>> 0; return lcg / 4294967296; };
    const chunksOf = w => { if (uniform) return Array.from(w); const o = []; let i = 0; while (i < w.length) { const n = 1 + Math.floor(rnd() * 3); o.push(w.slice(i, i + n)); i += n; } return o; };
    const chunkGap = c => uniform ? c.length * 0.05 : c.length * (0.04 + rnd() * 0.03);
    const rows = [[0, 0]];
    { let tt = TYPE_START, n = 0;
      fullText.split(/(\s+)/).forEach(seg => {
        if (seg === "") return;
        if (/^\s+$/.test(seg)) { tt += uniform ? 0.11 : 0.1 + rnd() * 0.1; n += seg.length; rows.push([tt, n]); return; }
        chunksOf(seg).forEach(c => { tt += chunkGap(c); n += c.length; rows.push([tt, n]); });
      }); }
    let typeEnd = Math.max(rows[rows.length - 1][0], TYPE_START + 0.01), execAt = typeEnd + EXEC_BEAT;
    let outAts = outLines.map((_, i) => execAt + LEAD_BEAT + i * OUT_STEP), tailAt = (outAts.length ? outAts[outAts.length - 1] : execAt) + TAIL_GAP;
    const naturalEnd = tailAt + PRINT;
    if (naturalEnd > maxEnd) {
      const k = (maxEnd - TYPE_START) / (naturalEnd - TYPE_START), sq = x => (x <= TYPE_START ? x : TYPE_START + (x - TYPE_START) * k);
      rows.forEach(r => { r[0] = sq(r[0]); }); typeEnd = Math.max(rows[rows.length - 1][0], TYPE_START + 0.01); execAt = sq(execAt); outAts = outAts.map(sq); tailAt = sq(tailAt);
    }
    const cueList = (Array.isArray(p.cues) ? p.cues : String(p.cues).split(",")).map(v => parseFloat(v)).filter(v => isFinite(v) && v >= 0).sort((a, b) => a - b);
    if (cueList.length) {
      let prev = execAt + LEAD_BEAT - OUT_STEP;
      outAts = outAts.map((_, i) => { let at = cueList[i] != null ? cueList[i] : prev + OUT_STEP; at = Math.max(execAt + 0.05, Math.min(maxEnd - PRINT, at)); at = Math.max(at, prev + 0.05); prev = at; return at; });
      tailAt = (outAts.length ? outAts[outAts.length - 1] : execAt) + TAIL_GAP;
    }
    tailAt = Math.max(execAt + 0.1, Math.min(maxEnd - PRINT, tailAt));
    const glyph = String(p.glyph), nLines = outLines.length + 2;
    const maxLen = Math.max(12, fullText.length + glyph.length + 3, ...outLines.map(l => l.map(s => s[1]).join("").length + glyph.length + 3), glyph.length + 3);
    for (const slot of els) {
      const bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, cw = bw / 100, ch = bh / 100, cm = Math.min(bw, bh) / 100, rad = p.radius > 0 ? p.radius : 2.4 * cm;
      const fs = f(Math.min(Math.max(2, Math.min(3.2, 108 / maxLen)) * cw, Math.max(3.2, Math.min(6.4, 46 / (nLines * 1.6))) * ch));
      const col = k => p[TAGS[k]];
      const root = ctx.make(slot, "div", "root", { cls: "ctr-root", style: { background: p.bg, color: p.fg } });
      const stage = ctx.make(root, "div", "stage", { cls: "ctr-stage", style: { width: f(84 * cw) + "px", maxWidth: f(84 * cw) + "px" } });
      const panel = ctx.make(stage, "div", "panel", { cls: "ctr-panel", style: { border: `${f(0.16 * cm)}px solid ${rgba(p.border, 0.72)}`, borderRadius: f(rad) + "px", background: mix(p.surface, 96, p.accent), boxShadow: `0 ${f(3 * ch)}px ${f(9 * ch)}px ${rgba(p.shadow, 0.38)}` } });
      const bar = ctx.make(panel, "div", "bar", { cls: "ctr-bar", style: { gap: f(1.2 * cw) + "px", padding: `${f(1.6 * ch)}px ${f(2.4 * cw)}px`, borderBottom: `${f(0.14 * cm)}px solid ${rgba(p.border, 0.55)}`, background: mix(p.surface, 88, p.base) } });
      for (let i = 1; i <= 3; i++) ctx.make(bar, "span", "d" + i, { cls: "ctr-dot", style: { width: f(1.5 * cm) + "px", height: f(1.5 * cm) + "px", background: rgba(p.colMuted, 0.52) } });
      const body = ctx.make(panel, "div", "body", { style: { padding: `${f(3 * ch)}px ${f(3 * cw)}px`, minHeight: f(40 * ch) + "px" } });
      const lineCss = { fontSize: fs + "px" };
      const withGlyph = el => { if (glyph) ctx.make(el, "span", "glyph", { cls: "ctr-glyph", text: glyph, style: { color: p.accent, marginRight: "0.9ch" } }); };
      const cmd = ctx.make(body, "div", "cmd", { cls: "ctr-line", style: lineCss });
      withGlyph(cmd);
      const segIds = cmdSegs.map((s, i) => { const e = ctx.make(cmd, "span", "c" + i, { cls: s[0] === "o" ? "ctr-ok" : "", text: "", style: s[0] ? { color: col(s[0]) } : {} }); return { id: e.id, full: s[1] }; });
      const caret = ctx.make(cmd, "span", "caret", { cls: "ctr-caret", style: { width: "0.55ch", height: "1.05em", marginLeft: "0.08ch", background: p.accent } });
      const outs = outLines.map((segs, li) => {
        const el = ctx.make(body, "div", "out" + (li + 1), { cls: "ctr-line", style: Object.assign({ opacity: 0 }, lineCss) });
        segs.forEach((s, i) => ctx.make(el, "span", "s" + i, { cls: s[0] === "o" ? "ctr-ok" : "", text: s[1], style: s[0] ? { color: col(s[0]) } : {} }));
        return el;
      });
      const tail = ctx.make(body, "div", "tail", { cls: "ctr-line", style: Object.assign({ opacity: 0 }, lineCss) });
      withGlyph(tail);
      ctx.make(tail, "span", "caret", { cls: "ctr-caret", style: { width: "0.55ch", height: "1.05em", marginLeft: "0.08ch", background: p.accent } });
      const cycles = Math.max(1, Math.round(typeEnd / 0.9));
      ctx.code(`  // code-terminal-run #${slot.id}: the command line types itself (characters across the coloured segments, caret blink then solid then gone at execute)
  (function () {
    const E = id => document.getElementById(id), SEGS = ${JSON.stringify(segIds)}, ROWS = ${JSON.stringify(rows.map(r => [f(r[0]), r[1]]))}, caret = E(${JSON.stringify(caret.id)});
    const TYPE_END = ${f(typeEnd)}, EXEC_AT = ${f(execAt)}, CYCLES = ${cycles};
    const charsAt = T => { for (let i = ROWS.length - 1; i >= 0; i--) if (T >= ROWS[i][0] - 0.001) return ROWS[i][1]; return 0; };
    function apply(T) {
      let rem = charsAt(T);
      SEGS.forEach(s => { E(s.id).textContent = s.full.slice(0, Math.max(0, Math.min(s.full.length, rem))); rem -= s.full.length; });
      caret.style.opacity = T >= EXEC_AT ? "0" : T >= TYPE_END ? "1" : (Math.sin(Math.PI * 2 * CYCLES * T / TYPE_END) >= 0 ? "1" : "0");
    }
    apply(0);
    const drv = { t: 0 };
    tl.fromTo(drv, { t: 0 }, { t: EXEC_AT, duration: EXEC_AT, ease: "none", onUpdate: () => apply(drv.t) }, ${t});
  })();`);
      ft(stage, { opacity: 0 }, { opacity: 1, duration: ENTER, ease: "power2.out" }, t);
      ft(stage, { y: f(2.6 * ch) }, { y: 0, duration: ENTER, ease: "power3.out" }, t);
      outs.forEach((el, i) => ft(el, { opacity: 0 }, { opacity: 1, duration: PRINT, ease: "none" }, t + f(outAts[i])));
      ft(tail, { opacity: 0 }, { opacity: 1, duration: PRINT, ease: "none" }, t + f(tailAt));
      const settleEnd = tailAt + PRINT, holdSpan = OUT_START - settleEnd;
      if (holdSpan > 0.9) {
        const half = (holdSpan - STILL) / 2;
        ft(stage, { y: 0 }, { y: f(-0.45 * ch), duration: f(half), ease: "sine.inOut" }, t + f(settleEnd));
        ft(stage, { y: f(-0.45 * ch) }, { y: 0, duration: f(half), ease: "sine.inOut" }, t + f(settleEnd + half));
      }
      if (exitMode !== "none") {
        ft(stage, { opacity: 1 }, { opacity: 0, duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
        if (exitMode === "up") ft(stage, { y: 0 }, { y: f(-4 * ch), duration: f(OUT), ease: "power2.in" }, t + f(OUT_START));
      }
    }
    flush();
  },
});
