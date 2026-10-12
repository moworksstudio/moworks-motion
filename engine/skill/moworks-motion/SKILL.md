---
name: moworks-motion
description: Make motion graphic films for any brief in code with Moworks Motion (HTML + GSAP films built from film.json, motion and layout libraries as a toolbox, the kit's review player with timed notes and an Export panel: MP4 Export, MOV Export, Port to AE; films cut to a song or a voice-over). Any brand, product, service or idea: the film is designed for its own brief. Finished artwork (PSD/PSB, PowerPoint or Google Slides deck, final frame images) is kept as designed and only animated; text, an idea or a song alone gets a free design of layout, graphics and motion. Brand guideline packs kept on this machine (`brands\<pack>\`) apply only to that brand's films. Use for any motion graphic, launch, lyric or music film, explainer, social or data film, credentials, a deck or PSD to animate, a port to After Effects; also to install, update or remove the kit.
---
# Moworks Motion: do this first
Skill version **2.0.3** (must match the kit's `engine\VERSION` file).

0. **No brief yet** (the skill was opened on its own, or the user asks what it can do): send the welcome card in `workflow/start.md`
   (capabilities, what to send, the steps) and wait for the brief. A message that already holds a brief: skip the card.
1. **Kit root:** the one line in `%USERPROFILE%\.aimotionkit\kit-root.txt` (written by `install.bat` / `update.bat`); else the working
   directory if it holds `engine\kit.py`; else ask once where the Moworks Motion folder is (never scan drives). Paths below are relative
   to it. **Install / update / remove** (no kit yet, or the user asks): clone the repo to a local drive (`D:\Moworks Motion`, else
   `C:\Moworks Motion`), run `install.bat --yes` (`update.bat --yes`, `uninstall.bat --yes`): the user's request is the yes. From a
   chat each opens its own window outside the Claude app and prints its own result table there; never add `--here`. Then reply in
   1-2 lines: done (or its [LỖI] lines) and the next step. Never explain the steps, repeat the table, list what was installed or
   describe the kit: the window and the README do. The skill is live in that same chat at once (Claude Code loads a
   new skill mid-session): load it and send the welcome card (`workflow/start.md`); never tell the user to open a new chat, never run `doctor` after a clean
   install. **Version:** read `<kit>\engine\VERSION` (older kits:
   `<kit>\VERSION`); not the skill version above → tell the user once, in one line: skill (x) and kit (y) differ, run `update.bat` in the
   kit folder (or upload `skill\moworks-motion.zip` again when the skill is used on claude.ai); then go on. **Newer kit on GitHub**
   (check when the skill loads, before any work): once per chat run `python engine\update.py --check --quiet` (one
   line, a few seconds, installs nothing). "up to date" or "no update check" (no network, not a clone) → say nothing. "N update(s) on
   GitHub" → one line in your first reply with the newest change from that line, and ask (AskUserQuestion): update first (then
   `update.bat --yes`, its own window; go on when it is done) or work on this version. Never update without that yes. **ElevenLabs** (ask once,
   when the skill is loaded): check `python -c "import os; print(bool(os.environ.get('ELEVENLABS_API_KEY')))"`
   (never print the key). False → add one line to your first reply: ElevenLabs (AI voice-over / music / sound effects, paid) has no key on
   this machine; if the user wants it, they set the Windows environment variable `ELEVENLABS_API_KEY` (never paste the key into the chat)
   and reopen Claude. Not needed: never ask again in this chat (music: the Mixkit options; voice: the user's file).
2. **Film folder:** the chat opened in a job folder (not the kit) → make the film there: `kit.py new "<Client> <Project>" --dir "<that folder>"`
   → `NN_Client_Project\` = `<film>` below, with `01_Brief\` (the brief, lyrics, guideline links AND the user's original
   files: PSD, deck, images, logos, fonts, music, voice, video; copy them there, never edit them), `02_Assets\` (what you make for
   review: `Rounds\`, `Stills\`), `03_HTML\` (the film: film.json,
   index.html, `assets\` (the film's own copies), `audio\`, `presets\`, `notes\`, `qa\`) `04_Renders\` (MP4, MOV only) and
   `05_AE\` (Port to AE, with `Audio\`: mix + stems), made on the first export. Every `kit.py` command takes `<film>`; `notes\`, `presets\`, `assets\`, `qa\` below are inside `03_HTML\`. If the film
   ends up outside this session's folders, add its folder to the session (the desktop app's add-folder tool) right away, or the user
   cannot open its files in the app. A job folder on Google Drive works (it syncs slowly): say nothing about it.
3. **Brand**. A guideline governs the DESIGN (fonts, type sizes, colours, logo use, grid / margins, KV) on EVERY
   piece of text in the film, not only the main layout. In motion it binds only its logo and end card rules (rule 5); all other motion
   is free, text included: any effect on text (glitch, stretch, blur, split...) while it stays readable.
   - **A brand with a pack** (`brands\<pack>\brand.json`: the brief names that brand, its products or its font, or the user says so):
     the kit holds the guideline: follow it, no question; read the pack's `skill.md`, `notes.md` and `brand.json` (`brands/pack.md`; some
     packs never let their logos move). When the user brings a folder with an updated guideline: read every page, send a comparison with
     the pack, then update the pack (`brands/pack.md`, "A new guideline"). No guideline check otherwise.
   - **Any other client or brand:** the kit may already hold its guideline (`brands\<client>\` with a guideline file in it): then use it and ask only
     about layout files. Otherwise ask once before designing: does the client have a brand guideline, or a layout file designed frame
     by frame?
     Layout files → KEEP DESIGN. A guideline → ask for its link / file, read ALL of it and follow its design rules. Neither → you design it
     at maximum creative effort (FREE DESIGN). `brands/other.md`.
   - A personal idea with no brand: no question, design it at maximum creative effort.
   - **Brief vs guideline:** when the brief asks for something the guideline does not allow (colours above all), list every point and ask
     the user which wins, brief or guideline, before the storyboard (`kit.py brand-check <film> <pack> --brief`; other brands: by reading).
4. **What did the user give?**
   - **Finished design** (PSD/PSB, a PowerPoint or Google Slides deck whose slides are the final frames, PDF or images of the final frames): **KEEP DESIGN**. Layout, graphics, fonts and colours stay exactly; the animation is yours. Read `workflow/keep-design.md`.
   - **Only text, copy, an idea or a song** (no design): **FREE DESIGN**. You design layout, graphics and motion; the story first (`workflow/story.md`, not for a song film), then **3 storyboard options** (one still per scene, `kit.py storyboard`) and wait for the user's pick before any motion. Read `workflow/free-design.md`.
   - **A deck or PSD the brief does not say to keep:** the brief describes a new film made from it (e.g. a credentials film from a company deck) → FREE DESIGN with its content (`kit.py ingest <film> <deck> --no-film`: the content only). Unclear (also a storyboard collage of screenshots, design for only some scenes, rough sketches): ask ONE question: keep this design exactly, or design it anew? Then go on.
   - **A video or images as a reference** (for its art style and motion). The way depends on HOW its content is
     made, shot by shot (a mixed film: each shot its own way):
     - **Drawn or acted content** (people, animals, rigged or frame-by-frame acting, detailed hand-drawn or illustrated scenes, effects
       drawn frame by frame): **STYLE REFERENCE by default**: take its look
       (palette, drawing style, proportions, texture) and its motion grammar; draw your own scenes, characters and sets in that style,
       never a shot-by-shot copy. A 1:1 copy only when the user asks for one in so many words ("copy y chang", "1:1", "giống hệt"):
       REMAKE, a heavy job (`characters.md` section 0).
     - **Built content** (type, shapes, UI, icons, simple pictogram people, photos, footage, given 3D renders, transitions, camera): a
       close 1:1 copy is fine (never 100 %): REMAKE when the user wants it copied, STYLE REFERENCE when they want its style; not clear
       from the brief → ask once.
     A copy follows the swap rules either way (`workflow/remake.md`: no people, voices, music or logos of the reference).
     STYLE REFERENCE: a style guide + shot list first, wait for the user's OK (`workflow/free-design.md`, "Style reference"); then the
     storyboard options as in FREE DESIGN.
   - **REMAKE** (a copy, as above, or a film to rebuild when only its video exists): the
     reference is the storyboard; read it with `kit.py compare --shots`, fill `01_Brief\SHOTS.md` + the swap rules, measure every move
     with `--follow`. Read `workflow/remake.md` (and `characters.md` too when it has people or illustration).
   - **Character or illustration films** (in a 2D rebuild test 74 % of the time went into redrawing
     people and hands after the first cut): cartoon-style character animation, people or hands moving frame by frame, a film rebuilt from a finished video
     with no artwork, or vector artwork (AI / SVG) from the user. One more gate: the **asset sheets**: every character rigged and animated
     in every pose the film needs plus the stress poses, its hands and expressions; every location and prop. The user approves them before
     any animation. Read `workflow/characters.md`. Art from a video is REDRAWN as whole vector parts measured on the frames, never traced
     (`kit.py trace` is gone). **A heavy job:** a frame-by-frame film (a 1:1 remake, character animation, redrawn
     sets) or a reference in a complex textured style (watercolour, gouache, crayon, paint) is hard and expensive: before any work say
     so with its time and token cost, its limits (what will only be approximated) and the cheaper paths, and ask (`characters.md`
     section 0).
   - **Approval gates (HARD rule): no motion is built before the user approves.** FREE DESIGN: (1) the storyboard (3
     options, the user picks) and (2) the **motion spec table** of every scene (`workflow/free-design.md`). KEEP DESIGN: the motion spec table
     only (the design is the storyboard). REMAKE: the filled `SHOTS.md` + the swap rules (the reference is the storyboard). The table is pasted IN the chat (and saved to `<film>\03_HTML\notes\MOTION-SPEC.md`, path given). Its row 0
     asks two things: the **groove** (nudging on the beat: never by default; slow or soft music: none) and the **dynamic level**
     (recommend strong: Moworks is a motion studio). A brief asking for "a complete first cut" or "ask only when needed" does NOT waive the
     gates; only the user's explicit words (skip the storyboard, skip the motion spec) do: then say in your next message which gate is
     skipped, and write it in `notes\NOTES.md`. **Nothing waives the asset sheets of a character film**, not even "copy the video 1:1" or
     a skipped storyboard: a copy job lowers the design work, not this gate; say so in one line and show the sheets.
   - **Free inside the gates (in an A/B test a plain prompt with no rules scored 55 / 70, a rule-heavy skill 46).**
     KEEP DESIGN: the client's layout (their storyboard) is followed exactly; only the animation is yours and free. FREE DESIGN: the layout
     and the animation are both yours. Bold and unconstrained: no house style, no recipe bans, no "safe" moves. Only these bind: the
     guideline (above), the user's own asks (a Library effect or layout they name: exactly that), and the quality checks of rules 1-5
     (they catch defects after you create; they never shape the idea).
5. **Always read** `workflow/film.md` (how a film is made, previewed, fixed and exported) and `workflow/recipes.md` (ideas by kind of film: take what helps, none of it is a rule). Before the first preview: `workflow/review.md`. A film over 60 s or 10 scenes: `workflow/long-film.md`. A video to copy or rebuild: `workflow/remake.md`. Characters, vector art: `workflow/characters.md`. A brand with a pack: `brands/pack.md` (+ the pack's own `skill.md`). Other brand: `brands/other.md`. After Effects: `reference/ae.md`. All commands: `reference/commands.md`. Another aspect (9:16, 1:1, 4:5), 4K, or an approved film re-laid out for another frame: `workflow/reframe.md`. The user wants an effect or layout kept in the library (from this job or a reference video), or asks how: `workflow/library-intake.md` (the Gallery's Incoming section, with the user's step-by-step guide).
6. Reply in Vietnamese, short and plain (this skill is written in English; everything you send the user is in Vietnamese). The kit's
   player and Gallery show Vietnamese labels: when you name a button, tab or tick, use the label the user sees on screen (read it in
   `engine\player\index.html` or `library\gallery\index.html` when unsure). Ask only what changes the film. **Every recap, comparison or status is a table**; after each step:
   a short table of what was done + one clear question about the next step. A long process (export, AE port, align)
   gets short step-by-step status lines: the step it is on, where the result goes, what not to do meanwhile.

**The 9 tiers (the process stays; only the rules inside got lighter):** 1 this skill (routing, the gates) · 2 the rule
pack (guideline design rules, logos, the checks, the user's asks: nothing else) · 3 you as creative director (storyboard, motion spec) ·
4 film.json · 5 `kit.py build` (the libraries as a toolbox; a quick lint after every build) · 6 the page runtime · 7 the renderer · 8 the
AE and video outputs · 9 QA (self-review, `collide`, `verify`, `brand-check`, `pulse`).

## The loop (every film)
`kit.py new` → `kit.py track <film> "Prep"` (rule 10) → brand (step 3; brief vs guideline asked) →
(keep design: `kit.py ingest` / `kit.py psd`; a song: `kit.py beats` + `kit.py align`) →
design the film first (the look, every scene's composition, the motion language) → free design: 3 storyboard options
(`kit.py storyboard`, then `kit.py round <film> storyboard`), the user picks → a character film: the asset sheets
(`kit.py round <film> assets ...`), the user approves (`workflow/characters.md`) →
the motion spec table in the chat, the user approves (the gates: step 4) →
`kit.py library` as a toolbox only → `film.json` → `kit.py build` (read its lint warnings) → quick self-review (`workflow/review.md`:
stills of every scene and every cut, ≥ 3 rounds until every score ≥ 8) → **say the film is ready first**, then OFFER the long checks
(`verify --play`, `collide`, `pulse`: minutes each; never while an export runs) → the user watches in **`1. Preview.bat`** and leaves timed notes
(**`notes\feedback.md`**) or writes in chat → **every round you send** (storyboard, asset sheets, the film's first preview, each round of
fixes) is published with `kit.py round <film> ...` and announced: the line it prints (`Phim v3: ...`) opens your message, and the
design rounds (storyboard, sheets) are shown and approved in the chat; the player is the video, the notes and the exports
(`workflow/film.md`, "Rounds"; "quay lại vK": `kit.py restore` first) → fix (the player reloads the film by itself) → export from the
player's **Export panel** (**MP4 Export**, **MOV
Export**, **Port to AE**) or by command when the user asks (`04_Renders\`, file names carry the version: `<film>_v3_60fps_...`).
The kit is **60 fps only**. **MOV** (ProRes 4444, motion blur on) and **MP4** are finished films with their sound inside; the **After
Effects project** comes with `mix.wav` + the stems. Remind the user to turn **Blur** off (the export button asks) for pixel-art or hand-drawn films.

When the user asks you to read the feedback (in any words): run `kit.py feedback <film>` (the open lines of `notes\feedback.md`, numbered;
the Done ones are left out) and fix every line it prints. Never pick lines by their place in the file. The
USER closes lines in the player (Done → `- [x] [`, or Delete); never mark a line yourself (only the user
knows when they are happy with it). An open line you already fixed in an earlier round is not accepted: fix it again, differently, or ask one concrete question.
Rebuild, and answer with a table: line · what you changed · fixed / not fixed (why).

## Rules in every film (non-negotiable)
1. **No collisions:** readable elements (text, UI, photos) never run into each other on any frame. Exempt: transition carriers, layering that already exists in the design, and big text under or over a product picture while every letter stays clearly readable (a product passing over a big one-word super is a good rule-break; `kit.py collide` writes it as a "note": look at that still). Check: the build's lint (at rest), `kit.py collide` (the whole film).
2. **Text stays readable while it is meant to be read**: it may pulse with the beat when the film has a groove (about 3 % or a few px) but never drifts, slides or spins away while read; entrances and exits are free. Sung words still enter on their SUNG times (lyric timing), not merely on the beat. A "camera" moves imagery layers.
3. **Deterministic:** every frame is a pure function of film time. No timers, `Date`, unseeded random, network loads.
4. **Truth:** real content only; anything illustrative is labelled "Example"; no invented numbers, quotes or features.
5. **Logos** are official files only, never redrawn, recoloured, stretched or given an effect (glitch, blur, split). Any brand: a logo may enter and leave as a whole (fade, slide, uniform scale) unless its guideline says otherwise; a logo animation the guideline itself gives is fine; never in the groove. **A pack's own logo rules win on its films**: some packs' logos do not move at all, they arrive and leave with their scene (`brands/pack.md`).
6. **Preview first, export last:** no MOV / MP4 export, AE port or long checks unless the user asks (or presses a button). A complaint about an export's quality is a request to DIAGNOSE: say what you measured, propose the fix with its cost (time, disk, folder), and wait for a yes before rendering anything. Name the folder of every output.
   A long command (export, AE port, align) runs in the background and you wait for its END: no progress monitor (every progress event
   re-reads the whole chat: about 20 of them cost one AE port 13 million tokens).
   After Claude Code restarts or the chat resumes while such a command was running, never assume it finished: check its result before
   going on (the output file exists and is newer than its inputs, e.g. `index.html` newer than `film.json`; the export in `04_Renders\`);
   missing or older → run it again and say so (a rebuild can be lost silently after a restart).
7. **Report honestly:** say what you measured, what you only looked at, and what you did not check.
8. **HyperFrames is not used** (the kit's player exports MP4, MOV and AE itself). Only if the user asks to edit a timeline by hand: `kit.py studio <project>` (asks before installing). The user asks you to install HyperFrames: run `install.bat --only hf --yes` (its own window; Node.js comes with it through winget). Never export through HyperFrames (its MP4 grabs JPEG frames). The film format stays compatible with it.
9. **Machine and data:**
   - Generation APIs are allowed: ElevenLabs voice, music, sound effects (`kit.py voice | music | sfx-gen`), image / video generation. The client's material may be an input, except a confidential pack's (`brand.json` `"kit": {"confidential": true}`). Save every result in the project. Never put client material where a platform keeps it (cloud drives, shared projects, galleries, public links). A confidential pack's job: its material stays on this machine; ask before sending its script out (`brands/pack.md`).
   - Flat cartoon characters: the library rig, or the film's own redrawn puppets (`workflow/characters.md`). Generated base, kit motion on top (not with a confidential pack's material): for what code draws badly (photoreal people, physics, real places), generate a base image / clip, put it in `assets\images|video\` and build the film's own motion layer over it.
   - API keys come from the environment only (e.g. `ELEVENLABS_API_KEY`), never in chat, film.json or files that get shared. Tell the user before every paid generation (what, which service, how many credits: the commands print it and send only with `--yes`; a dry run also says when the key is missing); no other limit.
   - Ask before downloading anything (fonts, models, libraries, music). One exception: the 3 free Mixkit tracks
     offered when the user has no music are downloaded at once into `02_Assets\Music-Options\` so the user can listen before choosing
     (`workflow/film.md`, Audio).
   - Delete nothing for good: `kit.py trash <path>` (Recycle Bin), never unlink / rm / Remove-Item. Rounds (storyboard, sheets, film
     versions) are never removed at all, not even offered (`workflow/film.md`, Rounds).
   - A file the user has open or edits (lyrics, notes, a brief) is theirs: write yours next to it under a new name.
   - **A film chat never changes the kit or its libraries** (`engine`, `library`, `skill`: no fix, no new shared function).
     One exception, only when the user asks and only on the kit owner's machine: a clean copy of an effect or layout into the Gallery's
     Incoming section (`kit.py library import`, `workflow/library-intake.md`); the owner keeps or drops it on the Gallery.
     A kit bug that blocks the film: work around it INSIDE the film (`03_HTML\presets\`, a film.json trick, a film script) so the film gets
     done, and write it down for the main kit chat (`workflow/film.md`, "Handoff"): the bug, the file, how you worked around it, every
     function or preset you wrote. Code for one film lives in `03_HTML\presets\`.
   - **A film chat saves no rules or taste to Claude's own memory**: every
     lesson goes into `03_HTML\notes\RECAP-SESSION.md`; the main kit chat moves it into the skill or the engine.
10. **Track time and tokens (every film):** run `kit.py track <film> "<stage>"` the moment a stage starts: `Prep` (brief, intake), `Storyboard`, `First cut` (until the first preview), `Fixes 1`, `Fixes 2`... (one per feedback round), `MOV export`, `AE port`. When the user says the film is done (all OK, or asks): `kit.py track <film> end`, then `kit.py track <film> report` (time: Claude working / machine in the background / waiting for the user; tokens; the API-equivalent cost per stage: the user is on a Max plan, so it is not a bill); copy its tables into `<film>\03_HTML\notes\RECAP-SESSION.md` and tell the user the totals in a small table. The numbers come from the Claude Code session logs: never estimate tokens yourself. Details: `workflow/film.md` ("Tracking").
11. **Recap, every film** (the kit is still being tested; users send this file back so the kit gets fixed): keep
   `<film>\03_HTML\notes\RECAP-SESSION.md` up to date AS YOU GO, not only at the end, so it is complete whenever the chat stops: where the
   skill or kit fell short, every error hit (command, message, your workaround), every new effect or script written, the self-review
   scores, the user's words that changed a rule. Format: `workflow/film.md` ("Handoff"). When the chat ends or the user stops for the
   day (film done or not): `kit.py track <film> report`, add its tables, and tell the user in one line where the file is to send back.
