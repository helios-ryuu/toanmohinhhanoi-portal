# Báo cáo tổng kết dự án
# Trang web portal Toán Mô Hình Hà Nội

**Mã dự án:** TMH-PORTAL-2026
**Project Manager:** Ngô Tiến Sỹ
**Thời gian thực hiện:** 07/02/2026 — 30/04/2026
**Phiên bản báo cáo:** 0.1 (Outline)
**Ngày lập:** 10/04/2026

---

## Lời giới thiệu

Báo cáo này tổng kết quá trình phân tích, thiết kế, hiện thực và kiểm thử dự án **Trang web portal Toán Mô Hình Hà Nội (TMH-PORTAL-2026)** — một nền tảng trực tuyến phục vụ cộng đồng học sinh, sinh viên và những người quan tâm đến lĩnh vực Toán Mô Hình tại Hà Nội. Hệ thống được xây dựng trong 12 tuần với ba mục tiêu cốt lõi: (1) phát hành nội dung tập trung, (2) quản lý cuộc thi end-to-end, và (3) quản trị nội dung qua giao diện CMS nội bộ.

Tài liệu hướng tới các đối tượng: hội đồng phê duyệt, người bàn giao tiếp nhận hệ thống, và các nhà phát triển sẽ mở rộng dự án ở giai đoạn 2.

---

## Mục lục

1. Chương 1 — Giới thiệu dự án
2. Chương 2 — Phân tích và thiết kế hệ thống
3. Chương 3 — Hiện thực hệ thống
4. Chương 4 — Kiểm thử
5. Chương 5 — Kết luận và bàn giao
6. Phụ lục

*(Sẽ cập nhật số trang khi hoàn thiện báo cáo.)*

---

## Danh mục từ viết tắt

| Viết tắt | Ý nghĩa |
|---|---|
| **TMH** | Toán Mô Hình |
| **PM** | Project Manager |
| **MVP** | Minimum Viable Product |
| **CMS** | Content Management System |
| **CSDL** | Cơ sở dữ liệu |
| **DB** | Database |
| **FR** | Functional Requirement — Yêu cầu chức năng |
| **NFR** | Non-Functional Requirement — Yêu cầu phi chức năng |
| **UC** | Use Case |
| **ERD** | Entity Relationship Diagram — Lược đồ quan hệ thực thể |
| **RLS** | Row Level Security |
| **JWT** | JSON Web Token |
| **OAuth** | Open Authorization |
| **API** | Application Programming Interface |
| **UI / UX** | User Interface / User Experience |
| **SSR** | Server-Side Rendering |
| **MDX** | Markdown + JSX |
| **SLA** | Service Level Agreement |
| **LCP** | Largest Contentful Paint |
| **3NF** | Third Normal Form |

---

## Tóm tắt (Executive Summary)

Dự án xây dựng thành công một portal cộng đồng với kiến trúc **Next.js 16 (App Router) + Supabase** (PostgreSQL, Auth, Storage), vận hành được trên hạ tầng miễn phí của Vercel và Supabase. Hệ thống cung cấp:

- **Authentication** duy nhất qua Google OAuth, tự động tạo profile người dùng qua database trigger.
- **CMS** cho admin đăng bài viết (MDX), quản lý tag, quản lý cuộc thi.
- **Public blog** với lọc theo tag/category, tìm kiếm cơ bản.
- **Contest backend hoàn chỉnh**: API đăng ký (cá nhân/đội), nộp file qua Supabase Storage, với Row Level Security đầy đủ ở cả tầng DB và Storage.
- **Contest UI tối giản** ("Under Development") — backend sẵn sàng, frontend đăng ký/nộp bài sẽ hoàn thiện ở giai đoạn 2.

Các con số chính *(cập nhật khi hoàn thiện)*:

| Chỉ số | Giá trị |
|---|---|
| Tổng số yêu cầu chức năng (FR) | *TBD* |
| Tổng số yêu cầu phi chức năng (NFR) | *TBD* |
| Số bảng trong CSDL | 8 (chưa tính `auth.*`) |
| Số Use Case chính | *TBD* |
| Số API endpoint | *TBD* |
| Số trang (page) | *TBD* |
| LCP trang chủ | *TBD* (mục tiêu < 2.5 s) |

