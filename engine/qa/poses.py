"""kit.py poses: read a pre-rendered product sequence before using it (07/10/2026 test: a back view held upside down, camera at the
bottom, because the contact sheet was read without noting which way up each pose was).

  python kit.py poses <project> <folder | pattern> [--every 8]
    <folder>: the numbered pictures (f0001.webp..., product_render.0000.png...); a pattern "assets/images/product/f####.webp" also works
    -> 02_Assets/Stills/poses/sheet.png      every Nth frame with its number; frames of a rest pose framed in green
       02_Assets/Stills/poses/rests.png      one big picture per rest pose (its middle frame), labelled with its frame range
       01_Brief/POSES.md                   a table to fill in after looking at the sheets: open / closed, front / back / edge, WHICH WAY UP,
                                           and the portals: rest poses that show the same picture (a jump between them is invisible)
                                           (where the camera is), hold or pass through (written as POSES.new.md if the user has it open)
A rest pose = frames that barely change (mean difference under 0.4 % at 96 px, at least 4 frames in a row), or a slow point (a single frame
where a turn eases out and back, under 0.6 %): only those may be held in a film (motion/image-sequence); everything else is played at an
even cadence.
The product's box in every frame (chat B's proposal 07/10/2026, done 08/10/2026 night: place text by the product's real width, which a turn
changes): the opaque part of each picture (alpha > 8), as fractions of the picture, cached in <project>/qa/seq-boxes.json; POSES.md lists
it per rest pose with the widest and narrowest frames. On screen: the element's box (object-fit: contain) x these fractions. The lint uses the
same boxes (qa/buildlint.py: a product that moves next to resting text)."""
import json, re
from pathlib import Path

SEQ = re.compile(r"^(.*?)(\d+)(\.(?:png|webp|jpe?g|tiff?))$", re.I)


def boxes(p, files):
    """{file: [x0, y0, x1, y1]} the opaque part of each picture as fractions of it (a picture with no alpha: the whole frame), cached in
    <project>/qa/seq-boxes.json by relative path + size + modified time (a later lint reads it instead of decoding the pictures again)"""
    from PIL import Image
    p = Path(p); cf = p / "qa" / "seq-boxes.json"
    try: cache = json.loads(cf.read_text(encoding="utf-8"))
    except (OSError, ValueError): cache = {}
    out, new = {}, False
    for f in files:
        f = Path(f)
        try: rel = f.resolve().relative_to(p.resolve()).as_posix()
        except ValueError: rel = f.resolve().as_posix()
        st = f.stat(); sig = f"{st.st_size}:{int(st.st_mtime)}"
        if rel in cache and cache[rel][0] == sig: out[f] = cache[rel][1]; continue
        with Image.open(f) as im:
            W, H = im.size
            alpha = im.mode in ("RGBA", "LA", "PA") or "transparency" in im.info
            bb = im.convert("RGBA").getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox() if alpha else (0, 0, W, H)
        box = [round(bb[0] / W, 4), round(bb[1] / H, 4), round(bb[2] / W, 4), round(bb[3] / H, 4)] if bb else [0.0, 0.0, 0.0, 0.0]   # empty
        cache[rel] = [sig, box]; out[f] = box; new = True
    if new:
        cf.parent.mkdir(parents=True, exist_ok=True); cf.write_text(json.dumps(cache, indent=0), encoding="utf-8")
    return out


def frames_of(p, where):
    from common import in_film
    w = in_film(p, where)
    if "#" in w.name:                                      # a pattern: prefix + #### + ext
        m = re.match(r"^(.*?)(#+)(\.\w+)$", w.name); pre, dig, ext = m.group(1), len(m.group(2)), m.group(3)
        files = sorted(w.parent.glob(pre + "[0-9]" * dig + ext))
    else:
        files = sorted(x for x in w.iterdir() if SEQ.match(x.name)) if w.is_dir() else []
        if files:                                          # the most common prefix (a folder may hold other colours)
            pres = {}
            for x in files: pres[SEQ.match(x.name).group(1)] = pres.get(SEQ.match(x.name).group(1), 0) + 1
            top = max(pres, key=pres.get); files = [x for x in files if SEQ.match(x.name).group(1) == top]
    if not files: raise SystemExit(f"poses: no numbered pictures in {w}")
    return [(int(SEQ.match(x.name).group(2)), x) for x in files]


