/* glass/ios-home: a 3D iPhone (GLTF) on a dark shader backdrop with a metal floor. Its screen is an iOS 26 style home screen (status bar,
   4 x 6 app grid with badges, search pill, glass dock) and three liquid-glass notifications drop in from the status area (0.85 / 1.7 / 2.55 s),
   while the camera eases back (0.5 -> 12.5 s) and the phone breathes through three slow tilts.
   Port of HyperFrames registry block ios26-liquid-glass. BLOCK: the target is an empty box (usually the whole frame).
   How it renders (seek-safe): the home screen is real HTML inside a <canvas layoutsubtree>; it never changes, so it is captured ONCE with
   drawElementImage (HTML-in-Canvas) when the film loads (window.__hf.buildReady waits for it and for the model). Every frame is then a pure
   function of time: notifications are drawn on a 2D canvas over that capture (blurred-glass cards, as in the source), uploaded as the screen
   texture, and three.js renders the scene. Everything per frame lives in ctx.code (a proxy tween with onUpdate). */
AIMK.preset("glass/ios-home", {
  params: {
    time: "15:16", battery: "92", search: "Search",
    /* the source's own app icons and labels (assets/icons/*.jpg, HyperFrames registry) */
    apps: [
      { label: "Weather", icon: "icons/weather.jpg" }, { label: "Stocks", icon: "icons/stocks.jpg" }, { label: "Find My", icon: "icons/find-my.jpg" }, { label: "Home", icon: "icons/home.jpg" },
      { label: "Books", icon: "icons/books.jpg" }, { label: "iTunes Store", icon: "icons/itunes-store.jpg" }, { label: "Fitness", icon: "icons/fitness.jpg" }, { label: "Watch", icon: "icons/watch.jpg" },
      { label: "Contacts", icon: "icons/contacts.jpg" }, { label: "Files", icon: "icons/files.jpg" }, { label: "Translate", icon: "icons/translate.jpg" }, { label: "Calendar", icon: "icons/calendar.jpg" },
      { label: "Photos", icon: "icons/photos.jpg" }, { label: "ChatGPT", icon: "icons/chatgpt.jpg" }, { label: "Slack", icon: "icons/slack.jpg" }, { label: "Instagram", icon: "icons/instagram.jpg", badge: "1" },
      { label: "X", icon: "icons/x.jpg", badge: "4" }, { label: "Proton Mail", icon: "icons/proton-mail.jpg", badge: "797" }, { label: "Gmail", icon: "icons/gmail.jpg", badge: "31.8K" }, { label: "Revolut", icon: "icons/revolut.jpg" },
      { label: "Phone", icon: "icons/phone.jpg", badge: "9+" }, { label: "Brave", icon: "icons/brave.jpg" }, { label: "WhatsApp", icon: "icons/whatsapp.jpg", badge: "282" }, { label: "Music", icon: "icons/music.jpg" },
    ],
    dock: [{ icon: "icons/phone.jpg", badge: "9+" }, { icon: "icons/brave.jpg" }, { icon: "icons/whatsapp.jpg", badge: "282" }, { icon: "icons/music.jpg" }],
    notifications: [
      { icon: "icons/notify-messages.jpg", title: "Messages", time: "now", body: "Liquid Glass preview is ready for review." },
      { icon: "icons/slack.jpg", title: "HyperFrames", time: "1m", body: "One-worker render is ready." },      // the source draws the HyperFrames notification with slack.jpg
      { icon: "icons/gmail.jpg", title: "Gmail", time: "2m", body: "Preview videos are live on CDN." },
    ],
    mono_icons: true,      // the source's look: app and dock icons in clear / grey glass (grayscale filter)
    duration: 15,          // length of the block's own motion (source composition: 15 s)
  },
  build(tl, els, p, ctx) {
    const J = JSON.stringify;
    const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const src = f => (/^icons\//.test(f) || !/[\/:]/.test(f) ? ctx.asset(f) : f);   // a bare name or icons/<name> = this preset's assets/, any other path = the project's own file
    ctx.css("glass/ios-home", `
.aimk-ih { position: absolute; inset: 0; overflow: hidden; z-index: 0; background: #050508; }
.aimk-ih .ih-cap { position: absolute; top: 0; left: 0; width: 390px; height: 844px; z-index: -1; pointer-events: none; }
.aimk-ih .ih-gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
.aimk-ih .ih-pre { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.aimk-ih .ih-screen { width: 390px; height: 844px; overflow: hidden; font-family: inherit; color: #e2e8f0; }
.aimk-ih .ios-home { position: relative; height: 844px; overflow: hidden; background: #010101; color: #fff; }
.aimk-ih .ios-wallpaper { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(12, 16, 24, 0.96), transparent 31%), radial-gradient(circle at 50% 54%, rgba(255, 255, 255, 0.06), transparent 8%), linear-gradient(180deg, #020202, #000); }
.aimk-ih .ios-wallpaper::before, .aimk-ih .ios-wallpaper::after { content: ""; position: absolute; left: 92px; top: 210px; width: 210px; height: 360px; border-radius: 50% 50% 42% 46%; border: 4px solid transparent;
  background: linear-gradient(#020202, #020202) padding-box, conic-gradient(from 215deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.92), rgba(53, 131, 255, 0.92), rgba(38, 255, 168, 0.8), rgba(255, 63, 54, 0.72), rgba(255, 255, 255, 0)) border-box;
  filter: blur(0.35px) saturate(1.25); opacity: 0.82; transform: rotate(7deg); }
.aimk-ih .ios-wallpaper::after { left: 118px; top: 400px; width: 140px; height: 190px; border-width: 3px; opacity: 0.62; transform: rotate(-27deg); }
.aimk-ih .ios-status { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: 27px 30px 10px; color: #f6f6f6; font-size: 22px; font-weight: 760; letter-spacing: 0; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55); }
.aimk-ih .ios-status-left, .aimk-ih .ios-status-right { display: flex; align-items: center; gap: 8px; }
.aimk-ih .ios-location { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 999px; background: #2f80ed; }
.aimk-ih .ios-location::after { content: ""; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 7px solid #fff; margin-top: -1px; }
.aimk-ih .ios-signal { display: flex; align-items: end; gap: 3px; height: 18px; }
.aimk-ih .ios-signal span { width: 5px; border-radius: 3px; background: rgba(255, 255, 255, 0.92); }
.aimk-ih .ios-signal span:nth-child(1) { height: 7px; } .aimk-ih .ios-signal span:nth-child(2) { height: 10px; } .aimk-ih .ios-signal span:nth-child(3) { height: 13px; }
.aimk-ih .ios-signal span:nth-child(4) { height: 17px; background: rgba(255, 255, 255, 0.48); }
.aimk-ih .ios-wifi { position: relative; width: 23px; height: 17px; }
.aimk-ih .ios-wifi span { position: absolute; left: 50%; border: 4px solid rgba(255, 255, 255, 0.94); border-color: rgba(255, 255, 255, 0.94) transparent transparent transparent; border-radius: 50%; transform: translateX(-50%); }
.aimk-ih .ios-wifi span:nth-child(1) { top: 0; width: 28px; height: 28px; } .aimk-ih .ios-wifi span:nth-child(2) { top: 6px; width: 18px; height: 18px; }
.aimk-ih .ios-wifi span:nth-child(3) { top: 13px; width: 7px; height: 7px; border-radius: 999px; background: #fff; border: 0; }
.aimk-ih .ios-battery { position: relative; min-width: 34px; height: 21px; padding: 1px 5px 0; border-radius: 6px; background: #59d768; color: #fff; font-size: 15px; font-weight: 850; line-height: 20px; }
.aimk-ih .ios-battery::after { content: ""; position: absolute; right: -3px; top: 7px; width: 3px; height: 7px; border-radius: 0 3px 3px 0; background: rgba(255, 255, 255, 0.5); }
.aimk-ih .ios-app-grid { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 22px; padding: 20px 28px 0; }
.aimk-ih .ios-app { position: relative; text-align: center; }
.aimk-ih .ios-app-icon, .aimk-ih .ios-dock-icon { display: block; object-fit: cover; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.24); }
.aimk-ih.ih-mono .ios-app-icon, .aimk-ih.ih-mono .ios-dock-icon { filter: grayscale(1) saturate(0.08) contrast(1.2) brightness(0.86); }
.aimk-ih .ios-app-icon { width: 62px; height: 62px; margin: 0 auto 7px; border-radius: 18px; }
.aimk-ih .ios-app-label { color: #fff; font-size: 13px; font-weight: 640; line-height: 1.1; text-shadow: 0 1px 5px rgba(0, 0, 0, 0.65); white-space: nowrap; }
.aimk-ih .ios-badge { position: absolute; top: -8px; right: -8px; min-width: 24px; padding: 3px 7px; border-radius: 999px; background: #f7f7f7; color: #303030; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.32); }
.aimk-ih .ios-search-pill { position: absolute; z-index: 2; left: 50%; bottom: 105px; display: flex; align-items: center; justify-content: center; gap: 7px; width: 116px; padding: 9px 0; border-radius: 19px;
  background: rgba(255, 255, 255, 0.11); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.72); font-size: 15px; font-weight: 650; text-align: center; transform: translateX(-50%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.17), 0 10px 22px rgba(0, 0, 0, 0.34); white-space: nowrap; }
.aimk-ih .ios-search-pill::before { content: ""; width: 12px; height: 12px; border: 3px solid rgba(255, 255, 255, 0.72); border-radius: 999px; box-sizing: border-box; }
.aimk-ih .ios-search-pill::after { content: ""; width: 7px; height: 3px; border-radius: 999px; background: rgba(255, 255, 255, 0.72); transform: rotate(45deg) translate(-6px, 6px); margin-left: -10px; }
.aimk-ih .ios-dock { position: absolute; z-index: 2; left: 14px; right: 14px; bottom: 13px; display: flex; justify-content: space-around; padding: 10px 16px; border-radius: 37px;
  background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); -webkit-backdrop-filter: blur(18px) saturate(1.2); backdrop-filter: blur(18px) saturate(1.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 14px 36px rgba(0, 0, 0, 0.24); }
.aimk-ih .ios-dock-item { position: relative; width: 62px; height: 62px; }
.aimk-ih .ios-dock-icon { width: 62px; height: 62px; border-radius: 18px; }`);
    for (const slot of els) {
      const W = Math.round(slot.offsetWidth || ctx.W), H = Math.round(slot.offsetHeight || ctx.H);
      const wrap = ctx.make(slot, "div", "ih", { cls: "aimk-ih" + (p.mono_icons ? " ih-mono" : "") });
      const cap = ctx.make(wrap, "canvas", "cap", { cls: "ih-cap", attrs: { layoutsubtree: "", width: 390, height: 844, "aria-hidden": "true" } });
      const badge = b => (b != null && b !== "" ? `<span class="ios-badge">${esc(b)}</span>` : "");
      const apps = p.apps.map(a => `<div class="ios-app"><img class="ios-app-icon" src="${esc(src(a.icon))}" alt="">${badge(a.badge)}<div class="ios-app-label">${esc(a.label)}</div></div>`).join("");
      const dock = p.dock.map(a => `<div class="ios-dock-item"><img class="ios-dock-icon" src="${esc(src(a.icon))}" alt="">${badge(a.badge)}</div>`).join("");
      const screen = ctx.make(cap, "div", "screen", { cls: "ih-screen", html:
        `<div class="ios-home"><div class="ios-wallpaper"></div>` +
        `<div class="ios-status"><div class="ios-status-left"><span style="font-variant-numeric: tabular-nums">${esc(p.time)}</span><span class="ios-location"></span></div>` +
        `<div class="ios-status-right"><div class="ios-signal"><span></span><span></span><span></span><span></span></div><div class="ios-wifi"><span></span><span></span><span></span></div><div class="ios-battery">${esc(p.battery)}</div></div></div>` +
        `<div class="ios-app-grid">${apps}</div><div class="ios-search-pill">${esc(p.search)}</div><div class="ios-dock">${dock}</div></div>` });
      const icons = p.notifications.map((n, i) => ctx.make(wrap, "img", "n" + i, { cls: "ih-pre", attrs: { src: src(n.icon), alt: "" } }));
      const gl = ctx.make(wrap, "canvas", "gl", { cls: "ih-gl", attrs: { width: W, height: H } });
      const C = { W, H, at: p.at, dur: p.duration, model: ctx.asset("iphone.glb"), root: wrap.id, cap: cap.id, screen: screen.id, gl: gl.id,
        notes: p.notifications.map((n, i) => ({ img: icons[i].id, title: String(n.title || ""), time: String(n.time || ""), body: String(n.body || "") })) };
      ctx.code(`  /* glass/ios-home #${wrap.id}: three.js iPhone + home screen captured once (HTML-in-Canvas) + canvas glass notifications; a pure function of time */
  const C = ${J(C)}, THREE = window.THREE, PI = Math.PI;
  const glc = document.getElementById(C.gl), cap = document.getElementById(C.cap), html = document.getElementById(C.screen);
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(C.W, C.H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.outputEncoding = THREE.sRGBEncoding; renderer.setClearColor(0x050508, 1);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050508);
  const camera = new THREE.PerspectiveCamera(34, C.W / C.H, 0.1, 100);
  /* environment map: a painted gradient with light strips (source values) */
  const eC = document.createElement("canvas"); eC.width = 1024; eC.height = 512; const ec = eC.getContext("2d");
  const eg = ec.createLinearGradient(0, 0, 1024, 512);
  [[0, "#020307"], [0.15, "#1a1a2e"], [0.3, "#ffffff"], [0.45, "#0a0a1e"], [0.6, "#ffffff"], [0.75, "#1e1e2e"], [1, "#020307"]].forEach(s => eg.addColorStop(s[0], s[1]));
  ec.fillStyle = eg; ec.fillRect(0, 0, 1024, 512); ec.globalCompositeOperation = "screen";
  for (let i = 0; i < 7; i++) { ec.fillStyle = "rgba(255,255,255," + (i % 2 === 0 ? 0.15 : 0.08) + ")"; ec.fillRect((i % 3) * 100, 60 + i * 56, 700, 3 + (i % 2) * 2); }
  const eT = new THREE.CanvasTexture(eC); eT.mapping = THREE.EquirectangularReflectionMapping;
  const makeEnv = () => { const pm = new THREE.PMREMGenerator(renderer); if (scene.environment) scene.environment.dispose(); scene.environment = pm.fromEquirectangular(eT).texture; pm.dispose(); };
  makeEnv();
  /* shader backdrop, floor, lights (source values) */
  const bgU = { uTime: { value: 0 }, uAspect: { value: C.W / C.H } };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(28, 16), new THREE.ShaderMaterial({ uniforms: bgU, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: "uniform float uTime;uniform float uAspect;varying vec2 v;float wave(vec2 p,float s,float t){return sin(p.x*s+p.y*s*.57+uTime*t);}void main(){vec2 p=v*2.0-1.0;p.x*=uAspect;float w=wave(p,3.0,.22)+.55*wave(p.yx+vec2(.7,-.2),5.1,.16)+.32*wave(p+vec2(-.4,.5),8.0,-.12);float a=smoothstep(-.75,1.05,w);vec3 navy=vec3(.015,.013,.055);vec3 cyan=vec3(.02,.42,.72);vec3 violet=vec3(.30,.08,.55);vec3 amber=vec3(.95,.42,.04);float ribbon=smoothstep(.22,.95,sin(p.x*2.2-p.y*3.1+uTime*.18));vec3 c=mix(navy,cyan,a);c=mix(c,violet,smoothstep(.16,1.1,wave(p+vec2(.8,.1),2.4,.1)));c+=amber*ribbon*.33;float glow=exp(-dot(p+vec2(.62,-.08),p+vec2(.62,-.08))*1.7);c+=vec3(.10,.45,.55)*glow;float vign=smoothstep(1.85,.25,length(p));gl_FragColor=vec4(c*vign,1.0);}" }));
  bg.position.z = -7.5; scene.add(bg);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x081427, metalness: 0.86, roughness: 0.22 }));
  floor.rotation.x = -PI / 2; floor.position.y = -2.5; scene.add(floor);
  scene.add(new THREE.AmbientLight(0x222233, 0.5));
  const kL = new THREE.DirectionalLight(0xffffff, 2.2); kL.position.set(-3, 4, 5); scene.add(kL);
  const rL = new THREE.PointLight(0x6366f1, 3, 15); rL.position.set(4, 2, 3); scene.add(rL);
  const wL = new THREE.PointLight(0xffc8a8, 1.5, 12); wL.position.set(-3, -1, 4); scene.add(wL);
  /* the screen: base = home screen (captured once), scr = base + notifications = the phone's screen texture */
  const base = document.createElement("canvas"); base.width = 390; base.height = 844;
  const scr = document.createElement("canvas"); scr.width = 390; scr.height = 844; const sx = scr.getContext("2d");
  const tex = new THREE.CanvasTexture(scr); tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const turntable = new THREE.Group(); scene.add(turntable);
  const phoneGrp = new THREE.Group(); turntable.add(phoneGrp);
  /* the model ships UVs for a tiling material: planar UVs from the screen mesh's own bounds (source) */
  const planarScreenUv = mesh => { const g = mesh.geometry; g.computeBoundingBox(); const bb = g.boundingBox, pos = g.attributes.position;
    const w = bb.max.x - bb.min.x || 1, h = bb.max.y - bb.min.y || 1, uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - bb.min.x) / w; uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / h; }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); };
  /* the animation assumes a screen facing -Z (source) */
  const alignScreenToMinusZ = (root, frontName, backName) => { const front = root.getObjectByName(frontName), back = root.getObjectByName(backName);
    if (!front || !back) return; root.updateWorldMatrix(true, true); const fp = new THREE.Vector3(), bp = new THREE.Vector3();
    front.getWorldPosition(fp); back.getWorldPosition(bp); if (fp.z > bp.z) root.rotation.y += Math.PI; };
  const cbz = (p1x, p1y, p2x, p2y) => { const ax = 3 * p1x - 3 * p2x + 1, bx = 3 * p2x - 6 * p1x, cx = 3 * p1x, ay = 3 * p1y - 3 * p2y + 1, by = 3 * p2y - 6 * p1y, cy = 3 * p1y;
    return t => { let s = t; for (let i = 0; i < 12; i++) { const x = ((ax * s + bx) * s + cx) * s - t, dx = (3 * ax * s + 2 * bx) * s + cx; if (Math.abs(dx) < 1e-10) break; s -= x / dx; }
      s = Math.max(0, Math.min(1, s)); return ((ay * s + by) * s + cy) * s; }; };
  const notificationEase = cbz(0.22, 0.0, 0.16, 1.0), driftEase = cbz(0.45, 0.0, 0.15, 1.0), breatheEase = cbz(0.37, 0.0, 0.63, 1.0);
  const c01 = v => Math.max(0, Math.min(1, v)), seg = (t, t0, d, a, b, e) => a + (b - a) * e(c01((t - t0) / d));
  const font = (getComputedStyle(document.getElementById(C.root)).fontFamily || "sans-serif") + ", sans-serif";
  const rr = (c, x, y, w, h, r) => { const q = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + q, y); c.lineTo(x + w - q, y); c.quadraticCurveTo(x + w, y, x + w, y + q);
    c.lineTo(x + w, y + h - q); c.quadraticCurveTo(x + w, y + h, x + w - q, y + h); c.lineTo(x + q, y + h); c.quadraticCurveTo(x, y + h, x, y + h - q); c.lineTo(x, y + q); c.quadraticCurveTo(x, y, x + q, y); c.closePath(); };
  const fit = (c, s, max) => { if (c.measureText(s).width <= max) return s; while (s.length > 1 && c.measureText(s + "\\u2026").width > max) s = s.slice(0, -1); return s + "\\u2026"; };
  /* one glass notification card on the 2D screen canvas (source drawNotificationCard; copy: film font, long text ends with an ellipsis) */
  const card = (c, prog, top, n) => {
    const pr = c01(prog); if (pr <= 0.001) return;
    const q = notificationEase(pr), lift = Math.sin(q * PI), y = 106 + top + (1 - q) * -58 + lift * 6, x = 13, w = 364, h = 66 + lift * 2;
    c.save(); c.globalAlpha = q * 0.98; c.shadowColor = "rgba(0,0,0,0.54)"; c.shadowBlur = 22; c.shadowOffsetY = 14;
    rr(c, x, y, w, h, 23); c.clip();
    c.filter = "blur(12px) saturate(1.55) brightness(1.24)"; c.drawImage(base, -4, -4, 398, 852); c.filter = "none";
    rr(c, x, y, w, h, 23); const fill = c.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, "rgba(255,255,255,0.54)"); fill.addColorStop(0.45, "rgba(188,202,219,0.46)"); fill.addColorStop(1, "rgba(94,108,130,0.36)"); c.fillStyle = fill; c.fill();
    c.globalCompositeOperation = "screen"; const ca = c.createLinearGradient(x + 40, y, x + w - 20, y + h);
    ca.addColorStop(0, "rgba(255,255,255,0.18)"); ca.addColorStop(0.36, "rgba(117,230,255,0.15)"); ca.addColorStop(0.64, "rgba(255,143,220,0.12)"); ca.addColorStop(1, "rgba(255,255,255,0.08)");
    c.fillStyle = ca; c.fillRect(x, y, w, h); c.globalCompositeOperation = "source-over"; c.shadowColor = "transparent";
    rr(c, x + 0.5, y + 0.5, w - 1, h - 1, 22.5); c.strokeStyle = "rgba(255,255,255,0.72)"; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.moveTo(x + 24, y + 11); c.bezierCurveTo(x + 105, y - 2, x + 220, y + 7, x + w - 42, y + 12); c.strokeStyle = "rgba(255,255,255,0.38)"; c.lineWidth = 2; c.stroke();
    rr(c, x + 10, y + 14, 38, 38, 11); c.fillStyle = "rgba(255,255,255,0.58)"; c.fill();
    const icon = document.getElementById(n.img);
    if (icon && icon.complete && icon.naturalWidth) { c.save(); rr(c, x + 10, y + 14, 38, 38, 11); c.clip(); c.drawImage(icon, x + 10, y + 14, 38, 38); c.restore(); }
    c.fillStyle = "#fff"; c.shadowColor = "rgba(0,0,0,0.32)"; c.shadowBlur = 3; c.shadowOffsetY = 1; c.textBaseline = "top";
    c.font = "800 12px " + font; const tw = c.measureText(n.time).width;
    c.font = "800 13px " + font; c.fillText(fit(c, n.title, w - 60 - tw - 26), x + 60, y + 13);
    c.globalAlpha = q * 0.92; c.font = "800 12px " + font; c.fillText(n.time, x + w - tw - 14, y + 13);
    c.globalAlpha = q * 0.95; c.font = "650 12px " + font; c.fillText(fit(c, n.body, w - 74), x + 60, y + 34);
    c.restore(); };
  let shot = false, lastKey = "";
  const compose = ns => { const key = ns.map(v => v.toFixed(5)).join(); if (key === lastKey) return; lastKey = key;
    sx.clearRect(0, 0, 390, 844); sx.drawImage(base, 0, 0); ns.forEach((v, i) => C.notes[i] && card(sx, v, i * 68, C.notes[i])); tex.needsUpdate = true; };
  /* every frame from the block's own time t (seconds since C.at): camera drift 0.5 -> 12.5 s, three tilts, notifications, ambient drift */
  const draw = t => {
    const cZ = seg(t, 0.5, 12, 6.15, 6.45, driftEase), cY = seg(t, 0.5, 12, 0.18, 0.16, driftEase);
    let rY, rX;
    if (t < 4.5) { rY = seg(t, 0.5, 4, PI, PI + 0.04, breatheEase); rX = seg(t, 0.5, 4, 0, 0.01, breatheEase); }
    else if (t < 8.5) { rY = seg(t, 4.5, 4, PI + 0.04, PI - 0.03, breatheEase); rX = seg(t, 4.5, 4, 0.01, -0.008, breatheEase); }
    else { rY = seg(t, 8.5, 4, PI - 0.03, PI + 0.02, breatheEase); rX = seg(t, 8.5, 4, -0.008, 0.005, breatheEase); }
    if (shot) compose([c01((t - 0.85) / 0.72), c01((t - 1.7) / 0.74), c01((t - 2.55) / 0.76)]);
    phoneGrp.position.set(Math.sin(t * 0.5) * 0.015, 0.1 + Math.sin(t * 0.7) * 0.008, 0.5 + Math.cos(t * 0.4) * 0.008);
    phoneGrp.rotation.set(rX, rY, 0);
    bgU.uTime.value = t;
    camera.position.set(0, cY, cZ); camera.lookAt(0, 0.1, 0);
    renderer.render(scene, camera); };
  const P = { t: 0 };
  tl.fromTo(P, { t: 0 }, { t: C.dur, duration: C.dur, ease: "none", onUpdate: () => draw(P.t) }, C.at);
  /* setup the renderer waits for (window.__hf.buildReady, HyperFrames' own mechanism): the model, then one HTML-in-Canvas capture of the screen.
     A fresh kit Chromium loses its first WebGL context ~0.15 s after creation and restores it ~1 s later (GPU process restart, measured on a
     bare WebGL page): wait for the GPU to settle before capturing, and rebuild the GPU-only state (the PMREM env map) when it comes back. */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const settle = wait(600);
  glc.addEventListener("webglcontextrestored", () => { makeEnv(); lastKey = ""; tex.needsUpdate = true; draw(P.t); });
  const gpuOk = async () => { await settle; if (renderer.getContext().isContextLost())
    await Promise.race([new Promise(r => glc.addEventListener("webglcontextrestored", () => setTimeout(r, 0), { once: true })), wait(20000)]); };
  const loadModel = () => new Promise((ok, no) => new THREE.GLTFLoader().load(C.model, gltf => {
    const m = gltf.scene, box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3());
    m.scale.setScalar(3.2 / sz.y); box.setFromObject(m); m.position.sub(box.getCenter(new THREE.Vector3()));
    m.traverse(ch => { if (ch.isMesh && ch.name.indexOf("front-glass") === 0) { planarScreenUv(ch); ch.material = new THREE.MeshBasicMaterial({ map: tex }); } });
    alignScreenToMinusZ(m, "front-glass", "rear-window"); phoneGrp.add(m); ok(); }, undefined, no));
  const capture = async () => {
    await Promise.all([...cap.querySelectorAll("img"), ...C.notes.map(n => document.getElementById(n.img))].filter(Boolean).map(i => i.complete ? (i.decode ? i.decode().catch(() => {}) : 0)
      : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
    await Promise.all(["400", "650", "760", "800", "850"].map(w => document.fonts.load(w + " 16px " + font).catch(() => {}))); await document.fonts.ready;
    const cx = cap.getContext("2d");
    if (!cx || typeof cx.drawElementImage !== "function") { console.warn("glass/ios-home: HTML-in-Canvas (drawElementImage) not available, the screen stays black"); return; }
    for (let k = 0; k < 60; k++) {          /* drawElementImage draws the last PAINTED state: ask for a paint, then capture */
      await new Promise(r => { let done = false; const f = () => { if (!done) { done = true; cap.onpaint = null; r(); } }; cap.onpaint = f; if (cap.requestPaint) cap.requestPaint(); setTimeout(f, 150); });
      try { cx.clearRect(0, 0, 390, 844); cx.drawElementImage(html, 0, 0, 390, 844); const bx = base.getContext("2d"); bx.clearRect(0, 0, 390, 844); bx.drawImage(cap, 0, 0); shot = true; return; }
      catch (e) { await wait(50); } }
    console.warn("glass/ios-home: the screen capture never succeeded"); };
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady[${J("aimk-" + wrap.id)}] = Promise.all([loadModel().catch(e => console.warn("glass/ios-home: model", e)), gpuOk().then(capture)])
    .then(gpuOk).then(() => { lastKey = ""; draw(P.t); });
  draw(P.t);`);
    }
  },
});
