# Intake: alexgreensh/anidoodle

- **Read:** 2026-10-12, commit `06f8be2bef0faa94e7eb6009ef23b36a0ae7b8a8` (after tag `v0.7.1`; engine `package.json` 0.7.1),
  https://github.com/alexgreensh/anidoodle
- **Licence:** Apache-2.0 (`LICENSE`, `NOTICE`, © 2026 Alex Greenshpun) · assets: none needed at render ("no images, no fonts, no audio
  files in the repository", `references/determinism-and-contract.md` rule 4); one public-domain picture (Van Gogh, *Almond Blossom*,
  `engine/assets/refs/`, SHA-256 in `NOTICE`); the README's demo audio and GIFs are the project's own renders. The **optional sound pack**
  is a separate 373 MB download from the repo's GitHub release (`soundfetch.mjs`): instruments from VCSL, **CC0**; three room impulse
  responses from OpenAIR (University of York), **CC BY 4.0: a film rendered with one of these rooms must carry the credit line**
  (`references/music/sounds-licenses.md`). No GPL / AGPL, nothing non-commercial
- **What it is:** a Claude skill plus a TypeScript engine that draws illustrations, drawing timelapses, loops, films, explainers and
  interactive web pieces **on a 2D canvas, entirely in code**, in 32 hand-made styles (pencil & watercolour, woodcut, risograph,
  sumi-e, scratchboard, embroidery, pixel art…), and composes their music in code (21 music vocabularies, modelled instruments, a
  sound-effects kit). Every frame is `renderFrame(film, ctx, frame, env)`, a pure function of the frame number with a seeded random.
  Builds with esbuild, renders with playwright-core (Node 20+), exports PNG, MP4 with score, GIF, WebM / APNG with alpha and **one
  self-contained offline HTML file**. One main author, 259 commits between 2026-09-22 and 2026-10-10, releases up to v0.7.1.

## Tóm tắt cho người dùng

**Quyết định (người dùng, 2026-10-12): lấy theo 4 bước dưới.** anidoodle chạy riêng như một skill (không nhập engine vào kit); 32 phong
cách thành một **danh mục "Phong cách vẽ tay"** trong Gallery để chọn và brief khi job chưa có định hướng hình ảnh; cầu nối để tranh /
phim anidoodle nằm trong phim kit.

**anidoodle làm gì:** vẽ tranh minh hoạ hoàn toàn bằng code theo 32 chất liệu, và **làm cả chuyển động**, không chỉ tranh tĩnh:
- tranh **tự vẽ ra từng nét** theo thứ tự của hoạ sĩ chất liệu đó (cả 32 phong cách đều có bản "tự vẽ");
- **vẽ xong thì sống dậy**: cá koi bơi qua hồ rộng hơn khung hình, camera bám theo (`koiWorld.ts`); con báo chạy trên khung xương
  (`cheetahRig.ts`, `cheetahRun.ts`); nhân vật bước theo nhịp nhạc rồi vẫy tay (`miraWalk.ts`); phim mẫu 47 s, con bướm cơ khí từ bản vẽ
  kỹ thuật thành bướm màu nước bay đi (`example/`);
- camera (lia, zoom, parallax, rung: `camera.ts`), chuyển cảnh (quét cọ, vòng tròn, chớp: `transitions.ts`; vật biến thành cảnh sau:
  `morph.ts`; cắt nối liền chuyển động: `seams.ts`), chữ vẽ tay động (`kinetic.ts`), loop / sticker / GIF, phim dài có nhạc tự soạn,
  video giới thiệu sản phẩm nhiều khổ.

