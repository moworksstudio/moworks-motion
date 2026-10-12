/* Moworks Motion page driver. The renderer injects it (Playwright add_init_script) before the film's own scripts; films never load it.
   One interface for every tool, whatever the film was written with:
     await window.__aimk.ready      -> { contract, w, h, duration, markers, stage }   or { error }
     await window.__aimk.seek(t)    -> the frame at film second t is drawn
   Contracts
     "hf"   HyperFrames composition (plan option B): a [data-composition-id] root with data-width / data-height / data-duration, a paused GSAP
            timeline in window.__timelines[<composition id>], timed elements with data-start / data-duration (".clip"). Clips are gated by time
            with HyperFrames' rule: visible on [start, start + duration); the clip that reaches the end of the film also owns its last instant.
            The timeline is sought with events on, so count-ups written in onUpdate render.
     "kit"  a film that sets window.ready = true and window.seek(t) (v1 FilmKit films): the driver waits for it and calls window.seek.
   Readiness (both): window.__hf.buildReady promises settled, document.fonts.ready, every <img> decoded, then the contract.
   Hygiene: CSS transitions off (they would run on the wall clock between two seeks). The driver's own waits use the wall clock; film state never does. */
(() => {
  if (window.__aimk) return;
  // an init script runs in every frame: a HyperFrames block's own page inside a film (an <iframe srcdoc>, ctx.hfFrame) is driven by the
  // film through hf-frame.js, so the driver stays out of it (it would gate the block's clips by a clock that never moves)
  try { const fe = window.frameElement; if (fe && (fe.hasAttribute("data-aimk-block") || fe.hasAttribute("srcdoc"))) return; } catch (e) {}
  const A = (window.__aimk = {});

  /* HyperFrames Studio writes its own ease strings into films: "hold", "spring(b)", "wiggle(n,type[,amp])", "custom(M0,0 C x1,y1 x2,y2 1,1)".
     Plain GSAP does not know them, so the same parser is installed here (formulas re-implemented from the HyperFrames 0.8.124 runtime,
     Apache-2.0; HyperFrames itself is not modified). Installed the moment the page sets window.gsap, before any tween is created. */
  function installEases(g) {
    if (!g || g.__aimkEases || !g.parseEase) return;
    const clamp = v => Math.max(0, Math.min(1, v));
    const hold = p => (p >= 1 ? 1 : 0);
    const spring = b => { b = clamp(b); const r = 12 - b * 6, w = Math.PI * 2 * (1 + b * 1.5), n = 1 - Math.exp(-r) * Math.cos(w);
      return p => (p <= 0 ? 0 : p >= 1 ? 1 : (1 - Math.exp(-r * p) * Math.cos(w * p)) / n); };
    const wiggle = (k, type, amp) => { const a = amp ?? (type === "easeInOut" ? 0.08 : type === "uniform" ? 0.14 : type === "anticipate" ? 0.12 : 0.16);
      return p => { if (p <= 0) return 0; if (p >= 1) return 1; const o = type === "easeInOut" ? a * Math.sin(Math.PI * p) : type === "uniform" ? a : a * (1 - p);
        return p + (type === "anticipate" ? -1 : 1) * o * Math.sin(Math.PI * 2 * k * p); }; };
    const bez = (t, a, b) => { const r = 1 - t; return 3 * r * r * t * a + 3 * r * t * t * b + t * t * t; };
    const custom = (x1, y1, x2, y2) => p => { if (p <= 0) return 0; if (p >= 1) return 1; let lo = 0, hi = 1;
      for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; bez(m, x1, x2) < p ? (lo = m) : (hi = m); } return bez((lo + hi) / 2, y1, y2); };
    const N = String.raw`([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)`;
    const reS = /^\s*spring\(\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\)\s*$/, reW = /^\s*wiggle\(\s*(\d+)\s*,\s*(easeOut|easeInOut|anticipate|uniform)\s*(?:,\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)))?\s*\)\s*$/;
    const reC = new RegExp(String.raw`^\s*custom\(\s*M\s*0\s*,\s*0\s+C\s*${N}\s*,\s*${N}\s+${N}\s*,\s*${N}\s+1\s*,\s*1\s*\)\s*$`, "i");
    const parse = s => { if (typeof s !== "string") return null; if (s.trim() === "hold") return hold; let m;
      if ((m = reS.exec(s))) return spring(+m[1]); if ((m = reW.exec(s))) return wiggle(+m[1], m[2], m[3] === undefined ? undefined : +m[3]);
      if ((m = reC.exec(s))) return custom(+m[1], +m[2], +m[3], +m[4]); return null; };
    const orig = g.parseEase;
    g.parseEase = function (s, ...rest) { return parse(s) || orig.call(this, s, ...rest); };
    if (g.registerEase) { g.registerEase("hold", hold); for (const n of ["spring", "wiggle", "custom"]) { const f = p => p; f.config = (...a) => parse(`${n}(${a.join(",")})`) || (p => p); g.registerEase(n, f); } }
    g.__aimkEases = true;
  }
  if (window.gsap) installEases(window.gsap);
  else { let _g; try { Object.defineProperty(window, "gsap", { configurable: true, get() { return _g; }, set(v) { _g = v; try { installEases(v); } catch (e) {} } }); } catch (e) {} }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (fn, ms) => { const t0 = Date.now(); while (!fn()) { if (Date.now() - t0 > ms) return false; await sleep(25); } return true; };
  let done;
  A.ready = new Promise(r => (done = r));
  const fail = msg => { A.error = msg; done({ error: msg }); };

  const settle = i => i.complete ? (i.decode ? i.decode().catch(() => {}) : null) : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); });
  const isBroken = i => { const s = i.getAttribute("src") || ""; return s && !s.startsWith("data:") && i.complete && !i.naturalWidth; };
  A.broken = () => [...document.images].filter(isBroken).map(i => i.getAttribute("src"));
  async function imagesDecoded() {
    await Promise.all([...document.images].map(settle));
    // a picture that failed to load (08/10/2026, test 3: a still on Google Drive came back broken once while it synced) is requested
    // again twice; one still broken after that is listed by A.broken() and the renderer stops instead of writing broken frames
    for (let k = 0; k < 2; k++) {
      const bad = [...document.images].filter(isBroken);
      if (!bad.length) break;
      await sleep(500 * (k + 1));
      await Promise.all(bad.map(i => { const s = i.getAttribute("src"); i.removeAttribute("src"); i.setAttribute("src", s); return Promise.race([settle(i), sleep(15000)]); }));
    }
  }
  async function seekWaits() {                          // promises a HyperFrames block in an iframe handed to its hf-seek waitUntil (hf-frame.js)
    const w = window.__aimkSeekWaits;
    if (w && w.length) await Promise.race([Promise.allSettled(w.splice(0)), sleep(15000)]);   // a block missing a file never settles
  }
  async function buildReady() {
    const b = window.__hf && window.__hf.buildReady;
    if (b) await Promise.allSettled(Object.values(b));
  }

  function hfSetup(root) {
    const id = root.getAttribute("data-composition-id");
    const tls = window.__timelines;
    const tl = tls[id] || tls.root || Object.values(tls)[0];
    const W = +root.getAttribute("data-width") || root.offsetWidth || 1920;
    const H = +root.getAttribute("data-height") || root.offsetHeight || 1080;
    const D = +root.getAttribute("data-duration") || tl.duration();
    // <audio> clips are not pictures: no visibility gate, not a scene marker (markers are the cuts the blur never crosses)
    const clips = [...root.querySelectorAll("[data-start]")].filter(e => e.tagName !== "AUDIO").map(e => ({ e, s: +e.getAttribute("data-start") || 0,
      d: e.hasAttribute("data-duration") ? +e.getAttribute("data-duration") : Infinity, top: e.parentElement === root }));
    tl.pause();
    A.timeline = tl;
    // an off clip is hidden by visibility (HyperFrames' rule) AND opacity 0 through an attribute + !important rule: a child that writes its
    // own visibility: visible (an inline style, motion/tween hide_before, a set replayed by a backwards seek) used to show through a hidden
    // scene (tests 1, 3, 4 of 08/10/2026); a child cannot escape its parent's opacity. The rule beats a tween's inline opacity on the clip.
    const gate = document.createElement("style");
    gate.textContent = "[data-aimk-off]{visibility:hidden!important;opacity:0!important}";
    document.head.appendChild(gate);
    // the clips are gated for t BEFORE the timeline renders t (11/10/2026 test): a timeline set of an inherited property
    // (visibility) records the value it replaces at its first render; rendered while its scene was still gated off it recorded "hidden",
    // and every later backward seek wrote that back (a careers page vanished when stills or the player sought backward)
    A.seek = async t => {
      t = Math.max(0, Math.min(t, D));
      for (const c of clips) {
        const end = c.s + c.d;
        const on = (t >= c.s - 1e-6 && t < end - 1e-6) || (end >= D - 1e-6 && t >= c.s - 1e-6);
        c.e.style.visibility = on ? "visible" : "hidden";
        if (on) c.e.removeAttribute("data-aimk-off"); else c.e.setAttribute("data-aimk-off", "");
      }
      tl.totalTime(Math.min(t, tl.duration()), false);
      await seekWaits();
    };
    if (!root.id) root.id = "__aimk_root";
    const markers = clips.filter(c => c.top).sort((a, b) => a.s - b.s).map(c => [c.e.id || c.e.getAttribute("data-name") || "clip", c.s]);
    return { contract: "hf", w: W, h: H, duration: D, markers, stage: "#" + CSS.escape(root.id), fps: +root.getAttribute("data-fps") || 60 };
  }

  function kitSetup() {
    const st = window.STAGE || {}, el = document.getElementById("stage");
    A.seek = async t => { await window.seek(t); await seekWaits(); };
    return { contract: "kit", w: st.w || (el && el.offsetWidth) || 1920, h: st.h || (el && el.offsetHeight) || 1080,
             duration: window.DURATION || 0, markers: window.MARKERS || [], stage: "#stage" };
  }

  window.addEventListener("load", async () => {
    try {
      const s = document.createElement("style");
      s.textContent = "*,*::before,*::after{transition:none!important;caret-color:transparent!important}";
      document.head.appendChild(s);
      const root = document.querySelector("[data-composition-id]");
      if (root) {
        if (!(await until(() => window.__timelines && Object.keys(window.__timelines).length > 0, 30000)))
          return fail("HyperFrames composition: no window.__timelines registered within 30 s");
        await buildReady(); await document.fonts.ready; await imagesDecoded();
        const info = hfSetup(root);
        await A.seek(0);
        done(info);
      } else {
        if (!(await until(() => window.ready === true, 170000))) return fail("kit film: window.ready never became true (170 s)");
        await document.fonts.ready; await imagesDecoded();
        done(kitSetup());
      }
    } catch (e) { fail(String((e && e.stack) || e)); }
  });
})();
