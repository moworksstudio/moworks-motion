# Intake: motion-reference.takayustudio.jp (a website, not a repository)

- **Read:** 2026-10-12, no commit (a website): https://motion-reference.takayustudio.jp/, `index.html` and the 25 scripts and
  stylesheets it loads, as served that day (file versions `?v=20260815-3` to `?v=20261012-2`; SHA-256 at the end). Upstream projects the
  site names, read at: codrops/OnScrollTypographyAnimations `af28d61`, magicuidesign/magicui `85f97fd`, barvian/number-flow `c5906cf`,
  DavidHDev/react-bits (`LICENSE.md` and three text components, default branch on 2026-10-12), mattboldt/typed.js (`LICENSE.txt`,
  `package.json` 3.0.0).
- **Licence:** code: **none stated**. No terms page (`/terms.html`, `/LICENSE` are 404). The footer says the site is
  "映像・UI・アニメーション制作で動きを設計するための、オリジナルデモによる個人学習用リファレンスです" (a reference of original demos for
  personal study, for designing motion in video, UI and animation); the operator's site says "© TakayuStudio"; the page carries ads and
  promotes the author's paid course. · assets: none to take (every demo is drawn by code; the fonts come from Google Fonts). Third-party
  origins the site itself names for 79 of its 228 text motions: react-bits (MIT + Commons Clause), typed.js (GPL-3.0), magicui, codrops,
  number-flow (MIT), anime.js (MIT), BudouX (Apache-2.0), aceternity (Pro licence forbids redistribution; free tier unclear).
- **What it is:** a searchable dictionary of 782 motions by TakayuStudio (a game-UI motion designer): principles, easing, springs,
  timing, basic moves, transitions, camera, UI and game micro-interactions, data storytelling and 228 text motions. Each entry has a looping
  demo with scrubbing, frame stepping and onion skin, the duration and ease, an After Effects recipe, and code tabs (`seek(t)`, HTML, CSS,
  WAAPI, GSAP, React) generated from the demo. 336 demos are drawn on a 320 x 200 canvas as a function of time, 218 are keyframe tracks
  on DOM elements, 228 run in its text engine.

## Tóm tắt cho người dùng

**Quyết định của bạn (12/10/2026):** **nhập hết** 782 motion vào "Mới nhập", mỗi motion một mục riêng, kể cả cái kit đã có (để
so cạnh nhau) và 12 bài học (thành clip minh hoạ). Bạn chọn GIỮ / BỎ trên Gallery. Ưu tiên trong bảng dưới chỉ còn là **thứ tự
nhập**. Mỗi mục ghi nguồn trong `preset.json` (card Gallery hiện "Nguồn"), lọc được bằng hàng "Nguồn" (họ mới: TakayuStudio).
Vẫn không chép code của trang: kit tự viết từng mục từ thông số. Mỗi mục mang thêm **tag theo cách phân loại của trang** (danh mục
như `camera`, `easing`, `text-reveal` và cảm giác `smooth` / `crisp` / `soft` / `heavy` / `bouncy`), nên gõ vào ô tìm kiếm của
Gallery là lọc được như trên trang Takayu.

