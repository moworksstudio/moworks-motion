/* Moworks Motion: anime.js (engine/vendor/libs/anime, MIT, as shipped) on the film's clock (12/10/2026, the user: "dùng hết nếu được.
   ưu tiên xài hết của anime.js nếu code đó viết tốt hơn mình"). Kit code, not anime.js code. Load after anime.umd.min.js.

   A film is seeked frame by frame (player, exports, the AE port, the gallery's checks), so anime.js never runs its own loop here
   (engine.useDefaultMainLoop = false, time unit = seconds): every anime.js object is paused and set to (film time - at) by one proxy tween
   on the film's GSAP timeline (sync). anime.js gives random(), irregular() and random stagger orders Math.random when no seed is given:
   objects are made inside seeded(seed, fn), which swaps Math.random for a seeded generator while fn runs, so every load of the film makes
   the same ones; scrambleText always gets a seed.

   AIMKAnime.animate(tl, at, targets, spec, seed, window)   one animation from plain JSON (film.json / preset params). spec = anime.js's own
       parameters (props, duration, delay, ease, loop, alternate, keyframes, composition...) plus these JSON forms, at any depth:
         { "stagger": v, from, grid, axis, ease, jitter, seed, reversed, start, total, use }   -> stagger(v, {...})
         ease: "outExpo" | "inOut(3)" | { "spring": { bounce, duration } | { mass, stiffness, damping, velocity } }
               | { "irregular": [steps, randomness] } | { "steps": n } | { "cubicBezier": [x1, y1, x2, y2] } | { "linear": [...] }
         { "morphTo": "#path", "precision": 0.33 }            a path's d (or a polygon's points) morphing into another shape
         { "scramble": { text, chars, cursor, revealRate, settleRate, settleDuration, perturbation, from, ... } }   for textContent
         "drawable": [start, end] at the top level            the targets become drawable strokes (svg.createDrawable); then "draw"
         "motionPath": "#path" (or [path, offset])            translateX / translateY / rotate along the path (svg.createMotionPath)
         "waapi": true                                        the browser's Web Animations (anime.waapi.animate), same clock
   AIMKAnime.timeline(tl, at, items, defaults, seed, window)  items = [{ targets, ...spec, position }] in one anime.js timeline
   AIMKAnime.layout(tl, at, root, changes, spec, seed, window)  a layout change (FLIP on anime.js): measures the children, applies
       `changes` ([{ sel, style: {...}, add: "class", remove: "class", before / after / append: "#sel" }]), animates each child's transform
       from its old place to its new one
   AIMKAnime.split(el, opts)   anime.js splitText at build time (the preset's build, so the spans are part of the film's HTML)
   AIMKAnime.reverts           in the build's draft: every element an object will touch, as it was before (attributes, text). The bake
                               (build.py BAKE_JS) puts them back before it copies the stage, so the film's HTML is the design, not a frame. */
