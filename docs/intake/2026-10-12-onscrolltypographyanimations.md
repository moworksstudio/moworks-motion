# Intake: codrops/OnScrollTypographyAnimations

- **Read:** 2026-10-12, commit `af28d61d1f8d3d117f5d1e9b09d5209e20a1a212` (2024-01-18), https://github.com/codrops/OnScrollTypographyAnimations
- **Licence:** MIT (`LICENSE`, "Copyright (c) 2009 - 2022 Codrops"; `package.json` "license": "MIT") · assets: none to take. The demo
  pages load Adobe Fonts (Typekit kit `cvn8slu`: area-normal, campaign-serif, zedou, afronaut... licensed to the demo, not
  redistributable) through Google's WebFont loader; the README credits Unsplash images, but the built pages (`dist/`) ship none.
  Dependencies: `gsap` ^3.11.4 with ScrollTrigger (GSAP Standard License; the kit vendors GSAP 3.15), `splitting` ^1.0.6 (MIT),
  `@studio-freight/lenis` ^0.2.28 (MIT), `parcel` (build only).
- **What it is:** the code of the Codrops article "On-Scroll Typography Animations": 29 text entrances (`src/js/index.js` fx1 to fx15,
  `src/js/index2.js` fx16 to fx29), each a GSAP `fromTo` on the letters or words that Splitting.js makes, scrubbed by ScrollTrigger as the
  title scrolls through the window (Lenis smooths the scroll). About 1,070 lines of plain JavaScript, no framework. 24 motions of the
  TakayuStudio reference name Codrops: 17 name this repository and 15 of those match one of its effects (`tx-scale-pop-in` and the exit
  `tx-explode-scatter-out` do not); the other 7 name other Codrops demos, not studied here.

## Tóm tắt cho người dùng

**Quyết định của bạn (12/10/2026):** **nhập hết** 29 kiểu vào "Mới nhập", mỗi kiểu một mục riêng (`text/codrops-<kiểu>`), kể cả
2 kiểu kit đã có, để bạn so và chọn GIỮ / BỎ. Gộp thành một preset `text/split-entrance` chỉ làm sau khi bạn đã chọn. Nguồn ghi
trong `preset.json` ("Codrops", MIT), lọc được bằng hàng "Nguồn" (họ mới: Codrops).

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | **29 kiểu chữ vào** (từng chữ cái hoặc từng từ: bung nghiêng, kéo giãn, mở dọc, hội tụ, tán rồi tụ, lật 3D, cửa xoay, nhấp nháy ký tự, nhoè ngẫu nhiên, trượt trong mặt nạ, quệt giãn, rơi từ trên cao, cuộn trụ, bay từ sâu, lộn nhào, xoắn quạt, nảy đàn hồi, lan từ giữa…) | **29 mục riêng trong "Mới nhập"** (`text/codrops-<kiểu>`), giữ đúng thông số gốc; cái nào bạn GIỮ thì sau đó gộp thành một preset `text/split-entrance` có tham số `style` | MIT, ghi công Codrops | cao (tiêu đề, chữ to trong phim) | ước tính thô 4–8 giờ (chưa đo) | port nguyên thông số |
| 2 | Cách "cuộn trang" điều khiển chuyển động | đổi thành **thời gian của phim**: cả hiệu ứng trải trong `duration` của preset | — | — | (trong mục 1) | thay ScrollTrigger bằng đồng hồ phim |
| 3 | Số ngẫu nhiên (`gsap.utils.random`, `Math.random`) | `ctx.hash` theo từng chữ: cố định giữa các lần render | — | — | (trong mục 1) | sửa cho tất định |
| 4 | Splitting.js, Lenis, ScrollTrigger, font Adobe | — | MIT / MIT / GSAP / không phân phối lại được | — | — | không lấy (kit có `ctx.split`, font của phim) |

