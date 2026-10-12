/* AI Motion Kit: run a HyperFrames registry "template" component (a mountable sub-composition: <template><div id="root" data-composition-id
   ...><style/>markup<script/></div></template>) unchanged inside a kit film. Kit code, not HyperFrames code: the component's HTML and script
   are used as shipped; only the plumbing a host would do is done here.

   AIMKHF.mount(container, tl, at, tpl, vars, duration, slots)
     container  an element of the film (the preset's target box); the component's root fills it (position absolute, inset 0, cq units)
     tl         the timeline to put the component's timelines on (the film's; the draft's sub-timeline when the kit builds)
     at         film time of the component's 0
     tpl        the HTML inside the component's <template>
     vars       the variable values (window.__hyperframes.getVariables() returns them; the component falls back to its declared defaults)
     duration   the mount duration (the root's data-duration, which sets the component's envelope)
     slots      { name: "html" }: content for the component's slots, both kinds the registry uses: an element of its own markup with
                data-slot="name" gets that html as its children ("replace the children of this element"), and an inert
                <template data-slot="name"> is put in the container for a component that looks one up in the host document

   What the host plumbing does:
   - ids are made unique per mount (container id + "__" + id), with the matching "#id", url(#id) and getElementById("id") in the CSS / script;
   - data-start / data-duration / data-track-index are removed from the component's elements (the kit's player gates [data-start] elements by
     FILM time, which would hide a component that starts later), the root keeps data-duration = duration;
   - the scripts run with their own `gsap` and `window`: gsap.timeline() makes an unpaused timeline placed on `tl` at `at` (a timeline the
     component later nests in its own is moved there by GSAP; its pause() only sets its time, a paused child would freeze in the film),
     window.__hyperframes.getVariables() returns `vars`, and window.__timelines is a
     private object (the component's registration must not reach the film's player, which drives the film timeline only);
   - <script src> tags are skipped (GSAP is already in the film).
   Mounting again replaces the container's content: the kit's draft mounts too and its DOM is what the film is written from. */