Mọi bức và mọi chuyển động đều do Claude **viết code mới cho từng tác phẩm**, dùng "bộ cọ" của phong cách (`woodcutKit.ts`, `sumiEKit.ts`…)
và công thức của nó (`references/styles/*.md`). 32 bức trong repo là ảnh minh hoạ cho 32 phong cách. Vì vậy engine không vào `library/`
(một hệ TypeScript khoảng 23.000 dòng, có skill, quy trình duyệt và bộ kiểm riêng: nhập vào là tạo hệ song song, trái luật của repo).
Còn **danh mục phong cách** thì vào Gallery, như một bảng màu / chất liệu để chọn.

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | Cài anidoodle chạy riêng (plugin / skill của Claude Code) và **thử trên Windows**: vẽ một chủ đề thật của studio (ví dụ sản phẩm của khách) theo 2 phong cách, cho nó tự vẽ ra và chuyển động; đo thời gian mỗi khung ở 1080p và 4K. **Bài thử cũng chạy lại code của cả 32 phong cách** (ảnh + clip tự vẽ ra); kết quả dùng luôn cho thẻ #2 | Không vào kit: một skill riêng trên máy, cạnh skill moworks-motion | Apache-2.0 | cao (quyết định #3) | 30 phút cài + 2–4 giờ thử (32 phong cách) | dùng nguyên bản, đơn lẻ |
| 2 | **Danh mục "Phong cách vẽ tay"** trong Gallery: 32 thẻ, mỗi thẻ có ảnh mẫu, clip tranh tự vẽ ra, mô tả (chất liệu, thứ tự nét, hợp với loại phim nào) và nút COPY brief (ví dụ *"Vẽ minh hoạ phong cách khắc gỗ (anidoodle) cho cảnh 3"*) | Một mục mới của Gallery (`engine/gallery.py`); ảnh và clip lấy từ kết quả bài thử #1 | Apache-2.0: ảnh / clip là bản render của code tác giả; kèm `LICENSE` + `NOTICE`, một dòng `THIRD-PARTY.md` | cao (job chưa có định hướng hình ảnh có chỗ chọn) | 0,5–1 ngày | làm |
| 3 | Cầu nối: tranh / phim anidoodle (file HTML xuất từ `emit.mjs`) thành một lớp trong phim kit, tua theo đồng hồ phim, nét 4K | Mở rộng `engine/vendor/libs/hf/hf-frame.js` (`ctx.hfFrame`) để nhận trang có `window.FILM`; một dòng trong `workflow/recipes.md` | code kit (MIT); file HTML nhúng là Apache-2.0, đi kèm `NOTICE` | cao nếu #1 đạt | 0,5–1 ngày | viết trong kit |
| 4 | Nhạc viết bằng code của anidoodle cho phim kit (không bản quyền, chạy offline) | Ngoài kit: xuất WAV, đưa vào `audio/music` của phim | Apache-2.0; nếu dùng tiếng phòng thu (rooms) thì phải ghi công CC BY 4.0 | vừa (phải nghe thử) | 1 giờ thử | thử nghe, chưa quyết |
| 5 | Engine vào `library/` hoặc `engine/vendor/`; 32 bức thành preset / layout chạy được; nhân vật canvas thay rig của kit | — | — | thấp | — | không lấy |

**Kết luận:** Làm #1 trước, rồi #2 (không phụ thuộc kết quả #1, nhưng thẻ chỉ có ích khi máy có skill anidoodle), #3 nếu #1 đạt, #4 khi
có job cần nhạc. After Effects nhận tranh anidoodle dưới dạng chuỗi ảnh (canvas, như KI-10), không phải layer chỉnh được. Chữ trong phim
nên là chữ của kit đặt trên tranh, vì chữ của anidoodle dùng font hệ thống của Mac (Avenir Next, Helvetica); trên Windows sẽ đổi sang
Arial.

## Already in the kit

| anidoodle | Kit | Better one, and why |
|---|---|---|
| 32 drawing media as whole illustrations, each with a film of it being drawn in the medium's order | `presets/hand/*` (boil, shake, hit-stop, comic-text, paper, pencil-draw, watercolor: handkit.js from claude-animation), `layouts/hand/*` (12, HyperFrames) | Different jobs. The kit's hand presets put a hand-made look on film elements (marks around a word, paper under a scene, boil on a drawing); anidoodle draws the picture itself. anidoodle is far richer for illustration; the kit's reach AE better (`hand/boil` as hold keys) |
| Characters kept identical across shots and styles (`character/`, `characters/mira`, `theo`), canvas | `engine/vendor/libs/aimk/rig.js` (`AIMK_RIG`), character sheets, `kit.py sheet --puppets` | Kit for AE (SVG parts become shape layers) and for its approval sheets; anidoodle for painted looks |
| Camera moves, seams between scenes, motion blur averaged in linear light | `layouts/camera/*`, `transition/*`, `kit.py mp4 --blur` (linear light) | Same ideas; the kit's work on the film's DOM and reach AE as keyframes |
| Launch-film kit (`launchTemplate.ts`, `launch.mjs`), captions `.srt / .vtt`, `verify-export.mjs` (A/V sync, true peak), `framecheck.mjs` (no text cut by the edge) | kit film workflow, `kit.py transcribe`, `loudness`, `lint`, `collide`, `qa` | Kit (its own workflow, Vietnamese, brand packs); anidoodle's would be a parallel system |
| Music composed in code, 21 vocabularies, modelled + optional recorded instruments, `music.mjs check` | Mixkit downloads (Mixkit licence: no TV / radio, no games…), ElevenLabs `kit.py music` (paid), `beats`, `align`, `carve` | Nothing comparable in the kit: an offline, royalty-free score is new (row 4). Quality unknown until a human listens; the author says the same ("You cannot hear the score") |
| Sound-effects kit, 14 synthesised layered effects | 19 recorded effects (HyperFrames / Pixabay), the sound pass | Kit, by its own documented choice (recorded, not synthesised) |
| Determinism gate (`gate.mjs`: frames hashed forward / reversed / across pages, cold vs cached, contract scan, dead air) | `kit.py verify`, `verify --play`, Gallery `seek` / `bake` checks | Same spirit; each checks its own engine. Nothing to port |

