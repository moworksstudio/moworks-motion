/* code/terminal-simulator: a dark terminal window with a file list and a code editor: the five editor lines draw in from the left one after another, then the command line fades in under them.
   Port of HyperFrames registry component terminal-simulator (layout, colours, sizes and timing as in the source demo; mono text = the kit's Roboto Mono ("RMono", Vietnamese complete), then the system monospace stack).
   BLOCK: the target is an empty box (usually the whole frame); the 760 px window is built in its middle and shown `scale` times larger, as the source demo does (a wrapper with transform: scale,
   never tweened). Source timing kept (startAt = 0.5 s): lines scaleX 0 -> 1 and opacity 0 -> 1, 0.24 s power2.out, stagger 0.08; command line y 16 -> 0 + opacity, 0.34 s power2.out at startAt + 0.48. */
AIMK.preset("code/terminal-simulator", {
  params: { title: "Mô phỏng terminal", files: ["index.html", "style.css", "timeline.js"], lines: [92, 72, 84, 58, 78], command: "$ hyperframes render --skill=terminal-simulator", startAt: 0.5, scale: 1.65,
    bg: "#0f172a", chrome: "#111827", fg: "#e4e4e7", muted: "#94a3b8", prompt: "#86efac" },
  build(tl, els, p, ctx) {
    ctx.css("code/terminal-simulator", `
.tsm-root { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.tsm { width: 760px; border-radius: 24px; overflow: hidden; box-shadow: 0 28px 80px rgba(15,23,42,.2); font-family: "RMono", Consolas, "Cascadia Mono", Menlo, "SF Mono", "DejaVu Sans Mono", monospace; }
.tsm-chrome { height: 48px; display: flex; align-items: center; padding: 0 18px; font-size: 14px; }
.tsm-dots { position: relative; width: 47px; height: 11px; flex: none; margin-right: 8px; }
.tsm-dot { position: absolute; top: 0; width: 11px; height: 11px; border-radius: 999px; }
.tsm-body { display: grid; grid-template-columns: 210px 1fr; min-height: 340px; }
.tsm-files { padding: 22px; font-size: 15px; line-height: 1.8; }
.tsm-editor { padding: 22px; display: grid; gap: 14px; align-content: start; }
.tsm-line { display: block; height: 18px; border-radius: 999px; transform-origin: 0% 50%; }
.tsm-term { padding: 18px 22px 24px; min-height: 78px; font-size: 15px; }`);
    const t = p.at + p.startAt, edge = "1px solid rgba(148,163,184,.18)";
    for (const slot of els) {
      const root = ctx.make(slot, "div", "root", { cls: "tsm-root" });
      const wrap = ctx.make(root, "div", "frame", { style: { transform: `scale(${p.scale})` } });
      const win = ctx.make(wrap, "div", "win", { cls: "tsm", style: { background: p.bg, color: p.fg } });
      const chrome = ctx.make(win, "div", "chrome", { cls: "tsm-chrome", style: { background: p.chrome, color: p.muted } });
      const dots = ctx.make(chrome, "div", "dots", { cls: "tsm-dots" });
      ["#ef4444", "#f59e0b", "#22c55e"].forEach((c, i) => ctx.make(dots, "span", "d" + (i + 1), { cls: "tsm-dot", style: { left: i * 18 + "px", background: c } }));
      ctx.make(chrome, "span", "title", { text: p.title });
      const body = ctx.make(win, "div", "body", { cls: "tsm-body" });
      const files = ctx.make(body, "div", "files", { cls: "tsm-files", style: { borderRight: edge, color: p.muted } });
      p.files.forEach((f, i) => ctx.make(files, "div", "f" + (i + 1), { text: f }));
      const editor = ctx.make(body, "div", "editor", { cls: "tsm-editor" });
      const lines = p.lines.map((w, i) => ctx.make(editor, "span", "l" + (i + 1), { cls: "tsm-line", style: { width: w + "%", background: "rgba(228,228,231,.18)" } }));
      const term = ctx.make(win, "div", "term", { cls: "tsm-term", style: { borderTop: edge, color: p.prompt }, text: p.command });
      tl.fromTo(lines, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.24, stagger: 0.08, ease: "power2.out" }, t);
      tl.fromTo(term, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" }, t + 0.48);
    }
  },
});
