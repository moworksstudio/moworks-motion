# Phim lỗi cố ý cho `kit.py collide`

`python engine\kit.py collide engine\tests\fixtures\collide` (từ thư mục gốc của kit) phải báo đúng 2 dòng + 2 khung trống:
- 0.00-1.65s [Bugs] text-text: #a <> #b (khoảng 70 %)
- 0.55-1.35s [Bugs] covered by #lid: #c
- blank frames: 3.400s, 3.433s (cảnh 3 mở đầu khi chữ còn trong suốt)

Không được báo: chữ trên panel nằm dưới nó (#d), hai bản sao chồng nhau (#e1, #e2), #f1 có data-lint="ignore",
và chữ của hai cảnh khác nhau trong lúc chuyển cảnh (push).
