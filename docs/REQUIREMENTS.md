# Requirements v0.9.0

## Auth và tài khoản

- Admin cấp tài khoản thủ công trong `/admin/accounts`.
- Người dùng đăng nhập bằng `username/password`.
- Password lưu plaintext theo yêu cầu phiên bản v0.9.0.
- Người dùng không tự tạo tài khoản qua Google hoặc OAuth.
- Admin có thể tạo, sửa, xoá tài khoản và reset mật khẩu.

## Contest

- Public contest page chỉ hiển thị thông tin cuộc thi, mô tả, timeline và hướng dẫn đăng nhập/nộp bài.
- Người dùng không tự đăng ký tham gia cuộc thi.
- Admin quản lý đội thi trong `/contest-management`.
- `TEAM_CODE`, `TEAM_NAME`, `LEVEL` thuộc đội/registration.
- `FULLNAME`, `EMAIL`, `PHONE`, `SCHOOL` thuộc tài khoản user.
- Thành viên đội xem cuộc thi của mình trong `/profile/contests`.

## Submission

- Web phục vụ nộp bài vòng 1 và vòng 2 thông qua stage có `allow_submission=true`.
- Chỉ thành viên đội được admin gán và có registration `approved` mới được nộp.
- Resubmit phụ thuộc `allow_resubmit` của stage đang mở.
- Admin xem và tải bài nộp trong panel quản lý đội.

## UI

- Header có navigation panel dùng chung: Home, Post, Contest, About, Q&A.
- Admin thấy thêm các mục quản trị.
- Sidebar điều hướng cũ bị loại bỏ; post detail vẫn giữ ToC.
- Footer là panel đầy đủ với logo, navigation và placeholder liên hệ.
