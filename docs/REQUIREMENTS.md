# Requirements Specification — Trang web portal Toán Mô Hình Hà Nội

**Dự án:** TMH-PORTAL-2026
**Phiên bản:** 1.0
**Ngày phát hành:** 07/02/2026
**Người viết:** Ngô Tiến Sỹ (PM)

---

## 1. Giới thiệu

Tài liệu này mô tả chi tiết các yêu cầu chức năng (Functional Requirements — FR) và yêu cầu phi chức năng (Non-Functional Requirements — NFR) của hệ thống Portal Toán Mô Hình Hà Nội. Tất cả yêu cầu được đánh mã số để tham chiếu trong quá trình phát triển, kiểm thử và nghiệm thu.

### 1.1 Quy ước đánh mã

- **FR**_`{mã mô-đun}`_`{số thứ tự}`: Yêu cầu chức năng
- **NFR**`{số thứ tự}`: Yêu cầu phi chức năng
- **Độ ưu tiên**: `MUST` (bắt buộc MVP) / `SHOULD` (nên có) / `COULD` (có thể có sau)

### 1.2 Các mô-đun chính

| Mã | Mô-đun |
|---|---|
| AUTH | Xác thực người dùng |
| USER | Quản lý profile |
| POST | Quản lý và hiển thị bài viết |
| CMS | Giao diện quản trị nội dung |
| CONTEST | Quản lý cuộc thi |
| REG | Đăng ký tham gia cuộc thi |
| SUB | Nộp bài cuộc thi |
| STOR | Lưu trữ file |

---

## 2. Yêu cầu chức năng (Functional Requirements)

### 2.1 AUTH — Xác thực người dùng

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_AUTH_01** | Hệ thống PHẢI chỉ hỗ trợ duy nhất một phương thức đăng nhập: **Google OAuth** thông qua Supabase Auth. | MUST |
| **FR_AUTH_02** | Trang đăng nhập PHẢI hiển thị nút "Đăng nhập bằng Google" làm hành động chính. | MUST |
| **FR_AUTH_03** | Nếu trang đăng nhập có ô nhập email (từ form cũ), khi người dùng focus hoặc nhập email, hệ thống PHẢI hiển thị thông báo và tự động hướng họ đến nút "Đăng nhập bằng Google". Không có nút submit dạng email/password. | MUST |
| **FR_AUTH_04** | Khi người dùng đăng nhập Google lần đầu tiên, hệ thống PHẢI tự động tạo bản ghi tương ứng trong bảng `public.users` thông qua database trigger, không cần người dùng thao tác. | MUST |
| **FR_AUTH_05** | Username tự động được sinh từ phần trước ký tự `@` của email Google. Nếu username đã tồn tại, hệ thống PHẢI thêm hậu tố số để đảm bảo duy nhất (ví dụ: `john`, `john1`, `john2`). | MUST |
| **FR_AUTH_06** | Người dùng PHẢI có thể đăng xuất khỏi hệ thống thông qua nút "Đăng xuất" có sẵn trong menu user. Sau khi đăng xuất, session phải được xóa hoàn toàn. | MUST |
| **FR_AUTH_07** | Hệ thống PHẢI bảo vệ các route yêu cầu đăng nhập (ví dụ: `/profile`, `/admin`) thông qua proxy (Next.js 16). Người dùng chưa đăng nhập PHẢI được redirect về `/auth`. | MUST |
| **FR_AUTH_08** | Session đăng nhập PHẢI được duy trì ít nhất 7 ngày. Người dùng không cần đăng nhập lại mỗi khi truy cập. | SHOULD |
| **FR_AUTH_09** | Hệ thống PHẢI phân biệt vai trò `user` (mặc định) và `admin` thông qua cờ trong database. Chỉ admin được truy cập `/admin`. | MUST |

### 2.2 USER — Quản lý Profile

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_USER_01** | Người dùng đã đăng nhập PHẢI có thể xem trang profile của mình tại `/profile`. | MUST |
| **FR_USER_02** | Profile PHẢI hiển thị các thông tin: `username`, `display_name`, `bio`, `school`, `email` (readonly, lấy từ `auth.users`). | MUST |
| **FR_USER_03** | Người dùng PHẢI có thể chỉnh sửa `display_name`, `bio`, `school`. Username là readonly sau lần tạo đầu tiên. | MUST |
| **FR_USER_04** | Profile KHÔNG được phép upload hoặc hiển thị ảnh đại diện, ảnh bìa hay bất kỳ media nào. Chỉ chứa dữ liệu văn bản để tiết kiệm chi phí storage. | MUST |
| **FR_USER_05** | Khi chỉnh sửa profile, hệ thống PHẢI validate:  `display_name` không vượt 100 ký tự; `bio` không vượt 500 ký tự; `school` không vượt 200 ký tự. | MUST |
| **FR_USER_06** | Trang profile công khai của một user (nếu có) chỉ hiển thị `username`, `display_name`, `bio`, `school` — không hiển thị email. | SHOULD |