**Cách lấy:** lấy **ý tưởng và thông số** của cả 782 motion (tên, thời lượng, easing, keyframe); **không chép code của trang**. Thông số
được ghi lại bằng lời của báo cáo này, kit tự viết preset từ đó. Ý tưởng chuyển động và thuật toán không được bảo hộ (Luật bản quyền Nhật,
Điều 10 khoản 3); mã nguồn thì được bảo hộ, mà trang không cho giấy phép nào.

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | Danh mục 782 motion đối chiếu với kit: 311 đã có, 55 chỉ làm được bằng preset chung, **317 có gần giống, 87 còn thiếu**, 12 bài học (nhập thành clip minh hoạ) | Báo cáo này + [specs](2026-10-12-motion-reference-takayustudio-specs.md) + [catalog](2026-10-12-motion-reference-takayustudio-catalog.md) | ý tưởng, thông số | cao | xong | đã lấy |
| 2 | **40 việc ưu tiên cao** (65 motion): mở rộng `text/land-in` (tách từng chữ), `motion/camera`, `effect/ring-pulse`, `motion/squash-stretch`, `motion/emphasis`, `data/odometer`, `motion/card-flip`, `transition/crossfade` và 6 chuyển cảnh khác, chế độ phụ đề của `text/captions`… | `library/presets/<group>/` qua "Mới nhập" | code kit tự viết (`"license": "kit"`) | cao | ước tính thô 15–25 giờ (chưa đo) | viết lại từ thông số |
| 3 | 126 việc ưu tiên vừa (237 motion): thanh HUD, chữ chạy theo đường, vòng lặp từng chữ, nổ hạt, gợn mực, nút bấm, gập giấy… | như trên, theo lô | code kit tự viết | vừa | ước tính thô 40–70 giờ | viết lại, theo lô |
| 4 | 45 việc ưu tiên thấp (102 motion: HUD game, cuộn web, quy ước chữ tiếng Nhật) | như trên | code kit tự viết | thấp | — | nhập ở đợt cuối |
| 5 | Tên easing còn thiếu: Material 3 (standard, emphasized, accelerate), CSS `ease`, whip / glide, và `expoScale`, `slowMo`, `rough` của GSAP EasePack (đã có trong `engine/vendor/gsap` nhưng phim chưa nạp) | `engine/vendor/libs/aimk/eases.js` | kit / GSAP Standard License | vừa–cao | 1–2 giờ | viết lại |
| 6 | Quy tắc thời lượng theo căn bậc hai quãng đường (chưa có trong luật của skill) | `workflow/recipes.md` | ý tưởng | thấp–vừa | < 1 giờ | viết lại |
| 7 | **codrops OnScrollTypographyAnimations**: 29 hiệu ứng chữ; 17 motion của trang ghi nguồn repo này (24 ghi nguồn Codrops nói chung) | intake riêng → preset `text/` | MIT | vừa–cao | intake riêng | port từ repo gốc, giữ thông số và ghi công MIT |
| 8 | **magicui**: 79 component React; 19 motion của trang ghi nguồn magicui | intake riêng | MIT | vừa | intake riêng | port (React → GSAP), ghi công MIT |
| 9 | number-flow (2 motion) | `data/odometer` (mới) | MIT | vừa | 2–4 giờ | port thông số (WAAPI → đồng hồ của phim) |
| 10 | Code của trang (`seek(t)` canvas, track WAAPI, text engine, tab React) | — | không có giấy phép, "học cá nhân" | — | — | không chép code; chuyển động vẫn nhập, kit tự viết |
| 11 | Code react-bits (trang nhắc ở 29 motion) | — | MIT + Commons Clause: cấm phân phối lại, kể cả bản port | — | — | không lấy code; chuyển động viết mới |
| 12 | typed.js, aceternity | — | GPL-3.0 / chưa rõ | — | — | không lấy code; chuyển động vẫn nhập, kit tự viết |

**Kết luận:** nhập hết 782 motion vào "Mới nhập" (kit tự viết từ thông số, không chép code của trang), bạn chọn trên Gallery. Thứ tự
nhập: (1) 40 việc ưu tiên cao, (2) tên easing, (3) 126 việc ưu tiên vừa, (4) phần ưu tiên thấp, các motion kit đã có và 12 bài học.
codrops và magicui có báo cáo riêng (port nguyên thông số, MIT).

## Import plan (decided with the user, 2026-10-12)

The user reviews everything on the Gallery and decides per item, so **nothing is dropped at intake**: every one of the 782 motions goes into
"Mới nhập" (`library/incoming/`, out of git) as **its own Gallery item**, including the ones the kit already has (for a side-by-side
look; their `desc_vi` ends with "Kit đã có: `<name>`"). The priorities in this report are only the **import order**. The user presses
GIỮ / BỎ per item; only GIỮ moves an item into the tracked (public) library, so licence questions are settled at GIỮ, not at import.

**Classification: the library's own three layers, no extra tags.**
1. **Group folder by purpose** (`text`, `transition`, `motion`, `effect`, `ui`, `background`, `line`, `data`, `map`... for presets; the
   layout groups for blocks). The Gallery derives its category from the group (`engine/gallery.py` `category()`).
