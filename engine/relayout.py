"""reframe's first pass for a frame taller than the source (16:9 -> 9:16, 4:5, 1:1): "auto stack" (user, 08/10/2026: an approved film in
another aspect keeps every element and all its content, only the layout changes "cho hợp lý").

How: the source film is measured in the browser at a settled moment of every scene (the part no transition overlaps); elements whose boxes
overlap become one unit (a card with its icon and its text); a full-frame element is a background (it covers the new frame); units are
read in order (rows top to bottom, left to right in a row) and stacked top to bottom, centred, each scaled to fit the width (never above
the short-side ratio, so type keeps its size relative to the frame's short side), all of them smaller together when the stack is taller
than the frame. A centred group ("center": true) is one unit: a row becomes a column, sized from its children. Layers keep the plain
scaling of reframe.py. It is a START: Claude still looks at every scene (kit.py stills) and re-composes what reads badly; positions and
sizes only, never content (kit.py reframe <new> check)."""
import asyncio, re
from pathlib import Path

PX = re.compile(r"^(-?\d+(?:\.\d+)?)px$")
JS = r"""([sel, ids]) => { const S = document.querySelector(sel).getBoundingClientRect(), o = {};
  const box = r => [r.left - S.left, r.top - S.top, r.width, r.height];
  for (const id of ids) { const e = document.getElementById(id); if (!e) continue;
    const r = e.getBoundingClientRect(), kids = [...e.children].map(c => box(c.getBoundingClientRect())).filter(q => q[2] > 0 && q[3] > 0);
    o[id] = { r: box(r), kids }; }
  return o; }"""


def settled_times(html):
    from reframe import scene_times
    st = scene_times(html); out = {}
    for k, (sid, a, d) in enumerate(st):
        a0 = a + (max(0.0, st[k - 1][1] + st[k - 1][2] - a) if k else 0.0)
        a1 = a + d - (max(0.0, a + d - st[k + 1][1]) if k + 1 < len(st) else 0.0)
        out[sid] = a0 + 0.9 * (a1 - a0) if a1 - a0 > 0.1 else a + 0.9 * d
    return out


def measure(p, spec):
    """{scene id: {element id: {"r": [x, y, w, h], "kids": [[x, y, w, h], ...]}}} of the built source film"""
    from render.browser import open_film
    from render.serve import serve_in_thread
    p = Path(p); times = settled_times((p / "index.html").read_text(encoding="utf-8"))
    ids = {s["id"]: [e["id"] for e in s.get("elements") or []] for s in spec["scenes"]}

    async def run(url):
        from playwright.async_api import async_playwright
        out = {}
        async with async_playwright() as pw:
            b, pg, info = await open_film(pw, url)
            for sid, t in times.items():
                await pg.evaluate(f"window.__aimk.seek({t})")
                out[sid] = await pg.evaluate(JS, [info["stage"], ids.get(sid, [])])
            await b.close()
        return out
    base, srv = serve_in_thread(p)
    try: return asyncio.run(run(base.rstrip("/") + "/index.html"))
    finally: srv.shutdown()


def _px(v):
    m = PX.match(str(v).strip()) if v is not None else None
    return float(m.group(1)) if m else None


def _units(els, R):
    """union-find on overlapping boxes -> [[element, ...], ...]"""
    par = list(range(len(els)))
    find = lambda i: i if par[i] == i else find(par[i])
    def hit(a, b): return a[0] < b[0] + b[2] - 1 and b[0] < a[0] + a[2] - 1 and a[1] < b[1] + b[3] - 1 and b[1] < a[1] + a[3] - 1
    for i in range(len(els)):
        for j in range(i + 1, len(els)):
            if hit(R[els[i]["id"]], R[els[j]["id"]]): par[find(i)] = find(j)
    g = {}
    for i, e in enumerate(els): g.setdefault(find(i), []).append(e)
    return list(g.values())


