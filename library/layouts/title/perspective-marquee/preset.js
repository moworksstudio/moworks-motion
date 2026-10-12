/* title/perspective-marquee: a strip of pill labels rolls sideways on a plane tilted back toward the horizon (360 px in 4.5 s, linear). Port of
   HyperFrames registry component perspective-marquee. BLOCK: built inside the target box; the source's 720 px wide strip is scaled to the box width
   (pills 28 px type, 12 x 18 px padding, 22 px gap, the roll distance: all x box width / 720). As in the source: the plane is rotateX(tilt) (flat 6
   / standard 18 / steep 34 deg) with perspective 900 px, the labels are laid down twice so the strip reads as a loop, travel short 0.55 / standard
   1 / long 1.8 x 360 px; tone ink (#18181b pills, white type) | paper (#fafafa, dark type) | accent (#34d399, white type), pill shadow
   0 18px 44px rgba(24,24,27,0.18), Inter 900 -0.04em (the film's font here). */
AIMK.preset("title/perspective-marquee", {
  params: { words: "THÀNH PHẦN, HIỆU ỨNG, CHUYỂN CẢNH, TÁC TỬ", tilt: "standard", travel: "standard", tone: "ink", duration: 4.5 },
  build(tl, els, p, ctx) {
    const tilt = { flat: 6, standard: 18, steep: 34 }[p.tilt] || 18, reach = { short: 0.55, standard: 1, long: 1.8 }[p.travel] || 1;
    const tone = { ink: ["#18181b", "#ffffff"], paper: ["#fafafa", "#18181b"], accent: ["#34d399", "#ffffff"] }[p.tone] || ["#18181b", "#ffffff"];
    const W = (Array.isArray(p.words) ? p.words : String(p.words).split(",")).map(s => String(s).trim().normalize("NFC")).filter(Boolean);
    for (const slot of els) {
      const bw = slot.offsetWidth || 720, k = bw / 720, f = v => +v.toFixed(3);
      const root = ctx.make(slot, "div", "root", { style: { position: "absolute", left: "0px", right: "0px", top: "50%", transform: `translateY(-50%) rotateX(${tilt}deg)`, perspective: "900px", overflow: "hidden",
        color: "#18181b", fontWeight: "900", letterSpacing: "-0.04em", padding: `${f(20 * k)}px 0px ${f(60 * k)}px` } });
      const strip = ctx.make(root, "div", "strip", { style: { display: "inline-flex", gap: f(22 * k) + "px", whiteSpace: "nowrap" } });
      [0, 1].forEach(pass => W.forEach((w, i) => ctx.make(strip, "span", `p${pass}_${i}`, { text: w, style: { padding: `${f(12 * k)}px ${f(18 * k)}px`, borderRadius: "999px", background: tone[0], color: tone[1],
        fontSize: f(28 * k) + "px", boxShadow: `0 ${f(18 * k)}px ${f(44 * k)}px rgba(24, 24, 27, 0.18)` } })));
      tl.fromTo(strip, { x: 0 }, { x: f(-360 * reach * k), duration: p.duration, ease: "none" }, p.at);
    }
  },
});