---

## Chương 1 — Giới thiệu dự án

### 1.1 Bối cảnh và lý do thực hiện

Cộng đồng Toán Mô Hình Hà Nội hiện vận hành phân tán qua các kênh thông tin không chính thức (mạng xã hội, nhóm chat, email), dẫn tới bốn vấn đề chính:

- Tin tức thiếu tập trung, khó tra cứu lại.
- Quy trình tổ chức cuộc thi thủ công (Google Form + email + Google Sheet), dễ nhầm lẫn.
- Không có kho nội dung học thuật có cấu trúc.
- Thiếu bản sắc thương hiệu và "địa chỉ chính thức" trên Internet.

Dự án được khởi động để giải quyết các vấn đề trên bằng một nền tảng tập trung, duy trì chi phí thấp phù hợp với nguồn lực cộng đồng.

### 1.2 Mục tiêu dự án

1. **Phát hành nội dung**: Đăng tin tức, thông báo, bài viết kiến thức có tổ chức và dễ truy cập.
2. **Quản lý cuộc thi**: Cung cấp hạ tầng đầy đủ từ đăng ký đến nộp bài điện tử.
3. **Quản trị tập trung**: CMS cho admin, không cần can thiệp trực tiếp vào DB.
4. **Chi phí vận hành thấp**: Hoạt động được trên Supabase free tier + Vercel hobby.

### 1.3 Phạm vi dự án (Scope)

#### 1.3.1 In Scope (MVP)

| # | Mô-đun | Chi tiết |
|---|---|---|
| S1 | Authentication | Google OAuth duy nhất; form email auto-chuyển hướng sang Google |
| S2 | User Profile | Thông tin văn bản (username, display_name, bio, school); không avatar |
| S3 | CMS — News | Đăng/sửa/xóa bài viết MDX, tag, publish/unpublish, upload ảnh bìa |
| S4 | Public Blog | Trang chủ, chi tiết, lọc tag/category, tìm kiếm cơ bản |
| S5 | Contest — Backend đầy đủ | API contest, registration, submission + RLS |
| S6 | Contest — Frontend tối giản | UI "Under Development" cho đăng ký/nộp bài |
| S7 | Storage | `post-images` (public), `submissions` (private) |
| S8 | Admin Dashboard | Quản lý bài viết, tag, cuộc thi, danh sách đăng ký |

#### 1.3.2 Out of Scope

- UI đăng ký cuộc thi và nộp bài hoàn thiện cho thí sinh (giai đoạn 2).
- Hệ thống chấm điểm và xếp hạng.
- Thông báo email tự động.
- Upload avatar / ảnh bìa profile.
- Bình luận, tương tác xã hội.
- Ứng dụng mobile native.
- Đa ngôn ngữ.

### 1.4 Các bên liên quan

| Vai trò | Tên | Trách nhiệm |
|---|---|---|
| Project Manager | Ngô Tiến Sỹ | Toàn quyền scope, timeline, kỹ thuật |
| Sponsor | Cộng đồng TMH Hà Nội | Cung cấp yêu cầu, phản hồi, go/no-go |
| End users | Thí sinh, Admin, Độc giả | Phản hồi UAT, sử dụng sản phẩm |

### 1.5 Lịch biểu (Timeline)

| Mốc | Giai đoạn | Thời gian |
|---|---|---|
| M0 | Khởi động & Thiết kế | 07/02 — 14/02 |
| M1 | Hạ tầng & Authentication | 15/02 — 28/02 |
| M2 | CMS & Public Blog | 01/03 — 21/03 |
| M3 | Contest Backend | 22/03 — 11/04 |
| M4 | Contest UI & Polish | 12/04 — 22/04 |
| M5 | Testing & Go-live | 23/04 — 30/04 |

*(Chi tiết trong Project Charter mục 6.)*

---

## Chương 2 — Phân tích và thiết kế hệ thống

### 2.1 Tổng hợp yêu cầu

#### 2.1.1 Yêu cầu chức năng (Functional Requirements)