**Kết luận:** nhập cả 29 kiểu, mỗi kiểu một mục để bạn chọn; những kiểu được GIỮ gộp thành một preset `text/split-entrance` có tham số
`style`. Kit đã có sẵn 5 kiểu tương tự (nhấp nháy ký
tự, nhoè ngẫu nhiên, trượt trong mặt nạ, cả đoạn sáng dần theo từ, bung nghiêng), nhưng vẫn nên giữ trong bộ để đủ 29 kiểu. 24 kiểu còn
lại kit chưa có preset riêng: nhiều nhất là lật / bay 3D từng chữ cái, thứ `text/land-in` hiện chỉ làm theo từng từ.

## Import plan (decided with the user, 2026-10-12)

The user reviews everything on the Gallery and decides per item, so **nothing is dropped at intake**: every one of the 29 effects goes into
"Mới nhập" (`library/incoming/`, out of git) as **its own Gallery item**, including the ones the kit already has (for a side-by-side
look; their `desc_vi` ends with "Kit đã có: `<name>`"). The priorities in this report are only the **import order**. The user presses
GIỮ / BỎ per item; only GIỮ moves an item into the tracked (public) library, so licence questions are settled at GIỮ, not at import.

**Classification: the library's own three layers, no extra tags.**
1. **Group folder by purpose** (`text`, `transition`, `motion`, `effect`, `ui`, `background`, `line`, `data`, `map`... for presets; the
   layout groups for blocks). The Gallery derives its category from the group (`engine/gallery.py` `category()`).
2. **Source in `preset.json`**: `source` (`label`, `repo`, `commit`, `path` or `url`) and `license`, shown on the Gallery card as
   "Nguồn" and "License". For this source: `"source": {"label": "Codrops: On-Scroll Typography Animations fx<N>", "repo":
   "codrops/OnScrollTypographyAnimations", "commit": "af28d61d1f8d3d117f5d1e9b09d5209e20a1a212", "path": "src/js/index.js" or
   "src/js/index2.js"}`, `"license": "MIT"`.
3. **The Gallery's "Nguồn" filter** groups labels into families (`srcShort` in `library/gallery/index.html`: HyperFrames, Moworks v1,
   iart-ai (MIT), claude-animation (MIT), anime.js (MIT), else Moworks). Add the family "Codrops (MIT)" (label starts "Codrops") there, written like the existing five
   (one regex on the label), so "Mới nhập" can be filtered by source while the user reviews.

**Names:** by purpose inside the group; when a name is taken (in the library or by another source of the same batch), prefix the source
the way the anime.js family is named (`motion/anime-path`, `text/anime-roll`): `codrops-`. Once the user has chosen, kept siblings can be
merged into one preset with a `style` param (a rename the desktop session proposes to the user, never on its own).

**What cannot run as it is gets adapted, not dropped:** content fetched from the network becomes params or the project's own media; live
mouse, hover, click or scroll becomes a scripted path or cue times on the film's timeline; frames that imitate a real product get
`"brand_ui": true`; anything of unclear licence stays in "Mới nhập" with a note in `notes` (replace or drop it before GIỮ if unsure).
Each effect is imported as its own preset first (`text/codrops-<style>`, for example `text/codrops-swing-door`); the single
`text/split-entrance` with a `style` param below is the merge proposed after the user's choices.

**Batches:** (1) magicui, 79 items; (2) codrops, 29 items; (3) the TakayuStudio motions by category, about 100 per batch, high-priority
categories first. Each batch: write the presets in a scratch film, `kit.py library import <film> <group>/<name>` for each, `kit.py gallery
build`, then the user's review.

## Already in the kit