2. **Source in `preset.json`**: `source` (`label`, `repo`, `commit`, `path` or `url`) and `license`, shown on the Gallery card as
   "Nguồn" and "License". For this source: `"source": {"label": "TakayuStudio motion-reference: <id> (motion idea, written for the kit)", "url":
   "https://motion-reference.takayustudio.jp/#motion=<id>"}`, `"license": "kit"`; when the site credits an upstream, `notes` says so
   ("site credits react-bits" / "typed.js" / "aceternity" / "Codrops" / "Magic UI").
3. **The Gallery's "Nguồn" filter** groups labels into families (`srcShort` in `library/gallery/index.html`: HyperFrames, Moworks v1,
   iart-ai (MIT), claude-animation (MIT), anime.js (MIT), else Moworks). Add the family "TakayuStudio (ý tưởng)" (label starts "TakayuStudio") there, written like the existing five
   (one regex on the label), so "Mới nhập" can be filtered by source while the user reviews.

**Tags (the site's own classification, kept for review):** each imported preset's `tags` gets, besides the kit's descriptive tags,
the site's category and feel from the catalogue's "site tags" column: the category as a slug of its English name (`camera`,
`timing-rhythm`, `game-hud`, `text-glyph-physics`...) and the feel as `smooth`, `crisp`, `soft`, `heavy` or `bouncy` (the site's
なめらか / きびきび / やわらかい / 重い / 弾む). The Gallery's search box already covers tags, so typing `camera` or `bouncy` in
"Mới nhập" shows the site's grouping; no new filter. A "Cảm giác" (feel) filter on the Gallery would be a new feature: only if the
user asks.

**Names:** by purpose inside the group; when a name is taken (in the library or by another source of the same batch), prefix the source
the way the anime.js family is named (`motion/anime-path`, `text/anime-roll`): `takayu-`. Once the user has chosen, kept siblings can be
merged into one preset with a `style` param (a rename the desktop session proposes to the user, never on its own).

**What cannot run as it is gets adapted, not dropped:** content fetched from the network becomes params or the project's own media; live
mouse, hover, click or scroll becomes a scripted path or cue times on the film's timeline; frames that imitate a real product get
`"brand_ui": true`; anything of unclear licence stays in "Mới nhập" with a note in `notes` (replace or drop it before GIỮ if unsure).
The site's code is still not copied: every item is written for the kit from the specs; the 29 motions that credit
react-bits and the one crediting typed.js are written from the spec only. The 12 lessons become demo clips of the principle with
neutral shapes (`desc_vi` starting "Bài học:"). Motions that credit Codrops or Magic UI are imported here too (as the site's
version) besides the faithful ports of the other two reports, so the user can compare both.

**Batches:** (1) magicui, 79 items; (2) codrops, 29 items; (3) the TakayuStudio motions by category, about 100 per batch, high-priority
categories first. Each batch: write the presets in a scratch film, `kit.py library import <film> <group>/<name>` for each, `kit.py gallery
build`, then the user's review.

## Rules for the skill

27 candidate rules from the site's own text guides (stagger budgeted by total time, an overshoot budget for text with springs at
damping ratio ≥ 0.6, NFC + grapheme splitting, subtitle line / duration limits, phrase-aware line breaks that keep Vietnamese words
together, whole-pixel speeds for tickers, MP4 chroma on small text...), each with where it would go, what the kit already says and
what to verify first: [text rules](2026-10-12-motion-reference-takayustudio-text-rules.md). One of them is a kit defect found on the way:
`ctx.split(el, "chars")` (`engine/runtime/spec-runtime.js`, line 108) splits by code point without NFC, so Vietnamese typed with
combining marks comes apart in per-letter effects.

## Already in the kit

