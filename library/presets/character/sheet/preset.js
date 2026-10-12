/* character/sheet: a character sheet for approval (the user's hard rule, 09/10/2026: "khi gởi các character sheet thì sẽ có rigging và
   diễn hoạt đầy đủ các tư thế để kiểm tra lỗi tay chân / anatomy / khớp ... trước khi làm animation"). One look of the library rig
   (engine/vendor/libs/aimk/rig.js) in its target box: on the left the character big, ANIMATED through every pose with an expression change on
   each one, blinks and a few words of talking; on the right every pose small and still, the expression set (heads) and the hand set.
   kit.py sheet <film> builds one scene per look of the film's cast and renders the joint check (each pose at 2x) and a video. */
AIMK.preset("character/sheet", { params: { look: "man", over: {}, poses: null, move: 0.35, hold: 0.55, title: "", ink: "#3A3D46", farFront: false },
  build(tl, els, p, ctx) {
    const R = window.AIMK_RIG, host = els[0], hid = host.id, W = ctx.W, H = ctx.H;
    const poses = p.poses || R.STRESS, M = R.anim(tl, p.at), over = p.over || {}, k = H / 1080;
    const exprs = ["smile", "laugh", "surprised", "happy", "neutral", "excited", "content", "proud", "joy"];
    const lab = (id, x, y, txt, size, op = 1, w = 0, align = "left") => {
      R.STATE[id] = { opacity: op };
      return `<div id="${id}" style="position:absolute;left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}text-align:${align};` +
        `font:600 ${Math.round(size)}px/1.2 RFlex, sans-serif;color:${p.ink};white-space:nowrap;opacity:${op}">${txt}</div>`;
    };
    host.style.overflow = "hidden";
    let h = lab(`${hid}_ttl`, 40 * k, 26 * k, p.title || `Character sheet · ${typeof p.look === "string" ? p.look : "look"}`, 30 * k);
    // the big animated figure (left), its pose name under it
    const bigH = 640 * k, bx = 320 * k, by = 330 * k + 0.5 * bigH;
    h += R.person(`${hid}_big`, p.look, "stand", bx, by, bigH / 690, { look: over, farFront: !!p.farFront });
    poses.forEach((ps, i) => { h += lab(`${hid}_pl${i}`, 40 * k, 74 * k, ps, 26 * k, i === 0 ? 1 : 0, 580 * k, "center"); });
    // every pose, still (right): a grid of 7 columns
    const cols = 7, cw = 182 * k, ch = 205 * k, gx = 660 * k, gy = 80 * k, sk = 0.2 * k;
    poses.forEach((ps, i) => {
      const cx = gx + (i % cols) * cw + cw / 2, cy = gy + Math.floor(i / cols) * ch;
      h += R.person(`${hid}_g${i}`, p.look, ps, cx, cy + 112 * k, sk, { look: over, farFront: ps === "crossed" });   // crossed arms: the far arm in front
      h += lab(`${hid}_gl${i}`, cx - cw / 2, cy + 178 * k, ps, 15 * k, 1, cw, "center");
    });
    // the expression set (heads) and the hand set
    const ey = gy + Math.ceil(poses.length / cols) * ch + 30 * k;
    exprs.forEach((e, i) => {
      const x = gx + 70 * k + i * 140 * k;
      h += R.holder(`${hid}_ex${i}`, x, ey + 140 * k, R.head(`${hid}_exh${i}`, p.look, Object.assign({}, over, { expr: e })), { scale: 0.62 * k });
      h += lab(`${hid}_exl${i}`, x - 70 * k, ey + 150 * k, e, 15 * k, 1, 140 * k, "center");
    });
    const hy = ey + 205 * k;
    R.HANDS.forEach((v, i) => {
      const x = gx + 90 * k + i * 205 * k;
      h += R.holder(`${hid}_hd${i}`, x, hy, R.hand(`${hid}_hdh${i}`, p.look, v, over), { scale: 1.55 * k });
      h += lab(`${hid}_hdl${i}`, x - 90 * k, hy + 150 * k, v, 15 * k, 1, 180 * k, "center");
    });
    host.insertAdjacentHTML("beforeend", h);
    // the big figure acts: every pose in turn, an expression on each, blinks, a few words while presenting
    const big = `${hid}_big`, step = p.move + p.hold;
    poses.forEach((ps, i) => {
      const t = 0.4 + i * step;
      M.pose(big, t, ps, p.move, "power2.inOut");
      M.expr(big, t + p.move * 0.5, exprs[i % exprs.length]);
      if (i > 0) M.set(`${hid}_pl${i - 1}`, t, { opacity: 0 }).set(`${hid}_pl${i}`, t, { opacity: 1 });
      if (ps === "present" || ps === "wave") M.talk(big, t + p.move, t + step);
    });
    const end = 0.4 + poses.length * step;
    M.pose(big, end, "stand", p.move, "power2.inOut").expr(big, end, "smile");
    M.blinks(big, 1.1, end + p.move);
    tl.set(host, { opacity: 1 }, end + p.move + 0.4);   // the hold at the end ("auto" scene length)
  } });
