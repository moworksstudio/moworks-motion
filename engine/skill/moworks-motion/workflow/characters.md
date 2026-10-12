# Character and illustration films

For cartoon-style character animation, people or hands moving frame by frame, a film rebuilt from a finished video with no artwork,
or vector artwork (AI / SVG) from the user. Written after the 2D rebuild test. That test rebuilt a 96 s flat 2D film from
its MP4 alone. It took 6 h and 1.4 B tokens, and 74 % of the time and 78 % of the tokens went into three rounds of redrawing people, hands and props
AFTER the first cut. Everything below moves that work to the start, where it is done once. A later test (a film rebuilt from a video) settled
how art is made: **redraw, never trace** (section 5).

## 0. A heavy job: say the cost first
A frame-by-frame motion graphic film (a 1:1 remake of a video, character animation, redrawn sets and props), or a reference in a complex
textured style (watercolour, gouache, crayon, paint), is a HARD, EXPENSIVE job class. Before any work, in plain
words:
- it is heavy; the measured cost: a 31 s film rebuilt from a video took about 5 h 30 - 6 h of work and ~860 M tokens processed (~$515
  API-equivalent) done redraw-only; each helper ~50 - 135 M tokens, ~$30 - 75, 1 - 1.5 h; six helpers at once hit the plan's 5-hour
  usage limit;
- the limits, so the user knows what will not match: a copy is not 100 % (a few px, simpler hands, approximate gestures); a textured
  style is approximated (section 5, "A textured style");
- the cheaper paths: fewer seconds, fewer shots redrawn, a free redesign instead of a 1:1 copy, the library rig for the people;
- then ask (AskUserQuestion) before starting, and again before a fan-out of helpers.
- Cost is measured with `kit.py track report` (every call's usage), never the helpers' "subagent_tokens" (that is a final context size:
  quoting their sum was ~190x too low).

## 1. The gates (hard rules from the user)
1. **Asset gate.** Before any animation the user approves the storyboard AND the asset sheets: every character, location and prop.
   - This holds even when the user says "skip the storyboard", "just copy the whole video", or "replicate 1:1".
   - A copy job lowers the design work, not this gate. Say so in one line: "copy jobs still need the asset sheets approved: they are where a copy breaks".
2. **Rigged, acting sheets.** A character sheet is the character rigged and animated through every pose the film needs, plus the
   stress poses, its hands and its expressions. Joints, limbs, hands and anatomy get checked on it, not in the film.
   `kit.py sheet` makes it (section 4).
3. After the OK the cast is **frozen**.
   - Scenes never redraw or patch a character's parts.
   - A change the film needs goes into a list. You apply it between rounds, rebuild the sheet, and tell every helper.
   - In the test the shared rig changed mid-round twice and broke scenes that had been tuned around it.

## 2. Inventory (before any drawing)
For every character, prop and location, write a table in `notes\ASSETS.md`:
- where it appears (times);
- every view seen (front, 3/4 left or right, profile, back);
- every pose and action;
- the **hero frame**, where it is biggest and most complete. The user's rule: draw every object from the frame where it is biggest and shows the most detail.

Sources:
- a reference video: `kit.py compare <film> <video> --shots` (sheets every 0.25 s with times, its cuts; `remake.md`), then `--every 0.5`
  once the film exists;
- the user's artwork: their files in `01_Brief\`.

**Ask for the best source** before measuring. A still exported from the original project, a 4K or PNG master, or the least compressed
file (a lossless QuickTime Animation master lets every time and colour be measured on it):
- a 1080p H.264 frame has soft, colour-bled edges;
- details under ~2 px (small text, hair highlights, thin lines) cannot be measured on it.

**List the film's gestures, not only its poses:** from the shot table, every pose AND gesture each character makes (the close-up's two
palms rising one after the other, a knee bending on landing). The parts of a puppet come from this list, not from one hero frame
(a close-up given ONE `hands` part cannot raise its palms apart as in the master).