| Group | Motions | have | generic | partial | missing | skip | high | medium | low |
|---|---|---|---|---|---|---|---|---|---|
| Principles, easing, springs, timing | 73 | 42 | 7 | 8 | 6 | 10 | 2 | 6 | 6 |
| Basic moves (entrance, move, scale, rotate, bounce, list, attention, light) | 91 | 33 | 20 | 34 | 4 | 0 | 8 | 26 | 4 |
| Film (transitions, camera, effects, look, particles, loops, character, sound, 3D, SVG, data story) | 129 | 54 | 1 | 63 | 10 | 1 | 19 | 46 | 8 |
| Web and app UI | 174 | 83 | 10 | 66 | 14 | 1 | 8 | 59 | 13 |
| Game UI | 67 | 16 | 0 | 41 | 10 | 0 | 6 | 22 | 23 |
| Text (22 categories) | 248 | 83 | 17 | 105 | 43 | 0 | 22 | 78 | 48 |
| **Total** | **782** | **311** | **55** | **317** | **87** | **12** | **65** | **237** | **102** |

(high / medium / low count only the partial and missing motions.) Per motion: the
[catalogue](2026-10-12-motion-reference-takayustudio-catalog.md).

- **Where the kit is already as good or better.** Its presets are film elements, not lessons: Vietnamese text with diacritics, the
  film's clock, editable After Effects layers, Gallery checks. The basic entrances, masks, wipes, blur and per-word reveals, typewriter,
  scramble, counters, highlights, captions (17 `caption-*` presets, `text/captions`, `text/embedded-captions` with HyperFrames' 35 caption styles), springs (`spring.*`, `springk`,
  `ctx.track`), motion paths and anime.js layouts cover most of the site's foundations and about a third of its text motions. The kit's
  HyperFrames transition and effect layouts (44 + 34) cover many full-frame looks the site only sketches.
- **Where the site is ahead.** (1) Breadth of small, named variants: emphasis moves (nudge, jelly, nod, hop, tilt), squash and stretch,
  ring pulses, card and coin flips, camera moves as a vocabulary (push, pull, truck, pedestal, crane, vertigo, parallax). (2) Per-character
  3D entrances that the kit's `text/land-in` does only per word. (3) Plain scene transitions usable as `transition_in`: the kit has push,
  directional wipe, iris, curtain, whip pan and zoom-through, but **no crossfade, blur dissolve, blinds, blocks, card flip or cover wipe**
  (the HyperFrames layouts `transition/showcase-dissolve`, `transition/showcase-blur` and `transition/fade-through`, Apache-2.0 and
  already in the kit, show several of these as demo blocks: their code is the first place to take them from).
  (4) Named eases (Material 3, CSS `ease`) and GSAP's EasePack eases. (5) Subtitle conventions (cut-on cues, roll-up, line breaking
  rules) beside the kit's karaoke-style captions. (6) Each entry's metadata (feel, use, trigger, reduced-motion alternative): a possible
  later Gallery filter ("feel" chips), not part of this intake's build.
- **"generic"** marks 55 motions the kit can already make only through the general-purpose `motion/anime` or `motion/tween` (no named
  preset, so the Gallery cannot show them and Claude must write the tweens). Most need no new preset; a few are worth naming (see specs).

## Not taken, and why

Every motion is imported (Import plan above); what is not taken is the site's **code**:

- **The site's own code** (the `seek(t)` canvas functions, the WAAPI track exports, the text engine, the HTML / CSS / GSAP / React tabs and
  the "save standalone HTML" pages): no licence; the footer limits the site to personal study; the operator is commercial. Technically it
  would not fit either: 336 demos are schematic canvas drawings (dashed guides, value readouts) that reach After Effects only as pictures,
  and the exported code is real-time WAAPI, not the film's clock.
- **react-bits code** (named as a source of 29 text motions; 21 of them have no MIT alternative named): MIT + Commons Clause forbids
  redistributing the components "alone, in a bundle, or as a ported version". The motions are written from this report's specs, without
  translating react-bits code (ids in the build notes).
- **typed.js** (GPL-3.0 since 3.0.0): not mixable with the kit's MIT. The kit's `text/typewriter` already covers it; the gaps (backspace
  loops, human rhythm) are specified in our own words.
- **aceternity** (8 motions): the Pro licence forbids redistributing components; the free tier's terms were not found. Treated as ideas.
- **12 lessons** (imported as demo clips of the principle, not as motions): lessons whose content is the explanation itself (pose-to-pose, timing = weight, spring vs tween, overshoot
  budget, duration by size, exit faster than enter, overlap levels, reading hold, energy arc, tooltip placement) and the audio-only
  J / L cut. Their rules already exist in `film.md` / `recipes.md`, except the square-root distance rule (row 6 above).
