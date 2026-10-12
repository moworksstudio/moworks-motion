# Editable After Effects project

`kit.py ae <project> --run --check auto` (= [Port to AE] in the player): the film runs in Chromium, every layer is sampled 120 times a second and
fitted into sparse native keyframes with real eases → `<film>\05_AE\<name>.aep` + `footage\` + `AE-PORT.md` (what was not ported,
fonts to install) + `Audio\mix.wav` and the stems next to it (voice, music, sfx: the stems come only with the AE port; MOV / MP4 carry their mix
inside); comps at 60 fps. Full description: `docs\GUIDE.md` section 5. While it runs, give the user short step lines (recording the
motion → building in After Effects → comparing frames with the browser → copying to `05_AE\`; the player shows the same steps).

- **Needs:** After Effects (or AE Beta) open with no dialog showing. A port empties AE's caches first (3x faster), which clears AE's
  Undo history: before a port from the chat, tell the user in one line to save their open AE work. The fonts of the film installed in Windows (Roboto Flex:
  `engine\vendor\fonts\RobotoFlex-var.ttf`, right-click > Install), or AE substitutes them.
- **Before it runs:** `kit.py ae <project> --estimate` (seconds) prints its size: layers × samples, MB of data, minutes, and which elements
  bring the most layers. Tell the user when it is long (a 50 s film with 792 layers: about 21 minutes; transitions of many cells, 144 pixel
  blocks each, made most of that). Run the port in the background and wait for its end (no progress monitor: `SKILL.md` rule 6).
- **What becomes what:** scenes → precomps (transitions on the precomp layer); text → live text layers; counting numbers → Slider + Source Text
  expression; solid boxes → shape layers; **plain vector SVGs** (paths, rects, circles, ellipses, lines, polygons with flat fills /
  strokes: the character rig's parts, a film's drawn art) → native **shape layers** with their Bezier paths (user 09/10/2026: "port qua AE
  thành shape layer"); groups switched by `tl.set` (expressions, hand variants, the blink lid) → hold keys on the shape group's opacity;
  fills and straight strokes cut by a `<clipPath>` (the rig's shirt plaid / stripe / hem band) stay vector through Merge Paths (Intersect);
  gradients, shadows, other SVG (masks, gradients, filters, text inside, curved strokes under a clip), WebGL → PNG (2x still, or a sequence
  when the paint changes, an SVG's inside included); a **skew** (any layer) → AE's Transform effect "Skew (kit)" keyed with the layer (past AE's 70°: 2-4 stacked
  effects, the others linked to the first by expression; 11/10/2026 test: skewed parts as PNG sequences took 24 min); overflow /
  clip-path (inset, circle, ellipse, polygon, path; also one the timeline sets later) → track mattes; an SVG filter stroke / drop shadow (a PSD group's) → a text layer's own
  stroke + Drop Shadow, baked into the pictures of the group's other elements; `-webkit-text-stroke` → the text layer's stroke
  (`paint-order` = under / over the fill); a `<span>` styled apart inside a line (size, weight, colour) → per-letter style (AE 24.3+);
  blur, grayscale, brightness, contrast, drop-shadow → effects; motion-blur switch on for moving
  layers (comp switch off: the user turns it on); the film's audio clips → audio layers in the main comp (files copied to `footage\audio\`,
  volume and fades as Audio Levels).
- **Precomps** (user, 07/10/2026: "whatever can be precomposed, precompose it"): besides the scenes, the port precomposes every film-level layer
  (`"layers"` of film.json: the product, the background world, the credit), every element that has children (a chat bubble with its letters,
  a switch, a sticker of several parts, a group) and every run of layers that one preset made (the cells of one transition). Single layers
  stay single.
- **Image sequences** (user, 07/10/2026: "import all the files into AE as an image sequence, then use time remap", the right way on a job): every
  picture sequence becomes ONE footage of all its files + Time Remap keys: a film's 3D render (`motion/image-sequence`; with `"source"` the
  client's original files at full size) and the kit's own captured sequences (canvas, paint that changes). WebP is converted to PNG.
- **Fixing after a port: in After Effects, freely** (user, 07-08/10/2026, Test 1: "if the project content does not change and only the port went wrong,
  fix it right in AE... fix in AE first, do not port the film again or render high-res files, unless there is no other way"; there Claude first
  proposed a kit fix + a new port, then a pre-rendered video, and only rebuilt it natively after the user asked):
  1. Whatever the port got wrong while the film itself did not change (a layer out of order, a lost background, a canvas that came as a
     still, keys, precomps, names, fonts): rebuild it IN the open project with a script, natively (shapes, gradients, effects, keys),
     `kit.py ae <project> --jsx <file.jsx>` (a copy of the .aep first, check frames before / after and vs the browser). Seconds per try.
  2. A pre-rendered picture or video in AE only when no native way exists: say why.
  3. A new port only when the film itself changed (film.json / index.html).
  Report it as a table: error · fix in AE (what you rebuilt) · time.
- **How Claude drives AE (no MCP):** `engine\ae\run_jsx.ps1` posts File > Scripts > Run Script File to the AE window and fills AE's Open dialog;
  the script writes a done file. `engine\ae\ae_windows.ps1` lists AE's windows (a `#32770` dialog blocks scripts). An untitled alert from a
  script error is pictured and closed by run_jsx; never close a titled dialog ("Executing Script..." = the running script).
- **Never** in a build script: `app.executeCommand`, `openInViewer`, layer styles (AE froze for over an hour in v1).
- **Safety:** a port never closes a project with unsaved user work (it stops and says so).
- **AE slows down** after many builds in one session (text layer 0.016 s → 4 s): close the kit's own test project and `app.quit()` from a
  script, then start AE again. Never kill the process (Crash Repair dialog).
- **What AE text cannot match:** named weights only (760 → ExtraBold), no width axis. Roboto Flex optical size: the port picks the kit's
  `Roboto Flex Opsz<N>` face nearest the text's px size (install.bat installs them; not installed → the port says so and text is a little
  heavier); it also fits one-line tracking to the browser width.
- **Known gaps:** a PSD group's stroke is drawn around each element of the group (a seam where two touch); an SVG filter other than stroke /
  shadow on a text layer (noted). A text colour that switches (`text/captions` accent) becomes Source Text keys (hold); a slow colour tween
  on text becomes many of them (one per change).
- **`engine\ae` changes only in the main kit chat** (`SKILL.md` rule 9): a film chat writes what the port got wrong and how it fixed it in
  AE into its handoff (`film.md`). The main chat runs the regression check before calling a port change done: `python
  engine\tests\ae\run_cases.py` (23 cases, needs AE open, 20 - 30 minutes; `run_cases.py <name>` reruns one and keeps the others' rows) → `engine\tests\ae\results.md`; no case may get worse.
- Fixed 08/10/2026 (no workaround needed any more): canvas drawn by film code ports as a sequence (it came as one still: lost background,
  lost streaks), and layers follow the browser's real paint order (z-index; a bar with a lower z-index came above its number).
