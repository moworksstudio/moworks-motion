/* Moworks Motion build runtime (used ONLY by `kit.py build` and `kit.py gallery`, never shipped in a film).
   Library presets register here; the builder runs them on one real GSAP timeline, then reads the timeline back and writes every tween
   as a literal line into index.html (plan option B: motion written out, editable in HyperFrames Studio).

   Preset file (library/presets/<group>/<name>/preset.js, with preset.json next to it: source, licence, demo; see library/README.md):
     AIMK.preset("text/mask-rise", { params: { duration: 0.8, ease: "expo.out", from: 135 },
       build(tl, els, p, ctx) { for (const el of els) { ctx.mask(el); tl.fromTo(el, { yPercent: p.from }, { yPercent: 0, duration: p.duration, ease: p.ease }, p.at); } } });
   Two kinds, same signature: an EFFECT animates the target elements; a BLOCK fills its target (an empty box placed in film.json) with its own
   elements (ctx.make) and styles (ctx.css), then animates them.
   Rules for preset authors: tl.fromTo / tl.to / tl.set only, string eases only (a function ease from a source repo goes through ctx.ease(fn),
   which fits one cubic Bezier: "custom(M0,0 C ...)", the form HyperFrames Studio writes), no Math.random / Date (use ctx.hash), every tweened
   element needs an id (ctx.make gives one). Motion that changes text or runs a per-frame formula (count-ups, ambient drift) goes through
   ctx.code("..."): the code runs here on a sub-timeline the bake skips, and is copied verbatim into the film inside its own { } block. */
