/* lower/bild-style: a tabloid-news lower third, held still: a big white uppercase line with a hard red offset shadow over a red sub line with a
   hard white offset shadow (BILD newspaper style). Port of HyperFrames registry block lower-third-bild: layout, colours and its own Barlow
   Condensed fonts (shipped in assets/fonts, OFL; Vietnamese complete) as in the source. The source has no entrance: both lines show from its
   start and hide at its end. BLOCK: built inside the target box (1920 x 1080 positions). params.hideAt: seconds after `at` when both lines
   disappear (source: the clip's end, 8 s), null = they stay. */
AIMK.preset("lower/bild-style", {
  params: { main: "Tin độc quyền", sub: "Phóng sự đặc biệt", red: "#dd0000", left: 80, mainBottom: 215, subBottom: 135, hideAt: null },
  build(tl, els, p, ctx) {
    ctx.css("lower/bild-style", `
@font-face { font-family: "AIMK Barlow Condensed"; font-weight: 700; font-display: block; src: url("${ctx.asset("fonts/BarlowCondensed-Bold.woff2")}") format("woff2"); }
@font-face { font-family: "AIMK Barlow Condensed"; font-weight: 800; font-display: block; src: url("${ctx.asset("fonts/BarlowCondensed-ExtraBold.woff2")}") format("woff2"); }
.ltbd-mo { position: absolute; padding-right: 14px; padding-bottom: 14px; }
.ltbd-main { font-family: "AIMK Barlow Condensed", sans-serif; font-size: 88px; font-weight: 800; line-height: 1.05; color: #212529; background: #ffffff;
  padding: 10px 22px 8px; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.02em; }
.ltbd-so { position: absolute; padding-right: 10px; padding-bottom: 10px; }
.ltbd-sub { font-family: "AIMK Barlow Condensed", sans-serif; font-size: 48px; font-weight: 700; line-height: 1.1; color: #ffffff; padding: 6px 18px 5px;
  white-space: nowrap; text-transform: uppercase; letter-spacing: 0.04em; box-shadow: 8px 8px 0 0 #ffffff; }`);
    for (const slot of els) {
      const mo = ctx.make(slot, "div", "mainouter", { cls: "ltbd-mo", style: { left: p.left + "px", bottom: p.mainBottom + "px" } });
      ctx.make(mo, "div", "main", { cls: "ltbd-main", text: p.main, style: { boxShadow: `12px 12px 0 0 ${p.red}` } });
      const so = ctx.make(slot, "div", "subouter", { cls: "ltbd-so", style: { left: p.left + "px", bottom: p.subBottom + "px" } });
      ctx.make(so, "div", "sub", { cls: "ltbd-sub", text: p.sub || " ", style: { background: p.red } });
      tl.set([mo, so], { opacity: 1 }, p.at);
      if (p.hideAt != null) tl.set([mo, so], { opacity: 0 }, p.at + p.hideAt);
    }
  },
});
