<h1 align="center">Moworks Motion</h1>

<p align="center"><b>Tiếng Việt</b> · <a href="README.en.md">English</a></p>

<p align="center"><b>Từ brief đến phim motion graphic: Claude đạo diễn, kit dựng từng khung hình bằng code.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.1-1d3fd8" alt="version 2.0.1">
  <img src="https://img.shields.io/badge/Claude-Opus_5.5-d97757" alt="Claude Opus 5.5">
  <img src="https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-555" alt="Windows 10 | 11">
  <img src="https://img.shields.io/badge/fps-60-111" alt="60 fps">
  <img src="https://img.shields.io/badge/export-MP4_·_MOV_·_After_Effects-8a2be2" alt="MP4, MOV, After Effects">
  <img src="https://img.shields.io/badge/library-158_motions_·_349_layouts-0a7" alt="158 motions, 349 layouts">
</p>

<p align="center">
  <a href="#bắt-đầu-nhanh">Bắt đầu nhanh</a> ·
  <a href="#ba-kiểu-dự-án">Kiểu dự án</a> ·
  <a href="#tính-năng">Tính năng</a> ·
  <a href="#lệnh-thường-dùng">Lệnh</a> ·
  <a href="GUIDE.md">Hướng dẫn</a> ·
  <a href="CHANGELOG.md">Thay đổi</a> ·
  <a href="KNOWN-ISSUES.md">Giới hạn đã biết</a>
</p>

Moworks Motion là bộ công cụ làm video motion graphic cùng Claude. Bạn cung cấp chất liệu: file PSD, deck, ảnh, nhạc, video tham khảo
hoặc chỉ một đoạn mô tả. Claude thiết kế, trình bày để bạn duyệt, rồi dựng phim bằng HTML + GSAP. Kit render 60 fps, tự kiểm lỗi và xuất
MP4, MOV hoặc project After Effects chỉnh sửa được.

Kit gồm hai phần: thư mục kit (repo này) và skill **moworks-motion** cho Claude Code. `install.bat` cài cả hai; `update.bat` cập nhật cả hai.

## Vì sao dựng phim bằng code

- **Tất định:** mỗi khung hình là một hàm của thời gian. Cùng đầu vào luôn cho cùng khung hình, dù render bao nhiêu lần.
- **Sửa cục bộ:** thay một cảnh, một dòng chữ hay một nhịp mà không ảnh hưởng phần còn lại.
- **Sửa bằng lời:** "chuyển cảnh nhanh hơn", "đổi nhạc", "chữ vào theo lời hát" là những thay đổi Claude thực hiện trong vài phút.
- **Chạy trên máy:** phim được dựng và render tại máy của bạn; guideline và tài liệu của khách hàng không rời khỏi máy.

## Ba kiểu dự án

| Đầu vào | Kiểu dự án | Bước duyệt trước khi dựng |
|---|---|---|
| Thiết kế hoàn chỉnh từng khung (PSD / PSB, deck, PDF, ảnh) | **Giữ thiết kế:** bố cục, font, màu giữ nguyên (sai lệch tối đa 2 px); Claude chỉ diễn hoạt | Motion spec từng cảnh |
| Nội dung, ý tưởng, bài nhạc, guideline | **Thiết kế mới:** Claude thiết kế bố cục, đồ hoạ và chuyển động | 3 phương án storyboard, sau đó motion spec |
| Một video tham khảo | **Remake theo phong cách:** học nhịp, bố cục, ngôn ngữ chuyển động; nội dung là của bạn | Bảng shot đọc từ video gốc + quy tắc chuyển đổi |

Phim có nhân vật hoặc minh hoạ có thêm một bước duyệt: bảng nhân vật, bối cảnh và đồ vật ở mọi tư thế, trước khi làm animation.

### Remake: nên theo phong cách, không nên sao chép 1:1

Kit đọc video tham khảo (cut, nhịp, bố cục, chuyển động đo trên từng khung) và dựng một phim mới với nội dung, thương hiệu, nhạc của bạn.
Cách được khuyến khích là **remake theo phong cách**: giữ tinh thần, nhịp và ngôn ngữ chuyển động của video gốc, còn thiết kế được làm
lại cho nội dung mới.