### 2.3 POST — Bài viết công khai

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_POST_01** | Trang chủ PHẢI hiển thị danh sách bài viết mới nhất, sắp xếp theo `published_at` giảm dần. | MUST |
| **FR_POST_02** | Chỉ những bài viết có `published = true` mới được hiển thị ra công chúng. Bài draft chỉ admin xem được. | MUST |
| **FR_POST_03** | Trang chi tiết bài viết (`/post/[slug]`) PHẢI render nội dung MDX và hiển thị: tiêu đề, mô tả, ảnh bìa, category, danh sách tag, ngày đăng. | MUST |
| **FR_POST_04** | Hệ thống PHẢI hỗ trợ lọc bài viết theo tag (`/tag/[slug]`) và theo category (`/category/[type]`). | MUST |
| **FR_POST_05** | Hệ thống PHẢI cung cấp ô tìm kiếm cơ bản theo tiêu đề và mô tả bài viết. | SHOULD |
| **FR_POST_06** | Mỗi bài viết PHẢI thuộc một trong các category: `news`, `announcement`, `tutorial`, `result`. | MUST |
| **FR_POST_07** | Bài viết KHÔNG có khái niệm tác giả (author) — mọi bài viết thuộc về tổ chức. UI không hiển thị tên tác giả. | MUST |
| **FR_POST_08** | Bài viết KHÔNG thuộc về series nào. Cấu trúc chỉ là bài đơn lẻ. | MUST |

### 2.4 CMS — Quản trị nội dung (Admin)

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_CMS_01** | Chỉ người dùng có vai trò `admin` PHẢI được phép truy cập `/admin`. | MUST |
| **FR_CMS_02** | Admin dashboard PHẢI có menu điều hướng giữa: Quản lý bài viết, Quản lý tag, Quản lý cuộc thi, Quản lý đăng ký. | MUST |
| **FR_CMS_03** | Admin PHẢI có thể tạo bài viết mới với các trường: `title`, `slug` (auto từ title), `description`, `content` (MDX), `category`, `image_url`, `tags`. | MUST |
| **FR_CMS_04** | Admin PHẢI có thể upload ảnh bìa cho bài viết vào bucket `post-images`. | MUST |
| **FR_CMS_05** | Admin PHẢI có thể publish/unpublish bài viết. Khi publish, `published_at` tự động được gán `now()`. | MUST |
| **FR_CMS_06** | Admin PHẢI có thể chỉnh sửa và xóa bài viết. Khi xóa, các bản ghi `post_tags` liên quan cũng bị xóa cascade. | MUST |
| **FR_CMS_07** | Admin PHẢI có thể tạo/sửa/xóa tag với `name` và `slug`. | MUST |
| **FR_CMS_08** | Khi tạo/sửa bài viết, admin PHẢI có thể gán nhiều tag cho bài viết thông qua multi-select. | MUST |
| **FR_CMS_09** | Admin PHẢI có thể preview bài viết trước khi publish. | SHOULD |

