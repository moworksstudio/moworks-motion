# Putting an effect or a layout into the library (the Gallery's "Incoming" section)

When: the user asks to keep an effect or layout for later (put this effect into the library, save this preset, add this layout to the
library: in Vietnamese or English), or gives a reference video and asks for it as a library effect. Never on your own initiative (the
library grows only when the user asks). Everything goes first into **Incoming** (`library\incoming\`, out of git): films cannot use it
yet; the user watches it on the Gallery and presses **KEEP** (into the library, every film can use it) or **DROP** (Recycle Bin). This is
the one change to the kit a film chat may make (`SKILL.md` rule 9), and only when the user asks.

**The kit owner's machine only.** The library is the owner's cherry-pick: `kit.py library import | keep | drop` work only where
`%USERPROFILE%\.aimotionkit\maintainer.txt` exists. Elsewhere `kit.py library import` says "only the kit owner changes the library": tell
the user in one line that the library is curated by the kit's owner and the effect stays in this film (`03_HTML\presets\<group>\<name>\`;
the folder can be copied into another film's `presets\` to use it there). Never write into `library\` by hand to get around it.

## The user's guide (send it in Vietnamese when the user asks how, or with the first import; the Gallery's on-screen labels as they are)

**Putting an effect / layout into the library, step by step:**
1. In the film chat, say: "put the effect <scene / name> into the library" (or "the layout <...>"). From a reference video: send the
   video (or its path), say "make this effect a library preset" and which part (seconds).
2. Claude makes a clean copy: no client text, pictures, colours or names; a name by group (e.g. `text/held-note`); a neutral demo; the
   machine checks run (build, seek, compare with the draft). Claude reports the result with a picture.
3. Open `gallery.bat` → the **Incoming** chip → watch the clip.
4. Press **KEEP**: the preset goes into the real library and every later film can use it (a COPY button like the others). Press **DROP**:
   to the Recycle Bin (it can be restored). Until you press one, the preset waits in Incoming (`kit.py library incoming` lists them).

## A. From a job (a film's own preset)
1. List the film's own presets (`<film>\03_HTML\presets\`) in a table: name · what it does · scenes that use it. Ask which, unless the
   user named it. A pattern that lives only in a film script (a Python generator, a film.json code block) becomes a preset first.
2. **Clean copy, under its library name** (`<group>/<name>`, lower case; group = an existing one when it fits: text, motion, background,
   effect, ui, shape, data, transition, intake...; `kit.py library <word>` shows similar ones and that the name is free). Write it into the
   film's `presets\<group>\<name>\` (the film's old copy stays as it is):
   - no client text, pictures, colours, product or brand names, file paths, measurements of the client's material: in comments, defaults,
     demo (`SKILL.md` rule 9; the kit goes to GitHub);
   - general: ids, colours, sizes, times as params with sensible defaults; a pure function of film time; one `AIMK.preset("<group>/<name>")`;
   - files it needs go in its own `assets\` (read with `ctx.asset("file")`), never the film's.
3. `preset.json`: `name`, `kind` (`effect` | `block`), `group`, `title`, `title_vi`, `desc_vi` (what it does, and how it differs from the
   closest library preset, in Vietnamese: the user decides KEEP / DROP with it), `params_vi`, `ae` (keyframes | expression | png), `tags`, `notes`,
   `demo` (neutral: the Gallery's pictures `assets/demo/...` (dishes, people, stickers, UI cards, two 1920x1080 screens), Vietnamese text
   with its marks, `bg`, `duration`, `thumb_at` when 82 % is already the outro). A `box` takes `html`, not `text`.
4. `kit.py library import <film> <group>/<name>` (`--layout` for a layout / UI block; `--as <group>/<name>` to rename on the way). It copies
   the folder into `library\incoming\`, builds the demo and runs the machine checks. Not `ok`: read the check, fix the copy in the film,
   `kit.py library drop <name>`, import again.
5. Look at its picture (`library\gallery\incoming\thumbs\<group>__<name>.png`), then tell the user in a small table (name · title ·
   check · differs from) and send the user's guide above (steps 3-4).

## B. From a reference video
1. Copyright first: recreate the MOTION idea (timing, easing, layering, rhythm), never copy the video's footage, artwork, fonts or logos.
2. Read it: `kit.py ref add <video> --name "<short name>"` (frames at 640 px + a contact sheet + `REF.md` in `library\refs\`); look at the
   frames around the moment the user named. Write what you see in a table: layers · what moves · how far · how long (frames) · easing ·
   what triggers it. Ask the user to confirm it before writing code when it is unclear.
3. Write the preset (A.2 rules), with a demo that shows the same move in neutral material. Compare: stills of the demo
   (`kit.py stills` on a test film) next to the reference frames at the same moments; refine until the move reads the same.
4. Import and report as A.4-A.5; `desc_vi` says, in Vietnamese, that it was rebuilt from the reference video <name> (the reference stays in `library\refs\`, out of git).

## Commands
`kit.py library import <film> <group>/<name> [--as <group>/<name>] [--layout]` · `kit.py library incoming` · `kit.py library keep <name>` ·
`kit.py library drop <name>` (the Gallery's buttons do the same).
