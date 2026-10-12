/* colorama-wipe drawer: the per-frame painter of HyperFrames registry component colorama-wipe (heygen-com/hyperframes @ 0ca6947,
   registry/components/colorama-wipe, Apache-2.0), reshaped for AI Motion Kit films (Library/presets/text/colorama-wipe):
   the kit's preset builds the stage and its two canvases in the film's DOM (so they are saved with the film) and measures the text once in the
   draft; this file only paints into those canvases. AIMKColorama.drawer(g) -> draw(lt), lt = seconds since the wipe's start. The text is
   rasterised on the first draw, again until the film's font reports loaded. Everything else (mask, compound blur, Colorama map, noise, crisp copy) is the
   source's code. Deterministic: no Math.random, no clocks. */
(function () {
  "use strict";
  var LEVELS = [0.04, 0.14, 0.3, 0.55, 1.0];
  function lut(cycle) {
    var out = new Uint8ClampedArray(256 * 3);
    for (var i = 0; i < 256; i++) {
      var v = i / 255, k = 0;
      while (k < cycle.length - 2 && cycle[k + 1][0] < v) k++;
      var a = cycle[k][0], ca = cycle[k][1], b = cycle[k + 1][0], cb = cycle[k + 1][1];
      var u = Math.min(1, Math.max(0, (v - a) / (b - a)));
      for (var c = 0; c < 3; c++) out[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * u;
    }
    return out;
  }
  function hash(x, y, f) {
    var h = (x * 374761393 + y * 668265263 + f * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function mk(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  /* g: { fx, crisp (canvas ids), text, font, size, ink, padX, padY, ew, eh, BW, BH, FW, FH, measured, o: options } */
  function drawer(g) {
    var o = g.o, ease = gsap.parseEase("power2.inOut"), S = o.scale, FW = g.FW, FH = g.FH, size = g.size;
    var F = o.feather * size, MAXB = o.blur * size, TILT = (o.tilt * Math.PI) / 180;
    var tx0 = g.padX + (g.ew - g.measured) / 2, tw = g.measured, ty = g.padY + g.eh / 2, baseline = 0.04 * size;
    var x0 = tx0, cx = tx0 + tw / 2;
    var fx = null, fctx = null, crisp = null, cctx = null, textC = null, tctx, maskedC, mctx, blurC, bctx, mapC, mapctx;
    var LUT = lut(o.cycle), dxT = Math.cos(TILT), dyT = Math.sin(TILT), total = o.in + o.hold + o.out;
    function init() {
      fx = document.getElementById(g.fx); crisp = document.getElementById(g.crisp);
      fctx = fx.getContext("2d", { willReadFrequently: true }); cctx = crisp.getContext("2d");
      textC = mk(FW, FH); tctx = textC.getContext("2d");
      maskedC = mk(FW, FH); mctx = maskedC.getContext("2d");
      blurC = LEVELS.map(function () { return mk(FW, FH); });
      bctx = blurC.map(function (c) { return c.getContext("2d", { willReadFrequently: true }); });
      mapC = mk(FW, FH); mapctx = mapC.getContext("2d", { willReadFrequently: true });
    }
    var rasterOK = false;            // the text raster is redone until the film's font has loaded (a film may seek before its fonts are in)
    function raster() {
      tctx.clearRect(0, 0, FW, FH); tctx.fillStyle = "#fff";
      tctx.font = g.font.replace(g.size + "px", size * S + "px");
      tctx.textBaseline = "middle"; tctx.textAlign = "center";
      tctx.fillText(g.text, cx * S, (ty + baseline) * S);
      rasterOK = !document.fonts || document.fonts.check(g.font, g.text);
    }
    function tilted(ctx, fxp, len, c0, c1) {
      var gx = fxp * S, gy = ty * S;
      var gr = ctx.createLinearGradient(gx, gy, gx + dxT * len * S, gy + dyT * len * S);
      gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr;
    }
    return function draw(lt) {
      if (!fx) init();
      if (!rasterOK) raster();
      if (lt < 0 || lt > total) { fctx.clearRect(0, 0, FW, FH); cctx.clearRect(0, 0, crisp.width, crisp.height); return; }
      var pIn = Math.min(1, Math.max(0, lt / o.in)), pOut = Math.min(1, Math.max(0, (lt - o.in - o.hold) / o.out));
      var front = x0 - F * 0.4 + (tw + F * 1.7) * ease(pIn), back = x0 - F * 0.7 + (tw + F * 1.5) * ease(pOut);
      mctx.clearRect(0, 0, FW, FH); mctx.globalCompositeOperation = "source-over"; mctx.drawImage(textC, 0, 0);
      mctx.globalCompositeOperation = "destination-in";
      mctx.fillStyle = tilted(mctx, front - F, F, "rgba(0,0,0,1)", "rgba(0,0,0,0)"); mctx.fillRect(0, 0, FW, FH);
      if (pOut > 0) { mctx.fillStyle = tilted(mctx, back, F, "rgba(0,0,0,0)", "rgba(0,0,0,1)"); mctx.fillRect(0, 0, FW, FH); }
      mctx.globalCompositeOperation = "source-over";
      for (var i = 0; i < LEVELS.length; i++) {
        var c = bctx[i]; c.clearRect(0, 0, FW, FH); c.filter = "blur(" + MAXB * LEVELS[i] * S + "px)"; c.drawImage(maskedC, 0, 0); c.filter = "none";
      }
      var trail = tw * o.trail;
      mapctx.fillStyle = tilted(mapctx, front - trail - F, trail + F * 0.8, "#000", "#fff"); mapctx.fillRect(0, 0, FW, FH);
      if (pOut > 0) {
        mapctx.globalCompositeOperation = "lighter";
        mapctx.fillStyle = tilted(mapctx, back - F * 0.2, trail + F * 0.2, "#fff", "#000"); mapctx.fillRect(0, 0, FW, FH);
        mapctx.globalCompositeOperation = "source-over";
      }
      var map = mapctx.getImageData(0, 0, FW, FH).data, lv = bctx.map(function (c) { return c.getImageData(0, 0, FW, FH).data; });
      var out = fctx.createImageData(FW, FH), od = out.data, n = LEVELS.length - 1, frame = Math.round(lt * 30);
      var FS = F * S, frontS = front * S, backS = back * S, tyS = ty * S;
      for (var p = 0, y = 0; y < FH; y++) {
        var lean = (y / FH - 0.5) * 0.5, yT = (y - tyS) * dyT;
        for (var x = 0; x < FW; x++, p += 4) {
          var sF = (x - frontS) * dxT + yT, white = (-sF - FS * 0.6) / (FS * 0.5);
          white = white < 0 ? 0 : white > 1 ? 1 : white;
          if (pOut > 0) { var sB = (x - backS) * dxT + yT, keep = (sB - FS * 0.7) / (FS * 0.6); keep = keep < 0 ? 0 : keep > 1 ? 1 : keep; white *= keep; }
          var m = map[p] / 255 + lean; m = m < 0 ? 0 : m > 1 ? 1 : m;
          var f = m * n, li = Math.min(n - 1, Math.floor(f)), u = f - li;
          var cov = (lv[li][p + 3] * (1 - u) + lv[li + 1][p + 3] * u) / 255;
          if (cov < 0.002) { od[p + 3] = 0; continue; }
          var lum = cov + (hash(x, y, frame) - 0.5) * o.noise, idx = lum <= 0 ? 0 : lum >= 1 ? 255 : (lum * 255) | 0, gg = white >= 1 ? 255 : idx;
          od[p] = LUT[idx * 3] + (gg - LUT[idx * 3]) * white;
          od[p + 1] = LUT[idx * 3 + 1] + (gg - LUT[idx * 3 + 1]) * white;
          od[p + 2] = LUT[idx * 3 + 2] + (gg - LUT[idx * 3 + 2]) * white;
          od[p + 3] = white >= 1 ? Math.min(255, cov * 255) : Math.min(255, cov * 255 * 4);
        }
      }
      fctx.putImageData(out, 0, 0);
      cctx.clearRect(0, 0, crisp.width, crisp.height);
      if (o.crisp) {
        var opIn = Math.min(1, Math.max(0, (lt - o.in * 0.95) / 0.35)), opOut = 1 - Math.min(1, Math.max(0, pOut / 0.35));
        cctx.globalAlpha = opIn * opOut;
        if (cctx.globalAlpha > 0) { cctx.fillStyle = g.ink || "#fff"; cctx.font = g.font; cctx.textBaseline = "middle"; cctx.textAlign = "center"; cctx.fillText(g.text, cx, ty + baseline); }
        cctx.globalAlpha = 1;
      }
    };
  }
  window.AIMKColorama = { drawer: drawer };
})();
