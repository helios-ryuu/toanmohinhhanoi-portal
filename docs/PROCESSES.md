# Workflow & Use Case Specifications — TMH Portal

**Dự án:** TMH-PORTAL-2026
**Phiên bản:** 1.0
**Ngày:** 10/04/2026
**Liên quan:** [REQUIREMENTS.md](./REQUIREMENTS.md), [SCHEMA.md](./SCHEMA.md)

Tài liệu này mô tả các quy trình thao tác chính (business workflows) của hệ thống. Mỗi quy trình chỉ rõ **các bước thực hiện**, **thành phần tương tác** (UI, API, DB, Storage) và **tác động lên các bảng** trong CSDL.

Ký hiệu sử dụng:
- `INSERT` / `UPDATE` / `DELETE` / `SELECT` — thao tác SQL
- `auth.users`, `public.users`, … — bảng trong DB
- `Storage: {bucket}` — thao tác trên Supabase Storage

---

## A. Nhóm Authentication

### A1. Đăng nhập bằng Google (lần đầu) và tạo Profile

**Mã Use Case:** UC-AUTH-01
**Actor:** Người dùng (ẩn danh)
**Tiền điều kiện:** Người dùng chưa có bản ghi trong `auth.users`. Supabase đã cấu hình Google OAuth provider.
**Hậu điều kiện:** Người dùng có phiên đăng nhập hợp lệ và một bản ghi profile trong `public.users`.
**Yêu cầu liên quan:** FR_AUTH_01, FR_AUTH_02, FR_AUTH_04, FR_AUTH_05

**Luồng chính:**

1. User truy cập `/auth` và click nút **"Đăng nhập bằng Google"**.
2. Google Identity Services (GIS) mở popup native của Google — **không redirect, không hiển thị consent screen**.
3. User chọn tài khoản Google trong popup.
4. GIS trả về ID token; client gọi `supabase.auth.signInWithIdToken({ provider: 'google', token })`.
5. Supabase Auth xác thực token, tạo bản ghi trong `auth.users` (Supabase managed).
6. **Trigger DB** `trg_on_auth_user_created` tự động kích hoạt → chạy hàm `handle_new_auth_user()`:
   - Sinh `username` từ phần trước `@` của email, xử lý trùng lặp bằng hậu tố số.
   - Lấy `display_name` từ `raw_user_meta_data->>'full_name'`.
   - `INSERT` vào `public.users`.
7. Supabase set cookie session. Client redirect về trang trước đó (nếu có `next` param) hoặc `/`.
8. `src/proxy.ts` (Next.js 16 proxy, thay thế middleware) kiểm tra session hợp lệ trên các route được bảo vệ.

**Tác động CSDL:**

| Bảng | Thao tác | Trường thay đổi |
|---|---|---|
| `auth.users` | `INSERT` | `id`, `email`, `raw_user_meta_data`, `created_at` (Supabase tự quản lý) |
| `public.users` | `INSERT` (qua trigger) | `id` (=`auth.users.id`), `username`, `display_name`, `created_at` |

**Luồng phụ / Ngoại lệ:**
- **A1.E1** User hủy cấp quyền ở Google → popup đóng, không có bản ghi nào được tạo, user vẫn ở `/auth`.
- **A1.E2** Trigger fail (ví dụ username vi phạm constraint) → toàn bộ transaction rollback, user không đăng nhập được. Cần log lỗi ở server.

---

### A2. Đăng nhập bằng Google (lần N ≥ 2)

**Mã Use Case:** UC-AUTH-02
**Actor:** Người dùng đã có profile
**Tiền điều kiện:** `auth.users` và `public.users` đã tồn tại bản ghi tương ứng.
**Yêu cầu liên quan:** FR_AUTH_06, FR_AUTH_08

**Luồng chính:**