### 2.5 CONTEST — Cuộc thi (Admin-side)

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_CONTEST_01** | Admin PHẢI có thể tạo cuộc thi mới với các trường: `title`, `slug`, `description`, `rules`, `cover_image_url`, `participation_type`, `max_team_size`, các mốc thời gian (`registration_start/end`, `contest_start/end`, `submission_deadline`), `status`. | MUST |
| **FR_CONTEST_02** | `participation_type` PHẢI là một trong: `individual` (cá nhân), `team` (đội), `both` (cả hai). | MUST |
| **FR_CONTEST_03** | Với cuộc thi `team` hoặc `both`, `max_team_size` PHẢI ≥ 2. Với `individual`, `max_team_size` = 1. | MUST |
| **FR_CONTEST_04** | Hệ thống PHẢI validate thứ tự thời gian: `registration_start < registration_end ≤ contest_start < contest_end ≤ submission_deadline`. Tạo/sửa không hợp lệ PHẢI bị từ chối. | MUST |
| **FR_CONTEST_05** | Trạng thái cuộc thi (`status`) PHẢI là một trong: `draft`, `open`, `ongoing`, `closed`, `cancelled`. Cuộc thi ở trạng thái `draft` KHÔNG hiển thị với người dùng công khai. | MUST |
| **FR_CONTEST_06** | Admin PHẢI có thể sửa và xóa cuộc thi. Khi xóa, mọi `contest_registration` và `submission` liên quan bị xóa cascade. | MUST |
| **FR_CONTEST_07** | Admin PHẢI có thể xem danh sách đăng ký của một cuộc thi, lọc theo trạng thái (`pending`, `approved`, `rejected`, `withdrawn`). | MUST |
| **FR_CONTEST_08** | Admin PHẢI có thể phê duyệt hoặc từ chối từng đăng ký. | MUST |
| **FR_CONTEST_09** | Admin PHẢI có thể tải về file nộp bài của các đội đã approved. | SHOULD |

### 2.6 CONTEST — Hiển thị công khai

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_CONTEST_10** | Hệ thống PHẢI có trang danh sách cuộc thi công khai (`/contests`) hiển thị các cuộc thi có `status ≠ draft`. | MUST |
| **FR_CONTEST_11** | Trang chi tiết cuộc thi (`/contests/[slug]`) PHẢI hiển thị: tiêu đề, mô tả, thể lệ, các mốc thời gian, loại tham gia, trạng thái. | MUST |
| **FR_CONTEST_12** | Trang chi tiết cuộc thi PHẢI có nút "Đăng ký tham gia" ở trạng thái "Under Development" (disabled hoặc hiển thị "Coming Soon") cho MVP. Backend đã sẵn sàng nhưng UI tạm thời chưa mở. | MUST |
| **FR_CONTEST_13** | Hiển thị đếm ngược (countdown) đến thời điểm mở/đóng đăng ký hoặc hạn nộp bài tùy theo trạng thái cuộc thi. | SHOULD |

### 2.7 REG — Đăng ký cuộc thi (Backend API, UI giai đoạn 2)

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_REG_01** | API PHẢI cho phép người dùng đã đăng nhập đăng ký tham gia một cuộc thi khi thời điểm hiện tại nằm trong khoảng `[registration_start, registration_end]`. | MUST |
| **FR_REG_02** | API PHẢI từ chối đăng ký nếu cuộc thi có `status ∉ {open}` hoặc ngoài thời gian đăng ký. | MUST |
| **FR_REG_03** | Với cuộc thi `individual`, một đăng ký chỉ có một thành viên (`role = 'leader'`). | MUST |
| **FR_REG_04** | Với cuộc thi `team`, đăng ký PHẢI có đúng một `leader` và tối đa `max_team_size - 1` thành viên. | MUST |
| **FR_REG_05** | Một user KHÔNG được phép đăng ký (dù là leader hay member) nhiều hơn một lần cho cùng một cuộc thi. | MUST |
| **FR_REG_06** | API PHẢI hỗ trợ các hành động: tạo đăng ký, thêm/xóa thành viên trước khi đóng đăng ký, rút khỏi đăng ký (`status = withdrawn`). | MUST |
| **FR_REG_07** | Đăng ký mới có `status = 'pending'` và chờ admin phê duyệt (hoặc tự động approved tùy cấu hình cuộc thi — MVP: manual). | MUST |

### 2.8 SUB — Nộp bài (Backend API, UI giai đoạn 2)

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_SUB_01** | API PHẢI cho phép thành viên của một đăng ký đã `approved` nộp file bài thi trước `submission_deadline`. | MUST |
| **FR_SUB_02** | Hệ thống PHẢI hỗ trợ upload file với nhiều định dạng: `pdf`, `zip`, `docx`, `xlsx`, `ipynb`, `py`, `cpp`, hình ảnh, v.v. Danh sách MIME type cho phép được cấu hình phía server. | MUST |
| **FR_SUB_03** | Dung lượng mỗi file nộp PHẢI không vượt quá **50 MB** (hoặc giới hạn của Supabase Storage free tier, tùy thấp hơn). | MUST |
| **FR_SUB_04** | File nộp PHẢI được lưu vào bucket `submissions` với đường dẫn `{contest_id}/{registration_id}/{submission_id}_{original_name}`. | MUST |
| **FR_SUB_05** | Mỗi đăng ký PHẢI có thể nộp nhiều bài (nhiều lần), nhưng chỉ MỘT bài được đánh dấu `is_final = true`. Khi đánh dấu bản mới là final, bản cũ tự động `is_final = false`. | MUST |
| **FR_SUB_06** | Sau `submission_deadline`, API PHẢI từ chối mọi request upload mới. | MUST |
| **FR_SUB_07** | Chỉ thành viên của đăng ký và admin mới được phép tải về file nộp. Quyền này được enforce qua RLS ở cả DB và Storage. | MUST |
| **FR_SUB_08** | Mỗi bản ghi submission PHẢI lưu: `storage_path`, `file_name`, `file_size_bytes`, `mime_type`, `submitted_by` (user_id), `submitted_at`, `note` (tùy chọn). | MUST |

