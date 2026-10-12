/* glass/vfx-glass: a headline page (badge, huge two-tone title, subtitle, three stats) seen through a wall of ~50 fractured glass shards
   (Voronoi cells, extruded, bevelled, transmissive physical glass with white / cyan / pink edge lines). A virtual pointer wanders over the
   wall for 20 s: shards near it lift, spread and tilt away (revealing the text), the camera and the text layer parallax against the glass,
   all shards drift on their own; bloom + film grain on top.
   Port of HyperFrames registry block vfx-liquid-glass. BLOCK: the target is an empty box (usually the whole frame).
   Rendering: the headline is HTML inside a <canvas layoutsubtree>, captured once with drawElementImage (HTML-in-Canvas) as the backdrop
   texture; three.js renders the scene through the source's EffectComposer chain (RenderPass, UnrealBloomPass, grain ShaderPass), using the
   three r147 postprocessing files vendored in engine/vendor/libs/three-0.147 (05/10/2026). Every frame is a pure function of time (ctx.code). */
AIMK.preset("glass/vfx-glass", {
  params: {
    badge: "Viết HTML → Xuất video",
    title: "Ra phim nhanh", title_accent: "gấp 10 lần",
    subtitle: "HTML là nguồn của video. Không cần timeline, không cần After Effects — chỉ cần code.",
    stats: [{ value: "47x", label: "Nhanh hơn AE" }, { value: "12.4K", label: "Nhà sáng tạo" }, { value: "2.4M", label: "Video đã xuất" }],
    bg: "#030407", accent: "#00d4ff",
    duration: 20,
  },
  build(tl, els, p, ctx) {
    const J = JSON.stringify;
    const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const rgb = h => { const m = String(h).replace("#", ""); const f = m.length === 3 ? m.replace(/./g, c => c + c) : m; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
    ctx.css("glass/vfx-glass", `
.aimk-vg { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.aimk-vg .vg-cap { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; z-index: -1; pointer-events: none; }
.aimk-vg .vg-gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
.aimk-vg .text-source { width: 1920px; height: 1080px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 120px; gap: 32px;
  position: relative; overflow: hidden; font-family: inherit; }
.aimk-vg .text-source::before { content: ""; position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(0, 212, 255, 0.06) 0%, transparent 70%); top: -150px; right: -100px; pointer-events: none; }
.aimk-vg .text-source::after { content: ""; position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%); bottom: -100px; left: -50px; pointer-events: none; }
.aimk-vg .badge { font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; }
.aimk-vg .text-source h1 { font-size: 148px; font-weight: 900; line-height: 0.9; color: rgba(248, 249, 253, 0.96); text-shadow: 0 0 60px rgba(255, 255, 255, 0.15); letter-spacing: -5px; max-width: 1400px; }
.aimk-vg .text-source h1 span { -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.aimk-vg .subtitle { font-size: 28px; font-weight: 400; color: rgba(255, 255, 255, 0.35); max-width: 800px; line-height: 1.5; }
.aimk-vg .stats { display: flex; gap: 48px; margin-top: 16px; }
.aimk-vg .stat { text-align: center; }
.aimk-vg .stat-val { font-size: 42px; font-weight: 800; letter-spacing: -1px; }
.aimk-vg .stat-label { font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.3); text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }`);
    for (const slot of els) {
      const W = Math.round(slot.offsetWidth || ctx.W), H = Math.round(slot.offsetHeight || ctx.H);
      const A = rgb(p.accent);
      const wrap = ctx.make(slot, "div", "vg", { cls: "aimk-vg", style: { background: p.bg } });
      const cap = ctx.make(wrap, "canvas", "cap", { cls: "vg-cap", attrs: { layoutsubtree: "", width: 1920, height: 1080, "aria-hidden": "true" } });
      const text = ctx.make(cap, "div", "text", { cls: "text-source", style: { background: `linear-gradient(160deg, ${p.bg} 0%, #0a1020 40%, #070910 70%, ${p.bg} 100%)` }, html:
        `<div class="badge" style="color: rgba(${A.join(", ")}, 0.8)">${esc(p.badge)}</div>` +
        `<h1>${esc(p.title)} <span style="background-image: linear-gradient(135deg, ${p.accent}, #a855f7)">${esc(p.title_accent)}</span></h1>` +
        `<div class="subtitle">${esc(p.subtitle)}</div>` +
        `<div class="stats">${p.stats.map(s => `<div class="stat"><div class="stat-val" style="color: ${p.accent}">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join("")}</div>` });
      const gl = ctx.make(wrap, "canvas", "gl", { cls: "vg-gl", attrs: { width: W, height: H } });
      const bgHex = parseInt(String(p.bg).replace("#", "").replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3"), 16);
      const C = { W, H, at: p.at, dur: p.duration, root: wrap.id, cap: cap.id, text: text.id, gl: gl.id, bg: bgHex };
      ctx.code(`  /* glass/vfx-glass #${wrap.id}: Voronoi glass shards over a captured HTML headline, pointer-driven reveal, bloom + grain; a pure function of time */
  const C = ${J(C)}, THREE = window.THREE, W = C.W, H = C.H, ASPECT = W / H, TEXT_Z = -3.08;
  const glc = document.getElementById(C.gl), cap = document.getElementById(C.cap), textEl = document.getElementById(C.text);
  /* the source's seeded PRNG and self-contained Voronoi (verbatim) */
  const seededRandom = seed => { let v = seed >>> 0; return () => { v += 0x6d2b79f5; let m = v; m = Math.imul(m ^ (m >>> 15), m | 1); m ^= m + Math.imul(m ^ (m >>> 7), m | 61); return ((m ^ (m >>> 14)) >>> 0) / 4294967296; }; };
  const polygonArea = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const j = (i + 1) % pts.length; a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; } return a * 0.5; };
  const polygonCentroid = pts => { const sa = polygonArea(pts) || 1; let cx = 0, cy = 0;
    for (let i = 0; i < pts.length; i++) { const j = (i + 1) % pts.length, f = pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; cx += (pts[i][0] + pts[j][0]) * f; cy += (pts[i][1] + pts[j][1]) * f; }
    return { x: cx / (6 * sa), y: cy / (6 * sa) }; };
  const clipPoly = (poly, px, py, nx, ny) => { const out = [];
    for (let i = 0; i < poly.length; i++) { const c = poly[i], n = poly[(i + 1) % poly.length], dc = (c[0] - px) * nx + (c[1] - py) * ny, dn = (n[0] - px) * nx + (n[1] - py) * ny;
      if (dc <= 0) out.push(c); if (dc <= 0 !== dn <= 0) { const t = dc / (dc - dn); out.push([c[0] + t * (n[0] - c[0]), c[1] + t * (n[1] - c[1])]); } } return out; };
  const computeVoronoi = (points, xmin, ymin, xmax, ymax) => points.map((pt, i) => { let poly = [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax]];
    for (let j = 0; j < points.length; j++) { if (i === j) continue; const q = points[j]; poly = clipPoly(poly, (pt[0] + q[0]) * 0.5, (pt[1] + q[1]) * 0.5, q[0] - pt[0], q[1] - pt[1]); if (poly.length < 3) break; }
    return poly.length >= 3 ? poly : null; });
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
  renderer.setSize(W, H, false); renderer.setPixelRatio(1);
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; renderer.setClearColor(C.bg, 1);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  const envCanvas = document.createElement("canvas"); envCanvas.width = 1024; envCanvas.height = 512; const ectx = envCanvas.getContext("2d");
  const eg = ectx.createLinearGradient(0, 0, 1024, 512);
  [[0, "#020307"], [0.18, "#ffffff"], [0.24, "#7fdcff"], [0.42, "#07101c"], [0.58, "#ffffff"], [0.64, "#ffc4a6"], [0.82, "#0b0c12"], [1, "#020307"]].forEach(s => eg.addColorStop(s[0], s[1]));
  ectx.fillStyle = eg; ectx.fillRect(0, 0, 1024, 512); ectx.globalCompositeOperation = "screen";
  for (let ei = 0; ei < 9; ei++) { ectx.fillStyle = "rgba(255,255,255," + (ei % 3 === 0 ? 0.22 : 0.1) + ")"; ectx.fillRect((ei % 2) * 120, 36 + ei * 52, 1024 * 0.72, 4 + (ei % 3) * 2); }
  const envTex = new THREE.CanvasTexture(envCanvas); envTex.mapping = THREE.EquirectangularReflectionMapping;
  const makeEnv = () => { const pm = new THREE.PMREMGenerator(renderer); if (scene.environment) scene.environment.dispose(); scene.environment = pm.fromEquirectangular(envTex).texture; pm.dispose(); };
  makeEnv();
  const CAM_Z = 9.35, camera = new THREE.PerspectiveCamera(34, ASPECT, 0.1, 80); camera.position.set(0, 0, CAM_Z);
  const rig = new THREE.Group(); scene.add(rig); const textRig = new THREE.Group(); rig.add(textRig);
  /* backdrop: the headline HTML, captured once */
  const back = document.createElement("canvas"); back.width = 1920; back.height = 1080;
  const backdropTex = new THREE.CanvasTexture(back); backdropTex.minFilter = THREE.LinearFilter; backdropTex.magFilter = THREE.LinearFilter; backdropTex.generateMipmaps = false;
  const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * (camera.position.z - TEXT_Z), vw = vh * camera.aspect;
  const backdropMesh = new THREE.Mesh(new THREE.PlaneGeometry(vw * 1.18, vh * 1.18), new THREE.MeshBasicMaterial({ map: backdropTex, depthWrite: true, depthTest: true }));
  backdropMesh.position.z = TEXT_Z; backdropMesh.renderOrder = -4; textRig.add(backdropMesh);
  [[-2.8, 1.45, -1.78, 3.2, 0.035, 0.13, 0x9edaff, 0.24], [2.7, -1.24, -1.76, 3.0, 0.032, -0.1, 0xffd1b5, 0.18], [0.0, 2.05, -1.82, 5.2, 0.026, 0.02, 0xffffff, 0.13],
   [-0.55, -1.92, -1.8, 4.2, 0.024, -0.03, 0xc7f6ff, 0.1]].forEach(s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s[3], s[4]),
      new THREE.MeshBasicMaterial({ color: s[6], transparent: true, opacity: s[7], blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(s[0], s[1], s[2]); m.rotation.z = s[5]; rig.add(m); });
  /* glass shards (source layout, seed 5297) */
  const LAYOUT = { width: 9.7, height: 5.78, cols: 9, rows: 6, seed: 5297 }, rng = seededRandom(LAYOUT.seed), seedPoints = [];
  const cw = LAYOUT.width / LAYOUT.cols, ch = LAYOUT.height / LAYOUT.rows;
  for (let row = 0; row < LAYOUT.rows; row++) for (let col = 0; col < LAYOUT.cols; col++) {
    const cp = 1 - Math.min(0.62, Math.hypot((col + 0.5) / LAYOUT.cols - 0.5, (row + 0.5) / LAYOUT.rows - 0.5));
    const jx = (rng() - 0.5) * cw * (0.58 + cp * 0.16), jy = (rng() - 0.5) * ch * (0.58 + cp * 0.16); seedPoints.push([(col + 0.5) * cw + jx, (row + 0.5) * ch + jy]); }
  const cells = computeVoronoi(seedPoints, 0, 0, LAYOUT.width, LAYOUT.height);
  const glassRig = new THREE.Group(); glassRig.scale.setScalar(1.025); glassRig.position.set(0, 0, 0.08); rig.add(glassRig);
  const panes = [], GAP_SCALE = 0.954;
  for (let pi = 0; pi < cells.length; pi++) {
    const cell = cells[pi]; if (!cell || cell.length < 3) continue;
    const worldPts = cell.map(q => [q[0] - LAYOUT.width / 2, LAYOUT.height / 2 - q[1]]), area = Math.abs(polygonArea(worldPts)); if (area < 0.034) continue;
    const cent = polygonCentroid(worldPts), rad = new THREE.Vector2(cent.x, cent.y), radLen = Math.max(rad.length(), 0.001); rad.divideScalar(radLen);
    const localPts = worldPts.map(q => [(q[0] - cent.x) * GAP_SCALE, (q[1] - cent.y) * GAP_SCALE]);
    const outward = 0.046 + rng() * 0.105, depthLift = (area / (LAYOUT.width * LAYOUT.height)) * 1.42, phase = pi * 0.71 + rng() * 4, depth = 0.18 + rng() * 0.1;
    const bevel = Math.min(0.108, Math.sqrt(area) * 0.095), roughness = pi % 7 === 0 ? 0.08 + rng() * 0.035 : 0.012 + rng() * 0.038, thickness = 1.45 + rng() * 1.25;
    const shape = new THREE.Shape(); localPts.forEach((q, i) => (i === 0 ? shape.moveTo(q[0], q[1]) : shape.lineTo(q[0], q[1]))); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 9, curveSegments: 2, steps: 2 });
    geo.center(); geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xf7fbff, metalness: 0, roughness, transmission: 1, thickness, ior: 1.55, attenuationColor: new THREE.Color(0xe5f8ff),
      attenuationDistance: 12, clearcoat: 1, clearcoatRoughness: Math.min(0.12, roughness + 0.035), specularIntensity: 1, envMapIntensity: 2.1, transparent: true, opacity: 0.76, side: THREE.DoubleSide });
    const pane = new THREE.Group(), mesh = new THREE.Mesh(geo, mat); mesh.renderOrder = 4 + pi; pane.add(mesh);
    const edgeGeo = new THREE.EdgesGeometry(geo, 18);
    const line = (g, color, opacity) => new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    const whiteEdge = line(edgeGeo, 0xffffff, roughness > 0.08 ? 0.32 : 0.44); pane.add(whiteEdge);
    const cyanEdge = line(edgeGeo.clone(), 0x72e8ff, 0.18); cyanEdge.position.set(0.008, -0.002, -0.008); pane.add(cyanEdge);
    const pinkEdge = line(edgeGeo.clone(), 0xff6f8d, 0.14); pinkEdge.position.set(-0.009, 0.003, 0.006); pane.add(pinkEdge);
    const basePos = new THREE.Vector3(cent.x + rad.x * outward, cent.y + rad.y * outward, 0.28 + depthLift + rng() * 0.18);
    const baseRot = new THREE.Euler((rng() - 0.5) * 0.074, (rng() - 0.5) * 0.086, (rng() - 0.5) * 0.052);
    pane.position.copy(basePos); pane.rotation.copy(baseRot);
    pane.userData = { basePos: basePos.clone(), baseRot: { x: baseRot.x, y: baseRot.y, z: baseRot.z }, phase, speed: 0.28 + rng() * 0.16,
      drift: new THREE.Vector3(0.02 + rng() * 0.026, 0.018 + rng() * 0.024, 0.068 + rng() * 0.092), rotDrift: new THREE.Vector3(0.016 + rng() * 0.026, 0.018 + rng() * 0.03, 0.008 + rng() * 0.016),
      ptrWeight: 0.04 + rng() * 0.052, rad: rad.clone(), baseOpacity: 0.76, baseRoughness: roughness, glassMat: mat, edgeW: whiteEdge.material, edgeC: cyanEdge.material, edgeP: pinkEdge.material,
      edgeWBase: whiteEdge.material.opacity, edgeCBase: cyanEdge.material.opacity, edgePBase: pinkEdge.material.opacity };
    panes.push(pane); glassRig.add(pane); }
  scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x07040b, 1.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.4); keyLight.position.set(-3.8, 4.4, 5.6); scene.add(keyLight);
  const edgeLight = new THREE.PointLight(0x8bdcff, 14, 12); edgeLight.position.set(3.1, 1.4, 3.4); scene.add(edgeLight);
  const warmLight = new THREE.PointLight(0xffc8a8, 7, 12); warmLight.position.set(-4.4, -2.2, 3.2); scene.add(warmLight);
  /* post: the source's EffectComposer chain, with the source's own three r147 passes (engine/vendor/libs/three-0.147/postprocessing,
     vendored 05/10/2026): RenderPass -> UnrealBloomPass(strength 0.32, radius 0.4, threshold 0.86) -> grain ShaderPass to screen */
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const composer = new THREE.EffectComposer(renderer); composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new THREE.RenderPass(scene, camera));
  composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(W, H), 0.32, 0.4, 0.86));
  const grainPass = new THREE.ShaderPass({ uniforms: { tDiffuse: { value: null }, time: { value: 0 }, strength: { value: 0.024 } }, vertexShader: VS,
    fragmentShader: "uniform sampler2D tDiffuse; uniform float time; uniform float strength; varying vec2 vUv; float n(vec2 v){ return fract(sin(dot(v + time, vec2(12.9898, 78.233))) * 43758.5453); }"
      + " void main(){ vec4 c = texture2D(tDiffuse, vUv); c.rgb += (n(vUv * vec2(1520.0, 940.0)) - 0.5) * strength; c.rgb = pow(max(c.rgb, vec3(0.0)), vec3(0.985)); gl_FragColor = c; }" });
  composer.addPass(grainPass);
  const composite = time => { grainPass.uniforms.time.value = time; composer.render(); };
  /* the source's pointer choreography (tl.to on a plain object), from time */
  const sio = gsap.parseEase("sine.inOut"), p2io = gsap.parseEase("power2.inOut");
  const KEYS = [[0.5, 3.5, 0.45, -0.15, sio], [4, 3.5, -0.35, 0.25, sio], [7.5, 3, 0.15, -0.35, sio], [10.5, 3, -0.45, 0.05, sio], [13.5, 3, 0.3, 0.2, sio], [16.5, 2.5, -0.1, -0.1, sio], [19, 1, 0.16, 0.04, p2io]];
  const ptrAt = t => { let x = 0.16, y = 0.04; for (const k of KEYS) { if (t <= k[0]) break; const e = k[4](Math.min(1, (t - k[0]) / k[1])); x += (k[2] - x) * e; y += (k[3] - y) * e; } return { x, y }; };
  const REVEAL_R = 2.18, PTR = new THREE.Vector2(), V2 = new THREE.Vector2();
  /* the source's renderScene(elapsed), unchanged */
  const draw = elapsed => {
    const ptr = ptrAt(elapsed); PTR.set(ptr.x * 4.86, ptr.y * 2.84);
    camera.position.set(ptr.x * 0.38, -ptr.y * 0.27, CAM_Z); camera.lookAt(0, 0, 0);
    textRig.position.set(-ptr.x * 0.56, ptr.y * 0.36, Math.sin(elapsed * 0.28) * 0.018); textRig.rotation.x = ptr.y * 0.028; textRig.rotation.y = ptr.x * 0.042;
    glassRig.rotation.x = -ptr.y * 0.064; glassRig.rotation.y = ptr.x * 0.078;
    edgeLight.position.x = 3.1 + ptr.x * 0.9; edgeLight.position.y = 1.4 + ptr.y * 0.55; warmLight.position.x = -4.4 - ptr.x * 0.65;
    for (let i = 0; i < panes.length; i++) {
      const pane = panes[i], d = pane.userData, t = elapsed * d.speed + d.phase;
      const ptrDist = PTR.distanceTo(V2.set(d.basePos.x, d.basePos.y)), reveal = Math.pow(Math.max(0, 1 - ptrDist / REVEAL_R), 2), shatter = reveal * 0.36;
      const awayX = d.basePos.x - PTR.x, awayY = d.basePos.y - PTR.y, awayLen = Math.max(Math.hypot(awayX, awayY), 0.001);
      const revealSpread = reveal * 0.24, shatterSpread = shatter * 0.68, pSlide = d.ptrWeight * 1.9;
      pane.position.x = d.basePos.x + Math.sin(t * 0.42) * d.drift.x + ptr.x * pSlide + (awayX / awayLen) * (revealSpread + shatterSpread);
      pane.position.y = d.basePos.y + Math.cos(t * 0.38) * d.drift.y - ptr.y * pSlide * 0.72 + (awayY / awayLen) * (revealSpread + shatterSpread * 0.84);
      pane.position.z = d.basePos.z + Math.sin(t * 0.52 + i) * d.drift.z + reveal * 0.32 + shatter * 0.74;
      pane.rotation.x = d.baseRot.x + Math.sin(t * 0.46) * d.rotDrift.x - ptr.y * d.ptrWeight * 1.15 + reveal * (awayY / awayLen) * 0.16 + shatter * (awayY / awayLen) * 0.58;
      pane.rotation.y = d.baseRot.y + Math.cos(t * 0.43) * d.rotDrift.y + ptr.x * d.ptrWeight * 1.38 - reveal * (awayX / awayLen) * 0.2 - shatter * (awayX / awayLen) * 0.66;
      pane.rotation.z = d.baseRot.z + Math.sin(t * 0.34) * d.rotDrift.z + reveal * Math.sin(t + i) * 0.028 + shatter * (d.rad.x * awayY - d.rad.y * awayX) * 0.18;
      d.glassMat.opacity = d.baseOpacity + shatter * 0.14; d.glassMat.roughness = Math.min(0.14, d.baseRoughness + shatter * 0.048);
      d.edgeW.opacity = d.edgeWBase + shatter * 0.34; d.edgeC.opacity = d.edgeCBase + shatter * 0.22; d.edgeP.opacity = d.edgePBase + shatter * 0.2; }
    composite(elapsed); };
  const P = { t: 0 };
  tl.fromTo(P, { t: 0 }, { t: C.dur, duration: C.dur, ease: "none", onUpdate: () => draw(P.t) }, C.at);
  /* readiness: one HTML-in-Canvas capture of the headline. A fresh kit Chromium loses its first WebGL context ~0.15 s after creation and
     restores it ~1 s later: capture after it settles, rebuild the PMREM env map when it comes back. */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const settle = wait(600);
  glc.addEventListener("webglcontextrestored", () => { makeEnv(); backdropTex.needsUpdate = true; draw(P.t); });
  const gpuOk = async () => { await settle; if (renderer.getContext().isContextLost())
    await Promise.race([new Promise(r => glc.addEventListener("webglcontextrestored", () => setTimeout(r, 0), { once: true })), wait(20000)]); };
  const capture = async () => {
    const F = getComputedStyle(textEl).fontFamily || "sans-serif";
    await Promise.all(["400", "600", "800", "900"].map(w => document.fonts.load(w + " 40px " + F).catch(() => {}))); await document.fonts.ready;
    const cx = cap.getContext("2d");
    if (!cx || typeof cx.drawElementImage !== "function") { console.warn("glass/vfx-glass: HTML-in-Canvas (drawElementImage) not available, the headline stays empty"); return; }
    for (let k = 0; k < 60; k++) {
      await new Promise(r => { let done = false; const f = () => { if (!done) { done = true; cap.onpaint = null; r(); } }; cap.onpaint = f; if (cap.requestPaint) cap.requestPaint(); setTimeout(f, 150); });
      try { cx.clearRect(0, 0, 1920, 1080); cx.drawElementImage(textEl, 0, 0, 1920, 1080); const b = back.getContext("2d"); b.clearRect(0, 0, 1920, 1080); b.drawImage(cap, 0, 0); backdropTex.needsUpdate = true; return; }
      catch (e) { await wait(50); } }
    console.warn("glass/vfx-glass: the headline capture never succeeded"); };
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady[${J("aimk-" + wrap.id)}] = gpuOk().then(capture).then(gpuOk).then(() => draw(P.t));
  draw(P.t);`);
    }
  },
});
