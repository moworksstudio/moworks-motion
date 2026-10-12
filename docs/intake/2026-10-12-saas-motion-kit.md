# Intake: tugrawork-creator/saas-motion-kit

- **Read:** 2026-10-12, commit `bc7a414d6b66ceb09dfaa511e6237f382571bc84` (v1.4), https://github.com/tugrawork-creator/saas-motion-kit
- **Licence:** MIT (`LICENSE`: code, docs, theme data, transition recipes, tools) · assets: fonts are SIL OFL 1.1 (Manrope, Instrument
  Serif, JetBrains Mono, Bangers, from Fontsource; `LICENSES.md` + `OFL.txt` beside them, except `examples/acme-suite-loop/assets/fonts/`,
  which only the root `LICENSE` note covers); the Acme brand is fictional and the repo's own; no third-party images, sounds, music,
  footage or Lottie are committed. Mentioned only, not shipped: MusicGen (CC BY-NC, non-commercial) and fal-hosted video models (commercial
  terms not stated: unclear)
- **What it is:** a process and creative-direction kit for software promo films made with HyperFrames and Claude Code: a 7-stage playbook
  with a human gate per stage, a Claude skill, creative rules (variety rules, tone matrix, component forge, references), 12 small Python
  tools (the main one a "variety audit" of a storyboard table), 101 static theme storyboards, a 24-entry transition atlas and 8 example
  films. No engine and no component library. One author, 8 commits between 2026-09-25 and 2026-10-04.

## Tóm tắt cho người dùng

**Có cần cho kit không? Không cần thiết.** Đây là bộ quy trình + gu sáng tạo cho phim quảng cáo phần mềm, chạy trên HyperFrames. Kit đã có
quy trình riêng (duyệt từng bước, storyboard 3 phương án, story method, remake theo phong cách) chi tiết hơn, và đã có phần lớn kỹ thuật
trong các phim mẫu (boil, whip pan, iris, ink bleed, dither, bar chart race, oscilloscope, cursor, chat, notification, dolly zoom, rack
focus). Phim mẫu của repo tải GSAP / three.js từ CDN lúc render, trái luật "không mạng" của kit. Chỉ có vài ý nhỏ đáng ghi lại:

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | Kiểm lặp lại bằng máy ("variety audit"): cùng một chuyển cảnh ở hai cut liền nhau, một chuyển cảnh dùng quá 2 lần trong phim dưới 60 s, cùng một kiểu vào chữ 3 lần liền, một ease chiếm quá nửa số chuyển động, hơn 60 % cảnh dài bằng nhau | Một mục mới của `kit.py lint`, đọc thẳng film.json (preset, ease, độ dài cảnh), có cách đánh dấu lặp có chủ ý (`motif`) | MIT | vừa | 4–6 giờ | viết lại (luật lấy từ `variety_audit.py`, nguồn dữ liệu là film.json) |
| 2 | Bảng "chuyển cảnh kể chuyện" (24 mục: dùng khi nào, tránh gì) và vài chuyển cảnh dựng bằng DOM để lên AE thành keyframe chỉnh được (type carry, object carry, line-to-horizon, parallax 3 lớp, shape mask, split stack, rewind scrub) | Bảng ngắn trong skill (`workflow/film.md`); từng preset `transition/*` qua "Mới nhập" nếu muốn | MIT | vừa | bảng 1–2 giờ; mỗi preset 2–3 giờ | bảng: viết lại; preset: để sau, chỉ khi cần |
| 3 | Bảng "giọng phim → lựa chọn" (11 giọng: calm, premium, urgent, playful… → ease, nhịp cắt, camera, màu, chữ, chuyển cảnh, âm thanh) | Skill: `workflow/free-design.md` hoặc cạnh "The numbers" trong `film.md` | MIT | thấp | 1 giờ | viết lại nếu muốn |
| 4 | Ghi công người làm video tham khảo (tên + link) khi học nhịp / bố cục từ phim của người khác | Một dòng luật trong `workflow/remake.md`; `compare --shots` có thể in thêm nhịp cắt (số cut mỗi 10 s, shot trung vị, số cut trong 3 s đầu) | MIT | thấp | 1 giờ | viết lại nếu muốn |
| 5 | 101 theme, playbook, phim mẫu, `breakdown.py`, `loop_check.py`, `deliver.sh`, `warm_sfx.py`, quy trình người ảo qua fal, ghim UI lên màn hình xanh | — | MIT | thấp | — | không lấy |

