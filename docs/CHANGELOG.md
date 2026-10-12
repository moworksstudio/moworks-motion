# Lịch sử thay đổi

Mỗi phiên bản một mục, mới nhất ở trên. `update.bat` hiển thị các mục mới hơn bản đang cài, cùng danh sách mẫu thư viện được thêm, sửa
hoặc bỏ.

## 2.0.4 (12/10/2026)

Bản cập nhật về độ ổn định của thư viện mẫu, ghi công tác giả và kiểm thử tự động.

### Sửa lỗi
- **Chữ trong các mẫu HyperFrames hiển thị giống nhau trên mọi máy:** mẫu dùng font mà tự nó không tải (Inter, JetBrains Mono, Playfair
  Display…) nay dùng bản font đi kèm kit thay cho font cài trên từng máy.
- Quy tắc phát hiện truy cập mạng trong bộ kiểm tra thư viện hoạt động đúng trở lại; toàn bộ thư viện đạt.

### Ghi công
- Mọi mẫu trong thư viện ghi rõ tác giả, giấy phép và phiên bản nguồn. `docs/THIRD-PARTY.md` bổ sung iart.ai (14 mẫu, kèm thông báo giấy
  phép MIT) và Remocn (2 mẫu), cùng phiên bản cụ thể của claude-animation và anime.js.
- Bộ kiểm tra tự động từ chối mẫu thiếu thông tin tác giả; khi đưa vào thư viện một hiệu ứng làm từ mã nguồn của người khác, skill hướng dẫn
  ghi tác giả và giấy phép.

### Kiểm thử
- GitHub chạy thêm bài kiểm tra trên một máy Windows mới: cài đặt như `install.bat`, rồi dựng, kiểm tra và xuất một phim mẫu. Nhánh `main`
  chỉ nhận thay đổi khi mọi bài kiểm tra đều đạt.

## 2.0.3 (12/10/2026)

Bản cập nhật về bảo mật và độ ổn định: siết chặt trình xem phim và các máy chủ cục bộ, xác minh model AI, khoá phiên bản gói Python và đưa
thư viện về chế độ do chủ kit tuyển chọn.

### Bảo mật
- **Trình xem phim chỉ phục vụ file của phim:** sửa lỗi cho phép đọc file nằm ngoài thư mục phim bằng đường dẫn tuyệt đối trong lúc trình
  xem đang mở.
- **Máy chủ cục bộ chỉ trả lời trang của chính nó:** trình xem phim, Gallery và máy chủ render kiểm tra Host và Origin; yêu cầu từ các trang
  web khác trong trình duyệt bị từ chối.
- **Model AI được xác minh:** mỗi file model được kiểm tra SHA-256 khi tải và khi cài; Whisper được tải từ một phiên bản cố định trên
  Hugging Face.
- Bật cảnh báo lỗ hổng phụ thuộc (Dependabot) cho kho mã.

### Cài đặt và cập nhật
- Phiên bản của toàn bộ gói Python phụ thuộc được khoá trong `engine/constraints.txt`: mọi máy cài cùng một bộ đã được kiểm thử.
- `update.bat` thông báo rõ khi kit đang trong quá trình bảo trì, thay cho thông báo lỗi git.

### Thư viện
- **Thư viện do chủ kit tuyển chọn:** chỉ máy của chủ kit được thêm, giữ hoặc gỡ mẫu. Trên máy đó, mỗi thẻ trong Gallery có nút Bỏ (chuyển
  vào Thùng rác, khôi phục được), trừ các mẫu kit đang sử dụng. Người dùng khác vẫn dùng toàn bộ thư viện; hiệu ứng tự viết được lưu trong
  chính phim đó.
- `kit.py gallery check` có thêm `--static` (kiểm tra nhanh, không cần trình duyệt) và `--random N` (kiểm tra ngẫu nhiên N mẫu).

### Hiệu năng
- Trình xem phim phát âm thanh theo từng phần thay vì nạp toàn bộ file vào bộ nhớ.

### Kiểm thử
- Mọi pull request được GitHub kiểm tra tự động: định dạng file, quy tắc của thư viện, gói skill và nội dung không được công khai.

## 2.0.2 (12/10/2026)

Nâng cấp phần âm thanh: hiệu ứng âm thanh thu thật, mức âm lượng được cân tự động khi dựng phim và công cụ đo trực tiếp trên file đã xuất.

### Điểm mới
- **19 hiệu ứng âm thanh thu thật** (whoosh ngắn và dài, riser, pop, click, gõ phím, typing, sparkle, chime, ping, notification, error,
  glitch, impact bass) thay cho âm thanh tạo bằng code. Tên cũ (swoosh, tick, tickhi, thump) vẫn dùng được. Mỗi âm thanh được căn theo điểm
  bắt đầu kêu để khớp với hình.
- **`kit.py loudness <phim>`** đo trực tiếp trên file MP4 đã xuất, kể cả khi ghép mono: mức từng hiệu ứng so với nhạc và giọng đọc, các điểm
  cắt cảnh chưa có âm thanh, nguồn gây đỉnh, bảng hình trước và sau mỗi âm thanh kèm dạng sóng, cùng năm mốc thời gian để nghe kiểm tra bằng
  tai nghe.
