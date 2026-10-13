# Intake: alchaincyf/huashu-art-motion (+ the X post by @Voxyz_ai)

- **Read:** 2026-10-13, commit `e47f792252030f6b3b25f26b2857ae48395e626b`, https://github.com/alchaincyf/huashu-art-motion · the X post
  https://x.com/Voxyz_ai/status/2109690569563746755 (Vox, 2026-10-12: a "Claude Code tip" presenting this repo, its 35 styles in two
  layers, the delivery gate, and a 5-step prompt; read from the page once `x.com` was allowed in the environment)
- **Licence:** MIT (`LICENSE`, © 2026 alchaincyf) for code and docs · assets: fonts in `scripts/engine/lib/fonts/` SIL OFL 1.1 (several
  with Reserved Font Names, listed in `LICENSES.md`); **not MIT**, per README "License": the author's own likeness and its character
  frames (`demos/_shared/hero/`, `demos/long_scroll/frames/`, `assets/角色/`, `lib/rig_huashu.js`, the `TOON` "author" look), the
  Clawd fan-demo GIFs and film; `reference_films/spacex/spacex_wb/assets/strokes.js` under the Arphic Public License (copyleft-style).
  Also flagged here: gpt-image hand PNGs in `reference_films/spacex/` (AI images, status unclear), the Mario showcase GIFs (Nintendo look,
  real-person cameos), SpaceX subject matter
- **What it is:** a Claude / Codex skill (docs in Chinese, `SKILL.md` 126 lines) plus a plain-JavaScript **Canvas 2D** engine, no build
  step, rendered by Python Playwright + ffmpeg. Three products: (1) **35 art-movement / artist styles** drawn and animated in code
  ("paintings that move"), (2) **8 explainer "grammars"** (Kurzgesagt, Vox, whiteboard, 3Blue1Brown, storytime, kinetic type, keynote
  UI, finance chart; a ninth, presenter explainer, is reference code only) rendered from a **JSON spec**, (3) narration-film method,
  QA and a delivery gate. One author, 17 commits, 2026-10-06 → 2026-10-13 (CHANGELOG from 2026-10-04); CI includes a Windows render
  smoke test.

## Tóm tắt cho người dùng

**Quyết định (người dùng, 2026-10-13): lấy theo hướng dưới, gộp chung với anidoodle** (một danh mục phong cách, một cầu nối, một bộ
luật), cộng mục #7 mới sau khi so thẩm mỹ: nâng các layout giải thích của kit theo cách dàn dựng của huashu (viết lại trong kit).

**Có lấy được phong cách, cách vẽ và cách làm chuyển động không? Được về mặt giấy phép (MIT). Nhưng lấy theo dạng "bộ cọ + công thức +
luật", không phải lấy 35 cảnh có sẵn.** Lý do:

- **35 cảnh mẫu đều vẽ cùng một căn phòng** (cô gái, con mèo, cái bàn): đó là phim "tốc hành lịch sử nghệ thuật" của tác giả. Mỗi cảnh là
  code viết riêng 300–460 dòng, toạ độ cố định 1920×1080. Tác giả tự ghi: "làm chủ đề mới thì phải bố cục lại cho chủ đề".
- **Phần dùng chung được là "bộ cọ"**: `paint.js`, `brush.js`, `render.js`, `post.js` vẽ lại *bất kỳ* tấm nền nào theo một phong cách
  (nét cọ Van Gogh theo trường hướng, chấm Seurat, khảm La Mã, bán sắc, pixel, thuỷ mặc, màu nước, khắc gỗ ánh sáng Rembrandt…), cộng
  35 **thẻ công thức** (thông số, bảng màu theo vùng, thứ gì chuyển động, chuyển cảnh riêng, điểm yếu, tác giả tự chấm sao).
- **Cách làm chuyển động là luật, không phải preset**: mỗi bức = 1 chuyển động chính + 2–4 vòng lặp mô-típ của chính phong cách đó;
  chuyển cảnh = "ngôn ngữ chữ ký" của phong cách sắp vào, mọc ra từ một vật trong khung; nhịp theo lưới BPM; bảng camera có số đo.
- **Cách gọi**: `SKILL.md` chỉ đạo Claude; cảnh nghệ thuật là code (`scenes/<id>.js` + bảng `eras.js`), trang lộ `window.renderFrame(t)`
  và `window.prepare(t)`, mỗi khung chỉ phụ thuộc `t`; đoạn giải thích là file JSON (`render.py --spec`).