def stack(spec, rects, W, H, W2, H2, scale_els, scale_value, say=print):
    """the source spec re-laid out for W2 x H2 (in place); returns the number of scenes stacked"""
    from reframe import SIZE
    m, top = 0.07 * W2, 0.08 * H2; Aw, Ah = W2 - 2 * m, H2 - 2 * top; gap = 0.035 * H2
    kmax = min(W2, H2) / min(W, H); done = 0
    for s in spec["scenes"]:
        M = rects.get(s["id"]) or {}
        els = [e for e in s.get("elements") or [] if e["id"] in M and M[e["id"]]["r"][2] > 0 and M[e["id"]]["r"][3] > 0]
        rest = [e for e in s.get("elements") or [] if e not in els]     # no box at the settled moment (display: none, empty): plain scaling
        R = {}
        for e in els:
            r, kids = M[e["id"]]["r"], M[e["id"]]["kids"]
            if e.get("type") == "group" and kids:              # its content, laid out as it will be (a column in a taller frame)
                g = _px(e.get("gap")) or 0.0
                cw, ch = max(k[2] for k in kids), sum(k[3] for k in kids) + g * (len(kids) - 1)
                if e.get("layout", "row") == "row": e["layout"] = "column"
                R[e["id"]] = [0.0, r[1] + (r[3] - ch) / 2 if e.get("center") else r[1], cw, ch]
                R[e["id"]][0] = (W - cw) / 2 if e.get("center") else r[0]
            else: R[e["id"]] = list(r)
        bg = [e for e in els if e.get("type") != "group" and R[e["id"]][2] >= 0.9 * W and R[e["id"]][3] >= 0.9 * H]
        units = _units([e for e in els if e not in bg], R)
        if not units: continue
        box = lambda u: [min(R[e["id"]][0] for e in u), min(R[e["id"]][1] for e in u),
                         max(R[e["id"]][0] + R[e["id"]][2] for e in u), max(R[e["id"]][1] + R[e["id"]][3] for e in u)]
        B = [box(u) for u in units]
        rows = []                                          # reading order: a unit whose middle lies in a row's band joins it (a number
        for i in sorted(range(len(units)), key=lambda i: B[i][1]):   # beside a taller picture is the same row), rows top to bottom,
            cy = (B[i][1] + B[i][3]) / 2                   # left to right inside a row
            if rows and rows[-1][1] <= cy <= rows[-1][2]: rows[-1][0].append(i); rows[-1][2] = max(rows[-1][2], B[i][3])
            else: rows.append([[i], B[i][1], B[i][3]])
        order = [i for r in rows for i in sorted(r[0], key=lambda i: B[i][0])]
        if W2 / H2 >= 0.79:                                # 1:1, 4:5: a row stays a row (three cards side by side); rows stack
            units = [[e for i in sorted(r[0], key=lambda i: B[i][0]) for e in units[i]] for r in rows]
            B = [box(u) for u in units]; order = list(range(len(units)))
        K = [min(kmax, Aw / max(1.0, B[i][2] - B[i][0])) for i in order]
        tot = sum(k * (B[i][3] - B[i][1]) for k, i in zip(K, order)) + gap * (len(order) - 1)
        if tot > Ah: K = [k * (Ah - gap * (len(order) - 1)) / (tot - gap * (len(order) - 1)) for k in K]; tot = Ah
        y = (H2 - tot) / 2
        for k, i in zip(K, order):
            x0, y0, x1, y1 = B[i]; ux = (W2 - k * (x1 - x0)) / 2
            for e in units[i]:
                r = R[e["id"]]; st = e.setdefault("style", {})
                tx, ty = ux + (r[0] - x0) * k, y + (r[1] - y0) * k
                if e.get("type") == "group":
                    e["center"] = False; e["gap"] = scale_value(e.get("gap", "0px"), k)
                    st.update({"left": f"{tx:.0f}px", "top": f"{ty:.0f}px", "width": f"{r[2] * k:.0f}px", "height": f"{r[3] * k:.0f}px"})
                    scale_els(e.get("children"), k, k, k); continue
                L, T = _px(st.get("left")), _px(st.get("top"))
                for key in list(st):
                    if key.replace("_", "-") in SIZE: st[key] = scale_value(st[key], k)
                if "-50%" in str(st.get("transform", "")):    # positioned by its centre
                    st["left"], st["top"] = f"{tx + r[2] * k / 2:.0f}px", f"{ty + r[3] * k / 2:.0f}px"
                elif L is not None and T is not None:          # by its top-left corner (its box may sit off it by a margin)
                    st["left"], st["top"] = f"{tx - (r[0] - L) * k:.0f}px", f"{ty - (r[1] - T) * k:.0f}px"
                else: st["left"], st["top"] = f"{tx:.0f}px", f"{ty:.0f}px"
                scale_els(e.get("children"), k, k, k)
            y += k * (y1 - y0) + gap
        for e in bg:
            e.setdefault("style", {}).update({"left": "0px", "top": "0px", "width": f"{W2}px", "height": f"{H2}px"})
        scale_els(rest, W2 / W, H2 / H, min(W2 / W, H2 / H))
        done += 1; s["_stacked"] = True
        say(f"  {s['id']}: {len(units)} unit(s) stacked" + (f", {len(bg)} background(s) cover the frame" if bg else "")
            + (f", {len(rest)} not drawn at that moment scaled plainly" if rest else ""))
    return done
