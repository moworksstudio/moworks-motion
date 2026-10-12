"""kit.py compare <film> <reference> --follow x,y,w,h: one element of a reference video measured frame by frame, so a remake moves the same (workflow/remake.md; the
origin skill's "measure on the reference frames, drive motion with the samples", howseen-ai/claude-motion-design, MIT).

  kit.py compare <film> <reference video> --follow x,y,w,h [--from a] [--to b] [--color #hex | --bg auto|#hex] [--tol 40] [--name n]

  1 the reference's native frames from --from to --to, cropped to the box (reference px), one ffmpeg pass
  2 the element = the pixels near --color, or the pixels away from the background (--bg auto: the box border's colour on the
    first frame): keep the box tight around one element on a plain background
  3 per frame: its box (x, y, w, h), centre and cover (share of the box it fills: a fade or a wipe changes it), in FILM px
     (the reference scaled to the film's width)
  4 the moves: frames where the centre, the width or the cover change, merged into segments; each with its start / end time,
    from -> to, and the GSAP eases closest to its progress (RMS error; an overshoot is reported)
-> 01_Brief/ref/follow/<name>.csv + .json; the moves printed as lines to copy into the motion spec
"""
import json, math, re, subprocess
from pathlib import Path

import numpy as np

from qa.compare import _ffmpeg, video_info


def _p(k):
    return lambda t: t ** k


def _out(f):
    return lambda t: 1 - f(1 - t)


def _inout(f):
    return lambda t: f(2 * t) / 2 if t < 0.5 else 1 - f(2 * (1 - t)) / 2


def _expo(t):
    return 0.0 if t <= 0 else 2 ** (10 * (t - 1))


def _back_out(t, c1=1.70158):
    c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


EASES = {"none": lambda t: t, "sine.inOut": lambda t: -(math.cos(math.pi * t) - 1) / 2, "sine.out": lambda t: math.sin(t * math.pi / 2),
         "back.out(1.7)": _back_out, "circ.out": lambda t: math.sqrt(max(0.0, 1 - (t - 1) ** 2)), "expo.in": _expo, "expo.out": _out(_expo),
         "expo.inOut": _inout(_expo)}
for _k, _name in ((2, "power1"), (3, "power2"), (4, "power3"), (5, "power4")):
    EASES[f"{_name}.in"] = _p(_k); EASES[f"{_name}.out"] = _out(_p(_k)); EASES[f"{_name}.inOut"] = _inout(_p(_k))


def rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def frames(src, f0, f1, box):
    """native frames f0..f1 cropped to box -> (k, h, w, 3) uint8"""
    x, y, w, h = box
    cmd = [_ffmpeg(), "-v", "error", "-i", str(src), "-vf", f"select='between(n\\,{f0}\\,{f1})',crop={w}:{h}:{x}:{y}", "-vsync", "0",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    k = len(raw) // (w * h * 3)
    return np.frombuffer(raw[:k * w * h * 3], np.uint8).reshape(k, h, w, 3)


def fit(ts, vals, v0, v1, a, b, lo, hi):
    """the eases closest to a move: the move may start anywhere in frames lo..a and end anywhere in b..hi (an ease-in starts too slowly,
    an ease-out ends too slowly, for the eye or the measure to see where); every (ease, start, end) is scored on all frames lo..hi
    against v0 before, the ease between, v1 after. -> [(name, rms in progress units, start index, end index)], overshoot"""
    if abs(v1 - v0) < 1e-6: return [], 0.0
    T = np.array(ts[lo:hi + 1]); P = (np.array(vals[lo:hi + 1], float) - v0) / (v1 - v0)
    ok = ~np.isnan(P); T, P = T[ok], P[ok]
    if len(P) < 3: return [], 0.0
    over = float(max(0.0, P.max() - 1))
    best = {}
    for n, fn in EASES.items():
        f = np.vectorize(fn)
        for s in range(lo, a + 1):
            for e in range(max(b, s + 1), hi + 1):
                u = np.clip((T - ts[s]) / max(1e-9, ts[e] - ts[s]), 0, 1)
                err = float(np.sqrt(np.mean((f(u) - P) ** 2)))
                if n not in best or err < best[n][0]: best[n] = (err, s, e)
    out = sorted((v[0], n, v[1], v[2]) for n, v in best.items())
    return [(n, er, s, e) for er, n, s, e in out[:3]], over


def rests(rows, fps, k):
    """runs of frames where the element stays put (every value within a band of the run's first frame) for at least 0.13 s; an absent
    element is its own state"""
    need = max(3, int(round(0.13 * fps)))
    band = {"cx": max(1.0, 0.6 * k), "cy": max(1.0, 0.6 * k), "w": max(1.0, 0.6 * k), "cover": 0.003}
    runs, r0 = [], 0
    def same(i, j):
        if (rows[i]["cx"] is None) != (rows[j]["cx"] is None): return False
        return rows[i]["cx"] is None or all(abs(rows[i][q] - rows[j][q]) <= band[q] for q in band)
    for i in range(1, len(rows) + 1):
        if i == len(rows) or not same(r0, i):
            if i - r0 >= need: runs.append((r0, i - 1))
            r0 = i
    return runs


def run(p, src, box, t_from=0.0, t_to=None, color=None, bg="auto", tol=40.0, name="", say=print):
    from common import brief_dir
    fps, dur, vw, vh = video_info(src)
    spec = json.loads((p / "film.json").read_text(encoding="utf-8")) if (p / "film.json").exists() else {}
    fw = (spec.get("size") or [1920, 1080])[0]
    k = fw / vw
    x, y, w, h = box
    x, y = max(0, x), max(0, y); w, h = min(w, vw - x), min(h, vh - y)
    if w < 4 or h < 4: raise SystemExit("the box is outside the reference (x,y,w,h in the reference's own pixels)")
    f0 = max(0, int(round((t_from or 0) * fps)))
    f1 = int(round((t_to if t_to is not None else dur) * fps)) - 1
    if f1 <= f0: raise SystemExit("nothing to follow (check --from / --to)")
    say(f"follow: {Path(src).name} {vw}x{vh} {fps:g} fps, box {x},{y},{w},{h}, frames f{f0}-f{f1} ({(f1 - f0 + 1) / fps:.2f} s); film {fw} px wide (x{k:.3f})")
    fr = frames(src, f0, f1, (x, y, w, h)).astype(np.float32)
    if not len(fr): raise SystemExit("ffmpeg returned no frames (check the box and the times)")
    if color: target, mode = rgb(color), "color"
    elif bg and bg not in ("auto", "none"): target, mode = rgb(bg), "bg"
    else:
        a = fr[0]; edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
        target, mode = np.median(edge, axis=0), "bg"
    rows = []
    for i, a in enumerate(fr):
        dist = np.sqrt(((a - target) ** 2).sum(axis=2))
        m = dist < tol if mode == "color" else dist > tol
        f = f0 + i; t = f / fps
        if m.sum() < 12:
            rows.append({"f": f, "t": round(t, 4), "x": None, "y": None, "w": 0, "h": 0, "cx": None, "cy": None, "cover": 0.0}); continue
        ys = np.where(m.sum(axis=1) >= 2)[0]; xs = np.where(m.sum(axis=0) >= 2)[0]
        if not len(ys) or not len(xs): ys, xs = np.where(m.any(axis=1))[0], np.where(m.any(axis=0))[0]
        bx0, bx1, by0, by1 = xs[0], xs[-1] + 1, ys[0], ys[-1] + 1
        yy, xx = np.nonzero(m)
        rows.append({"f": f, "t": round(t, 4), "x": round((x + bx0) * k, 1), "y": round((y + by0) * k, 1), "w": round((bx1 - bx0) * k, 1),
                     "h": round((by1 - by0) * k, 1), "cx": round((x + xx.mean()) * k, 1), "cy": round((y + yy.mean()) * k, 1),
                     "cover": round(float(m.mean()), 4)})
    # the moves: what happens between two rests (an ease-out's slow tail or a back.out's return stays inside its move)
    Q = ("cx", "cy", "w", "cover")
    band = {"cx": max(1.0, 0.6 * k), "cy": max(1.0, 0.6 * k), "w": max(1.0, 0.6 * k), "cover": 0.003}
    def med(span):
        if rows[span[0]]["cx"] is None: return None
        return {q: float(np.median([rows[i][q] for i in range(span[0], span[1] + 1)])) for q in Q}
    def change(m0, m1):                                       # the property that changes most (px; scale and cover weighted to compare)
        ch = {"cx": m1["cx"] - m0["cx"], "cy": m1["cy"] - m0["cy"], "w": (m1["w"] / m0["w"] - 1) * 400 if m0["w"] else 0,
              "cover": (m1["cover"] - m0["cover"]) * 1000}
        q = max(ch, key=lambda x_: abs(ch[x_])); return q, m1[q] - m0[q]
    rs = []
    for r in rests(rows, fps, k):                             # a step too small to be a move (the last pixel of an ease-out) joins the rests
        if rs:
            m0, m1 = med(rs[-1]), med(r)
            if (m0 is None) == (m1 is None) and (m0 is None or all(abs(m1[q] - m0[q]) <= 2.5 * band[q] for q in Q)):
                rs[-1] = (rs[-1][0], r[1]); continue
        rs.append(r)
    if not rs: rs = [(0, 0)]
    spans = ([(None, rs[0])] if rs[0][0] > 0 else []) + list(zip(rs, rs[1:])) + ([(rs[-1], None)] if rs[-1][1] < len(rows) - 1 else [])
    i = 0
    while i < len(spans) - 1:                                 # a short rest at a turn, then a smaller step back: an overshoot, one move
        (ra, rb), (_, rc) = spans[i], spans[i + 1]
        A, B, C = (med(x_) if x_ else None for x_ in (ra, rb, rc))
        if A and B and C and (rb[1] - rb[0] + 1) / fps < 0.3:
            q, c1 = change(A, B); c2 = C[q] - B[q]
            if c1 * c2 < 0 and abs(c2) < 0.5 * abs(c1): spans[i:i + 2] = [(ra, rc)]; continue
        i += 1
    ts = [r["t"] for r in rows]
    moves = []
    for ra, rb in spans:
        a = ra[1] if ra else 0; b = rb[0] if rb else len(rows) - 1
        lo = ra[0] if ra else 0; hi = rb[1] if rb else len(rows) - 1
        r0, r1 = rows[a], rows[b]
        if r0["cx"] is None or r1["cx"] is None:
            if (r0["cx"] is None) == (r1["cx"] is None): continue
            at = next((r["t"] for r in rows[a:b + 1] if r["cx"] is not None), r1["t"]) if r0["cx"] is None else \
                next((r["t"] for r in reversed(rows[a:b + 1]) if r["cx"] is not None), r0["t"])
            moves.append({"kind": "appears" if r0["cx"] is None else "goes", "at": at, "from_t": r0["t"], "to_t": r1["t"]}); continue
        m0 = med(ra) if ra else {q: r0[q] for q in Q}; m1 = med(rb) if rb else {q: r1[q] for q in Q}
        v = {q: (m0[q], m1[q]) for q in Q}
        key, _ = change(m0, m1)
        ext = max(2, int(round(0.4 * (b - a))))
        vals = [np.nan if r[key] is None else r[key] for r in rows]
        eases, over = fit(ts, vals, v[key][0], v[key][1], a, b, max(lo, a - ext), min(hi, b + ext))
        s, e = (eases[0][2], eases[0][3]) if eases else (a, b)
        moves.append({"kind": "move", "main": {"cx": "x", "cy": "y", "w": "scale", "cover": "cover"}[key], "from_t": ts[s], "to_t": ts[e],
                      "d": round(ts[e] - ts[s], 4), "cx": [round(x_, 1) for x_ in v["cx"]], "cy": [round(x_, 1) for x_ in v["cy"]],
                      "w": [round(x_, 1) for x_ in v["w"]], "scale": round(v["w"][1] / v["w"][0], 3) if v["w"][0] else None,
                      "cover": [round(x_, 4) for x_ in v["cover"]], "eases": [[n_, round(er, 3)] for n_, er, _, _ in eases], "overshoot": round(over, 3)})
    out = brief_dir(p) / "ref" / "follow"; out.mkdir(parents=True, exist_ok=True)
    nm = re.sub(r"[^\w.-]+", "_", name or f"{Path(src).stem}_{x}-{y}_{f0}")
    (out / f"{nm}.json").write_text(json.dumps({"src": str(src), "fps": fps, "box": [x, y, w, h], "film_scale": k, "mode": mode,
                                                "target": [round(float(c)) for c in target], "tol": tol, "frames": rows, "moves": moves}, indent=0), encoding="utf-8")
    with open(out / f"{nm}.csv", "w", encoding="utf-8", newline="") as fh:
        fh.write("frame,time,x,y,w,h,cx,cy,cover\n")
        for r in rows: fh.write(",".join("" if r[c] is None else str(r[c]) for c in ("f", "t", "x", "y", "w", "h", "cx", "cy", "cover")) + "\n")
    seen = sum(1 for r in rows if r["cx"] is not None)
    say(f"{len(rows)} frames, the element seen in {seen}; {len(moves)} move(s) (film px, times in the reference = film times + the offset you use):")
    for m in moves:
        if m["kind"] != "move":
            say(f"  {m['at']:.3f} s  {m['kind']}"); continue
        e = ", ".join(f"{n_} ({er:.3f})" for n_, er in m["eases"])
        sc = f", scale {m['scale']:g}" if m["scale"] and abs(m["scale"] - 1) > 0.01 else ""
        cv = f", cover {m['cover'][0]:.3f} -> {m['cover'][1]:.3f}" if abs(m["cover"][1] - m["cover"][0]) > 0.01 else ""
        ov = f"; overshoots {m['overshoot']:.0%} (back.out or a spring)" if m["overshoot"] > 0.02 else ""
        say(f"  {m['from_t']:.3f} -> {m['to_t']:.3f} s ({m['d']:.3f} s): centre {m['cx'][0]:.0f},{m['cy'][0]:.0f} -> {m['cx'][1]:.0f},{m['cy'][1]:.0f}"
            f"{sc}{cv}; ease ~ {e}{ov}")
    say(f"-> {out / (nm + '.json')} (+ .csv, one row per frame)")
    if seen < len(rows) * 0.5: say("  the element was found in under half the frames: tighten the box, or give --color / --bg / --tol")
    return out