**Kết luận:** Không nhập repo. Nếu muốn lấy một thứ thì lấy #1 (máy bắt lỗi "phim nào cũng giống nhau", điều kit hiện chỉ có ở dạng luật
viết); #2–#4 là ghi chú nhỏ cho skill, làm khi tiện.

## Already in the kit

| saas-motion-kit | Kit | Better one, and why |
|---|---|---|
| 7-stage playbook with human gates, `templates/BRIEF.md`, `STORYBOARD.md` | `SKILL.md` gates, `workflow/start.md`, `free-design.md` (three storyboard options), `story.md`, `kit.py storyboard`, `round` | Kit: more steps are checked by machine, and it works for keep-design and remake projects too |
| "No two films alike", variety rules as text | `workflow/film.md` "No sameness" (never the same look preset in two scenes, a move written for each scene), `review.md` variety score, `recipes.md` "something new every 2-4 s" | Kit has the rules; saas has the machine check (row 1) |
| `breakdown.py` (ffmpeg `select=gt(scene,0.1)`) | `kit.py compare --shots` (tells cuts from wipes and fast changes, sheets every 0.25 s, the reference's sound for `beats`) | Kit. saas's own `creative/references.md` says dissolves, whips and fades are missed |
| `loop_check.py` (first vs last frame) | `kit.py verify --loop` (position and speed across the seam), `film.md` "render frames 0 to N-1" | Kit: saas's test passes a duplicated seam frame |
| `deliver.sh` (-14 LUFS, -1.5 dBTP, Lanczos downscale) | `kit.py mp4` / `mov`, `kit.py loudness` (-16 LUFS, -4 dBTP, phone band, mono fold-down) | Kit |
| `warm_sfx.py` (synthesised marimba / woodblock sounds) | 19 recorded sound effects, `ctx.sfx`, the sound pass | Kit, by its own documented choice (recorded, not synthesised) |
| Transition atlas: match cut, motion match, beat cut + hold, push-through, whip pan, dolly-out, focal iris, paper fold, ink bleed, dither, speed ramp, time-lapse tick, loop seam | `layouts/transition/match-cut`, `cut-the-curve`, `text-match-cut`, `type-match-cut`, `beat-freeze-cut`, `parallax-unzoom`, `showcase-3d`, `showcase-mechanical`; `presets/transition/iris-reveal` (centre `x`, `y`), `whip-pan-cut`, `zoom-through-transition`; `layouts/effect/ink-bleed-reveal`, `dither-pass`; `verify --loop` | Look: kit (working HyperFrames originals). AE: all 44 `layouts/transition/*` reach AE as pictures (`"ae": "png"`); a DOM version of a few recipes would be editable keyframes (row 2) |
| Theme and example-film techniques: hash boil, stop-motion on twos, pixel world on a canvas, halftone, spot light, multiplayer cursors, chat, notifications, bar chart race, oscilloscope, exploded stack, variable-font morph, dolly zoom, rack focus | `hand/boil`, `hand/shake`, `background/pixel-worlds`, `layouts/transition/halftone-dissolve`, `cursor/multiplayer`, `ui/chat-thread`, `ui/notification-stack`, `data/bar-chart-race`, `data/oscilloscope`, `data/exploded-stack`, `text/variable-axis`, `camera/dolly-zoom`, `camera/rack-focus` | Kit. saas's `twos()` is a function ease; the kit builder fits eases to one Bézier, so stepped motion stays a `tl.set` per pose as `hand/boil` does |
| "Grammar, not assets" for references | `workflow/free-design.md` (style references kept local, grammar borrowed), `remake.md` (no people, voice, music or logo of the original) | Same idea; saas adds crediting the creator by name and link (row 4) |
| Tone matrix | `film.md` "The numbers" (eases by role, springs by damping ratio, durations, parallax), `recipes.md` by genre (premium, playful, hand-drawn…) | Complementary: kit's numbers are per role, saas maps a brief's tone to choices (row 3) |

## Not taken, and why

- **The 101 theme storyboards** (`docs/themes/`, 7.8 MB): static HTML sheets with no script and no animation; their motion exists only as
  three lines of text per theme. All tell the same fictional SaaS story. The kit already has 13 looks and a free-design gate.
- **The example films** (`examples/`): one-off HyperFrames pages; GSAP 3.14.2 and three.js 0.181.2 load from jsDelivr at render time (no
  network is a kit rule), several build their timeline after `document.fonts.load()` (asynchronous). Their techniques are in the kit
  already (table above).
- **Human layer** (`creative/human-layer.md`, `tools/fal_shots.py`): generated people and clips through fal (paid network service, model
  licence terms not stated). Its truth rules are sound studio policy (a generated person is an actor, never a customer or a testimonial;
  say so in the credits) and can be added to the skill if the studio ever uses generated people.
- **`screen_track.py` + `matrix3d` homography** (UI pinned onto a green-screen plate): new to the kit, but it needs generated or shot
  green-screen footage, holds badly when a finger covers a corner, and the kit's AE recorder samples a 2D matrix per layer
  (`engine/ae/record.js`), so the port would be pictures unless the AE side learns Corner Pin. Revisit with a real job.
- **`pick_themes.py`, `history_report.py`, site builders**: tied to the theme gallery.
- **`deliver.sh` render-at-2x-then-downscale**: costs four times the render; the repo does not measure the gain.

## Risks and open questions

1. **Row 1 conflicts with a kit rule.** `workflow/story.md` asks body beats to "share one stage and one or two kinds of transition, so they
   read as one flow"; saas wants at least three transition families when a film has five cuts or more. Proposal for the desktop session:
   the body's base transition counts as a motif (allowed to repeat), and the variety check applies to the hook, reveal, proof and CTA
   changes. The user decides.
2. **The repo is not consistent with itself.** Its skill bans bounce / elastic eases on UI and gradient text, yet 12 theme notes, six places
   in the example code and theme 101 use them; its rules say a surprise every 15 s and at most two accents per shot, the audit flags 18 s
   and three. Take numbers from the rules text, not from the examples.
3. **Young project.** 8 commits in 10 days by one author, the six films built by parallel Claude agents (`examples/six-films/README.md`).
   Ideas only; nothing to vendor.

## Build notes for the desktop session

Only if the user asks for a row; nothing is copied as shipped. Credit line in `docs/THIRD-PARTY.md` "Techniques and references"
(saas-motion-kit, MIT, commit `bc7a414`) and a `docs/CHANGELOG.md` line.

**Row 1: variety check in `kit.py lint`** (`engine/qa/buildlint.py`)
- Rules at the commit above: `tools/variety_audit.py:146-243` and `creative/variety-rules.md`. Data from film.json instead of a hand
  ledger: each scene's `transition_in` preset, each motion's preset name, ease and target role (headline / other), scene start and
  length.
- Checks, as warnings: the same transition preset on two cuts in a row; one transition preset more than 2 times in a film under 60 s
  (3 above); the same entrance preset on three headlines in a row; fewer than 3 distinct eases, or one ease on more than half the
  motions (when there are 4 or more); more than 60 % of scenes within ± 0.25 s of the most common length (when there are 4 or more).
  A film.json `"motifs": ["<preset or ease>", ...]` list (or `"motif": true` on a motion) silences a deliberate repeat.
- Their "surprise every 15-18 s", accent-colour share and tone-mismatch checks need fields film.json does not have; leave them to the
  skill's review loop.
- Tests: two small film.json fixtures (one repetitive, one varied) in the lint's tests; `smoke_new_project.py`. No Gallery change.

**Row 2: narrative transitions**
- Table source: `docs/transitions/data.json` (24 entries: `name`, `family`, `energy`, `tones`, `what`, `when`, `avoid`, `recipe`); keep
  the `when` / `avoid` lines in the kit's words, for example: lock both shapes to one centre for a shape match cut; cut on the fastest
  frame for a motion match; one carried object per change, never carry after carry; three parallax layers with clear ratios; a whip pan
  needs a horizontal-only blur; open an iris from the subject, never the centre; a speed ramp needs motion on both sides of the cut.
- Presets (each through `kit.py library import`, "Mới nhập"): write from the `recipe` field (2-3 lines of GSAP on placeholder ids) as
  kit presets with `fromTo` tweens; transform, opacity and `clip-path: inset() / circle()` port to AE as keyframes and track mattes.
  Leave out the recipes that need SVG filters or `backdrop-filter` (whip blur copy, ink goo, glass refraction): they would reach AE as
  pictures, like the HyperFrames layouts the kit already has.

**Rows 3 and 4: skill text** (`engine/skill/moworks-motion/`, then `engine/tests/pack_skill.py`)
- Tone table from `creative/tone-matrix.md` (11 rows), checked against `film.md` "The numbers" so the two never disagree (for example
  their parallax 0.3 / 1 / 1.4 is the kit's 0.2 / 0.5 / 1.0 written from the other end).
- References: credit the creator by name and link in the film's notes when a reference's rhythm or structure is borrowed;
  `compare --shots` may print cuts per 10 s, the median shot and cuts in the first 3 s at the top of `SHOTS.md`
  (`tools/breakdown.py:94-100`).