## 3. The cast on the library rig
The library rig is `engine\vendor\libs\aimk\rig.js`, `window.AIMK_RIG`. For a free design or generic people. In a rebuild from a video
the film's own redrawn characters come first (section 5): the library rig is not trusted by default there (it may not
match the reference).
- **Where:** define the film's looks in its own cast preset, `presets\cast\<name>\preset.js`. Its build does nothing:
  ```js
  AIMK_RIG.LOOK.anna = AIMK_RIG.look("woman", { shirt: "#2F9E8F", skirt: "#24324F", hairStyle: "bun", heads: 1.1, legLen: 1.05 });
  AIMK.preset("cast/team", { params: {}, build() {} });
  ```
  `kit.py build` adds the rig to the film when any preset uses `AIMK_RIG`.
- **Look options** (every one optional; the named looks `man`, `woman`, `boy`, `girl` are starting points only):
  - body: `heads` (head size), `torsoW`, `torsoLen`, `armLen`, `legLen`, `legScale`, `shinScale`, `limbW`, `bodyScale`, `kid`, `female`;
  - top: `sleeve` (short / rolled / long / none), `collarStyle`, `hem`, `hemBand`, `plaid`, `stripe`, `pattern`;
  - bottom: `pants`, `shorts`, `skirt` (pencil), `dress`, `heels`;
  - head: `hairStyle` (short, swoop, quiff, kid, long, bun, ponytail, pigtails, curly, bald), `face` (angular / oval / round), `beard`, `glasses`, `nose`;
  - style: `outline: {c, w}` (line art), `shade` (far limbs darker).

  The full list is in the rig file's header.
- **Measure on the reference, never guess:**
  - height in heads, shoulder width, where the hem falls, leg length, forearm thickness, hand size;
  - the palette: the flat colours sampled on the lossless hero frame;
  - kids are a canon of their own: big heads, short sturdy legs.
- **Faces:**
  - Expressions: `smile`, `happy`, `laugh`, `joy`, `surprised`, `excited`, `neutral`, `content`, `proud`.
  - Blink: a lid shown for 0.1 s. Talk: the mouth flaps.
  - Every person on screen longer than a second gets an expression that fits the beat, blinks, and a talking mouth when speaking (no frozen faces).
- **Hands:** the variants are `rel`, `open`, `fist`, `point`, `grip`, `flat`. A hand that fills the frame is `AIMK_RIG.giantHand` (3-segment fingers, poses `flat`, `rest`, `spread`, `cup`, `grab`, `fist`, `point`, `pinch`).

