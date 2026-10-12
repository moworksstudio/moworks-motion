# Ideas by kind of film (none of this is a rule)

User, 08/10/2026: the film is free; the only rules are a guideline's design rules, logos, the user's own asks and the quality checks
(`SKILL.md` step 4). What follows is what worked on past films: take what helps THIS film, ignore the rest, break it when the idea is
better. The groups disagree with each other on purpose (what suits a launch is wrong for a premium product). The user's words beat all of it.

## 1. Energy (youth, launch, social, music)
For young, playful, launch and music films (the user's words young, lively, dynamic, "not tame" point here too). Written this way from
round 1 it saves rounds: a tame first cut was the slowest part of an earlier film (six rounds to get here).
- **One type scale for every super** (a guideline: its own sizes): the montage words (the hook words, the chant, the one-word punches)
  break it, in size AND colour. Big one-word type may sit UNDER the product while it reads (user, 08/10/2026: a product passing over a one-word super).
- **Colour on the montage words**, from the brand's or product's own colours where there are some (a brand pack may limit coloured type:
  see its notes, list the allowed ones in film.json `"brand_colors"`; some allow one accent colour per visible text cluster), on a
  background it reads on. With a guideline, "many colours" in a brief means more of the brand's colours; with none, your own palette.
- **Every montage word its own entrance** (stomp, spin, drop, zoom, flip, rise, slide), never one shared move; then a kinetic exit.
- **A sticker / icon family drawn for the film** (pixel-art, line icons, cut paper: one style), one per feature or idea, popping on
  `steps()`, bobbing on the beat.
- **The groove, if the user wants one** (asked at row 0, `film.md`): stickers hop, bubbles and particles pulse, rings bloom on the
  downbeats; the hero punches on its montage words.
- **Beat punctuation:** a ring opening from the word or the hero, a burst on the hits (`kit.py beats` hits), never over text.
- **Graphic transitions that run UNDER the hero** (stripes, a block wipe, a circle from the hero): the hero carries every cut.
- **Colour bars swept in behind key numbers;** feature words in word by word.
- **Ambient life clear of the text:** confetti / shapes drifting only on free spots, at least 60 px from every text box (measure them).
- A product film: one product through the film (a `layers` element), a light sweep on its turns, glows drifting on film-time waves.
- **Liveliness quotas** (the plain-prompt A/B branch met them and the user called it "extremely free and dynamic", 07/10/2026): a scene change
  or a new world at least every 3 s; nothing on screen still for more than 0.5 s (supers only pulse with the groove while read);
  every montage word its own entrance AND its own size / weight / colour; one sticker per feature, bouncing on the beat; a background that
  is never a flat colour for long (patterns drifting, rings blooming on the beat, soft blobs, 30-60 particles fading near text).
- **Always-on layers:** write the ambient life once as film-level `"layers"` (or a canvas drawn as a pure function of film time in a
  project preset), not per scene, so it never stops at a cut.

## 2. Premium product (calm, high-end, SaaS, corporate)
From the @0xMovez course's house rules (`.aimotionkit\archive\AI-Motion-Kit-v2\Docs\Audit\x-0xmovez-motion-course.md`).
- Hook in the first 2 s; something new every 2-4 s; no scene where nothing happens.
- One display font + one UI font, one accent colour (unless the brand says otherwise).
- Avoid: a title on a gradient with everything fading in; small labels in the corners and decorative frames; glow / gradient on UI edges;
  generic particle bursts; bouncy easing on text; icons with mismatched stroke weights.
- Text inside a frame that is changing shape: in after the change starts, out before the next one.
- Never fade black straight to the accent colour: carry an accent-coloured element from one scene into the next.
- Springs: UI may overshoot a little (`spring.snappy`), text not (`spring.default` / `heavy`).

## 3. UI morph (app, software, product with a screen)
From @twoclipping / @verbove in the course.
- **One shape never cuts:** it changes size, corner radius and colour through 8-12 states (button → card → screen → notification...).
- **A cursor drives it** with real clicks, drags and typing; the camera zooms so each state fills the frame; the end can loop to the start
  (`kit.py verify --loop`).
- **Five beats:** the hook (the problem in 5 big words) → the product assembling → 3 features, each with the cursor → 1 number that proves
  it → logo + call to action.
- **Real UI, real data:** ask for the client's screenshots or screen recordings; put them in the library's device frames; never draw a fake
  UI of the client's product. Taking screenshots from the client's public site is a download: ask first (your own script: `reference/commands.md`, "Your own
  Playwright script").
- Indicators and toggles: `motion/spring-track` (`"indicator"`: the leading edge snappy, the trailing edge heavy).
- A card dragged by the cursor and let go: `motion/drag-release` (it lags, tilts with its speed, bounces home or to a drop spot).

## 4. Song film (a lyric film, a launch cut to a track)
The plain-prompt A/B branch synced best so far (user, 07/10/2026: "it listens to the music and follows the beat (kick, bass) and the lyrics quite
precisely, the most precise so far"). What it did, now the rule:
- **One grid for everything:** the song's beat grid (`kit.py beats`: beats placed where the kick is heard) drives the scenes, the words,
  the hits and, when the user wants a groove, the pulses (film.json "groove": `film.md`). Times as references (`{ "beat": n }`, `{ "lyric": ... }`), never typed seconds.
- **Every sung word on the grid:** `kit.py align` with the brief's sections (`--sections`) gives a draft; ask the user to tap the line starts
  in the player's lyric mode (a minute of their time, the biggest gain), align again with `--snap 8` so the words sit on the song's
  eighths, and place the montage words on beat references.
- **Land ON the word:** the impact (a stomp reaching size, a fold closing, a word landing) falls on the sung onset, so the move STARTS
  before it: `"offset": -0.07` on the reference for a 0.25 s stomp (an out-back / expo-out ease reaches its size in its first third). A
  move that only starts on the word is felt late. The product's action lands ON the word; it does not begin there.
- **Moves fit the note:** on eighth notes (0.22 s at 135 BPM) a word's entrance lasts at most one eighth; never a 0.5-1 s preset cut short
  by the next word.
- Scenes = the song's sections (hook, pre-drop, drop, verse, outro): measure them (`kit.py beats`, loudness by bar); cut on downbeats.
- Motion on the syllables (`kit.py align` word times), hits on the hits; the chant words are the montage words (recipe 1).
- The lyric is the copy: show the sung line, word by word; a claim placed in a lyric gap still gets its reading time.
- A held note can be drawn (letters added one by one until the note ends, measured to the right margin).
- Credit the music on screen when the user asks (small, on every scene except the end tag: a `layers` element).
- Combine with recipe 1 for youth / launch songs.
- **Beat-synced templates** (HyperFrames' music-to-video, in the library): pick by the music under the group, one template per group,
  split a long stretch at a real anchor (drop, surge, the end of a roll) rather than stretching one. Their time params take song
  references (`"landings": [{ "beat": 17 }, { "beat": 19 }, ...]`, converted to the block's own seconds).
  | Template | The music | Span |
  |---|---|---|
  | `card/card-flyby` (`landings`) | onsets that accelerate into a downbeat: a sequence of items, one per hit | 4-6.5 s |
  | `title/living-field` | a calm stretch with few onsets (a pad, a riser): one mark held still | 6-16 s |
  | `text/texture-strobe` (`strobePlan`) | a dense roll: one word strobing through textures | 1.2-3.5 s |
  | `text/kinetic-cascade` (`phrases`, `climax`) | an intro statement word by word, ending on a keyword + an icon | 3.5-7 s |
  | `logo/split-lockup-pulse` | a short logo sting on fast onsets + a roll to pulse on | 2-4 s |
  | `card/poster-tile-mosaic` (`program`) | a dense section with sub-phases (build, recolour on a roll, fill then drop) | 4-7 s |
  | `text/flipbook-word-cycle` | a fast hi-hat roll with no single message, resolving into a phrase | 1.2-3.8 s |
  | `text/anchor-word-slot` (`program`) | a held name on the left, words popping on the right, a shake on a run | 3-6 s |
  | `text/keyword-font-shuffle` | a steady onset stream: a phrase typed one word per onset, then a keyword shuffling fonts | 2.5-5 s |
- **Palette flip:** the same layout re-skins on a section change by switching its colour variables in 0 ms on the downbeat (no fade).

## 5. Hand-drawn (kids, education, playful brands, explainers with a human touch)
The kit's hand-drawn pack (`kit.py library motion hand`) draws with the claude-animation library (Hanif, MIT; ported to the kit and checked
pixel by pixel against the original). Its two looks, pick one per film:
- **Brush ink + watercolour** (lively, warm, a little imperfect): `hand/paper` (`"look": "fibre"`), lines in `hand/pencil-draw`
  `"tool": "brush"` (tapered brush ink drawn on by a round nib) with `"boil": 10` while they hold, colour as `hand/watercolor` washes that
  bloom from a point, one accent red, soft washes for the rest.
- **Textured editorial** (calm, precise, storybook): `hand/paper` (`"look": "plain"`, `"bands": true` for diagonal light bands, `"finish":
  true` for the film grain), drawings held perfectly still (no boil), acting on twos.
- **Pencil marks:** `hand/pencil-draw` `"tool": "pencil"` (three thin broken passes): circling, underlining, crossing out, sketch guides.
  `mode`: `box` (edges overshoot the corners), `circle` (overshoots its start), `underline`, `strike`, `path` (your points).
  The layouts library has more hand-drawn parts (`kit.py library layout hand`: speech bubbles, arrows, frames, written titles).
- **Everything breathes:** `hand/boil` on DOM drawings and stickers (10 a second), entrances on `steps()` eases.
- **Impacts:** `hand/hit-stop` (a frozen squash at the hit + one flash frame), `hand/shake` (their decaying shake) on the scene,
  `hand/comic-text` (their slam timing) for the sound word.
- Avoid: glossy gradients, glows, perfect vector strokes next to hand-drawn ones, motion blur on drawings (**Blur** off when MOV
  Export asks, `--no-blur`, when the whole film is hand-drawn: drawn frames have no shutter; tell the user before they export).

## 6. Graphics over a talking head (interviews, founder videos, B-roll)
From the origin skill (claude-motion-design) and the walkthroughs it summarises.
- **Density first:** ask about 3 graphics per 30 s (medium) or 4-5 (heavy). Heavy is easier to cut down than to add to.
- **Word timings first:** run `kit.py transcribe`. Every graphic lands on its spoken word, and one timing file drives the captions and the cues.
- **Plan line by line, each graphic tagged.** The user approves the plan before any motion.
  - full cutaway: 3-10 s, with at least 2 s of face between;
  - face stays: a panel in the empty side of the frame;
  - lower third.
- **Panels over the footage:** MOV Export with **Trong suốt** on (`kit.py mov --alpha`, ProRes 4444) goes on the editor's timeline.
- **On 9:16:** the speaker at the bottom, one graphic at the top, the captions; nothing else.
- **The footage inside the film** (HyperFrames' talking-head-recut design library): the footage in a box element, `motion/talking-layout`
  on it at each card change (`split` video right / `stack` video on top, card below / `pip` a corner pill, card first / `overlay` full
  frame, card floating / `hide`; 0.5-0.7 s, power2.inOut; `frame` hairline or polaroid on split / stack only), and
  `card/talking-card` in a box under it for each card (10 styles: academic, audit, editorial, geom, minimal, spotlight, swiss,
  terminal, whiteboard, xhs; choose by the talk's tone, not its topic; `replace` its placeholder copy; it fades in 0.4 s, out 0.35 s).
  Build the card's hero frame first (fully visible, readable), then its motion; a card's words land on the spoken words.
- **Captions inside the footage** (HyperFrames' embedded captions, run as shipped: `<kit>\engine\vendor\hf-captions\`):
  1. `kit.py cutout <film> <clip> --people --captions`: the clip at its own frame rate, the person cut out of every frame, the words, HF's
     safe zones -> `assets\captions\<clip>\` (transcript.json, safe-zones.json, sheet.jpg = 1 frame a second) and the scene's voice
     `audio\voice\<clip>.wav`. About 2 frames a second at 1080p on the CPU: say so before a long clip.
  2. Refuse or split first (HF's gate): several speakers or hard cuts, no person, under 3 s or no speech, captions already burned in
     (look at sheet.jpg), a transcript that is not language, a busy handheld shot. Fix names in `audio\transcript\<clip>.words.json`
     (keep the times), then run step 1 again.
  3. Pick ONE identity from `CATALOG.md` there (35: 10 scene-embedded looks, 25 themes): shortlist 2-3, recommend one with a one-line
     why, the user picks (unsure: `anchor`, words read, scene safe). Never ask "which engine".
  4. Read `safe-zones.json`, then write the identity's file in `assets\captions\<clip>\`: `theme.json` (themes; schema in
     `themes\README.md`) or `cinematic.json` (the ten looks; schema at the top of `scripts\make-cinematic.cjs`). Craft:
     `references\rail.md` (the rail), `references\composition-craft.md` (the embed). The rail carries most words; the embed is the scarce
     peak: at most one per thought, never two on screen, a beat of air between them. Embedding every word is the common mistake.
  5. In film.json: a full-frame box with `text/embedded-captions` `{ "clip": "<clip>" }`, the scene's voice `audio/voice/<clip>.wav`, the
     scene as long as the clip. `kit.py build` runs HF's compiler and its checks (timing, occlusion, overflow, rail/climax): fix every
     FAIL it prints (`gates.txt`) in the authored file, then show stills.
  Vietnamese: HF's fonts are drawn with Vietnamese-complete faces. The six themes whose peak is written with a single-line pen (aurora,
  brush, chalkboard, graffiti, neonsign, spectrum) draw only unaccented letters: give them an unaccented hero word or pick another
  identity. Port to AE keeps every caption word as an editable text layer.
- **Captions:**
  - 1-3 words popping, or 3-7 in karaoke;
  - at least 0.7 s on screen, at most about 17 characters a second;
  - a word lights on its first frame, never before.

## 7. Craft notes (any film)
- **anime.js** (the whole library, on the film's clock: seekable, seeded, ported to AE like the rest). `motion/anime` writes any anime.js
  animation straight in film.json: `"split": { "chars": { "wrap": "clip", "clone": "bottom" } }`, `"targets": "chars" | "words" | "lines" |
  "self" | "<selector>"`, `"anim": { "y": ["110%", "0%"], "duration": 0.7, "ease": "outExpo", "delay": { "stagger": 0.035, "from": "center" } }`
  (times in seconds; JSON forms: `{ "stagger": v, "from", "grid": true, "axis", "jitter", "seed" }`, ease `{ "spring": { "bounce": 0.4,
  "duration": 0.6 } }` / `{ "irregular": [10, 1] }` / `{ "steps": 6 }`, `{ "morphTo": "#path" }`, `{ "scramble": { "chars": "blocks" } }`,
  `"drawable": [0, 0]` + `"draw"`, `"motionPath": "#path"`), a `"timeline"` of several, or a `"layout"` change. Ready ones: `text/anime-roll`
  (letters roll to their copy, or to a new word with `to`), `text/anime-scramble`, `motion/anime-stagger-grid` (a wave across any grid,
  measured from the real places), `motion/anime-layout` (reorder / row to column, every child travels), `shape/anime-morph`,
  `line/anime-draw`, `motion/anime-path`. Prefer them over hand-written GSAP for these jobs; never animate the same element's same
  property with both engines.
- **Camera zoom:** interpolate the scale in log space, so equal ratios take equal time. Never zoom in and straight back out.
- **A colour flood** (a circle wipe from an object) clears the farthest corner (its distance to the 4 corners × 1.05) in about 0.3 s.
- **At a cut:** the next shot enters already moving in the exit's direction. Cut at peak speed; direction and speed match on both sides.
- **Exits** run about 1.5× faster than entrances.
- **Swapping one line for the next, inside a scene** (from HyperFrames' cut catalog; one text on screen at a time):
  - *zoom-through* (moving on to a new part): out = scale 1 → 1.2 and blur 0 → 10 px, power3.in, 0.2 s, opacity 1 → 0.15 linear; cut;
    in = from scale 0.75, blur 10 px, opacity 0.15 to 1 / 0 / 1, expo.out, 0.5 s. Blur 10 px on text (20 px smears it), 18-20 px on
    a full-frame surface; headlines and short phrases only. Backwards (scale down) for an arrival / payoff.
  - *waterfall* (one idea built over several lines): each outgoing word x 0 → -230, power4.in, 0.34 s, faded in 0.18 s, 0.022 s apart,
    the last word gone at the cut; incoming words from x +230, opacity 0.35 → 1, power4.out, 0.3 s, gaps starting at 0.05 s and
    shrinking ×0.84 per word.
  - Same peak values on both sides of the cut; blur on the wrapper, not on each child.
- **Pointing at something in a real picture** (a product in a photo, a detail of a screenshot): find its box with `kit.py measure
  <picture> --locate` (numbered strips twice, then look at the red box: eyeballed rings land off target), then
  `effect/circle-highlight` (wash, ring, connector, label, brackets) or the film's own ring at that box. Better still: let the
  picture's own shape carry the data (a straw becomes a gauge, a glass's liquid a pie), one hero picture, colours picked from it.
- **Moving a composed group to make room** (rows, a card stack, a list sliding over to reveal the next item): `"ease": "nudge"`
  (slow-fast-slow in one ease; the new content appears during the fast middle). No single built-in ease does it: `power4.inOut` smacks.
- **One card knocks another out:** `transition/push` with `"target": [old, new]` and `"hit": 0.45` (`"tilt": 10` for cards): one spring
  drives both, the old one leaves within the first 45 % and fades, the new one lands with a small bounce. Hold the new one at least 1 s.
- **Nothing frozen except the final hold:** a micro drift or settle keeps a held frame alive. The end card counts too, but never the logo.
- **Sharp text through a handoff:** crossfade only its fill, never scale a blurred copy.
- **A calm film:** one thing moves at a time. The muted test: someone who watches it without sound can say in one sentence what it showed.
- **A product film is a chain:**
  - each step produces what the next one uses (the object leaving one scene becomes the next), on one continuous camera;
  - muted-first: a homepage autoplays silent, so the type carries the message.