- **`kit.py beats`** kiểm tra tiếng trống kick so với nhịp bài hát và xuất hình minh hoạ; tuỳ chọn `--fit` dời điểm bắt đầu nhạc để cắt cảnh
  và hiệu ứng rơi đúng nhịp.

### Cải thiện
- Mức hiệu ứng âm thanh được cân tự động khi dựng phim: cao hơn nhạc nền khoảng 4 dB và thấp hơn giọng đọc ít nhất 2 dB; tinh chỉnh bằng
  `"gain"` trong film.json.
- Mức âm lượng tổng mặc định −16 LUFS, đỉnh thật tối đa −4 dBTP, giữ tiếng sạch sau khi nén và khi phát trên điện thoại; dùng `"loudness":
  -14` khi cần bản to hơn.

### Sửa lỗi
- Đọc được các file MP3 rất ngắn.

Hiệu ứng âm thanh lấy từ thư viện của HyperFrames, theo giấy phép Pixabay Content License (dùng được cho mục đích thương mại).

## 2.0.1 (12/10/2026)

Bản sửa lỗi cho trình cài đặt và cập nhật.

### Sửa lỗi
- `install.bat` và `update.bat` cài lại skill khi nội dung skill thay đổi, kể cả khi số phiên bản giữ nguyên; bảng kết quả cho biết khi
  skill đã là bản mới nhất.
- `update.bat` dùng mã vừa tải về cho các bước cài đặt, nên bản sửa của trình cài đặt có hiệu lực ngay trong lần cập nhật đó.

### Cải thiện
- Skill được biên tập lại gọn hơn, giữ nguyên toàn bộ quy tắc.

## 2.0.0 (09/10/2026, cập nhật đến 12/10/2026)

Bản phát hành chính thức đầu tiên của Moworks Motion.

### Làm phim
- **Kể chuyện trước khi thiết kế** (`workflow/story.md`): xác định thông điệp và mạch truyện, mỗi cảnh một nhiệm vụ, storyboard có cột lý
  do, nội dung xuất hiện theo giọng đọc.
- **Khổ hình và 4K:** 16:9, 9:16, 1:1 (1200×1200), 4:5; xuất 4K gấp đôi điểm ảnh trên cùng bố cục. `kit.py reframe` dàn lại phim đã duyệt
  sang khổ khác, tự xếp chồng các khối theo thứ tự đọc và kiểm không mất nội dung.
- **Remake từ video:** `kit.py compare --shots` (cut, sheet, bảng shot), `--follow` (đo chuyển động trên khung gốc), `--split` (video so
  sánh song song), `--old-colors` (màu thương hiệu cũ còn sót); `kit.py beats --to-bpm` chỉnh nhạc về tempo gốc. Video tham khảo: nội
  dung vẽ / diễn được vẽ lại theo phong cách, nội dung dựng có thể bám sát; sao chép 1:1 được báo trước thời gian và chi phí.
- **Phim nhân vật:** rig dùng chung (`AIMK_RIG`: tỉ lệ, tóc, mặt, trang phục, tư thế, bàn tay, biểu cảm, khẩu hình, đi bộ); `kit.py sheet`
  (bảng nhân vật để duyệt) và `--puppets` (kiểm lỗ hở, mảnh rời, khe khớp ở mọi tư thế). Nhân vật từ video được vẽ lại bằng vector;
  `kit.py trace` đã gỡ.
- **13 look** dựng sẵn cho phim không có thương hiệu (`kit.py brand <phim> <look>`), font có dấu tiếng Việt.
- **Nhạc và giọng đọc:** groove theo tiếng kick, chuyển cảnh căn giữa vào chữ được nói, **carve** (khoét dải tần giọng trong nhạc), 9
  template cắt theo beat và 5 hiệu ứng ngắn nhận thẳng mốc beat.
- **Video người nói:** `card/talking-card` (10 phong cách), `motion/talking-layout`, `kit.py cutout --people` (tách người để chữ nằm sau);
  **phụ đề 35 phong cách** của HyperFrames chạy nguyên bản (`kit.py cutout --captions`, `text/embedded-captions`), font có dấu tiếng Việt.
- **Phim từ pull request** (`kit.py ingest`) và **trình chiếu** (film.json `"slides"`, `kit.py studio --present`).
- **anime.js 4.5** chạy theo đồng hồ của phim (`motion/anime` và 7 preset: chữ cuộn, scramble, sóng trên lưới, đổi bố cục, morph, vẽ nét,
  chuyển động theo đường); xuất phim và port AE được.
- Ease `nudge`; `transition/push` chế độ va chạm `hit`.

### Kiểm chất lượng
- Lint: thời gian đọc (0,5 s + 0,3 s mỗi chữ), độ tương phản chữ 4,5:1 đo trên nền thật, không nảy trên độ mờ / màu, `"checks"` so số
  liệu motion spec với phim thật, sản phẩm chuyển động cạnh chữ, chuỗi ảnh nhảy cóc.