## 4. The sheets: `kit.py sheet <film> [--looks a,b] [--poses p,q]`
- **What it makes:** one scene per look of the cast (`presets\cast\**`). The character is big and acts through every pose, changing expression and blinking. Beside it are every pose small and still, the expression set and the hand set.
- **Output:** `02_Assets\Stills\sheet\sheet.mp4` plus `<look>_poses.png`, which shows every pose at 2x so joints, fingers and feet can be checked.
- **Poses:** the default is the stress set (`AIMK_RIG.STRESS`: stand, arms up / out, cheer, wave, flex, point, present, crossed, hands on hips, think, walk, run, crouch, jump, kick, sit side, sit at a desk). Add the film's own poses with `--poses` (or `AIMK_RIG.POSE.<name> = {...}` in the cast preset).
- **Check before showing:** look at the 2x stills yourself first. Fix a joint that opens, a hand drawn backwards, or a foot through the floor, then show the user the video and the stills in one message and wait.
- **Show the GESTURES the film needs**, not only rest poses (section 2): a sheet that shows them catches a missing part before the film is built.
- **Publish the round** before that message: `kit.py round <film> assets characters=<…_poses.png> characters=<sheet.mp4> locations=<…> props=<…> --note "..."`
  (no file: the `kit.py sheet` outputs as characters). It goes to `02_Assets\Rounds\Assets_R<k>\` (reviewed in the chat, not the player); open your
  message with the line it prints. A redrawn sheet after the user's notes is a new round (the old one stays to compare).
- Crossed arms need the far arm in front: `person(..., { farFront: true })`.

## 5. Redraw characters, props and locations (never trace)
`kit.py trace` is gone. In testing, three rounds of traced characters each showed new defects (9 kinds: holes where a part
was covered in its frame, colours glued across objects, lost thin lines, wobbly edges), found by the USER. Redrawn the way below, the cast
had no hole or cut in any pose on the first round, and the sets and props were right on the first try. Why trace fails: a frame shows only
what is visible; every part loses what another part covers, and animation reveals it; filling it afterwards is guessing.

**The method (as the helpers did it; repeat it):**
1. **Measure first, on the lossless master:** per-frame change for cuts, moves and subtitle times; one hero frame per shot (+ clean
   plates without people); the shot table and a motion spec per part with measured times. The master wins over any note.
2. **Design each puppet from the gestures the film needs** (section 2): the parts, parents, pivots, draw order, face spots.
3. **Write the drawing as a SPEC in code, per part, per layer:**
   - MEASURED fields: the pixels of one flat colour of the hero frame inside a region box given to that part by hand (the visible outline
     is measured on the frame: a measured redraw, not a free drawing);
   - ADDED shapes for everything the frame hides: the body under the sleeves, the far shoulder behind the body, a forearm's rounded end
     inside its sleeve, the thigh under a paper, legs behind a table, half a body behind a panel;
   - CUTS: each child part ends INSIDE its parent with a rounded end, so no gap opens when it turns; add a part when the drawing needs one
     (a `collar` in front of the neck, so a head tilt never shows the neck's edge).
4. **Contours → few smooth Bézier curves** (straight where straight), exact flat colours sampled from the frame, written in the puppet
   format below (one file per puppet). Face features as their own small paths at the measured spots (blink lids, talking mouths on top).
5. **Prove it before anyone looks:** `kit.py sheet <film> --puppets [a,b] [--hero <picture | video@seconds>]` (put the film's gestures in
   `AIMK_ART[name].poses = {pose: {part: degrees}}` first):
   - `<name>_hero.png`: at rest drawn at its origin over the hero frame + a difference picture (reached in testing: mean difference 0.4 -
     0.6, edges within 1 - 2 px);
   - `<name>_parts.png`: every part ALONE on a checker (exploded view), its pivot marked;
   - `<name>_poses.png`: the puppet ALONE on #00FF00 at rest, in its own poses and every part turned ±30°, each against the rest pose:
     new holes (inside a part or between a part and its parent), loose pieces, gaps that open beside a joint (an OPEN notch at an outer
     edge counts), boxed red; a "ring" (limbs closing a loop, crossed legs) is listed, not a problem; the see-through areas at rest must
     be in the master too (`PUPPETS.md`).
   `kit.py round <film> assets` refuses the round while the puppets are unchecked since their last change, or have holes or loose pieces
   (`--force` only when you looked and they are meant: say why in `--note`). Still look at 2x crops of every joint in every pose (the hip
   in the raised-arm pose too, not only elbows and hands).
6. **Sets and props the same way** (measured plates → vector code), then 1:1 context sheets (people in their sets at the hero positions)
   before animating.

Result: not 100 % the original (a few px, simpler hands, approximate gestures), but no broken line and no hole, first round.

**A style reference (the default for drawn or acted content: followed for its style, not copied 1:1):** the same method
without the measuring. Design the characters, sets and props yourself in the reference's art style (`01_Brief\style_guide.md`: palette,
line, shape language, proportions), from the gestures YOUR storyboard needs; steps 3 (whole parts, hidden parts drawn in, children ending
inside their parents), 4 and 5 hold (`kit.py sheet --puppets`, without `--hero`), and so does the asset gate. Much lighter than a copy:
no frame-by-frame measuring, no pixel match, no seams on a master.

**A textured style** (watercolour, gouache, crayon, pencil, paint): the puppets stay flat vector fills; the texture comes from the hand
pack around them (`hand/paper`, `hand/pencil-draw` brush lines, `hand/watercolor` washes, `hand/boil`; `recipes.md` section 5), so paint
bleeding inside a character's own shapes is approximated, not matched. Say so BEFORE any work, with the time and token cost (section 0);
the style guide names the texture as it will be built.

**The puppet format** (the kit's runtime; films before 11/10/2026 use the old names `window.AIMK_TRACED`, `presets\traced\`,
`AIMK_RIG.traced`, which still work): `presets\drawn\<name>\preset.js` holds
```js
(window.AIMK_ART = window.AIMK_ART || {})["cand"] = { origin: [x, y], box: [x, y, w, h],          // box around (0,0) = the origin
  layers: [{ c: "#hex", d: "M... Z" }],                                                           // a still drawing: art()
  parts: [{ name: "torso", parent: "", pivot: [x, y], box: [x, y, w, h], behind: false, layers: [...] }, ...] };   // a puppet
