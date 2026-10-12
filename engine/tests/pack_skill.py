"""Pack the skill: engine/skill/moworks-motion/ (the source, edited there) -> skill/moworks-motion.zip (files under moworks-motion/), the
one skill file the kit hands out: uploaded to claude.ai, and what install.bat / update.bat put into Claude Code (user 10/10/2026: the
skill folder holds the zip only). The skill's version line must match the kit's engine/VERSION (update.bat and the skill's first step
compare them). Run it after every skill change, then commit both.

python engine/tests/pack_skill.py"""
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
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for f in files: z.write(f, "moworks-motion/" + f.relative_to(SRC).as_posix())
    print(f"{len(files)} files, skill {ver} -> {OUT} ({OUT.stat().st_size / 1e3:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