| fx | Effect (source values) | Closest kit item | Status |
|---|---|---|---|
| 1 | chars: opacity 0 → 1, scale 0.6 → 1, rotation random −20…20° → 0; `power4` (out), stagger 0.4 | `house/pop-cute`, `motion/anime` | generic |
| 2 | chars: opacity 0, yPercent 120, scaleY 2.3, scaleX 0.7, origin 50% 0% → 1; duration 1, `back.inOut(2)`, stagger 0.03 | `text/bottom-up-letters` (no stretch), `motion/anime` | partial |
| 3 | chars: scaleY 0 → 1, origin 50% 0%; `back` (out 1.7), stagger 0.03 | `motion/anime` | generic |
| 4 | chars per word: x 150 × (i − n/2) px → 0; `power1.inOut`, stagger from center | `motion/anime` | generic |
| 5 | chars: opacity 0, xPercent random ±200, yPercent random ±150 → 0; `power1.inOut`, stagger 0.05 from random | `text/char-slam` (scatter, but it slams), `motion/anime` | partial |
| 6 | chars per word, parent perspective 2000: opacity 0, rotationX −90, yPercent 50 → 0; `power1.inOut`, stagger 0.03 | `text/land-in` `flip` (per word only) | partial |
| 7 | chars per word, perspective 2000, origin 100% 50%: opacity 0, rotationY −90, z −300 → 0; `expo` (out), stagger 0.06 from end | `text/land-in` page styles (per word only) | partial |
| 8 | each char: flickers two random symbols (0.03 s each, repeatDelay 0.03) then shows itself; delay (i + 1) × 0.18 s | `text/anime-scramble`, `text/matrix-decode` | have |
| 9 | chars per word: scaleX 0 → 1 while moving from the window's centre to their place (x = centre − own centre); `power1.inOut` | none | missing |
| 10 | chars: opacity 0, blur 20 px → clear; duration 0.25, `power1.inOut`, stagger 0.05 from random | `text/blur-in` (per word, in order), `motion/anime` | generic |
| 11 | chars in an overflow-hidden wrap: xPercent 105 → 0, origin 0% 50%; duration 1, `expo`, stagger 0.042 | `text/words-rise` (vertical, per word), `motion/anime` | generic |
| 12 | chars in wraps: xPercent −250, rotation 45°, scaleX 6, origin 100% 50% → 1; duration 1, `power2`, stagger −0.06 | `motion/anime` | generic |
| 13 | chars, perspective 2000: opacity 0, rotationY 180, xPercent −40, yPercent 100 → 0; `power4.inOut`, stagger −0.03 | none | missing |
| 14 | title xPercent 100 → 0 (linear) while chars fall: yPercent −900, scale 3 → 1, `back(2)`, stagger 0.05 | `text/top-down-letters` (no scale, no travel) | partial |
| 15 | title xPercent −80 → 0 (linear) while chars roll: origin 50% 50% −200px, rotationX 380 → 0, opacity 0 → 1; `expo.inOut`, stagger −0.03 | none | missing |
| 16 | title rotation 3° → 0 (origin 0% 50%) while words go opacity 0.1 → 1; linear, stagger 0.05 | layout `text/mk-word-sweep`, `text/streaming-text` (no tilt) | have |
| 17 | chars, perspective 1000: opacity 0, rotationX random ±120, z random ±200 → 0; linear, stagger 0.02 | none | missing |
| 18 | chars, perspective 1000: opacity 0.2, z −800 → 0; `back.out(1.2)`, stagger 0.04 | `text/shared-axis-z` (per word, scale not z) | partial |
| 19 | chars, perspective 1000, origin 50% 0%: opacity 0, rotationX −90, z −200 → 0; `power1` (out), stagger 0.05 | `text/land-in` `flip` (per word) | partial |
| 20 | chars, perspective 1000, origin 50% 100%: opacity 0, rotationX 90 → 0; `power4`, stagger 0.03 from random | none | missing |
| 21 | chars per word, perspective 2000: opacity 0, y −40 × \|i − n/2\|, z random −1500…−600, rotationX random −500…−200 → 0; `power1.inOut`, stagger 0.06 from center | none | missing |
| 22 | chars per word, perspective 1000: fanned out (x ±200 × k, y 60 × k, rotationY −270, rotationZ ±8 × k, k = distance from the middle) → 0; `power2.inOut` | none | missing |
| 23 | chars per word: scale 0.01 → 1, x ±50 × position (left words from the right, right words from the left, alternating) → 0; `power4` | none | missing |
| 24 | chars: y (n/2 − k + 6) × 130 px → 0 (k = distance from the middle); `elastic.out(.4)`, stagger amount 0.1 from center | `text/bottom-up-letters` (small travel) | partial |
| 25 | chars: scaleY 0 → 1, origin 50% 100%; `power3.in`, stagger 0.05 (pinned over a long scroll) | `motion/anime` | generic |
| 26 | chars per word: scaleY 0 → 1, origin alternating top / bottom by word; `power1.inOut`, stagger amount 0.3 from center | `motion/anime` | generic |
| 27 | words, perspective 1000: opacity 0, z random 500…950, xPercent ±100, yPercent ±10, rotationX ±90 → 0; `expo`, stagger 0.006 from random | none | missing |
| 28 | chars per word, origin 50% 100%: scale 0.5…2.1 and y 0…60 px by distance from the middle, rotation ±4°, blur 12 px + opacity 0 → clear; `power2.inOut`, stagger amount 0.15 from center | `text/focus-blur-resolve` (per word, no size spread) | partial |
| 29 | chars per word: scale 0 → 1, origin bottom-left / top-right alternating by word; `power4`, stagger 0.03 from end / start alternating | none | missing |

