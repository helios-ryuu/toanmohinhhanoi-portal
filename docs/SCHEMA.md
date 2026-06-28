# Schema v1.0.0

Portal dùng Supabase Postgres + Storage. Auth người dùng portal là nội bộ, dựa trên bảng `public.users` và cookie session HTTP-only của ứng dụng.

## Bảng chính

### `public.users`

Tài khoản do admin cấp thủ công.

| Field | Ghi chú |
| :--- | :--- |
| `id uuid` | Primary key, default `gen_random_uuid()` |
| `username text` | Định danh đăng nhập, unique, 3-30 ký tự `[a-z0-9_]` |
| `password text` | Plaintext theo yêu cầu vận hành nội bộ |
| `full_name text` | Họ và tên hiển thị |
| `email text` | Email liên hệ |
| `phone text` | Số điện thoại liên hệ |
| `school text` | Trường/tổ chức, không dùng cho admin |
| `role user_role` | `user` hoặc `admin` |

### `public.contest_registration`

Một đội/nhóm dự thi do admin tạo.

| Field | Ghi chú |
| :--- | :--- |
| `contest_id` | Cuộc thi |
| `team_code` | Mã đội, unique trong từng contest |
| `team_name` | Tên đội |
| `level` | Bảng/level thi |
| `status` | Schema vẫn giữ enum để tương thích dữ liệu, flow v1.0.0 luôn tạo đội dùng ngay |

### `public.registration_member`

Liên kết user với đội thi, có `role = leader | member`.

### `public.contest_stage`

Lịch các vòng thi. Public UI dùng stage để hiển thị timeline và mở/đóng nộp bài qua `allow_submission`; `allow_resubmit` quyết định thay thế bài nộp.

### `public.submission`

Bài nộp của một đội. Thành viên của đội được nộp khi có stage đang bật `allow_submission`.

## Storage

- `post-images`: ảnh bài viết, public read.
- `submissions`: file bài nộp, truy cập qua API và signed URL.
- Bài nộp mới dùng path `contestSlug/TEAM_CODE/file`.
- Bucket manager hỗ trợ thao tác folder bằng object `.keep` và thao tác đệ quy khi đổi tên/xoá folder.
