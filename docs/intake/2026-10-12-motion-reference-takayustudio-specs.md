# Intake specs: motion-reference.takayustudio.jp, what to build

Part of the intake [2026-10-12-motion-reference-takayustudio.md](2026-10-12-motion-reference-takayustudio.md); the full list of 782
motions is in [2026-10-12-motion-reference-takayustudio-catalog.md](2026-10-12-motion-reference-takayustudio-catalog.md).

Read on 2026-10-12. Each id links to the site's own demo (`https://motion-reference.takayustudio.jp/#motion=<id>`). Names, timings
and eases are the site's; status, kit match, target, priority and spec are this intake's judgement against the kit at commit `66161ef`.
**Specs are numbers in our own words, never the site's code.**

Status: **have** = a kit preset or layout does it · **generic** = only the general-purpose `motion/anime` / `motion/tween` do it (no
named preset) · **partial** = the kit has the mechanism but lacks a defining part · **missing** = nothing in the kit · **skip** = a lesson
or an audio-only item with no film motion. Engine: `canvas` = the site draws a schematic on a 320 x 200 canvas (port the moving subject,
not the guides or readouts) · `dom` = keyframe tracks on elements (320 x 180 stage) · `text` = the site's text engine. Times in ms.

## Build targets (partial and missing), by priority

One target = one kit preset to write (NEW) or an existing preset to extend (EXTEND). The specs under it are the motions it must cover.

### text/land-in: EXTEND · high · effect · ae keyframes · 13 motion(s)
Origins named by the site: codrops (5), other:booth.pm (1).

- [`catalog-game-reward-new-record`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-new-record) **New Record Stamp** (Rewards & Loot; canvas; 2800 ms; linear; partial, medium). Closest: `data/count-up`, `text/land-in`. Proposal: text/land-in + style stamp.
  Spec: Score counts 0 -> 9,150 outExpo (0.3-1.1 s); 300 ms after it settles the stamp lands at 1.4 s: scale 2.4 -> 1 in 140 ms in-cubic, tilted -12 deg, outlined; on contact squash 12 % (160 ms sine), frame shake 2.5 px 120 ms, 8 ink dots spread outward over 400 ms; the BEST value swaps to the new score 50 ms after contact.
- [`catalog-game-impact-fx-mission-stamp`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-mission-stamp) **Mission Stamp Punch** (Game Impact FX; canvas; 4200 ms; linear; partial, medium). Closest: `text/land-in`, `hand/hit-stop`. Proposal: text/land-in + style stamp.
  Spec: Stamp (double outline) drops scale 2.6 -> 1 in 220 ms in-quad (0.6 s), tilted -12.6 deg, with a 35 % shadow offset by (scale - 1) x (10, 14) px while above the page; at contact the shrink stops: wobble 1 - 0.06 e^(-18t) cos(40t); page shakes 3 px 140 ms; 7 ink dots splash to 46-64 px (vertical x0.6) in 120 ms and stay.
