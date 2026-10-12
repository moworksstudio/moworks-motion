# FREE DESIGN: only text, an idea or a song

You design everything: concept, layout, graphics, type, colour, motion, at maximum creative effort and free of house rules (user,
08/10/2026: only a guideline's design rules, logos, the user's asks and the quality checks bind; `SKILL.md` step 4). Before any motion is built the user picks a direction from **3
storyboard options**, then approves the **motion spec table** (user, 07/10/2026: a storyboard and a spec are cheaper to change than a render;
both gates are hard, a brief's "a complete first cut" does not waive them); from then on they lead with notes in the player.

## Style reference (when the user gives a film, a video or images to match)
The default for drawn or acted content (people, animals, rigged or frame-by-frame acting, detailed illustration, effects drawn frame by
frame): its STYLE is followed, never copied shot by shot; a 1:1 copy only when the user asks for one in so many words. Built content
(type, shapes, UI, icons, pictogram people, photos, footage) may be copied closely when the user wants a copy (`workflow/remake.md`).
A mixed film is decided shot by shot (user, 11/10/2026; `SKILL.md` step 4).
1. `kit.py compare <film> <ref> --shots` (the film needs no build yet): sheets every 0.25 s with times, the cuts marked, and
   `01_Brief\SHOTS.md`; Read the sheets.
2. Write `01_Brief\style_guide.md`: palette (hex), type (families, weights, sizes, case), the art style (flat or textured, line or no line,
   shape language, character proportions and faces, how sets are drawn), scene length, how scenes change, camera moves, texture, how text
   enters and leaves, density, what makes it feel like itself. And the **REF shows** column of `01_Brief\SHOTS.md`: the reference's shots in
   order, one line each (what it does, not a plan to copy it).
3. Take the look and the grammar (rhythm, framing, type behaviour, transitions), never its content, logos, characters or compositions:
   your own scenes, people and sets, drawn in that style (`characters.md`: whole vector parts, the asset gate; nothing measured to the
   pixel on its frames).
4. **Stop and wait** for the user's OK on both files, then go on to the storyboard options with that style.

## Moworks' own look (style references: only when the user asks)
The studio's past work lives in two folders the user fills (finished work only, never project files):
- `library\refs\video\`: films (MP4, MOV) → how Moworks MOVES (pacing, transitions, camera, text in / out, energy);
- `library\refs\image\`: images, PDF decks, folders of images → how Moworks LAYS OUT (grid, type, palette, composition).

- **The user asks you to load the reference library** (in any words): `kit.py ref sync` (every new item gets a `<name>_ref\` folder next to it: frames + `sheet.png`),
  then for each new one look at its sheet and write its `REF.md` (films: pacing, scene length, transitions, camera, how text and graphics
  enter and leave, motion language; layouts: grid and margins, type, palette (hex), composition, image treatment; both: what makes it
  Moworks). `kit.py ref list` shows them all.
- **Use them only when the brief asks** (use the Moworks references, motion like the film <name>, a layout like <name>): read the folders'
  `INDEX.md`, then the `REF.md` and `sheet.png` of the 1-3 closest references (video refs for the motion, image refs for the layout), write
  `01_Brief\style_guide.md` for the new film from them (as for any style reference above: the grammar, never a client's content, logos or
  characters), wait for the user's OK, then the 3 storyboard options in that style (at least one close to the references, one that pushes
  further). Without such a request, design from the brief alone.
- References stay on this machine (client films can be under NDA): never send them to an outside service.

## Decide, storyboard, motion spec, build (two approval gates: HARD rule, `SKILL.md` step 4)
1. Decide: **the story first** (`story.md`: the truth in six lines, one arc, beats with one job each, the hook, value by beat 2, the
   voice-over as cues; not for a song film), then the one-sentence visual idea (strong enough to hold every scene), ideas from `recipes.md` if they help, length (default 20 to 40 s; a song:
   its length), aspect (16:9 unless phone / social → 9:16; a feed post 4:5 or 1:1; sizes and safe zones: `reframe.md`), palette (hex, with its source: the brand pack, the client's material, or "own
   choice"), type scale, 4 to 8 beats with their copy (3 to 8 words on screen per beat). Write it in `notes\NOTES.md` in a screen of text.
2. **Gate 1: 3 storyboard options** (three real directions: different composition, type and motion language, not three colourways). Write
   each as a still film, `<film>\03_HTML\qa\storyboard\A.json`, `B.json`, `C.json` (a film.json with every scene laid out and no motion), then
   `kit.py storyboard <film>`: each option is built apart (film.json and index.html are not touched) → one sheet per option,
   `02_Assets\Stills\storyboard\<A|B|C>\sheet.png`; publish them as a round, `kit.py round <film> storyboard A B C --note "..."` (→
   `02_Assets\Rounds\Storyboard_R<k>\`), and open your message with the line it prints, then "This film tells [audience] that [promise]."
   (`story.md` 5). Send the three sheets (with their paths), each with one line: its idea and its motion
   language (a song film: also where the cuts and hits fall), and the scene table with each scene's **why**. Ask the user to pick or mix (AskUserQuestion). **Stop until they pick.**
   **None of them works** (Test 3: the user disliked the black + yellow): ask what they like and dislike in each (AskUserQuestion with concrete choices),
   make 2-3 variants around the closest one (its layout with other colours, or its colours with other layouts: `A1.json`, `A2.json`...),
   `kit.py storyboard <film> A1 A2 A3`. At most two such rounds, then ask about the brief again.
3. **Gate 2: the motion spec table** of the picked option, one row per scene, saved as `<film>\03_HTML\notes\MOTION-SPEC.md` AND pasted in the chat
   (users read it there; Tests 1 and 3 asked for it), with the file's path:

   | # | Time (s) / beat / lyric | On screen (layout, copy) | In: move, ease or spring, length, on which beat / word | Hold (what keeps moving) | Out + transition to the next scene (what carries over) | Sound / hits | Source |
   |---|---|---|---|---|---|---|---|
   | 0 | the whole film | the two questions of row 0 | **dynamic level**: light / strong (recommend strong, `film.md`) · **groove**: none / where (never by default; slow or soft music: none; when wanted: backgrounds on downbeats, the product only on montage drops) | the always-on layers of a strong film | | | |

   - Concrete moves, not adjectives: "the word SALE stamps from 1.6x to 1x, spring.snappy, 0.25 s, on beat 9", never "the text comes in lively".
     Turn every adjective of the brief into numbers (`film.md`, "The numbers"): "premium" = materials, an ease-out quint, springs at
     damping 0.8 and no overshoot on text; "modern" = a camera with a lens, an orbit and one push on expo.out; "cool" = a light setup.
   - Under the table, two lines: **BANNED** (the defaults this film never shows, by name: the list below plus what the brief rules out)
     and **QA** (the stills at named times you will check before showing, and the `"checks"` you will write: a label lights on its frame,
     a landing touches its mark).
   - A voiced film: each piece enters on the word that names it, mostly in the back half of its scene, never all in the first quarter;
     an element that crosses a cut has its numbers on both rows (`story.md` 5).
   - Source: "new" (written for this film) or the library preset it starts from (the user can swap any row for a Gallery effect: COPY in
     `gallery.bat`). A product sequence: which render frames play in each scene and the pose they rest on (`film.md`, image sequence).
   - Check it against the few rules before sending: logos as rule 5, rule 2 (text readable while
     read: a groove pulse at most, sung words on their sung times), an out only after its in ends.
   - **Stop until the user approves** (their edits go into the table first).
4. Build the approved spec: `film.json` with every scene, transitions and the end card, `kit.py build` (read its lint), the quick self-review
   (`review.md`), then tell the user to open `1. Preview.bat`. One short message: the idea, a table of the scenes (what is new in each), the
   self-review scores, three concrete things they could ask to change, and the offer of the long checks (`film.md`, "Preview and fix"). A
   change of plan while building (a move that does not work): say it in that message, update `MOTION-SPEC.md`.
5. From round 2 the user leads (`notes\feedback.md` / chat). If they now bring artwork, switch to `keep-design.md` for that part.

## Look and motion
- **Creative first** (`film.md`): the look, every scene's composition and the motion language are designed for this film; library parts only
  where they save real work, restyled to the film. A library layout or a Moworks house pop as it ships is not a scene.
- Avoid the default AI-video look (a title + gradient blob + fade). One hero move per beat, the rest supports it; every beat lands,
  holds long enough to read, then exits decisively. The lead subject fills most of the frame in feature beats.
- **The banned list** (name the defaults; a general "avoid the AI look" only swaps one default for another): purple or blue gradients,
  glow orbs, bloom, lens flares, neon on dark by default; floating particles as decoration; everything fading in at once; fade-and-slide-up
  on every element; centred-everything layouts; generic spinning turntables; text that moves while it is read; a made-up tagline. Keep
  the list alive: after the first build, name each default the film used anyway, add it to the film's BANNED line and build again.
- Avoid palettes that read "made by AI" (Test 3: black + yellow was "too Claude AI"; also neon lime on black, purple-blue gradients,
  glassy blobs): take colours from the client's own material, or from a specific idea for this film (a material, a place, a decade), and
  make at least one of the 3 options a palette the user would not expect.
- The main super and the hero lean toward the centre, as one group where it fits, never forced (`film.md`, "Composition").
- Real content only (rule 4): illustrative numbers are labelled "Example".

## A public look (no brand, or the user wants a ready style)
`library\looks\` holds 13 looks (HyperFrames' frame presets, Apache-2.0): **biennale-yellow** (literary catalogue: parchment, indigo,
solar yellow) · **blockframe** (neobrutalist: black borders, candy pastels) · **blue-professional** (consulting: cream, one cobalt) ·
**bold-poster** (populist poster: tilted script display, red) · **broadside** (protest poster: black / fire orange, huge lowercase) ·
**capsule** (playful editorial: pills, candy accents) · **cartesian** (museum catalogue: hairline grid, warm stone) · **cobalt-grid**
(risograph: cream, cobalt grid) · **code-editorial** (warm brand book: cream, terracotta) · **coral** (bold magazine: coral / black /
cream) · **creative-mode** (neo-brutalist: hard shadows) · **daisy-days** (picture book: pastels, outlines) · **editorial-forest**
(literary: green / pink / cream).
`kit.py brand <film> <look>` applies its colours and type (a family with no Vietnamese is swapped for a close one that has it:
`brand.json` "fonts" "_swapped"); then read its `FRAME.md` and build with its atoms (grid, borders, shadows, components), as you would a
guideline. One of the 3 storyboard options may be a look. A client's pack or guideline always wins over a look. Its small sizes are for
text inside cards; full-frame text keeps reading sizes.

## A brand with a pack, text only
Free layout and animation; the pack governs the design (`brands/pack.md`, and its own `skill.md`): `kit.py brand <project> <pack>`
first and its classes (`b-headline`, `b-subhead`, `b-body`, `b-disclaimer`, `b-accent`) on EVERY piece of text; the pack's type colours
(its highlight colour, product / campaign colours on montage words where it allows them, on the backgrounds it allows); backgrounds
and graphics in the pack's colours; the margin; its logo rules; its end tag. `kit.py brand-check <project> <pack> --brief` before the
storyboard: every brief point that breaks the guideline goes to the user (brief or guideline?).

## A brand with no pack, text only
Asked first (`SKILL.md` step 3): the client's guideline when there is one (its link / file, read in full; its design rules on every piece of
text; brief points that break it go to the user), else your own design at maximum effort with the client's logo and colours from their
material (`brands/other.md`). Never another pack's assets.