1. User click **"Đăng nhập bằng Google"** → GIS popup flow như UC-AUTH-01.
2. Supabase phát hiện `auth.users.id` đã tồn tại → chỉ refresh session, **KHÔNG** trigger `trg_on_auth_user_created`.
3. Cookie session được cập nhật, user được redirect về trang trước đó (nếu có `next` param) hoặc `/`.

**Tác động CSDL:**

| Bảng | Thao tác |
|---|---|
| `auth.sessions` | `INSERT` / `UPDATE` (Supabase managed) |
| `public.users` | Không thay đổi |

---

### A3. Đăng xuất

**Mã Use Case:** UC-AUTH-03
**Actor:** Người dùng đã đăng nhập
**Yêu cầu liên quan:** FR_AUTH_06

**Luồng chính:**

1. User click nút **"Đăng xuất"** trong menu user.
2. Client gọi `supabase.auth.signOut()`.
3. Supabase xóa session khỏi `auth.sessions` và clear cookie.
4. Next.js redirect về `/`.

**Tác động CSDL:**

| Bảng | Thao tác |
|---|---|
| `auth.sessions` | `DELETE` (Supabase managed) |

---

### A4. Cập nhật Profile

**Mã Use Case:** UC-USER-01
**Actor:** Người dùng đã đăng nhập (chủ sở hữu profile)
**Yêu cầu liên quan:** FR_USER_03, FR_USER_05

**Luồng chính:**

1. User truy cập `/profile`, chỉnh sửa `display_name` / `bio` / `school`.
2. Client submit form → API `PATCH /api/users/me`.
3. Server validate độ dài các trường.
4. Server thực thi `UPDATE public.users SET display_name=..., bio=..., school=... WHERE id = auth.uid()`.
5. Trigger `trg_users_updated_at` tự động set `updated_at = now()`.
6. API trả về `{ success: true, data: {...} }`. Client refresh UI.

**Tác động CSDL:**

| Bảng | Thao tác | Trường |
|---|---|---|
| `public.users` | `UPDATE` | `display_name`, `bio`, `school`, `updated_at` |

**Ngoại lệ:**
- **A4.E1** Validation fail → API trả 400, không chạm DB.
- **A4.E2** RLS từ chối (user cố update profile người khác) → API trả 403.

---

## B. Nhóm Content Management

### B1. Admin đăng bài viết mới

**Mã Use Case:** UC-CMS-01
**Actor:** Admin
**Tiền điều kiện:** Admin đã đăng nhập và có quyền admin (cờ role trong DB).
**Hậu điều kiện:** Một bài viết mới tồn tại ở trạng thái `draft` hoặc `published`; nếu có tag thì các bản ghi `post_tags` tương ứng được tạo; ảnh bìa (nếu có) đã nằm trong Storage.
**Yêu cầu liên quan:** FR_CMS_03, FR_CMS_04, FR_CMS_05, FR_CMS_07, FR_CMS_08, FR_POST_06, FR_POST_07, FR_POST_08

**Luồng chính:**

1. Admin truy cập `/admin/posts/new`.
2. (Tùy chọn) Admin chọn file ảnh bìa → client gọi `POST /api/admin/uploads/post-image`:
   - Server validate MIME type và kích thước.
   - Server upload vào `Storage: post-images` theo path `{post-slug}/cover.{ext}`.
   - Trả về `image_url` công khai.
3. Admin điền `title`, `description`, `content` (MDX), chọn `category`, chọn tag (multi-select).
4. `slug` auto-generate từ `title`; admin có thể chỉnh sửa.
5. Admin click **"Lưu nháp"** hoặc **"Xuất bản"**.
6. Client gọi `POST /api/admin/posts` với payload đầy đủ.
7. Server validate:
   - `slug` unique (check `post.slug`).
   - `category` thuộc tập hợp lệ.
   - Nếu `published = true` → set `published_at = now()`.
8. Server thực thi trong một transaction:
   - `INSERT INTO public.post (...)` → nhận `post_id`.
   - Với mỗi `tag_id` được chọn: `INSERT INTO public.post_tags (post_id, tag_id)`.
