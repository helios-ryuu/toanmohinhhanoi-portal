# Report v0.9.0

## Tổng quan

v0.9.0 chuyển portal từ Google OAuth và self-service contest registration sang mô hình vận hành nội bộ:

- Admin cấp tài khoản.
- Admin tạo đội và gán thành viên.
- Người dùng chỉ đăng nhập để xem đội đã được cấp và nộp bài.
- Public contest không còn form đăng ký.

## Thay đổi chính

- `/auth` dùng username/password.
- `/admin/accounts` quản lý tài khoản.
- `/contest-management` quản lý cuộc thi, đội, thành viên và submission.
- `users` có `password`, `full_name`, `email`, `phone`, `school`, `role`.
- `contest_registration` có `team_code`, `team_name`, `level`.
- Header có navigation panel, footer được nâng cấp, sidebar chỉ còn ToC trong post detail.

## Rủi ro đã biết

- Password plaintext là yêu cầu vận hành của phiên bản này và không nên dùng cho môi trường có yêu cầu bảo mật cao.
- User legacy từ Google Auth cần được admin tạo lại hoặc migrate thủ công.

## Kiểm thử cần chạy

- `pnpm lint`
- `pnpm build`
- Đăng nhập user/admin.
- Admin tạo account và team.
- User thấy team trong `/profile/contests`.
- User nộp bài khi stage mở.
