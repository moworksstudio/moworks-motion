/* shape/pixel-sticker: 8-bit pixel-art stickers drawn as crisp SVG rectangles (13 sprites: camera, battery, chip, feather, note, heart, star,
   bolt, sun, arrows, chat, pad, sparkle) in one style: a dark outline and flat fills. The target box becomes the sticker (its width and
   height are set from the sprite x `px`). Colours are letters of a palette, any of which `palette` can override, so one sprite fits any
   brand. Entrances: put a motion on the same box (house/pop-cute, text/land-in "steps"...). Written for a studio 8-bit lyric film
   (08/10/2026). params: name, px (size of one pixel), palette {letter: colour} (K outline, W white, L P V R M lilac / peach / violet / rose /
   mauve, B N A C blues, l m d light greys) */
AIMK.preset("shape/pixel-sticker", { params: { name: "star", px: 10, palette: {} },
  build(tl, els, p, ctx) {
    const PAL = Object.assign({ K: "#2B2B3A", k: "#000000", W: "#FFFFFF", L: "#C3B1E1", P: "#FFC9B9", V: "#A78BFA", R: "#FF8FA3", M: "#E0AAFF",
      B: "#3A3A8C", N: "#7C83FD", A: "#4F86F7", C: "#7CC4FF", l: "#E5DEFF", m: "#CFC6E8", d: "#B8AED6" }, p.palette || {});
    const SPR = {
      camera: ["................", ".....KKKKK......", "..KKKKKKKKKKKK..", ".KPPPPPPPPPPPPK.", ".KPPPKKKKKPPWPK.", ".KPPKNNNNNKPPPK.", ".KPKNNWWNNNKPPK.",
               ".KPKNNWNNNNKPPK.", ".KPKNNNNNNNKPPK.", ".KPPKNNNNNKPPPK.", ".KPPPKKKKKPPPPK.", "..KKKKKKKKKKKK.."],
      battery: [".KKKKKKKKKKKKK..", ".KWWWWWWWWWWWKK.", ".KWCCCCCCCCCWKKK", ".KWCCCCCCCCCWKKK", ".KWCCCCCCCWWWKKK", ".KWCCCCCCCWWWKKK", ".KWWWWWWWWWWWKK.", ".KKKKKKKKKKKKK.."],
      chip: ["...K.K.K.K.K..", "...K.K.K.K.K..", ".KKKKKKKKKKKK.", "KKBBBBBBBBBBKK", ".KBNNNNNNNNBK.", "KKBNWWWWWWNBKK", ".KBNWBBBBWNBK.",
             "KKBNWBBBBWNBKK", ".KBNWWWWWWNBK.", "KKBNNNNNNNNBKK", ".KBBBBBBBBBBK.", ".KKKKKKKKKKKK.", "...K.K.K.K.K..", "...K.K.K.K.K.."],
      feather: ["..........KK..", ".........KLLK.", "........KLLLK.", ".......KLLVLK.", "......KLLVLK..", ".....KLLVLLK..", "....KLLVLLK...", "...KLLVLLK....",
                "...KLVLLK.....", "..KLVLLK......", "..KVLLK.......", "..KVKK........", ".KVK..........", ".KK...........", "KK............"],
      note: [".....KKKKKKK", ".....KNNNNNK", ".....KNKKKNK", ".....KNK.KNK", ".....KNK.KNK", "..KKKKNK.KNK", ".KNNNNNKKKNK", "KNNNNNNKNNNK", "KNNNNNKNNNNK", ".KNNNK.KNNK.", "..KKK...KK.."],
      heart: ["..KKK...KKK..", ".KRRRK.KRRRK.", "KRRWRRKRRRRRK", "KRWRRRRRRRRRK", "KRRRRRRRRRRRK", ".KRRRRRRRRRK.", "..KRRRRRRRK..", "...KRRRRRK...", "....KRRRK....", ".....KRK.....", "......K......"],
      star: [".....K.....", "....KNK....", "....KNK....", "...KNWNK...", "KKKKNWNKKKK", "KNNNWWWNNNK", "KKKKNWNKKKK", "...KNWNK...", "....KNK....", "....KNK....", ".....K....."],
      bolt: [".....KKKK.", "....KCCK..", "...KCCK...", "..KCCK....", ".KCCKKKK..", "KCCCCCCK..", "KKKKCCK...", "...KCCK...", "..KCCK....", "..KCK.....", ".KCK......", ".KK......."],
      sun: [".......K.......", "..K....K....K..", "...K.......K...", ".....KKKKK.....", "....KPPPPPK....", "...KPPWWPPPK...", "KK.KPWPPPPPK.KK", "...KPPPPPPPK...",
            "...KPPPPPPPK...", "....KPPPPPK....", ".....KKKKK.....", "...K.......K...", "..K....K....K..", ".......K......."],
      arrows: ["...K.......K...", "..KK.......KK..", ".KNKKKKKKKKKNK.", "KNNNNNNNNNNNNNK", ".KNKKKKKKKKKNK.", "..KK.......KK..", "...K.......K..."],
      chat: [".KKKKKKKKKKKKKK.", "KWWWWWWWWWWWWWWK", "KWWWWWWWWWWWWWWK", "KWWKKWWKKWWKKWWK", "KWWKKWWKKWWKKWWK", "KWWWWWWWWWWWWWWK", ".KKKKWWKKKKKKKK.", "....KWK.........", "....KK.........."],
      pad: ["..KKKKKKKKKKKK..", ".KVVVVVVVVVVVVK.", "KVVKVVVVVVVVWVVK", "KVKKKVVVVVVWVWVK", "KVVKVVVVVVVVWVVK", "KVVVVVKKKKVVVVVK", "KVVVVK....KVVVVK", ".KVVK......KVVK.", "..KK........KK.."],
      sparkle: ["...K...", "..KCK..", "KKCWCKK", "KCWWWCK", "KKCWCKK", "..KCK..", "...K..."] };
    const rows = SPR[p.name];
    if (!rows) throw new Error(`shape/pixel-sticker: name "${p.name}"? one of ${Object.keys(SPR).join(", ")}`);
    const w = Math.max(...rows.map(r => r.length)), h = rows.length; let rects = "";
    rows.forEach((r, y) => { for (let x = 0; x < r.length;) { const c = r[x]; if (c === ".") { x++; continue; } let x2 = x; while (x2 + 1 < r.length && r[x2 + 1] === c) x2++;
      rects += `<rect x="${x}" y="${y}" width="${x2 - x + 1}" height="1" fill="${PAL[c]}"/>`; x = x2 + 1; } });
    for (const el of els) {
      el.style.width = w * p.px + "px"; el.style.height = h * p.px + "px";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" shape-rendering="crispEdges" style="display:block">${rects}</svg>`;
    }
  } });
