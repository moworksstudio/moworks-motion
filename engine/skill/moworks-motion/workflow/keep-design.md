# KEEP DESIGN: the user gave finished artwork

The design is approved. Your job is animation only. Positions, sizes, crops, colours, fonts and weights, every word, the order of scenes,
which elements exist and their layering stay exactly. Never "improve" the layout. If something in the design blocks the motion (two elements
that would collide when animated), stop and ask with a one-line proposal and a still. **Tolerance: up to 2 px off the design passes; do not
chase it.**

## Bring the design in
- **PowerPoint / Google Slides** (Google Slides: File > Download > PowerPoint; a `.gslides` shortcut cannot be read):
  `kit.py ingest <project> "<deck.pptx>" [--slides 1-8]` → `deck\layout.json`, `deck\LAYOUT.md` (every element with its z id),
  `deck\fonts.json`, pictures, and a film with one still scene per slide (`S01`...; preset `intake/deck-slide`). Element ids: `S01_f_z<z>`.
  (`--no-film`: the content only, for a free-design film made from a deck.)
- **PSD / PSB:** `kit.py psd <project> "<file.psb>" --list` (layer tree in `psd\PSD-TREE.md`; frames are usually numbered groups or artboards),
  then `kit.py psd <project> "<file.psb>" --frames "P01=F2/1, P02=F2/2" [--keep "F2/BG"]` → layers as PNG + live text, `psd\psd.json`, a film
  with one still scene per frame (preset `intake/psd-frame`). Element ids: `P01_f_u<NN>` (inside effect groups `P01_f_g<id>_u<NN>`).
  A frame that is a single smart object or picture layer, reflected text gradients, canvas-wide Gradient Fills and colour-dodge glows are
  read correctly; `--keep` the shared background layers of a group (e.g. `F2/BG`).
- **Images of the final frames only:** place them yourself as `image` elements in film.json, split into layers only if the user sends the
  layered file (ask for it rather than cutting elements out of a flat JPEG).
- **The assets folder wins over the deck/preview pictures** (full resolution). Missing an element or a font file: list it and ask.
- **Fonts:** the design's own fonts. Fonts activated from Adobe Fonts (Creative Cloud) are found and copied automatically (that copy stays
  on this machine: Adobe's licence). ingest/psd report a font as MISSING → ask for the file, put it in `assets\fonts\`, run again. A
  stand-in (psd: Arial Black + skew) is only temporary; say so.

## Check the rebuild before animating
Compare the still scenes with the client's own frames: `kit.py ingest <project> --compare "<folder of slide images>" --pairs "S01=1, S02=2"`
(or `kit.py psd <project> --film --compare "<previews>" --pairs "P01=1"`) → side-by-side sheets in `qa\psd-compare\` and a % per frame. Look
at the worst ones, fix real differences (a font, a missing element), show the user and get an OK.

## Motion spec first (HARD gate)
The design is the storyboard, so there is no storyboard step; the motion still needs approval before you animate. Paste the motion spec
table in the chat (the format in `free-design.md`, step 3; one row per frame / scene: what enters, how, when, how long, what keeps moving,
how it leaves, the transition, the sound), saved as `notes\MOTION-SPEC.md` (path given), and **stop until the user approves**. Its row 0 asks
the **dynamic level** (user's choice): light = the layout holds still once it has settled; **strong (recommend it)** = large
drifts and slides while a frame holds, multi-line supers in from alternate sides, the designed place reached only when the scene fully
settles (a first cut that holds the layout too tightly reads "tame"); and whether the film has a **groove** (never by default). A stretch of
voice-over with no designed frame gets a proposal in the table. Only the user's explicit "skip the motion spec" skips the table (say so, note it in `notes\NOTES.md`).

## Animate (free)
- Add `motion` entries after the intake block in each scene, targeting the element ids (see `index.html` or `LAYOUT.md`), as the approved spec says.
- The animation is yours and free: any entrance, path, overshoot, flip, slam, mask, camera move, drifts while it holds (strong level), the
  groove if the user wanted one (`film.md`), big type passing under the product, elements arriving from off-frame. The only fixed point is
  the REST state: when a scene fully settles, every element sits on its designed place, size and colour (2 px tolerance). Dependent
  layers (a shadow, a glow) enter with or after their element. The motion lessons apply (`film.md`, "Motion lessons": counts from 0, light
  only on objects, transitions that cover the frame, cut-out people kept on the frame edge).
- The design is fixed, so the motion is where the film gets its character: write it for this film (`film.md`, "Creative first"); a library
  preset only when the user names one, or as a utility (counters, line draws, captions) or a starting point you change; every scene gets
  at least one move written for it. Ideas from `recipes.md` if they help.
- Logos: `SKILL.md` rule 5 (never distorted or given an effect; a pack may forbid any move). Text may take any effect while it reads.
- The build's lint and `kit.py collide` (offered, `film.md`): a line also present on the still scene (before your motion) is the design's own
  layering and stays; a line that only appears while things move is yours to fix (big type under the product while readable is fine). The
  self-review (`review.md`; score 6 = the client's frames).
- A brand pack: the artwork itself is never changed even if it breaks the guideline: list deviations in one message for the user.