(function () {
  "use strict";
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function mount(container, tl, at, tpl, vars, duration, slots) {
    var P = (container.id || "hf") + "__";
    var ids = [], m, re = /\sid="([^"]+)"/g;
    while ((m = re.exec(tpl))) if (ids.indexOf(m[1]) < 0) ids.push(m[1]);
    ids.sort(function (a, b) { return b.length - a.length; });
    var html = tpl;
    ids.forEach(function (id) {
      var e = esc(id);
      html = html.replace(new RegExp('(\\sid=")' + e + '"', "g"), "$1" + P + id + '"')
                 .replace(new RegExp("#" + e + "(?![\\w-])", "g"), "#" + P + id)
                 .replace(new RegExp("getElementById\\((['\"])" + e + "\\1\\)", "g"), "getElementById($1" + P + id + "$1)");
    });
    var t = document.createElement("template"); t.innerHTML = html;
    var frag = t.content, codes = [];
    Array.prototype.slice.call(frag.querySelectorAll("script")).forEach(function (s) { if (!s.src && s.textContent.trim()) codes.push(s.textContent); s.remove(); });
    Array.prototype.slice.call(frag.querySelectorAll("[data-start],[data-track-index],[data-duration]")).forEach(function (e) {
      e.removeAttribute("data-start"); e.removeAttribute("data-track-index"); e.removeAttribute("data-duration"); });
    var root = frag.firstElementChild;
    while (root && root.tagName === "STYLE") root = root.nextElementSibling;
    if (root) root.setAttribute("data-duration", String(duration));
    slots = slots || {};
    Object.keys(slots).forEach(function (n) {
      Array.prototype.slice.call(frag.querySelectorAll('[data-slot="' + n + '"]')).forEach(function (e) { if (e.tagName !== "TEMPLATE") e.innerHTML = slots[n]; });
    });
    while (container.firstChild) container.removeChild(container.firstChild);
    Object.keys(slots).forEach(function (n) {
      if (document.querySelector('template[data-slot="' + n + '"]')) return;
      var h = document.createElement("template"); h.setAttribute("data-slot", n); h.innerHTML = slots[n]; container.appendChild(h);
    });
    container.appendChild(frag);
    var gs = Object.create(gsap);
    gs.timeline = function (v) {
      var o = Object.assign({}, v || {}); delete o.paused;
      var s = gsap.timeline(o); tl.add(s, at);
      // a paused child timeline is skipped by its parent: the component's own tl.pause(0) / paused(true) (meant for a host that seeks the
      // registered timeline itself) would freeze it in the film, so pausing only sets its time
      s.pause = function (t, sup) { if (t !== undefined && t !== null) s.totalTime(t, sup); return s; };
      s.paused = function (v) { return arguments.length ? s : false; };
      return s;
    };
    var priv = {}, hf = Object.assign({}, window.__hyperframes || {}, { getVariables: function () { return Object.assign({}, vars || {}); } });
    var win = new Proxy(window, {
      get: function (w, k) {
        if (k === "__timelines") return priv;
        if (k === "__hyperframes") return hf;
        var v = Reflect.get(w, k);
        return typeof v === "function" && !/^[A-Z]/.test(String(k)) ? v.bind(w) : v;
      },
      set: function (w, k, v) { if (k === "__timelines") { priv = v || {}; return true; } if (k === "__hyperframes") return true; w[k] = v; return true; },
    });
    var doc = new Proxy(document, {                   // an id built at run time ("row" + n) is looked up with the mount's prefix too
      get: function (d, k) {
        if (k === "getElementById") return function (id) { return d.getElementById(id) || d.getElementById(P + id); };
        if (k === "currentScript") return root;           // "document.currentScript.closest('#root')": the script sat inside the root
        var v = Reflect.get(d, k); return typeof v === "function" ? v.bind(d) : v;
      },
    });
    var run = function () { codes.forEach(function (c) { new Function("gsap", "window", "document", c)(gs, win, doc); }); grade(root, P); };
    window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
    if (window.__aimkTL) {                               // the kit's draft: its fonts are loaded before presets run; its pictures are waited
      run(); window.__hf.buildReady["hf-mount-" + P] = pictures(root); return root;   // for too (the gallery's draft-vs-film check)
    }
    // the film: a component may measure or rasterise its text when it mounts, so its scripts wait for the fonts its markup asks for
    // (and the kit's), and the player waits for them (window.__hf.buildReady); then for the pictures its scripts set (an <img> src given
    // by the script is not in the document when the kit's driver waits for pictures: a busy machine captured compare/grade-split-reveal
    // before its plate was decoded, 12 % of the frame blank, gallery check 10/10/2026)
    void container.offsetHeight;
    var ready = Promise.all(['400 40px "RFlex"', '700 40px "RFlex"', '400 40px "RMono"'].map(function (f) { return document.fonts.load(f).catch(function () {}); }))
      .then(function () { return document.fonts.ready; }).then(run, run).then(function () { return pictures(root); });
    window.__hf.buildReady["hf-mount-" + P] = ready;
    return root;
  }
  function pictures(root) {
    return Promise.all(Array.prototype.map.call(root.querySelectorAll("img"), function (i) {
      if (!i.getAttribute("src")) return null;
      var loaded = i.complete ? Promise.resolve() : new Promise(function (res) { i.addEventListener("load", res, { once: true }); i.addEventListener("error", res, { once: true }); setTimeout(res, 15000); });
      return loaded.then(function () { return i.decode ? i.decode().catch(function () {}) : null; });
    }));
  }
  /* HyperFrames' runtime grades an <img> / <video> that carries data-color-grading with its WebGL shader (presets, curves, effects); the kit
     has no such runtime, so the grade is approximated: an SVG colour matrix (temperature, tint, saturation, vibrance), CSS brightness /
     contrast (exposure, highlights, shadows, whites, blacks) and a vignette overlay. Close in feel, not HyperFrames' pixels
     (compare/grade-split-reveal, 10/10/2026: without it both halves showed the same ungraded picture). Grain and the effects are left out. */
  var BASE = { "deep-contrast": { contrast: 0.12, blacks: -0.06 }, "warm": { temperature: 0.2 }, "cool": { temperature: -0.2 } };
  function grade(root, P) {
    Array.prototype.forEach.call(root.querySelectorAll("img[data-color-grading],video[data-color-grading]"), function (el, n) {
      var g; try { g = JSON.parse(el.getAttribute("data-color-grading")); } catch (e) { return; }
      if (!g || el.getAttribute("data-aimk-graded")) return;
      var k = g.intensity == null ? 1 : +g.intensity, a = {}, b = BASE[g.preset] || {}, adj = g.adjust || {}, det = g.details || {};
      ["exposure", "contrast", "highlights", "shadows", "whites", "blacks", "temperature", "tint", "vibrance", "saturation"].forEach(function (q) { a[q] = ((+adj[q] || 0) + (b[q] || 0)) * k; });
      var s = Math.max(0, 1 + 0.8 * a.saturation + 0.5 * a.vibrance), r = 1 + 0.22 * a.temperature, gg = 1 - 0.12 * a.tint, bl = 1 - 0.22 * a.temperature;
      var L = [0.2126, 0.7152, 0.0722], m = [];           // saturation around luma, then per-channel gains
      [r, gg, bl].forEach(function (gain, row) { for (var c = 0; c < 3; c++) m.push((((1 - s) * L[c]) + (row === c ? s : 0)) * gain); m.push(0, 0); });
      m.push(0, 0, 0, 1, 0);
      var id = "aimk_grade_" + P + n, svg = document.getElementById("aimk-grade-defs");
      if (!svg) { svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.id = "aimk-grade-defs"; svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
                  svg.style.position = "absolute"; document.body.appendChild(svg); }
      if (!document.getElementById(id)) {
        var f = document.createElementNS("http://www.w3.org/2000/svg", "filter"); f.id = id; f.setAttribute("color-interpolation-filters", "sRGB");
        var cm = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix"); cm.setAttribute("type", "matrix"); cm.setAttribute("values", m.map(function (x) { return +x.toFixed(4); }).join(" "));
        f.appendChild(cm); svg.appendChild(f);
      }
      var bright = Math.pow(2, a.exposure) * (1 + 0.1 * a.shadows + 0.06 * a.highlights);
      var con = Math.max(0, 1 + 0.75 * a.contrast + 0.15 * a.whites - 0.25 * a.blacks - 0.08 * a.shadows);
      el.style.filter = "url(#" + id + ") brightness(" + bright.toFixed(3) + ") contrast(" + con.toFixed(3) + ")";
      el.setAttribute("data-aimk-graded", "");
      var v = (+det.vignette || 0) * k;
      if (v > 0 && el.parentNode) {
        var ov = document.createElement("div"), fe = det.vignetteFeather == null ? 0.65 : +det.vignetteFeather;
        ov.setAttribute("data-aimk-vignette", "");
        ov.style.cssText = "position:absolute;pointer-events:none;left:" + el.offsetLeft + "px;top:" + el.offsetTop + "px;width:" + el.offsetWidth + "px;height:" + el.offsetHeight
          + "px;background:radial-gradient(ellipse at center, rgba(0,0,0,0) " + Math.round((1 - fe) * 70) + "%, rgba(0,0,0," + Math.min(0.85, v * 1.6).toFixed(3) + ") 100%)";
        el.parentNode.insertBefore(ov, el.nextSibling);
      }
    });
  }
  window.AIMKHF = { mount: mount };
})();