- `kit.py stills --onion` (onion skin), `kit.py measure --graph` (đồ thị vị trí / tốc độ), `kit.py verify --loop` (mối nối vòng lặp).
- Âm thanh: hiệu ứng đạt đỉnh sau hình một khung; `kit.py loudness` đo trên dải loa điện thoại và mức từng hiệu ứng so với nền.
- Skill có bảng số liệu chuyển động (ease theo vai trò, spring theo damping ratio, stagger, beat), danh sách mặc định cần tránh và cách
  chuyển góp ý cảm tính thành thông số.

### Player và xuất phim
- Player chỉ còn xem phim, ghi chú và xuất: tự tải lại khi phim được sửa, danh sách version, so với bản trước, menu ⋯, chế độ phát mượt
  cho laptop; Blur / 4K / Trong suốt được hỏi khi bấm xuất.
- **Round và version** trong `02_Assets\Rounds\`, đánh số theo loại (`Storyboard_R01`, `Assets_R01`, `Film_v01`); `kit.py round`,
  `rounds`, `restore`.
- Bố cục thư mục phim `01_Brief` … `05_AE`; `kit.py tidy` chuyển phim cũ sang bố cục mới.
- Motion blur trộn trong ánh sáng tuyến tính; xuất GIF (`kit.py mp4 --gif`); bỏ xuất chuỗi PNG (`kit.py frames`).

### After Effects
- SVG vector thành shape layer thật; đổi biểu cảm / bàn tay thành key hold; phần tử nghiêng thành hiệu ứng Transform có keyframe.
- Chữ bên trong block HyperFrames thành text layer chỉnh được.
- Sửa KI-01, KI-02, KI-03, KI-12 ([KNOWN-ISSUES.md](KNOWN-ISSUES.md)); viền chữ `-webkit-text-stroke`; chữ nhiều định dạng trên cùng dòng;
  `clip-path` xuất hiện giữa timeline; thứ tự chồng lớp của các layer dùng chung matte; SVG thay đổi theo thời gian thành chuỗi ảnh.
- Port ổn định hơn: báo tiến độ từng bước, dọn bộ nhớ đệm của AE trước khi dựng, chờ tối đa 60 phút.

### Thư viện và Gallery
- **Mới nhập:** mẫu mới vào thư viện qua bước duyệt (Giữ / Bỏ trên Gallery, `kit.py library import | keep | drop`).
- Gallery phân loại theo công dụng, lọc theo kỹ năng ("Dùng cho") và nguồn; Giữ / Bỏ không tải lại trang.
- Mẫu HyperFrames được chép nguyên bản kèm SHA-256 và được kiểm còn nguyên; sửa 6 mẫu hiển thị màn hình đen.
- 24 bộ font Google (OFL, đủ tiếng Việt) trong `engine\vendor\fonts\google\`.
- Thư viện: 158 mẫu chuyển động, 349 layout.
- Mã nguồn của kit phát hành theo giấy phép MIT (`LICENSE`).

### Cài đặt và cập nhật
- `install.bat`, `update.bat`, `uninstall.bat` chỉ hỏi một câu và in bảng kết quả; khi chạy từ Claude, trình cài đặt mở cửa sổ riêng bên
  ngoài ứng dụng; Chromium cài vào `%USERPROFILE%\.aimotionkit\ms-playwright`.
- `kit.py doctor` kiểm tra máy; skill kiểm tra bản mới khi mở.
- Skill đóng gói một file (`skill\moworks-motion.zip`, mã nguồn trong `engine\skill\`), viết bằng tiếng Anh, không gắn với thương hiệu
  nào; quy tắc riêng của từng thương hiệu nằm trong gói brand cục bộ (`brands\<gói>\skill.md`).
- `kit.py publish-check` quét nội dung của khách trước khi đẩy lên GitHub.

### Sửa lỗi
- Chữ căn giữa dùng `text/mask-rise` hoặc `text/top-down-letters` bị lệch nửa chiều rộng.
- Xuất 4K kèm Blur ra Full HD.
- Tua ngược làm mất phần tử có `visibility` trong timeline.
- `compare --shots` nhầm chuyển cảnh nhanh với cut; `compare` lệch nửa khung với video 30 fps.
- Giá trị `style` có nháy kép làm gãy thuộc tính; `ctx.hash` cho giá trị xếp thành hàng chéo.
- Mục quá lớn so với Thùng rác bị xoá hẳn mà không hỏi.

## 2.0.0-beta.1 (08/10/2026)

Đổi tên từ "AI Motion Kit v2" thành **Moworks Motion** và tổ chức lại để cài đặt, cập nhật từ GitHub.
- Cấu trúc kit: `engine\`, `library\`, `brands\` (chỉ lưu trên máy), `skill\`, `docs\`.
- Thư mục phim theo dự án (`kit.py new`), version phim, file xuất mang số version.
- `install.bat` và `update.bat`; skill tìm kit qua `%USERPROFILE%\.aimotionkit\kit-root.txt` và tự so phiên bản.
- Thư viện: 129 mẫu chuyển động, 332 layout.
