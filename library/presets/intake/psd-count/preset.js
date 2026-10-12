/* intake/psd-count: a PSD text unit (built by intake/psd-frame) counts up to its designed number. Every text layer of the unit (shadow,
   stroke, face, an intake/psd-shine copy) gets the same string, so its Photoshop effects stay; the string is re-centred on the design's
   own width while it is shorter (the PSD text is placed by its left edge), and the last value is the design's own text (real numbers at
   rest). The width is measured on the FINAL string once the film's fonts are in (the build bakes the DOM after this code ran once, so the
   text found in the page may be a counted value). Unlike data/count-up (a plain text element) it keeps a designed PSD text with its layers.
   Written for a studio film (08/10/2026: counts from 0, decimals, suffix).
   params: id (the unit's outer id, <frame>_u<NN>), from, to, dur, dec (decimals), pre, suf, comma (thousands separator), ease */
AIMK.preset("intake/psd-count", { params: { id: "", from: 0, to: 100, dur: 0.8, dec: 0, pre: "", suf: "", comma: false, ease: "power2.out" },
  build(tl, els, p, ctx) {
    const id = p.id || els[0].id;
    const v = "ipc_" + id.replace(/\W/g, "_") + "_" + Math.round(p.at * 1000);
    const D = p.dec, fmt = x => (p.comma ? x.toLocaleString("en-US", { minimumFractionDigits: D, maximumFractionDigits: D }) : x.toFixed(D));
    const FINAL = p.pre + fmt(p.to) + p.suf;
    ctx.code(`  // intake/psd-count on #${id}: ${p.pre}${p.from}${p.suf} -> ${FINAL}
  const ${v} = { t: 0, W: null };
  tl.fromTo(${v}, { t: 0 }, { t: 1, duration: ${p.dur}, ease: ${JSON.stringify(p.ease)}, onUpdate: () => {
    const ds = Array.from(document.querySelectorAll(${JSON.stringify("#" + id + "_rot_in > div")}));
    if (!ds.length) return;
    const face = ds.find(d => /_face$/.test(d.id)) || ds[ds.length - 1];
    if (${v}.W === null && document.fonts.status === "loaded") { face.textContent = ${JSON.stringify(FINAL)}; ${v}.W = face.offsetWidth; }
    const val = ${p.from} + (${p.to} - ${p.from}) * ${v}.t, D = ${p.dec};
    const num = ${p.comma} ? val.toLocaleString("en-US", { minimumFractionDigits: D, maximumFractionDigits: D }) : val.toFixed(D);
    const s = ${JSON.stringify(p.pre)} + num + ${JSON.stringify(p.suf)};
    ds.forEach(d => { if (d.textContent !== s) d.textContent = s; });
    const off = ${v}.W === null ? "0px" : ((${v}.W - face.offsetWidth) / 2).toFixed(1) + "px";
    ds.forEach(d => { d.style.marginLeft = off; });
  } }, ${p.at});`);
  } });
