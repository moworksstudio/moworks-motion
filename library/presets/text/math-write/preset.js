/* text/math-write: a typeset equation writes itself on (a soft left-to-right reveal, like Manim's Write) or term by term, and can then morph into
   a second equation: glyphs that exist in both glide to their new places while the rest fade out / in (like Manim's TransformMatchingTex).
   After iart-ai manim-skills, manim / math-and-text (MIT). The TeX is typeset by the kit's KaTeX while the film builds (engine/vendor/libs/katex,
   its CSS and fonts copied into the film), so the film carries plain HTML. EFFECT on a text element whose text is the TeX source (e.g.
   "e^{i\pi} + 1 = 0"); colour parts with \textcolor{#ffd60a}{...}. write 1.2 s power1.inOut; terms 0.4 s power2.out, 0.08 s apart; morph 1.0 s
   power2.inOut starting `morphAt` s after `at` (the matching is by glyph, in reading order). */
AIMK.preset("text/math-write", {
  params: { mode: "write", duration: 1.2, stagger: 0.08, to: "", morphAt: 2.0, morph: 1.0 },
  build(tl, els, p, ctx) {
    if (!ctx.styles["katex"]) {                     // KaTeX's CSS, with its font paths pointed at the film's copy (the fonts are preset fonts: loaded already)
      const x = new XMLHttpRequest(); x.open("GET", "assets/vendor/libs/katex/katex.min.css", false); x.send();
      ctx.css("katex", x.status === 200 ? x.responseText.replace(/url\(fonts\//g, "url(assets/vendor/libs/katex/fonts/") : "");
    }
    const render = tex => window.katex ? katex.renderToString(String(tex), { displayMode: true, throwOnError: false, output: "html" }) : String(tex);
    const leaves = root => [...root.querySelectorAll(".katex-html *")].filter(e => e.childNodes.length && [...e.childNodes].every(n => n.nodeType === 3) && e.textContent.trim());
    const f = v => +v.toFixed(3);
    for (const el of els) {
      const id = ctx.id(el, "t"), tex = el.textContent.trim();
      el.textContent = "";
      const box = ctx.make(el, "span", "mx", { style: { display: "inline-grid" } });
      const A = ctx.make(box, "span", "a", { html: render(tex), style: { gridArea: "1 / 1" } });
      const GA = leaves(A); GA.forEach((g, i) => { g.style.display = "inline-block"; g.id = `${id}_a${i}`; });
      if (p.mode === "terms") GA.forEach((g, i) => tl.fromTo(g, { opacity: 0, y: "0.25em" }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, f(p.at + i * p.stagger)));
      else tl.fromTo(A, { clipPath: "inset(-20% 100% -20% 0%)", filter: "blur(6px)" }, { clipPath: "inset(-20% 0% -20% 0%)", filter: "blur(0px)", duration: p.duration, ease: "power1.inOut" }, p.at);
      if (!p.to) continue;
      const B = ctx.make(box, "span", "b", { html: render(p.to), style: { gridArea: "1 / 1" } });
      const GB = leaves(B); GB.forEach((g, i) => { g.style.display = "inline-block"; g.style.opacity = "0"; g.id = `${id}_b${i}`; });   // hidden until the morph
      const ra = GA.map(g => g.getBoundingClientRect()), rb = GB.map(g => g.getBoundingClientRect()), k = (document.getElementById("stage").getBoundingClientRect().width / ctx.W) || 1;
      const used = new Set(), t0 = f(p.at + p.morphAt);
      GB.forEach((gb, j) => {
        const key = (G, n) => G[n] ? G[n].textContent + "|" + getComputedStyle(G[n]).color : "";   // same glyph, same colour; prefer the same neighbours
        let i = -1, best = -1;
        GA.forEach((ga, ii) => { if (used.has(ii) || key(GA, ii) !== key(GB, j)) return;
          const sc = (key(GA, ii - 1) === key(GB, j - 1) ? 1 : 0) + (key(GA, ii + 1) === key(GB, j + 1) ? 1 : 0); if (sc > best) { best = sc; i = ii; } });
        if (i >= 0) {
          used.add(i);
          const dx = (ra[i].left - rb[j].left) / k, dy = (ra[i].top - rb[j].top) / k, s = rb[j].height ? ra[i].height / rb[j].height : 1;
          tl.set(gb, { opacity: 1 }, t0); tl.set(GA[i], { opacity: 0 }, t0);
          tl.fromTo(gb, { x: f(dx), y: f(dy), scale: f(s) }, { x: 0, y: 0, scale: 1, duration: p.morph, ease: "power2.inOut" }, t0);
        } else tl.fromTo(gb, { opacity: 0 }, { opacity: 1, duration: f(p.morph * 0.6), ease: "power2.out" }, f(t0 + p.morph * 0.4));
      });
      GA.forEach((ga, i) => { if (!used.has(i)) tl.fromTo(ga, { opacity: 1 }, { opacity: 0, duration: f(p.morph * 0.4), ease: "power2.in" }, t0); });
    }
  },
});