(() => {
  const P = {};
  let uid = 0;
  const stage = () => document.getElementById("stage");
  /* FNV-1a, then MurmurHash3's fmix32 finaliser. Without the finaliser keys that differ only in their last character ("dot1", "dot2" ...)
     gave values in a near-straight line: the 2D rebuild test's confetti fell on one diagonal (09/10/2026). Values changed that day: an older
     film rebuilt now scatters its hashed pieces differently. */
  const fnv = s => {
    let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return ((h >>> 0) % 10000) / 10000;
  };

  /* one cubic Bezier through (0,0) and (1,1) closest to an ease function (Nelder-Mead on 4 control values) */
  const bez = (x1, y1, x2, y2) => p => { if (p <= 0) return 0; if (p >= 1) return 1; let lo = 0, hi = 1, t = p;
    for (let i = 0; i < 40; i++) { t = (lo + hi) / 2; const x = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t; if (x < p) lo = t; else hi = t; }
    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t; };
  const fit = fn => {
    const xs = Array.from({ length: 81 }, (_, i) => i / 80), ys = xs.map(fn);
    const err = v => { const [x1, y1, x2, y2] = v; if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return 1e9; const b = bez(x1, y1, x2, y2); let e = 0; xs.forEach((x, i) => { const d = b(x) - ys[i]; e += d * d; }); return e; };
    let S = [[0.25, 0.1, 0.25, 1], [0.6, 0.1, 0.25, 1], [0.25, 0.6, 0.25, 1], [0.25, 0.1, 0.6, 1], [0.25, 0.1, 0.25, 0.6]].map(v => [v, err(v)]);
    for (let it = 0; it < 600; it++) {
      S.sort((a, b) => a[1] - b[1]);
      const c = [0, 1, 2, 3].map(k => (S[0][0][k] + S[1][0][k] + S[2][0][k] + S[3][0][k]) / 4), w = S[4][0];
      const pt = f => c.map((v, k) => v + f * (w[k] - v)), r = pt(-1), er = err(r);
      if (er < S[0][1]) { const e = pt(-2), ee = err(e); S[4] = ee < er ? [e, ee] : [r, er]; }
      else if (er < S[3][1]) S[4] = [r, er];
      else { const k = pt(0.5), ek = err(k); if (ek < S[4][1]) S[4] = [k, ek]; else S = S.map((s, i) => i ? [s[0].map((v, j) => S[0][0][j] + 0.5 * (v - S[0][0][j])), 0] : s).map(s => [s[0], err(s[0])]); }
    }
    S.sort((a, b) => a[1] - b[1]);
    const v = S[0][0].map(x => +x.toFixed(3)), b = bez(...v);
    return { ease: `custom(M0,0 C ${v[0]},${v[1]} ${v[2]},${v[3]} 1,1)`, maxErr: Math.max(...xs.map((x, i) => Math.abs(b(x) - ys[i]))) };
  };

  const ctx = {
    codes: [], styles: {}, notes: [], cues: [],
    /* a sound effect at timeline time t (seconds, like tween positions): swoosh | whoosh | pop | sparkle | tick | tickhi | thump
       (engine/audio/sfx.py); kit.py build turns the cues into <audio> clips. gain 0..1 (0.5 = v1's default) */
    sfx(t, name, gain = 0.5) { ctx.cues.push({ t: +(+t).toFixed(4), name, gain }); },
    get W() { return stage().offsetWidth || 1920; },
    get H() { return stage().offsetHeight || 1080; },
    id(el, base) { if (!el.id) el.id = (base || "e") + (++uid); return el.id; },
    /* 0..1 from an element (data-seed, id or text) or a string: the same every build, never Math.random */
    hash(x) { return fnv(typeof x === "string" ? x : (x.dataset && x.dataset.seed) || x.id || (x.textContent || "").slice(0, 40)); },
    /* a new element inside parent, with an id (parent id + "_" + name); props: { cls, text, html, style: {...}, attrs: {...} } */
    make(parent, tag, name, props = {}) {
      const e = document.createElement(tag || "div");
      e.id = (parent.id || ctx.id(parent, "b")) + "_" + (name || "e" + (++uid));
      if (props.cls) e.className = props.cls;
      if (props.html != null) e.innerHTML = props.html; else if (props.text != null) e.textContent = props.text;
      for (const k in props.style || {}) { if (k.startsWith("--")) e.style.setProperty(k, props.style[k]); else e.style[k] = props.style[k]; }   // custom properties too
      for (const k in props.attrs || {}) e.setAttribute(k, props.attrs[k]);
      parent.appendChild(e); return e;
    },
    /* CSS a block needs, written once per preset into the film's <style> */
    css(name, text) { if (ctx.styles[name]) return; ctx.styles[name] = text; const s = document.createElement("style"); s.textContent = text; document.head.appendChild(s); },
    /* a function ease from a source repo -> the closest one-segment custom() ease string (fit error kept in ctx.notes for the gallery check) */
    ease(fn, label) { const r = fit(fn); ctx.notes.push({ ease: label || "ease", fit: r.ease, maxErr: +r.maxErr.toFixed(4) }); return r.ease; },
    /* wrap el in an overflow:hidden box of the same position (text that rises out of a mask) */
    mask(el, pad = 0.18) {
      if (el.parentElement && el.parentElement.dataset.aimkMask) return el.parentElement;
      const cs = getComputedStyle(el);
      if (el.tagName === "SPAN" || cs.display.startsWith("inline")) {           // a word or a character: an inline mask on the same line
        const s = document.createElement("span");
        s.dataset.aimkMask = "1"; s.className = "mask";
        const pad = Math.round(parseFloat(cs.fontSize) * 0.18) + "px";
        Object.assign(s.style, { display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingTop: pad, paddingBottom: pad, marginTop: "-" + pad, marginBottom: "-" + pad });
        el.parentElement.insertBefore(s, el); s.appendChild(el); el.style.display = "inline-block";
        return s;
      }
      // a centring set the build made on this element (build.py CENTER_JS: translate(-50%, -50%) handed to GSAP as xPercent / yPercent) is
      // undone first: its transform moves to the mask below, and GSAP must not keep xPercent -50 on the element (the text moved by half its
      // width twice, in the draft and, as the bake reverted the set, in the film: text/mask-rise, text/top-down-letters, found 09/10/2026)
      const C = window.__aimkCenter || [];
      for (let i = C.length - 1; i >= 0; i--) if (C[i].targets().includes(el)) { C[i].revert(); C.splice(i, 1); }
      const m = document.createElement("div");
      m.dataset.aimkMask = "1"; m.className = "mask";
      const MOVE = ["position", "left", "top", "right", "bottom", "transform"];   // placement (incl. a centring transform) goes to the mask, so the
      for (const k of MOVE) m.style[k] = el.style[k] || (k === "position" ? cs.position : "");   // element's own transform is free for the tween
      if (m.style.position === "static" || !m.style.position) m.style.position = "relative";
      m.style.overflow = "hidden"; m.style.paddingTop = m.style.paddingBottom = Math.round(parseFloat(cs.fontSize) * pad) + "px";
      const r0 = el.getBoundingClientRect();
      el.parentElement.insertBefore(m, el); m.appendChild(el);
      for (const k of MOVE) el.style[k] = "";
      if (window.gsap) gsap.set(el, { clearProps: "transform" });               // and GSAP's cached transform of it
      el.style.display = "inline-block";
      const r1 = el.getBoundingClientRect(), k = (stage().getBoundingClientRect().width / ctx.W) || 1;   // the text must not move: correct the mask's
      m.style.marginLeft = ((r0.left - r1.left) / k).toFixed(2) + "px"; m.style.marginTop = ((r0.top - r1.top) / k).toFixed(2) + "px";   // offset
      return m;
    },
    /* split an element's text into word (or char) spans with ids; returns the spans */
    split(el, by = "words") {
      ctx.id(el, "t");
      const text = el.textContent; el.textContent = "";
      const parts = by === "chars" ? [...text] : text.split(/(\s+)/);
      const out = [];
      parts.forEach(part => {
        if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
        if (!part) return;
        const s = document.createElement("span"); s.textContent = part; s.style.display = "inline-block";
        s.id = el.id + "_" + (by === "chars" ? "c" : "w") + out.length; el.appendChild(s); out.push(s);
      });
      return out;
    },
    /* an inner wrapper holding the element's children (or the <img> itself, wrapped): a second transform owner, so an ambient motion never
       fights the entrance on the same property (v1 house rule "one owner per property") */
    layer(el, name = "float") {
      const have = el.querySelector(":scope > [data-aimk-layer='" + name + "']"); if (have) return have;
      const f = document.createElement("div"); f.dataset.aimkLayer = name; f.id = ctx.id(el) + "_" + name;
      Object.assign(f.style, { position: "absolute", inset: "0" });
      if (el.tagName === "IMG") {
        el.parentNode.insertBefore(f, el);
        Object.assign(f.style, { inset: "auto", left: el.offsetLeft + "px", top: el.offsetTop + "px", width: el.offsetWidth + "px", height: el.offsetHeight + "px" });
        el.style.left = "0px"; el.style.top = "0px"; f.appendChild(el);
      } else {
        const cs = getComputedStyle(el); Object.assign(f.style, { display: cs.display === "inline" ? "block" : cs.display, alignItems: cs.alignItems, justifyContent: cs.justifyContent, flexDirection: cs.flexDirection });
        while (el.firstChild) f.appendChild(el.firstChild); el.appendChild(f);
      }
      return f;
    },
    /* code that goes into the film as it is (it sees `tl` and `gsap`); also run now on a sub-timeline the bake skips, so drafts and checks see it */
    /* a file the preset ships in its own assets/ folder (pictures, models, a library); kit.py build copies the folder to
       <project>/assets/lib/<preset name>/, so the path works in the film and in HyperFrames Studio */
    asset(file) { return `assets/lib/${ctx.current}/${file}`; },
    /* a HyperFrames registry "template" component run as shipped inside `slot` (engine/vendor/libs/hf/hf-mount.js, which the preset lists in
       preset.json "scripts"): the component's HTML file sits in the preset's assets/; the part inside <template> goes into the film's code, mounted
       at `at` with the variable values `vars` and the mount duration (06/10/2026, batch 2: 80 registry primitives use this form) */
    /* a HyperFrames registry BLOCK (a whole composition page) run as shipped in an <iframe srcdoc> over `slot`, kept in step with the film by
       engine/vendor/libs/hf/hf-frame.js (the preset lists "libs/hf/hf-frame.js" and its libraries in preset.json "scripts"). o: { size: [w, h]
       of the block (1920 x 1080), libs: { "cdn text": "assets/vendor/..." }, urls: { "remote url": "file in the preset's assets" }, files: [the
       block's own files, made film paths], replace: [[from, to], ...] (copy changes, e.g. Vietnamese) }. Google-font links are dropped and the
       families they named are drawn with the kit's RFlex / RMono (Vietnamese complete, the same on every machine). */
    hfFrame(slot, file, at, duration, o = {}) {
      // o.page: a film path to read instead of the preset's own file (a page HF's compiler wrote into the film: text/embedded-captions);
      // o.edit(text): the kit's change to that page, after `replace` (e.g. its <video> -> the film's picture sequence)
      const x = new XMLHttpRequest(); x.open("GET", o.page || ctx.asset(file), false); x.send();
      let s = x.responseText;
      if (o.look) {                                       // carousel blocks, patched here and never in their files (Test 4, 08/10/2026, user's choice):
        const L = o.look;                                 // their page never sets --background (the param did nothing: always #ededef), the cards
        if (L.background != null)                         // are white under transparent pictures, the clock stops at 6 s, scale and card size fixed
          s = s.replace(/var\(--background,\s*#ededef\)/gi, L.background).replace(/(body\s*\{[^}]*?background:\s*)#ededef/i, "$1" + L.background)
               .replace(/background:\s*"#EDEDEF"/g, "background: " + JSON.stringify(L.background));
        if (L.cardBg != null) s = s.replace(/(\.card-inner\s*\{[^}]*?background:\s*)#fff\b/i, "$1" + L.cardBg);
        if (L.scale != null) s = s.replace(/globalScale:\s*[\d.]+/, "globalScale: " + (+L.scale));
        if (L.card) s = s.replace(/(\{\s*file:\s*"[^"]+",\s*)width:\s*\d+,\s*height:\s*\d+/g, `$1width: ${+L.card[0]}, height: ${+L.card[1]}`);
        // painter order instead of 3D intersection (Test 4 C13: in vision-5 the card coming to the centre had its right edge cut by its
        // neighbour, the tilted card planes crossed in preserve-3d; the Gallery clip showed it too): cards flattened, each projected by its
        // parent (the camera distance of the whole rig, so sizes do not change), stacked by depth every frame (nearer on top, index order for ties)
        if (s.split("transform-style: preserve-3d;").length === 2 && s.split('squeeze.id = DATA.id + "-squeeze";').length === 2 && s.split("el.style.opacity = alpha;").length === 2)
          s = s.replace("transform-style: preserve-3d;", "transform-style: flat;")
               .replace('squeeze.id = DATA.id + "-squeeze";', 'squeeze.id = DATA.id + "-squeeze"; if (is3d) { squeeze.style.perspective = (comp.cameraDistance || comp.cameraZoom) + "px"; squeeze.style.perspectiveOrigin = "50% 50%"; }')
               .replace("el.style.opacity = alpha;", "el.style.opacity = alpha; el.style.zIndex = String(10000000 + Math.round(-(p.z || 0) * 4) * 1000 + (n - i));");
        if (L.duration && L.native && Math.abs(L.duration - L.native) > 1e-3) {      // one clip over the whole block: its clock follows the scene
          const n = String(+L.native), rd = new RegExp(`duration: ${n.replace(".", "\\.")},`, "g"), dd = `data-duration="${n}"`;
          if ((s.match(rd) || []).length === 1 && s.split(dd).length === 3) s = s.replace(rd, `duration: ${+L.duration},`).split(dd).join(`data-duration="${+L.duration}"`);
        }
      }
      for (const [a, b] of o.replace || []) s = s.split(a).join(b);
      if (o.edit) s = o.edit(s);
      for (const dd of o.dirs || []) s = s.replace(new RegExp("([\"'(`])(?:\\./)?" + dd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/", "g"), (m0, q) => q + "./" + ctx.asset(dd) + "/");   // its sub-folders, one pass (before the kit adds its own assets/... paths); "./" kept: an import map drops a bare "assets/..." value
      const fams = new Set();
      s = s.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g, m => { (m.match(/family=([^&"']+)/g) || []).forEach(f => fams.add(f.slice(7).split(":")[0].replace(/\+/g, " "))); return ""; });
      s = s.replace(/@import\s+url\(["']?(https:\/\/fonts\.googleapis\.com[^"')]+)["']?\)\s*;?/g, (m, u) => { (u.match(/family=([^&"']+)/g) || []).forEach(f => fams.add(f.slice(7).split(":")[0].replace(/\+/g, " "))); return ""; });
      s = s.replace(/<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@[^"]*\/gsap\.min\.js"[^>]*><\/script>/g, '<script src="assets/vendor/gsap.min.js"><\/script>');   // with integrity / crossorigin too
      for (const k in o.libs || {}) s = s.split(k).join(o.libs[k]);
      if (o.imagePrefix) {                                  // pictures the block names under one folder (carousels): the job's `images`, in order,
        const pics = (o.images && o.images.length) ? o.images : o.placeholders || [], seen = [];   // or the kit's placeholders; repeated when fewer
        const rx = new RegExp(o.imagePrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\w.-]+\\.(?:jpe?g|png|webp|avif)", "g");
        s = s.replace(rx, m => { let i = seen.indexOf(m); if (i < 0) { seen.push(m); i = seen.length - 1; } return pics.length ? pics[i % pics.length] : m; });
      }
      s = s.replace(/https:\/\/cdn\.jsdelivr\.net\/fontsource\/fonts\/[^"')\s]+/g, u => "assets/fonts/" + (/mono/i.test(u) ? "RobotoMono-var.woff2" : "RobotoFlex-var.woff2"));
      for (const k in o.urls || {}) s = s.split(k).join(ctx.asset(o.urls[k]));
      for (const f of o.files || []) s = s.replace(new RegExp(`(["'(])(\\./)?${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(["')])`, "g"), (m0, a, d, b) => a + "./" + ctx.asset(f) + b);
      const face = [...fams].map(f => `@font-face { font-family: "${f}"; src: url("assets/fonts/${/mono|code|courier/i.test(f) ? "RobotoMono-var.woff2" : "RobotoFlex-var.woff2"}") format("woff2"); font-weight: 100 1000; font-display: block; }`).join("\n");
      const V = Object.assign({}, o.vars || {}), pics0 = (o.images && o.images.length) ? o.images : o.placeholders || [];
      (o.imageVars || []).forEach((id, i) => { if (pics0.length && V[id] === undefined) V[id] = pics0[i % pics0.length]; });   // image variables
      // the host API a block reads: getVariables(), and assetUrl(path) = path beside the block's file (its own runtime-built paths, e.g.
      // frost.js "assets/textures/..."); a path the kit already pointed at the film's copy is returned as it is
      const AB = "./" + ctx.asset("");
      const hv = Object.keys(V).length || /__hyperframes\.assetUrl/.test(s) ? `\n<script>window.__hyperframes = Object.assign(window.__hyperframes || {}, { getVariables: function () { return ${JSON.stringify(V).replace(/</g, "\\u003c")}; }, assetUrl: function (p) { p = String(p); return /^(?:[a-z]+:|\\/|\\.?\\/?assets\\/lib\\/)/i.test(p) ? p : ${JSON.stringify(AB)} + p.replace(/^\\.\\//, ""); } });<\/script>` : "";
      const [W0, H0] = o.size || [1920, 1080];         // the root at its data-width x data-height, as the HF runtime sizes it (no specificity: the block's own rules win)
      s = s.replace(/<head([^>]*)>/i, `<head$1>\n<style data-aimk="font substitutes">\n${face}\n:where(body > [data-composition-id]) { width: ${W0}px; height: ${H0}px; }\n</style>\n<script>window.__timelines = window.__timelines || {};<\/script>${hv}`);   // what a host gives a block: a registry, its variables
      const [W, H] = o.size || [1920, 1080], bw = slot.offsetWidth || ctx.W, bh = slot.offsetHeight || ctx.H, k = Math.min(bw / W, bh / H);
      ctx.id(slot, "b");
      if (getComputedStyle(slot).position === "static") slot.style.position = "relative";
      const f = ctx.make(slot, "iframe", "hf", { attrs: { srcdoc: s, scrolling: "no", "aria-hidden": "true", "data-aimk-block": "" },
        style: { position: "absolute", left: ((bw - W * k) / 2).toFixed(2) + "px", top: ((bh - H * k) / 2).toFixed(2) + "px", width: W + "px", height: H + "px",
                 border: "0px", transformOrigin: "0 0", transform: `scale(${+k.toFixed(5)})`, pointerEvents: "none", background: "transparent" } });
      const so = [];                                     // hf-frame options: the page holds its own build promises; o.reload (see hf-frame.js)
      if (/__hf\.buildReady/.test(s)) so.push("buildReady: true");
      if (o.reload) so.push("reload: true");
      ctx.code(`  // HyperFrames registry block ${file} (as shipped, in its own page: #${f.id}), kept in step by assets/vendor/libs/hf/hf-frame.js
  AIMKHFFrame.sync(${JSON.stringify(f.id)}, tl, ${at}, ${+duration || 4}${so.length ? ", { " + so.join(", ") + " }" : ""});`);
    },
    hf(slot, file, at, vars, duration, theme, dirs, slots, replace) {   // replace: [[from, to], ...] on its markup (a scene with fixed copy, 11/10/2026)
      const T = Object.assign({ "--font-display": '"RFlex", sans-serif', "--font-body": '"RFlex", sans-serif', "--font-mono": '"RMono", Consolas, monospace',
        // the dark theme a HyperFrames host gives (the registry demos' :root); --bg is left out so a component stays transparent over the film
        "--fg": "#f8fafc", "--muted": "#94a3b8", "--surface": "#151c2c", "--border": "#34405a", "--brand": "#71f5a7", "--accent": "#61a8ff", "--accent-2": "#c5a3ff",
        "--radius": "22px", "--space-1": "8px", "--space-2": "16px", "--space-3": "32px" }, theme || {});
      for (const k in T) if (k.startsWith("--") && !slot.style.getPropertyValue(k)) slot.style.setProperty(k, T[k]);   // host theme tokens: the kit's fonts
                                                                                                                          // (Vietnamese complete) unless set
      const x = new XMLHttpRequest(); x.open("GET", ctx.asset(file), false); x.send();
      let s = x.responseText.replace(new RegExp("<" + "!--[\\s\\S]*?--" + ">", "g"), "");   // comments first: their text may mention <template>
      const tm = s.match(/<template\b[^>]*>/), b = s.lastIndexOf("</template>");   // <template> may carry attributes
      if (tm && b > tm.index) s = s.slice(tm.index + tm[0].length, b);
      for (const [a0, b0] of replace || []) s = s.split(a0).join(b0);
      s = s.replace(/(url\(\s*["']?|src=["']|href=["'])\.\/([^"')\s]+)/g, (m0, pre, f) => pre + ctx.asset(f));   // files next to the component
      for (const dd of dirs || []) s = s.split(`"${dd}/`).join(`"${ctx.asset(dd)}/`).split(`'${dd}/`).join(`'${ctx.asset(dd)}/`).split(`(${dd}/`).join(`(${ctx.asset(dd)}/`);   // its sub-folders
      const js = v => JSON.stringify(v).replace(/</g, "\\u003c");      // safe inside the film's <script> element: every < is written as a unicode escape
      ctx.id(slot, "b");
      ctx.code(`  // HyperFrames registry component ${file} (as shipped, in its own ids / variables / timeline: assets/vendor/libs/hf/hf-mount.js)
  AIMKHF.mount(document.getElementById(${js(slot.id)}), tl, ${at}, ${js(s)}, ${js(vars || {})}, ${+duration || 4}${slots && Object.keys(slots).length ? ", " + js(slots) : ""});`);
    },
    /* ctx.track(el, prop, keys, spring, at): a value that is sent to new targets over time and follows them as a SUM OF SPRINGS (plan B2,
       07/10/2026): each new key adds a spring step from the previous key's value, so a retarget keeps the momentum it had (an indicator
       sliding between tabs, a counter that changes its mind). keys [[t, value, spring?], ...] in seconds from "at"; spring = "snappy" |
       "default" | "heavy" | "playful" | [k, d]. Written into the film as a code block (needs assets/vendor/libs/aimk/eases.js, which
       kit.py build adds); AE gets it as keyframes (the port samples the page). */
    track(el, prop, keys, spring, at) {
      const SP = window.AIMK_SPRING; if (!SP) throw new Error("ctx.track: spring eases not loaded");
      const kd = s => Array.isArray(s) ? s : SP.P[s || "default"] || SP.P.default;
      const K = keys.map(k => [+k[0], +k[1], kd(k[2] || spring)]);
      let tail = 0; for (const k of K) tail = Math.max(tail, SP.settle(SP.step(k[2][0], k[2][1])));
      const D = +(K[K.length - 1][0] + tail).toFixed(4), v = "tr_" + ctx.id(el).replace(/\W/g, "_") + "_" + prop.replace(/\W/g, "_");
      ctx.code(`  // spring track #${el.id} ${prop}: the sum of springs toward each new value (keys in s from ${at})
  const ${v} = { t: 0, K: ${JSON.stringify(K)} }, ${v}S = ${v}.K.map(k => AIMK_SPRING.step(k[2][0], k[2][1]));
  tl.fromTo(${v}, { t: 0 }, { t: ${D}, duration: ${D}, ease: "none", onUpdate: () => {
    const K = ${v}.K; let x = K[0][1]; for (let i = 1; i < K.length; i++) x += (K[i][1] - K[i - 1][1]) * ${v}S[i](${v}.t - K[i][0]);
    gsap.set(${JSON.stringify("#" + el.id)}, { ${JSON.stringify(prop)}: x }); } }, ${at});`);
    },
    code(js) {
      ctx.codes.push(js);
      // a code block that writes text at its first render (a count-up's "0") must not bake that text into the film's static HTML: the
      // design's text stays there (08/10/2026, test 4: "61,000" was baked as "0" and presets that measured it after went wrong)
      const leaves = [...stage().querySelectorAll("*")].filter(e => !e.firstElementChild && e.textContent).map(e => [e, e.textContent]);
      const sub = gsap.timeline(); sub.data = "aimk-code"; sub.aimkScene = window.__aimkScene || null;
      new Function("tl", "gsap", js)(sub, gsap);
      window.__aimkTL.add(sub, 0);
      for (const [e, t] of leaves) if (e.isConnected && e.textContent !== t) e.textContent = t;
    },
  };
  /* the draft must behave like the written film: build.py gives a later fromTo on a property an earlier tween of the same element already
     animates immediateRender:false (HF lint rule), so the draft does the same here (else the draft shows that later start state at once and
     the bake check reports a difference; flow presets had to work around it, 05/10/2026) */
  const SEEN = new WeakMap();
  const keys = v => Object.keys(v || {}).filter(k => !["ease", "duration", "delay", "repeat", "yoyo", "stagger", "immediateRender", "onUpdate", "onComplete", "onStart", "overwrite"].includes(k));
  const guard = tl => new Proxy(tl, { get(t, k) {
    if (k === "fromTo") return (targets, from, to, pos) => {
      const els = gsap.utils.toArray(targets), props = new Set([...keys(from), ...keys(to)]);
      const hit = els.some(e => { const s = SEEN.get(e); return s && [...props].some(x => s.has(x)); });
      els.forEach(e => { const s = SEEN.get(e) || new Set(); props.forEach(x => s.add(x)); SEEN.set(e, s); });
      if (hit && to && to.immediateRender === undefined) to = Object.assign({}, to, { immediateRender: false });
      return t.fromTo(targets, from, to, pos);
    };
    if (k === "to" || k === "set") return (targets, vars, pos) => {
      gsap.utils.toArray(targets).forEach(e => { const s = SEEN.get(e) || new Set(); keys(vars).forEach(x => s.add(x)); SEEN.set(e, s); });
      return t[k](targets, vars, pos);
    };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } });
  /* the groove's own transform owner inside (or, for a picture, around) an element, so the pulse never fights the element's entrance.
     Text / boxes / groups: an in-flow wrapper of the content (same size and line breaks; flex / grid settings copied). Pictures, canvases,
     video, iframes: a wrapper in the element's place and size, the element inside at 0, 0. Pivot: the element's visual centre (a centring
     translate(-50%, -50%) on a picture puts it off the layout box) unless "origin" is given. */
  const grooveLayer = (el, origin) => {
    ctx.id(el, "g");
    const have = el.querySelector(":scope > [data-aimk-layer='groove']") || (el.parentElement && el.parentElement.dataset.aimkLayer === "groove" && el.parentElement.id === el.id + "_groove" ? el.parentElement : null);
    if (have) return have;
    const f = document.createElement("div"); f.dataset.aimkLayer = "groove"; f.id = el.id + "_groove";
    const cs = getComputedStyle(el), R = ["IMG", "CANVAS", "VIDEO", "IFRAME", "svg"].includes(el.tagName);
    if (R) {
      const r = el.getBoundingClientRect(), pr = el.parentElement.getBoundingClientRect();   // an <svg> has no offset* values
      const abs = cs.position === "absolute" || cs.position === "fixed", w = el.offsetWidth ?? r.width, h = el.offsetHeight ?? r.height;
      if (abs) Object.assign(f.style, { position: "absolute", left: (el.offsetLeft ?? r.left - pr.left) + "px", top: (el.offsetTop ?? r.top - pr.top) + "px", width: w + "px", height: h + "px" });
      else Object.assign(f.style, { position: "relative", display: cs.display === "inline" ? "inline-block" : cs.display, width: w + "px", height: h + "px", flex: "none", margin: cs.margin, verticalAlign: cs.verticalAlign });
      el.parentNode.insertBefore(f, el); f.appendChild(el);
      Object.assign(el.style, { width: w + "px", height: h + "px", margin: "0px" });
      if (abs) Object.assign(el.style, { left: "0px", top: "0px", right: "auto", bottom: "auto" });
      const m = (el.style.transform || "").match(/translate(X|Y)?\(\s*(-?[\d.]+)%(?:\s*,\s*(-?[\d.]+)%)?/);
      const xp = m ? (m[1] === "Y" ? 0 : +m[2]) : 0, yp = m ? (m[1] === "Y" ? +m[2] : m[1] === "X" ? 0 : +(m[3] || 0)) : 0;
      f.style.transformOrigin = origin || `${50 + xp}% ${50 + yp}%`;
    } else if (cs.position === "absolute" || cs.position === "fixed") {
      // a placed element (most scene elements): a full-size wrapper around it, in its parent, so the element's own paint (a sticker's
      // fill, a bubble's background) pulses too and its left / top keep the same containing block; pivot = its visual centre; its
      // z-index moves to the wrapper (a transformed wrapper is a stacking context)
      Object.assign(f.style, { position: "absolute", inset: "0px", pointerEvents: "none" });
      if (cs.zIndex !== "auto") f.style.zIndex = cs.zIndex;
      el.parentNode.insertBefore(f, el); f.appendChild(el);
      const m = (el.style.transform || "").match(/translate(X|Y)?\(\s*(-?[\d.]+)%(?:\s*,\s*(-?[\d.]+)%)?/);
      const xp = m ? (m[1] === "Y" ? 0 : +m[2]) : 0, yp = m ? (m[1] === "Y" ? +m[2] : m[1] === "X" ? 0 : +(m[3] || 0)) : 0;
      const ox = el.offsetLeft + el.offsetWidth * (0.5 + xp / 100), oy = el.offsetTop + el.offsetHeight * (0.5 + yp / 100);
      if (origin) {                                      // "50% 100%" = of the ELEMENT's box (feet on the floor), not the wrapper's
        const [a, b] = origin.split(/\s+/).map(v => v.endsWith("%") ? parseFloat(v) / 100 : null);
        f.style.transformOrigin = `${(a == null ? ox : el.offsetLeft + el.offsetWidth * (a + xp / 100)).toFixed(2)}px ${(b == null ? oy : el.offsetTop + el.offsetHeight * (b + yp / 100)).toFixed(2)}px`;
      } else f.style.transformOrigin = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
    } else {
      const painted = !/rgba\([^)]*,\s*0\)|transparent/.test(cs.backgroundColor) || cs.backgroundImage !== "none" || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== "none";
      if (painted) {                                     // in the flow with its own paint: an in-flow wrapper in its place (margins, flex settings)
        const inl = /inline/.test(cs.display);
        Object.assign(f.style, { display: inl ? "inline-block" : "block", margin: cs.margin, flex: cs.flex, alignSelf: cs.alignSelf, order: cs.order, verticalAlign: cs.verticalAlign });
        if (cs.zIndex !== "auto") f.style.zIndex = cs.zIndex;
        el.parentNode.insertBefore(f, el); f.appendChild(el); el.style.margin = "0px";
        if (parseFloat(cs.flexGrow) > 0) el.style.width = "100%";
      } else {                                           // in the flow, no paint of its own (words, a line of text): a wrapper of its content
        const flex = /flex|grid/.test(cs.display);
        Object.assign(f.style, flex ? { display: cs.display.replace("inline-", ""), flexDirection: cs.flexDirection, flexWrap: cs.flexWrap, alignItems: cs.alignItems,
          justifyContent: cs.justifyContent, alignContent: cs.alignContent, gap: cs.gap, width: "100%", height: "100%", flex: "1 1 auto", minWidth: "0" } : { display: "block" });
        while (el.firstChild) f.appendChild(el.firstChild); el.appendChild(f);
      }
      if (origin) f.style.transformOrigin = origin;
    }
    return f;
  };
  window.AIMK = {
    presets: P, ctx,
    preset(name, def) { P[name] = def; },
    /* film.json "groove" (times resolved by kit.py build): every part's targets nudge after each of its times (a sharp attack, an
       exponential decay; parts on one target add up), through their groove layers, from one code block (AE gets it as keyframes) */
    groove(tl, cfg) {
      const parts = [], seen = {};
      cfg.parts.forEach((pt, k) => {
        const ids = pt.ids.map(id => {
          const el = document.getElementById(id);
          if (!el) throw new Error(`groove part ${k + 1}: no element with id "${id}"`);
          return (seen[id] = seen[id] || grooveLayer(el, pt.origin)).id;
        });
        let peak = 0;                                    // the values are the PEAK of a pulse: divide by the envelope's own peak
        for (let u = 0; u < 0.3; u += 0.0005) peak = Math.max(peak, Math.exp(-u / pt.decay) * (1 - Math.exp(-(u + 0.004) / pt.attack)));
        const dr = pt.drift ? [+(pt.drift.x || 0), +(pt.drift.y || 0), +(pt.drift.rotate || 0), +(pt.drift.scale || 0), +(pt.drift.period || 3)] : null;
        parts.push({ ids, t: pt.t, s: pt.scale, x: pt.x, y: pt.y, q: pt.squash, r: pt.rotate, d: pt.decay, a: pt.attack, n: +(1 / peak).toFixed(4),
                     ...(dr ? { w: dr, ph: ids.map(id => +(ctx.hash(id) * 6.2832).toFixed(4)) } : {}) });
      });
      const dur = +(cfg.to - cfg.from).toFixed(4);
      ctx.code(String.raw`  // groove (film.json "groove", kit.py build): these elements nudge on the song's grid through their *_groove layers
  const gv = { t: 0 }, GP = ${JSON.stringify(parts)}, GN = {};
  GP.forEach(p => p.ids.forEach(id => { GN[id] = GN[id] || document.getElementById(id); }));
  const genv = (T, t, d, a) => { let lo = 0, hi = T.length - 1, i = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (T[m] <= t) { i = m; lo = m + 1; } else hi = m - 1; }
    let e = 0; for (let j = i; j >= 0 && t - T[j] < d * 7; j--) { const u = t - T[j]; e += Math.exp(-u / d) * (1 - Math.exp(-(u + 0.004) / a)); } return e; };
  tl.fromTo(gv, { t: ${cfg.from} }, { t: ${cfg.to}, duration: ${dur}, ease: "none", onUpdate: () => {
    const t = gv.t, acc = {};
    for (const p of GP) { const e = p.t.length ? genv(p.t, t, p.d, p.a) * p.n : 0;
      p.ids.forEach((id, k) => { const v = acc[id] || (acc[id] = [0, 0, 0, 0, 0]); v[0] += p.s * e; v[1] += p.x * e; v[2] += p.y * e; v[3] += p.q * e; v[4] += p.r * e;
        if (p.w) { const a = 6.2832 * t / p.w[4] + p.ph[k], b = 6.2832 * t / (p.w[4] * 1.37) + p.ph[k] * 1.7;   // drift: always on, two slow waves
          v[1] += p.w[0] * Math.sin(b); v[2] += p.w[1] * Math.sin(a); v[4] += p.w[2] * Math.sin(b + 1); v[0] += p.w[3] * Math.sin(a + 2); } }); }
    for (const id in GN) { const v = acc[id] || [0, 0, 0, 0, 0];
      GN[id].style.transform = "translate(" + v[1].toFixed(2) + "px, " + v[2].toFixed(2) + "px) rotate(" + v[4].toFixed(3) + "deg) scale(" + (1 + v[0] + v[3]).toFixed(4) + ", " + (1 + v[0] - v[3]).toFixed(4) + ")"; } } }, ${cfg.from});`);
    },
    run(tl, name, targets, at, params) {
      const def = P[name]; if (!def) throw new Error("unknown preset " + name);
      ctx.current = name;                              // ctx.asset("x.png") -> the preset folder's assets/x.png, copied into the film by kit.py build
      const ids = Array.isArray(targets) ? targets : [targets];
      const lost = ids.filter(t => typeof t === "string" && !document.getElementById(t));
      // a motion whose target is not on the page did nothing, silently (07/10/2026 test: a "box" dropped its "html", so the bubble letters a
      // motion targeted did not exist): the build stops instead
      if (lost.length) throw new Error(`motion "${name}" at ${at}: no element with id ${lost.map(x => JSON.stringify(x)).join(", ")}`);
      const els = ids.map(t => typeof t === "string" ? document.getElementById(t) : t).filter(Boolean);
      els.forEach(e => ctx.id(e));
      const p = Object.assign({}, def.params || {}, params || {}, { at });
      return def.build(guard(tl), els, p, ctx);
    },
  };
})();
