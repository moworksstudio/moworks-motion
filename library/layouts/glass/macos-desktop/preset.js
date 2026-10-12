/* glass/macos-desktop: a 3D MacBook (GLTF) on a dark shader backdrop with a metal floor, its screen a macOS Tahoe style desktop (wallpaper,
   frosted menu bar, calendar / weather / now-playing widgets, a Finder window, a glass dock) with liquid-glass panels painted over it; a
   Messages toast slides in at 0.45 s and bumps at 4.25 s while the camera pulls back slowly (4.5 -> 7, 0.5 -> 12.5 s) and the laptop
   breathes through three small turns.
   Port of HyperFrames registry block macos-tahoe-liquid-glass. BLOCK: the target is an empty box (usually the whole frame).
   Seek-safe rendering: the desktop HTML (inside a <canvas layoutsubtree>) is captured once with drawElementImage, without and with its
   toast; the source's canvas glass overlay (menu bar, widgets, Finder, dock) is painted once over it; per frame only the toasts move (HTML
   toast from the second capture, canvas toast redrawn), then three.js renders: a pure function of time in ctx.code. */
AIMK.preset("glass/macos-desktop", {
  params: {
    wallpaper: "wallpapers/golden-gate-bridge-san-francisco-5k-0g.jpg",   // the source's own wallpaper and app icons (assets/), as shipped in the HF registry
    app: "Finder", menu: ["Tệp", "Sửa", "Xem", "Đi", "Cửa sổ", "Trợ giúp"], status: ["92%", "Wi-Fi", "T3 1 Thg 4  9:41"],
    month: "THÁNG 4", weekdays: ["CN", "2", "3", "4", "5", "6", "7"],
    city: "Đà Lạt", temp: "18°", weather: "Có mây", hilo: "C:22° T:14°",
    playing: "Đang phát", track: "Bản phối kính lỏng",
    window_title: "Dự án",
    sidebar: [{ label: "Ưa thích", icon: "icons/finder.png" }, { label: "Nhà", icon: "icons/files.jpg" }, { label: "Màn hình nền", icon: "icons/safari.jpg" },
              { label: "Tải về", icon: "icons/mail.jpg" }, { label: "Hình ảnh", icon: "icons/photos.jpg" }, { label: "Nhạc", icon: "icons/music.jpg" }],
    files: [{ name: "tai-lieu" }, { name: "hinh-anh" }, { name: "video" }, { name: "am-thanh" }, { name: "kich-ban.md", doc: true }, { name: "ghi-chu.txt", doc: true },
            { name: "ban-nhap" }, { name: "xuat-ban" }],
    dock: ["icons/dock-finder.png", "icons/dock-safari.jpg", "icons/dock-mail.jpg", "icons/calendar.jpg", "icons/dock-photos.jpg", "icons/messages.jpg", "icons/dock-music.jpg", "icons/brave.jpg", "icons/slack.jpg"],
    toast: { icon: "icons/toast-messages.jpg", title: "Tin nhắn", time: "bây giờ", body: "Bản xem trước Liquid Glass đã sẵn sàng." },
    duration: 15,
  },
  build(tl, els, p, ctx) {
    const J = JSON.stringify;
    const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const src = f => (/^(icons|wallpapers)\//.test(f) || !/[\/:]/.test(f) ? ctx.asset(f) : f);   // a bare name, icons/<name> or wallpapers/<name> = this preset's assets/, any other path = the project's own file
    ctx.css("glass/macos-desktop", `
.aimk-mt { position: absolute; inset: 0; overflow: hidden; z-index: 0; background: #050508; }
.aimk-mt .mt-cap { position: absolute; top: 0; left: 0; width: 1440px; height: 900px; z-index: -1; pointer-events: none; }
.aimk-mt .mt-gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
.aimk-mt .mt-screen { width: 1440px; height: 900px; overflow: hidden; font-family: inherit; color: #e2e8f0; }
.aimk-mt .tahoe-desktop { position: relative; width: 1440px; height: 900px; overflow: hidden; isolation: isolate; color: #fff; }
.aimk-mt .tahoe-wall { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center center; z-index: -2; }
.aimk-mt .tahoe-shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(7, 18, 34, 0.08), rgba(7, 18, 34, 0.02) 44%, rgba(7, 18, 34, 0.22)); }
.aimk-mt .tahoe-desktop::before { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.2), transparent 28%), linear-gradient(90deg, rgba(0, 0, 0, 0.1), transparent 32%, rgba(255, 255, 255, 0.08)); }
.aimk-mt .tahoe-menu-bar { position: relative; z-index: 6; display: flex; align-items: center; gap: 14px; height: 28px; padding: 5px 14px; background: rgba(20, 47, 83, 0.28);
  border-bottom: 1px solid rgba(255, 255, 255, 0.22); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38); font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.94); backdrop-filter: blur(30px) saturate(1.45); white-space: nowrap; }
.aimk-mt .tahoe-mark { width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.94); }
.aimk-mt .tahoe-stage { position: relative; z-index: 5; height: 690px; }
.aimk-mt .tahoe-window { position: absolute; left: 106px; top: 226px; width: 610px; height: 360px; z-index: 5; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.34); border-radius: 18px;
  background: rgba(246, 252, 255, 0.7); color: rgba(18, 40, 66, 0.92); backdrop-filter: blur(26px) saturate(1.3); box-shadow: 0 22px 58px rgba(6, 38, 82, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.62); }
.aimk-mt .tahoe-window-titlebar { display: flex; align-items: center; gap: 8px; height: 38px; padding: 9px 14px; background: rgba(255, 255, 255, 0.34); border-bottom: 1px solid rgba(255, 255, 255, 0.28); }
.aimk-mt .tahoe-traffic-light { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
.aimk-mt .tahoe-finder-body { position: relative; display: flex; height: 322px; }
.aimk-mt .tahoe-sidebar { width: 158px; padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.26); background: rgba(255, 255, 255, 0.2); font-size: 10px; }
.aimk-mt .tahoe-sidebar-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; color: rgba(10, 35, 64, 0.78); white-space: nowrap; }
.aimk-mt .tahoe-sidebar-row.active { background: rgba(52, 147, 236, 0.26); color: rgba(4, 50, 110, 0.98); font-weight: 700; }
.aimk-mt .tahoe-sidebar-icon { width: 16px; height: 16px; object-fit: cover; border-radius: 5px; flex: 0 0 auto; }
.aimk-mt .tahoe-file-grid { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 8px; align-content: start; padding: 18px 18px; }
.aimk-mt .tahoe-file { padding: 8px; text-align: center; }
.aimk-mt .tahoe-folder-icon, .aimk-mt .tahoe-document-icon { position: relative; width: 54px; height: 42px; margin: 0 auto 8px; border-radius: 10px; background: linear-gradient(180deg, #9fe1ff 0%, #258dff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 10px 20px rgba(0, 0, 0, 0.24); }
.aimk-mt .tahoe-folder-icon::before { content: ""; position: absolute; top: -7px; left: 6px; width: 26px; height: 12px; border-radius: 7px 7px 2px 2px; background: linear-gradient(180deg, #9ad8ff 0%, #3ca2ff 100%); }
.aimk-mt .tahoe-document-icon { width: 40px; height: 52px; border-radius: 8px; background: linear-gradient(180deg, #ffffff 0%, #cfd8e6 100%); }
.aimk-mt .tahoe-document-icon::after { content: ""; position: absolute; top: 9px; left: 9px; width: 22px; height: 3px; border-radius: 2px; background: #7b8796; box-shadow: 0 9px 0 #9aa5b2, 0 18px 0 #b2bcc8; }
.aimk-mt .tahoe-file-label { color: rgba(7, 31, 58, 0.94); font-size: 10px; font-weight: 700; line-height: 1.15; text-shadow: 0 1px 4px rgba(255, 255, 255, 0.6); }
.aimk-mt .tahoe-widgets { position: absolute; left: 28px; top: 44px; z-index: 5; display: grid; grid-template-columns: 92px 92px; gap: 8px; }
.aimk-mt .tahoe-widget { overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.42); border-radius: 18px; background: rgba(247, 253, 255, 0.72); color: rgba(14, 45, 76, 0.9);
  backdrop-filter: blur(26px) saturate(1.45); box-shadow: 0 18px 34px rgba(13, 61, 115, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.72); }
.aimk-mt .tahoe-calendar-widget { width: 92px; height: 110px; padding: 9px; }
.aimk-mt .tahoe-weather-widget { width: 92px; height: 110px; padding: 9px; background: linear-gradient(160deg, rgba(30, 119, 238, 0.72), rgba(255, 255, 255, 0.44)); color: #fff; }
.aimk-mt .tahoe-media-widget { grid-column: 1 / span 2; width: 192px; height: 96px; background: linear-gradient(140deg, rgba(13, 16, 22, 0.12), rgba(255, 255, 255, 0.24)),
  radial-gradient(circle at 18% 20%, #ffb88b, transparent 32%), radial-gradient(circle at 76% 28%, #ed2f7a, transparent 34%), linear-gradient(135deg, #451a03, #0f172a); }
.aimk-mt .tahoe-calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-top: 7px; font-size: 5.5px; font-weight: 800; text-align: center; color: rgba(20, 51, 83, 0.66); }
.aimk-mt .tahoe-notification { position: absolute; z-index: 7; top: 58px; right: 36px; width: 374px; display: flex; gap: 12px; min-height: 86px; padding: 14px 16px; border: 1px solid rgba(255, 255, 255, 0.42); border-radius: 28px;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.26) 48%, rgba(255, 255, 255, 0.42)), rgba(233, 249, 255, 0.56); color: #fff; backdrop-filter: blur(30px) saturate(1.55);
  box-shadow: 0 22px 46px rgba(4, 55, 112, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.72), inset 0 -18px 38px rgba(255, 255, 255, 0.1); }
.aimk-mt .tahoe-notification::before { content: ""; position: absolute; inset: 1px; border-radius: inherit; pointer-events: none; background: linear-gradient(120deg, rgba(255, 255, 255, 0.58), transparent 34%, rgba(255, 255, 255, 0.22)); mix-blend-mode: screen; opacity: 0.5; }
.aimk-mt .tahoe-notification img { position: relative; width: 40px; height: 40px; border-radius: 10px; object-fit: cover; flex: 0 0 auto; }
.aimk-mt .tahoe-panel-title { position: relative; color: rgba(8, 30, 58, 0.98); font-size: 17px; font-weight: 800; line-height: 1.1; text-shadow: 0 1px 6px rgba(255, 255, 255, 0.56); }
.aimk-mt .tahoe-panel-subtitle { position: relative; margin-top: 4px; color: rgba(9, 36, 66, 0.86); font-size: 12.5px; font-weight: 700; line-height: 1.35; text-shadow: 0 1px 6px rgba(255, 255, 255, 0.48); }
.aimk-mt .tahoe-dock { position: absolute; z-index: 6; left: 50%; bottom: 24px; width: auto; display: flex; align-items: flex-end; gap: 7px; padding: 8px 12px; border: 1px solid rgba(255, 255, 255, 0.42); border-radius: 22px;
  background: rgba(255, 255, 255, 0.52); transform: translateX(-50%); backdrop-filter: blur(28px) saturate(1.45); box-shadow: 0 22px 44px rgba(6, 38, 82, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.72); }
.aimk-mt .tahoe-dock-icon { display: block; width: 46px; height: 46px; object-fit: cover; border-radius: 13px; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28); }`);
    for (const slot of els) {
      const W = Math.round(slot.offsetWidth || ctx.W), H = Math.round(slot.offsetHeight || ctx.H);
      const wrap = ctx.make(slot, "div", "mt", { cls: "aimk-mt" });
      const cap = ctx.make(wrap, "canvas", "cap", { cls: "mt-cap", attrs: { layoutsubtree: "", width: 1440, height: 900, "aria-hidden": "true" } });
      const id = wrap.id;
      const days = [];
      for (let i = 0; i < 2; i++) days.push("<span></span>");
      for (let d = 1; d <= 26; d++) days.push(d === 1 ? '<span style="color: #fff; background: #f0423a; border-radius: 99px">1</span>' : `<span>${d}</span>`);
      const html =
        `<div class="tahoe-desktop"><img class="tahoe-wall" src="${esc(src(p.wallpaper))}" alt=""><div class="tahoe-shade"></div>` +
        `<div class="tahoe-menu-bar"><span class="tahoe-mark"></span><span style="font-weight: 600">${esc(p.app)}</span>${p.menu.map(m => `<span>${esc(m)}</span>`).join("")}` +
        `<div style="flex: 1"></div>${p.status.map(s => `<span style="font-size: 10px; font-variant-numeric: tabular-nums">${esc(s)}</span>`).join("")}</div>` +
        `<div class="tahoe-widgets"><div class="tahoe-widget tahoe-calendar-widget"><div style="font-size: 6px; font-weight: 900; color: rgba(249, 66, 58, 0.84)">${esc(p.month)}</div>` +
        `<div class="tahoe-calendar-days">${p.weekdays.map(w => `<span>${esc(w)}</span>`).join("")}${days.join("")}</div></div>` +
        `<div class="tahoe-widget tahoe-weather-widget"><div style="font-size: 7px; font-weight: 900">${esc(p.city)}</div><div style="font-size: 28px; font-weight: 800; line-height: 1; margin-top: 4px">${esc(p.temp)}</div>` +
        `<div style="font-size: 7px; font-weight: 800; opacity: 0.9; margin-top: 12px">${esc(p.weather)}</div><div style="font-size: 6px; font-weight: 800; opacity: 0.82">${esc(p.hilo)}</div></div>` +
        `<div class="tahoe-widget tahoe-media-widget"></div></div>` +
        `<div id="${id}_toast" class="tahoe-notification"><img id="${id}_ticon" src="${esc(src(p.toast.icon))}" alt=""><div><div class="tahoe-panel-title"><span>${esc(p.toast.title)}</span> <span style="font-size: 11px; opacity: 0.78">${esc(p.toast.time)}</span></div>` +
        `<div class="tahoe-panel-subtitle">${esc(p.toast.body)}</div></div></div>` +
        `<div class="tahoe-stage"><div class="tahoe-window"><div class="tahoe-window-titlebar"><span class="tahoe-traffic-light" style="background: #ff5f57"></span><span class="tahoe-traffic-light" style="background: #febc2e"></span>` +
        `<span class="tahoe-traffic-light" style="background: #28c840"></span><span style="flex: 1; text-align: center; font-size: 13px; font-weight: 600; color: rgba(20, 46, 76, 0.72)">${esc(p.window_title)}</span></div>` +
        `<div class="tahoe-finder-body"><div class="tahoe-sidebar">${p.sidebar.map((s, i) => `<div class="tahoe-sidebar-row${i ? "" : " active"}"><img id="${id}_side${i}" class="tahoe-sidebar-icon" src="${esc(src(s.icon))}" alt="">${esc(s.label)}</div>`).join("")}</div>` +
        `<div class="tahoe-file-grid">${p.files.map(f => `<div class="tahoe-file"><div class="${f.doc ? "tahoe-document-icon" : "tahoe-folder-icon"}"></div><div class="tahoe-file-label">${esc(f.name)}</div></div>`).join("")}</div></div></div></div>` +
        `<div class="tahoe-dock">${p.dock.map((d, i) => `<img id="${id}_dock${i}" class="tahoe-dock-icon" src="${esc(src(d))}" alt="">`).join("")}</div></div>`;
      const screen = ctx.make(cap, "div", "screen", { cls: "mt-screen", html });
      const gl = ctx.make(wrap, "canvas", "gl", { cls: "mt-gl", attrs: { width: W, height: H } });
      const C = { W, H, at: p.at, dur: p.duration, model: ctx.asset("macbook.glb"), root: id, cap: cap.id, screen: screen.id, gl: gl.id, toast: id + "_toast", ticon: id + "_ticon",
        side: p.sidebar.map((s, i) => id + "_side" + i), dock: p.dock.map((d, i) => id + "_dock" + i),
        app: String(p.app), menu: p.menu.map(String), status: p.status.join("   "), month: String(p.month), weekdays: p.weekdays.map(String),
        city: String(p.city), temp: String(p.temp), weather: String(p.weather), hilo: String(p.hilo), playing: String(p.playing), track: String(p.track),
        title: String(p.window_title), sidebar: p.sidebar.map(s => String(s.label)), files: p.files.map(f => [String(f.name), !!f.doc]),
        t: [String(p.toast.title), String(p.toast.time), String(p.toast.body)] };
      ctx.code(`  /* glass/macos-desktop #${id}: three.js MacBook + desktop captured once (HTML-in-Canvas) + canvas glass overlay; a pure function of time */
  const C = ${J(C)}, THREE = window.THREE, PI = Math.PI;
  const glc = document.getElementById(C.gl), cap = document.getElementById(C.cap), html = document.getElementById(C.screen), el = i => document.getElementById(i);
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
  const bgU = { uTime: { value: 0 }, uAspect: { value: C.W / C.H } };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(28, 16), new THREE.ShaderMaterial({ uniforms: bgU, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: "uniform float uTime;uniform float uAspect;varying vec2 v;float wave(vec2 p,float s,float t){return sin(p.x*s+p.y*s*.57+uTime*t);}void main(){vec2 p=v*2.0-1.0;p.x*=uAspect;float w=wave(p,3.0,.22)+.55*wave(p.yx+vec2(.7,-.2),5.1,.16)+.32*wave(p+vec2(-.4,.5),8.0,-.12);float a=smoothstep(-.75,1.05,w);vec3 navy=vec3(.015,.013,.055);vec3 cyan=vec3(.02,.42,.72);vec3 violet=vec3(.30,.08,.55);vec3 amber=vec3(.95,.42,.04);float ribbon=smoothstep(.22,.95,sin(p.x*2.2-p.y*3.1+uTime*.18));vec3 c=mix(navy,cyan,a);c=mix(c,violet,smoothstep(.16,1.1,wave(p+vec2(.8,.1),2.4,.1)));c+=amber*ribbon*.33;float glow=exp(-dot(p+vec2(.62,-.08),p+vec2(.62,-.08))*1.7);c+=vec3(.10,.45,.55)*glow;float vign=smoothstep(1.85,.25,length(p));gl_FragColor=vec4(c*vign,1.0);}" }));
  bg.position.z = -7.5; scene.add(bg);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x081427, metalness: 0.9, roughness: 0.2 }));
  floor.rotation.x = -PI / 2; floor.position.y = -2.5; scene.add(floor);
  scene.add(new THREE.AmbientLight(0x222233, 0.5));
  const kL = new THREE.DirectionalLight(0xffffff, 2.2); kL.position.set(-3, 4, 5); scene.add(kL);
  const rL = new THREE.PointLight(0x6366f1, 3, 15); rL.position.set(4, 2, 3); scene.add(rL);
  const wL = new THREE.PointLight(0xffc8a8, 1.5, 12); wL.position.set(-3, -1, 4); scene.add(wL);
  /* screen layers: base0 = desktop without toast, base1 = with toast, layer = base0 + static glass overlay, scr = the texture */
  const mkc = () => { const c = document.createElement("canvas"); c.width = 1440; c.height = 900; return c; };
  const base0 = mkc(), base1 = mkc(), layer = mkc(), scr = mkc(), sx = scr.getContext("2d");
  const tex = new THREE.CanvasTexture(scr); tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const turntable = new THREE.Group(); scene.add(turntable);
  const lapGrp = new THREE.Group(); turntable.add(lapGrp);
  const planarScreenUv = mesh => { const g = mesh.geometry; g.computeBoundingBox(); const bb = g.boundingBox, pos = g.attributes.position;
    const w = bb.max.x - bb.min.x || 1, h = bb.max.y - bb.min.y || 1, uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - bb.min.x) / w; uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / h; }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); };
  const cbz = (p1x, p1y, p2x, p2y) => { const ax = 3 * p1x - 3 * p2x + 1, bx = 3 * p2x - 6 * p1x, cx = 3 * p1x, ay = 3 * p1y - 3 * p2y + 1, by = 3 * p2y - 6 * p1y, cy = 3 * p1y;
    return t => { let s = t; for (let i = 0; i < 12; i++) { const x = ((ax * s + bx) * s + cx) * s - t, dx = (3 * ax * s + 2 * bx) * s + cx; if (Math.abs(dx) < 1e-10) break; s -= x / dx; }
      s = Math.max(0, Math.min(1, s)); return ((ay * s + by) * s + cy) * s; }; };
  const driftEase = cbz(0.45, 0.0, 0.15, 1.0), breatheEase = cbz(0.37, 0.0, 0.63, 1.0);
  const e3o = gsap.parseEase("power3.out"), e2o = gsap.parseEase("power2.out");
  const c01 = v => Math.max(0, Math.min(1, v)), seg = (t, t0, d, a, b, e) => a + (b - a) * e(c01((t - t0) / d));
  const F = (getComputedStyle(el(C.root)).fontFamily || "sans-serif") + ", sans-serif";
  /* the source's canvas glass overlay (roundedRect / drawGlassPanel / menu bar / widgets / Finder / toast / dock), texts from params, film font */
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); };
  const img = (c, im, x, y, w, h, r) => { if (!im || !im.complete || !im.naturalWidth) return; c.save(); rr(c, x, y, w, h, r); c.clip(); c.drawImage(im, x, y, w, h); c.restore(); };
  const glass = (c, x, y, w, h, r) => { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "rgba(255,255,255,0.82)"); g.addColorStop(0.46, "rgba(245,253,255,0.42)"); g.addColorStop(1, "rgba(211,237,255,0.3)");
    c.save(); c.shadowColor = "rgba(7,47,96,0.2)"; c.shadowBlur = 24; c.shadowOffsetY = 12; rr(c, x, y, w, h, r); c.fillStyle = g; c.fill(); c.shadowColor = "transparent";
    c.lineWidth = 1.25; c.strokeStyle = "rgba(255,255,255,0.72)"; c.stroke(); rr(c, x + 2, y + 2, w - 4, h - 4, Math.max(0, r - 2)); c.strokeStyle = "rgba(255,255,255,0.24)"; c.stroke(); c.restore(); };
  const menuBar = c => { c.save(); const g = c.createLinearGradient(0, 0, 1440, 0); g.addColorStop(0, "rgba(255,255,255,0.34)"); g.addColorStop(0.52, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0.3)");
    c.fillStyle = g; c.fillRect(0, 0, 1440, 28); c.strokeStyle = "rgba(255,255,255,0.46)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 28); c.lineTo(1440, 28); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.96)"; c.font = "800 14px " + F; c.fillText(C.app, 50, 18); const aw = c.measureText(C.app).width; c.font = "700 11px " + F;
    let mx = Math.max(108, 50 + aw + 12); for (const m of C.menu) { c.fillText(m, mx, 18); mx += Math.max(46, c.measureText(m).width + 20); }
    c.textAlign = "right"; c.fillText(C.status, 1414, 18); c.textAlign = "left"; c.restore(); };
  const widgets = c => { c.save(); c.textBaseline = "top"; glass(c, 28, 48, 100, 112, 18);
    c.fillStyle = "rgba(239,68,68,0.92)"; c.font = "900 8px " + F; c.fillText(C.month, 44, 62);
    c.fillStyle = "rgba(15,45,80,0.72)"; c.font = "800 7px " + F; c.textAlign = "center"; C.weekdays.forEach((d, i) => c.fillText(d, 45 + i * 10, 82)); c.textAlign = "left";
    for (let da = 1; da <= 26; da++) { const dx = 42 + ((da + 1) % 7) * 10, dy = 98 + Math.floor((da + 1) / 7) * 12;
      if (da === 1) { c.fillStyle = "#ef4444"; c.beginPath(); c.arc(dx + 3, dy + 4, 6, 0, PI * 2); c.fill(); c.fillStyle = "#fff"; } else c.fillStyle = "rgba(15,45,80,0.62)";
      c.fillText(String(da), dx, dy); }
    glass(c, 138, 48, 112, 112, 18); const wg = c.createLinearGradient(138, 48, 250, 160); wg.addColorStop(0, "rgba(43,133,245,0.72)"); wg.addColorStop(0.64, "rgba(163,220,255,0.54)"); wg.addColorStop(1, "rgba(255,255,255,0.3)");
    rr(c, 138, 48, 112, 112, 18); c.fillStyle = wg; c.fill(); c.fillStyle = "rgba(255,255,255,0.96)"; c.font = "900 9px " + F; c.fillText(C.city, 154, 64);
    c.font = "900 31px " + F; c.fillText(C.temp, 154, 84); c.font = "800 8px " + F; c.fillText(C.weather, 154, 130); c.fillText(C.hilo, 154, 142);
    glass(c, 28, 170, 222, 92, 22); const pg = c.createLinearGradient(44, 188, 130, 244); pg.addColorStop(0, "#ffb27a"); pg.addColorStop(0.52, "#ce2b6f"); pg.addColorStop(1, "#1d4ed8");
    rr(c, 44, 188, 72, 56, 14); c.fillStyle = pg; c.fill(); c.fillStyle = "rgba(18,40,68,0.92)"; c.font = "900 14px " + F; c.fillText(C.playing, 130, 193);
    c.font = "800 10px " + F; c.fillStyle = "rgba(18,40,68,0.68)"; c.fillText(C.track, 130, 216); c.restore(); };
  const finder = c => { const x = 112, y = 236, w = 620, h = 338; glass(c, x, y, w, h, 18); rr(c, x, y, w, 42, 18); c.fillStyle = "rgba(255,255,255,0.38)"; c.fill();
    [["#ff5f57", 26], ["#febc2e", 46], ["#28c840", 66]].forEach(q => { c.fillStyle = q[0]; c.beginPath(); c.arc(x + q[1], y + 21, 6, 0, PI * 2); c.fill(); });
    c.fillStyle = "rgba(14,42,74,0.72)"; c.font = "800 13px " + F; c.textAlign = "center"; c.fillText(C.title, x + w / 2, y + 25); c.textAlign = "left";
    c.fillStyle = "rgba(255,255,255,0.23)"; c.fillRect(x, y + 42, 164, h - 42);
    C.sidebar.forEach((s, si) => { const sy = y + 70 + si * 34; if (si === 0) { rr(c, x + 16, sy - 17, 132, 26, 8); c.fillStyle = "rgba(43,139,235,0.24)"; c.fill(); }
      img(c, el(C.side[si]), x + 28, sy - 14, 18, 18, 5); c.fillStyle = "rgba(18,45,76,0.78)"; c.font = (si === 0 ? "900" : "800") + " 12px " + F; c.fillText(s, x + 54, sy); });
    C.files.forEach((f, fi) => { const fx = x + 226 + (fi % 4) * 94, fy = y + 94 + Math.floor(fi / 4) * 112;
      rr(c, fx, fy, 54, 42, 10); c.fillStyle = f[1] ? "rgba(255,255,255,0.82)" : "rgba(112,202,255,0.74)"; c.fill();
      if (!f[1]) { rr(c, fx + 4, fy - 8, 28, 13, 6); c.fillStyle = "rgba(119,204,255,0.78)"; c.fill(); }
      else { c.fillStyle = "rgba(104,122,142,0.46)"; c.fillRect(fx + 10, fy + 12, 34, 3); c.fillRect(fx + 10, fy + 22, 26, 3); }
      c.fillStyle = "rgba(12,38,68,0.9)"; c.font = "900 11px " + F; c.textAlign = "center"; c.fillText(f[0], fx + 27, fy + 62); c.textAlign = "left"; }); };
  const toastC = (c, x, y) => { glass(c, x, y, 390, 96, 28); img(c, el(C.ticon), x + 20, y + 22, 44, 44, 12);
    c.fillStyle = "rgba(10,34,62,0.96)"; c.font = "900 18px " + F; c.fillText(C.t[0], x + 80, y + 26); const tw = c.measureText(C.t[0]).width;
    c.font = "800 12px " + F; c.fillStyle = "rgba(10,34,62,0.58)"; c.fillText(C.t[1], Math.max(x + 176, x + 80 + tw + 10), y + 28);
    c.font = "800 13px " + F; c.fillStyle = "rgba(10,34,62,0.78)"; c.fillText(C.t[2], x + 80, y + 54); };
  const dock = c => { const n = C.dock.length, size = 46, gap = 8, padX = 14, padY = 9, w = n * size + (n - 1) * gap + padX * 2, x = Math.round((1440 - w) / 2), y = 792;
    glass(c, x, y, w, size + padY * 2, 23); C.dock.forEach((d, i) => img(c, el(d), x + padX + i * (size + gap), y + padY, size, size, 13)); };
  let shot = false, lastKey = "", tbox = null;
  /* per frame: static layer, the HTML toast (cut from base1 at its rest box, slid by x - 1002, faded) and the canvas toast on top (source order) */
  const compose = (tx, ty, to) => { const key = [tx, ty, to].map(v => v.toFixed(3)).join(); if (key === lastKey) return; lastKey = key;
    sx.clearRect(0, 0, 1440, 900); sx.drawImage(layer, 0, 0);
    if (to > 0.001 && tbox) { const b = tbox, dx = tx - 1002;
      sx.save(); sx.globalAlpha = to; sx.shadowColor = "rgba(4,55,112,0.25)"; sx.shadowBlur = 46; sx.shadowOffsetY = 22; sx.shadowOffsetX = 10000;
      rr(sx, b.x + dx - 10000, b.y, b.w, b.h, 28); sx.fillStyle = "#000"; sx.fill(); sx.restore();
      sx.save(); sx.globalAlpha = to; rr(sx, b.x + dx, b.y, b.w, b.h, 28); sx.clip(); sx.drawImage(base1, b.x, b.y, b.w, b.h, b.x + dx, b.y, b.w, b.h); sx.restore(); }
    sx.textBaseline = "top"; if (to > 0.01) { sx.save(); sx.globalAlpha = to; toastC(sx, tx, ty); sx.restore(); } dock(sx);
    tex.needsUpdate = true; };
  /* every frame from the block's own time t: pull-back 0.5 -> 12.5 s, three breathing turns, toast in at 0.45 s, bump at 4.25 s */
  const draw = t => {
    const cZ = seg(t, 0.5, 12, 4.5, 7, driftEase), cY = seg(t, 0.5, 12, 0.4, 0.6, driftEase);
    const rY = t < 5 ? seg(t, 1, 4, 0, 0.04, breatheEase) : t < 9 ? seg(t, 5, 4, 0.04, -0.03, breatheEase) : seg(t, 9, 4, -0.03, 0.02, breatheEase);
    const tx = t < 0.83 ? seg(t, 0.45, 0.38, 1464, 988, e3o) : seg(t, 0.83, 0.16, 988, 1002, e2o), to = seg(t, 0.45, 0.38, 0, 1, e3o);
    const ty = t < 4.43 ? seg(t, 4.25, 0.18, 62, 72, e2o) : seg(t, 4.43, 0.22, 72, 62, e2o);
    if (shot) compose(tx, ty, to);
    lapGrp.position.set(-Math.sin(t * 0.4) * 0.012, -0.2 + Math.sin(t * 0.6) * 0.006, -0.6 + Math.cos(t * 0.35) * 0.008);
    lapGrp.rotation.set(0, rY, 0);
    bgU.uTime.value = t;
    camera.position.set(0, cY, cZ); camera.lookAt(0, -0.1, 0);
    renderer.render(scene, camera); };
  const P = { t: 0 };
  tl.fromTo(P, { t: 0 }, { t: C.dur, duration: C.dur, ease: "none", onUpdate: () => draw(P.t) }, C.at);
  /* readiness (window.__hf.buildReady): the model, then the two HTML-in-Canvas captures. A fresh kit Chromium loses its first WebGL context
     ~0.15 s after creation and restores it ~1 s later: capture after it settles, rebuild the PMREM env map when it comes back. */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const settle = wait(600);
  glc.addEventListener("webglcontextrestored", () => { makeEnv(); lastKey = ""; tex.needsUpdate = true; draw(P.t); });
  const gpuOk = async () => { await settle; if (renderer.getContext().isContextLost())
    await Promise.race([new Promise(r => glc.addEventListener("webglcontextrestored", () => setTimeout(r, 0), { once: true })), wait(20000)]); };
  const loadModel = () => new Promise((ok, no) => new THREE.GLTFLoader().load(C.model, gltf => {
    const m = gltf.scene, box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3());
    m.scale.setScalar(4.5 / Math.max(sz.x, sz.z)); box.setFromObject(m); m.position.sub(box.getCenter(new THREE.Vector3()));
    m.traverse(ch => { if (ch.isMesh && ch.name.replace(/\\.\\d+$/, "") === "display") { planarScreenUv(ch); ch.material = new THREE.MeshBasicMaterial({ map: tex }); } });
    lapGrp.add(m); ok(); }, undefined, no));
  const grab = async (cx, into) => { for (let k = 0; k < 60; k++) {
      await new Promise(r => { let done = false; const f = () => { if (!done) { done = true; cap.onpaint = null; r(); } }; cap.onpaint = f; if (cap.requestPaint) cap.requestPaint(); setTimeout(f, 150); });
      try { cx.clearRect(0, 0, 1440, 900); cx.drawElementImage(html, 0, 0, 1440, 900); const b = into.getContext("2d"); b.clearRect(0, 0, 1440, 900); b.drawImage(cap, 0, 0); return true; }
      catch (e) { await wait(50); } } return false; };
  const capture = async () => {
    await Promise.all([...cap.querySelectorAll("img")].map(i => i.complete ? (i.decode ? i.decode().catch(() => {}) : 0)
      : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
    await Promise.all(["600", "700", "800", "900"].map(w => document.fonts.load(w + " 16px " + F).catch(() => {}))); await document.fonts.ready;
    const cx = cap.getContext("2d");
    if (!cx || typeof cx.drawElementImage !== "function") { console.warn("glass/macos-desktop: HTML-in-Canvas (drawElementImage) not available, the screen stays black"); return; }
    const toast = el(C.toast);
    toast.style.visibility = "hidden"; const a = await grab(cx, base0);
    toast.style.visibility = ""; const b = await grab(cx, base1);
    tbox = { x: toast.offsetLeft, y: toast.offsetTop, w: toast.offsetWidth, h: toast.offsetHeight };
    if (!a || !b) { console.warn("glass/macos-desktop: the screen capture never succeeded"); return; }
    const lx = layer.getContext("2d"); lx.drawImage(base0, 0, 0); lx.save(); menuBar(lx); widgets(lx); finder(lx); lx.restore();
    shot = true; };
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady[${J("aimk-" + id)}] = Promise.all([loadModel().catch(e => console.warn("glass/macos-desktop: model", e)), gpuOk().then(capture)])
    .then(gpuOk).then(() => { lastKey = ""; draw(P.t); });
  draw(P.t);`);
    }
  },
});
