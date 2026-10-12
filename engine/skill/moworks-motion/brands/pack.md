# A brand with a pack

A pack is a brand's guideline kept on this machine: `<kit>\brands\<pack>\` with `brand.json` (fonts, type scale, colours, layout and
margins, writing, logo rules, products, job rules, the `"kit"` block), `notes.md` (the rules in short), the guideline files
(`guidelines\`), fonts and logos, and often `skill.md` (the pack's own rules for you). Packs never go to GitHub (`.gitignore`): some
are under NDA. A film uses a pack when the brief names that brand (the pack's folder name or `brand.json` `"name"`, its products, its
font) or the user says so.

**Follow the pack, no question** (user, 07-08/10/2026). It governs the DESIGN on every piece of text, small words included (fonts,
sizes, colours, margins, KV) and the logos as its rules say; all other motion is free, text included. Brief points that break it
(colours above all): `kit.py brand-check <project> <pack> --brief`, one list to the user, brief or guideline for each, the answers in
`notes\NOTES.md`, before the storyboard.

**Read, for every film of the pack:** `skill.md` when there is one (its rules win over this page), `notes.md`, and ALL of
`brand.json` (`validity`: the date and campaign it was checked for; `kit`; `color`; `products`; `layout`; `motion`; `jobRules`...).
This page keeps no number of any brand: sizes, margins, colours, end tags and guideline pages are in the pack only. When they do not
answer a question, open the guideline files in `guidelines\`: `kit.py pdf <file> --pages ... --in <project>` renders pages to PNG on
this machine: look at the pages (colours, KV pictures), not only their text.

**A pack under NDA** (`brand.json` `"kit": {"confidential": true}`): its fonts, logos, guideline files and colour codes, product
renders, songs and client frames never go to any outside service (generation APIs included) nor into this skill. Before sending its
script to a voice service, ask the user (the kit's commands need `--confidential-ok`).

**A new guideline** (only when the user brings one: guidelines change from year to year; no check in every job): read every page of
every file (`kit.py pdf`), send the user a comparison with the pack (one table: item, the pack now, the new guideline, page): fonts,
sizes, colours, KV, layout and margins, writing, logo rules, end tag → update the pack: `brand.json` (with `"validity"`: the new date
and campaign), `notes.md`, `skill.md`, the files in `guidelines\` (the old ones to `guidelines\_archive\<date>\`, never deleted), and
the `"kit"` block when the accent colour, the logo words, the end tag width or the quoted pages change.

- **Apply:** `kit.py brand <project> <pack>` writes `assets\brand.css` (the pack's fonts, its type scale for the canvas, the margin, the
  colours) and puts `"brand": "<pack>"` in the film. Use the classes `b-headline`, `b-subhead` (one line), `b-subhead-2l`, `b-body`,
  `b-disclaimer`, `b-accent` (the pack's highlight colour, one highlight per layout) on EVERY piece of text, small words included.
  Supers stay on the pack's scale and the same size across the film.
- **Colours:** only the pack's (its brand and campaign colours, its products' tones, black and white); never colours of your own.
  A pack that limits coloured type (a montage table, one accent per text cluster): words in product / campaign colours are listed in
  film.json `"brand_colors"`; `brand-check` accepts only colours of the pack there. Within those, be bold.
- **Copy:** every claim from the brand's own site for the market, confirmed by the user; no invented features or numbers.
- **Logos:** official files only; the pack's `logoRule` and `"kit"` block say how its logos may move (some packs: never, they arrive and
  leave with their scene; no effect of their own, never in the groove) and its end tag (width, length, background, hard cut). A pack's
  stricter logo rules apply only to its own films.
- **Effects:** a guideline's effect bans apply to its logos; text stays free unless the user asks for the bans on text in a job (film.json
  `"brand_motion_bans": true`, then `brand-check` checks them).
- **Job rules:** the pack's `jobRules` (e.g. frame 0 shows nothing, a hard cut into the end tag) hold on its films.
- **KEEP DESIGN jobs:** the client's artwork wins over the guideline; the rules govern what you add. List deviations, never fix the artwork.
- **Before the first preview:** `kit.py brand-check <project> <pack>` (logos animated or grooved, off-palette text or backgrounds, text
  not in the pack's fonts, a logo where the pack forbids it, frame 0, `"brand_colors"` that are not the pack's, two accents in one text
  cluster). Fix what it reports.
