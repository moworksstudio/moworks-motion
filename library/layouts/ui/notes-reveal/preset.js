/* ui/notes-reveal: a phone Notes app (portrait 1080 x 1920 design). A note with a two-line title is typed out character by character (7 lines, caret riding the text, the note
   scrolling up in 5 per-frame-sampled steps) above a format bar and a keyboard; at 21.375 s the whole notes screen fades out and reveals a hand-lettered closing card
   (a headline with an underline and a ringed word, a 3-row checklist with ticks, a sign-off strip with a logo and a domain, a video thumbnail).
   Port of HyperFrames registry block notes-reveal. BLOCK: the target is an empty box; the 1080 x 1920 design is built inside it and fitted (contain, centred) with one static scale,
   so every number is the source pixel value (scale 1 in a 1080 x 1920 film).
   Source timing kept: the typing rhythm (per-character frames at 30 fps, text spread over the same window when a line has another length), the 5 scroll curves (one literal
   set per frame), the caret jumps, the 0.2833 s linear crossfade at 21.375 s, composition length 24.85 s (demo duration).
   Measurements are not available at build time (fonts load later), so: the caret is a child of each typed character (it rides the character by layout), the underline and the ring
   are positioned in em from their word by CSS (no measurement), and the width fitting of the source is an estimate from the character count (average glyph width), which only
   ever shrinks the text. The hand-lettered fonts are shipped in assets/ (Permanent Marker, Apache-2.0; Courier Prime, OFL); they have no Vietnamese accents, so an accented letter
   falls back to the film's font. */
