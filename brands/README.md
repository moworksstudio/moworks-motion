# brands: gói thương hiệu (chỉ lưu trên máy)

Thư mục này chứa guideline thương hiệu dùng trong các dự án: PDF guideline, font, logo và gói kit dùng được (`brand.json` + `notes.md`).
Mỗi thương hiệu một thư mục: `brands\<thương hiệu>\`.

- **Không lên GitHub** (`.gitignore`), vì guideline thường là tài liệu bảo mật. `update.bat` không bao giờ thay đổi thư mục này.
- Dùng gói trên máy khác: chép thư mục `brands\<thương hiệu>\` qua ổ dùng chung, không qua GitHub.
- `kit.py brand <phim> <gói>` áp gói vào phim (font, logo, `assets\brand.css`); `kit.py brand-check` kiểm phim theo gói.
- `skill.md` trong gói (tuỳ chọn): quy tắc riêng của thương hiệu cho Claude (logo có được chuyển động không, end tag, bảo mật, cách viết).
  Skill của kit không gắn với thương hiệu nào; nó đọc `skill.md`, `notes.md` và `brand.json` của gói khi phim dùng gói đó.
