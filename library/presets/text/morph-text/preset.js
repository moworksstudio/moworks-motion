/* text/morph-text: one phrase melts into the next: both layers blur in opposite directions through an alpha threshold, so the letters look like
   liquid that pulls apart and re-forms (gooey morph); each morph takes `speed` s and the result holds `pause` s before the next one. Port of
   HyperFrames registry component morph-text (threshold matrix alpha x 255 - 100, blur 8 / f - 8 px for the incoming and 8 / (1 - f) - 8 px for the
   outgoing phrase, capped at 100 px, opacity f / 1 - f; morph 1 s, hold 1.5 s). EFFECT on a text element: its own text is the first phrase,
   `phrases` the next ones ("|" between them, or a list); the morphs start at `at` and stop on the last phrase (the source looped for its whole
   duration). The source's 120 pt Figtree is the element's own font and size; the blur scales with the size (source px at 160 px type).
   The per-frame text and filters go through ctx.code (a proxy tween whose onUpdate is a pure function of its time). AE: png. */
AIMK.preset("text/morph-text", {
  params: { phrases: "Làm được nhiều hơn.|Nhanh. Gọn. Mạnh.|Bắt đầu hôm nay.", speed: 1, pause: 1.5 },
  build(tl, els, p, ctx) {
    const list = (Array.isArray(p.phrases) ? p.phrases : String(p.phrases).split("|")).map(s => String(s).trim().normalize("NFC")).filter(Boolean);
    for (const el of els) {
      const W = [el.textContent.normalize("NFC").trim()].concat(list); if (W.length < 2) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize) || 160, k = +(fs / 160).toFixed(4), id = ctx.id(el, "t");
      el.textContent = "";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.id = id + "_svg";
      svg.setAttribute("aria-hidden", "true"); Object.assign(svg.style, { position: "absolute", width: "0px", height: "0px", overflow: "hidden" });
      svg.innerHTML = `<defs><filter id="${id}_thr"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -100"/></filter></defs>`;
      el.appendChild(svg);
      const disp = ctx.make(el, "span", "disp", { style: { display: "inline-grid", justifyItems: "center" } });
      ctx.make(disp, "span", "a", { text: W[0], style: { gridArea: "1 / 1", whiteSpace: "nowrap", opacity: "1" } });
      ctx.make(disp, "span", "b", { text: W[1], style: { gridArea: "1 / 1", whiteSpace: "nowrap", opacity: "0" } });
      const step = p.speed + p.pause, total = +((W.length - 2) * step + p.speed).toFixed(4), v = "mt_" + id.replace(/\W/g, "_");
      ctx.code(`  // morph-text #${id}: phrase i melts into phrase i + 1 (threshold filter + opposite blurs), a pure function of the proxy time
  const ${v} = { t: 0 }, ${v}_w = ${JSON.stringify(W)};
  const ${v}_f = (t) => {
    const A = document.getElementById("${id}_disp_a"), B = document.getElementById("${id}_disp_b"), D = document.getElementById("${id}_disp");
    const i = Math.max(0, Math.min(Math.floor(t / ${step}), ${v}_w.length - 2)), f = Math.max(0, Math.min((t - i * ${step}) / ${p.speed}, 1));
    A.textContent = ${v}_w[i]; B.textContent = ${v}_w[i + 1];
    if (f <= 0 || f >= 1) { D.style.filter = "none"; A.style.filter = ""; B.style.filter = ""; A.style.opacity = f >= 1 ? "0" : "1"; B.style.opacity = f >= 1 ? "1" : "0"; return; }
    D.style.filter = "url(#${id}_thr)";
    B.style.filter = "blur(" + (Math.max(0, Math.min(8 / f - 8, 100)) * ${k}).toFixed(3) + "px)"; B.style.opacity = f.toFixed(4);
    A.style.filter = "blur(" + (Math.max(0, Math.min(8 / (1 - f) - 8, 100)) * ${k}).toFixed(3) + "px)"; A.style.opacity = (1 - f).toFixed(4);
  };
  tl.fromTo(${v}, { t: 0 }, { t: ${total}, duration: ${total}, ease: "none", onUpdate: () => ${v}_f(${v}.t) }, ${p.at});`);
    }
  },
});
