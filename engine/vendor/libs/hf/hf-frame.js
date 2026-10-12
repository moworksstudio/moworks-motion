/* AI Motion Kit: drive a HyperFrames registry BLOCK (a whole composition page: its own <head>, styles, fixed 1920 x 1080 root, scripts and
   window.__timelines registration) inside a kit film. Kit code, not HyperFrames code. The kit's preset (ctx.hfFrame) puts the block's page, as
   shipped with only its CDN / font / file URLs pointed at the film's own copies, into an <iframe srcdoc> over the target box (scaled to it);
   the page runs isolated (its styles, ids and globals never meet the film's). This file keeps it in step with the film:

   AIMKHFFrame.sync(iframeId, tl, at, duration, o)
     - registers a promise in window.__hf.buildReady (the kit's player waits for it before the first frame) that resolves when the block has
       registered its timeline, its pictures and fonts are in, its own window.__hf.buildReady promises have settled (o.buildReady: the page
       registers some, maybe after its timeline) and its Lottie players have loaded;
     - adds one proxy tween on `tl` from `at` for `duration` s whose onUpdate sets the block to (film time - at): before `at` the block shows
       its own frame 0, after `at + duration` its last frame.

   What a seek does, after the HyperFrames runtime's adapters (the parts these blocks use):
     - GSAP: the block's first window.__timelines timeline is paused and set to that time. A seek backwards replays from 0, so every frame
       is the one a forward play shows (a zero-length set at exactly that time would otherwise differ by direction);
     - three.js / GPU scenes: window.__hfThreeTime / __hfTypegpuTime = that time, then an "hf-seek" CustomEvent { time, waitUntil(promise) };
       promises given to waitUntil go to window.__aimkSeekWaits, which the kit's driver awaits before it captures;
     - Lottie (window.__hfLottie and lottie.getRegisteredAnimations()): goToAndStop on that frame (a loop wraps, a one-shot holds its last);
     - CSS animations / WAAPI: paused at that time;
     - clips ([data-start] elements): visible on [start, start + duration) of the block's time, like a film's clips (the kit's driver
       stays out of block pages: it runs in every frame and would gate them by a clock that never moves);
     - <video> and the kit's picture sequences (<img data-aimk-seq>): the frame at that time, decoded before the capture.
   o.reload: for a block whose timeline callbacks change its page for good (append a line, hide a row), a seek backwards reloads the page
   and plays forward from 0 (window.__aimkSeekWaits holds the seek until it is back). */
