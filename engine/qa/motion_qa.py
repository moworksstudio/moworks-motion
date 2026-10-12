"""Motion QA on a rendered PNG sequence (plan G5). Run (kit.py qa) on the frames the last MP4 / MOV export left in
%USERPROFILE%\\.aimotionkit\\work.

pops      a frame whose change from both neighbours is > 3x their own change and > 2.0 levels (Howseen render_template.py:120-131)
flash     a one-frame flash: frame n differs from n-1 and n+1 while n-1 ~ n+1 (Howseen render_template.py:132-140)
frozen    longest run of identical frames and the total still time (MotionKit frozen-time.sh idea: no hold > 0.6 s except CTA/end card;
          Moworks holds are longer by rule, so this is reported, not failed)
flashes   photosensitivity: luminance flashes (a rise then a fall, each > 10 % of full white over > 25 % of the frame) per second;
          more than 3 in any 1 s window fails (iart freelance-motion brand-motion-guidelines/SKILL.md:125, WCAG 2.3.1)
Frames are compared as 192x108 greyscale (fast, ignores single-pixel noise). Exit code 1 on pops, flash frames or > 3 flashes/s."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image


def load_small(p):
    return np.asarray(Image.open(p).convert("L").resize((192, 108), Image.BILINEAR), dtype=np.float32)


def analyse(frames_dir, fps=60, cuts=()):
    files = sorted(Path(frames_dir).glob("s_*.png"))
    if len(files) < 3: raise SystemExit(f"no PNG sequence in {frames_dir}")
    F = [load_small(f) for f in files]
    d = np.array([float(np.abs(F[i + 1] - F[i]).mean()) for i in range(len(F) - 1)])        # d[i] = change i -> i+1
    cutf = {int(round(c * fps)) for c in cuts}
    pops, flash = [], []
    for n in range(1, len(F) - 1):
        a, b = d[n - 1], d[n]                                                                   # into n, out of n
        if n in cutf or n + 1 in cutf: continue                                                 # a cut is allowed to jump
        around = [d[n - 2] if n >= 2 else 0.0, d[n + 1] if n + 1 < len(d) else 0.0]
        if a > 2.0 and a > 3 * max(around + [1e-6]) and b < a / 3: pops.append(n)
        if a > 2.0 and b > 2.0 and float(np.abs(F[n - 1] - F[n + 1]).mean()) < 0.35 * min(a, b): flash.append(n)
    still = d < 0.05
    runs, cur = [], 0
    for s in still:
        cur = cur + 1 if s else 0; runs.append(cur)
    longest = max(runs) if runs else 0
    # photosensitivity: big full-frame luminance swings
    L = np.array([f.mean() for f in F]); area = np.array([float((np.abs(F[i + 1] - F[i]) > 25.5).mean()) for i in range(len(F) - 1)])
    ev = [(i, np.sign(L[i + 1] - L[i])) for i in range(len(F) - 1) if abs(L[i + 1] - L[i]) > 25.5 * 0.25 and area[i] > 0.25]
    flashes = [ev[k][0] for k in range(1, len(ev)) if ev[k][1] != ev[k - 1][1] and ev[k][0] - ev[k - 1][0] <= fps // 3]
    worst = max((sum(1 for f in flashes if s <= f < s + fps) for s in range(len(F))), default=0)
    return {"frames": len(F), "fps": fps, "pops": pops, "one_frame_flashes": flash, "still_frames": int(still.sum()),
            "longest_still_s": round(longest / fps, 2), "flashes_per_s_max": worst, "fail": bool(pops or flash or worst > 3)}


def report(r, say):
    say(f"motion QA: {r['frames']} frames @ {r['fps']} fps | pops {len(r['pops'])} {r['pops'][:8]} | one-frame flashes {len(r['one_frame_flashes'])} {r['one_frame_flashes'][:8]}"
        f" | still {r['still_frames'] / r['fps']:.1f} s (longest {r['longest_still_s']} s) | max flashes in 1 s: {r['flashes_per_s_max']} (limit 3)")
    say("  FAIL" if r["fail"] else "  ok")


if __name__ == "__main__":
    r = analyse(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 30)
    report(r, print); print(json.dumps(r)[:300]); sys.exit(1 if r["fail"] else 0)