9. Server gọi `revalidateTag('posts')` để xóa cache Next.js.
10. API trả về bài viết vừa tạo; admin được redirect tới `/admin/posts/{id}`.

**Lưu ý nghiệp vụ:**
- Bài viết **không có** `author_id` và **không thuộc series** (đã loại bỏ). Trường `title`, `description`, `content` là của tổ chức, không gắn với cá nhân.

**Tác động CSDL:**

| Bảng | Thao tác | Ghi chú |
|---|---|---|
| `public.post` | `INSERT` | `slug`, `title`, `description`, `content`, `image_url`, `category`, `published`, `published_at`, `created_at` |
| `public.post_tags` | `INSERT` × N | Một bản ghi / tag được gán |
| `Storage: post-images` | `PUT` object | (bước 2, nếu có ảnh bìa) |

**Ngoại lệ:**
- **B1.E1** `slug` trùng → server trả 409, không `INSERT`.
- **B1.E2** Upload ảnh fail → server trả 500; admin có thể lưu bài không có ảnh bìa.
- **B1.E3** Constraint `post_publish_check` vi phạm (publish=true nhưng published_at=null) → transaction rollback.

---

### B2. Admin publish / unpublish bài viết

**Mã Use Case:** UC-CMS-02
**Actor:** Admin
**Yêu cầu liên quan:** FR_CMS_05, FR_POST_02

**Luồng chính:**

1. Admin mở bài viết ở `/admin/posts/{id}` và click **"Publish"** (hoặc **"Unpublish"**).
2. Client gọi `PATCH /api/admin/posts/{id}/publish` với `{ published: true|false }`.
3. Server:
   - Nếu `published=true`: set `published_at = now()`.
   - Nếu `published=false`: set `published_at = NULL`.
4. Trigger `trg_post_updated_at` set `updated_at = now()`.
5. Server `revalidateTag('posts')` và `revalidatePath('/')`.

**Tác động CSDL:**

| Bảng | Thao tác | Trường |
|---|---|---|
| `public.post` | `UPDATE` | `published`, `published_at`, `updated_at` |

---

### B3. Admin xóa bài viết

**Mã Use Case:** UC-CMS-03
**Actor:** Admin
**Yêu cầu liên quan:** FR_CMS_06

**Luồng chính:**

1. Admin click **"Xóa"** ở danh sách hoặc trang chi tiết bài viết.
2. Confirm dialog → client gọi `DELETE /api/admin/posts/{id}`.
3. Server thực thi `DELETE FROM public.post WHERE id = ?`.
4. FK `post_tags.post_id … ON DELETE CASCADE` tự động xóa các bản ghi `post_tags` liên quan.
5. (Tùy chọn) Server xóa file ảnh bìa khỏi `Storage: post-images`.
6. `revalidateTag('posts')`.

**Tác động CSDL:**

| Bảng | Thao tác | Ghi chú |
|---|---|---|
| `public.post` | `DELETE` | Xóa theo `id` |
| `public.post_tags` | `DELETE` (cascade) | Tự động |
| `Storage: post-images` | `DELETE` object | Tùy chọn — chạy sau khi DELETE DB thành công |

---

### B4. Quản lý Tag

**Mã Use Case:** UC-CMS-04
**Actor:** Admin
**Yêu cầu liên quan:** FR_CMS_07

**Luồng chính:**

- **Tạo tag:** Admin nhập `name` + `slug` → `INSERT INTO public.tag`.
- **Sửa tag:** `UPDATE public.tag SET name=..., slug=... WHERE id=?`.
- **Xóa tag:** `DELETE FROM public.tag WHERE id=?` → FK cascade xóa các bản ghi trong `post_tags`.

**Tác động CSDL:**

| Bảng | Thao tác |
|---|---|
| `public.tag` | `INSERT` / `UPDATE` / `DELETE` |
| `public.post_tags` | `DELETE` cascade (khi xóa tag) |

---

## C. Nhóm Contest

### C1. Admin tạo cuộc thi mới

