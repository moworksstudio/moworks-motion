# Self-review before the user sees it

**When:** before the FIRST preview of a film, and when the user asks you to look it over / check it yourself. Not in normal feedback rounds (there the
user's notes lead).

**Look at it like a strict director, not a proud author.** EVERY round, the quick part, on your own (seconds; Read the sheets: a round without them misses bugs;
look at the pictures closely, quality first):
- the build's lint lines (text too brief to read, text over text at rest, a logo with motion, a blank frame after a cut, a product moving
  next to resting text, an image sequence that jumps);
- `kit.py stills <film> --beats`: one settled frame per scene;
- `kit.py stills <film> --cuts`: a 12-frame strip across EVERY scene change (and `--strip <t>` for every other fast change: a hero move, a
  fold, a giant word): stutter, overlaps, a frame where two states show;
- `kit.py stills <film> --phone`: the scenes at 360 px wide: can every word be read on a phone?

- the hero move of each shot, as an animator checks timing: `kit.py stills <film> --onion <t0> <t1>` (the frames laid over each other:
  even ghosts = robotic, ghosts that tighten near the key = the easing works) and `kit.py measure <film> --graph <id>` (position, size,
  opacity and speed per frame: it names linear stretches and dead starts / stops).
- a fix that did not hold: render the frames just before and after the problem side by side, list every difference, find the one line
  that causes it, change only that line, render both again.

The heavy part is OFFERED with its time once you have said the film is ready (the machine is busy for minutes):
`kit.py verify <film> --play` (frames played in order vs direct seeks: catches an out move that starts before its in move ends),
`kit.py collide <film>` (the whole film), and for a film with a groove `kit.py pulse <film>` (lift after the beat, beats with a jolt,
still frames, against a film that worked well: lift 1.42, 76 %, 5 %).

**Score 1-10 each:**
1. hook: the first 2 s make you watch;
2. readable on a phone;
3. motion: real acceleration or springs, no dead frames, nothing sliding at constant speed, things alive between the moves at the
   dynamic level the user chose;
4. variety: something new every 2-4 s;
5. composition: the main super + the hero near the centre (a tendency, never forced), the rest floating free; balance, margins;
6. brand / design: the pack's rules, the client's frames (keep design: 2 px tolerance);
7. sync: moves land ON the words / beats they belong to (and, with a groove, the picture jolts on the kick).

**Hunt for these:** a main super + product pushed far off-centre for no reason (a test film scored 5 / 10 for layout this way); sung words entering on the beat instead of on their sung time; text running into text during a change; objects gliding evenly instead of accelerating; corner labels and
decorative frames (premium recipe); a title alone on a gradient; text that goes soft when it scales; a beat where nothing happens; a jump
at a loop or a cut; a scene that looks like its Gallery demo; anything the user complained about in an earlier film.

**Loop:** write the 3 worst problems with their seconds, fix them, take the same stills again. At least 3 rounds, until every score is 8 or
more; after 5 rounds with a score still under 8, stop and tell the user which and why. A score you cannot raise without the user (sync when
you cannot hear the song, a colour only they can approve): ask them right away, with the seconds to check, instead of stopping quietly. Write the score table of every round in
`notes\RECAP-SESSION.md`; in the round-1 message give the user the last scores as a small table.

**Fresh eyes** (from the origin skill: the judge is not the builder). Before the first preview of a new film, give a fresh read-only
helper only the `--beats` and `--cuts` sheets.
- It says in one sentence what the film tells. If it cannot, or it says something else, the story does not read yet: fix that first.
- It also lists the 3 worst problems it sees. They join your round.

**Symptom → likely cause**
| What you see | Likely cause → fix |
|---|---|
| Stutter in the export, fine when seeking | an out move starting before its in move ends → `kit.py verify --play`; a CSS transition or timer → film time only |
| Text goes soft on a zoom | `will-change: transform` on a scaled layer → `verify` warns; scale the font size or drop will-change |
| A loop that jumps | the end meets the start in position but not in speed → `verify --loop` reports both |
| Cheap, bouncy | bounce easing on text → `spring.default` / `heavy`; overshoot only on UI |
| Looks like every AI film | no named reference style; a title on a gradient; generic particles → a style reference, a bolder storyboard option |
| Moves feel late on the music | the move starts on the beat instead of landing on it → start it earlier (`recipes.md` section 4), `kit.py pulse` |
| An invented feature or number | no source → the client's screenshots / facts; illustrative numbers labelled "Example" |

## Words for notes (the user's notes in camera words; notes often come in Vietnamese, these are their usual meanings)
| The user says | It means |
|---|---|
| "slow every zoom to 0.7x" | every zoom's duration / 0.7 |
| "hard cut here" | a hard cut at that time, no transition |
| "push in on the button" | a camera push toward the button (imagery scales up, text only pulses) |
| "hold the text 0.5 s longer" | the text's out moves 0.5 s later (the scene grows if needed) |
| "come in on the beat" | the move starts on the nearest beat (`{ "beat": n }`) |
| "heavier" / "lighter" | spring.heavy / spring.snappy (or a longer / shorter ease) |
| "bouncier" | spring.playful (UI, stickers, text too) |
| "more rushed" | more moves per bar, shorter holds, entrances on eighth notes |
| "too tame" | the strong dynamic level (`film.md`): drifts while holding, always-on life, bolder moves, ideas in `recipes.md` ("Energy") |
| "jolt with the beat", "bounce on the kick" | a film.json "groove" (or more elements in it, a bigger `scale` / `y`); "on the kick" = `"on": "kick"` (the heard kicks, not every beat) |
| "make it pop" ("chưa đã") | scale 1.0 → 1.08 → 1.0 over 15 frames (0.25 s), its peak on the beat |
| "more premium" ("sang hơn") | entrances on an ease-out quint (`power4.out`), springs at damping 0.8, no overshoot on text |
| "it drags" ("lề mề") | every hold one beat shorter, so every cut stays on the grid |
| "too busy" ("rối") | one hero move at a time; the others 150 ms later at 60 % of its travel; or remove 30 % of the motion, keep what guides the eye |
| "looks like AI" ("nhìn AI") | name the defaults it used (`free-design.md`, the banned list), ban each, build again |
| "the ending is abrupt" ("kết cụt") | a 1.5 s hold with a 2 % push, then a spring settle at damping 0.8 |
A vague note ("make it nicer", "not right yet"): ask ONE question with 2-4 concrete choices (AskUserQuestion).
Translate a feeling into numbers before you change anything, and say the numbers in your reply.

## Effort
In the app's model box: **xhigh** to start a new film, **max** when the first 3 seconds must carry a launch, **medium** for small fixes.
