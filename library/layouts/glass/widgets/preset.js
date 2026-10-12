/* glass/widgets: seven liquid-glass widgets rise from below the frame over a moving silk-ribbon backdrop (three stat cards, a showcase card,
   three pill chips, staggered power3.out), count up (temperature, battery, steps ring), fill bars, pulse dots, bump, then drop out (6.74 s).
   Port of HyperFrames registry block liquid-glass-widgets. BLOCK: the target is an empty box (designed for a 1920 x 1080 frame).
   The glass: the source's lib/liquid-glass.iife.js is WebGPU only (no WebGPU in the kit's Chromium); its passes are ported 1:1 to GLSL on
   three.js (GLASS below, same as glass/notifications). Backdrop, glass panels, counters and the status swap are one pure function of time
   (ctx.code); the HTML widgets on top move with literal tweens. */
{   /* block scope: SILK / GLASS stay private to this preset (all presets of a film share one <script>) */
AIMK.preset("glass/widgets", {
  params: {
    temp_label: "Nhiệt độ", temp_from: 21, temp_to: 25, temp_unit: "°", temp_meter: "76%",
    battery_label: "Pin", battery_from: 87, battery_to: 91, battery_unit: "%",
    steps_label: "Bước chân", steps_from: 8.2, steps_to: 9.1, steps_suffix: "K",
    logo: "hyperframes-logo-dark.svg", title: "Quy trình xem trước", desc: "Viết HTML, xuất video. Ra phim nhanh như viết mã.",
    status: "Đang mã hóa khung hình", status_done: "Bản xem trước đã sẵn sàng", progress: "92%",
    pills: [{ label: "Đã kết nối", dot: "#4ade80" }, { label: "Bluetooth", dot: "#60a5fa" }, { label: "Tập trung", dot: "#a78bfa" }],
    duration: 8,
  },
  build(tl, els, p, ctx) {
    const J = JSON.stringify, t0 = p.at;
    const src = f => (/[\/:]/.test(f) ? f : ctx.asset(f));
    ctx.css("glass/widgets", `
.aimk-lgw { position: absolute; inset: 0; overflow: hidden; z-index: 0; background: #0a0218; font-family: inherit; }
.aimk-lgw .lgw-gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; z-index: 0; }
.aimk-lgw .text-overlay { position: absolute; z-index: 2; pointer-events: none; }
.aimk-lgw .stat-text { width: 220px; height: 220px; position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 22px; border-radius: 28px;
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.06) 46%, rgba(255, 255, 255, 0.16)), linear-gradient(180deg, rgba(9, 18, 31, 0.2), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.36); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -18px 38px rgba(255, 255, 255, 0.08); overflow: hidden; text-shadow: 0 2px 16px rgba(0, 0, 0, 0.38); }
.aimk-lgw .stat-text::before, .aimk-lgw .showcase-text::before, .aimk-lgw .pill-text::before { content: ""; position: absolute; inset: 1px; border-radius: inherit; pointer-events: none;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.44), transparent 28%, transparent 66%, rgba(255, 255, 255, 0.2)); opacity: 0.32; mix-blend-mode: screen; }
.aimk-lgw .stat-label { position: relative; font-size: 14px; font-weight: 650; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; }
.aimk-lgw .stat-value { position: relative; font-size: 52px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; line-height: 1; }
.aimk-lgw .stat-unit { position: relative; font-size: 24px; font-weight: 500; color: #fff; }
.aimk-lgw .mini-meter { position: relative; width: 140px; height: 6px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.28); }
.aimk-lgw .mini-meter-fill { width: 0%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #06e3fa, #4fdb5e); box-shadow: 0 0 12px rgba(79, 219, 94, 0.55); }
.aimk-lgw .battery-shell { position: relative; width: 118px; height: 40px; padding: 4px; border: 2px solid rgba(255, 255, 255, 0.66); border-radius: 12px; }
.aimk-lgw .battery-shell::after { content: ""; position: absolute; top: 12px; right: -9px; width: 5px; height: 14px; border-radius: 0 5px 5px 0; background: rgba(255, 255, 255, 0.66); }
.aimk-lgw .battery-fill { width: 72%; height: 100%; border-radius: 8px; background: linear-gradient(90deg, #4ade80, #06e3fa); box-shadow: 0 0 18px rgba(74, 222, 128, 0.45); }
.aimk-lgw .steps-ring { width: 106px; height: 106px; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(#a78bfa 0deg, #06e3fa 180deg, rgba(255, 255, 255, 0.18) 180deg); }
.aimk-lgw .steps-ring-inner { width: 78px; height: 78px; display: grid; place-items: center; border-radius: 50%; background: rgba(7, 10, 18, 0.36);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -8px 20px rgba(0, 0, 0, 0.14); color: #fff; font-size: 30px; font-weight: 800; font-variant-numeric: tabular-nums; }
.aimk-lgw .showcase-text { width: 500px; height: 320px; position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 32px; border-radius: 28px;
  background: radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.38), transparent 24%), linear-gradient(135deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.07) 52%, rgba(255, 255, 255, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.38); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -24px 48px rgba(255, 255, 255, 0.08); overflow: hidden; text-shadow: 0 2px 18px rgba(0, 0, 0, 0.4); }
.aimk-lgw .showcase-icon { position: relative; width: 168px; height: 52px; display: flex; align-items: center; justify-content: center; }
.aimk-lgw .showcase-logo { width: 150px; height: auto; display: block; }
.aimk-lgw .showcase-title { position: relative; font-size: 28px; font-weight: 700; color: #fff; text-align: center; line-height: 1.2; }
.aimk-lgw .showcase-desc { position: relative; font-size: 15px; font-weight: 500; color: #fff; text-align: center; line-height: 1.5; max-width: 380px; }
.aimk-lgw .showcase-status { position: relative; display: flex; align-items: center; gap: 8px; color: #fff; font-size: 14px; font-weight: 700; }
.aimk-lgw .showcase-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 14px rgba(74, 222, 128, 0.7); }
.aimk-lgw .showcase-progress { position: relative; width: 300px; height: 7px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.18); }
.aimk-lgw .showcase-progress-fill { width: 18%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #06e3fa, #4fdb5e); }
.aimk-lgw .pill-text { width: 130px; height: 36px; position: absolute; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 40px;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.1)); border: 1px solid rgba(255, 255, 255, 0.34); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48); overflow: hidden; }
.aimk-lgw .pill-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.aimk-lgw .pill-label { position: relative; font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; }`);
    const STAT = [[200, 300], [460, 300], [720, 300]], SHOW = [1100, 380], PILL = [[300, 720], [460, 720], [620, 720]];
    for (const slot of els) {
      const W = Math.round(slot.offsetWidth || ctx.W), H = Math.round(slot.offsetHeight || ctx.H);
      const wrap = ctx.make(slot, "div", "lgw", { cls: "aimk-lgw" });
      const gl = ctx.make(wrap, "canvas", "gl", { cls: "lgw-gl", attrs: { width: W, height: H } });
      const at = (el, xy) => { el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; return el; };
      const s1 = at(ctx.make(wrap, "div", "stat1", { cls: "text-overlay stat-text" }), STAT[0]);
      ctx.make(s1, "span", "l1", { cls: "stat-label", text: p.temp_label });
      const v1w = ctx.make(s1, "span", "v1w", { cls: "stat-value" });
      const temp = ctx.make(v1w, "span", "temp", { text: String(p.temp_from) }); ctx.make(v1w, "span", "u1", { cls: "stat-unit", text: p.temp_unit });
      const meter = ctx.make(ctx.make(s1, "div", "meter", { cls: "mini-meter" }), "div", "mfill", { cls: "mini-meter-fill" });
      const s2 = at(ctx.make(wrap, "div", "stat2", { cls: "text-overlay stat-text" }), STAT[1]);
      ctx.make(s2, "span", "l2", { cls: "stat-label", text: p.battery_label });
      const bfill = ctx.make(ctx.make(s2, "div", "shell", { cls: "battery-shell" }), "div", "bfill", { cls: "battery-fill" });
      const v2w = ctx.make(s2, "span", "v2w", { cls: "stat-value" });
      const batt = ctx.make(v2w, "span", "batt", { text: String(p.battery_from) }); ctx.make(v2w, "span", "u2", { cls: "stat-unit", text: p.battery_unit });
      const s3 = at(ctx.make(wrap, "div", "stat3", { cls: "text-overlay stat-text" }), STAT[2]);
      ctx.make(s3, "span", "l3", { cls: "stat-label", text: p.steps_label });
      const ring = ctx.make(s3, "div", "ring", { cls: "steps-ring" });
      const steps = ctx.make(ring, "div", "steps", { cls: "steps-ring-inner", text: Number(p.steps_from).toFixed(1) + p.steps_suffix });
      const sc = at(ctx.make(wrap, "div", "show", { cls: "text-overlay showcase-text" }), SHOW);
      ctx.make(ctx.make(sc, "div", "icon", { cls: "showcase-icon" }), "img", "logo", { cls: "showcase-logo", attrs: { src: src(p.logo), alt: "" } });
      ctx.make(sc, "div", "title", { cls: "showcase-title", text: p.title });
      ctx.make(sc, "div", "desc", { cls: "showcase-desc", text: p.desc });
      const stw = ctx.make(sc, "div", "stw", { cls: "showcase-status" });
      const sdot = ctx.make(stw, "span", "sdot", { cls: "showcase-dot" });
      const stat = ctx.make(stw, "span", "status", { text: p.status });
      const prog = ctx.make(ctx.make(sc, "div", "prog", { cls: "showcase-progress" }), "div", "pfill", { cls: "showcase-progress-fill" });
      const pills = p.pills.slice(0, 3).map((q, i) => { const e = at(ctx.make(wrap, "div", "pill" + (i + 1), { cls: "text-overlay pill-text" }), PILL[i]);
        const d = ctx.make(e, "span", "dot", { cls: "pill-dot", style: { background: q.dot } }); ctx.make(e, "span", "lab", { cls: "pill-label", text: q.label }); return [e, d]; });
      const stats = [s1, s2, s3];
      /* the HTML widgets: the source's tweens (gsap.set start states -> fromTo; "-=12" / "+=760" written as values; staggers as single tweens) */
      stats.forEach((e, i) => tl.fromTo(e, { y: 860 }, { y: 0, duration: 0.46, ease: "power3.out" }, t0 + 0.12 + i * 0.12));
      tl.fromTo(sc, { y: 780 }, { y: 0, duration: 0.5, ease: "power3.out" }, t0 + 0.5);
      pills.forEach((q, i) => tl.fromTo(q[0], { y: 440 }, { y: 0, duration: 0.32, ease: "power3.out" }, t0 + 0.9 + i * 0.1));
      tl.fromTo(meter, { width: "0%" }, { width: p.temp_meter, duration: 1.7, ease: "power2.out" }, t0 + 0.9);
      tl.fromTo(bfill, { width: "72%" }, { width: "91%", duration: 2.4, ease: "power2.out" }, t0 + 1.05);
      tl.fromTo(prog, { width: "18%" }, { width: p.progress, duration: 4.1, ease: "none" }, t0 + 1.2);
      tl.fromTo(sdot, { scale: 1 }, { scale: 1.5, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 7 }, t0 + 1.4);
      tl.fromTo(sc, { y: 0 }, { y: -10, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, t0 + 5.2);
      pills.forEach((q, i) => tl.fromTo(q[1], { scale: 1 }, { scale: 1.55, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 3 }, t0 + 2.2 + i * 0.12));
      stats.forEach(e => tl.fromTo(e, { y: 0 }, { y: -12, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, t0 + 5.7));
      [...stats, sc, ...pills.map(q => q[0])].forEach(e => tl.to(e, { y: 760, duration: 0.42, ease: "power2.in" }, t0 + 6.74));
      const C = { W, H, at: t0, dur: p.duration, gl: gl.id, temp: temp.id, batt: batt.id, steps: steps.id, ring: ring.id, status: stat.id,
        texts: [p.status, p.status_done], counters: [p.temp_from, p.temp_to, p.battery_from, p.battery_to, p.steps_from, p.steps_to], suffix: p.steps_suffix,
        glass: { blurAmount: 0.42, refraction: 0.82, cornerRadius: 28, zRadius: 46, specular: 0.34, fresnel: 1.25, edgeHighlight: 0.26, chromAberration: 0.08,
                 shadowOpacity: 0, shadowSpread: 0, shadowOffsetY: 0, saturation: 0.38, distortion: 0, opacity: 1, tintStrength: 0, brightness: 0, bevelMode: 0 } };
      ctx.code(`  /* glass/widgets #${wrap.id}: silk shader backdrop + seven liquid-glass panels (WebGL port of the HF WebGPU glass) + counters; pure function of time */
  const C = ${J(C)}, THREE = window.THREE;
${GLASS}
  const glc = document.getElementById(C.gl);
  const renderer = new THREE.WebGLRenderer({ canvas: glc, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(C.W, C.H, false);
  const G = makeGlass(THREE, renderer, C.W, C.H);
  const bgU = { uTime: { value: 0 } };
  const bgScene = new THREE.Scene(), bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: bgU, fragmentShader: ${J(SILK)},
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }" })));
  const e3o = gsap.parseEase("power3.out"), e2o = gsap.parseEase("power2.out"), e2i = gsap.parseEase("power2.in");
  const c01 = v => Math.max(0, Math.min(1, v)), seg = (t, a, d, e) => e(c01((t - a) / d));
  const yoyo = (t, a, d, e) => { const k = t - a; return k <= 0 || k >= 2 * d ? 0 : k < d ? e(k / d) : e(1 - (k - d) / d); };
  /* panel tops from time (source tweens on #glass-*: rise from 1160, bumps with yoyo, +760 out at 6.74) */
  const rise = (t, a, d, rest) => 1160 + (rest - 1160) * seg(t, a, d, e3o) + 760 * seg(t, 6.74, 0.42, e2i);
  const cfgPill = Object.assign({}, C.glass, { cornerRadius: 40 });
  const panels = t => [
    [200, rise(t, 0.12, 0.46, 300) - 12 * yoyo(t, 5.7, 0.2, e2o), 220, 220, C.glass], [460, rise(t, 0.24, 0.46, 300) - 12 * yoyo(t, 5.7, 0.2, e2o), 220, 220, C.glass],
    [720, rise(t, 0.36, 0.46, 300) - 12 * yoyo(t, 5.7, 0.2, e2o), 220, 220, C.glass], [1100, rise(t, 0.5, 0.5, 380) - 10 * yoyo(t, 5.2, 0.2, e2o), 500, 320, C.glass],
    [300, rise(t, 0.9, 0.32, 720), 130, 36, cfgPill], [460, rise(t, 1.0, 0.32, 720), 130, 36, cfgPill], [620, rise(t, 1.1, 0.32, 720), 130, 36, cfgPill]];
  const el = id => document.getElementById(id), temp = el(C.temp), batt = el(C.batt), steps = el(C.steps), ring = el(C.ring), status = el(C.status);
  const k = C.counters, put = (e, s) => { if (e.textContent !== s) e.textContent = s; };
  let lastRing = "";
  const draw = t => {
    /* counters: the source's onUpdate formulas (power2.out), from time */
    put(temp, String(Math.round(k[0] + (k[1] - k[0]) * seg(t, 0.9, 2.2, e2o))));
    put(batt, String(Math.round(k[2] + (k[3] - k[2]) * seg(t, 1.05, 2.4, e2o))));
    const sv = k[4] + (k[5] - k[4]) * seg(t, 1.2, 2.6, e2o), deg = t < 1.2 ? 180 : Math.round(sv * 31.4);
    put(steps, sv.toFixed(1) + C.suffix);
    const rb = "conic-gradient(#a78bfa 0deg, #06e3fa " + deg + "deg, rgba(255, 255, 255, 0.18) " + deg + "deg)"; if (rb !== lastRing) { lastRing = rb; ring.style.background = rb; }
    put(status, C.texts[t >= 5.2 ? 1 : 0]);                        /* source: tl.call at 5.2 */
    bgU.uTime.value = t;
    renderer.setRenderTarget(G.comp); renderer.render(bgScene, bgCam);
    for (const b of panels(t)) G.panel(b[4], b[0], b[1], b[2], b[3], 0.025);   /* + the panel's own 2.5 % white background */
    G.present(); };
  const P = { t: 0 };
  tl.fromTo(P, { t: 0 }, { t: C.dur, duration: C.dur, ease: "none", onUpdate: () => draw(P.t) }, C.at);
  /* a fresh kit Chromium loses its first WebGL context ~0.15 s after creation and restores it ~1 s later: wait for it, redraw on restore */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  glc.addEventListener("webglcontextrestored", () => draw(P.t));
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady[${J("aimk-" + wrap.id)}] = wait(600).then(async () => { if (renderer.getContext().isContextLost())
    await Promise.race([new Promise(r => glc.addEventListener("webglcontextrestored", () => setTimeout(r, 0), { once: true })), wait(20000)]); draw(P.t); });
  draw(P.t);`);
    }
  },
});

/* the source's backdrop fragment shader (simplex-noise silk ribbons), verbatim */
const SILK = [
  "precision highp float;", "varying vec2 vUv;", "uniform float uTime;",
  "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}", "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}",
  "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}", "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
  "float snoise(vec3 v){",
  "  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);",
  "  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);", "  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;",
  "  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);", "  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;", "  i=mod289(i);",
  "  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));",
  "  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;", "  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);",
  "  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);", "  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);",
  "  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;", "  vec4 sh=-step(h,vec4(0.0));",
  "  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;",
  "  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);",
  "  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));", "  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;",
  "  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;",
  "  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));", "}",
  "void main(){",
  "  vec2 uv=vUv;float ar=1920.0/1080.0;vec2 p=vec2(uv.x*ar,uv.y);float t=uTime*0.06;",
  "  float wx=snoise(vec3(p*1.4,t*0.5))*0.2;float wy=snoise(vec3(p*1.4+100.0,t*0.5))*0.2;", "  vec2 wp=p+vec2(wx,wy);",
  "  vec3 base=mix(vec3(0.10,0.02,0.22),vec3(0.04,0.10,0.25),smoothstep(0.0,1.0,uv.x*0.6+uv.y*0.4));",
  "  float angle=0.65;float ridgeUv=dot(wp,vec2(cos(angle),sin(angle)));",
  "  float ridge1=sin(ridgeUv*8.0+t*2.0+snoise(vec3(wp*0.8,t))*1.5);", "  float ridge2=sin(ridgeUv*5.5-t*1.4+snoise(vec3(wp*1.2+50.0,t*0.7))*2.0);",
  "  float ridge3=sin(ridgeUv*12.0+t*3.0+snoise(vec3(wp*0.6+80.0,t*0.4))*1.0);",
  "  float crease1=pow(abs(ridge1),0.35)*sign(ridge1)*0.5+0.5;", "  float crease2=pow(abs(ridge2),0.4)*sign(ridge2)*0.5+0.5;",
  "  float crease3=pow(abs(ridge3),0.5)*sign(ridge3)*0.5+0.5;",
  "  vec3 warm=mix(vec3(0.9,0.4,0.08),vec3(0.95,0.65,0.15),crease1);", "  float warmZone=smoothstep(0.15,0.75,uv.x+uv.y*0.4+snoise(vec3(uv*2.0,t))*0.3);",
  "  vec3 cool=mix(vec3(0.02,0.4,0.55),vec3(0.25,0.7,0.82),crease2);", "  float coolZone=smoothstep(0.25,0.85,1.2-uv.x+uv.y*0.5+snoise(vec3(uv*2.0+40.0,t*0.8))*0.25);",
  "  vec3 hot=mix(vec3(0.8,0.1,0.4),vec3(0.6,0.08,0.65),crease3);", "  float hotZone=smoothstep(0.5,0.9,snoise(vec3(uv*2.5+20.0,t*0.6))*0.5+0.5);",
  "  vec3 col=base;", "  col=mix(col,warm,warmZone*0.75*smoothstep(0.3,0.7,crease1));", "  col=mix(col,cool,coolZone*0.65*smoothstep(0.2,0.65,crease2));",
  "  col=mix(col,hot,hotZone*0.5*smoothstep(0.35,0.8,crease3));",
  "  float edgeGlow=pow(1.0-abs(ridge1),6.0)*0.4+pow(1.0-abs(ridge2),5.0)*0.25;", "  col+=edgeGlow*mix(warm,cool,uv.x)*0.8;",
  "  col*=1.0-pow(abs(ridge1),4.0)*0.15;", "  float vig=1.0-smoothstep(0.5,1.5,length((uv-0.5)*vec2(1.3,1.0)));", "  col*=0.65+vig*0.5;",
  "  float luma=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(luma),col,1.5);", "  col=clamp(col,0.0,1.0);col=pow(col,vec3(0.9));",
  "  gl_FragColor=vec4(col,1.0);", "}"].join("\n");

/* WebGL port of HyperFrames lib/liquid-glass.iife.js (Apache-2.0; WebGPU there). Same passes and the same shader maths: the panel's region
   (+20 px pad) is copied from the composite (white outside the canvas), blurred 6 x (9-tap, horizontal + vertical, step = blur * 2.5 px),
   then the glass shader is blended over the composite. Canvas px, y down; device pixel ratio 1. smoothstep with reversed edges is written
   out (WGSL defines it, GLSL does not). Pasted verbatim into the film's code block. */
const GLASS = `  const makeGlass = (THREE, renderer, W, H) => {
    const PAD = 20, mk = (w, h) => new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    const comp = mk(W, H), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), qs = new THREE.Scene();
    quad.frustumCulled = false; qs.add(quad);
    const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
    const sm = (fs, u, x) => new THREE.ShaderMaterial(Object.assign({ uniforms: u, vertexShader: VS, fragmentShader: fs, depthTest: false, depthWrite: false }, x || {}));
    const copyM = sm("uniform sampler2D src; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(src, vUv).rgb, 1.0); }", { src: { value: null } });
    const regM = sm("uniform sampler2D src; uniform vec4 uReg; uniform vec2 uCanvas; varying vec2 vUv; void main(){ vec2 px = vec2(uReg.x + vUv.x * uReg.z, uReg.y + (1.0 - vUv.y) * uReg.w);"
      + " vec2 c = vec2(px.x / uCanvas.x, 1.0 - px.y / uCanvas.y); gl_FragColor = (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) ? vec4(1.0) : texture2D(src, c); }",
      { src: { value: null }, uReg: { value: new THREE.Vector4() }, uCanvas: { value: new THREE.Vector2(W, H) } });
    const blurM = sm("uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv; void main(){ vec4 s = texture2D(tex, vUv) * 0.227027;"
      + " s += texture2D(tex, vUv + dir) * 0.194594; s += texture2D(tex, vUv - dir) * 0.194594; s += texture2D(tex, vUv + dir * 2.0) * 0.121622; s += texture2D(tex, vUv - dir * 2.0) * 0.121622;"
      + " s += texture2D(tex, vUv + dir * 3.0) * 0.054054; s += texture2D(tex, vUv - dir * 3.0) * 0.054054; s += texture2D(tex, vUv + dir * 4.0) * 0.016216; s += texture2D(tex, vUv - dir * 4.0) * 0.016216;"
      + " gl_FragColor = s; }", { tex: { value: null }, dir: { value: new THREE.Vector2() } });
    const blend = { transparent: true, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor };
    const PVS = "uniform vec2 uCenter; uniform vec2 uSize; uniform float uPad; uniform vec2 uCanvas; uniform vec4 uReg; varying vec2 vLocal; varying vec2 vUV;"
      + " void main(){ vec2 total = uSize + vec2(uPad * 2.0); vLocal = vec2(position.x, -position.y) * total; vec2 px = uCenter + vLocal;"
      + " vUV = vec2((px.x - uReg.x) / uReg.z, 1.0 - (px.y - uReg.y) / uReg.w); gl_Position = vec4(px.x / uCanvas.x * 2.0 - 1.0, 1.0 - px.y / uCanvas.y * 2.0, 0.0, 1.0); }";
    const GFS = [
      "uniform sampler2D bgTex; uniform sampler2D blurTex; uniform vec2 uSize; uniform vec2 uRes;",
      "uniform float uRadius, uRefract, uChroma, uEdgeHL, uSpec, uFresnel, uDistort, uAlpha, uSat, uTint, uZRadius, uBright, uShadowAlpha, uShadowSpread, uShadowOffY, uBevel;",
      "varying vec2 vLocal; varying vec2 vUV;",
      "float ss(float a, float b, float x){ float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }",
      "float rrSDF(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + vec2(r); return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r; }",
      "float bevelHeight(float d, float zR){ if (d <= 0.0) return 0.0; if (d >= zR) return zR; return sqrt(d * (2.0 * zR - d)); }",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
      "void main(){",
      "  vec2 half_ = uSize * 0.5; float r = min(uRadius, min(half_.x, half_.y)); float sdf = rrSDF(vLocal, half_, r);",
      "  float mask = 1.0 - ss(-1.5, 0.5, sdf); float maxD = min(half_.x, half_.y); float inside = -sdf; float edge = ss(maxD * 0.35, 0.0, inside);",
      "  float zR = uZRadius; float e = 2.0;",
      "  float dR = -rrSDF(vLocal + vec2(e, 0.0), half_, r); float dL = -rrSDF(vLocal - vec2(e, 0.0), half_, r);",
      "  float dU = -rrSDF(vLocal + vec2(0.0, e), half_, r); float dD = -rrSDF(vLocal - vec2(0.0, e), half_, r);",
      "  float hC = bevelHeight(inside, zR); float hR = bevelHeight(dR, zR); float hL = bevelHeight(dL, zR); float hU = bevelHeight(dU, zR); float hD = bevelHeight(dD, zR);",
      "  vec2 hGrad = vec2(hR - hL, hU - hD) / (2.0 * e); vec3 N = normalize(vec3(-hGrad, 1.0)); float depth = ss(0.0, zR, inside);",
      "  vec2 pxToUV = vec2(1.0, -1.0) / uRes; float ior = 1.5; float refrPow = 1.0 - 1.0 / ior; float thickness = hC * 2.0; float thickNorm = thickness / max(zR * 2.0, 1.0);",
      "  vec2 exitRefr = hGrad * refrPow; vec2 entryRefr = hGrad * refrPow; vec2 throughRefr = entryRefr * thickNorm * 0.5;",
      "  vec2 refrPxBiconvex = (exitRefr + entryRefr + throughRefr) * uRefract * 30.0; vec2 centerDir = -vLocal / max(half_, vec2(1.0)); refrPxBiconvex += centerDir * uRefract * 4.0 * depth;",
      "  vec2 refrPxDome = -vLocal * uRefract * depth * 0.35; vec2 refrPx = uBevel >= 0.5 ? refrPxDome : refrPxBiconvex; vec2 refr = refrPx * pxToUV;",
      "  vec2 ns = vLocal * 0.08; vec2 absPxToUV = vec2(1.0) / uRes; vec2 micro = (vec2(hash(ns), hash(ns + vec2(37.0))) - 0.5) * uDistort * 4.0 * absPxToUV;",
      "  float caS = uChroma * 18.0 * (edge * 0.7 + 0.3) * 2.0; vec2 caD = N.xy * caS * pxToUV; vec2 base = vUV + refr + micro;",
      "  vec3 sharp = vec3(texture2D(bgTex, base + caD).r, texture2D(bgTex, base).g, texture2D(bgTex, base - caD).b);",
      "  vec3 blur = vec3(texture2D(blurTex, base + caD).r, texture2D(blurTex, base).g, texture2D(blurTex, base - caD).b);",
      "  float edgeMix = 1.0 - edge * 0.15; vec3 col = mix(sharp, blur, edgeMix); col *= 1.0 + uBright;",
      "  float lum = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(lum), col, 1.0 + uSat); col = mix(col, col * vec3(0.92, 0.95, 1.05), uTint); col *= 1.0 + 0.06 * depth;",
      "  float fres = pow(1.0 - abs(N.z), 4.0) * uFresnel; vec3 V = vec3(0.0, 0.0, 1.0);",
      "  vec3 L1 = normalize(vec3(0.4, 0.7, 1.0)); vec3 H1 = normalize(L1 + V); float sp1 = pow(max(dot(N, H1), 0.0), 90.0);",
      "  vec3 L2 = normalize(vec3(-0.3, -0.5, 1.0)); vec3 H2 = normalize(L2 + V); float sp2 = pow(max(dot(N, H2), 0.0), 50.0) * 0.3;",
      "  vec3 L3 = normalize(vec3(0.1, 0.3, 1.0)); float spB = pow(max(dot(N, L3), 0.0), 6.0) * 0.1;",
      "  vec3 L4 = normalize(vec3(0.0, 0.9, 0.4)); vec3 H4 = normalize(L4 + V); float sp4 = pow(max(dot(N, H4), 0.0), 120.0) * 0.6;",
      "  float totalSpec = (sp1 + sp2 + spB + sp4) * uSpec;",
      "  float borderWidth = 1.5; float innerStroke = ss(-borderWidth - 1.0, -borderWidth, sdf) * (1.0 - ss(-1.0, 0.0, sdf));",
      "  float topBias = 0.5 + 0.5 * (-vLocal.y / half_.y); float innerStrokeFinal = innerStroke * (0.4 + 0.6 * topBias);",
      "  float rim = edge * uEdgeHL * 0.22; float innerGlow = ss(5.0, 0.0, -sdf) * uEdgeHL * 0.15; float envRefl = (N.y * 0.5 + 0.5) * fres * 0.08;",
      "  vec3 fin = col + vec3(totalSpec) + vec3(rim + innerGlow) + vec3(innerStrokeFinal * uEdgeHL * 0.55) + vec3(envRefl); fin = mix(fin, vec3(1.0), fres * 0.2);",
      "  float sdfShadow = rrSDF(vLocal - vec2(0.0, uShadowOffY), half_, r); float shadowD = max(sdfShadow - 1.0, 0.0); float spread = max(uShadowSpread, 1.0);",
      "  float falloff = 1.0 / (spread * spread); float outerShadow = exp(-shadowD * shadowD * falloff) * 0.65; float contactShadow = exp(-shadowD * 0.08 / max(spread * 0.04, 0.01)) * 0.35;",
      "  float shadow = (outerShadow + contactShadow) * uShadowAlpha; bool isOutside = sdf > 0.0;",
      "  gl_FragColor = vec4(isOutside ? vec3(0.0) : fin, isOutside ? shadow : mask * uAlpha);",
      "}"].join("\\n");
    const gu = { bgTex: { value: null }, blurTex: { value: null }, uCenter: { value: new THREE.Vector2() }, uSize: { value: new THREE.Vector2() }, uPad: { value: PAD },
      uCanvas: { value: new THREE.Vector2(W, H) }, uReg: { value: new THREE.Vector4() }, uRes: { value: new THREE.Vector2() } };
    ["uRadius", "uRefract", "uChroma", "uEdgeHL", "uSpec", "uFresnel", "uDistort", "uAlpha", "uSat", "uTint", "uZRadius", "uBright", "uShadowAlpha", "uShadowSpread", "uShadowOffY", "uBevel"].forEach(k => (gu[k] = { value: 0 }));
    const glassM = new THREE.ShaderMaterial(Object.assign({ uniforms: gu, vertexShader: PVS, fragmentShader: GFS, depthTest: false, depthWrite: false }, blend));
    const tintM = new THREE.ShaderMaterial(Object.assign({ uniforms: { uRect: { value: new THREE.Vector4() }, uCanvas: { value: new THREE.Vector2(W, H) }, uA: { value: 0 } },
      vertexShader: "uniform vec4 uRect; uniform vec2 uCanvas; void main(){ vec2 px = uRect.xy + (position.xy * vec2(1.0, -1.0) + 0.5) * uRect.zw; gl_Position = vec4(px.x / uCanvas.x * 2.0 - 1.0, 1.0 - px.y / uCanvas.y * 2.0, 0.0, 1.0); }",
      fragmentShader: "uniform float uA; void main(){ gl_FragColor = vec4(1.0, 1.0, 1.0, uA); }", depthTest: false, depthWrite: false }, blend));
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glassM), ps = new THREE.Scene(); pm.frustumCulled = false; ps.add(pm);
    const tm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), tintM), ts = new THREE.Scene(); tm.frustumCulled = false; ts.add(tm);
    let sets = new Map();
    const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(qs, cam); };
    const over = (scene) => { renderer.setRenderTarget(comp); const ac = renderer.autoClear; renderer.autoClear = false; renderer.render(scene, cam); renderer.autoClear = ac; };
    return {
      comp,
      reset() { sets.forEach(s => [s.bg, s.a, s.b].forEach(x => x.dispose())); sets = new Map(); },
      /* one glass element: c = the --lg-* config (HF names), x / y / w / h = its box in canvas px, tint = alpha of a white fill drawn over it */
      panel(c, x, y, w, h, tint) {
        if (x - PAD >= W || y - PAD >= H || x + w + PAD <= 0 || y + h + PAD <= 0) return;
        const rw = Math.round(w + PAD * 2), rh = Math.round(h + PAD * 2), key = rw + "x" + rh;
        let s = sets.get(key); if (!s) sets.set(key, (s = { bg: mk(rw, rh), a: mk(rw, rh), b: mk(rw, rh) }));
        regM.uniforms.src.value = comp.texture; regM.uniforms.uReg.value.set(x - PAD, y - PAD, rw, rh); pass(regM, s.bg);
        let blurred = s.bg;
        if (c.blurAmount > 0) { const g = c.blurAmount * 2.5; let from = s.bg;
          for (let i = 0; i < 6; i++) { blurM.uniforms.tex.value = from.texture; blurM.uniforms.dir.value.set(g / rw, 0); pass(blurM, s.b);
            blurM.uniforms.tex.value = s.b.texture; blurM.uniforms.dir.value.set(0, g / rh); pass(blurM, s.a); from = s.a; }
          blurred = s.a; }
        gu.bgTex.value = s.bg.texture; gu.blurTex.value = blurred.texture;
        gu.uCenter.value.set(x + w / 2, y + h / 2); gu.uSize.value.set(w, h); gu.uReg.value.set(x - PAD, y - PAD, rw, rh); gu.uRes.value.set(rw, rh);
        const v = { uRadius: c.cornerRadius, uRefract: c.refraction, uChroma: c.chromAberration, uEdgeHL: c.edgeHighlight, uSpec: c.specular, uFresnel: c.fresnel,
          uDistort: c.distortion, uAlpha: c.opacity, uSat: c.saturation, uTint: c.tintStrength, uZRadius: c.zRadius, uBright: c.brightness,
          uShadowAlpha: c.shadowOpacity, uShadowSpread: c.shadowSpread, uShadowOffY: c.shadowOffsetY, uBevel: c.bevelMode };
        for (const k in v) gu[k].value = v[k];
        over(ps);
        if (tint > 0) { tintM.uniforms.uRect.value.set(x, y, w, h); tintM.uniforms.uA.value = tint; over(ts); } },
      present() { copyM.uniforms.src.value = comp.texture; pass(copyM, null); },
    }; };`;
}