- **Teaching UI of the site** (onion skin, speed graph, comparison lab): the kit has its own onion skin and speed graph (THIRD-PARTY.md,
  "Opus 5.5 Motion Lab").

## Risks and open questions

1. **Licence of the site's own work.** Nothing grants reuse of its code; this intake takes names, timings, eases and keyframe values
   (facts and ideas, not protected: Japanese Copyright Act art. 10(3) excludes algorithms; source code is protected) and writes them in our
   own words. The desktop session must **not paste the site's code**, even from the "Copy code" button, and should credit the idea in
   `preset.json` and `docs/THIRD-PARTY.md` ("Techniques and references"). Not legal advice: if the studio wants the code itself, ask the
   author (contact on takayustudio.jp).
2. **The site changes often** (text data versioned the day it was read). Counts and ids may move; before a batch, re-download the files
   below and compare the SHA-256 prefixes.
3. **react-bits "ported version" clause.** Keep the 29 react-bits-sourced motions independent: write from the spec, do not open react-bits
   source while writing them.
4. **Judgement.** Status, priority and specs were set by six parallel reviews and checked here against the kit code: one claim corrected
   (MP4 motion blur already exists as `kit.py mp4 --blur`), one refined (EasePack is vendored in `engine/vendor/gsap` but films do not
   load it), one confirmed (no crossfade usable as `transition_in`), and one rule unified ("generic" for motions only `motion/anime` /
   `motion/tween` can make). A few specs say they are estimates or point to a line to read; the Gallery's KEEP / DROP is the
   final judge.
5. **Canvas demos are 320 x 200 units, DOM demos 320 x 180.** Specs quote those units; scale to the film element, not blindly by 6.
6. **Found in passing:** `library/presets/text/land-in/preset.json` notes refer to `text/snap-out`, which is not in the library (it lives
   in one film). Out of scope here.
7. **For the user to decide:** the build order and batch size; separate intakes for codrops/OnScrollTypographyAnimations and magicui;
   whether to allow `*.takayustudio.jp` for the author's sister sites (ae-, fx-, light-, promo-, blender-reference), each with the same
   licence position.

## Build notes for the desktop session

**Files to copy as shipped:** none from this site.

**Workflow.** Show the user the table above and wait for the OK. Then per batch: a scratch film (`kit.py new`), presets written into its
`03_HTML/presets/<group>/<name>/` by the rules of `library/README.md`, `kit.py library import <film> <group>/<name>` for each, the
Gallery's "Mới nhập" for the user's KEEP / DROP. Extending an existing preset (87 targets) is a param or style on that preset, with its
Gallery check re-run (`kit.py gallery check <name>`) and a CHANGELOG line. Before the commit: `engine/tests/smoke_new_project.py`,
`kit.py gallery check`, `engine/tests/ae/run_cases.py` when a preset ports as keyframes in a new way.

**Where the numbers are.** The [specs](2026-10-12-motion-reference-takayustudio-specs.md) list every target with the motions it must
cover and their numbers (times in ms, values, eases, staggers, pivots). When a spec is thin, open the site's demo
(`https://motion-reference.takayustudio.jp/#motion=<id>`) and step it frame by frame, or read the data line named in the catalogue as
text. Never run or paste it.

**preset.json for these presets.** `"source": {"label": "Moworks Motion (motion idea: motion-reference.takayustudio.jp, <id>[, <id>])"}`,
`"license": "kit"`, `notes` saying the numbers were taken from the reference and what was changed for the film. One line in
`docs/THIRD-PARTY.md` under "Techniques and references": "motion-reference.takayustudio.jp (TakayuStudio): names, timings and eases of
motions re-written as kit presets (no code copied)".

**High-priority targets (40, covering 65 motions):**

