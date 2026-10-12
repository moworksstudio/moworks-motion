/* text/caption-camera-follow: the words do not move, the camera does. One sentence is laid out self-similarly: each new word is a fraction (0.72)
   of the height of everything written so far and lands either to the right of that block or on a new line under it, so the camera pulls back at a
   steady exponential rate and every word arrives at about the same size on screen; each move carries a radial motion blur, and the end pulls all
   the way out until the whole sentence is readable. Port of HyperFrames registry component caption-camera-follow: layout rule, poses, cubic-bezier
   eases (written as custom() eases, the same curves), radial smear and timing as in the source.
   Timing: each word lands at its own voice time ("params": { "words": "voice" }) or, for words without times, every `step` seconds (source 0.52 s);
   moves take 0.4 s; the closing pull-back starts 0.62 s after the last word and lasts 0.94 s. BLOCK: the target is an empty box (usually the whole
   frame); the camera frames it. params.keywords: words drawn in the accent colour. The film's font replaces Helvetica Neue. */
AIMK.preset("text/caption-camera-follow", {
  params: { words: [], keywords: [], step: 0.52, accent: "gold", framing: "standard", smear: "standard", upper: true, vignette: true, markRoom: 0.25 },
  build(tl, els, p, ctx) {
    const ACC = { gold: "#ffd84d", green: "#34d399", blue: "#38bdf8", violet: "#a78bfa" };
    const accent = ACC[p.accent] || (String(p.accent).startsWith("#") ? p.accent : ACC.gold);
    const FRAMING = { tight: 0.82, standard: 1, wide: 1.25 }[p.framing] || 1, SMEAR = { off: 0, subtle: 0.5, standard: 1, heavy: 1.9 }[p.smear] ?? 1;
    const E = { step: "custom(M0,0 C 0.31,0 0.11,1 1,1)", wide: "custom(M0,0 C 0.42,0 0.14,1 1,1)", ink: "custom(M0,0 C 0.2,0.7 0.3,1 1,1)",
                up: "custom(M0,0 C 0.2,0.8 0.4,1 1,1)", down: "custom(M0,0 C 0.5,0 0.2,1 1,1)" };
    const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
    const KEY = new Set((p.keywords || []).map(norm));
    const raw = (p.words || []).map(w => typeof w === "string" ? { text: w } : w).filter(w => w && String(w.text).trim());
    const WORDS = raw.map((w, i) => ({ text: p.upper ? String(w.text).trim().toUpperCase() : String(w.text).trim(), accent: KEY.has(norm(w.text)),
                                       t: w.start != null ? Math.max(0, +w.start) : i * p.step }));
    ctx.css("text/caption-camera-follow", `
.capcf { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.capcf-stage { position: absolute; inset: 0; overflow: hidden; }
.capcf-world { position: absolute; left: 0; top: 0; width: 0; height: 0; transform-origin: 0 0; }
.capcf-w { position: absolute; white-space: nowrap; font-weight: 700; letter-spacing: 0.005em; line-height: 0.78; color: #ffffff; opacity: 0;
  filter: blur(calc(var(--k, 0) * var(--amt, 0px))); }
.capcf-vig { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,.55) 100%); }`);
    for (const slot of els) {
      if (!WORDS.length) continue;
      const FW = slot.offsetWidth || ctx.W, FH = slot.offsetHeight || ctx.H;
      const root = ctx.make(slot, "div", "cf", { cls: "capcf" });
      const stage = ctx.make(root, "div", "stage", { cls: "capcf-stage" });
      const world = ctx.make(stage, "div", "world", { cls: "capcf-world" });
      world.style.setProperty("--amt", "0px");
      if (p.vignette) ctx.make(root, "div", "vig", { cls: "capcf-vig" });
      // layout: measure each word at its size against the block written so far (source: a hidden ruler)
      const BASE = Math.max(FW, FH) * 0.16, RATIO = 0.72, MARGIN = 1.36 * FRAMING;
      const ruler = document.createElement("div");
      ruler.style.cssText = "position:absolute;left:-99999px;top:0;white-space:nowrap;visibility:hidden;font-weight:700;letter-spacing:0.005em;line-height:0.78";
      world.appendChild(ruler);
      let box = null;
      WORDS.forEach((wd, i) => {
        const fs = i === 0 ? BASE : (box.y1 - box.y0) * RATIO;
        ruler.style.fontSize = fs + "px"; ruler.textContent = wd.text;
        const w = ruler.offsetWidth, h = fs * 0.78, gap = fs * 0.07;
        let x, y;
        if (i === 0) { x = 0; y = 0; }
        else if ((box.x1 - box.x0) / (box.y1 - box.y0) < FW / FH) { x = box.x1 + gap; y = box.y1 - h; }   // narrower than the frame: grow sideways
        else { x = box.x0; y = box.y1 + gap + fs * p.markRoom; }   // wide enough: a new line under everything (+ room for Vietnamese marks above capitals; source 0)
        Object.assign(wd, { fs, x, y });
        box = box ? { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x + w), y1: Math.max(box.y1, y + h) } : { x0: x, y0: y, x1: x + w, y1: y + h };
      });
      ruler.remove();
      const els2 = WORDS.map((wd, i) => ctx.make(world, "div", "w" + i, { cls: "capcf-w", text: wd.text,
        style: { left: wd.x.toFixed(2) + "px", top: wd.y.toFixed(2) + "px", fontSize: wd.fs.toFixed(2) + "px", color: wd.accent ? accent : "#ffffff" } }));
      // framing boxes from what the browser actually laid out (source: the camera is fitted to real ink)
      let run = null;
      els2.forEach((el, i) => { const r = { x0: el.offsetLeft, y0: el.offsetTop, x1: el.offsetLeft + el.offsetWidth, y1: el.offsetTop + el.offsetHeight };
        run = run ? { x0: Math.min(run.x0, r.x0), y0: Math.min(run.y0, r.y0), x1: Math.max(run.x1, r.x1), y1: Math.max(run.y1, r.y1) } : r; WORDS[i].box = { ...run }; });
      const FULL = run;
      const pose = (b, m) => { const bw = (b.x1 - b.x0) * m, bh = (b.y1 - b.y0) * m, s = Math.min(FW / bw, FH / bh);
        return { x: +(FW / 2 - s * (b.x0 + b.x1) / 2).toFixed(2), y: +(FH / 2 - s * (b.y0 + b.y1) / 2).toFixed(2), scale: +s.toFixed(4) }; };   // 4 decimals: the builder writes tween values with 4
      const T = p.at, BLUR = FW * 0.026 * SMEAR, HALF = Math.sqrt(FW * FW + FH * FH) / 2;
      let prev = pose(WORDS[0].box, MARGIN);
      world.style.transform = `translate(${prev.x}px, ${prev.y}px) scale(${prev.scale})`;   // the rest pose, pinned outside the timeline (source)
      els2[0].style.opacity = "1";                                        // frame zero is never empty: the first word is already written
      const smear = (c, scale, count, at, up, down, peak) => {
        if (!SMEAR) return;
        for (let j = 0; j < count; j++) { const el = els2[j], cx = el.offsetLeft + el.offsetWidth / 2, cy = el.offsetTop + el.offsetHeight / 2;
          const d = scale * Math.hypot(cx - c.x, cy - c.y) / HALF; tl.set(el, { "--k": +(0.2 + 1.15 * Math.min(1, d)).toFixed(3) }, at); }
        tl.fromTo(world, { "--amt": "0px" }, { "--amt": +(peak / scale).toFixed(3) + "px", duration: +up.toFixed(4), ease: E.up }, at);
        tl.to(world, { "--amt": "0px", duration: +down.toFixed(4), ease: E.down }, at + up);
      };
      WORDS.forEach((wd, i) => {
        if (i === 0) return;
        const t = T + wd.t, ps = pose(wd.box, MARGIN);
        tl.fromTo(els2[i], { opacity: 0 }, { opacity: 1, duration: 0.16, ease: E.ink }, t);
        tl.fromTo(world, { x: prev.x, y: prev.y, scale: prev.scale }, { x: ps.x, y: ps.y, scale: ps.scale, duration: 0.4, ease: E.step }, t);
        smear({ x: (wd.box.x0 + wd.box.x1) / 2, y: (wd.box.y0 + wd.box.y1) / 2 }, ps.scale, i + 1, t, 0.4 * 0.24, 0.4 * 0.44, BLUR);
        prev = ps;
      });
      const wide = pose(FULL, 1.2 * FRAMING), wideAt = T + WORDS[WORDS.length - 1].t + 0.62;
      tl.fromTo(world, { x: prev.x, y: prev.y, scale: prev.scale }, { x: wide.x, y: wide.y, scale: wide.scale, duration: 0.94, ease: E.wide }, wideAt);
      smear({ x: (FULL.x0 + FULL.x1) / 2, y: (FULL.y0 + FULL.y1) / 2 }, wide.scale, els2.length, wideAt, 0.3, 0.58, BLUR * 0.8);
    }
  },
});