- [`tx-directional-blur-slide`](https://motion-reference.takayustudio.jp/#motion=tx-directional-blur-slide) **Directional Blur Slide** (Blur & Focus; text; 550 ms; easeOutExpo; partial, high). Closest: `effect/motion-blur`, `text/shutter-slam`. Proposal: text/land-in + style whip (slide with horizontal-only blur proportional to speed).
  Spec: x -200 -> 0 px in 0.5 s expo.out; horizontal-only blur (SVG feGaussianBlur stdDeviation "b 0") with b proportional to current speed: 40 px at the start, exactly 0 when it stops (180 deg shutter ~ 0.5 x px per frame); opacity 0 -> 1 over the first 0.1 s.
- [`tx-drop-bounce-in`](https://motion-reference.takayustudio.jp/#motion=tx-drop-bounce-in) **Drop & Bounce In** (Glyph Physics; text; 900 ms; bounce.out; partial, high). Closest: `text/land-in`, `text/top-down-letters`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random).
  Spec: Per char y −200 px → 0, bounce.out 0.9 s, stagger 0.04 s (settles after 3 rebounds); optional floor shadow under each char (scaleX 1 − h/260, opacity 0.25 − h/900). Same motion as land-in 'drop' (y −360, bounce.out 0.34 s) but per character.
- [`tx-pendulum-swing`](https://motion-reference.takayustudio.jp/#motion=tx-pendulum-swing) **Pendulum Swing** (Glyph Physics; text; 2400 ms; spring(90, 4.5); partial, medium). Closest: `motion/pendulum-swing`, `motion/inertial-bounce`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random) + style swing.
  Spec: Per char, pivot 50 % 0 (top edge): rotation 90° → 0 as θ = 90° × e^(−2.25 t) × cos(9.2 t) over 2.4 s (keys 90, −38, 17, −7, 3, 0 at 0 / 18 / 36 / 54 / 72 / 100 %), stagger 0.06 s → a travelling wave.
- [`tx-squash-landing`](https://motion-reference.takayustudio.jp/#motion=tx-squash-landing) **Squash Landing** (Glyph Physics; text; 1100 ms; power2 + elastic.out; partial, medium). Closest: `text/land-in`, `house/hop`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random) + style hop (stretch / squash).
  Spec: Per char, origin 50 % 100 %: up yPercent −60 with scale 0.85 × 1.2 in 0.26 s power2.out (back to 1 × 1 by 0.36 s); fall 0.2 s power2.in stretched 0.85 × 1.2; squash 1.25 × 0.7 in 0.08 s power2.out; recover elastic.out(1, 0.4) 0.5 s. Stagger 0.06 s; 1.1 s each.
- [`tx-flip-up-3d`](https://motion-reference.takayustudio.jp/#motion=tx-flip-up-3d) **3D Flip Up** (3D & Depth; text; 800 ms; expo.out; partial, high · origin codrops). Closest: `text/land-in`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random).
  Spec: Per char: rotateX −90° → 0, yPercent 50 → 0, opacity 0 → 1, origin 50 % 100 % (baseline hinge), perspective 600–1000 px, 0.8 s expo.out (cubic-bezier(.16,1,.3,1)), stagger 40 ms.
- [`tx-swing-door`](https://motion-reference.takayustudio.jp/#motion=tx-swing-door) **Swing Door** (3D & Depth; text; 1000 ms; expo.out; partial, medium · origin codrops). Closest: `text/land-in`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random) + z offset.
  Spec: Per char: rotateY −90° → 0 around origin 100 % 50 % (right-edge hinge) with z −300 → 0, perspective 2000 px, 1 s expo.out, stagger 0.06 s starting from the last letter.
- [`tx-z-fly-in`](https://motion-reference.takayustudio.jp/#motion=tx-z-fly-in) **Fly In From Depth** (3D & Depth; text; 900 ms; back.out(1.2); partial, medium · origin codrops). Closest: `text/land-in`, `text/shared-axis-z`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random) + style zfly.
  Spec: Per char: z −800 → 0 in perspective 1000 px (far letters pulled toward the vanishing point), opacity 0.2 → 1, back.out(1.2) 0.9 s (overshoots in size just past z 0), stagger 0.04 s.
- [`tx-tumble-in`](https://motion-reference.takayustudio.jp/#motion=tx-tumble-in) **Tumbling 3D Entrance** (3D & Depth; text; 1300 ms; power1.inOut; partial, medium · origin codrops). Closest: `text/land-in`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random) + style tumble (seeded per-char ranges).
  Spec: Per char, seeded with ctx.hash: z from −1500…−600 → 0 and rotateX from −500…−200° → 0, opacity 0 → 1, perspective 2000 px, 1.3 s power1.inOut, stagger 0.05 s; back faces shaded darker.
- [`tx-horizontal-letter-drop`](https://motion-reference.takayustudio.jp/#motion=tx-horizontal-letter-drop) **Horizontal Scroll Letter Drop** (Scroll; text; 4000 ms; back.out(2) (scrub); partial, medium · origin codrops). Closest: `text/land-in`, `text/top-down-letters`. Proposal: text/land-in + param split: chars/words (stagger, from first/last/random) + style dropScale.
  Spec: Title slides xPercent 100 → 0 linear over the shot while each letter drops yPercent −900 → 0 with scale 3 → 1, back.out(2), stagger 0.05 s, so the letters land as the title arrives.
- [`tx-lyric-tame-tsume`](https://motion-reference.takayustudio.jp/#motion=tx-lyric-tame-tsume) **Lyric Motion Tame/Tsume** (Japanese; text; 300 ms; cubic-bezier(.9,0,.1,1); partial, medium · origin other:booth.pm). Closest: `text/land-in`, `text/lyric-line`, `hand/boil`. Proposal: text/land-in + param fps (posterize, 12) + ease alias tametsume in eases.js.
  Spec: Each word lands on its beat: x −70 px → 0, rotation −20° → 0, scale 1.25 → 1 over 0.3 s (9 frames at 30 fps) with cubic-bezier(.9,0,.1,1) (holds back, then snaps); time posterized to 12 fps (83 ms steps); seeded rest offset ±4 px and a small angle; landing tinted for 2 frames.
- [`tx-stamp-cutout`](https://motion-reference.takayustudio.jp/#motion=tx-stamp-cutout) **Rubber-Stamp Cut-out Pop** (Titles & Film; text; 167 ms; steps(2); partial, medium). Closest: `text/land-in`, `text/texture-mask`, `card/poster-tile-mosaic`. Proposal: text/land-in + style stamp (12 fps overshoot).
  Spec: Words on beats 0.36 s apart: set visible at scale 1.18 (small seeded rotation), set 1.0 two frames at 12 fps later (0.167 s), no tweening; the background colour hard-switches on each beat; ink-void texture on the letters (texture-mask).

### motion/camera: NEW · high · effect · ae keyframes · 12 motion(s)

- [`cam-pushin`](https://motion-reference.takayustudio.jp/#motion=cam-pushin) **Push In / Dolly In** (Camera; dom; 1600 ms; easeInOutCubic; partial, high). Closest: `motion/tween`, `camera/push-in`. Proposal: motion/camera (new): one call moves listed layers with depth factors.
  Spec: Layers listed with depth factors (background 0.2, mid 0.55, subject 1.0, foreground 1.6). Push: each layer scales about the frame centre from 1 to 1 + 0.12 x depth (subject 1.12, foreground ~1.2) over 1600 ms easeInOutCubic. Flat mode = all layers equal (a zoom).
- [`cam-pullout`](https://motion-reference.takayustudio.jp/#motion=cam-pullout) **Pull Out** (Camera; dom; 1600 ms; easeInOutCubic; partial, high). Closest: `motion/tween`, `camera/push-in`. Proposal: motion/camera (new): one call moves listed layers with depth factors.
  Spec: Pull out: each layer scale 1 + 0.3 x depth -> 1 (subject 1.3 -> 1) over 1600 ms easeInOutCubic.
- [`cam-truck`](https://motion-reference.takayustudio.jp/#motion=cam-truck) **Truck** (Camera; dom; 2000 ms; easeInOutSine; partial, high). Closest: `motion/tween`. Proposal: motion/camera (new): one call moves listed layers with depth factors.
  Spec: Truck: layer x 0 -> -120 px x depth (near -120, far -24 at depth 0.2) over 2000 ms easeInOutSine.
- [`cam-pedestal`](https://motion-reference.takayustudio.jp/#motion=cam-pedestal) **Pedestal** (Camera; dom; 2000 ms; easeInOutSine; partial, high). Closest: `motion/tween`. Proposal: motion/camera (new): one call moves listed layers with depth factors.
  Spec: Pedestal: layer y 0 -> -80 px x depth (far layer x 0.2) over 2000 ms easeInOutSine.
- [`cam-vertigo`](https://motion-reference.takayustudio.jp/#motion=cam-vertigo) **Dolly Zoom (Vertigo)** (Camera; dom; 2000 ms; easeInOutCubic; partial, medium). Closest: `camera/dolly-zoom`. Proposal: motion/camera (new), type vertigo.
  Spec: Subject layer keeps its screen size while the camera moves z 0 -> +300 (perspective 1100 px) and background layers scale 1 -> 0.6, 2000 ms easeInOutCubic; per-layer scale compensation from each layer's distance. camera/dolly-zoom solves the focal length per frame but only on its own demo content.
- [`cam-crane`](https://motion-reference.takayustudio.jp/#motion=cam-crane) **Crane / Jib** (Camera; dom; 2000 ms; easeInOutCubic; partial, medium). Closest: `motion/tween`. Proposal: motion/camera (new), type crane.
  Spec: Crane: layers rise y -100 px x depth while the stage tilts 8 deg (rotateX on a perspective parent) with a 10 % push, 2000 ms easeInOutCubic.
- [`cam-whip`](https://motion-reference.takayustudio.jp/#motion=cam-whip) **Whip** (Camera; dom; 450 ms; cubic-bezier(.9,0,.1,1); partial, medium). Closest: `transition/whip-pan-cut`. Proposal: motion/camera (new), type whip (within one scene).
  Spec: Inside one scene the camera swings x by about one framing over 450 ms cubic-bezier(.9,0,.1,1); horizontal smear (3 trailing copies at 25 %, 12 px apart, or a blur) only on the middle 4 frames; landing frame sharp.
- [`cam-parallax`](https://motion-reference.takayustudio.jp/#motion=cam-parallax) **Parallax Layers** (Camera; dom; 4000 ms; linear; partial, high). Closest: `motion/tween`. Proposal: motion/camera (new): one call moves listed layers with depth factors.
  Spec: Parallax: one travel D; foreground moves D x 1.0, mid D x 0.5, background D x 0.2, linear constant speed over the shot (demo: 4 s, D = +-60 px as a sine loop).
- [`cam-follow`](https://motion-reference.takayustudio.jp/#motion=cam-follow) **Follow with Lookahead** (Camera; dom; 600 ms; spring (lookahead); partial, low). Closest: `motion/spring-track`, `cursor/zoom-follow`. Proposal: motion/camera (new), type follow.
  Spec: Camera x target = subject x + subject velocity x 0.47 s (look-ahead ~14 frames, capped +-46 px), followed by a spring (stiffness 120, damping 20); background layers move at their depth factor (far 0.4).
- [`catalog-ui-spatial-infinite-canvas-jump`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-infinite-canvas-jump) **Infinite Canvas Jump** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, high). Closest: `flow/ui-focus-zoom`, `cursor/zoom-follow`. Proposal: camera/fly-to (new) or flow/ui-focus-zoom + hop mode (zoom dips while panning).
  Spec: Canvas with frames A and B 520 px apart (110 px vertically). The camera centre moves A to B over 1.8 s power2.inOut (0.45-2.25 s) while zoom = 2 x 0.21^(sin(pi u)) (u = eased progress): 2x at both ends, 0.42x at the midpoint, so it pulls out, travels and pushes in. Optional minimap with the viewport rectangle.
- [`catalog-ui-spatial-camera-dolly-ui`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-camera-dolly-ui) **Camera Dolly UI** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, high). Closest: `camera/push-in`, `card/depth-stack`. Proposal: camera/dolly-layers (new): film layers given a z depth, camera z move.
  Spec: Two planes: FRONT at depth z 0, BACK at z 260 (focal 360, so BACK starts at 0.58 scale). Camera z 0 to 110 over 1.5 s power2.inOut (0.4-1.9 s), back 3.0-3.9 s. Each layer scale = 360 / (360 + z - camera z) and its offset from the centre scales the same way: FRONT x1.44, BACK x1.22.
- [`catalog-ui-spatial-parallax-inspector`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-parallax-inspector) **Parallax Inspector** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, high). Closest: `camera/scroll-story`, `camera/focus-rack`. Proposal: camera/dolly-layers (new) sideways pan: each layer moves by its depth factor.
  Spec: Three layers BG / CONTENT / UI move x0.25 / x0.6 / x1 of a sideways swing: 0 to +44 px (0.35-1.05 s), hold, to -44 px (1.85-2.75 s), hold, to 0 (3.45-4.15 s), power2.inOut (700-900 ms per move).

### ease aliases (eases.js): NEW · high · - · ae keyframes · 9 motion(s)
Origins named by the site: other:gsap (2).

- [`e-whip`](https://motion-reference.takayustudio.jp/#motion=e-whip) **Whip** (Easing; dom; 500 ms; cubic-bezier(.9,0,.1,1); missing, low). Closest: none. Proposal: ease alias whip in eases.js.
  Spec: cubic-bezier(.9, 0, .1, 1); 400–600 ms, for slams and transitions (smear the fast middle).
- [`e-glide`](https://motion-reference.takayustudio.jp/#motion=e-glide) **Glide** (Easing; dom; 300 ms; cubic-bezier(.4,0,.2,1); missing, low). Closest: none. Proposal: ease alias glide in eases.js.
  Spec: cubic-bezier(.4, 0, .2, 1) (the older Material standard); 250–400 ms, near text.
- [`e-md3`](https://motion-reference.takayustudio.jp/#motion=e-md3) **Material 3 Standard** (Easing; dom; 300 ms; cubic-bezier(.2,0,0,1); missing, low). Closest: none. Proposal: ease alias md3.standard in eases.js.
  Spec: cubic-bezier(.2, 0, 0, 1); 200–300 ms for small UI, 400–500 ms for screen changes.
- [`e-md3e`](https://motion-reference.takayustudio.jp/#motion=e-md3e) **Material 3 Emphasized** (Easing; dom; 500 ms; cubic-bezier(.05,.7,.1,1); missing, low). Closest: none. Proposal: ease alias md3.emphasized in eases.js.
  Spec: cubic-bezier(.05, .7, .1, 1) (emphasized decelerate); 400–500 ms for key entrances, paired with md3.accelerate exits.
- [`e-md3a`](https://motion-reference.takayustudio.jp/#motion=e-md3a) **Material 3 Accelerate** (Easing; dom; 200 ms; cubic-bezier(.3,0,1,1); missing, low). Closest: none. Proposal: ease alias md3.accelerate in eases.js.
  Spec: cubic-bezier(.3, 0, 1, 1); 150–250 ms exits, with a fade.
- [`e-apple`](https://motion-reference.takayustudio.jp/#motion=e-apple) **Apple HIG** (Easing; dom; 350 ms; ease; missing, low). Closest: none. Proposal: ease alias css.ease in eases.js.
  Spec: cubic-bezier(.25, .1, .25, 1) (CSS 'ease'); 250–400 ms small state changes.
- [`e-slowmo`](https://motion-reference.takayustudio.jp/#motion=e-slowmo) **SlowMo** (Easing; dom; 1200 ms; SlowMo(0.7, 0.7); partial, medium · origin other:gsap). Closest: `motion/extended-arrival`. Proposal: ease alias slowmo in eases.js.
  Spec: SlowMo(0.7, 0.7) as one ease: the first 15 % of the time covers about 40 % of the distance (fast, easing into the slow part), the middle 70 % moves linearly through only about 21 % (value 0.35 + 0.3 p), the last 15 % covers the remaining ~40 %, accelerating out. For titles passing through the frame; the key moment sits in the slow middle.
- [`e-expo-scale`](https://motion-reference.takayustudio.jp/#motion=e-expo-scale) **ExpoScaleEase** (Easing; dom; 1800 ms; ExpoScaleEase(1, 8); partial, high · origin other:gsap). Closest: `camera/push-in`. Proposal: ease alias expoScale in eases.js.
  Spec: Zoom scale 1 → 8 over 1800 ms interpolated in log space: scale(p) = start × (end / start)^p, p linear or eased, so every doubling takes the same time; as a 0→1 ease for a scale tween 1→8: e(p) = (8^p − 1) / 7. Proposed alias expoScale(start, end[, inner ease]).
- [`t-ramp`](https://motion-reference.takayustudio.jp/#motion=t-ramp) **Speed Ramp into a Hit** (Timing & Rhythm; dom; 1200 ms; speed ramp; partial, medium). Closest: `transition/beat-freeze-cut`, `motion/extended-arrival`. Proposal: ease alias ramp in eases.js.
  Spec: Over a 1200 ms move into a hit: speed 100 % until 300 ms before the impact, eased down to 25 % over those 300 ms, the impact frame on the downbeat, then back to 100 % at once (short smoothing). As an ease / time-remap: ramp(slow 0.25, window 0.3 s, impact time) on any tween or block clock.

### effect/ring-pulse: NEW · high · effect · ae keyframes · 9 motion(s)

- [`pulse-focus`](https://motion-reference.takayustudio.jp/#motion=pulse-focus) **Focus Pulse** (Scale; canvas; 680 ms; easeOutCubic; partial, high). Closest: `motion/tween`, `cursor/press-ripple`. Proposal: effect/ping-ring (new).
  Spec: Ring centred on a 12 px icon: radius 16 px × scale 0.5 → 2.4, opacity 0.8 → 0, 2 px stroke, 680 ms power2.out (easeOutCubic); the icon bumps 1 → 1.06 → 1 (sine) over the first 240 ms. 500 ms after the ring starts a tooltip ('New') fades in and rises 4 px in 200 ms above it. Once; the centre never moves.
- [`focus-halo`](https://motion-reference.takayustudio.jp/#motion=focus-halo) **Focus Halo** (Attention & Emphasis; canvas; 900 ms; easeOutCubic; partial, high). Closest: `motion/tween`, `flow/ui-focus-zoom`. Proposal: effect/ping-ring (new).
  Spec: Ring on the target's outline (radius R): scale 0.75 → 1.9, opacity 0.7 → 0, 2.5 px stroke plus a 10 px wide soft copy at 35 % of that opacity, 900 ms power2.out (easeOutCubic); the target bumps 1 → 1.04 → 1 (sine) over the first 450 ms. Centre still; neighbours untouched.
- [`radial-flash`](https://motion-reference.takayustudio.jp/#motion=radial-flash) **Radial Flash** (Light & Glow; canvas; 560 ms; easeOutExpo; partial, high). Closest: `logo/logo-sting`, `effect/beat-accent`. Proposal: effect/ping-ring (new) + rays, flash.
  Spec: Hit at t0: core brightness 100 → 220 % → 100 (sine bump^0.7 over 320 ms) with an additive soft glow; the star pops: scale 1 + 0.14·e^(−7 t)·sin(22 t), first half-wave only. From 60 ms a ring: radius 0.2 → 2.3 × 40 px, opacity 0.9 → 0, stroke 4 → 1 px, 500 ms expo.out. 12 rays in two colours move out (30→60 to 36→88 px) and fade over 350 ms expo.out.
- [`catalog-ui-spatial-spatial-audio-locator`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-spatial-audio-locator) **Spatial Audio Locator** (Spatial UI & Depth; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: effect/sonar (new).
  Spec: Listener at the centre with range rings. Source dot moves (228,52) to (86,78) at 2.0-2.6 s and back by 4.2 s. Every 0.6 s a ring starts at the source's position at that moment, radius grows 90 px/s, fades over 1.4 s. A bearing arc (+-0.45 rad) turns toward the source on a spring k120 d18 and brightens when a ring reaches the listener.
- [`catalog-game-hud-minimap-ping`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-minimap-ping) **Minimap Ping** (Game HUD; canvas; 2800 ms; linear; partial, medium). Closest: `map/pin-route`, `shape/pop`. Proposal: effect/ring-pulse (new).
  Spec: Static map card; pin pops at 0.42 s (300 ms back.out). Rings from the pin: radius 4 -> 34 px (@320x200) in 1.0 s outCubic, opacity 1 -> 0, stroke 2; two rings 280 ms apart, the pair repeated 950 ms later (starts 0.45, 0.73, 1.40, 1.68 s). Distance label fades in 0.5-0.7 s; pin and label leave 2.35-2.55 s in-cubic. The map never moves.
- [`catalog-game-hud-objective-marker`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-objective-marker) **Objective Marker** (Game HUD; canvas; 2800 ms; linear; partial, low). Closest: `map/pin-route`, `motion/inertial-bounce`. Proposal: effect/ring-pulse (new) + flat ellipse ratio.
  Spec: Diamond marker drops y -24 -> 98 px (@320x200) by spring k150 d15 from 0.3 s, then bobs +-2 px (sine 5 rad/s) eased in over 1.3-1.6 s. Ground: shadow ellipse grows with nearness; two flat rings (height 0.32 x width) radius 6 -> 32 px, 700 ms outCubic, at 0.58 and 0.74 s; dashed leader from marker to ground ring; distance label. Exit up 140 px, 350 ms in-cubic at 2.35 s.
- [`catalog-game-combat-parry-window`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-parry-window) **Parry Window** (Combat & Hit FX; canvas; 2800 ms; linear; missing, low). Closest: none. Proposal: effect/ring-pulse (new) direction=in.
  Spec: Timing ring around the shield shrinks radius 54 -> 16 px (@320x200) linearly over 700 ms (0.3-1.0 s), opacity 0.3 -> 1, onto a dashed target circle. Contact: flash ring 16 -> 40 px, 350 ms outCubic; shield pushed 6 px (250 ms sine); 9-dot burst to 20 px; projectile reflected up-right at 2.4x speed; 'PARRY' pops 300 ms back.out.
- [`catalog-game-reward-level-up`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-level-up) **Level Up Burst** (Rewards & Loot; canvas; 2800 ms; linear; partial, medium). Closest: `text/anime-roll`, `house/burst-pop`. Proposal: effect/ring-pulse (new) + effect/spark-burst (new).
  Spec: XP bar fills 0.3-0.95 s inOut. Digit rolls 7 -> 8 vertically (56 px @320x200) in 200 ms back.out at 1.0 s; peak 1.2 s: number 1.3 -> 1 spring k300 d12; halo ring radius 30 -> 96 px in 600 ms outCubic, stroke 4 -> 1, fading; 24 dots in 3 colours burst to 86 px over 800 ms; 'LEVEL UP!' pops 300 ms back.out at 1.25 s; bar drains in 300 ms.
- [`catalog-game-impact-fx-shockwave-type`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-shockwave-type) **Shockwave Typography** (Game Impact FX; canvas; 4200 ms; linear; partial, high). Closest: `logo/logo-sting`, `text/headline-slam`. Proposal: effect/ring-pulse (new).
  Spec: Word scales 0 -> 1.28 in 230 ms outCubic (from 0.35 s), then to 1 by spring k300 d16; shake +-4 px 160 ms at the peak. Two flat rings (height 0.62 x width) radius 34 -> 204 px (@320x200) over 1.2 s outCubic, 80 ms apart, opacity 1 - q^2, stroke 7 -> 1 and 3.5 -> 1; 10 short radial dashes fly out 30-60 px in 400 ms. Exit 300 ms back.in.

### transition/iris-reveal: EXTEND · high · effect · ae keyframes · 9 motion(s)

- [`ripple-reveal`](https://motion-reference.takayustudio.jp/#motion=ripple-reveal) **Ripple Reveal** (Effects & Transitions; canvas; 950 ms; easeOutCubic; partial, medium). Closest: `cursor/press-ripple`, `transition/iris-reveal`, `cursor/touch`. Proposal: transition/iris-reveal + params solo (one element) and rings (echo rings).
  Spec: At a tap point (default centre): ring 1 (2.5 px stroke) radius 8 -> 88 px, opacity 0.9 -> 0, 950 ms easeOutCubic; ring 2 (1.5 px, opacity 0.5 -> 0) starts 110 ms later, ends with ring 1. Target revealed by a circle clip from the tap that grows with ring 1 (x1.05) and opacity 0 -> 1 from +80 to +700 ms easeOutCubic. Optional 5 px tap dot for 140 ms.
- [`svg-mask-reveal`](https://motion-reference.takayustudio.jp/#motion=svg-mask-reveal) **SVG Mask Reveal** (SVG & Path; canvas; 980 ms; easeOutCubic; partial, medium). Closest: `transition/iris-reveal`. Proposal: transition/iris-reveal + param solo (reveal one element, no outgoing scene).
  Spec: Element stays still; a circle clip centred at about 16 % x / 58 % y of the element grows radius 0 -> 190 px (enough to clear the far corner) over 980 ms easeOutCubic (demo: 1.6 s ease-in-out); optional thin dashed guide ring. Exit: radius back to 0 over 350 ms ease-in.
- [`tr-inset`](https://motion-reference.takayustudio.jp/#motion=tr-inset) **Inset (clip-path)** (Transitions; dom; 500 ms; easeInOutCubic; partial, high). Closest: `transition/iris-reveal`. Proposal: transition/iris-reveal + param shape inset.
  Spec: Incoming scene clipped inset(50 %) -> inset(0) from the centre over 500 ms easeInOutCubic (demo: expo.out); outgoing still. Optional reverse (the outgoing closes to the centre).
- [`tr-clock`](https://motion-reference.takayustudio.jp/#motion=tr-clock) **Clock Wipe** (Transitions; dom; 700 ms; easeInOutSine; partial, medium). Closest: `transition/showcase-mechanical`, `transition/iris-reveal`. Proposal: transition/iris-reveal + param shape clock.
  Spec: Pie clip centred on the frame, from 12 o'clock clockwise, sweep 0 -> 360 deg over 700 ms easeInOutSine, radius past the far corner; incoming scene inside the pie, outgoing still underneath. Use a polygon clip with a fixed vertex count. HF showcase-mechanical ships a Clock Wipe (Apache-2.0).
- [`tr-shapeiris`](https://motion-reference.takayustudio.jp/#motion=tr-shapeiris) **Shaped Iris** (Transitions; dom; 700 ms; easeInCubic; partial, medium). Closest: `transition/iris-reveal`, `transition/showcase-radial`. Proposal: transition/iris-reveal + param shape (polygon: heart, diamond, keyhole, star).
  Spec: Incoming scene clipped to a shape centred on the frame, scale 0 -> cover (until the shape clears every corner; ~7 x a heart 16 % of frame width) over 700 ms easeInCubic. Use a polygon clip (KI-03: clip-path path() fails in After Effects). HF showcase-radial ships a Diamond Iris.
- [`tr-flood`](https://motion-reference.takayustudio.jp/#motion=tr-flood) **Colour Flood** (Transitions; dom; 800 ms; easeInOutCubic; partial, high). Closest: `transition/iris-reveal`, `transition/fade-through`. Proposal: transition/iris-reveal + param flood (a colour disc covers, swap, uncovers).
  Spec: A solid colour disc grows from a point (default 12 % x / 80 % y) to the farthest-corner radius over 400 ms easeInCubic, covering the outgoing scene; cut to the incoming scene underneath at 400 ms; the disc shrinks back to its point 400-800 ms easeOutCubic. 800 ms total.
- [`catalog-ui-spatial-focus-portal`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-focus-portal) **Focus Portal** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, medium). Closest: `transition/iris-reveal`. Proposal: transition/iris-reveal + params radius (stop at a set size) and inner scale-in.
  Spec: Circle clip at the focus point opens radius 10 to 72 px in 0.7 s power4.out (quint) at 0.45 s; a 2 px accent rim follows its edge. Inside: paper background and a card scaling 0.6 to 1 and fading in over 0.7 s quint, starting 120 ms after the opening. Close 3.1-3.55 s power2.in.
- [`catalog-ui-material-frost-melt`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-frost-melt) **Frost Melt Unlock** (Material & Surface Motion; canvas; 4200 ms; linear; partial, low). Closest: `transition/iris-reveal`, `effect/ink-bleed-reveal`. Proposal: transition/iris-reveal + params invert (the cover shrinks to the centre) and rough edge.
  Spec: Frost layer over a card 160x100; its round mask (radius 112 to 0, vertical x0.78, edge noise +-16 %) shrinks from the edges to the centre over 1.65 s power1.inOut (0.45-2.1 s) with a thin dark rim on the melting edge; the unlocked content shows beneath; the lock icon is the last thing covered. The frost returns by a fade 3.3-3.8 s.
- [`tx-shape-mask-cut`](https://motion-reference.takayustudio.jp/#motion=tx-shape-mask-cut) **Shape-Mask Transition** (Mask & Clip; text; 600 ms; ease-in (cubic); partial, high). Closest: `transition/iris-reveal`, `transition/shader-sdf-iris`. Proposal: transition/iris-reveal + params shape (star / polygon / SVG path) and rotate.
  Spec: Next scene clipped by a 5-point star (inner radius 45 % of outer) centred on the title; radius grows from ~0.4 em of the title to past the frame diagonal (100 -> 3000 %) in 0.6 s power3.in, rotating 0 -> +34 deg; 1.5 px outline on the star edge until it leaves the frame.

### motion/squash-stretch: NEW · high · effect · ae keyframes · 8 motion(s)
Origins named by the site: other:gsap (1).

- [`heavy-stop`](https://motion-reference.takayustudio.jp/#motion=heavy-stop) **Heavy Stop** (Movement; canvas; 680 ms; easeOutQuart; partial, medium). Closest: `motion/inertial-bounce`, `hand/hit-stop`. Proposal: motion/squash-stretch (new) mode land.
  Spec: x 0 → 182 px in 462 ms power3.out (easeOutQuart), back to 175 by 680 ms sine.inOut (7 px overshoot). From 320 ms the block squashes along the travel (ease-in) to scaleX 0.82 / scaleY 1.18 at arrival, then a damped wobble k = e^(−11 t)·cos(26 t) back to 1/1 (t in s after arrival; scale 1 ∓ 0.18 k). Origin bottom, on a floor; 6 dust dots puff out over 550 ms. (Demo px.)
- [`axis-stretch`](https://motion-reference.takayustudio.jp/#motion=axis-stretch) **Axis Stretch** (Scale; canvas; 700 ms; easeInOutBack; partial, medium). Closest: `motion/tween`, `motion/echo-trail`. Proposal: motion/squash-stretch (new) mode stretch.
  Spec: Ball x 0 → 200 px (demo) in 700 ms back.inOut(1.7), back again in 700 ms. Its scale follows its own speed: scaleX = 1 + 0.7 q, scaleY = 1 − 0.35 q, q = speed / 640 px/s on the 320 px demo canvas (≈ speed / peak speed, clamped 0–1): about 170 / 65 % mid-travel, round at rest and at the back-ease turns. Optional 4 ghost copies 30 ms apart at opacity 0.1–0.4.
- [`bounce-land`](https://motion-reference.takayustudio.jp/#motion=bounce-land) **Bounce Landing** (Bounce & Reaction; canvas; 700 ms; easeOutBounce; partial, medium). Closest: `text/land-in`, `hand/hit-stop`. Proposal: motion/squash-stretch (new) mode bounce.
  Spec: Drop from 106 px (demo; recipe 130) to the floor: fall 266 ms (parabola), then bounces 52 / 22 / 8 px high lasting 225 / 142 / 86 ms (parabolic arcs), all within 700 ms (bounce.out timing). At each contact squash scaleY by 32 / 20 / 10 / 4 % (scaleX = 1/scaleY) as a 100 ms triangle centred on the contact, origin bottom. Drifts 140 px right over 780 ms; shadow scales with height.
- [`double-bounce`](https://motion-reference.takayustudio.jp/#motion=double-bounce) **Double Bounce** (Bounce & Reaction; canvas; 820 ms; easeOutBounce; partial, medium). Closest: `text/land-in`, `hand/hit-stop`. Proposal: motion/squash-stretch (new) mode bounce.
  Spec: y −100 → 0 in 287 ms (fall, ease-in), up to −55 and down in 287 ms, up to −25 and down in 246 ms (parabolas), done at 820 ms; squash 30 / 18 / 8 % at the three contacts (scaleX = 1/scaleY, 100 ms triangles, origin bottom). After the last contact a check mark draws inside (260 ms) and a ring pings (+18 px, 480 ms).
- [`waypoint-hop`](https://motion-reference.takayustudio.jp/#motion=waypoint-hop) **Waypoint Hop** (Movement; canvas; 860 ms; easeOutCubic; partial, medium). Closest: `motion/anime`, `map/pin-route`. Proposal: motion/squash-stretch (new) mode hop.
  Spec: A marker hops across 4 points ~67 px apart: each hop 250 ms (x power2.out, y = −24 to −28·sin(π q) px arc), then a 50 ms ground beat with landing squash scaleY 0.92 (120 ms sine bump); each reached point pops (scale back.out, 200 ms) and a progress line fills behind. Total 860–900 ms.
- [`squash`](https://motion-reference.takayustudio.jp/#motion=squash) **Squash & Stretch** (Principles; dom; 550 ms; easeInQuad; partial, high). Closest: `hand/hit-stop`, `text/land-in`. Proposal: motion/squash-stretch (new).
  Spec: Ball falls ~100 px in 300 ms power1.in (easeInQuad), stretching with speed up to scaleY 1.2 / scaleX 0.85; at contact it squashes to scaleY 0.75 / scaleX 1.33 (volume kept, origin bottom) for 2–4 frames, then rises 300–550 ms power1.out back to 1/1. One preset for drops, bounces (each contact squashes, weaker each time), landings after a move and speed stretch on any tween.
- [`e-custombounce`](https://motion-reference.takayustudio.jp/#motion=e-custombounce) **CustomBounce with Squash** (Easing; dom; 1200 ms; CustomBounce(strength 0.7); partial, medium · origin other:gsap). Closest: `text/land-in`, `hand/hit-stop`. Proposal: motion/squash-stretch (new) mode bounce.
  Spec: Drop to the floor with first contact at 400 ms; each bounce keeps 70 % of the previous height (strength 0.7) and lasts √0.7 of the previous, ~1200 ms in all; squash only on the 1–2 contact frames, weaker each bounce (e.g. scaleY 0.75, 0.82, 0.88), origin bottom; slight stretch in the fast fall.
- [`catalog-ui-material-clay-icon-morph`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-clay-icon-morph) **Clay Morph Icon** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `shape/anime-morph`, `house/hop`. Proposal: motion/squash-hop (new), combined with shape/anime-morph.
  Spec: Shape r27 on the floor. Wind-up squash scaleY 1 to 0.72 in 0.3 s power2.out (scaleX inverse); hop 0.66 s on a parabola, apex 62 px, stretched 1.14 at take-off; in the air it spins 90 deg and morphs square to circle (ease-in-out, 36-92 % of the hop); landing squash 0.8 then a spring k320 d11 back to 1; the ground shadow shrinks with height.

### text/captions: EXTEND · high · block · ae keyframes · 8 motion(s)
Origins named by the site: budoux (1).

- [`tx-pop-on-subtitle`](https://motion-reference.takayustudio.jp/#motion=tx-pop-on-subtitle) **Pop-On Subtitle** (Captions & Subtitles; text; 4200 ms; none (cut); partial, high). Closest: `text/captions`. Proposal: text/captions + param mode: subtitle (cut cues) + .srt timing rules in kit.py transcribe.
  Spec: Cue blocks cut on / off, no motion: ≤ 42 chars per line, ≤ 2 lines, ≤ 17–20 chars/s, min 20 frames at 24 fps (5/6 s), max 7 s, ≥ 2-frame gap between cues, times rounded to frames; plain box (black 75 %) or outline. Same rules for the .srt that transcribe writes (now 3 words / 1.2 s per line).
- [`tx-roll-up-caption`](https://motion-reference.takayustudio.jp/#motion=tx-roll-up-caption) **Roll-Up Caption** (Captions & Subtitles; text; 270 ms; easeOutCubic; partial, low). Closest: `text/captions`. Proposal: text/captions + param mode: rollup.
  Spec: 3-row window (row 1.45 em, overflow hidden); new text always lands on the bottom row; when a row completes all rows shift up 1.45 em in 0.27 s (6–10 frames) cubic-bezier(.33,1,.68,1) and the top row leaves the window.
- [`tx-live-caption-block`](https://motion-reference.takayustudio.jp/#motion=tx-live-caption-block) **Live Caption Block** (Captions & Subtitles; text; 5400 ms; none (cut); partial, low). Closest: `text/captions`. Proposal: text/captions + param mode: subtitle (cut cues) + .srt timing rules in kit.py transcribe.
  Spec: 2-line block (≤ 30 chars per line, black 80 % box) replaced wholesale by the next block on a hard cut, no scrolling or transition; pacing ≈ 240 chars per minute.
- [`tx-phrase-line-break`](https://motion-reference.takayustudio.jp/#motion=tx-phrase-line-break) **Phrase-Aware Line Break** (Captions & Subtitles; text; 550 ms; easeOutExpo; partial, low · origin budoux). Closest: `text/captions`. Proposal: text/captions + param break: phrase (no split inside compound words, balance 2 lines).
  Spec: Break subtitle lines at the phrase / clause boundary nearest the middle instead of a fixed count (study: 74 % vs 21 % preferred); for Vietnamese keep multi-syllable words (e.g. 'thành phố') on one line via a word list; text-wrap: balance.
- [`tx-jp-subtitle-timing`](https://motion-reference.takayustudio.jp/#motion=tx-jp-subtitle-timing) **Japanese Subtitle 4 cps** (Japanese; text; 2000 ms; none (cut); partial, low). Closest: `text/captions`. Proposal: text/captions + param mode: subtitle (cut cues) + .srt timing rules in kit.py transcribe.
  Spec: Display time = chars ÷ 4 per s (half-width chars count 0.5), min 0.5 s, ≤ 13 chars per line, 2 lines, 3-frame gap, punctuation replaced by spaces; for Vietnamese use a Latin-script rate (≈ 17 chars/s) instead.
- [`tx-vertical-subtitle`](https://motion-reference.takayustudio.jp/#motion=tx-vertical-subtitle) **Vertical Subtitle** (Japanese; text; 4200 ms; none (cut); partial, low). Closest: `text/captions`. Proposal: text/captions + param mode: subtitle (cut cues) + .srt timing rules in kit.py transcribe + position switch.
  Spec: While on-screen text occupies the bottom, the subtitle cuts (no transition) to another place: Japanese → vertical at the right edge (≤ 11 chars per line, 2 lines); for Vietnamese → top of the frame.
- [`tx-cinema-handwritten-subtitle`](https://motion-reference.takayustudio.jp/#motion=tx-cinema-handwritten-subtitle) **Handwritten-style Film Subtitle** (Japanese; text; 4400 ms; none (cut); partial, low). Closest: `text/captions`. Proposal: text/captions + param mode: subtitle (cut cues) + .srt timing rules in kit.py transcribe.
  Spec: Cut-in / cut-out cues (4 chars/s) in a handwritten-style subtitle face, per-glyph seeded tilt ±3° and size ±6 %, oversized dakuten; no motion.
- [`tx-telop-comment-follow`](https://motion-reference.takayustudio.jp/#motion=tx-telop-comment-follow) **Comment-Follow Telop** (Broadcast & Telop; text; 167 ms; easeOutBack; partial, medium). Closest: `text/captions`. Proposal: text/captions + param speakers (outline colour per speaker).
  Spec: Per line: white text with a thick 0.3 em outline in the speaker's colour, pop scale 0.85 → 1 + fade in 5 frames back.out(2), hold ≥ max(1.2 s, chars ÷ 4 s), out 0.13 s; same font and position for every speaker.

### data/chart-story: EXTEND · high · block · ae keyframes · 6 motion(s)

- [`catalog-data-story-threshold-wave`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-threshold-wave) **Threshold Alarm Wave** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `data/chart-story`, `data/mk-line-graph`. Proposal: data/chart-story + param threshold.
  Spec: Line (7 points) draws left -> right linearly 300-2400 ms with a head dot + value label. Dashed threshold line (5/4 dash, yellow) at value 60; the line past the crossing is red (clip from the crossing x). When the head reaches the crossing: dot pops 300 ms back.out, 3 rings radius 5 -> 39 px, 1 s easeOutCubic, 280 ms apart, opacity 1 -> 0; tag 'over' fades in +150 to +400 ms. Fade out 3600-3950.
- [`catalog-data-story-confidence-fog`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-confidence-fog) **Forecast Confidence Fog** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `data/chart-story`. Proposal: data/chart-story + param forecast (dashed continuation + widening band).
  Spec: Observed line (5 points) draws 300-1300 ms easeInOut, end dot. 'Today' divider + labels fade 1200-1500. Forecast: dashed (5/4) curve from the last point draws 1500-2800 ms easeOutCubic; behind it a band whose half-width grows linearly from 0 at today to +-34 px at the end, as 4 nested bands (100 / 72 / 46 / 22 % width) at 11 % opacity each, revealed in step with the forecast. Width bracket fades 2600-2900.
- [`catalog-data-story-delta-split`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-delta-split) **Comparison Delta Split** (Data Storytelling; canvas; 4200 ms; linear; partial, high). Closest: `data/chart-story`, `data/animated-bar-chart`. Proposal: data/chart-story + param delta (compare two bars, highlight the difference, +N label).
  Spec: Two bars on one baseline at 2 px per unit: A 40 (80 px) grows 300-1100 ms, B 64 (128 px) 400-1200 ms, easeOutExpo, labels count with them. A dashed guide from A's top extends to B 1400-1800 easeOutCubic; B's top 48 px (the delta) turns accent 1700-2000; a bracket beside B grows 1800-2150 easeOutCubic; '+24' pops 2100-2450 back.out. Exit 3500-3850 ease-in.
- [`catalog-data-story-milestone-firefly`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-milestone-firefly) **Progress Milestone Firefly** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `data/chart-story`, `data/mk-progress-stat`, `flow/onboarding-stepper-flow`. Proposal: data/chart-story + param milestones (progress type: dots light when passed, glowing head).
  Spec: Bar 8 px tall fills 0 -> 75 % over 400-2400 ms easeInOut. Milestone dots (r 6) at 0/25/50/75/100 % turn accent the frame the fill passes them. Head: glowing dot (r 7, 14 px glow, white core) at the fill end with a % tag above; 8 trail sparks at 70 ms steps behind, shrinking, fading, +-5 px seeded y drift. At 2400 ms a ring 8 -> 34 px fades over 700 ms easeOutCubic.
- [`catalog-data-story-goal-projection`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-goal-projection) **Goal Projection Arc** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `data/chart-story`. Proposal: data/chart-story + param forecast (dashed projection to a goal marker).
  Spec: Goal marker fixed from the start (ring r 8 + dot, dashed goal line, label). Actual line (5 points) draws 300-1300 ms easeInOut, end dot; divider + labels fade 1200-1500; dashed (5/4, yellow) projection curves from the last point to the goal 1500-2600 ms easeInOut with an open head dot; on arrival a ring 9 -> 29 px fades over 700 ms easeOutCubic. Fade 3600-3950.
- [`dv-scatter`](https://motion-reference.takayustudio.jp/#motion=dv-scatter) **Scatter Reveal** (Data Storytelling; dom; 600 ms; easeOutCubic; partial, medium). Closest: `data/chart-story`. Proposal: data/chart-story + type scatter.
  Spec: Axes; 24 points (r 4) rise from the x-axis to their y over 500 ms easeOutCubic, 30 ms apart (recipe 600 ms, 20 ms); then the regression line draws from its left end over 500-600 ms easeInOut in accent.

### motion/emphasis: NEW · high · effect · ae keyframes · 5 motion(s)

- [`tilt-reaction`](https://motion-reference.takayustudio.jp/#motion=tilt-reaction) **Tilt Reaction** (Rotation; canvas; 560 ms; easeOutBack; partial, medium). Closest: `motion/spring-track`, `motion/anime`. Proposal: motion/emphasis (new) style tilt.
  Spec: Rotation about the centre after a press on one side (sign follows the side): 0 → 16° in 120 ms power2.out, → −3° by 300 ms, → 0 by 480 ms (sine.inOut segments); contact shadow widens slightly with /angle/. Recipe variant: 0 → 18° (308 ms) → 0 (560 ms) back.out.
- [`nudge`](https://motion-reference.takayustudio.jp/#motion=nudge) **Nudge** (Attention & Emphasis; canvas; 520 ms; easeOutBack; partial, high). Closest: `motion/anime`, `hand/shake`. Proposal: motion/emphasis (new) style nudge.
  Spec: x keys 0 → +9 px (180 ms) → −3 px (330 ms) → 0 (520 ms), sine.inOut between keys; only the target moves (a 'Next' button), once. Same preset family: styles nod, jelly, hop, tilt (one preset with a style param, like text/land-in).
- [`attention-bounce`](https://motion-reference.takayustudio.jp/#motion=attention-bounce) **Attention Bounce** (Attention & Emphasis; canvas; 620 ms; easeOutBounce; partial, high). Closest: `house/hop`, `motion/anime`. Proposal: motion/emphasis (new) style hop.
  Spec: Bell hops in place, origin bottom: y 0 → −16 px (260 ms) → +2 (430 ms) → 0 (620 ms), sine.inOut keys; pre-squash scaleY −4 % over 80 ms before take-off, landing squash scaleY 0.92 (sine bump 360–560 ms), scaleX = 1/scaleY; contact shadow shrinks and fades with height. Once.
- [`jelly-emphasis`](https://motion-reference.takayustudio.jp/#motion=jelly-emphasis) **Jelly Emphasis** (Attention & Emphasis; canvas; 760 ms; easeOutElastic; partial, high). Closest: `motion/anime`, `hand/hit-stop`. Proposal: motion/emphasis (new) style jelly.
  Spec: Origin bottom centre; scaleX / scaleY keys 1/1 → 1.25/0.78 (260 ms) → 0.88/1.12 (430 ms) → 1.06/0.96 (590 ms) → 1/1 (760 ms), sine.inOut between keys; contact shadow width follows scaleX. Once.
- [`icon-nod`](https://motion-reference.takayustudio.jp/#motion=icon-nod) **Icon Nod** (Attention & Emphasis; canvas; 620 ms; easeOutBack; partial, high). Closest: `motion/anime`, `motion/inertial-bounce`. Proposal: motion/emphasis (new) style nod.
  Spec: transform-origin 50 % 12 % (pivot near the top edge); rotation 0 → 16° (220 ms) → −5° (440 ms) → 0 (620 ms), sine.inOut between keys; once.

### data/odometer: NEW · high · effect · ae keyframes · 4 motion(s)
Origins named by the site: number-flow (2), other:jquery-flapper (1).

- [`catalog-kinetic-type-mono-data-shuffle`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-mono-data-shuffle) **Monospace Data Shuffle** (Numbers & Data; canvas; 4200 ms; linear; partial, high). Closest: `data/number-wheel`, `data/countdown`. Proposal: data/odometer (new): roll a film number from A to B digit by digit, extra spins, stop stagger.
  Spec: Tabular mono digits, each in a clip window (1 digit wide, ~1.35 em tall), row pitch ~1.15 em; separators fixed. Digit k rolls forward (to-from mod 10) + 10*spins rows, spins alternating 1 / 2 per digit; all start 0.4 s, digit k ends at 1.1+0.12*k s, ease power2.out (outCubic). Example 03,481 -> 12,907; roll back at 2.7 s (+0.1 s per digit).
- [`tx-odometer-roll`](https://motion-reference.takayustudio.jp/#motion=tx-odometer-roll) **Odometer Digit Roll** (Numbers & Data; text; 750 ms; ease-out; partial, high · origin number-flow). Closest: `data/countdown`, `data/number-wheel`. Proposal: data/odometer (new) (same as the mono data shuffle item).
  Spec: Per digit a 0-9 strip in a window one line tall with a 0.25 em soft fade at top / bottom; on a change each digit rolls to its new digit in 750 ms ease-out, up when the value rises, down when it falls; new leading digits fade in over 350 ms and the width animates; line-height 0.85-1.
- [`tx-ticker-flash`](https://motion-reference.takayustudio.jp/#motion=tx-ticker-flash) **Price Ticker Flash** (Numbers & Data; text; 600 ms; ease-out; partial, medium · origin number-flow). Closest: `data/countdown`. Proposal: data/odometer (new) + mode ticker (changed digits slide, green / red flash, arrow).
  Spec: Value changes at cues; only changed digits move: on a rise the new digit slides in from +0.3 em below (old out up), on a fall from above, 0.35 s power3.out with fade; behind changed digits a rounded flash green / red at 32 % fading over 0.6 s power2.out; a triangle up / down beside the number in the same colour; tabular figures.
- [`tx-score-update`](https://motion-reference.takayustudio.jp/#motion=tx-score-update) **Score Update** (Numbers & Data; text; 350 ms; ease-in-out; partial, low · origin other:jquery-flapper). Closest: `text/split-flap`, `data/countdown`. Proposal: data/odometer (new) + mode flip (scoreboard flip + two flashes).
  Spec: On a score change the cell flips (old rotateX 0 -> -90, new 90 -> 0, 350 ms total ease-in-out) to the new number, then the cell background flashes twice (on 150 ms, off 150 ms, on 150 ms); names and separator stay still.

### motion/card-flip: NEW · high · effect · ae keyframes · 3 motion(s)

- [`flip-card`](https://motion-reference.takayustudio.jp/#motion=flip-card) **Card Flip** (Rotation; dom; 760 ms; easeInOutCubic; partial, high). Closest: `transition/showcase-3d`, `text/land-in`. Proposal: motion/card-flip (new).
  Spec: Card 120×80 rotates rotationY 0 → 180° in 760 ms power2.inOut, perspective 800–1100 px on the parent, hinge at the centre. At 90° (380 ms) the front is hidden and the back shown (fold to 90°, swap, unfold from −90°: backface-visibility is unreliable in renders); the back reads unmirrored. Return the same way. Params: duration, axis x / y, perspective, turns.
- [`coin-spin`](https://motion-reference.takayustudio.jp/#motion=coin-spin) **Coin Spin** (Rotation; canvas; 900 ms; easeOutQuart; partial, medium). Closest: `motion/tween`, `logo/extruded-logo`. Proposal: motion/card-flip (new) + param turns.
  Spec: rotateY 0 → 1080° (demo; recipe 900°, ending on the back) in 900 ms power3.out (easeOutQuart), perspective 320 px. Front face (star) while cos(angle) > 0, back face (ring) when < 0, swapped at each 90° (not via backface-visibility); a 7 px edge band drawn as 7·/sin/ between the faces; contact shadow scales 0.55–1 with /cos/. Ends face-on.
- [`catalog-ui-navigation-card-flip`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-card-flip) **Card Flip** (Navigation & Overlays; canvas; 2800 ms; linear; partial, medium). Closest: `transition/showcase-3d`. Proposal: motion/card-flip (new): two-faced flip with the back face hidden.
  Spec: Card 110x70 with front and back faces. rotationY 0 to 180 deg over 0.7 s power2.inOut, back after a hold; scaleY 1 + 0.06 x sin(angle) mid-flip; the face turned away is hidden (backface hidden, no mirrored text). AE: a 3D layer with two faces.

### text/slot-roll: EXTEND · high · effect · ae keyframes · 3 motion(s)
Origins named by the site: react-bits (1).

- [`catalog-data-story-odometer-cascade`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-odometer-cascade) **Metric Odometer Cascade** (Data Storytelling; canvas; 4200 ms; linear; partial, high). Closest: `data/number-wheel`, `text/slot-roll`, `data/countdown`. Proposal: text/slot-roll + params laps per digit (lower digits more), stop stagger, settle.
  Spec: Digits 1, 2, 8 + a fixed K. All reels start at 350 ms and roll (digit + laps x 10) steps, laps 1 / 2 / 3 from left to right, easeOutCubic, stopping at 1250 / 1750 / 2250 ms. On stop: settle wobble 0.2 step x sin(20 t) x e^(-10 t) and a ring flash (border grows 4 px and fades over 350 ms easeOutCubic). While fast: ghost copies +-6 px at ~14 % opacity.
- [`catalog-kinetic-type-glyph-slot-roll`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-glyph-slot-roll) **Glyph Slot Roll** (Swap; canvas; 4200 ms; linear; partial, medium). Closest: `text/slot-roll`, `text/anime-roll`. Proposal: text/slot-roll + params rows (seeded random glyphs before the target), stop stagger, overshoot ease, speed stretch.
  Spec: 6 char windows (clip, ~1.2 em tall), row pitch ~1.4 em. Each reel = 4 seeded random A-Z + target (5 rows). All start 0.3 s; reel i lasts 0.75+0.1*i s (stops 100 ms apart), ease back.out(0.5) (~6 % overshoot then settle). While moving glyph scaleY = 1+min(0.5, 0.03*speed rows/s), scaleX = 1/sqrt(scaleY). Second roll at 2.4 s to a new word, same timing. Read atlas-bundle.js:6358.
- [`tx-slot-shuffle`](https://motion-reference.takayustudio.jp/#motion=tx-slot-shuffle) **Slot Shuffle** (Typing & Decoding; text; 800 ms; power3.out; partial, medium · origin react-bits). Closest: `text/slot-roll`. Proposal: text/slot-roll + params rows (seeded random glyphs), alternate direction, speed stretch.
  Spec: Each char window holds a reel of 6 seeded random letters + the target; the reel travels 6 rows in 0.8 s power3.out, reels start 0.06 s apart; even slots scroll down, odd up; while fast, glyph scaleY up to ~1.3 (motion-blur stand-in).

### text/typewriter: EXTEND · high · effect · ae expression · 3 motion(s)
Origins named by the site: typed.js (1), other:motion.dev (1).

- [`tx-typewriter-loop`](https://motion-reference.takayustudio.jp/#motion=tx-typewriter-loop) **Type & Backspace Loop** (Typing & Decoding; text; 60 ms; steps(1); partial, high · origin typed.js). Closest: `text/typewriter`, `text/caret-swap`, `ui/typed-prompt`. Proposal: text/typewriter + params words list, erase (backspace speed), backDelay, loop.
  Spec: Type word 1 at 60 ms / char, hold 0.7 s, backspace at 30 ms / char, 0.2-0.3 s pause, type word 2, ... (loop or stop on the last); caret 2-3 px bar, solid while typing / deleting, blinks only while idle (opacity 1 <-> 0, 0.5 s per half).
- [`tx-human-typewriter`](https://motion-reference.takayustudio.jp/#motion=tx-human-typewriter) **Humanised Typewriter** (Typing & Decoding; text; 85 ms; steps(1); partial, medium · origin other:motion.dev). Closest: `text/typewriter`, `ui/typed-prompt`, `code/code-terminal-run`. Proposal: text/typewriter + param cadence human (reuse the seeded cadence of ui/typed-prompt).
  Spec: Each keystroke interval = 85 ms x (1 +- 0.5 seeded jitter); +320 ms after , . ! ? and 、。; +120 ms before words longer than ~6 chars; caret solid while typing, blinks when idle; optional normalise to a target total duration.
- [`tx-yakumono-pause`](https://motion-reference.takayustudio.jp/#motion=tx-yakumono-pause) **Punctuation-Aware Pause** (Japanese; text; 60 ms; steps (per char); partial, medium). Closest: `text/typewriter`, `ui/typed-prompt`. Proposal: text/typewriter + param pauses (punctuation).
  Spec: Per char 40–60 ms; after ',' add 0.1–0.2 s, after '.', '!', '?' add 0.25–0.4 s; closing quotes / brackets appear with the previous char and the pause comes after them.

### transition/crossfade: NEW · high · effect · ae keyframes · 3 motion(s)

- [`tr-dissolve`](https://motion-reference.takayustudio.jp/#motion=tr-dissolve) **Crossfade / Dissolve** (Transitions; dom; 500 ms; linear; partial, high). Closest: `transition/showcase-dissolve`, `transition/fade-through`. Proposal: transition/crossfade (new) transition_in preset.
  Spec: Incoming scene opacity 0 -> 1 over the outgoing one in 500 ms (atlas: ~12 frames at 24 fps), linear (sine.inOut for a softer one); the outgoing scene stays at 1 underneath (no dip to the film background) and hides at the end. HF showcase-dissolve already ships Crossfade / Color Dip / Blur Crossfade / Focus Pull (Apache-2.0) to port.
- [`tr-blur`](https://motion-reference.takayustudio.jp/#motion=tr-blur) **Blur Crossfade** (Transitions; dom; 600 ms; easeInOutSine; partial, high). Closest: `transition/showcase-dissolve`, `transition/showcase-blur`. Proposal: transition/crossfade (new), param blur (peak 14 px).
  Spec: Both scenes blur 0 -> 14 px -> 0 as a half-sine over 600 ms; incoming opacity 0 -> 1 easeInOutSine over the same 600 ms, so the swap reads at 300 ms when the blur peaks.
- [`view-crossfade`](https://motion-reference.takayustudio.jp/#motion=view-crossfade) **View Crossfade** (Layout & Navigation; canvas; 520 ms; easeInOutCubic; partial, high). Closest: `transition/fade-through`. Proposal: transition/crossfade (new) effect usable as transition_in.
  Spec: Two scenes overlap: outgoing opacity 1 to 0 and incoming 0 to 1 at the same time, 520 ms power2.inOut (easeInOutCubic), no movement, no empty frame between. Targets [out inner, in inner] as in transition/push.

### data/countdown: EXTEND · high · effect · ae keyframes · 2 motion(s)

- [`catalog-game-cinematic-countdown-go`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-countdown-go) **Countdown GO!** (Game Cinematics; canvas; 4000 ms; linear; partial, high). Closest: `data/countdown`, `text/land-in`. Proposal: data/countdown + param style=beats.
  Spec: Beats 800 ms apart from 0.3 s: digits 3, 2, 1 each fade in 80 ms and scale 1.5 -> 1 in 250 ms outExpo; at 700-800 ms into the beat they shrink to 0.85 and fade. A ring (r 52, stroke 4 @320x200) depletes clockwise over each beat. 'GO!' at 2.7 s: 300 ms back.out, accent ring, burst ring r 52 -> 82 fading 500 ms; 4 pips light per beat. Out 3.55-3.8 s in-cubic.
- [`tx-countdown-zoom`](https://motion-reference.takayustudio.jp/#motion=tx-countdown-zoom) **Countdown Zoom** (Numbers & Data; text; 1000 ms; back.out → ease-in; partial, high). Closest: `data/countdown`, `hand/circle-pointer`. Proposal: data/countdown + param style zoom (one big number per second).
  Spec: Per second one number: scale 0.6 -> 1 in 0.15 s back.out(1.7) with opacity 0 -> 1, then scale 1 -> 2.2 over the remaining 0.85 s (power2.in) while opacity 1 -> 0; a thin ring round it sweeps 0 -> 360 deg once per second (linear).

### effect/letterbox: NEW · high · effect · ae keyframes · 2 motion(s)

- [`catalog-game-cinematic-letterbox-focus`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-letterbox-focus) **Letterbox Focus** (Game Cinematics; canvas; 2800 ms; linear; partial, high). Closest: `camera/push-in`. Proposal: effect/letterbox (new).
  Spec: Black bars grow from 0 to 15 % of the frame height each (top and bottom; ~2.35:1 from 16:10) while the scene scales 1 -> 1.14 around a focus point (62 %, 54 %), both 1.1 s inOut from 0.3 s on the same curve; caption fades in 1.2-1.5 s; everything reverses over 400 ms at 2.3 s.
- [`tx-letterbox-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-letterbox-reveal) **Letterbox Reveal** (Titles & Film; text; 800 ms; easeInOut; missing, high). Closest: `transition/iris-reveal`. Proposal: title/letterbox (new).
  Spec: Frame starts black: clip-path inset(50 % 0) → inset(12.8 % 0) (2.39 : 1 inside 16 : 9, 138 px bars at 1080 p) in 0.8 s cubic-bezier(.65,0,.35,1) after 0.3 s; the title fades in over 0.5 s starting 0.5 s into the open, just before the bars settle.

### text/bar-wipe: NEW · high · effect · ae keyframes · 2 motion(s)

- [`tx-bar-wipe-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-bar-wipe-reveal) **Bar Wipe Reveal** (Mask & Clip; text; 800 ms; ease-in-out; partial, high). Closest: `lower/mask-reveal`. Proposal: text/bar-wipe (new): the lower/mask-reveal bar + clip on any text line.
  Spec: Per line (80 ms apart): accent bar (line height x1.06, 8 px past each side) scaleX 0 -> 1 from the left in 0.4 s power2.inOut, then 1 -> 0 toward the right in 0.4 s; the text is clipped to the area left of the bar trailing edge, so it appears as the bar pulls away. Exit mirrors (bar grows over the text, text clipped right of the leading edge).
- [`tx-diagonal-cut-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-diagonal-cut-reveal) **Diagonal Cut Reveal** (Mask & Clip; text; 700 ms; expo.out; partial, medium). Closest: `text/colorama-wipe`, `lower/mask-reveal`. Proposal: text/bar-wipe (new) + params angle (15 deg), unit word, blade.
  Spec: Per word (120 ms apart): clip polygon with a leading edge leaning 15 deg (top ahead of bottom by height x tan15) moves from left of the word to past its right edge, 0.7 s expo.out; a 5 px accent blade rides the edge and fades over 0.3 s after. Exit: the edge sweeps on hiding the word (0.5 s expo.in, 80 ms apart).

### text/kinetic-type-swap: EXTEND · high · effect · ae keyframes · 2 motion(s)
Origins named by the site: react-bits (1), aceternity (1).

- [`tx-rotating-letters-spring`](https://motion-reference.takayustudio.jp/#motion=tx-rotating-letters-spring) **Rotating Text (Spring)** (Swap; text; 450 ms; spring(300, 25); partial, high · origin react-bits). Closest: `text/kinetic-type-swap`, `text/anime-roll`. Proposal: text/kinetic-type-swap + params by letters, spring ease, pill (background resizes on a spring).
  Spec: Word in a rounded accent pill (padding 14 px). Every 2 s: old letters y 0 -> -120 % and fade, new letters y +100 % -> 0 and fade in, each on a spring (stiffness 300, damping 25, ratio ~0.72), letters 30 ms apart; new word waits until the old leaves (~0.22 s). Pill width / height track the new word size on the same spring.
- [`tx-layout-word-insert`](https://motion-reference.takayustudio.jp/#motion=tx-layout-word-insert) **Layout-animated Word Swap** (Layout & Reflow; text; 400 ms; spring(300, 30); partial, high · origin aceternity). Closest: `text/kinetic-type-swap`, `text/center-build`. Proposal: text/kinetic-type-swap + param reflow (slot width follows each word).
  Spec: On each swap (every 2–3 s) the slot's width animates to the new word's width on a spring (stiffness 300, damping 30, ~0.4 s, ≈ cubic-bezier(.2,.9,.3,1.05)); the words after it and the container slide along; the old word exits up, the new one enters from below inside the slot.

### text/marker-highlight: EXTEND · high · effect · ae keyframes · 2 motion(s)
Origins named by the site: aceternity (1).

- [`tx-keyword-punch`](https://motion-reference.takayustudio.jp/#motion=tx-keyword-punch) **Keyword Punch** (Emphasis; text; 200 ms; easeOutQuad; partial, high). Closest: `text/marker-highlight`, `text/headline-slam`, `effect/beat-accent`. Proposal: text/marker-highlight + style punch.
  Spec: Held line; keyword (matched by text) scales 1 -> 1.3 in 120 ms power2.out, then 1.3 -> 1.1 in 120 ms power2.inOut and stays 1.1; colour -> accent over 80 ms; other words opacity 1 -> 0.5; same-line words shift sideways by half the keyword growth; 8 accent ticks burst radially from the word (+12 px over 380 ms, fade).
- [`tx-pointer-highlight-box`](https://motion-reference.takayustudio.jp/#motion=tx-pointer-highlight-box) **Pointer Highlight Box** (Emphasis; text; 1000 ms; easeInOut; partial, medium · origin aceternity). Closest: `cursor/marquee-select`, `hand/box-label`. Proposal: text/marker-highlight + style box (rectangle grows from top-left with a pointer on the corner).
  Spec: Box 1.5 px accent border, padding 0.3 em round the phrase; width and height 0 -> 100 % together from a fixed top-left corner, 1 s power1.inOut; a small pointer arrow (~0.5 em) rides the bottom-right corner; optional 10 % fill.

### text/particle-dissolve: EXTEND · high · block · ae png · 2 motion(s)

- [`pt-coalesce`](https://motion-reference.takayustudio.jp/#motion=pt-coalesce) **Particles Coalesce** (Particles; dom; 1200 ms; spring; partial, high). Closest: `text/particle-dissolve`, `code/code-particle-assemble`, `effect/particle-image-reveal`. Proposal: text/particle-dissolve + param src (sample an SVG / PNG logo instead of text).
  Spec: 60 particles (r 3) from seeded random spots over the frame to points on the target outline (heart in the demo, a logo in a film), each on a spring (stiffness 60, damping 10, small overshoot), starts spread over 0-300 ms; ~1200 ms; exit reverses in 500 ms ease-in.
- [`catalog-ui-material-sand-dissolve`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-sand-dissolve) **Sand Dissolve State** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `text/particle-dissolve`, `transition/grid-pixelate`. Proposal: text/particle-dissolve + any target and mode fall (grains drop column by column).
  Spec: Element cut into 18 x 9 grains of 7 px. Grain in column i starts at 0.5 s + 60 ms x i + hash x 0.22 s: trembles +-0.6 px for 0.15 s, then falls y + 300 tau^2 px (g about 600 px/s^2), drifts x +-18 px x tau, shrinks 1.5 px and fades between tau 0.25-0.6 s. The next state sits underneath. Reform from 3.3 s, +20 ms per column.

### text/split-halves: NEW · high · effect · ae keyframes · 2 motion(s)

- [`catalog-game-impact-fx-finisher-cut`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-finisher-cut) **Finisher Title Cut** (Game Impact FX; canvas; 4200 ms; linear; missing, high). Closest: none. Proposal: text/split-halves (new).
  Spec: Word cut at its horizontal middle: top half slides in from the left, bottom half from the right, each from ~94 % of the frame width away, 450 ms outExpo (0.4 s), meeting with an opposite nudge of 3 e^(-10t) cos(30t) px; a slash line draws along the seam in 200 ms inOutCubic, its tail follows in 350 ms outCubic; small 'K.O.' label fades in 1.1-1.4 s. Exit: halves fly out opposite ways, 350 ms in-expo.
- [`tx-split-halves`](https://motion-reference.takayustudio.jp/#motion=tx-split-halves) **Split-Halves Slide** (Mask & Clip; text; 700 ms; expo.out; missing, medium). Closest: none. Proposal: text/split-halves (new).
  Spec: Two stacked copies of the line: A clipped to the top half (inset(-0.4em 0 50% 0)), B to the bottom half (inset(50% 0 -0.3em 0)); A x -200 px -> 0, B x +200 px -> 0, 0.7 s expo.out together, locking on the split line; exit reverses (A +200, B -200, 0.5 s expo.in). Keep room for Vietnamese marks.

### transition/letter-zoom: NEW · high · effect · ae keyframes · 2 motion(s)
Origins named by the site: codrops (1).

- [`tr-letter`](https://motion-reference.takayustudio.jp/#motion=tr-letter) **Mask Wipe through Letterforms** (Transitions; dom; 900 ms; easeInExpo; partial, high). Closest: `text/svg-mask-reveal`, `transition/type-match-cut`. Proposal: transition/letter-zoom (new).
  Spec: Incoming scene shown only inside one huge heavy letter (or short word) centred on the frame: 0-400 ms the letter mask appears, 400-900 ms the mask scales 1 -> 30 easeInExpo until a stroke covers the frame, then the mask is removed. Align the letter's centre with the next subject. In AE: text layer as track matte.
- [`tx-text-window-zoom`](https://motion-reference.takayustudio.jp/#motion=tx-text-window-zoom) **Text Window Zoom** (Scroll; text; 4200 ms; none (scrub); partial, high · origin codrops). Closest: `text/svg-mask-reveal`. Proposal: transition/letter-zoom (new).
  Spec: Word filled with the next image (background-clip: text); scale 1 → 40 with power2.in (reads as steady exponential speed) from an origin inside a thick stroke (e.g. 47 % 55 %); over the last 15 % the full image fades in (opacity 0 → 1) so only the image remains; ~2–3 s.

### transition/push: EXTEND · high · effect · ae keyframes · 2 motion(s)

- [`page-transition-stack`](https://motion-reference.takayustudio.jp/#motion=page-transition-stack) **Page Stack Transition** (Layout & Navigation; canvas; 720 ms; easeInOutCubic; partial, high). Closest: `transition/push`. Proposal: transition/push + params direction up and under (the old scene stays, scales .94, rises 10 px, dims 45 %).
  Spec: Incoming scene slides up from y = 100 % to 0 with rounded top corners (10 px); the outgoing scene stays under it, scales 1 to 0.94 about its centre, rises 10 px and darkens 0 to 45 % (overlay). 720 ms power2.inOut (easeInOutCubic). Back: the exact reverse.
- [`catalog-ui-navigation-parallax-push`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-parallax-push) **Parallax Push** (Navigation & Overlays; canvas; 2800 ms; linear; partial, high). Closest: `transition/push`. Proposal: transition/push + param under 0.3 (the old scene travels 30 % and dims 40 %).
  Spec: Incoming page slides from x 100 % to 0 (full travel) while the outgoing page moves only to -30 % and darkens 0 to 40 %; a soft 6 px shadow strip on the incoming page's left edge (opacity 0.5 x progress). 700 ms power2.inOut (easeInOutCubic). Back: the exact reverse.

### motion/clip-open: NEW · high · effect · ae keyframes · 1 motion(s)

- [`image-clip-scrub`](https://motion-reference.takayustudio.jp/#motion=image-clip-scrub) **Image Clip Scrub** (Web Scroll; canvas; 1200 ms; easeInOutCubic; missing, high). Closest: none. Proposal: motion/clip-open (new).
  Spec: The picture stays fixed; its clip-path inset goes from 12 % (top / bottom) and 42 % (left / right) to 0, corner radius 22 to 6 px, 1.2 s power2.inOut (easeInOutCubic). Optional close: the reverse in 0.5 s. The image itself does not scale or move.

### shape/burst-lines: NEW · high · effect · ae keyframes · 1 motion(s)

- [`sh-burst`](https://motion-reference.takayustudio.jp/#motion=sh-burst) **Radiating Burst Lines** (SVG & Path; dom; 400 ms; easeOutCubic; missing, high). Closest: none. Proposal: shape/burst-lines (new).
  Spec: 12 straight strokes (4 px, round caps) at 30 deg steps around a centre (behind a word, number or '!'). Line i starts at i x 20 ms (recipe 30 ms): its head extends from radius 30 to 80 px over 300 ms easeOutCubic, then its tail follows from 30 to 80 px over the next 300 ms easeInCubic, so each line flies out and vanishes; ~850 ms total.

### text/caption-camera-follow: EXTEND · high · block · ae keyframes · 1 motion(s)

- [`tx-kinetic-camera`](https://motion-reference.takayustudio.jp/#motion=tx-kinetic-camera) **Kinetic Camera Follow** (Layout & Reflow; text; 400 ms; cubic-bezier(.8,0,.2,1); partial, high). Closest: `text/caption-camera-follow`. Proposal: text/caption-camera-follow + param layout: free (positions, 90° turns, zoom per phrase).
  Spec: Phrases placed on a big stage with varied sizes, some rotated 90°; the stage (inverse camera) moves to each phrase's centre, angle and zoom in 0.4 s (8–12 frames) cubic-bezier(.8,0,.2,1); 0.3 s into the move the phrase pops scale 0.5 → 1 + fade, 0.24 s back.out(2); hold 0.45 s; a final pull-back shows the whole layout.

### text/colorama-wipe: EXTEND · high · effect · ae png · 1 motion(s)

- [`tx-soft-mask-wipe`](https://motion-reference.takayustudio.jp/#motion=tx-soft-mask-wipe) **Soft Gradient Mask Wipe** (Mask & Clip; text; 1200 ms; ease-out; partial, high). Closest: `text/colorama-wipe`, `logo/svg-reveal`, `text/svg-mask-reveal`. Proposal: text/colorama-wipe + param plain (alpha-only soft edge, no colour cycle).
  Spec: Text masked by a linear-gradient (opaque -> transparent, soft edge ~70 px; mask-size 250 % of the width); mask-position 100 % -> 0 over 1.2 s power2.out, revealing left -> right; exit: the edge keeps going the same way (0.8-1.2 s ease-in).

### text/fit-stack: NEW · high · effect · ae keyframes · 1 motion(s)

- [`tx-stacked-justified`](https://motion-reference.takayustudio.jp/#motion=tx-stacked-justified) **Stacked Justified Words** (Layout & Reflow; text; 300 ms; easeOutCubic; missing, high). Closest: `text/kinetic-cascade`. Proposal: text/fit-stack (new).
  Spec: One word per line, each scaled to the same block width by its ink bounds (scale = target width ÷ word width, capped), line-height 0.9; words enter one by one every 0.45 s (8–10 frames also used): yPercent 100 → 0 + opacity 0 → 1, 0.3 s power3.out, each new word lifting the stack.

### text/headline-slam: EXTEND · high · effect · ae keyframes · 1 motion(s)

- [`tx-slam-in-title`](https://motion-reference.takayustudio.jp/#motion=tx-slam-in-title) **Slam-In Title** (Titles & Film; text; 200 ms; cubic-bezier(.7,0,1,1); partial, high). Closest: `text/headline-slam`, `hand/shake`. Proposal: text/headline-slam + params ease (power3.in) and blur (20 px → 0).
  Spec: Title scale 3 → 1, blur 20 → 0 px, opacity 0 → 1 (full by 20 %) in 0.2 s (4–6 frames) cubic-bezier(.7,0,1,1), fastest at the stop; then the stage shakes x 8, −6, 3, 0 px and y −5, 4, −2, 0 px over 0.16 s (one value per frame).

### text/mask-rise: EXTEND · high · effect · ae keyframes · 1 motion(s)

- [`tx-scroll-clip-write`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-clip-write) **Scroll Clip Write-on** (Scroll; text; 3600 ms; linear (scroll); partial, high). Closest: `text/mask-rise`, `lower/mask-reveal`. Proposal: text/mask-rise + param direction: left/right/up/down (clip wipe).
  Spec: Whole block uncovered left → right: clip-path inset(−0.4 em 100 % −0.3 em 0) → inset(−0.4 em 0 % −0.3 em 0), linear (scrub) or power2.inOut, ~1.2–2 s; nothing else moves; keep the vertical room for Vietnamese marks.

### text/outline-fill: NEW · high · effect · ae keyframes · 1 motion(s)

- [`tx-outline-fill-sweep`](https://motion-reference.takayustudio.jp/#motion=tx-outline-fill-sweep) **Outline To Fill Sweep** (Mask & Clip; text; 1000 ms; ease-in-out; partial, high). Closest: `text/outline-to-fill`. Proposal: text/outline-fill (new effect on the film text: stroke first, then a left-to-right fill sweep).
  Spec: Outline copy (transparent fill, 1.5 px stroke) fades in 0.2 s and stays on top; 10-15 frames later a filled copy underneath is revealed by clip inset(right 100 % -> 0) over 1 s power2.inOut.

### text/slash-reveal: NEW · high · effect · ae keyframes · 1 motion(s)

- [`catalog-game-impact-fx-slash-reveal`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-slash-reveal) **Directional Slash Reveal** (Game Impact FX; canvas; 4200 ms; linear; partial, high). Closest: `lower/mask-reveal`. Proposal: text/slash-reveal (new).
  Spec: A slash line tilted ~24 deg from vertical crosses the word from -25 % to 125 % of the width in 350 ms inOutCubic (0.5 s); the word's mask edge is exactly the line (shown behind it); a 70 px translucent accent band trails it. Then a ghost line drifts 30 px and fades in 400 ms; a few sparks ride the line; underline grows 96 px (300 ms outCubic).

### text/slice-in: NEW · high · effect · ae keyframes · 1 motion(s)

- [`tx-split-bars-title`](https://motion-reference.takayustudio.jp/#motion=tx-split-bars-title) **Sliced Bars Title** (Titles & Film; text; 700 ms; easeOutExpo; missing, high). Closest: `house/super-slide`. Proposal: text/slice-in (new).
  Spec: 6 copies of the title, each clipped to one horizontal strip (16.66 % high): odd strips from xPercent −120, even from +120 → 0, 0.7 s expo.out (cubic-bezier(.16,1,.3,1)), stagger 0.06 s top → bottom; a thin accent bar leads each strip by ~2 frames; exit flies apart the same way.

### transition/blinds: NEW · high · effect · ae keyframes · 1 motion(s)

- [`tr-blinds`](https://motion-reference.takayustudio.jp/#motion=tr-blinds) **Slats / Blinds** (Transitions; dom; 700 ms; easeOutCubic; partial, high). Closest: `transition/showcase-cover`. Proposal: transition/blinds (new).
  Spec: 7 vertical slats of equal width; slat i (left to right) starts at i x 50 ms and opens its width 0 -> full from its left edge over 400 ms easeOutCubic, revealing the incoming scene; ~700 ms total. HF showcase-cover ships horizontal and vertical blinds (Apache-2.0).

### transition/blocks: NEW · high · effect · ae keyframes · 1 motion(s)

- [`tr-blocks`](https://motion-reference.takayustudio.jp/#motion=tr-blocks) **Staggered Blocks** (Transitions; dom; 800 ms; easeInOutCubic; partial, high). Closest: `transition/showcase-cover`, `transition/grid-pixelate`. Proposal: transition/blocks (new).
  Spec: 8 x 5 grid of solid accent tiles. Cover: tile (col i, row j) delayed (i + j) x 30 ms, scale 0 -> 1 about its centre, ~250 ms easeOutCubic, frame covered by 400 ms; cut to the incoming scene; clear in the same diagonal order, scale 1 -> 0 easeInCubic, 400-800 ms.

### transition/card-flip: NEW · high · effect · ae keyframes · 1 motion(s)

- [`tr-flip`](https://motion-reference.takayustudio.jp/#motion=tr-flip) **3D Card Flip** (Transitions; dom; 600 ms; easeInOutCubic; partial, high). Closest: `transition/showcase-3d`. Proposal: transition/card-flip (new).
  Spec: Outgoing scene rotateY 0 -> 90 deg (perspective origin on the hinge, slight 0.9 scale during the turn), at 300 ms hide it and show the incoming from -90 -> 0 deg; 600 ms easeInOutCubic overall; never show a back face (fold to 90 and swap). HF showcase-3d ships a Card Flip (Apache-2.0).

### transition/cover-wipe: NEW · high · effect · ae keyframes · 1 motion(s)

- [`page-wipe`](https://motion-reference.takayustudio.jp/#motion=page-wipe) **Page Wipe** (Layout & Navigation; canvas; 780 ms; easeInOutQuint; partial, high). Closest: `hand/scribble-transition`, `transition/clone-wall`. Proposal: transition/cover-wipe (new): a solid panel covers, the scenes swap, the panel uncovers.
  Spec: One accent panel over both scenes, 780 ms total, ease cubic-bezier(.83,0,.17,1) (about power4.inOut). Leading edge sweeps left to right over 0-374 ms (panel scaleX 0 to 1, origin left); the scenes swap at 390 ms while fully covered; the trailing edge follows over 406-780 ms (scaleX 1 to 0, origin right) so the panel exits right.

### transition/directional-wipe: EXTEND · high · effect · ae keyframes · 1 motion(s)

- [`tr-wipe`](https://motion-reference.takayustudio.jp/#motion=tr-wipe) **Linear Wipe** (Transitions; dom; 500 ms; easeInOutCubic; partial, high). Closest: `transition/directional-wipe`. Proposal: transition/directional-wipe + param plain (clip edge only, optional edge bar).
  Spec: Incoming scene revealed by a straight clip edge, clip width 0 -> 100 % over 500 ms easeInOutCubic; the outgoing scene does not move; optional 4 px brand-colour bar riding the edge. Directions left / right / up / down.

### transition/zoom-through-transition: EXTEND · high · effect · ae keyframes · 1 motion(s)

- [`tr-zoomthrough`](https://motion-reference.takayustudio.jp/#motion=tr-zoomthrough) **Scale-through / Zoom Through** (Transitions; dom; 600 ms; easeInOutCubic; partial, high). Closest: `transition/zoom-through-transition`, `transition/showcase-scale`. Proposal: transition/zoom-through-transition + param mode scale (old grows and fades, new grows from 0.8).
  Spec: Outgoing scene scale 1 -> 1.3 and opacity 1 -> 0 over 0-350 ms; incoming scale 0.8 -> 1 with opacity 0 -> 1 over 250-600 ms; easeInOutCubic, centre origin; 600 ms total.

### ui/lucky-wheel: NEW · high · block · ae keyframes · 1 motion(s)

- [`catalog-game-cinematic-lucky-roulette`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-lucky-roulette) **Lucky Roulette** (Game Cinematics; canvas; 3800 ms; linear; missing, high). Closest: none. Proposal: ui/lucky-wheel (new).
  Spec: 6 segments of 60 deg, alternating colours, labels on radius 40 of 60 px (@320x200). Spin 3 turns + 100 deg, ease outQuart, over 2.05 s (0.3-2.35 s); labels drop to 20 % opacity while speed > 1 turn/s. Top pointer kicks back up to 0.5 rad x speed each time a divider passes, decaying exp(-6 x fraction past it). Winning segment fills accent at 2.4 s (150 ms); result label 0.8 -> 1 back.out 250 ms.

### ui/hud-bar: NEW · medium · block · ae keyframes · 7 motion(s)

- [`catalog-game-hud-hp-ghost-bar`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-hp-ghost-bar) **HP Ghost Bar** (Game HUD; canvas; 2800 ms; linear; partial, low). Closest: `data/chart-story`. Proposal: ui/hud-bar (new) mode=ghost.
  Spec: Bar 100 -> 58 % at the hit (0.6 s): fill jumps instantly; a darker ghost fill waits 400 ms then shrinks to 58 % in 500 ms inOut (opacity 1 for the first 100 ms, then 0.7). Bar shakes +-3 px for 200 ms (random per frame, decaying). Loss label '-42' between both ends while the gap > 3 %. Heal back 400 ms inOut at 2.3 s. Skip the time graph (lesson).
- [`catalog-game-hud-stamina-pulse`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-stamina-pulse) **Stamina Pulse** (Game HUD; canvas; 2800 ms; linear; partial, low). Closest: `data/chart-story`. Proposal: ui/hud-bar (new) mode=threshold-pulse.
  Spec: Bar steps 80 -> 52 -> 22 % (each 120 ms outCubic, at 0.3 s and 0.75 s); dashed threshold tick at 30 %. Below it the fill turns red and pulses: opacity 1 -> 0.5 and an outline 3 px outside at 0 -> 80 % alpha, cosine period 800 ms, envelope in 200 ms from 0.9 s. Recovery to 80 % (2.1-2.6 s outCubic) stops the pulse in 180 ms. '-28' floats up 14 px / 700 ms.
- [`catalog-game-hud-resource-cap`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-resource-cap) **Resource Cap** (Game HUD; canvas; 2800 ms; linear; partial, low). Closest: `data/chart-story`. Proposal: ui/hud-bar (new) mode=cap.
  Spec: Bar 35 -> 100 % linear over 1.0 s (0.3-1.3 s). '+50' chips every 250 ms fall 14 px in 200 ms in-quad and fade. After the cap, chips fall 6 px, bounce up 7 px, turn grey, struck through, fade 300-550 ms. At full the bar turns red; a 'FULL' pill scales 0.9 -> 1 in 120 ms and blinks (cosine, 240 ms period) until 1.78 s, then holds. Reset 2.3-2.7 s inOut.
- [`catalog-game-combat-combo-counter`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-combo-counter) **Combo Counter** (Combat & Hit FX; canvas; 2800 ms; linear; partial, low). Closest: `text/land-in`, `data/count-up`. Proposal: ui/hud-bar (new) mode=grace.
  Spec: Hits at 0.35, 0.70, 1.05, 1.40 s: number steps +1 with scale 1.4 -> 1 in 250 ms outCubic; grace bar (80 x 6 px @320x200) refills in 60 ms then drains linearly over 900 ms; when empty the combo breaks: number greys, drops 10 px, shrinks 15 % and fades over 340 ms, 'broken' label. Hit flash 120 ms and a 12 % squash (250 ms sine) on the hitter.
- [`catalog-game-progress-energy-refill`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-energy-refill) **Energy Refill** (Progression & Quests; canvas; 2800 ms; linear; partial, medium). Closest: `data/chart-story`, `data/count-up`. Proposal: ui/hud-bar (new) mode=charge.
  Spec: Battery outline with 5 segments; fill 15 -> 100 % inOut over 1.45 s (0.45-1.9 s) while its opacity pulses 1 -> 0.6 at 2.5 Hz; percent readout counts. At full the pulse stops, battery pops 5 % (200 ms sine), 'FULL' pops 200 ms back.out, bolt turns white past 52 %. Hold to 2.5 s, drain 220 ms in-cubic.
- [`catalog-game-progress-xp-overflow`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-xp-overflow) **XP Overflow** (Progression & Quests; canvas; 2800 ms; linear; partial, low). Closest: `data/chart-story`, `text/anime-roll`. Proposal: ui/hud-bar (new) mode=overflow.
  Spec: Bar 80 -> 100 % (500 ms outCubic, 0.3 s); white flash over the bar fading 400 ms; level rolls 07 -> 08 (36 px, 250 ms back.out at 0.85 s, bump 15 %); bar resets to 0 and refills to the carried 25 % (400 ms outCubic at 1.2 s) with a '+25' bracket; '+45 XP' rises 6 px; three chips light at 0.8, 1.0, 1.4 s.
- [`catalog-game-impact-fx-combo-heat`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-combo-heat) **Combo Heat Escalation** (Game Impact FX; canvas; 4200 ms; linear; partial, low). Closest: `motion/spring-track`, `data/count-up`. Proposal: ui/hud-bar (new) mode=heat.
  Spec: Hits at 0.35, 0.8, 1.15, 1.45, 1.7, 1.9 s: count 1 -> 6 with pop 1 + 0.35 e^(-12t) cos(20t); colour stages blue (<= 2), yellow (<= 4), red; gauge (200 x 12 px @320x200) follows n/6 by spring k260 d22, colour cross-fades 150 ms; from 5 hits, sparks rise 30 px above the gauge; reset 3.4-3.8 s.

### text/char-loop: NEW · medium · effect · ae keyframes · 6 motion(s)
Origins named by the site: other:splitting.js (1).

- [`tx-zero-gravity-drift`](https://motion-reference.takayustudio.jp/#motion=tx-zero-gravity-drift) **Zero-gravity Drift** (Glyph Physics; text; 4500 ms; sine.inOut; partial, medium). Closest: `motion/float-list`, `house/deco-float`. Proposal: text/char-loop (new), mode drift.
  Spec: Per char: x, y ±12 px and rotation ±15°, each with its own seeded period 3–6 s (ctx.hash), sine.inOut back and forth; amplitude ramps 0 → 1 over ~0.8 s to lift off; letters drift apart and back, never in unison.
- [`tx-wave-loop`](https://motion-reference.takayustudio.jp/#motion=tx-wave-loop) **Wave Loop** (Loops & Decoration; text; 1200 ms; ease-in-out; partial, medium · origin other:splitting.js). Closest: `house/bob`, `motion/float-list`. Proposal: text/char-loop (new), mode wave.
  Spec: Per char y 0 → −0.3 em → 0 over 1.2 s ease-in-out, repeating, delay 60–100 ms × i (phase 0.3–0.5 rad per char) so a wave travels right; AE: amount 50 + 50 × sin(2π f t + index × 0.5).
- [`tx-scale-breathe`](https://motion-reference.takayustudio.jp/#motion=tx-scale-breathe) **Wiggly Scale Breathe** (Loops & Decoration; text; 1600 ms; sine; partial, medium). Closest: `house/breathe`. Proposal: text/char-loop (new), mode breathe.
  Spec: Per char scale 0.9 ↔ 1.12 (100 ± 12 %), origin 50 % 80 %, each char with its own seeded rate 0.5–0.75 Hz (period 1.3–2 s) and phase, sine back and forth.
- [`tx-jump-sequence`](https://motion-reference.takayustudio.jp/#motion=tx-jump-sequence) **Sequential Hop** (Loops & Decoration; text; 400 ms; ease-out / ease-in (parabola); partial, medium). Closest: `house/hop`. Proposal: text/char-loop (new), mode hop.
  Spec: Cycle 2.4 s: each char hops y 0 → −40 % (0.2 s power2.out) → 0 (0.2 s power2.in), squash 1.1 × 0.86 on landing, back to 1 by 22 % of the cycle; delay 0.1 s per char; 1 s rest after the last.
- [`tx-y-spin-stagger`](https://motion-reference.takayustudio.jp/#motion=tx-y-spin-stagger) **Staggered Y Spin** (Loops & Decoration; text; 800 ms; power2.inOut; partial, medium). Closest: `text/land-in`. Proposal: text/char-loop (new), mode spin.
  Spec: Per char rotateY 0 → 360° in 0.8 s power2.inOut, perspective 600 px, back face visible (may tint accent), stagger 0.08 s, repeat after 1.5 s.
- [`tx-loading-dots`](https://motion-reference.takayustudio.jp/#motion=tx-loading-dots) **Loading Dots** (Loops & Decoration; text; 1200 ms; ease-in-out; partial, low). Closest: `ui/typing-indicator`. Proposal: text/char-loop (new), mode dots.
  Spec: Three '.' after a still word: each opacity 0.2 → 1 and y 0 → −25 % at 30 % of a 1.2 s cycle, back to 0.2 / 0 by 60 %, delays 0 / 0.2 / 0.4 s, repeating.

### text/text-on-path: NEW · medium · effect · ae expression · 6 motion(s)
Origins named by the site: magicui (1), react-bits (1).

- [`tx-circular-text-spin`](https://motion-reference.takayustudio.jp/#motion=tx-circular-text-spin) **Circular Text Spin** (Path & Shape; text; 10000 ms; linear; missing, medium · origin magicui). Closest: none. Proposal: text/text-on-path (new), mode circle.
  Spec: Chars on a circle, char i rotated 360° / n × i and standing outward; the ring turns 360° per 10 s (10–20 s) linear, seamless (repeat text with a • separator to fill the circumference). Optional speed change ×4 eased in / out over ~0.4 s.
- [`tx-curved-loop-marquee`](https://motion-reference.takayustudio.jp/#motion=tx-curved-loop-marquee) **Curved Loop Marquee** (Path & Shape; text; 4000 ms; linear; missing, medium · origin react-bits). Closest: `title/perspective-marquee`. Proposal: text/text-on-path (new), mode loop.
  Spec: Text + ' • ' repeated along an open curve (demo: one sine arch 100 px high over 1440 px); glyphs placed by arc length and rotated to the tangent; offset moves 2 px per frame (120 px/s at 60 fps) linear; after exactly one unit (text + separator) the frame repeats, so no seam.
- [`tx-text-along-path`](https://motion-reference.takayustudio.jp/#motion=tx-text-along-path) **Text Along Path** (Path & Shape; text; 1200 ms; easeOutCubic → easeInCubic; missing, medium). Closest: `hand/path-text`, `motion/anime-path`. Proposal: text/text-on-path (new), mode run.
  Spec: Text on an SVG path, each glyph on its point's tangent; start offset −30 % → 40 % in 1.2 s power3.out, hold 1.1 s, → 110 % in 1.1 s power3.in (AE: First Margin keys at frames 0 / 45 / 75 / 120 with Easy Ease on 45 and 75).
- [`tx-spiral-text`](https://motion-reference.takayustudio.jp/#motion=tx-spiral-text) **Spiral Text** (Path & Shape; text; 8000 ms; linear; missing, low). Closest: none. Proposal: text/text-on-path (new), mode spiral.
  Spec: Glyphs on an Archimedean spiral of 3 turns (r = rmax × angle / max angle), font size = 0.24 × r so angular spacing stays constant; the string flows inward one text unit per 8 s linear, each glyph rotated to angle + 90°, shrinking to nothing at the centre. Loop.
- [`tx-morphing-path-ride`](https://motion-reference.takayustudio.jp/#motion=tx-morphing-path-ride) **Morphing Path Ride** (Path & Shape; text; 1500 ms; ease-in-out; missing, low). Closest: `shape/anime-morph`. Proposal: text/text-on-path (new) + param morph (the rail changes shape).
  Spec: Text centred on a rail (start offset 50 %); the rail morphs straight → S-wave (control points ±70 px) → arch (ends 30 px lower, top ~80 px up) → straight, 1.5 s each power1.inOut with holds 0.5 / 0.7 / 0.7 s; all shapes share the same command count; glyphs re-laid on the path every frame.
- [`tx-shape-contour-text`](https://motion-reference.takayustudio.jp/#motion=tx-shape-contour-text) **Shape Contour Text** (Path & Shape; text; 10000 ms; linear; missing, low). Closest: none. Proposal: text/text-on-path (new), mode contour.
  Spec: String repeated twice and fitted to a closed shape's perimeter (e.g. a heart), glyphs perpendicular to the outline through cusps; offset 0 → −50 % per 10 s linear loop (AE: First Margin = time × −40 px/s, Force Alignment on).

### effect/spark-burst: NEW · medium · effect · ae keyframes · 5 motion(s)

- [`energy-charge`](https://motion-reference.takayustudio.jp/#motion=energy-charge) **Energy Charge** (Light & Glow; canvas; 1200 ms; easeInCubic; missing, low). Closest: none. Proposal: effect/charge-burst (new).
  Spec: Charge 1200 ms power2.in: three dashed rings (r 24 / 33 / 42 px) turn in alternating directions up to 540°, scale 1.6 → 0.8, opacity 0.35 → 1; 18 particles drift in 80 → 14 px; the core grows 4 → 11 px, glow 5 → 30. Release at 1200 ms: the core vanishes, a ring expands 10 → 90 px and 10 rays shoot out (12→62 / 18→94 px), fading over 450 ms expo.out.
- [`catalog-game-combat-critical-flash`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-critical-flash) **Critical Flash** (Combat & Hit FX; canvas; 2800 ms; linear; partial, medium). Closest: `house/burst-pop`, `hand/hit-stop`, `hand/shake`. Proposal: effect/spark-burst (new).
  Spec: Hit at 0.55 s: one full-frame yellow flash at 20 % decaying 220 ms outCubic; 8-point star grows radius 10 -> 44 px (@320x200) in 100 ms with glow, fading with the flash; 14 dots burst to 54 px (distance outCubic, opacity in-quad) over 450 ms; target shakes 4 px 250 ms; number scale 2.0 -> 1 spring k420 d18 + small 'CRITICAL' label; result holds 1.7 s.
- [`catalog-game-progress-rank-up`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-rank-up) **Rank Up** (Progression & Quests; canvas; 2800 ms; linear; partial, medium). Closest: `text/anime-roll`, `house/logo-pop`. Proposal: effect/spark-burst (new) + clip fill-up.
  Spec: Badge winds up 1 -> 0.92 (280 ms inOut, 0.7 s), then pops by spring k300 d11 from 0.92 at 1.0 s; accent colour fills bottom -> top through a clip in 220 ms outCubic; letter rolls B -> A in the same 220 ms; chevrons light; 14 star sparks fly from radius 30 to 70-100 px (@320x200) over 700 ms outCubic, shrinking; 'PROMOTED' at 1.2 s.
- [`catalog-game-impact-fx-parry-time-slice`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-parry-time-slice) **Parry Time Slice** (Game Impact FX; canvas; 4200 ms; linear; partial, low). Closest: `hand/hit-stop`. Proposal: effect/spark-burst (new) mode=gravity.
  Spec: Two blades swing to contact in 370 ms in-cubic; freeze 300 ms (0.62-0.92 s) with two horizontal lines growing +-150 px in 120 ms and a 4-point star spark; then they deflect in 450 ms outExpo with wobble 0.08 e^(-6t) sin(30t) rad; 9 sparks fan upward (+-64 deg) at 90-150 px/s with gravity 200 px/s^2 (@320x200) for 600 ms.
- [`catalog-game-impact-fx-element-burst`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-element-burst) **Elemental Affinity Burst** (Game Impact FX; canvas; 4200 ms; linear; partial, medium). Closest: `text/caption-particle-burst`. Proposal: effect/spark-burst (new).
  Spec: Charge 0.2-0.65 s: two orbs (2 colours) orbit the centre at 9 rad/s, radius 36 -> 6 px in-quad (@320x200). Burst at 0.65 s: 20 dots alternating the 2 colours fly to 62-88 px (vertical x0.82) over 900 ms outCubic, size 4.5 -> 2.5, short streaks behind; ring 10 -> 50 px in 400 ms; centre star 1.6 -> 1 spring k300 d14.

### house/glow-card: EXTEND · medium · effect · ae png · 5 motion(s)

- [`glow-pulse`](https://motion-reference.takayustudio.jp/#motion=glow-pulse) **Glow Pulse** (Light & Glow; dom; 1100 ms; easeInOutSine; partial, medium). Closest: `house/glow-card`, `house/twinkle`. Proposal: house/glow-card + param pulse.
  Spec: Looping glow around the target: glow radius 8 → 24 → 8 px and glow opacity 0.35 → 0.85 → 0.35, 1100 ms per cycle, sine.inOut; the target itself stays still. Params: min / max size, min / max strength, period, colour.
- [`rim-glow`](https://motion-reference.takayustudio.jp/#motion=rim-glow) **Rim Glow** (Light & Glow; canvas; 1000 ms; easeInOutSine; partial, medium). Closest: `house/glow-card`, `lower/neon-border`. Proposal: house/glow-card + param pulse + rim.
  Spec: Looping rim light on a dark silhouette: stroke 2 → 4 → 2 px and outer glow blur 10 → 22 → 10 px, 1000 ms per cycle (sine ping-pong); a 1 px outer ring at up to 50 % opacity follows the peak; the inside stays dark.
- [`aurora-glow`](https://motion-reference.takayustudio.jp/#motion=aurora-glow) **Aurora Glow** (Light & Glow; canvas; 1500 ms; easeInOutSine; partial, medium). Closest: `background/aurora-drift`, `house/glow-card`. Proposal: house/glow-card + param orbit.
  Spec: Behind a card: two blurred glows (radius ~41 px, blur 14 px, additive, opacity 0.55 / 0.5) circle opposite each other at offset (±24 px x, ±18 px y) along an angle swinging −1.3 → +1.3 rad, 1500 ms sine ping-pong; colours shift up to 70° in hue (red→blue, blue→green). The card on top stays still.
- [`catalog-ui-button-pulse-glow`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-pulse-glow) **Pulse Glow** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `house/glow-card`. Proposal: house/glow-card + param pulse (glow breathes 0 to 1 to 0 on a loop, with outward halo rings).
  Spec: Button 140x44, radius 14, scale fixed at 1. Glow I goes 0 to 1 to 0 on a sine over 2.8 s: border width 1.5 + I px, accent shadow blur 18 x I, label opacity 0.55 + 0.45 x I. Two halo outlines start at 1.0 s and 1.35 s, grow 3 to 27 px out from the edge over 1.2 s power2.out, opacity 0.7 to 0. Loops.
- [`catalog-ui-button-breathing-gradient`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-breathing-gradient) **Breathing Gradient** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `house/glow-card`, `background/mesh-gradient`. Proposal: house/glow-card + param breathe (seamless glow loop with a drifting gradient centre).
  Spec: Button 140x46, radius 16, seamless 2.8 s loop: glow I = 0.5 - 0.5 cos(2 pi t / 2.8); radial gradient (yellow to accent to blue, radius 90 px) centred at x = centre + 40 px x sin(2 pi t / 2.8); shadow blur 4 + 14 I; outer halo ring offset 6 + 4 I px, opacity 0.15 + 0.35 I. Frame 0 equals frame 2.8 s.

### text/rgb-glitch: EXTEND · medium · effect · ae keyframes · 5 motion(s)
Origins named by the site: react-bits (1).

- [`chromatic-split`](https://motion-reference.takayustudio.jp/#motion=chromatic-split) **Chromatic Split** (Effects & Transitions; dom; 900 ms; easeInOutCubic; partial, medium). Closest: `text/rgb-glitch`, `title/prism`, `text/scan-band`. Proposal: text/rgb-glitch + param mode split-settle.
  Spec: Red and cyan copies over the element (screen / lighten blend): x offsets +-34 px -> +-30 px (short hold) -> +-12 px -> 0 while copy opacity 1 -> 0; the core shakes +-4 px in x during the split; 900 ms total, easeInOutCubic. Key times are not given (not readable reliably): suggest 0-15 % open, 15-45 % hold, 45-75 % to +-12, 75-100 % to 0 and fade. Demo colours cyan #00e0ff, red #ff3060 (atlas lk-chroma).
- [`lk-riso`](https://motion-reference.takayustudio.jp/#motion=lk-riso) **Misregistration** (Texture & Look; dom; 125 ms; steps(3); partial, medium). Closest: `text/rgb-glitch`, `title/prism`, `hand/boil`. Proposal: text/rgb-glitch + param mode riso.
  Spec: Two copies of the art in print inks (cyan #2ec4e8, pink #ff4fa3) blended multiply, offset in opposite directions by (o, o/2): o steps 4 -> 3 -> 2 -> 1 -> 2 -> 3 px, one step per 12 fps frame (~83 ms; recipe 4 -> 3 -> 2 over 3 frames), cycling.
- [`catalog-ui-material-chromatic-glass-edge`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-chromatic-glass-edge) **Chromatic Glass Edge** (Material & Surface Motion; canvas; 4200 ms; linear; partial, low). Closest: `text/rgb-glitch`. Proposal: text/rgb-glitch + mode speed (outline split proportional to speed).
  Spec: Card 112x80 moves x 104 to 216 (0.4-1.3 s ease-in-out) and back (2.3-3.2 s). Two outline copies (yellow, blue, 2 px, additive) shift by -/+ offset where offset = 6 px x clamp(speed / 230 px/s) in the travel direction; the normal accent outline fades out as the offset passes 3 px. 0 px at rest.
- [`tx-rgb-split-glitch`](https://motion-reference.takayustudio.jp/#motion=tx-rgb-split-glitch) **RGB Split Glitch** (Distortion & Glitch; text; 160 ms; steps; partial, medium · origin react-bits). Closest: `text/rgb-glitch`, `text/scan-band`. Proposal: text/rgb-glitch + param slices (copies clipped to seeded horizontal bands per burst).
  Spec: Red and cyan copies behind the text, each clipped to a horizontal band (inset top / bottom re-chosen per burst from a seeded table); in a burst (2-4 frames) red shifts -5..-12 px, cyan +5..+12 px; bursts recur on two cycles (red every 2 s, cyan every 3 s) with long clean holds; main text still.
- [`tx-slice-glitch`](https://motion-reference.takayustudio.jp/#motion=tx-slice-glitch) **Slice Displacement** (Distortion & Glitch; text; 67 ms; steps(1); partial, medium). Closest: `effect/image-glitch-burst`, `text/rgb-glitch`. Proposal: text/rgb-glitch + param slices (6-8 seeded slices shifting +-24 px, colour optional).
  Spec: 6-8 horizontal slices (cut positions jittered +-35 % per burst); in a burst (1-3 frames at 15 fps updates, 50-80 ms) slices with seed > 0.45 shift x by a seeded +-24 px; 18 % ghost of the clean text underneath; bursts only in set windows (e.g. 0.3-1.15 s and 2.25-2.75 s).

### hand/boil: EXTEND · medium · effect · ae keyframes · 4 motion(s)
Origins named by the site: aceternity (1).

- [`tx-wiggly-jitter`](https://motion-reference.takayustudio.jp/#motion=tx-wiggly-jitter) **Wiggly Jitter** (Emphasis; text; 125 ms; noise (per frame); partial, medium). Closest: `hand/boil`, `motion/chaos-shake`. Proposal: hand/boil + param split chars (independent noise per char).
  Spec: Split chars; each char has its own seeded noise: x, y +-6 px, rotate +-5 deg, ~8 changes / s (smooth noise or 3 steps per 0.24 s), correlation 0; amplitude eases 0 -> 1 over 0.3 s (outQuad) and back to 0 over 0.3 s at the end.
- [`tx-turbulence-wobble`](https://motion-reference.takayustudio.jp/#motion=tx-turbulence-wobble) **Turbulence Wobble** (Distortion & Glitch; text; 100 ms; steps; partial, low · origin aceternity). Closest: `hand/boil`, `hand/boil-hf`. Proposal: hand/boil + param displace (SVG turbulence displacement, seed stepped 10x / s).
  Spec: SVG filter on the text: feTurbulence baseFrequency 0.02, numOctaves 2, seed = floor(t x 10) (new pose every 100 ms); feDisplacementMap scale 5-15 px, so outlines squirm like boiling line art.
- [`tx-film-scratch-jitter`](https://motion-reference.takayustudio.jp/#motion=tx-film-scratch-jitter) **Scratched Film Jitter** (Titles & Film; text; 42 ms; steps(1); partial, medium). Closest: `hand/boil`, `effect/film-grain`. Proposal: hand/boil + params flicker (opacity 0.85–1) and ghost (offset double exposure).
  Spec: Stepped at 24 fps: position wiggle 1–3 px (seeded per frame and per letter), opacity random 0.85–1, a second exposure offset +3 / −2 px at 30–50 % opacity; scratch / dust overlay in screen blend; the open chopped into 2–8 frame cuts.
- [`tx-telop-shake`](https://motion-reference.takayustudio.jp/#motion=tx-telop-shake) **Shaking Telop** (Broadcast & Telop; text; 100 ms; random; partial, medium). Closest: `hand/boil`. Proposal: hand/boil + param split: chars.
  Spec: Per char, stepped ~10 times per s (5–12): x, y ±2–6 px and rotation ±3°, seeded per char with ~30 % correlation between neighbours; runs through the hold.

### motion/drag-release: EXTEND · medium · effect · ae keyframes · 4 motion(s)

- [`rubber-band`](https://motion-reference.takayustudio.jp/#motion=rubber-band) **Rubber Band** (Bounce & Reaction; canvas; 900 ms; easeOutElastic; partial, medium). Closest: `motion/drag-release`, `transition/rubber-band`. Proposal: motion/drag-release + param stretch.
  Spec: A cursor grabs a pill and pulls it x +105 px with scaleX 1 → 1.8 (scaleY = 1/scaleX) over 380 ms power2.inOut; on release x and scaleX return by one spring (k 300, d 11): scaleX dips to ~0.72 then 1, x settles at a new rest +37 px from the start, ~520 ms. (Demo px.)
- [`snap-back`](https://motion-reference.takayustudio.jp/#motion=snap-back) **Snap Back** (Bounce & Reaction; canvas; 560 ms; easeOutBack; partial, medium). Closest: `motion/drag-release`. Proposal: motion/drag-release + param stretch.
  Spec: Pulled right: x +98 px (demo) and scaleX 1 → 1.5 (scaleY = 1/scaleX) in 550 ms power2.inOut, a 200 ms hold with a ±0.6 px tremble, then release: x returns on a spring (k 420, d 20), scaleX on a looser one (k 420, d 12) dipping to ~0.8 before 1; 4 ghost copies 18 ms apart for 300 ms after release; a tether line thins as it stretches.
- [`drag-resistance`](https://motion-reference.takayustudio.jp/#motion=drag-resistance) **Drag Resistance** (Bounce & Reaction; canvas; 820 ms; easeInOutBack; partial, medium). Closest: `motion/drag-release`. Proposal: motion/drag-release + param stretch.
  Spec: Grab the right edge: it moves +92 px in 600 ms power2.inOut while the left edge lags (follows 100 ms later, width kept within 80–108 px: scaleX up to 1.35, height 1/scaleX); release: the pill springs back (k 220, d 16) ~12 px past its slot and settles, stretching up to +18 % with speed on the way.
- [`drag-inertia`](https://motion-reference.takayustudio.jp/#motion=drag-inertia) **Drag Inertia** (Web Interaction; canvas; 1000 ms; easeOutQuart; partial, medium). Closest: `motion/drag-release`, `cursor/swipe-rail`. Proposal: motion/drag-release + param throw (keep the release speed, decay x0.88 per frame, no spring back).
  Spec: Knob 36 px in a 264 px track. 0.45-0.65 s dragged 60 px right (power2.in); released at 0.65 s it glides 117 px more: x = 117 x (1 - e^(-7.67 t)) (= speed x0.88 per 60 fps frame), stopping inside the track by about 1.85 s. While moving it stretches scaleX up to 1.14 by speed (scaleY inverse); held scale 1.06. Mirror throw back at 1.85-3.3 s.

### motion/inertial-bounce: EXTEND · medium · effect · ae keyframes · 4 motion(s)

- [`catalog-ui-button-jelly-squash`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-jelly-squash) **Jelly Squash** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `motion/inertial-bounce`. Proposal: motion/inertial-bounce + param squash (scaleX = 1 + d, scaleY = 1 / (1 + d), origin bottom).
  Spec: On press (0.55 s): d(t) = 0.2 x e^(-3.4 t) x cos(17 t), ramped in over 50 ms; scaleX = 1 + d, scaleY = 1 / (1 + d) (area kept), origin bottom centre; the wobble lasts about 1.3 s and is faded to 0 between 1.6-2.0 s. Equivalent spring k290 d6.8.
- [`catalog-ui-button-wobble-tilt`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-wobble-tilt) **Wobble Tilt** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `motion/inertial-bounce`, `motion/pendulum-swing`. Proposal: motion/inertial-bounce + param kick (swing from rest about a bottom pivot).
  Spec: From rest at the tap (0.5 s): angle = 0.24 x e^(-2.4 t) x sin(9 t) rad (first swing about 9-12 deg), pivot at the bottom centre; faded to 0 between 1.5-1.9 s. Equivalent spring k144 d5.6.
- [`ty-inertia`](https://motion-reference.takayustudio.jp/#motion=ty-inertia) **Inertia Letters** (Glyph Physics; dom; 900 ms; damped sine; partial, medium). Closest: `motion/inertial-bounce`, `text/land-in`. Proposal: motion/inertial-bounce + param split: chars (lanes alternate ±120 px).
  Spec: Per letter: start 0.3 + i × 0.08 s, fly 120 px in from below (even) / above (odd) in 0.25 s power3.out; after landing rotate θ = 28.6° × e^(−t / 0.25) × sin(30 t) (period 0.21 s ≈ 12.5 frames at 60 fps, settled in ~0.6 s) around the letter's baseline centre.
- [`tx-path-inertia`](https://motion-reference.takayustudio.jp/#motion=tx-path-inertia) **Path With Tracking Inertia** (Path & Shape; text; 900 ms; inertia (damped sine); partial, medium). Closest: `motion/inertial-bounce`, `text/tracking-in`. Proposal: motion/inertial-bounce + prop letterSpacing.
  Spec: Text runs in x −340 px → 0 in 0.9 s linear (on a path or straight); at the stop tracking = −0.25 em × sin(2π × 3 t) × e^(−6 t) for ~1.2 s (squeeze, overshoot open, settle). AE: inertia expression amp 0.05, freq 3, decay 6 on Tracking Amount, the key before the stop linear.

### ui/ink-ripple: NEW · medium · effect · ae keyframes · 4 motion(s)

- [`click-ripple`](https://motion-reference.takayustudio.jp/#motion=click-ripple) **Click Ripple** (Web Interaction; dom; 650 ms; easeOutCubic; partial, medium). Closest: `cursor/press-ripple`. Proposal: ui/ink-ripple (new): ink circle from the press point, clipped to the film's own button.
  Spec: At the click point inside the button (overflow hidden): a circle (diameter about the button height) scales 0 to 3.2 while its opacity goes 0.7 to 0, 650 ms power2.out (easeOutCubic). Several clicks may overlap. Pair with a cursor click time.
- [`button-fill-hover`](https://motion-reference.takayustudio.jp/#motion=button-fill-hover) **Button Fill Hover** (Web Interaction; canvas; 1400 ms; easeOutCubic; partial, medium). Closest: `cursor/press-ripple`. Proposal: ui/ink-ripple (new) mode fill: hover fill from the entry point with the label colour flipped inside.
  Spec: Outlined button 140x48 (1.5 px accent border, accent label). The cursor enters at a point: an accent circle grows from that point to radius 170 px (about 420 %) in 620 ms power2.out, clipped to the button; the label is drawn twice, accent outside the circle and paper inside it. On leave the circle shrinks back from the exit point in 440 ms power2.in.
- [`catalog-ui-button-tap-ripple`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-tap-ripple) **Tap Ripple** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `cursor/press-ripple`. Proposal: ui/ink-ripple (new).
  Spec: Button 160x52, radius 14. Each tap: a dark ink circle at the tap point, radius 0 to the distance of the farthest corner in 550 ms power2.out, opacity 38 % fading to 0 from 200 to 750 ms, clipped to the button. Two taps 1.1 s apart at different points (left-low, right-high); a small touch dot marks each tap.
- [`catalog-ui-button-color-splash`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-color-splash) **Color Splash** (UI Buttons; canvas; 2800 ms; linear; missing, medium). Closest: none. Proposal: ui/ink-ripple (new) mode splash (hard-edged state wipe from the contact point).
  Spec: Button 172x52, radius 14. Tap 1 (0.5 s, left-low point): a circle carrying the new state (accent background, paper label) grows from the tap point to the farthest corner in 500 ms power2.out, hard edge (no fade), a 1.5 px ink rim on the edge while it grows. Tap 2 (1.7 s, right-high point) brings the old state back the same way.

### ui/press: NEW · medium · effect · ae keyframes · 4 motion(s)

- [`catalog-ui-button-bounce-press`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-bounce-press) **Bounce Press** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `cursor/press-ripple`, `motion/tween`. Proposal: ui/press (new): press / release effect on the film's own button, timed to a click.
  Spec: At the click: scale 1 to 0.92 in 100 ms (power2.out); stays down while held (0.55 s in the demo); release: 0.92 to 1.05 in 160 ms (power1.out), then 1.05 to 1 in 300 ms (power2.inOut). One rebound only. The cursor arrives on a slight arc before the press.
- [`catalog-ui-button-push-3d`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-push-3d) **3D Push** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `cursor/press-ripple`. Proposal: ui/press (new) mode depth.
  Spec: Button 140x44 sitting on an 8 px darker side band (depth). Press at 0.7 s: depth 8 to 2 px in 100 ms power2.out (the top face moves down 6 px, the base stays). Release at 1.3 s: depth back to 8 px on a spring k420 d24 (one small overshoot).
- [`catalog-ui-button-inner-press`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-inner-press) **Inner Press** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `cursor/press-ripple`. Proposal: ui/press (new) mode inset.
  Spec: Button 140x46. Press at 0.7 s: k 0 to 1 in 120 ms power2.out; release at 1.6 s: back in 250 ms power2.out. translateY = 1 px x k; inner shadow 0 to 8 px (soft rings from the top edge), top highlight fades out, bottom dark line fades in; no scale.
- [`ui-press`](https://motion-reference.takayustudio.jp/#motion=ui-press) **Button Press** (UI Buttons; dom; 100 ms; easeOutQuad / spring; partial, medium). Closest: `cursor/press-ripple`, `motion/tween`. Proposal: ui/press (new).
  Spec: Press: scale 1 to 0.95 in 80-120 ms (power1.out = easeOutQuad); stays down while held; release: back to 1 in 200 ms back.out (slight overshoot). Sync the press to the cursor click time.

### effect/gooey-split: EXTEND · medium · block · ae png · 3 motion(s)

- [`svg-gooey-merge`](https://motion-reference.takayustudio.jp/#motion=svg-gooey-merge) **Gooey Merge** (SVG & Path; canvas; 1050 ms; easeInOutCubic; partial, medium). Closest: `effect/gooey-split`, `text/morph-text`. Proposal: shape/gooey (new): goo filter on a group of the film's shapes.
  Spec: Two circles r 26 px in a group with a goo filter (Gaussian blur 7 px, then alpha x 22 - 9). Centres start +-64 px from the middle, hold 300 ms, move to +-22 px over 1000 ms easeInOut (a neck forms before contact), hold 900 ms, return over 900 ms. One fill colour.
- [`catalog-ui-material-gel-button-split`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-gel-button-split) **Gel Button Split** (Material & Surface Motion; canvas; 4200 ms; linear; partial, low). Closest: `effect/gooey-split`. Proposal: effect/gooey-split + variant pill split in two.
  Spec: Two pills 60x44 start overlapped (centres +-22). 0.3-0.5 s squeeze to +-18 (scaleX 0.94); 0.5-1.3 s pull apart to +-54 (power1.in), scaleX to 1.16, scaleY = 1 / sqrt(scaleX), neck width 22 x scaleY x (1 - (d - 22) / 32)^1.4, reaching 0 at 1.3 s (split). Then centres to +-74 on a spring k260 d12 with a scaleX wobble spring k300 d9. Rejoin at 3.0 s on a spring k200 d22.
- [`catalog-ui-material-bubble-merge`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-bubble-merge) **Bubble Merge Menu** (Material & Surface Motion; canvas; 4200 ms; linear; partial, low). Closest: `effect/gooey-split`. Proposal: effect/gooey-split + variant merge (two bubbles fuse into one pill).
  Spec: Two circles r24 approach from 88 to 24 px from the centre (0.3-1.1 s power1.in) with 8 % squash. Contact 1.1-1.25 s: a neck grows to full (power2.out) and they close to 19. Then one pill: width 86 to 156, height 48 to 58 on a spring k220 d16; 'A + B' fades in 1.45-1.7 s. Split back 3.0-3.4 s and the circles part to 88 (0.6 s power2.out).

### hand/shake: EXTEND · medium · effect · ae keyframes · 3 motion(s)
Origins named by the site: other:gsap (1).

- [`after-shake`](https://motion-reference.takayustudio.jp/#motion=after-shake) **After Shake** (Bounce & Reaction; canvas; 720 ms; easeOutExpo; partial, medium). Closest: `hand/shake`, `motion/chaos-shake`. Proposal: hand/shake + param mode:"wiggle".
  Spec: On impact (a ball hits from the left): x offset = 20·e^(−6 t)·sin(2π t / 0.2) px, t in s after the hit (5 Hz: +20, −16, +11 …), under 0.5 px by ~720 ms; one axis, no rotation, no y. A small star flash at the contact for 140 ms. The same mode serves error shakes (−12, 10, −6, 4, 0 over 540 ms) and bell rings (rotation, pivot top).
- [`e-wiggle`](https://motion-reference.takayustudio.jp/#motion=e-wiggle) **CustomWiggle** (Easing; dom; 600 ms; CustomWiggle(6, easeOut); partial, medium · origin other:gsap). Closest: `hand/shake`. Proposal: hand/shake + param mode:"wiggle".
  Spec: CustomWiggle(6, easeOut): the value leaves rest toward the given amplitude and swings 6 times in 600 ms, amplitude falling linearly to 0, ending at rest (6–10 px or 10–15° typical, 400–700 ms). Mode params: prop x / y / rotation, cycles, amp, decay linear / exp; a regular sine, not noise.
- [`catalog-game-impact-fx-camera-kick`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-camera-kick) **Camera Kick HUD** (Game Impact FX; canvas; 4200 ms; linear; partial, low). Closest: `hand/shake`, `motion/spring-track`. Proposal: hand/shake + param mode=kick.
  Spec: World group only (HUD stays fixed), per shot at 0.5, 1.2, 1.9 s: offset y -9 px, x +4 px, rotation -0.6 deg in 50 ms outCubic, then back by spring k220 d18; kicks add up; muzzle ring 4 -> 16 px in 300 ms.

### motion/anime-stagger-grid: EXTEND · medium · effect · ae keyframes · 3 motion(s)

- [`grid-shuffle`](https://motion-reference.takayustudio.jp/#motion=grid-shuffle) **Shuffle to Grid** (List & Grid; canvas; 980 ms; easeInOutBack; partial, medium). Closest: `card/mosaic-pack`, `text/char-slam`. Proposal: motion/anime-stagger-grid + param scatter.
  Spec: 3×3 tiles (34 px, 10 px gap) start scattered: each offset by a seeded random ±24–26 px in x and y, rotated ±18°, scale 0.72; they settle into the grid (0°, scale 1) in 720 ms back.inOut, each 35 ms after the previous in reading order (≈1 s in all). Reverse to scatter in 400 ms.
- [`grid-spiral`](https://motion-reference.takayustudio.jp/#motion=grid-spiral) **Grid Spiral** (List & Grid; canvas; 1100 ms; easeOutCubic; partial, low). Closest: `motion/anime-stagger-grid`. Proposal: motion/anime-stagger-grid + param order.
  Spec: 3×3 tiles appear in a clockwise spiral from the centre: row-major indices 4, 5, 8, 7, 6, 3, 0, 1, 2; each scales 0 → 1 in 320 ms back.out, starting 128 ms after the previous (whole run ≈1.35 s); the first tile in the accent colour.
- [`pixel-dissolve`](https://motion-reference.takayustudio.jp/#motion=pixel-dissolve) **Pixel Dissolve** (Effects & Transitions; canvas; 900 ms; easeOutCubic; partial, medium). Closest: `motion/anime-stagger-grid`, `title/wordmark-tiles`. Proposal: motion/anime-stagger-grid + param cells (cut the target picture into N x M tiles).
  Spec: Target cut into 4 x 4 tiles (each shows its own part of the picture). Tiles appear in a fixed seeded random order; tile k starts at k x 28 ms, scale 0 -> 1 about its own centre + opacity 0 -> 1 over 450 ms easeOutCubic; ~900 ms total; at the end the tiles join with no gaps (swap to the whole picture). Exit: same in a scrambled order, 200 ms each, 12 ms apart, ease-in cubic.

### motion/collect-arc: NEW · medium · effect · ae keyframes · 3 motion(s)

- [`catalog-game-hud-coin-collect`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-coin-collect) **Coin Collect** (Game HUD; canvas; 3400 ms; linear; partial, medium). Closest: `motion/anime-path`, `data/count-up`. Proposal: motion/collect-arc (new).
  Spec: px @320x200. 5 items scattered; each hops up 4 px (140 ms) then flies to a target on a quadratic arc (control: midpoint x -24, 58 px above the higher end) in 500 ms in-quad, arrivals every 260 ms from 0.9 s; item shrinks to 0.65 and spins (scaleX = cos 9u). Each arrival: target squash 280 ms (1.12/0.88 sine), counter +5 pops 1.22, '+5' rises 18 px in 400 ms outCubic, fades 160-340 ms.
- [`catalog-game-reward-currency-rain`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-currency-rain) **Currency Rain** (Rewards & Loot; canvas; 2800 ms; linear; partial, medium). Closest: `effect/confetti`, `data/count-up`. Proposal: motion/collect-arc (new) mode=rain.
  Spec: 10 gems from seeded x (40-280 px @320x200) fall into a bag in 550 ms each (y in-quad, x out-quad to bag +-5 px), starting 130 ms apart + up to 50 ms jitter from 0.2 s; each catch: bag squash 10 % (220 ms sine), counter +50 with a 15 % pop, accent once all 10 are in.
- [`catalog-game-progress-collection-complete`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-collection-complete) **Collection Complete** (Progression & Quests; canvas; 2800 ms; linear; partial, low). Closest: `motion/anime-path`, `motion/anime-stagger-grid`. Proposal: motion/collect-arc (new).
  Spec: 2 x 3 grid, last slot dashed '?'. Item flies on a curve from bottom-right (290,186 via 300,40 @320x200) into the slot in 600 ms inOutQuad with one full turn; lands with squash 1 + 0.25 e^(-14t) cos(30t); ring 14 -> 32 px in 450 ms; cells pulse 8 % (250 ms sine) in a wave 50 ms apart and outline accent; counter 5/6 -> 6/6; '100%' label pops at 1.35 s.

### motion/echo: NEW · medium · effect · ae keyframes · 3 motion(s)

- [`trail-exit`](https://motion-reference.takayustudio.jp/#motion=trail-exit) **Trail Exit** (Entrance & Exit; canvas; 520 ms; easeInQuart; partial, medium). Closest: `motion/echo-trail`, `effect/motion-blur`. Proposal: motion/echo (new).
  Spec: Exit to the right: main element x 0 → +175 px (demo px on a 320 px canvas, ≈×6 at 1920) and opacity 1 → 0 in 520 ms power3.in (easeInQuart). Three copies under it run the same tween 32, 64 and 96 ms later at 0.42 / 0.24 / 0.12 of its opacity and vanish with it. Entrance before it: fade in 250 ms power2.out.
- [`light-trail`](https://motion-reference.takayustudio.jp/#motion=light-trail) **Light Trail** (Light & Glow; canvas; 900 ms; easeOutCubic; partial, medium). Closest: `motion/echo-trail`, `line/flow-connector`. Proposal: motion/echo (new) + blur.
  Spec: Head (7 px dot, 12 px glow) travels an arc 185 px wide, 34 px high (sine) in 900 ms power2.out; three trailing copies 36 / 72 / 108 ms behind in the demo (recipe: 18 ms steps), opacity 0.45 / 0.30 / 0.18, blur ~1 / 2 / 3 px, radius 6 / 5 / 4, plus a 6 px gradient stroke over the last 90 ms of path; copies merge into the head at rest.
- [`catalog-kinetic-type-echo-caption`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-echo-caption) **Echo Trail Caption** (Captions & Subtitles; canvas; 4200 ms; linear; partial, medium). Closest: `motion/echo-trail`, `text/land-in`. Proposal: motion/echo (new): ghost copies of any target replaying its own tween k × delay later.
  Spec: Caption slides x −220 px → 0 in 0.9 s expo.out; 3 ghost copies replay the same tween 70 / 140 / 210 ms late at opacity 0.45 / 0.25 / 0.12, clipped to the caption box; ghosts fade out over 0.35 s (power2.out) from 0.15 s after arrival. Exit later: opacity 1 → 0 and x +8 px in 0.35 s power3.in.

### motion/hinge: NEW · medium · effect · ae keyframes · 3 motion(s)

- [`catalog-ui-spatial-layer-peel`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-layer-peel) **Layer Peel** (Spatial UI & Depth; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: motion/hinge (new): rotate a panel about one edge with perspective and shading.
  Spec: Top panel 136x108 rotates about its left edge, rotateY 0 to -140 deg (perspective 560) over 0.9 s ease-in-out, back after a hold (3.0-3.65 s). The front face lightens up to 50 % x sin(angle); when the back faces the camera it shows a plain back. The lower panel stays fixed beneath; dashed hinge line.
- [`catalog-ui-spatial-calendar-fold`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-calendar-fold) **Perspective Calendar Fold** (Spatial UI & Depth; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: motion/hinge (new) top-edge mode.
  Spec: Calendar sheet 112x92 under a header with two rings. The top sheet ('24 THU') rotates about its top edge, rotateX 0 to -170 deg (perspective 420), 0.8 s ease-in-out at 0.45 s; shade up to 45 % x sin(angle); the next day ('25 FRI') waits beneath; the turned sheet shows a plain back and fades after about 110 deg. Back 3.05-3.5 s.
- [`catalog-ui-material-paper-fold`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-paper-fold) **Paper Fold Reveal** (Material & Surface Motion; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: motion/hinge (new) crease mode.
  Spec: Right half (80x96) folds about the centre crease: rotateY 0 to 180 deg (perspective 420) over 1.1 s ease-in-out at 0.4 s, back 2.6-3.6 s. Darken by angle, max 55 % (x sin); a cast shadow on the base page (45 % x sin). The front face shows the cover ('OPEN'), the back face the inside content; the base page holds the inner spread.

### motion/spring-track: EXTEND · medium · effect · ae png · 3 motion(s)

- [`catalog-ui-control-jumping-dot`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-jumping-dot) **Jumping Dot** (Selection & Controls; canvas; 2800 ms; linear; partial, low). Closest: `flow/tabs-slide-indicator`, `motion/anime-path`. Proposal: motion/spring-track + indicator mode jump (a dot hops between tabs).
  Spec: Dot r6 under 3 tabs 72 px apart. Each move: 0.1 s take-off squash (scaleY -0.35), hop 0.42 s with x linear and y on a parabola (apex 26 px + 8 px per extra tab), slight stretch in the air, landing squash 0.35 decaying as e^(-14 t); a dashed arc ghost fades 0.6-0.9 s after take-off. Moves at 0.3, 1.15, 2.0 s.
- [`catalog-ui-control-liquid-blob`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-liquid-blob) **Liquid Blob** (Selection & Controls; canvas; 2800 ms; linear; partial, medium). Closest: `motion/spring-track`, `effect/gooey-split`. Proposal: motion/spring-track indicator + style gooey (two circles joined by a liquid neck).
  Spec: Tabs 72 px apart. Lead circle moves in 300 ms power2.out; trail circle starts 120 ms later and takes 380 ms power2.inOut. Radii shrink with the gap: lead 22 - 5 s, trail 22 - 9 s (s = gap / 72); a liquid neck joins them. On arrival a scale wobble +-14 % x e^(-8 t) x sin(30 t). Labels turn paper where the blob covers them. Moves at 0.3, 1.15, 2.0 s.
- [`catalog-ui-material-liquid-tab-bridge`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-liquid-tab-bridge) **Liquid Tab Bridge** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `effect/gooey-split`, `motion/spring-track`. Proposal: motion/spring-track indicator + style gooey (a droplet left behind, the neck snaps).
  Spec: Blob r15 travels 128 px (A to C) in 0.9 s power2.inOut, stretched by speed (scaleX 1 + min(0.42, v / 1500 px/s), scaleY inverse). A droplet stays at the start shrinking r15 to 6, joined by a neck 11 to 2 px wide; at 88 % of the trip the neck snaps, the droplet shrinks to 0 in 0.32 s and the tail tip retracts in 0.18 s. Landing wobble 16 % x e^(-7 t) x sin(26 t). Reverse at 2.5 s.

### text/gradient-fill: NEW · medium · effect · ae png · 3 motion(s)
Origins named by the site: magicui (2).

- [`tx-gradient-flow`](https://motion-reference.takayustudio.jp/#motion=tx-gradient-flow) **Animated Gradient Text** (Colour & Light; text; 8000 ms; linear; partial, medium · origin magicui). Closest: `text/text-shimmer`, `text/caption-gradient-fill`. Proposal: text/gradient-fill (new) mode flow.
  Spec: Text filled with a 90 deg linear-gradient of 3 colours with first = last (A, B, C, A), background-size 300 % x 100 %, clipped to the letters; background-position-x 0 % -> 100 % over 8 s linear, seamless loop; letters still.
- [`tx-aurora-text`](https://motion-reference.takayustudio.jp/#motion=tx-aurora-text) **Aurora Text** (Colour & Light; text; 6000 ms; ease-in-out; partial, medium · origin magicui). Closest: `text/text-shimmer`, `background/aurora-drift`. Proposal: text/gradient-fill (new) mode aurora.
  Spec: Gradient layer (135 deg, 4-5 aurora colours, size 200 %) clipped to the letters; the layer rotates -5 <-> +5 deg and scales 0.9 <-> 1.1, 6 s per cycle sine.inOut yoyo, with a slow position drift; letters still.
- [`tx-conic-spin`](https://motion-reference.takayustudio.jp/#motion=tx-conic-spin) **Conic Gradient Spin** (Colour & Light; text; 4000 ms; linear; partial, low). Closest: `text/text-shimmer`. Proposal: text/gradient-fill (new) mode conic.
  Spec: Conic-gradient fill (3 colours, first = last) centred on the text box, clipped to the letters; start angle 0 -> 360 deg over 4 s linear, loop.

### ui/button-morph: NEW · medium · effect · ae keyframes · 3 motion(s)

- [`submit-success`](https://motion-reference.takayustudio.jp/#motion=submit-success) **Submit Success Morph** (Forms & State; canvas; 820 ms; easeInOutCubic; partial, medium). Closest: `cursor/press-ripple`, `text/state-swap`. Proposal: ui/button-morph (new): one button through idle, loading and success on springs.
  Spec: Pill button 44 px tall. Press at 0.5 s: scale 1 to 0.96 to 1 over 0.15 s. Width on a spring k260 d24: 128 to 176 (sending) to 140 (sent) to 128. 0.55-0.75 s cross-fade to an outlined surface with a spinning 8 px arc (about 240 deg, 8 rad/s) and 'SENDING...'; 1.9-2.05 s cross-fade to green with a tick drawing in 0.3 s and 'SENT'. Each new label rises 4 px as it fades in.
- [`catalog-ui-button-send-morph`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-send-morph) **Send Morph** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `cursor/press-ripple`. Proposal: ui/button-morph (new) state send (shrink to a circle, a paper plane flies off, tick).
  Spec: Pill 140x46 to circle 46 (0.38-0.68 s ease-in-out); 'SEND' fades. Paper plane pops in (0.62-0.74 s back.out), pulls back 4 px (0.1 s), flies 0.84-1.32 s power2.in on an arc up 74 px and right 158 px (bulge 26 px), turned along its path, 4 fading trail dots. 1.5 s fill turns green with a 1.12 pop, tick draws 1.6-1.85 s. 2.3-2.65 s width back to 140 (power2.out), 'SEND' returns.
- [`catalog-ui-button-loading-success`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-loading-success) **Loading to Success** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `ui/success-check`. Proposal: ui/button-morph (new) state loading to success.
  Spec: Pill 140x44 outlined. Spinner r11, 3 px arc, rotating linear 0.7 s per turn; arc length breathes 0.7 to 3.7 rad (sine, 0.7 s). 1.3-1.6 s the arc grows to a full circle (ease-in-out); at 1.6 s an accent disc r13 pops (back.out 0.25 s) on the same spot and a tick draws 1.7-1.95 s (power2.out). Label 'processing' to 'done'.

### ui/fill-confirm: NEW · medium · effect · ae keyframes · 3 motion(s)

- [`long-press-progress`](https://motion-reference.takayustudio.jp/#motion=long-press-progress) **Long Press Progress** (Gesture & Mobile; canvas; 1000 ms; linear; partial, medium). Closest: `data/conic-progress-ring`. Proposal: ui/fill-confirm (new): a ring or bar that fills only while held, resets on early release, confirms when full.
  Spec: Ring r44, stroke 6 (grey track, accent fill from 12 o'clock). Button r32 scales to 0.95 while pressed. Press 1: 0.4-0.9 s fills linearly (1.2 s = full ring); early release empties it in 0.12 s power2.out. Press 2: 1.4-2.6 s fills to 100 %; then a green disc grows 0 to 32 px (back.out 0.3 s), 'HOLD' fades and a tick draws. Reset 3.6-3.95 s.
- [`catalog-ui-button-fill-sweep`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-fill-sweep) **Fill Sweep** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `text/inline-highlight`. Proposal: ui/fill-confirm (new) mode sweep (one-shot fill with the label colour flipped inside).
  Spec: Outlined button 140x46, radius 14. At 0.55 s the accent fill wipes from the left edge to the right in 500 ms ease-in-out (clip rect), with a paper copy of the label inside the fill and a thin ink line on the moving front. At 1.05 s the label changes to 'SELECTED' (slides 8 px right, 0.2 s power2.out) and a check pops (back.out 0.25 s). Fade back 2.3-2.55 s.
- [`catalog-ui-button-hold-confirm`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-hold-confirm) **Hold to Confirm** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `text/inline-highlight`, `data/conic-progress-ring`. Proposal: ui/fill-confirm (new) mode hold (bar).
  Spec: Outlined button 150x46. While held, the accent fill wipes left to right linearly over 1.2 s (paper label copy inside). Early release at 50 % (0.6 s): the fill returns to 0 in 250 ms power2.out with a 'released, cancelled' hint. Second hold completes: 'CONFIRMED' with a check popping (back.out 0.22 s). A thin bar below mirrors the fill. Fade back 3.55-3.8 s.

### ui/radial-menu: NEW · medium · block · ae keyframes · 3 motion(s)

- [`catalog-ui-control-bubble-expand`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-bubble-expand) **Bubble Expand** (Selection & Controls; canvas; 2800 ms; linear; partial, medium). Closest: `flow/menu-morph`, `effect/gooey-split`. Proposal: ui/radial-menu (new): actions fly out on an arc from a button.
  Spec: Round button r20 near the bottom. Tap at 0.38 s: the plus rotates 45 deg (spring k260 d20). Three bubbles r15 travel to angles -150, -90, -30 deg at radius 72 px, 60 ms apart, spring k240 d16; a liquid neck joins each to the button while close (optional goo, png); icons scale in over the last 40 %. Close at 2.0 s in reverse order, 50 ms apart, 220 ms power2.in.
- [`catalog-ui-spatial-radial-command-bloom`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-radial-command-bloom) **Radial Command Bloom** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, medium). Closest: `flow/menu-morph`. Proposal: ui/radial-menu (new).
  Spec: Centre button r19. Five items r15 fly to radius 64 px at 72 deg steps (first straight up), 50 ms apart, on a spring k260 d18 (scale follows the same spring, capped at 1.3); a thin line from the centre to each. The plus rotates 45 deg on that spring; press scale 0.9. Close at 2.95 s: reverse order 30 ms apart, 220 ms power2.in.
- [`catalog-ui-spatial-orbit-context`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-orbit-context) **Orbiting Context Menu** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, medium). Closest: `flow/menu-morph`. Proposal: ui/radial-menu (new) mode orbit.
  Spec: Centre button r22 ('EDIT'). Three items r15 end on a radius-62 orbit at -150, -90, -30 deg; each starts 130 deg back along the orbit and slides to its slot on a spring k150 d17, 80 ms apart; icons stay upright; scale 0.6 to 1; a fading accent arc trail. Exit at 2.95 s (+50 ms each): continue 78 deg along the orbit and fade, 350 ms power2.in.

### card/tilt-card: EXTEND · medium · block · ae keyframes · 2 motion(s)

- [`solid`](https://motion-reference.takayustudio.jp/#motion=solid) **Solid Drawing / Depth** (Principles; dom; 800 ms; easeInOutCubic; partial, medium). Closest: `card/tilt-card`. Proposal: card/tilt-card + param shadow.
  Spec: A card tilts rotationY −8° → +8° in 800 ms power2.inOut (perspective on the parent); its drop shadow's x offset moves opposite to the tilt and lengthens with /angle/ (linked to the angle, not tweened separately).
- [`catalog-ui-material-metallic-foil`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-metallic-foil) **Metallic Foil Tilt** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `card/tilt-card`, `motion/object-sweep`. Proposal: card/tilt-card + param sheen (a light band moving opposite the tilt).
  Spec: Card 144x92, perspective 380: rotateY 0 to -24 deg (0.3-1.2 s), hold, to +24 deg (1.6-2.7 s), hold, to 0 (3.1-3.9 s), ease-in-out. A skewed light band (soft 28 % wide strip, bright 4.5 % strip, thin 2.5 % strip) sits at x = 58 % - (tilt / 24 deg) x 34 %, so it moves opposite the tilt; white overlay 0.7 x /tilt / 24 deg/.

### effect/confetti: EXTEND · medium · block · ae expression · 2 motion(s)

- [`pt-confetti`](https://motion-reference.takayustudio.jp/#motion=pt-confetti) **Confetti** (Particles; dom; 2000 ms; physics (gravity); partial, medium). Closest: `effect/confetti`. Proposal: effect/confetti + overlay mode on the film (transparent, origin, count, seed).
  Spec: 40 pieces 8 x 5 px, 4 colours, launched from one point: x speed +-80 px/s, y speed -140 to -260 px/s, gravity 320 px/s^2, side flutter 8 px at 6 rad/s, spin 4-10 rad/s with scaleX = cos(spin) flip; launch 300 ms ease-out then fall 1700 ms; seeded.
- [`catalog-ui-feedback-confetti-rain`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-confetti-rain) **Confetti Rain** (Feedback & Reactions; canvas; 2800 ms; linear; partial, medium). Closest: `effect/confetti`, `background/snow`. Proposal: effect/confetti + mode rain (continuous fall behind content).
  Spec: 40 pieces 8x5 px, 5 colours, from 12 columns across the top (25.5 px apart, +-7 px jitter). Each falls the frame height per 2.8 s or 1.4 s (two speeds), phase-offset; sways +-9 px (1-3 cycles per loop); flips (scaleX = /cos/, 2-5 cycles, darker on the back); tilts +-0.8 rad. Drawn behind the result card. Seamless 2.8 s loop.

### effect/crack: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`catalog-ui-material-glass-crack-recover`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-glass-crack-recover) **Glass Crack Recover** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `line/anime-draw`, `effect/vfx-shatter`. Proposal: effect/crack (new): seeded crack rays drawn from an impact point, optional retract.
  Spec: Impact at 0.55 s: 7 crack rays (4 jagged segments each, seeded) draw from the centre outward in 0.4 s power2.out, 30 ms apart, branches on every second ray; impact ring 4 to 30 px fading over 0.4 s; panel shake 3 px x e^(-10 t) x sin(70 t). Repair 2.1-2.7 s: rays retract from the outside to the centre (reverse stagger, ease-in-out); a light sweep crosses 2.85-3.35 s.
- [`catalog-game-impact-fx-armor-crack`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-armor-crack) **Armor Crack Network** (Game Impact FX; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: effect/crack-spread (new).
  Spec: From the hit point (0.62 s), seeded: 6 main branches at equal angles +-17 deg, each 4 segments of 12-20 px (@320x200) turning +-20 deg per segment; one twig per branch (from segment 1 or 2, +-46 deg, 14-26 px). All draw outward in 300 ms outExpo (twigs start when the branch passes their root); impact ring 6 -> 32 px in 350 ms; shake 3 px 180 ms; cracks fade in 400 ms at the end.

### effect/magnifier: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`catalog-ui-spatial-depth-lens`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-depth-lens) **Depth Lens** (Spatial UI & Depth; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: effect/magnifier (new): lens window showing the target enlarged.
  Spec: Round lens r36 over the content: inside it the same content scaled 2x about the lens centre (grid 16 to 32 px). Lens moves (92,92) to (196,124) at 0.3-1.0 s, to (236,72) at 1.9-2.6 s, back by 4.1 s, power2.inOut. 2 px accent rim, 12 px handle at 45 deg, '2x' tag above. DOM: a duplicate layer scaled and clipped to the circle.
- [`catalog-ui-material-glass-refraction`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-glass-refraction) **Glass Refraction Hover** (Material & Surface Motion; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: effect/magnifier (new) shape rounded rect, x1.4.
  Spec: Rounded window 100x70 (radius 16) slides x 96 to 224 (0.4-1.8 s, ease-in-out) and back (2.6-3.8 s). Inside it the content is scaled 1.4x about the window centre, so lines break at the window edge; 7 % dark tint, a 22 % diagonal light streak and a 1.5 px accent rim. The cursor rides on the window.

### effect/pixelate: NEW · medium · effect · ae png · 2 motion(s)

- [`lk-pixel`](https://motion-reference.takayustudio.jp/#motion=lk-pixel) **Pixelate** (Texture & Look; dom; 600 ms; steps; partial, medium). Closest: `effect/ascii-render-pass`, `effect/dither-pass`, `transition/grid-pixelate`. Proposal: effect/pixelate (new).
  Spec: Picture drawn at low resolution and scaled up without smoothing: block size 32 -> 16 -> 8 -> 4 -> 1 px, 120 ms per step (steps, no tween), 600 ms total; reverse for an exit.
- [`tx-pixel-mosaic`](https://motion-reference.takayustudio.jp/#motion=tx-pixel-mosaic) **Pixel Mosaic Resolve** (Distortion & Glitch; text; 720 ms; steps(6); partial, medium). Closest: `effect/dither-pass`, `transition/grid-pixelate`. Proposal: effect/pixelate (new): mosaic resolve in hard steps.
  Spec: Text (or box) pixelated with block size 32 -> 16 -> 8 -> 4 -> 2 -> 1 px, 6 hard steps of 120 ms (hold keys, smoothing off); letterforms become legible in the last two steps; reverse for an exit.

### effect/shatter-pieces: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`catalog-game-combat-guard-break`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-guard-break) **Guard Break** (Combat & Hit FX; canvas; 2800 ms; linear; partial, low). Closest: `effect/vfx-shatter`. Proposal: effect/shatter-pieces (new) mode=halves.
  Spec: Shield shakes 4 px from impact (0.45 s) to 1.0 s; a 6-point zigzag crack draws top -> bottom in 250 ms outCubic. At 1.0 s it splits along the crack: halves move +-46 px (600 ms outCubic), fall 40 px (550 ms in-quad), rotate +-0.55 rad, bounce 5 px; 6 shards fly (vx +-60, vy -40 to -100 px/s, gravity 160 px/s^2, @320x200). 'BREAK' pops 300 ms back.out.
- [`catalog-game-impact-fx-phase-shatter`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-phase-shatter) **Boss Phase Shatter** (Game Impact FX; canvas; 4200 ms; linear; partial, medium). Closest: `effect/vfx-shatter`, `transition/showcase-destruction`. Proposal: effect/shatter-pieces (new) mode=grid.
  Spec: Panel jitters +-1 px at 40 Hz while 3 crack lines (2 vertical, 1 horizontal) draw in 300 ms outCubic (0.55 s). At 0.95 s it breaks into 3 x 2 tiles flying out from the centre at 110-180 px/s (vertical x0.7, -60 px/s up, gravity 260 px/s^2, @320x200), spinning +-3.5 rad/s, scaling to 0.7, fading over 850 ms. Next title 0.85 -> 1 back.out at 1.85 s, underline 140 px.

### hand/comic-text: EXTEND · medium · effect · ae png · 2 motion(s)

- [`tx-onomatopoeia-impact`](https://motion-reference.takayustudio.jp/#motion=tx-onomatopoeia-impact) **Manga Onomatopoeia Impact** (Japanese; text; 167 ms; linear (no easing); partial, medium). Closest: `hand/comic-text`, `hand/shake`. Proposal: hand/comic-text + param lines (radial speed lines).
  Spec: Word scale 300 % → 100 % in 4 frames, linear / stepped (167 ms), one white flash frame (20–30 %) on landing, shake ±10 px decaying over 8 frames, skewX −7° and rotation −3°, thick 8 px accent outline under the fill; radial speed lines toward the word's centre fading over 0.3–0.5 s.
- [`tx-telop-tsukkomi`](https://motion-reference.takayustudio.jp/#motion=tx-telop-tsukkomi) **Tsukkomi Slam Telop** (Broadcast & Telop; text; 100 ms; easeInQuad; partial, medium). Closest: `hand/comic-text`, `hand/shake`. Proposal: hand/comic-text + param lines (radial speed lines).
  Spec: Text rotated −8°, scale 2.5 → 1 in 3 frames power2.in; from impact the whole stage shakes x 12, −9, 5, −2, 0 px and y −9, 6, −4, 2, 0 px over 8 frames; a speed-line overlay fades 1 → 0 over 0.4 s.

### hand/hit-stop: EXTEND · medium · effect · ae keyframes · 2 motion(s)

- [`settle-drop`](https://motion-reference.takayustudio.jp/#motion=settle-drop) **Settle Drop** (Bounce & Reaction; canvas; 760 ms; easeOutCubic; partial, medium). Closest: `hand/hit-stop`, `motion/tween`. Proposal: hand/hit-stop + param recover_ease.
  Spec: Fall y −110 → 0 (demo −94 px) in 320 ms power1.in, stretching to scaleY 1.1 / scaleX 1/1.1 at contact; the squash eases in over 60 ms to scaleX 1.45 / scaleY 0.62 (origin bottom), then recovers to 1/1 in 550 ms power2.out with no overshoot (heavy); dust dots puff 14–41 px to each side over 500 ms; shadow widens.
- [`catalog-game-impact-fx-critical-compress`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-critical-compress) **Critical Lens Compression** (Game Impact FX; canvas; 4200 ms; linear; partial, low). Closest: `hand/hit-stop`, `motion/inertial-bounce`. Proposal: hand/hit-stop + param anticipate.
  Spec: Whole scene: scaleX 1 -> 0.72 in 150 ms in-cubic (0.45 s), -> 1.14 in 140 ms outCubic, then to 1 by spring k260 d14; scaleY = 1 + (1 - scaleX) x 0.45 (1.13 at the squeeze, 0.94 at the rebound). 'CRITICAL' pops 200 ms back.out at 0.74 s.

### line/outline-draw: EXTEND · medium · block · ae png · 2 motion(s)

- [`border-chase`](https://motion-reference.takayustudio.jp/#motion=border-chase) **Border Chase** (Attention & Emphasis; canvas; 1000 ms; cubic-bezier(0,0,1,1); partial, medium). Closest: `line/outline-draw`, `lower/neon-border`. Proposal: line/outline-draw + param chase.
  Spec: A dash 26 % of the perimeter runs clockwise around a rounded card (radius 12 px), linear, one lap per 1000 ms, looping; drawn as three stacked dashes sharing the head (lengths 26 / 16 / 8 % of the perimeter, opacity 0.25 / 0.55 / 1, width 2 / 2.5 / 3 px, the brightest with a 10 px glow).
- [`lp-conic`](https://motion-reference.takayustudio.jp/#motion=lp-conic) **Rotating Gradient Ring** (Loops & Ambient; dom; 2000 ms; linear; partial, medium). Closest: `line/outline-draw`, `data/conic-progress-ring`, `lower/neon-border`. Proposal: line/outline-draw + param spin (rotating conic gradient, loop).
  Spec: Ring (outer r 50, 8 px band) filled with a conic gradient: accent -> yellow at 30 % -> transparent at 60 % -> accent; the gradient's start angle turns 0 -> 360 deg every 2000 ms linear, looping seamlessly.

### logo/svg-reveal: EXTEND · medium · effect · ae png · 2 motion(s)
Origins named by the site: other:kanjivg (1).

- [`tx-outline-draw`](https://motion-reference.takayustudio.jp/#motion=tx-outline-draw) **Outline Stroke Draw** (Path & Shape; text; 2000 ms; ease-in-out; partial, medium). Closest: `logo/svg-reveal`, `title/stitched-draw`. Proposal: logo/svg-reveal + param text (live text turned into glyph outlines at build).
  Spec: Per glyph outline (path length 1): stroke-dashoffset 1 → 0 over 2 s power1.inOut, glyph stagger 0.1 s, stroke 1.5 px; then fill-opacity 0 → 1 over 0.5 s per glyph, starting 0.6 s before its stroke ends (same 0.1 s stagger).
- [`tx-brush-write-on`](https://motion-reference.takayustudio.jp/#motion=tx-brush-write-on) **Brush Calligraphy Write-On** (Japanese; text; 350 ms; ease-in-out; partial, medium · origin other:kanjivg). Closest: `hand/write-title`, `logo/svg-reveal`. Proposal: logo/svg-reveal + param mode: matte (thick stroke paths reveal a filled artwork).
  Spec: Per stroke a centre-line path wider than the brush (width: entry 0.55 R → 1.15 R at stops → 0 at the sweep) drawn by dashoffset length → 0 with cubic-bezier(.65,0,.35,1), each starting 100 ms (50–150) after the previous; the drawn paths are an alpha matte over the calligraphy artwork.

### motion/anime-layout: EXTEND · medium · effect · ae keyframes · 2 motion(s)

- [`list-trim-collapse`](https://motion-reference.takayustudio.jp/#motion=list-trim-collapse) **List Trim Collapse** (List & Grid; canvas; 780 ms; easeInOutCubic; partial, medium). Closest: `motion/anime-layout`, `cursor/drag-drop`. Proposal: motion/anime-layout + param exit.
  Spec: Row 2 of 4 (24 px rows, 30 px pitch) is deleted after a cursor clicks its ×: opacity 1 → 0 and scaleY 1 → 0 (centre origin) in 250 ms power2.in; 100 ms later rows 3–4 move up one pitch (−30 px) in 350 ms power2.out and hold. A toast ('Deleted · Undo') springs up from below (spring k 260, d 22) 500 ms after the collapse starts.
- [`catalog-data-story-rank-ladder`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-rank-ladder) **Rank Ladder Climb** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `motion/anime-layout`, `data/bar-chart-race`, `data/count-up`. Proposal: motion/anime-layout + param dodge (the overtaking item steps aside while it passes).
  Spec: 3 rows 40 px apart (cards 196 x 30). C's score counts 71 -> 90 over 350-850 ms easeOutCubic, bar 1.3 px per point. At 1100 ms rows reorder by springs (stiffness 200-220, damping 24): C 3 -> 1, A 1 -> 2 (+100 ms), B 2 -> 3 (+160 ms). C shifts sideways up to +26 px and scales 1.04 (half-sine over its travel); a dashed ghost of its old slot fades in / out; deltas fade in 1800-2100.

### motion/follow-chain: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`follow-through`](https://motion-reference.takayustudio.jp/#motion=follow-through) **Follow Through** (Bounce & Reaction; canvas; 860 ms; easeOutCubic; missing, low). Closest: none. Proposal: motion/follow-chain (new).
  Spec: A 40 px body moves x 0 → 180 px in 880 ms power2.inOut and stops; a tail of 5 segments (10 px each) hangs from its top. Each segment angle follows the body's lag on its own spring (stiffness 240 / (1 + 0.8 i), damping ratio 0.26, angle limited to ±66°), so the tip lags ~24 px, overshoots ~11 px after the stop and settles by ~90 % of the cycle. Returns the same way.
- [`ch-tail`](https://motion-reference.takayustudio.jp/#motion=ch-tail) **Tail Follow-through** (Character; dom; 800 ms; spring (per joint); missing, medium). Closest: none. Proposal: motion/follow-chain (new).
  Spec: A chain of 6 joints (tail, hair, scarf): joint i repeats the leader's motion delayed (i + 1) x 40-50 ms through a spring whose damping drops toward the tip (more overshoot at the end), plus a small wiggle growing toward the tip (~0.8 px x i). Segment thickness 8 px tapering 1 px per joint.

### motion/object-sweep: EXTEND · medium · effect · ae expression · 2 motion(s)

- [`scan-line`](https://motion-reference.takayustudio.jp/#motion=scan-line) **Scan Line** (Light & Glow; canvas; 1100 ms; cubic-bezier(0,0,1,1); partial, medium). Closest: `ui/camera-scan-gate`, `motion/object-sweep`. Proposal: motion/object-sweep + param style:"scanline".
  Spec: Inside a card: a 2 px accent line with a 12 px glow sweeps y −10 % → 110 % of the card height, linear, 1100 ms per pass, looping; a 30 px tail above it fades from 28 % to 0 opacity; clipped to the card (6 px bleed). Corner brackets stay still.
- [`holographic-sheen`](https://motion-reference.takayustudio.jp/#motion=holographic-sheen) **Holographic Sheen** (Light & Glow; canvas; 1300 ms; easeInOutSine; partial, medium). Closest: `motion/object-sweep`, `text/shimmer-sweep`. Proposal: motion/object-sweep + param colors, hue.
  Spec: A rainbow band (52 px wide, rotated ~29°, stops transparent → red → yellow → green → blue → transparent) sweeps −120 % → 220 % of the card width in 1300 ms sine.inOut, additive, opacity up to 0.55, with hue-rotate 0 → 55° → 0; drawn under the card's content so only the background shimmers.

### shape/blob: NEW · medium · effect · ae png · 2 motion(s)

- [`liquid-morph`](https://motion-reference.takayustudio.jp/#motion=liquid-morph) **Liquid Morph** (Effects & Transitions; canvas; 1100 ms; easeInOutCubic; partial, medium). Closest: `shape/anime-morph`, `effect/soft-blob-touch`. Proposal: shape/blob (new), mode corners.
  Spec: Box with per-corner radii (TL/TR/BR/BL, % of size): 50/50/50/50 -> 62/38/55/45 -> 34/66/42/58 -> 50/50/50/50 at 0 / 360 / 740 / 1100 ms, each leg easeInOutCubic; on the same keys scaleX 1 -> 1.12 -> 0.90 -> 1 and scaleY 1 -> 0.90 -> 1.10 -> 1. Ends exactly on the start shape.
- [`sh-blob`](https://motion-reference.takayustudio.jp/#motion=sh-blob) **Noise Blob** (SVG & Path; dom; 4000 ms; noise; partial, medium). Closest: `effect/soft-blob-touch`. Proposal: shape/blob (new), mode noise.
  Spec: Closed blob of 80 points: radius 52 px +- 20 px from smooth noise sampled around the circle; the noise time axis moves 0.5/s and loops every 4 s (sample noise on a circle in time so the last frame equals the first).

### text/float-pop: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`catalog-game-combat-damage-numbers`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-damage-numbers) **Damage Numbers** (Combat & Hit FX; canvas; 2800 ms; linear; partial, medium). Closest: `text/land-in`. Proposal: text/float-pop (new).
  Spec: On the hit frame the number appears at the target: scale 0.3 -> 1.35 in 160 ms outCubic, then 1.35 -> 1 in 160 ms outCubic; rises 26 px (@320x200) over 1.0 s outCubic; fades 700-1050 ms. Second hit 800 ms later, offset x +24 px. Target knocks back 7 px (60 ms out, back over 390 ms outCubic) with a 120 ms flash.
- [`catalog-game-combat-status-ailment`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-status-ailment) **Status Ailment** (Combat & Hit FX; canvas; 2800 ms; linear; partial, low). Closest: `motion/anime-path`, `ui/hud-pips`. Proposal: text/float-pop (new).
  Spec: Icon flies on an arc to the target (300 ms in-quad, scale 0.6 -> 1) and lands 1.5 -> 1 (250 ms back.out); target shakes 3 px 250 ms, flashes 120 ms, a green tint fades in over 250 ms. Ticks every 350 ms (0.95-2.0 s): '-6' rises 18 px in 600 ms outCubic, fades 350-600 ms; target squash 6 % (200 ms sine); HP bar -12 % per tick; tick dots light.

### text/glow: NEW · medium · effect · ae keyframes · 2 motion(s)
Origins named by the site: other:troika-three-text (1).

- [`tx-neon-flicker`](https://motion-reference.takayustudio.jp/#motion=tx-neon-flicker) **Neon Flicker-On** (Colour & Light; text; 900 ms; steps; partial, medium). Closest: `text/caption-neon-glow`, `house/twinkle`. Proposal: text/glow (new) mode flicker (seeded per-char flicker-on, layered glow).
  Spec: Unlit: text colour 82 % toward the background with a faint stroke; lit: colour + text-shadows ~4 / 11 / 19 px (and 40 px at 30 %) with a whitish core. Each char follows its own seeded on / off keys over 0.6-0.9 s (steps, <= 3 flashes / s, e.g. on 60 ms, off 80, on 40, off 120, on), then stays lit; optional wall glow (radial gradient ~22 %).
- [`tx-glow-pulse`](https://motion-reference.takayustudio.jp/#motion=tx-glow-pulse) **Glow Pulse** (Colour & Light; text; 667 ms; ease-out; partial, medium · origin other:troika-three-text). Closest: `house/glow-card`, `effect/beat-accent`. Proposal: text/glow (new) mode pulse.
  Spec: Repeat at 1.5 Hz (period 0.667 s): glow blur 4 -> 16 px, glow opacity 0.55 -> 1, outline 0 -> 8 % of font size at 50 % alpha; envelope 15 % attack (ease-out) then 85 % decay (ease-in); core slightly whiter at the peak.

### text/line-by-line-slide: EXTEND · medium · effect · ae keyframes · 2 motion(s)

- [`tx-parallax-lines`](https://motion-reference.takayustudio.jp/#motion=tx-parallax-lines) **Line Parallax** (Scroll; text; 4000 ms; linear (scroll); partial, low). Closest: `camera/scroll-story`. Proposal: text/line-by-line-slide + param parallax (per-line drift speed).
  Spec: Each line drifts y +120 × s → −120 × s px linear over the shot, speed s per line between 0.6 and 1.4 (lines evenly spaced at mid-time); the slowest line slightly dimmed to read farther.
- [`tx-line-spacing-collapse`](https://motion-reference.takayustudio.jp/#motion=tx-line-spacing-collapse) **Line-Spacing Collapse** (Layout & Reflow; text; 1000 ms; easeInOut; partial, medium). Closest: `text/line-by-line-slide`. Proposal: text/line-by-line-slide + param mode: collapse.
  Spec: Lines start at y = (i − mid) × 56 px (~1.5 em) away from their places and close into the tight paragraph in 1 s power2.inOut (cubic-bezier(.65,0,.35,1)); size and tracking unchanged.

### text/marquee: NEW · medium · effect · ae keyframes · 2 motion(s)
Origins named by the site: magicui (1).

- [`tx-scroll-velocity-marquee`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-velocity-marquee) **Scroll Velocity Marquee** (Scroll; text; 5000 ms; spring (damping 50, stiffness 400); partial, medium · origin magicui). Closest: `title/perspective-marquee`. Proposal: text/marquee (new) + param speed keys (spring).
  Spec: Band of huge type, content duplicated, x 0 → −50 % at a base speed (12 s per copy) linear loop; a keyed speed multiplier (up to ×5; a negative sign flips direction) eases back to ×1 on a spring (stiffness 400, damping 50); a second band runs the other way.
- [`tx-infinite-marquee`](https://motion-reference.takayustudio.jp/#motion=tx-infinite-marquee) **Infinite Marquee** (Loops & Decoration; text; 20000 ms; linear; missing, medium). Closest: `title/perspective-marquee`, `lower/news-ticker`. Proposal: text/marquee (new).
  Spec: Track = text + separator twice; x 0 → −50 % linear, 10–20 s per copy, repeating seamlessly; rows alternate direction and style (filled / on a band / outline 1–2 px with no fill).

### text/pressure: NEW · medium · effect · ae png · 2 motion(s)
Origins named by the site: react-bits (2).

- [`tx-text-pressure`](https://motion-reference.takayustudio.jp/#motion=tx-text-pressure) **Text Pressure** (Variable Fonts; text; 300 ms; linear; partial, medium · origin react-bits). Closest: `text/weight-wave`, `text/variable-flex`. Proposal: text/pressure (new): per-char wght / wdth from distance to a simulated cursor, line width held.
  Spec: Per char, distance d to a cursor point moving on a keyed path (e.g. left -> right over 3 s); f = Gaussian(d, sigma ~1.5 char widths); wght = 100 + 800f, wdth = 25 + 126f (RFlex ranges); then rescale letter widths so the line keeps its rest width (far letters condense); min font size 24 px.
- [`tx-variable-proximity`](https://motion-reference.takayustudio.jp/#motion=tx-variable-proximity) **Variable Proximity** (Variable Fonts; text; 300 ms; gaussian falloff; partial, low · origin react-bits). Closest: `text/weight-wave`. Proposal: text/pressure (new) mode proximity (weight + opsz only, positions fixed).
  Spec: Simulated cursor path; per char wght 400 -> 900 and opsz 9 -> 40 by a Gaussian falloff of distance (radius 50-100 px); positions never move.

### text/snap-out: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`catalog-game-cinematic-defeat-dissolve`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-defeat-dissolve) **Defeat Dissolve** (Game Cinematics; canvas; 2800 ms; linear; partial, medium). Closest: `text/particle-dissolve`. Proposal: text/snap-out (new) style=dissolve.
  Spec: Word holds 0.7 s. From 1.0 s letters leave 90 ms apart: each over 550 ms in-quad rises 20 px (@320x200), scaleX 1 -> 0.85, scaleY 1 -> 0.65, fades; each sheds 6 tiny squares that drift up 24-44 px and fade over 700 ms (30 ms apart). 'TRY AGAIN' pill rises 8 px, 350 ms back.out at 1.6 s.
- [`tx-collapse-to-center`](https://motion-reference.takayustudio.jp/#motion=tx-collapse-to-center) **Collapse To Center** (Exit; text; 500 ms; power3.in; partial, medium). Closest: `motion/anime`. Proposal: text/snap-out (new) style collapse (the exit companion land-in already names).
  Spec: Per char: x -> the line centre (offset = centre minus the char centre, measured), scale 1 -> 0, 0.5 s power3.in; stagger 0.03 s from the edges inward (outer chars first, centre last).

### text/soft-blur-in: EXTEND · medium · effect · ae png · 2 motion(s)

- [`bloom-reveal`](https://motion-reference.takayustudio.jp/#motion=bloom-reveal) **Bloom Reveal** (Light & Glow; canvas; 780 ms; easeOutQuart; partial, medium). Closest: `text/soft-blur-in`, `house/glow-card`. Proposal: text/soft-blur-in + param bloom.
  Spec: Logo/icon reveal 780 ms power3.out (easeOutQuart): scale 0.82 → 1, brightness 3 → 1 (exposure +2), blur 4 → 0 px; an additive halo (two discs, radius 30 + 0.8 g and 44 + g px) with glow g 38 → 8 (at 540 ms) → 0 (780 ms) fading with it.
- [`blur-zoom`](https://motion-reference.takayustudio.jp/#motion=blur-zoom) **Blur Zoom** (Effects & Transitions; canvas; 720 ms; easeOutQuart; partial, medium). Closest: `text/soft-blur-in`, `text/focus-blur-resolve`, `text/staggered-fade-up`. Proposal: text/soft-blur-in + param scale (start scale, distance 0).
  Spec: Whole element: scale 0.65 -> 1, blur 14 px -> 0, opacity 0 -> 1, all over 720 ms easeOutQuart (cubic-bezier .25,1,.5,1), all three end on the same frame; no translate, scale about the centre. Demo loop 2.2 s: in at 0.30 s, hold, then reverse over 0.25 s ease-in cubic from 1.85 s.

### text/sparkles: NEW · medium · effect · ae keyframes · 2 motion(s)
Origins named by the site: magicui (1), other:booth.pm (1).

- [`tx-sparkles-text`](https://motion-reference.takayustudio.jp/#motion=tx-sparkles-text) **Sparkles Text** (Loops & Decoration; text; 800 ms; ease-in-out; missing, medium · origin magicui). Closest: `house/twinkle`, `text/caption-particle-burst`. Proposal: text/sparkles (new), mode twinkle.
  Spec: 10 four-point star sprites (~1 em) on and around the text box; each lives 0.8 s: scale 0 → 1 → 0, rotation 75° → 150°, opacity 0 → 1 → 0, ease-in-out; lifetimes evenly offset, each respawning at a new seeded position (ctx.hash).
- [`tx-telop-kirakira`](https://motion-reference.takayustudio.jp/#motion=tx-telop-kirakira) **Sparkle-Appear Telop** (Broadcast & Telop; text; 233 ms; easeOutBack; partial, medium · origin other:booth.pm). Closest: `text/text-shimmer`, `house/twinkle`. Proposal: text/sparkles (new), mode burst.
  Spec: Text scale 0.7 → 1 + fade in over 7 frames back.out(1.7); ~8 stars burst from the centre to (cos a × 90, sin a × 40) px with scale 0 → 1 and rotation 180°, 0.8 s power3.out, fading after 0.5 s; at 0.75 s a light sweep crosses inside the letters (105° band, 0.6 s ease-in-out).

### title/credits-roll: NEW · medium · block · ae keyframes · 2 motion(s)

- [`tx-opening-crawl`](https://motion-reference.takayustudio.jp/#motion=tx-opening-crawl) **Perspective Opening Crawl** (Titles & Film; text; 60000 ms; linear; missing, low). Closest: `title/perspective-marquee`. Proposal: title/credits-roll (new) + param tilt (perspective crawl).
  Spec: Text block on a plane tilted rotateX 20–25° (perspective 400 px, origin 50 % 100 %) moves translateY 100 % → −200 % linear over 60 s or more; a gradient mask fades it before the horizon (transparent → opaque by 40 % of the height).
- [`tx-credits-roll`](https://motion-reference.takayustudio.jp/#motion=tx-credits-roll) **End Credits Roll** (Broadcast & Telop; text; 60000 ms; linear; missing, medium). Closest: none. Proposal: title/credits-roll (new).
  Spec: Credits column (roles small, names large) moves up at a whole number of px per frame (2 px at 60 fps = 120 px/s; 1–4 px allowed), linear; duration = (content height + frame height) ÷ speed; text ≈ #ebebeb on #101010.

### title/warning-bands: NEW · medium · block · ae keyframes · 2 motion(s)

- [`catalog-game-cinematic-boss-warning`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-boss-warning) **Boss Warning** (Game Cinematics; canvas; 2800 ms; linear; partial, medium). Closest: `lower/stack-bars`. Proposal: title/warning-bands (new).
  Spec: Frame tints red 10 %. Top hazard band (20 px, diagonal stripes every 18 px @320x200) slides in from the left, bottom band from the right, 400 ms outExpo at 0.3 s; stripes drift 22 px/s in opposite directions. Title revealed by a clip widening from centre 0 -> 260 px (300 ms outCubic, 0.75 s), steady, no flashing. Bands exit opposite ways 250 ms in-expo at 2.3 s.
- [`catalog-game-impact-fx-warning-stripe`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-warning-stripe) **Warning Stripe Slam** (Game Impact FX; canvas; 4200 ms; linear; partial, medium). Closest: `lower/stack-bars`, `hand/shake`. Proposal: title/warning-bands (new).
  Spec: Two hazard bands (20 px, stripes every 18 px @320x200) rush in from opposite sides by spring k380 d24 (~200 ms) at 0.3 s; on landing (0.52 s) they squash vertically to 0.65, recovering e^(-16t), frame shakes 4 px 120 ms; 'DANGER' scales 1.3 -> 1 and fades in over 180 ms outExpo 120 ms later. Stripes drift 18 px/s opposite. Exit 280 ms in-expo at 3.5 s.

### ui/avatar-group-hover: EXTEND · medium · block · ae keyframes · 2 motion(s)

- [`catalog-ui-feedback-emoji-bar`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-emoji-bar) **Emoji Bar** (Feedback & Reactions; canvas; 2800 ms; linear; partial, medium). Closest: `ui/avatar-group-hover`. Proposal: ui/avatar-group-hover + mode select (one item lifts, the others dim, a label pill).
  Spec: 5 icons 43 px apart in a pill 220x44. Selected icon: y -16 px and scale 1.4 on a spring k320 d22; the others drop to opacity 0.45 while one is lifted; a dark label pill 44x18 appears above it. Selection: icon 2 at 0.55 s, icon 4 at 1.4 s, none at 2.25 s. The cursor follows on a spring.
- [`catalog-ui-spatial-perspective-dock`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-perspective-dock) **Perspective Dock** (Spatial UI & Depth; canvas; 4200 ms; linear; partial, medium). Closest: `ui/avatar-group-hover`, `house/gallery-strip`. Proposal: ui/avatar-group-hover + mode dock (Gaussian magnification by cursor distance).
  Spec: Dock of 7 icons 26 px, gaps 7 px. Cursor x travels 26 to 160 (0.35-1.4 s), then to 296 (2.7-3.6 s), inOut. Icon scale = 1 + 0.7 x on x exp(-((icon x - cursor x) / 40)^2); lift = 10 px x k^2 with k = (scale - 1) / 0.7; the dock widens so gaps stay 7 px. 'on' rises on a spring k220 d24 at 0.55 s and falls at 3.35 s.

### ui/like-burst: NEW · medium · effect · ae keyframes · 2 motion(s)

- [`catalog-ui-control-heart-like`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-heart-like) **Heart Like** (Selection & Controls; dom; 2800 ms; linear; partial, medium). Closest: `social/x-post`. Proposal: ui/like-burst (new): heart fill pop + particle burst on the film's icon.
  Spec: Loop 2.8 s: the outline heart hides at 0.67 s (0.1 s); the filled heart pops: scale 0.65 to 1.14 in 0.2 s, to 1 in 0.22 s, fading in; 8 particles from 0.78 s: scale 0.3 to 1 (0.11 s), fly radially to (cos a x 56-74, sin a x 37 - 18 px) by +0.56 s, then drift x1.12 / x1.45 further, rotate and fade by +1.46 s.
- [`catalog-ui-feedback-heart-burst`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-heart-burst) **Heart Burst** (Feedback & Reactions; canvas; 2800 ms; linear; partial, medium). Closest: `social/x-post`. Proposal: ui/like-burst (new) mode hearts.
  Spec: Heart r30 outline. Press 0.35-0.45 s scale 1 to 0.85; release fills it and springs back to 1 (k300 d12). Six small hearts r7 (two colours) start 0.47 s, 45 ms apart, on a fan around straight up (-90 deg +-55 deg, 22 deg steps): fly from 28 to 58-72 px out, rise 10 px extra, sway +-4 px, fade over the last 45 % of 0.95 s. Counter 128 to 129.

### ui/skeleton-reveal: EXTEND · medium · block · ae keyframes · 2 motion(s)

- [`skeleton-shimmer`](https://motion-reference.takayustudio.jp/#motion=skeleton-shimmer) **Skeleton Shimmer** (Loading & Data; dom; 1200 ms; linear; partial, medium). Closest: `ui/skeleton-reveal`, `text/shimmer-sweep`. Proposal: ui/skeleton-reveal + param shimmer (moving highlight band instead of a pulse).
  Spec: Grey skeleton boxes (avatar circle, two lines, image block, two lines). A soft lighter band (grey to light to grey, about 80 px wide, slight diagonal) moves across in page space from -200 % to +200 %, linear, 1.2 s per pass, repeating; one band shared by all boxes and clipped to them. Content later cross-fades in place.
- [`catalog-ui-loading-skeleton-shimmer`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-skeleton-shimmer) **Skeleton Shimmer** (Loading & Progress; canvas; 2800 ms; linear; partial, medium). Closest: `ui/skeleton-reveal`. Proposal: ui/skeleton-reveal + param shimmer (shared moving highlight band).
  Spec: Highlight band moves linear 900 ms per pass across all skeleton boxes (one shared band, clipped to the boxes); at 1.85-2.1 s the real content fades in at the same positions (avatar, two lines, image, two lines); 2.55 s back to skeleton.

### background/embers: NEW · medium · block · ae png · 1 motion(s)

- [`pt-embers`](https://motion-reference.takayustudio.jp/#motion=pt-embers) **Rising Embers** (Particles; dom; 3000 ms; linear + noise; partial, medium). Closest: `background/snow`. Proposal: background/embers (new), like background/snow but rising.
  Spec: 36 particles, 3 s life each with a seeded phase: y bottom -> top linear, x sway +-10 px (sine), radius 4 -> 0.5 px and opacity 1 -> 0 over the life, warm yellow for the first 40 % then red; seamless 3 s loop.

### background/speed-lines: NEW · medium · block · ae expression · 1 motion(s)

- [`catalog-game-impact-fx-speedline-tunnel`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-speedline-tunnel) **Speedline Tunnel** (Game Impact FX; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: background/speed-lines (new).
  Spec: 40 radial lines at fixed angles (+-3 deg jitter) stream outward: looping phase u (seeded offsets) gives radius 16 + 190 u^2 px (@320x200), length (6 + 70 v) u^2 + 3, width 0.8 + 2.2 u, opacity min(1, 3u) x (0.4 + 0.6 v); every 6th line accent. Speed v ramps 0.2 -> 1 (0.3-1.1 s inOut) and back (3.2-3.9 s). Centre word scales 1 + 0.08 v, jitters +-0.75 px at 30 Hz above v 0.9.

### background/type-tunnel: NEW · medium · block · ae keyframes · 1 motion(s)

- [`catalog-kinetic-type-type-tunnel`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-type-tunnel) **Perspective Type Tunnel** (3D & Depth; canvas; 4200 ms; linear; missing, medium). Closest: `background/gallery-tunnel`, `transition/clone-wall`. Proposal: background/type-tunnel (new).
  Spec: 4 copies of one word on a shared centre; copy i has depth z = fract((i + 2t / 4.2) / 4) (a copy enters every 2.1 s, each crosses in 8.4 s); scale = 0.3 × 22^z (0.3 → 6.6, exponential); opacity = min(1, 6z) × (1 − z)^1.8; while z < 0.4 the copy is filled accent, nearer copies are outline only (1.6 px on screen). Seamless loop.

### card/cube: NEW · medium · block · ae keyframes · 1 motion(s)

- [`3d-cube`](https://motion-reference.takayustudio.jp/#motion=3d-cube) **Cube Rotation** (3D; dom; 4000 ms; linear; missing, medium). Closest: none. Proposal: card/cube (new).
  Spec: CSS 3D cube, 6 faces (pictures or text), perspective about 1.1 x the frame width; rotateY 0 -> 360 deg over 4000 ms linear with a fixed rotateX 20 deg (demo ~29 deg), faces z-sorted, seamless loop.

### card/fan: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`ui-fan`](https://motion-reference.takayustudio.jp/#motion=ui-fan) **Card Stack Fan** (Web Interaction; dom; 600 ms; spring; partial, medium). Closest: `device/multi-device-splay`, `card/split-tilt-cards`. Proposal: card/fan (new) effect on the film's cards.
  Spec: Stack of cards on a shared bottom pivot. Each card rotates out to its fan angle (8-15 deg, alternating sides) on a spring of about 600 ms, each starting 40 ms after the card above; only the top card overshoots (underdamped), the lower ones settle without overshoot; a faint afterimage at the top card's landing spot.

### card/flip-reveal: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-game-reward-reward-card`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-reward-card) **Reward Card Reveal** (Rewards & Loot; canvas; 2800 ms; linear; missing, medium). Closest: none. Proposal: card/flip-reveal (new).
  Spec: Card lifts 12 px and scales 1.06 (300 ms outCubic from 0.3 s), flips 180 deg around Y in 500 ms inOut (0.65-1.15 s), back face swapped for the front at 90 deg, extra +4 % scale mid-flip; floor shadow narrows with /cos/. Lowers 60 % of the lift 1.2-1.5 s inOut; name label rises 6 px once the face shows (1.3-1.5 s).

### card/spotlight-card: EXTEND · medium · block · ae png · 1 motion(s)

- [`card-spotlight`](https://motion-reference.takayustudio.jp/#motion=card-spotlight) **Card Spotlight** (Web Interaction; canvas; 1800 ms; easeInOutSine; partial, medium). Closest: `card/spotlight-card`, `effect/spotlight`. Proposal: card/spotlight-card + param path (glow follows a cursor path, fades in on enter).
  Spec: Card 180x132, radius 14. A radial accent glow (radius 92 px) clipped to the card follows the cursor with a 90 ms lag; its opacity goes 0 to 55 % while the cursor is over the card and back when it leaves (same lag). Cursor path 3.4 s (sine ease): (296,184) to (214,128) at 0.8 s, (108,70) 1.4, (196,140) 2.0, (140,90) 2.5, (30,180) 3.0, back to start.

### card/star-rating-fill: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`catalog-game-reward-three-star`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-three-star) **Three Star Clear** (Rewards & Loot; canvas; 2800 ms; linear; partial, medium). Closest: `card/star-rating-fill`, `text/land-in`. Proposal: card/star-rating-fill + param mode=slam.
  Spec: Three stars (outer two smaller) over grey slots, landing 420 ms apart from 0.35 s: each scales 2.2 -> 1 and rotates -40 -> 0 deg in 180 ms in-cubic, then 0.8 -> 1 spring k400 d14; 2 px shake 150 ms and an 8-dot burst per landing. 'CLEAR' rises 8 px (1.75-2.0 s outCubic) with an 80 px underline.

### cursor/magnetic: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`magnetic-button`](https://motion-reference.takayustudio.jp/#motion=magnetic-button) **Magnetic Button** (Web Interaction; canvas; 1800 ms; easeOutCubic; partial, medium). Closest: `cursor/magnetic`. Proposal: cursor/magnetic + mode button-follow (the button, not the cursor, is pulled).
  Spec: Pill button 120x44 at centre, magnetic radius 74 px. While the cursor is inside, button offset = (cursor - centre) x 0.18, clamped to 12 px length; the label moves half as far (x0.09); offset follows on a spring k240 d22; outside the radius it springs back (about 420 ms). Cursor path 3.6 s inOut: (292,172) to (214,74) at 0.9 s, (186,124) 1.5, (126,78) 2.1, (36,44) 2.6, (70,184) 3.05, back to start.

### cursor/swipe-rail: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`section-snap`](https://motion-reference.takayustudio.jp/#motion=section-snap) **Section Snap** (Web Scroll; canvas; 850 ms; easeOutQuart; partial, medium). Closest: `cursor/swipe-rail`, `ui/scroll-feed`. Proposal: cursor/swipe-rail + param axis y (full-screen vertical pager) and an aborted drag that springs back.
  Spec: Phone viewport 96x160 with full-height panels (160 px each). 0.3-0.8 s a finger drags the content up 50 px (power2.inOut); released under 50 % it returns to 0 in 0.85 s power3.out (easeOutQuart). 1.85-2.35 s drag to 100 px; released over 50 % it snaps to 160 (next panel) in 0.85 s power3.out. Finger dot shown while dragging; a small page map shows the active panel.

### cursor/touch: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`pinch-zoom`](https://motion-reference.takayustudio.jp/#motion=pinch-zoom) **Pinch Zoom** (Gesture & Mobile; dom; 820 ms; easeOutCubic; partial, medium). Closest: `cursor/touch`. Proposal: cursor/touch + gesture pinch (two touch rings spreading, content scaling about their midpoint).
  Spec: Two touch rings spread apart symmetrically about the pinch centre; content scale = current gap / start gap, clamped 1 to 3, transform origin at the pinch centre; on release the content settles in 820 ms power2.out (easeOutCubic). The site copy has no demo numbers beyond these (DOM demo 'sc-pinch' is not in the files); e.g. ring gap 60 to 180 px for 3x.

### data/function-plot: EXTEND · medium · block · ae png · 1 motion(s)

- [`catalog-data-story-timeline-trail`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-timeline-trail) **Timeline Scrub Trail** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `data/function-plot`, `data/mk-line-graph`. Proposal: data/function-plot + params series (data points) and time rail.
  Spec: Whole line drawn faint (5 points). A marker scrubs along x with linear keys: 650-1550 ms to the 3rd point, hold to 1850, to the end by 2750; the line left of the marker redrawn thick in accent (clip at marker x); dot on the line + value tag; time rail below with a handle at the same x and a dashed drop line. Return 3450-3950 easeInOut. Optional cursor dragging the handle.

### data/heatmap: NEW · medium · block · ae keyframes · 1 motion(s)

- [`catalog-data-story-heatmap-ripple`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-heatmap-ripple) **Heatmap Ripple Focus** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `motion/anime-stagger-grid`. Proposal: data/heatmap (new), ripple via anime-stagger-grid from the focus cell.
  Spec: 8 x 5 grid of 26 px cells (30 px pitch), colour opacity = value (data colours never change). Focus cell (col 6, row 3) clicked at 950 ms springs to scale 1.18 (stiffness 260, damping 18) with a 2 px outline. Other cells pulse by ring distance d (max /dx/, /dy/): start 1050 + 120 d ms, scale 1 -> 1.14 -> 1 as a half-sine over 450 ms with a fading outline. Value tag above the focus 1100-1350.

### data/sankey: NEW · medium · block · ae keyframes · 1 motion(s)

- [`catalog-data-story-sankey-flow`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-sankey-flow) **Sankey Flow Reveal** (Data Storytelling; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: data/sankey (new).
  Spec: Source bar (10 px wide) grows to 100 px 200-600 ms easeOutExpo. Two ribbons (60 and 40, thickness = value px, cubic curves, control points at mid-x) revealed by a clip edge moving left -> right linearly 600-2200 ms; a dotted streak (2/9) flows along each at 26 px/s. Target bars 60 / 40 grow 2050-2450 / 2150-2550 ms easeOutExpo; labels 2300-2600; '60 + 40 = 100' 2700-3000; fade out 3600-3950.

### effect/cloth-wave: NEW · medium · effect · ae png · 1 motion(s)

- [`catalog-ui-material-cloth-wave`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-cloth-wave) **Cloth Wave Panel** (Material & Surface Motion; canvas; 4200 ms; linear; missing, medium). Closest: none. Proposal: effect/cloth-wave (new).
  Spec: Panel cut into 18 vertical strips 11 px wide. Strip i offset y = 9 px x ramp x decay x sin(2 pi tau / 0.85 s), tau = t - 0.3 s - 45 ms x i; ramp 0 to 1 over 0.35 s, decay 1 to 0 between 1.4-2.3 s (ease-in-out); the bottom edge moves 1.25x the top. Shade each strip by its slope (lighter rising, darker falling).

### effect/film-grain: EXTEND · medium · effect · ae expression · 1 motion(s)

- [`noise-reveal`](https://motion-reference.takayustudio.jp/#motion=noise-reveal) **Noise Resolve** (Effects & Transitions; canvas; 1000 ms; easeOutSine; partial, medium). Closest: `effect/film-grain`, `text/soft-blur-in`, `effect/particle-image-reveal`. Proposal: effect/film-grain + param fade (grain opacity 0.85 -> 0 with the reveal).
  Spec: Grain layer clipped to the subject area fades in over 250 ms (subject at 20 % opacity). Then over 1000 ms easeOutSine: grain opacity 0.85 -> 0 (re-seeded 24 times / s, dark + accent specks), subject blur 8 px -> 0 and opacity 0.2 -> 1, all ending together. Exit 250 ms ease-in.

### effect/fireworks: NEW · medium · block · ae expression · 1 motion(s)

- [`pt-fireworks`](https://motion-reference.takayustudio.jp/#motion=pt-fireworks) **Fireworks with Trails** (Particles; dom; 1500 ms; easeOutCubic + gravity; missing, medium). Closest: none. Proposal: effect/fireworks (new).
  Spec: Rocket dot rises 100-700 ms easeOutQuad (~120 px). Burst at the top: 24 particles at 15 deg steps, distance 70 px x (1 - e^(-2.5 t)), gravity sag 20 px x t^2, each with 5 trail copies 40 ms behind (opacity 1 - k/5, shrinking); fade over 1-2 s after the burst; 2 alternating colours.

### effect/freeze-drain: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-game-impact-fx-freeze-color-drain`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-freeze-color-drain) **Freeze-frame Color Drain** (Game Impact FX; canvas; 4200 ms; linear; partial, medium). Closest: `transition/beat-freeze-cut`, `effect/freeze-frame-dressing`. Proposal: effect/freeze-drain (new).
  Spec: Scene motion runs, then at 1.3 s time freezes on that frame and saturation drops 100 -> 0 % in 150 ms outCubic; corner brackets and a 'PAUSED' label fade in with it; hold 1.6 s; colour returns over 200 ms in-cubic as time resumes at 3.1 s.

### effect/lens-flare-sweep: NEW · medium · effect · ae png · 1 motion(s)

- [`lens-flare-sweep`](https://motion-reference.takayustudio.jp/#motion=lens-flare-sweep) **Lens Flare Sweep** (Light & Glow; canvas; 1050 ms; easeInOutCubic; partial, medium). Closest: `effect/vfx-anamorphic-flare`, `background/light-sweep-pass`. Proposal: effect/lens-flare-sweep (new).
  Spec: A light source sweeps x −155 → +155 px across a title in 1050 ms power2.inOut; brightness envelope sin(π p)^0.5, peak when centred (Gaussian width 60 px). Source: core 4–7 px, halo 12–20 px, horizontal streak (ellipse 70–110 px wide, 6 % tall, blur 3). Three ghost discs at +0.7×, −0.7× and −0.4× the offset (r 10 / 7 / 14 px, 20–35 % opacity), screen blend; title tinted 35 % at the peak.

### effect/neon-flicker: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`neon-flicker`](https://motion-reference.takayustudio.jp/#motion=neon-flicker) **Neon Flicker** (Light & Glow; canvas; 900 ms; cubic-bezier(0,0,1,1); missing, medium). Closest: none. Proposal: effect/neon-flicker (new).
  Spec: Neon sign turns on over 900 ms: opacity holds in steps (no tween) at 20 % from 0, 100 % from 9 %, 35 % from 14 %, 100 % from 22 %, 55 % from 31 %, 100 % from 42 % on. Lit tube = 3 px stroke with a 16 px glow plus a soft radial wash (16 % opacity) behind; the unlit tube stays visible as a dim outline.

### effect/screen-warp: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`lk-crt`](https://motion-reference.takayustudio.jp/#motion=lk-crt) **CRT Scanlines** (Texture & Look; dom; 3000 ms; linear; partial, medium). Closest: `effect/screen-warp`, `background/lcd-board`. Proposal: effect/screen-warp + param scanlines (lines only, rolling band).
  Spec: Overlay: 1 px dark lines every 2-3 px at 15-22 % opacity, plus a 30 px white band at 12 % opacity rolling top -> bottom over 3000 ms linear, looping.

### effect/spotlight-relay: NEW · medium · block · ae keyframes · 1 motion(s)

- [`catalog-data-story-kpi-relay`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-kpi-relay) **KPI Spotlight Relay** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `effect/spotlight`, `ui/focus-swap`. Proposal: effect/spotlight-relay (new) on the film's own cards.
  Spec: 3 KPI cards (74 x 58) fixed at 22 / 50 / 78 % width. Spotlight (lamp + cone at 14 % accent + floor ellipse at 30 %) turns on 200-450 ms, moves card to card by springs (stiffness 170, damping 24) at 1350 and 2450 ms, back to the first at 3600; off 3350-3600. Card lit = 1 - /cone x - card x/ / 56 px: opacity 0.45 -> 1 and accent border when lit > 0.5. Values never move.

### effect/vhs: NEW · medium · block · ae png · 1 motion(s)

- [`tx-vhs-scanline`](https://motion-reference.takayustudio.jp/#motion=tx-vhs-scanline) **VHS Tracking Noise** (Distortion & Glitch; text; 3000 ms; linear; partial, medium). Closest: `effect/screen-warp`, `effect/grain-overlay`, `background/lcd-board`. Proposal: effect/vhs (new): rolling noise band, scanlines, periodic jump, chroma bleed.
  Spec: Overlay: scanlines 2 px period at 15 %; a noise band 6 % of the frame height rolls top -> bottom every 3 s linear, rows inside shift sideways +-4-8 px (seeded per frame); every 2-4 s (seeded) the picture jumps 4-10 px for 2-3 frames; constant chroma bleed red -2 px / cyan +2 px at 50 % (screen).

### engine / rig: film.json text option fit: width (font size set at build): NEW · medium · - · ae - · 1 motion(s)
Origins named by the site: other:remotion (1).

- [`tx-fit-text-title`](https://motion-reference.takayustudio.jp/#motion=tx-fit-text-title) **Fit-to-width Title** (Layout & Reflow; text; 800 ms; easeInOut; missing, medium · origin other:remotion). Closest: none. Proposal: film.json text option fit: width (font size set at build).
  Spec: fontSize = min(max size, size × (frame width − 2 × padding) ÷ measured width), measured after the font loads; one line, nowrap; re-measure when the text changes (e.g. padding 80 px each side, cap 240 px).

### engine / rig: rig AIMK_RIG.anim + jump(id, t, height): NEW · medium · effect · ae keyframes · 1 motion(s)

- [`ch-jump`](https://motion-reference.takayustudio.jp/#motion=ch-jump) **Jump** (Character; dom; 1000 ms; easeOutQuad / easeInQuad; partial, medium). Closest: `rig:AIMK_RIG.anim.squash`, `house/hop`. Proposal: rig AIMK_RIG.anim + jump(id, t, height).
  Spec: Crouch 200 ms: scaleY 1 -> 0.78 (scaleX = 1/scaleY, bottom origin). Rise 300 ms easeOutQuad to the jump height (80 px demo) with an early stretch scaleY ~1.2, fall 300 ms easeInQuad, land: squash scaleY 0.65 -> 1 over 180 ms (recipe 'land 1.35 -> 1'). ~1 s total.

### engine / rig: rig AIMK_RIG.anim + look(who, t, dir): eyes -> head -> body : NEW · medium · effect · ae keyframes · 1 motion(s)

- [`ch-turn`](https://motion-reference.takayustudio.jp/#motion=ch-turn) **Head Turn** (Character; dom; 600 ms; easeInOutCubic; partial, medium). Closest: `rig:AIMK_RIG.anim.pose`. Proposal: rig AIMK_RIG.anim + look(who, t, dir): eyes -> head -> body cascade.
  Spec: Eyes shift toward the look direction 0-250 ms, head turns / moves 100-450 ms, body follows 200-600 ms, easeInOutCubic (eyes easeOutCubic in the demo); return in the same order. 100 ms offsets = overlapping action.

### flow/input-feedback: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`floating-label`](https://motion-reference.takayustudio.jp/#motion=floating-label) **Floating Label** (Forms & State; canvas; 520 ms; easeOutCubic; partial, medium). Closest: `flow/input-feedback`, `flow/signup-flow`. Proposal: flow/input-feedback + param float (the label rises and shrinks on focus, then the value types).
  Spec: Field 180x52, radius 10. Focus at 0.5 s: accent 2 px ring fades in over 0.12 s. Label 'Email' (14 px) moves up 13 px (the recipe gives 25 px for a taller field) and scales 1 to 0.72 from its left edge, colour grey to accent, 0.3 s power2.out. From 0.95 s the value types one character every 55 ms; the caret blinks (0.5 s) when idle. Label returns 2.95-3.25 s power2.inOut.

### flow/step-domino: NEW · medium · block · ae keyframes · 1 motion(s)

- [`catalog-data-story-event-domino`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-event-domino) **Event Sequence Domino** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `ui/state-chip-rail`, `hand/pipeline`, `data/sequence-diagram`. Proposal: flow/step-domino (new).
  Spec: 4 step boxes 50 x 56 px, 70 px apart, on a floor line. Box i starts at 350 + 620 i ms: rises scaleY 0.08 -> 1 (bottom origin) over 320 ms back.out, accent fill while running; at +400 ms it resolves to the plain card and a green check badge pops (220 ms back.out) at its top-right; at +420 to +580 ms an arrow draws to the next box (easeOutCubic). Exit: boxes fold down in reverse, 50 ms apart.

### flow/toggle-flip: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`catalog-ui-control-day-night`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-day-night) **Day and Night** (Selection & Controls; canvas; 2800 ms; linear; partial, medium). Closest: `flow/toggle-flip`, `ui/icon-morph-beat`. Proposal: flow/toggle-flip + skin day-night (sun to moon, sky colour, stars).
  Spec: Track 140x60 (radius 30); knob r15 moves x +80 px with rotation 0 to 135 deg over 0.6 s power2.inOut. Sun: 8 rays shrink 6 to 0 px over the first half; knob tints to night; the crescent is a sky-coloured circle r13 sliding in over the second half. Sky blue overlay 55 % to 0; two clouds sink 26 px and fade (0.1 apart); 5 stars pop (back.out) at 35 % + 10 % each of progress. Reverse at 1.7 s.

### hand/watercolor: EXTEND · medium · effect · ae png · 1 motion(s)

- [`ink-reveal`](https://motion-reference.takayustudio.jp/#motion=ink-reveal) **Ink Reveal** (Effects & Transitions; canvas; 980 ms; easeOutCubic; partial, medium). Closest: `hand/watercolor`, `effect/ink-bleed-reveal`. Proposal: hand/watercolor + param mask (the wash reveals the target instead of painting behind it).
  Spec: Four soft blobs as a mask on the target, centres at (24 %, 60 %), (55 %, 29 %), (78 %, 60 %), (44 %, 83 %) of its box, starting 0 / 250 / 150 / 500 ms; each radius 0 -> about half the box width (110 px on a 220 px box) over 1200 ms easeOutCubic; 2.5 px feather, edge wobble +-14 % of radius fading as it grows; blobs merge into a full reveal. Recipe: 980 ms, r 0 -> 105 px.

### line/anime-draw: EXTEND · medium · effect · ae png · 1 motion(s)

- [`catalog-ui-material-neon-tube-draw`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-neon-tube-draw) **Neon Tube Draw** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `line/anime-draw`, `lower/neon-border`. Proposal: line/anime-draw + style neon (glow, dim unlit tube, completion flicker).
  Spec: Neon word path (several strokes) drawn at constant speed over 2 s (linear) from 0.35 s: lit stroke 4.5 px accent with a 14 px glow plus a 1.2 px bright core, glowing head dot; the unlit tube shown dim underneath (6 px grey + 2 px line). On completion two flickers: opacity 1, 0.35, 1, 0.5, 1 in 50 ms steps. Lights off 3.55-3.8 s.

### line/border-beam: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-game-reward-loot-rarity`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-loot-rarity) **Loot Rarity** (Rewards & Loot; canvas; 2800 ms; linear; partial, medium). Closest: `lower/neon-border`, `house/glow-card`. Proposal: line/border-beam (new).
  Spec: Pending: card 64 x 64 px, radius 12 (@320x200), grey edge; a 28 px light dash orbits the border (perimeter ~235 px) at 320 px/s. Decided at 1.1 s: dash fades in 100 ms; accent edge + 3 glow rings (+3/+6/+9 px at 40/20/9 %) fade in 250 ms outCubic; an outline bursts +16 px over 450 ms; icon pops 300 ms back.out; '?' fades; 'EPIC' pill rises 8 px in 250 ms.

### lower/bold-block: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`catalog-game-progress-quest-banner`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-quest-banner) **Quest Banner** (Progression & Quests; canvas; 2800 ms; linear; partial, medium). Closest: `lower/bold-block`, `line/draw`. Proposal: lower/bold-block + params origin=center, tails.
  Spec: Band 48 px high (@320x200) opens from the centre 0 -> 240 px in 500 ms outExpo (0.3 s); ribbon tails slide out 22 px (300 ms back.out, 0.55 s); kicker and title rise 6 px and fade inside the band (450 ms outCubic, 0.45 s); underline grows from centre to +-112 px (430 ms outExpo, 0.62 s) with diamond ends; objective row fades up at 0.95 s. Close: height -> 0 in 200 ms in-cubic.

### lower/news-ticker: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`tx-breaking-banner`](https://motion-reference.takayustudio.jp/#motion=tx-breaking-banner) **Breaking News Banner** (Broadcast & Telop; text; 267 ms; easeOutCubic; partial, medium). Closest: `lower/news-ticker`, `lower/bold-block`. Proposal: lower/news-ticker + mode breaking (colour flash, skew slam).
  Spec: Banner scaleX 0 → 1 from the left in 8 frames (0.27 s) power3.out; colour flips red ↔ white at 4 Hz (0.125 s steps) × 3; the headline enters 6 frames after the wipe: x 140 px → 0, skewX 17° → 0, opacity 0 → 1, 0.2 s expo.out; then static.

### lower/stack-bars: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`tx-racing-credits`](https://motion-reference.takayustudio.jp/#motion=tx-racing-credits) **Bass-style Racing Credits** (Titles & Film; text; 270 ms; linear; partial, medium). Closest: `lower/stack-bars`, `house/super-slide`. Proposal: lower/stack-bars + params skew, linear ease, bar leads text.
  Spec: On an oblique grid (skewY −11°): a bar races across the frame (100 vw → −100 vw, 0.4 s linear), the role text slides in behind it (100 vw → 0, 0.27 s linear, 0.1 s after); 0.1 s later a second bar crosses the other way with the name from −100 vw; exits in opposite directions at the same speed.

### map/pin-route: EXTEND · medium · block · ae png · 1 motion(s)

- [`catalog-data-story-signal-pulse-map`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-signal-pulse-map) **Live Signal Pulse Map** (Data Storytelling; canvas; 4200 ms; linear; partial, medium). Closest: `map/pin-route`, `map/us-bubble`. Proposal: map/pin-route + param pulse (repeating rings at places).
  Spec: Fixed map; 5 points fire at 400 / 800 / 1200 / 1600 / 2000 ms. Each: dot pops (scale 0 -> 1, 300 ms back.out), two rings radius 4 -> 30 px over 900 ms easeOutCubic, the second 220 ms later, opacity 0.9 -> 0. Optional time rail below with a dot per fire lighting as passed. Fade out 3600-3900.

### motion/echo-trail: EXTEND · medium · block · ae expression · 1 motion(s)

- [`cursor-follow`](https://motion-reference.takayustudio.jp/#motion=cursor-follow) **Cursor Follow** (Web Interaction; canvas; 850 ms; easeOutCubic; partial, medium). Closest: `motion/echo-trail`. Proposal: motion/echo-trail + mode follow (dots chase a cursor path, each with its own lerp).
  Spec: 4 dots follow a cursor; every 60 fps frame dot k moves toward the cursor by 0.32 / 0.22 / 0.14 / 0.09 of the gap (compute by iterating about 150 frames back so it stays a function of time). Radii 10 / 8 / 6.4 / 5 px, opacity 1 / .78 / .58 / .42. Cursor visits (70,62) (252,70) (216,146) (90,138), each move 0.5 s inOut every 0.75 s, 3 s loop. Real cursor drawn on top.

### motion/heartbeat: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-ui-button-heartbeat`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-heartbeat) **Heartbeat** (UI Buttons; canvas; 2800 ms; linear; partial, medium). Closest: `house/breathe`, `effect/beat-accent`. Proposal: motion/heartbeat (new): lub-dub scale loop.
  Spec: Loop 1.4 s: at 0.15 s scale 1 to 1.20 in 80 ms (power1.out) and back to 1 in 220 ms (power2.inOut); at 0.45 s 1 to 1.10 in 80 ms and back in 220 ms; rest until 1.4 s (about 650 ms). For a heart, an icon or a CTA.

### motion/physics-pile: NEW · medium · effect · ae expression · 1 motion(s)
Origins named by the site: react-bits (1).

- [`tx-falling-pile`](https://motion-reference.takayustudio.jp/#motion=tx-falling-pile) **Falling Text Physics** (Glyph Physics; text; 600 ms; gravity (½gt²); missing, medium · origin react-bits). Closest: `card/stack-shuffle`. Proposal: motion/physics-pile (new).
  Spec: Words (pills, padding 0.1 em 0.4 em) released one by one 0.2 s apart above a floor-bounded box: gravity 1 (≈ 1 px/frame² at 60 fps), restitution 0.4, air friction 0.01, rotation free; words collide and pile, the word below dips on impact. Must be a seeded 2D rigid-body sim run at build time and baked per frame (no live physics).

### motion/slice-reveal: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`slice-reveal`](https://motion-reference.takayustudio.jp/#motion=slice-reveal) **Slice Reveal** (Effects & Transitions; canvas; 840 ms; easeInOutCubic; partial, medium). Closest: `house/super-slide`, `text/line-by-line-slide`. Proposal: motion/slice-reveal (new): one element cut into N horizontal strips.
  Spec: Element cut into 4 equal horizontal strips (clipped copies). Strips 1 and 3 start at x -42 px, strips 2 and 4 at x +42 px, each opacity 0 -> 1; strip i starts at i x 36 ms and all land together at 840 ms (each lasts 840 - 36i ms), easeInOutCubic. Exit: whole element fades 200 ms ease-in.

### motion/slot-swipe: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`3d-coverflow`](https://motion-reference.takayustudio.jp/#motion=3d-coverflow) **Cover Flow** (3D; dom; 500 ms; spring; partial, medium). Closest: `motion/slot-swipe`, `flow/screen-flow-carousel`, `carousel/vision-1`. Proposal: motion/slot-swipe + params rotateY / z per slot (cover flow).
  Spec: Cards (68 x 92) in a row; the selected one flat at centre; others rotateY +-60 deg (facing the centre), z -80 to -120 px, x = 70 px x offset + 20 px gap per side, opacity 1 - min(0.6, 0.3 x /offset/). Selection moves on a spring (stiffness 200, damping 22-24, ~500 ms) through 0 -> 1 -> 2 -> 1 -> 0 at 0.8 / 1.8 / 2.8 / 3.6 s.

### motion/tween: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`t-twos`](https://motion-reference.takayustudio.jp/#motion=t-twos) **On Ones / Twos / Threes** (Timing & Rhythm; dom; 1000 ms; steps (12fps); partial, medium). Closest: `hand/boil`, `motion/stop-motion`. Proposal: motion/tween + param fps.
  Spec: Keep the motion's own ease but hold each value for a fixed number of render frames: ones = every frame, twos = 12 drawings/s (hold 5 frames at 60 fps), threes = 8/s (alternate 7 and 8 frames). Characters on twos, fast action on ones, camera moves always on ones. Param fps (or a film-level cadence) snaps the progress to that grid.

### shape/pop: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`particle-burst`](https://motion-reference.takayustudio.jp/#motion=particle-burst) **Particle Burst** (Effects & Transitions; dom; 820 ms; easeOutQuart; partial, medium). Closest: `shape/pop`, `house/burst-pop`, `text/caption-particle-burst`. Proposal: shape/pop + param burst (n dots flying out).
  Spec: Core: scale 0.72 -> 1.12 -> 1.0 (peak at about 40 %) over 820 ms. 8 dots (~4 px, 45 deg apart) start at the core centre just after it reacts: radius 0 -> 54 px, opacity 1 -> 0, size shrinking to ~1 px, 820 ms easeOutQuart (power4.out). Dots sit behind the core, film accent colours; seeded.

### shape/repeater: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`sh-repeater`](https://motion-reference.takayustudio.jp/#motion=sh-repeater) **Radial Repeater** (SVG & Path; dom; 1500 ms; easeInOutSine; missing, medium). Closest: none. Proposal: shape/repeater (new).
  Spec: 12 copies of one shape (a 34 x 10 px pill) around a centre, copy i rotated i x 30 deg, the ring turning slowly (~23 deg/s). Each copy moves out from the centre 18 -> 38 px and back (sine ping-pong, 1.5 s period), copy i delayed i x 80 ms (recipe 60 ms), easeInOutSine; every third copy accent.

### social/comment-stream: NEW · medium · block · ae keyframes · 1 motion(s)

- [`tx-danmaku-comments`](https://motion-reference.takayustudio.jp/#motion=tx-danmaku-comments) **Danmaku Comment Scroll** (Japanese; text; 3500 ms; linear; missing, medium). Closest: `social/yt-comment-card`. Proposal: social/comment-stream (new).
  Spec: Comments cross right → left in a fixed 3.5 s (3–4 s) each whatever their length (x from frame width to −own width, linear), in lanes 1.6 em apart; a lane takes a new comment only after the previous one's tail has fully entered (+0.3 s); white bold text with a 3 px dark outline under the fill; seeded schedule.

### text/anime-roll: EXTEND · medium · effect · ae keyframes · 1 motion(s)
Origins named by the site: magicui (1).

- [`tx-roll-flip-hover`](https://motion-reference.takayustudio.jp/#motion=tx-roll-flip-hover) **3D Roll Flip** (3D & Depth; text; 400 ms; ease-in-out; partial, medium · origin magicui). Closest: `text/anime-roll`. Proposal: text/anime-roll + param mode: cube (3D face swap).
  Spec: Each char is a small cube: front face at translateZ(0.5 em), bottom face rotateX(−90°) translateZ(0.5 em) in another colour / typeface (e.g. accent serif); the cube turns rotateX 0 → 90° in 0.4 s ease-in-out, delay 30 ms × i, preserve-3d.

### text/blinds: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`tx-blinds-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-blinds-reveal) **Venetian Blinds Reveal** (Mask & Clip; text; 600 ms; power2.out; missing, medium). Closest: none. Proposal: text/blinds (new).
  Spec: Text box cut into 10 equal horizontal strips (copies clipped with inset); strip i opens from its top edge (clip bottom 100 % -> 0) in 0.6 s power2.out from 0.3+0.05*i s; seams vanish when open. Close: each strip folds to its bottom edge, 0.5 s power2.in, same 50 ms stagger.

### text/caption-emoji-pop: EXTEND · medium · block · ae keyframes · 1 motion(s)
Origins named by the site: other:remotion (1).

- [`tx-hormozi-caption`](https://motion-reference.takayustudio.jp/#motion=tx-hormozi-caption) **Hormozi-Style Pop Captions** (Captions & Subtitles; text; 150 ms; easeOutBack; partial, medium · origin other:remotion). Closest: `text/caption-emoji-pop`, `text/caption-neon-accent`. Proposal: text/caption-emoji-pop + params keyTilt (−4°), keyScale.
  Spec: Weight 900 uppercase, black stroke ~0.14 em painted under the fill; 1–3 words per page (tokens within 300–600 ms combined); each page pops scale 0.8 → 1.1 → 1.0 at 0 / 100 / 150 ms; the key word yellow (#f2c84b), a little larger, rotated −3° to −5°.

### text/caption-gradient-fill: EXTEND · medium · block · ae keyframes · 1 motion(s)
Origins named by the site: other:remotion (1).

- [`tx-karaoke-fill`](https://motion-reference.takayustudio.jp/#motion=tx-karaoke-fill) **Karaoke Fill** (Captions & Subtitles; text; 4800 ms; linear; partial, medium · origin other:remotion). Closest: `text/caption-gradient-fill`, `text/mk-word-sweep`. Proposal: text/caption-gradient-fill + param keep (sung words stay filled).
  Spec: Each word's fill wipes left → right linearly (clamped) over exactly its sung duration, token start to end (held notes fill slowly, short ones snap), and stays filled; solid accent over white via a 2-stop gradient with background-clip text, or a clipped coloured copy.

### text/caption-highlight: EXTEND · medium · block · ae keyframes · 1 motion(s)
Origins named by the site: other:remotion (1).

- [`tx-highlight-pill`](https://motion-reference.takayustudio.jp/#motion=tx-highlight-pill) **Moving Highlight Pill** (Captions & Subtitles; text; 100 ms; easeOutCubic; partial, medium · origin other:remotion). Closest: `text/caption-highlight`. Proposal: text/caption-highlight + param glide (pill moves word to word).
  Spec: One pill behind the line glides to the spoken word: x and width interpolate to the word's box (+8 px each side) in 80–120 ms power2.out; it never disappears inside a page; the text under it inverts (dark on accent).

### text/caret-swap: EXTEND · medium · effect · ae expression · 1 motion(s)

- [`tx-diff-retype`](https://motion-reference.takayustudio.jp/#motion=tx-diff-retype) **Diff Text Replace** (Swap; text; 2000 ms; none (linear); partial, medium). Closest: `text/caret-swap`, `text/typewriter`. Proposal: text/caret-swap + param diff (keep the shared head and tail, retype only the changed span).
  Spec: Old and new strings: common prefix / suffix stay still; the differing middle of the old string is deleted right-to-left one char per step, then the new middle typed left-to-right; ~2 s total scaled by changed chars (linear, ~60-80 ms / char); changed chars keep the accent colour with a 0.06 em underline.

### text/char-slam: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-kinetic-type-character-magnetize`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-character-magnetize) **Character Magnetize** (Glyph Physics; canvas; 4200 ms; linear; partial, medium). Closest: `text/char-slam`. Proposal: text/char-slam + params ease: spring(220,20), order: left (70 ms), shake: off.
  Spec: 5 letters start scattered (offsets about ±1.5 em x, ±1.75 em y) and tilted −0.8/0.9/−0.5/0.7/−0.9 rad; each springs to its slot (k 220, c 20, m 1, ζ≈0.67, ~0.6 s) from 0.5 s, stagger 70 ms left→right; while unsettled a small sine float of 4 px × (1 − progress). Return to the scatter 3.3–4.0 s inOut; loop 4.2 s.

### text/cylinder: NEW · medium · effect · ae keyframes · 1 motion(s)
Origins named by the site: other:troika-three-text (1).

- [`tx-cylinder-text`](https://motion-reference.takayustudio.jp/#motion=tx-cylinder-text) **3D Cylinder Text** (3D & Depth; text; 6000 ms; linear; missing, medium · origin other:troika-three-text). Closest: `carousel/circle-1`. Proposal: text/cylinder (new).
  Spec: Chars around a vertical cylinder: rotateY(i × 360° / n) translateZ(r ≈ 120 px at a 320 px demo), perspective 1000 px, back faces visible; the cylinder turns rotateY 0 → −360° per 6 s linear loop; back letters read mirrored and dimmed (opacity by how far they face away), front letters bright.

### text/echo-fan: NEW · medium · effect · ae keyframes · 1 motion(s)
Origins named by the site: codrops (1).

- [`tx-repetition-echo`](https://motion-reference.takayustudio.jp/#motion=tx-repetition-echo) **Text Repetition Echo** (Scroll; text; 1000 ms; power2.inOut (scrub); missing, medium · origin codrops). Closest: `transition/clone-wall`. Proposal: text/echo-fan (new).
  Spec: 6 outline copies (1 px stroke, no fill) behind the solid word, pivot 50 % 400 % (far below): copy i rotates ±7° × ceil((i + 1) / 2) on alternating sides with opacity 1 − ceil((i + 1) / 2) / 4, power2.inOut ~1 s; then all fold back to 0° and opacity 0 (power2.inOut). The original never moves.

### text/extrude: NEW · medium · effect · ae keyframes · 1 motion(s)
Origins named by the site: react-bits (1).

- [`tx-layered-depth`](https://motion-reference.takayustudio.jp/#motion=tx-layered-depth) **Layered Depth Text** (3D & Depth; text; 600 ms; spring; partial, medium · origin react-bits). Closest: `logo/extruded-logo`. Proposal: text/extrude (new).
  Spec: 8–16 stacked copies of the headline, copy i at translateZ(−i px), colour accent darkened 6 % per layer (front copy plain); the stack tilts rotateX / rotateY within ±15° following a keyed path through a spring (settles a beat after the path stops), preserve-3d.

### text/falloff-sweep: NEW · medium · effect · ae expression · 1 motion(s)

- [`tx-motext-falloff`](https://motion-reference.takayustudio.jp/#motion=tx-motext-falloff) **MoText Falloff Sweep** (3D & Depth; text; 1700 ms; linear + spring; partial, medium). Closest: `text/weight-wave`. Proposal: text/falloff-sweep (new).
  Spec: An invisible band sweeps across the line in 1.7 s linear (linear falloff, ~120 px half-width: w = max(0, 1 − d/120)); each char targets y −14 px × w, scale 1 + 0.16 × w, rotation 20° × w and follows with elastic.out(1, 0.5) over 0.5 s (lag, spring back); optional extrusion as 6 stepped hard text-shadows.

### text/flipbook-word-cycle: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`tx-eva-mincho-card`](https://motion-reference.takayustudio.jp/#motion=tx-eva-mincho-card) **Extra-Bold Mincho Card** (Japanese; text; 333 ms; none (cut); partial, medium). Closest: `text/flipbook-word-cycle`, `text/kinetic-cascade`. Proposal: text/flipbook-word-cycle + param cards (multi-line layouts, condensed).
  Spec: Sequence of black cards with white extra-bold serif, compressed scaleX 0.6–0.8, big / small mix or an L-shaped layout; hard cuts every 4–12 frames, no easing or fades; only the last card holds long enough to read.

### text/focus-frame: NEW · medium · effect · ae keyframes · 1 motion(s)
Origins named by the site: react-bits (1).

- [`tx-true-focus`](https://motion-reference.takayustudio.jp/#motion=tx-true-focus) **True Focus** (Blur & Focus; text; 500 ms; ease; partial, medium · origin react-bits). Closest: `camera/focus-rack`, `text/mk-word-sweep`. Proposal: text/focus-frame (new): corner-bracket frame travels word to word, the rest blurred.
  Spec: Words blurred 5 px at 60 % opacity, the active word sharp 100 %. A frame of four 9 px corner brackets (2.5 px accent, padding 7 px) moves and resizes from the previous word box to the next in 0.5 s power2.inOut while the two words cross blur / opacity over the same 0.5 s; hold 1 s per word.

### text/inline-highlight: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-kinetic-type-headline-ribbon`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-headline-ribbon) **Headline Ribbon Wrap** (Titles & Film; canvas; 4200 ms; linear; partial, medium). Closest: `text/inline-highlight`, `house/tag-pop`. Proposal: text/inline-highlight + param ribbon (folded tails).
  Spec: Band 200 × 36 px scaleX 0 → 1 from the centre in 0.6 s expo.out; text rises 22 px and fades in inside the band (clipped) 0.4 s power3.out from +0.35 s; then both tails unfold behind the band ends 0.45 s back.out: tail 44 px long, 9 px lower, V-notch 12 px, 60 % shade, fold triangle 14 px at 35 %. Exit reversed: tails 0.25 s, text 0.2 s, band 0.35 s expo.in.

### text/letter-morph: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`tx-anagram-flip`](https://motion-reference.takayustudio.jp/#motion=tx-anagram-flip) **Anagram FLIP** (Layout & Reflow; text; 600 ms; cubic-bezier(.2,.8,.2,1); partial, medium). Closest: `motion/anime-layout`, `code/code-morph`. Proposal: text/letter-morph (new).
  Spec: Split both words into letters and map identical letters left to right; each travels to its new slot in 0.6 s cubic-bezier(.2,.8,.2,1), stagger 0.02 s, on an arc: rightward movers pass above (≈ −0.4 em), leftward ones below (+0.4 em); unmatched letters fade out / in.

### text/noise-dissolve: NEW · medium · effect · ae png · 1 motion(s)

- [`tx-noise-dissolve-out`](https://motion-reference.takayustudio.jp/#motion=tx-noise-dissolve-out) **Noise Dissolve** (Exit; text; 1200 ms; linear; missing, medium). Closest: none. Proposal: text/noise-dissolve (new).
  Spec: SVG feTurbulence (fractalNoise, baseFrequency 0.8, fixed seed) used as an alpha threshold mask on the text; threshold slides 1 -> -1 over 1.2 s linear so holes open where noise < threshold until the text is gone; 1-2 px accent rim (embers) on hole edges (feMorphology + feComposite).

### text/paper-fold: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`tx-paper-fold`](https://motion-reference.takayustudio.jp/#motion=tx-paper-fold) **Paper Fold** (3D & Depth; text; 700 ms; power2.out; missing, medium). Closest: none. Proposal: text/paper-fold (new).
  Spec: Strip split into 4 horizontal panels (each shows its quarter of the content), each hinged on its top edge to the panel above: rotateX +90° / −90° alternating → 0, perspective 800 px, 0.7 s power2.out, stagger 0.12 s; a dark shade per panel 0.6 → 0 opacity on the same timing (shade follows the angle).

### text/telop: NEW · medium · effect · ae keyframes · 1 motion(s)
Origins named by the site: other:booth.pm (1).

- [`tx-telop-pop-outline`](https://motion-reference.takayustudio.jp/#motion=tx-telop-pop-outline) **Pop-In Double-Outline Telop** (Broadcast & Telop; text; 200 ms; easeOutBack; partial, medium · origin other:booth.pm). Closest: `text/caption-emoji-pop`, `text/land-in`. Proposal: text/telop (new): double-outline style + pop.
  Spec: Heavy gothic text, yellow fill, white inner stroke 8–15 % of the size, coloured outer stroke and a 3 px hard shadow; scale 0 → 1.1 in 4 frames power2.out, → 1.0 in 2 frames (0.2 s at 30 fps); SFX on frame 0.

### text/text-shimmer: EXTEND · medium · effect · ae png · 1 motion(s)
Origins named by the site: magicui (1).

- [`tx-color-band-sweep`](https://motion-reference.takayustudio.jp/#motion=tx-color-band-sweep) **Colour Band Sweep** (Colour & Light; text; 1500 ms; ease-in-out; partial, medium · origin magicui). Closest: `text/text-shimmer`, `text/text-stagger`. Proposal: text/text-shimmer + param leave (band leaves the final colour behind: grey -> light -> final).
  Spec: Text starts grey (~45 % ink); a band 10-20 % of the string width moves left -> right over 1.5 s power2.inOut: leading edge a light tint (final colour + 60 % white), behind it the final colour stays. AE: Fill Color animator, range offset -100 -> 100 %.

### text/texture-mask: EXTEND · medium · effect · ae png · 1 motion(s)
Origins named by the site: magicui (1).

- [`tx-texture-fill`](https://motion-reference.takayustudio.jp/#motion=tx-texture-fill) **Texture / Video Fill** (Mask & Clip; text; 20000 ms; linear; partial, medium · origin magicui). Closest: `text/svg-mask-reveal`, `text/caption-texture`, `text/texture-mask`. Proposal: text/texture-mask + params fill (image / video inside the letters) and drift.
  Spec: Heavy text (10-20 vw) as a mask over an image / video / pattern (background-clip text or mask), fill 200 % of the box; background-position 0 % -> 100 % over 20 s linear (a 5 s shot moves 25 %); video frame-locked to the film; letters still.

### text/top-down-letters: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`tx-raining-characters`](https://motion-reference.takayustudio.jp/#motion=tx-raining-characters) **Raining Characters** (Glyph Physics; text; 500 ms; easeOutCubic; partial, medium). Closest: `text/top-down-letters`. Proposal: text/top-down-letters + params order: random (seeded), echoes (3 × 33 ms).
  Spec: Chars fall y −150 px → 0 with opacity 0 → 1, 0.5 s power3.out, stagger 0.06 s in seeded random order; while falling 3 echo copies trail 33 / 66 / 99 ms behind at opacity 0.5 / 0.35 / 0.2 and vanish on landing; exit rains out downward the same way. Keep ≥ 0.8 s fully settled.

### title/perspective-marquee: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`scroll-marquee`](https://motion-reference.takayustudio.jp/#motion=scroll-marquee) **Scroll Marquee** (Web Scroll; canvas; 1250 ms; linear; partial, medium). Closest: `title/perspective-marquee`, `lower/news-ticker`. Proposal: title/perspective-marquee + tilt none (0 deg) and a big-type band style (words with star separators).
  Spec: Full-width accent band 44 px tall; repeating 'MOTION * SCROLL *' in 800-weight 26 px type (gap 16 px, star 8 px), paper colour. Two copies side by side move left by one unit width (sum of word widths + gaps) every 2.5 s, linear, seamless wrap. Thin grid lines above and below the band.

### title/wordmark-tiles: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`mosaic-flip`](https://motion-reference.takayustudio.jp/#motion=mosaic-flip) **Mosaic Flip** (Effects & Transitions; canvas; 1150 ms; easeInOutCubic; partial, medium). Closest: `title/wordmark-tiles`, `background/pixel-worlds`. Proposal: title/wordmark-tiles + params faceA / faceB pictures.
  Spec: 4 x 4 tiles, each with face A (part of the current picture) and face B (part of the next). Tile (row r, col c) starts at (r + c) x 114 ms, rotateY 0 -> 180 deg over 450 ms easeInOutCubic about its centre; swap faces at 90 deg (never show a back face), lift scale 1 + 0.08 x sin(angle). Diagonal wave top-left to bottom-right, ~1.15 s. Return wave reversed, 40 ms apart.

### transition/brush-wipe: NEW · medium · effect · ae png · 1 motion(s)

- [`tr-brush`](https://motion-reference.takayustudio.jp/#motion=tr-brush) **Brush Wipe** (Transitions; dom; 600 ms; easeOutCubic; partial, medium). Closest: `hand/scribble-transition`, `hand/pencil-draw`. Proposal: transition/brush-wipe (new).
  Spec: 5 thick brush bands (each ~1/5 of frame height plus overlap, slightly slanted), stroke i starts at i x 60 ms and its leading edge runs left -> right off-frame over 360 ms easeOutCubic; together they form the reveal mask of the incoming scene; 600 ms total; ragged dry-brush ends.

### transition/curtain-reveal: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`split-reveal`](https://motion-reference.takayustudio.jp/#motion=split-reveal) **Split Reveal** (Entrance & Exit; canvas; 720 ms; easeInOutCubic; partial, medium). Closest: `transition/curtain-reveal`. Proposal: transition/curtain-reveal + param look:"flat".
  Spec: Two flat panels, each half the frame wide, meet at the centre over still content and slide apart: left x 0 → −105 % of its width, right 0 → +105 %, 720 ms power2.inOut, symmetric. A 1 px edge line and a small grip bar ride each inner edge. Closing: the same move reversed in 450 ms. (Demo frame 180×120 px, radius 10 px.)

### transition/gravity-drop: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`tr-drop`](https://motion-reference.takayustudio.jp/#motion=tr-drop) **Gravity Drop** (Transitions; dom; 700 ms; easeInQuad; partial, medium). Closest: `motion/physical-exit`, `transition/showcase-other`. Proposal: transition/gravity-drop (new).
  Spec: Outgoing scene stays on top and falls: y 0 -> +120 % of frame height, rotation 0 -> 10 deg, 700 ms easeInQuad; the incoming scene sits still underneath from the start. HF showcase-other ships a Gravity Drop.

### transition/pixel-dissolve: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`tr-pixel`](https://motion-reference.takayustudio.jp/#motion=tr-pixel) **Pixel Dissolve** (Transitions; dom; 600 ms; linear (per-cell threshold); partial, medium). Closest: `transition/grid-pixelate`, `effect/dither-pass`. Proposal: transition/pixel-dissolve (new).
  Spec: Frame divided into square cells (16 px on a 320 px frame = 5 % of width); each cell gets a fixed seeded threshold 0..1; progress 0 -> 1 linear over 600 ms; a cell switches from old to new scene on the frame progress passes its threshold (hard per-cell cut, no fade).

### ui/cursor-path: NEW · medium · effect · ae keyframes · 1 motion(s)

- [`ui-cursorarc`](https://motion-reference.takayustudio.jp/#motion=ui-cursorarc) **Human Cursor Path** (Web Interaction; dom; 900 ms; easeInOutCubic; partial, medium). Closest: `motion/drag-release`, `cursor/oversized`. Proposal: ui/cursor-path (new): a film cursor moving on slight arcs with pauses and clicks.
  Spec: Cursor moves between targets in 900 ms power2.inOut (easeInOutCubic) along a slight arc: perpendicular offset = sin(pi q) x 0.06 x segment length (the canvas demos use 0.1); pauses 100 ms on the target, then clicks (cursor scale 0.9 for about 80 ms, optional tick sound). Keys [[t, x, y, click]].

### ui/dynamic-island: NEW · medium · block · ae keyframes · 1 motion(s)

- [`ui-island`](https://motion-reference.takayustudio.jp/#motion=ui-island) **Dynamic Island** (Feedback & Reactions; dom; 500 ms; spring; partial, medium). Closest: `motion/spring-track`, `flow/modal-morph`. Proposal: ui/dynamic-island (new) block.
  Spec: Black pill at the top of a phone frame. Expand: width, height and radius on springs (about 500 ms), radius kept at half the height; content fades in after it has grown; hold 1-2 s; shrink back on springs (about 400 ms) with the content cleared first. Sizes from the device frame (the source gives timings only).

### ui/sheet-spring-up: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`bottom-sheet-drag`](https://motion-reference.takayustudio.jp/#motion=bottom-sheet-drag) **Bottom Sheet Drag** (Gesture & Mobile; canvas; 760 ms; easeOutCubic; partial, medium). Closest: `ui/sheet-spring-up`, `cursor/touch`. Proposal: ui/sheet-spring-up + params detents (25 / 60 / 100 %) with a finger drag before each snap.
  Spec: Phone 112x184 with a sheet at the 25 % detent. 0.4-1.0 s a finger drags the sheet up 44 px (power1.in); on release it snaps to the 60 % detent in 0.76 s power2.out. 2.3-2.7 s the finger drags it down 28 px; release snaps back to 25 % in 0.76 s. Backdrop opacity = 0.6 x clamp((openness - 0.25) / 0.75). Detent ticks at the side.

### ui/toggle-switch: EXTEND · medium · effect · ae keyframes · 1 motion(s)

- [`catalog-ui-material-soft-body-toggle`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-soft-body-toggle) **Soft Body Toggle** (Material & Surface Motion; canvas; 4200 ms; linear; partial, medium). Closest: `flow/toggle-flip`, `ui/toggle-switch`. Proposal: ui/toggle-switch + param squash (press, travel stretch, landing squash).
  Spec: Knob r17, track 104x48. Press (0-150 ms): scaleX 1.12, scaleY 0.85 (power2.out). Travel 52 px over 330 ms power2.inOut with a stretch scaleX +0.4 x sin(pi x progress). Arrival: squash scaleX 0.78 against the far edge, then back to 1 on a spring k420 d11; scaleY = 1 / scaleX; the track colour follows progress. Reverse at 2.4 s.

### ui/typing-indicator: EXTEND · medium · block · ae keyframes · 1 motion(s)

- [`catalog-ui-loading-bouncing-dots`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-bouncing-dots) **Bouncing Dots** (Loading & Progress; canvas; 2800 ms; linear; partial, medium). Closest: `ui/typing-indicator`. Proposal: ui/typing-indicator + style bounce (hop with landing squash).
  Spec: Three dots r9, 36 px apart; cycle 700 ms, each dot 120 ms later. First half of the cycle: parabolic hop, apex 34 px, slight stretch (up to +14 %); landing: squash scaleY -28 % over 12 % of the cycle (scaleX inverse); a ground shadow shrinks with height. Loops.

### text/variable-axis: EXTEND · low · effect · ae png · 5 motion(s)

- [`catalog-kinetic-type-variable-font-pulse`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-variable-font-pulse) **Variable Font Pulse** (Variable Fonts; canvas; 4200 ms; linear; partial, low). Closest: `text/variable-axis`. Proposal: text/variable-axis + params yoyo/hold, ease, keepWidth (letter-spacing compensation).
  Spec: One word, wght 200 -> 900 over 1.2 s (0.3-1.5 s, ease-in-out), hold 0.8 s, back 900 -> 200 over 1.2 s (2.3-3.5 s), hold to 4.2 s. Letter-spacing moves the other way, 8 px -> 1 px at 40 px type (0.2 em -> 0.025 em), so the word width stays constant.
- [`tx-width-stretch`](https://motion-reference.takayustudio.jp/#motion=tx-width-stretch) **Variable Width Stretch** (Variable Fonts; text; 600 ms; ease-in-out; partial, low). Closest: `text/variable-axis`, `text/variable-flex`. Proposal: text/variable-axis + params split chars, stagger, yoyo / repeat (or beat cues).
  Spec: Split chars (RFlex); each char wdth 75 <-> 125, 0.6 s sine.inOut, yoyo repeat (or one swing per beat cue), char i delayed 40 ms; height unchanged, the line width breathes.
- [`tx-weight-breathe`](https://motion-reference.takayustudio.jp/#motion=tx-weight-breathe) **Weight Breathe** (Variable Fonts; text; 3000 ms; ease-in-out; partial, low). Closest: `text/variable-axis`. Proposal: text/variable-axis + params yoyo / repeat, ease.
  Spec: Whole word wght 100 -> 900 over 3 s sine.inOut, then 900 -> 100 over 3 s, repeat (yoyo); positions fixed.
- [`tx-slant-swing`](https://motion-reference.takayustudio.jp/#motion=tx-slant-swing) **Slant Axis Swing** (Variable Fonts; text; 2000 ms; ease-in-out; partial, low). Closest: `text/variable-axis`, `text/weight-wave`. Proposal: text/variable-axis + params axis slnt, split chars, stagger, yoyo.
  Spec: Split chars; slnt 0 -> -10 -> 0 (RFlex range -10..0), 2 s per swing sine.inOut, loop, char i delayed 80 ms; pivot on the baseline.
- [`tx-width-slant-scroll`](https://motion-reference.takayustudio.jp/#motion=tx-width-slant-scroll) **Width/Slant Velocity** (Variable Fonts; text; 800 ms; spring; partial, low). Closest: `text/variable-axis`, `motion/spring-track`. Proposal: text/variable-axis + param follow (axis value from a speed track on ctx.track springs).
  Spec: v = smoothed speed of a scroll / pan move (spring ~k170 d26 through ctx.track); wdth = 100 + 25v (to 125), slnt = -12v (RFlex clamps at -10); when the move stops v springs back to 0 with a small overshoot.

### text/cursor-field: NEW · low · effect · ae expression · 4 motion(s)
Origins named by the site: react-bits (1), other:motion (1).

- [`tx-magnetic-letters`](https://motion-reference.takayustudio.jp/#motion=tx-magnetic-letters) **Magnetic Letters** (Pointer; text; 400 ms; power3.out; missing, low). Closest: `cursor/magnetic`. Proposal: text/cursor-field (new), mode magnet.
  Spec: Driven by a keyed cursor path: each char within R 120 px moves toward the cursor by (cursor − char) × 0.4 × (1 − d / R), smoothed like a 0.4 s power3 follow; chars outside R return to rest.
- [`tx-proximity-repel`](https://motion-reference.takayustudio.jp/#motion=tx-proximity-repel) **Pointer Proximity Repel** (Pointer; text; 300 ms; lerp 0.15 (exponential); missing, low). Closest: none. Proposal: text/cursor-field (new), mode repel.
  Spec: Keyed cursor path: each char targets a push away from the cursor of 30 px × (1 − d / 120) inside R 120 px; each frame it closes 15 % of the gap (lerp 0.15 at 60 fps) on escape and on return.
- [`tx-proximity-scramble`](https://motion-reference.takayustudio.jp/#motion=tx-proximity-scramble) **Proximity Scramble** (Pointer; text; 1200 ms; none (linear); partial, low · origin react-bits). Closest: `text/anime-scramble`, `text/scramble-reveal`. Proposal: text/cursor-field (new), mode scramble.
  Spec: Keyed cursor path: chars within R 100 px scramble through '.' and ':' (speed 0.5) and restore after 1.2 s × (1 − d / R); each char cell fixed at ≥ 1 ch, centred, so the line never jitters.
- [`tx-hover-word-lift`](https://motion-reference.takayustudio.jp/#motion=tx-hover-word-lift) **Hover Word Lift** (Pointer; text; 250 ms; spring(400, 26); missing, low · origin other:motion). Closest: `ui/avatar-group-hover`. Proposal: text/cursor-field (new), mode lift.
  Spec: Keyed cursor path over a sentence: the word under the cursor rises y 0 → −6 px on a stiff spring (stiffness 400, damping 26: a hair of overshoot, ~0.25 s) and turns accent; it settles back when the cursor leaves.

### data/conic-progress-ring: EXTEND · low · block · ae expression · 2 motion(s)

- [`catalog-game-hud-cooldown-ability`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-cooldown-ability) **Cooldown Ability** (Game HUD; canvas; 3600 ms; linear; partial, low). Closest: `data/conic-progress-ring`. Proposal: data/conic-progress-ring + params countdown, shade, readyPop.
  Spec: Ring r 41 px, stroke 4 (@320x200): accent arc sweeps clockwise from 12 o'clock linearly over 2.0 s (0.45-2.45 s); icon dimmed by a pie shade (62 % white) over the remaining part; centre number counts down 2.0 -> 0.0 (one decimal). Press scale 0.92 at 0.3-0.5 s. Ready: icon fills accent, scale 0.8 -> 1 spring k380 d14, ring flash r 41 -> 61 fading 500 ms outCubic.
- [`catalog-game-hud-buff-timer`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-buff-timer) **Buff Timer** (Game HUD; canvas; 3600 ms; linear; partial, low). Closest: `data/conic-progress-ring`. Proposal: data/conic-progress-ring + params countdown, blink, exit.
  Spec: Icon pops at 0.3 s (300 ms back.out). Ring arc r 34, stroke 3 (@320x200) depletes linearly over 2.2 s (0.6-2.8 s); readout '2.2s' -> 0, red under 28 %. Last 600 ms the icon blinks: opacity 0.55 +- 0.45 cosine, 200 ms period. At 0 the icon shrinks out in 180 ms in-cubic, an 'ended' label fades in and the '+20%' stat is struck through by a line drawn in 200 ms.

### effect/reveal-rays: NEW · low · effect · ae keyframes · 2 motion(s)

- [`catalog-game-reward-chest-open`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-chest-open) **Chest Open** (Rewards & Loot; canvas; 2800 ms; linear; missing, low). Closest: none. Proposal: effect/reveal-rays (new).
  Spec: Box shakes +-1.8 px (sine 70 rad/s, enveloped) 0.2-0.5 s; lid opens to 1.95 rad in 350 ms back.out; 5 light wedges fan upward (-132 to -48 deg, half-width 5 deg, 3 layers at 22 %) grow to 96 px (@320x200) in 350 ms outCubic with a glow ellipse; reward rises 58 px from inside by spring k160 d12 from 1.0 s, then bobs +-2 px; 8-dot burst.
- [`catalog-game-reward-gacha-pull`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-gacha-pull) **Gacha Pull** (Rewards & Loot; canvas; 2800 ms; linear; missing, low). Closest: none. Proposal: effect/reveal-rays (new) + split open.
  Spec: Capsule wobbles +-0.14 rad (sine 46 rad/s, ramp 0.2-0.62 s); at 0.7 s halves open +-30 px with -0.22 / +0.14 rad (250 ms back.out), drift 20 px further and fade 1.15-1.45 s; 12 rays rotating 0.4 rad/s grow 40 -> 90 px (@320x200) in 330 ms outCubic; flash disc 8 -> 54 px fading; 'SSR' 0.4 -> 1 back.out 300 ms at 1.05 s; 5 stars pop 70 ms apart.

### effect/vignette: EXTEND · low · block · ae keyframes · 2 motion(s)

- [`lk-vignette`](https://motion-reference.takayustudio.jp/#motion=lk-vignette) **Vignette Breathe** (Texture & Look; dom; 3000 ms; easeInOutSine; partial, low). Closest: `effect/vignette`. Proposal: effect/vignette as an overlay preset + param breathe.
  Spec: Radial gradient overlay, clear in the middle, edges darkening; edge darkness 15 % <-> 25 % on a 3000 ms sine loop (opacity yoyo). House lesson: no grade + vignette over footage by default.
- [`catalog-game-impact-fx-edge-damage`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-edge-damage) **Screen-edge Damage Pulse** (Game Impact FX; canvas; 4200 ms; linear; partial, low). Closest: `effect/vignette`. Proposal: effect/vignette + params color, pulse.
  Spec: Red gradient on the four edges only (depth 44 -> 58 px @320x200, centre clear): opacity rises to 85 % in 80 ms outCubic at the hit, then decays exponentially with tau 550 ms. HP readout shakes 3 px 200 ms; HP bar drops 56 -> 24 with a lag bar following 350-800 ms inOut.

### text/color-cycle: NEW · low · effect · ae expression · 2 motion(s)
Origins named by the site: aceternity (1).

- [`tx-hue-cycle`](https://motion-reference.takayustudio.jp/#motion=tx-hue-cycle) **Per-Character Hue Cycle** (Colour & Light; text; 4000 ms; linear; missing, low). Closest: none. Proposal: text/color-cycle (new) mode hue.
  Spec: Per char fill hue = base + 20 deg x i + 90 deg x t (one turn per 4 s), saturation / lightness fixed (e.g. 80 % / 60 %), linear, endless.
- [`tx-random-color-pop`](https://motion-reference.takayustudio.jp/#motion=tx-random-color-pop) **Colourful Text Cycle** (Colour & Light; text; 500 ms; ease-in-out; missing, low · origin aceternity). Closest: none. Proposal: text/color-cycle (new) mode palette.
  Spec: Palette of 5 colours; each char gets a seeded start colour; every 1.5 s each char switches to another seeded palette colour over 0.5 s (inOut), char i delayed 0.05*i s; during a switch a sine pulse: y -4 px, scale 1.03, opacity -20 %, blur 5 px at the peak.

### background/swarm: NEW · low · block · ae expression · 1 motion(s)

- [`pt-swarm`](https://motion-reference.takayustudio.jp/#motion=pt-swarm) **Swarm** (Particles; dom; 6000 ms; noise; missing, low). Closest: none. Proposal: background/swarm (new).
  Spec: 40 dots (r 2.5) orbiting a centre that drifts +-50 px in x (6 s) and +-20 px in y (3 s); dot i angular speed 0.6-1.4 rad/s (seeded), radius 20 + smooth noise x 50 px, y squashed to 60 %; 1 in 5 accent. Periods divide the loop length.

### card/depth-breadcrumb: NEW · low · block · ae keyframes · 1 motion(s)

- [`catalog-ui-spatial-spatial-breadcrumb`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-spatial-breadcrumb) **Spatial Breadcrumb** (Spatial UI & Depth; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: card/depth-breadcrumb (new).
  Spec: Three level chips 96x36. Level d sits at x -150 d, y -66 d + 40, depth z = 180 d, scale 360 / (360 + z) = 1 / 0.67 / 0.5. The current level moves 0 to 1 to 2 to 0 on a spring k180 d24 (at 0.4, 1.5, 3.3 s); chips in front of the current level fade out; the current chip is accent; dashed lines join the chips.

### cursor/glyph-trail: EXTEND · low · block · ae keyframes · 1 motion(s)
Origins named by the site: react-bits (1).

- [`tx-cursor-text-trail`](https://motion-reference.takayustudio.jp/#motion=tx-cursor-text-trail) **Text Cursor Trail** (Pointer; text; 500 ms; easeOutBack (in) / easeOut (exit); partial, low · origin react-bits). Closest: `cursor/glyph-trail`. Proposal: cursor/glyph-trail + param stamps (words / emoji).
  Spec: Along a keyed cursor path, stamp a word / emoji every 88 px travelled (not per time), each tilted to the travel direction, entering scale 0 → 1 back.out; at most 7 on screen: the oldest exits opacity 0 + scale 0.5 over 0.5 s ease-out; when the path stops, remove one every 30 ms.

### data/calendar-heatmap: NEW · low · block · ae keyframes · 1 motion(s)

- [`catalog-data-story-calendar-density`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-calendar-density) **Calendar Density Sweep** (Data Storytelling; canvas; 4200 ms; linear; partial, low). Closest: `motion/anime-stagger-grid`. Proposal: data/calendar-heatmap (new).
  Spec: 7 x 5 month grid (cells 30 x 21, pitch 33 x 25), day 1 in column 3, weekday header. Week row r reveals from 350 + 420 r ms; cells in a row 15 ms apart, each rises 8 px and fades in over 350 ms easeOutCubic; fill opacity 0.1 + 0.9 x value (weekends x 0.45); the active row label turns accent. 4-swatch legend. Fade 3600-3900.

### data/dot-merge: NEW · low · block · ae keyframes · 1 motion(s)

- [`catalog-data-story-cluster-merge`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-cluster-merge) **Data Cluster Merge** (Data Storytelling; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: data/dot-merge (new).
  Spec: Group A: 9 dots (r 5) in a 3 x 3 grid, 16 px pitch, left; group B: 7 dots in a hex cluster, right. Each dot flies to a sunflower spot around the centre (radius 8 sqrt(j + 0.5) px, angle j x 137.5 deg), 750 ms easeInOut, from 900 ms + 45 ms per dot, path bowed +-14 px (A up, B down). 'A 9' / 'B 7' fade out 700-1000; '9 + 7 = 16' + ring fade in 2000-2300. Dots keep group colours.

### data/number-wheel: EXTEND · low · effect · ae keyframes · 1 motion(s)

- [`catalog-kinetic-type-chapter-index-scrub`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-chapter-index-scrub) **Scrubbed Chapter Index** (Scroll; canvas; 4200 ms; linear; partial, low). Closest: `data/number-wheel`, `text/slot-roll`. Proposal: data/number-wheel + param progress (reel follows a slider thumb).
  Spec: Progress p keyed 0 (0.5 s) → 0.30 (1.1 s) → 0.38 (1.4 s) → 1 (2.3 s), hold, → 0 (3.6 s), sine.inOut; a reel of 01–04 (pitch 60 px in a 96 × 64 window) sits at y = −p × 3 × pitch; a slider thumb rides x = p along a 200 px track with fill; a cursor drags the thumb 0.4–3.7 s.

### data/seven-segment: NEW · low · block · ae keyframes · 1 motion(s)

- [`tx-seven-segment`](https://motion-reference.takayustudio.jp/#motion=tx-seven-segment) **Seven-segment Display** (Numbers & Data; text; 60 ms; linear; missing, low). Closest: none. Proposal: data/seven-segment (new).
  Spec: Each digit = 7 bar segments a-g (hexagonal bars, ~6 deg italic) + optional colon; value -> bitmask (0 abcdef, 1 bc, 2 abdeg, 3 abcdg, 4 bcfg, 5 acdfg, 6 acdefg, 7 abc, 8 all, 9 abcdfg); on change only differing segments fade over 60 ms; unlit at 0.08 opacity, lit 1 with a soft glow; colon blinks 1 Hz.

### data/stream-graph: NEW · low · block · ae png · 1 motion(s)

- [`catalog-data-story-stream-breathe`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-stream-breathe) **Stream Graph Breathing** (Data Storytelling; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: data/stream-graph (new).
  Spec: Two stacked bands sharing a centre line: A above, B below. Each band's thickness along x is a smooth wave of 10-40 px that blends between two shapes (shares swap: A thin/B thick -> A thick/B thin) by a phase: hold 0 to 400 ms, -> 1 at 1800, hold to 2600, back to 0 at 4000, easeInOut. Shared boundary drawn white 1.5 px and never jumps. Readout at 70 % width shows A % / B %.

### effect/displace-wave: NEW · low · effect · ae expression · 1 motion(s)

- [`displacement-wave`](https://motion-reference.takayustudio.jp/#motion=displacement-wave) **Displacement Wave** (Effects & Transitions; canvas; 1000 ms; easeInOutSine; missing, low). Closest: none. Proposal: effect/displace-wave (new).
  Spec: Element cut into 26 horizontal bands (recipe: 10). Band i shifts x by 16 px x sin(0.16 i - 4 pi tau) x sin^2(pi tau), tau 0 -> 1 linear over 2200 ms (recipe 1000 ms): the crest travels across the bands twice and the envelope is zero at both ends, so the outline is clean at start and end. Areas outside the band zone stay still.

### effect/ferro-badge: NEW · low · block · ae png · 1 motion(s)

- [`catalog-ui-material-magnetic-fluid`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-magnetic-fluid) **Magnetic Fluid Badge** (Material & Surface Motion; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: effect/ferro-badge (new).
  Spec: Badge r24 with 18 spikes. A U-magnet moves x 300 to 226 (0.3-1.1 s ease-in-out), back at 2.7-3.4 s. Spike length = (2 + 34 x max(0, cos theta)^3) x k, theta = angle from the magnet direction, k on a spring k140 d9 (1 when near, 0 when away from 2.85 s); spikes wobble +-8 %; the badge shifts 3 px toward the magnet.

### effect/ink-drip: NEW · low · block · ae png · 1 motion(s)

- [`catalog-ui-material-ink-adhesion`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-ink-adhesion) **Ink Adhesion** (Material & Surface Motion; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: effect/ink-drip (new).
  Spec: Drop r11 falls 0.3-0.75 s (power1.in) stretching to 1.38 tall; on contact squashes to about 54x7 in 0.12 s power2.out, then spreads to the shelf edge in 0.7 s power2.out with a 2.5 px x e^(-6 t) x sin(24 t) wobble. 1.4-2.0 s a drip forms at the edge (r8, neck 2.6 px thinning), detaches at 2.12 s, falls into a pool (2.12-2.45 s power1.in) and makes ripples 5 px decaying e^(-2.4 t).

### effect/iridescent-select: NEW · low · block · ae png · 1 motion(s)

- [`catalog-ui-material-oil-slick`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-oil-slick) **Oil Slick Selection** (Material & Surface Motion; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: effect/iridescent-select (new).
  Spec: List card 144x128. The selected row gets a soft superellipse blob (124x32, growing from 80 %, spring k160 d14) with a wobbling noisy edge (+-10 / +-7 px over the 4.2 s cycle), filled with thin diagonal bands in 5 colours (2 px lines, 8 px apart) flowing one band set per 4.2 s; the same bands at 7 % over the whole card.

### effect/lens-bulge: NEW · low · block · ae png · 1 motion(s)
Origins named by the site: codrops (1).

- [`tx-lens-bulge`](https://motion-reference.takayustudio.jp/#motion=tx-lens-bulge) **Cursor Bulge Lens** (Pointer; text; 350 ms; easeInOutCubic; missing, low · origin codrops). Closest: `effect/vfx-liquid`. Proposal: effect/lens-bulge (new).
  Spec: WebGL plane 100 × 100 segments textured with the text: vertices within 3 units of a keyed cursor point rise z += easeInOutCubic(1 − d / 3) × 1.0, a seamless bulge that magnifies and warps letters, with shading for depth.

### effect/light-beam: NEW · low · block · ae png · 1 motion(s)

- [`catalog-game-impact-fx-loot-beam`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-loot-beam) **Loot Beam Column** (Game Impact FX; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: effect/light-beam (new).
  Spec: Item drops onto the ground with a bounce ease (500 ms from 0.3 s); a vertical beam grows 0 -> 140 px (@320x200) in 450 ms outExpo at 0.9 s: width 16 +- 2 px wobble at 8 rad/s, accent gradient 80 % -> 0 upward, glowing core line over the lower 75 %; flat ground ring (height 0.3 x width) radius 20 +- 4 px; 10 sparkles rise along it on a 1.4 s loop; retracts 350 ms in-cubic at 3.55 s.

### engine / rig: film.json text option writing-mode: vertical-rl (+ text/top-: NEW · low · effect · ae keyframes · 1 motion(s)

- [`tx-tategaki-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-tategaki-reveal) **Tategaki Reveal** (Japanese; text; 500 ms; easeOutExpo; missing, low). Closest: none. Proposal: film.json text option writing-mode: vertical-rl (+ text/top-down-letters).
  Spec: writing-mode vertical-rl; chars drop y −20 px → 0 with opacity, 0.5 s expo.out, stagger 40–60 ms top → bottom, columns right → left; 2-digit numbers set upright in one cell.

### engine / rig: text split units: ruby (base + reading as one unit): NEW · low · effect · ae keyframes · 1 motion(s)

- [`tx-ruby-sync`](https://motion-reference.takayustudio.jp/#motion=tx-ruby-sync) **Ruby Sync Reveal** (Japanese; text; 600 ms; easeOutCubic; missing, low). Closest: none. Proposal: text split units: ruby (base + reading as one unit).
  Spec: Base + reading move as one unit in the stagger: unit y 0.4 em → 0 + fade, 0.6 s power3.out, 0.16 s apart; only the reading's opacity lags +80 ms (0.3 s).

### motion/velocity-skew: NEW · low · effect · ae expression · 1 motion(s)

- [`tx-scroll-skew`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-skew) **Velocity Skew** (Scroll; text; 800 ms; power3; missing, low). Closest: none. Proposal: motion/velocity-skew (new).
  Spec: skewY = clamp(−velocity / 300, −20°, 20°) where velocity is the element's own vertical speed in px/s; the skew chases it through a 0.8 s power3 follow, so on stop it swings slightly past 0 before settling; origin centre.

### shape/gyro-rings: NEW · low · block · ae png · 1 motion(s)

- [`gyroscope`](https://motion-reference.takayustudio.jp/#motion=gyroscope) **Gyroscope Rotation** (Rotation; canvas; 1100 ms; easeInOutSine; missing, low). Closest: none. Proposal: shape/gyro-rings (new).
  Spec: Two rings (r 58 and 44 px, strokes 4 and 3 px) around a 10 px core: the assembly turns rotateY 0 → 360° (sine.inOut) while rotateX goes 0 → 55° → 0 (sine), 1100 ms, perspective 360 px; back halves at 30 % opacity behind the core; a marker dot on the outer ring.

### shape/membrane: NEW · low · block · ae png · 1 motion(s)

- [`catalog-ui-material-membrane-press`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-membrane-press) **Elastic Membrane Press** (Material & Surface Motion; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: shape/membrane (new).
  Spec: A 208 px line pinned at both ends. A finger presses the centre: dip 0 to 36 px over 0.5-1.0 s power2.inOut, profile depth x (1 - u^2)(1 - 0.25 u^2) (u = -1 to 1). Release at 1.4 s: depth returns on a spring k180 d5 (strong wobble). 14 % accent fill under the curve, 4 px stroke.

### text/collide: NEW · low · effect · ae keyframes · 1 motion(s)

- [`catalog-kinetic-type-letter-collision`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-letter-collision) **Letter Collision Bounce** (Glyph Physics; canvas; 4200 ms; linear; missing, low). Closest: none. Proposal: text/collide (new).
  Spec: Two 48 px letters on a floor, gap ~1.6 em. A accelerates power2.in over 0.6 s into B; at contact A squashes scaleX 0.8 / scaleY 1.2 and B stretches 1.12 / 0.88 for ±70 ms; A recoils 4 px (sin × e^(−6t), 0.25 s); B slides +92 px (~1.9 em) power3.out 0.7 s; 5 short accent impact lines radiate 0.25 s at the contact point.

### text/domino: NEW · low · effect · ae keyframes · 1 motion(s)

- [`tx-domino-topple`](https://motion-reference.takayustudio.jp/#motion=tx-domino-topple) **Domino Topple** (Glyph Physics; text; 120 ms; power2.in; missing, low). Closest: none. Proposal: text/domino (new).
  Spec: Letter-spacing ~0.35 em; per char origin 100 % 100 %: rotation 0 → 28° in 0.12 s power2.in at i × 0.12 s (each stops leaning on the next); last char 0 → 88° in 0.3 s power2.in, rebounds to 80° and back to 86° (0.08 s power1.out each way).

### text/fuzzy: NEW · low · effect · ae png · 1 motion(s)
Origins named by the site: react-bits (1).

- [`tx-fuzzy-text`](https://motion-reference.takayustudio.jp/#motion=tx-fuzzy-text) **Fuzzy Text** (Distortion & Glitch; text; 16 ms; random; missing, low · origin react-bits). Closest: none. Proposal: text/fuzzy (new).
  Spec: Text drawn to a canvas; each frame every 1 px row is offset horizontally by a seeded value within +-(30 px x intensity) (intensity 0.18 at rest ~ +-3-5 px, 0.5 for a hover beat); new values every frame (seed = frame index).

### text/led-matrix: NEW · low · effect · ae png · 1 motion(s)

- [`tx-led-dot-matrix`](https://motion-reference.takayustudio.jp/#motion=tx-led-dot-matrix) **LED Dot-Matrix Marquee** (Broadcast & Telop; text; 45 ms; steps(1); missing, low). Closest: none. Proposal: text/led-matrix (new).
  Spec: Text rasterised to a 16-row bitmap and drawn as a dot grid (pitch 6 px, dot radius 2.3 px): lit dots #ff8a3d with glow (blur 8), unlit #2a2a2a still visible; the text steps one dot-column every 45 ms (30–60 ms), never gliding; repeats with a gap.

### text/long-shadow: NEW · low · effect · ae keyframes · 1 motion(s)

- [`tx-long-shadow-grow`](https://motion-reference.takayustudio.jp/#motion=tx-long-shadow-grow) **Long Shadow Grow** (Colour & Light; text; 800 ms; ease-out; missing, low). Closest: none. Proposal: text/long-shadow (new).
  Spec: Stack of copies (or text-shadows) behind the text, copy k offset (k px, k px) at 45 deg, k = 1..L; L grows 0 -> 60 px over 0.8 s power2.out; copies fade toward the background with distance (opacity 1 -> 0.2); main text on top.

### text/melt: NEW · low · effect · ae png · 1 motion(s)

- [`tx-melt-drip`](https://motion-reference.takayustudio.jp/#motion=tx-melt-drip) **Melt Drip** (Distortion & Glitch; text; 2000 ms; ease-in; missing, low). Closest: none. Proposal: text/melt (new).
  Spec: Per char: vertical SVG displacement scale 0 -> 40 px over 2 s power2.in, chars offset by a seeded 0-0.3 s; glyph tops pinned, bottoms stretch by a per-column amount; gooey alpha matrix (alpha x18 -7) after a small blur keeps drips liquid; one drop detaches from the longest drip and falls.

### text/outline-spotlight: NEW · low · effect · ae png · 1 motion(s)
Origins named by the site: aceternity (1).

- [`tx-spotlight-outline`](https://motion-reference.takayustudio.jp/#motion=tx-spotlight-outline) **Spotlight Outline Hover** (Pointer; text; 4000 ms; ease-in-out; partial, low · origin aceternity). Closest: `logo/svg-reveal`, `effect/spotlight`. Proposal: text/outline-spotlight (new).
  Spec: Huge outline-only word: stroke dashoffset 1000 → 0 over 4 s ease-in-out; above it the same outline stroked with a gradient, visible only through a radial mask (radius 20 % of the width) centred on a keyed cursor path; elsewhere a thin grey line.

### text/rsvp: NEW · low · effect · ae keyframes · 1 motion(s)

- [`tx-rsvp-flash`](https://motion-reference.takayustudio.jp/#motion=tx-rsvp-flash) **RSVP Word Flash** (Captions & Subtitles; text; 200 ms; steps (instant); missing, low). Closest: `text/caption-kinetic-slam`. Proposal: text/rsvp (new).
  Spec: One word at a time in one place, hard cut every 60 / wpm s (300 wpm = 200 ms), ×1.5 after punctuation or words longer than 8 letters; the ORP letter (index floor(0.35 × length)) is accent-coloured and centred on a fixed mark, the part before right-aligned, the part after left-aligned.

### text/scramble-reveal: EXTEND · low · effect · ae expression · 1 motion(s)

- [`tx-char-code-cycle`](https://motion-reference.takayustudio.jp/#motion=tx-char-code-cycle) **Character Offset Cycle** (Typing & Decoding; text; 1000 ms; easeOutQuad; partial, low). Closest: `text/scramble-reveal`, `text/anime-scramble`. Proposal: text/scramble-reveal + param mode offset (ordered code-point steps, not random).
  Spec: Per char: shown char = target shifted back k code points inside its class (a-z, A-Z, 0-9, kana), k = round(10 x (1 - p_i)); p_i from a left-to-right range ramp (~30 % wide) over 1 s, outQuad; integer steps, no fade.

### text/spring-chain: NEW · low · effect · ae expression · 1 motion(s)

- [`tx-spring-chain`](https://motion-reference.takayustudio.jp/#motion=tx-spring-chain) **Spring Chain Follow** (Glyph Physics; text; 1900 ms; spring chain; missing, low). Closest: none. Proposal: text/spring-chain (new).
  Spec: Only the lead char follows a keyed path; every other char each frame at 60 fps: v = (v + (previous char + advance − x) × 0.15) × 0.75 for x and y, then rotates to the chain's slope; lag accumulates so the word whips like a tail and falls back in line. Deterministic from the lead path (ctx.code stepping frames from at).

### text/stripe-shadow: NEW · low · effect · ae png · 1 motion(s)
Origins named by the site: magicui (1).

- [`tx-line-shadow`](https://motion-reference.takayustudio.jp/#motion=tx-line-shadow) **Line Shadow Text** (Colour & Light; text; 15000 ms; linear; missing, low · origin magicui). Closest: none. Proposal: text/stripe-shadow (new).
  Spec: A copy of the text offset +0.04 em x / y behind it, filled with 45 deg stripes (stripe 0.06 em, colour / transparent) via background-clip; stripes scroll background-position 0 0 -> 100 % -100 % over 15 s linear, loop; main text static.

### text/tracking-in: EXTEND · low · effect · ae keyframes · 1 motion(s)

- [`tx-blend-overlap`](https://motion-reference.takayustudio.jp/#motion=tx-blend-overlap) **Blend Overlap** (Colour & Light; text; 900 ms; ease-in-out; partial, low). Closest: `text/tracking-in`, `text/caption-blend-difference`. Proposal: text/tracking-in + param blend (per-char colour cycle with mix-blend-mode screen / multiply).
  Spec: Chars coloured in a repeating 3-colour cycle (e.g. cyan, magenta, yellow), mix-blend-mode screen on dark (multiply on light); letter-spacing 0 -> -0.3 em with scale 1 -> 1.1 over 0.9 s power2.inOut so neighbours overlap into mixed colours.

### text/wave-columns: NEW · low · block · ae expression · 1 motion(s)
Origins named by the site: codrops (1).

- [`tx-dual-wave-columns`](https://motion-reference.takayustudio.jp/#motion=tx-dual-wave-columns) **Dual Wave Columns** (Scroll; text; 4000 ms; none (scrub); missing, low · origin codrops). Closest: none. Proposal: text/wave-columns (new).
  Spec: Two lists of words scroll vertically; each item's x = ±0.12 × frame width × sin(y × 0.006 + 1.1), y = its distance from the frame centre in px, sign mirrored per column; the item crossing the centre turns accent, 1.3× size, weight 800 (0.2 s).

### transition/whip-pan-cut: EXTEND · low · effect · ae keyframes · 1 motion(s)

- [`tr-streak`](https://motion-reference.takayustudio.jp/#motion=tr-streak) **Light-streak Whip** (Transitions; dom; 350 ms; power3.in; partial, low). Closest: `transition/directional-wipe`, `transition/whip-pan-cut`. Proposal: transition/whip-pan-cut + param streak (light band, cut at its centre).
  Spec: Soft white band (6 stacked layers at 25 % opacity, widths about 28 % to 84 % of frame width) travels from -40 % to 140 % of width in 350 ms power3.in; cut to the incoming scene when the band centre crosses the frame centre. Recipe 0.3-0.4 s.

### ui/compass-tape: NEW · low · block · ae keyframes · 1 motion(s)

- [`catalog-game-hud-compass-lock`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-compass-lock) **Compass Lock** (Game HUD; canvas; 2800 ms; linear; missing, low). Closest: none. Proposal: ui/compass-tape (new).
  Spec: Tape 220 x 40 px (@320x200) under a fixed pointer: heading 250 -> 356 deg in 1.1 s outCubic from 0.3 s, then settles to 360 (N) by spring k520 d20; 2 px per degree, ticks every 5 deg (longer every 15), labelled majors every 45, edges fade over +-112 px. Lock at 1.45 s: brackets close from +-42 to +-20 px (250 ms back.out), N turns accent and grows 13 -> 15 px, 'LOCK' pill pops; 3-digit readout.

### ui/hud-pips: EXTEND · low · effect · ae keyframes · 1 motion(s)

- [`catalog-game-hud-ammo-reload`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-ammo-reload) **Ammo Reload** (Game HUD; canvas; 2800 ms; linear; partial, low). Closest: `ui/hud-pips`. Proposal: ui/hud-pips + params drop, counter.
  Spec: 12 outlined slots 16 px apart (@320x200); rounds 4-12 drop in from 34 px above, 160 ms back.out, opacity in 50 ms, 85 ms apart from 0.55 s; a counter 3 -> 12 steps on each landing with a 1.2 scale kick (200 ms sine), yellow while <= 3. 'RELOAD' label 0.35-1.45 s. Exit: rounds rise 16 px and fade in 140 ms, 35 ms apart from the last.

### ui/icon-morph-beat: EXTEND · low · block · ae keyframes · 1 motion(s)

- [`catalog-ui-control-mute-pop`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-mute-pop) **Mute Pop** (Selection & Controls; canvas; 2800 ms; linear; partial, low). Closest: `ui/icon-morph-beat`. Proposal: ui/icon-morph-beat + pair speaker-mute.
  Spec: Press 0.4 s: icon scale 0.92 (0.18 s sine bump). Three sound waves vanish outer first, 60 ms apart, each 160 ms power2.in (radius x0.7, fade). Slash draws top-left to bottom-right 0.75-0.95 s (back.out 200 ms), 4 px ink over a 9 px paper outline, width pulse x1.5; label ON to MUTE. Reverse: the slash retracts, waves return inner first 70 ms apart (back.out).

### ui/reticle-lock: NEW · low · effect · ae keyframes · 1 motion(s)

- [`catalog-game-combat-hit-confirm`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-hit-confirm) **Hit Confirm** (Combat & Hit FX; canvas; 2800 ms; linear; partial, low). Closest: `ui/camera-scan-gate`. Proposal: ui/reticle-lock (new).
  Spec: Fixed reticle (@320x200, drawn x1.5): on hit (0.75 s) four corner brackets at 45 deg move from radius 26 to 13 px by spring k700 d34 (~120 ms) while their 9 px legs shrink to 0 and 8 px diagonal strokes grow, forming an X; colour turns accent past halfway; a dashed circle appears; target flashes 150 ms and shakes 2 px 200 ms; 'HIT' label. Release 1.5-1.8 s outCubic.

### ui/scroll-feed: EXTEND · low · block · ae keyframes · 1 motion(s)

- [`velocity-skew`](https://motion-reference.takayustudio.jp/#motion=velocity-skew) **Scroll Velocity Skew** (Web Scroll; canvas; 900 ms; easeOutCubic; partial, low). Closest: `ui/scroll-feed`, `camera/scroll-story`. Proposal: ui/scroll-feed + param skew (cards lean with scroll speed).
  Spec: Card list scrolls 0 to 190 px (0.3-0.85 s power2.inOut), holds, returns 1.6-2.15 s. Each card skewY = clamp(speed in px/s x 0.012, -9 deg, +9 deg), smoothed by a spring k520 d30 so it is back at 0 deg about 180 ms after the scroll stops. Only small surfaces lean.

### ui/typed-prompt: EXTEND · low · block · ae keyframes · 1 motion(s)
Origins named by the site: budoux (1).

- [`tx-ime-conversion`](https://motion-reference.takayustudio.jp/#motion=tx-ime-conversion) **IME Kana-Kanji Conversion** (Japanese; text; 90 ms; steps (per keystroke); partial, low · origin budoux). Closest: `ui/typed-prompt`. Proposal: ui/typed-prompt + param compose (IME underline states).
  Spec: Composing: one kana per 90 ms under a dotted underline; converting: segments underlined 1 px, the focused one 3 px, candidate window pops, 0.3 s highlight; commit: underline removed; caret blinks every 1 s.
