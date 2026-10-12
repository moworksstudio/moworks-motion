# Intake catalogue: motion-reference.takayustudio.jp, the 782 motions

Part of the intake [2026-10-12-motion-reference-takayustudio.md](2026-10-12-motion-reference-takayustudio.md); what to build, with
specs, is in [2026-10-12-motion-reference-takayustudio-specs.md](2026-10-12-motion-reference-takayustudio-specs.md).

Read on 2026-10-12. Each id links to the site's own demo (`https://motion-reference.takayustudio.jp/#motion=<id>`). Names, timings
and eases are the site's; status, kit match, target, priority and spec are this intake's judgement against the kit at commit `66161ef`.
**Specs are numbers in our own words, never the site's code.**

Status: **have** = a kit preset or layout does it · **generic** = only the general-purpose `motion/anime` / `motion/tween` do it (no
named preset) · **partial** = the kit has the mechanism but lacks a defining part · **missing** = nothing in the kit · **skip** = a lesson
or an audio-only item with no film motion. Engine: `canvas` = the site draws a schematic on a 320 x 200 canvas (port the moving subject,
not the guides or readouts) · `dom` = keyframe tracks on elements (320 x 180 stage) · `text` = the site's text engine. Times in ms.

## The full catalogue, by the site's categories

### Entrance & Exit (`entrance`, 11: have 6, generic 3, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`fade-slide`](https://motion-reference.takayustudio.jp/#motion=fade-slide) | Fade + Slide | canvas | 600 | easeOutCubic | generic | `motion/tween` | - |
| [`mask-wipe`](https://motion-reference.takayustudio.jp/#motion=mask-wipe) | Mask Wipe | canvas | 700 | easeInOutQuint | have | `motion/tween`, `lower/mask-reveal` | - |
| [`iris-open`](https://motion-reference.takayustudio.jp/#motion=iris-open) | Iris Open | canvas | 760 | easeOutQuart | have | `transition/iris-reveal`, `motion/tween` | - |
| [`soft-rise`](https://motion-reference.takayustudio.jp/#motion=soft-rise) | Soft Rise | canvas | 900 | easeOutSine | have | `text/soft-blur-in` | - |
| [`snap-in`](https://motion-reference.takayustudio.jp/#motion=snap-in) | Snap In | canvas | 380 | easeOutExpo | have | `motion/slide-in` | - |
| [`split-reveal`](https://motion-reference.takayustudio.jp/#motion=split-reveal) | Split Reveal | canvas | 720 | easeInOutCubic | partial | → `transition/curtain-reveal` | medium |
| [`trail-exit`](https://motion-reference.takayustudio.jp/#motion=trail-exit) | Trail Exit | canvas | 520 | easeInQuart | partial | → `motion/echo` | medium |
| [`collapse-away`](https://motion-reference.takayustudio.jp/#motion=collapse-away) | Collapse Away | canvas | 560 | easeInBack | generic | `motion/tween` | - |
| [`diagonal-wipe`](https://motion-reference.takayustudio.jp/#motion=diagonal-wipe) | Diagonal Wipe | canvas | 680 | easeInOutQuint | have | `motion/tween`, `transition/directional-wipe` | - |
| [`fold-in`](https://motion-reference.takayustudio.jp/#motion=fold-in) | 3D Fold In | canvas | 760 | easeOutCubic | have | `text/land-in`, `motion/tween` | - |
| [`shrink-fade-exit`](https://motion-reference.takayustudio.jp/#motion=shrink-fade-exit) | Shrink Fade Exit | canvas | 520 | easeInCubic | generic | `motion/tween` | - |

### Movement (`move`, 11: have 4, generic 5, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`linear-travel`](https://motion-reference.takayustudio.jp/#motion=linear-travel) | Linear Travel | canvas | 800 | linear | generic | `motion/tween` | - |
| [`smooth-arrival`](https://motion-reference.takayustudio.jp/#motion=smooth-arrival) | Smooth Arrival | canvas | 760 | easeInOutCubic | generic | `motion/tween` | - |
| [`arc-travel`](https://motion-reference.takayustudio.jp/#motion=arc-travel) | Arc Travel | canvas | 800 | easeInOutSine | have | `motion/anime-path`, `motion/arc-path` | - |
| [`anticipation-move`](https://motion-reference.takayustudio.jp/#motion=anticipation-move) | Anticipated Move | canvas | 820 | easeInOutBack | generic | `motion/tween` | - |
| [`heavy-stop`](https://motion-reference.takayustudio.jp/#motion=heavy-stop) | Heavy Stop | canvas | 680 | easeOutQuart | partial | → `motion/squash-stretch` | medium |
| [`follow-path`](https://motion-reference.takayustudio.jp/#motion=follow-path) | Path Follow | canvas | 1000 | easeInOutSine | have | `motion/anime-path`, `motion/path-traveler` | - |
| [`stagger-follow`](https://motion-reference.takayustudio.jp/#motion=stagger-follow) | Stagger Follow | canvas | 900 | easeOutCubic | generic | `motion/tween` | - |
| [`magnetic-snap`](https://motion-reference.takayustudio.jp/#motion=magnetic-snap) | Magnetic Snap | canvas | 620 | easeInOutCubic | have | `motion/anime`, `cursor/magnetic` | - |
| [`zigzag-travel`](https://motion-reference.takayustudio.jp/#motion=zigzag-travel) | Zigzag Travel | canvas | 920 | easeInOutSine | generic | `motion/anime-path` | - |
| [`momentum-drift`](https://motion-reference.takayustudio.jp/#motion=momentum-drift) | Momentum Drift | canvas | 880 | easeOutCubic | have | `motion/tween`, `motion/inertial-bounce` | - |
| [`waypoint-hop`](https://motion-reference.takayustudio.jp/#motion=waypoint-hop) | Waypoint Hop | canvas | 860 | easeOutCubic | partial | → `motion/squash-stretch` | medium |

### Scale (`scale`, 11: have 7, generic 2, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`pop-scale`](https://motion-reference.takayustudio.jp/#motion=pop-scale) | Pop Scale | canvas | 520 | easeOutBack | have | `shape/pop`, `house/panel-pop` | - |
| [`breathing`](https://motion-reference.takayustudio.jp/#motion=breathing) | Breathing Scale | dom | 1200 | easeInOutSine | have | `house/breathe` | - |
| [`elastic-scale`](https://motion-reference.takayustudio.jp/#motion=elastic-scale) | Elastic Scale | canvas | 900 | easeOutElastic | have | `house/logo-pop`, `motion/tween` | - |
| [`axis-stretch`](https://motion-reference.takayustudio.jp/#motion=axis-stretch) | Axis Stretch | canvas | 700 | easeInOutBack | partial | → `motion/squash-stretch` | medium |
| [`pulse-focus`](https://motion-reference.takayustudio.jp/#motion=pulse-focus) | Focus Pulse | canvas | 680 | easeOutCubic | partial | → `effect/ring-pulse` | high |
| [`depth-zoom`](https://motion-reference.takayustudio.jp/#motion=depth-zoom) | Depth Zoom | canvas | 740 | easeInOutQuint | generic | `motion/tween` | - |
| [`soft-shrink`](https://motion-reference.takayustudio.jp/#motion=soft-shrink) | Soft Shrink | canvas | 600 | easeInCubic | have | `motion/tween`, `house/pop-out` | - |
| [`impact-squash`](https://motion-reference.takayustudio.jp/#motion=impact-squash) | Impact Squash | canvas | 620 | easeOutBack | have | `motion/tween`, `hand/hit-stop` | - |
| [`center-punch`](https://motion-reference.takayustudio.jp/#motion=center-punch) | Center Punch | canvas | 480 | easeOutBack | have | `shape/pop`, `house/burst-pop` | - |
| [`width-reveal`](https://motion-reference.takayustudio.jp/#motion=width-reveal) | Width Reveal | canvas | 650 | easeOutQuart | generic | `motion/tween` | - |
| [`depth-pullback`](https://motion-reference.takayustudio.jp/#motion=depth-pullback) | Depth Pullback | canvas | 760 | easeInOutCubic | have | `motion/tween`, `camera/pull-back-reveal` | - |

### Rotation (`rotate`, 11: have 3, generic 4, partial 3, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`simple-turn`](https://motion-reference.takayustudio.jp/#motion=simple-turn) | Simple Turn | canvas | 700 | easeInOutCubic | generic | `motion/tween` | - |
| [`spin-stop`](https://motion-reference.takayustudio.jp/#motion=spin-stop) | Spin Stop | canvas | 850 | easeOutQuart | generic | `motion/tween` | - |
| [`wobble`](https://motion-reference.takayustudio.jp/#motion=wobble) | Pendulum Wobble | dom | 1000 | easeOutElastic | have | `motion/inertial-bounce`, `motion/pendulum-swing` | - |
| [`flip-card`](https://motion-reference.takayustudio.jp/#motion=flip-card) | Card Flip | dom | 760 | easeInOutCubic | partial | → `motion/card-flip` | high |
| [`orbit`](https://motion-reference.takayustudio.jp/#motion=orbit) | Orbit | dom | 1100 | linear | have | `motion/tween`, `effect/nucleus-orbit` | - |
| [`tilt-reaction`](https://motion-reference.takayustudio.jp/#motion=tilt-reaction) | Tilt Reaction | canvas | 560 | easeOutBack | partial | → `motion/emphasis` | medium |
| [`tumble-in`](https://motion-reference.takayustudio.jp/#motion=tumble-in) | Tumble In | canvas | 820 | easeOutCubic | generic | `motion/tween` | - |
| [`counter-rotate`](https://motion-reference.takayustudio.jp/#motion=counter-rotate) | Counter Rotation | canvas | 1000 | easeInOutSine | generic | `motion/tween` | - |
| [`coin-spin`](https://motion-reference.takayustudio.jp/#motion=coin-spin) | Coin Spin | canvas | 900 | easeOutQuart | partial | → `motion/card-flip` | medium |
| [`gyroscope`](https://motion-reference.takayustudio.jp/#motion=gyroscope) | Gyroscope Rotation | canvas | 1100 | easeInOutSine | missing | → `shape/gyro-rings` | low |
| [`rotate-reveal`](https://motion-reference.takayustudio.jp/#motion=rotate-reveal) | Rotate Reveal | canvas | 720 | easeOutCubic | have | `text/land-in` | - |

### Bounce & Reaction (`reaction`, 11: have 3, partial 7, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`overshoot`](https://motion-reference.takayustudio.jp/#motion=overshoot) | Overshoot | canvas | 600 | easeOutBack | have | `motion/tween`, `motion/inertial-bounce` | - |
| [`bounce-land`](https://motion-reference.takayustudio.jp/#motion=bounce-land) | Bounce Landing | canvas | 700 | easeOutBounce | partial | → `motion/squash-stretch` | medium |
| [`spring-follow`](https://motion-reference.takayustudio.jp/#motion=spring-follow) | Spring Follow | canvas | 1800 | spring(1, 80, 10) | have | `motion/spring-track`, `motion/tween` | - |
| [`rubber-band`](https://motion-reference.takayustudio.jp/#motion=rubber-band) | Rubber Band | canvas | 900 | easeOutElastic | partial | → `motion/drag-release` | medium |
| [`recoil`](https://motion-reference.takayustudio.jp/#motion=recoil) | Recoil | canvas | 520 | easeOutQuart | have | `motion/inertial-bounce`, `motion/anime` | - |
| [`double-bounce`](https://motion-reference.takayustudio.jp/#motion=double-bounce) | Double Bounce | canvas | 820 | easeOutBounce | partial | → `motion/squash-stretch` | medium |
| [`snap-back`](https://motion-reference.takayustudio.jp/#motion=snap-back) | Snap Back | canvas | 560 | easeOutBack | partial | → `motion/drag-release` | medium |
| [`after-shake`](https://motion-reference.takayustudio.jp/#motion=after-shake) | After Shake | canvas | 720 | easeOutExpo | partial | → `hand/shake` | medium |
| [`settle-drop`](https://motion-reference.takayustudio.jp/#motion=settle-drop) | Settle Drop | canvas | 760 | easeOutCubic | partial | → `hand/hit-stop` | medium |
| [`drag-resistance`](https://motion-reference.takayustudio.jp/#motion=drag-resistance) | Drag Resistance | canvas | 820 | easeInOutBack | partial | → `motion/drag-release` | medium |
| [`follow-through`](https://motion-reference.takayustudio.jp/#motion=follow-through) | Follow Through | canvas | 860 | easeOutCubic | missing | → `motion/follow-chain` | low |

### List & Grid (`collection`, 12: have 4, generic 5, partial 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`list-stagger`](https://motion-reference.takayustudio.jp/#motion=list-stagger) | Staggered List | canvas | 760 | easeOutCubic | have | `motion/slide-in`, `text/bullets` | - |
| [`list-cascade`](https://motion-reference.takayustudio.jp/#motion=list-cascade) | Cascade List | canvas | 820 | easeOutQuart | generic | `motion/tween` | - |
| [`list-alternate`](https://motion-reference.takayustudio.jp/#motion=list-alternate) | Alternating List | canvas | 780 | easeOutCubic | have | `house/super-slide` | - |
| [`list-expand`](https://motion-reference.takayustudio.jp/#motion=list-expand) | Row Expand | canvas | 720 | easeOutBack | have | `motion/tween`, `ui/panel-reveal` | - |
| [`grid-wave`](https://motion-reference.takayustudio.jp/#motion=grid-wave) | Grid Wave | canvas | 900 | easeOutCubic | generic | `motion/anime-stagger-grid` | - |
| [`grid-center`](https://motion-reference.takayustudio.jp/#motion=grid-center) | Center-out Grid | canvas | 860 | easeOutBack | generic | `motion/anime-stagger-grid` | - |
| [`grid-row-sweep`](https://motion-reference.takayustudio.jp/#motion=grid-row-sweep) | Row Sweep Grid | canvas | 800 | easeInOutCubic | generic | `motion/anime-stagger-grid` | - |
| [`grid-shuffle`](https://motion-reference.takayustudio.jp/#motion=grid-shuffle) | Shuffle to Grid | canvas | 980 | easeInOutBack | partial | → `motion/anime-stagger-grid` | medium |
| [`list-slide-stack`](https://motion-reference.takayustudio.jp/#motion=list-slide-stack) | List Slide Stack | canvas | 900 | easeOutCubic | have | `motion/tween`, `text/bullets` | - |
| [`list-trim-collapse`](https://motion-reference.takayustudio.jp/#motion=list-trim-collapse) | List Trim Collapse | canvas | 780 | easeInOutCubic | partial | → `motion/anime-layout` | medium |
| [`grid-spiral`](https://motion-reference.takayustudio.jp/#motion=grid-spiral) | Grid Spiral | canvas | 1100 | easeOutCubic | partial | → `motion/anime-stagger-grid` | low |
| [`grid-diagonal`](https://motion-reference.takayustudio.jp/#motion=grid-diagonal) | Grid Diagonal Wave | canvas | 940 | easeOutQuart | generic | `motion/anime-stagger-grid`, `motion/tween` | - |

### Attention & Emphasis (`attention`, 12: have 5, generic 1, partial 6)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`nudge`](https://motion-reference.takayustudio.jp/#motion=nudge) | Nudge | canvas | 520 | easeOutBack | partial | → `motion/emphasis` | high |
| [`attention-bounce`](https://motion-reference.takayustudio.jp/#motion=attention-bounce) | Attention Bounce | canvas | 620 | easeOutBounce | partial | → `motion/emphasis` | high |
| [`badge-pop`](https://motion-reference.takayustudio.jp/#motion=badge-pop) | Badge Pop | dom | 560 | easeOutBack | have | `house/pop-cute`, `ui/badge-pop` | - |
| [`focus-halo`](https://motion-reference.takayustudio.jp/#motion=focus-halo) | Focus Halo | canvas | 900 | easeOutCubic | partial | → `effect/ring-pulse` | high |
| [`highlight-sweep`](https://motion-reference.takayustudio.jp/#motion=highlight-sweep) | Highlight Sweep | canvas | 820 | easeInOutCubic | have | `text/shimmer-sweep` | - |
| [`border-chase`](https://motion-reference.takayustudio.jp/#motion=border-chase) | Border Chase | canvas | 1000 | cubic-bezier(0,0,1,1) | partial | → `line/outline-draw` | medium |
| [`press-feedback`](https://motion-reference.takayustudio.jp/#motion=press-feedback) | Press Feedback | canvas | 420 | easeOutCubic | have | `cursor/press-ripple`, `motion/tween` | - |
| [`jelly-emphasis`](https://motion-reference.takayustudio.jp/#motion=jelly-emphasis) | Jelly Emphasis | canvas | 760 | easeOutElastic | partial | → `motion/emphasis` | high |
| [`color-pulse`](https://motion-reference.takayustudio.jp/#motion=color-pulse) | Color Pulse | canvas | 760 | easeInOutSine | generic | `motion/tween` | - |
| [`icon-nod`](https://motion-reference.takayustudio.jp/#motion=icon-nod) | Icon Nod | canvas | 620 | easeOutBack | partial | → `motion/emphasis` | high |
| [`spotlight-focus`](https://motion-reference.takayustudio.jp/#motion=spotlight-focus) | Spotlight Focus | canvas | 900 | easeInOutCubic | have | `effect/spotlight`, `ui/focus-swap` | - |
| [`error-shake`](https://motion-reference.takayustudio.jp/#motion=error-shake) | Error Shake | canvas | 540 | easeOutExpo | have | `flow/input-feedback` | - |

### Light & Glow (`light`, 12: have 1, partial 9, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`glow-pulse`](https://motion-reference.takayustudio.jp/#motion=glow-pulse) | Glow Pulse | dom | 1100 | easeInOutSine | partial | → `house/glow-card` | medium |
| [`neon-flicker`](https://motion-reference.takayustudio.jp/#motion=neon-flicker) | Neon Flicker | canvas | 900 | cubic-bezier(0,0,1,1) | missing | → `effect/neon-flicker` | medium |
| [`light-sweep`](https://motion-reference.takayustudio.jp/#motion=light-sweep) | Light Sweep | canvas | 950 | easeInOutCubic | have | `text/shimmer-sweep`, `motion/object-sweep` | - |
| [`bloom-reveal`](https://motion-reference.takayustudio.jp/#motion=bloom-reveal) | Bloom Reveal | canvas | 780 | easeOutQuart | partial | → `text/soft-blur-in` | medium |
| [`rim-glow`](https://motion-reference.takayustudio.jp/#motion=rim-glow) | Rim Glow | canvas | 1000 | easeInOutSine | partial | → `house/glow-card` | medium |
| [`energy-charge`](https://motion-reference.takayustudio.jp/#motion=energy-charge) | Energy Charge | canvas | 1200 | easeInCubic | missing | → `effect/spark-burst` | low |
| [`light-trail`](https://motion-reference.takayustudio.jp/#motion=light-trail) | Light Trail | canvas | 900 | easeOutCubic | partial | → `motion/echo` | medium |
| [`scan-line`](https://motion-reference.takayustudio.jp/#motion=scan-line) | Scan Line | canvas | 1100 | cubic-bezier(0,0,1,1) | partial | → `motion/object-sweep` | medium |
| [`aurora-glow`](https://motion-reference.takayustudio.jp/#motion=aurora-glow) | Aurora Glow | canvas | 1500 | easeInOutSine | partial | → `house/glow-card` | medium |
| [`radial-flash`](https://motion-reference.takayustudio.jp/#motion=radial-flash) | Radial Flash | canvas | 560 | easeOutExpo | partial | → `effect/ring-pulse` | high |
| [`lens-flare-sweep`](https://motion-reference.takayustudio.jp/#motion=lens-flare-sweep) | Lens Flare Sweep | canvas | 1050 | easeInOutCubic | partial | → `effect/lens-flare-sweep` | medium |
| [`holographic-sheen`](https://motion-reference.takayustudio.jp/#motion=holographic-sheen) | Holographic Sheen | canvas | 1300 | easeInOutSine | partial | → `motion/object-sweep` | medium |

### Principles (`principles`, 17: have 11, generic 2, partial 2, skip 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`squash`](https://motion-reference.takayustudio.jp/#motion=squash) | Squash & Stretch | dom | 550 | easeInQuad | partial | → `motion/squash-stretch` | high |
| [`anticipation`](https://motion-reference.takayustudio.jp/#motion=anticipation) | Anticipation | dom | 400 | easeInBack | have | `ease:back.inOut(1.7)`, `motion/tween` | - |
| [`staging`](https://motion-reference.takayustudio.jp/#motion=staging) | Staging | dom | 200 | easeOutCubic | have | `ui/focus-swap`, `effect/spotlight` | - |
| [`pose`](https://motion-reference.takayustudio.jp/#motion=pose) | Pose-to-pose vs Straight-ahead | dom | 1000 | easeInOutCubic | skip | lesson (pose-to-pose vs straight-ahead); kit timelines are pose-to-pose, simulat | - |
| [`follow`](https://motion-reference.takayustudio.jp/#motion=follow) | Follow-through & Overlap | dom | 600 | easeOutCubic | have | `title/titlecard-lockup`, `logo/cta-lockup`, `motion/tween` | - |
| [`slowinout`](https://motion-reference.takayustudio.jp/#motion=slowinout) | Slow in & Slow out | dom | 1200 | easeInOutCubic | have | `ease:power2.inOut`, `ease:power2.out`, `ease:power2.in` | - |
| [`arcs`](https://motion-reference.takayustudio.jp/#motion=arcs) | Arcs | dom | 900 | easeInOutSine | have | `motion/anime-path`, `motion/arc-path` | - |
| [`secondary`](https://motion-reference.takayustudio.jp/#motion=secondary) | Secondary Action | dom | 500 | easeOutCubic | have | `motion/tween`, `house/kv-burst` | - |
| [`timing-weight`](https://motion-reference.takayustudio.jp/#motion=timing-weight) | Timing = Weight | dom | 500 | easeOutCubic | skip | lesson (badge 150 / card 300 / panel 500 ms); kit rule: durations by size (film. | - |
| [`exaggeration`](https://motion-reference.takayustudio.jp/#motion=exaggeration) | Exaggeration | dom | 450 | easeOutBack | have | `shape/pop`, `ease:back.out(1.7)` | - |
| [`solid`](https://motion-reference.takayustudio.jp/#motion=solid) | Solid Drawing / Depth | dom | 800 | easeInOutCubic | partial | → `card/tilt-card` | medium |
| [`appeal`](https://motion-reference.takayustudio.jp/#motion=appeal) | Appeal | dom | 180 | easeOutCubic | have | `flow/toggle-flip`, `ui/toggle-switch` | - |
| [`cause`](https://motion-reference.takayustudio.jp/#motion=cause) | Cause-and-effect Chain | dom | 400 | easeOutCubic | generic | `motion/tween` | - |
| [`jitter`](https://motion-reference.takayustudio.jp/#motion=jitter) | Anti-robotic Jitter | dom | 400 | easeOutCubic | have | `motion/anime-stagger-grid`, `house/pop-cute` | - |
| [`layers3`](https://motion-reference.takayustudio.jp/#motion=layers3) | Primary / Secondary / Ambient | dom | 600 | easeOutCubic | have | `house/deco-float`, `background/aurora-drift`, `motion/tween` | - |
| [`ambient-hold`](https://motion-reference.takayustudio.jp/#motion=ambient-hold) | No Dead Frames | dom | 4000 | easeInOutSine | have | `camera/drift-hold`, `house/breathe`, `background/aurora-drift` | - |
| [`counter`](https://motion-reference.takayustudio.jp/#motion=counter) | Counter-motion | dom | 800 | easeOutCubic | generic | `motion/tween` | - |

### Easing (`easing`, 25: have 14, generic 1, partial 4, missing 6)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`e-linear`](https://motion-reference.takayustudio.jp/#motion=e-linear) | Linear | dom | 1200 | linear | have | `ease:none` | - |
| [`e-outexpo`](https://motion-reference.takayustudio.jp/#motion=e-outexpo) | Ease-out Expo | dom | 400 | easeOutExpo | have | `ease:expo.out` | - |
| [`e-inexpo`](https://motion-reference.takayustudio.jp/#motion=e-inexpo) | Ease-in Expo | dom | 250 | easeInExpo | have | `ease:expo.in` | - |
| [`e-inout`](https://motion-reference.takayustudio.jp/#motion=e-inout) | Ease-in-out Cubic | dom | 350 | easeInOutCubic | have | `ease:power2.inOut` | - |
| [`e-house`](https://motion-reference.takayustudio.jp/#motion=e-house) | Thin-peak (House curve) | dom | 600 | easeInOutQuint | have | `ease:power4.inOut` | - |
| [`e-whip`](https://motion-reference.takayustudio.jp/#motion=e-whip) | Whip | dom | 500 | cubic-bezier(.9,0,.1,1) | missing | → `ease aliases (eases.js)` | low |
| [`e-glide`](https://motion-reference.takayustudio.jp/#motion=e-glide) | Glide | dom | 300 | cubic-bezier(.4,0,.2,1) | missing | → `ease aliases (eases.js)` | low |
| [`e-quint`](https://motion-reference.takayustudio.jp/#motion=e-quint) | Ease-out Quint | dom | 700 | easeOutQuint | have | `ease:power4.out` | - |
| [`e-md3`](https://motion-reference.takayustudio.jp/#motion=e-md3) | Material 3 Standard | dom | 300 | cubic-bezier(.2,0,0,1) | missing | → `ease aliases (eases.js)` | low |
| [`e-md3e`](https://motion-reference.takayustudio.jp/#motion=e-md3e) | Material 3 Emphasized | dom | 500 | cubic-bezier(.05,.7,.1,1) | missing | → `ease aliases (eases.js)` | low |
| [`e-md3a`](https://motion-reference.takayustudio.jp/#motion=e-md3a) | Material 3 Accelerate | dom | 200 | cubic-bezier(.3,0,1,1) | missing | → `ease aliases (eases.js)` | low |
| [`e-apple`](https://motion-reference.takayustudio.jp/#motion=e-apple) | Apple HIG | dom | 350 | ease | missing | → `ease aliases (eases.js)` | low |
| [`e-outback`](https://motion-reference.takayustudio.jp/#motion=e-outback) | Back Out | dom | 500 | easeOutBack | have | `ease:back.out(1.7)` | - |
| [`e-inback`](https://motion-reference.takayustudio.jp/#motion=e-inback) | Back In | dom | 400 | easeInBack | have | `ease:back.in(1.7)` | - |
| [`e-inoutback`](https://motion-reference.takayustudio.jp/#motion=e-inoutback) | Back In-out | dom | 600 | easeInOutBack | have | `ease:back.inOut(1.7)` | - |
| [`e-sine`](https://motion-reference.takayustudio.jp/#motion=e-sine) | Sine In-out | dom | 2000 | easeInOutSine | have | `ease:sine.inOut` | - |
| [`e-circ`](https://motion-reference.takayustudio.jp/#motion=e-circ) | Circ Out | dom | 400 | easeOutCirc | have | `ease:circ.out` | - |
| [`e-elastic`](https://motion-reference.takayustudio.jp/#motion=e-elastic) | Elastic Out | dom | 1000 | elastic.out(1, 0.3) | have | `ease:elastic.out(1, 0.3)` | - |
| [`e-bounce`](https://motion-reference.takayustudio.jp/#motion=e-bounce) | Bounce Out | dom | 800 | bounce.out | have | `ease:bounce.out` | - |
| [`e-steps`](https://motion-reference.takayustudio.jp/#motion=e-steps) | Steps / Posterize | dom | 500 | steps(6) | have | `ease:steps(6)` | - |
| [`e-slowmo`](https://motion-reference.takayustudio.jp/#motion=e-slowmo) | SlowMo | dom | 1200 | SlowMo(0.7, 0.7) | partial | → `ease aliases (eases.js)` | medium |
| [`e-rough`](https://motion-reference.takayustudio.jp/#motion=e-rough) | RoughEase | dom | 1200 | rough({points:20, strength:1}) | generic | `motion/anime` | - |
| [`e-expo-scale`](https://motion-reference.takayustudio.jp/#motion=e-expo-scale) | ExpoScaleEase | dom | 1800 | ExpoScaleEase(1, 8) | partial | → `ease aliases (eases.js)` | high |
| [`e-wiggle`](https://motion-reference.takayustudio.jp/#motion=e-wiggle) | CustomWiggle | dom | 600 | CustomWiggle(6, easeOut) | partial | → `hand/shake` | medium |
| [`e-custombounce`](https://motion-reference.takayustudio.jp/#motion=e-custombounce) | CustomBounce with Squash | dom | 1200 | CustomBounce(strength 0.7) | partial | → `motion/squash-stretch` | medium |

### Springs (`spring`, 16: have 14, skip 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`s-snap`](https://motion-reference.takayustudio.jp/#motion=s-snap) | Snap | dom | 370 | spring(180, 13, 0.6) | have | `ease:springk(300, 21.7)` | - |
| [`s-bounce`](https://motion-reference.takayustudio.jp/#motion=s-bounce) | Bounce | dom | 820 | spring(150, 9, 0.8) | have | `ease:springk(187.5, 11.25)` | - |
| [`s-smooth`](https://motion-reference.takayustudio.jp/#motion=s-smooth) | Smooth | dom | 830 | spring(120, 26, 1) | have | `ease:springk(120, 26)` | - |
| [`s-heavy`](https://motion-reference.takayustudio.jp/#motion=s-heavy) | Heavy | dom | 930 | spring(80, 16, 1.6) | have | `ease:springk(50, 10)` | - |
| [`s-rsdefault`](https://motion-reference.takayustudio.jp/#motion=s-rsdefault) | react-spring default | dom | 510 | spring(170, 26, 1) | have | `ease:spring.default` | - |
| [`s-wobbly`](https://motion-reference.takayustudio.jp/#motion=s-wobbly) | react-spring wobbly | dom | 650 | spring(180, 12, 1) | have | `ease:springk(180, 12)` | - |
| [`s-molasses`](https://motion-reference.takayustudio.jp/#motion=s-molasses) | react-spring molasses | dom | 1940 | spring(280, 120, 1) | have | `ease:springk(280, 120)` | - |
| [`s-framerbouncy`](https://motion-reference.takayustudio.jp/#motion=s-framerbouncy) | Framer Motion bouncy | dom | 550 | spring(400, 17, 1) | have | `ease:springk(400, 17)` | - |
| [`s-modal`](https://motion-reference.takayustudio.jp/#motion=s-modal) | Apple modal | dom | 260 | spring(280, 28, 1) | have | `ease:springk(280, 28)` | - |
| [`s-critical`](https://motion-reference.takayustudio.jp/#motion=s-critical) | Critically damped | dom | 380 | spring(300, 34.64, 1) | have | `ease:springk(300, 34.64)` | - |
| [`s-track`](https://motion-reference.takayustudio.jp/#motion=s-track) | Summed Springs (Retarget) | dom | 600 | spring (summed) | have | `motion/spring-track` | - |
| [`s-split`](https://motion-reference.takayustudio.jp/#motion=s-split) | Split-edge Springs | dom | 400 | spring(320, 30) / spring(140, 22) | have | `motion/spring-track` | - |
| [`s-vs`](https://motion-reference.takayustudio.jp/#motion=s-vs) | Spring vs Tween | dom | 500 | spring / cubic-bezier | skip | lesson; kit rule: springs on objects, no overshoot on text (eases.js header) | - |
| [`s-budget`](https://motion-reference.takayustudio.jp/#motion=s-budget) | Overshoot Budget | dom | 500 | easeOutBack (overshoot 0–20%) | skip | lesson (0 / 3 / 8 / 20 % overshoot); pick a back.out strength or springk damping | - |
| [`s-inertia`](https://motion-reference.takayustudio.jp/#motion=s-inertia) | Inertia / Momentum | dom | 700 | inertia (timeConstant 700ms) | have | `cursor/swipe-rail`, `card/throw-snap` | - |
| [`s-projectile`](https://motion-reference.takayustudio.jp/#motion=s-projectile) | Projectile (Physics2D) | dom | 900 | physics (gravity 500) | have | `motion/physical-exit`, `effect/confetti` | - |

### Timing & Rhythm (`timing`, 15: have 3, generic 4, partial 2, skip 6)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`t-size`](https://motion-reference.takayustudio.jp/#motion=t-size) | Duration by Size | dom | 350 | easeOutCubic | skip | lesson; kit rule: UI feedback 100–200 ms, moves 200–500, hero 600–900 (film.md) | - |
| [`t-distance`](https://motion-reference.takayustudio.jp/#motion=t-distance) | Distance-scaled Duration | dom | 600 | easeInOutCubic | skip | lesson (duration ∝ √distance); not yet in the kit rules: could join recipes.md c | - |
| [`t-exit`](https://motion-reference.takayustudio.jp/#motion=t-exit) | Exit Faster than Enter | dom | 210 | easeInCubic | skip | lesson; kit rule: exits run about 1.5× faster than entrances (recipes.md) | - |
| [`t-stagger-seq`](https://motion-reference.takayustudio.jp/#motion=t-stagger-seq) | Stagger: Sequential | dom | 700 | easeOutCubic | have | `motion/tween`, `text/per-word-rise` | - |
| [`t-stagger-center`](https://motion-reference.takayustudio.jp/#motion=t-stagger-center) | Stagger: From Center | dom | 700 | easeOutCubic | generic | `motion/anime-stagger-grid` | - |
| [`t-stagger-edges`](https://motion-reference.takayustudio.jp/#motion=t-stagger-edges) | Stagger: From Edges | dom | 700 | easeOutCubic | generic | `motion/tween` | - |
| [`t-stagger-random`](https://motion-reference.takayustudio.jp/#motion=t-stagger-random) | Stagger: Random | dom | 600 | easeOutCubic | generic | `motion/anime-stagger-grid` | - |
| [`t-stagger-grid`](https://motion-reference.takayustudio.jp/#motion=t-stagger-grid) | Stagger: Grid Diagonal | dom | 700 | easeOutCubic | generic | `motion/anime-stagger-grid`, `motion/tween` | - |
| [`t-twos`](https://motion-reference.takayustudio.jp/#motion=t-twos) | On Ones / Twos / Threes | dom | 1000 | steps (12fps) | partial | → `motion/tween` | medium |
| [`t-snaphold`](https://motion-reference.takayustudio.jp/#motion=t-snaphold) | Snap, then Hold | dom | 60 | easeOutExpo | have | `ease:expo.out`, `text/land-in` | - |
| [`t-beat`](https://motion-reference.takayustudio.jp/#motion=t-beat) | Beat Grid | dom | 500 | easeOutExpo | have | `background/beat-pulse`, `effect/beat-accent` | - |
| [`t-ramp`](https://motion-reference.takayustudio.jp/#motion=t-ramp) | Speed Ramp into a Hit | dom | 1200 | speed ramp | partial | → `ease aliases (eases.js)` | medium |
| [`t-overlap`](https://motion-reference.takayustudio.jp/#motion=t-overlap) | Overlap Levels | dom | 400 | easeOutCubic | skip | lesson; kit rule: the next starts when the previous is 30–50 % done (film.md) | - |
| [`t-read`](https://motion-reference.takayustudio.jp/#motion=t-read) | Reading Hold | dom | 1000 | hold | skip | lesson; kit rule: 0.5 s + 0.3 s per word, captions ≥0.7 s and ≤17 chars/s (film. | - |
| [`t-energy`](https://motion-reference.takayustudio.jp/#motion=t-energy) | Energy Arc | dom | 4000 | easeInOutCubic | skip | lesson about a film's intensity arc; no motion to port | - |

### Effects & Transitions (`effect`, 12: have 1, partial 10, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`blur-zoom`](https://motion-reference.takayustudio.jp/#motion=blur-zoom) | Blur Zoom | canvas | 720 | easeOutQuart | partial | → `text/soft-blur-in` | medium |
| [`chromatic-split`](https://motion-reference.takayustudio.jp/#motion=chromatic-split) | Chromatic Split | dom | 900 | easeInOutCubic | partial | → `text/rgb-glitch` | medium |
| [`glitch-in`](https://motion-reference.takayustudio.jp/#motion=glitch-in) | Glitch In | canvas | 650 | cubic-bezier(0,0,1,1) | have | `effect/image-glitch-burst`, `text/rgb-glitch` | - |
| [`pixel-dissolve`](https://motion-reference.takayustudio.jp/#motion=pixel-dissolve) | Pixel Dissolve | canvas | 900 | easeOutCubic | partial | → `motion/anime-stagger-grid` | medium |
| [`particle-burst`](https://motion-reference.takayustudio.jp/#motion=particle-burst) | Particle Burst | dom | 820 | easeOutQuart | partial | → `shape/pop` | medium |
| [`ripple-reveal`](https://motion-reference.takayustudio.jp/#motion=ripple-reveal) | Ripple Reveal | canvas | 950 | easeOutCubic | partial | → `transition/iris-reveal` | medium |
| [`slice-reveal`](https://motion-reference.takayustudio.jp/#motion=slice-reveal) | Slice Reveal | canvas | 840 | easeInOutCubic | partial | → `motion/slice-reveal` | medium |
| [`noise-reveal`](https://motion-reference.takayustudio.jp/#motion=noise-reveal) | Noise Resolve | canvas | 1000 | easeOutSine | partial | → `effect/film-grain` | medium |
| [`liquid-morph`](https://motion-reference.takayustudio.jp/#motion=liquid-morph) | Liquid Morph | canvas | 1100 | easeInOutCubic | partial | → `shape/blob` | medium |
| [`ink-reveal`](https://motion-reference.takayustudio.jp/#motion=ink-reveal) | Ink Reveal | canvas | 980 | easeOutCubic | partial | → `hand/watercolor` | medium |
| [`mosaic-flip`](https://motion-reference.takayustudio.jp/#motion=mosaic-flip) | Mosaic Flip | canvas | 1150 | easeInOutCubic | partial | → `title/wordmark-tiles` | medium |
| [`displacement-wave`](https://motion-reference.takayustudio.jp/#motion=displacement-wave) | Displacement Wave | canvas | 1000 | easeInOutSine | missing | → `effect/displace-wave` | low |

### SVG & Path (`svg-path`, 12: have 7, partial 3, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`svg-stroke-draw`](https://motion-reference.takayustudio.jp/#motion=svg-stroke-draw) | SVG Stroke Draw | dom | 1100 | easeOutCubic | have | `line/anime-draw`, `logo/svg-reveal`, `line/stroke-trace` | - |
| [`svg-path-morph`](https://motion-reference.takayustudio.jp/#motion=svg-path-morph) | SVG Path Morph | dom | 1000 | easeInOutCubic | have | `shape/anime-morph` | - |
| [`svg-trim-path`](https://motion-reference.takayustudio.jp/#motion=svg-trim-path) | SVG Segment Trim | dom | 900 | easeInOutCubic | have | `line/anime-draw` | - |
| [`svg-motion-path`](https://motion-reference.takayustudio.jp/#motion=svg-motion-path) | SVG Motion Path | dom | 1200 | easeInOutCubic | have | `motion/anime-path`, `motion/path-traveler` | - |
| [`svg-mask-reveal`](https://motion-reference.takayustudio.jp/#motion=svg-mask-reveal) | SVG Mask Reveal | canvas | 980 | easeOutCubic | partial | → `transition/iris-reveal` | medium |
| [`svg-gradient-flow`](https://motion-reference.takayustudio.jp/#motion=svg-gradient-flow) | SVG Gradient Flow | canvas | 1300 | linear | have | `line/anime-draw`, `ui/tracing-beam`, `line/flow-connector` | - |
| [`svg-gooey-merge`](https://motion-reference.takayustudio.jp/#motion=svg-gooey-merge) | Gooey Merge | canvas | 1050 | easeInOutCubic | partial | → `effect/gooey-split` | medium |
| [`svg-signature`](https://motion-reference.takayustudio.jp/#motion=svg-signature) | Signature Stroke | canvas | 1500 | easeInOutCubic | have | `line/anime-draw`, `hand/write-title` | - |
| [`sh-repeater`](https://motion-reference.takayustudio.jp/#motion=sh-repeater) | Radial Repeater | dom | 1500 | easeInOutSine | missing | → `shape/repeater` | medium |
| [`sh-blob`](https://motion-reference.takayustudio.jp/#motion=sh-blob) | Noise Blob | dom | 4000 | noise | partial | → `shape/blob` | medium |
| [`sh-burst`](https://motion-reference.takayustudio.jp/#motion=sh-burst) | Radiating Burst Lines | dom | 400 | easeOutCubic | missing | → `shape/burst-lines` | high |
| [`sh-march`](https://motion-reference.takayustudio.jp/#motion=sh-march) | Marching Dashes | dom | 1000 | linear | have | `line/flow-connector` | - |

### Data Storytelling (`data-story`, 23: have 6, partial 14, missing 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-data-story-sankey-flow`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-sankey-flow) | Sankey Flow Reveal | canvas | 4200 | linear | missing | → `data/sankey` | medium |
| [`catalog-data-story-odometer-cascade`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-odometer-cascade) | Metric Odometer Cascade | canvas | 4200 | linear | partial | → `text/slot-roll` | high |
| [`catalog-data-story-threshold-wave`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-threshold-wave) | Threshold Alarm Wave | canvas | 4200 | linear | partial | → `data/chart-story` | medium |
| [`catalog-data-story-confidence-fog`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-confidence-fog) | Forecast Confidence Fog | canvas | 4200 | linear | partial | → `data/chart-story` | medium |
| [`catalog-data-story-signal-pulse-map`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-signal-pulse-map) | Live Signal Pulse Map | canvas | 4200 | linear | partial | → `map/pin-route` | medium |
| [`catalog-data-story-delta-split`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-delta-split) | Comparison Delta Split | canvas | 4200 | linear | partial | → `data/chart-story` | high |
| [`catalog-data-story-timeline-trail`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-timeline-trail) | Timeline Scrub Trail | canvas | 4200 | linear | partial | → `data/function-plot` | medium |
| [`catalog-data-story-topology-bloom`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-topology-bloom) | Network Topology Bloom | canvas | 4200 | linear | have | `data/constellation-hub` | - |
| [`catalog-data-story-milestone-firefly`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-milestone-firefly) | Progress Milestone Firefly | canvas | 4200 | linear | partial | → `data/chart-story` | medium |
| [`catalog-data-story-heatmap-ripple`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-heatmap-ripple) | Heatmap Ripple Focus | canvas | 4200 | linear | partial | → `data/heatmap` | medium |
| [`catalog-data-story-stream-breathe`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-stream-breathe) | Stream Graph Breathing | canvas | 4200 | linear | missing | → `data/stream-graph` | low |
| [`catalog-data-story-rank-ladder`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-rank-ladder) | Rank Ladder Climb | canvas | 4200 | linear | partial | → `motion/anime-layout` | medium |
| [`catalog-data-story-cluster-merge`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-cluster-merge) | Data Cluster Merge | canvas | 4200 | linear | missing | → `data/dot-merge` | low |
| [`catalog-data-story-event-domino`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-event-domino) | Event Sequence Domino | canvas | 4200 | linear | partial | → `flow/step-domino` | medium |
| [`catalog-data-story-kpi-relay`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-kpi-relay) | KPI Spotlight Relay | canvas | 4200 | linear | partial | → `effect/spotlight-relay` | medium |
| [`catalog-data-story-budget-bloom`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-budget-bloom) | Radial Budget Bloom | canvas | 4200 | linear | have | `data/chart-story`, `data/conic-progress-ring` | - |
| [`catalog-data-story-calendar-density`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-calendar-density) | Calendar Density Sweep | canvas | 4200 | linear | partial | → `data/calendar-heatmap` | low |
| [`catalog-data-story-queue-compress`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-queue-compress) | Live Queue Compression | canvas | 4200 | linear | have | `motion/anime-layout`, `ui/notification-stack` | - |
| [`catalog-data-story-sentiment-spectrum`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-sentiment-spectrum) | Sentiment Spectrum Shift | canvas | 4200 | linear | have | `motion/spring-track`, `data/count-up` | - |
| [`catalog-data-story-goal-projection`](https://motion-reference.takayustudio.jp/#motion=catalog-data-story-goal-projection) | Goal Projection Arc | canvas | 4200 | linear | partial | → `data/chart-story` | medium |
| [`dv-stat`](https://motion-reference.takayustudio.jp/#motion=dv-stat) | Stat Card | dom | 900 | easeOutExpo | have | `data/mk-progress-stat`, `data/count-up`, `data/count-up-hf` | - |
| [`dv-pins`](https://motion-reference.takayustudio.jp/#motion=dv-pins) | Map Pins Drop | dom | 400 | easeOutBounce | have | `map/pin-route` | - |
| [`dv-scatter`](https://motion-reference.takayustudio.jp/#motion=dv-scatter) | Scatter Reveal | dom | 600 | easeOutCubic | partial | → `data/chart-story` | medium |

### Transitions (`transitions`, 25: have 8, partial 16, skip 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tr-cut`](https://motion-reference.takayustudio.jp/#motion=tr-cut) | Hard Cut | dom | 40 | none (cut) | have | `engine:scene cut (no transition_in)` | - |
| [`tr-dissolve`](https://motion-reference.takayustudio.jp/#motion=tr-dissolve) | Crossfade / Dissolve | dom | 500 | linear | partial | → `transition/crossfade` | high |
| [`tr-blur`](https://motion-reference.takayustudio.jp/#motion=tr-blur) | Blur Crossfade | dom | 600 | easeInOutSine | partial | → `transition/crossfade` | high |
| [`tr-push`](https://motion-reference.takayustudio.jp/#motion=tr-push) | Push / Slide | dom | 400 | easeInOutCubic | have | `transition/push` | - |
| [`tr-whip`](https://motion-reference.takayustudio.jp/#motion=tr-whip) | Whip Pan | dom | 250 | cubic-bezier(.9,0,.1,1) | have | `transition/whip-pan-cut` | - |
| [`tr-wipe`](https://motion-reference.takayustudio.jp/#motion=tr-wipe) | Linear Wipe | dom | 500 | easeInOutCubic | partial | → `transition/directional-wipe` | high |
| [`tr-inset`](https://motion-reference.takayustudio.jp/#motion=tr-inset) | Inset (clip-path) | dom | 500 | easeInOutCubic | partial | → `transition/iris-reveal` | high |
| [`tr-clock`](https://motion-reference.takayustudio.jp/#motion=tr-clock) | Clock Wipe | dom | 700 | easeInOutSine | partial | → `transition/iris-reveal` | medium |
| [`tr-iris`](https://motion-reference.takayustudio.jp/#motion=tr-iris) | Iris | dom | 600 | easeInCubic | have | `transition/iris-reveal` | - |
| [`tr-shapeiris`](https://motion-reference.takayustudio.jp/#motion=tr-shapeiris) | Shaped Iris | dom | 700 | easeInCubic | partial | → `transition/iris-reveal` | medium |
| [`tr-flood`](https://motion-reference.takayustudio.jp/#motion=tr-flood) | Colour Flood | dom | 800 | easeInOutCubic | partial | → `transition/iris-reveal` | high |
| [`tr-zoomthrough`](https://motion-reference.takayustudio.jp/#motion=tr-zoomthrough) | Scale-through / Zoom Through | dom | 600 | easeInOutCubic | partial | → `transition/zoom-through-transition` | high |
| [`tr-blinds`](https://motion-reference.takayustudio.jp/#motion=tr-blinds) | Slats / Blinds | dom | 700 | easeOutCubic | partial | → `transition/blinds` | high |
| [`tr-blocks`](https://motion-reference.takayustudio.jp/#motion=tr-blocks) | Staggered Blocks | dom | 800 | easeInOutCubic | partial | → `transition/blocks` | high |
| [`tr-pixel`](https://motion-reference.takayustudio.jp/#motion=tr-pixel) | Pixel Dissolve | dom | 600 | linear (per-cell threshold) | partial | → `transition/pixel-dissolve` | medium |
| [`tr-morph`](https://motion-reference.takayustudio.jp/#motion=tr-morph) | Shape-morph Bridge | dom | 700 | easeInOutCubic | have | `transition/morph-swap`, `shape/anime-morph` | - |
| [`tr-match`](https://motion-reference.takayustudio.jp/#motion=tr-match) | Match Cut | dom | 40 | none (cut) | have | `transition/match-cut`, `transition/text-match-cut`, `transition/type-match-cut` | - |
| [`tr-glitch`](https://motion-reference.takayustudio.jp/#motion=tr-glitch) | Glitch | dom | 200 | steps | have | `effect/image-glitch-burst`, `text/rgb-glitch` | - |
| [`tr-leak`](https://motion-reference.takayustudio.jp/#motion=tr-leak) | Light Leak | dom | 800 | easeInOutSine | have | `effect/light-leak-overlay` | - |
| [`tr-flip`](https://motion-reference.takayustudio.jp/#motion=tr-flip) | 3D Card Flip | dom | 600 | easeInOutCubic | partial | → `transition/card-flip` | high |
| [`tr-brush`](https://motion-reference.takayustudio.jp/#motion=tr-brush) | Brush Wipe | dom | 600 | easeOutCubic | partial | → `transition/brush-wipe` | medium |
| [`tr-letter`](https://motion-reference.takayustudio.jp/#motion=tr-letter) | Mask Wipe through Letterforms | dom | 900 | easeInExpo | partial | → `transition/letter-zoom` | high |
| [`tr-drop`](https://motion-reference.takayustudio.jp/#motion=tr-drop) | Gravity Drop | dom | 700 | easeInQuad | partial | → `transition/gravity-drop` | medium |
| [`tr-streak`](https://motion-reference.takayustudio.jp/#motion=tr-streak) | Light-streak Whip | dom | 350 | power3.in | partial | → `transition/whip-pan-cut` | low |
| [`tr-jcut`](https://motion-reference.takayustudio.jp/#motion=tr-jcut) | J-cut / L-cut | dom | 400 | offset (audio) | skip | audio-only edit; voice and audio clips already start at any film time, so J / L  | - |

### Camera (`camera`, 18: have 8, generic 1, partial 9)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`cam-pushin`](https://motion-reference.takayustudio.jp/#motion=cam-pushin) | Push In / Dolly In | dom | 1600 | easeInOutCubic | partial | → `motion/camera` | high |
| [`cam-pullout`](https://motion-reference.takayustudio.jp/#motion=cam-pullout) | Pull Out | dom | 1600 | easeInOutCubic | partial | → `motion/camera` | high |
| [`cam-truck`](https://motion-reference.takayustudio.jp/#motion=cam-truck) | Truck | dom | 2000 | easeInOutSine | partial | → `motion/camera` | high |
| [`cam-pan`](https://motion-reference.takayustudio.jp/#motion=cam-pan) | Pan | dom | 2000 | easeInOutSine | generic | `motion/tween` | - |
| [`cam-pedestal`](https://motion-reference.takayustudio.jp/#motion=cam-pedestal) | Pedestal | dom | 2000 | easeInOutSine | partial | → `motion/camera` | high |
| [`cam-roll`](https://motion-reference.takayustudio.jp/#motion=cam-roll) | Roll | dom | 300 | easeOutCubic | have | `engine:film.json groove`, `motion/tween` | - |
| [`cam-zoomvsdolly`](https://motion-reference.takayustudio.jp/#motion=cam-zoomvsdolly) | Zoom (flat) | dom | 1600 | easeInOutCubic | have | `motion/tween`, `house/zoom-in-shape` | - |
| [`cam-vertigo`](https://motion-reference.takayustudio.jp/#motion=cam-vertigo) | Dolly Zoom (Vertigo) | dom | 2000 | easeInOutCubic | partial | → `motion/camera` | medium |
| [`cam-crane`](https://motion-reference.takayustudio.jp/#motion=cam-crane) | Crane / Jib | dom | 2000 | easeInOutCubic | partial | → `motion/camera` | medium |
| [`cam-whip`](https://motion-reference.takayustudio.jp/#motion=cam-whip) | Whip | dom | 450 | cubic-bezier(.9,0,.1,1) | partial | → `motion/camera` | medium |
| [`cam-orbit`](https://motion-reference.takayustudio.jp/#motion=cam-orbit) | Orbit / Turntable | dom | 4000 | linear | have | `carousel/circle-1`, `carousel/orbit-1`, `effect/nucleus-orbit` | - |
| [`cam-rack`](https://motion-reference.takayustudio.jp/#motion=cam-rack) | Rack Focus | dom | 650 | easeInOutCubic | have | `camera/focus-rack`, `camera/rack-focus` | - |
| [`cam-handheld`](https://motion-reference.takayustudio.jp/#motion=cam-handheld) | Handheld Drift | dom | 3000 | sum of sines | have | `engine:film.json groove`, `camera/camera-shake`, `motion/float-list` | - |
| [`cam-shake`](https://motion-reference.takayustudio.jp/#motion=cam-shake) | Screen Shake on Hit | dom | 450 | exp(−9t) decay | have | `hand/shake`, `motion/chaos-shake` | - |
| [`cam-punch`](https://motion-reference.takayustudio.jp/#motion=cam-punch) | Punch-in on the Beat | dom | 300 | exp decay (τ 0.11s) | have | `engine:film.json groove`, `camera/punch-in` | - |
| [`cam-kenburns`](https://motion-reference.takayustudio.jp/#motion=cam-kenburns) | Ken Burns | dom | 4000 | linear | have | `motion/ken-burns` | - |
| [`cam-parallax`](https://motion-reference.takayustudio.jp/#motion=cam-parallax) | Parallax Layers | dom | 4000 | linear | partial | → `motion/camera` | high |
| [`cam-follow`](https://motion-reference.takayustudio.jp/#motion=cam-follow) | Follow with Lookahead | dom | 600 | spring (lookahead) | partial | → `motion/camera` | low |

### Particles (`particles`, 8: have 3, partial 3, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`pt-confetti`](https://motion-reference.takayustudio.jp/#motion=pt-confetti) | Confetti | dom | 2000 | physics (gravity) | partial | → `effect/confetti` | medium |
| [`pt-twinkle`](https://motion-reference.takayustudio.jp/#motion=pt-twinkle) | Twinkle Sparkles | dom | 600 | easeInOutSine | have | `house/twinkle`, `background/starfield`, `shape/pixel-sticker` | - |
| [`pt-embers`](https://motion-reference.takayustudio.jp/#motion=pt-embers) | Rising Embers | dom | 3000 | linear + noise | partial | → `background/embers` | medium |
| [`pt-snow`](https://motion-reference.takayustudio.jp/#motion=pt-snow) | Snow | dom | 4000 | linear + sine sway | have | `background/snow` | - |
| [`pt-fireworks`](https://motion-reference.takayustudio.jp/#motion=pt-fireworks) | Fireworks with Trails | dom | 1500 | easeOutCubic + gravity | missing | → `effect/fireworks` | medium |
| [`pt-swarm`](https://motion-reference.takayustudio.jp/#motion=pt-swarm) | Swarm | dom | 6000 | noise | missing | → `background/swarm` | low |
| [`pt-flow`](https://motion-reference.takayustudio.jp/#motion=pt-flow) | Flow Field | dom | 4000 | linear (field) | have | `background/noise-flow` | - |
| [`pt-coalesce`](https://motion-reference.takayustudio.jp/#motion=pt-coalesce) | Particles Coalesce | dom | 1200 | spring | partial | → `text/particle-dissolve` | high |

### Loops & Ambient (`loops`, 7: have 6, partial 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`lp-seamless`](https://motion-reference.takayustudio.jp/#motion=lp-seamless) | Seamless Loop | dom | 2000 | linear / periodic | have | `background/noise-flow`, `background/aurora-drift`, `rule:film.md Loops` | - |
| [`lp-float`](https://motion-reference.takayustudio.jp/#motion=lp-float) | Float | dom | 3000 | easeInOutSine | have | `house/bob`, `motion/float-list`, `house/deco-float` | - |
| [`lp-marquee`](https://motion-reference.takayustudio.jp/#motion=lp-marquee) | Marquee | dom | 3000 | linear | have | `lower/news-ticker`, `title/perspective-marquee`, `house/gallery-strip` | - |
| [`lp-conic`](https://motion-reference.takayustudio.jp/#motion=lp-conic) | Rotating Gradient Ring | dom | 2000 | linear | partial | → `line/outline-draw` | medium |
| [`lp-wobble`](https://motion-reference.takayustudio.jp/#motion=lp-wobble) | Noise Wobble | dom | 4000 | noise | have | `house/deco-float`, `motion/float-list`, `hand/boil` | - |
| [`lp-boil`](https://motion-reference.takayustudio.jp/#motion=lp-boil) | Line Boil | dom | 167 | steps (12fps) | have | `hand/boil` | - |
| [`lp-holdcycle`](https://motion-reference.takayustudio.jp/#motion=lp-holdcycle) | Hold & Cycle | dom | 1000 | easeInOutSine | have | `house/breathe`, `camera/drift-hold`, `engine:film.json groove` | - |

### Character (`character`, 7: have 4, partial 2, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`ch-walk`](https://motion-reference.takayustudio.jp/#motion=ch-walk) | Walk Cycle | dom | 1000 | easeInOutSine | have | `rig:AIMK_RIG.anim.walk`, `character/sheet`, `motion/character-walk` | - |
| [`ch-jump`](https://motion-reference.takayustudio.jp/#motion=ch-jump) | Jump | dom | 1000 | easeOutQuad / easeInQuad | partial | → `engine / rig: rig AIMK_RIG.anim + jump(id, t, height)` | medium |
| [`ch-blink`](https://motion-reference.takayustudio.jp/#motion=ch-blink) | Blink | dom | 250 | easeInQuad / easeOutQuad | have | `rig:AIMK_RIG.anim.blink`, `rig:AIMK_RIG.anim.blinks` | - |
| [`ch-take`](https://motion-reference.takayustudio.jp/#motion=ch-take) | Take | dom | 600 | easeOutBack | have | `rig:AIMK_RIG.anim.squash`, `hand/hit-stop`, `motion/spring-pop` | - |
| [`ch-turn`](https://motion-reference.takayustudio.jp/#motion=ch-turn) | Head Turn | dom | 600 | easeInOutCubic | partial | → `engine / rig: rig AIMK_RIG.anim + look(who, t, dir): eyes -> head -> body ` | medium |
| [`ch-idle`](https://motion-reference.takayustudio.jp/#motion=ch-idle) | Idle Breathing | dom | 3000 | easeInOutSine | have | `house/breathe`, `house/hop` | - |
| [`ch-tail`](https://motion-reference.takayustudio.jp/#motion=ch-tail) | Tail Follow-through | dom | 800 | spring (per joint) | missing | → `motion/follow-chain` | medium |

### Texture & Look (`look`, 10: have 6, partial 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`lk-grain`](https://motion-reference.takayustudio.jp/#motion=lk-grain) | Film Grain | dom | 42 | random per frame | have | `effect/film-grain`, `effect/grain-overlay` | - |
| [`lk-mblur`](https://motion-reference.takayustudio.jp/#motion=lk-mblur) | Subframe Motion Blur | dom | 400 | easeInOutCubic | have | `engine:kit.py mp4 --blur`, `engine:kit.py mov` | - |
| [`lk-riso`](https://motion-reference.takayustudio.jp/#motion=lk-riso) | Misregistration | dom | 125 | steps(3) | partial | → `text/rgb-glitch` | medium |
| [`lk-halftone`](https://motion-reference.takayustudio.jp/#motion=lk-halftone) | Halftone | dom | 1500 | easeInOutSine | have | `background/halftone-field`, `transition/halftone-dissolve` | - |
| [`lk-watercolor`](https://motion-reference.takayustudio.jp/#motion=lk-watercolor) | Watercolor Wash | dom | 2000 | easeOutCubic | have | `hand/watercolor` | - |
| [`lk-handwrite`](https://motion-reference.takayustudio.jp/#motion=lk-handwrite) | Brush Write-on | dom | 1500 | easeInOutSine | have | `line/anime-draw`, `hand/write-title`, `hand/pencil-draw` | - |
| [`lk-papercut`](https://motion-reference.takayustudio.jp/#motion=lk-papercut) | Paper Cut / Stop-motion | dom | 400 | back.out(2.2) | have | `motion/stop-motion`, `hand/boil`, `text/land-in` | - |
| [`lk-pixel`](https://motion-reference.takayustudio.jp/#motion=lk-pixel) | Pixelate | dom | 600 | steps | partial | → `effect/pixelate` | medium |
| [`lk-vignette`](https://motion-reference.takayustudio.jp/#motion=lk-vignette) | Vignette Breathe | dom | 3000 | easeInOutSine | partial | → `effect/vignette` | low |
| [`lk-crt`](https://motion-reference.takayustudio.jp/#motion=lk-crt) | CRT Scanlines | dom | 3000 | linear | partial | → `effect/screen-warp` | medium |

### 3D (`depth3d`, 3: have 1, partial 1, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`3d-cube`](https://motion-reference.takayustudio.jp/#motion=3d-cube) | Cube Rotation | dom | 4000 | linear | missing | → `card/cube` | medium |
| [`3d-coverflow`](https://motion-reference.takayustudio.jp/#motion=3d-coverflow) | Cover Flow | dom | 500 | spring | partial | → `motion/slot-swipe` | medium |
| [`3d-depth`](https://motion-reference.takayustudio.jp/#motion=3d-depth) | Depth Stack | dom | 4000 | linear | have | `card/card-flyby`, `background/gallery-tunnel` | - |

### Sound Sync (`sound`, 4: have 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`sd-cues`](https://motion-reference.takayustudio.jp/#motion=sd-cues) | SFX Cues on the Grid | dom | 120 | easeOutExpo | have | `engine:film.json sfx`, `engine:ctx.sfx` | - |
| [`sd-bars`](https://motion-reference.takayustudio.jp/#motion=sd-bars) | Audio Bars | dom | 100 | easeOutQuad | have | `data/audiogram` | - |
| [`sd-duck`](https://motion-reference.takayustudio.jp/#motion=sd-duck) | Sidechain Duck | dom | 100 | attack 3f / release 24–36f | have | `engine:film.json groove`, `background/beat-pulse` | - |
| [`sd-lyric`](https://motion-reference.takayustudio.jp/#motion=sd-lyric) | Word-locked Sync | dom | 250 | easeOutBack | have | `text/lyric-line`, `text/captions` | - |

### Web Scroll (`web-scroll`, 12: have 7, generic 1, partial 3, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`scroll-reveal`](https://motion-reference.takayustudio.jp/#motion=scroll-reveal) | Scroll Reveal | canvas | 900 | easeOutCubic | have | `camera/scroll-story` | - |
| [`parallax-layers`](https://motion-reference.takayustudio.jp/#motion=parallax-layers) | Parallax Layers | dom | 1200 | linear | have | `camera/scroll-story` | - |
| [`sticky-pin`](https://motion-reference.takayustudio.jp/#motion=sticky-pin) | Sticky Pin | dom | 1100 | linear | have | `ui/sticky-mock-swap` | - |
| [`scroll-progress`](https://motion-reference.takayustudio.jp/#motion=scroll-progress) | Scroll Progress | dom | 1000 | linear | have | `line/draw`, `data/chart-story` | - |
| [`horizontal-scrub`](https://motion-reference.takayustudio.jp/#motion=horizontal-scrub) | Horizontal Scrub | canvas | 1200 | linear | have | `motion/tween`, `camera/pan-stations` | - |
| [`section-snap`](https://motion-reference.takayustudio.jp/#motion=section-snap) | Section Snap | canvas | 850 | easeOutQuart | partial | → `cursor/swipe-rail` | medium |
| [`text-scroll-scrub`](https://motion-reference.takayustudio.jp/#motion=text-scroll-scrub) | Text Scroll Resolve | dom | 1000 | linear | have | `text/per-word-rise`, `text/blur-in` | - |
| [`scroll-depth-zoom`](https://motion-reference.takayustudio.jp/#motion=scroll-depth-zoom) | Scroll Depth Zoom | canvas | 1200 | easeInOutCubic | generic | `motion/tween` | - |
| [`pinned-story-steps`](https://motion-reference.takayustudio.jp/#motion=pinned-story-steps) | Pinned Story Steps | canvas | 1400 | easeInOutCubic | have | `ui/sticky-mock-swap` | - |
| [`scroll-marquee`](https://motion-reference.takayustudio.jp/#motion=scroll-marquee) | Scroll Marquee | canvas | 1250 | linear | partial | → `title/perspective-marquee` | medium |
| [`image-clip-scrub`](https://motion-reference.takayustudio.jp/#motion=image-clip-scrub) | Image Clip Scrub | canvas | 1200 | easeInOutCubic | missing | → `motion/clip-open` | high |
| [`velocity-skew`](https://motion-reference.takayustudio.jp/#motion=velocity-skew) | Scroll Velocity Skew | canvas | 900 | easeOutCubic | partial | → `ui/scroll-feed` | low |

### Web Interaction (`web-interaction`, 15: have 7, partial 8)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`hover-lift`](https://motion-reference.takayustudio.jp/#motion=hover-lift) | Hover Lift | dom | 1600 | easeOutCubic | have | `motion/tween`, `cursor/oversized` | - |
| [`magnetic-button`](https://motion-reference.takayustudio.jp/#motion=magnetic-button) | Magnetic Button | canvas | 1800 | easeOutCubic | partial | → `cursor/magnetic` | medium |
| [`pointer-tilt`](https://motion-reference.takayustudio.jp/#motion=pointer-tilt) | Pointer Tilt | dom | 1800 | easeOutCubic | have | `card/tilt-card`, `motion/spring-track` | - |
| [`cursor-follow`](https://motion-reference.takayustudio.jp/#motion=cursor-follow) | Cursor Follow | canvas | 850 | easeOutCubic | partial | → `motion/echo-trail` | medium |
| [`drag-inertia`](https://motion-reference.takayustudio.jp/#motion=drag-inertia) | Drag Inertia | canvas | 1000 | easeOutQuart | partial | → `motion/drag-release` | medium |
| [`click-ripple`](https://motion-reference.takayustudio.jp/#motion=click-ripple) | Click Ripple | dom | 650 | easeOutCubic | partial | → `ui/ink-ripple` | medium |
| [`toggle-morph`](https://motion-reference.takayustudio.jp/#motion=toggle-morph) | Toggle Morph | canvas | 480 | easeOutBack | have | `flow/toggle-flip`, `ui/toggle-switch` | - |
| [`accordion-open`](https://motion-reference.takayustudio.jp/#motion=accordion-open) | Accordion Open | dom | 1600 | easeInOutCubic | have | `ui/panel-reveal`, `motion/anime-layout` | - |
| [`button-fill-hover`](https://motion-reference.takayustudio.jp/#motion=button-fill-hover) | Button Fill Hover | canvas | 1400 | easeOutCubic | partial | → `ui/ink-ripple` | medium |
| [`icon-morph`](https://motion-reference.takayustudio.jp/#motion=icon-morph) | Icon Morph | canvas | 560 | easeInOutCubic | have | `flow/menu-morph` | - |
| [`card-spotlight`](https://motion-reference.takayustudio.jp/#motion=card-spotlight) | Card Spotlight | canvas | 1800 | easeInOutSine | partial | → `card/spotlight-card` | medium |
| [`drag-snap`](https://motion-reference.takayustudio.jp/#motion=drag-snap) | Drag Snap | dom | 820 | easeOutBack | have | `motion/drag-release`, `cursor/drag-drop` | - |
| [`ui-fan`](https://motion-reference.takayustudio.jp/#motion=ui-fan) | Card Stack Fan | dom | 600 | spring | partial | → `card/fan` | medium |
| [`ui-tooltip`](https://motion-reference.takayustudio.jp/#motion=ui-tooltip) | Tooltip | dom | 200 | easeOutCubic | have | `motion/tween`, `ui/micro-transitions` | - |
| [`ui-cursorarc`](https://motion-reference.takayustudio.jp/#motion=ui-cursorarc) | Human Cursor Path | dom | 900 | easeInOutCubic | partial | → `ui/cursor-path` | medium |

### Layout & Navigation (`web-layout`, 19: have 14, generic 2, partial 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`shared-element`](https://motion-reference.takayustudio.jp/#motion=shared-element) | Shared Element | dom | 850 | easeInOutCubic | have | `flow/modal-morph`, `motion/anime-layout` | - |
| [`view-crossfade`](https://motion-reference.takayustudio.jp/#motion=view-crossfade) | View Crossfade | canvas | 520 | easeInOutCubic | partial | → `transition/crossfade` | high |
| [`flip-reorder`](https://motion-reference.takayustudio.jp/#motion=flip-reorder) | FLIP Reorder | dom | 760 | easeInOutCubic | generic | `motion/anime-layout` | - |
| [`modal-morph`](https://motion-reference.takayustudio.jp/#motion=modal-morph) | Modal Morph | canvas | 700 | easeInOutCubic | have | `flow/modal-morph` | - |
| [`tab-indicator`](https://motion-reference.takayustudio.jp/#motion=tab-indicator) | Tab Indicator | canvas | 520 | easeOutCubic | have | `motion/spring-track`, `flow/tabs-slide-indicator` | - |
| [`filter-reflow`](https://motion-reference.takayustudio.jp/#motion=filter-reflow) | Filter Reflow | canvas | 820 | easeInOutCubic | generic | `motion/anime-layout` | - |
| [`route-slide`](https://motion-reference.takayustudio.jp/#motion=route-slide) | Route Slide | canvas | 600 | easeInOutCubic | have | `transition/push` | - |
| [`page-wipe`](https://motion-reference.takayustudio.jp/#motion=page-wipe) | Page Wipe | canvas | 780 | easeInOutQuint | partial | → `transition/cover-wipe` | high |
| [`sidebar-reveal`](https://motion-reference.takayustudio.jp/#motion=sidebar-reveal) | Sidebar Reveal | canvas | 650 | easeOutCubic | have | `motion/slide-in`, `motion/tween` | - |
| [`command-palette-open`](https://motion-reference.takayustudio.jp/#motion=command-palette-open) | Command Palette Open | dom | 520 | easeOutCubic | have | `ui/panel-reveal`, `text/bullets` | - |
| [`dropdown-origin`](https://motion-reference.takayustudio.jp/#motion=dropdown-origin) | Dropdown Origin Reveal | canvas | 480 | easeOutCubic | have | `cursor/context-menu`, `ui/micro-transitions` | - |
| [`detail-expand`](https://motion-reference.takayustudio.jp/#motion=detail-expand) | List-to-Detail Expand | canvas | 820 | easeInOutCubic | have | `flow/modal-morph`, `ui/card-resize` | - |
| [`popover-transition`](https://motion-reference.takayustudio.jp/#motion=popover-transition) | Popover Enter and Exit | canvas | 520 | easeOutCubic | have | `motion/tween`, `ui/micro-transitions` | - |
| [`dialog-top-layer`](https://motion-reference.takayustudio.jp/#motion=dialog-top-layer) | Top Layer Dialog | canvas | 620 | easeOutCubic | have | `ui/micro-transitions`, `motion/tween` | - |
| [`view-transition-circle`](https://motion-reference.takayustudio.jp/#motion=view-transition-circle) | Circular View Transition | canvas | 760 | easeInOutCubic | have | `transition/iris-reveal` | - |
| [`discrete-exit`](https://motion-reference.takayustudio.jp/#motion=discrete-exit) | Discrete Property Exit | canvas | 480 | easeInCubic | have | `motion/tween`, `house/pop-out` | - |
| [`auto-height-expand`](https://motion-reference.takayustudio.jp/#motion=auto-height-expand) | Intrinsic Height Expand | canvas | 650 | easeOutCubic | have | `ui/panel-reveal`, `motion/anime-layout` | - |
| [`page-transition-stack`](https://motion-reference.takayustudio.jp/#motion=page-transition-stack) | Page Stack Transition | canvas | 720 | easeInOutCubic | partial | → `transition/push` | high |
| [`ui-modal`](https://motion-reference.takayustudio.jp/#motion=ui-modal) | Modal Enter / Exit | dom | 400 | spring(280, 28) / easeInQuart | have | `motion/spring-track`, `ui/micro-transitions` | - |

### Loading & Data (`web-feedback`, 12: have 10, generic 1, partial 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`skeleton-shimmer`](https://motion-reference.takayustudio.jp/#motion=skeleton-shimmer) | Skeleton Shimmer | dom | 1200 | linear | partial | → `ui/skeleton-reveal` | medium |
| [`spinner-arc`](https://motion-reference.takayustudio.jp/#motion=spinner-arc) | Spinner Arc | dom | 900 | linear | generic | `motion/tween` | - |
| [`progress-fill`](https://motion-reference.takayustudio.jp/#motion=progress-fill) | Progress Fill | dom | 1300 | easeInOutCubic | have | `data/chart-story`, `data/mk-progress-stat` | - |
| [`circular-progress`](https://motion-reference.takayustudio.jp/#motion=circular-progress) | Circular Progress | dom | 1400 | easeInOutCubic | have | `data/conic-progress-ring`, `data/mk-usage-arc` | - |
| [`loading-dots`](https://motion-reference.takayustudio.jp/#motion=loading-dots) | Loading Dots | dom | 900 | easeInOutSine | have | `ui/typing-indicator` | - |
| [`count-up`](https://motion-reference.takayustudio.jp/#motion=count-up) | Count Up | dom | 1000 | easeOutCubic | have | `data/count-up` | - |
| [`chart-draw`](https://motion-reference.takayustudio.jp/#motion=chart-draw) | Chart Draw | dom | 1200 | easeOutCubic | have | `line/anime-draw`, `data/chart-story` | - |
| [`toast-stack`](https://motion-reference.takayustudio.jp/#motion=toast-stack) | Toast Stack | canvas | 900 | easeOutCubic | have | `ui/notification-cascade`, `ui/notification-stack` | - |
| [`success-check`](https://motion-reference.takayustudio.jp/#motion=success-check) | Success Check Draw | canvas | 760 | easeOutCubic | have | `ui/success-check` | - |
| [`bar-chart-stagger`](https://motion-reference.takayustudio.jp/#motion=bar-chart-stagger) | Staggered Bar Chart | dom | 1100 | easeOutCubic | have | `data/chart-story`, `data/animated-bar-chart` | - |
| [`donut-segments`](https://motion-reference.takayustudio.jp/#motion=donut-segments) | Donut Segment Draw | dom | 1200 | easeInOutCubic | have | `data/chart-story` | - |
| [`optimistic-update`](https://motion-reference.takayustudio.jp/#motion=optimistic-update) | Optimistic Update | canvas | 900 | easeOutCubic | have | `text/state-swap` | - |

### Forms & State (`form-state`, 8: have 6, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`floating-label`](https://motion-reference.takayustudio.jp/#motion=floating-label) | Floating Label | canvas | 520 | easeOutCubic | partial | → `flow/input-feedback` | medium |
| [`checkbox-stroke`](https://motion-reference.takayustudio.jp/#motion=checkbox-stroke) | Checkbox Stroke | dom | 480 | easeOutCubic | have | `line/anime-draw`, `motion/tween` | - |
| [`switch-state-spring`](https://motion-reference.takayustudio.jp/#motion=switch-state-spring) | Switch State Spring | canvas | 560 | easeOutBack | have | `flow/toggle-flip`, `ui/toggle-switch` | - |
| [`inline-validation`](https://motion-reference.takayustudio.jp/#motion=inline-validation) | Inline Validation | canvas | 620 | easeOutCubic | have | `flow/input-feedback` | - |
| [`submit-success`](https://motion-reference.takayustudio.jp/#motion=submit-success) | Submit Success Morph | canvas | 820 | easeInOutCubic | partial | → `ui/button-morph` | medium |
| [`upload-progress-state`](https://motion-reference.takayustudio.jp/#motion=upload-progress-state) | Upload Progress State | canvas | 1400 | easeInOutCubic | have | `glass/notifications`, `data/chart-story` | - |
| [`password-strength`](https://motion-reference.takayustudio.jp/#motion=password-strength) | Password Strength | canvas | 720 | easeOutCubic | have | `ui/hud-pips`, `text/state-swap` | - |
| [`skeleton-resolve`](https://motion-reference.takayustudio.jp/#motion=skeleton-resolve) | Skeleton Resolve | canvas | 860 | easeOutCubic | have | `ui/skeleton-reveal` | - |

### Gesture & Mobile (`gesture`, 8: have 5, partial 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`swipe-dismiss`](https://motion-reference.takayustudio.jp/#motion=swipe-dismiss) | Swipe Dismiss | dom | 700 | easeOutCubic | have | `motion/drag-release`, `motion/physical-exit`, `cursor/touch` | - |
| [`swipe-actions`](https://motion-reference.takayustudio.jp/#motion=swipe-actions) | Swipe Actions Reveal | canvas | 640 | easeOutCubic | have | `motion/drag-release`, `cursor/touch` | - |
| [`long-press-progress`](https://motion-reference.takayustudio.jp/#motion=long-press-progress) | Long Press Progress | canvas | 1000 | linear | partial | → `ui/fill-confirm` | medium |
| [`pull-to-refresh`](https://motion-reference.takayustudio.jp/#motion=pull-to-refresh) | Pull to Refresh | dom | 920 | easeOutBack | have | `ui/pull-to-refresh` | - |
| [`drag-pickup`](https://motion-reference.takayustudio.jp/#motion=drag-pickup) | Drag Pickup | canvas | 540 | easeOutCubic | have | `motion/drag-release`, `cursor/drag-drop` | - |
| [`reorder-drag`](https://motion-reference.takayustudio.jp/#motion=reorder-drag) | Reorder Drag | canvas | 900 | easeInOutCubic | have | `cursor/drag-drop`, `motion/anime-layout` | - |
| [`bottom-sheet-drag`](https://motion-reference.takayustudio.jp/#motion=bottom-sheet-drag) | Bottom Sheet Drag | canvas | 760 | easeOutCubic | partial | → `ui/sheet-spring-up` | medium |
| [`pinch-zoom`](https://motion-reference.takayustudio.jp/#motion=pinch-zoom) | Pinch Zoom | dom | 820 | easeOutCubic | partial | → `cursor/touch` | medium |

### UI Buttons (`ui-button`, 22: have 7, partial 14, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-button-bounce-press`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-bounce-press) | Bounce Press | canvas | 2800 | linear | partial | → `ui/press` | medium |
| [`catalog-ui-button-jelly-squash`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-jelly-squash) | Jelly Squash | canvas | 2800 | linear | partial | → `motion/inertial-bounce` | medium |
| [`catalog-ui-button-tap-ripple`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-tap-ripple) | Tap Ripple | canvas | 2800 | linear | partial | → `ui/ink-ripple` | medium |
| [`catalog-ui-button-pulse-glow`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-pulse-glow) | Pulse Glow | canvas | 2800 | linear | partial | → `house/glow-card` | medium |
| [`catalog-ui-button-error-shake`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-error-shake) | Error Shake | canvas | 2800 | linear | have | `flow/input-feedback`, `hand/shake` | - |
| [`catalog-ui-button-fill-sweep`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-fill-sweep) | Fill Sweep | canvas | 2800 | linear | partial | → `ui/fill-confirm` | medium |
| [`catalog-ui-button-send-morph`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-send-morph) | Send Morph | canvas | 2800 | linear | partial | → `ui/button-morph` | medium |
| [`catalog-ui-button-push-3d`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-push-3d) | 3D Push | canvas | 2800 | linear | partial | → `ui/press` | medium |
| [`catalog-ui-button-confetti-burst`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-confetti-burst) | Confetti Burst | canvas | 2800 | linear | have | `effect/confetti` | - |
| [`catalog-ui-button-hold-confirm`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-hold-confirm) | Hold to Confirm | canvas | 2800 | linear | partial | → `ui/fill-confirm` | medium |
| [`catalog-ui-button-border-draw`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-border-draw) | Border Draw | canvas | 2800 | linear | have | `line/outline-draw` | - |
| [`catalog-ui-button-shine-sweep`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-shine-sweep) | Shine Sweep | canvas | 2800 | linear | have | `text/shimmer-sweep` | - |
| [`catalog-ui-button-loading-success`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-loading-success) | Loading to Success | canvas | 2800 | linear | partial | → `ui/button-morph` | medium |
| [`catalog-ui-button-icon-swap`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-icon-swap) | Icon Swap | canvas | 2800 | linear | have | `ui/icon-swap`, `transition/morph-swap` | - |
| [`catalog-ui-button-heartbeat`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-heartbeat) | Heartbeat | canvas | 2800 | linear | partial | → `motion/heartbeat` | medium |
| [`catalog-ui-button-wobble-tilt`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-wobble-tilt) | Wobble Tilt | canvas | 2800 | linear | partial | → `motion/inertial-bounce` | medium |
| [`catalog-ui-button-elastic-drag`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-elastic-drag) | Elastic Drag | canvas | 2800 | linear | have | `motion/drag-release` | - |
| [`catalog-ui-button-inner-press`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-inner-press) | Inner Press | canvas | 2800 | linear | partial | → `ui/press` | medium |
| [`catalog-ui-button-color-splash`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-color-splash) | Color Splash | canvas | 2800 | linear | missing | → `ui/ink-ripple` | medium |
| [`catalog-ui-button-breathing-gradient`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-button-breathing-gradient) | Breathing Gradient | canvas | 2800 | linear | partial | → `house/glow-card` | medium |
| [`ui-press`](https://motion-reference.takayustudio.jp/#motion=ui-press) | Button Press | dom | 100 | easeOutQuad / spring | partial | → `ui/press` | medium |
| [`ui-morph`](https://motion-reference.takayustudio.jp/#motion=ui-morph) | One Shape, Never Cut | dom | 500 | track() spring | have | `motion/spring-track`, `text/state-swap` | - |

### Selection & Controls (`ui-control`, 14: have 7, generic 1, partial 6)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-control-spring-switch`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-spring-switch) | Springy Switch | canvas | 2800 | linear | have | `flow/toggle-flip`, `ui/toggle-switch` | - |
| [`catalog-ui-control-day-night`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-day-night) | Day and Night | canvas | 2800 | linear | partial | → `flow/toggle-flip` | medium |
| [`catalog-ui-control-liquid-stretch`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-liquid-stretch) | Liquid Stretch | canvas | 2800 | linear | have | `motion/spring-track`, `flow/toggle-flip` | - |
| [`catalog-ui-control-check-draw`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-check-draw) | Check Draw | canvas | 2800 | linear | have | `line/anime-draw`, `line/draw` | - |
| [`catalog-ui-control-heart-like`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-heart-like) | Heart Like | dom | 2800 | linear | partial | → `ui/like-burst` | medium |
| [`catalog-ui-control-lock-unlock`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-lock-unlock) | Lock and Unlock | canvas | 2800 | linear | have | `ui/icon-morph-beat` | - |
| [`catalog-ui-control-mute-pop`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-mute-pop) | Mute Pop | canvas | 2800 | linear | partial | → `ui/icon-morph-beat` | low |
| [`catalog-ui-control-play-pause`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-play-pause) | Play and Pause | canvas | 2800 | linear | have | `shape/anime-morph` | - |
| [`catalog-ui-control-sliding-underline`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-sliding-underline) | Sliding Underline | canvas | 2800 | linear | have | `motion/spring-track` | - |
| [`catalog-ui-control-pill-indicator`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-pill-indicator) | Pill Indicator | canvas | 2800 | linear | have | `flow/tabs-slide-indicator` | - |
| [`catalog-ui-control-bubble-expand`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-bubble-expand) | Bubble Expand | canvas | 2800 | linear | partial | → `ui/radial-menu` | medium |
| [`catalog-ui-control-jumping-dot`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-jumping-dot) | Jumping Dot | canvas | 2800 | linear | partial | → `motion/spring-track` | low |
| [`catalog-ui-control-liquid-blob`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-liquid-blob) | Liquid Blob | canvas | 2800 | linear | partial | → `motion/spring-track` | medium |
| [`catalog-ui-control-tint-shift`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-control-tint-shift) | Tint Shift | canvas | 2800 | linear | generic | `motion/tween` | - |

### Navigation & Overlays (`ui-navigation`, 6: have 4, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-navigation-hero-expand`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-hero-expand) | Hero Expand | canvas | 2800 | linear | have | `flow/modal-morph`, `motion/anime-layout` | - |
| [`catalog-ui-navigation-spring-sheet`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-spring-sheet) | Spring Sheet | canvas | 2800 | linear | have | `ui/sheet-spring-up` | - |
| [`catalog-ui-navigation-card-flip`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-card-flip) | Card Flip | canvas | 2800 | linear | partial | → `motion/card-flip` | medium |
| [`catalog-ui-navigation-circular-reveal`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-circular-reveal) | Circular Reveal | canvas | 2800 | linear | have | `transition/iris-reveal` | - |
| [`catalog-ui-navigation-parallax-push`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-parallax-push) | Parallax Push | canvas | 2800 | linear | partial | → `transition/push` | high |
| [`catalog-ui-navigation-staggered-reveal`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-navigation-staggered-reveal) | Staggered Reveal | canvas | 2800 | linear | have | `text/bullets`, `card/stagger-cascade` | - |

### Loading & Progress (`ui-loading`, 10: have 3, generic 5, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-loading-bouncing-dots`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-bouncing-dots) | Bouncing Dots | canvas | 2800 | linear | partial | → `ui/typing-indicator` | medium |
| [`catalog-ui-loading-gradient-arc`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-gradient-arc) | Gradient Arc | canvas | 2800 | linear | generic | `motion/tween` | - |
| [`catalog-ui-loading-progress-success`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-progress-success) | Progress to Success | canvas | 2800 | linear | have | `data/chart-story`, `ui/success-check` | - |
| [`catalog-ui-loading-skeleton-shimmer`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-skeleton-shimmer) | Skeleton Shimmer | canvas | 2800 | linear | partial | → `ui/skeleton-reveal` | medium |
| [`catalog-ui-loading-typing-indicator`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-typing-indicator) | Typing Indicator | canvas | 2800 | linear | have | `ui/typing-indicator` | - |
| [`catalog-ui-loading-equalizer-bars`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-equalizer-bars) | Equalizer Bars | canvas | 2800 | linear | have | `data/audiogram` | - |
| [`catalog-ui-loading-orbit-trail`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-loading-orbit-trail) | Orbit Trail | canvas | 2800 | linear | generic | `motion/tween` | - |
| [`ld-bar`](https://motion-reference.takayustudio.jp/#motion=ld-bar) | Indeterminate Bar | dom | 1800 | easeInOutCubic | generic | `motion/tween` | - |
| [`ld-pulse`](https://motion-reference.takayustudio.jp/#motion=ld-pulse) | Pulse Ring | dom | 1600 | easeOutCubic | generic | `motion/tween` | - |
| [`ld-squares`](https://motion-reference.takayustudio.jp/#motion=ld-squares) | Morphing Squares | dom | 600 | easeInOutCubic | generic | `motion/tween` | - |

### Feedback & Reactions (`ui-feedback`, 8: have 4, partial 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-feedback-heart-burst`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-heart-burst) | Heart Burst | canvas | 2800 | linear | partial | → `ui/like-burst` | medium |
| [`catalog-ui-feedback-star-rating`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-star-rating) | Star Rating | canvas | 2800 | linear | have | `card/star-rating-fill` | - |
| [`catalog-ui-feedback-clap-counter`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-clap-counter) | Clap Counter | canvas | 2800 | linear | have | `data/number-wheel`, `data/countdown` | - |
| [`catalog-ui-feedback-emoji-bar`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-emoji-bar) | Emoji Bar | canvas | 2800 | linear | partial | → `ui/avatar-group-hover` | medium |
| [`catalog-ui-feedback-number-ticker`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-number-ticker) | Number Ticker | canvas | 2800 | linear | have | `data/number-wheel`, `data/countdown` | - |
| [`catalog-ui-feedback-confetti-rain`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-feedback-confetti-rain) | Confetti Rain | canvas | 2800 | linear | partial | → `effect/confetti` | medium |
| [`ui-toast`](https://motion-reference.takayustudio.jp/#motion=ui-toast) | Toast | dom | 400 | spring / easeIn | have | `ui/native-notification-pop`, `ui/notification-cascade` | - |
| [`ui-island`](https://motion-reference.takayustudio.jp/#motion=ui-island) | Dynamic Island | dom | 500 | spring | partial | → `ui/dynamic-island` | medium |

### Spatial UI & Depth (`ui-spatial`, 20: have 7, partial 7, missing 5, skip 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-spatial-cursor-depth-pull`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-cursor-depth-pull) | Cursor Depth Pull | canvas | 4200 | linear | have | `card/tilt-card`, `motion/spring-track` | - |
| [`catalog-ui-spatial-focus-portal`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-focus-portal) | Focus Portal | canvas | 4200 | linear | partial | → `transition/iris-reveal` | medium |
| [`catalog-ui-spatial-radial-command-bloom`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-radial-command-bloom) | Radial Command Bloom | canvas | 4200 | linear | partial | → `ui/radial-menu` | medium |
| [`catalog-ui-spatial-spatial-breadcrumb`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-spatial-breadcrumb) | Spatial Breadcrumb | canvas | 4200 | linear | missing | → `card/depth-breadcrumb` | low |
| [`catalog-ui-spatial-perspective-dock`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-perspective-dock) | Perspective Dock | canvas | 4200 | linear | partial | → `ui/avatar-group-hover` | medium |
| [`catalog-ui-spatial-layer-peel`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-layer-peel) | Layer Peel | canvas | 4200 | linear | missing | → `motion/hinge` | medium |
| [`catalog-ui-spatial-tooltip-orbit`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-tooltip-orbit) | Tooltip Orbit | canvas | 4200 | linear | skip | Tooltip placement flipping to avoid the frame edges is the lesson; no film use. | - |
| [`catalog-ui-spatial-depth-lens`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-depth-lens) | Depth Lens | canvas | 4200 | linear | missing | → `effect/magnifier` | medium |
| [`catalog-ui-spatial-magnetic-constellation`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-magnetic-constellation) | Magnetic Constellation | canvas | 4200 | linear | have | `data/radial-surround`, `data/constellation-hub` | - |
| [`catalog-ui-spatial-infinite-canvas-jump`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-infinite-canvas-jump) | Infinite Canvas Jump | canvas | 4200 | linear | partial | → `motion/camera` | high |
| [`catalog-ui-spatial-z-notification`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-z-notification) | Z-axis Notification | canvas | 4200 | linear | have | `motion/spring-pop`, `ui/native-notification-pop` | - |
| [`catalog-ui-spatial-camera-dolly-ui`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-camera-dolly-ui) | Camera Dolly UI | canvas | 4200 | linear | partial | → `motion/camera` | high |
| [`catalog-ui-spatial-volumetric-menu`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-volumetric-menu) | Volumetric Menu | canvas | 4200 | linear | have | `data/exploded-stack`, `data/iso-stack` | - |
| [`catalog-ui-spatial-parallax-inspector`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-parallax-inspector) | Parallax Inspector | canvas | 4200 | linear | partial | → `motion/camera` | high |
| [`catalog-ui-spatial-spatial-search`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-spatial-search) | Spatial Search Reveal | canvas | 4200 | linear | have | `motion/anime-layout`, `ui/typed-prompt` | - |
| [`catalog-ui-spatial-orbit-context`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-orbit-context) | Orbiting Context Menu | canvas | 4200 | linear | partial | → `ui/radial-menu` | medium |
| [`catalog-ui-spatial-depth-stack-reorder`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-depth-stack-reorder) | Depth Stack Reorder | canvas | 4200 | linear | have | `card/stack-shuffle` | - |
| [`catalog-ui-spatial-calendar-fold`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-calendar-fold) | Perspective Calendar Fold | canvas | 4200 | linear | missing | → `motion/hinge` | medium |
| [`catalog-ui-spatial-cursor-raycast`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-cursor-raycast) | Cursor Raycast Select | canvas | 4200 | linear | have | `ui/tracing-beam`, `line/draw` | - |
| [`catalog-ui-spatial-spatial-audio-locator`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-spatial-spatial-audio-locator) | Spatial Audio Locator | canvas | 4200 | linear | missing | → `effect/ring-pulse` | low |

### Material & Surface Motion (`ui-material`, 20: have 2, partial 11, missing 7)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-ui-material-liquid-tab-bridge`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-liquid-tab-bridge) | Liquid Tab Bridge | canvas | 4200 | linear | partial | → `motion/spring-track` | medium |
| [`catalog-ui-material-gel-button-split`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-gel-button-split) | Gel Button Split | canvas | 4200 | linear | partial | → `effect/gooey-split` | low |
| [`catalog-ui-material-glass-refraction`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-glass-refraction) | Glass Refraction Hover | canvas | 4200 | linear | missing | → `effect/magnifier` | medium |
| [`catalog-ui-material-ink-adhesion`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-ink-adhesion) | Ink Adhesion | canvas | 4200 | linear | missing | → `effect/ink-drip` | low |
| [`catalog-ui-material-metallic-foil`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-metallic-foil) | Metallic Foil Tilt | canvas | 4200 | linear | partial | → `card/tilt-card` | medium |
| [`catalog-ui-material-soft-body-toggle`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-soft-body-toggle) | Soft Body Toggle | canvas | 4200 | linear | partial | → `ui/toggle-switch` | medium |
| [`catalog-ui-material-viscous-progress`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-viscous-progress) | Viscous Progress | canvas | 4200 | linear | have | `motion/spring-track` | - |
| [`catalog-ui-material-chromatic-glass-edge`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-chromatic-glass-edge) | Chromatic Glass Edge | canvas | 4200 | linear | partial | → `text/rgb-glitch` | low |
| [`catalog-ui-material-paper-fold`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-paper-fold) | Paper Fold Reveal | canvas | 4200 | linear | missing | → `motion/hinge` | medium |
| [`catalog-ui-material-cloth-wave`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-cloth-wave) | Cloth Wave Panel | canvas | 4200 | linear | missing | → `effect/cloth-wave` | medium |
| [`catalog-ui-material-bubble-merge`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-bubble-merge) | Bubble Merge Menu | canvas | 4200 | linear | partial | → `effect/gooey-split` | low |
| [`catalog-ui-material-frost-melt`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-frost-melt) | Frost Melt Unlock | canvas | 4200 | linear | partial | → `transition/iris-reveal` | low |
| [`catalog-ui-material-membrane-press`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-membrane-press) | Elastic Membrane Press | canvas | 4200 | linear | missing | → `shape/membrane` | low |
| [`catalog-ui-material-sand-dissolve`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-sand-dissolve) | Sand Dissolve State | canvas | 4200 | linear | partial | → `text/particle-dissolve` | medium |
| [`catalog-ui-material-oil-slick`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-oil-slick) | Oil Slick Selection | canvas | 4200 | linear | missing | → `effect/iridescent-select` | low |
| [`catalog-ui-material-magnetic-fluid`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-magnetic-fluid) | Magnetic Fluid Badge | canvas | 4200 | linear | missing | → `effect/ferro-badge` | low |
| [`catalog-ui-material-glass-crack-recover`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-glass-crack-recover) | Glass Crack Recover | canvas | 4200 | linear | partial | → `effect/crack` | medium |
| [`catalog-ui-material-neon-tube-draw`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-neon-tube-draw) | Neon Tube Draw | canvas | 4200 | linear | partial | → `line/anime-draw` | medium |
| [`catalog-ui-material-chrome-ripple`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-chrome-ripple) | Chrome Ripple Surface | canvas | 4200 | linear | have | `motion/tween`, `cursor/press-ripple` | - |
| [`catalog-ui-material-clay-icon-morph`](https://motion-reference.takayustudio.jp/#motion=catalog-ui-material-clay-icon-morph) | Clay Morph Icon | canvas | 4200 | linear | partial | → `motion/squash-stretch` | medium |

### Game HUD (`game-hud`, 12: have 2, partial 9, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-game-hud-coin-collect`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-coin-collect) | Coin Collect | canvas | 3400 | linear | partial | → `motion/collect-arc` | medium |
| [`catalog-game-hud-hp-ghost-bar`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-hp-ghost-bar) | HP Ghost Bar | canvas | 2800 | linear | partial | → `ui/hud-bar` | low |
| [`catalog-game-hud-cooldown-ability`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-cooldown-ability) | Cooldown Ability | canvas | 3600 | linear | partial | → `data/conic-progress-ring` | low |
| [`catalog-game-hud-score-rollup`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-score-rollup) | Score Roll-up | canvas | 2800 | linear | have | `data/count-up-hf`, `shape/pop` | - |
| [`catalog-game-hud-stamina-pulse`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-stamina-pulse) | Stamina Pulse | canvas | 2800 | linear | partial | → `ui/hud-bar` | low |
| [`catalog-game-hud-ammo-reload`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-ammo-reload) | Ammo Reload | canvas | 2800 | linear | partial | → `ui/hud-pips` | low |
| [`catalog-game-hud-compass-lock`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-compass-lock) | Compass Lock | canvas | 2800 | linear | missing | → `ui/compass-tape` | low |
| [`catalog-game-hud-minimap-ping`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-minimap-ping) | Minimap Ping | canvas | 2800 | linear | partial | → `effect/ring-pulse` | medium |
| [`catalog-game-hud-objective-marker`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-objective-marker) | Objective Marker | canvas | 2800 | linear | partial | → `effect/ring-pulse` | low |
| [`catalog-game-hud-resource-cap`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-resource-cap) | Resource Cap | canvas | 2800 | linear | partial | → `ui/hud-bar` | low |
| [`catalog-game-hud-party-status`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-party-status) | Party Status | canvas | 2800 | linear | have | `hand/shake`, `shape/pop` | - |
| [`catalog-game-hud-buff-timer`](https://motion-reference.takayustudio.jp/#motion=catalog-game-hud-buff-timer) | Buff Timer | canvas | 3600 | linear | partial | → `data/conic-progress-ring` | low |

### Combat & Hit FX (`game-combat`, 8: have 1, partial 6, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-game-combat-damage-numbers`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-damage-numbers) | Damage Numbers | canvas | 2800 | linear | partial | → `text/float-pop` | medium |
| [`catalog-game-combat-combo-counter`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-combo-counter) | Combo Counter | canvas | 2800 | linear | partial | → `ui/hud-bar` | low |
| [`catalog-game-combat-critical-flash`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-critical-flash) | Critical Flash | canvas | 2800 | linear | partial | → `effect/spark-burst` | medium |
| [`catalog-game-combat-hit-confirm`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-hit-confirm) | Hit Confirm | canvas | 2800 | linear | partial | → `ui/reticle-lock` | low |
| [`catalog-game-combat-guard-break`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-guard-break) | Guard Break | canvas | 2800 | linear | partial | → `effect/shatter-pieces` | low |
| [`catalog-game-combat-perfect-dodge`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-perfect-dodge) | Perfect Dodge | canvas | 2800 | linear | have | `motion/echo-trail`, `text/land-in` | - |
| [`catalog-game-combat-parry-window`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-parry-window) | Parry Window | canvas | 2800 | linear | missing | → `effect/ring-pulse` | low |
| [`catalog-game-combat-status-ailment`](https://motion-reference.takayustudio.jp/#motion=catalog-game-combat-status-ailment) | Status Ailment | canvas | 2800 | linear | partial | → `text/float-pop` | low |

### Rewards & Loot (`game-reward`, 10: have 2, partial 5, missing 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-game-reward-level-up`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-level-up) | Level Up Burst | canvas | 2800 | linear | partial | → `effect/ring-pulse` | medium |
| [`catalog-game-reward-chest-open`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-chest-open) | Chest Open | canvas | 2800 | linear | missing | → `effect/reveal-rays` | low |
| [`catalog-game-reward-three-star`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-three-star) | Three Star Clear | canvas | 2800 | linear | partial | → `card/star-rating-fill` | medium |
| [`catalog-game-reward-gacha-pull`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-gacha-pull) | Gacha Pull | canvas | 2800 | linear | missing | → `effect/reveal-rays` | low |
| [`catalog-game-reward-new-record`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-new-record) | New Record Stamp | canvas | 2800 | linear | partial | → `text/land-in` | medium |
| [`catalog-game-reward-loot-rarity`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-loot-rarity) | Loot Rarity | canvas | 2800 | linear | partial | → `line/border-beam` | medium |
| [`catalog-game-reward-achievement`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-achievement) | Achievement Unlock | canvas | 2800 | linear | have | `ui/native-notification-pop`, `shape/pop` | - |
| [`catalog-game-reward-daily-bonus`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-daily-bonus) | Daily Bonus | canvas | 2800 | linear | have | `motion/spring-track`, `cursor/gesture-tap`, `ui/success-check` | - |
| [`catalog-game-reward-currency-rain`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-currency-rain) | Currency Rain | canvas | 2800 | linear | partial | → `motion/collect-arc` | medium |
| [`catalog-game-reward-reward-card`](https://motion-reference.takayustudio.jp/#motion=catalog-game-reward-reward-card) | Reward Card Reveal | canvas | 2800 | linear | missing | → `card/flip-reveal` | medium |

### Progression & Quests (`game-progress`, 9: have 4, partial 5)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-game-progress-quest-banner`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-quest-banner) | Quest Banner | canvas | 2800 | linear | partial | → `lower/bold-block` | medium |
| [`catalog-game-progress-skill-unlock`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-skill-unlock) | Skill Unlock | canvas | 2800 | linear | have | `line/flow-connector`, `line/draw`, `ui/icon-morph-beat` | - |
| [`catalog-game-progress-login-streak`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-login-streak) | Login Streak | canvas | 2800 | linear | have | `ui/hud-pips`, `text/anime-roll` | - |
| [`catalog-game-progress-energy-refill`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-energy-refill) | Energy Refill | canvas | 2800 | linear | partial | → `ui/hud-bar` | medium |
| [`catalog-game-progress-xp-overflow`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-xp-overflow) | XP Overflow | canvas | 2800 | linear | partial | → `ui/hud-bar` | low |
| [`catalog-game-progress-battle-pass`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-battle-pass) | Battle Pass | canvas | 2800 | linear | have | `flow/onboarding-stepper-flow`, `line/draw`, `shape/pop` | - |
| [`catalog-game-progress-mission-step`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-mission-step) | Mission Step | canvas | 2800 | linear | have | `flow/onboarding-stepper-flow`, `ui/success-check`, `text/anime-roll` | - |
| [`catalog-game-progress-rank-up`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-rank-up) | Rank Up | canvas | 2800 | linear | partial | → `effect/spark-burst` | medium |
| [`catalog-game-progress-collection-complete`](https://motion-reference.takayustudio.jp/#motion=catalog-game-progress-collection-complete) | Collection Complete | canvas | 2800 | linear | partial | → `motion/collect-arc` | low |

### Game Cinematics (`game-cinematic`, 8: have 3, partial 4, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-game-cinematic-lucky-roulette`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-lucky-roulette) | Lucky Roulette | canvas | 3800 | linear | missing | → `ui/lucky-wheel` | high |
| [`catalog-game-cinematic-countdown-go`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-countdown-go) | Countdown GO! | canvas | 4000 | linear | partial | → `data/countdown` | high |
| [`catalog-game-cinematic-boss-warning`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-boss-warning) | Boss Warning | canvas | 2800 | linear | partial | → `title/warning-bands` | medium |
| [`catalog-game-cinematic-victory-title`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-victory-title) | Victory Title | canvas | 2800 | linear | have | `text/tracking-in`, `line/draw` | - |
| [`catalog-game-cinematic-defeat-dissolve`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-defeat-dissolve) | Defeat Dissolve | canvas | 2800 | linear | partial | → `text/snap-out` | medium |
| [`catalog-game-cinematic-chapter-intro`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-chapter-intro) | Chapter Intro | canvas | 2800 | linear | have | `title/titlecard-lockup`, `line/draw`, `text/mask-rise` | - |
| [`catalog-game-cinematic-raid-start`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-raid-start) | Raid Start | canvas | 2800 | linear | have | `card/stagger-cascade`, `house/super-slide`, `text/headline-slam` | - |
| [`catalog-game-cinematic-letterbox-focus`](https://motion-reference.takayustudio.jp/#motion=catalog-game-cinematic-letterbox-focus) | Letterbox Focus | canvas | 2800 | linear | partial | → `effect/letterbox` | high |

### Game Impact FX (`game-impact-fx`, 20: have 4, partial 12, missing 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-game-impact-fx-hit-stop`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-hit-stop) | Hit-stop Frame | dom | 4200 | linear | have | `hand/hit-stop` | - |
| [`catalog-game-impact-fx-shockwave-type`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-shockwave-type) | Shockwave Typography | canvas | 4200 | linear | partial | → `effect/ring-pulse` | high |
| [`catalog-game-impact-fx-slash-reveal`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-slash-reveal) | Directional Slash Reveal | canvas | 4200 | linear | partial | → `text/slash-reveal` | high |
| [`catalog-game-impact-fx-freeze-color-drain`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-freeze-color-drain) | Freeze-frame Color Drain | canvas | 4200 | linear | partial | → `effect/freeze-drain` | medium |
| [`catalog-game-impact-fx-combo-heat`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-combo-heat) | Combo Heat Escalation | canvas | 4200 | linear | partial | → `ui/hud-bar` | low |
| [`catalog-game-impact-fx-edge-damage`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-edge-damage) | Screen-edge Damage Pulse | canvas | 4200 | linear | partial | → `effect/vignette` | low |
| [`catalog-game-impact-fx-armor-crack`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-armor-crack) | Armor Crack Network | canvas | 4200 | linear | missing | → `effect/crack` | medium |
| [`catalog-game-impact-fx-critical-compress`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-critical-compress) | Critical Lens Compression | canvas | 4200 | linear | partial | → `hand/hit-stop` | low |
| [`catalog-game-impact-fx-phase-shatter`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-phase-shatter) | Boss Phase Shatter | canvas | 4200 | linear | partial | → `effect/shatter-pieces` | medium |
| [`catalog-game-impact-fx-speedline-tunnel`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-speedline-tunnel) | Speedline Tunnel | canvas | 4200 | linear | missing | → `background/speed-lines` | medium |
| [`catalog-game-impact-fx-parry-time-slice`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-parry-time-slice) | Parry Time Slice | canvas | 4200 | linear | partial | → `effect/spark-burst` | low |
| [`catalog-game-impact-fx-element-burst`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-element-burst) | Elemental Affinity Burst | canvas | 4200 | linear | partial | → `effect/spark-burst` | medium |
| [`catalog-game-impact-fx-camera-kick`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-camera-kick) | Camera Kick HUD | canvas | 4200 | linear | partial | → `hand/shake` | low |
| [`catalog-game-impact-fx-afterimage-dash`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-afterimage-dash) | Afterimage Dash | canvas | 4200 | linear | have | `motion/echo-trail` | - |
| [`catalog-game-impact-fx-victory-hold`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-victory-hold) | Victory Impact Hold | canvas | 4200 | linear | have | `text/headline-slam`, `hand/hit-stop`, `line/draw` | - |
| [`catalog-game-impact-fx-loot-beam`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-loot-beam) | Loot Beam Column | canvas | 4200 | linear | missing | → `effect/light-beam` | low |
| [`catalog-game-impact-fx-warning-stripe`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-warning-stripe) | Warning Stripe Slam | canvas | 4200 | linear | partial | → `title/warning-bands` | medium |
| [`catalog-game-impact-fx-shield-recharge`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-shield-recharge) | Shield Recharge Sweep | canvas | 4200 | linear | have | `data/conic-progress-ring`, `shape/pop` | - |
| [`catalog-game-impact-fx-mission-stamp`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-mission-stamp) | Mission Stamp Punch | canvas | 4200 | linear | partial | → `text/land-in` | medium |
| [`catalog-game-impact-fx-finisher-cut`](https://motion-reference.takayustudio.jp/#motion=catalog-game-impact-fx-finisher-cut) | Finisher Title Cut | canvas | 4200 | linear | missing | → `text/split-halves` | high |

### Reveal (`tx-reveal`, 19: have 13, generic 6)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`line-by-line`](https://motion-reference.takayustudio.jp/#motion=line-by-line) | Line-by-Line Reveal | canvas | 980 | easeOutCubic | have | `text/mask-rise`, `motion/anime` | - |
| [`ty-ghost`](https://motion-reference.takayustudio.jp/#motion=ty-ghost) | Word Ghost Reveal | dom | 330 | expo.out | have | `motion/anime`, `text/staggered-fade-up` | - |
| [`ty-kinetic`](https://motion-reference.takayustudio.jp/#motion=ty-kinetic) | Kinetic Lines on Verbs | dom | 300 | power3.out | have | `text/land-in`, `text/lyric-line` | - |
| [`tx-fade-up-chars`](https://motion-reference.takayustudio.jp/#motion=tx-fade-up-chars) | Character Fade Up | text | 900 | power3.out (easeOutCubic) | have | `text/per-word-fade`, `motion/anime` | - |
| [`tx-fade-up-words`](https://motion-reference.takayustudio.jp/#motion=tx-fade-up-words) | Word Fade Up | text | 500 | easeOutCubic | have | `text/staggered-fade-up`, `text/per-word-fade` | - |
| [`tx-slide-down-chars`](https://motion-reference.takayustudio.jp/#motion=tx-slide-down-chars) | Slide Down By Character | text | 550 | easeOutCubic | have | `text/top-down-letters`, `text/bottom-up-letters` | - |
| [`tx-alternating-line-direction`](https://motion-reference.takayustudio.jp/#motion=tx-alternating-line-direction) | Alternating Line Reveal | text | 650 | inOut(3) (easeInOutCubic) | have | `text/mask-rise`, `motion/anime` | - |
| [`tx-stretch-rise`](https://motion-reference.takayustudio.jp/#motion=tx-stretch-rise) | Stretch Rise | text | 900 | back.inOut(2) | have | `motion/anime`, `text/bottom-up-letters` | - |
| [`tx-scale-y-unfold`](https://motion-reference.takayustudio.jp/#motion=tx-scale-y-unfold) | Vertical Unfold | text | 600 | back.out(1.7) | generic | `motion/anime` | - |
| [`tx-converge-from-spread`](https://motion-reference.takayustudio.jp/#motion=tx-converge-from-spread) | Converge From Spread | text | 1000 | power1.inOut | generic | `motion/anime` | - |
| [`tx-center-out-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-center-out-reveal) | Center-Out Reveal | text | 450 | easeOutCubic | have | `motion/anime`, `text/anime-roll` | - |
| [`tx-scatter-assemble`](https://motion-reference.takayustudio.jp/#motion=tx-scatter-assemble) | Scatter Assemble | text | 1000 | power1.inOut | generic | `motion/anime` | - |
| [`tx-random-tilt-scale-in`](https://motion-reference.takayustudio.jp/#motion=tx-random-tilt-scale-in) | Random Tilt Scale In | text | 900 | power4.out | have | `motion/anime`, `house/pop-cute` | - |
| [`tx-smear-stretch-in`](https://motion-reference.takayustudio.jp/#motion=tx-smear-stretch-in) | Smear Stretch In | text | 800 | power2.out | generic | `motion/anime` | - |
| [`tx-scale-pop-in`](https://motion-reference.takayustudio.jp/#motion=tx-scale-pop-in) | Elastic Scale Pop | text | 600 | spring(300, 18) / elastic.out(1, .4) | have | `motion/anime`, `text/land-in` | - |
| [`tx-range-soft-wave-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-range-soft-wave-reveal) | Range Selector Soft Wave | text | 1800 | linear (offset) + smoothness | have | `text/per-word-fade`, `motion/anime` | - |
| [`tx-random-order-fade`](https://motion-reference.takayustudio.jp/#motion=tx-random-order-fade) | Random-Order Fade | text | 300 | easeOutQuad | generic | `motion/anime` | - |
| [`tx-tracking-in-expand`](https://motion-reference.takayustudio.jp/#motion=tx-tracking-in-expand) | Tracking In Expand | text | 700 | cubic-bezier(.215,.61,.355,1) | have | `text/tracking-in`, `text/land-in` | - |
| [`tx-emoji-grapheme-pop`](https://motion-reference.takayustudio.jp/#motion=tx-emoji-grapheme-pop) | Grapheme-safe Emoji Pop | text | 450 | spring(400, 20) | generic | `motion/anime` | - |

### Swap (`tx-swap`, 12: have 8, generic 1, partial 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-glyph-slot-roll`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-glyph-slot-roll) | Glyph Slot Roll | canvas | 4200 | linear | partial | → `text/slot-roll` | medium |
| [`ty-flip`](https://motion-reference.takayustudio.jp/#motion=ty-flip) | Letter Flip | dom | 400 | easeInOutCubic | have | `motion/anime`, `text/anime-roll` | - |
| [`tx-split-flap`](https://motion-reference.takayustudio.jp/#motion=tx-split-flap) | Split-flap Board | text | 85 | ease-in (flap fall) | have | `text/split-flap` | - |
| [`tx-rotating-letters-spring`](https://motion-reference.takayustudio.jp/#motion=tx-rotating-letters-spring) | Rotating Text (Spring) | text | 450 | spring(300, 25) | partial | → `text/kinetic-type-swap` | high |
| [`tx-vertical-word-roll`](https://motion-reference.takayustudio.jp/#motion=tx-vertical-word-roll) | Vertical Word Roll | text | 500 | power3.inOut | have | `text/anime-roll`, `text/kinetic-type-swap` | - |
| [`tx-flip-words-blur`](https://motion-reference.takayustudio.jp/#motion=tx-flip-words-blur) | Flip Words | text | 200 | easeOut / spring(100, 10) | have | `text/state-swap`, `motion/anime` | - |
| [`tx-gooey-morph`](https://motion-reference.takayustudio.jp/#motion=tx-gooey-morph) | Gooey Morphing Text | text | 1500 | linear (fraction f) | have | `text/morph-text` | - |
| [`tx-blur-crossfade`](https://motion-reference.takayustudio.jp/#motion=tx-blur-crossfade) | Blur Crossfade | text | 600 | ease-in-out | have | `motion/tween`, `text/state-swap` | - |
| [`tx-cube-rotate-swap`](https://motion-reference.takayustudio.jp/#motion=tx-cube-rotate-swap) | Cube Rotate Swap | text | 600 | ease-in-out | generic | `motion/anime` | - |
| [`tx-skew-swipe`](https://motion-reference.takayustudio.jp/#motion=tx-skew-swipe) | Skew Swipe | text | 400 | expo.out | have | `motion/anime`, `text/state-swap` | - |
| [`tx-letter-cascade-swap`](https://motion-reference.takayustudio.jp/#motion=tx-letter-cascade-swap) | Letter Cascade Swap | text | 400 | power3.in / power3.out | have | `motion/anime`, `text/anime-roll` | - |
| [`tx-diff-retype`](https://motion-reference.takayustudio.jp/#motion=tx-diff-retype) | Diff Text Replace | text | 2000 | none (linear) | partial | → `text/caret-swap` | medium |

### Variable Fonts (`tx-variable`, 9: have 2, partial 7)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-variable-font-pulse`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-variable-font-pulse) | Variable Font Pulse | canvas | 4200 | linear | partial | → `text/variable-axis` | low |
| [`tx-weight-wave`](https://motion-reference.takayustudio.jp/#motion=tx-weight-wave) | Variable Weight Wave | text | 1600 | ease-in-out | have | `text/weight-wave` | - |
| [`tx-width-stretch`](https://motion-reference.takayustudio.jp/#motion=tx-width-stretch) | Variable Width Stretch | text | 600 | ease-in-out | partial | → `text/variable-axis` | low |
| [`tx-weight-breathe`](https://motion-reference.takayustudio.jp/#motion=tx-weight-breathe) | Weight Breathe | text | 3000 | ease-in-out | partial | → `text/variable-axis` | low |
| [`tx-thin-to-bold-in`](https://motion-reference.takayustudio.jp/#motion=tx-thin-to-bold-in) | Thin To Bold Entrance | text | 900 | power3.out | have | `text/variable-flex` | - |
| [`tx-slant-swing`](https://motion-reference.takayustudio.jp/#motion=tx-slant-swing) | Slant Axis Swing | text | 2000 | ease-in-out | partial | → `text/variable-axis` | low |
| [`tx-width-slant-scroll`](https://motion-reference.takayustudio.jp/#motion=tx-width-slant-scroll) | Width/Slant Velocity | text | 800 | spring | partial | → `text/variable-axis` | low |
| [`tx-text-pressure`](https://motion-reference.takayustudio.jp/#motion=tx-text-pressure) | Text Pressure | text | 300 | linear | partial | → `text/pressure` | medium |
| [`tx-variable-proximity`](https://motion-reference.takayustudio.jp/#motion=tx-variable-proximity) | Variable Proximity | text | 300 | gaussian falloff | partial | → `text/pressure` | low |

### Typing & Decoding (`tx-typing`, 12: have 8, partial 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-terminal-decode`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-terminal-decode) | Terminal Decode | canvas | 4200 | linear | have | `text/scramble-reveal`, `text/anime-scramble`, `code/code-terminal-run` | - |
| [`tx-typewriter`](https://motion-reference.takayustudio.jp/#motion=tx-typewriter) | Typewriter | text | 80 | steps(1) | have | `text/type-on-mono`, `text/typewriter` | - |
| [`tx-caret-typewriter`](https://motion-reference.takayustudio.jp/#motion=tx-caret-typewriter) | Typewriter With Caret | text | 70 | steps(N, end) | have | `text/typewriter` | - |
| [`tx-typewriter-loop`](https://motion-reference.takayustudio.jp/#motion=tx-typewriter-loop) | Type & Backspace Loop | text | 60 | steps(1) | partial | → `text/typewriter` | high |
| [`tx-human-typewriter`](https://motion-reference.takayustudio.jp/#motion=tx-human-typewriter) | Humanised Typewriter | text | 85 | steps(1) | partial | → `text/typewriter` | medium |
| [`tx-terminal-typing`](https://motion-reference.takayustudio.jp/#motion=tx-terminal-typing) | Terminal Type & Scroll | text | 140 | easeOutCubic | have | `code/code-terminal-run`, `code/apple-terminal-pro` | - |
| [`tx-scramble-decode`](https://motion-reference.takayustudio.jp/#motion=tx-scramble-decode) | Scramble Decode | text | 1000 | linear | have | `text/anime-scramble`, `text/scramble-reveal` | - |
| [`tx-decrypt-center`](https://motion-reference.takayustudio.jp/#motion=tx-decrypt-center) | Decrypt From Center | text | 50 | steps(1) | have | `text/anime-scramble` | - |
| [`tx-char-flicker-in`](https://motion-reference.takayustudio.jp/#motion=tx-char-flicker-in) | Per-char Flicker In | text | 90 | none | have | `text/anime-scramble`, `text/matrix-decode` | - |
| [`tx-slot-shuffle`](https://motion-reference.takayustudio.jp/#motion=tx-slot-shuffle) | Slot Shuffle | text | 800 | power3.out | partial | → `text/slot-roll` | medium |
| [`tx-char-code-cycle`](https://motion-reference.takayustudio.jp/#motion=tx-char-code-cycle) | Character Offset Cycle | text | 1000 | easeOutQuad | partial | → `text/scramble-reveal` | low |
| [`tx-placeholder-replace`](https://motion-reference.takayustudio.jp/#motion=tx-placeholder-replace) | Placeholder Replace | text | 90 | steps(1) | have | `text/anime-scramble` | - |

### Emphasis (`tx-emphasis`, 14: have 9, generic 2, partial 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-focus-word-explosion`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-focus-word-explosion) | Focus Word Explosion | canvas | 4200 | linear | have | `motion/tween`, `text/land-in` | - |
| [`ty-slam`](https://motion-reference.takayustudio.jp/#motion=ty-slam) | Emphasis Slam | dom | 700 | spring(80, 16, 1.6) | have | `text/headline-slam`, `hand/hit-stop`, `text/land-in` | - |
| [`ty-elastic`](https://motion-reference.takayustudio.jp/#motion=ty-elastic) | Elastic Type | dom | 800 | spring(200, 10) | have | `motion/anime`, `motion/inertial-bounce` | - |
| [`tx-bump-wave`](https://motion-reference.takayustudio.jp/#motion=tx-bump-wave) | Falloff Bump Wave | text | 1900 | linear sweep / cubic falloff | have | `motion/anime`, `text/weight-wave` | - |
| [`tx-jelly-rubber-band`](https://motion-reference.takayustudio.jp/#motion=tx-jelly-rubber-band) | Jelly Rubber Band | text | 900 | ease-in-out (keyframes) | generic | `motion/anime` | - |
| [`tx-keyword-punch`](https://motion-reference.takayustudio.jp/#motion=tx-keyword-punch) | Keyword Punch | text | 200 | easeOutQuad | partial | → `text/marker-highlight` | high |
| [`tx-wiggly-jitter`](https://motion-reference.takayustudio.jp/#motion=tx-wiggly-jitter) | Wiggly Jitter | text | 125 | noise (per frame) | partial | → `hand/boil` | medium |
| [`tx-marker-highlight`](https://motion-reference.takayustudio.jp/#motion=tx-marker-highlight) | Marker Highlight | text | 1200 | ease-in-out | have | `text/inline-highlight`, `text/marker-highlight` | - |
| [`tx-underline-draw`](https://motion-reference.takayustudio.jp/#motion=tx-underline-draw) | Underline Draw | text | 400 | cubic-bezier(.65,0,.35,1) | have | `line/draw`, `text/inline-highlight`, `text/marker-highlight` | - |
| [`tx-scribble-circle`](https://motion-reference.takayustudio.jp/#motion=tx-scribble-circle) | Hand-drawn Circle | text | 800 | easeOutCubic | have | `text/marker-highlight`, `hand/callout-circle`, `cursor/annotate` | - |
| [`tx-strike-correct`](https://motion-reference.takayustudio.jp/#motion=tx-strike-correct) | Strike & Correct | text | 500 | back.out(2) | have | `text/strike-replace` | - |
| [`tx-attention-bounce`](https://motion-reference.takayustudio.jp/#motion=tx-attention-bounce) | Attention Bounce | text | 800 | bounce.out | generic | `motion/anime` | - |
| [`tx-pointer-highlight-box`](https://motion-reference.takayustudio.jp/#motion=tx-pointer-highlight-box) | Pointer Highlight Box | text | 1000 | easeInOut | partial | → `text/marker-highlight` | medium |
| [`tx-comic-pop`](https://motion-reference.takayustudio.jp/#motion=tx-comic-pop) | Comic Pop | text | 600 | backOut | have | `hand/comic-text` | - |

### Numbers & Data (`tx-counter`, 9: have 3, partial 5, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-mono-data-shuffle`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-mono-data-shuffle) | Monospace Data Shuffle | canvas | 4200 | linear | partial | → `data/odometer` | high |
| [`tx-count-up`](https://motion-reference.takayustudio.jp/#motion=tx-count-up) | Count Up | text | 2000 | expo.out | have | `data/count-up`, `data/count-up-hf`, `house/count-up-text` | - |
| [`tx-odometer-roll`](https://motion-reference.takayustudio.jp/#motion=tx-odometer-roll) | Odometer Digit Roll | text | 750 | ease-out | partial | → `data/odometer` | high |
| [`tx-ticker-flash`](https://motion-reference.takayustudio.jp/#motion=tx-ticker-flash) | Price Ticker Flash | text | 600 | ease-out | partial | → `data/odometer` | medium |
| [`tx-score-update`](https://motion-reference.takayustudio.jp/#motion=tx-score-update) | Score Update | text | 350 | ease-in-out | partial | → `data/odometer` | low |
| [`tx-number-scramble`](https://motion-reference.takayustudio.jp/#motion=tx-number-scramble) | Number Scramble Settle | text | 120 | steps / linear | have | `text/anime-scramble`, `text/scramble-reveal` | - |
| [`tx-progress-percent`](https://motion-reference.takayustudio.jp/#motion=tx-progress-percent) | Percent With Ring | text | 1600 | power2.out | have | `data/conic-progress-ring`, `data/mk-usage-arc` | - |
| [`tx-countdown-zoom`](https://motion-reference.takayustudio.jp/#motion=tx-countdown-zoom) | Countdown Zoom | text | 1000 | back.out → ease-in | partial | → `data/countdown` | high |
| [`tx-seven-segment`](https://motion-reference.takayustudio.jp/#motion=tx-seven-segment) | Seven-segment Display | text | 60 | linear | missing | → `data/seven-segment` | low |

### Exit (`tx-exit`, 9: have 3, generic 4, partial 1, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-char-exit-up`](https://motion-reference.takayustudio.jp/#motion=tx-char-exit-up) | Character Exit Up | text | 500 | power3.in | generic | `motion/anime` | - |
| [`tx-fade-down-out`](https://motion-reference.takayustudio.jp/#motion=tx-fade-down-out) | Fade Down Out | text | 600 | power1.in (easeInQuad) | have | `motion/anime`, `text/per-word-fade` | - |
| [`tx-blur-evaporate-out`](https://motion-reference.takayustudio.jp/#motion=tx-blur-evaporate-out) | Blur Evaporate Out | text | 600 | ease-out | have | `text/per-word-rise`, `motion/anime` | - |
| [`tx-explode-scatter-out`](https://motion-reference.takayustudio.jp/#motion=tx-explode-scatter-out) | Explode Scatter Out | text | 800 | power3.out | generic | `motion/anime` | - |
| [`tx-gravity-drop-out`](https://motion-reference.takayustudio.jp/#motion=tx-gravity-drop-out) | Gravity Drop Out | text | 1000 | power2.in | generic | `motion/anime` | - |
| [`tx-scale-down-vanish`](https://motion-reference.takayustudio.jp/#motion=tx-scale-down-vanish) | Scale-Down Vanish | text | 250 | power2.in | have | `motion/anime`, `house/pop-out` | - |
| [`tx-reverse-erase`](https://motion-reference.takayustudio.jp/#motion=tx-reverse-erase) | Reverse-Order Erase | text | 500 | easeOutCubic（逆再生） | generic | `motion/anime` | - |
| [`tx-collapse-to-center`](https://motion-reference.takayustudio.jp/#motion=tx-collapse-to-center) | Collapse To Center | text | 500 | power3.in | partial | → `text/snap-out` | medium |
| [`tx-noise-dissolve-out`](https://motion-reference.takayustudio.jp/#motion=tx-noise-dissolve-out) | Noise Dissolve | text | 1200 | linear | missing | → `text/noise-dissolve` | medium |

### Mask & Clip (`tx-mask`, 12: have 3, generic 1, partial 6, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-line-mask-rise`](https://motion-reference.takayustudio.jp/#motion=tx-line-mask-rise) | Masked Line Rise | text | 1000 | expo.out | have | `text/mask-rise`, `text/words-rise`, `motion/anime` | - |
| [`tx-char-mask-rise`](https://motion-reference.takayustudio.jp/#motion=tx-char-mask-rise) | Masked Character Rise | text | 500 | power3.out | have | `motion/anime`, `text/top-down-letters` | - |
| [`tx-slide-x-mask`](https://motion-reference.takayustudio.jp/#motion=tx-slide-x-mask) | Masked Horizontal Slide | text | 800 | expo.out | generic | `motion/anime` | - |
| [`tx-split-halves`](https://motion-reference.takayustudio.jp/#motion=tx-split-halves) | Split-Halves Slide | text | 700 | expo.out | missing | → `text/split-halves` | medium |
| [`tx-soft-mask-wipe`](https://motion-reference.takayustudio.jp/#motion=tx-soft-mask-wipe) | Soft Gradient Mask Wipe | text | 1200 | ease-out | partial | → `text/colorama-wipe` | high |
| [`tx-bar-wipe-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-bar-wipe-reveal) | Bar Wipe Reveal | text | 800 | ease-in-out | partial | → `text/bar-wipe` | high |
| [`tx-iris-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-iris-reveal) | Iris Circle Reveal | text | 800 | cubic-bezier(.7,0,.3,1) | have | `transition/iris-reveal` | - |
| [`tx-shape-mask-cut`](https://motion-reference.takayustudio.jp/#motion=tx-shape-mask-cut) | Shape-Mask Transition | text | 600 | ease-in (cubic) | partial | → `transition/iris-reveal` | high |
| [`tx-blinds-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-blinds-reveal) | Venetian Blinds Reveal | text | 600 | power2.out | missing | → `text/blinds` | medium |
| [`tx-diagonal-cut-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-diagonal-cut-reveal) | Diagonal Cut Reveal | text | 700 | expo.out | partial | → `text/bar-wipe` | medium |
| [`tx-outline-fill-sweep`](https://motion-reference.takayustudio.jp/#motion=tx-outline-fill-sweep) | Outline To Fill Sweep | text | 1000 | ease-in-out | partial | → `text/outline-fill` | high |
| [`tx-texture-fill`](https://motion-reference.takayustudio.jp/#motion=tx-texture-fill) | Texture / Video Fill | text | 20000 | linear | partial | → `text/texture-mask` | medium |

### Colour & Light (`tx-color-light`, 12: have 1, partial 7, missing 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-shiny-sweep`](https://motion-reference.takayustudio.jp/#motion=tx-shiny-sweep) | Shine Sweep | text | 2000 | cubic-bezier(.6,.6,0,1) | have | `text/text-shimmer`, `text/shimmer-sweep` | - |
| [`tx-gradient-flow`](https://motion-reference.takayustudio.jp/#motion=tx-gradient-flow) | Animated Gradient Text | text | 8000 | linear | partial | → `text/gradient-fill` | medium |
| [`tx-aurora-text`](https://motion-reference.takayustudio.jp/#motion=tx-aurora-text) | Aurora Text | text | 6000 | ease-in-out | partial | → `text/gradient-fill` | medium |
| [`tx-conic-spin`](https://motion-reference.takayustudio.jp/#motion=tx-conic-spin) | Conic Gradient Spin | text | 4000 | linear | partial | → `text/gradient-fill` | low |
| [`tx-color-band-sweep`](https://motion-reference.takayustudio.jp/#motion=tx-color-band-sweep) | Colour Band Sweep | text | 1500 | ease-in-out | partial | → `text/text-shimmer` | medium |
| [`tx-hue-cycle`](https://motion-reference.takayustudio.jp/#motion=tx-hue-cycle) | Per-Character Hue Cycle | text | 4000 | linear | missing | → `text/color-cycle` | low |
| [`tx-random-color-pop`](https://motion-reference.takayustudio.jp/#motion=tx-random-color-pop) | Colourful Text Cycle | text | 500 | ease-in-out | missing | → `text/color-cycle` | low |
| [`tx-neon-flicker`](https://motion-reference.takayustudio.jp/#motion=tx-neon-flicker) | Neon Flicker-On | text | 900 | steps | partial | → `text/glow` | medium |
| [`tx-glow-pulse`](https://motion-reference.takayustudio.jp/#motion=tx-glow-pulse) | Glow Pulse | text | 667 | ease-out | partial | → `text/glow` | medium |
| [`tx-line-shadow`](https://motion-reference.takayustudio.jp/#motion=tx-line-shadow) | Line Shadow Text | text | 15000 | linear | missing | → `text/stripe-shadow` | low |
| [`tx-long-shadow-grow`](https://motion-reference.takayustudio.jp/#motion=tx-long-shadow-grow) | Long Shadow Grow | text | 800 | ease-out | missing | → `text/long-shadow` | low |
| [`tx-blend-overlap`](https://motion-reference.takayustudio.jp/#motion=tx-blend-overlap) | Blend Overlap | text | 900 | ease-in-out | partial | → `text/tracking-in` | low |

### Blur & Focus (`tx-blur`, 9: have 6, generic 1, partial 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-text-generate`](https://motion-reference.takayustudio.jp/#motion=tx-text-generate) | Text Generate Effect | text | 800 | ease-out | have | `text/blur-in`, `text/streaming-text` | - |
| [`tx-blur-in-3step`](https://motion-reference.takayustudio.jp/#motion=tx-blur-in-3step) | 3-step Blur In | text | 700 | ease-out | have | `motion/anime`, `text/blur-in` | - |
| [`tx-blur-in-chars`](https://motion-reference.takayustudio.jp/#motion=tx-blur-in-chars) | Characters Blur In | text | 700 | ease-out cubic | have | `motion/anime`, `text/focus-blur-resolve` | - |
| [`tx-blur-random-in`](https://motion-reference.takayustudio.jp/#motion=tx-blur-random-in) | Random Blur In | text | 600 | power1.inOut | generic | `motion/anime` | - |
| [`tx-tracking-blur-build`](https://motion-reference.takayustudio.jp/#motion=tx-tracking-blur-build) | Blur + Tracking Build | text | 2000 | ease-out cubic | have | `text/tracking-in`, `motion/anime` | - |
| [`tx-directional-blur-slide`](https://motion-reference.takayustudio.jp/#motion=tx-directional-blur-slide) | Directional Blur Slide | text | 550 | easeOutExpo | partial | → `text/land-in` | high |
| [`tx-scale-blur-zoom`](https://motion-reference.takayustudio.jp/#motion=tx-scale-blur-zoom) | Scale Blur Zoom In | text | 700 | cubic-bezier(.2,.7,.2,1) | have | `text/focus-blur-resolve`, `text/soft-blur-in` | - |
| [`tx-rack-focus`](https://motion-reference.takayustudio.jp/#motion=tx-rack-focus) | Rack Focus | text | 1200 | ease-in-out | have | `camera/focus-rack`, `ui/focus-swap`, `motion/tween` | - |
| [`tx-true-focus`](https://motion-reference.takayustudio.jp/#motion=tx-true-focus) | True Focus | text | 500 | ease | partial | → `text/focus-frame` | medium |

### Distortion & Glitch (`tx-glitch`, 8: have 1, partial 5, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-rgb-split-glitch`](https://motion-reference.takayustudio.jp/#motion=tx-rgb-split-glitch) | RGB Split Glitch | text | 160 | steps | partial | → `text/rgb-glitch` | medium |
| [`tx-slice-glitch`](https://motion-reference.takayustudio.jp/#motion=tx-slice-glitch) | Slice Displacement | text | 67 | steps(1) | partial | → `text/rgb-glitch` | medium |
| [`tx-fuzzy-text`](https://motion-reference.takayustudio.jp/#motion=tx-fuzzy-text) | Fuzzy Text | text | 16 | random | missing | → `text/fuzzy` | low |
| [`tx-turbulence-wobble`](https://motion-reference.takayustudio.jp/#motion=tx-turbulence-wobble) | Turbulence Wobble | text | 100 | steps | partial | → `hand/boil` | low |
| [`tx-ascii-render`](https://motion-reference.takayustudio.jp/#motion=tx-ascii-render) | ASCII Text | text | 800 | linear | have | `effect/ascii-render-pass` | - |
| [`tx-vhs-scanline`](https://motion-reference.takayustudio.jp/#motion=tx-vhs-scanline) | VHS Tracking Noise | text | 3000 | linear | partial | → `effect/vhs` | medium |
| [`tx-pixel-mosaic`](https://motion-reference.takayustudio.jp/#motion=tx-pixel-mosaic) | Pixel Mosaic Resolve | text | 720 | steps(6) | partial | → `effect/pixelate` | medium |
| [`tx-melt-drip`](https://motion-reference.takayustudio.jp/#motion=tx-melt-drip) | Melt Drip | text | 2000 | ease-in | missing | → `text/melt` | low |

### Glyph Physics (`tx-physics`, 12: have 1, partial 7, missing 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-character-magnetize`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-character-magnetize) | Character Magnetize | canvas | 4200 | linear | partial | → `text/char-slam` | medium |
| [`catalog-kinetic-type-letter-collision`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-letter-collision) | Letter Collision Bounce | canvas | 4200 | linear | missing | → `text/collide` | low |
| [`ty-inertia`](https://motion-reference.takayustudio.jp/#motion=ty-inertia) | Inertia Letters | dom | 900 | damped sine | partial | → `motion/inertial-bounce` | medium |
| [`tx-drop-bounce-in`](https://motion-reference.takayustudio.jp/#motion=tx-drop-bounce-in) | Drop & Bounce In | text | 900 | bounce.out | partial | → `text/land-in` | high |
| [`tx-raining-characters`](https://motion-reference.takayustudio.jp/#motion=tx-raining-characters) | Raining Characters | text | 500 | easeOutCubic | partial | → `text/top-down-letters` | medium |
| [`tx-falling-pile`](https://motion-reference.takayustudio.jp/#motion=tx-falling-pile) | Falling Text Physics | text | 600 | gravity (½gt²) | missing | → `motion/physics-pile` | medium |
| [`tx-pendulum-swing`](https://motion-reference.takayustudio.jp/#motion=tx-pendulum-swing) | Pendulum Swing | text | 2400 | spring(90, 4.5) | partial | → `text/land-in` | medium |
| [`tx-squash-landing`](https://motion-reference.takayustudio.jp/#motion=tx-squash-landing) | Squash Landing | text | 1100 | power2 + elastic.out | partial | → `text/land-in` | medium |
| [`tx-spring-chain`](https://motion-reference.takayustudio.jp/#motion=tx-spring-chain) | Spring Chain Follow | text | 1900 | spring chain | missing | → `text/spring-chain` | low |
| [`tx-zero-gravity-drift`](https://motion-reference.takayustudio.jp/#motion=tx-zero-gravity-drift) | Zero-gravity Drift | text | 4500 | sine.inOut | partial | → `text/char-loop` | medium |
| [`tx-domino-topple`](https://motion-reference.takayustudio.jp/#motion=tx-domino-topple) | Domino Topple | text | 120 | power2.in | missing | → `text/domino` | low |
| [`tx-particle-text`](https://motion-reference.takayustudio.jp/#motion=tx-particle-text) | Particle Text | text | 900 | spring | have | `text/particle-dissolve` | - |

### Layout & Reflow (`tx-layout`, 10: have 3, generic 1, partial 4, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-line-break-reflow`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-line-break-reflow) | Line Break Reflow | canvas | 4200 | linear | generic | `motion/anime-layout` | - |
| [`catalog-kinetic-type-counterweight-headline`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-counterweight-headline) | Counterweight Headline | canvas | 4200 | linear | have | `motion/spring-track`, `motion/inertial-bounce` | - |
| [`tx-fit-text-title`](https://motion-reference.takayustudio.jp/#motion=tx-fit-text-title) | Fit-to-width Title | text | 800 | easeInOut | missing | → `engine / rig: film.json text option fit: width (font size set at build)` | medium |
| [`tx-stacked-justified`](https://motion-reference.takayustudio.jp/#motion=tx-stacked-justified) | Stacked Justified Words | text | 300 | easeOutCubic | missing | → `text/fit-stack` | high |
| [`tx-layout-word-insert`](https://motion-reference.takayustudio.jp/#motion=tx-layout-word-insert) | Layout-animated Word Swap | text | 400 | spring(300, 30) | partial | → `text/kinetic-type-swap` | high |
| [`tx-anagram-flip`](https://motion-reference.takayustudio.jp/#motion=tx-anagram-flip) | Anagram FLIP | text | 600 | cubic-bezier(.2,.8,.2,1) | partial | → `text/letter-morph` | medium |
| [`tx-balanced-reflow`](https://motion-reference.takayustudio.jp/#motion=tx-balanced-reflow) | Balanced Wrap Reflow | text | 600 | easeOutExpo | have | `text/words-rise`, `text/line-by-line-slide` | - |
| [`tx-line-spacing-collapse`](https://motion-reference.takayustudio.jp/#motion=tx-line-spacing-collapse) | Line-Spacing Collapse | text | 1000 | easeInOut | partial | → `text/line-by-line-slide` | medium |
| [`tx-kinetic-camera`](https://motion-reference.takayustudio.jp/#motion=tx-kinetic-camera) | Kinetic Camera Follow | text | 400 | cubic-bezier(.8,0,.2,1) | partial | → `text/caption-camera-follow` | high |
| [`tx-expand-truncated`](https://motion-reference.takayustudio.jp/#motion=tx-expand-truncated) | Truncate Expand | text | 450 | ease | have | `ui/panel-reveal`, `motion/anime-layout` | - |

### Captions & Subtitles (`tx-caption`, 13: have 4, partial 8, missing 1)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-echo-caption`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-echo-caption) | Echo Trail Caption | canvas | 4200 | linear | partial | → `motion/echo` | medium |
| [`tx-pop-on-subtitle`](https://motion-reference.takayustudio.jp/#motion=tx-pop-on-subtitle) | Pop-On Subtitle | text | 4200 | none (cut) | partial | → `text/captions` | high |
| [`tx-paint-on-caption`](https://motion-reference.takayustudio.jp/#motion=tx-paint-on-caption) | Paint-On Caption | text | 120 | steps (instant) | have | `text/type-on-mono`, `text/typewriter` | - |
| [`tx-roll-up-caption`](https://motion-reference.takayustudio.jp/#motion=tx-roll-up-caption) | Roll-Up Caption | text | 270 | easeOutCubic | partial | → `text/captions` | low |
| [`tx-live-caption-block`](https://motion-reference.takayustudio.jp/#motion=tx-live-caption-block) | Live Caption Block | text | 5400 | none (cut) | partial | → `text/captions` | low |
| [`tx-word-highlight-caption`](https://motion-reference.takayustudio.jp/#motion=tx-word-highlight-caption) | Active-Word Highlight | text | 80 | easeOutCubic | have | `text/captions`, `text/caption-particle-burst` | - |
| [`tx-highlight-pill`](https://motion-reference.takayustudio.jp/#motion=tx-highlight-pill) | Moving Highlight Pill | text | 100 | easeOutCubic | partial | → `text/caption-highlight` | medium |
| [`tx-hormozi-caption`](https://motion-reference.takayustudio.jp/#motion=tx-hormozi-caption) | Hormozi-Style Pop Captions | text | 150 | easeOutBack | partial | → `text/caption-emoji-pop` | medium |
| [`tx-caption-spring-pop`](https://motion-reference.takayustudio.jp/#motion=tx-caption-spring-pop) | Caption Spring Pop | text | 800 | spring(100, 10, 1) | have | `text/captions`, `text/shared-axis-z` | - |
| [`tx-karaoke-fill`](https://motion-reference.takayustudio.jp/#motion=tx-karaoke-fill) | Karaoke Fill | text | 4800 | linear | partial | → `text/caption-gradient-fill` | medium |
| [`tx-forced-narrative-fade`](https://motion-reference.takayustudio.jp/#motion=tx-forced-narrative-fade) | Forced-Narrative Fade Sync | text | 300 | linear | have | `text/land-in`, `motion/tween` | - |
| [`tx-rsvp-flash`](https://motion-reference.takayustudio.jp/#motion=tx-rsvp-flash) | RSVP Word Flash | text | 200 | steps (instant) | missing | → `text/rsvp` | low |
| [`tx-phrase-line-break`](https://motion-reference.takayustudio.jp/#motion=tx-phrase-line-break) | Phrase-Aware Line Break | text | 550 | easeOutExpo | partial | → `text/captions` | low |

### 3D & Depth (`tx-depth`, 10: partial 7, missing 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-type-tunnel`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-type-tunnel) | Perspective Type Tunnel | canvas | 4200 | linear | missing | → `background/type-tunnel` | medium |
| [`tx-flip-up-3d`](https://motion-reference.takayustudio.jp/#motion=tx-flip-up-3d) | 3D Flip Up | text | 800 | expo.out | partial | → `text/land-in` | high |
| [`tx-swing-door`](https://motion-reference.takayustudio.jp/#motion=tx-swing-door) | Swing Door | text | 1000 | expo.out | partial | → `text/land-in` | medium |
| [`tx-z-fly-in`](https://motion-reference.takayustudio.jp/#motion=tx-z-fly-in) | Fly In From Depth | text | 900 | back.out(1.2) | partial | → `text/land-in` | medium |
| [`tx-tumble-in`](https://motion-reference.takayustudio.jp/#motion=tx-tumble-in) | Tumbling 3D Entrance | text | 1300 | power1.inOut | partial | → `text/land-in` | medium |
| [`tx-roll-flip-hover`](https://motion-reference.takayustudio.jp/#motion=tx-roll-flip-hover) | 3D Roll Flip | text | 400 | ease-in-out | partial | → `text/anime-roll` | medium |
| [`tx-cylinder-text`](https://motion-reference.takayustudio.jp/#motion=tx-cylinder-text) | 3D Cylinder Text | text | 6000 | linear | missing | → `text/cylinder` | medium |
| [`tx-layered-depth`](https://motion-reference.takayustudio.jp/#motion=tx-layered-depth) | Layered Depth Text | text | 600 | spring | partial | → `text/extrude` | medium |
| [`tx-paper-fold`](https://motion-reference.takayustudio.jp/#motion=tx-paper-fold) | Paper Fold | text | 700 | power2.out | missing | → `text/paper-fold` | medium |
| [`tx-motext-falloff`](https://motion-reference.takayustudio.jp/#motion=tx-motext-falloff) | MoText Falloff Sweep | text | 1700 | linear + spring | partial | → `text/falloff-sweep` | medium |

### Scroll (`tx-scroll`, 13: have 3, generic 1, partial 6, missing 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-chapter-index-scrub`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-chapter-index-scrub) | Scrubbed Chapter Index | canvas | 4200 | linear | partial | → `data/number-wheel` | low |
| [`tx-scroll-word-highlight`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-word-highlight) | Scroll Word Highlight | text | 3800 | linear (scrub) | have | `text/mk-word-sweep`, `text/streaming-text`, `text/caption-pill-karaoke` | - |
| [`tx-view-timeline-words`](https://motion-reference.takayustudio.jp/#motion=tx-view-timeline-words) | View-timeline Word Reveal | text | 3800 | linear (scroll) | have | `text/per-word-fade`, `text/staggered-fade-up` | - |
| [`tx-scroll-blur-tilt`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-blur-tilt) | Scroll Reveal Blur + Tilt | text | 3800 | none (scrub) | have | `text/blur-in`, `motion/tween` | - |
| [`tx-scroll-clip-write`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-clip-write) | Scroll Clip Write-on | text | 3600 | linear (scroll) | partial | → `text/mask-rise` | high |
| [`tx-scroll-velocity-marquee`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-velocity-marquee) | Scroll Velocity Marquee | text | 5000 | spring (damping 50, stiffness 400) | partial | → `text/marquee` | medium |
| [`tx-scroll-skew`](https://motion-reference.takayustudio.jp/#motion=tx-scroll-skew) | Velocity Skew | text | 800 | power3 | missing | → `motion/velocity-skew` | low |
| [`tx-horizontal-letter-drop`](https://motion-reference.takayustudio.jp/#motion=tx-horizontal-letter-drop) | Horizontal Scroll Letter Drop | text | 4000 | back.out(2) (scrub) | partial | → `text/land-in` | medium |
| [`tx-dual-wave-columns`](https://motion-reference.takayustudio.jp/#motion=tx-dual-wave-columns) | Dual Wave Columns | text | 4000 | none (scrub) | missing | → `text/wave-columns` | low |
| [`tx-repetition-echo`](https://motion-reference.takayustudio.jp/#motion=tx-repetition-echo) | Text Repetition Echo | text | 1000 | power2.inOut (scrub) | missing | → `text/echo-fan` | medium |
| [`tx-text-window-zoom`](https://motion-reference.takayustudio.jp/#motion=tx-text-window-zoom) | Text Window Zoom | text | 4200 | none (scrub) | partial | → `transition/letter-zoom` | high |
| [`tx-sticky-shrink-headline`](https://motion-reference.takayustudio.jp/#motion=tx-sticky-shrink-headline) | Sticky Shrinking Headline | text | 3800 | linear (scroll) | generic | `motion/anime-layout`, `motion/tween` | - |
| [`tx-parallax-lines`](https://motion-reference.takayustudio.jp/#motion=tx-parallax-lines) | Line Parallax | text | 4000 | linear (scroll) | partial | → `text/line-by-line-slide` | low |

### Titles & Film (`tx-title`, 13: have 5, partial 5, missing 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`catalog-kinetic-type-headline-ribbon`](https://motion-reference.takayustudio.jp/#motion=catalog-kinetic-type-headline-ribbon) | Headline Ribbon Wrap | canvas | 4200 | linear | partial | → `text/inline-highlight` | medium |
| [`tx-tracking-in-contract`](https://motion-reference.takayustudio.jp/#motion=tx-tracking-in-contract) | Tracking-In Contract | text | 2800 | easeOutQuart | have | `text/tracking-in` | - |
| [`tx-slow-tracking-expand`](https://motion-reference.takayustudio.jp/#motion=tx-slow-tracking-expand) | Slow Tracking Expand | text | 6000 | linear | have | `text/tracking-in` | - |
| [`tx-fade-through-black`](https://motion-reference.takayustudio.jp/#motion=tx-fade-through-black) | Fade-Through-Black Card | text | 500 | easeInOutSine | have | `transition/fade-through`, `motion/tween` | - |
| [`tx-slam-in-title`](https://motion-reference.takayustudio.jp/#motion=tx-slam-in-title) | Slam-In Title | text | 200 | cubic-bezier(.7,0,1,1) | partial | → `text/headline-slam` | high |
| [`tx-flash-frame-cut`](https://motion-reference.takayustudio.jp/#motion=tx-flash-frame-cut) | Flash-Frame Card Cut | text | 125 | steps(3) | have | `effect/editorial-flash`, `logo/logo-sting`, `transition/shader-flash-white` | - |
| [`tx-opening-crawl`](https://motion-reference.takayustudio.jp/#motion=tx-opening-crawl) | Perspective Opening Crawl | text | 60000 | linear | missing | → `title/credits-roll` | low |
| [`tx-racing-credits`](https://motion-reference.takayustudio.jp/#motion=tx-racing-credits) | Bass-style Racing Credits | text | 270 | linear | partial | → `lower/stack-bars` | medium |
| [`tx-split-bars-title`](https://motion-reference.takayustudio.jp/#motion=tx-split-bars-title) | Sliced Bars Title | text | 700 | easeOutExpo | missing | → `text/slice-in` | high |
| [`tx-film-scratch-jitter`](https://motion-reference.takayustudio.jp/#motion=tx-film-scratch-jitter) | Scratched Film Jitter | text | 42 | steps(1) | partial | → `hand/boil` | medium |
| [`tx-stamp-cutout`](https://motion-reference.takayustudio.jp/#motion=tx-stamp-cutout) | Rubber-Stamp Cut-out Pop | text | 167 | steps(2) | partial | → `text/land-in` | medium |
| [`tx-light-leak-burn`](https://motion-reference.takayustudio.jp/#motion=tx-light-leak-burn) | Light-Leak Title Burn | text | 900 | easeInOut | have | `effect/light-leak-overlay`, `transition/shader-light-leak`, `house/glow-card` | - |
| [`tx-letterbox-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-letterbox-reveal) | Letterbox Reveal | text | 800 | easeInOut | missing | → `effect/letterbox` | high |

### Path & Shape (`tx-path`, 9: have 1, partial 2, missing 6)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-circular-text-spin`](https://motion-reference.takayustudio.jp/#motion=tx-circular-text-spin) | Circular Text Spin | text | 10000 | linear | missing | → `text/text-on-path` | medium |
| [`tx-curved-loop-marquee`](https://motion-reference.takayustudio.jp/#motion=tx-curved-loop-marquee) | Curved Loop Marquee | text | 4000 | linear | missing | → `text/text-on-path` | medium |
| [`tx-text-along-path`](https://motion-reference.takayustudio.jp/#motion=tx-text-along-path) | Text Along Path | text | 1200 | easeOutCubic → easeInCubic | missing | → `text/text-on-path` | medium |
| [`tx-path-inertia`](https://motion-reference.takayustudio.jp/#motion=tx-path-inertia) | Path With Tracking Inertia | text | 900 | inertia (damped sine) | partial | → `motion/inertial-bounce` | medium |
| [`tx-outline-draw`](https://motion-reference.takayustudio.jp/#motion=tx-outline-draw) | Outline Stroke Draw | text | 2000 | ease-in-out | partial | → `logo/svg-reveal` | medium |
| [`tx-handwriting`](https://motion-reference.takayustudio.jp/#motion=tx-handwriting) | Handwriting Write-on | text | 2200 | ease-in-out (per stroke) | have | `hand/write-title`, `hand/path-text` | - |
| [`tx-spiral-text`](https://motion-reference.takayustudio.jp/#motion=tx-spiral-text) | Spiral Text | text | 8000 | linear | missing | → `text/text-on-path` | low |
| [`tx-morphing-path-ride`](https://motion-reference.takayustudio.jp/#motion=tx-morphing-path-ride) | Morphing Path Ride | text | 1500 | ease-in-out | missing | → `text/text-on-path` | low |
| [`tx-shape-contour-text`](https://motion-reference.takayustudio.jp/#motion=tx-shape-contour-text) | Shape Contour Text | text | 10000 | linear | missing | → `text/text-on-path` | low |

### Pointer (`tx-pointer`, 9: have 2, partial 3, missing 4)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-magnetic-letters`](https://motion-reference.takayustudio.jp/#motion=tx-magnetic-letters) | Magnetic Letters | text | 400 | power3.out | missing | → `text/cursor-field` | low |
| [`tx-proximity-repel`](https://motion-reference.takayustudio.jp/#motion=tx-proximity-repel) | Pointer Proximity Repel | text | 300 | lerp 0.15 (exponential) | missing | → `text/cursor-field` | low |
| [`tx-proximity-scramble`](https://motion-reference.takayustudio.jp/#motion=tx-proximity-scramble) | Proximity Scramble | text | 1200 | none (linear) | partial | → `text/cursor-field` | low |
| [`tx-clone-roll-hover`](https://motion-reference.takayustudio.jp/#motion=tx-clone-roll-hover) | Clone Roll Hover | text | 400 | out(3) / easeOutCubic | have | `text/anime-roll` | - |
| [`tx-hover-word-lift`](https://motion-reference.takayustudio.jp/#motion=tx-hover-word-lift) | Hover Word Lift | text | 250 | spring(400, 26) | missing | → `text/cursor-field` | low |
| [`tx-cursor-text-trail`](https://motion-reference.takayustudio.jp/#motion=tx-cursor-text-trail) | Text Cursor Trail | text | 500 | easeOutBack (in) / easeOut (exit) | partial | → `cursor/glyph-trail` | low |
| [`tx-spotlight-outline`](https://motion-reference.takayustudio.jp/#motion=tx-spotlight-outline) | Spotlight Outline Hover | text | 4000 | ease-in-out | partial | → `text/outline-spotlight` | low |
| [`tx-pointer-reveal-card`](https://motion-reference.takayustudio.jp/#motion=tx-pointer-reveal-card) | Pointer Reveal Card | text | 400 | easeOutCubic | have | `compare/comparison-split`, `compare/before-after-wipe` | - |
| [`tx-lens-bulge`](https://motion-reference.takayustudio.jp/#motion=tx-lens-bulge) | Cursor Bulge Lens | text | 350 | easeInOutCubic | missing | → `effect/lens-bulge` | low |

### Loops & Decoration (`tx-loop`, 8: have 1, partial 5, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-wave-loop`](https://motion-reference.takayustudio.jp/#motion=tx-wave-loop) | Wave Loop | text | 1200 | ease-in-out | partial | → `text/char-loop` | medium |
| [`tx-infinite-marquee`](https://motion-reference.takayustudio.jp/#motion=tx-infinite-marquee) | Infinite Marquee | text | 20000 | linear | missing | → `text/marquee` | medium |
| [`tx-scale-breathe`](https://motion-reference.takayustudio.jp/#motion=tx-scale-breathe) | Wiggly Scale Breathe | text | 1600 | sine | partial | → `text/char-loop` | medium |
| [`tx-sparkles-text`](https://motion-reference.takayustudio.jp/#motion=tx-sparkles-text) | Sparkles Text | text | 800 | ease-in-out | missing | → `text/sparkles` | medium |
| [`tx-jump-sequence`](https://motion-reference.takayustudio.jp/#motion=tx-jump-sequence) | Sequential Hop | text | 400 | ease-out / ease-in (parabola) | partial | → `text/char-loop` | medium |
| [`tx-y-spin-stagger`](https://motion-reference.takayustudio.jp/#motion=tx-y-spin-stagger) | Staggered Y Spin | text | 800 | power2.inOut | partial | → `text/char-loop` | medium |
| [`tx-loading-dots`](https://motion-reference.takayustudio.jp/#motion=tx-loading-dots) | Loading Dots | text | 1200 | ease-in-out | partial | → `text/char-loop` | low |
| [`tx-hanging-sway`](https://motion-reference.takayustudio.jp/#motion=tx-hanging-sway) | Hanging Sign Sway | text | 2400 | ease-in-out | have | `motion/pendulum-swing`, `house/deco-float` | - |

### Japanese (`tx-japanese`, 14: have 2, partial 9, missing 3)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-bunsetsu-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-bunsetsu-reveal) | Bunsetsu Phrase Reveal | text | 600 | easeOutExpo | have | `text/per-word-fade`, `text/shared-axis-y` | - |
| [`tx-yakumono-pause`](https://motion-reference.takayustudio.jp/#motion=tx-yakumono-pause) | Punctuation-Aware Pause | text | 60 | steps (per char) | partial | → `text/typewriter` | medium |
| [`tx-tategaki-reveal`](https://motion-reference.takayustudio.jp/#motion=tx-tategaki-reveal) | Tategaki Reveal | text | 500 | easeOutExpo | missing | → `engine / rig: film.json text option writing-mode: vertical-rl (+ text/top-` | low |
| [`tx-ruby-sync`](https://motion-reference.takayustudio.jp/#motion=tx-ruby-sync) | Ruby Sync Reveal | text | 600 | easeOutCubic | missing | → `engine / rig: text split units: ruby (base + reading as one unit)` | low |
| [`tx-ime-conversion`](https://motion-reference.takayustudio.jp/#motion=tx-ime-conversion) | IME Kana-Kanji Conversion | text | 90 | steps (per keystroke) | partial | → `ui/typed-prompt` | low |
| [`tx-kanji-stroke-order`](https://motion-reference.takayustudio.jp/#motion=tx-kanji-stroke-order) | Kanji Stroke Order | text | 300 | ease-in-out | have | `line/anime-draw`, `logo/svg-reveal` | - |
| [`tx-brush-write-on`](https://motion-reference.takayustudio.jp/#motion=tx-brush-write-on) | Brush Calligraphy Write-On | text | 350 | ease-in-out | partial | → `logo/svg-reveal` | medium |
| [`tx-onomatopoeia-impact`](https://motion-reference.takayustudio.jp/#motion=tx-onomatopoeia-impact) | Manga Onomatopoeia Impact | text | 167 | linear (no easing) | partial | → `hand/comic-text` | medium |
| [`tx-lyric-tame-tsume`](https://motion-reference.takayustudio.jp/#motion=tx-lyric-tame-tsume) | Lyric Motion Tame/Tsume | text | 300 | cubic-bezier(.9,0,.1,1) | partial | → `text/land-in` | medium |
| [`tx-danmaku-comments`](https://motion-reference.takayustudio.jp/#motion=tx-danmaku-comments) | Danmaku Comment Scroll | text | 3500 | linear | missing | → `social/comment-stream` | medium |
| [`tx-eva-mincho-card`](https://motion-reference.takayustudio.jp/#motion=tx-eva-mincho-card) | Extra-Bold Mincho Card | text | 333 | none (cut) | partial | → `text/flipbook-word-cycle` | medium |
| [`tx-jp-subtitle-timing`](https://motion-reference.takayustudio.jp/#motion=tx-jp-subtitle-timing) | Japanese Subtitle 4 cps | text | 2000 | none (cut) | partial | → `text/captions` | low |
| [`tx-vertical-subtitle`](https://motion-reference.takayustudio.jp/#motion=tx-vertical-subtitle) | Vertical Subtitle | text | 4200 | none (cut) | partial | → `text/captions` | low |
| [`tx-cinema-handwritten-subtitle`](https://motion-reference.takayustudio.jp/#motion=tx-cinema-handwritten-subtitle) | Handwritten-style Film Subtitle | text | 4400 | none (cut) | partial | → `text/captions` | low |

### Broadcast & Telop (`tx-broadcast`, 12: have 4, partial 6, missing 2)

| id | name | engine | ms | ease | status | kit / target | prio |
|---|---|---|---|---|---|---|---|
| [`tx-lower-third`](https://motion-reference.takayustudio.jp/#motion=tx-lower-third) | Lower Third | text | 400 | easeOutExpo | have | `lower/clean-bar`, `lower/stack-bars`, `lower/bold-block` | - |
| [`tx-news-ticker`](https://motion-reference.takayustudio.jp/#motion=tx-news-ticker) | News Ticker Crawl | text | 4000 | linear | have | `lower/news-ticker` | - |
| [`tx-breaking-banner`](https://motion-reference.takayustudio.jp/#motion=tx-breaking-banner) | Breaking News Banner | text | 267 | easeOutCubic | partial | → `lower/news-ticker` | medium |
| [`tx-credits-roll`](https://motion-reference.takayustudio.jp/#motion=tx-credits-roll) | End Credits Roll | text | 60000 | linear | missing | → `title/credits-roll` | medium |
| [`tx-led-dot-matrix`](https://motion-reference.takayustudio.jp/#motion=tx-led-dot-matrix) | LED Dot-Matrix Marquee | text | 45 | steps(1) | missing | → `text/led-matrix` | low |
| [`tx-telop-pop-outline`](https://motion-reference.takayustudio.jp/#motion=tx-telop-pop-outline) | Pop-In Double-Outline Telop | text | 200 | easeOutBack | partial | → `text/telop` | medium |
| [`tx-telop-shake`](https://motion-reference.takayustudio.jp/#motion=tx-telop-shake) | Shaking Telop | text | 100 | random | partial | → `hand/boil` | medium |
| [`tx-telop-zabuton`](https://motion-reference.takayustudio.jp/#motion=tx-telop-zabuton) | Zabuton Plate Wipe | text | 233 | easeOutExpo | have | `lower/bold-block`, `house/tag-pop`, `text/inline-highlight` | - |
| [`tx-telop-tsukkomi`](https://motion-reference.takayustudio.jp/#motion=tx-telop-tsukkomi) | Tsukkomi Slam Telop | text | 100 | easeInQuad | partial | → `hand/comic-text` | medium |
| [`tx-telop-kirakira`](https://motion-reference.takayustudio.jp/#motion=tx-telop-kirakira) | Sparkle-Appear Telop | text | 233 | easeOutBack | partial | → `text/sparkles` | medium |
| [`tx-telop-comment-follow`](https://motion-reference.takayustudio.jp/#motion=tx-telop-comment-follow) | Comment-Follow Telop | text | 167 | easeOutBack | partial | → `text/captions` | medium |
| [`tx-telop-side-super`](https://motion-reference.takayustudio.jp/#motion=tx-telop-side-super) | Side Super | text | 333 | easeInOut | have | `text/state-swap`, `house/ticker-slide` | - |