```
`kit.py build` adds every `presets\drawn\*` to the film when a preset draws one by code. `AIMK_RIG.art(name, id, x, y, {scale, rot, flip,
colors, split})` draws a still one; `AIMK_RIG.puppet(name, id, x, y, {pose})` a puppet (joint ids `<id>_<part>`), animated with
`M.pose(id, t, {part: degrees})`.

- **Never cut** pieces of the reference video into the film. The user rejected it: ragged edges, holes, lost faces, straight cuts.
- **Physics:** for each prop, note its drop, squash and bounce from the reference frames, its shadow, and its layer order against the characters.

## 6. Animation (`const M = AIMK_RIG.anim(tl, p.at)`, local times)
- **Calls:** `M.to(id, t, props, d, ease)`, `M.init(id, props)` (the starting state, never a set at 0), `M.pose(person, t, "wave" | {joints}, d)`,
  `M.expr`, `M.blink` / `M.blinks`, `M.talk`, `M.hand`, `M.walk(person, t0, t1, {dx})`, `M.gpose(giantHand, t, "grab")`, `M.pop`, `M.squash`.
- **Explicit tweens:** every call writes an explicit fromTo from the tracked state. One owner per property at a time; the build warns "overlap shortened".
- **Collisions and physics:** anything that lands squashes and settles, and what it hits reacts. Nothing floats.
- **Camera:** a key starts at `t` and arrives at `t + d`. Measure the reference camera on native frames: `kit.py compare <film> <ref> --follow x,y,w,h` on 2-3 landmarks.
- **Motion blur:** measure the reference first (the test film had none on fast moves). `MP4 Export` asks for Blur when it is wanted.

## 7. A rebuild from a video
Read, swap, measure and review as in `remake.md` (`kit.py compare --shots`, `--follow`, the compare loop, `--split`); this file
adds the cast, the sheets and the asset gate. Notes: `kit.py feedback <film>` gives the user's open notes only.

## 8. Helpers and tokens (fewer tokens and less time, never at the cost of quality)
- **Where the tokens go:** 98 % are cache reads. Every tool call re-reads the whole chat. Cost grows with calls × context length.
- **Ways to cut it:**
  - do the gates in section 1 (no rework rounds);
  - batch checks into one command (`compare`, `sheet`);
  - give heavy visual review to a fresh helper and read its summary.
- **Long films:** `workflow/long-film.md`.
  - One helper per scene group of about 15-25 s.
  - Each helper works on its own copy of the film with the frozen cast.
  - Each helper gets a brief with the user's words, the numbered differences with times, its file rules and the exact commands.
  - Helpers report library gaps. They never patch the cast.
- **Model:** use **Sonnet 5.5** (Agent `model: "sonnet"`) for mechanical passes: renaming stills, building or reading compare sheets, lint and syntax checks, copying a fix across scenes. Keep design, drawing judgement and review on Opus.
- **Files:** a helper writes a file only whole. A usage-limit stop in the middle of a rewrite left half-done presets in the test.

## 9. After Effects
- **Shape layers:** rig parts and drawn art are plain vector SVGs. Port to AE makes each one a native **shape layer**: Bézier paths, fills with their fill rule, strokes.
- **Swaps:** expression, hand and blink swaps become hold keys on the shape groups' opacity. Joints stay layer transforms in precomps.
- **Still pictures:** an SVG with clip paths, masks, gradients, filters or text inside stays a picture, as before.
