# Intake handover for the desktop session (2026-10-12)

What the cloud session of 2026-10-12 prepared, and the order in which the desktop session builds it. Nothing in the kit has changed yet:
every file below is a report, a spec or a manifest in `docs/intake/`. CLAUDE.md still applies: show the user the tables, wait for the
OK, build, test, and ask before any push.

## The files

| Source | Report | Companions | Import manifest |
|---|---|---|---|
| motion-reference.takayustudio.jp (website) | [report](2026-10-12-motion-reference-takayustudio.md) | [specs](2026-10-12-motion-reference-takayustudio-specs.md) · [catalogue](2026-10-12-motion-reference-takayustudio-catalog.md) · [text rules](2026-10-12-motion-reference-takayustudio-text-rules.md) | [manifest](2026-10-12-motion-reference-takayustudio-manifest.json) |
| codrops/OnScrollTypographyAnimations | [report](2026-10-12-onscrolltypographyanimations.md) | — | [manifest](2026-10-12-codrops-manifest.json) (with ImageExpansionTypography) |
| codrops/ImageExpansionTypography | [report](2026-10-12-imageexpansiontypography.md) | — | same file |
| magicuidesign/magicui | [report](2026-10-12-magicui.md) | [component notes](2026-10-12-magicui-components.md) | [manifest](2026-10-12-magicui-manifest.json) |

## The user's decisions (2026-10-12)

1. **Import everything** into "Mới nhập", **one Gallery item per motion / effect / component**, including the ones the kit already has
   (side by side) and the TakayuStudio lessons (as demo clips). The user keeps or drops each on the Gallery. Priorities are only the
   import order.
2. **Classify the library's way:** group folder by purpose; `source` + `license` in `preset.json` (the Gallery card shows them); three
   new families in the Gallery's "Nguồn" filter (Magic UI, Codrops, TakayuStudio); the site's own category and feel as plain `tags` on the
   TakayuStudio items (the Gallery search finds them). No new filter.
3. **Never copy** the motion reference site's code, react-bits code, typed.js; the TakayuStudio items are written for the kit from the
   specs. Magic UI and Codrops (MIT) are faithful ports with their notices.

## Order of work

