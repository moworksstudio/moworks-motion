# Long films: split the work among helpers (plan C2, user 07/10/2026)

**When:** a film over 60 s or over 10 scenes (a 20-slide credentials deck, a 2-minute explainer), and the session can start subagents
(the Agent tool). Shorter films: do it yourself; helpers cost more tokens than they save.
**Not when one timeline runs through the whole film** (Tests 1 and 4): a song or voice-over film with ONE product (or one PSD's shared
layer ids) carried through every scene: splitting it would hand every helper the whole id table and word times and the seams would not
meet. Write it yourself with a generator script in `<film>\03_HTML\presets\_gen\` (scenes from a table of cut points on the words / beats) instead.

## Two films from one brief (Test 1: two looks for one song)
One shared timeline (the song's grid, the lyric times, the product's sequence and poses) in one generator; one function per look; the
second film is a second project next to the first (`kit.py new ... --dir`), its film.json written by the same generator. Each film gets
its own storyboard / motion spec approval, its own revisions and its own tracking.

## 1. You write the constitution first (one place, before any helper starts)
- `notes\ANIMATION_GUIDE.md`: the ideas taken (`recipes.md`), the dynamic level and the groove if any (`film.md`), palette (hex), type scale (classes and px), grid and margins, the motion language
  (eases or springs per role, durations, how text enters and leaves, transitions), what binds (the guideline's design rules, logos, rules 1-5 of `SKILL.md`), the
  layers that cross the whole film (product, credit: they stay in film.json, helpers never touch them), and the film's own presets helpers
  may use.
- `notes\MOTION-SPEC.md` (the approved motion spec table, `free-design.md` step 3): one row per scene: id, time (or "auto" + its voice /
  lyric / beats), the copy, the composition, the moves in / hold / out, the transition into it.
- The approved storyboard option (free design) or the client's frames (keep design) are the reference: link their stills.

## 2. Split
- Groups of 3-6 scenes in order (`parts\s01-s05.json`, `parts\s06-s10.json`...). film.json lists them in place:
  `"scenes": [ { "include": "parts/s01-s05.json" }, { "include": "parts/s06-s10.json" } ]` (plus its own scenes, song, layers, end tag).
- Every helper gets: the two notes files, its scene rows, its part file name, an id prefix (`p1_`, `p2_`...: every element id, preset
  name and code variable in its part starts with it; `kit.py build` stops on an id used twice), the rule "write only your part file and
  `presets\<group>\p1-*`, never film.json, never another part".
- A helper checks its own part: `kit.py build`, then `kit.py stills <film> --beats` and its scenes' strips; it reports what it made (one line
  per scene) and anything it could not do.

## 2b. Helpers that work well (2D rebuild test, 09/10/2026: 4 helpers, ~1 h rounds in parallel)
- A character film: helpers start only after the asset sheets are approved and get the FROZEN cast (`workflow/characters.md`); a cast
  gap a helper finds goes into its report, never into a patch (four helpers patched the same rig gaps four times).
- The brief: the user's words verbatim, a numbered list of what differs with film times, the file rules, the exact commands, "at least 3
  rounds" with the stills cadence, and a fixed report table (item · change · fixed / partly / not).
- Each helper on its own copy of the film; a helper writes a file only whole (a usage-limit stop mid-rewrite left half-done presets).
- Mechanical passes (renaming or sorting stills, building / reading `kit.py compare` sheets, lint and syntax checks, copying one fix across
  scenes) can run as **Sonnet 5.5** helpers (Agent `model: "sonnet"`, user 09/10/2026); design, drawing and review stay on Opus.
- Keep the lead's context short: heavy visual review inside helpers, the lead reads their summaries and a few sheets.

## 2c. Cost and unattended runs (10-11/10/2026 test)
- Each helper processes ~50 - 135 M tokens (~$30 - 75 API-equivalent, 1 - 1.5 h); six at once hit the plan's 5-hour usage limit. Say the
  cost before a fan-out and ask (`characters.md` section 0). Measure it with `kit.py track <film> report` (every call of the session and
  its helpers), never the helpers' "subagent_tokens" (a final context size: their sum was ~190x too low).
- **Overnight / unattended** (the user asleep): run fewer helpers at a time; every helper writes its state to a file it can resume from
  (`notes\HELPER-<part>.md`: done, in progress, next) after each step; when the usage limit stops them, YOU resume them after the reset
  yourself (a scheduled wake-up), never wait for the user to come back (11/10/2026 test: 1 h 40 lost waiting).

## 3. Merge and review (you)
- `kit.py build` (its lint), `brand-check` when a brand pack applies; `verify` and `collide` offered to the user as usual (`film.md`).
- Look at the whole film with `kit.py stills --beats`: the parts must read as ONE film (same type scale, same rhythm, transitions that carry
  across part boundaries). Fix the seams yourself.
- **Your whole-film review finds what part helpers cannot** (11/10/2026 test: the seam timing, an old logo patch showing through the new one, a
  subtitle transcribed with a "!" the master does not have, subtitle centres differing per line): a remake: `kit.py compare` every 0.5 s,
  then every native frame at the worst times, strips across every seam (`stills --strip <seam>`), `verify --play`.
- Then the self-review (`review.md`) and the round-1 message as usual. Tracking (rule 10) counts the helpers' tokens too.
