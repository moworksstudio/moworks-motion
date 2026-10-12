# Hướng dẫn sử dụng Moworks Motion

| Mục | Nội dung |
|---|---|
| [1. Cài đặt](#1-cài-đặt) | Yêu cầu, `install.bat`, kiểm tra máy |
| [2. Cập nhật và gỡ cài đặt](#2-cập-nhật-và-gỡ-cài-đặt) | `update.bat`, `uninstall.bat` |
| [3. Làm một phim](#3-làm-một-phim) | Thư mục phim, bước duyệt, remake, nhạc, player, version, xuất phim |
| [4. Thương hiệu và guideline](#4-thương-hiệu-và-guideline) | Gói brand, phạm vi guideline, logo, bước kiểm |
| [5. Port sang After Effects](#5-port-sang-after-effects) | Cách dùng, bảng chuyển đổi, giới hạn |
| [6. HyperFrames (tuỳ chọn)](#6-hyperframes-tuỳ-chọn) | Studio chỉnh timeline bằng tay |
| [7. Thư mục dữ liệu](#7-thư-mục-dữ-liệu) | `%USERPROFILE%\.aimotionkit\` |
| [8. Thư viện và Gallery](#8-thư-viện-và-gallery) | Xem mẫu, thêm mẫu mới, kho tham khảo |
| [9. Công cụ bảo trì](#9-công-cụ-bảo-trì) | Dành cho người phát triển kit |

## 1. Cài đặt

**Yêu cầu:** Windows 10 / 11; Python 3.12 (chọn "Add python.exe to PATH"; nếu chưa có, `install.bat` đề nghị cài bằng winget); Git;
Claude Code (ứng dụng desktop); After Effects nếu cần port sang AE.

1. `git clone https://github.com/moworksstudio/moworks-motion "Moworks Motion"`. Nên đặt kit trên ổ cục bộ; kit vẫn chạy trên Google
   Drive nhưng chậm hơn.
2. Chạy **`install.bat`** và xác nhận một lần. Có thể chạy lại bất cứ lúc nào; phần đã cài sẽ được bỏ qua. Khi Claude cài từ cuộc trò
   chuyện (`install.bat --yes`), trình cài đặt mở một cửa sổ riêng bên ngoài ứng dụng Claude để player và After Effects dùng đúng
   Chromium và font; skill dùng được ngay trong cuộc trò chuyện đó.

| Thành phần | Nội dung |
|---|---|
| Thư viện Python | Các gói trong `engine\requirements.txt` (chép lời, tách nền, đọc PDF...) |
| Chromium | Dùng để render, cài vào `%USERPROFILE%\.aimotionkit\ms-playwright` |
| Model AI | Whisper small và rembg, lưu trong `engine\models\` |
| Font cho After Effects | Roboto Flex, Roboto Mono và các bản Roboto Flex theo cỡ quang học |
| Skill | Giải nén `skill\moworks-motion.zip` vào Claude Code |
| Vị trí kit | `%USERPROFILE%\.aimotionkit\kit-root.txt`, để skill và player tìm thấy kit |

**Kiểm tra máy:** `python engine\kit.py doctor` (chỉ đọc) báo từng mục OK / CHÚ Ý / LỖI kèm cách khắc phục. Nên chạy lệnh này đầu tiên
khi cài trên máy mới hoặc khi gặp lỗi lạ.

## 2. Cập nhật và gỡ cài đặt

**`update.bat`** hiển thị phiên bản hiện tại, phiên bản mới nhất, danh sách thay đổi và mẫu mới, hỏi xác nhận một lần rồi cập nhật kit
và skill. Nếu bạn đã sửa một file mà bản mới cũng thay đổi, quá trình cập nhật dừng lại thay vì ghi đè.

Cập nhật không bao giờ thay đổi `brands\`, `library\refs\`, `engine\models\` và các thư mục phim. Khi mở, skill kiểm tra phiên bản của
nó so với `engine\VERSION` và hỏi GitHub xem có bản mới không (vài giây, không cài gì); nếu có, Claude hỏi bạn muốn cập nhật trước hay
tiếp tục.

**`uninstall.bat`** hỏi xác nhận một lần rồi gỡ: skill, font cho After Effects, `%USERPROFILE%\.aimotionkit` và cuối cùng là thư mục kit.
Mọi thứ được chuyển vào Thùng rác. Python, Git, các gói Python dùng chung và thư mục phim được giữ lại; thư mục kit cũng được giữ nếu có
thay đổi chưa đẩy lên GitHub. `uninstall.bat --all` gỡ thêm các gói Python của kit và Chromium ở vị trí mặc định của Playwright.

Gốc kit chỉ chứa bốn file `.bat` và các thư mục. Tài liệu nằm trong `docs\`, số phiên bản trong `engine\VERSION`; `.gitignore`,
`.gitattributes`, `LICENSE` và `CLAUDE.md` (hướng dẫn cho các phiên Claude làm việc trên repo) được đặt ẩn.

## 3. Làm một phim

Mở Claude Code trong thư mục của dự án và gửi brief (hoặc gọi skill để xem lời chào). Claude tạo phim bằng `kit.py new`:

```
<thư mục dự án>\01_Client_Film\
├─ 1. Preview.bat   mở player
├─ 01_Brief\        brief, lời bài hát, file gốc của bạn (PSD, deck, ảnh, logo, font, nhạc, giọng đọc, video); Claude không sửa
├─ 02_Assets\       những gì gửi bạn duyệt: Rounds\, Stills\, Compare\, Music-Options\
├─ 03_HTML\         phim: film.json, index.html, assets\, audio\, presets\, notes\, qa\
├─ 04_Renders\      MP4\, MOV\ và EXPORTS.md (tạo ở lần xuất đầu tiên)
└─ 05_AE\           project After Effects, footage\, Audio\ (mix + stems), AE-PORT.md
```

Thư mục con chỉ xuất hiện khi có nội dung. Phim dùng bố cục thư mục cũ: `kit.py tidy <phim>` chuyển sang bố cục hiện tại.

### Bước duyệt

| Dự án | Bước duyệt bắt buộc |
|---|---|
| Có thiết kế sẵn (PSD, deck) | Motion spec từng cảnh |
| Không có thiết kế | Chọn 1 trong 3 phương án storyboard, sau đó motion spec |
| Remake từ video | Bảng shot + quy tắc chuyển đổi |
| Có nhân vật / minh hoạ | Thêm bảng nhân vật, bối cảnh, đồ vật trước khi làm animation |

Các bước này chỉ được bỏ qua khi bạn yêu cầu rõ ràng ("bỏ storyboard", "bỏ motion spec"). Dòng đầu của motion spec hỏi về **groove**
(nhún theo nhịp, không bao giờ mặc định) và **mức độ chuyển động**.

### Phim có nhân vật hoặc minh hoạ

- **Kiểm kê:** Claude liệt kê nhân vật, đồ vật, bối cảnh, mỗi thứ kèm một khung hình tham chiếu.
- **Rig dùng chung** (`engine\vendor\libs\aimk\rig.js`): tỉ lệ, tóc, mặt, trang phục, màu sắc là tham số; viền nét hoặc phẳng.
- **Vẽ lại bằng vector:** nhân vật và bối cảnh từ video gốc được vẽ lại bằng code, đo trên khung gốc, mỗi bộ phận vẽ trọn vẹn (kể cả
  phần bị che) để cử động không bị hở.
- **`kit.py sheet <phim>`:** bảng nhân vật diễn đủ mọi tư thế, biểu cảm, bàn tay (video + ảnh phóng 2x). `--puppets` kiểm từng con rối
  trên nền xanh ở mọi tư thế và khi xoay từng khớp ±30°, khoanh đỏ lỗ hở, mảnh rời, khe hở. Bảng chỉ được gửi duyệt khi đạt.

### Video tham khảo và remake

Kit đọc video tham khảo theo từng cảnh và áp dụng mặc định sau:

| Nội dung cảnh | Mặc định |
|---|---|
| **Vẽ / diễn:** người, động vật, nhân vật, minh hoạ vẽ tay, hiệu ứng vẽ từng khung | **Theo phong cách:** vẽ lại với cùng màu, nét, tỉ lệ, nhịp chuyển động; không chép từng khung |
| **Dựng:** chữ, khối hình, giao diện, icon, ảnh, footage, chuyển cảnh | Có thể bám sát khi bạn yêu cầu; nếu brief chưa rõ, Claude hỏi một câu |

**Khuyến nghị: remake theo phong cách.** Sao chép 1:1 từng khung là việc nặng: một phim khoảng 30 giây có thể mất nhiều giờ và vài trăm USD
(quy đổi theo giá API) mà vẫn không giống tuyệt đối. Claude báo trước thời gian, chi phí và đề xuất phương án nhẹ hơn: rút ngắn thời
lượng, vẽ lại ít shot hơn, thiết kế lại theo phong cách, dùng rig có sẵn. Remake luôn dùng nội dung của bạn: không dùng lại người, giọng,
nhạc, logo của video gốc; số liệu minh hoạ ghi "Example".

Quy trình remake (`workflow\remake.md` trong skill):
- **Đọc video gốc:** `kit.py compare <phim> <video gốc> --shots` tìm cut, tạo sheet mỗi 0,25 s và `01_Brief\SHOTS.md` (mỗi shot: video gốc
  có gì, đổi thành gì). Bảng này cùng quy tắc chuyển đổi là bước bạn duyệt.
- **Đo thay vì đoán:** `--follow x,y,w,h` đo một phần tử qua từng khung: thời điểm bắt đầu / kết thúc, quãng đường, ease gần nhất.
- **Nhạc:** chọn nhạc gần tempo; `kit.py beats <phim> <nhạc> --to-bpm <BPM>` chỉnh về đúng tempo gốc mà giữ cao độ.
- **Mỗi vòng sửa:** `kit.py compare <phim> <video gốc>` xếp các chỗ lệch nhiều nhất lên đầu; `--old-colors` tìm màu thương hiệu cũ còn sót;
  `--split` ghép phim mới cạnh video gốc thành một video so sánh song song.

### Nhạc và giọng đọc

- **Chép lời (transcript):** `kit.py transcribe <phim>` nghe mọi giọng đọc trong phim và ghi lại lời nói kèm mốc thời gian từng chữ
  (`audio\transcript\<file>.words.json`) và phụ đề `.srt`; `kit.py build` ghi thêm `film.srt` theo thời gian của cả phim (nhập được vào
  Premiere). Chạy cục bộ bằng Whisper, hỗ trợ tiếng Việt (`--lang vi`) và tiếng Anh; `--prompt` liệt kê tên riêng, thương hiệu để chép
  đúng. Trong `film.json`, `"at": {"word": "..."}` đặt chuyển động hoặc hiệu ứng âm thanh đúng lúc chữ đó được nói. Bài hát có lời sẵn
  dùng `kit.py align` để canh từng chữ theo giọng hát; tiếng nói trong video dùng `kit.py cutout <phim> <video> --people --captions`.
- **Chưa có nhạc:** Claude tải 3 bài miễn phí từ Mixkit vào `02_Assets\Music-Options\` (`A - <tên>.mp3`, `B`, `C`) để bạn nghe và chọn.
  Tạo nhạc bằng ElevenLabs có trả phí; Claude báo giá và hỏi trước.
- **Carve:** khi nhạc lấn giọng đọc, kit chỉ khoét nhạc ở dải tần giọng đang dùng theo từng câu, thay vì hạ cả bài xuống 25 %. Mức từ 0
  đến 1 (mặc định 0,8; 0,4–0,6 giữ nhạc rõ hơn). Cần Node.js; nếu thiếu, kit hạ nhạc 25 % và thông báo.

### Âm thanh: đo, không đoán

Claude không nghe được, nên mọi bước âm thanh đều được đo:

1. **Nhạc có bản quyền:** nhạc của bạn, nhạc Mixkit hoặc nhạc tạo bằng ElevenLabs; nguồn và giấy phép ghi trong `notes\NOTES.md`. Không
   có nhạc hay tiếng hiệu ứng nào tạo bằng code.
2. **Kiểm nhịp:** `kit.py beats` so tiếng kick (dưới 120 Hz) với lưới nhịp và vẽ ảnh `02_Assets\Stills\beats\<bài>_kick.png`; lưới lệch
   nửa nhịp thì tự dời khi rõ ràng.
3. **Cut đúng beat:** khi không sửa được hình (phim giữ thiết kế, phim đã duyệt), `kit.py beats <phim> --fit` dời điểm bắt đầu nhạc.
4. **Một tiếng cho mỗi cut và chuyển động lớn:** 19 tiếng thu thật trong `engine\vendor\hf-sfx\` (whoosh, pop, click, gõ phím, typing,
   riser, impact…).
5. **Mức âm lượng:** giọng đọc to nhất, nhạc hạ xuống khi có giọng, tiếng hiệu ứng nằm trên nhạc (kit đo và đặt mức từng tiếng khi dựng).
   Mức tổng −16 LUFS, đỉnh thật ≤ −4 dBTP; khách cần bản to hơn thì đặt `"loudness": -14` trong film.json.
6. **Kiểm sau khi xuất:** `kit.py loudness <phim>` đo trên file MP4 (cả khi ghép mono), xuất bảng ảnh khung trước / sau mỗi tiếng kèm sóng
   âm (`02_Assets\Stills\audio\`) và đưa **5 mốc thời gian để bạn nghe kiểm bằng tai nghe**. Claude không tự kết luận âm thanh đã ổn.

### Player

`1. Preview.bat` dùng để xem phim, ghi chú và xuất phim; storyboard và bảng nhân vật được duyệt trong cuộc trò chuyện.

- **Xem:** kéo thời gian, nhảy cảnh, đi từng khung (60 fps). Phim tự tải lại khi Claude sửa xong và giữ nguyên vị trí đang xem.
- **Ghi chú:** ghi tại thời điểm đang xem vào `03_HTML\notes\feedback.md`; mỗi ghi chú có **Done** và **Xoá**. Khi bạn nói "đọc
  feedback", Claude xử lý mọi ghi chú còn mở và không tự đánh dấu hoàn thành.
- **Menu ⋯:** Lặp cảnh (L), Lề an toàn (G), Khung QA (Q), Phát mượt (S), So với bản trước (C), phím tắt.
- **Phát mượt:** với phim nặng trên laptop, kit render một bản 540p chạy nền để phát; khi dừng hoặc tua, player hiện phim thật để ghi
  chú đúng khung. Không ảnh hưởng file xuất.
- Tab **Canh lời** (T) chỉ xuất hiện ở phim có lời bài hát.

### Round và version

Mỗi lần gửi duyệt là một **round**, lưu trong `02_Assets\Rounds\`, đánh số riêng theo loại:

| Round | Thư mục | Nội dung |
|---|---|---|
| Storyboard | `Storyboard_R01\`... | `A.png`, `B.png`, `C.png`, `ROUND.md` |
| Nhân vật / bối cảnh / đồ vật | `Assets_R01\`... | `characters\`, `locations\`, `props\` |
| Phim | `Film_v01\`... | film.json, index.html, preset, asset và âm thanh mới trong round, `files.json` |

- Claude báo mỗi round bằng một dòng, ví dụ `Phim v3: chữ vào chậm hơn, cảnh 4 đổi nền`. Round không bao giờ bị xoá tự động.
- Trong player, chọn một version cũ để xem lại đúng hình và tiếng của round đó; **So với bản trước** chuyển qua lại giữa hai bản tại
  cùng thời điểm; ghi chú được gắn với version (`[v2 · 3.40 s] ...`).
- Muốn quay lại một bản cũ, nói "quay lại v2": Claude lưu bản đang sửa thành một round rồi khôi phục v2 (`kit.py restore`).

### Xuất phim

Khu Xuất của player có 3 nút, mỗi lần chạy một việc, kèm thanh tiến độ, nhật ký và nút Huỷ. Khi bấm, player hỏi Blur / 4K (MOV thêm
Trong suốt), ghi nhớ lựa chọn cho phim đó rồi mở hộp thoại Lưu.

| Nút | Kết quả | Thư mục |
|---|---|---|
| MP4 Export | H.264, 60 fps, có âm thanh. Blur mặc định tắt | `04_Renders\MP4\` |
| MOV Export | ProRes 4444, 60 fps, có âm thanh. Blur mặc định bật; Trong suốt = kênh alpha | `04_Renders\MOV\` |
| Port to AE | Project After Effects chỉnh sửa được, kèm `Audio\mix.wav` và stems | `05_AE\` |

- **4K:** gấp đôi điểm ảnh trên cùng bố cục (3840×2160 cho 16:9). Chữ và vector sắc nét hơn; render lâu hơn khoảng 3–4 lần.
- **GIF:** `kit.py mp4 <phim> --gif` (một bảng màu, thời lượng khung chính xác).
- File xuất mang số version (`<phim>_v3_60fps_<ngày-giờ>.mov`); mỗi lần xuất được ghi vào `04_Renders\EXPORTS.md`.

### Khổ hình

16:9 1920×1080 · 9:16 1080×1920 · 1:1 1200×1200 · 4:5 1080×1350.
- **Phim mới:** nêu khổ trong brief; Claude thiết kế riêng cho khung đó (9:16 tránh khoảng 14 % phía trên và 20 % phía dưới, nơi giao diện
  ứng dụng che).
- **Phim đã duyệt sang khổ khác:** `kit.py reframe <phim> 9:16` tạo một phim mới bên cạnh, giữ nguyên mọi phần tử, chuyển động, thời gian
  và âm thanh, chỉ đổi vị trí và kích thước. Khung cao hơn thì các khối tự xếp chồng theo thứ tự đọc; `kit.py reframe <phim mới> check`
  xác nhận không mất nội dung. Bạn duyệt ảnh hai bản cạnh nhau trước khi xuất.

## 4. Thương hiệu và guideline

Phần này tóm tắt quy tắc; skill dùng bản tiếng Anh trong `engine\skill\moworks-motion\` (`SKILL.md`, `brands\pack.md`, `brands\other.md`,
`workflow\film.md`).

| | Có thiết kế sẵn (PSD, deck, ảnh từng khung) | Không có thiết kế |
|---|---|---|
| Bố cục | Giữ đúng thiết kế (sai lệch tối đa 2 px) | Claude thiết kế |
| Chuyển động | Tự do; khi cảnh đứng yên, mọi thứ đúng vị trí, kích thước, màu như thiết kế | Tự do |

**Phạm vi của guideline**
- **Thiết kế:** font, cỡ chữ, màu, lề, cách dùng logo, key visual, áp cho mọi chữ trong phim.
- **Chuyển động:** chỉ logo được bảo vệ. Hiệu ứng trên chữ (glitch, co giãn, nhoè, tách chữ, morph) được dùng miễn chữ vẫn đọc được.
- **Brief mâu thuẫn guideline** (nhất là về màu): Claude liệt kê từng điểm và hỏi bạn chọn bên nào trước khi làm storyboard.

**Gói brand** (`brands\<gói>\`) là guideline của một thương hiệu lưu trên máy: `brand.json` (font, thang cỡ chữ, màu, lề, quy tắc logo,
end tag), `notes.md`, file guideline, font, logo và tuỳ chọn `skill.md` (quy tắc riêng cho Claude). Gói **không bao giờ lên GitHub**; gói
chứa tài liệu bảo mật được đánh dấu `"confidential": true` và các lệnh gửi kịch bản ra dịch vụ bên ngoài chỉ chạy khi bạn đồng ý
(`--confidential-ok`).
- Brief nhắc tới một thương hiệu đã có gói: Claude dùng gói mà không hỏi lại. Khi có guideline mới, Claude đọc toàn bộ, gửi bảng so sánh
  rồi cập nhật gói (bản cũ lưu vào `guidelines\_archive\<ngày>\`).
- `kit.py brand <phim> <gói>` áp font, thang cỡ chữ, lề và màu của gói vào phim.
- Thương hiệu chưa có gói: Claude hỏi một câu về guideline và file thiết kế. Có thiết kế thì giữ thiết kế; có guideline thì làm theo phần
  thiết kế; không có gì thì Claude tự thiết kế và ghi rõ màu nào của khách, màu nào tự chọn.
- **Logo:** dùng file gốc, không vẽ lại, đổi màu, biến dạng hay gắn hiệu ứng; được xuất hiện và biến mất nguyên khối (mờ dần, trượt,
  phóng đều) trừ khi guideline cấm; không nhún theo nhịp.

**Quy tắc chung:** chữ hát xuất hiện đúng lúc hát; chữ, giao diện và ảnh không chồng lên nhau; chữ đọc được trong suốt thời gian hiển thị;
mỗi khung là kết quả cố định của thời gian; số liệu minh hoạ ghi "Example".

| Lệnh kiểm | Nội dung |
|---|---|
| `kit.py brand-check <phim> <gói> --brief` | Brief mâu thuẫn guideline (màu, font, cỡ, viết hoa, logo), chạy trước storyboard |
| `kit.py brand-check <phim> <gói>` | Phim so với gói: logo chuyển động, màu chữ, màu nền, font, frame đầu |
| `kit.py collide <phim>` | Chữ chồng lấn, khung trống ở điểm cắt cảnh |
| `kit.py pulse <phim>` | Hình có chuyển động theo nhịp không |

## 5. Port sang After Effects

Kit dựng một **project After Effects chỉnh sửa được** từ phim: comp, layer, keyframe có ease thật, effect, track matte. Mã nguồn nằm
trong `engine\ae\`.

1. Mở After Effects (bản thường hoặc Beta) và đóng mọi hộp thoại.
2. Bấm **Port to AE** trong player, hoặc chạy `python engine\kit.py ae <phim> --run --check auto`. Comp chạy 60 fps.
3. Kết quả trong `05_AE\`: `<tên>.aep`, `footage\`, `Audio\mix.wav` + stems, `AE-PORT.md` (phần chưa port được, font cần cài).
   `--check auto` chụp 3 khung từ AE và trình duyệt, ghép cạnh nhau và báo phần trăm điểm ảnh sai lệch.

Nếu After Effects đang mở một project có thay đổi chưa lưu, quá trình port dừng lại và thông báo.

| Lệnh | Công dụng |
|---|---|
| `kit.py ae <phim> --estimate` | Ước lượng quy mô port (số layer, dung lượng, thời gian) |
| `kit.py ae <phim> --rebuild` | Dựng lại bước AE từ bản ghi đã lưu (nhanh hơn nhiều so với port lại) |
| `kit.py ae <phim> --jsx <file.jsx>` | Chạy một script chỉnh sửa trên project đang mở, so khung trước / sau |

**Cách hoạt động:** `record.js` đo từng layer trong trình duyệt 120 lần mỗi giây (biến hình, độ mờ, filter, clip-path, chữ, màu);
`port.py` chuyển các mẫu đo thành keyframe Bézier thưa (sai số tối đa 0,3 px). Kit điều khiển AE qua lệnh **File > Scripts > Run Script
File**, không cần plug-in hay kết nối mạng.

| Trong phim | Trong After Effects |
|---|---|
| Cảnh | Precomp; chuyển động chuyển cảnh nằm trên layer precomp |
| Chữ, kể cả chữ trong block HyperFrames | Text layer thật (font, cỡ, tracking, leading, canh lề); chữ đổi theo thời gian thành key Source Text |
| Số đếm | Slider có keyframe + expression định dạng số |
| Khối màu, SVG vector phẳng | Shape layer (path Bézier, fill, stroke); đổi biểu cảm / bàn tay thành key hold trên opacity |
| `overflow: hidden`, `clip-path` | Track matte có keyframe |
| `blur()`, `drop-shadow`, bộ lọc màu, `mix-blend-mode` | Gaussian Blur, Drop Shadow, Tint / Levels / Hue-Saturation, blending mode |
| Phần tử nghiêng (skew) | Hiệu ứng Transform có keyframe |
| Gradient, bóng phức tạp, SVG có mask / filter | Ảnh PNG 2x, chuyển động vẫn là keyframe |
| Canvas, hình vẽ bằng code, chuỗi ảnh 3D | Footage chuỗi ảnh + Time Remap |
| Âm thanh | Layer âm thanh + `Audio\mix.wav` + stems |

Bộ kiểm hồi quy (`engine\tests\ae\run_cases.py`) cho sai lệch so với trình duyệt từ 0 đến khoảng 1,6 % điểm ảnh.

**Giới hạn:**
- After Effects chỉ dùng font đã cài trong Windows. Port chọn bản Roboto Flex theo cỡ quang học gần cỡ chữ nhất; độ đậm lẻ (ví dụ 760)
  thành độ đậm có tên gần nhất; trục độ rộng (`wdth`) không được hỗ trợ.
- Viền / bóng cấp nhóm của PSD được vẽ quanh từng phần tử trong nhóm; filter SVG khác (colour matrix, nhiễu) trên chữ không được port.
- Chuyển động viết bằng code thành keyframe theo khung, không thành expression.
- Xem thêm [KNOWN-ISSUES.md](KNOWN-ISSUES.md).

## 6. HyperFrames (tuỳ chọn)

Kit xem phim, xuất MP4 / MOV và port AE mà không cần HyperFrames. Chỉ khi muốn chỉnh timeline bằng tay hoặc trình chiếu:
`python engine\kit.py studio <phim>` (hỏi trước khi tải Node.js + HyperFrames, khoảng 110 MB).
- Mỗi ngày một lần, khi mở Studio, kit kiểm tra bản HyperFrames mới, cài vào thư mục riêng và chạy thử; bản mới chỉ được dùng khi đạt.
- Mỗi phim giữ phiên bản HyperFrames của nó (`03_HTML\qa\hf.json`).
- `kit.py hf status | update | rollback | test | install [bản]` quản lý các phiên bản.

## 7. Thư mục dữ liệu

`%USERPROFILE%\.aimotionkit\` nằm trên ổ cục bộ và có thể tạo lại (trừ `sources\` và `archive\`):

| Mục | Nội dung |
|---|---|
| `kit-root.txt` | Vị trí cài kit |
| `ms-playwright\` | Chromium của kit |
| `work\`, `cache\`, `logs\` | File tạm khi render và port AE, bộ nhớ đệm, nhật ký |
| `hyperframes\` | Chỉ có khi dùng HyperFrames |
| `sources\` | Mã nguồn gốc để port thêm mẫu (chỉ cần cho người phát triển kit) |

## 8. Thư viện và Gallery

**`gallery.bat`** mở trang xem mọi mẫu chuyển động (`library\presets\`) và layout (`library\layouts\`): clip demo, tên, mô tả, kết quả
kiểm tự động và nút sao chép brief. Bộ lọc theo **danh mục** (công dụng), **Dùng cho** (talking head, phim nhạc, giữ thiết kế, sản phẩm /
app, code, deck, nhân vật) và **nguồn**. Thư viện là bộ công cụ: Claude chọn mẫu khi phù hợp, hoặc dùng đúng mẫu bạn chỉ định.

**Thêm mẫu mới ("Mới nhập"):** mẫu mới chỉ vào thư viện khi bạn yêu cầu và luôn qua bước duyệt.
1. Trong cuộc trò chuyện làm phim, yêu cầu "đưa hiệu ứng <tên> vào thư viện" (hoặc gửi video tham khảo và chỉ đoạn cần lấy).
2. Claude làm bản trung tính (bỏ nội dung, màu, tên của khách), chạy bộ kiểm và đặt vào `library\incoming\` (không lên git).
3. Trong Gallery, mở **Mới nhập**: **Giữ** đưa mẫu vào thư viện, **Bỏ** chuyển vào Thùng rác. Lệnh tương đương:
   `kit.py library incoming | keep <tên> | drop <tên>`.

**Kho tham khảo** (`library\refs\`, không lên git): phim (`video\`, để học chuyển động) và ảnh / deck (`image\`, để học dàn trang) của
studio. Sau khi chép file vào, yêu cầu Claude "nạp kho tham khảo" (`kit.py ref sync`).

## 9. Công cụ bảo trì

Dành cho người phát triển kit; chạy từ thư mục gốc.

| Công cụ | Công dụng |
|---|---|
| `engine\tests\smoke_new_project.py` | Chạy thử một phim từ lúc tạo tới khi xuất, báo từng bước |
| `engine\tests\ae\run_cases.py` | Bộ ca port After Effects (cần AE đang mở), so khung với trình duyệt |
| `kit.py gallery check [lọc]` | Chạy bộ kiểm mọi demo ra thư mục tạm và báo mẫu nào khác kết quả đã lưu |
| `kit.py gallery build [lọc]` | Dựng lại clip demo và kết quả kiểm |
| `engine\tests\bake_library.py`, `demo_pixels.py` | Kiểm việc dựng mọi demo; so điểm ảnh giữa hai phiên bản engine |
| `engine\tests\hf_blocks.py`, `hf_templates.py` | Sinh lại các mẫu HyperFrames từ mã nguồn gốc |
| `kit.py publish-check` | Trước khi đẩy lên GitHub: quét file được theo dõi tìm nội dung của khách (chỉ đọc) |
| `engine\tests\readme_diagrams.py` | Vẽ lại sơ đồ README từ `docs\images\*.mmd` |
| `engine\tests\pack_skill.py` | Đóng gói `skill\moworks-motion.zip` sau khi sửa skill |
