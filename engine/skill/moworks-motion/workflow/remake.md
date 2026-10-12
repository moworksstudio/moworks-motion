# Remake: a finished video copied for another brand, or rebuilt 1:1

For "remake this video", "copy it y chang / 1:1", "the same film for our brand", or a film to rebuild when only its video exists, decided shot by shot: BUILT content (type, shapes, UI, icons, pictogram people, photos, footage, transitions) may be
copied closely when the user wants a copy (never 100 %). DRAWN or ACTED content (people, animals, rigged or frame-by-frame acting,
detailed illustration, effects drawn frame by frame) is a STYLE reference by default (`free-design.md`, "Style reference"): drawn anew
in its style; copied 1:1 only when the user asks in so many words, and then a heavy job: say its cost first (`characters.md` section 0).
In a mixed film the built shots are copied and the drawn shots redrawn in the style.
The reference video is the storyboard: layout, sizes, timing, easing, camera, cuts, blur and rhythm are copied; only the content is
swapped. Character or illustration content (people, hands, cartoon props) also follows `characters.md` (its asset gate holds). The
method comes from the origin skill's remake mode (howseen-ai/claude-motion-design, MIT) and the kit's 2D rebuild test.

## 1. Read the reference (no building yet)
1. Ask for the best file: the original export or the least compressed copy (a social re-upload has soft edges and dropped frames).
   It goes in `01_Brief\Reference\`.
2. `kit.py compare <film> <ref> --shots`: every native frame read once.
   - Hard cuts, from the frame difference. They are candidates: a whip or a flash can look like one. Most changes in a modern launch film
     are continuous moves or morphs, so expect few real cuts.
   - Sheets every 0.25 s with time and frame number, cuts in red, and one strip per cut → `02_Assets\Stills\shots\`. Read them all.
   - `01_Brief\SHOTS.md`: one row per shot with start, end, frames and length.
   - The reference's sound → `01_Brief\ref\<name>.wav`. Analysis only, never in the film.
3. `kit.py beats <film> 01_Brief/ref/<name>.wav`: its tempo, bars, drop and hits. The hits are where its sound effects land.
4. Fill `SHOTS.md`. Split a long shot into beats wherever the picture changes state.
   - **REF shows:** layout, sizes, what moves and how.
   - **Swap:** what the client's version shows instead.
   - **Notes:** camera, easing, blur, cursor, typing cadence.

## 2. The gate: SHOTS.md + the swap rules
The filled `SHOTS.md` is this job's motion spec. Paste it in the chat with the swap rules and wait for the user's OK, as for any film
(`SKILL.md` step 4). A character film also needs its asset sheets approved (`characters.md`). The swap rules, adjusted per job:
- **Brand:** the old brand's logo, colours, fonts and copy become the client's. The client's logo follows the brand rules (never animated
  or distorted). Where the reference animates its logo, the motion moves to a shape or container around the client's logo.
  - A swap makes problems of its own: an OPEN-outline logo (letters or a frame with no fill) shows what is behind
    it where the old one was a solid banner (the CV showed through): give it its own backing or move what is behind; a move that warps
    or squashes the frame (a zoom-through, a 3D turn) fades the logo out BEFORE the warp, never distorts it.
- **No reference people:** no photos, faces or voices from the reference. Use the client's own pictures, shapes, cards or icons of the same size
  and motion.
- **No reference sound:** never its music, voice or sound effects (section 4).
- **True copy:** every claim true for the client. Illustrative numbers are labelled "Example"; no invented features.
- **No implied partnership:** never a co-mark like "OpenAI × Client" unless it is real.

## 3. Build, measured, never guessed
- **Scenes = shots.** Each scene starts at its shot's exact time (frame ÷ the reference's fps). Ids carry the shot number (`s07`).
- **Measure each move.** Run `kit.py compare <film> <ref> --follow x,y,w,h --from a --to b` on one element at a time, with a tight box on a plain
  background (`--color #hex` for a coloured element). It gives, in film px:
  - every move's start and end time;
  - the centre, scale and cover from → to;
  - the 3 closest GSAP eases, and any overshoot (back.out or a spring).

  Use those numbers in the motion. For a camera move, follow 2-3 landmarks.
- **Text:** measure the reference's text sizes on the sheets and fit the client's words with `kit.py measure`. A longer word changes
  the width, and that is the only allowed difference: report each one.
- **Long films:** use helpers per contiguous shot group (`long-film.md`).
  - **A seam is the reference's frame AT the seam time**, measured, never the end of a move (e.g. a 19.48 s seam written as the
    end framing of a push that runs to 19.76 s; the part before it had to squeeze the curve and landed 2-3 frames early). Never end a part
    on a move: cut the parts where the picture holds, or split the move between the two parts on the reference's own curve.
  - Each helper gets its rows of SHOTS.md, the swap rules, its part file and the exact commands.
  - Helpers verify with `compare --from/--to` on their own shots.
  - Helpers never edit the shared parts.

## 4. Sound
- **Music:** pick a royalty-free track (the 3 Mixkit options, `film.md`) at about the reference's tempo, or ElevenLabs (paid: ask).
  - Fit it to the reference's tempo with `kit.py beats <film> <track> --to-bpm <reference BPM>`. Pitch is kept. Over 8 % the stretch is heard.
  - Line up the drops: play the track as an `"audio"` clip with `"trim"` = its drop time minus the reference's drop time.
- **Sound effects:** the kit's library, placed by their peak on the reference's hit times (`beats` hits).
- **Voice:** a new voice-over (ElevenLabs, paid: ask) in the reference's voice slots, with the client's script.

## 5. Review loop
1. Each round, run `kit.py compare <film> <ref> --every 0.5` (`--old-colors "#hex,..."` for the old brand's colours). It makes the
   sheets and `compare.md` with the most different times first. Fix from the top.
2. Time with native frames (`--every` 1/fps around a cut or a fast move): a 0.5 s sample can hide one frame.
3. **Acceptance bar:**
   - positions and sizes within about 1-2 % of the frame;
   - cuts on the same frame;
   - the same easing feel;
   - differences only where the swap forces them.

   The round report is a table: shot · times · MATCH / CLOSE / ROUGH · what still differs.
4. When the user wants to watch them together, run `kit.py compare <film> <ref> --split`. It uses the newest MP4 export and gives
   "original | remake" side by side in one video, in `02_Assets\Compare\`. The same video is the usual "original vs remake" post.
   Credit the original brand, and claim no speed or effort that is not true.
5. Rounds, notes and exports work as for any film (`film.md`).