Các yêu cầu chức năng được đánh mã theo quy ước `FR_{MODULE}_{SEQ}` và chia thành 9 mô-đun:

| Mã | Mô-đun | Số yêu cầu |
|---|---|---|
| AUTH | Xác thực người dùng | 9 |
| USER | Quản lý profile | 6 |
| POST | Bài viết công khai | 8 |
| CMS | Quản trị nội dung | 9 |
| CONTEST | Cuộc thi (admin + public) | 13 |
| REG | Đăng ký cuộc thi | 7 |
| SUB | Nộp bài | 8 |
| STOR | Lưu trữ file | 4 |

*(Danh sách đầy đủ: xem [REQUIREMENTS.md §2](./REQUIREMENTS.md).)*

#### 2.1.2 Yêu cầu phi chức năng (Non-Functional)

Tổng cộng 31 NFR chia thành 9 nhóm: Hiệu năng, Bảo mật, Khả năng mở rộng, Khả dụng, Khả năng bảo trì, Tính khả dụng UX, Khả năng kiểm thử, Tuân thủ & Pháp lý, Chi phí & Hạ tầng.

*(Chi tiết: xem [REQUIREMENTS.md §3](./REQUIREMENTS.md).)*

### 2.2 Danh sách Use Case

Các Use Case chính được mô tả chi tiết trong [PROCESSES.md](./PROCESSES.md):

#### Nhóm Authentication

| Mã | Tên Use Case | Actor chính |
|---|---|---|
| UC-AUTH-01 | Đăng nhập Google lần đầu & tạo profile | User (ẩn danh) |
| UC-AUTH-02 | Đăng nhập Google lần sau | User đã có profile |
| UC-AUTH-03 | Đăng xuất | User đã đăng nhập |
| UC-USER-01 | Cập nhật profile | User đã đăng nhập |

#### Nhóm Content Management

| Mã | Tên Use Case | Actor |
|---|---|---|
| UC-CMS-01 | Admin đăng bài viết mới | Admin |
| UC-CMS-02 | Admin publish / unpublish | Admin |
| UC-CMS-03 | Admin xóa bài viết | Admin |
| UC-CMS-04 | Quản lý Tag | Admin |

#### Nhóm Contest

| Mã | Tên Use Case | Actor |
|---|---|---|
| UC-CONTEST-01 | Admin tạo cuộc thi mới | Admin |
| UC-REG-01 | User đăng ký tham gia | User đã đăng nhập |
| UC-REG-02 | Admin phê duyệt / từ chối đăng ký | Admin |
| UC-SUB-01 | User nộp file bài thi | Thành viên registration approved |
| UC-SUB-02 | User / Admin tải file bài nộp | Thành viên / Admin |

### 2.3 Lược đồ Use Case (Use Case Diagram)

*(Chèn hình: `docs/diagrams/usecase.png` — vẽ bằng PlantUML/draw.io. Bố cục: hai actor chính `User` và `Admin`; các UC gom vào ba package: Authentication, Content, Contest.)*

### 2.4 Lược đồ phân rã chức năng (Functional Decomposition)

*(Chèn hình: `docs/diagrams/decomposition.png`. Cấu trúc cây 3 cấp:)*

```
TMH Portal
├── Authentication
│   ├── Google Login
│   ├── Profile Sync (trigger)
│   └── Logout
├── Content Management
│   ├── Public Blog
│   │   ├── Homepage list
│   │   ├── Post detail
│   │   ├── Filter by tag/category
│   │   └── Search
│   └── Admin CMS
│       ├── Post CRUD
│       ├── Tag CRUD
│       └── Image upload
└── Contest
    ├── Admin
    │   ├── Contest CRUD
    │   ├── Registration review
    │   └── Submission download
    └── User
        ├── Browse contests
        ├── Register (individual / team)
        └── Upload submission
```

### 2.5 Thiết kế Cơ sở dữ liệu

#### 2.5.1 Tổng quan kiến trúc dữ liệu

Dự án sử dụng Supabase với ba thành phần: **Auth** (`auth.*`, Supabase managed), **PostgreSQL Public** (`public.*`, nghiệp vụ), và **Storage** (buckets `post-images`, `submissions`). Ranh giới giữa `auth.users` và `public.users` được kết nối qua trigger `trg_on_auth_user_created`.