**Mã Use Case:** UC-CONTEST-01
**Actor:** Admin
**Tiền điều kiện:** Admin đã đăng nhập.
**Hậu điều kiện:** Một bản ghi `contest` được tạo; nếu `status = draft` thì chưa hiển thị công khai.
**Yêu cầu liên quan:** FR_CONTEST_01 — FR_CONTEST_06

**Luồng chính:**

1. Admin truy cập `/admin/contests/new`.
2. (Tùy chọn) Upload `cover_image_url` vào `Storage: post-images` (cùng bucket dùng chung).
3. Admin điền: `title`, `slug`, `description`, `rules`, `participation_type`, `max_team_size`, các mốc thời gian, `status`.
4. Client gọi `POST /api/admin/contests`.
5. Server validate:
   - `slug` unique.
   - `participation_type ∈ {individual, team, both}`.
   - Nếu `individual` → `max_team_size = 1`; nếu `team`/`both` → `max_team_size ≥ 2`.
   - Thứ tự thời gian: `registration_start < registration_end ≤ contest_start < contest_end ≤ submission_deadline` (constraint `contest_date_order_check` đảm bảo thêm ở DB).
6. Server `INSERT INTO public.contest`.
7. `revalidateTag('contests')`.

**Tác động CSDL:**

| Bảng | Thao tác | Trường chính |
|---|---|---|
| `public.contest` | `INSERT` | `slug`, `title`, `description`, `rules`, `participation_type`, `max_team_size`, `registration_start/end`, `contest_start/end`, `submission_deadline`, `status`, `created_at` |
| `Storage: post-images` | `PUT` object | (nếu có `cover_image_url`) |

**Chuyển trạng thái (`status` lifecycle):**

```
draft  ──(admin publish)──►  open
open   ──(tự động khi contest_start)──►  ongoing
ongoing ──(tự động khi submission_deadline)──►  closed
bất kỳ ──(admin hủy)──►  cancelled
```

Chuyển trạng thái tự động không bắt buộc trong MVP; admin có thể update thủ công qua `PATCH /api/admin/contests/{id}`.

---

### C2. User đăng ký tham gia cuộc thi

**Mã Use Case:** UC-REG-01
**Actor:** User đã đăng nhập
**Tiền điều kiện:**
- Contest có `status = 'open'`.
- `now() ∈ [registration_start, registration_end]`.
- User chưa đăng ký (dù với role nào) cho contest này.

**Hậu điều kiện:** Một bản ghi `contest_registration` ở trạng thái `pending` và ít nhất một bản ghi `registration_member` với `role = 'leader'`.
**Yêu cầu liên quan:** FR_REG_01 — FR_REG_07

**Luồng chính (cá nhân — `individual`):**

1. User vào `/contests/{slug}` và click **"Đăng ký tham gia"**.
   *(Ghi chú MVP: nút hiển thị "Coming Soon" ở frontend, backend đã sẵn sàng — xem FR_CONTEST_12.)*
2. Client gọi `POST /api/contests/{slug}/register` với body `{ team_name: null, members: [] }`.
3. Server validate:
   - Contest tồn tại, `status='open'`, trong cửa sổ đăng ký.
   - User chưa có bản ghi `registration_member` cho bất kỳ `contest_registration` nào của contest này (ràng buộc "một user một đăng ký").
4. Server mở transaction:
   - `INSERT INTO public.contest_registration (contest_id, team_name, status)` với `status='pending'` → nhận `registration_id`.
   - `INSERT INTO public.registration_member (registration_id, user_id, role)` với `role='leader'`.
5. Commit transaction.
6. Trả về `{ registration_id, status: 'pending' }`.

**Luồng phụ (đội — `team` / `both`):**

- Bước 2: body chứa `{ team_name, members: [user_id_1, user_id_2, ...] }` (leader là user hiện tại, tối đa `max_team_size - 1` member khác).
- Bước 4: `INSERT` leader + N member; kiểm tra không ai trong danh sách đã đăng ký cuộc thi này; đảm bảo `count(members) + 1 ≤ max_team_size`.