| # | Target | New / extend | Kind · AE | Motions covered (ids) |
|---|---|---|---|---|
| 1 | `text/land-in` | extend | effect · keyframes | `catalog-game-reward-new-record`, `catalog-game-impact-fx-mission-stamp`, `tx-directional-blur-slide`, `tx-drop-bounce-in`, `tx-pendulum-swing`, `tx-squash-landing` +7 |
| 2 | `motion/camera` | new | effect · keyframes | `cam-pushin`, `cam-pullout`, `cam-truck`, `cam-pedestal`, `cam-vertigo`, `cam-crane` +6 |
| 3 | ease aliases (`eases.js`) | new | - · keyframes | `e-whip`, `e-glide`, `e-md3`, `e-md3e`, `e-md3a`, `e-apple` +3 |
| 4 | `effect/ring-pulse` | new | effect · keyframes | `pulse-focus`, `focus-halo`, `radial-flash`, `catalog-ui-spatial-spatial-audio-locator`, `catalog-game-hud-minimap-ping`, `catalog-game-hud-objective-marker` +3 |
| 5 | `transition/iris-reveal` | extend | effect · keyframes | `ripple-reveal`, `svg-mask-reveal`, `tr-inset`, `tr-clock`, `tr-shapeiris`, `tr-flood` +3 |
| 6 | `motion/squash-stretch` | new | effect · keyframes | `heavy-stop`, `axis-stretch`, `bounce-land`, `double-bounce`, `waypoint-hop`, `squash` +2 |
| 7 | `text/captions` | extend | block · keyframes | `tx-pop-on-subtitle`, `tx-roll-up-caption`, `tx-live-caption-block`, `tx-phrase-line-break`, `tx-jp-subtitle-timing`, `tx-vertical-subtitle` +2 |
| 8 | `data/chart-story` | extend | block · keyframes | `catalog-data-story-threshold-wave`, `catalog-data-story-confidence-fog`, `catalog-data-story-delta-split`, `catalog-data-story-milestone-firefly`, `catalog-data-story-goal-projection`, `dv-scatter` |
| 9 | `motion/emphasis` | new | effect · keyframes | `tilt-reaction`, `nudge`, `attention-bounce`, `jelly-emphasis`, `icon-nod` |
| 10 | `data/odometer` | new | effect · keyframes | `catalog-kinetic-type-mono-data-shuffle`, `tx-odometer-roll`, `tx-ticker-flash`, `tx-score-update` |
| 11 | `motion/card-flip` | new | effect · keyframes | `flip-card`, `coin-spin`, `catalog-ui-navigation-card-flip` |
| 12 | `text/slot-roll` | extend | effect · keyframes | `catalog-data-story-odometer-cascade`, `catalog-kinetic-type-glyph-slot-roll`, `tx-slot-shuffle` |
| 13 | `text/typewriter` | extend | effect · expression | `tx-typewriter-loop`, `tx-human-typewriter`, `tx-yakumono-pause` |
| 14 | `transition/crossfade` | new | effect · keyframes | `tr-dissolve`, `tr-blur`, `view-crossfade` |
| 15 | `data/countdown` | extend | effect · keyframes | `catalog-game-cinematic-countdown-go`, `tx-countdown-zoom` |
| 16 | `effect/letterbox` | new | effect · keyframes | `catalog-game-cinematic-letterbox-focus`, `tx-letterbox-reveal` |
| 17 | `text/bar-wipe` | new | effect · keyframes | `tx-bar-wipe-reveal`, `tx-diagonal-cut-reveal` |
| 18 | `text/kinetic-type-swap` | extend | effect · keyframes | `tx-rotating-letters-spring`, `tx-layout-word-insert` |
| 19 | `text/marker-highlight` | extend | effect · keyframes | `tx-keyword-punch`, `tx-pointer-highlight-box` |
| 20 | `text/particle-dissolve` | extend | block · png | `pt-coalesce`, `catalog-ui-material-sand-dissolve` |
| 21 | `text/split-halves` | new | effect · keyframes | `catalog-game-impact-fx-finisher-cut`, `tx-split-halves` |
| 22 | `transition/letter-zoom` | new | effect · keyframes | `tr-letter`, `tx-text-window-zoom` |
| 23 | `transition/push` | extend | effect · keyframes | `page-transition-stack`, `catalog-ui-navigation-parallax-push` |
| 24 | `motion/clip-open` | new | effect · keyframes | `image-clip-scrub` |
| 25 | `shape/burst-lines` | new | effect · keyframes | `sh-burst` |
| 26 | `text/caption-camera-follow` | extend | block · keyframes | `tx-kinetic-camera` |
| 27 | `text/colorama-wipe` | extend | effect · png | `tx-soft-mask-wipe` |
| 28 | `text/fit-stack` | new | effect · keyframes | `tx-stacked-justified` |
| 29 | `text/headline-slam` | extend | effect · keyframes | `tx-slam-in-title` |
| 30 | `text/mask-rise` | extend | effect · keyframes | `tx-scroll-clip-write` |
| 31 | `text/outline-fill` | new | effect · keyframes | `tx-outline-fill-sweep` |
| 32 | `text/slash-reveal` | new | effect · keyframes | `catalog-game-impact-fx-slash-reveal` |
| 33 | `text/slice-in` | new | effect · keyframes | `tx-split-bars-title` |
| 34 | `transition/blinds` | new | effect · keyframes | `tr-blinds` |
| 35 | `transition/blocks` | new | effect · keyframes | `tr-blocks` |
| 36 | `transition/card-flip` | new | effect · keyframes | `tr-flip` |
| 37 | `transition/cover-wipe` | new | effect · keyframes | `page-wipe` |
| 38 | `transition/directional-wipe` | extend | effect · keyframes | `tr-wipe` |
| 39 | `transition/zoom-through-transition` | extend | effect · keyframes | `tr-zoomthrough` |
| 40 | `ui/lucky-wheel` | new | block · keyframes | `catalog-game-cinematic-lucky-roulette` |