#### 2.5.2 Danh sách bảng

| Bảng | Mục đích |
|---|---|
| `public.users` | Profile người dùng, FK tới `auth.users` |
| `public.post` | Bài viết / tin tức (không có author, không có series) |
| `public.tag` | Nhãn phân loại bài viết |
| `public.post_tags` | M:N post ↔ tag |
| `public.contest` | Cuộc thi |
| `public.contest_registration` | Mỗi đăng ký (cá nhân hoặc đội) |
| `public.registration_member` | Thành viên của một đăng ký |
| `public.submission` | File bài nộp |

#### 2.5.3 Lược đồ quan hệ thực thể (ERD)

*(Chèn hình: `docs/diagrams/erd.png`. Tóm tắt quan hệ:)*

```
auth.users ──1:1── public.users ──1:N── registration_member ──N:1── contest_registration ──N:1── contest
                                                                                │ 1
                                                                                └──1:N── submission

public.post ──N:M── public.post_tags ──N:M── public.tag
```

*(Schema SQL đầy đủ: [SCHEMA.md](./SCHEMA.md).)*

#### 2.5.4 Các ràng buộc nghiệp vụ chính

- `post_publish_check`: `published=true` ⇔ `published_at IS NOT NULL`.
- `contest_date_order_check`: `registration_start < registration_end ≤ contest_start < contest_end ≤ submission_deadline`.
- `contest_team_size_check`: `individual ⇒ max_team_size=1`; `team`/`both` ⇒ `max_team_size ≥ 2`.
- Một user chỉ có một đăng ký cho mỗi contest (enforce ở tầng application + unique index đề xuất).
- Mỗi registration có đúng một `leader`.

#### 2.5.5 Chính sách bảo mật hàng (RLS)

Mọi bảng `public.*` bật RLS. Các policy chính:

- `post`: public read những bài `published=true`; write chỉ qua service role.
- `contest`: public read khi `status ≠ draft`.
- `contest_registration` & `registration_member`: user chỉ đọc được bản ghi mình tham gia.
- `submission`: thành viên registration đọc/ghi bài của nhóm mình; admin full access qua service role.

### 2.6 Thiết kế giao diện người dùng

*(Chèn wireframe các trang chính: Home, Post Detail, Admin Dashboard, Contest List, Contest Detail. Có thể chụp screenshot thực tế khi UI hoàn thiện.)*

---

## Chương 3 — Hiện thực hệ thống

### 3.1 Stack công nghệ

| Tầng | Công nghệ | Lý do lựa chọn |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Full-stack TypeScript, deploy zero-config trên Vercel |
| Ngôn ngữ | **TypeScript 5** (strict) | Type-safety, giảm bug runtime |
| UI | **React 19**, **Tailwind CSS 4**, **shadcn/ui**, **Radix UI** | Component có sẵn, không cần designer |
| Database | **Supabase PostgreSQL** | SQL mạnh, RLS built-in, free tier |
| Auth | **Supabase Auth** (Google OAuth) | Tích hợp sẵn, không tự build |
| Storage | **Supabase Storage** | Cùng hệ sinh thái, RLS thống nhất |
| Content | **MDX** qua `next-mdx-remote` | Nhúng React component trong bài viết |
| Deploy | **Vercel** + **Supabase Cloud** | Free tier, zero-config |
| VCS | Git + GitHub | Chuẩn công nghiệp |

### 3.2 Kiến trúc tổng thể

#### 3.2.1 Sơ đồ kiến trúc

