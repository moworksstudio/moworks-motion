/* data/count-up: a number counts up (grouping: false = no thousands separator, a spec sheet writes "4800 mAh"; test 07/10/2026). Written into the film as a small code block (a text that changes every frame cannot be a plain tween). */
AIMK.preset("data/count-up", { params: { duration: 1.2, ease: "power2.out", from: 0, to: 100, locale: "en-US", decimals: 0, grouping: true },
  build(tl, els, p, ctx) { for (const el of els) {
    const v = "c_" + el.id.replace(/\W/g, "_");
    el.textContent = (p.from).toLocaleString(p.locale, { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals, useGrouping: p.grouping });
    ctx.code(`  const ${v} = { v: ${p.from} };  // count-up #${el.id}\n  tl.fromTo(${v}, { v: ${p.from} }, { v: ${p.to}, duration: ${p.duration}, ease: "${p.ease}", onUpdate: () => { document.getElementById("${el.id}").textContent = ${v}.v.toLocaleString("${p.locale}", { minimumFractionDigits: ${p.decimals}, maximumFractionDigits: ${p.decimals}, useGrouping: ${!!p.grouping} }); } }, ${p.at});`);
  } } });
