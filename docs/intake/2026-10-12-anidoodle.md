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

**Nên gộp vào library hay chạy đơn lẻ? Chạy đơn lẻ, cộng một cầu nối nhỏ trong kit. Không gộp vào library.**

Lý do:
- **anidoodle không phải bộ hiệu ứng dùng lại được.** Library của kit là những hiệu ứng / layout gọi từ film.json, đổi nội dung bằng tham
  số. Mỗi bức của anidoodle (con cáo, con cá koi, ngọn hải đăng…) là một đoạn code viết riêng cho bức đó. Phong cách nằm ở "bộ cọ"
  (`woodcutKit.ts`, `sumiEKit.ts`…) và công thức trong tài liệu. Muốn có bức mới cho khách thì Claude phải viết code mới bằng skill
  anidoodle. Đưa 32 bức có sẵn vào Gallery chỉ được 32 bức tranh cố định, không dùng cho phim khách được.
- **Đây là một hệ hoàn chỉnh khác hẳn kit:** khoảng 23.000 dòng TypeScript, skill riêng, quy trình duyệt riêng, bộ kiểm riêng,
  engine nhạc riêng. Nhập vào kit là tạo một hệ song song, trái luật của repo ("mở rộng lệnh có sẵn, không làm hệ song song").
- **Kết nối với kit rất dễ:** anidoodle xuất được một file HTML chạy offline, có sẵn hàm tua tới từng khung (`window.FILM.seek(n)`) và chế
  độ "đứng yên chờ điều khiển". Đó đúng là kiểu trang mà kit đang nhúng cho các block HyperFrames (`hf-frame.js`). Chỉ cần dạy
  `hf-frame.js` nhận thêm loại trang này là tranh anidoodle nằm trong phim kit, chạy theo đồng hồ phim, đúng từng khung, xuất được 4K.

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | Cài anidoodle như một plugin / skill riêng của Claude Code để làm tranh, timelapse vẽ tay, phim minh hoạ | Không vào kit: một skill riêng trên máy, cạnh skill moworks-motion | Apache-2.0 | cao (kit chưa có tranh minh hoạ vẽ tay kiểu này) | 30 phút cài + thử | dùng nguyên bản, đơn lẻ |
| 2 | **Thử trên Windows trước:** cài, dựng 1 tranh, 1 timelapse vẽ, xuất HTML; đo thời gian vẽ mỗi khung | Máy desktop | — | cao (quyết định #3) | 1–2 giờ | làm trước #3 |
| 3 | Cầu nối: một tác phẩm anidoodle (file HTML xuất từ `emit.mjs`) thành một lớp trong phim kit, tua theo đồng hồ phim, nét 4K | Mở rộng `engine/vendor/libs/hf/hf-frame.js` (`ctx.hfFrame`) để nhận trang có `window.FILM`; một dòng trong `workflow/recipes.md` | code kit (MIT); file HTML nhúng là Apache-2.0, đi kèm `NOTICE` | cao nếu #2 đạt | 0,5–1 ngày | viết trong kit |
| 4 | Nhạc viết bằng code của anidoodle cho phim kit (không bản quyền, chạy offline) | Ngoài kit: xuất WAV, đưa vào `audio/music` của phim | Apache-2.0; nếu dùng tiếng phòng thu (rooms) thì phải ghi công CC BY 4.0 | vừa (phải nghe thử) | 1 giờ thử | thử nghe, chưa quyết |
| 5 | 32 bức có sẵn làm preset / layout, engine vào `library/`, nhân vật canvas thay rig của kit | — | — | thấp | — | không lấy |

**Kết luận:** Dùng anidoodle đơn lẻ (#1), thử trên Windows (#2), rồi làm cầu nối nhỏ (#3) nếu thử đạt. After Effects sẽ nhận tranh
anidoodle dưới dạng chuỗi ảnh (canvas, như KI-10), không phải layer chỉnh được. Chữ trong phim nên là chữ của kit đặt trên tranh, vì chữ của
anidoodle dùng font hệ thống của Mac (Avenir Next, Helvetica); trên Windows sẽ đổi sang Arial.

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
- **The 32 style plates as presets / layouts.** Fixed pictures (a koi, a fox, a lighthouse), not effects with parameters; in a client
  film they would be stock art. The styles are reached by asking anidoodle for a new picture.
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

**Row 1 / 2: install and trial (nothing committed)**
- Claude Code: `/plugin marketplace add alexgreensh/anidoodle`, `/plugin install anidoodle@alexgreensh-anidoodle` (README "Get started").
  Engine use: `node <skill>/engine/tools/scaffold.mjs <dir> --still hero --film intro --format 16x9 --duration 10 --fps 60`, then
  `npm install`, a Chromium (risk 3), `node tools/still.mjs`, `render.mjs`, `gate.mjs`, `emit.mjs intro --out out/intro.html`.
- Check on Windows: the scaffold and `npm install` run; `gate.mjs` passes; draw time per frame at 1080p and 4K; the emitted HTML opens
  offline; a transparent background is possible for the piece (the README lists WebM / APNG with alpha).

**Row 3: the bridge (extend what exists, nothing new beside it)**
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