```
┌──────────────────────────────────────────────────────┐
│  Browser (React 19 + Tailwind + shadcn/ui)          │
└─────────────────────┬────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼────────────────────────────────┐
│  Next.js 16 App Router (Vercel)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Pages /     │  │  API Routes  │  │ Middleware │ │
│  │  Server      │  │  /api/*      │  │ (JWT check)│ │
│  │  Components  │  │              │  │            │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                │        │
│         └────┬────────────┘                │        │
│              ▼                              │        │
│  ┌──────────────────────┐                   │        │
│  │  src/lib/            │                   │        │
│  │   - supabase/server  │◄──────────────────┘        │
│  │   - supabase/client  │                            │
│  │   - posts-db.ts      │                            │
│  │   - contests-db.ts   │                            │
│  │   - users-db.ts      │                            │
│  └──────────┬───────────┘                            │
└─────────────┼────────────────────────────────────────┘
              │ Supabase JS SDK
┌─────────────▼────────────────────────────────────────┐
│  Supabase Cloud                                      │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Auth     │  │ PostgreSQL  │  │ Storage        │  │
│  │ (OAuth)  │  │ (RLS)       │  │ - post-images  │  │
│  │          │  │ + triggers  │  │ - submissions  │  │
│  └──────────┘  └─────────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────┘
```

#### 3.2.2 Các tầng chính

1. **Presentation Layer** — Pages & Components (`src/app/`, `src/components/`).
2. **API Layer** — Route handlers (`src/app/api/*/route.ts`) trả về format nhất quán `{ success, data?, message? }`.
3. **Data Access Layer** — Helpers trong `src/lib/*-db.ts` đóng gói truy vấn Supabase.
4. **Cross-cutting** — Middleware JWT, caching (`unstable_cache`), contexts (`UserContext`, `SidebarContext`).

### 3.3 Cấu trúc thư mục

```
src/
├── app/                 # App Router pages + API routes
│   ├── (public)/        # Home, post, tag, contest
│   ├── admin/           # Admin CMS
│   ├── profile/
│   └── api/             # Route handlers
├── components/
│   ├── layout/          # Header, Sidebar, Footer
│   └── features/        # post/, admin/, ui/
├── lib/
│   ├── supabase/        # server.ts, client.ts
│   ├── posts-db.ts
│   ├── contests-db.ts
│   ├── users-db.ts
│   └── api-helpers.ts   # revalidatePosts, …
├── contexts/
├── types/
│   └── database.ts
└── proxy.ts              # Next.js 16 proxy (thay thế middleware)
```

### 3.4 Các mô-đun hiện thực chính

#### 3.4.1 Mô-đun Authentication

- Provider: Supabase Auth với Google OAuth duy nhất.
- Profile sync: trigger SQL `handle_new_auth_user()` tự sinh `username` từ email prefix, xử lý trùng bằng hậu tố số.
- Session: lưu trong cookie SameSite, `src/proxy.ts` (Next.js 16 proxy) kiểm tra session trên các route bảo vệ (`/profile`, `/admin`, `/contest-management`, `/api/admin/*`, `/api/contests/*/register`, `/api/submissions/*`).
- Form đăng nhập: khi user focus ô email (nếu còn từ form cũ), hiển thị hint chuyển sang nút Google.

#### 3.4.2 Mô-đun CMS — Bài viết

- Tạo/sửa/xóa bài viết, quản lý tag, publish/unpublish.
- Upload ảnh bìa qua API server → bucket `post-images`.
- Invalidation: `revalidateTag('posts')` sau mỗi mutation.
- Bài viết **không có** author và **không thuộc series**.

#### 3.4.3 Mô-đun Public Blog

- Homepage: danh sách mới nhất theo `published_at DESC`, chỉ `published=true`.
- Post detail: render MDX qua `next-mdx-remote` với allowlist component.
- Lọc theo tag / category, tìm kiếm cơ bản theo `title`/`description`.

#### 3.4.4 Mô-đun Contest

- CRUD contest ở admin, validate toàn bộ ràng buộc thời gian & team size ở cả DB (`CHECK`) và application layer.
- API đăng ký: POST `/api/contests/{slug}/register`, xử lý transaction `INSERT contest_registration` + `INSERT registration_member`.
- API nộp bài: validate quyền → upload Storage → `INSERT submission` → xử lý `is_final`.
- Rollback Storage nếu DB fail (tránh file mồ côi).

#### 3.4.5 Mô-đun Storage

- Bucket `post-images` (public read, admin write).
- Bucket `submissions` (private, RLS theo `registration_member`).
- Download qua signed URL có TTL ngắn.

### 3.5 Các quyết định thiết kế đáng chú ý

