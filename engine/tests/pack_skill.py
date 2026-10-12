"""Pack the skill: engine/skill/moworks-motion/ (the source, edited there) -> skill/moworks-motion.zip (files under moworks-motion/), the
one skill file the kit hands out: uploaded to claude.ai, and what install.bat / update.bat put into Claude Code (user 10/10/2026: the
skill folder holds the zip only). The skill's version line must match the kit's engine/VERSION (update.bat and the skill's first step
compare them). Run it after every skill change, then commit both.

python engine/tests/pack_skill.py           pack
python engine/tests/pack_skill.py --check   only check that the zip holds the source as it is now (GitHub runs it on every pull request)"""
import re, sys, zipfile
from pathlib import Path

KIT = Path(__file__).resolve().parents[2]
SRC = KIT / "engine" / "skill" / "moworks-motion"
OUT = KIT / "skill" / "moworks-motion.zip"


def main():
    ver = (KIT / "engine" / "VERSION").read_text(encoding="utf-8").strip()
    m = re.search(r"Skill version \*\*([^*]+)\*\*", (SRC / "SKILL.md").read_text(encoding="utf-8"))
    if not m or m.group(1) != ver:
        print(f"SKILL.md says {m.group(1) if m else 'no version'}, VERSION says {ver}: make them the same first"); return 1
    files = sorted(f for f in SRC.rglob("*") if f.is_file() and f.name != "desktop.ini")
    if "--check" in sys.argv: return check(files, ver)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for f in files: z.write(f, "moworks-motion/" + f.relative_to(SRC).as_posix())
    print(f"{len(files)} files, skill {ver} -> {OUT} ({OUT.stat().st_size / 1e3:.0f} KB)")
    return 0


def check(files, ver):
    """the zip holds exactly the source's files with the same content (line ends aside: git on Windows checks text out with CRLF)"""
    norm = lambda b: b.replace(b"\r\n", b"\n")
    src = {"moworks-motion/" + f.relative_to(SRC).as_posix(): norm(f.read_bytes()) for f in files}
    with zipfile.ZipFile(OUT) as z: got = {n: norm(z.read(n)) for n in z.namelist() if not n.endswith("/")}
    diff = sorted(set(src) ^ set(got)) + sorted(n for n in src.keys() & got.keys() if src[n] != got[n])
    print(f"skill {ver}: the zip matches its source ({len(src)} files)" if not diff else
          "the zip differs from engine/skill/moworks-motion (run engine/tests/pack_skill.py): " + ", ".join(diff[:20]))
    return 1 if diff else 0


if __name__ == "__main__":
    sys.exit(main())
