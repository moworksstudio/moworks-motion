/* device/iphone-macbook-3d: a product-review edit with real GLTF devices: an iPhone hero close-up that breathes, spins 180 deg to its back,
   spins back and exits left; a MacBook slides in from the right; the iPhone returns and both do a 360 deg turntable (15 s). Both screens show
   a live web page (header, title fading in, a counter 0 -> 43, cards revealing one by one, scrolling), and a small morphing glass lens
   (sphere / icosa / octa / dodeca / tetra / torus) glides over the screens.
   Port of HyperFrames registry block vfx-iphone-device. BLOCK: the target is an empty box (usually the whole frame).
   Seek-safe rendering: each page is real HTML inside a <canvas layoutsubtree>, captured twice at load with drawElementImage (all revealed /
   all hidden); every frame composes the screen from those two captures (title and card regions faded and offset, counter text drawn, scroll
   offset) and three.js renders it: a pure function of time in ctx.code. */
AIMK.preset("device/iphone-macbook-3d", {
  params: {
    brand: "Studio", login: "Đăng nhập", nav: ["Tài liệu", "Sân chơi", "Bảng giá"],
    title: "Sân chơi cộng đồng", phone_sub: "Làm bằng HTML", laptop_sub: "Tạo video bằng HTML, chỉnh như viết mã",
    chip: "Ví dụ", count_label: "Danh mục", count_to: 43,
    cards: [
      { bg: "linear-gradient(135deg,#1e3a5f,#2563eb)", text: "Đội 100 người dùng AI", title: "Giới thiệu sản phẩm", meta: "15s · 1920×1080" },
      { bg: "linear-gradient(135deg,#4a1942,#db2777)", text: "Hệ thống thiết kế v4", title: "Bộ nhận diện", meta: "12s · 1920×1080" },
      { bg: "linear-gradient(135deg,#451a03,#f59e0b)", text: "Doanh thu 1,9 nghìn tỷ", title: "Báo cáo tài chính", meta: "10s · 1920×1080" },
      { bg: "linear-gradient(135deg,#064e3b,#10b981)", text: "Làm nhanh hơn với AI", title: "Quảng cáo dọc", meta: "20s · 1080×1920" },
      { bg: "linear-gradient(135deg,#1e3a5f,#3b82f6)", text: "Ứng dụng bảo mật", title: "Giới thiệu ứng dụng", meta: "8s · 1080×1920" },
      { bg: "linear-gradient(135deg,#4a1942,#a855f7)", text: "Hình ảnh âm thanh", title: "Video âm nhạc", meta: "15s · 1920×1080" },
      { bg: "linear-gradient(135deg,#064e3b,#059669)", text: "Hoạt ảnh mã nguồn", title: "Demo dòng lệnh", meta: "12s · 1920×1080" },
      { bg: "linear-gradient(135deg,#451a03,#d97706)", text: "Video ra mắt", title: "Ra mắt sản phẩm", meta: "30s · 1920×1080" },
      { bg: "linear-gradient(135deg,#1e3a5f,#6366f1)", text: "Thiết bị 3D", title: "Mô hình thiết bị", meta: "15s · 1920×1080" },
    ],
    duration: 15,
  },
  build(tl, els, p, ctx) {
    const J = JSON.stringify;
    const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    ctx.css("device/iphone-macbook-3d", `
.aimk-dv { position: absolute; inset: 0; overflow: hidden; z-index: 0; background: #050508; }
.aimk-dv .dv-cap { position: absolute; top: 0; left: 0; z-index: -1; pointer-events: none; }
.aimk-dv .dv-gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
.aimk-dv .dv-page { position: relative; overflow: hidden; font-family: inherit; color: #e2e8f0; background: linear-gradient(180deg, #0a0a12, #0f0f1a); }
.aimk-dv .dv-brand { font-weight: 800; background: linear-gradient(135deg, #34d399, #3b82f6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.aimk-dv .dv-login { font-weight: 600; border-radius: 6px; background: #10b981; color: #fff; }
.aimk-dv .dv-chip-a { font-weight: 600; border-radius: 16px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.aimk-dv .dv-chip-b { font-weight: 600; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.5); white-space: nowrap; }`);
    const card = (cd, m) => `<div class="anim-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:${m ? 10 : 12}px;overflow:hidden">`
      + `<div style="width:100%;aspect-ratio:16/9;background:${cd.bg};display:flex;align-items:center;justify-content:center"><span style="font-size:${m ? 12 : 16}px;font-weight:700;color:rgba(255,255,255,0.7)">${esc(cd.text)}</span></div>`
      + `<div style="padding:${m ? "8px 10px" : "10px 14px"}"><div style="font-size:${m ? 11 : 13}px;font-weight:600;margin-bottom:2px">${esc(cd.title)}</div><div style="font-size:${m ? 9 : 10}px;color:rgba(255,255,255,0.3)">${esc(cd.meta)}</div></div></div>`;
    const chipText = `${esc(p.count_label)} ${esc(p.count_to)}`;
    for (const slot of els) {
      const W = Math.round(slot.offsetWidth || ctx.W), H = Math.round(slot.offsetHeight || ctx.H);
      const wrap = ctx.make(slot, "div", "dv", { cls: "aimk-dv" }), id = wrap.id;
      const capP = ctx.make(wrap, "canvas", "capp", { cls: "dv-cap", attrs: { layoutsubtree: "", width: 390, height: 2000, "aria-hidden": "true" }, style: { width: "390px", height: "2000px" } });
      const pageP = ctx.make(capP, "div", "phone", { cls: "dv-page", style: { width: "390px" }, html:
        `<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06)"><span class="dv-brand" style="font-size:14px">${esc(p.brand)}</span>`
        + `<span class="dv-login" style="font-size:10px;padding:5px 12px">${esc(p.login)}</span></div>`
        + `<div id="${id}_ptitle" style="font-size:26px;font-weight:800;letter-spacing:-0.5px;padding:18px 18px 6px;line-height:1.1">${esc(p.title)}</div>`
        + `<div style="font-size:11px;color:rgba(255,255,255,0.4);padding:0 18px 14px">${esc(p.phone_sub)}</div>`
        + `<div style="display:flex;gap:6px;padding:0 18px 14px"><span class="dv-chip-a" style="font-size:9px;padding:4px 10px">${esc(p.chip)}</span><span id="${id}_pcount" class="dv-chip-b" style="font-size:9px;padding:4px 10px">${chipText}</span></div>`
        + `<div style="display:grid;gap:10px;padding:0 18px 18px">${p.cards.slice(0, 6).map(c => card(c, true)).join("")}</div>` });
      const capL = ctx.make(wrap, "canvas", "capl", { cls: "dv-cap", attrs: { layoutsubtree: "", width: 1440, height: 1500, "aria-hidden": "true" }, style: { width: "1440px", height: "1500px" } });
      const pageL = ctx.make(capL, "div", "laptop", { cls: "dv-page", style: { width: "1440px" }, html:
        `<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 36px;border-bottom:1px solid rgba(255,255,255,0.06)"><span class="dv-brand" style="font-size:17px">${esc(p.brand)}</span>`
        + `<div style="display:flex;gap:20px;font-size:12px;color:rgba(255,255,255,0.5)">${p.nav.map(n => `<span>${esc(n)}</span>`).join("")}</div>`
        + `<span class="dv-login" style="font-size:11px;padding:6px 14px">${esc(p.login)}</span></div>`
        + `<div id="${id}_ltitle" style="font-size:40px;font-weight:800;letter-spacing:-1px;padding:28px 36px 10px">${esc(p.title)}</div>`
        + `<div style="font-size:13px;color:rgba(255,255,255,0.4);padding:0 36px 18px">${esc(p.laptop_sub)}</div>`
        + `<div style="display:flex;gap:8px;padding:0 36px 20px"><span class="dv-chip-a" style="font-size:10px;padding:5px 12px">${esc(p.chip)}</span><span id="${id}_lcount" class="dv-chip-b" style="font-size:10px;padding:5px 12px">${chipText}</span></div>`
        + `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:0 36px 36px">${p.cards.slice(0, 9).map(c => card(c, false)).join("")}</div>` });
      const gl = ctx.make(wrap, "canvas", "gl", { cls: "dv-gl", attrs: { width: W, height: H } });
      const C = { W, H, at: p.at, dur: p.duration, root: id, gl: gl.id, iphone: ctx.asset("iphone.glb"), macbook: ctx.asset("macbook.glb"), countTo: Number(p.count_to) || 0, label: String(p.count_label),
        screens: [{ cap: capP.id, page: pageP.id, title: id + "_ptitle", count: id + "_pcount", w: 390, h: 844, scroll: 500, font: 9 },
                  { cap: capL.id, page: pageL.id, title: id + "_ltitle", count: id + "_lcount", w: 1440, h: 900, scroll: 300, font: 10 }] };
      ctx.code(`  /* device/iphone-macbook-3d #${id}: GLTF iPhone + MacBook, HTML pages captured twice (HTML-in-Canvas) and composed per frame, glass lens; pure function of time */
  const C = ${J(C)}, THREE = window.THREE, PI = Math.PI, el = i => document.getElementById(i);
  const glc = el(C.gl);
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(C.W, C.H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.outputEncoding = THREE.sRGBEncoding; renderer.setClearColor(0x050508, 1);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050508);
  const camera = new THREE.PerspectiveCamera(34, C.W / C.H, 0.1, 100);
  const eC = document.createElement("canvas"); eC.width = 1024; eC.height = 512; const ec = eC.getContext("2d");
  const eg = ec.createLinearGradient(0, 0, 1024, 512);
  [[0, "#020307"], [0.15, "#1a1a2e"], [0.3, "#ffffff"], [0.45, "#0a0a1e"], [0.6, "#ffffff"], [0.75, "#1e1e2e"], [1, "#020307"]].forEach(s => eg.addColorStop(s[0], s[1]));
  ec.fillStyle = eg; ec.fillRect(0, 0, 1024, 512); ec.globalCompositeOperation = "screen";
  for (let i = 0; i < 7; i++) { ec.fillStyle = "rgba(255,255,255," + (i % 2 === 0 ? 0.15 : 0.08) + ")"; ec.fillRect((i % 3) * 100, 60 + i * 56, 700, 3 + (i % 2) * 2); }
  const eT = new THREE.CanvasTexture(eC); eT.mapping = THREE.EquirectangularReflectionMapping;
  const makeEnv = () => { const pm = new THREE.PMREMGenerator(renderer); if (scene.environment) scene.environment.dispose(); scene.environment = pm.fromEquirectangular(eT).texture; pm.dispose(); };
  makeEnv();
  /* backdrop: the source's static dark plane with two soft glows, and a near-black metal floor */
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(22, 14), new THREE.ShaderMaterial({ uniforms: {}, depthWrite: false,
    vertexShader: "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: "varying vec2 v;void main(){vec3 c=vec3(0.02,0.02,0.03);c+=vec3(0.05,0.02,0.1)*exp(-pow(length(v-vec2(0.3,0.55)),2.0)*5.0);c+=vec3(0.02,0.05,0.1)*exp(-pow(length(v-vec2(0.7,0.45)),2.0)*5.0);gl_FragColor=vec4(c,1.0);}" }));
  bg.position.z = -6; scene.add(bg);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x050508, metalness: 0.95, roughness: 0.18 }));
  floor.rotation.x = -PI / 2; floor.position.y = -2.5; scene.add(floor);
  scene.add(new THREE.AmbientLight(0x222233, 0.5));
  const kL = new THREE.DirectionalLight(0xffffff, 2.2); kL.position.set(-3, 4, 5); scene.add(kL);
  const rL = new THREE.PointLight(0x6366f1, 3, 15); rL.position.set(4, 2, 3); scene.add(rL);
  const wL = new THREE.PointLight(0xffc8a8, 1.5, 12); wL.position.set(-3, -1, 4); scene.add(wL);
  /* the two screens: captures (full = all revealed, base = title + cards hidden) composed into the texture canvas */
  const SC = C.screens.map(s => { const o = Object.assign({}, s); o.cv = document.createElement("canvas"); o.cv.width = s.w; o.cv.height = s.h; o.cx = o.cv.getContext("2d");
    o.tex = new THREE.CanvasTexture(o.cv); o.tex.minFilter = THREE.LinearFilter; o.tex.magFilter = THREE.LinearFilter; o.tex.generateMipmaps = false; o.key = ""; return o; });
  const turntable = new THREE.Group(); scene.add(turntable);
  const phoneGrp = new THREE.Group(); turntable.add(phoneGrp); const lapGrp = new THREE.Group(); turntable.add(lapGrp);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 1.8, ior: 1.45, attenuationColor: new THREE.Color(0xe8f4ff),
    attenuationDistance: 10, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, envMapIntensity: 2.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const glassGeos = [new THREE.SphereGeometry(0.22, 32, 32), new THREE.IcosahedronGeometry(0.22, 1), new THREE.OctahedronGeometry(0.25, 0), new THREE.DodecahedronGeometry(0.22, 0),
    new THREE.TetrahedronGeometry(0.28, 0), new THREE.TorusGeometry(0.16, 0.07, 16, 32)];
  const glassLens = new THREE.Mesh(glassGeos[0], glassMat); glassLens.renderOrder = 10;
  const planarScreenUv = mesh => { const g = mesh.geometry; g.computeBoundingBox(); const bb = g.boundingBox, pos = g.attributes.position;
    const w = bb.max.x - bb.min.x || 1, h = bb.max.y - bb.min.y || 1, uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - bb.min.x) / w; uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / h; }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); };
  const alignScreenToMinusZ = (root, frontName, backName) => { const front = root.getObjectByName(frontName), back = root.getObjectByName(backName);
    if (!front || !back) return; root.updateWorldMatrix(true, true); const fp = new THREE.Vector3(), bp = new THREE.Vector3();
    front.getWorldPosition(fp); back.getWorldPosition(bp); if (fp.z > bp.z) root.rotation.y += Math.PI; };
  const cbz = (p1x, p1y, p2x, p2y) => { const ax = 3 * p1x - 3 * p2x + 1, bx = 3 * p2x - 6 * p1x, cx = 3 * p1x, ay = 3 * p1y - 3 * p2y + 1, by = 3 * p2y - 6 * p1y, cy = 3 * p1y;
    return t => { let s = t; for (let i = 0; i < 12; i++) { const x = ((ax * s + bx) * s + cx) * s - t, dx = (3 * ax * s + 2 * bx) * s + cx; if (Math.abs(dx) < 1e-10) break; s -= x / dx; }
      s = Math.max(0, Math.min(1, s)); return ((ay * s + by) * s + cy) * s; }; };
  const enterE = cbz(0.16, 1.0, 0.3, 1.0), spinE = cbz(0.76, 0.0, 0.18, 1.0), driftE = cbz(0.45, 0.0, 0.15, 1.0), snapE = cbz(0.22, 1.15, 0.36, 1.0), breatheE = cbz(0.37, 0.0, 0.63, 1.0);
  /* one animated field of the source's state object: [start, duration, to, ease] segments; the latest started segment drives the value
     and starts from the value at its start time (the source's tl.to on S, played forward) */
  const track = (init, segs) => { const from = [];
    const val = (t, upto) => { let b = -1; for (let i = 0; i < upto; i++) if (segs[i][0] <= t) b = i; if (b < 0) return init;
      const s = segs[b]; return from[b] + (s[2] - from[b]) * s[3](Math.min(1, Math.max(0, (t - s[0]) / s[1]))); };
    segs.forEach((s, i) => { from[i] = val(s[0], i); }); return t => val(t, segs.length); };
  const T = {
    phRY: track(PI, [[0.3, 1.5, PI + 0.06, breatheE], [1.8, 1.5, PI - 0.04, breatheE], [3.5, 2.2, PI * 2, spinE], [5.5, 1.5, PI * 2 + 0.15, breatheE], [7, 1.8, PI * 3, snapE], [11, 1, PI * 3, breatheE]]),
    phRX: track(0, [[0.3, 1.5, 0.015, breatheE], [1.8, 1.5, -0.01, breatheE], [5.5, 1.5, 0.04, breatheE]]),
    phX: track(0, [[8, 2, -6, spinE], [11, 1.5, -2.0, enterE]]), phZ: track(0.5, [[8, 2, 0.3, spinE]]),
    lpX: track(10, [[9, 2, 0, enterE], [11, 1.5, 2.2, breatheE]]), lpRY: track(0, [[10, 1.5, 0.06, breatheE], [11, 1, 0, breatheE]]),
    cX: track(0, [[5.5, 1.5, 0.15, breatheE], [9, 2, 0, driftE], [11, 1.5, 0.1, driftE]]),
    cY: track(0.15, [[3.5, 2, 0.25, driftE], [7, 1.5, 0.2, driftE], [9, 2, 0.3, driftE], [11, 1.5, 0.5, driftE]]),
    cZ: track(2.8, [[3.5, 2, 4.8, driftE], [7, 1.5, 3.5, driftE], [9, 2, 5, driftE], [11, 1.5, 7.5, driftE]]),
    clX: track(0, [[9, 2, 0, driftE], [11, 1.5, 0.1, driftE]]), clY: track(0.1, [[9, 2, -0.1, driftE], [11, 1.5, -0.1, driftE]]),
    turn: track(0, [[12.5, 2.5, PI * 2, spinE]]),
    titleFade: track(0, [[0.3, 0.8, 1, breatheE]]), counter: track(0, [[0.5, 2, C.countTo, driftE]]), cardReveal: track(0, [[0.8, 3, 1, breatheE]]),
    scroll: track(0, [[1.5, 3, 0.6, breatheE], [7, 1.5, 0, driftE], [9.5, 3, 0.8, breatheE], [13, 2, 0.3, driftE]]) };
  let shot = false, nCards = 0;
  const F = (getComputedStyle(el(C.root)).fontFamily || "sans-serif") + ", sans-serif";
  /* a screen at (title, counter, reveal, scroll): base capture, title + cards from the full capture, counter text; scrolled */
  const compose = (s, tf, cnt, rev, scr, cardOffset) => { const key = [tf, cnt, rev, scr].map(v => v.toFixed(4)).join(); if (key === s.key) return; s.key = key;
    const c = s.cx, y0 = -scr * s.scroll; c.clearRect(0, 0, s.w, s.h); c.drawImage(s.base, 0, y0);
    const r = s.rTitle; if (tf > 0) { c.save(); c.globalAlpha = Math.min(1, tf); c.drawImage(s.full, r.x, r.y, r.w, r.h, r.x, r.y + y0, r.w, r.h); c.restore(); }
    s.rCards.forEach((r, i) => { const pr = Math.max(0, Math.min(1, (rev * nCards - (cardOffset + i)) * 1.5)); if (pr <= 0) return;
      c.save(); c.globalAlpha = pr; c.drawImage(s.full, r.x, r.y, r.w, r.h, r.x, r.y + y0 + (1 - pr) * 15, r.w, r.h); c.restore(); });
    const q = s.rCount; c.save(); c.font = "600 " + s.font + "px " + F; c.fillStyle = "rgba(255,255,255,0.5)"; c.textBaseline = "middle";
    c.fillText(C.label + " " + Math.round(cnt), q.x + q.pl, q.y + y0 + q.h / 2); c.restore(); s.tex.needsUpdate = true; };
  const draw = t => {
    const d = t, v = {}; for (const k in T) v[k] = T[k](t);
    if (shot) { compose(SC[0], v.titleFade, v.counter, v.cardReveal, v.scroll, 0); compose(SC[1], v.titleFade, v.counter, v.cardReveal, v.scroll, SC[0].rCards.length); }
    phoneGrp.position.set(v.phX + Math.sin(d * 0.5) * 0.015, 0.1 + Math.sin(d * 0.7) * 0.008, v.phZ + Math.cos(d * 0.4) * 0.008); phoneGrp.rotation.set(v.phRX, v.phRY, 0);
    lapGrp.position.set(v.lpX - Math.sin(d * 0.4) * 0.012, -0.2 + Math.sin(d * 0.6) * 0.006, -0.6 + Math.cos(d * 0.35) * 0.008); lapGrp.rotation.set(0, v.lpRY, 0);
    turntable.rotation.y = v.turn;
    /* the morphing lens (source): geometry every 1.25 s, spin, hidden during the spins, gliding over the phone, the laptop, then between them */
    glassLens.geometry = glassGeos[Math.floor(d * 0.8) % glassGeos.length]; glassLens.rotation.set(d * 0.7, d * 0.9, d * 0.4);
    glassLens.visible = t < 3.3 || (t >= 9.5 && t < 12.5) || t >= 13.5;
    const pp = phoneGrp.position, lp = lapGrp.position;
    if (t < 7) glassLens.position.set(pp.x + Math.sin(d * 1.4) * 0.35, pp.y + Math.cos(d * 1.1) * 0.6, pp.z + 0.15);
    else if (t < 11) glassLens.position.set(lp.x + Math.sin(d * 1.2) * 1.2, lp.y + 0.3 + Math.cos(d * 0.9) * 0.6, lp.z + 0.2);
    else glassLens.position.set((pp.x + lp.x) * 0.5 + Math.sin(d * 1.0) * 1.5, (pp.y + lp.y) * 0.5 + 0.2 + Math.cos(d * 0.8) * 0.5, 0.3);
    camera.position.set(v.cX, v.cY, v.cZ); camera.lookAt(v.clX, v.clY, 0);
    renderer.render(scene, camera); };
  const P = { t: 0 };
  tl.fromTo(P, { t: 0 }, { t: C.dur, duration: C.dur, ease: "none", onUpdate: () => draw(P.t) }, C.at);
  /* readiness: both models, then the HTML-in-Canvas captures. A fresh kit Chromium loses its first WebGL context ~0.15 s after creation and
     restores it ~1 s later: capture after it settles, rebuild the PMREM env map when it comes back. */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const settle = wait(600);
  glc.addEventListener("webglcontextrestored", () => { makeEnv(); SC.forEach(s => { s.key = ""; }); draw(P.t); });
  const gpuOk = async () => { await settle; if (renderer.getContext().isContextLost())
    await Promise.race([new Promise(r => glc.addEventListener("webglcontextrestored", () => setTimeout(r, 0), { once: true })), wait(20000)]); };
  const load = (url, fn) => new Promise((ok, no) => new THREE.GLTFLoader().load(url, g => { fn(g.scene); ok(); }, undefined, no));
  const models = Promise.all([
    load(C.iphone, m => { const box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3()); m.scale.setScalar(3.2 / sz.y); box.setFromObject(m); m.position.sub(box.getCenter(new THREE.Vector3()));
      m.traverse(ch => { if (ch.isMesh && ch.name.indexOf("front-glass") === 0) { planarScreenUv(ch); ch.material = new THREE.MeshBasicMaterial({ map: SC[0].tex }); } });
      scene.add(glassLens); alignScreenToMinusZ(m, "front-glass", "rear-window"); phoneGrp.add(m); }),
    load(C.macbook, m => { const box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3()); m.scale.setScalar(4.5 / Math.max(sz.x, sz.z)); box.setFromObject(m); m.position.sub(box.getCenter(new THREE.Vector3()));
      m.traverse(ch => { if (ch.isMesh && ch.name.replace(/\\.\\d+$/, "") === "display") { planarScreenUv(ch); ch.material = new THREE.MeshBasicMaterial({ map: SC[1].tex }); } });
      lapGrp.add(m); })]).catch(e => console.warn("device/iphone-macbook-3d: model", e));
  const rel = (e, root) => { let x = 0, y = 0, n = e; while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: e.offsetWidth, h: e.offsetHeight }; };
  const grab = async (cap, page, into) => { const cx = cap.getContext("2d"); for (let k = 0; k < 60; k++) {
      await new Promise(r => { let done = false; const f = () => { if (!done) { done = true; cap.onpaint = null; r(); } }; cap.onpaint = f; if (cap.requestPaint) cap.requestPaint(); setTimeout(f, 150); });
      try { cx.clearRect(0, 0, cap.width, cap.height); cx.drawElementImage(page, 0, 0, page.offsetWidth, page.offsetHeight); into.width = page.offsetWidth; into.height = page.offsetHeight;
        into.getContext("2d").drawImage(cap, 0, 0); return true; } catch (e) { await wait(50); } } return false; };
  const capture = async () => {
    await Promise.all([...document.querySelectorAll("#" + C.root + " img")].map(i => i.decode ? i.decode().catch(() => {}) : 0));
    await Promise.all(["600", "700", "800"].map(w => document.fonts.load(w + " 16px " + F).catch(() => {}))); await document.fonts.ready;
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe || typeof probe.drawElementImage !== "function") { console.warn("device/iphone-macbook-3d: HTML-in-Canvas (drawElementImage) not available, the screens stay black"); return; }
    let ok = true;
    for (const s of SC) {
      const cap = el(s.cap), page = el(s.page), title = el(s.title), count = el(s.count), cards = [...page.querySelectorAll(".anim-card")];
      s.rTitle = rel(title, page); s.rCards = cards.map(c => rel(c, page)); const rc = rel(count, page); rc.pl = parseFloat(getComputedStyle(count).paddingLeft) + 1; s.rCount = rc;
      count.style.color = "transparent";
      s.full = document.createElement("canvas"); s.base = document.createElement("canvas");
      title.style.opacity = "1"; cards.forEach(c => (c.style.opacity = "1")); ok = (await grab(cap, page, s.full)) && ok;
      title.style.opacity = "0"; cards.forEach(c => (c.style.opacity = "0")); ok = (await grab(cap, page, s.base)) && ok; }
    nCards = SC[0].rCards.length + SC[1].rCards.length;
    if (!ok) { console.warn("device/iphone-macbook-3d: a screen capture never succeeded"); return; }
    shot = true; };
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady[${J("aimk-" + id)}] = Promise.all([models, gpuOk().then(capture)]).then(gpuOk).then(() => { SC.forEach(s => { s.key = ""; }); draw(P.t); });
  draw(P.t);`);
    }
  },
});
