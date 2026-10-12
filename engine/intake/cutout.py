"""kit.py cutout: background removal on this machine (rembg + the models in <kit>/engine/models/rembg; nothing is uploaded, nothing is downloaded).

  python kit.py cutout <project> <image> [<image> ...] [--people] [--trim]
    objects (default): isnet-general-use        people (--people): u2net_human_seg
    -> <project>/assets/images/cutout/<name>.png (RGBA, same size and place as the source unless --trim) + <name>.mask.png (the matte)
       --trim crops to the cut-out plus 8 px; cutout.json keeps each crop box, so a trimmed piece can be put back where it was.
A relative <image> is looked for in the project first. Models: v1 downloaded them with the user's permission (03/10/2026); they live in
<kit>/engine/models/rembg/models/<model>/<model>.onnx. rembg finds them through U2NET_HOME, so it never fetches anything when they are there.

A video (11/10/2026, HyperFrames' embedded captions, "the matte = the person": u2net_human_seg as there): every frame at --fps (default
30) -> <project>/assets/video/cutout/<name>/f0001.webp ... (RGBA: the person alone), played over the footage with motion/image-sequence
(dir "assets/video/cutout/<name>/f", ext ".webp", keys [[0, 0.5], [last / fps, last + 0.5]]: the frame a video shows at that time) so
words placed between the footage and it sit BEHIND the person. With --captions (engine/intake/captions.py) the clip goes on to
HyperFrames' embedded captions: the same frames feed its caption project. CPU only, about 2 frames a second at 1080p (a 10 s clip at 30 fps: about 2-3 min): say so before a long clip. Split a clip with
several shots first; a busy handheld shot makes the matte flicker."""
import json, os, shutil, subprocess
from pathlib import Path

VIDEO = (".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi")

ENGINE = Path(__file__).resolve().parent.parent
MODELS = ENGINE / "models" / "rembg"
KINDS = {"objects": "isnet-general-use", "people": "u2net_human_seg"}


def model_file(kind):
    m = KINDS[kind]; return MODELS / "models" / m / f"{m}.onnx"


def video_matte(p, src, sess, fps, say, hf=None):
    """a clip -> assets/video/cutout/<name>/f%04d.webp, the person alone (RGBA) at fps frames a second; hf: a HyperFrames caption project
    (engine/intake/captions.py) that also gets HF's frames_bg/f_%04d.png (the frame) and frames_fg/f_%04d.png (the person), matte.cjs's layout"""
    from rembg import remove
    from PIL import Image
    from audio.loudness import ffmpeg
    from common import work_dir
    tmp = work_dir("cutout", src.stem); shutil.rmtree(tmp, ignore_errors=True); tmp.mkdir(parents=True)
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(src), "-vf", f"fps={fps}", str(tmp / "f%04d.png")], check=True)
    frames = sorted(tmp.glob("f*.png"))
    out, base = p / "assets" / "video" / "cutout" / src.stem, p / "assets" / "video" / "frames" / src.stem
    dirs = (out, base) + ((Path(hf) / "frames_fg", Path(hf) / "frames_bg") if hf else ())
    for d in dirs:
        if d.exists(): shutil.rmtree(d)
        d.mkdir(parents=True)
    say(f"  {src.name}: {len(frames)} frames at {fps} fps, the person cut out of each (CPU, about 2 a second at 1080p)...")
    for i, f in enumerate(frames, 1):
        im = Image.open(f).convert("RGBA")
        im.convert("RGB").save(base / f.with_suffix(".jpg").name, "JPEG", quality=92)       # the footage itself, the layer under the words
        a = remove(im, session=sess, only_mask=True); im.putalpha(a)
        im.save(out / f.with_suffix(".webp").name, "WEBP", quality=90, method=4)
        if hf:
            im.save(Path(hf) / "frames_fg" / f"f_{i:04d}.png", compress_level=1)
            shutil.move(str(f), str(Path(hf) / "frames_bg" / f"f_{i:04d}.png"))
        if i % 50 == 0: say(f"    {i}/{len(frames)}")
    shutil.rmtree(tmp, ignore_errors=True)
    n, dur = len(frames), len(frames) / fps
    # keys: the frame shown at time t is the one a video shows (frame floor(t * fps) + 1): round(0.5 + t * fps)
    say(f"  -> footage {base.relative_to(p).as_posix()}/f####.jpg (under the words) and the person {out.relative_to(p).as_posix()}/f####.webp "
        f"(over them), {n} frames: two boxes of the same size and place, each with motion/image-sequence (dir \".../f\", ext \".jpg\" / \".webp\", "
        f"last {n}, keys [[0, 0.5], [{dur:.4f}, {n + 0.5}]])")
    return out