The 171 medium and low targets follow in the specs file, largest first (for example `ui/hud-bar` 7 motions, `text/char-loop` 6,
`text/text-on-path` 6, `effect/spark-burst` 5, `house/glow-card` 5, `text/rgb-glitch` 5, `ui/ink-ripple` 4, `ui/press` 4).

**Transitions first from what the kit already ships.** Before writing `transition/crossfade`, `transition/blinds`,
`transition/blocks`, `transition/card-flip`, `transition/cover-wipe` or the iris variants, read the HyperFrames showcase layouts in
the kit (`library/layouts/transition/showcase-dissolve`, `showcase-blur`, `fade-through` and the other `showcase-*`): when one holds
the same transition, wrap its code as a two-scene `transition_in` preset (Apache-2.0, source recorded as for the other HyperFrames
items) instead of re-writing it from the site's numbers.

**Determinism on the film's clock.** Every spec is written as keyframes against time. Random scatter, jitter and particle fields use
`ctx.hash` (no `Math.random`); springs use `springk(k, d)` / `ctx.track` with the stiffness and damping the spec gives; "follow" and
"inertia" motions are computed as functions of time (iterate from the start inside `ctx.code` when a spec describes a per-frame chase);
loops close on their own period.

**After Effects.** 150 targets are plain tweens (`"ae": "keyframes"`), 20 need per-frame code (`expression`: counters, scramble,
odometer, typewriter rhythm), 40 are pictures (`png`: particles, glow, displacement, canvas-like effects). 3D flips need the kit's
fold-to-90-degrees rule (`library/README.md`, practical notes), since `backface-visibility` is unreliable in renders.

**Upstream origins (text motions).**
- codrops/OnScrollTypographyAnimations `af28d61` (MIT; 29 effects; **intake done:**
  [2026-10-12-onscrolltypographyanimations.md](2026-10-12-onscrolltypographyanimations.md)): the 17 site motions that name this
  repository: `tx-stretch-rise`, `tx-scale-y-unfold`, `tx-converge-from-spread`, `tx-scatter-assemble`, `tx-random-tilt-scale-in`, `tx-smear-stretch-in`, `tx-scale-pop-in`, `tx-explode-scatter-out`, `tx-char-flicker-in`, `tx-slide-x-mask`, `tx-blur-random-in`, `tx-flip-up-3d`, `tx-swing-door`, `tx-z-fly-in`, `tx-tumble-in`, `tx-scroll-word-highlight`, `tx-horizontal-letter-drop`. 7 more name other Codrops demos (not studied): `tx-char-exit-up`, `tx-char-mask-rise`, `tx-cylinder-text`, `tx-dual-wave-columns`, `tx-repetition-echo`, `tx-text-window-zoom`, `tx-lens-bulge`.
