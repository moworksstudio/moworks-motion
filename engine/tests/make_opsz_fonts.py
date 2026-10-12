"""Roboto Flex for After Effects, one file per optical size (KI-02, 10/10/2026). A browser draws Roboto Flex at the optical size of its font
size (opsz = the px size: 120 px text has thinner, tighter glyphs than 14 px text); AE uses the named weights only, all at opsz 14, so its
large text came out heavier. This pins opsz (and the parametric axes at their defaults) in a copy of engine/vendor/fonts/RobotoFlex-var.ttf
for each size in SIZES, keeps the weight and slant axes with their named instances, and renames the family "Roboto Flex Opsz<N>"
(PostScript names RobotoFlexOpsz<N>-<Weight>). install.bat installs them for AE; port.py picks the nearest size for each text layer.

python engine/tests/make_opsz_fonts.py      -> engine/vendor/fonts/opsz/RobotoFlex-opsz<N>.ttf (SIL OFL 1.1, as the source font)"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONTS = Path(__file__).resolve().parents[1] / "vendor" / "fonts"
SIZES = [9, 11, 18, 24, 32, 48, 72, 100, 144]          # 14 is the source font itself (its named instances sit at opsz 14)
KEEP = {"wght", "slnt"}


def make(n):
    f = TTFont(FONTS / "RobotoFlex-var.ttf")
    axes = {a.axisTag: a.defaultValue for a in f["fvar"].axes}
    pin = {t: (float(n) if t == "opsz" else v) for t, v in axes.items() if t not in KEEP}
    for inst in f["fvar"].instances:                    # the named weights move to this optical size (or the instancer drops them)
        for t, v in pin.items(): inst.coordinates[t] = v
    f = instancer.instantiateVariableFont(f, pin, updateFontNames=False)
    fam, ps = f"Roboto Flex Opsz{n}", f"RobotoFlexOpsz{n}"
    name = f["name"]
    for rec in list(name.names):
        s = rec.toUnicode()
        if rec.nameID in (1, 16): rec.string = fam
        elif rec.nameID == 4: rec.string = s.replace("Roboto Flex", fam)
        elif rec.nameID == 6: rec.string = s.replace("RobotoFlex", ps)
        elif rec.nameID == 25: rec.string = ps
        elif rec.nameID == 3: rec.string = s.replace("RobotoFlex", ps)
    if not name.getName(25, 3, 1, 0x409): name.setName(ps, 25, 3, 1, 0x409)
    out = FONTS / "opsz" / f"RobotoFlex-opsz{n}.ttf"; out.parent.mkdir(exist_ok=True)
    f.save(out)
    return out


def main():
    for n in SIZES:
        o = make(n); print(f"{o.name}: {o.stat().st_size / 1e3:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
