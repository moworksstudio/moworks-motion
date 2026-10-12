/* motion/talking-layout: the talking-head video moves to one of HyperFrames' talking-head-recut layouts (its layouts/*.html and the
   skill's framing table; adapted there from vtake-skills, MIT; 11/10/2026). Target: the box that holds the footage (its wrapper, never
   the <video> itself). layout: split (video right half; portrait: bottom half) | stack (video top band, card below) | pip (a corner
   pill, top right: card-first) | pip-tl | pip-br | overlay (full frame, a card floats on it) | hide. source: "16:9" | "9:16" (the
   footage, for the pip size). Each use moves it there over `duration` (0 = a cut); several uses in a film follow its cards (one per
   card change). The pip adds HyperFrames' pill chrome (radius 14 px, white ring, shadow); `frame`: "hairline" (double stroke + four
   viewfinder ticks, `accent`) or "polaroid" (white card, caption in `caption`) as a sibling that follows the video (split / stack
   only: the skill skips them on overlay and pip). Canvas 16:9, 9:16 or 4:5 (sizes from the layout files). */
AIMK.preset("motion/talking-layout", { params: { layout: "pip", source: "16:9", duration: 0.6, ease: "power2.inOut", frame: "none", accent: "#2557a7", caption: "" },
  build(tl, els, p, ctx) {
    const W = ctx.W, H = ctx.H, por = H > W, f45 = por && H < W * 1.6, tall = p.source === "9:16";
    const pip = por ? (tall ? [738, 28, 312, 555] : [690, 28, 360, 203]) : (tall ? [1644, 28, 248, 440] : [1432, 28, 460, 258]);
    const R = { split: por ? (f45 ? [0, 675, 1080, 675] : [0, 960, 1080, 960]) : [960, 0, 960, 1080],
                stack: por ? (f45 ? [0, 0, 1080, 593] : [0, 0, 1080, 844]) : [14, 14, 1892, 548],
                pip, "pip-tl": [W - pip[0] - pip[2], pip[1], pip[2], pip[3]], "pip-br": [pip[0], H - pip[1] - pip[3], pip[2], pip[3]],
                overlay: [0, 0, W, H], hide: null }[p.layout];
    if (R === undefined) throw new Error("motion/talking-layout: layout \"" + p.layout + "\"? split | stack | pip | pip-tl | pip-br | overlay | hide");
    const D = p.duration > 0 ? p.duration : 0, isPip = /^pip/.test(p.layout);
    for (const el of els) {
      const prev = document.getElementById(el.getAttribute("data-aimk-deco") || "-");   // the frame of its previous layout leaves
      if (prev) { tl.to(prev, { opacity: 0, duration: Math.max(D, 0.2), ease: p.ease }, p.at); el.removeAttribute("data-aimk-deco"); }
      if (!R) { tl.to(el, { opacity: 0, duration: D || 0.001, ease: p.ease }, p.at); continue; }
      const box = { left: R[0] + "px", top: R[1] + "px", width: R[2] + "px", height: R[3] + "px", opacity: 1 };
      if (D) tl.to(el, Object.assign({ duration: D, ease: p.ease }, box), p.at); else tl.set(el, box, p.at);
      tl.set(el, isPip ? { borderRadius: "14px", overflow: "hidden", boxShadow: "0 24px 60px -20px rgba(0,0,0,.45), 0 0 0 4px rgba(255,255,255,.7), 0 0 0 5px rgba(0,0,0,.18)" }
                       : { borderRadius: "0px", boxShadow: "none" }, p.at);
      if (p.frame === "hairline" || p.frame === "polaroid") {
        const pol = p.frame === "polaroid", par = el.parentElement;
        const deco = ctx.make(par, "div", "frame", { style: { position: "absolute", pointerEvents: "none", zIndex: pol ? "0" : "3", left: R[0] + "px", top: R[1] + "px", width: R[2] + "px", height: R[3] + "px",
          boxShadow: pol ? "0 28px 60px -18px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.12)" : `inset 0 0 0 2px ${p.accent}, inset 0 0 0 6px ${p.accent}22, 0 0 0 1px rgba(0,0,0,.1)`,
          background: pol ? "#fefefe" : "transparent", padding: "0px", boxSizing: "content-box" } });
        if (pol) {                                       // the white card around the photo: 14 px sides, 64 px under it for the caption, washi tape
          Object.assign(deco.style, { left: R[0] - 14 + "px", top: R[1] - 14 + "px", width: R[2] + 28 + "px", height: R[3] + 78 + "px" });
          if (el.style.zIndex === "") el.style.zIndex = "1";
          ctx.make(deco, "div", "cap", { text: p.caption, style: { position: "absolute", bottom: "18px", left: "0px", right: "0px", textAlign: "center", font: '700 32px/1 "Caveat", cursive', color: "#1d1c1a" } });
          ctx.make(deco, "div", "washi", { style: { position: "absolute", top: "-12px", left: "20%", width: "120px", height: "28px", background: "rgba(180,210,235,.85)",
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,.3) 6px 7px)", boxShadow: "0 3px 8px rgba(0,0,0,.15)" } });
        } else for (const [n, s] of [["tl", "top:-3px;left:-3px;border-top:4px solid;border-left:4px solid"], ["tr", "top:-3px;right:-3px;border-top:4px solid;border-right:4px solid"],
                                     ["bl", "bottom:-3px;left:-3px;border-bottom:4px solid;border-left:4px solid"], ["br", "bottom:-3px;right:-3px;border-bottom:4px solid;border-right:4px solid"]]) {
          const t = ctx.make(deco, "span", "tick_" + n); t.style.cssText = `position:absolute;width:24px;height:24px;border-color:${p.accent};` + s;
        }
        tl.fromTo(deco, { opacity: 0 }, { opacity: 1, duration: Math.max(D, 0.3), ease: "power2.out" }, p.at);
        el.setAttribute("data-aimk-deco", deco.id);
      }
    }
  } });