0. Read the four reports; show the user each summary table; wait for the OK.
1. **Small kit changes first** (each its own commit, after the user's OK):
   - Gallery "Nguồn" families: in `library/gallery/index.html`, `srcShort`, before the final `"Moworks"`, add three cases written like
     the existing ones: `/^magic ui/i` → `"Magic UI (MIT)"`, `/^codrops/i` → `"Codrops (MIT)"`, `/^takayustudio/i` →
     `"TakayuStudio (ý tưởng)"`.
   - Ease aliases in `engine/vendor/libs/aimk/eases.js` (values from the site's own definitions; register them the way the file
     registers its eases, or as `custom(...)` béziers the builder already writes, so AE keeps exact handles): `md3` (Material 3
     standard) 0.2, 0, 0, 1 · `md3-emph` (emphasized decelerate) 0.05, 0.7, 0.1, 1 · `md3-acc` (standard accelerate) 0.3, 0, 1, 1 ·
     `css-ease` 0.25, 0.1, 0.25, 1 · `whip` 0.9, 0, 0.1, 1 · `glide` 0.4, 0, 0.2, 1 · `house` 0.83, 0, 0.17, 1. GSAP's EasePack
     (`expoScale`, `slowMo`, `rough`) is in `engine/vendor/gsap/` but films do not load it: decide whether presets list it in
     `"scripts"` or the builder loads it.
   - **Defect found on the way:** `ctx.split(el, "chars")` (`engine/runtime/spec-runtime.js`, line 108) spreads the string by code point
     with no NFC, so Vietnamese typed with combining marks (NFD) comes apart in per-letter effects. Normalise to NFC and split by
     grapheme (`Intl.Segmenter`), check `engine/vendor/libs/aimk/anime-sync.js` `split()` too, test with an NFD headline.
   - Two small description fixes, if the user wants: `library/layouts/map/world/preset.json` promises a rotating globe inset that its
     page does not draw; `library/presets/text/land-in/preset.json` notes name `text/snap-out`, which is not in the library.
2. **Batch 1: Magic UI** (79 items, `2026-10-12-magicui-manifest.json`).
3. **Batch 2: Codrops** (29 + 5 items, `2026-10-12-codrops-manifest.json`).
4. **Batches 3.x: TakayuStudio** (782 items, `2026-10-12-motion-reference-takayustudio-manifest.json`, field `batch`), in the order below.

## How to use a manifest entry

Each entry is one preset to write into a scratch film (`kit.py new`), `03_HTML/presets/<group>/<name>/`, then `kit.py library import
<film> <group>/<name>` (`--layout` when `lib` is `layouts`):

| Manifest field | Goes to |
|---|---|
| `name`, `lib`, `kind`, `ae` | folder, `preset.json` `name` / `kind` / `group` / `ae`; `--layout` for layouts |
| `title`, `title_vi`, `desc_vi`, `params_vi`, `tags` | the same `preset.json` keys (`desc_vi` already says "Kit đã có: ..." where it applies) |
| `source`, `license`, `brand_ui` | the same keys (TakayuStudio: `"license": "kit"`, `source.url` to the site's demo) |
| `spec` (TakayuStudio) / the report and component notes (Magic UI, Codrops) | what `preset.js` does: numbers to keep |
| `notes` | `preset.json` `notes` (adaptations, credits) |
| `demo` | the Gallery demo (`preset.json` `demo`) |
| `merge_into` | not used at import: where a kept item may be merged later, with the user's OK |

Names were checked against the library and across the three manifests; if a name is taken by the time a batch is built (another
preset added meanwhile), prefix the source as the anime.js family does (`magic-`, `codrops-`, `takayu-`).

Per batch: `kit.py gallery build` for the new items, look at each thumbnail, tell the user the batch is waiting in "Mới nhập" (group
counts, anything that failed its check). After the user's GIỮ: `docs/THIRD-PARTY.md` rows (drafts below), a `docs/CHANGELOG.md` line, the
usual checks before a commit (`smoke_new_project.py`, `kit.py gallery check`, `run_cases.py` when the AE port is touched).

## TakayuStudio batches

Categories ordered by their high-priority gaps, then medium ones; a category is never split. The manifest's `batches` object
lists the same order.

| Batch | Items | High priority | Site categories (in order) |
|---|---|---|---|
| 3.1 | 107 | 30 | Transitions, Camera, Attention & Emphasis, Mask & Clip, Game Impact FX, Spatial UI & Depth |
| 3.2 | 107 | 20 | Titles & Film, Layout & Reflow, Game Cinematics, Numbers & Data, Layout & Navigation, Data Storytelling, Scroll, Light & Glow |
| 3.3 | 106 | 8 | 3D & Depth, Glyph Physics, Captions & Subtitles, SVG & Path, Easing, Particles, Emphasis, Swap |
| 3.4 | 100 | 7 | Typing & Decoding, Web Scroll, Rotation, Principles, Scale, Blur & Focus, Navigation & Overlays, UI Buttons |
| 3.5 | 102 | 0 | Material & Surface Motion, Effects & Transitions, Web Interaction, Broadcast & Telop, Bounce & Reaction, Japanese, Rewards & Loot, Loops & Decoration |
| 3.6 | 100 | 0 | Colour & Light, Path & Shape, Selection & Controls, Distortion & Glitch, Feedback & Reactions, Texture & Look, Progression & Quests, Gesture & Mobile, Character, Timing & Rhythm |
| 3.7 | 105 | 0 | Game HUD, List & Grid, Entrance & Exit, Movement, Loading & Progress, Exit, Combat & Hit FX, Forms & State, 3D, Loading & Data, Variable Fonts |
| 3.8 | 55 | 0 | Loops & Ambient, Reveal, Springs, Pointer, Sound Sync |

Specs: 219 verified and 185 corrected against the site's data, 378 newly written (the motions the kit already has, and the lessons). Specs give the site's numbers; demo
pixels are on a 320 × 200 canvas (DOM demos 320 × 180) with 40–56 px type, so scale to the film element; the site's GSAP-style ease
labels name CSS curves (its "power3.out" is easeOutCubic = GSAP `power2.out`), and the specs give the real curve; snap the site's
12 / 24 fps steps to the 60 fps grid; DOM demos with three or more keyframes run on a linear clock with each segment eased in-out.

**Credits to keep in `notes` (never copy their code or data):** react-bits (MIT + Commons Clause), typed.js (GPL-3.0), aceternity
(unclear), Remotion (its own licence), the BOOTH telop packs (paid), KanjiVG (CC BY-SA: data not taken), Codrops demos other than the
two studied (not checked). The manifest's `upstream_credit` field marks the items concerned.

**Renamed to stay unique** (two TakayuStudio motions wanted the same name, or a Magic UI one had it first): `transition/match-cut` → `transition/takayu-match-cut`, `transition/crossfade` → `transition/takayu-crossfade`, `effect/confetti-burst` → `effect/takayu-confetti-burst`, `motion/card-flip` → `motion/takayu-card-flip`, `motion/error-shake` → `motion/takayu-error-shake`, `text/aurora-text` → `text/takayu-aurora-text`, `motion/follow-chain` → `motion/takayu-follow-chain`, `motion/path-follow` → `motion/takayu-path-follow`.

## Drafts for the docs (after the user keeps items)

`docs/THIRD-PARTY.md`, "Code and libraries" table:

| Component | Version | Licence | Use in the kit |
|---|---|---|---|
| [Magic UI](https://github.com/magicuidesign/magicui) | commit `85f97fd` | MIT (notice below) | Library presets ported from its components (each `preset.json` names the component and path) |
| [cobe](https://github.com/shuding/cobe) (Shu Ding) | 0.6.4 | MIT | As shipped in `map/globe`'s `assets/` (SHA-256 in its `preset.json`) |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | 1.9.x | ISC | Its particle physics re-written with a seeded generator in `effect/confetti`'s overlay mode |
| [Codrops: On-Scroll Typography Animations](https://github.com/codrops/OnScrollTypographyAnimations) | commit `af28d61` | MIT (notice below) | Text presets ported from its 29 effects (scroll range → preset duration) |
| [Codrops: Image Expansion Typography](https://github.com/codrops/ImageExpansionTypography) | commit `0d61479` | MIT (notice below) | Text presets ported from its 5 effects |

"Techniques and references" list: "motion-reference.takayustudio.jp (TakayuStudio): names, timings and eases of motions re-written as
kit presets (no code copied); each preset's `source.url` points to its demo." Add the MIT notices ("Copyright (c) Magic UI"; "Copyright
(c) 2009 - 2022 Codrops"; "Copyright (c) 2009 - 2024 Codrops") as the file does for claude-motion-design.

`docs/CHANGELOG.md` (Vietnamese, under the next version), for example: "**Thư viện:** thêm N mẫu từ Magic UI (MIT), M mẫu từ Codrops
(MIT) và K mẫu viết lại theo ý tưởng của TakayuStudio motion-reference, chọn qua "Mới nhập"; lọc theo "Nguồn" trên Gallery."

## Risks to keep in mind

- Per-character 3D (Codrops, TakayuStudio 3D text) in After Effects: check with `run_cases.py`; fall back to `"ae": "png"` per item.
- cobe 0.6.4 ships an ES module (`dist/index.esm.js`); WebGL reaches AE as pictures.
- Springs from `motion/react` (Magic UI): fit with `springk` / `ctx.track` and compare with the source docs page.
- Vietnamese headlines in per-letter and clipped effects: `ctx.mask` pad, and the `ctx.split` defect above.
- The TakayuStudio site changes often: before a batch, re-download the files listed in its report and compare the SHA-256 prefixes.