def run(p, where, every=8, say=print):
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    p = Path(p); fr = frames_of(p, where)
    say(f"poses: {len(fr)} frames ({fr[0][1].name} .. {fr[-1][1].name}), reading...")
    small, thumbs = [], {}
    for n, f in fr:
        with Image.open(f) as im:
            im = im.convert("RGBA"); w = 96; h = round(im.height * w / im.width)
            s = np.asarray(im.resize((w, h)), dtype=np.float32) / 255.0
            small.append(np.concatenate([s[..., :3] * s[..., 3:4], s[..., 3:4]], axis=2))      # premultiplied: a transparent margin is equal
            thumbs[n] = im.resize((160, round(im.height * 160 / im.width)))
    diff = [0.0] + [float(np.abs(small[i] - small[i - 1]).mean()) for i in range(1, len(small))]
    still = [d < 0.004 for d in diff]
    rests, i = [], 0
    while i < len(fr):                                     # a run of frames each nearly equal to the one before
        j = i
        while j + 1 < len(fr) and still[j + 1]: j += 1
        if j - i + 1 >= 4: rests.append((fr[i][0], fr[j][0]))
        i = j + 1
    inrest = lambda n: any(a <= n <= b for a, b in rests)
    # slow points: where a turn eases out and back (the frame changes least there, under 0.6 %), not still for 4 frames: a pose a film may
    # rest on for a moment (on a test render: 417, the open back with the cameras, and 578, the same back seen upside down)
    for i in range(1, len(fr) - 1):
        n = fr[i][0]
        if diff[i] < 0.006 and diff[i] <= diff[i - 1] and diff[i] <= diff[i + 1] and not inrest(n) and not any(abs(n - a) <= 3 for a, _ in rests):
            rests.append((n, n))
    rests.sort()
    # portals (Test 1, 08/10/2026: found by hand, closed front 1 = 121 = 221 and open front 322 = 520 = 641): rest poses that show the same
    # picture, so a film can jump from one to the other with nothing seen (one continuous phone through every pose)
    # candidates: every rest pose and the sequence's first and last frames; two match where their closest frames differ under 0.4 %
    idx = {n: i for i, (n, _) in enumerate(fr)}
    cands = sorted(set(rests) | {(n, n) for n in (fr[0][0], fr[-1][0]) if not inrest(n)})
    stack = [np.stack([small[idx[n]] for n in range(a, b + 1, max(1, (b - a) // 12 or 1)) if n in idx]) for a, b in cands]
    best, group = {}, {c: {c} for c in cands}
    for x in range(len(cands)):
        for y in range(x + 1, len(cands)):
            A, B = stack[x], stack[y]
            if A.shape[1:] != B.shape[1:]: continue
            d = np.abs(A[:, None] - B[None, :]).mean(axis=(2, 3, 4)); k = np.unravel_index(int(np.argmin(d)), d.shape)
            if float(d[k]) < 0.004:
                g = group[cands[x]] | group[cands[y]]
                for c in g: group[c] = g
    lab = lambda c: f"{c[0]}-{c[1]}" if c[0] != c[1] else str(c[0])
    portals = [[lab(c) for c in g] for g in sorted({tuple(sorted(g)) for g in group.values() if len(g) > 1})]
    try: font = ImageFont.truetype("arial.ttf", 14)
    except OSError: font = ImageFont.load_default()
    from common import brief_dir, renders
    out = renders(p, "stills") / "poses"; out.mkdir(parents=True, exist_ok=True)
    pick = [n for n, _ in fr][::max(1, every)]
    for a, b in rests: pick.append((a + b) // 2)
    pick = sorted(set(pick)); th = max(t.height for t in thumbs.values()); cols = 10; rows = -(-len(pick) // cols)
    sheet = Image.new("RGB", (cols * 170 + 10, rows * (th + 30) + 10), (235, 235, 235)); dr = ImageDraw.Draw(sheet)
    for k, n in enumerate(pick):
        x, y = 10 + (k % cols) * 170, 10 + (k // cols) * (th + 30)
        bg = Image.new("RGB", thumbs[n].size, (200, 200, 205)); bg.paste(thumbs[n], (0, 0), thumbs[n]); sheet.paste(bg, (x, y + 20))
        if inrest(n): dr.rectangle([x - 3, y + 17, x + 162, y + 22 + thumbs[n].height], outline=(40, 170, 80), width=3)
        dr.text((x, y + 2), str(n), fill=(20, 20, 20), font=font)
    sheet.save(out / "sheet.png")
    if rests:
        big = {}
        for a, b in rests:
            f = dict(fr)[(a + b) // 2]
            with Image.open(f) as im: im = im.convert("RGBA"); big[(a, b)] = im.resize((280, round(im.height * 280 / im.width)))
        bh = max(x.height for x in big.values()); cols = min(6, len(big)); rows = -(-len(big) // cols)
        rs = Image.new("RGB", (cols * 290 + 10, rows * (bh + 30) + 10), (235, 235, 235)); dr = ImageDraw.Draw(rs)
        for k, ((a, b), im) in enumerate(big.items()):
            x, y = 10 + (k % cols) * 290, 10 + (k // cols) * (bh + 30)
            bg = Image.new("RGB", im.size, (200, 200, 205)); bg.paste(im, (0, 0), im); rs.paste(bg, (x, y + 22))
            dr.text((x, y + 2), f"{a}-{b}" if a != b else str(a), fill=(20, 20, 20), font=font)
        rs.save(out / "rests.png")
    bx = boxes(p, [f for _, f in fr]); byn = {n: bx[f] for n, f in fr}
    wid = {n: b[2] - b[0] for n, b in byn.items() if b[2] > b[0]}
    pct = lambda b: f"{b[0] * 100:.0f}-{b[2] * 100:.0f} · {b[1] * 100:.0f}-{b[3] * 100:.0f}"
    md = [f"# Tư thế nghỉ của chuỗi render ({fr[0][1].parent.name}/{fr[0][1].name} ..)", "",
          f"`kit.py poses` tìm {len(rests)} tư thế: đoạn đứng yên (khung gần như không đổi, từ 4 khung liền) và điểm chậm (một khung, nơi máy xoay "
          f"chậm lại rồi đổi chiều). Xem `{out / 'rests.png'}` và "
          "`sheet.png`, rồi điền từng dòng. **Hướng** = camera / đỉnh máy ở trên hay ở dưới: tư thế lộn ngược chỉ được lướt qua, không giữ.", "",
          "| Khung | Khung bao (x · y, % ảnh) | Mở / đóng | Mặt (trước / lưng / cạnh) | Hướng (camera trên / dưới) | Giữ được? | Ghi chú |",
          "|---|---|---|---|---|---|---|"]
    md += [f"| {a}-{b} | {pct(byn[(a + b) // 2])} |  |  |  |  |  |" if a != b else f"| {a} | {pct(byn[a])} |  |  |  |  | điểm chậm (xoay đổi chiều) |"
           for a, b in rests]
    md += ["", "Khung chuyển động (giữa các tư thế nghỉ): chỉ phát đều 1-3 khung render / khung phim, không giữ, không trộn hai khung."]
    if wid:
        wmax, wmin = max(wid, key=wid.get), min(wid, key=wid.get)
        md += ["", f"**Khung bao** (phần có hình, theo kênh alpha; mọi khung ở `qa/seq-boxes.json`): rộng nhất khung {wmax} ({pct(byn[wmax])}, "
                   f"rộng {wid[wmax] * 100:.0f} % ảnh), hẹp nhất khung {wmin} ({pct(byn[wmin])}, {wid[wmin] * 100:.0f} %). Trên khung hình: hộp của "
                   "element (object-fit: contain) nhân với các tỉ lệ này. Chữ đứng cạnh máy khi máy xoay: đặt theo khung rộng nhất của đoạn đó, hoặc "
                   "cho chữ đi theo máy (lint báo khi máy đổi khung bao mà chữ sát bên đứng yên)."]
    if portals: md += ["", "**Cổng** (các tư thế nghỉ cho ra cùng một hình: nhảy từ khung này sang khung kia không ai thấy, nối một chiếc máy liền mạch qua "
                       "mọi tư thế): " + "; ".join(" = ".join(str(m) for m in g) for g in portals)]
    f = brief_dir(p) / "POSES.md"; f.parent.mkdir(parents=True, exist_ok=True)
    try: f.write_text("\n".join(md) + "\n", encoding="utf-8")
    except PermissionError: f = f.with_name("POSES.new.md"); f.write_text("\n".join(md) + "\n", encoding="utf-8")
    say(f"  rest poses: {', '.join(f'{a}-{b}' for a, b in rests) or 'none'}")
    if portals: say("  portals (the same picture: a jump between them is invisible): " + "; ".join(" = ".join(str(m) for m in g) for g in portals))
    if wid: say(f"  product box: widest frame {wmax} ({wid[wmax] * 100:.0f} % of the picture), narrowest {wmin} ({wid[wmin] * 100:.0f} %): qa/seq-boxes.json")
    say(f"  -> {out / 'sheet.png'}, {out / 'rests.png'}, {f}")
    return rests