(function () {
  "use strict";
  var A = window.anime;
  if (!A) { console.warn("[aimk anime] anime.umd.min.js is not loaded"); return; }
  A.engine.useDefaultMainLoop = false;
  A.engine.timeUnit = "s";
  try { A.engine.pauseOnDocumentHidden = false; } catch (e) {}
  var reverts = [];

  function mulberry(a) {
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function seeded(seed, fn) {
    var r = Math.random; Math.random = mulberry((seed >>> 0) || 1);
    try { return fn(); } finally { Math.random = r; }
  }
  function els(targets) {
    var out = [];
    [].concat(targets).forEach(function (t) {
      if (!t) return;
      if (typeof t === "string") Array.prototype.push.apply(out, document.querySelectorAll(t));
      else if (t.nodeType === 1) out.push(t);
      else if (t.length) Array.prototype.push.apply(out, t);
    });
    return out;
  }
  // the elements as they are now (every attribute; the text of a text-only element), put back by revert()
  function snapshot(list) {
    var snaps = els(list).map(function (e) {
      var at = {}; for (var i = 0; i < e.attributes.length; i++) at[e.attributes[i].name] = e.attributes[i].value;
      return { e: e, at: at, text: e.children.length ? null : e.textContent };
    });
    var back = { revert: function () {
      snaps.forEach(function (s) {
        for (var i = s.e.attributes.length - 1; i >= 0; i--) { var n = s.e.attributes[i].name; if (!(n in s.at)) s.e.removeAttribute(n); }
        for (var k in s.at) if (s.e.getAttribute(k) !== s.at[k]) s.e.setAttribute(k, s.at[k]);
        if (s.text !== null && s.e.textContent !== s.text) s.e.textContent = s.text;
      });
    } };
    reverts.push(back);
    return back;
  }
  var EASES = { spring: function (v) { return A.spring(v); }, irregular: function (v) { return A.irregular(v[0], v[1]); },
                steps: function (v) { return A.steps.apply(null, [].concat(v)); }, cubicBezier: function (v) { return A.cubicBezier.apply(null, v); },
                linear: function (v) { return A.linear.apply(null, v); } };
  // the kit's JSON forms -> anime.js values
  function conv(v) {
    if (Array.isArray(v)) return v.map(conv);
    if (!v || typeof v !== "object") return v;
    if ("stagger" in v) {
      var o = {}; for (var k in v) if (k !== "stagger") o[k] = conv(v[k]);
      return A.stagger(conv(v.stagger), o);
    }
    for (var e in EASES) if (e in v && Object.keys(v).length === 1) return EASES[e](v[e]);
    if ("morphTo" in v) return A.svg.morphTo(v.morphTo, v.precision != null ? v.precision : 0.33);
    if ("scramble" in v) return A.scrambleText(Object.assign({ seed: 1 }, v.scramble));
    var r = {}; for (var j in v) r[j] = conv(v[j]); return r;
  }
  function params(spec) {
    var p = {}; for (var k in spec) if (["drawable", "motionPath", "motionPathRotate", "waapi", "position"].indexOf(k) < 0) p[k] = conv(spec[k]);
    if (spec.motionPath) {                                   // "motionPathRotate": false keeps the element upright
      var mp = [].concat(spec.motionPath); Object.assign(p, A.svg.createMotionPath(mp[0], mp[1] || 0));
      if (spec.motionPathRotate === false) delete p.rotate;
    }
    p.autoplay = false;
    return p;
  }
  function targetsOf(targets, spec) {
    if (!spec || !spec.drawable) return targets;
    var d = [].concat(spec.drawable);
    return A.svg.createDrawable(targets, d[0] || 0, d.length > 1 ? d[1] : 0);
  }
  // before `at` the object shows its first frame on every seek too (the build's draft puts a code block's changed text back right after
  // it runs, so a frame before `at` drawn only once at load differed between the draft and the film: gallery bake check, 12/10/2026)
  function preroll(tl, at, fn) { if (at > 0) tl.to({ p: 0 }, { p: 1, duration: at, ease: "none", onUpdate: fn }, 0); }
  // the object follows the film: paused, set to (film time - at) seconds by one proxy tween on `tl`, from `at` for `window` seconds
  function sync(tl, at, obj, win) {
    try { obj.pause(); } catch (e) {}
    var D = win != null ? +win : (isFinite(obj.duration) ? obj.duration : 0), clock = { t: 0 };
    var end = isFinite(obj.duration) ? obj.duration : Infinity;
    obj.seek(0);
    preroll(tl, at, function () { obj.seek(0); });
    tl.fromTo(clock, { t: 0 }, { t: D, duration: Math.max(D, 1e-4), ease: "none", onUpdate: function () { obj.seek(Math.min(clock.t, end)); } }, at);
    return obj;
  }
  // scrambleText draws its random letters each time the scramble steps on, from one generator per tween: what a frame shows depends on
  // the frames drawn before it (a render split across browser pages, a seek back). Here the scramble is made again from its seed at every
  // seek and stepped from 0 to that time, so a frame is a pure function of film time (the gallery's seek and bake checks, 12/10/2026)
  var CHARSETS = { lowercase: "a-z", uppercase: "A-Z", numbers: "0-9", symbols: "!%#_|*+=", braille: "⠀-⣿", blocks: "▀-▟", shades: "░-▓" };
  function expand(s) {                                       // scrambleText's own range syntax ("a-z0-9"), to warm the fonts below
    var out = "";
    for (var i = 0; i < s.length; i++) {
      if (i + 2 < s.length && s[i + 1] === "-" && s.charCodeAt(i) < s.charCodeAt(i + 2)) { for (var c = s.charCodeAt(i); c <= s.charCodeAt(i + 2); c++) out += String.fromCharCode(c); i += 2; }
      else out += s[i];
    }
    return out;
  }
  function scrambleTrack(tl, at, targets, spec, seed, win) {
    var list = els(targets); snapshot(list);
    var sp = spec.textContent.scramble, delays = conv(spec.delay || 0);
    // every letter of the set drawn once, hidden, now: a glyph the text's font lacks (blocks, braille) comes from a fallback font the
    // browser loads on first use, which made the first frame of a fresh page differ (the gallery's bake check, 12/10/2026)
    if (typeof sp.chars === "string" && list.length) {
      var w = document.createElement("span"), set = expand(CHARSETS[sp.chars] || sp.chars);
      w.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap";
      w.textContent = set; list[0].appendChild(w); void w.offsetWidth; w.remove();
    }
    var items = list.map(function (el, i) {
      var orig = el.textContent;
      var d = typeof delays === "function" ? delays(el, i, list) : (+delays || 0);
      var fresh = function () { el.textContent = orig; return A.scrambleText(Object.assign({ seed: (seed || 1) + i }, sp))(el, i, list, null); };
      var D = Math.max(fresh().duration, 1e-6);
      el.textContent = orig;
      return { el: el, d: d, D: D, fresh: fresh, step: 1 / ((sp.settleRate || 30) * D) };
    });
    var total = win != null ? +win : Math.max.apply(null, items.map(function (x) { return x.d + x.D; }).concat([0]));
    function render(t) {
      items.forEach(function (x) {
        var v = Math.max(0, Math.min(1, (t - x.d) / x.D)), m = x.fresh(), s = m.modifier(0);
        for (var p = x.step / 2; p < v; p += x.step) s = m.modifier(p);
        if (v > 0) s = m.modifier(v);
        x.el.textContent = s;
      });
    }
    var clock = { t: 0 };
    render(0);
    preroll(tl, at, function () { render(0); });
    tl.fromTo(clock, { t: 0 }, { t: total, duration: Math.max(total, 1e-4), ease: "none", onUpdate: function () { render(clock.t); } }, at);
    return { duration: total };
  }
  function animate(tl, at, targets, spec, seed, win) {
    spec = spec || {};
    if (spec.textContent && typeof spec.textContent === "object" && spec.textContent.scramble) return scrambleTrack(tl, at, targets, spec, seed, win);
    snapshot(targets);
    return seeded(seed || 1, function () {
      var t = targetsOf(targets, spec), p = params(spec);
      var obj = spec.waapi ? A.waapi.animate(t, p) : A.animate(t, p);
      return sync(tl, at, obj, win);
    });
  }
  function timeline(tl, at, items, defaults, seed, win) {
    (items || []).forEach(function (it) { snapshot(it.targets); });
    return seeded(seed || 1, function () {
      var T = A.createTimeline({ autoplay: false, defaults: conv(defaults || {}) });
      (items || []).forEach(function (it) { T.add(targetsOf(it.targets, it), params(it), it.position != null ? conv(it.position) : undefined); });
      return sync(tl, at, T, win);
    });
  }
  // A layout change, FLIP on anime.js: the children of `root` are measured, the changes applied (the page then holds the new layout for
  // good), and each child is animated by transforms from where it was to where it is (translate + scale, from its top-left corner), with
  // anime.js's easing and stagger. anime.js's own AutoLayout was tried first (12/10/2026) and left out: it is made for live pages, places
  // the elements `position: fixed` + `display: block !important` while it runs (a card's centred number jumped to its corner), hides them
  // when made again, and changes the page in one-way callbacks, so a film could not seek it and the AE port saw no layer at all.
  function layout(tl, at, root, changes, spec, seed, win) {
    var r = typeof root === "string" ? document.querySelector(root) : root;
    snapshot([r].concat(Array.prototype.slice.call(r.querySelectorAll("*"))));
    var kids = Array.prototype.slice.call(r.children), rect = function (e) { return e.getBoundingClientRect(); };
    var A0 = kids.map(rect);
    (changes || []).forEach(function (c) {
      els(c.sel).forEach(function (e) {
        if (c.before || c.after || c.append) { var p0 = e.parentNode, n0 = e.nextSibling; reverts.push({ revert: function () { p0.insertBefore(e, n0); } }); }
        if (c.style) for (var k in c.style) e.style.setProperty(k.replace(/[A-Z]/g, function (m) { return "-" + m.toLowerCase(); }), c.style[k]);
        if (c.add) e.classList.add.apply(e.classList, c.add.split(" "));
        if (c.remove) e.classList.remove.apply(e.classList, c.remove.split(" "));
        if (c.before) { var b = document.querySelector(c.before); b.parentNode.insertBefore(e, b); }
        if (c.after) { var a = document.querySelector(c.after); a.parentNode.insertBefore(e, a.nextSibling); }
        if (c.append) document.querySelector(c.append).appendChild(e);
      });
    });
    var moving = [], from = [];
    kids.forEach(function (e, i) {
      var a = A0[i], b = rect(e);
      if (!b.width || !b.height) return;
      var d = [a.left - b.left, a.top - b.top, a.width / b.width, a.height / b.height];
      if (Math.abs(d[0]) < 0.5 && Math.abs(d[1]) < 0.5 && Math.abs(d[2] - 1) < 1e-3 && Math.abs(d[3] - 1) < 1e-3) return;
      e.style.transformOrigin = "0 0"; moving.push(e); from.push(d);
    });
    if (!moving.length) return { duration: 0 };
    var s = spec || {}, params = { duration: s.duration != null ? s.duration : 0.8, ease: s.ease || "inOutQuart", autoplay: false,
      translateX: function (e, i) { return [from[i][0], 0]; }, translateY: function (e, i) { return [from[i][1], 0]; },
      scaleX: function (e, i) { return [from[i][2], 1]; }, scaleY: function (e, i) { return [from[i][3], 1]; } };
    if (s.delay != null) params.delay = conv(s.delay);
    return seeded(seed || 1, function () { return sync(tl, at, A.animate(moving, conv(params)), win); });
  }
  function split(el, opts) { return A.splitText(el, conv(opts || { chars: true })); }
  window.AIMKAnime = { animate: animate, timeline: timeline, layout: layout, split: split, sync: sync, seeded: seeded, conv: conv, reverts: reverts };
})();
