# Giới hạn đã biết

Những gì Moworks Motion chưa làm được hoặc làm được có điều kiện, kèm cách xử lý. Mã `KI-xx` cố định để các tài liệu khác tham chiếu; mục
đã sửa được giữ lại để tra cứu.

**Trạng thái:** **Mở** = chưa sửa, có hướng sửa · **Giới hạn** = do nền tảng hoặc thiết kế, không dự kiến sửa · **Đã sửa** · **Đã bỏ** =
tính năng đã gỡ.

| Mã | Vấn đề | Phạm vi | Trạng thái |
|---|---|---|---|
| [KI-01](#ki-01-viền--bóng-chữ-bằng-filter-svg-trong-after-effects) | Viền / bóng chữ bằng filter SVG trong After Effects | Port AE | Đã sửa |
| [KI-02](#ki-02-roboto-flex-cỡ-nhỏ-trong-after-effects) | Roboto Flex cỡ nhỏ trong After Effects | Port AE | Đã sửa |
| [KI-03](#ki-03-clip-path-path-trong-after-effects) | `clip-path: path()` trong After Effects | Port AE | Đã sửa |
| [KI-04](#ki-04-webgpu) | Không render được WebGPU | Render | Giới hạn |
| [KI-05](#ki-05-hai-mẫu-hyperframes-chưa-có-trong-thư-viện) | Hai mẫu HyperFrames chưa có trong thư viện | Thư viện | Giới hạn |
| [KI-07](#ki-07-mp4-xuất-qua-hyperframes-studio) | MP4 xuất qua HyperFrames Studio kém nét | Xuất phim | Đã sửa |
| [KI-08](#ki-08-collide-với-ảnh-xoay--nghiêng) | `collide` với ảnh xoay / nghiêng | Kiểm lỗi | Đã sửa |
| [KI-09](#ki-09-chuyển-động-chồng-nhau) | Chuyển động chồng nhau chỉ lộ khi phát liên tục | Phim | Đã sửa |
| [KI-10](#ki-10-canvas-trong-after-effects) | Canvas vẽ bằng code thành chuỗi ảnh trong After Effects | Port AE | Giới hạn |
| [KI-11](#ki-11-trace-vector-từ-khung-video) | Trace vector từ khung video | Vector | Đã bỏ |
| [KI-12](#ki-12-hoa-văn-bị-cắt-bởi-clippath-trong-after-effects) | Hoa văn bị cắt bởi `clipPath` trong After Effects | Port AE | Đã sửa |
| [KI-13](#ki-13-phụ-đề-viết-tay-không-có-dấu-tiếng-việt) | Sáu theme phụ đề viết tay không có dấu tiếng Việt | Phụ đề | Giới hạn |

---

## KI-01: Viền / bóng chữ bằng filter SVG trong After Effects

**Đã sửa (2.0.0).** Port đọc filter SVG của phần tử và các nhóm cha: chữ nhận viền chữ AE và Drop Shadow chỉnh được; ảnh và khối trong
nhóm được chụp kèm viền / bóng.
**Còn lại:** viền / bóng cấp nhóm được vẽ quanh từng phần tử, nên hai phần tử chạm nhau có viền ở chỗ giáp; filter SVG khác trên chữ không
được port (có ghi chú trong `AE-PORT.md`).

## KI-02: Roboto Flex cỡ nhỏ trong After Effects

**Đã sửa (2.0.0).** Roboto Flex đổi dáng chữ theo cỡ (trục `opsz`) trong trình duyệt, còn After Effects dùng một dáng cho mọi cỡ. Kit cài
các bản Roboto Flex cố định cỡ quang học 9–144 (`engine/vendor/fonts/opsz`) và port chọn bản gần cỡ chữ nhất.
**Còn lại:** độ đậm lẻ (760) thành độ đậm có tên gần nhất; trục độ rộng (`wdth`) không được hỗ trợ.

## KI-03: `clip-path: path()` trong After Effects

**Đã sửa (2.0.0).** Path (mọi lệnh SVG, tuyệt đối và tương đối) thành track matte vector đúng fill rule; path đổi theo thời gian thành key.
**Còn lại:** path đổi số điểm giữa chừng chỉ lấy hình đầu (có thông báo); `clip-path: url()` trên phần tử HTML vẫn là khung chữ nhật.

## KI-04: WebGPU

**Giới hạn (Chromium).** Kit vẽ WebGL bằng CPU (SwiftShader) để mọi máy cho cùng một hình. Chromium hiện không cho WebGL và WebGPU cùng
chạy bằng CPU, và WebGPU bằng CPU quá chậm để render. Mẫu chỉ dùng WebGPU báo "no WebGPU adapter".
**Hướng xử lý:** thử lại khi Chromium hỗ trợ; hoặc thêm chế độ render bằng GPU cho phim cần WebGPU (chấp nhận hình khác nhau giữa các máy).

## KI-05: Hai mẫu HyperFrames chưa có trong thư viện

**Giới hạn.** `frost-sequence-camera-orbit` cần WebGPU (KI-04); `vfx-magnetic` dùng bản cũ của API HTML-in-Canvas mà Chromium của kit không
hỗ trợ. Khi điều kiện cho phép: bỏ khoá `"drop"` của mẫu trong `engine/tests/hf_blocks.json`, chạy `python engine/tests/hf_blocks.py <tên>`
rồi `python engine/kit.py gallery build "<nhóm/tên>"`.

## KI-07: MP4 xuất qua HyperFrames Studio

**Đã sửa (2.0.0).** HyperFrames nén từng khung thành JPEG trước khi mã hoá, làm chữ màu bị lem. Kit không xuất qua HyperFrames: MP4 và MOV
được mã hoá từ PNG không nén, 60 fps.

## KI-08: `collide` với ảnh xoay / nghiêng

**Đã sửa (2.0.0).** Điểm trên màn hình được đổi về toạ độ gốc của ảnh qua ma trận biến đổi thật của nó và các lớp cha trước khi tra độ
trong suốt.
**Còn lại:** biến đổi 3D (phối cảnh) vẫn dùng khung bao; canvas WebGL đã xoá buffer có thể bị bỏ sót, nên xem ảnh tĩnh tại các mốc
`collide` báo.

## KI-09: Chuyển động chồng nhau

**Đã sửa (2.0.0).** Hai chuyển động cùng thuộc tính trên cùng phần tử trùng thời gian chỉ lộ lỗi khi phát liên tục, không lộ khi nhảy tới
một mốc. `kit.py build` tự rút ngắn phần chồng (chỉ thuộc tính chung) và in từng chỗ; trường hợp không tự sửa được in "overlap CHECK".
`kit.py verify --play` phát từng khung từ đầu và so với nhảy thẳng.

## KI-10: Canvas trong After Effects

**Giới hạn.** Hình do code vẽ lên `<canvas>` (vệt sáng, hạt, nhiễu) không có cấu trúc layer: port chụp thành chuỗi PNG trong suốt. Hình
đúng nhưng nặng và không chỉnh tham số được trong AE. Dựng lại thành layer AE thật cần viết riêng cho từng hiệu ứng.

## KI-11: Trace vector từ khung video

**Đã bỏ (2.0.0).** Trace chỉ thấy phần một khung hình cho thấy: phần bị che bị hở khi nhân vật cử động, nét mảnh dưới 2 px bị mất.
`kit.py trace` đã được thay bằng quy trình **vẽ lại** bằng code (`workflow/characters.md` trong skill; `AIMK_RIG.art()` / `AIMK_RIG.puppet()`).

## KI-12: Hoa văn bị cắt bởi `clipPath` trong After Effects

**Đã sửa (2.0.0).** Hoa văn trong SVG bị `clipPath` cắt (ví dụ áo kẻ caro của rig) vẫn là shape layer: mỗi mảng được giao với đường cắt
bằng Merge Paths (Intersect).
**Còn lại:** nét cong hoặc đầu nét tròn bị cắt, clip lồng nhau: SVG đó thành ảnh (chụp đúng). Scale / xoay một nhóm bên trong SVG thành
chuỗi ảnh; rig của kit chỉ đổi opacity nên giữ được vector.

## KI-13: Phụ đề viết tay không có dấu tiếng Việt

**Giới hạn.** Sáu theme của `text/embedded-captions` (aurora, brush, chalkboard, graffiti, neonsign, spectrum) vẽ từ nhấn bằng một font
nét đơn chỉ có chữ Latin không dấu. Với nội dung tiếng Việt, chọn một trong 29 phong cách còn lại, hoặc đổi font sau khi port sang After
Effects.

---

## Chỉnh sửa phía kit cho mẫu HyperFrames

File gốc của HyperFrames giữ nguyên; kit thêm một chỉnh nhỏ khi dựng và sẽ bỏ khi HyperFrames sửa ở bản gốc.

| Mẫu | Vấn đề ở bản gốc | Chỉnh của kit |
|---|---|---|
| `effect/ascii-trail-reveal` | Lớp lưới giữ nền đặc, nhãn không hiện | Nền lưới trong suốt (`css` trong `engine/tests/hf_templates.json`) |
| `effect/ascii-render-pass` | Không có nội dung thì không vẽ gì | Nội dung mặc định (`defaults.slots`) |
| `code/apple-terminal-pro` | Callback không hoàn lại khi tua ngược | Tải lại trang khi tua ngược (cờ `reload`) |
| `title/glass-shard` | Khai báo 12,16 s nhưng timeline thật 9 s | Độ dài 9 s (khoá `length`) |
| `effect/editorial-flash`, `effect/freeze-frame-dressing` | Lớp phủ nền trong suốt, demo chỉ thấy nền tối | Demo có ảnh nền mẫu |
| `carousel/*` | `--background` không tác dụng, thẻ 3D cắt nhau, đồng hồ dừng ở 6 s | Vá nền, màu thẻ, thứ tự chồng, độ dài (`ctx.hfFrame`) |
| `compare/grade-split-reveal` | Chỉnh màu do runtime HyperFrames làm bằng shader | Chỉnh màu gần đúng bằng ma trận màu SVG (`hf-mount.js`) |

## Ghi chú khác

- `text/text-shimmer` và `text/caption-blend-difference` có khung cuối khác layout một chút; đó là thiết kế của hiệu ứng.
- `text/anime-roll`: mép chữ lệch dưới 1 px (0,44 %) so với layout do tách ký tự; dấu tiếng Việt không bị cắt.
- Khi máy đang tải nặng, `code/code-morph`, `code/code-scroll`, `code/apple-terminal-pro` đôi khi báo lệch nhỏ trong bộ kiểm; kiểm riêng
  thì đạt.
- `kit.py collide` không thấy chữ bên trong block HyperFrames chạy trong iframe; các block này cần kiểm bằng mắt.
- Mẫu WebGL dựng và kiểm chậm (2–11 phút mỗi mẫu) vì WebGL vẽ bằng CPU.
- Chữ scramble của anime.js khi đang hiện ký tự khối: After Effects dùng font thay thế cho các ký tự đó.