### 2.9 STOR — Lưu trữ file

| Mã | Mô tả | Ưu tiên |
|---|---|---|
| **FR_STOR_01** | Hệ thống PHẢI có ít nhất hai Supabase Storage bucket: `post-images` (public) và `submissions` (private). | MUST |
| **FR_STOR_02** | Bucket `post-images` PHẢI cho phép mọi người đọc, nhưng chỉ admin được upload qua API server. | MUST |
| **FR_STOR_03** | Bucket `submissions` PHẢI bảo mật theo RLS: chỉ thành viên của `registration` tương ứng và admin được đọc/ghi. | MUST |
| **FR_STOR_04** | Hệ thống KHÔNG được phép upload media của user cuối (avatar, ảnh bìa profile) trong MVP. | MUST |

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

### 3.1 Hiệu năng

| Mã | Mô tả |
|---|---|
| **NFR01** | Trang chủ và trang chi tiết bài viết PHẢI có LCP (Largest Contentful Paint) < 2.5 giây trên kết nối 4G tại Việt Nam. |
| **NFR02** | API trả về danh sách bài viết PHẢI phản hồi trong < 500ms ở điều kiện bình thường (p95). |
| **NFR03** | Hệ thống PHẢI sử dụng Next.js caching (`unstable_cache`, `revalidateTag`) để giảm số lượng query DB trùng lặp. |
| **NFR04** | Query `post` và `contest` PHẢI có index trên các cột được filter thường xuyên (`published_at`, `status`, `slug`). |

### 3.2 Bảo mật

| Mã | Mô tả |
|---|---|
| **NFR05** | Mọi bảng trong schema `public` PHẢI bật Row Level Security (RLS). Không có bảng nào để RLS tắt. |
| **NFR06** | Service role key của Supabase CHỈ được sử dụng ở server-side, KHÔNG được expose ra client. |
| **NFR07** | Hệ thống KHÔNG lưu trữ mật khẩu người dùng (do chỉ dùng Google OAuth). |
| **NFR08** | Middleware PHẢI validate JWT của Supabase trên mọi protected route. |
| **NFR09** | File upload PHẢI được validate MIME type phía server trước khi lưu vào Storage. Không tin tưởng MIME type do client gửi. |
| **NFR10** | Hệ thống PHẢI chống CSRF bằng cách sử dụng SameSite cookie (Supabase Auth đã hỗ trợ sẵn). |
| **NFR11** | Mọi input từ client PHẢI được sanitize trước khi render (đặc biệt là MDX — sử dụng allowlist component). |

### 3.3 Khả năng mở rộng

| Mã | Mô tả |
|---|---|
| **NFR12** | Kiến trúc PHẢI cho phép chuyển từ Supabase free tier sang pro tier mà không cần refactor code. |
| **NFR13** | Schema DB PHẢI được thiết kế chuẩn hóa 3NF, dễ dàng mở rộng cho các tính năng tương lai (chấm điểm, bình luận, notification) mà không phá vỡ schema hiện có. |
| **NFR14** | Hệ thống PHẢI xử lý được ít nhất 1.000 người dùng đăng ký và 100 cuộc thi mà không suy giảm hiệu năng đáng kể. |

### 3.4 Khả dụng (Availability)

| Mã | Mô tả |
|---|---|
| **NFR15** | Hệ thống PHẢI đạt uptime ≥ 99% trong giai đoạn vận hành thử nghiệm (phụ thuộc Vercel + Supabase SLA). |
| **NFR16** | Khi gặp lỗi nghiệp vụ, hệ thống PHẢI hiển thị thông báo rõ ràng cho người dùng bằng tiếng Việt, không để lộ stack trace. |