Totals: have 2 · generic 8 (only `motion/anime` can do them, written by hand each time) · partial 9 · missing 10. Even the "have" and
"generic" ones are worth keeping in the port: one named style is faster for Claude to choose and the Gallery can show it.

- **Kit vs source:** the kit's text presets are per word and land on a beat (`text/land-in`, 20 styles), or are named single effects.
  The source is per character with 3D (perspective, rotationX / Y, z) and spreads computed from the letter's distance to the middle, which
  the kit has nowhere as a preset. The source has no exits, only entrances.
- **TakayuStudio intake overlap:** that report proposed a per-character `split` for `text/land-in` (13 motions, 5 of them taken from these
  effects: fx6 / fx20, fx7, fx14, fx18, fx21). This port covers those 5 as shipped values; the `split` param on `text/land-in` stays useful for
  the other 8 (drop-bounce, squash landing, pendulum...).

## Not taken, and why

- **ScrollTrigger and Lenis:** a film has no scroll. The scroll range becomes the preset's `duration` (see build notes); `scrub` smoothing
  values (0.9, 1, 1.2, 1.9) are a lag behind the scroll and disappear on a clock; `pin` is not needed.
- **Splitting.js:** the kit's `ctx.split(el, "chars" | "words")` does the same and keeps Vietnamese diacritics in their glyph.
- **Fonts:** Adobe Fonts from a Typekit kit: not redistributable; the film's font is used.
- **The demo page** (layout, CSS, loader): website chrome. Only `.char-wrap` (`display: inline-block; position: relative; overflow: hidden`)
  matters, for fx11 and fx12; the kit's `ctx.mask` gives the same with room for diacritics.

## Risks and open questions

1. **3D per character in After Effects.** `text/land-in` already ports its flip / page styles (rotationX / Y) as keyframes; whether
   per-character perspective, `z` and a transform origin with a z offset (fx15 `50% 50% −200px`) come through the same way was not checked
   here. Run `engine/tests/ae/run_cases.py` with the 3D styles; fall back to `"ae": "png"` per style if needed.
2. **Vietnamese text.** Per-character scaling from 0 and big rotations show diacritics stacking; `ctx.mask`'s 18 % pad must hold for
   fx11 / fx12 and any style with a clip. Demo with a Vietnamese headline.