**Tác động CSDL:**

| Bảng | Thao tác | Trường chính |
|---|---|---|
| `public.contest_registration` | `INSERT` | `contest_id`, `team_name`, `status='pending'`, `registered_at` |
| `public.registration_member` | `INSERT` × (1 leader + N members) | `registration_id`, `user_id`, `role` |

**Ngoại lệ:**
- **C2.E1** Ngoài cửa sổ đăng ký → API trả 409 `registration_closed`.
- **C2.E2** User đã đăng ký → API trả 409 `already_registered`.
- **C2.E3** Vượt `max_team_size` → API trả 400 `team_too_large`.
- **C2.E4** Một trong các `members` không tồn tại trong `public.users` → FK fail, rollback.

---

### C3. Admin phê duyệt / từ chối đăng ký

**Mã Use Case:** UC-REG-02
**Actor:** Admin
**Yêu cầu liên quan:** FR_CONTEST_07, FR_CONTEST_08, FR_REG_07

**Luồng chính:**

1. Admin vào `/admin/contests/{id}/registrations`.
2. Danh sách đăng ký được filter theo `status`.
3. Admin click **"Duyệt"** hoặc **"Từ chối"** trên một đăng ký.
4. Client gọi `PATCH /api/admin/registrations/{id}` với `{ status: 'approved' | 'rejected' }`.
5. Server `UPDATE public.contest_registration SET status=... WHERE id=?`.
6. Trigger `trg_registration_updated_at` set `updated_at = now()`.

**Tác động CSDL:**

| Bảng | Thao tác | Trường |
|---|---|---|
| `public.contest_registration` | `UPDATE` | `status`, `updated_at` |

---

### C4. User nộp file bài thi

**Mã Use Case:** UC-SUB-01
**Actor:** Thành viên của một `contest_registration` đã `approved`
**Tiền điều kiện:**
- `registration.status = 'approved'`.
- `now() < contest.submission_deadline`.
- User là `leader` hoặc `member` của registration (xác định qua `registration_member`).

**Hậu điều kiện:**
- File đã nằm trong `Storage: submissions` đúng đường dẫn quy ước.
- Một bản ghi `submission` mới trong DB liên kết tới file đó.
- Nếu user đánh dấu bản mới là final, mọi bản submission cũ của cùng registration đều có `is_final = false`.

**Yêu cầu liên quan:** FR_SUB_01 — FR_SUB_08, FR_STOR_03

**Luồng chính:**

1. User vào trang submission của registration (giai đoạn 2; MVP: endpoint API).
2. User chọn file → client gọi `POST /api/submissions` (multipart form hoặc presigned URL flow).
3. **Server-side validation (trước khi chạm Storage):**
   - Xác thực session → lấy `user_id`.
   - `SELECT ... FROM public.contest_registration r JOIN public.registration_member m ON ... JOIN public.contest c ON ... WHERE r.id = ? AND m.user_id = :user_id` để đảm bảo quyền thành viên.
   - Kiểm tra `r.status='approved'` và `now() < c.submission_deadline`.
   - Validate MIME type (allowlist cấu hình server) và `file_size_bytes ≤ 50 MB`.
4. **Upload lên Storage:**
   - Server (hoặc client với signed URL) upload vào bucket `submissions` theo path `{contest_id}/{registration_id}/{temp_uuid}_{original_name}`.
   - Storage RLS đảm bảo chỉ thành viên registration tương ứng mới có quyền write (`submissions: member insert`).
5. **Ghi nhận DB:**
   - `INSERT INTO public.submission (registration_id, storage_path, file_name, file_size_bytes, mime_type, note, submitted_by, is_final)` với `submitted_by = user_id`.
   - Nhận `submission_id`, (tùy chọn) đổi tên object Storage thành `{submission_id}_{original_name}` và cập nhật lại `storage_path`.