- magicuidesign/magicui `85f97fd` (MIT; 79 React components; **intake done:**
  [2026-10-12-magicui.md](2026-10-12-magicui.md)): the 19 site motions that name it: `tx-fade-up-words`, `tx-blur-evaporate-out`, `tx-marker-highlight`, `tx-comic-pop`, `tx-rotating-letters-spring`, `tx-gooey-morph`, `tx-scramble-decode`, `tx-circular-text-spin`, `tx-texture-fill`, `tx-shiny-sweep`, `tx-gradient-flow`, `tx-aurora-text`, `tx-color-band-sweep`, `tx-line-shadow`, `tx-roll-flip-hover`, `tx-scroll-word-highlight`, `tx-scroll-velocity-marquee`, `tx-count-up`, `tx-sparkles-text`.
- barvian/number-flow `c5906cf` (MIT; `packages/number-flow`, a web component animating with WAAPI in its shadow root, real time, so the
  odometer takes its numbers, not its runtime): `tx-odometer-roll`, `tx-ticker-flash`.
- react-bits (write from the spec only; all 29 motions that name it): `tx-fade-up-chars`, `tx-stretch-rise`, `tx-emoji-grapheme-pop`, `tx-split-flap`, `tx-rotating-letters-spring`, `tx-typewriter-loop`, `tx-decrypt-center`, `tx-slot-shuffle`, `tx-falling-pile`, `tx-particle-text`, `tx-circular-text-spin`, `tx-curved-loop-marquee`, `tx-shiny-sweep`, `tx-gradient-flow`, `tx-blur-in-3step`, `tx-true-focus`, `tx-rgb-split-glitch`, `tx-fuzzy-text`, `tx-ascii-render`, `tx-layered-depth`, `tx-text-pressure`, `tx-variable-proximity`, `tx-scroll-blur-tilt`, `tx-scroll-velocity-marquee`, `tx-repetition-echo`, `tx-proximity-scramble`, `tx-cursor-text-trail`, `tx-count-up`, `tx-layout-word-insert`.
- typed.js (write from the spec only): `tx-typewriter-loop`. aceternity (ideas only): `tx-pointer-highlight-box`, `tx-flip-words-blur`,
  `tx-random-color-pop`, `tx-text-generate`, `tx-turbulence-wobble`, `tx-spotlight-outline`, `tx-pointer-reveal-card`,
  `tx-layout-word-insert`.

**Gallery demo ideas.** Text targets: a Vietnamese headline with diacritics (per-character targets must keep marks inside `ctx.mask`'s
pad). Transitions: two scenes with `transition_in`. Camera: three layers at depth 1.0 / 0.5 / 0.2. UI targets: the kit's device and
cursor layouts with the effect on a film-built button. Data targets: the kit's chart cards with neutral numbers.

**Files read (SHA-256, first 16 hex digits).** `index.html` 36e0b4671d505253 · `data/motions.js` f790b0fb29d5a3a4 ·
`data/motion-expansion.js` 2c903cb4c65b8c96 · `data/atlas-items.js` baa87af812c49d13 · `data/atlas-merge.js` 44723a3f5cd68ff7 ·
`data/text/items.js` 7a9c60259a5be486 · `data/text-merge.js` 61c2cb461d3468fa · `assets/atlas-bundle.js` befd26368ad8351b ·
`assets/text-bundle.js` cde004d75ee40900 · `assets/motion-catalog-ui.js` dc052d816adb6b2a · `assets/motion-catalog-experimental.js`
2e3f65e63da29ed0 · `assets/motion-base-fixes.js` 3049412336c70fa3 · `assets/motion-runtime.js` 8f9548521a31f9dc ·
`assets/motion-export.js` dd2797f48fc3b2a4 · `assets/app.js` e9d5b46ddffbaa02. The list of 782 was rebuilt from these files read as
text (no site code was run) and matches the site's own counts per category.