**Trùng và xung đột với kit, tegaki, anidoodle (đã đối chiếu từng phần):**

| Phần của huashu | Kit / repo khác đã có | Kết luận |
|---|---|---|
| 35 phong cách hội hoạ / nghệ sĩ (Van Gogh, Monet, Klimt, Bauhaus, Ghibli, thuỷ mặc, 8-bit…) | anidoodle: 32 **chất liệu vẽ tay** (chì màu, khắc gỗ, risograph…); kit: 13 look màu / chữ | **Bổ sung, ít trùng.** anidoodle = chất liệu + tranh tự vẽ ra; huashu = trường phái / hoạ sĩ + "tranh sống" + chuyển cảnh chữ ký. Trùng một phần: pixel art, rubber hose, bán sắc / pop, cắt giấy (Matisse ↔ collage), thuỷ mặc (17_ink ↔ sumi-e), màu nước (Ghibli ↔ pencil & watercolour), chấm (Seurat ↔ stipple), phẳng (16_2026 ↔ flat vector): chọn bản đẹp hơn sau khi render thử hai bên |
| Bộ cọ vẽ lại tấm nền theo phong cách | Kit có `hand/watercolor`, `hand/paper`, `effect/dither-pass`, `effect/facet-morph`, `background/halftone-field`, `transition/grid-pixelate`, `background/pixel-worlds`: hiệu ứng lẻ, **không có** cái nào vẽ lại một bức ảnh theo trường phái | **Mới với kit** |
| 49 chuyển cảnh | Kit ~60 chuyển cảnh (DOM, shader, HyperFrames) | Chuyển cảnh huashu chạy giữa **hai canvas**, không đặt được giữa hai cảnh DOM của kit. Chỉ dùng bên trong một lớp huashu |
| 8 đoạn giải thích từ JSON (whiteboard, Vox, 3b1b, biểu đồ, chữ động…) | Kit: `line/whiteboard-ink`, `hand/write-title`, `text/math-write`, `data/function-plot`, `data/chart-story`, họ biểu đồ `data/*`, `text/vox-annotate`, `text/marker-highlight`, preset chữ động, camera | **Trùng phần lớn; kit tốt hơn** (chữ thật lên AE, tiếng Việt, brand). Font của các đoạn này **không có tiếng Việt** (Noto Sans SC, LXGW, Inter bản latin) và nó chỉ kiểm thiếu chữ Hán, nên chữ Việt sẽ âm thầm đổi font. Lấy luật và con số, không lấy code |
| `breakdown.py` (tách cảnh phim tham khảo) | `kit.py compare --shots / --follow` | Kit tốt hơn phần tách cảnh; huashu có thêm **khớp lưới nhịp** và **bản đồ nhiệt chuyển động** từng đoạn: thêm vào `compare --shots` |
| `qa.py`, `film_gate.py`, `deliver.py` | `kit.py qa`, `verify`, `lint`, `collide` | Trùng một phần. Mới: tỉ lệ khung chuyển động nhanh (chống "phim PPT"), đoạn trống ≥ 0,3 s, tỉ lệ nền xanh tím, số lần đẩy vào mỗi phút. Thêm vào `kit.py qa` dưới dạng **báo cáo, không chặn** (ngưỡng của tác giả đo trên phim của chính họ) |
| `storyboard_lint.py`, bảng phân cảnh | Cổng storyboard + motion spec của kit | Trùng; lấy vài luật (mỗi dòng phải có một **vật** + một **động từ**, chữ trên màn ≤ 8 chữ, cảnh 2–6 s, không 3 cảnh liền đẩy vào) |
| Luật camera (bảng đo: đẩy chậm 0,6–1,5 s, kéo ra 0,8–2 s, lia 0,5–0,9 s, đẩy nhanh 0,25–0,35 s, dập 0,17 s; điểm nhấn ≤ 1/3 số cảnh; không 3 lần liền đẩy vào) | Kit `film.md` "The numbers" (ease theo vai trò, thời lượng), `recipes.md` "zoom theo log, **never zoom in and straight back out**" | **Bổ sung**, có một chỗ cần nói rõ: kit cấm đẩy vào rồi kéo ra *ngay* (giật qua lại); huashu bảo đẩy vào thì *về sau* phải kéo ra / lia / cắt. Hai luật hợp nhau nếu ghi: "không kéo ra ngay trong cùng một chuyển động; qua các cảnh thì có vào có ra" |
| Cấm màu xanh tím "AI slop" | Kit `free-design.md` cũng cấm | Trùng ý; huashu có máy đo |
| 8 bảng màu có tên | Kit: look, brand pack | Bổ sung nhỏ cho phim không brand |
| Nhân vật người: ảnh AI tạo + code ghép | Kit cho phép "generated base, kit motion on top"; rig của kit cho nhân vật phẳng | Không xung đột |
| Nhạc tổng hợp bằng code | Kit: tiếng thu thật + Mixkit / ElevenLabs; anidoodle có engine nhạc giàu hơn | Không lấy (bản nhạc của huashu chỉ là bản mẫu) |
| fps: clip 30 fps, phim 60 fps | Kit chỉ 60 fps | Qua cầu nối, kit tua theo thời gian: không xung đột |
| Viết tay chữ (tegaki) | — | Không liên quan; huashu không có viết tay theo font |

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | **Thử trên Windows**: render cả 35 phong cách (bản phim mẫu `--film gallery`), đo thời gian mỗi khung; thử viết **1 cảnh mới cho một chủ đề thật** của studio bằng bộ cọ (ví dụ sản phẩm của khách kiểu Van Gogh và kiểu Seurat) | Máy desktop, ngoài kit | MIT | cao (quyết định #2–#4) | 3–5 giờ | làm trước |
| 2 | **Danh mục phong cách**: 35 thẻ (ảnh, clip "tranh sống", mô tả cách vẽ / cách chuyển động / chuyển cảnh chữ ký / số sao / điểm yếu, COPY brief), **chung một danh mục với 32 thẻ anidoodle**, chia hai nhóm: "Chất liệu vẽ tay" (anidoodle) và "Trường phái / hoạ sĩ" (huashu); phong cách trùng giữ một thẻ | Mục Gallery đã định cho anidoodle (một mục, không làm hai) | MIT; ảnh mẫu là căn phòng cô gái + mèo của tác giả: chỉ để xem phong cách, không dùng làm nội dung phim; ghi công ý tưởng Tak (@cherry_mx_reds) | cao | 0,5 ngày (dùng chung khung của anidoodle) | làm, sau #1 |
| 3 | **Một cầu nối chung** cho cả anidoodle và huashu: `hf-frame.js` nhận thêm trang có `window.FILM` (anidoodle) **hoặc** `window.renderFrame / prepare` (huashu); engine huashu (`engine.js`, `lib/`, `transitions.js`, cảnh) đi kèm như tài sản của layout / preset phim, nguyên bản, có SHA-256 | Mở rộng `engine/vendor/libs/hf/hf-frame.js` một lần cho cả hai | MIT | cao nếu #1 đạt | thêm 0,5 ngày so với cầu nối anidoodle | làm cùng cầu nối anidoodle |
| 4 | **Luật cho skill**: bảng camera có số đo + ngân sách điểm nhấn; "tranh sống" = 1 chuyển động chính + 2–4 mô-típ; chuyển cảnh chữ ký mọc từ một vật; bảng màu theo vùng; nhân vật đi qua cùng bộ vẽ; fps nhảy bậc theo phong cách (rubber hose 12, rối bóng 10, Haring 8); một phim một phong cách; mỗi dòng phân cảnh có một vật + một động từ; cue gắn theo từ trong lời đọc | `workflow/film.md` ("The numbers"), `free-design.md`, `recipes.md` (sửa luật zoom cho rõ), `review.md` | MIT (viết lại bằng lời của kit, ghi công) | cao | 2–3 giờ | làm |
| 5 | Đo "phim PPT" trong `kit.py qa` (tỉ lệ khung chuyển động nhanh, đoạn trống ≥ 0,3 s, nền xanh tím, đẩy vào / phút) và lưới nhịp + bản đồ nhiệt trong `kit.py compare --shots` | `engine/qa/motion_qa.py`, `engine/qa/shots.py` | MIT (viết lại bằng numpy; bản gốc cần OpenCV, kit không có) | vừa | 4–6 giờ | làm sau |
| 6 | 8 đoạn giải thích JSON, 49 chuyển cảnh dùng cho cảnh kit, nhạc, giọng (Volcengine), cầu nối ảnh AI, phim tham khảo SpaceX, khung nhân vật của tác giả, Mario / Clawd, dữ liệu nét Arphic | — | xem trên | thấp | — | không lấy |
| 7 | **Nâng cấp layout giải thích của kit theo cách dàn dựng của huashu** (xem "So sánh thẩm mỹ"): bàn điều tra kiểu Vox (bản in bán sắc, dây đỏ, bút dạ quang, nhãn đen rách mép, camera lia giữa các món), bảng trắng có bàn tay cầm bút, biểu đồ kiểu báo (tít kết luận, đơn vị, nguồn, chỉ đánh dấu một điểm, nhãn "số liệu minh hoạ") | Viết lại thành layout kit (DOM, chữ tiếng Việt, lên AE chỉnh được), qua "Mới nhập": nâng `text/vox-annotate`, `line/whiteboard-ink`, `data/chart-story` / `data/data-chart` hoặc thêm layout mới | MIT (viết lại, ghi công) | cao | 1–2 ngày | làm sau #4 |

**Kết luận:** Dùng huashu theo cùng con đường đã chọn cho anidoodle, **gộp chung chứ không làm song song**: một danh mục phong cách,
một cầu nối, một bộ luật; cộng #7: nâng layout giải thích của kit lên chuẩn dàn dựng của huashu (xem "So sánh thẩm mỹ"). Trước hết thử trên Windows và thử vẽ một chủ đề thật bằng bộ cọ; 35 cảnh mẫu chỉ để xem phong cách. After
Effects nhận mọi thứ engine này vẽ dưới dạng chuỗi ảnh (canvas, KI-10); chữ trong phim để kit lo (tiếng Việt, text layer AE).

**Cách dùng thông minh nhất khi có cả ba repo:**
- **Chữ viết tay** theo nét bút: tegaki (preset `text/handwrite` của kit).
- **Bức minh hoạ vẽ tay** (chì, màu nước, khắc gỗ…), tự vẽ ra từng nét: anidoodle.
- **"Tranh sống" theo trường phái / hoạ sĩ** (Van Gogh, Klimt, Ghibli, Bauhaus, pixel…), chuyển cảnh chữ ký: huashu.
- **Chữ, UI, biểu đồ, giải thích, chuyển cảnh giữa cảnh, AE chỉnh được**: kit như hiện nay (không dùng 8 đoạn JSON của huashu).
- **Luật đạo diễn** (camera, nhịp, màu, chống PPT): gộp vào skill của kit, một nơi.

## So sánh thẩm mỹ: kit và huashu

**Cách so (2026-10-13):** đặt cạnh nhau những gì có sẵn trong hai repo, cùng loại việc. Bên huashu: `assets/全风格总览.jpg` (35
phong cách, cắt phóng to 6 ô ở độ phân giải gốc), 8 ảnh tổng quan `assets/动画语法/*_总览.jpg`, dải 6 khung trích từ các GIF
`assets/showcase/monet.gif`, `egypt.gif`, `clawd-vangogh.gif`. Bên kit: thumbnail trong `library/gallery/thumbs/` của 12 mẫu vẽ tay /
chất liệu và 16 mẫu giải thích / dữ liệu / UI, dải 6 khung trích từ clip Gallery `hand__watercolor`, `line__whiteboard-ink`,
`text__vox-annotate`, `data__chart-story`. Chỉ trích khung từ file có sẵn bằng ffmpeg / Pillow, **không render gì mới** (luật phiên
cloud); các tấm ghép nằm trong scratchpad, không commit.

**Giới hạn của phép so (đọc trước khi tin kết luận):**
- Không ngang nhau về bản chất: Gallery của kit là **demo một hiệu ứng** trên nội dung mặc định (một dòng chữ, một biểu đồ, nền trơn),
  còn ảnh của huashu là **khung đã dàn dựng** do tác giả chọn đưa lên README. Một phim thật của kit (Claude dàn cảnh, brand, nhiều lớp)
  không có trong repo để so.
- Ảnh tĩnh và GIF 640 px không cho thấy hết độ mượt; chuyển động chỉ so bằng dải khung.
- Đánh giá thẩm mỹ là nhận xét của người xem, không phải số đo. Người dùng nên tự xem 5 tấm ghép cạnh nhau trên máy desktop
  (Gallery của kit và README / Releases của huashu).

| Tiêu chí | Kit (Gallery hiện có) | huashu | Bên nào hơn |
|---|---|---|---|
| **Tranh minh hoạ, chất liệu hội hoạ** | Không có engine vẽ tranh. Các mẫu `hand/*` là hiệu ứng trên chữ: mảng màu nước sau một dòng chữ, giấy, vòng bút chì, chữ comic; `effect/dither-pass`, `background/halftone-field`, `background/pixel-worlds`, `effect/facet-morph` là hiệu ứng lẻ trên nền trơn | Cả một bức tranh có bố cục, ánh sáng, chất liệu nhận ra ngay: nét cọ Van Gogh, chấm Seurat, vàng lá Klimt, bóng tối Rembrandt, thuỷ mặc có khoảng trắng, nền màu nước kiểu Ghibli, khảm, Bauhaus, pop | **huashu, cách xa.** Kit không có thứ tương đương |
| **Dàn dựng khung hình** (phim giải thích) | Mỗi mẫu một thành phần giữa khung, nền trơn tối hoặc kem, nhiều khoảng trống | Khung có chủ đề và lớp lang: bàn điều tra Vox (bài báo cắt, ảnh in bán sắc, dây đỏ nối, bút dạ quang, nhãn đen rách mép), bảng trắng có bàn tay cầm bút đang vẽ, biểu đồ kiểu tạp chí kinh tế | **huashu** về độ "có đạo diễn". Kit gọn, sạch nhưng trông như linh kiện |
| **Chữ và phân cấp chữ** | Tiếng Việt chuẩn trên mọi mẫu; chữ lớn rõ; biểu đồ `data/data-chart` chữ nhãn rất nhỏ, phân cấp yếu | Biểu đồ có tít kết luận đậm, dòng đơn vị, nguồn, nhãn "số liệu minh hoạ", chỉ đánh dấu một điểm: phân cấp kiểu báo chí tốt. Nhưng font không có tiếng Việt và chữ vẽ trên canvas | **huashu** về cách bày chữ trên biểu đồ; **kit** về chữ dùng được thật (tiếng Việt, AE, brand) |
| **Màu** | Nền tối hoặc kem, một màu nhấn (xanh lá, vàng): sạch, hơi giống nhau giữa các mẫu; `glass/widgets` nền gradient sặc sỡ | 8 bảng màu có tên, một phim một bảng; tranh có bảng màu theo vùng. Riêng `t2_keynote_ui` lại dùng nền mesh xanh tím, trái chính luật cấm "AI slop" của nó | Gần ngang; huashu đa dạng và có chủ ý hơn; cả hai đều có một chỗ lệch luật của chính mình |
| **Độ "sống" của chuyển động** | Dải khung: mẫu vào trong khoảng 1 s đầu rồi **đứng yên** tới hết (cột biểu đồ mọc rồi dừng, mảng màu nước hiện rồi dừng, chữ Vox gạch chân rồi dừng). Đúng với một demo hiệu ứng | Dải khung: cảnh **luôn có chuyện xảy ra** (nhân vật đi qua cầu Monet, ném đá, nước gợn; đi dọc bức hoạ Ai Cập, chim, bọ hung, rồi chuyển cảnh bằng ngôn ngữ của phong cách sau; camera trượt qua cánh đồng Van Gogh) | **huashu** về độ sống; kit có luật chuyển động chi tiết hơn (ease theo vai trò, lò xo, overlap) nhưng demo không cho thấy |
| **Nhân vật** | Rig người phẳng của kit (không có trong các ảnh so) | Cô gái, con mèo, nhân vật chibi: vẽ vector phẳng, nhiều phong cách trông như dán lên tranh (tác giả tự nhận là điểm yếu nhất; Rembrandt 1 sao) | Ngang nhau, cả hai trung bình |
| **Độ đều tay giữa các mẫu** | Đều, sạch, ít lỗi | Không đều: 20 phong cách 3 sao, 14 phong cách 2 sao, 1 phong cách 1 sao; Van Gogh trong phim speedrun phẳng hơn hẳn Van Gogh trong phim Clawd (code phim Clawd không có trong repo) | **kit** đều hơn |
| **Dùng được cho phim khách** | Tiếng Việt, brand, AE chỉnh được, 4K | 35 cảnh là một căn phòng; chữ không tiếng Việt; AE chỉ là ảnh; 4K chỉ là phóng to | **kit** |

**Kết luận thẩm mỹ:** về **độ đẹp và độ "có nghề"** của khung hình, huashu cao hơn rõ ở hai mảng: **tranh minh hoạ theo trường phái**
(kit không có) và **dàn dựng phim giải thích** (bàn Vox, bảng trắng có tay, biểu đồ kiểu báo). Chuyển động của huashu cũng "sống" hơn vì
mỗi cảnh luôn có mô-típ chạy. Kit hơn về **độ sạch, độ đều, chữ tiếng Việt, brand và After Effects**: những thứ quyết định giao được
phim cho khách. Vì vậy cách lấy hợp lý:
- **Tranh nghệ thuật:** dùng engine huashu qua cầu nối (#3), vì kit không có gì thay được.
- **Phim giải thích:** không chạy code JSON của huashu (font, AE, tiếng Việt), mà **lấy huashu làm chuẩn thẩm mỹ để nâng layout của kit**
  (#7): dàn dựng bàn Vox, bảng trắng có tay cầm bút, luật biểu đồ kiểu báo, viết lại trong kit.
- **Luật** (#4) để mọi phim kit có độ sống đó: 1 chuyển động chính + mô-típ chạy liên tục, không để cảnh đứng yên kiểu "demo".

## Already in the kit

| huashu-art-motion | Kit | Better one, and why |
|---|---|---|
| Clip grammars from a JSON spec: `y3_whiteboard`, `t1_3b1b`, `t3_finance_chart`, `y2_vox`, `y5_kinetic_type`, `t2_keynote_ui`, `y1_kurzgesagt`, `y4_storytime` (`scripts/engine/clips/`, contract in `references/09-视频动画语法.md` §五) | `layouts/line/whiteboard-ink`, `layouts/hand/write-title`, `presets/text/math-write`, `layouts/data/function-plot`, `layouts/data/chart-story`, `presets/data/*`, `layouts/text/vox-annotate`, `presets/text/marker-highlight`, the kinetic text presets, `layouts/camera/*` | Kit: DOM text becomes AE text layers, Vietnamese fonts, brand packs. Their clip fonts lack Vietnamese and `clip.js:84` only reports missing CJK glyphs |
| `scripts/analyze/breakdown.py` (cuts, contact sheets, beat-grid fit, motion heatmap) | `kit.py compare --shots` (cuts vs wipes / fast changes, 0.25 s sheets, sound), `--follow` (eases per native frame) | Kit for cuts and measurement; the beat-grid fit ("largest step with 80 % inliers") and per-segment motion heatmap are new (row 5) |
| `scripts/qa.py` (determinism cold / hot, frame cost, motion area, jumps, transition smoke, text framing via `fillText`) | `kit.py verify`, `verify --play`, Gallery `seek` / `bake`, `lint`, `collide` | Kit for DOM films; theirs is canvas-only |
| `scripts/film_gate.py` (fast-motion share, blank runs, blue-purple share, push-ins / min) | `kit.py qa` (pops, flashes, frozen runs, photosensitivity), lint blank frames after cuts | Complementary (row 5) |
| `storyboard_lint.py`, `镜头表模板.md` | `kit.py storyboard`, motion spec gate (`workflow/free-design.md`) | Kit's gate; take a few rules (row 4) |
| Camera language (`references/镜头语言.md`, `lib/camera.js` `CAM.track`) | `film.md` "The numbers", `recipes.md` (log zoom, at a cut the next shot enters moving) | Complementary; huashu's table has measured durations and an accent budget the kit lacks |
| Palettes (`references/色板.md`, `lib/palettes.js`) | looks (`library/looks/`), brand packs; `free-design.md` banned AI defaults | Complementary for unbranded films |
| Character rule: people from image generation, code composites (`references/10-角色.md`, `角色精细度.md`) | `SKILL.md`: generation allowed, "generated base, kit motion on top"; `AIMK_RIG` for flat people | Compatible |
| Music synthesised in code (`scripts/audio/synth_艺术史速通.py`) | recorded effects, Mixkit, ElevenLabs; anidoodle's engine for code scores | Not taken: one example score |
| Art transitions (`transitions.js`, 49, two raster canvases) | ~60 kit transitions between DOM scenes | Kit between kit scenes; theirs only inside a huashu layer |

## Not taken, and why

- **The 35 scenes as client content.** One fixed composition (`references/风格配方/INDEX.md` line 3; all 35 `scenes/*.js` call
  `RIG.girl` / `RIG.cat`), absolute 1080p coordinates, landscape only. They are previews (row 2) and examples of how to write a scene.
- **The 8 clip grammars as code.** Duplicate kit layouts; Chinese-only fonts; canvas text (no AE text layers); a second spec format
  beside `film.json`. Their numbers and rules go to the skill (row 4), and their art direction becomes the target for re-written kit
  layouts (row 7).
- **Transitions between kit scenes.** They composite two canvases; kit scenes are DOM.
- **Voice (Volcengine voice clone, paid cloud), the image-generation bridge, `font_subset.py`, `key_green.py` / `key_split.py`.** The
  kit has ElevenLabs, rembg, `kit.py font`.
- **Long-scroll demo assets** (`demos/long_scroll/frames/`, the author's likeness: not MIT). The method (monotonic camera, events
  relative to "interaction start", per-segment tempo so boundaries land on bar 1) is noted for the skill.
- **`reference_films/spacex/`, Mario and Clawd showcase material, `strokes.js` (Arphic), the gpt-image hand PNGs.** Licence, likeness or
  brand questions; none needed.
- **The music synth.** One example score; anidoodle's music engine is the candidate if code music is ever wanted.

## Risks and open questions

1. **New subjects cost writing time.** A client picture in a huashu style is a new `scenes/<id>.js` (the author's own workflow: one frame
   first, then motion). The renderers re-paint a source canvas (`P.strokes` samples `getImageData` of any underpainting), so a product
   photo or a kit-drawn layout can be the source, but region palettes and direction fields are still authored per shot: no automatic
   direction field ships (the README's Van Gogh "structure tensor" belongs to the Clawd film, whose code is not in the repo; no
   `tensor` in `scripts/`). Row 1 measures how long one shot takes.
2. **Pixels under the kit's Chromium.** Their `render.py` launches Chromium with `--enable-gpu-rasterization --ignore-gpu-blocklist`;
   42 places use `ctx.filter`. Inside the kit the same page runs under the kit's own flags: seek / bake checks and `verify --play` must
   pass, perhaps with `demo.seek_tolerance`.
3. **4K.** Art scenes draw at absolute 1920×1080; a kit 4K export would upscale them. Explainer libraries scale with `ctx.u`, untested.
4. **Render time.** 3–121 ms per 1080p frame by their cards (Van Gogh ≈ 110 ms, shadow puppet 121 ms), before capture.
5. **Loader in an iframe.** Scenes are loaded by synchronous XHR + `eval` (`scenes/index.js:7-9`) and fonts by `FontFace(url)`, all
   relative URLs: the bridge needs the page loaded by URL (`iframe src`) or a `<base href>` in `srcdoc`. To confirm in row 3.
6. **Young project, Chinese docs.** 9 days old, one author; the `07_ukiyoe` style is referenced in docs but missing from the repo. Pin
   the commit the bridge is tested with.
7. **Style overlap with anidoodle.** Where both repos have a style, render both in the trial and keep one card (row 2).
8. **Credit.** The 35-era speedrun follows Tak (@cherry_mx_reds)'s *Art History Speedrun* idea (README "Acknowledgments"): the gallery
   cards carry that credit with the author's.

## Build notes for the desktop session

**Row 1: Windows trial (nothing committed)**
- `uv run --with playwright playwright install chromium` (or point to the kit's Chromium), then from the repo:
  `uv run --with playwright python scripts/engine/render.py --film gallery --out gallery.mp4` (all styles) and
  `render.py --solo <id> --stills 0.3,1.5 --out stills/<id>` per style (`SKILL.md` "工程"). Record per style: pass / fail, ms per frame.
- One real shot: copy `scripts/engine/` to a scratch folder, write `scenes/<new id>.js` (`SCENES[id] = { init(IMG), draw(c, lt, t) }`,
  interface in `references/08-风格作者规范.md`) that draws the client subject flat and re-paints it with `P.strokes` (Van Gogh card
  parameters, `references/风格配方/09_postimp.md`) and with `P.pointillism` (Seurat, `29_seurat.md`); register it in `eras.js`; time
  the work. This decides whether huashu is a studio tool or a gallery of references.

**Row 2: shared style category** (with anidoodle row 2)
- Pictures and clips from row 1 (`--film gallery` gives each style's living-painting segment with its signature transition).
- Card text from `references/风格配方/<id>.md` and `INDEX.md` (two tables: material layer, transferable to any subject; era
  specimens, for tributes and art-history pieces), translated to Vietnamese and English: how drawn, what moves, signature
  transition, the author's stars and "current weakness".
- Licence: MIT `LICENSE` beside the media, `docs/THIRD-PARTY.md` row (commit, SHA-256), credit to the author and to Tak's idea.

**Row 3: one bridge for both repos**
- Page contract (`scripts/engine/engine.js:193-265`): `window.__ready`, `window.__bootFailed`, `window.__total`, async
  `window.prepare(t)` (loads image-sequence frames), sync `window.renderFrame(t)` returning the segment index; the preview UI's
  play loop runs only after a click. Clip pages expose the same (`clip.js:89-95`).
- In `hf-frame.js`: a page without `__timelines` but with `renderFrame` → `buildReady` waits for `__ready` (fail on `__bootFailed`);
  a seek pushes `prepare(u).then(() => renderFrame(u))` into `__aimkSeekWaits` (`u` = film time minus `at`). The anidoodle branch
  (`window.FILM.seek`) is the other case of the same function.
- Engine files as shipped in the layout's `assets/` (`engine.js`, `lib/` without `rig_huashu.js` and the TOON author look,
  `transitions.js`, `scenes/index.js`, the film's scenes, `lib/fonts/` subset actually used + `LICENSES.md` + `OFL.txt`), SHA-256 in
  `source.sha256`, `"ae": "png"`. Tests: Gallery check on one demo layout, `kit.py verify --play`, the AE port (picture sequence).

**Row 4: skill rules** (`engine/skill/moworks-motion/`, then `engine/tests/pack_skill.py`; credit in `docs/THIRD-PARTY.md`
"Techniques and references")
- Camera table from `references/镜头语言.md` §二–三 (durations, when each applies, accents ≤ 1/3 of shots, no three pushes in a row,
  push-ins ≥ 8 / min means look again); write the kit's zoom rule as "never zoom in and straight back out in one move; across shots,
  a push is answered later by a pull, a glide or a cut".
- From `07-正面经验.md`: #1 signature transition, #4 beat punch on both layers, #5 first shot draws itself, #6 region palettes,
  #8 characters through the renderer, #12 main action + 2–4 motif loops, #13 continuous fields instead of reseeding the whole frame,
  #14 scroll modulo = true period, #27 camera from time only (redraw, never scale a bitmap), #28 the reveal frame is the accent,
  #29 still ≠ stuck, "every shot pushes" = PPT, #34 cues by word; from `02-机制.md` and `08-风格作者规范.md`: stepped fps per style,
  one style per film, no weathering on characters.

**Row 5: measurements**
- `kit.py qa`: fast-motion share (in-shot mean grey difference ≥ 9 at 12 fps, 320 px, subtitle band masked; their red < 0.035,
  yellow < 0.06), blank runs ≥ 0.3 s, blue-purple frame share (hue 225–300°, saturation ≥ 0.30 over 30 % of a frame), push-ins per
  minute (their camera estimate uses OpenCV LK flow + RANSAC: re-write in numpy or skip). Report lines, not a gate.
- `kit.py compare --shots`: beat-grid fit and per-segment motion heatmap (`scripts/analyze/breakdown.py`).

**Row 7: kit explainer layouts raised to huashu's art direction** (each through `kit.py library import`, "Mới nhập")
- Reference frames: `assets/动画语法/y2_vox_总览.jpg`, `y3_whiteboard_总览.jpg`, `t3_finance_chart_总览.jpg`; the recipes in
  `references/动画语法/y2_vox.md`, `y3_whiteboard.md`, `t3_finance_chart.md` (measured numbers) and `lib/collage.js`, `lib/media.js`,
  `lib/diagram.js`, `lib/chart.js` (how each piece is drawn) at the commit above. Re-write in DOM / SVG + GSAP, not copied.
- Vox desk: paper ground with grain, prints with halftone and tape / pin, torn black labels, red string drawn between items, a
  multiply yellow highlighter `#DACF08`, elements stepped at 12 fps while the camera glides smoothly between items (their y2 card).
- Whiteboard: a hand holding a pen that follows the drawing tip (`DG.pen`), writing about 16 characters a second starting 0.5 s after
  the spoken phrase, pans of about 0.23 of the frame width over 1.2–2.4 s, the final pull-back to the whole board (y3 card). The hand
  must be the kit's own art or a licensed asset (theirs in `reference_films/` are gpt-image PNGs: not taken).
- Editorial chart: a conclusion headline, a unit line, a source line, an "illustrative data" badge when the numbers are examples, axes
  first, bars from 0, hold at least 0.5 s after a number lands, one highlighted item, honest scales (t3 card).
- Vietnamese titles in the demo; `gallery check` on each new layout; AE: text layers and shape layers expected (DOM / SVG).
