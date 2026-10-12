# How a film is made

## Project
`python engine\kit.py new "<Client> <Project name>" --aspect 16:9 --dir "<job folder>"` (9:16, 1:1, 4:5 also) creates
`<job folder>\NN_Client_Project-Name\` (numbered, ASCII), called `<film>` in this skill; the job folder is the chat's folder. Inside
(a folder appears only when something goes in it):
```
<film>\  1. Preview.bat   the player (its Export panel does the rest); finds the kit through %USERPROFILE%\.aimotionkit\kit-root.txt
  01_Brief\     the brief, lyrics, guideline links, the user's words AND the user's original files (PSD, deck, images, logos,
                fonts, music, voice, video: copy them here, never edit them); LYRICS-TIMED.md / POSES.md for the user to check
  02_Assets\    what you make for review: Rounds\ Storyboard_R01\ Assets_R01\ Film_v01\ ... (every round the
                user reviewed, one folder each, numbered per kind), Stills\, Compare\, Music-Options\
  03_HTML\      the film: film.json, index.html, assets\ (the film's own copies), audio\, presets\, psd\ / deck\ (intake data),
                notes\ (NOTES, MOTION-SPEC, feedback, RECAP-SESSION), qa\
  04_Renders\   MP4\ MOV\ + EXPORTS.md only, made on the first export; names carry the version (<film>_v3_60fps_...)
  05_AE\        Port to AE (outside 04_Renders): <name>.aep, footage\, Audio\ (mix.wav + the stems), AE-PORT.md
```
Every `kit.py` command takes `<film>` (or its `03_HTML`). Write the brief and decisions into `03_HTML\notes\NOTES.md`. An older film
(`brief\`, `renders\` inside one folder) still works as it is; a film made before 11/10/2026 (rounds and stills in
`04_Renders\`, the user's files in `02_Assets\`) works too: `kit.py tidy <film>` moves it to this layout. **60 fps only** (smooth motion; no 30 fps option anywhere).
Scene starts snap to the 60 fps grid (8.52 s starts at 8.5167 s): code that computes a local time from a scene start uses
`Math.round(start * 60) / 60`, never the written number (it can be 3 ms off).

**Rounds (never overwrite; every round announced in the chat and shown in the player; every round in one folder):** a round is one thing you send the user to
review. Publish it the moment you send it, then say the line the command prints, as the FIRST line of your message:
| You send | Command | Folder |
|---|---|---|
| the storyboard options | `kit.py round <film> storyboard [A B C] --note "<what they are>"` | `02_Assets\Rounds\Storyboard_R<k>\` (A.png, B.png...) |
| character / location / prop sheets | `kit.py round <film> assets characters=<f> locations=<f> props=<f> --note "..."` (no file: the `kit.py sheet` outputs) | `Assets_R<k>\<kind>\` |
| the film (first preview, every round of fixes) | `kit.py round <film> film --note "<what this round changed>"` | `Film_v<kk>\` (film + the assets / audio new in it) |
It prints e.g. `Phim v3: chữ vào chậm hơn, cảnh 4 đổi nền`. Design rounds (storyboard, sheets) are reviewed IN THE CHAT: show
the pictures there (lean flow: the player is the video, the notes and the exports only). The player lists every film
version (the user watches an older one read-only, compares it with the one before, and its notes carry the version: `[v2 · 3.40 s] ...`)
and reloads the working film by itself when it changes. Nothing new when the film did not change. Every export also publishes the
version it shows (vN in its file name). **Going back:** the user's words "quay lại vK" (or an old note `[vK · 0.00 s] Sửa tiếp từ bản
này`): `kit.py restore <film> vK` (the working film is kept as a round first), fix the other notes, then
`kit.py round <film> film --base vK --note "..."` and say `Phim vM (sửa tiếp từ vK)`. Say it too when you switch rounds yourself.
**Rounds are kept, all of them** (they are light): never delete,
trash or offer to remove a round (storyboard, asset sheets, film versions), not even a rejected one; only the user removes one by hand in
Explorer, and the next round still takes the next free number.

**Playback that stutters in the player** (a heavy film on a laptop: many SVG parts, text laid out every frame; the 2D rebuild test's 76 s):
the export renders frame by frame and is smooth whatever the player shows. Tell the user about the player's **Phát mượt** button (S): it
renders a small copy once (a few minutes, a job with its progress in the log) and plays it while the film runs; stopped or scrubbed, the
live film shows, so notes still land on the exact frame. After a rebuild the button says the copy is old.

**Another aspect of the same film** (16:9 → 9:16 / 1:1 / 4:5 for social): when the film is approved, `kit.py reframe <project> 9:16`
makes a NEW film next to it (every element and all content kept; a taller frame gets "auto stack"; built, one still per scene). Look at
every scene and re-compose what reads badly, never crop; check motion distances; then `kit.py reframe <new film> check`. The whole
procedure: `workflow/reframe.md`.

## film.json (MotionSpec) → `kit.py build <project>` → index.html
```json
{ "spec": "aimk-motionspec/0", "title": "...", "size": [1920, 1080], "brand": null | "<pack>", "background": "#ffffff",
  "fonts": [ { "family": "Client Sans", "src": "assets/fonts/ClientSans-Bold.ttf", "weight": "700", "style": "normal" } ],
  "css": ".kicker { font: 600 44px 'Client Sans'; letter-spacing: 0.02em }",
  "song": { "src": "audio/music/song.wav", "at": 0 },
  "layers": [ { "id": "Lprod", "z": "above", "from": 0, "to": { "lyric": "Thank you" }, "elements": [ ... ], "motion": [ ... ] } ],
  "scenes": [ { "id": "s1", "name": "Title", "duration": 3.5 | "auto" | { "beats": 8 }, "until": { "downbeat": 5 }, "hold": 1.5, "bg": "#fff",
      "transition_in": { "preset": "transition/push", "duration": 0.6, "align": "end" | "center" },
      "elements": [ { "id": "h1", "type": "text" | "image" | "box" | "group", "text": "...", "src": "assets/images/a.png", "class": "title",
                      "style": { "left": "120px", "top": "300px", "font-size": "96px" }, "attrs": { "data-lint": "ignore" } } ],
      "motion": [ { "preset": "text/mask-rise", "target": "h1" | ["a", "b"], "at": 0.3 | { "beat": 12 }, "params": { "duration": 0.8 } } ] } ],
  "sfx": [ { "at": { "hit": 3 }, "name": "thump" } ],
  "brand_colors": ["#FF5A36"],
  "end_tag": { "logo": "assets/logos/end.svg", "bg": "#000", "width": 0.3, "duration": 1.5 } }
```
- `"duration": "auto"` = last motion + `hold`. Reading time: a text stays at least 0.5 s + 0.3 s per word before it moves (a two-word title
  1.1 s, ten words 3.5 s; the lint warns under it); during a long hold a 2 % push keeps the frame alive while the words stay put. The
  user's timing words win. Sung lyrics follow the song instead; a claim or a number (a screen size, a brightness) still gets its reading
  time, across beats if needed.
- **`"checks"`: the motion spec's numbers, read on the built film** (every build's lint prints "checks: n/n as planned" and warns on each
  miss): `[{ "at": 2.5 | { "beat": 8 }, "el": "logo", "expect": { "opacity": [">=", 0.99], "x": ["~", 960], "visible": true, "text": "..." },
  "say": "logo lands" }]` (x / y = the element's centre on the stage, ~ = within 2 px). Write one per landing, label or hit the spec names.
- **`"layers"`: elements that live across scenes** (one product through the whole film, a credit line, a logo bug). A full-frame layer
  above (`"z": "above"`) or below every scene, shown from `"from"` to `"to"` (default: until the end tag starts, so never on the end tag);
  its motion `"at"` are FILM seconds (or references); scene transitions do not move it. Never copy one element into every scene.
- **`"type": "group"`: a row or column the browser lays out** (`"layout": "row" | "column"`, `"gap"`, `"align"`, `"justify"`, `"center": true`
  fills the frame and centres the whole group, `"children": [elements]`). Use it to centre a text block and a product shot as ONE unit
  (so the pair reads as one centred unit, measured by the browser). Widths for a script: `kit.py measure "<text>" --font "<family>" --size 140 --weight 700`.
- **`"css"`**: the film's own classes, written once (a string, or a list of css files in assets).
- **`"brand_colors"`**: the brand pack's campaign / product colours used on montage words (a pack that limits coloured type); `brand-check` accepts
  only colours of the pack there, and checks backgrounds and text clusters too.
- **Audio** (files in `audio\voice|music|sfx\`: the user's, or generated with ElevenLabs when the user asks or agrees, rule 9):
  - per scene `"voice": { "src": "audio/voice/S01.wav", "at": 0.3, "volume": 1, "tail": 0.6, "text": "the script line" }`: an `"auto"` scene
    lasts until the voice ends + tail. **Generate:** `kit.py voice <project> [--voice <name>] [--lang vi]` lists every line with a `"text"`
    and no file yet and the credits; tell the user, then `--yes`. Then `kit.py transcribe`.
  - film-wide `"audio": [ { "id": "music", "src": "audio/music/bed.wav", "at": 0, "trim": 0, "role": "music" } ]` (role voice | music | sfx).
    Music plays the v1 way: looped with a 3 s crossfade, 0.15 s fade in, down to 25 % while a voice speaks, last 1.8 s faded out, volume 0.6
    under a voice (`"volume"`, `"loop": false`, `"duck": false`, `"raw": true`).
    **`"carve": true`** (or a strength 0..1; true = 0.8) on the music clip instead dips the bed only in the bands the voice uses, following
    the speech, plus a level match (HyperFrames' voiceover carve, run as shipped; needs Node.js, else it falls back to the 25 % duck and says
    so). The build prints the bands and the level floor. Off by default: offer it when a voice fights the music; a lower strength (0.4-0.6)
    keeps more of the bed. Judging a mix you cannot hear: compare inside the same file (the bed under speech vs the bed in the gaps, one
    voice line vs another), never one voice's spectrum against an idea of "normal": every voice has peaks and dips the size of a defect.
    Generate: `kit.py music <project> "<prompt>" --length 30
    [--instrumental]` (cost first, then `--yes`; it runs `kit.py beats` on the result). A sound effect file: `kit.py sfx-gen <project>
    "<description>" --length 1.5`, used as an `"audio"` clip with `"role": "sfx"`.
  - **Hits and the phone** (the light comes before the sound): a sound effect's attack (a whoosh / riser: the top of its swell) lands ONE
    frame after its picture (the kit places the library's so; place an `"audio"` sfx file by its peak, not its start). The picture must
    work muted first: the feed plays without sound.
  - **The sound pass** (you cannot hear: measure every step, never go by feel):
    1. Licensed music only: the user's track, a Mixkit track (below) or `kit.py music`; note the source and licence in `notes\NOTES.md`.
       Never music or sound effects synthesised in code.
    2. `kit.py beats`: read its **kick check** (the waveform under 120 Hz against the grid) and LOOK at its picture
       (`02_Assets\Stills\beats\<track>_kick.png`): kicks on the solid lines. Kicks on the dotted lines = the grid is half a beat off:
       `--offset <first beat + half a beat>`.
    3. Big moves (cuts, titles landing) on the beat. The animation cannot change (a kept design, an approved film)? Move where the music
       starts instead: `kit.py beats <film> --fit` (rewrites the music clip's `"trim"`), build again.
    4. One ready-made sound for every cut and big move, from the kit's library: a whoosh for movement, pop for things appearing, click for
       clicks, typing for typing. `kit.py loudness` lists the cuts with no sound.
    5. The voice is the loudest thing, the music drops under it, the effects sit above the music: the build sets every effect's level so
       (measured on the bed under it: about 4 dB over the music, at least 2 dB under a voice; `"gain"` moves it, 0.5 = that level, 1 =
       +6 dB). The master: about **-16 LUFS, true peaks under -4 dBTP** (no clipping after AAC or on a phone speaker in mono; film.json
       `"loudness": -14` only when the client asks for a louder master).
    6. After MP4 Export: `kit.py loudness <film>` measures the EXPORTED MP4 (and its mono fold-down), every effect over the music and
       against the voice, the cuts with no sound, and writes the cue sheet (`02_Assets\Stills\audio\cues_*.png`: the frame before / after
       each cue + the waveform): look at every page. Then give the user the **five timestamps it prints to check with headphones**.
       Never tell the user the sound is good: you have not heard it.
  - **No music given and no generation wanted**: pick 3 free tracks from Mixkit (mixkit.co, Mixkit Stock Music Free Licence: say
    so) that fit the brief and **download all three at once, without asking** (so the user
    can listen before choosing; free, a few MB) into `<film>\02_Assets\Music-Options\` as `A - <Title> (<Artist>).mp3`,
    `B - ...`, `C - ...`: `curl -L --max-time 90 -o "<file>" https://assets.mixkit.co/music/<id>/<id>.mp3` (curl without a time
    limit can hang for minutes; a track that fails: take another and say so). Then a table in chat: A / B / C · title · artist · length ·
    mood · why it fits · the file's full path (double-click to listen) · its Mixkit page. The user listens and picks; the pick is copied to
    `03_HTML\audio\music\`, its licence line goes into `notes\NOTES.md`, the other two stay in `Music-Options\` (the user keeps or bins
    them). A track cut to the film's length (sections joined on bar starts) is a new file in `audio\music\`, the original kept; run
    `kit.py beats` on it. Paid generation (`kit.py music`) still asks first.
  - the kit's sound effects (recorded, HyperFrames' bundled library, free; `engine\vendor\hf-sfx\manifest.json` says what each is for):
    per scene `"sfx": [ { "at": 0.4, "name": "pop" } ]` or film-level `"sfx"` at film times. Names: whoosh, whoosh-short,
    whoosh-cinematic (a 2.5 s build, its swell on the cut), riser (its swell on the reveal), pop, click, click-soft, key-press, typing,
    sparkle, chime, ping, notification, error, glitch-1 / -2 / -3, impact-bass-1 / -2; older names still work (swoosh, tick, tickhi,
    thump, impact, glitch). Put them on the motion. Nothing plays on or after the end tag.
  - The player plays it all (M mutes); MOV and MP4 carry the mix inside; the AE port adds audio layers and writes `05_AE\Audio\`:
    `mix.wav` + the stems (voice, music, sfx) side by side.
- **Motion on the voice's words** (local Whisper): `kit.py transcribe <project> [--lang vi] [--prompt "names"]` →
  `audio\transcript\<file>.words.json`; fix misheard names there (keep the times). Then `"at": { "word": "launch", "n": 2, "edge": "end",
  "offset": -0.1 }` on a motion or sfx; captions: an empty box + `{ "preset": "text/captions", "target": "cap", "params": { "words": "voice" } }`.
  Every build writes `audio\transcript\film.srt`. A cut on a spoken word (`"until": { "word": "..." }`): give the next scene's
  `transition_in` `"align": "center"`, so the transition's middle sits on the word (the previous scene runs d/2 past it, the next starts
  d/2 before it); the default `"end"` puts the whole transition before the cut (every change of picture then comes early).
- **A film cut to a song** (a lyric film, a launch on a track; `workflow/recipes.md`, "Song film"):
  - `kit.py beats <project>` → `audio\transcript\<song>.beats.json` (BPM, beats, bars, hits, onsets). It prints a "tempo check" (the
    candidate tempos with how far the strong onsets sit from each one's grid: e.g. a track read 150 BPM, 7.5 ms, where a plain fit said
    152) and a kick check with its picture (the sound pass, step 2: a tracker can lock onto the off-beat, a whole grid 0.22 s off). Say
    the BPM so the user can check it by ear (`--bpm`, `--offset` to correct).
  - The lyrics are known (the user's text): `kit.py align <project> 01_Brief\lyrics.txt [--pin "8=17.58; 12=33.32"]` → a time per sung word +
    `01_Brief\LYRICS-TIMED.md` for the user. Heard words move 80 ms earlier (Whisper's lag). It is a DRAFT (on the A/B song, by sections:
    median 0.42 s off the times the user liked): show the table; the user taps line starts in the player's lyric mode (or `--pin`), run
    align again (`--snap 8` then puts the words on the song's eighths; on a raw draft snapping made it worse), and their ear wins. The brief gives rough times per section (a script table)? Mark them in
    the lyrics file (`[17.5] We walk on together` before a line) or `--sections "1=0; 8=17.5; 11=29.6"`: each section is then heard
    in its own window, with only its own lines (a whole-song pass once placed lines 11-19 twenty seconds early).
    Unheard words are placed inside their own section; a run of the same word ("la la la...", sung over a held synth) goes on
    consecutive beats (a test song: the repeated word landed exactly where a hand placement put it). What Whisper heard is cached, so a second
    run after the user's taps takes about a second: run it again freely.
  - To SEE the voice: `kit.py spectro <project> [--from 17 --to 26]` → the vocal band over time with the beat grid and the aligned words
    (`02_Assets\Stills\spectro\`): where a word starts that Whisper missed, a held note, an ad-lib under the synth.
  - `"song": { "src": ..., "at": 0 }` plays it as it is. References instead of seconds, wherever a time goes: `{ "beat": 16 }`,
    `{ "downbeat": 4 }`, `{ "hit": 3 }` (counted from 1), `{ "lyric": "together", "n": 2, "line": 10, "edge": "end" }`, `{ "t": 12.5 }`,
    each with `"offset"`. A motion "at" that is a reference is a film time; a scene ends on `"until": <reference>` or lasts
    `"duration": { "beats": 8 }`; `"params": { "words": "song" }` gives text/captions the song's words in that scene.
- **A pre-rendered 3D product (PNG / WebP sequence):** `motion/image-sequence` in a film-level layer: `keys` [[t, frame]] play the render's own
  motion at an even cadence (1, 2 or 3 render frames per film frame) and hold only on its rest poses (frames that barely change: find them);
  `pos` / `float` / `sway` move the box as functions of time; `sweep` draws a light band over the product on a turn. Never blend two frames
  (the user saw "ghost blur"). Big sequences: convert to WebP at the size used (1200 px wide was enough for 1080p) to decode fast, and give
  the preset `"source"`: the client's original files (`"source": "J:/.../Product_Render.####.png"`), so the AE port imports those at full
  size. **Read the render first:** `kit.py poses <project> <folder>` → a numbered contact sheet + `01_Brief\POSES.md` (its rest poses found
  by frame difference); fill in for every rest pose: open / closed, front / back / edge, and **which way up** (where the camera is). A pose
  seen upside down (camera at the bottom) is only passed through, never held (a back view held upside down reads wrong).
  It also prints the **portals**: rest poses that show the same picture (a test render had 1 = 97-136 = 210-240 and 312-347 = 491-531 =
  628-641): a jump from one to the other is invisible, so one phone can run continuously through every pose of the film. And the
  **product box** of every frame (the opaque part, as fractions of the picture: `qa\seq-boxes.json`; POSES.md gives it per rest pose with
  the widest and narrowest frames): text standing next to a turning product is placed by the widest pose of that turn, or moves with it.
  `window.__aimkSeekWaits` (a list of promises the renderer, player and collide wait for after every seek) is how a film code block holds a
  frame until its picture is decoded: push `img.decode()` there.
- **Cut-outs:** `kit.py cutout <project> <image> [--people] [--trim]` → `assets\images\cutout\<name>.png`.
- `motion` runs in order; a later entry may target elements an earlier block created (ids are in the built `index.html`).
- The build writes every tween as a literal line in `index.html` (old file backed up to `qa\backup\`). After the first build `index.html` is
  the source: small edits there are fine; rebuilding from film.json replaces them (backup kept), so say so before you rebuild.
- Default font: Roboto Flex (`RFlex`). Client fonts in `assets\fonts\` + `"fonts"`; check Vietnamese with `kit.py font <family>`.

## Creative first; the libraries are a toolbox
**Design the film first, then open the library.** First decide, for THIS film:
- the look: palette, type scale, grid, texture (a guideline: its design rules);
- every scene's composition;
- the motion language and its **dynamic level**, and the **groove** only when the user wants one (both asked at row 0 of the motion spec: below);
- ideas from `workflow/recipes.md` if they help (energy / young, premium product, UI morph, song film, hand-drawn): ideas, not rules.

(Keep design: the client's frames fix the layout, the motion is yours.) Then use the library only where it saves real work: chart / counter
/ map engines, device and app chrome, code windows, 3D, captions, image sequences, springs, a transition you would write the same way.

**Free by default: validate, don't constrain** (in an A/B test the plain-prompt film, with no library and no rules,
scored 55 / 70 against a rule-heavy skill's 46: motion 9, sync 9, layout 8). Locked are only: the client's layout in
KEEP DESIGN (followed exactly), the guideline's design rules on every piece of text (fonts, sizes, colours, margins), logos (rule 5: never
distorted; a pack may forbid any move), the end tag / end card, the credit line, real content, and what the user asked for by name.
Everything else is free and should be bold: layout (free design), backgrounds, transitions,
stickers, particles, the product's acting, the montage words, big type under the product. Write it as your own code (project presets,
`motion/tween` per word or beat, canvas layers drawn as pure functions of film time, the groove). `brand-check`, `collide`, `verify` and
`pulse` run AFTER you create; they never shape the first idea.

**Composition (the A/B film whose main super and product drifted far left / right / up / down scored 5 for layout, the
one that kept them near the centre 8):** lean the main super and the hero (the product) toward the centre of the frame, as one group where
it fits (`"type": "group"`, `"center": true`, `kit.py measure`). A tendency, not a rule: never force every frame into the middle (a
layout pushed to the centre each time turns stiff); a frame can sit off-centre when it reads and balances better. Secondary things
(stickers, particles, small words) float free.

**Dynamic level (asked at row 0 of the motion spec; recommend strong):** light = elements
settle and hold; strong = nothing on screen is ever still: multi-line supers enter alternately from left and right (±900 px, expo.out),
their lines drift in opposite directions while held and leave both ways; backgrounds drift or zoom, people breathe, stickers float. In KEEP
DESIGN strong means large drifts and slides while a frame holds; the designed place (2 px) binds only when the scene has fully settled
(a first cut that holds the layout too tightly reads "tame").

**The groove (only when the user wants it; asked at row 0; never a default):** elements nudging on the
song's grid. Slow or soft music: no groove. When it is wanted, keep it sparing: backgrounds on the downbeats, the product only on the
montage drops (the repeated chant words), the rest still; `kit.py pulse` only for a film with a groove.
film.json `"groove"` makes elements nudge on the song's grid all film long, each through its own inner layer, so it never fights an
element's entrance (`kit.py build` writes it as one code block; AE gets keyframes). Measured on the A/B film that did it by hand: 0.14 s
after each beat the picture changes 1.4x more than in the second half of the beat; 76 % of the beats give a visible jolt.
The groove is only the pulse ON TOP: it never decides when text appears. Every sung word still enters on its sung time (`kit.py align`
+ the user's taps, `{"lyric": ...}` references, landing ON the word: `recipes.md`, "Song film"); the groove makes it and everything
around it nudge with the kick once it is there.
```json
"groove": { "decay": 0.16, "parts": [
  { "target": ["stk1", "stk2", "stk3"], "on": "beat", "scale": 0.06, "y": -18, "squash": 0.06, "origin": "50% 100%" },
  { "target": ["bubble1", "bubble2"], "on": "beat", "scale": 0.025 },
  { "target": ["dots", "ring1"], "on": "beat", "scale": 0.2 },
  { "target": "hero", "on": { "lyric": "jump", "all": true }, "offset": -0.02, "scale": 0.08 },
  { "target": "hero", "on": "downbeat", "scale": 0.02 } ] }