| Quyết định | Lý do |
|---|---|
| Bỏ bảng `author` | Bài viết thuộc về tổ chức, không gắn cá nhân → đơn giản schema |
| Bỏ bảng `series` | Nội dung MVP là các bài đơn lẻ |
| Không cho upload avatar | Tiết kiệm storage, giữ trong free tier |
| Dùng trigger thay vì code app để sync profile | Đảm bảo atomicity, không phụ thuộc thứ tự gọi API |
| Contest UI "Under Development" | Backend đã sẵn sàng nhưng UI tối giản để đảm bảo deadline |
| `unstable_cache` + `revalidateTag` | Giảm query DB trùng lặp, phù hợp free tier |

---

## Chương 4 — Kiểm thử

### 4.1 Chiến lược kiểm thử

Do ràng buộc nguồn lực (PM kiêm dev), kiểm thử dự án tập trung vào:

- **Manual test** các luồng chính với checklist trong môi trường staging.
- **API test** qua Postman / Thunder Client cho các endpoint critical.
- **RLS verification**: thử truy cập cross-user để xác nhận policy hoạt động.
- **Smoke test** cuối mỗi milestone trước khi merge về main.

*(Unit test tự động chưa có trong MVP — đề xuất cho giai đoạn 2.)*

### 4.2 Môi trường kiểm thử

| Môi trường | Mô tả |
|---|---|
| **Local** | Next.js dev server (port 3456), Supabase local hoặc shared dev project |
| **Staging** | Vercel preview branch + Supabase staging project riêng |
| **Production** | Vercel production + Supabase production project |

### 4.3 Các test case đề xuất

#### 4.3.1 Authentication

| ID | Test Case | Input | Expected |
|---|---|---|---|
| TC-AUTH-01 | Đăng nhập Google lần đầu | Click "Đăng nhập Google" với tài khoản chưa có | Tạo `auth.users` + `public.users`; redirect về `/` |
| TC-AUTH-02 | Trigger tạo username trùng | Đăng nhập 2 tài khoản cùng email prefix | Username thứ 2 có hậu tố `1` |
| TC-AUTH-03 | Đăng nhập lần 2 | User đã có profile | Không tạo row mới; session được refresh |
| TC-AUTH-04 | Hủy ở Google | Click hủy ở GIS popup | Popup đóng, user vẫn ở `/auth`; không tạo row |
| TC-AUTH-05 | Truy cập route bảo vệ khi chưa login | GET `/admin` | Redirect về `/auth` |
| TC-AUTH-06 | Đăng xuất | Click "Đăng xuất" | Cookie bị xóa; redirect về `/` |
| TC-AUTH-07 | Non-admin truy cập `/admin` | User có role `user` | 403 hoặc redirect |

#### 4.3.2 Profile

| ID | Test Case | Input | Expected |
|---|---|---|---|
| TC-USER-01 | Update profile hợp lệ | `display_name`, `bio`, `school` trong giới hạn | 200 OK, DB cập nhật, `updated_at` refresh |
| TC-USER-02 | `bio` > 500 ký tự | Chuỗi 501 ký tự | 400 validation error |
| TC-USER-03 | Update profile người khác | PATCH với `id` khác auth.uid() | 403, không chạm DB |
| TC-USER-04 | Username readonly | PATCH với field `username` | Trường username bị bỏ qua |

#### 4.3.3 CMS — Bài viết

| ID | Test Case | Expected |
|---|---|---|
| TC-CMS-01 | Tạo bài viết draft | `INSERT post`, `published=false`, `published_at=null` |
| TC-CMS-02 | Publish bài viết | `published=true`, `published_at=now()` |
| TC-CMS-03 | Slug trùng | 409 Conflict |
| TC-CMS-04 | Gán 3 tag | 3 bản ghi `post_tags` |
| TC-CMS-05 | Xóa bài viết | `post_tags` liên quan bị cascade |
| TC-CMS-06 | Upload ảnh bìa > 5MB | 400 (tùy cấu hình) |
| TC-CMS-07 | MDX chứa script độc hại | Bị sanitize / không render |
| TC-CMS-08 | Category không hợp lệ | 400, constraint DB chặn |

