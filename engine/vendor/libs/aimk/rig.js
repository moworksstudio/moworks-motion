/* Moworks Motion character rig (library, 09/10/2026). First built for one film (a 1:1 rebuild of a finished 2D film), then made general:
   the user, the first film "là 1 ví dụ thôi nên viết engine cho library là phải universal dùng cho mọi job". Every look, proportion, hair,
   face, clothing and style below is a parameter; the named looks are only starting points.

   Every drawing is HTML: 0 x 0 joint divs (a pivot each) holding one <svg> per body part, so in After Effects every part is its own layer
   with native transform keys, and the port can turn plain parts into shape layers. Coordinates: +y down; a person stands with the hips at
   (0, 0), facing 3/4 right; scale 1 = about 690 px tall (opts.height sets the height in px instead).

   Seam-free joints (learned the hard way): every limb segment owns a FULL disc at each of its joints and neighbours share the radius, so a
   limb bent to any angle stays closed; shoulder discs sit in front of the torso; the knee disc belongs to the shin; feet are drawn behind
   the shins. Hands are variant groups swapped by hold frames (rel, open, fist, point, grip, flat). Faces are variant groups too (eyes,
   brows, mouth): expressions are hold-frame swaps, like After Effects puppets.

   window.AIMK_RIG:
     person(id, look, pose, x, y, scale, opts)   a rigged person -> HTML (opts: flip, farFront, only "legs"|"upper", cutY, look {...}, height)
     head(id, look, overrides) / hand(id, look, variant, overrides)   one head / one hand on its own
     giantHand(id, x, y, opts)                   a big hand rig (fingers in 3 segments, poses GPOSE), wrist at 0,0, fingers along +x
     part, joint, holder, grp, box               the building blocks (a part = one <svg>; a joint = a pivot; a holder = a top-level drawing)
     LOOK, POSE, EXPR, HANDS, GPOSE, HEADS       looks, poses, expressions, hand variants, giant-hand poses, drawn heads (a film's cast)
     art(name, ...) / puppet(name, ...)          a film's drawn vector art / a drawn character in parts (window.AIMK_ART, below)
     look(name, overrides)                       a look merged with overrides (a film's cast: AIMK_RIG.LOOK.anna = AIMK_RIG.look("woman", {...}))
     anim(tl, at)                                tween helpers that write explicit fromTo tweens from tracked state (see the end of the file)
   Rules kept: no Math.random, numbers rounded, string eases only, every animated element has an id. */