## Not taken, and why

- **The engine into `library/` or `engine/vendor/`.** Each piece is bespoke TypeScript built with esbuild; 22,873 lines in
  `engine/src/canvas-core/*.ts` alone (top level, without `music/`, `character/`), plus tools. It brings its own skill, gates and
  approval steps: a second system next to the kit's. Keeping it as its own skill keeps the author's updates (`/plugin` update) and
  leaves the kit small.
- **The 32 style plates as runnable presets / layouts.** They illustrate the 32 styles; as presets they would be fixed pictures (a koi,
  a fox, a lighthouse) with no parameters. They enter the Gallery as style cards instead (row 2): pick a style, then anidoodle draws
  the client's subject in it.
- **Its lettering and text.** Lettering is hand-authored per word (`lettering.ts` draws "anidoodle"); UI text uses the font stack
  `"Avenir Next", "Helvetica Neue", Helvetica, Arial` and `"SF Mono", Menlo, Monaco, monospace` (`launchKit.ts:14-15`, `kinetic.ts:395`),
  macOS fonts that fall back to Arial / Courier on Windows. In a kit film the words stay kit text (Vietnamese, brand fonts, AE text
  layers) over the drawing.
- **Interactive web pieces** (`<ani-doodle>` element, form mascot): web work, not film.
- **Remotion and HyperFrames adapters** (`tools/adapters/`): the kit drives the page itself (row 3); its HyperFrames adapter is marked
  "NOT INSTALLED HERE … have NOT been run" by its author.

## Risks and open questions

1. **Windows is untested upstream.** No CI in the repository; `tools/gallery.mjs:34` looks for fonts under `/System/Library/Fonts` and
   `/usr/share/fonts`; `docs-check.mjs` mentions CRLF checkouts only. Row 2 settles it. The Codex plugin mirror script is bash
   (`scripts/sync-codex-marketplace-plugin.sh`), not needed to use the skill.
2. **Render time per frame is unknown.** Painted styles stack many layers; the docs ask to measure draw cost warm on one page, but give
   no numbers. Measure in row 2 (a 10 s piece at 1080p and at 4K scale 2) before promising a client deadline.
3. **A second Chromium.** anidoodle's own setup runs `npx playwright-core install chromium` (a large download: ask first). Its
   playwright-core is 1.63.0, the same version as the kit's Python Playwright (`engine/toolchain.json`), so pointing
   `PLAYWRIGHT_BROWSERS_PATH` at the kit's `%USERPROFILE%\.aimotionkit\ms-playwright` may avoid the download; to confirm on the
   machine.
4. **CC BY 4.0 rooms.** Any score rendered with `small-room`, `recital-hall` or `live-room` needs the OpenAIR credit in what is
   delivered. Simplest studio rule: install the instruments only (`soundfetch.mjs get piano …`, not `rooms`), or add the credit to the
   film's notes whenever a room is used. The CC0 instruments need nothing.
5. **Apache-2.0 when a piece ships inside the kit repo.** An emitted HTML file carries anidoodle's compiled engine. In a client film's
   folder it never leaves the studio; committed to this public repo (for example a Gallery demo) it must travel with anidoodle's
   `LICENSE` and `NOTICE`, and get a `docs/THIRD-PARTY.md` row.
6. **Young, fast-moving project.** Three weeks old, one author, versions 0.x. Pin the version the bridge is tested with; the page contract
   it relies on (`window.FILM.ready / mount / seek`, `?adapter`) is small and documented in `references/backends-and-adapters.md`.

## Build notes for the desktop session

**Row 1: install and trial (nothing committed)**
- Claude Code: `/plugin marketplace add alexgreensh/anidoodle`, `/plugin install anidoodle@alexgreensh-anidoodle` (README "Get started").
  Engine use: `node <skill>/engine/tools/scaffold.mjs <dir> --still hero --film intro --format 16x9 --duration 10 --fps 60`, then
  `npm install`, a Chromium (risk 3), `node tools/still.mjs`, `render.mjs`, `gate.mjs`, `emit.mjs intro --out out/intro.html`.
- Check on Windows: the scaffold and `npm install` run; `gate.mjs` passes; draw time per frame at 1080p and 4K; the emitted HTML opens
  offline; a transparent background is possible for the piece (the README lists WebM / APNG with alpha).