(function () {
  "use strict";
  function tlOf(f) {
    var w = f && f.contentWindow, T = w && w.__timelines;
    if (!T) return null;
    var ks = Object.keys(T); return ks.length ? T[ks[0]] : null;
  }
  function lotties(w) {
    var L = [].concat(w.__hfLottie || []);
    try { if (w.lottie && w.lottie.getRegisteredAnimations) w.lottie.getRegisteredAnimations().forEach(function (a) { if (L.indexOf(a) < 0) L.push(a); }); } catch (e) {}
    return L;
  }
  function hostSeek(f, u, D) {
    var w = f.contentWindow, d = f.contentDocument;
    if (!w || !d) return;
    // clips: an element with data-start shows on [start, start + duration) of the block's time (the one that reaches the end keeps its
    // last instant), the runtime's rule, as the kit's driver does for a film; the block's root and <audio> are not clips
    Array.prototype.forEach.call(d.querySelectorAll("[data-start]"), function (e) {
      if (e.tagName === "AUDIO" || e.parentElement === d.body) return;
      var s = +e.getAttribute("data-start") || 0, end = e.hasAttribute("data-duration") ? s + (+e.getAttribute("data-duration")) : Infinity;
      var on = (u >= s - 1e-6 && u < end - 1e-6) || (end >= D - 1e-6 && u >= s - 1e-6);
      e.style.visibility = on ? "visible" : "hidden";
    });
    w.__hfThreeTime = u; w.__hfTypegpuTime = u;
    try {
      w.dispatchEvent(new w.CustomEvent("hf-seek", { detail: { time: u, waitUntil: function (p) { (window.__aimkSeekWaits = window.__aimkSeekWaits || []).push(p); } } }));
    } catch (e) {}
    lotties(w).forEach(function (a) {
      try {
        var n = a.totalFrames || 0, fr = u * (a.frameRate || 30);
        if (n > 0) fr = a.loop ? fr % n : Math.min(fr, n - 1);
        a.goToAndStop(fr, true);
      } catch (e) {}
    });
    if (d.getAnimations) d.getAnimations().forEach(function (a) { try { a.pause(); a.currentTime = u * 1000; } catch (e) {} });
    // <video>: paused at (block time - data-start + data-media-start), a loop wraps, a one-shot holds its last frame; the kit's driver waits
    // for the decoded frame ("seeked", at most 3 s) before it captures
    Array.prototype.forEach.call(d.querySelectorAll("video"), function (v) {
      var tt = Math.max(0, u - (+v.getAttribute("data-start") || 0)) + (+v.getAttribute("data-media-start") || 0);
      if (v.duration && isFinite(v.duration)) tt = v.loop ? tt % v.duration : Math.min(tt, Math.max(0, v.duration - 0.001));
      try { v.pause(); } catch (e) {}
      if (Math.abs(v.currentTime - tt) < 0.0005) return;
      (window.__aimkSeekWaits = window.__aimkSeekWaits || []).push(new Promise(function (res) {
        var done = function () { v.removeEventListener("seeked", done); res(); };
        v.addEventListener("seeked", done); setTimeout(done, 3000);
      }));
      v.currentTime = tt;
    });
    // <img data-aimk-seq="assets/.../f"> (a numbered picture sequence the kit put into a page in place of its <video>: embedded captions,
    // 11/10/2026, the footage and the person cut out of it, so both show the same frame): picture data-aimk-first + floor((time -
    // data-aimk-start) * data-aimk-fps), the frame a video shows then, held at the first / last; its decode() is awaited like a "seeked"
    Array.prototype.forEach.call(d.querySelectorAll("img[data-aimk-seq]"), function (im) {
      var fps = +im.getAttribute("data-aimk-fps") || 30, a = +im.getAttribute("data-aimk-first") || 1, b = +im.getAttribute("data-aimk-last") || a;
      var n = Math.min(b, Math.max(a, a + Math.floor((u - (+im.getAttribute("data-aimk-start") || 0)) * fps + 1e-3)));
      var s = String(n); while (s.length < (+im.getAttribute("data-aimk-digits") || 4)) s = "0" + s;
      var src = im.getAttribute("data-aimk-seq") + s + (im.getAttribute("data-aimk-ext") || ".jpg");
      if (im.getAttribute("src") === src) return;
      im.setAttribute("src", src);
      if (im.decode) (window.__aimkSeekWaits = window.__aimkSeekWaits || []).push(im.decode().catch(function () {}));
    });
  }
  function sync(id, tl, at, duration, o) {
    o = o || {};
    var f = document.getElementById(id), clock = { t: 0 }, last = 0, loading = null, shown = null;
    function whenReady() {                             // the page has registered its timeline and finished setting up
      var t0 = Date.now(), seen = null, same = 0, settled = null;
      return new Promise(function (res) {
        var tick = function () {
          var T = tlOf(f), w = f && f.contentWindow, d = f && f.contentDocument;
          var pics = d ? Array.prototype.every.call(d.images, function (i) { return i.complete; })          // pictures decoded too,
            && Array.prototype.every.call(d.querySelectorAll("video"), function (v) { return v.readyState >= 2 || v.error; }) : false;   // videos able to show a frame
          var br = w && w.__hf && w.__hf.buildReady, nb = br ? Object.keys(br).length : 0;
          var lot = w ? lotties(w) : [], lotOk = lot.every(function (a) { return a.isLoaded; });
          var sig = T ? T.duration() + ":" + T.getChildren(true, true, true).length + ":" + (d ? d.images.length : 0) + ":" + nb + ":" + lot.length : null;
          same = sig && sig === seen ? same + 1 : 0; seen = sig;   // the block may finish setting up (and seek itself to 0) after it registers
          if (sig && settled === null && (nb || !o.buildReady) && same >= 5) {   // its own build holds (mesh, textures, shader warm-up)
            settled = false;
            Promise.all(Object.keys(br || {}).map(function (k) { return Promise.resolve(br[k]).catch(function () {}); })).then(function () { settled = true; });
          }
          if (T && d && pics && lotOk && settled === true && (!d.fonts || d.fonts.status === "loaded")) res();
          else if (Date.now() - t0 > 30000) { console.warn("[aimk hf-frame] " + id + ": the block was not ready in 30 s (missing file?)"); res(); }
          else setTimeout(tick, 30);
        };
        tick();
      });
    }
    function reload() {                                // o.reload: the block's callbacks change its page for good (lines appended, a row
      loading = new Promise(function (res) {           // hidden), so going back loads the page again and plays forward from 0
        var on = function () { f.removeEventListener("load", on); whenReady().then(function () { loading = null; apply(last); res(); }); };
        f.addEventListener("load", on);
        f.setAttribute("srcdoc", f.getAttribute("srcdoc"));
      });
      (window.__aimkSeekWaits = window.__aimkSeekWaits || []).push(loading);   // the kit's driver awaits it before it captures
    }
    var apply = function (t) {
      last = t; if (loading) return;
      var T = tlOf(f); if (!T) return;
      var u = Math.max(0, Math.min(t, T.duration()));
      T.pause();
      if (u < T.totalTime() - 1e-6) {                 // going back
        if (o.reload) { reload(); return; }
        T.totalTime(0, false);                         // replay from 0
      }
      T.totalTime(u, false);
      var r = f.contentDocument && f.contentDocument.querySelector("body > [data-composition-id]");
      var D = (r && +r.getAttribute("data-duration")) || T.duration();   // the block's length (its timeline may end earlier)
      hostSeek(f, Math.max(0, Math.min(t, D)), D);
      // a jump (not the next frame): Chromium draws the first frame after it with the 3D cards' pictures still at the size they had
      // before, a 1 px edge off (carousel/text-circle-3 / -5, gallery check 10/10/2026: 0.18 / 0.26 % of pixels); one more frame before
      // the capture redraws them at the new size. Only under the kit's driver (renders, checks), which awaits these promises
      if (window.__aimk && shown !== null && Math.abs(u - shown) > 0.1)
        (window.__aimkSeekWaits = window.__aimkSeekWaits || []).push(new Promise(function (res) { requestAnimationFrame(function () { res(); }); }));
      shown = u;
    };
    var ready = whenReady().then(function () { apply(last); });
    window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady[id] = ready;
    tl.fromTo(clock, { t: 0 }, { t: duration, duration: duration, ease: "none", onUpdate: function () { apply(clock.t); } }, at);
    return ready;
  }
  window.AIMKHFFrame = { sync: sync };
})();
