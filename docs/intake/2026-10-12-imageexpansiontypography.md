# Intake: codrops/ImageExpansionTypography

- **Read:** 2026-10-12, commit `0d614791f94198bcab655762b26a3cb85da851f4` (2024-04-02), https://github.com/codrops/ImageExpansionTypography
- **Licence:** MIT (`LICENSE`, "Copyright (c) 2009 - 2024 Codrops") · assets: **not taken**: 10 demo pictures in `img/` (the README says
  they were generated with Midjourney; their reuse terms are not stated in the repository), the Coconat font in `fonts/` (by Collletttivo;
  its licence file is not in the repository), `img/noise.png`. Vendored libraries: GSAP, ScrollTrigger and Flip (`js/*.min.js`, GSAP
  Standard License; the kit already ships GSAP 3.15 with Flip in `engine/vendor/gsap/`), imagesLoaded (MIT), Lenis (MIT; `js/lenis.js`
  is an empty file in this commit).
- **What it is:** the code of the Codrops article "On-Scroll Expanding Image Animation within Typography": five variants of a headline
  in which a picture, set inline between the words, opens from zero width to its full size as the page scrolls, pushing the words apart
  (and skewing or rotating some of them), while the paragraph below drifts away. About 300 lines of plain JavaScript (`js/effect-1` to
  `js/effect-5`), each a GSAP Flip from the closed to the open state, scrubbed by ScrollTrigger. The TakayuStudio reference cites this
  article for `tx-text-window-zoom`, but that motion (a zoom through the letters) is a different effect; this repository is the "picture
  opens inside the line" effect.

## Tóm tắt cho người dùng

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | **5 kiểu "ảnh mở ra giữa dòng chữ"**: một ảnh nằm giữa các từ của tiêu đề, mở từ bề ngang 0 ra đủ cỡ (bo góc lớn), đẩy các chữ dạt ra, vài chữ nghiêng / xoay theo; đoạn chữ phía dưới trôi đi | `text/inline-image-expand` (mới), tham số `style` 1–5; nhập 5 mục riêng vào "Mới nhập" theo kế hoạch nhập hết | MIT, ghi công Codrops | vừa–cao (tiêu đề có ảnh sản phẩm / con người, rất hợp phim quảng cáo) | ước tính thô 3–5 giờ (chưa đo) | port nguyên thông số |
| 2 | Ảnh demo, font Coconat, GSAP bản kèm theo | — | chưa rõ / chưa rõ / kit đã có GSAP | — | — | không lấy (dùng ảnh demo của Gallery và font của phim) |

**Kết luận:** nên nhập cả 5 kiểu (mỗi kiểu một mục trong "Mới nhập"); kit chưa có hiệu ứng ảnh mở ra giữa dòng chữ. Không lấy ảnh và font
của demo.

## Import plan (decided with the user, 2026-10-12)

Same rules as the other reports of this session: each variant is its own item in "Mới nhập" (`text/codrops-image-expand-1` ... `-5`),
`"source": {"label": "Codrops: Image Expansion Typography effect <N>", "repo": "codrops/ImageExpansionTypography", "commit":
"0d614791f94198bcab655762b26a3cb85da851f4", "path": "js/effect-<N>/expandImageEffect.js"}`, `"license": "MIT"`, family "Codrops (MIT)" in
the Gallery's "Nguồn" filter; the kept ones merge into `text/inline-image-expand` with a `style` param, with the user's OK.

**Manifest and handover:** the 5 items are in [2026-10-12-codrops-manifest.json](2026-10-12-codrops-manifest.json); the order of
work is in [2026-10-12-desktop-handover.md](2026-10-12-desktop-handover.md).

## Already in the kit

Nothing does this. Closest: `text/svg-mask-reveal` and the text layouts with a word slot (`text/anchor-word-slot`), which reveal or swap
inside text but never open a picture between words. The TakayuStudio intake proposed `transition/letter-zoom` for the zoom-through-text
motion; that stays separate.

## Not taken, and why

- **Demo pictures and font:** reuse terms not stated in the repository (Midjourney-generated pictures; Collletttivo's Coconat); the kit's
  Gallery demo pictures and the film's font are used.
- **ScrollTrigger, Lenis, imagesLoaded:** scroll and loading plumbing; a film has a clock and its assets are local.
- **Flip at render time:** see build notes; the port writes explicit tweens.

## Risks and open questions

1. **After Effects.** The source moves the words by re-flowing the line (the picture's width grows, the words follow). The kit's AE port
   records tweens, not layout reflow, so the port must move the words with their own `x` tweens (see build notes); then the picture is a
   clipped layer and the words stay editable text layers.
2. **Vietnamese headlines:** the source's line height is 1.1 and words are `white-space: nowrap`; Vietnamese capitals need the kit's
   mask pad, and skewed words (−20°) need room on their sides.
3. **Variant 4** animates a stack of three small pictures (`type__expand--stack`) with nested Flip; check its timing in a film before
   keeping it.

## Build notes for the desktop session

- **Files to copy as shipped:** none (the effect code is 50–66 lines per variant; port it). Source per variant:
  `js/effect-<N>/expandImageEffect.js`, states in `css/base.css` lines 226–325 (`.type--open` rules).
- **The two states.** Closed: the picture box `width: 0%`, `aspect-ratio: 16/9` (small `1`, tiny `25/9`), `border-radius: 4rem`,
  `overflow: hidden`, inner picture `background-size: cover`. Open: `width: 100%` (small `3.25em`, tiny `2em`), the line's `gap: 1.5rem`
  (stack `0.5rem`), words with class `skewed` → `skewX(-20deg)`, `rotated` → `skewX(-5deg) rotate(-10deg)`.
- **Per variant** (closed → open over the preset's `duration`; the paragraph tween runs over the same span):

| Variant | Picture tween | Words | Paragraph below |
|---|---|---|---|
| 1 | Flip, `power1.inOut` (scroll span 135 % of the viewport) | skew to −20° on the `skewed` words | yPercent 0 → −150, opacity → 0.2, skewX → −8°, `sine.inOut` |
| 2 | Flip `simple`, `sine.inOut` | as 1 | xPercent 15 → −15, skewX −5° → 5°, opacity → 0.2, `sine.inOut` |
| 3 | Flip of the picture only, `sine` (out) | — | lineHeight 1.2 → 2, yPercent → −40, skewX → −2°, opacity → 0.2, `sine.inOut` |
| 4 | Flip of the stack, the pictures and the words, `sine.inOut`, nested | `rotated` words | yPercent → −50, skewX → −4°, rotation → 2°, opacity → 0.2, `sine.inOut` |
| 5 | Flip `simple`, `sine.inOut` | — | yPercent → −60, opacity → 0.2, `sine.inOut` |

- **Port.** At build, lay the headline out twice (closed, open), measure each word's x and the picture's final width, then write
  `fromTo` tweens: the picture box width (or a `clip-path: inset()` on a full-width box) and each word's `x` from closed to open, the
  skew / rotation on the marked words, the paragraph tween; all with the variant's ease. No Flip, ScrollTrigger or reflow at render, so
  AE gets keyframes. Params: `duration`, `image` (Gallery demo picture by default), `slot` (which word the picture follows), `style` 1–5.
- **What to test.** Gallery demo with a Vietnamese headline and a Gallery picture; `kit.py gallery check`; the AE port on variant 1.
