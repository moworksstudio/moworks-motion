/* code/code-snippet-dark-modern: a code-editor workbench (title bar, activity bar, explorer, tabs, editor, terminal panel, status bar) in the Dark Modern colours types a code file character by character
   behind a blinking caret, then the terminal panel slides up with its output and the whole workbench tilts once (rotateY -10.5, z 74) and settles back.
   Port of HyperFrames registry block code-snippet-dark-modern (1920 x 1080, 11 s). BLOCK: built inside the target (an empty box, usually the whole frame); the layout is the source's fixed 1920 x 1080 one
   (padding 54 70 92, workbench 824 px high). The source's background picture (background.jpeg) is kept and shipped in this preset's assets/.
   Source timing kept: header 0.45 s power3.out at 0; workbench y 42 + scale 0.986 + opacity 0.58 s power3.out at 0.1; line highlight fades in 0.22 s at 0.74; typing starts at 0.95 s at 0.012 s per
   character, a line takes max(chars x 0.012, 0.08) + 0.045 s; caret blink 0.34 s steps(1) x 26; terminal panel y 140 + opacity 0.56 s power3.out at 7.55; its three lines 0.24 s stagger 0.16 at 8.05;
   tilt to rotateY -10.5 / z 74 for 0.72 s power2.inOut at 9.35, back for 0.62 s at 10.08.
   Typing: every line is one element revealed with a clip-path inset and the ease steps(chars) (one step per character, same times as the source's per-character opacity), the caret moves with the
   same steps(chars) ease. Code lines are strings with the colour markup <c> comment, <k> keyword, <f> function, <s> string, <n> number, <v> variable, <a> parameter, <o> operator, <p> punctuation,
   <t> class name (write &lt; for a literal <). */