### 3.5 Khả năng bảo trì

| Mã | Mô tả |
|---|---|
| **NFR17** | Mã nguồn PHẢI được viết bằng TypeScript với `strict: true`. Không có `any` ngoại trừ các trường hợp bất khả kháng có comment giải thích. |
| **NFR18** | Mọi thay đổi schema DB PHẢI đi kèm file migration có version rõ ràng trong thư mục `supabase/migrations/`. |
| **NFR19** | Cấu trúc thư mục code PHẢI tuân theo convention Next.js App Router: `src/app/`, `src/components/`, `src/lib/`, `src/types/`. |
| **NFR20** | Mỗi file TypeScript không được vượt quá 400 dòng. Nếu vượt, PHẢI tách thành nhiều module nhỏ. |

### 3.6 Tính khả dụng UX

| Mã | Mô tả |
|---|---|
| **NFR21** | Giao diện PHẢI responsive, hiển thị tốt trên thiết bị với kích thước màn hình ≥ 360px. |
| **NFR22** | Giao diện PHẢI hỗ trợ dark mode thông qua `next-themes`. |
| **NFR23** | Mọi form PHẢI hiển thị validation error rõ ràng ngay bên dưới field tương ứng. |
| **NFR24** | Các tương tác mất > 1 giây PHẢI hiển thị loading state (spinner, skeleton). |

### 3.7 Khả năng kiểm thử

| Mã | Mô tả |
|---|---|
| **NFR25** | Các API route critical (auth, contest registration, submission upload) PHẢI có thể test thủ công qua Postman/Thunder Client với documentation rõ ràng. |
| **NFR26** | Hệ thống PHẢI có môi trường staging riêng biệt với môi trường production trước khi go-live. |

### 3.8 Tuân thủ & Pháp lý

| Mã | Mô tả |
|---|---|
| **NFR27** | Hệ thống PHẢI hiển thị thông báo về việc sử dụng dữ liệu người dùng (tương đương GDPR-lite) khi user đăng nhập lần đầu. |
| **NFR28** | Hệ thống PHẢI cho phép người dùng xóa tài khoản của mình. Khi xóa, mọi dữ liệu cá nhân trong `public.users` bị xóa cascade. |
| **NFR29** | File nộp bài của thí sinh PHẢI được lưu trữ ít nhất 6 tháng sau khi cuộc thi kết thúc (mục đích lưu trữ kết quả). |

### 3.9 Chi phí & Hạ tầng

| Mã | Mô tả |
|---|---|
| **NFR30** | MVP PHẢI vận hành được trên Supabase free tier và Vercel hobby tier. |
| **NFR31** | Tổng dung lượng Storage sử dụng trong MVP PHẢI giữ dưới 500 MB (để trong giới hạn free tier Supabase). Đây là lý do KHÔNG cho phép upload avatar người dùng. |

---

## 4. Ma trận truy vết (Traceability Matrix — tóm tắt)

| Mô-đun | Yêu cầu chính | Schema liên quan | Endpoint / UI liên quan |
|---|---|---|---|
| AUTH | FR_AUTH_01–09 | `auth.users`, `public.users`, trigger `handle_new_auth_user` | `/auth`, GIS popup + `signInWithIdToken`, `src/proxy.ts` |
| USER | FR_USER_01–06 | `public.users` | `/profile`, API `PATCH /api/users/me` |
| POST | FR_POST_01–08 | `public.post`, `public.tag`, `public.post_tags` | `/`, `/post/[slug]`, `/tag/[slug]` |
| CMS | FR_CMS_01–09 | `public.post`, `public.tag` | `/admin/posts`, `/admin/tags` |
| CONTEST | FR_CONTEST_01–13 | `public.contest` | `/admin/contests`, `/contests`, `/contests/[slug]` |
| REG | FR_REG_01–07 | `public.contest_registration`, `public.registration_member` | API `POST /api/contests/[slug]/register` |
| SUB | FR_SUB_01–08 | `public.submission`, Storage `submissions` | API `POST /api/submissions` |
| STOR | FR_STOR_01–04 | Supabase Storage `post-images`, `submissions` | Storage RLS policies |

---

## 5. Phê duyệt

| Vai trò | Tên | Ngày |
|---|---|---|
| Project Manager | Ngô Tiến Sỹ | ___/___/2026 |
| Technical Reviewer | — | ___/___/2026 |