6. **Xử lý `is_final` (nếu user đánh dấu final):**
   - Trong cùng transaction:
     - `UPDATE public.submission SET is_final = false WHERE registration_id = ? AND is_final = true`
     - `UPDATE public.submission SET is_final = true WHERE id = :new_submission_id`
7. Trả về `{ success: true, data: submission }`.

**Tác động CSDL & Storage:**

| Thành phần | Thao tác | Ghi chú |
|---|---|---|
| `Storage: submissions` | `PUT` object | Path `{contest_id}/{registration_id}/{submission_id}_{file_name}` |
| `public.submission` | `INSERT` | `registration_id`, `storage_path`, `file_name`, `file_size_bytes`, `mime_type`, `note`, `submitted_by`, `submitted_at`, `is_final` |
| `public.submission` | `UPDATE` × ≥1 | (Khi đánh dấu final) Set `is_final = false` cho bản cũ, `true` cho bản mới |

**Ngoại lệ & Rollback:**
- **C4.E1** Validation fail trước upload → không chạm Storage và DB.
- **C4.E2** Upload Storage thành công nhưng `INSERT DB` fail → server PHẢI xóa object vừa upload để tránh file mồ côi.
- **C4.E3** Sau `submission_deadline` → API trả 403 `deadline_passed`.
- **C4.E4** User không phải thành viên registration → RLS chặn ở cả DB và Storage; API trả 403.

---

### C5. User / Admin tải file bài nộp

**Mã Use Case:** UC-SUB-02
**Actor:** Thành viên registration (xem bài của đội mình) hoặc Admin
**Yêu cầu liên quan:** FR_SUB_07, FR_CONTEST_09

**Luồng chính:**

1. Client yêu cầu download qua API `GET /api/submissions/{id}/download`.
2. Server kiểm tra quyền:
   - Nếu admin → cho phép.
   - Nếu user thường → kiểm tra `registration_member` có chứa (`registration_id`, `user_id`).
3. Server tạo **signed URL** có thời hạn ngắn từ Supabase Storage trên bucket `submissions` và trả về client.
4. Client dùng URL để tải file trực tiếp từ Storage.

**Tác động CSDL:**

| Thành phần | Thao tác |
|---|---|
| `public.submission` | `SELECT` (đọc metadata) |
| `public.registration_member` | `SELECT` (kiểm quyền) |
| `Storage: submissions` | `CREATE_SIGNED_URL` (read-only, short TTL) |

Không có mutation ở quy trình này.

---

## D. Tóm tắt ma trận Use Case ↔ Bảng

| Use Case | `auth.users` | `public.users` | `post` | `post_tags` | `tag` | `contest` | `contest_registration` | `registration_member` | `submission` | Storage |
|---|---|---|---|---|---|---|---|---|---|---|
| UC-AUTH-01 | INS | INS (trigger) | | | | | | | | |
| UC-AUTH-02 | — | — | | | | | | | | |
| UC-AUTH-03 | DEL session | | | | | | | | | |
| UC-USER-01 | | UPD | | | | | | | | |
| UC-CMS-01 | | | INS | INS×N | SEL | | | | | post-images: PUT |
| UC-CMS-02 | | | UPD | | | | | | | |
| UC-CMS-03 | | | DEL | DEL (cascade) | | | | | | post-images: DEL |
| UC-CMS-04 | | | | DEL (cascade) | INS/UPD/DEL | | | | | |
| UC-CONTEST-01 | | | | | | INS | | | | post-images: PUT |
| UC-REG-01 | | SEL | | | | SEL | INS | INS×(1..max) | | |
| UC-REG-02 | | | | | | | UPD | | | |
| UC-SUB-01 | | SEL | | | | SEL | SEL | SEL | INS + UPD×N | submissions: PUT |
| UC-SUB-02 | | | | | | | | SEL | SEL | submissions: SIGNED_URL |

Chú thích: INS=INSERT, UPD=UPDATE, DEL=DELETE, SEL=SELECT.