def session(kind):
    """a rembg session on this machine's model file (never a download)"""
    f = model_file(kind)
    if not f.exists():
        raise SystemExit(f"model missing: {f}\n(rembg would download it; ask the user first, then: python -c \"import os; os.environ['U2NET_HOME']=r'{MODELS}'; "
                         f"from rembg import new_session; new_session('{KINDS[kind]}')\")")
    os.environ["U2NET_HOME"] = str(MODELS)                # rembg.sessions.base: <U2NET_HOME>/models/<name>/<name>.onnx is used as it is
    try:
        from rembg import new_session
    except ImportError:
        raise SystemExit("rembg is not installed: run install.bat and say yes to the optional packages (or pip install rembg==2.0.85)")
    return new_session(KINDS[kind], providers=["CPUExecutionProvider"])


def cutout(project, images, kind="objects", trim=False, say=print, fps=30):
    sess = session(kind)
    from rembg import remove
    from PIL import Image
    p = Path(project); out = p / "assets" / "images" / "cutout"; out.mkdir(parents=True, exist_ok=True)
    log_f = out / "cutout.json"
    log = json.loads(log_f.read_text(encoding="utf-8")) if log_f.exists() else {}
    done = []
    for raw in images:
        src = Path(raw)
        from common import in_film
        src = in_film(p, src)
        if not src.exists(): raise SystemExit(f"no such image: {raw}")
        if src.suffix.lower() in VIDEO:
            done.append(video_matte(p, src, sess, fps, say)); log[src.stem] = {"source": str(src), "model": KINDS[kind], "video": True, "fps": fps}; continue
        im = Image.open(src).convert("RGBA")
        mask = remove(im, session=sess, only_mask=True)            # L, same size as the source
        rgba = im.copy(); a = Image.composite(mask, Image.new("L", im.size, 0), im.getchannel("A"))   # keep the source's own transparency too
        rgba.putalpha(a)
        box = [0, 0, im.width, im.height]
        if trim:
            bb = a.point(lambda v: 255 if v > 8 else 0).getbbox()
            if bb:
                box = [max(0, bb[0] - 8), max(0, bb[1] - 8), min(im.width, bb[2] + 8), min(im.height, bb[3] + 8)]
                rgba = rgba.crop(box); a = a.crop(box)
        name = src.stem
        rgba.save(out / f"{name}.png"); a.save(out / f"{name}.mask.png")
        cover = sum(a.histogram()[128:]) / max(1, a.width * a.height)
        log[name] = {"source": str(src), "model": KINDS[kind], "size": [im.width, im.height], "box": box}
        say(f"  {src.name} -> assets/images/cutout/{name}.png  ({KINDS[kind]}, {cover * 100:.0f} % of the {'crop' if trim else 'picture'} kept"
            + (f", crop {box}" if trim else "") + ")")
        done.append(out / f"{name}.png")
    log_f.write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding="utf-8")
    say(f"{len(done)} cut-out(s). Check the edges by eye (hair, glass, soft shadows are the hard cases; on a video, a few frames).")
    return done