```
- `"on"`: `beat` · `eighth` · `downbeat` · `hit` · `kick` (the kick drum's own hits from `kit.py beats`: a beat with no kick does not
  pulse, a syncopated kick does; on a test megamix 58 kicks on 114 beats, 3 ms off the grid; a drum-heavy track also counts its toms:
  `beats` prints the number of kicks, and when it is far above the number of beats, use `beat`; a beats.json older than 08/10/2026 has
  none: run `kit.py beats` again) · `word` (every sung word) · a reference (`{"lyric": ...}`, `{"beat": 9}`) · `{"lyric":
  "jump", "all": true}` (every time it is sung) · `{"bpm": 120, "offset": 0.5}` (no song file) · a list of these. Values are the PEAK of a
  pulse: `scale` (0.03 = 3 %), `x` / `y` (px), `squash` (wider and flatter), `rotate` (deg); `decay` (s), `attack` (s, 0.012); `"from"` /
  `"to"` limit it; `"drift": {"y": 7, "x": 0, "rotate": 0.7, "scale": 0, "period": 3.3}` (with `"on": "none"` or with pulses) is an
  always-on slow float. Parts on one target add up: a beat pulse and a word punch on the hero.
- What may groove (when there is one): stickers and icons (a hop with squash), chat bubbles and badges (2-3 %), background dots, rings,
  particles, grids, the hero on its montage words (5-12 %); text while it is read at most about 3 % (rule 2). Never a logo.
- A strong film keeps its always-on layers, big enough to cover the frame: a background pattern or gradient that keeps drifting, 30-60
  particles, a new world every 1.5-3.5 s (a small float alone does not read as "always moving").

**When the brief contradicts itself:** the lyric table wins over the scene table for words and case; the guideline wins on brand items (end
tag, logo, type rules), the brief wins on what the film says; a credit "throughout" stops at the end tag. Write each decision in
`notes\NOTES.md` and say it in the round-1 message.

- **Motion presets** `library\presets\<group>\<name>\`; **layouts** `library\layouts\<group>\<name>\`; HyperFrames items run as shipped
  (params, `replace`, `images`, `theme`, `slots`: `library\README.md`). The carousels (`carousel/*`) take real params now, patched by the
  kit at build: `background` (also `"transparent"`), `cardBg` (`"transparent"` for PNG cards), `scale`, `card` `[width, height]`,
  `duration` (longer = the block slows to fit the scene instead of freezing); use them, never `replace` on their CSS.
- **Read the list once per film:** `python engine\kit.py library` (`kit.py library layout chat` filters), then the chosen presets' `preset.js`.
- **Lines copied from the Gallery** (the COPY button's line: the exact preset name in quotes, e.g. "text/mask-rise", then its title): use exactly that preset.
- **Match by meaning, not by name.** A name the user gives exactly is used as is.

**Who decides what**
| Part of the film | Choose |
|---|---|
| What the user named, described clearly, or pasted from the Gallery | Exactly that |
| Composition, layout and look of every scene | Yours, designed for this film. A library layout is never a whole scene as it ships: restyle it and compose the scene around it |
| Motion: the hero move AND the supporting moves | Written for this film (project presets / `motion/tween` per word or beat): staging, timing on the music or voice, a different technique in each scene. A library preset may be a starting point or a utility |
| Transitions | Designed with the scenes (a shape carried across, a wipe under the product, a match cut); a stock one only where a plain cut is right |

- **Every scene carries at least one move written for this film.**
- **No sameness:** never the same LOOK preset in two scenes; nothing should look like its Gallery demo. Utilities may repeat (the product
  layer, the credit line, captions, counters, springs).
- **Custom motion ports best as DOM / CSS / GSAP:** live layers in AE. Canvas / WebGL / image sequences reach AE as pictures.
- Logos: `SKILL.md` rule 5 (never distorted or given an effect; a pack may forbid any move). Text may take any effect while it reads.
- **A new motion stays in the project:** `<film>\03_HTML\presets\<group>\<name>\preset.js` (same format as the library).
- **The libraries change only when the user asks** (rule 9): a film chat lists its new presets in the handoff (below) for the main chat.
  One exception: the user asks to keep an effect or layout → a clean copy into the Gallery's Incoming section (`kit.py library import`,
  `workflow/library-intake.md`); the user keeps or drops it on the Gallery.
- **Say what you chose:** in the round-1 message, one line per scene: its idea, the moves written for it (marked "new") and the library parts used.

## The numbers (write motion as numbers, not adjectives)
From the "Motion Lab" study (`docs/THIRD-PARTY.md`): every adjective left in a spec is a decision handed to the default look.
- **Easing by role:** entrances ease out (`expo.out` 0.16,1,0.3,1 for text and logo reveals; `power4.out` / quint 0.22,1,0.36,1 for a
  premium entrance); moves across the frame and camera ease in-out (quart 0.76,0,0.24,1; camera the softest: sine / quart); exits ease in
  (`expo.in` 0.7,0,0.84,0) and run 40 to 50 % shorter than their entrance; a playful pop `back.out` (0.34,1.56,0.64,1). Linear only for a
  rotation, a progress bar or a loop's phase: linear on a move is what makes a render look like a render.
- **Springs by damping ratio** (one number across every library: d / (2 * sqrt(k * m))): 1.0 never bounces, 0.7 to 0.85 premium, 0.4 to 0.6
  playful, under 0.3 a cartoon. Position and size may bounce; opacity and colour never (the lint warns).
- **Hierarchy:** one hero move per shot. Secondary moves travel 50 to 70 % as far and start 100 to 200 ms later (or when the hero is 30 to
  50 % done); ambient motion stays under 5 % of the hero's travel, on a slow sine, and never stops. Everything else waits, dims to 40 % or
  holds still.
- **Durations and stagger:** UI feedback 100-200 ms, UI moves 200-500 ms, hero reveals 600-900 ms; letters 1-2 frames apart (30-45 ms),
  words 60-120 ms, list items 40-80 ms; the next one starts when the previous is 30 to 50 % done (all sequential reads robotic, all at once
  cheap). In frames at 60 fps: 400 ms = 24, 750 ms = 45.
- **Beats:** every beat from time (n x 60 / BPM, the kit's song grid), never a rounded frame count added again and again; cut on the beat,
  change the layout on the bar (every 4 beats). A spring that must open ON the beat frame: release it half a frame early so the beat
  frame is the first open pose (else the pressed pose holds one frame too long).
- **Camera and depth:** parallax speeds 1.0 foreground, 0.5 middle, 0.2 background; at phone size push key poses 10 to 30 % further than feels right.
- **Readability:** text 4.5:1 contrast on every frame (3:1 for large text; the lint measures it against what is behind it), never more
  than 3 flashes a second, every text held its reading time (above).
- **Loops** (a social loop, a GIF): render frames 0 to N-1, never N (frame N is frame 0 again: the hiccup at the seam); drive every cyclic
  move from phase = frame / N with whole cycles (a square turns exactly 90°, a wave exactly 2 cycles); organic drift samples noise along
  a circle so it comes back to its start; frame 0 is a finished composition (the first thing on screen while a GIF loads).

## Motion lessons (learned on real films)
- A "camera" (push, drift, parallax) moves imagery layers; text only pulses with the groove while read (rule 2) - that is how a film
  stays dynamic without "slides".
- `backface-visibility: hidden` is not reliable in renders: fold a card to 90° and hide it, never show its back.
- A 90° hinge is invisible only when the perspective origin sits on the hinge (each door its own origin).
- A first GSAP `fromTo` draws its "from" state at once (immediateRender): an element whose start state is visible (a ring at scale 0.2)
  shows from frame 0. Hide it until its time (`motion/tween` `"hide_before": true`, or a set).
- **An out move starts only after the in move on the same property has ended.** Overlapping, the in move finishes after the out move when
  the film PLAYS (preview, PNG, MP4) and its end state stays on screen (a giant word can stay over the next line), while a
  direct seek looks right, so stills and `collide` miss it. `kit.py build` shortens such an in move and says so; `kit.py verify` lists
  overlaps in code blocks and `--play` compares played frames with seeks.
- `"type": "box"` and `"group"` take `"html"` too (inner markup: an SVG, a few spans); a motion whose target matches nothing stops the build.
- Never blend two frames of a sequence; never let a picture change inside one exported frame (snap to the 60 fps grid).
- Text measured, not guessed: lines at 140 px are wider than they look (`kit.py measure`).
- Text scaled up inside `will-change: transform` renders soft (`kit.py verify` warns): scale the font size or drop will-change.
- Lessons from past reviews:
  - a number always counts in full, from 0 to the designed number, centred while it counts (measure its width on the final string);
  - light only ON an object: a shine inside the strokes of letters, a sweep inside a card, a person or a box (the object as its mask);
    never a light streak, light leak or white flash over the whole frame ("very weird"); footage never flashes white; a "cinematic"
    grade + vignette + grain over footage was disliked: not by default;
  - a transition covers the whole frame (nothing shrinks to show black behind; the kit's directional-wipe and zoom-through fill by default);
  - a cut-out person whose lower edge sits on the frame edge is never lifted off it (breathing from the feet, a side sway);
  - KEEP DESIGN: a stretch of voice-over with no designed frame gets a proposal in the motion spec (the film's own elements), the user decides.

## Preview and fix
- The user opens `1. Preview.bat` (kit player: the video, the notes, the exports: scenes, scrub, frame step ←/→ at 60 fps, `[` `]`
  scenes, the version list, notes, Export panel), or you open it for them with `kit.py preview <project>`. At 1× the picture follows the
  sound's own clock (WebAudio), so what the user hears and sees is in sync. The film reloads by itself when you change it (never say
  "press reload"). The **⋯** menu: Lặp cảnh (L), Lề an toàn (G), Khung QA (Q: red boxes on the frame's issues), Phát mượt (S), So với bản
  trước (C), the keys. A film with lyrics also gets the **Canh lời** tab (the user taps T on each line start; saved to
  `notes\lyric-taps.json`, which `kit.py align` uses as pins). Never play sound yourself to test (the speakers are the user's).
- Every `kit.py build` ends with a quick lint (a few seconds): a logo with motion, text over text or outside the margin at rest, a blank
  frame after a cut, text shown too briefly to read, a product render that moves or turns next to text holding still (`product`), an
  image sequence that skips more than 3 render frames in one film frame between pictures that differ (`jump`: slow the key, or cut on a
  portal). Warnings only: look at the still, fix what is real.
- Before the FIRST preview: the quick self-review (`workflow/review.md`: stills of every scene and every cut) and, with a brand pack, `kit.py
  brand-check <project> <pack>` (seconds). Then **tell the user the film is ready** and OFFER the long checks with their time (they take
  minutes and slow an export): `kit.py verify <project> --play` (act on BUG lines; EDGE
  lines are sub-pixel picture edges, not bugs; `--loop` for a looping film), `kit.py collide <project>` (the whole film; a "note" = text
  under a picture: look at that still), `kit.py pulse` for a film with a groove. Never while an export runs; not in feedback rounds.
- Stills: `kit.py stills <project> 1.5 4 8` | `--beats` (a frame per scene) | `--strip <t>` (12 frames in a row) | `--cuts` (a strip at
  every scene change) | `--phone` (360 px) → `02_Assets\Stills\<kind>\` + sheet.png.
- Notes in camera words (`workflow/review.md`, "Words for notes"); a vague note ("make it nicer"): ask one question with 2-4 concrete choices.

## Export (only when asked, or from the player's three buttons)
MOV and MP4 are both finished films with the sound inside; no stems beside them.
- **MOV Export** (`kit.py mov <project>` = [MOV Export]): ProRes 4444 (10-bit, no chroma subsampling, PCM 24-bit audio), 60 fps, 180°
  motion blur on by default (never across a cut; **Blur** off / `--no-blur`: pixel-art and hand-drawn films, remind the user), **Trong
  suốt** / `--alpha` for a transparent background (the button asks Blur / Trong suốt / 4K, remembered per film, then where to save) →
  `04_Renders\MOV\`. Blur takes much longer on films that keep moving (a 14 s film: about 2 min with blur, 20 s without; long films can take an
  hour): say it before you start one.
- **MP4 Export** (`kit.py mp4 <project>` = [MP4 Export]): H.264 High, CRF 12, 60 fps, BT.709, lighter; no blur unless **Blur** is on (the
  button asks) / `--blur`. → `04_Renders\MP4\`. Frames of the same film (same blur) already rendered are reused, so an MP4 after a MOV without blur encodes
  in seconds.
- **4K** (asked by MP4 Export / MOV Export, or `--4k` on `mp4` / `mov`): twice the pixels on the same layout
  (3840×2160 for 16:9, 2160×3840 for 9:16). Text and vectors get sharper, small source pictures do not (say so); about 3-4 times the render
  time, and a 4K MOV is very heavy: say both before you start one.
- **Port to AE** (`kit.py ae <project> --run --check auto` = [Port to AE]): `reference/ae.md` → `05_AE\`, with `Audio\`
  (`mix.wav` + voice, music, sfx stems) beside the project.
- `kit.py qa <project>` (pops, one-frame flashes, photosensitivity) reads the last MOV / MP4 render. There is no PNG sequence export any more
  (`kit.py frames` was removed); After Effects gets Port to AE.
- Every export is dated, never overwritten, and logged in `04_Renders\EXPORTS.md`. Tell the user the folder. Old exports pile up: offer
  `kit.py trash` on the ones they no longer need.
- No export goes through HyperFrames (its MP4 grabs JPEG frames). Words: ffmpeg "encodes" frames into an MP4 / MOV (not "joins"). A render takes time and disk: say both before you start one.

## A deck (a film presented live, slide by slide)
When the user wants to present the film (a pitch, credentials, a talk) rather than play it: film.json `"slides": true` (every scene a
slide; or a list of scene ids for the main line), and per scene `"slide": { "notes": "presenter notes", "fragments": [1.5] }` (seconds in
the scene where the presenter stops until the next click). `kit.py build` writes HyperFrames' slideshow island and shows each scene
only in its own window. `kit.py studio <film> --present` opens HyperFrames' presenter (needs HyperFrames: asks before installing, about
110 MB): ← / → or clicks step slides and fragments, P opens the audience tab (Meet: share that tab; Zoom: that window), notes stay on
the presenter's screen. A deck still exports to MP4 / MOV / AE as a film.

## Tracking (time and tokens per stage, every film)
- Mark a stage the moment it starts: `kit.py track <project> "<stage>"` (`Prep`, `Storyboard`, `First cut`, `Fixes 1`..., `MOV export`, `AE port`).
- Film done (the user says all is OK): `kit.py track <project> end`, then `report`; the chat ends or the user stops for the day with the
  film not done: `report` only (`SKILL.md` rule 11). → `qa\tracking.md`: per stage (wall time; Claude working; the machine
  running a background command; waiting for the user, answers to questions included; calls, tokens, the API-equivalent cost) and per
  chat turn, plus a cost table by token kind. The cost is what the same work would cost on the API: the user is on a Max plan, it is not
  a bill; use it to compare jobs. Prices: `engine\qa\prices.json` (a model missing there: look the price up with the claude-api skill and
  add it, never from memory). Copy the tables into `notes\RECAP-SESSION.md`; tell the user the totals in a small table. Never guess.

## Handoff to the main kit chat (every film)
A film chat changes no kit code and no library (`SKILL.md` rule 9); everything the kit should learn goes to the main kit chat through
`<film>\03_HTML\notes\RECAP-SESSION.md` (one file per film), which starts with a section **"Tasks for the main kit chat"** in this format: a table
priority · code · kit file · what to change (the bug, how you worked around it, the fix you propose), then the kit bugs hit, every
function, preset and generator you wrote for the film (path, what it does, its params: candidates for the library), the skill gaps,
the user's own words that changed a rule (verbatim), the self-review scores, and the tracking tables.

## HyperFrames Studio (not used; only on request)
The player does what HyperFrames was used for. Only when the user asks to edit a timeline by hand: `kit.py studio
<project>` (asks before installing). After they save in Studio, re-read `index.html` before you change anything. Never pick Google fonts in
Studio for client work (network).