- The same trial renders all 32 styles (user, 2026-10-12): for every row of `references/styles/INDEX.md`, `still.mjs <hero module>
  --scale 2` (the picture) and `render.mjs <draw-film module> --out <id>.mp4` (the drawing clip), plus `gate.mjs` on each draw film. A
  table of the results (style, pass / fail, draw time per frame, file sizes) goes in this report or the CHANGELOG; the files themselves
  are the Gallery cards of row 2, so nothing is rendered twice. A style that fails on Windows gets no card until it passes.

**Row 2: the "Phong cách vẽ tay" Gallery category**
- Shared with huashu-art-motion (`docs/intake/2026-10-13-huashu-art-motion.md` row 2): one category, two groups (drawing media
  from anidoodle, art movements / artists from huashu); where both have a style, keep one card.
- Source per style: `references/styles/INDEX.md` (generated by `tools/registry.mjs` from the `STYLE` blocks in the plates) gives the id,
  medium, hero module and draw-film module; `references/styles/<id>.md` the recipe (30 files at the commit above for the 32
  rows of the index: the cards of the two styles without one take their text from the plate's header comment); `tools/style-media.json` a one-line medium per plate. The repo ships no per-style image, only the contact sheet
  `assets/styles.jpg`: the cards use the picture and clip each style produced in the row 1 trial (deterministic: the same pixels as
  the author's code draws). Record the anidoodle version used.
- Where it lives: a Gallery section (`engine/gallery.py`), extending the Gallery, not a parallel page. Storage to decide on the desktop:
  `library/looks/` holds colour / type looks applied by `kit.py brand` (`brand.json`, `FRAME.md`), which a drawing medium is not; a small
  folder of style cards read by the Gallery is the likely fit. Each card: title in Vietnamese and English, the medium in one line, the
  order of the marks, "hợp với" (from `references/styles.md` "Picking one"), the picture, the clip, COPY brief naming the style id.
- Licence: the pictures and clips are renders of Apache-2.0 code: commit anidoodle's `LICENSE` and `NOTICE` beside them, a
  `docs/THIRD-PARTY.md` row (version, commit), SHA-256 of each file. Counts in README / library README if the Gallery counts change.
- Skill: one line in `engine/skill/moworks-motion/workflow/free-design.md` (a job with no visual direction may start from a drawing style
  card; drawing it needs the anidoodle skill installed), then `engine/tests/pack_skill.py`.

**Row 3: the bridge (extend what exists, nothing new beside it)**
- Shared with huashu-art-motion (same report, row 3): one branch of `hf-frame.js` handles both page contracts.
- Page contract, from `engine/src/hosts/page.ts:176-181` at the commit above: `window.FILM = { meta, ready, mount(scale), seek(frame),
  hash, audio, … }`; `ready` resolves when assets are decoded; when the URL has an `adapter` query parameter the page stays still and
  does not run its own player (with no parameter, as in an `<iframe srcdoc>`, it only seeks frame 0 and waits for a click or the space
  bar, so it is still safe).
- `engine/vendor/libs/hf/hf-frame.js` already puts a page in an `<iframe srcdoc>` scaled to the box and seeks it from the film's
  time. Add one branch: a page with `window.FILM` (and no `window.__timelines`) → `buildReady` waits for `FILM.ready`, then
  `FILM.mount(scale)` with the film's export scale (2 for `--4k`), and each seek calls `FILM.seek(Math.round(u * FILM.meta.fps))`
  (`u` = film time minus `at`, held at the first / last frame), its timing awaited like the existing `__aimkSeekWaits` entries.
  A 30 fps piece then holds each drawing for two of the kit's 60 fps frames.
- Preset side: the existing `ctx.hfFrame` path (a layout whose `assets/` hold the emitted HTML) or a film's own preset in
  `03_HTML/presets/`; params `duration`, the piece's file. `"ae": "png"` (canvas, KI-10).
- Sound: `FILM.audio(sampleRate)` returns the score as PCM; simplest is `render.mjs --out piece.mp4` or `music.mjs render` to a WAV,
  placed in the film's `audio/music/` and mixed by the kit as any music (its loudness pass applies).
- Tests: `gallery check` on one demo layout holding a short piece (seek / bake checks: jump vs play), `kit.py verify --play` on a test
  film with the piece, a 4K export, the AE port (picture sequence expected). `docs/THIRD-PARTY.md` row (anidoodle, Apache-2.0, version,
  SHA-256 of the emitted file) if a demo piece is committed; `docs/CHANGELOG.md` line.

**Row 4: a score for a kit film (trial)**
- `node tools/music.mjs vocab <style>` to read a vocabulary, compose per `references/music/compose.md`, `music.mjs check` must PASS,
  then the user listens. Write down which instruments and rooms played (risk 4).
