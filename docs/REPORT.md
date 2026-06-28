# Report v1.0.0

## Tổng quan

v1.0.0 hoàn thiện portal vận hành nội bộ cho Toán Mô Hình Hà Nội:

- Admin cấp tài khoản và quản lý đội thi.
- Người dùng đăng nhập để xem đội đã được cấp và nộp bài.
- Public site có homepage, bài viết, contest listing/detail và i18n đầy đủ hơn.
- Storage manager hỗ trợ thao tác folder/file rõ ràng hơn.

## Thay đổi chính

- Accent chính chuyển sang `#1F51FF`; toàn site dùng Lexend.
- Homepage thêm danh sách compact `Các cuộc thi` dưới `Bài viết nổi bật`.
- Header bỏ GitHub; footer dùng thông tin liên hệ chính thức.
- `/admin/accounts` có required labels, search/filter/sort, pagination 50 và highlight row đang sửa.
- `/contest-management` bỏ flow duyệt đội; tạo đội là dùng được.
- Bài nộp mới lưu theo `contestSlug/TEAM_CODE/file`.
- `/admin/bucket` hỗ trợ tạo, đổi tên, xoá folder/file.

## Rủi ro đã biết

- Password plaintext là yêu cầu vận hành nội bộ và không phù hợp cho môi trường có yêu cầu bảo mật cao.
- Schema vẫn giữ enum status của registration để tương thích dữ liệu hiện có, nhưng UI/API v1.0.0 không còn thao tác duyệt/từ chối.

## Kiểm thử cần chạy

- `pnpm lint`
- `pnpm build`
- Đăng nhập user/admin.
- Admin tạo account và team.
- User thấy team trong `/profile/contests`.
- User nộp bài khi stage mở và file nằm dưới `contestSlug/TEAM_CODE/`.
- Admin tạo/đổi tên/xoá folder trong bucket.