AIMK.preset("ui/notes-reveal", {
  params: {
    title_l1: "Những điều chẳng ai", title_l2: "nói về làm phim.",
    lines: ["phim mình làm toàn dở", "phần mềm đắt, sửa mãi không xong", "mỗi lần sửa lại mất cả ngày.", "rồi mình thử chỉ viết mã HTML", "mới thử cách này ba tuần trước", "hết cảnh vật lộn, mà còn hơn thế —", "tuần nào mình cũng ra phim mới."],
    card_top: "VIDEO 4K", card_mid: "&", card_bottom: "CODE SẠCH",
    checks: [["CODE", "HTML"], ["RENDER", "4K"], ["UPLOAD", "NGAY"]],
    brand_logo: "", brand_domain: "tenmien.vn", time: "9:41", suggestions: ["Mình", "Và", "Tôi"], space_label: "dấu cách",
  },
  build(tl, els, p, ctx) {
    const MK = `"AIMK Permanent Marker", "RFlex", cursive`, CP = `"AIMK Courier Prime", "RFlex", monospace`;
    ctx.css("ui/notes-reveal", `
@font-face { font-family: "AIMK Permanent Marker"; src: url("${ctx.asset("permanent-marker-400.woff2")}") format("woff2"); }
@font-face { font-family: "AIMK Courier Prime"; font-weight: 400; src: url("${ctx.asset("courier-prime-400.woff2")}") format("woff2"); }
@font-face { font-family: "AIMK Courier Prime"; font-weight: 700; src: url("${ctx.asset("courier-prime-700.woff2")}") format("woff2"); }
.uinr { position: absolute; width: 1080px; height: 1920px; overflow: hidden; transform-origin: 0 0; background: #000; box-sizing: border-box; }
.uinr * { box-sizing: border-box; }
.uinr-abs { position: absolute; }
.uinr-cardscene { position: absolute; inset: 0; background: #ece1d5; }
.uinr-dots { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(178, 150, 138, 0.18) 2px, transparent 2.6px); background-size: 36px 36px; background-position: 8px 6px; }
.uinr-card { position: absolute; left: 119px; top: 210px; width: 840px; height: 1498px; background: #fcfcfc; transform: rotate(-3.03deg); box-shadow: 0 12px 30px rgba(90, 60, 40, 0.12); }
.uinr-mk { position: absolute; font-family: ${MK}; color: #602640; white-space: pre; line-height: 1.4545; }
.uinr-tail { position: relative; display: inline-block; }
.uinr-tail::after { content: ""; position: absolute; left: -0.4em; right: -0.0364em; top: 1.127em; height: 8px; background: #602640; border-radius: 4px; }
.uinr-head { position: relative; display: inline-block; padding-left: 24px; }
.uinr-ring { position: absolute; border: 8px solid #602640; border-radius: 50%; left: calc(20px - 0.3727em); top: calc(0.0182em - 4px); width: calc(100% - 16px - 0.2em); height: calc(1.109em + 8px); }
.uinr-cl-label { position: absolute; font-family: ${CP}; font-weight: 700; color: #602640; transform: scaleX(0.86); transform-origin: left top; white-space: nowrap; line-height: 1.2; }
.uinr-cl-value { position: absolute; font-family: ${MK}; color: #602640; white-space: nowrap; line-height: 1.4545; }
.uinr-rule { position: absolute; width: 695px; height: 2.5px; background: #602640; opacity: 0.92; }
.uinr-strip { position: absolute; left: 0; top: 1742px; width: 1080px; height: 132px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
.uinr-strip img { display: block; height: 52px; width: auto; }
.uinr-domain { font-family: ${CP}; font-weight: 700; font-size: 27px; letter-spacing: 4px; color: #602640; opacity: 0.62; line-height: 32px; white-space: nowrap; }
.uinr-video { position: absolute; left: 380px; top: 740px; width: 320px; height: 480px; border-radius: 40px; background: linear-gradient(165deg, #0f3a2c 0%, #0a9c6b 78%, #3ce6ac 100%); box-shadow: 0 20px 48px rgba(90, 60, 40, 0.28); transform: rotate(-3.03deg); }
.uinr-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border-radius: 50%; background: rgba(253, 253, 253, 0.94); display: grid; place-items: center; }
.uinr-notes { position: absolute; inset: 0; background: #fefefe; }
.uinr-time { position: absolute; left: 63px; top: 48px; font-size: 38px; font-weight: 600; letter-spacing: 0.5px; color: #111; line-height: 46px; }
.uinr-pill { position: absolute; background: #ffffff; border-radius: 70px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06); }
.uinr-viewport { position: absolute; left: 0; top: 272px; width: 1080px; height: 593px; overflow: hidden; }
.uinr-body { position: absolute; left: 0; top: 0; width: 1080px; height: 2400px; }
.uinr-title { position: absolute; left: 62px; font-weight: 700; letter-spacing: -0.005em; color: #191919; white-space: nowrap; line-height: 103px; }
.uinr-line { position: absolute; left: 62px; font-weight: 400; color: #191919; white-space: pre; line-height: 62px; }
.uinr-ch { position: relative; visibility: hidden; }
.uinr-caret { position: absolute; width: 4.5px; height: 54px; background: #ffca00; border-radius: 2px; visibility: hidden; }
.uinr-ch .uinr-caret { left: 100%; margin-left: 2px; top: calc(50% - 27px); }
.uinr-fmtbar { position: absolute; left: 35px; top: 878px; width: 1010px; height: 118px; background: #fdfdfd; border-radius: 59px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); }
.uinr-aa { position: absolute; height: 118px; display: flex; align-items: center; justify-content: center; left: 52px; width: 100px; top: 878px; font-size: 54px; font-weight: 700; color: #111; }
.uinr-keyboard { position: absolute; left: 0; top: 1033px; width: 1080px; height: 887px; background: #cfd3da; }
.uinr-sug { position: absolute; top: 40px; font-size: 40px; color: #1b1b1b; line-height: 48px; white-space: nowrap; }
.uinr-sep { position: absolute; top: 44px; width: 2px; height: 44px; background: #b9bdc4; }
.uinr-key { position: absolute; background: #fdfdfe; border-radius: 12px; box-shadow: 0 3px 0 rgba(120, 125, 135, 0.55); color: #111; font-size: 48px; display: flex; align-items: center; justify-content: center; width: 87px; height: 106px; }
.uinr-key.g { background: #a9aeb5; }
.uinr-svg { position: absolute; display: block; }`);
    const NORM = s => String(s).normalize("NFC");
    const fit = (str, base, maxW, avg, extra = 0, ls = 0) => { const n = Math.max(1, Array.from(NORM(str)).length); return Math.max(base * 0.45, Math.min(base, Math.floor(base * (maxW - extra) / (n * (avg * base + ls))))); };
    const svg = (cls, style, w, h, vb, inner) => `<svg class="uinr-svg ${cls || ""}" style="${style}" width="${w}" height="${h}" viewBox="${vb}">${inner}</svg>`;
    const I = "#111";
    const STATIC_NOTES = [
      svg("", "left:822px;top:52px", 220, 40, "0 0 220 40", `<rect x="0" y="22" width="7" height="12" rx="2" fill="${I}"/><rect x="11" y="16" width="7" height="18" rx="2" fill="${I}"/><rect x="22" y="10" width="7" height="24" rx="2" fill="${I}"/><rect x="33" y="4" width="7" height="30" rx="2" fill="${I}"/><path d="M78 15 a26 26 0 0 1 34 0" fill="none" stroke="${I}" stroke-width="6" stroke-linecap="round"/><path d="M84 23 a17 17 0 0 1 22 0" fill="none" stroke="${I}" stroke-width="6" stroke-linecap="round"/><circle cx="95" cy="31" r="5" fill="${I}"/><rect x="140" y="6" width="52" height="28" rx="9" fill="none" stroke="${I}" stroke-width="3" opacity="0.5"/><rect x="144" y="10" width="34" height="20" rx="5" fill="${I}"/><path d="M196 14 v12 a7 7 0 0 0 0 -12" fill="${I}" opacity="0.5"/>`),
      `<div class="uinr-pill" style="left:38px;top:130px;width:110px;height:110px"></div>`,
      svg("", "left:74px;top:166px", 40, 40, "0 0 40 40", `<path d="M26 4 L10 20 L26 36" fill="none" stroke="${I}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`),
      `<div class="uinr-pill" style="left:540px;top:130px;width:380px;height:110px"></div>`,
      svg("", "left:588px;top:168px", 44, 40, "0 0 44 40", `<path d="M8 12 a 14 14 0 1 1 -3 14" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round"/><path d="M8 2 v11 h11" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
      svg("", "left:702px;top:162px", 44, 48, "0 0 44 48", `<path d="M22 4 v26 M12 12 l10 -9 10 9" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 22 h-2 v22 h32 v-22 h-2" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round"/>`),
      svg("", "left:806px;top:186px", 66, 12, "0 0 66 12", `<circle cx="6" cy="6" r="5.5" fill="${I}"/><circle cx="33" cy="6" r="5.5" fill="${I}"/><circle cx="60" cy="6" r="5.5" fill="${I}"/>`),
      `<div class="uinr-abs" style="left:932px;top:136px;width:110px;height:110px;border-radius:55px;background:#fec909"></div>`,
      svg("", "left:958px;top:168px", 56, 46, "0 0 56 46", `<path d="M6 24 L21 38 L50 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`),
    ].join("");
    const FMT = [
      `<div class="uinr-fmtbar"></div>`,
      `<div class="uinr-aa">A<span style="font-size:36px;font-weight:400;align-self:center;margin-top:12px">a</span></div>`,
      svg("", "left:252px;top:910px", 64, 54, "0 0 64 54", `<circle cx="10" cy="12" r="9" fill="none" stroke="${I}" stroke-width="4"/><path d="M6 12 l3 3 6 -7" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/><line x1="28" y1="12" x2="60" y2="12" stroke="${I}" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="42" r="9" fill="none" stroke="${I}" stroke-width="4"/><line x1="28" y1="42" x2="52" y2="42" stroke="${I}" stroke-width="4" stroke-linecap="round"/>`),
      svg("", "left:432px;top:906px", 62, 62, "0 0 62 62", `<rect x="3" y="3" width="56" height="56" rx="8" fill="none" stroke="${I}" stroke-width="4"/><line x1="3" y1="22" x2="59" y2="22" stroke="${I}" stroke-width="4"/><line x1="3" y1="40" x2="59" y2="40" stroke="${I}" stroke-width="4"/><line x1="22" y1="3" x2="22" y2="59" stroke="${I}" stroke-width="4"/><line x1="40" y1="3" x2="40" y2="59" stroke="${I}" stroke-width="4"/>`),
      svg("", "left:612px;top:902px", 46, 70, "0 0 46 70", `<path d="M33 14 v34 a11 11 0 0 1 -22 0 V16 a8 8 0 0 1 16 0 v30 a4 4 0 0 1 -8 0 V20" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round"/>`),
      svg("", "left:774px;top:906px", 62, 62, "0 0 62 62", `<circle cx="31" cy="31" r="27" fill="none" stroke="${I}" stroke-width="4"/><path d="M22 40 L36 18 a5 5 0 0 1 8 6 L30 46 l-10 4 z" fill="${I}"/>`),
      svg("", "left:944px;top:906px", 64, 62, "0 0 64 62", `<ellipse cx="32" cy="31" rx="28" ry="12" fill="none" stroke="${I}" stroke-width="3.5" transform="rotate(25 32 31)"/><ellipse cx="32" cy="31" rx="28" ry="12" fill="none" stroke="${I}" stroke-width="3.5" transform="rotate(-25 32 31)"/><ellipse cx="32" cy="31" rx="28" ry="12" fill="none" stroke="${I}" stroke-width="3.5" transform="rotate(90 32 31)"/>`),
    ].join("");
    const ROWS = [["qwertyuiop", [18, 124, 231, 337, 444, 550, 656, 763, 869, 976], 99], ["asdfghjkl", [72, 178, 285, 391, 498, 604, 710, 817, 923], 230], ["zxcvbnm", [178, 284, 391, 497, 604, 710, 816], 359]];
    let kb = (p.suggestions || []).slice(0, 3).map((s, i) => `<div class="uinr-sug" style="left:${[155, 513, 886][i]}px">${s}</div>`).join("") + `<div class="uinr-sep" style="left:360px"></div><div class="uinr-sep" style="left:717px"></div>`;
    ROWS.forEach(([letters, xs, top]) => { for (let i = 0; i < letters.length; i++) kb += `<div class="uinr-key" style="left:${xs[i]}px;top:${top}px">${letters[i]}</div>`; });
    kb += `<div class="uinr-key g" style="left:16px;top:359px;width:144px">${svg("", "position:static", 44, 44, "0 0 44 44", `<path d="M22 6 L38 22 H30 V38 H14 V22 H6 Z" fill="none" stroke="#111" stroke-width="3" stroke-linejoin="round"/>`)}</div>`
      + `<div class="uinr-key g" style="left:920px;top:359px;width:143px">${svg("", "position:static", 52, 38, "0 0 52 38", `<path d="M16 2 H48 V36 H16 L2 19 Z" fill="none" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M25 12 l14 14 M39 12 l-14 14" stroke="#111" stroke-width="3" stroke-linecap="round"/>`)}</div>`
      + `<div class="uinr-key g" style="left:17px;top:489px;width:135px;font-size:38px">123</div>`
      + `<div class="uinr-key" style="left:172px;top:489px;width:119px">${svg("", "position:static", 44, 44, "0 0 44 44", `<circle cx="22" cy="22" r="19" fill="none" stroke="#111" stroke-width="3"/><circle cx="15" cy="17" r="2.6" fill="#111"/><circle cx="29" cy="17" r="2.6" fill="#111"/><path d="M13 27 a10 10 0 0 0 18 0 z" fill="#111"/>`)}</div>`
      + `<div class="uinr-key" style="left:314px;top:489px;width:554px;font-size:40px">${p.space_label}</div>`
      + `<div class="uinr-key g" style="left:889px;top:489px;width:173px">${svg("", "position:static", 44, 36, "0 0 44 36", `<path d="M40 4 v14 H10 M18 8 l-10 10 10 10" fill="none" stroke="#111" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`)}</div>`
      + svg("", "left:64px;top:640px", 48, 48, "0 0 48 48", `<circle cx="24" cy="24" r="20" fill="none" stroke="#333" stroke-width="3"/><ellipse cx="24" cy="24" rx="9" ry="20" fill="none" stroke="#333" stroke-width="3"/><line x1="4" y1="24" x2="44" y2="24" stroke="#333" stroke-width="3"/>`)
      + svg("", "left:972px;top:634px", 44, 58, "0 0 44 58", `<rect x="14" y="2" width="16" height="30" rx="8" fill="none" stroke="#333" stroke-width="3.5"/><path d="M6 26 a16 16 0 0 0 32 0 M22 44 v10 M12 54 h20" fill="none" stroke="#333" stroke-width="3.5" stroke-linecap="round"/>`);
    const TICK = (x, y) => svg("", `left:${x}px;top:${y}px`, 50, 46, "0 0 86 80", `<path d="M6 46 L30 72 L80 8" fill="none" stroke="#602640" stroke-width="6" stroke-linecap="round"/>`);

    /* typing rhythm of the source: per line, the frame (30 fps) of each character; the text is spread over the same window when a line has another length */
    const FR = [[40, 42, 46, 48, 50, 53, 56, 59, 60, 62, 66, 68, 72, 74, 77, 80], [106, 108, 110, 114, 116, 119, 120, 122, 125, 127, 131, 132, 134, 137, 139, 142, 144],
      [167, 170, 172, 174, 176, 180, 182, 185, 187, 190, 192, 194, 196, 198, 200, 203, 205, 208, 210, 212, 216, 218, 221],
      [256, 258, 262, 264, 266, 269, 271, 274, 275, 277, 280, 281, 282, 284, 287, 288, 290, 293, 295, 298, 299, 301, 304, 306, 310, 311, 313, 316, 318, 320],
      [349, 352, 354, 356, 359, 361, 364, 366, 368, 371, 372, 374, 378, 380, 382, 385, 388, 389, 390, 394, 395, 397, 400, 401, 403, 406, 408, 410, 412, 414, 416, 419, 421, 424, 425],
      [449, 450, 452, 455, 457, 460, 462, 466, 468, 469, 472, 474, 476, 479, 481, 482, 485, 487, 490, 492, 493, 496, 497, 499, 502, 504, 506, 509, 510, 512, 515, 517, 520, 522, 523, 526, 528, 530, 532],
      [558, 560, 563, 565, 568, 571, 574, 575, 577, 580, 581, 584, 587, 589, 592, 593, 595, 599, 602, 604, 606]];
    const JUMPS = [[86, 1], [149, 2], [226, 3], [325, 4], [430, 5], [537, 6]];
    const LINE_TOPS = [296, 446, 596, 746, 896, 1046, 1196];
    const SCROLLS = [
      { px: 120, pts: [[150, 21.74], [151, 53.93], [152, 77.33], [153, 77.33], [154, 94.06], [155, 102.95], [156, 111.73], [157, 115.18], [158, 118.01], [159, 118.01], [160, 119.35], [161, 119.87], [162, 119.87], [163, 119.87], [164, 119.87], [165, 119.87], [166, 120]] },
      { px: 150, pts: [[227, 9.29], [228, 44.61], [229, 74.77], [230, 102.53], [231, 102.53], [232, 117.91], [233, 133.34], [234, 140.03], [235, 145.24], [236, 148.87], [237, 148.87], [238, 149.85], [239, 149.95], [240, 149.95], [241, 149.95], [242, 149.95], [243, 149.95], [244, 150]] },
      { px: 150, pts: [[326, 9.11], [327, 9.11], [328, 31.8], [329, 73.0], [330, 100.53], [331, 118.84], [332, 131.65], [333, 131.65], [334, 140.05], [335, 144.79], [336, 148.7], [337, 149.91], [338, 149.95], [339, 149.95], [340, 149.95], [341, 149.95], [342, 150]] },
      { px: 150, pts: [[431, 28.09], [432, 60.69], [433, 92.33], [434, 113.98], [435, 113.98], [436, 125.5], [437, 136.13], [438, 143.99], [439, 147.13], [440, 149.17], [441, 149.17], [442, 149.97], [443, 149.97], [444, 149.97], [445, 149.97], [446, 149.97], [447, 150]] },
      { px: 150, pts: [[538, 25.26], [539, 61.96], [540, 93.98], [541, 105.0], [542, 122.63], [543, 122.63], [544, 138.9], [545, 144.2], [546, 147.27], [547, 149.63], [548, 149.95], [549, 149.95], [550, 149.95], [551, 149.95], [552, 149.95], [553, 149.95], [554, 150]] },
    ];
    const ta = f => (f - 0.25) / 30;
    const events = (lines) => lines.map((txt, li) => {
      const chars = Array.from(NORM(txt)), pk = FR[li];
      if (!chars.length) return [];
      if (chars.length === pk.length) return chars.map((c, ri) => pk[ri]);
      const f0 = pk[0], f1 = pk[pk.length - 1], span = Math.max(1, f1 - f0);
      return chars.map((c, ri) => chars.length === 1 ? f0 : f0 + Math.round(span * ri / (chars.length - 1)));
    });

    for (const slot of els) {
      const sw = slot.offsetWidth || ctx.W, sh = slot.offsetHeight || ctx.H, k = Math.min(sw / 1080, sh / 1920);
      const d = ctx.make(slot, "div", "d", { cls: "uinr", style: { left: ((sw - 1080 * k) / 2).toFixed(2) + "px", top: ((sh - 1920 * k) / 2).toFixed(2) + "px", transform: k === 1 ? "" : `scale(${k.toFixed(5)})` } });
      /* closing card (under the notes) */
      const cs = ctx.make(d, "div", "card", { cls: "uinr-cardscene" });
      ctx.make(cs, "div", "dots", { cls: "uinr-dots" });
      const card = ctx.make(cs, "div", "c", { cls: "uinr-card" });
      const top = NORM(p.card_top), sp = top.lastIndexOf(" ");
      const f1 = fit(top, 110, 700, 0.63, 0, 2), f2 = fit(p.card_mid, 100, 792, 0.66);
      const bot = NORM(p.card_bottom), bs = bot.indexOf(" ");
      const f3 = fit(bot, 110, 661, 0.63, 76);
      ctx.make(card, "div", "hl1", { cls: "uinr-mk", style: { left: "116px", top: "72px", fontSize: f1 + "px", letterSpacing: "2px" },
        html: (sp === -1 ? "" : `<span>${top.slice(0, sp + 1)}</span>`) + `<span class="uinr-tail">${sp === -1 ? top : top.slice(sp + 1)}</span>` });
      ctx.make(card, "div", "hl2", { cls: "uinr-mk", style: { left: "2px", top: "181px", width: "840px", textAlign: "center", fontSize: f2 + "px" }, text: NORM(p.card_mid) });
      ctx.make(card, "div", "hl3", { cls: "uinr-mk", style: { left: "155px", top: "329px", fontSize: f3 + "px" },
        html: `<span class="uinr-head">${bs === -1 ? bot : bot.slice(0, bs)}<i class="uinr-ring"></i></span>` + (bs === -1 ? "" : `<span style="padding-left:52px">${bot.slice(bs + 1)}</span>`) });
      const CL = [[1073, 1051, 1059, 1139, 74, 389, 72], [1212, 1188, 1196, 1276, 72, 390, 65], [1347, 1324, 1334, 1412, 72, 389, 58]];
      (p.checks || []).slice(0, 3).forEach(([lab, val], i) => {
        const [yl, yv, yt, yr, xl, xv, xr] = CL[i];
        ctx.make(card, "div", "lab" + i, { cls: "uinr-cl-label", text: NORM(lab), style: { left: xl + "px", top: yl + "px", fontSize: fit(lab, 44, 347, 0.6) + "px" } });
        ctx.make(card, "div", "val" + i, { cls: "uinr-cl-value", text: NORM(val), style: { left: xv + "px", top: yv + "px", fontSize: fit(val, 50, 310, 0.63) + "px" } });
        ctx.make(card, "div", "tick" + i, { html: TICK(715, yt), style: { position: "absolute", left: "0", top: "0" } });
        ctx.make(card, "div", "rule" + i, { cls: "uinr-rule", style: { left: xr + "px", top: yr + "px" } });
      });
      const strip = ctx.make(cs, "div", "strip", { cls: "uinr-strip" });
      ctx.make(strip, "img", "logo", { attrs: { src: p.brand_logo || ctx.asset("hyperframes-logo-black.svg"), alt: "" } });
      ctx.make(strip, "div", "domain", { cls: "uinr-domain", text: p.brand_domain });
      ctx.make(ctx.make(cs, "div", "video", { cls: "uinr-video" }), "div", "play", { cls: "uinr-play",
        html: `<svg width="52" height="58" viewBox="0 0 44 48" fill="none"><path d="M40.5 20.6 C43.2 22.1 43.2 25.9 40.5 27.4 L6.2 46.6 C3.5 48.1 0.2 46.2 0.2 43.2 L0.2 4.8 C0.2 1.8 3.5 -0.1 6.2 1.4 Z" fill="#0d0d0d"/></svg>` });
      /* notes screen (over) */
      const notes = ctx.make(d, "div", "notes", { cls: "uinr-notes" });
      ctx.make(notes, "div", "time", { cls: "uinr-time", text: p.time });
      ctx.make(notes, "div", "chrome", { html: STATIC_NOTES, style: { position: "absolute", left: "0", top: "0", width: "1080px", height: "0" } });
      const vp = ctx.make(notes, "div", "vp", { cls: "uinr-viewport" });
      const body = ctx.make(vp, "div", "body", { cls: "uinr-body" });
      ctx.make(body, "div", "t1", { cls: "uinr-title", text: NORM(p.title_l1), style: { top: "52px", fontSize: fit(p.title_l1, 88, 978, 0.487) + "px" } });
      ctx.make(body, "div", "t2", { cls: "uinr-title", text: NORM(p.title_l2), style: { top: "152px", fontSize: fit(p.title_l2, 88, 978, 0.487) + "px" } });
      const lines = (p.lines || []).slice(0, 7), ev = events(lines);
      const T = ev.map(a => a.map(ta));                      // seconds, per line per character
      const jumpT = {}; JUMPS.forEach(([f, li]) => jumpT[li] = ta(f) - 0.0005);
      const t = p.at;
      const startCaret = [];
      lines.forEach((txt, li) => {
        const ln = ctx.make(body, "div", "l" + li, { cls: "uinr-line", style: { top: [283, 433, 583, 733, 883, 1033, 1183][li] + "px", fontSize: fit(txt, 52.5, 978, 0.5) + "px" } });
        const chars = Array.from(NORM(txt));
        const cs_ = chars.map((c, ri) => { const s = ctx.make(ln, "span", "c" + ri, { cls: "uinr-ch", text: c }); const kc = ctx.make(s, "i", "k", { cls: "uinr-caret" }); return [s, kc]; });
        cs_.forEach(([s, kc], ri) => {
          const at = t + T[li][ri];
          tl.set(s, { autoAlpha: 1 }, at);
          tl.set(kc, { autoAlpha: 1 }, at);
          const nxt = ri + 1 < chars.length ? T[li][ri + 1] : (li < 6 ? jumpT[li + 1] : null);
          if (nxt != null) tl.set(kc, { autoAlpha: 0 }, t + nxt);
        });
        const sc = ctx.make(body, "i", "s" + li, { cls: "uinr-caret", style: { left: "62px", top: (LINE_TOPS[li] - 8) + "px" } });
        startCaret.push(sc);
        tl.set(sc, { autoAlpha: 1 }, t + (li === 0 ? 0 : jumpT[li]));
        tl.set(sc, { autoAlpha: 0 }, t + T[li][0]);
      });
      ctx.make(notes, "div", "fmt", { html: FMT, style: { position: "absolute", left: "0", top: "0", width: "1080px", height: "0" } });
      ctx.make(notes, "div", "kb", { cls: "uinr-keyboard", html: kb });
      /* scrolls: the source's per-frame samples, cumulative */
      let cum = 0;
      SCROLLS.forEach(s => {
        s.pts.forEach(([f, dy]) => tl.set(body, { y: -(cum + dy) }, t + ta(f)));
        tl.set(body, { y: -(cum + s.px) }, t + ta(s.pts[s.pts.length - 1][0] + 1));
        cum += s.px;
      });
      tl.fromTo(notes, { opacity: 1 }, { opacity: 0, duration: 0.2833, ease: "none" }, t + 21.375);
    }
  },
});