#### 4.3.4 Public Blog

| ID | Test Case | Expected |
|---|---|---|
| TC-POST-01 | Homepage list | Chỉ bài `published=true`, sort `published_at DESC` |
| TC-POST-02 | Truy cập bài draft qua URL | 404 |
| TC-POST-03 | Filter theo tag | Chỉ các bài có tag đó |
| TC-POST-04 | Search theo title | Kết quả khớp |
| TC-POST-05 | LCP trang chủ | < 2.5s trên 4G |

#### 4.3.5 Contest — Admin

| ID | Test Case | Expected |
|---|---|---|
| TC-CONTEST-01 | Tạo contest hợp lệ | `INSERT contest` thành công |
| TC-CONTEST-02 | Date không đúng thứ tự | 400, constraint `contest_date_order_check` |
| TC-CONTEST-03 | `individual` + `max_team_size=3` | 400, constraint `contest_team_size_check` |
| TC-CONTEST-04 | Contest `draft` trên public list | Không hiển thị |
| TC-CONTEST-05 | Xóa contest | Cascade xóa registrations + submissions |

#### 4.3.6 Registration (API)

| ID | Test Case | Expected |
|---|---|---|
| TC-REG-01 | Đăng ký cá nhân trong cửa sổ | `INSERT registration` + `registration_member` (leader) |
| TC-REG-02 | Đăng ký khi `status=draft` | 409 |
| TC-REG-03 | Đăng ký ngoài cửa sổ | 409 `registration_closed` |
| TC-REG-04 | Đăng ký team quá `max_team_size` | 400 `team_too_large` |
| TC-REG-05 | Đăng ký lần 2 cùng contest | 409 `already_registered` |
| TC-REG-06 | Admin approve đăng ký | `status='approved'`, `updated_at` refresh |

#### 4.3.7 Submission (API)

| ID | Test Case | Expected |
|---|---|---|
| TC-SUB-01 | Upload file hợp lệ trước deadline | File trong Storage, `INSERT submission` |
| TC-SUB-02 | Upload sau `submission_deadline` | 403 `deadline_passed` |
| TC-SUB-03 | Upload > 50MB | 413 |
| TC-SUB-04 | Upload MIME không allowlist | 400 |
| TC-SUB-05 | Upload từ user không phải thành viên | 403, RLS chặn |
| TC-SUB-06 | Đánh dấu bản mới là final | Bản cũ tự động `is_final=false` |
| TC-SUB-07 | Download bởi thành viên | Signed URL hợp lệ |
| TC-SUB-08 | Download bởi user ngoài đội | 403 |
| TC-SUB-09 | Rollback khi DB fail sau upload Storage | File Storage bị xóa |

### 4.4 Kết quả kiểm thử

*(Điền khi hoàn thành test run cuối kỳ. Format đề xuất:)*

| Nhóm | Tổng TC | Pass | Fail | Blocked | Ghi chú |
|---|---|---|---|---|---|
| Authentication | 7 | — | — | — | |
| Profile | 4 | — | — | — | |
| CMS | 8 | — | — | — | |
| Public Blog | 5 | — | — | — | |
| Contest Admin | 5 | — | — | — | |
| Registration | 6 | — | — | — | |
| Submission | 9 | — | — | — | |
| **Tổng** | **44** | — | — | — | |

---

## Chương 5 — Kết luận và bàn giao

### 5.1 Đánh giá kết quả đạt được

*(Điền cuối dự án.)*

Đối chiếu với mục tiêu ban đầu:

| Mục tiêu | Trạng thái | Ghi chú |
|---|---|---|
| Phát hành nội dung tập trung | *TBD* | |
| Quản lý cuộc thi end-to-end | *TBD* | Backend hoàn chỉnh, UI ở chế độ "Under Development" theo kế hoạch |
| CMS nội bộ cho admin | *TBD* | |
| Vận hành trong free tier | *TBD* | |

### 5.2 Những điểm chưa hoàn thiện

- UI đăng ký cuộc thi và nộp bài cho thí sinh (thuộc Out of Scope MVP, sẽ làm ở giai đoạn 2).
- Hệ thống chấm điểm, xếp hạng.
- Thông báo email tự động.
- Unit test tự động.
- *(cập nhật thêm nếu có)*