(() => {
  if (window.AIMK_RIG) return;
  const SVGNS = 'xmlns="http://www.w3.org/2000/svg"';
  const STATE = {}, POSES = {}, EXSTATE = {}, HANDV = {};
  let OUT = null;                                                   // the outline of the person being drawn ({c, w}) or null
  const r2 = v => +(+v).toFixed(2);
  // the outline style: a stroke under the fill on every filled shape of a part, except face features (data-nol)
  const outline = s => !OUT ? s : s.replace(/<(path|circle|ellipse|rect)\b(?![^>]*\bdata-nol\b)(?![^>]*\bstroke=)([^>]*?)fill="(#[0-9A-Fa-f]{3,8})"/g,
    (m, tag, rest, c) => `<${tag}${rest}fill="${c}" stroke="${OUT.c}" stroke-width="${OUT.w}" stroke-linejoin="round" paint-order="stroke"`);
  // a part: an <svg> whose viewBox is the box (x, y, w, h) in its joint's coordinates, placed so that (0,0) is the joint
  const part = (id, box, inner, extra = "") => {
    const [x, y, w, h] = box;
    return `<svg id="${id}" class="rigp" ${SVGNS} viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}" style="position:absolute;left:${x}px;top:${y}px;overflow:visible${extra}">${outline(inner)}</svg>`;
  };
  // a joint: a 0 x 0 div at (x, y) in its parent's coordinates, rotated r degrees (scale sx, sy) around itself; its start is tracked
  const joint = (id, x, y, r, inner, sx = 1, sy = 1) => {
    STATE[id] = { rotation: r, scaleX: sx, scaleY: sy };
    return `<div id="${id}" class="rigj" style="position:absolute;left:${r2(x)}px;top:${r2(y)}px;width:0;height:0;transform-origin:0 0;transform:rotate(${r2(r)}deg)${sx !== 1 || sy !== 1 ? ` scale(${r2(sx)},${r2(sy)})` : ""}">${inner}</div>`;
  };
  // a top-level drawing: an outer div at (x, y) that animation moves, an inner div <id>_k with the fixed rotation / scale / mirror (never animated)
  const holder = (id, x, y, inner, k = {}) => {
    const sx = (k.flip ? -1 : 1) * (k.sx ?? k.scale ?? 1), sy = k.sy ?? k.scale ?? 1, r = k.rot || 0;
    STATE[id] = {};
    return `<div id="${id}" class="righ" style="position:absolute;left:${r2(x)}px;top:${r2(y)}px;width:0;height:0;transform-origin:0 0${k.clip || ""}">` +
      `<div id="${id}_k" style="position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;transform:rotate(${r}deg) scale(${r2(sx)},${r2(sy)})">${inner}</div></div>`;
  };
  const grp = (id, x, y, inner, extra = "") => { STATE[id] = {}; return `<div id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:0;height:0;transform-origin:0 0${extra}">${inner}</div>`; };
  const box = (id, x, y, w, h, bg, extra = "") => { STATE[id] = {}; return `<div id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg}${extra}"></div>`; };
  // a darker (k < 1) or lighter (k > 1) shade of a colour
  function shade(hex, k = 0.86) {
    const n = parseInt(String(hex || "#888888").slice(1).padEnd(6, "0").slice(0, 6), 16), ch = s => Math.min(255, Math.round(((n >> s) & 255) * k));
    return "#" + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  /* ------------------------------------------------------------------ looks: starting points; every key is optional
     body:    female, kid, heads (head size: 1 = the base canon, 1.4 = a cartoon kid), torsoW, torsoLen, armLen, legLen, legScale (whole leg,
              width too), shinScale, legW (leg width), limbW (arm and leg width), bodyScale, handScale, shoeScale
     colours: skin, skinS (shade), hair, shirt, shirtS, trim, collar, pants, skirt, shoe, sole, sock, ink (eyes), line (face lines), lip
     top:     sleeve "short"|"rolled"|"long"|"none", sleeveLen, sleeveColor, cuffColor, collarStyle "deep"|"crew"|"shirt"|"none", hem
              "boxy"|"tapered", hemBand (a colour), plaid, stripe, pattern (svg inside the shirt), watch
     bottom:  pants (default), shorts (+ shortsLen), skirt (a colour; pencil skirt: the thighs are the skirt), dress (+ dressLen: a flared
              hem), heels, cuffBand (a trouser cuff colour)
     head:    hairStyle "short"|"swoop"|"quiff"|"kid"|"long"|"bun"|"ponytail"|"pigtails"|"curly"|"bald"|"none", face "angular"|"oval"|"round",
              beard (a colour), glasses (a colour), expr (the starting expression), mouthLine (a line smile instead of a filled lip),
              head (a drawn head in HEADS, used while hairStyle == headHair)
     style:   outline {c: "#1E1E23", w: 4} (a stroke round every shape: line-art look), shade true (the far limbs darker) */
  const LOOK = {
    man:   { shirt: "#5B7DB1", trim: "#FFFFFF", skin: "#F2B18C", hair: "#2E2A28", pants: "#2A2D37", shoe: "#3A3A41", sole: "#A2A2AA",
             sleeve: "short", hairStyle: "short", face: "angular", collarStyle: "crew" },
    woman: { shirt: "#E06C75", trim: "#E06C75", skin: "#F0B08C", hair: "#6B4A35", skirt: "#3F4E6E", shoe: "#2A2A30", sole: "#2A2A30",
             sleeve: "short", hairStyle: "long", face: "oval", female: true, heels: true, mouthLine: true },
    boy:   { shirt: "#7DB6D3", trim: "#FFFFFF", stripe: "#FFFFFF", skin: "#EFB393", hair: "#302420", pants: "#5C6F94", shorts: true,
             shoe: "#4C6E9A", sole: "#F2D24B", sock: "#FFFFFF", sleeve: "short", hairStyle: "kid", face: "round", kid: true, mouth: "open",
             heads: 1.55, legScale: 0.7, bodyScale: 0.78 },
    girl:  { shirt: "#E05C78", trim: "#E05C78", skin: "#EFB393", hair: "#302420", skirt: "#E05C78", dress: true, shoe: "#C94B66", sole: "#C94B66",
             sock: "#FFFFFF", sleeve: "short", hairStyle: "pigtails", face: "round", kid: true, mouth: "open", heads: 1.55, legScale: 0.7, bodyScale: 0.78 }
  };
  const look = (name, over = {}) => Object.assign({}, LOOK[name] || LOOK.man, over);
  const fill = L => {                                               // derived colours a look did not set
    L.skinS = L.skinS || shade(L.skin, 0.88); L.shirtS = L.shirtS || shade(L.shirt, 0.85); L.pants = L.pants || (L.skirt && !L.dress ? L.skin : "#2A2D37");
    L.cuff = L.cuff || L.pants; L.trim = L.trim || L.shirt; L.shoe = L.shoe || "#3A3A41"; L.sole = L.sole || shade(L.shoe, 1.6);
    if (L.skirt && !L.pants) L.pants = L.skin; return L;
  };

  /* ------------------------------------------------------------------ proportions (joint to joint, at scale 1) */
  const UA = 128, FA = 120, TH = 199, SH = 186, TY = 0.83;           // TY: the torso drawn at 83 % height (shirt hem at ~0.46 of the height)
  const dims = L => ({ ua: UA * (L.armLen || 1), fa: FA * (L.armLen || 1), th: TH * (L.legLen || 1), sh: SH * (L.legLen || 1) * (L.shinScale || 1) });
  const SHP = { m: [62, -180, 28], f: [56, -185, 24] };              // shoulder pivot x, y (torso coordinates) and the disc radius
  const shp = L => { const [x, y, r] = SHP[L.female ? "f" : "m"], w = L.torsoW || 1, l = L.torsoLen || 1; return [x * w, y * l, r * Math.min(1, 0.5 + 0.5 * w)]; };
  const R = L => { const f = !!L.female, k = L.limbW || 1;
    return { s: (f ? 18 : 21) * k, e: (f ? 14.5 : 17) * k, w: (f ? 10.5 : 12.5) * k, h: (f ? 27 : 30) * k, k: (f ? 21 : 25) * k, a: (f ? 17 : 21) * k,
             sk: (f ? 16 : 17.5) * k, ak: (f ? 9.5 : 11) * k }; };
  // a limb from a disc r1 at (0,0) to a disc r2 at (0,len), the sides bulging by b at 30 % of the length
  const limb = (r1, r2, len, b = 0) => {
    const f = v => +v.toFixed(2), y1 = f(len * 0.3), y2 = f(len * 0.75);
    return `M${f(-r1)},0 A${f(r1)},${f(r1)} 0 0 1 ${f(r1)},0 C${f(r1 + b)},${y1} ${f(r2 + b * 0.4)},${y2} ${f(r2)},${f(len)} ` +
      `A${f(r2)},${f(r2)} 0 0 1 ${f(-r2)},${f(len)} C${f(-r2 - b * 0.4)},${y2} ${f(-r1 - b)},${y1} ${f(-r1)},0 Z`;
  };
  const toTY = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x},${+(y / TY).toFixed(1)}`);

  /* ------------------------------------------------------------------ torso */
  const torsoOutline = L => {
    const w = L.torsoW || 1, l = L.torsoLen || 1, X = v => +(v * w).toFixed(1), Y = v => +(v * l).toFixed(1), bx = L.hem === "boxy";
    const P = (x, y) => `${X(x)},${y === 14 || y === 22 ? y : Y(y)}`;
    if (L.female) return `M${P(-62, 14)} C${P(-64, -30)} ${P(-58, -90)} ${P(-60, -128)} C${P(-62, -160)} ${P(-72, -176)} ${P(-73, -189)} Q${P(-70, -206)} ${P(-56, -209)} ` +
      `L${P(-30, -215)} Q${P(0, -200)} ${P(30, -215)} L${P(56, -209)} Q${P(70, -206)} ${P(73, -189)} C${P(72, -176)} ${P(62, -160)} ${P(60, -128)} C${P(58, -90)} ${P(64, -30)} ${P(62, 14)} Q${P(0, 22)} ${P(-62, 14)} Z`;
    const hx = bx ? 74 : 66;
    return `M${P(-hx, 14)} C${P(bx ? -76 : -70, -40)} ${P(-77, -110)} ${P(-78, -158)} C${P(-80, -176)} ${P(-84, -188)} ${P(-82, -196)} Q${P(-75, -207)} ${P(-62, -208)} ` +
      `L${P(-36, -214)} Q${P(0, -206)} ${P(34, -215)} L${P(62, -208)} Q${P(75, -207)} ${P(82, -196)} C${P(84, -188)} ${P(80, -176)} ${P(78, -158)} C${P(77, -110)} ${P(bx ? 76 : 70, -40)} ${P(hx, 14)} Q${P(0, 22)} ${P(-hx, 14)} Z`;
  };
  const torsoSvg = (L, id) => {
    const w = L.torsoW || 1, l = L.torsoLen || 1, X = v => +(v * w).toFixed(1), Y = v => +(v * l).toFixed(1);
    const body = torsoOutline(L);
    let s = `<path d="${toTY(body)}" fill="${L.shirt}"/>`, pat = "";
    if (L.plaid) for (let i = 0; i < 8; i++) pat += `<path d="${toTY(`M-110,${-214 + i * 30} L110,${-214 + i * 30}`)}" stroke="${L.plaid}" stroke-width="8" opacity=".55"/>` +
      `<path d="${toTY(`M${-77 + i * 22},-230 L${-77 + i * 22},20`)}" stroke="${L.plaid}" stroke-width="8" opacity=".45"/>`;
    if (L.stripe) pat += `<path d="${toTY("M-110,-116 L110,-116")}" stroke="${L.stripe}" stroke-width="12"/>`;
    if (L.pattern) pat += L.pattern;
    if (L.hemBand) pat += `<path d="${toTY(`M-90,6 Q0,13 90,6 L90,30 L-90,30 Z`)}" fill="${L.hemBand}" data-nol="1"/>`;
    if (pat) s += `<clipPath id="${id}_cp"><path d="${toTY(body)}" data-nol="1"/></clipPath><g clip-path="url(#${id}_cp)">${pat}</g>`;
    const collar = L.collarStyle || (L.plaid ? "shirt" : L.collar ? "deep" : "crew");
    if (collar === "deep") s += `<path d="${toTY(`M${X(-36)},${Y(-213)} Q${X(-2)},${Y(-174)} ${X(34)},${Y(-214)}`)}" fill="none" stroke="${L.collar || L.trim}" stroke-width="5" stroke-linecap="round"/>`;
    if (collar === "crew") s += `<path d="${toTY(`M${X(-30)},${Y(-214)} Q${X(0)},${Y(-196)} ${X(30)},${Y(-214)}`)}" fill="none" stroke="${L.trim}" stroke-width="6.5" stroke-linecap="round"/>`;
    if (collar === "shirt") s += `<path d="${toTY(`M${X(-34)},${Y(-216)} L${X(-4)},${Y(-186)} L${X(-14)},${Y(-176)} L${X(-40)},${Y(-206)} Z M${X(34)},${Y(-216)} L${X(4)},${Y(-186)} L${X(14)},${Y(-176)} L${X(40)},${Y(-206)} Z`)}" fill="${L.collar || L.shirtS}"/>` +
      `<path d="${toTY(`M0,${Y(-184)} L0,14`)}" stroke="${L.shirtS}" stroke-width="5"/>` + [-150, -100, -50, 0].map(y => `<circle cx="3" cy="${+(Y(y) / TY).toFixed(1)}" r="3" fill="${L.shirtS}" data-nol="1"/>`).join("");
    if (L.skirt && !L.dress) s += `<path d="${toTY("M-60,-12 L60,-12 L61,18 L-61,18 Z")}" fill="${L.skirt}"/>`;
    return part(id, [-130, -300, 260, 345], s);
  };
  const shouldersSvg = (L, id) => { const [x, y, r] = shp(L), c = L.sleeve === "none" ? null : (L.sleeveColor || L.shirt);
    if (!c) return "";
    return part(id, [-x - r - 2, y - r - 2, 2 * (x + r + 2), 2 * r + 4], `<circle cx="${r2(-x)}" cy="${r2(y)}" r="${r2(r)}" fill="${c}" data-nol="1"/><circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${c}" data-nol="1"/>`); };   // joint discs: no outline (it would ring the shoulder)
  const skirtSvg = (L, id, len) => part(id, [-100, -20, 200, len + 30],
    `<path d="M-60,-14 L60,-14 Q84,${len * 0.5} 90,${len} Q0,${len + 8} -90,${len} Q-84,${len * 0.5} -60,-14 Z" fill="${L.skirt}"/>`);

  /* ------------------------------------------------------------------ faces: eyes / brows / mouth as variant groups
     eyes  o open dots · c closed happy arcs · w wide (surprise) · b blink line
     brows n neutral · u raised and arched
     mouth s smile (filled lip) · l smile line · h laugh (an open D, teeth) · w an "o" · f flat */
  const EXPR = { smile: ["o", "n", "S"], happy: ["c", "n", "h"], laugh: ["o", "n", "h"], joy: ["c", "u", "h"], surprised: ["w", "u", "w"],
                 excited: ["w", "u", "h"], neutral: ["o", "n", "f"], content: ["c", "n", "S"], proud: ["c", "u", "S"], talk: ["o", "n", "h"] };
  const exprOf = L => L.expr || (L.eyes === "closed" ? (L.mouth === "open" || (L.kid && L.mouth !== "smile") ? "happy" : "content")
                                 : (L.mouth === "open" || (L.kid && L.mouth !== "smile")) ? "laugh" : "smile");
  const faceParts = (pid, F, expr) => {
    const want = (EXPR[expr] || EXPR.smile).map(v => v === "S" ? F.smile : v), ink = F.ink, line = F.line, N = ' data-nol="1"';
    const g = (slot, v, inner) => { const gid = `${pid}_${slot}${v}`, on = want["ebm".indexOf(slot)] === v; STATE[gid] = { opacity: on ? 1 : 0 };
      return `<g id="${gid}"${on ? "" : ' style="opacity:0"'}>${inner}</g>`; };
    const f = v => +v.toFixed(2), E = F.eyes;
    let s = g("e", "o", E.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${ink}"${N}/>`).join(""));
    s += g("e", "c", E.map(([x, y, r]) => `<path d="M${f(x - r * 1.8)},${f(y + r * 0.5)} Q${f(x)},${f(y - r * 1.9)} ${f(x + r * 1.8)},${f(y + r * 0.5)}" fill="none" stroke="${ink}" stroke-width="${f(r * 0.9)}" stroke-linecap="round"/>`).join(""));
    s += g("e", "w", E.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y - r * 0.3)}" r="${f(r * 1.4)}" fill="${ink}"${N}/>`).join(""));
    s += g("e", "b", E.map(([x, y, r]) => `<path d="M${f(x - r * 1.5)},${f(y)} Q${f(x)},${f(y + r * 0.7)} ${f(x + r * 1.5)},${f(y)}" fill="none" stroke="${ink}" stroke-width="${f(r * 0.8)}" stroke-linecap="round"/>`).join(""));
    // the blink lid (M.blink): skin over any eye variant + a lid line, shown for ~0.1 s: an opacity hold, so the head stays a vector in AE
    if (F.skin) { STATE[`${pid}_ek`] = { opacity: 0 }; s += `<g id="${pid}_ek" style="opacity:0">` + E.map(([x, y, r]) => `<ellipse cx="${f(x)}" cy="${f(y - r * 0.3)}" rx="${f(r * 1.75)}" ry="${f(r * 1.9)}" fill="${F.skin}"${N}/>` +
      `<path d="M${f(x - r * 1.5)},${f(y)} Q${f(x)},${f(y + r * 0.7)} ${f(x + r * 1.5)},${f(y)}" fill="none" stroke="${ink}" stroke-width="${f(r * 0.8)}" stroke-linecap="round"/>`).join("") + `</g>`; }
    if (F.brows && F.brows.length) {
      const bar = (x0, y0, x1, y1, w, up) => { const l0 = up ? w * 1.2 + 2 : 0, l1 = up ? w * 1.5 + 2 : 0, mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - w * (up ? 1.2 : 0.35) - (l0 + l1) / 2;
        return `<path d="M${f(x0)},${f(y0 - l0)} Q${f(mx)},${f(my)} ${f(x1)},${f(y1 - l1)}" fill="none" stroke="${F.browInk || ink}" stroke-width="${f(w)}" stroke-linecap="round"/>`; };
      s += g("b", "n", F.brows.map(([x0, y0, x1, y1, w]) => bar(x0, y0, x1, y1, w, false)).join(""));
      s += g("b", "u", F.brows.map(([x0, y0, x1, y1, w]) => bar(x0, y0, x1, y1, w, true)).join(""));
    }
    let [mx0, my0, mx1, my1] = F.mouth;
    const er = E.length ? E.reduce((t, e) => t + e[2], 0) / E.length : 4;
    if (mx1 - mx0 < er * 4.6) { const c = (mx0 + mx1) / 2; mx0 = c - er * 2.3; mx1 = c + er * 2.3; }
    const mm = (mx0 + mx1) / 2, mw = mx1 - mx0, mh = Math.max(er, my1 - my0);
    s += g("m", "s", `<path d="M${f(mx0)},${f(my0 + 0.5)} Q${f(mm)},${f(my0 - 1)} ${f(mx1)},${f(my0 + 1.5)} Q${f(mx1 - 3)},${f(my1)} ${f(mm - 1)},${f(my1)} Q${f(mx0 + 3)},${f(my1 - 1.5)} ${f(mx0)},${f(my0 + 0.5)} Z" fill="${F.lip}"${N}/>`);
    s += g("m", "l", `<path d="M${f(mx0)},${f(my0)} Q${f(mm)},${f(my0 + mh + 3)} ${f(mx1)},${f(my0 - 1)}" fill="none" stroke="${line}" stroke-width="2.8" stroke-linecap="round"/>`);
    s += g("m", "h", `<path d="M${f(mx0 - 1)},${f(my0 - 1)} Q${f(mm)},${f(my0 - 3)} ${f(mx1 + 1)},${f(my0)} Q${f(mx1 - 1)},${f(my0 + mh + 8)} ${f(mm - 1)},${f(my0 + mh + 8)} Q${f(mx0 + 1)},${f(my0 + mh + 6)} ${f(mx0 - 1)},${f(my0 - 1)} Z" fill="${F.mouthIn || "#A9483A"}"${N}/>` +
      `<path d="M${f(mx0)},${f(my0 - 0.5)} Q${f(mm)},${f(my0 - 2.5)} ${f(mx1)},${f(my0 + 0.5)} L${f(mx1 - 1)},${f(my0 + 3)} Q${f(mm)},${f(my0 + 1.5)} ${f(mx0 + 1)},${f(my0 + 2.5)} Z" fill="#FFFFFF"${N}/>` +
      `<path d="M${f(mm - mw * 0.25)},${f(my0 + mh + 5)} Q${f(mm)},${f(my0 + mh + 2)} ${f(mm + mw * 0.25)},${f(my0 + mh + 5)}" fill="none" stroke="#E7867A" stroke-width="2.6" stroke-linecap="round"/>`);
    s += g("m", "w", `<ellipse cx="${f(mm - 1)}" cy="${f(my0 + mh * 0.6)}" rx="${f(Math.max(er * 0.95, mw * 0.2))}" ry="${f(Math.max(er * 1.25, mw * 0.26))}" fill="${F.mouthIn || "#A9483A"}"${N}/>`);
    s += g("m", "f", `<path d="M${f(mx0 + mw * 0.15)},${f(my0 + mh * 0.5)} Q${f(mm)},${f(my0 + mh * 0.5 + 1.5)} ${f(mx1 - mw * 0.1)},${f(my0 + mh * 0.4)}" fill="none" stroke="${line}" stroke-width="2.8" stroke-linecap="round"/>`);
    EXSTATE[pid] = Object.assign(want.slice(), { smile: F.smile });
    return s;
  };
  /* a drawn head (HEADS[name], set by a film's cast preset): face, hair (and brows) drawn as SKIN / HAIR / INK colours; the eyes,
     brows, nose and mouth measured on the reference are drawn here so they can act. {svg, eyes: [[x,y,r]], brows: [[x0,y0,x1,y1,w]], lines: [mouth box, nose box]} */
  const HEADS = {};
  const tracedHead = (L, T, pid) => {
    let s = T.svg.replace(/SKIN/g, L.skin).replace(/HAIR/g, L.hair).replace(/INK/g, L.ink || "#303030");
    const ink = L.ink || "#303030", line = L.line || "#CC7C5A";
    const E0 = T.eyes && T.eyes.length ? T.eyes : [], ex = E0.length ? E0.reduce((t, e) => t + e[0], 0) / E0.length : 15, ey = E0.length ? E0[0][1] : -75;
    const [[mx0, my0], [mx1, my1]] = T.lines && T.lines[0] ? T.lines[0] : [[ex - 10, ey + 32], [ex + 10, ey + 38]];
    if (T.lines && T.lines[1]) { const [[nx0, ny0], [nx1, ny1]] = T.lines[1], nw = nx1 - nx0;
      s += `<path d="M${nx0 + 0.15 * nw},${ny0 + 1} L${nx1 - 1.2},${ny1 - 4} Q${nx1 - 2},${ny1 - 0.6} ${nx0 + 0.1 * nw},${ny1 - 1}" fill="none" stroke="${line}" stroke-width="3.7" stroke-linecap="round" stroke-linejoin="round"/>`; }
    s += faceParts(pid, { eyes: E0, brows: T.brows, browInk: T.browInk === "HAIR" ? L.hair : ink, mouth: [mx0, my0, mx1, my1], ink, line,
                          lip: L.lip || shade(L.skin, 0.78), smile: L.mouthLine ? "l" : "s", skin: L.skin }, exprOf(L));
    return s;
  };
  // hair: [behind the head, on top]; (0,0) is the neck base, the face spans about y -142 .. -30, facing 3/4 right
  const HAIR = {
    short:   ["", `<path d="M-40,-66 L-34,-100 Q-24,-124 0,-130 Q30,-136 44,-120 Q50,-112 48,-100 Q42,-116 26,-120 Q6,-122 -12,-114 Q-28,-104 -34,-84 Z M-50,-112 Q-44,-150 2,-156 Q44,-156 50,-122 L48,-100 Q42,-128 6,-130 Q-26,-128 -40,-92 Z" fill="H"/>`],
    swoop:   ["", `<path d="M-40,-62 L-33,-98 Q-22,-122 -2,-128 Q20,-134 34,-128 Q44,-124 48,-130 Q52,-144 40,-154 Q18,-166 -12,-160 Q-38,-156 -50,-142 Q-58,-134 -56,-122 L-62,-116 Q-54,-110 -52,-100 Q-50,-80 -46,-66 Z" fill="H"/><path d="M-38,-142 Q-26,-152 -8,-154" HL/>`],
    quiff:   ["", `<path d="M-40,-60 L-32,-98 Q-22,-116 -4,-120 Q22,-124 38,-118 Q50,-114 54,-124 Q66,-148 54,-166 Q38,-182 6,-178 Q-28,-174 -46,-154 Q-58,-138 -55,-112 Q-53,-82 -46,-64 Z" fill="H"/><path d="M-28,-160 Q-6,-174 28,-168" HL/>`],
    kid:     ["", `<path d="M-38,-80 Q-46,-126 -18,-148 L-24,-158 L-6,-152 L0,-164 L12,-150 L28,-158 L30,-142 Q50,-130 46,-108 L38,-114 Q30,-122 18,-118 L10,-126 L2,-116 Q-12,-118 -24,-104 Q-30,-94 -38,-80 Z" fill="H"/>`],
    long:    [`<path d="M-50,-104 Q-66,-30 -50,46 Q-30,54 -8,40 Q-22,-10 -18,-70 Z" fill="H"/><path d="M30,-142 Q62,-124 60,-64 Q58,-4 46,30 L30,24 Q44,-30 38,-110 Z" fill="HS"/>`,
              `<path d="M-42,-60 Q-50,-120 -20,-142 Q12,-160 42,-136 Q54,-120 50,-96 Q46,-112 34,-122 Q22,-128 8,-124 Q-12,-118 -22,-100 Q-30,-80 -32,-40 Q-40,-46 -42,-60 Z" fill="H"/><path d="M-30,-136 Q-10,-150 16,-146" HL opacity=".5"/>`],
    bun:     [`<circle cx="-30" cy="-150" r="26" fill="H"/>`,
              `<path d="M-42,-66 Q-50,-122 -16,-144 Q18,-158 44,-132 Q54,-118 50,-98 Q44,-114 30,-122 Q12,-128 -6,-122 Q-24,-112 -32,-90 Z" fill="H"/>`],
    ponytail:[`<path d="M-44,-120 Q-90,-100 -84,-30 Q-80,10 -64,30 Q-60,-20 -40,-70 Z" fill="H"/>`,
              `<path d="M-42,-66 Q-50,-122 -16,-144 Q18,-158 44,-132 Q54,-118 50,-98 Q44,-114 30,-122 Q12,-128 -6,-122 Q-24,-112 -32,-90 Z" fill="H"/>`],
    pigtails:[`<circle cx="-50" cy="-78" r="17" fill="H"/><circle cx="54" cy="-74" r="15" fill="H"/>`,
              `<path d="M-38,-82 Q-46,-134 0,-148 Q44,-152 50,-112 Q48,-100 44,-98 L42,-114 L34,-108 L30,-120 L20,-110 L14,-122 L4,-112 Q-14,-116 -26,-100 Z" fill="H"/>`],
    curly:   [`<circle cx="-40" cy="-120" r="34" fill="H"/><circle cx="40" cy="-128" r="32" fill="H"/>`,
              `<path d="M-46,-70 Q-66,-96 -50,-124 Q-56,-150 -28,-160 Q-12,-180 12,-168 Q36,-180 52,-158 Q72,-142 60,-116 Q66,-100 54,-92 Q48,-116 30,-124 Q10,-130 -10,-122 Q-30,-112 -36,-86 Z" fill="H"/>`],
    bald:    ["", `<path d="M-40,-70 Q-44,-90 -40,-100 L-34,-98 Q-36,-84 -34,-72 Z" fill="H"/>`],
    none:    ["", ""]
  };
  const neckHeadSvg = (L, id) => {
    const TR = L.head && L.hairStyle === L.headHair && HEADS[L.head];
    if (TR) return part(id, [-110, -220, 220, 330], `<g transform="translate(0,-6)">${tracedHead(L, TR, id)}</g>`);
    const H = L.hair || "#2E2A28", kid = !!L.kid, fem = !!L.female;
    const line = L.line || shade(L.skin, 0.8), shape = L.face || (fem || kid ? "oval" : "angular");
    let s = `<path d="M-16,-46 L18,-46 L20,6 L-18,6 Z" fill="${L.skinS}"/>`;                                         // neck
    const hs = HAIR[L.hairStyle] || HAIR.short, paint = x => x.replace(/fill="HS"/g, `fill="${shade(H, 0.85)}"`).replace(/fill="H"/g, `fill="${H}"`)
      .replace(/ HL/g, ` fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".85"`);
    s += paint(hs[0]);
    const face = shape === "round" ? "M-36,-100 Q-38,-140 2,-144 Q42,-144 46,-104 Q50,-72 40,-50 Q28,-30 8,-30 Q-14,-30 -26,-46 Q-36,-62 -36,-100 Z"
      : shape === "oval" ? "M-34,-104 Q-38,-136 0,-142 Q40,-144 46,-108 Q50,-84 44,-62 Q36,-38 16,-32 Q-4,-28 -20,-42 Q-34,-58 -34,-104 Z"
      : "M-34,-112 Q-34,-138 -2,-142 Q38,-144 44,-118 L48,-90 Q49,-80 45,-70 L34,-44 Q28,-32 16,-31 Q2,-30 -10,-38 L-26,-54 Q-34,-66 -34,-112 Z";
    s += `<path d="${face}" fill="${L.skin}"/>`;
    s += `<path d="M-37,-92 Q-52,-94 -50,-76 Q-48,-62 -33,-64 Z" fill="${L.skinS}"/><path d="M-44,-84 Q-40,-80 -42,-72" fill="none" stroke="${line}" stroke-width="2.5" stroke-linecap="round"/>`;   // ear
    if (L.beard) s += `<path d="M-30,-66 Q-26,-40 -8,-32 Q14,-24 34,-40 L44,-66 Q40,-50 28,-48 Q14,-60 -4,-50 Q-18,-50 -30,-66 Z" fill="${L.beard}"/>`;
    const er = kid ? 1.25 : 1, bc = shade(H, 0.8);
    if (L.nose !== "none") s += L.nose === "dot" ? `<circle cx="36" cy="-72" r="3" fill="${line}" data-nol="1"/>`
      : `<path d="M32,-95 Q38,-80 40,-70 Q39,-64 30,-65" fill="none" stroke="${line}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += faceParts(id, { eyes: [[12, -87, 4.6 * er], [39, -87, 4 * er]],
                         brows: fem || kid ? [[1, -102, 21, -102, 3.6], [31, -102, 45, -101, 3.6]] : [[0, -98, 23, -101, 6.5], [32, -101, 47, -100, 5.5]],
                         browInk: bc, mouth: [13, -55, 39, -47], ink: L.ink || "#2A2A30", line: L.line || "#B4574A", lip: L.lip || "#C9604F", smile: L.mouthLine ? "l" : "s", skin: L.skin },
                   (L.mouth === "open" && !L.expr) ? (L.eyes === "closed" ? "happy" : "laugh") : exprOf(L));
    if (L.glasses) s += `<g fill="none" stroke="${L.glasses}" stroke-width="3"><circle cx="12" cy="-87" r="11"/><circle cx="40" cy="-87" r="9.5"/><path d="M23,-88 L30,-88 M1,-89 L-30,-92"/></g>`;
    s += paint(hs[1]);
    return part(id, [-80, -200, 160, 250], s);
  };

  /* ------------------------------------------------------------------ arms, hands, legs */
  const upperArmSvg = (L, id, near) => {
    const r = R(L), D = dims(L), skin = near || !L.shade ? L.skin : L.skinS, sc = L.sleeveColor || (near || !L.shade ? L.shirt : L.shirtS), [, , rd] = shp(L);
    let s = `<path d="${limb(r.s, r.e, D.ua, 2)}" fill="${skin}"/>`;
    const sl = L.sleeve || "short";
    if (sl === "short") { const hy = (L.sleeveLen || 58) * (L.armLen || 1), hw = rd + 2;
      s += `<path d="M${r2(-rd)},0 A${r2(rd)},${r2(rd)} 0 0 1 ${r2(rd)},0 L${r2(hw)},${r2(hy)} Q0,${r2(hy + 6)} ${r2(-hw)},${r2(hy)} Z" fill="${sc}"/>`;
      if (L.trim && L.trim !== L.shirt) s += `<path d="M${r2(-hw + 1)},${r2(hy - 1)} Q0,${r2(hy + 5)} ${r2(hw - 1)},${r2(hy - 1)}" fill="none" stroke="${L.trim}" stroke-width="6.5"/>`; }
    if (sl === "rolled") { const re = r.e + 5;
      s += `<path d="M${r2(-rd)},0 A${r2(rd)},${r2(rd)} 0 0 1 ${r2(rd)},0 L${r2(re)},${r2(D.ua - 14)} L${r2(-re)},${r2(D.ua - 14)} Z" fill="${sc}"/>` +
        `<path d="M${r2(-re - 1)},${r2(D.ua - 18)} L${r2(re + 1)},${r2(D.ua - 18)} L${r2(re + 1)},${r2(D.ua)} A${r2(re + 1)},${r2(re + 1)} 0 0 1 ${r2(-re - 1)},${r2(D.ua)} Z" fill="${L.cuffColor || L.shirtS}"/>`; }
    if (sl === "long") s += `<path d="${limb(rd, r.e + 4, D.ua, 1)}" fill="${sc}"/>`;
    return part(id, [-50, -50, 100, D.ua + 80], s);
  };
  const forearmSvg = (L, id, near) => {
    const r = R(L), D = dims(L), skin = near || !L.shade ? L.skin : L.skinS;
    let s = `<path d="${limb(r.e, r.w, D.fa, 2.5)}" fill="${skin}"/>`;
    if (L.sleeve === "long") s += `<path d="${limb(r.e + 4, r.w + 3.5, D.fa - 14, 1.5)}" fill="${L.sleeveColor || L.shirt}"/><path d="M${r2(-r.w - 4)},${r2(D.fa - 24)} L${r2(r.w + 4)},${r2(D.fa - 24)} L${r2(r.w + 4)},${r2(D.fa - 6)} L${r2(-r.w - 4)},${r2(D.fa - 6)} Z" fill="${L.cuffColor || L.shirtS}"/>`;
    if (L.watch && near) s += `<rect x="-13" y="${r2(D.fa - 24)}" width="26" height="12" rx="3" fill="#2A2A30"/><circle cx="0" cy="${r2(D.fa - 18)}" r="6.5" fill="#E9EEF2" stroke="#2A2A30" stroke-width="2"/>`;
    return part(id, [-34, -34, 68, D.fa + 60], s);
  };
  /* hands, drawn pointing down the forearm, the thumb on the front side (+x), a disc over the wrist: rel (relaxed), open (spread), fist,
     point, grip (round a handle), flat (palm open, fingers together) */
  const HANDS = ["rel", "open", "fist", "point", "grip", "flat"];
  const handVariant = (v, sk, ln) => {
    const line = (d, w = 2.2) => `<path d="${d}" fill="none" stroke="${ln}" stroke-width="${w}" stroke-linecap="round" opacity=".8"/>`;
    const cap = (x, y, len, a1, a2, a) => `<path transform="translate(${x} ${y}) rotate(${a})" d="${limb(a1, a2, len)}" fill="${sk}"/>`;
    const palm = `<path d="M-13,-4 C-15.5,8 -16.5,20 -15,32 L15,32 C16,20 15.5,8 13.5,-4 Z" fill="${sk}"/>`;
    const thumb = `<path d="M11,6 C21,11 26,22 25,32 C24.5,38 19,41 15.5,37 C14.5,29 12,22 7,16 Z" fill="${sk}"/>`;
    if (v === "rel") return `<path d="M-13,-4 C-15.5,10 -17.5,26 -16,40 C-15,52 -11,62 -4,66 C2,69 9,66 12,58 C15,48 15.5,36 14.5,26 L13.5,-4 Z" fill="${sk}"/>` +
      thumb + line("M-7,44 Q-8.5,54 -6,62") + line("M1,46 Q1,56 2,63") + line("M-10,30 Q0,34 11,29", 1.8);
    if (v === "flat") return palm + cap(-9.5, 30, 28, 4.6, 4.2, 6) + cap(-3, 31, 31, 4.6, 4.2, 2) + cap(3.6, 31, 30, 4.6, 4.2, -2) + cap(10, 30, 24, 4.3, 3.9, -6) + thumb;
    if (v === "open") return palm + cap(-10, 29, 27, 4.6, 4, 16) + cap(-3.5, 31, 31, 4.6, 4, 5) + cap(3.5, 31, 30, 4.6, 4, -5) + cap(10.5, 29, 23, 4.3, 3.7, -16) + cap(12, 8, 26, 6, 4.4, -62);
    if (v === "fist") return `<path d="M-13.5,-4 C-16,8 -18,22 -16.5,34 C-15,45 -6,50 3,49.5 C12,49 17.5,41 17,29 C16.5,16 15.5,6 13.5,-4 Z" fill="${sk}"/>` +
      `<path d="M14.5,12 C22,16 22,30 13,35 C7,37.5 3.5,33 7,30 C11,27 12,20 10,15 Z" fill="${sk}"/>` + line("M-12,38 Q-7,44 -1,40 M-1,40 Q4,45 9,40") + line("M-14,26 Q-6,30 4,27", 1.8);
    if (v === "point") return `<path d="M-13.5,-4 C-16,8 -18,22 -16.5,32 C-15,42 -8,46 0,45.5 C10,45 16,38 16.5,27 C16.5,16 15.5,6 13.5,-4 Z" fill="${sk}"/>` +
      cap(-7, 38, 34, 4.8, 4.2, 0) + `<path d="M14.5,12 C22,16 22,30 13,35 C7,37.5 3.5,33 7,30 C11,27 12,20 10,15 Z" fill="${sk}"/>` + line("M-2,40 Q4,44 9,39");
    if (v === "grip") return `<path d="M-13.5,-4 C-16,8 -17.5,22 -16,32 C-14,44 -2,52 9,50 C17,48.5 20,42 17,37 C13,40 6,41 2,37 C0,30 4,24 10,22 L14.5,20 L13.5,-4 Z" fill="${sk}"/>` +
      `<path d="M13,6 C24,9 31,18 29,27 C28,32 22,32 20,28 C19,22 15,18 9,15 Z" fill="${sk}"/>` + line("M-12,34 Q-4,42 6,42");
    return "";
  };
  const handSvg = (L, id, near, start = "rel") => {
    const sk = near || !L.shade ? L.skin : L.skinS, ln = shade(L.skin, 0.84), k = (L.female ? 0.9 : 1.04) * (L.handScale || 1), r = R(L);
    const parts = HANDS.map(v => { const gid = `${id}_${v}`, on = v === start; STATE[gid] = { opacity: on ? 1 : 0 };
      return `<g id="${gid}"${on ? "" : ' style="opacity:0"'}>${handVariant(v, sk, ln)}</g>`; }).join("");
    HANDV[id] = start;
    return part(id, [-40, -20, 80, 100], `<circle cx="0" cy="0" r="${r2(r.w + 0.5)}" fill="${sk}" data-nol="1"/><g transform="scale(${r2(k)})">${parts}</g>`);
  };
  const legW = (L, inner) => { const k = L.legW || (L.kid ? 1 / (L.legScale || 1) : 1); return k === 1 ? inner : `<g transform="scale(${r2(k)},1)">${inner}</g>`; };
  const thighSvg = (L, id, near) => {
    const r = R(L), D = dims(L), skin = near || !L.shade ? L.skin : L.skinS;
    const pants = near || !L.shade ? L.pants : shade(L.pants, 0.8), skirtC = !L.skirt || near || !L.shade ? L.skirt : shade(L.skirt);
    let s;
    if (L.shorts) { const sl = (L.shortsLen || 92) * (L.legLen || 1);
      s = `<path d="${limb(r.sk + 2, r.sk, D.th, 1.5)}" fill="${skin}"/><path d="${limb(r.h, r.h - 1.5, sl, 1)}" fill="${pants}"/>` +
        `<path d="M${r2(-r.h + 1.5)},${r2(sl)} L${r2(r.h - 1.5)},${r2(sl)} L${r2(r.h - 1.5)},${r2(sl + 4)} L${r2(-r.h + 1.5)},${r2(sl + 4)} Z" fill="${L.shortsHem || pants}"/>`; }
    else if (L.skirt && !L.dress) s = `<path d="${limb(r.h + 4, r.k + 1, D.th - 6, 2)}" fill="${skirtC}"/>`;   // a pencil skirt: the thighs are the skirt
    else if (L.skirt) s = `<path d="${limb(r.sk + 4, r.sk, D.th, 1.5)}" fill="${skin}"/>`;                    // under a dress: bare thighs
    else s = `<path d="${limb(r.h, r.k, D.th, 1.5)}" fill="${pants}"/>`;
    return part(id, [-44, -36, 88, D.th + 70], legW(L, s));
  };
  const pelvisSvg = (L, id) => {
    const ax = (L.bodyScale || 1) * (L.torsoW || 1), ay = L.legScale || 1, w = (L.female ? 58 : 63) * ax, f = v => +(v * ay).toFixed(1), g = v => +(v * ax).toFixed(1);
    const c = L.shorts ? L.pants : L.skirt ? L.skirt : L.pants, e = L.female ? 58 : 64, c2 = e - 6;
    return part(id, [-90, -30, 180, 110], `<path d="M${r2(-w)},-24 L${r2(w)},-24 L${g(e)},${f(12)} Q${g(c2)},${f(32)} ${g(30)},${f(36)} L0,${f(42)} L${g(-30)},${f(36)} Q${g(-c2)},${f(32)} ${g(-e)},${f(12)} Z" fill="${c}"/>`);
  };
  const shinSvg = (L, id, near) => {
    const r = R(L), D = dims(L), skin = near || !L.shade ? L.skin : L.skinS, sh = D.sh, pants = near || !L.shade ? L.pants : shade(L.pants, 0.8);
    let s;
    if (L.skirt || L.shorts) { s = `<path d="${limb(r.sk, r.ak, sh, 3)}" fill="${skin}"/>`;
      if (L.sock) s += `<path d="M${r2(-r.ak - 1.5)},${r2(sh - 22)} L${r2(r.ak + 1.5)},${r2(sh - 22)} L${r2(r.ak + 1)},${r2(sh + 2)} L${r2(-r.ak - 1)},${r2(sh + 2)} Z" fill="${L.sock}"/>`; }
    else { s = `<path d="M${r2(-r.k)},0 A${r2(r.k)},${r2(r.k)} 0 0 1 ${r2(r.k)},0 C${r2(r.k + 1)},${r2(sh * 0.35)} ${r2(r.a + 1)},${r2(sh * 0.8)} ${r2(r.a)},${r2(sh + 6)} L${r2(-r.a)},${r2(sh + 6)} C${r2(-r.a - 1)},${r2(sh * 0.8)} ${r2(-r.k - 1)},${r2(sh * 0.35)} ${r2(-r.k)},0 Z" fill="${pants}"/>`;
      if (L.cuffBand) s += `<rect x="${r2(-r.a - 1)}" y="${r2(sh - 14)}" width="${r2(2 * r.a + 2)}" height="20" rx="3" fill="${L.cuffBand}"/>`; }
    return part(id, [-44, -34, 88, sh + 70], legW(L, s));
  };
  const shoeSvg = (L, id, near, view) => {
    const k = L.shoeScale || (L.kid ? 1 : 0.9), sc = near ? L.shoe : shade(L.shoe, 0.85);
    const inner = view === "front" && !L.heels
      ? `<path d="M-22,-12 L22,-12 C30,6 34,24 31,34 Q0,42 -31,34 C-34,24 -30,6 -22,-12 Z" fill="${sc}"/><path d="M-32,33 Q0,42 32,33 L32,41 Q0,50 -32,41 Z" fill="${L.sole}"/>`
      : L.heels
      ? `<path d="M-14,-10 L14,-10 Q44,14 60,28 L60,36 L-4,36 L-14,10 Z" fill="${sc}"/><path d="M-13,24 L-6,52 L1,52 L1,26 Z" fill="${sc}"/>`
      : `<path d="M-24,-12 L21,-12 Q37,12 64,20 Q76,30 66,38 L-26,38 Q-32,14 -24,-12 Z" fill="${sc}"/><rect x="-28" y="34" width="98" height="8" rx="4" fill="${L.sole}"/>`;
    return part(id, [-40, -20, 124, 76], `<g transform="scale(${r2(k)})">${inner}</g>`);
  };

  /* ------------------------------------------------------------------ poses: joint angles in degrees (0 = the limb hangs straight down;
     positive turns clockwise on screen). Keys: torso, head, ua_f fa_f h_f (far arm, the screen's right side), ua_n fa_n h_n (near arm, the
     left), th_f sh_f ft_f, th_n sh_n ft_n (legs; a negative thigh angle swings the foot forward = right), thS_f / thS_n (thigh length 0..1:
     seated facing the viewer), hd_n / hd_f (hand variant), shoe_n / shoe_f ("front": a shoe seen from the front), dy (the hips up / down, px,
     for the sheet and helpers: crouch, jump). The stress poses (armsUp ... kick) are the ones the character sheet checks joints with. */
  const POSE = {
    stand:      { torso: 0, head: 0, ua_f: -12, fa_f: 6, h_f: 0, ua_n: 12, fa_n: -8, h_n: 0, th_f: -4, sh_f: 1, ft_f: 0, th_n: 4, sh_n: -1, ft_n: 0,
                  hd_f: "rel", hd_n: "rel", dy: 0, thS_f: 1, thS_n: 1 },
    armsUp:     { ua_f: -165, fa_f: -8, ua_n: 165, fa_n: 8, hd_f: "open", hd_n: "open" },
    armsOut:    { ua_f: -88, fa_f: -4, ua_n: 88, fa_n: 4, hd_f: "flat", hd_n: "flat" },
    cheer:      { ua_f: -140, fa_f: -20, ua_n: 140, fa_n: 20, hd_f: "fist", hd_n: "fist", head: -6 },
    wave:       { ua_f: -120, fa_f: -55, hd_f: "open" },
    flex:       { ua_f: -92, fa_f: -105, hd_f: "fist", ua_n: 92, fa_n: 105, hd_n: "fist" },
    point:      { ua_n: -78, fa_n: -12, hd_n: "point", ua_f: -8, fa_f: 10 },
    present:    { ua_f: -38, fa_f: -75, hd_f: "open", ua_n: 14, fa_n: -20 },
    crossed:    { ua_f: 24, fa_f: 86, h_f: 10, ua_n: -24, fa_n: -88, h_n: -10 },
    handsHips:  { ua_f: -38, fa_f: 98, hd_f: "fist", ua_n: 38, fa_n: -98, hd_n: "fist" },
    think:      { ua_n: -20, fa_n: -150, hd_n: "fist", head: 8 },
    walkA:      { ua_f: -18, fa_f: -14, ua_n: 20, fa_n: -12, th_f: 22, sh_f: 24, ft_f: -8, th_n: -24, sh_n: 6, ft_n: 4, torso: 3 },
    walkB:      { ua_f: 20, fa_f: -12, ua_n: -18, fa_n: -14, th_f: -24, sh_f: 6, ft_f: 4, th_n: 22, sh_n: 24, ft_n: -8, torso: 3 },
    run:        { ua_f: 46, fa_f: -95, ua_n: -50, fa_n: -90, hd_f: "fist", hd_n: "fist", th_f: 38, sh_f: 80, ft_f: -20, th_n: -60, sh_n: 30, torso: 10, dy: -12 },
    crouch:     { torso: 16, ua_f: 30, fa_f: -20, ua_n: 34, fa_n: -24, th_f: -62, sh_f: 92, ft_f: -24, th_n: -70, sh_n: 98, ft_n: -26, dy: 92 },
    jump:       { torso: -4, ua_f: -150, fa_f: -14, ua_n: 150, fa_n: 14, hd_f: "open", hd_n: "open", th_f: 14, sh_f: 40, ft_f: 20, th_n: -18, sh_n: 46, ft_n: 18, dy: -110 },
    kick:       { ua_f: -70, fa_f: -10, ua_n: 64, fa_n: 10, th_n: -82, sh_n: -6, ft_n: -20, th_f: 6, sh_f: 2, torso: -8 },
    sitSide:    { torso: 4, ua_f: -20, fa_f: -10, ua_n: -32, fa_n: -12, th_f: -84, sh_f: 86, th_n: -78, sh_n: 80 },
    sitDesk:    { torso: -2, head: 4, ua_f: 40, fa_f: -100, h_f: -10, ua_n: -16, fa_n: -80, h_n: -12, th_f: -22, sh_f: 20, th_n: 20, sh_n: -16, thS_f: 0.42, thS_n: 0.42, shoe_f: "front", shoe_n: "front" }
  };
  const STRESS = ["stand", "armsUp", "armsOut", "cheer", "wave", "flex", "point", "present", "crossed", "handsHips", "think", "walkA", "walkB", "run", "crouch", "jump", "kick", "sitSide", "sitDesk"];
  const poseOf = p => Object.assign({}, POSE.stand, typeof p === "string" ? POSE[p] : p);

  /* person(id, look, pose, x, y, scale, opts) -> HTML. (x, y): the hips in the parent's coordinates. look: a LOOK name or an object.
     opts: flip (faces left), farFront (the far arm over the torso: crossed arms), only "legs" | "upper" + cutY (one person split around a
     desk), look {...} (overrides), height (px: the standing height instead of scale), hold (HTML drawn in the torso, behind the near arm) */
  function person(id, lookName, pose, x, y, scale = 1, opts = {}) {
    const L = fill(Object.assign({}, typeof lookName === "string" ? LOOK[lookName] || LOOK.man : lookName, opts.look || {}));
    if (opts.height) scale = opts.height / 690 / (L.legScale ? 0.86 : 1);
    const P = poseOf(pose), D = dims(L);
    const [sx, sy] = shp(L);
    OUT = L.outline ? { c: L.outline.c || "#1E1E23", w: L.outline.w || 4 } : null;
    const arm = (side, ax, near) => joint(`${id}_ua_${side}`, ax, Math.round(sy), P["ua_" + side] || 0,
      upperArmSvg(L, `${id}_uap_${side}`, near) + joint(`${id}_fa_${side}`, 0, D.ua, P["fa_" + side] || 0,
        forearmSvg(L, `${id}_fap_${side}`, near) + joint(`${id}_h_${side}`, 0, D.fa, P["h_" + side] || 0, handSvg(L, `${id}_hp_${side}`, near, P["hd_" + side] || "rel"))));
    const leg = (side, hx, near) => { const k = P["thS_" + side] || 1;
      STATE[`${id}_thw_${side}`] = { scaleY: k };
      const out = joint(`${id}_th_${side}`, hx, 0, P["th_" + side] || 0,
        `<div id="${id}_thw_${side}" style="position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;transform:scale(1,${k})">${thighSvg(L, `${id}_thp_${side}`, near)}</div>` +
        joint(`${id}_sh_${side}`, 0, D.th * k, P["sh_" + side] || 0,
          joint(`${id}_ft_${side}`, 0, D.sh, P["ft_" + side] || 0, shoeSvg(L, `${id}_ftp_${side}`, near, P["shoe_" + side])) + shinSvg(L, `${id}_shp_${side}`, near)),
        L.legScale || 1, L.legScale || 1);
      STATE[`${id}_sh_${side}`].k0 = k;
      return out; };
    const hs = (L.heads || L.headScale || 1) * 0.76, hy = Math.round(-256 * TY * (L.torsoLen || 1));
    STATE[`${id}_headwrap`] = {};
    const head = `<div id="${id}_headwrap" style="position:absolute;left:2px;top:${hy}px;width:0;height:0;transform:scale(${L.headFlip ? -hs : hs},${hs})">` +
      joint(`${id}_head`, 0, 0, P.head || 0, neckHeadSvg(L, `${id}_headp`)) + `</div>`;
    const far = arm("f", sx, !!opts.farFront);
    const torsoPic = `<div id="${id}_torsow" style="position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;transform:scale(1,${TY})">${torsoSvg(L, `${id}_torsop`)}</div>`;
    const torso = joint(`${id}_torso`, 0, 0, P.torso || 0,
      (opts.farFront ? "" : far) + head + torsoPic + shouldersSvg(L, `${id}_shl`) + (opts.farFront ? far : "") + (opts.hold || "") + arm("n", -sx, true),
      L.bodyScale || 1, L.bodyScale || 1);
    const legs = leg("f", 34, false) + leg("n", -32, true) + pelvisSvg(L, `${id}_pelvis`);
    const skirt = L.skirt && L.dress ? skirtSvg(L, `${id}_skirt`, L.dressLen || 90) : "";
    const inner = opts.only === "legs" ? legs + skirt : opts.only === "upper" ? torso : legs + skirt + torso;
    const clip = opts.cutY != null ? `;clip-path:polygon(-3000px -3000px,3000px -3000px,3000px ${opts.cutY * scale}px,-3000px ${opts.cutY * scale}px)` : "";
    POSES[id] = Object.assign({}, P, { _look: L, _scale: scale, _y: y });
    OUT = null;
    const body = `<div id="${id}_body" style="position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;transform:translate(0px,${P.dy || 0}px)">${inner}</div>`;
    STATE[`${id}_body`] = { y: P.dy || 0 };
    return holder(id, x, y, body, { scale, flip: opts.flip, clip });
  }
  const head = (id, lookName, over = {}) => { const L = fill(Object.assign({}, typeof lookName === "string" ? LOOK[lookName] || LOOK.man : lookName, over));
    OUT = L.outline ? { c: L.outline.c || "#1E1E23", w: L.outline.w || 4 } : null; const s = neckHeadSvg(L, id); OUT = null; return s; };
  const hand = (id, lookName, v = "rel", over = {}) => { const L = fill(Object.assign({}, typeof lookName === "string" ? LOOK[lookName] || LOOK.man : lookName, over));
    OUT = L.outline ? { c: L.outline.c || "#1E1E23", w: L.outline.w || 4 } : null; const s = handSvg(L, id, true, v); OUT = null; return s; };

  /* ------------------------------------------------------------------ a giant hand (a hand that fills the frame), a rig of its own:
     the wrist at (0,0), fingers along +x, the thumb on the top side (-y; opts.mirrorY for the other hand). Every finger is 3 capsules
     sharing a disc at each knuckle, the palm covers the roots, a wrist stub runs back under the cuff (no gap at any wrist angle).
     opts: scale, rot, flip, mirrorY, flatY (< 1: seen from above), view "palm" | "back", pose (a GPOSE name or {f: [[base, c1, c2, c3] x4],
     t: [base, c1, c2]}), len [4 finger length factors], thumbLen, h (wrist angle), sleeve (length; 0 = none), sleeveW, cuff (false = none),
     skin, skinS, line, sleeveC, cuffC, curl (+1 / -1: the side the fingers bend to). Joints: wr, f1a f1b f1c ... f4c, ta tb tc. */
  const GPOSE = {
    flat:   { f: [[-9, 0, 0, 0], [-3, 0, 0, 0], [3, 0, 0, 0], [9, 0, 0, 0]], t: [-58, 8, 6] },
    rest:   { f: [[-8, 8, 10, 6], [-3, 9, 11, 7], [3, 9, 12, 8], [9, 10, 12, 8]], t: [-50, 10, 8] },
    spread: { f: [[-24, 2, 2, 0], [-8, 0, 0, 0], [8, 0, 2, 0], [24, 3, 4, 2]], t: [-72, 4, 2] },
    cup:    { f: [[-6, 18, 22, 16], [-2, 20, 24, 18], [2, 20, 24, 18], [7, 22, 26, 18]], t: [-40, 18, 14] },
    grab:   { f: [[-14, 36, 44, 30], [-5, 40, 48, 32], [5, 40, 48, 32], [14, 42, 50, 34]], t: [-38, 26, 22] },
    fist:   { f: [[-6, 78, 92, 70], [-2, 82, 94, 72], [2, 82, 94, 72], [6, 84, 96, 74]], t: [-20, 40, 40] },
    point:  { f: [[-4, 0, 0, 0], [-2, 82, 94, 72], [2, 82, 94, 72], [6, 84, 96, 74]], t: [-20, 40, 40] },
    pinch:  { f: [[-10, 30, 36, 24], [-2, 26, 30, 20], [4, 24, 28, 18], [10, 22, 26, 16]], t: [-22, 22, 18] }
  };
  const GH = { palm: 236, wide0: 86, wide1: 110, fl: [252, 280, 262, 210], fr: [28, 29.5, 28, 24.5], seg: [0.46, 0.3, 0.24], tl: 220, tr: 34,
               base: [[236, -80], [244, -28], [240, 24], [228, 74]], tbase: [80, -60] };
  const HAND = { skin: "#F3C3A8", skinS: "#DEA896", line: "#D9977E", sleeve: "#3D5A80", cuff: "#FFFFFF" };
  const ghPose = (pose, curl = 1) => { const P = typeof pose === "string" ? GPOSE[pose] || GPOSE.rest : pose, o = {};
    P.f.forEach(([b, c1, c2, c3], i) => { o[`f${i + 1}a`] = -90 + b + curl * c1; o[`f${i + 1}b`] = curl * c2; o[`f${i + 1}c`] = curl * c3; });
    const [tb, t1, t2] = P.t; o.ta = -90 + tb; o.tb = curl * t1; o.tc = curl * t2; return o; };
  function giantHand(id, x, y, opts = {}) {
    const sk = opts.skin || HAND.skin, sk2 = opts.skinS || shade(sk, 0.9), ln = opts.line || shade(sk, 0.82), curl = opts.curl || 1, back = opts.view === "back";
    OUT = opts.outline ? { c: opts.outline.c || "#1E1E23", w: opts.outline.w || 6 } : null;
    const J = ghPose(opts.pose || "rest", curl), lk = opts.len || [1, 1, 1, 1], f = v => +v.toFixed(2);
    const crease = (r, y0) => `<path d="M${f(-r * 0.62)},${f(y0)} Q0,${f(y0 + r * 0.32)} ${f(r * 0.62)},${f(y0)}" fill="none" stroke="${ln}" stroke-width="${f(Math.max(2.5, r * 0.16))}" stroke-linecap="round" opacity=".75"/>`;
    const seg = (pid, len, a1, a2, kids, cr) => part(pid, [-a1 - 4, -a1 - 4, 2 * a1 + 8, len + a1 + a2 + 8], `<path d="${limb(a1, a2, len, 0.6)}" fill="${sk}"/>` + (cr ? crease(a1, 6) : "")) + kids;
    let fingers = "";
    GH.base.forEach(([bx, by], i) => {
      const n = i + 1, L = GH.fl[i] * lk[i], r = GH.fr[i], [s1, s2, s3] = GH.seg.map(v => v * L), rt = r * 0.74, rm = r * 0.9, rc = r * 0.82;
      const c = joint(`${id}_f${n}c`, 0, s2, J[`f${n}c`], seg(`${id}_f${n}cp`, s3 - rt * 0.3, rc, rt, "", false));
      const b = joint(`${id}_f${n}b`, 0, s1, J[`f${n}b`], seg(`${id}_f${n}bp`, s2, rm, rc, c, true));
      fingers += joint(`${id}_f${n}a`, bx, by, J[`f${n}a`], seg(`${id}_f${n}ap`, s1, r, rm, b, back));
    });
    const T = GH.tl * (opts.thumbLen || 1), t1 = T * 0.5, t2 = T * 0.3, t3 = T * 0.2;
    const thumb = joint(`${id}_ta`, GH.tbase[0], GH.tbase[1], J.ta, seg(`${id}_tap`, t1, GH.tr + 6, GH.tr, "", false) + joint(`${id}_tb`, 0, t1, J.tb,
      seg(`${id}_tbp`, t2, GH.tr, GH.tr * 0.86, joint(`${id}_tc`, 0, t2, J.tc, seg(`${id}_tcp`, t3, GH.tr * 0.86, GH.tr * 0.66, "", true)), true)));
    const P0 = GH.palm, w0 = GH.wide0, w1 = GH.wide1;
    let palm = `<path d="M-110,${-w0 * 0.55} L-30,${-w0 * 0.92} L18,${-w0} C110,${-w0 - 6} 190,${-w1 + 4} ${P0 + 6},${-w1 + 22} C${P0 + 22},${-w1 + 40} ${P0 + 26},-10 ${P0 + 22},20 ` +
      `C${P0 + 18},${w1 - 28} ${P0 - 4},${w1 - 6} ${P0 - 40},${w1} C150,${w1 + 4} 70,${w0 + 6} 18,${w0} L-30,${w0 * 0.92} L-110,${w0 * 0.55} Z" fill="${sk}"/>`;
    palm += back
      ? `<path d="M40,-40 C110,-50 170,-62 ${P0 - 6},-68 M40,-12 C110,-18 170,-22 ${P0},-24 M40,14 C110,16 170,20 ${P0 - 4},22 M40,40 C110,46 160,54 ${P0 - 16},62" fill="none" stroke="${ln}" stroke-width="4" stroke-linecap="round" opacity=".2"/>`
      : `<path d="M${P0 - 14},-60 C190,-44 150,-36 98,-46 M${P0 - 6},-10 C180,2 130,6 70,-14 M60,-52 C96,-10 110,30 104,${w0 - 2}" fill="none" stroke="${ln}" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
        `<path d="M70,-${w0 - 4} C120,-30 128,10 112,${w0 - 10}" fill="none" stroke="${sk2}" stroke-width="16" stroke-linecap="round" opacity=".22"/>`;
    const handTree = fingers + thumb + part(`${id}_palm`, [-120, -w1 - 30, P0 + 160, 2 * w1 + 60], palm);
    const sl = opts.sleeve == null ? 900 : opts.sleeve, SW = opts.sleeveW || 112;
    const cuff = opts.cuff === false ? "" : part(`${id}_cuff`, [-52, -SW - 4, 56, 2 * SW + 8], `<path d="M-50,${-SW} L0,${-SW + 2} L0,${SW - 2} L-50,${SW} Z" fill="${opts.cuffC || HAND.cuff}"/>`);
    const sleeve = sl ? part(`${id}_sleeve`, [-sl - 52, -SW - 4, sl + 6, 2 * SW + 8], `<path d="M${-sl - 50},${-SW - 2} L-48,${-SW} L-48,${SW} L${-sl - 50},${SW + 2} Z" fill="${opts.sleeveC || HAND.sleeve}"/>`) : "";
    POSES[id] = Object.assign({ wr: opts.h || 0 }, J);
    OUT = null;
    if (opts.bare) return joint(`${id}_wr`, 0, 0, opts.h || 0, handTree);
    const sc = opts.scale || 1;
    return holder(id, x, y, joint(`${id}_wr`, 0, 0, opts.h || 0, handTree) + sleeve + cuff, { rot: opts.rot || 0, flip: opts.flip, sx: sc, sy: (opts.mirrorY ? -1 : 1) * sc * (opts.flatY || 1) });
  }

  /* ------------------------------------------------------------------ drawn art: vector art written in a film's presets (presets/drawn/<name>,
     REDRAWN as whole parts measured on a reference frame: skill workflow/characters.md; 11/10/2026 test, the user: "ko trace nữa", the
     kit.py trace command is gone). window.AIMK_ART[name] =
     {box: [x, y, w, h] around (0,0) = the origin, layers: [{c, d}], parts: [{name, parent, pivot: [x, y], box, layers, behind}]}
     art(name, id, x, y, o): the art as a top-level drawing, its origin at (x, y). o: scale, rot, flip, colors {"#old": "#new"},
       split (one <svg> per colour: each its own After Effects layer), opacity
     puppet(name, id, x, y, o): a character cut into parts: one joint per part (ids <id>_<part>), nested as the parts' parents say, each
       part drawn around its pivot (each child ends inside its parent, so no gap opens when it turns); o.pose {part: degrees}; animate with
       M.pose(id, t, {part: degrees}).
     Old names kept for films made before 11/10/2026: window.AIMK_TRACED, traced(), presets/traced/<name>. */
  const TR = name => { const T = (window.AIMK_ART || {})[name] || (window.AIMK_TRACED || {})[name];
    if (!T) throw new Error(`AIMK_RIG: no drawn art "${name}" (window.AIMK_ART["${name}"] in presets/drawn/${name}/preset.js)`); return T; };
  const recol = (c, o) => (o.colors && (o.colors[c] || o.colors[c.toLowerCase()] || o.colors[c.toUpperCase()])) || c;
  const layersSvg = (L, o) => L.map(l => `<path d="${l.d}" fill="${recol(l.c, o)}" fill-rule="evenodd"/>`).join("");   // holes: evenodd
  function art(name, id, x, y, o = {}) {
    const T = TR(name), b = T.box;
    const art = o.split ? T.layers.map((l, i) => part(`${id}_c${i}`, b, layersSvg([l], o))).join("") : part(`${id}_art`, b, layersSvg(T.layers, o));
    return holder(id, x, y, art, { scale: o.scale || 1, rot: o.rot || 0, flip: o.flip });
  }
  function puppet(name, id, x, y, o = {}) {
    const T = TR(name), P = T.parts || [], pose = o.pose || {}, kids = {};
    if (!P.length) throw new Error(`AIMK_RIG.puppet: "${name}" has no parts (AIMK_ART["${name}"].parts)`);
    P.forEach(p => { (kids[p.parent || ""] = kids[p.parent || ""] || []).push(p); });
    const build = (p, px, py) => {
      const sub = kids[p.name] || [], back = sub.filter(k => k.behind).map(k => build(k, p.pivot[0], p.pivot[1])).join(""),
            front = sub.filter(k => !k.behind).map(k => build(k, p.pivot[0], p.pivot[1])).join("");
      return joint(`${id}_${p.name}`, p.pivot[0] - px, p.pivot[1] - py, pose[p.name] || 0, back + part(`${id}_${p.name}_p`, p.box, layersSvg(p.layers, o)) + front);
    };
    const roots = kids[""] || [];
    POSES[id] = Object.assign(Object.fromEntries(P.map(p => [p.name, 0])), pose);
    return holder(id, x, y, roots.map(r => build(r, r.pivot[0], r.pivot[1])).join(""), { scale: o.scale || 1, rot: o.rot || 0, flip: o.flip });
  }

  /* ------------------------------------------------------------------ animation helpers. Every tween is a tl.fromTo whose "from" is the value
     the element has at that moment (tracked in STATE from the drawing's own transform), so the kit's bake writes explicit, seek-safe tweens
     and the After Effects port gets clean keys. Times are local (seconds after `at`). Call per element in time order.
       const M = AIMK_RIG.anim(tl, p.at);
       M.init("cam", { scale: 1.2 })                         the starting state, written on the element (never a tl.set at time 0)
       M.to("man", 0.4, { x: 300 }, 0.6, "power2.inOut")     move / scale / rotate / fade anything with an id
       M.pose("man", 1.0, "wave", 0.35) / M.pose("man", 1.0, { ua_f: -120 })   joints of a person or a giant hand (angles), hips (dy)
       M.expr("man", 1.2, "surprised") · M.blink("man", 2) (a 0.1 s lid) · M.blinks("man", 0, 8) · M.talk("man", 3, 4.5) · M.hand("man", "f", 1, "fist")
       M.walk("man", 0, 2.4, { dx: 400, step: 0.42 })        a walk cycle while the person moves dx px · M.gpose("bigHand", 1, "grab")
       M.pop(id, t) (scale 0 -> 1 with overshoot) · M.squash(id, t) (a landing: squash, stretch, settle) · M.hide / M.show */
  const DEF = { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, xPercent: 0, yPercent: 0 };
  const r4 = v => (typeof v === "number" ? Math.round(v * 10000) / 10000 : v);
  const el = id => { const e = document.getElementById(id); if (!e) throw new Error("AIMK_RIG.anim: no element #" + id); return e; };
  const cur = (id, k) => { const s = STATE[id] || (STATE[id] = {}); if (k in s) return s[k];
    if (k === "scaleX" || k === "scaleY") return "scale" in s ? s.scale : 1; return k in DEF ? DEF[k] : undefined; };
  const keep = (id, props) => { const s = STATE[id] || (STATE[id] = {}); for (const k in props) { s[k] = props[k]; if (k === "scale") { s.scaleX = props[k]; s.scaleY = props[k]; } } };
  const faceOf = who => document.getElementById(`${who}_headp`) ? `${who}_headp` : who;
  function anim(tl, at) {
    const M = {
      to(id, t, props, d = 0.5, ease = "power2.inOut") {
        const from = {}, to = {};
        for (const k in props) { const v0 = cur(id, k); if (v0 !== undefined) from[k] = r4(v0); to[k] = r4(props[k]); }
        tl.fromTo(el(id), from, Object.assign(to, { duration: r4(d), ease }), r4(at + t));
        keep(id, props); return M;
      },
      init(id, props) { const v = {}; for (const k in props) v[k] = r4(props[k]); gsap.set(el(id), v); keep(id, props); return M; },
      set(id, t, props) { const v = {}; for (const k in props) v[k] = r4(props[k]); tl.set(el(id), v, r4(at + t)); keep(id, props); return M; },
      pose(pid, t, pose, d = 0.4, ease = "power2.inOut") {
        const P = POSES[pid]; if (!P) throw new Error("AIMK_RIG.anim.pose: no rig #" + pid);
        const want = typeof pose === "string" ? (POSE[pose] ? Object.assign({}, POSE.stand, POSE[pose]) : ghPose(pose)) : pose;
        for (const k in want) {
          const v = want[k];
          if (k.startsWith("hd_")) { if (typeof v === "string") M.hand(pid, k.slice(3), t + d * 0.5, v); continue; }
          if (k.startsWith("shoe_") || k === "_look" || k === "_scale" || k === "_y") continue;
          if (k === "dy") { if ((P.dy || 0) !== v && document.getElementById(`${pid}_body`)) { M.to(`${pid}_body`, t, { y: v }, d, ease); P.dy = v; } continue; }
          if (k.startsWith("thS_")) {
            const side = k.slice(4), k0 = P[k] || 1; if (k0 === v) continue;
            if (!document.getElementById(`${pid}_thw_${side}`)) { P[k] = v; continue; }
            M.to(`${pid}_thw_${side}`, t, { scaleY: v }, d, ease);
            M.to(`${pid}_sh_${side}`, t, { y: dims(P._look || {}).th * (v - STATE[`${pid}_sh_${side}`].k0) }, d, ease);
            P[k] = v; continue;
          }
          if ((P[k] || 0) === v) continue;
          const jid = `${pid}_${k}`; if (!document.getElementById(jid)) continue;
          M.to(jid, t, { rotation: v }, d, ease); P[k] = v;
        }
        return M;
      },
      poseAll(pids, t, pose, d, ease) { for (const pid of pids) M.pose(pid, t, typeof pose === "string" ? pose : Object.assign({}, pose), d, ease); return M; },
      pop(id, t, d = 0.35, from = 0) { M.set(id, t, { scale: from }); return M.to(id, t, { scale: 1 }, d, "back.out(2)"); },
      squash(id, t, k = 0.14) { return M.to(id, t, { scaleX: 1 + k, scaleY: 1 - k }, 0.06, "power2.out").to(id, t + 0.06, { scaleX: 1 - k * 0.5, scaleY: 1 + k * 0.5 }, 0.1, "power2.out")
        .to(id, t + 0.16, { scaleX: 1, scaleY: 1 }, 0.18, "power2.out"); },
      expr(who, t, name) {
        const pid = faceOf(who), c = EXSTATE[pid]; if (!c) throw new Error("AIMK_RIG.anim.expr: no face on " + who);
        const want = (EXPR[name] || EXPR.smile).slice(); if (want[2] === "S") want[2] = c.smile || "s";
        ["e", "b", "m"].forEach((slot, i) => {
          if (!want[i] || c[i] === want[i] || !document.getElementById(`${pid}_${slot}${want[i]}`)) return;
          if (document.getElementById(`${pid}_${slot}${c[i]}`)) M.set(`${pid}_${slot}${c[i]}`, t, { opacity: 0 });
          M.set(`${pid}_${slot}${want[i]}`, t, { opacity: 1 }); c[i] = want[i];
        });
        return M;
      },
      blink(who, t) {                                  // the lid shows for 0.1 s (works over any eye variant; AE: two opacity holds)
        const id = `${faceOf(who)}_ek`; if (!document.getElementById(id)) return M;
        return M.set(id, t, { opacity: 1 }).set(id, t + 0.1, { opacity: 0 });
      },
      blinks(who, t0, t1) { const gaps = [2.9, 3.6, 2.6, 3.3, 3.8, 2.7]; for (let t = t0, i = 0; t < t1 - 0.15; t += gaps[i++ % gaps.length]) M.blink(who, t); return M; },
      talk(who, t0, t1) {
        const pid = faceOf(who), c = EXSTATE[pid]; if (!c) return M;
        const base = c[2] === "h" ? (c.smile || "s") : c[2], beats = [0.14, 0.1, 0.17, 0.12, 0.09, 0.15, 0.11];
        let t = t0, open = true, i = 0;
        while (t < t1 - 0.06) { const v = open ? "h" : base, was = open ? base : "h";
          M.set(`${pid}_m${was}`, t, { opacity: 0 }).set(`${pid}_m${v}`, t, { opacity: 1 }); t += beats[i++ % beats.length]; open = !open; }
        if (!open) M.set(`${pid}_mh`, t1, { opacity: 0 }).set(`${pid}_m${base}`, t1, { opacity: 1 });
        c[2] = base; return M;
      },
      hand(pid, side, t, name) {
        const hid = `${pid}_hp_${side}`, c = HANDV[hid];
        if (!c || c === name || !document.getElementById(`${hid}_${name}`)) return M;
        M.set(`${hid}_${c}`, t, { opacity: 0 }).set(`${hid}_${name}`, t, { opacity: 1 }); HANDV[hid] = name; return M;
      },
      gpose(id, t, pose, d = 0.3, ease = "power2.inOut", curl = 1) { return M.pose(id, t, ghPose(pose, curl), d, ease); },
      // a walk: walkA / walkB every `step` s while the holder moves dx px (opts.dx, opts.step = 0.42, opts.ease), then stand
      walk(pid, t0, t1, opts = {}) {
        const step = opts.step || 0.42, n = Math.max(1, Math.round((t1 - t0) / step)), st = (t1 - t0) / n;
        for (let i = 0; i < n; i++) M.pose(pid, t0 + i * st, i % 2 ? "walkB" : "walkA", st, "sine.inOut");
        M.pose(pid, t1, "stand", 0.2, "power1.out");
        if (opts.dx) M.to(pid, t0, { x: cur(pid, "x") + opts.dx }, t1 - t0, opts.ease || "none");
        return M;
      },
      hide(id, t) { return M.set(id, t, { opacity: 0 }); },
      show(id, t) { return M.set(id, t, { opacity: 1 }); }
    };
    return M;
  }

  window.AIMK_RIG = { part, joint, holder, grp, box, person, head, hand, giantHand, art, traced: art, puppet, look, shade, limb, shp, dims, anim,
                      LOOK, POSE, STRESS, EXPR, HANDS, GPOSE, HEADS, HAIR, HAND, STATE, POSES, EXSTATE, HANDV, ghPose, UA, FA, TH, SH, TY };
})();
