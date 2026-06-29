# Report v1.1.0

## Tổng quan

v1.1.0 nâng cấp portal vận hành nội bộ cho Toán Mô Hình Hà Nội:

- Domain vận hành chuyển sang `toanmohinhvietnam.com` nhưng giữ nguyên branding hiển thị.
- Header/footer cập nhật Facebook, Instagram, hotline và email chính thức.
- Q&A chung tách khỏi Q&A Admin.
- Contest có min/max thành viên và đề bài theo từng vòng.
- My Contests có search/filter/sort, vòng hiện tại, countdown có giây và đề bài link được.
- Thí sinh luôn có thể thay thế bài nộp trong thời gian vòng nộp bài còn mở.
- User thường không tự sửa hồ sơ; admin vẫn có thể tự cập nhật.

## Thay đổi chính

- Thêm `min_team_size` cho `contest`.
- Thêm `prompt_text` cho `contest_stage`.
- Gỡ `allow_resubmit`; quyền thay thế bài nộp phụ thuộc trực tiếp vào thời gian stage nộp bài.
- Sửa active state navigation để các tab admin độc lập.
- Chuẩn hóa validation username/password ở login, admin account UI và API.
- Đổi label contest status `active` sang `Đang diễn ra`.
- Cập nhật docs/README/package version lên `1.1.0`.

## Rủi ro đã biết

- Password plaintext là yêu cầu vận hành nội bộ và không phù hợp cho môi trường có yêu cầu bảo mật cao.
- Migration `0003_stage_allow_resubmit.sql` vẫn nằm trong lịch sử migration; migration `0004` sẽ drop cột này cho database hiện hữu.
- Schema vẫn giữ enum status của registration để tương thích dữ liệu hiện có, nhưng UI/API v1.1.0 không còn thao tác duyệt/từ chối.

## Kiểm thử cần chạy

- `pnpm lint`
- `pnpm build`
- Đăng nhập user/admin.
- Admin tạo account hợp lệ và thử username/password không hợp lệ.
- Admin tạo contest đội với min/max và prompt theo stage.
- User thấy đội trong `/profile/contests`, dùng search/filter/sort, xem countdown và đề bài.
- User nộp bài, thay thế bài khi stage mở và bị chặn khi stage đóng.
- Contest detail chỉ hiển thị CTA nộp bài cho user đã tham gia.
- Admin tạo/đổi tên/xoá folder trong bucket.
