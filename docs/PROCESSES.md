# Processes v1.0.0

## Đăng nhập

1. User mở `/auth`.
2. User nhập `username/password` do admin cấp.
3. API `/api/auth/login` kiểm tra `public.users`.
4. Server set cookie session HTTP-only.
5. `proxy.ts` và server helpers kiểm quyền dựa trên session nội bộ.

## Cấp tài khoản

1. Admin mở `/admin/accounts`.
2. Admin tạo user với username, password, họ tên, email, phone, school, role.
3. Nếu role là admin, form ẩn school và payload xoá school.
4. User đăng nhập bằng thông tin được cấp.

## Tạo đội thi

1. Admin mở `/contest-management`.
2. Admin chọn cuộc thi và mở panel đội thi.
3. Admin tạo đội với `TEAM_CODE`, `TEAM_NAME`, `LEVEL`, leader và members.
4. Đội có thể nộp bài khi stage nộp bài của cuộc thi mở.

## Nộp bài

1. User đăng nhập và mở `/profile/contests`.
2. Hệ thống liệt kê các đội mà user là thành viên.
3. Nếu stage hiện tại bật `allow_submission`, form upload xuất hiện.
4. API `/api/submissions` kiểm quyền thành viên, stage, resubmit policy rồi upload file vào `submissions/contestSlug/TEAM_CODE/`.

## Admin xem bài nộp

1. Admin mở panel đội thi trong `/contest-management`.
2. Admin mở từng đội để xem danh sách submission.
3. Download dùng signed URL ngắn hạn qua API admin.

## Quản lý bucket

1. Admin mở `/admin/bucket`.
2. Admin chọn bucket, duyệt breadcrumb/tree thư mục.
3. Admin có thể tạo, đổi tên, xoá folder/file và tải file lên thư mục hiện tại.