### 5.3 Bài học kinh nghiệm

*(Điền cuối dự án. Gợi ý các nhóm: scope control, lựa chọn stack, phối hợp một-người-nhiều-vai, test trên free tier, v.v.)*

### 5.4 Hướng phát triển tương lai (Giai đoạn 2)

1. Hoàn thiện UI đăng ký/nộp bài cho thí sinh (frontend của API đã có).
2. Hệ thống chấm điểm & bảng xếp hạng.
3. Email notification (đăng ký thành công, deadline reminder).
4. Bình luận / tương tác trên bài viết.
5. Upload avatar (khi ngân sách cho phép nâng tier).
6. Đa ngôn ngữ (Việt / Anh).
7. Unit test + E2E test (Playwright).
8. Observability: Sentry, Supabase logs dashboard.

### 5.5 Bàn giao

#### 5.5.1 Các hạng mục bàn giao (Deliverables)

| # | Hạng mục | Định dạng | Vị trí |
|---|---|---|---|
| 1 | Mã nguồn | Git repo | GitHub |
| 2 | Database schema + migrations | SQL files | `supabase/migrations/` |
| 3 | Project Charter | Markdown | [docs/PROJECT_CHARTER.md](./PROJECT_CHARTER.md) |
| 4 | Requirements Spec | Markdown | [docs/REQUIREMENTS.md](./REQUIREMENTS.md) |
| 5 | Schema documentation | Markdown | [docs/SCHEMA.md](./SCHEMA.md) |
| 6 | Process / Workflow spec | Markdown | [docs/PROCESSES.md](./PROCESSES.md) |
| 7 | Báo cáo tổng kết (tài liệu này) | Markdown | [docs/REPORT.md](./REPORT.md) |
| 8 | Tài liệu vận hành admin | Markdown | *TBD* — `docs/ADMIN_GUIDE.md` |
| 9 | Hướng dẫn deploy | Markdown | *TBD* — `docs/DEPLOYMENT.md` |
| 10 | URL production | URL | *TBD* |

#### 5.5.2 Danh sách tài khoản & credentials

*(Bàn giao riêng qua kênh an toàn — KHÔNG ghi vào tài liệu này.)*

- Supabase project owner
- Vercel project owner
- Google OAuth client credentials
- Admin account mặc định
- Database connection strings

#### 5.5.3 Checklist nghiệm thu

- [ ] Tất cả FR ưu tiên MUST đã hoàn thành và test pass.
- [ ] Tất cả NFR được xác nhận (performance, security, cost).
- [ ] Schema DB đúng với [SCHEMA.md](./SCHEMA.md); RLS bật trên mọi bảng.
- [ ] Staging & production tách biệt.
- [ ] Admin dashboard vận hành được toàn bộ luồng CMS.
- [ ] Tài liệu vận hành admin đã bàn giao.
- [ ] Go-live đã thực hiện; URL production hoạt động.

---

## Phụ lục

### Phụ lục A — Danh sách API endpoint

*(Điền khi hoàn thiện. Gợi ý cột: Method, Path, Mô tả, Auth, FR liên quan.)*

### Phụ lục B — Ma trận truy vết (Traceability Matrix)

*(Xem [REQUIREMENTS.md §4](./REQUIREMENTS.md).)*

### Phụ lục C — Schema SQL đầy đủ

*(Xem [SCHEMA.md](./SCHEMA.md).)*

### Phụ lục D — Tham chiếu

- [PROJECT_CHARTER.md](./PROJECT_CHARTER.md)
- [REQUIREMENTS.md](./REQUIREMENTS.md)
- [SCHEMA.md](./SCHEMA.md)
- [PROCESSES.md](./PROCESSES.md)
- Next.js 16 docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs

---

## Phê duyệt báo cáo

| Vai trò | Tên | Ngày | Chữ ký |
|---|---|---|---|
| Project Manager | Ngô Tiến Sỹ | ___/___/2026 | _______________ |
| Đại diện tiếp nhận | — | ___/___/2026 | _______________ |
