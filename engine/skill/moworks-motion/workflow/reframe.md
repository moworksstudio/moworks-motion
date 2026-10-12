# Another aspect: a new film, or an approved film re-laid out

**Sizes (the user's standards, 08/10/2026):** 16:9 1920×1080 · 9:16 1080×1920 · 1:1 1200×1200 · 4:5 1080×1350 (the Facebook / Instagram feed
size). **4K:** any export with `--4k` (MP4 / MOV) draws twice the pixels on the same layout (3840×2160, 2160×3840, 2400×2400,
2160×2700); text and vectors are sharp, a small source picture is not (say so when the pictures are small).

## A new film in another aspect
`kit.py new "<Client> <Film>" --aspect 9:16 --dir "<job folder>"`, then design FOR that frame (never a 16:9 idea squeezed). 9:16 for
Reels / TikTok / Shorts: keep key text and logos out of the top ~14 % and the bottom ~20 % (the apps' buttons and captions sit there);
type sized on the short side (a 16:9 headline of 120 px stays about 120 px on a 1080 px wide 9:16).

## An approved film in another aspect (keep everything, change only the layout)
The user's rule: every element and all its content stay exactly (text, pictures, logos, motion, timing, sound); only positions and sizes
change, "sensibly" for the new frame. Never crop, never drop or add an element, never retime.
1. `kit.py reframe <approved film> 9:16` (or 1:1, 4:5): a NEW film next to it, a content record `qa\reframe-source.json`, a first layout:
   a taller frame gets "auto stack" (overlapping elements = one unit, units in reading order stacked top to bottom, each scaled to the width;
   1:1 and 4:5 keep a row of cards as a row), a group in a row turns into a column, backgrounds cover the frame; stills per scene.
2. Look at every scene still. Re-compose what reads badly, by editing positions and sizes in film.json only: bigger type where the
   frame allows, the product higher, units closer, safe zones (9:16 above), the camera / motion distances in params adjusted when a
   move now leaves the frame. Lint and `kit.py collide` as usual.
3. `kit.py reframe <new film> check` must say "every element and all content kept, scene times identical"; any difference listed there
   is a mistake to undo (or, if the user asked for it, say so in the hand-over).
4. Show the user the stills of both films side by side and get the OK before exporting (the gates of the source film carry over; this is
   a layout check, not a new storyboard).