AIMK.preset("code/code-snippet-dark-modern", {
  params: {
    kicker: "Giao diện tích hợp sẵn của VS Code", title: "Tối hiện đại", note: "Gõ từng ký tự trong tệp functional_toolkit.py, màu lấy từ dark_modern.json.",
    windowTitle: "functional-toolkit - Visual Studio Code", search: "Tìm kiếm", sidebarTitle: "Trình khám phá", section: "⌄ Functional Toolkit",
    tree: ["⌄ src", "  ◇ functional_toolkit.py", "  ◇ test_toolkit.py", "◇ pyproject.toml", "◇ README.md"], treeSelected: 1,
    tabs: ["◇ functional_toolkit.py", "README.md"], breadcrumbs: "functional-toolkit › src › functional_toolkit.py",
    code: [
      "<c># Bộ công cụ hàm nhỏ</c>",
      "<k>def</k> <f>pluck_deep</f><p>(</p><a>key</a><p>):</p>",
      "    <k>return</k> <k>lambda</k> <a>obj</a><p>: </p><f>reduce</f><p>(</p><k>lambda</k> <a>acc</a><p>, </p><a>k</a><p>: </p><v>acc</v><p>[</p><v>k</v><p>]</p><p>, </p><v>key</v><f>.split</f><p>(</p><s>'.'</s><p>), </p><v>obj</v><p>)</p>",
      "",
      "<k>def</k> <f>compose</f><p>(</p><o>*</o><a>fns</a><p>):</p>",
      "    <k>return</k> <k>lambda</k> <a>res</a><p>: </p><f>reduce</f><p>(</p><k>lambda</k> <a>acc</a><p>, </p><a>fn</a><p>: </p><f>fn</f><p>(</p><v>acc</v><p>), </p><v>fns</v><p>, </p><v>res</v><p>)</p>",
      "",
      "<k>def</k> <f>unfold</f><p>(</p><a>f</a><p>, </p><a>seed</a><p>):</p>",
      "    <s>\"\"\"Tạo danh sách bằng cách áp dụng f liên tục lên hạt giống.\"\"\"</s>",
      "<v>    acc</v><o> = </o><p>[]</p>",
      "<k>    while</k> <t>True</t><p>:</p>",
      "<v>        result</v><o> = </o><f>f</f><p>(</p><v>seed</v><p>)</p>",
      "<k>        if</k> <v>result</v><k> is </k><t>None</t><p>:</p>",
      "<k>            return</k> <v>acc</v>",
      "<v>        acc</v><f>.append</f><p>(</p><v>result</v><p>[</p><n>0</n><p>])</p>",
      "<v>        seed</v><o> = </o><v>result</v><p>[</p><n>1</n><p>]</p>",
      ""],
    panelTabs: ["Terminal", "Vấn đề", "Đầu ra"],
    terminal: ["<p>functional-toolkit %</p> python -m pytest", "đã thu thập 3 mục", "tests/test_toolkit.py ... <c>đạt</c>"],
    statusLeft: ["main", "0 lỗi", "0 cảnh báo"], statusRight: ["Dòng 17, Cột 1", "Dấu cách: 4", "UTF-8", "Python 3.12"],
    background: "", ui: {}, tokens: {} },
  build(tl, els, p, ctx) {
    const plan = [], ft = (tg, a, b, at) => plan.push({ tg, a, b, at });   // fromTo calls are collected and made in time order; a later fromTo on a property an earlier one already animates gets immediateRender: false (as the builder writes it), so the draft equals the film
    const flush = () => { const seen = new Map(), skip = ["duration", "ease", "stagger", "repeat", "yoyo", "immediateRender", "delay"];
      plan.map((q, i) => [q, i]).sort((x, y) => x[0].at - y[0].at || x[1] - y[1]).forEach(([q]) => {
        const arr = Array.isArray(q.tg) ? q.tg : [q.tg], props = Object.keys(q.a).concat(Object.keys(q.b)).filter(k => !skip.includes(k));
        const rep = arr.some(e => { const s = seen.get(e.id); return s && props.some(k => s.has(k)); });
        arr.forEach(e => { const s = seen.get(e.id) || new Set(); props.forEach(k => s.add(k)); seen.set(e.id, s); });
        tl.fromTo(q.tg, q.a, rep ? Object.assign({ immediateRender: false }, q.b) : q.b, q.at); });
      plan.length = 0; };
    const UI = Object.assign({ activityBg: "#181818", activityFg: "#d7d7d7", activityMuted: "#868686", activityActive: "#0078d4", sidebarBg: "#181818", sidebarFg: "#cccccc", sidebarBorder: "#2b2b2b",
      tabBg: "#181818", tabActiveBg: "#1f1f1f", tabActiveFg: "#ffffff", tabInactiveFg: "#9d9d9d", tabBorder: "#2b2b2b", editorBg: "#1f1f1f", editorFg: "#cccccc", editorLine: "rgba(255,255,255,0.04)",
      gutterFg: "#6e7681", gutterActiveFg: "#cccccc", panelBg: "#181818", panelBorder: "#2b2b2b", statusBg: "#181818", statusFg: "#cccccc", statusBorder: "#2b2b2b", titleBg: "#181818", titleFg: "#cccccc",
      remoteBg: "#0078d4", remoteFg: "#ffffff" }, p.ui);
    const TK = Object.assign({ c: "#6a9955", k: "#d7ba7d", f: "#dcdcaa", s: "#d16969", n: "#b5cea8", v: "#4fc1ff", a: "#9cdcfe", o: "#d7ba7d", p: "#ce9178", t: "#4ec9b0" }, p.tokens);
    ctx.css("code/code-snippet-dark-modern", `
.csd-root { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.csd-content { position: relative; z-index: 1; width: 100%; height: 100%; padding: 54px 70px 92px; display: flex; flex-direction: column; gap: 16px; perspective: 2200px; perspective-origin: 56% 52%; }
.csd-header { display: flex; align-items: flex-end; justify-content: space-between; min-height: 66px; text-shadow: 0 2px 12px rgba(0,0,0,.42), 0 14px 34px rgba(0,0,0,.32); }
.csd-kicker { margin: 0 0 7px; font-size: 15px; font-weight: 650; text-shadow: 0 2px 8px rgba(0,0,0,.48), 0 10px 26px rgba(0,0,0,.36); }
.csd-title { font-size: 44px; line-height: 1; font-weight: 760; }
.csd-note { width: 510px; font-size: 16px; line-height: 1.35; text-align: right; text-shadow: 0 2px 10px rgba(0,0,0,.46), 0 12px 30px rgba(0,0,0,.34); }
.csd-wb { height: 824px; display: grid; grid-template-columns: 54px 290px 1fr; grid-template-rows: 36px 1fr 26px; overflow: hidden; border: 1px solid var(--c-sbd); border-radius: 8px; background: var(--c-ebg);
  box-shadow: 0 34px 90px rgba(0,0,0,.42); transform: translateZ(0); transform-origin: 82% 50%; transform-style: preserve-3d; will-change: transform; }
.csd-title-bar { grid-column: 1 / -1; display: grid; grid-template-columns: 120px 1fr 210px; align-items: center; background: var(--c-tbg); color: var(--c-tfg); border-bottom: 1px solid var(--c-tabbd); font-size: 12px; }
.csd-traffic { display: flex; gap: 8px; padding-left: 18px; }
.csd-traffic span { width: 12px; height: 12px; border-radius: 999px; }
.csd-wtitle { justify-self: center; opacity: .84; }
.csd-cmd { justify-self: end; width: 176px; height: 22px; margin-right: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, var(--c-tfg), transparent 78%); border-radius: 5px; color: color-mix(in srgb, var(--c-tfg), transparent 18%); }
.csd-act { grid-row: 2 / 3; background: var(--c-abg); border-right: 1px solid var(--c-sbd); display: flex; flex-direction: column; align-items: center; padding: 10px 0; gap: 18px; }
.csd-ico { display: block; width: 28px; height: 28px; color: var(--c-amuted); }
.csd-ico.on { color: var(--c-afg); border-left: 2px solid var(--c-aact); padding-left: 4px; }
.csd-side { grid-row: 2 / 3; background: var(--c-sbg); color: var(--c-sfg); border-right: 1px solid var(--c-sbd); display: flex; flex-direction: column; min-width: 0; }
.csd-side-title { height: 38px; display: flex; align-items: center; padding: 0 20px; font-size: 11px; }
.csd-section { height: 24px; display: flex; align-items: center; gap: 6px; padding: 0 14px; background: color-mix(in srgb, var(--c-sbg), var(--c-sfg) 5%); border-top: 1px solid var(--c-sbd); border-bottom: 1px solid var(--c-sbd); font-size: 11px; font-weight: 700; }
.csd-tree { padding: 8px 0; font-size: 13px; line-height: 24px; }
.csd-row { height: 24px; display: flex; align-items: center; gap: 7px; padding: 0 10px 0 18px; color: color-mix(in srgb, var(--c-sfg), transparent 8%); white-space: nowrap; }
.csd-row.child { padding-left: 34px; }
.csd-row.sel { background: color-mix(in srgb, var(--c-sfg), transparent 88%); color: var(--c-sfg); }
.csd-area { grid-row: 2 / 3; display: grid; grid-template-rows: 36px 30px 1fr 138px; min-width: 0; background: var(--c-ebg); overflow: hidden; }
.csd-tabs { display: flex; background: var(--c-tabbg); border-bottom: 1px solid var(--c-tabbd); }
.csd-tab { width: 205px; height: 36px; display: flex; align-items: center; gap: 8px; padding: 0 13px; border-right: 1px solid var(--c-tabbd); background: var(--c-tabact); color: var(--c-tabactfg); border-top: 2px solid var(--c-aact); font-size: 13px; }
.csd-tab.off { background: var(--c-tabbg); color: var(--c-tabofffg); border-top-color: transparent; }
.csd-crumb { display: flex; align-items: center; gap: 7px; padding: 0 18px; color: var(--c-gfg); border-bottom: 1px solid color-mix(in srgb, var(--c-tabbd), transparent 20%); font-size: 12px; }
.csd-editor { position: relative; overflow: hidden; background: var(--c-ebg); color: var(--c-efg); font-family: "RMono", Consolas, "Cascadia Mono", Menlo, Monaco, "Courier New", monospace; font-size: 18px; line-height: 1.52; }
.csd-hl { position: absolute; left: 0; right: 0; height: 28px; background: var(--c-eline); }
.csd-code { position: relative; padding: 20px 36px 18px 0; }
.csd-line { height: 28px; display: grid; grid-template-columns: 72px 1fr; align-items: center; }
.csd-num { padding-right: 18px; text-align: right; user-select: none; }
.csd-lc { justify-self: start; white-space: pre; }
.csd-caret { position: absolute; z-index: 3; display: block; width: 2px; height: 22px; background: var(--c-efg); pointer-events: none; }
.csd-term { display: grid; grid-template-rows: 32px 1fr; background: var(--c-pbg); border-top: 1px solid var(--c-pbd); color: var(--c-efg); font-family: "RMono", Consolas, "Cascadia Mono", Menlo, Monaco, "Courier New", monospace; font-size: 14px; }
.csd-ptabs { display: flex; align-items: center; gap: 22px; padding: 0 18px; border-bottom: 1px solid var(--c-pbd); color: var(--c-gfg); font-family: inherit; font-size: 12px; }
.csd-ptabs .on { color: var(--c-efg); border-bottom: 1px solid var(--c-aact); height: 32px; display: flex; align-items: center; }
.csd-tbody { padding: 12px 20px; line-height: 1.8; }
.csd-status { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; background: var(--c-stbg); color: var(--c-stfg); border-top: 1px solid var(--c-stbd); font-size: 12px; }
.csd-sl, .csd-sr { display: flex; align-items: center; gap: 18px; padding: 0 12px; }
.csd-remote { align-self: stretch; display: flex; align-items: center; padding: 0 12px; margin-left: -12px; background: var(--c-rbg); color: var(--c-rfg); }
.csd-ico svg, .csd-ico { display: block; }`);
    const TAG = /<([ckfsnvaopt])>([\s\S]*?)<\/\1>/g, un = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const parse = str => { const out = []; let i = 0, m; TAG.lastIndex = 0; while ((m = TAG.exec(str))) { if (m.index > i) out.push([null, un(str.slice(i, m.index))]); out.push([m[1], un(m[2])]); i = TAG.lastIndex; } if (i < str.length) out.push([null, un(str.slice(i))]); return out; };
    const f = v => +v.toFixed(4), t = p.at, CH = 0.012;
    const ICONS = ['<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="m21 21-5.2-5.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M8 18 3 12l5-6m8 12 5-6-5-6"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3v18m0-18 6 6m-6-6L6 9m6 12 6-6m-6 6-6-6"/></svg>'];
    for (const slot of els) {
      const bgUrl = p.background ? p.background : ctx.asset("background.jpeg");
      const vars = { "--c-abg": UI.activityBg, "--c-afg": UI.activityFg, "--c-amuted": UI.activityMuted, "--c-aact": UI.activityActive, "--c-sbg": UI.sidebarBg, "--c-sfg": UI.sidebarFg, "--c-sbd": UI.sidebarBorder,
        "--c-tabbg": UI.tabBg, "--c-tabact": UI.tabActiveBg, "--c-tabactfg": UI.tabActiveFg, "--c-tabofffg": UI.tabInactiveFg, "--c-tabbd": UI.tabBorder, "--c-ebg": UI.editorBg, "--c-efg": UI.editorFg, "--c-eline": UI.editorLine,
        "--c-gfg": UI.gutterFg, "--c-pbg": UI.panelBg, "--c-pbd": UI.panelBorder, "--c-stbg": UI.statusBg, "--c-stfg": UI.statusFg, "--c-stbd": UI.statusBorder, "--c-tbg": UI.titleBg, "--c-tfg": UI.titleFg, "--c-rbg": UI.remoteBg, "--c-rfg": UI.remoteFg };
      const root = ctx.make(slot, "div", "root", { cls: "csd-root", style: Object.assign({ color: UI.editorFg,
        background: `linear-gradient(180deg, rgba(0,0,0,.16), rgba(0,0,0,.32)), url("${bgUrl}") center / cover no-repeat, #000000` }, vars) });
      const content = ctx.make(root, "div", "content", { cls: "csd-content" });
      const header = ctx.make(content, "div", "header", { cls: "csd-header" });
      const hl = ctx.make(header, "div", "hl");
      ctx.make(hl, "p", "kicker", { cls: "csd-kicker", text: String(p.kicker).toUpperCase(), style: { color: UI.gutterFg } });
      ctx.make(hl, "div", "title", { cls: "csd-title", text: p.title, style: { color: UI.editorFg } });
      ctx.make(header, "div", "note", { cls: "csd-note", text: p.note, style: { color: UI.gutterFg } });
      const wb = ctx.make(content, "div", "wb", { cls: "csd-wb" });
      const tb = ctx.make(wb, "div", "titlebar", { cls: "csd-title-bar" });
      const tr = ctx.make(tb, "div", "traffic", { cls: "csd-traffic" });
      ["#ff5f57", "#ffbd2e", "#28c840"].forEach((c, i) => ctx.make(tr, "span", "t" + (i + 1), { style: { background: c } }));
      ctx.make(tb, "div", "wtitle", { cls: "csd-wtitle", text: p.windowTitle });
      ctx.make(tb, "div", "cmd", { cls: "csd-cmd", text: p.search });
      const act = ctx.make(wb, "aside", "activity", { cls: "csd-act" });
      ICONS.forEach((svg, i) => ctx.make(act, "div", "i" + (i + 1), { cls: "csd-ico" + (i === 0 ? " on" : ""), html: svg }));
      const side = ctx.make(wb, "aside", "sidebar", { cls: "csd-side" });
      ctx.make(side, "div", "stitle", { cls: "csd-side-title", text: String(p.sidebarTitle).toUpperCase() });
      ctx.make(side, "div", "section", { cls: "csd-section", text: p.section });
      const tree = ctx.make(side, "div", "tree", { cls: "csd-tree" });
      p.tree.forEach((r, i) => ctx.make(tree, "div", "r" + (i + 1), { cls: "csd-row" + (/^\s/.test(r) ? " child" : "") + (i === p.treeSelected ? " sel" : ""), text: r.trim() }));
      const area = ctx.make(wb, "section", "area", { cls: "csd-area" });
      const tabs = ctx.make(area, "div", "tabs", { cls: "csd-tabs" });
      p.tabs.forEach((s, i) => ctx.make(tabs, "div", "tab" + (i + 1), { cls: "csd-tab" + (i ? " off" : ""), text: s }));
      ctx.make(area, "div", "crumb", { cls: "csd-crumb", text: p.breadcrumbs });
      const editor = ctx.make(area, "div", "editor", { cls: "csd-editor" });
      const hlLine = ctx.make(editor, "div", "hl", { cls: "csd-hl", style: { opacity: 0 } });
      const code = ctx.make(editor, "div", "code", { cls: "csd-code" });
      const L = p.code.map((src, i) => {
        const line = ctx.make(code, "div", "line" + (i + 1), { cls: "csd-line" });
        const num = ctx.make(line, "span", "num", { cls: "csd-num", text: String(i + 1), style: { color: UI.gutterFg } });
        const lc = ctx.make(line, "span", "lc", { cls: "csd-lc", style: { clipPath: "inset(0% 100% 0% 0%)" } });
        let n = 0;
        parse(src).forEach((s, k) => { ctx.make(lc, "span", "s" + k, { text: s[1], style: s[0] ? { color: TK[s[0]] } : {} }); n += Array.from(s[1]).length; });
        return { line, num, lc, n };
      });
      const caret = ctx.make(editor, "span", "caret", { cls: "csd-caret", style: { left: "0px", top: "0px" } });
      const term = ctx.make(area, "div", "terminal", { cls: "csd-term" });
      const ptabs = ctx.make(term, "div", "ptabs", { cls: "csd-ptabs" });
      p.panelTabs.forEach((s, i) => ctx.make(ptabs, "span", "p" + (i + 1), { cls: i ? "" : "on", text: String(s).toUpperCase() }));
      const tbody = ctx.make(term, "div", "tbody", { cls: "csd-tbody" });
      const tlines = p.terminal.map((src, i) => { const d = ctx.make(tbody, "div", "t" + (i + 1)); parse(src).forEach((s, k) => ctx.make(d, "span", "s" + k, { text: s[1], style: s[0] ? { color: s[0] === "p" ? TK.f : TK[s[0]] } : {} })); return d; });
      const st = ctx.make(wb, "footer", "status", { cls: "csd-status" });
      const sl = ctx.make(st, "div", "left", { cls: "csd-sl" });
      p.statusLeft.forEach((s, i) => ctx.make(sl, "span", "l" + (i + 1), { cls: i ? "" : "csd-remote", text: s }));
      const sr = ctx.make(st, "div", "right", { cls: "csd-sr" });
      p.statusRight.forEach((s, i) => ctx.make(sr, "span", "r" + (i + 1), { text: s }));
      // measure the editor once (no transform is applied yet): line tops, text left edge, text widths
      const er = editor.getBoundingClientRect(), kk = er.width / (editor.offsetWidth || 1) || 1;
      const rel = el => { const r = el.getBoundingClientRect(); return { x: (r.left - er.left) / kk, y: (r.top - er.top) / kk, w: r.width / kk }; };
      L.forEach(o => { o.top = rel(o.line).y; const r = rel(o.lc); o.left = r.x; o.w = r.w; });
      const top0 = L[0].top, left0 = L[0].left;
      hlLine.style.top = f(top0) + "px"; caret.style.left = f(left0) + "px"; caret.style.top = f(top0 + 3) + "px";
      // schedule: line start times as in the source
      let cur = 0.95; const starts = L.map(o => { const s = cur; cur += Math.max(o.n * CH, 0.08) + 0.045; return s; });
      ft(header, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, t);
      ft(wb, { y: 42, opacity: 0, scale: 0.986 }, { y: 0, opacity: 1, scale: 1, duration: 0.58, ease: "power3.out" }, t + 0.1);
      ft(hlLine, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" }, t + 0.74);
      L.forEach((o, i) => {
        const s = t + f(starts[i]), dy = f(o.top - top0);
        tl.set(hlLine, { y: dy }, s);
        tl.set(o.num, { color: UI.gutterActiveFg }, s);
        if (i) tl.set(L[i - 1].num, { color: UI.gutterFg }, s);
        if (o.n > 0) {
          const dur = f((o.n + 1) * CH), at = s - CH, ease = `steps(${o.n})`;
          tl.set(caret, { y: dy }, at);
          ft(o.lc, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease }, f(at));
          ft(caret, { x: f(o.left - left0 + 2) }, { x: f(o.left - left0 + o.w + 2), duration: dur, ease }, f(at));
        } else tl.set(caret, { x: 0, y: dy }, s);
      });
      ft(caret, { opacity: 1 }, { opacity: 0, duration: 0.34, repeat: 25, yoyo: true, ease: "steps(1)" }, t + 0.95);
      ft(term, { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.56, ease: "power3.out" }, t + 7.55);
      ft(tlines, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.24, stagger: 0.16, ease: "power2.out" }, t + 8.05);
      ft(wb, { rotationY: 0, z: 0 }, { rotationY: -10.5, z: 74, duration: 0.72, ease: "power2.inOut" }, t + 9.35);
      ft(wb, { rotationY: -10.5, z: 74 }, { rotationY: 0, z: 0, duration: 0.62, ease: "power2.inOut" }, t + 10.08);
    }
    flush();
  },
});
