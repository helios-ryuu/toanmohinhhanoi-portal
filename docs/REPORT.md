# Report v1.2.1

## Tổng quan

v1.2.1 là patch release hoàn thiện các điểm phát hiện khi kiểm thử v1.2.0 trên localhost:

- Bổ sung Q&A Operational cho user và admin để hướng dẫn các thao tác cơ bản.
- Sửa tương tác click/tap trong header search bằng link điều hướng thật.
- Countdown public luôn hiển thị giây, kể cả khi còn nhiều ngày.
- Đồng bộ thêm màu chữ ở footer và các vùng copy contest theo tone nội dung bài viết.

## Thay đổi chính

- Thêm hướng dẫn user: đăng nhập, xem Cuộc thi của tôi, tìm đội/kỳ thi, nộp bài, thay thế/xoá bài nộp.
- Thêm hướng dẫn admin: tạo tài khoản, tạo kỳ thi, thêm đội, tải bài nộp, quản lý bucket.
- Đổi item trong search dropdown từ button gọi `router.push` sang `Link` để navigation ổn định hơn.
- Cập nhật format countdown tiếng Việt sang `x ngày y giờ z phút t giây` khi thời lượng còn trên 1 ngày.
- Chuẩn hóa các vùng copy chính của footer và contest detail về `text-foreground`, cùng tone với body post.
- Cập nhật docs/README/package version lên `1.2.1`.

## Rủi ro đã biết

- Password plaintext vẫn là yêu cầu vận hành nội bộ và không phù hợp cho môi trường có yêu cầu bảo mật cao.
- Search header vẫn lọc client-side trên dữ liệu cache 60 giây.
- FAQ vẫn là nội dung tĩnh trong i18n, chưa có CMS riêng để admin chỉnh trực tiếp.

## Kiểm thử cần chạy

- `node -e` parse `messages/vi.json` và `messages/en.json`.
- `./node_modules/.bin/tsc --noEmit`
- `./node_modules/.bin/eslint`
- `./node_modules/.bin/next build --webpack`
- Tìm kiếm rồi click/tap vào kết quả bài viết, kỳ thi và tag trong header search.
- Kiểm tra `/faq` và `/faq/admin` có cả nhóm Q&A Operational.
- Kiểm tra contest countdown hiển thị giây với thời lượng còn trên 1 ngày.
- Kiểm tra màu chữ footer và contest so với nội dung post.
