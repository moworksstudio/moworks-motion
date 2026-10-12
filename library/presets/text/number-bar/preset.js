/* text/number-bar: a colour bar swept in behind the lower part of a key number (a highlighter under "5,5"" or "120 Hz"). The bar is put
   BEFORE the number in the page, so it paints under it everywhere, the After Effects port included (it stacks layers in page order).
   Unlike text/marker-highlight (a marker stroke across a text line) it is a solid block under the glyphs' lower half, sized from the
   number itself. Written for a studio lyric film (08/10/2026). Target: the number's text element.
   params: color, dur, ease, top (0-1 of the text height where the bar starts), height (0-1 of the text height), pad (px each side) */
AIMK.preset("text/number-bar", { params: { color: "#ffd166", dur: 0.32, ease: "expo.inOut", top: 0.5, height: 0.36, pad: 14 },
  build(tl, els, p, ctx) {
    for (const el of els) {
      const w = el.offsetWidth, h = el.offsetHeight, bar = document.createElement("div");
      bar.id = el.id + "_bar";
      Object.assign(bar.style, { position: "absolute", left: (el.offsetLeft - p.pad) + "px", top: (el.offsetTop + h * p.top).toFixed(1) + "px",
        width: (w + 2 * p.pad) + "px", height: (h * p.height).toFixed(1) + "px", background: p.color, transformOrigin: "0% 50%" });
      el.parentElement.insertBefore(bar, el);
      tl.fromTo(bar, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: p.dur, ease: p.ease }, p.at);
    }
  } });
