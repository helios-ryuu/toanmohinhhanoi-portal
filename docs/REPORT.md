# Report v1.2.0

## Tổng quan

v1.2.0 tập trung polish trải nghiệm đọc, tìm kiếm và vận hành cho portal Toán Mô Hình Hà Nội:

- Search ở header tìm được bài viết, kỳ thi và tag, đồng thời dùng placeholder/label i18n.
- Timeline kỳ thi làm nổi bật giai đoạn đang diễn ra bằng màu vàng thống nhất với badge nộp bài.
- Q&A user/admin được mở rộng theo hướng quy định, lưu ý vận hành và các trường hợp cần liên hệ ban tổ chức.
- Footer và header được chỉnh typography, màu chữ, copyright và spacing giữa social/language/account.
- Legacy cleanup xử lý warning lint, bỏ type search cũ và thay `THREE.Clock` bằng `THREE.Timer`.

## Thay đổi chính

- Mở rộng `/api/search` để trả thêm `contests` bên cạnh `posts` và `tags`.
- Chuyển FAQ từ key phẳng `q1/a1` sang mảng dữ liệu i18n có cấu trúc.
- Chuẩn hóa màu body copy trong contest detail và footer theo tone nội dung bài viết.
- Bật bypass optimizer cho ảnh public từ URL ngoài để tránh lỗi server khi upstream object không còn tồn tại.
- Cập nhật docs/README/package version lên `1.2.0`.

## Rủi ro đã biết

- Password plaintext vẫn là yêu cầu vận hành nội bộ và không phù hợp cho môi trường có yêu cầu bảo mật cao.
- Search header lọc client-side trên dữ liệu cache 60 giây; nội dung mới có thể trễ tối đa một chu kỳ cache.
- FAQ là nội dung tĩnh trong i18n, chưa có CMS riêng để admin chỉnh trực tiếp.

## Kiểm thử cần chạy

- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`
- Tìm kiếm bài viết, kỳ thi và `#tag` từ header.
- Mở `/faq` và `/faq/admin`, kiểm tra accordion trên desktop/mobile.
- Mở trang chi tiết kỳ thi có stage đang diễn ra và xác nhận thanh stage màu vàng.
- Kiểm tra footer/header spacing ở desktop và mobile.
- Kiểm tra ảnh Supabase bị mất không còn làm request `/_next/image` lỗi 400.
