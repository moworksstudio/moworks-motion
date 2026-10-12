/* AI Motion Kit: audiogram painter for Library/layouts/data/audiogram (after iart-ai youtube-video-skills, audiogram / waveform-render, MIT:
   mirrored frequency bars or an oscilloscope line driven by the sound). Remotion's visualizeAudio is not available in a kit film, so the sound
   is analysed here, once, when the film loads: the file is decoded (OfflineAudioContext.decodeAudioData, the same numbers every time), and for
   every frame (fps) the bars get the magnitude of `bands` log-spaced frequencies (fLo..fHi Hz, Hann window of 2048 samples) and the line gets
   `points` samples of the waveform around that moment. The table is ready before the first frame (window.__hf.buildReady, which the kit's
   player waits for); the proxy tween on the film timeline then only reads it.

   AIMKAudiogram.attach(tl, at, o)  o: { id (container id), src, mode: "bars" | "wave", bands, points, fps, duration, offset (s into the
   sound at `at`), boost, smooth (frames averaged, 1 = off), fLo, fHi, mirror } */
(function () {
  "use strict";
  function analyse(o) {
    return fetch(o.src).then(function (r) { if (!r.ok) throw new Error("audiogram: " + o.src + " " + r.status); return r.arrayBuffer(); })
      .then(function (buf) { return new OfflineAudioContext(1, 1, 44100).decodeAudioData(buf); })
      .then(function (ab) {
        var sr = ab.sampleRate, ch = ab.getChannelData(0), N = 2048, half = N >> 1, n = Math.max(1, Math.ceil(o.duration * o.fps)), out = [];
        var win = new Float32Array(N); for (var i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
        var freqs = []; for (var b = 0; b < o.bands; b++) freqs.push(o.fLo * Math.pow(o.fHi / o.fLo, b / Math.max(1, o.bands - 1)));
        for (var f = 0; f < n; f++) {
          var c = Math.round((o.offset + f / o.fps) * sr), row;
          if (o.mode === "wave") {
            row = []; var span = Math.round(sr / o.fps);
            for (var k = 0; k < o.points; k++) { var j = c - (span >> 1) + Math.round(k * span / Math.max(1, o.points - 1)); row.push(j >= 0 && j < ch.length ? ch[j] : 0); }
          } else {
            row = freqs.map(function (fr) {
              var re = 0, im = 0, w = 2 * Math.PI * fr / sr;
              for (var m = 0; m < N; m++) { var j = c - half + m, x = j >= 0 && j < ch.length ? ch[j] * win[m] : 0; re += x * Math.cos(w * m); im -= x * Math.sin(w * m); }
              return Math.sqrt(re * re + im * im) / (N / 4);
            });
          }
          out.push(row);
        }
        if (o.smooth > 1) out = out.map(function (r, f) {
          return r.map(function (v, k) { var s = 0, c2 = 0; for (var d = -(o.smooth >> 1); d <= (o.smooth >> 1); d++) { var g = out[f + d]; if (g) { s += g[k]; c2++; } } return s / c2; });
        });
        return out;
      });
  }
  function attach(tl, at, o) {
    var table = null, box = document.getElementById(o.id), clock = { t: 0 };
    var draw = function (t) {
      if (!table || !box) return;
      var row = table[Math.max(0, Math.min(table.length - 1, Math.floor(t * o.fps + 1e-6)))];
      if (o.mode === "wave") {
        var pl = box.querySelector("polyline"), W = +pl.getAttribute("data-w"), H = +pl.getAttribute("data-h");
        pl.setAttribute("points", row.map(function (a, i) { return (i * W / Math.max(1, row.length - 1)).toFixed(1) + "," + (H / 2 + Math.max(-1, Math.min(1, a * o.boost)) * H / 2).toFixed(1); }).join(" "));
      } else {
        var vals = o.mirror ? row.slice().reverse().concat(row) : row;          // mirrored: lows in the middle, splaying outward
        var bars = box.querySelectorAll("[data-bar]"), H2 = box.clientHeight;
        for (var i = 0; i < bars.length; i++) bars[i].style.height = Math.max(o.minBar, Math.min(1, (vals[i] || 0) * o.boost) * H2).toFixed(1) + "px";
      }
    };
    var ready = analyse(o).then(function (tb) { table = tb; draw(clock.t); }, function (e) { console.warn(String(e)); });
    window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady["audiogram-" + o.id] = ready;
    tl.fromTo(clock, { t: 0 }, { t: o.duration, duration: o.duration, ease: "none", onUpdate: function () { draw(clock.t); } }, at);
    return ready;
  }
  window.AIMKAudiogram = { attach: attach };
})();