**Sao chép 1:1 từng khung** (nhất là nhân vật, hoạt hình, minh hoạ vẽ tay) là việc nặng: một phim khoảng 30 giây có thể mất nhiều giờ và
vài trăm USD (quy đổi theo giá API), mà kết quả vẫn không thể giống tuyệt đối. Claude báo trước thời gian, chi phí và đề xuất phương án
nhẹ hơn trước khi bắt đầu. Phần đồ hoạ dựng (chữ, khối hình, giao diện, footage) có thể bám sát hơn khi cần. Dù theo cách nào, remake
không dùng lại người, giọng, nhạc hay logo của video gốc.

<img src="images/readme-9-tiers.png" width="692" alt="Quy trình 9 tầng: Claude Opus 5.5 (1 Skill, 2 Bộ luật, 3 Đạo diễn) → Kit Moworks Motion (4 film.json, 5 Build, 6 Runtime, 7 Renderer) → Thành phẩm (8 Đầu ra, 9 Kiểm tra)">

## Tính năng

| Nhóm | Mô tả |
|---|---|
| **Đầu vào** | PSD / PSB, PowerPoint, Google Slides, PDF, ảnh, nhạc, giọng đọc, video tham khảo, văn bản; một pull request GitHub cũng có thể làm chất liệu cho phim giải thích |
| **Kể chuyện** | Xác định thông điệp và mạch truyện trước khi thiết kế; mỗi cảnh một nhiệm vụ; storyboard ghi lý do của từng cảnh; nội dung xuất hiện theo giọng đọc |
| **Duyệt từng bước** | Storyboard, motion spec, bảng shot (remake), bảng nhân vật: chưa duyệt thì chưa dựng chuyển động |
| **Thương hiệu** | Áp guideline (font, thang cỡ chữ, màu, lề, logo) từ gói brand lưu cục bộ, có bước tự kiểm; logo không bao giờ bị biến dạng. Phim không có brand dùng một trong **13 look** dựng sẵn |
| **Chép lời (transcript)** | Nghe giọng đọc, bài hát hoặc tiếng nói trong video và chép lại thành văn bản kèm mốc thời gian từng chữ, xuất phụ đề `.srt` cho phần mềm dựng; chạy cục bộ bằng Whisper, hỗ trợ tiếng Việt và tiếng Anh. Mốc chữ dùng để đặt chuyển động, hiệu ứng âm thanh và phụ đề đúng lúc từng chữ được nói |
| **Nhạc** | Bắt beat (kiểm tiếng kick dưới 120 Hz, có ảnh), canh lời bài hát có sẵn theo giọng hát, chữ vào đúng lời; 9 template cắt theo beat; dời điểm bắt đầu nhạc để cut rơi đúng beat; **carve**: chỉ khoét dải tần của giọng trong nhạc thay vì hạ cả bài |
| **Âm thanh** | 19 tiếng hiệu ứng thu thật (whoosh, pop, click, gõ phím, riser, impact…), mức từng tiếng được đo: trên nhạc, dưới giọng đọc; mức tổng −16 LUFS, đỉnh ≤ −4 dB, đo trên file MP4 đã xuất và khi phát mono; bảng ảnh khung trước / sau mỗi tiếng và 5 mốc để nghe kiểm bằng tai nghe |
| **Video người nói** | 10 phong cách thẻ đồ hoạ, bố cục tự chuyển (chia đôi, chồng lớp, góc nhỏ, toàn khung); tách người khỏi video để chữ nằm sau người nói; **phụ đề 35 phong cách** của HyperFrames chạy nguyên bản, hỗ trợ tiếng Việt |
| **Phim nhân vật** | Rig nhân vật dùng chung (tỉ lệ, tóc, mặt, trang phục, 20 tư thế, bàn tay, biểu cảm, khẩu hình, đi bộ); bảng nhân vật và bộ kiểm khớp nối trước khi duyệt |
| **Remake** | Phát hiện cut, bảng shot, đo chuyển động trên khung gốc (thời điểm, quãng đường, ease), chỉnh nhạc về đúng tempo gốc, video so sánh song song |
| **anime.js** | Toàn bộ anime.js 4.5 chạy theo đồng hồ của phim (tua từng khung, xuất phim, port AE): tách chữ, scramble, stagger lưới, morph SVG, vẽ nét, chuyển động theo đường, đổi bố cục |
| **Kiểm chất lượng** | Lint thời gian đọc và độ tương phản chữ, chữ chồng lấn, khung trống; onion skin, đồ thị vị trí / tốc độ; so số liệu trong motion spec với phim thật; đo âm lượng hiệu ứng trên dải loa điện thoại |
| **Player duyệt phim** | Ghi chú theo timecode, tự tải lại khi Claude sửa, xem lại và so sánh các version, chế độ phát mượt cho laptop |
| **Xuất phim** | MP4 H.264, MOV ProRes 4444 (kênh alpha), Full HD hoặc 4K, motion blur trộn trong ánh sáng tuyến tính, GIF; khổ 16:9, 9:16, 1:1, 4:5 và dàn lại phim đã duyệt sang khổ khác |
| **After Effects** | Project có layer và keyframe chỉnh được: text layer thật (kể cả chữ trong block HyperFrames), shape layer từ SVG, track matte, precomp, âm thanh tách lớp |
| **Trình chiếu** | Biến phim thành deck: bấm từng slide, ghi chú cho người trình bày, cửa sổ riêng cho khán giả |
| **Thư viện** | 158 mẫu chuyển động, 349 layout; Gallery phân loại theo công dụng, có clip xem trước và nút sao chép brief |

