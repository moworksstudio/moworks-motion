/* lower/bold-block: a solid dark block wipes in from the left, the name slams up inside it, a yellow tag pops up below it.
   Port of HyperFrames registry block lt-bold-block (layout, colours and timing as in the source; name in the film's font at weight 900 instead of
   Archivo Black, tag in the kit's Roboto Mono instead of Space Mono: no network in films). BLOCK: the target is an empty box (usually the whole
   frame); the lower third is built inside it. Exit (source: 4.3 s): the block wipes out, params.exitAt seconds after `at`, null = no exit. */
AIMK.preset("lower/bold-block", {
  params: { name: "Nguyễn Minh Anh", tag: "Giám đốc sáng tạo · Moworks", block: "#141518", tagBg: "#ffd23f", left: 120, bottom: 116, exitAt: 4.3 },
  build(tl, els, p, ctx) {
    ctx.css("lower/bold-block", `
.ltbb { position: absolute; }
.ltbb-block { padding: 18px 34px 22px 30px; display: inline-flex; flex-direction: column; gap: 12px; }
.ltbb-name { font-size: 58px; font-weight: 900; color: #ffffff; line-height: 0.98; letter-spacing: -0.015em; text-transform: uppercase; white-space: nowrap; }
.ltbb-tagwrap { overflow: hidden; }
.ltbb-tag { display: inline-block; color: #141518; font-family: "RMono", "Space Mono", monospace; font-size: 24px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 7px 16px; white-space: nowrap; }`);
    for (const slot of els) {
      const lt = ctx.make(slot, "div", "lt", { cls: "ltbb", style: { left: p.left + "px", bottom: p.bottom + "px" } });
      const block = ctx.make(lt, "div", "block", { cls: "ltbb-block", style: { background: p.block } });
      const name = ctx.make(block, "div", "name", { cls: "ltbb-name", text: p.name });
      const wrap = ctx.make(block, "div", "tagwrap", { cls: "ltbb-tagwrap" });
      const tag = ctx.make(wrap, "span", "tag", { cls: "ltbb-tag", text: p.tag, style: { background: p.tagBg } });
      const t = p.at;
      tl.fromTo(block, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power4.out" }, t + 0.1);
      tl.fromTo(name, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "back.out(1.6)" }, t + 0.26);
      tl.fromTo(tag, { y: 40 }, { y: 0, duration: 0.45, ease: "back.out(2)" }, t + 0.5);
      if (p.exitAt != null) tl.to(block, { clipPath: "inset(0 0 0 100%)", duration: 0.4, ease: "power3.in" }, t + p.exitAt);
    }
  },
});
