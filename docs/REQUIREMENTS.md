# Requirements v1.0.0

## Auth và tài khoản

- Admin cấp tài khoản thủ công trong `/admin/accounts`.
- Người dùng đăng nhập bằng `username/password`.
- `username`, `password`, `full_name` là bắt buộc khi tạo/sửa tài khoản.
- Khi tài khoản có vai trò `admin`, thông tin trường/tổ chức không hiển thị trong form quản trị.
- Màn quản lý tài khoản có tìm kiếm, filter, sort, highlight row đang sửa và pagination 50 dòng/trang.

## Contest và đội thi

- Public contest page hiển thị thông tin cuộc thi, mô tả, timeline và hướng dẫn nộp bài.
- Admin quản lý cuộc thi và đội thi trong `/contest-management`.
- Đội thi được tạo trực tiếp bằng `TEAM_CODE`, `TEAM_NAME`, `LEVEL`, leader và members; không có bước duyệt/từ chối.
- Thành viên đội xem cuộc thi của mình trong `/profile/contests`.

## Submission

- Web phục vụ nộp bài qua stage có `allow_submission=true`.
- Thành viên của đội được admin gán có thể nộp bài khi stage nộp bài đang mở.
- Resubmit phụ thuộc `allow_resubmit` của stage đang mở.
- Bài nộp mới lưu trong Storage theo cấu trúc `contestSlug/TEAM_CODE/file`.
- Admin xem và tải bài nộp trong panel quản lý đội.

## UI

- Accent chính là `#1F51FF`; toàn site dùng font Lexend.
- Header có navigation panel dùng chung và không hiển thị GitHub.
- Footer hiển thị địa chỉ, số điện thoại, email và copyright chính thức.
- Homepage có `Bài viết nổi bật` và danh sách compact `Các cuộc thi`.
- Bucket manager hiển thị rõ cây thư mục/file, hỗ trợ tạo, đổi tên và xoá folder/file.