## Bắt đầu nhanh

**Yêu cầu:** Windows 10 / 11, [Python 3.12](https://www.python.org/downloads/) (chọn "Add python.exe to PATH"),
[Git](https://git-scm.com/download/win), Claude Code (ứng dụng desktop, tab Code). After Effects nếu cần port sang AE.

1. Clone kit:
   ```bash
   git clone https://github.com/moworksstudio/moworks-motion "Moworks Motion"
   ```
2. Chạy **`install.bat`** trong thư mục kit và xác nhận một lần. Trình cài đặt cài thư viện Python, Chromium, model AI, font cho After
   Effects và skill **moworks-motion**, sau đó in bảng kết quả.

   Bạn cũng có thể dán link repo vào Claude Code và yêu cầu "cài repo này": Claude clone, chạy `install.bat --yes` và nạp skill ngay trong
   cuộc trò chuyện đó.
3. Mở Claude Code trong thư mục dự án và gửi brief, ví dụ:
   > Làm phim ra mắt sản phẩm 20 giây, khổ 9:16, từ file PSD trong thư mục này, theo bài nhạc `song.mp3`.

   > Làm phim cho thương hiệu của mình theo phong cách video `reference.mp4`: giữ nhịp và ngôn ngữ chuyển động, dùng logo, màu, nội dung
   > và nhạc của mình.

<img src="images/readme-workflow.png" width="601" alt="Quy trình sử dụng: Chuẩn bị (1 Cài đặt, 2 Thư mục project, 3 Mở Claude) → Thiết kế (4 Gọi skill, 5 Duyệt) → Dựng và sửa (6 Claude dựng phim, 7 Xem phim, 8 Feedback) → Xuất (9 Xuất phim)">

Màu: xám = chuẩn bị · cam = Claude thực hiện · xanh dương = bạn duyệt / xem · xanh lá = thành phẩm.

## Lệnh thường dùng

Phần lớn lệnh do Claude tự chạy theo skill; bảng dưới là những lệnh bạn có thể cần.

| Lệnh | Công dụng |
|---|---|
| `install.bat` / `update.bat` / `uninstall.bat` | Cài đặt, cập nhật (liệt kê thay đổi trước khi cập nhật), gỡ cài đặt (mọi thứ vào Thùng rác) |
| `gallery.bat` | Xem thư viện mẫu: clip demo, mô tả, lọc theo công dụng, sao chép brief |
| `1. Preview.bat` (trong thư mục phim) | Player: xem phim, ghi chú, xuất MP4 / MOV, port sang After Effects |
| `kit.py doctor` | Kiểm tra máy: Python, Chromium, model, font, skill, Git, After Effects |
| `kit.py transcribe <phim>` | Chép lời giọng đọc của phim: mốc thời gian từng chữ + phụ đề `.srt` |
| `kit.py compare` | Remake: đọc video gốc (`--shots`), đo chuyển động (`--follow`), video so sánh song song (`--split`) |
| `kit.py brand <phim> <look>` | Áp một look dựng sẵn hoặc gói brand |
| `kit.py cutout <phim> <video> --people` | Tách người khỏi video (thêm `--captions` để chuẩn bị phụ đề) |
| `kit.py studio <phim> --present` | Trình chiếu phim như một deck |

Gặp lỗi: chạy `python engine\kit.py doctor` để kiểm tra máy và xem cách khắc phục. Danh sách lệnh đầy đủ:
[commands.md](../engine/skill/moworks-motion/reference/commands.md).

## Công nghệ

| Thành phần | Vai trò |
|---|---|
| HTML + [GSAP](https://gsap.com), [anime.js](https://animejs.com) | Dựng phim; mỗi khung hình là một hàm của thời gian |
| Playwright + Chromium | Render từng khung 60 fps, chụp ảnh, kiểm lỗi |
| ffmpeg | Mã hoá MP4 / MOV / GIF, trộn âm thanh, đọc video tham khảo |
| faster-whisper, librosa | Chép lời kèm mốc thời gian từng chữ; beat và nhịp bài hát (chạy cục bộ) |
| rembg | Tách nền ảnh, tách người khỏi video (chạy cục bộ) |
| psd-tools, python-pptx, PyMuPDF | Đọc PSD / PSB, PowerPoint, PDF |
| three.js, d3, Lottie | Mẫu 3D, biểu đồ, bản đồ, animation Lottie |
| ExtendScript | Dựng project After Effects |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | Nguồn của phần lớn layout, template theo beat, look, phụ đề, carve nhạc; Studio và trình chiếu (cài khi cần) |
| Node.js (tuỳ chọn) | Chạy nguyên bản các script của HyperFrames |
| ElevenLabs API (tuỳ chọn, trả phí) | Giọng đọc, nhạc, hiệu ứng âm thanh |

## Nhạc Mixkit

Khi dự án chưa có nhạc, Claude tải sẵn 3 bài miễn phí từ [Mixkit](https://mixkit.co/free-stock-music/) để bạn nghe và chọn. Theo
[Mixkit Stock Music Free License](https://mixkit.co/license/#musicFree), nhạc dùng được cho dự án thương mại và phi thương mại trên web,
mạng xã hội, quảng cáo online, YouTube, podcast; **không** dùng cho TV / radio, CD / DVD, game, không remix thành bản nhạc riêng và không
đăng ký với dịch vụ quản lý bản quyền (Content ID...).

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| [Hướng dẫn sử dụng](GUIDE.md) | Cài đặt, làm phim, thương hiệu, After Effects, thư viện |
| [Lịch sử thay đổi](CHANGELOG.md) | Thay đổi theo từng phiên bản |
| [Giới hạn đã biết](KNOWN-ISSUES.md) | Những gì kit chưa làm được và cách xử lý |
| [Định dạng mẫu thư viện](../library/README.md) | Dành cho người viết mẫu chuyển động / layout |
| [Thành phần bên thứ ba](THIRD-PARTY.md) | Mã nguồn mở, tài nguyên và giấy phép |

## Nguồn gốc và ghi công

Moworks Motion phát triển từ [claude-motion-design](https://github.com/howseen-ai/claude-motion-design) của Raphaël Aubry
([Howseen](https://howseen.ai), giấy phép MIT): dựng phim bằng HTML + Playwright + ffmpeg quanh một hàm `seek(t)`, motion blur, đặt âm
thanh theo đỉnh và remake mode. Phần lớn layout trong thư viện, template theo beat, look, phụ đề và carve nhạc lấy từ
[HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0); thiết kế video người nói gốc từ vtake-skills (leeoxiang, MIT).
Danh sách đầy đủ: [THIRD-PARTY.md](THIRD-PARTY.md).

## Giấy phép

Mã nguồn của Moworks Motion phát hành theo giấy phép [MIT](../LICENSE), © 2026 Moworks. Các thành phần bên thứ ba giữ giấy phép riêng
([THIRD-PARTY.md](THIRD-PARTY.md)); GSAP dùng theo GSAP Standard License, không phải giấy phép mã nguồn mở.
