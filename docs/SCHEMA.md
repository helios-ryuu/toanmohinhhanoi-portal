# Schema v0.9.0

Portal dùng Supabase Postgres + Storage. Auth người dùng portal là nội bộ, dựa trên bảng `public.users` và cookie session HTTP-only của ứng dụng.

## Bảng chính

### `public.users`

Tài khoản do admin cấp thủ công.

| Field | Ghi chú |
| :--- | :--- |
| `id uuid` | Primary key, default `gen_random_uuid()` |
| `username text` | Định danh đăng nhập, unique, 3-30 ký tự `[a-z0-9_]` |
| `password text` | Plaintext theo yêu cầu vận hành v0.9.0 |
| `full_name text` | Họ và tên hiển thị |
| `email text` | Email liên hệ |
| `phone text` | Số điện thoại liên hệ |
| `school text` | Trường/tổ chức |
| `role user_role` | `user` hoặc `admin` |

### `public.contest_registration`

Một đội/nhóm dự thi do admin tạo, không còn là đăng ký self-service từ người dùng.

| Field | Ghi chú |
| :--- | :--- |
| `contest_id` | Cuộc thi |
| `team_code` | Mã đội, unique trong từng contest |
| `team_name` | Tên đội, leader có thể chỉnh theo flow ứng dụng |
| `level` | Bảng/level thi |
| `status` | `pending`, `approved`, `rejected`, `withdrawn` |

### `public.registration_member`

Liên kết user với đội thi, có `role = leader | member`.

### `public.contest_stage`

Lịch các vòng thi. Từ v0.9.0 public UI chỉ dùng stage để hiển thị timeline và mở/đóng nộp bài qua `allow_submission`; `allow_registration` được giữ để tương thích dữ liệu cũ nhưng không còn là luồng public.

### `public.submission`

Bài nộp của một đội. Chỉ thành viên của đội `approved` được nộp khi có stage đang bật `allow_submission`.

## Storage

- `post-images`: ảnh bài viết, public read.
- `submissions`: file bài nộp, truy cập qua API và signed URL.

## Ghi chú migration

Migration `0003_internal_auth_accounts.sql` bỏ phụ thuộc `auth.users`, thêm `password/full_name/email/phone`, thêm `team_code/level`, và loại trigger sync Google cũ.