3. **fx8 and random styles** need a seed per film so a re-render matches (`ctx.hash(el)` and the frame index for fx8's symbol flicker).
4. **fx9** places letters from the window's centre (`innerWidth / 2 − offsetLeft − width / 2`): on a film it is the film's centre (or the
   target box's), computed at build time from the laid-out text.
5. **Naming.** `text/split-entrance` with descriptive `style` names is a proposal; the user may prefer another name.

## Build notes for the desktop session

- **Files to copy as shipped:** none (the source is a scroll-driven demo page). Port the values; the effects' code is in
  `src/js/index.js` lines 62–526 (fx1–fx15) and `src/js/index2.js` lines 51–508 (fx16–fx29) at `af28d61`. Record in `preset.json`:
  `"source": {"label": "Codrops: On-Scroll Typography Animations", "repo": "codrops/OnScrollTypographyAnimations", "commit":
  "af28d61d1f8d3d117f5d1e9b09d5209e20a1a212", "paths": ["src/js/index.js", "src/js/index2.js"]}`, `"license": "MIT"`, the MIT notice in
  `docs/THIRD-PARTY.md` with a table row (as for claude-motion-design), a CHANGELOG line, and "Mới nhập" for the user's KEEP / DROP.
- **Import first, merge after.** Each effect is imported as its own preset `text/codrops-<style>` (style names below) so the user can
  keep or drop it; the kept ones then merge into one preset with the user's OK:
- **One preset, 29 styles (after the user's choices).** `text/split-entrance` (`kind: effect`, `ae: keyframes` unless the AE check says otherwise). Params:
  `style` (names below), `duration` (the whole entrance, default 1.6 s), `split` (`chars` default; `words` for fx16 and fx27, which work
  on words), `perspective` (from the source per style), `seed`. Style names: `tilt-pop` (fx1), `stretch-rise` (2), `unfold-down` (3),
  `converge` (4), `scatter` (5), `flip-up` (6), `swing-door` (7), `flicker` (8), `center-stretch` (9), `blur-random` (10),
  `slide-mask` (11), `smear` (12), `flip-around` (13), `drop-travel` (14), `cylinder-travel` (15), `read-tilt` (16), `random-3d` (17),
  `fly-z` (18), `flip-down` (19), `flip-up-random` (20), `tumble` (21), `spiral-fan` (22), `zoom-converge` (23), `elastic-rise` (24),
  `grow-up` (25), `unfold-alt` (26), `words-fly` (27), `bloom` (28), `corner-pop` (29). Each style keeps its source `from` values,
  `transformOrigin`, ease and stagger (`each`, `amount`, `from`: center / end / random / 0) exactly; per-word effects (fx4, 6, 7, 9, 21,
  22, 23, 26, 28, 29) run one tween per word, as the source does.
- **Scroll to time.** In scrub mode GSAP maps the scroll range linearly onto the tween's whole timeline: per-element duration `d`
  (the source's `duration`, else GSAP's default 0.5 s) plus the stagger spread. The port builds the same tween and scales it so the
  whole timeline equals the preset's `duration` (stagger and `d` keep their ratio). fx14 / fx15: the title's linear travel and the
  letters' tween share that duration (position 0 in the source timeline). fx8 / fx10 / fx11 are time-based in the source
  (`toggleActions`): keep their own durations and staggers.
- **Determinism.** Replace `gsap.utils.random(a, b)` with `a + (b − a) × ctx.hash(char)` (a different salt per property), and fx8's
  `Math.random` symbol pick with `ctx.hash(char, k)` per flicker step `k`. No `requestAnimationFrame` (Lenis), no ScrollTrigger.
- **Masks.** fx11 / fx12 wrap each letter in an overflow-hidden box: use `ctx.mask` per letter (its pad keeps the marks).
- **What to test.** Gallery: one demo per group of styles (2D, 3D, per word), a Vietnamese headline with diacritics, the default
  `duration`; `kit.py gallery check text/split-entrance`; `engine/tests/ae/run_cases.py` for the 3D styles; `kit.py verify` on a test
  film (seek and play give the same frames).
