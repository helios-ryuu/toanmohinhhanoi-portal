# Project Charter — Trang web portal Toán Mô Hình Hà Nội

---

## 1. Project Overview

| Thuộc tính | Chi tiết |
|---|---|
| **Tên dự án** | Trang web portal Toán Mô Hình Hà Nội |
| **Mã dự án** | TMH-PORTAL-2026 |
| **Project Manager** | Ngô Tiến Sỹ |
| **Ngày bắt đầu** | 07/02/2026 |
| **Ngày kết thúc dự kiến** | 30/04/2026 |
| **Tổng thời lượng** | 12 tuần (~3 tháng) |
| **Loại dự án** | Phát triển sản phẩm mới (Greenfield) |
| **Trạng thái** | M4 hoàn chỉnh — sẵn sàng nghiệm thu (cập nhật 28/04/2026) |

> **Cập nhật 28/04/2026.** Toàn bộ deliverables ở Milestones M0–M4 đã được hiện thực, bao gồm cả những hạng mục Contest UI mà charter ban đầu giữ ở mức "Under Development". Chi tiết xem `docs/PLAN-FINAL.md`. Riêng nút "Đăng ký tham gia" trên trang chi tiết cuộc thi cố ý disable theo FR_CONTEST_12 — backend đã sẵn sàng và sẽ được mở cho người dùng cuối ở giai đoạn enrollment.

---

## 2. Project Summary

Trang web portal Toán Mô Hình Hà Nội là nền tảng trực tuyến chính thức phục vụ cộng đồng học sinh, sinh viên và những người quan tâm đến lĩnh vực Toán Mô Hình tại Hà Nội. Hệ thống được xây dựng nhằm ba mục tiêu cốt lõi:

1. **Phát hành nội dung**: Đăng tải tin tức, thông báo, bài viết kiến thức và tài liệu học tập một cách có tổ chức và dễ truy cập.
2. **Quản lý cuộc thi**: Cung cấp hạ tầng đầy đủ để tổ chức các cuộc thi Toán Mô Hình — từ khâu đăng ký (cá nhân/đội nhóm), theo dõi tiến độ, cho đến nộp bài và chấm điểm.
3. **Quản trị tập trung**: Cung cấp giao diện CMS cho quản trị viên để quản lý nội dung và cuộc thi mà không cần can thiệp trực tiếp vào cơ sở dữ liệu.

Người dùng đăng nhập qua tài khoản Google và sở hữu một profile cá nhân tối giản (chỉ chứa thông tin văn bản, không lưu trữ media như ảnh đại diện hay ảnh bìa) nhằm tối ưu chi phí lưu trữ trong giai đoạn vận hành ban đầu.

---

## 3. Business Case

### 3.1 Vấn đề hiện tại

Cộng đồng Toán Mô Hình Hà Nội hiện vận hành phân tán qua các kênh thông tin không chính thức (mạng xã hội, nhóm chat, email). Điều này tạo ra một loạt vấn đề thực tế:

- **Tin tức thiếu tập trung**: Thông báo về các sự kiện, cuộc thi, kết quả thường bị trôi trên các nhóm Facebook/Zalo, khó tra cứu lại khi cần.
- **Quy trình tổ chức cuộc thi thủ công**: Ban tổ chức phải dùng Google Form để đăng ký, email để nộp bài, Google Sheet để theo dõi — gây tốn thời gian, dễ nhầm lẫn, không có trải nghiệm thống nhất cho thí sinh.
- **Không có kho nội dung học thuật có cấu trúc**: Các tài liệu kiến thức, hướng dẫn, đề bài mẫu bị phân mảnh và thường mất đi sau mỗi kỳ thi.
- **Thiếu bản sắc thương hiệu**: Cộng đồng không có một "địa chỉ chính thức" trên Internet để khẳng định uy tín và thu hút thành viên mới.

### 3.2 Giải pháp hệ thống mang lại

Portal TMH giải quyết trực tiếp các vấn đề trên thông qua:

- **Một cổng thông tin duy nhất** cho tất cả tin tức, thông báo và nội dung học thuật, có tìm kiếm và phân loại theo chủ đề.
- **Hệ thống quản lý cuộc thi end-to-end**: Từ tạo cuộc thi, mở đăng ký (hỗ trợ cả cá nhân và đội nhóm), đến nộp bài điện tử với nhiều định dạng file — tất cả trong cùng một nền tảng.
- **Authentication tối giản** qua Google: Người dùng không cần nhớ mật khẩu, đăng ký chỉ với một cú click, giảm rào cản tham gia.
- **CMS nội bộ** cho admin: Ban tổ chức có thể xuất bản bài viết, quản lý cuộc thi, phê duyệt đăng ký mà không cần kiến thức kỹ thuật.

### 3.3 Lợi ích thực tế

| Nhóm lợi ích | Mô tả |
|---|---|
| **Vận hành** | Giảm ~70% thời gian thủ công trong khâu tổ chức cuộc thi (so với quy trình Google Form + Email hiện tại). |
| **Trải nghiệm thí sinh** | Quy trình đăng ký và nộp bài liền mạch trong cùng một nền tảng, không phải chuyển đổi giữa nhiều công cụ. |
| **Minh bạch** | Thông tin cuộc thi, danh sách đăng ký, thời hạn nộp bài đều được công khai và có thể tra cứu. |
| **Lưu trữ dài hạn** | Tin tức và tài liệu được lưu trữ có cấu trúc, không mất đi theo thời gian. |
| **Uy tín thương hiệu** | Có một trang chính thức giúp cộng đồng khẳng định tính chuyên nghiệp với các đối tác và nhà tài trợ. |
| **Chi phí thấp** | Kiến trúc Supabase + Next.js cho phép vận hành ở tier miễn phí hoặc chi phí rất thấp trong giai đoạn đầu. |

### 3.4 Người dùng mục tiêu

| Vai trò | Mô tả | Nhu cầu chính |
|---|---|---|
| **Thí sinh** (học sinh/sinh viên) | Người tham gia các cuộc thi Toán Mô Hình | Đăng ký cuộc thi, nộp bài, xem kết quả, đọc tài liệu |
| **Độc giả** | Người quan tâm đến Toán Mô Hình nhưng không tham gia thi | Đọc tin tức, tìm kiếm tài liệu |
| **Ban tổ chức (Admin)** | Thành viên vận hành cộng đồng | Đăng tin, tạo/quản lý cuộc thi, phê duyệt đăng ký, quản lý bài nộp |
| **Giáo viên/Cố vấn** | Người hướng dẫn đội thi | Tra cứu thông tin cuộc thi, theo dõi hạn nộp bài |

---

## 4. Scope

### 4.1 In Scope (MVP)

Phạm vi của MVP tập trung vào việc đưa hệ thống lên vận hành được với tập tính năng tối thiểu nhưng đầy đủ cho một kỳ thi thực tế.

| # | Mô-đun | Chi tiết MVP |
|---|---|---|
| **S1** | **Authentication** | Chỉ hỗ trợ Google OAuth. Form nhập email tự động chuyển hướng sang nút "Đăng nhập bằng Google". Không có luồng đăng ký/đăng nhập bằng mật khẩu. |
| **S2** | **User Profile** | Hiển thị và chỉnh sửa thông tin cá nhân (username, display name, school, bio). Không hỗ trợ upload avatar/ảnh bìa ở giai đoạn MVP để tiết kiệm storage. Profile tự động được tạo khi user đăng nhập Google lần đầu (qua DB trigger). |
| **S3** | **CMS — News** | Admin đăng/sửa/xóa bài viết tin tức với MDX content, gán tag, publish/unpublish. Hỗ trợ upload ảnh bìa cho bài viết. |
| **S4** | **Public Blog** | Trang chủ hiển thị tin tức mới nhất, trang chi tiết bài viết với MDX render, trang danh sách theo tag/category, tìm kiếm cơ bản. |
| **S5** | **Contest — Backend Complete** | API đầy đủ cho toàn bộ luồng cuộc thi: tạo/sửa cuộc thi, mở đăng ký (cá nhân/đội), nộp bài với Supabase Storage. Schema DB hoàn chỉnh và có RLS. |
| **S6** | **Contest — Frontend Minimal** | UI ở trạng thái "Under Development": trang danh sách cuộc thi và trang chi tiết hiển thị thông tin, nút "Coming Soon" cho các hành động đăng ký/nộp bài. Admin có thể tạo cuộc thi qua CMS. |
| **S7** | **Storage Integration** | Hai bucket: `post-images` (public) cho ảnh bìa bài viết, `submissions` (private) cho file nộp bài. RLS policies đầy đủ. |
| **S8** | **Admin Dashboard** | Trang admin tập trung: quản lý bài viết, quản lý tag, quản lý cuộc thi, xem danh sách đăng ký. |

### 4.2 Out of Scope (giai đoạn sau MVP)

Những hạng mục sau được chủ động loại khỏi MVP để đảm bảo tiến độ:

- Luồng thí sinh đăng ký cuộc thi và nộp bài qua UI (backend đã có, UI hoàn thiện ở giai đoạn 2).
- Hệ thống chấm điểm và xếp hạng.
- Thông báo qua email (registration confirmation, deadline reminder).
- Upload avatar người dùng và ảnh bìa profile.
- Bình luận, đánh giá, tương tác xã hội trên bài viết.
- Hệ thống vai trò (role) chi tiết — MVP chỉ có `user` và `admin`.
- Ứng dụng mobile native.
- Đa ngôn ngữ (MVP chỉ có tiếng Việt).

### 4.3 Giả định và Ràng buộc

**Giả định:**
- Tài khoản Supabase đã được tạo và ở tier miễn phí là đủ cho giai đoạn MVP.
- Admin có tối thiểu 1 người và được quản lý thủ công (cấp quyền qua cột `role` trong DB).
- Số lượng người dùng dự kiến < 1.000 trong giai đoạn MVP.

**Ràng buộc:**
- Không có ngân sách mua hạ tầng trả phí — phải tối ưu để vận hành trên free tier.
- PM đồng thời là developer chính — deadline 30/04/2026 là cố định.
- Không có designer chuyên trách — UI sử dụng thư viện có sẵn (shadcn/ui, Tailwind).

---

## 5. Tech Stack

| Tầng | Công nghệ | Lý do chọn |
|---|---|---|
| **Frontend + Backend** | Next.js 16 (App Router) | Full-stack framework, cho phép dùng chung code TypeScript cho cả server route và UI, triển khai dễ dàng lên Vercel. |
| **Ngôn ngữ** | TypeScript 5 | Đảm bảo type-safety cho cả FE và BE, giảm bug runtime. |
| **UI** | React 19, Tailwind CSS 4, shadcn/ui, Radix UI | Component có sẵn, tùy chỉnh nhanh, không cần designer chuyên. |
| **Database** | Supabase PostgreSQL | SQL mạnh, hỗ trợ RLS để bảo mật, miễn phí ở tier khởi đầu. |
| **Authentication** | Supabase Auth (Google OAuth provider) | Tích hợp sẵn với Supabase, không cần tự build, an toàn. |
| **Storage** | Supabase Storage | Cùng hệ sinh thái với DB và Auth, RLS policy thống nhất. |
| **Content** | MDX via `next-mdx-remote` | Cho phép viết bài với component React nhúng. |
| **Deployment** | Vercel (FE+BE) + Supabase Cloud (DB/Auth/Storage) | Zero-config, miễn phí giai đoạn đầu. |
| **Version Control** | Git + GitHub | Chuẩn công nghiệp. |

---

## 6. Milestones & Timeline

Dự án trải dài 12 tuần, chia thành 5 mốc chính. Timeline được thiết kế sao cho backend hoàn thành trước UI, và luôn có thời gian buffer cho test + fix bug cuối kỳ.

### 6.1 Bảng tiến độ tổng quan

| Mốc | Giai đoạn | Thời gian | Deliverable chính |
|---|---|---|---|
| **M0** | Khởi động & Thiết kế | 07/02 — 14/02/2026 (1 tuần) | Project Charter, Requirements, Schema DB, wireframe UI cơ bản |
| **M1** | Hạ tầng & Authentication | 15/02 — 28/02/2026 (2 tuần) | Setup Supabase, migration schema, Google OAuth flow, trigger đồng bộ users |
| **M2** | CMS & Public Blog | 01/03 — 21/03/2026 (3 tuần) | CMS quản lý bài viết, trang public blog, tag/category, ảnh bìa upload |
| **M3** | Contest Backend | 22/03 — 11/04/2026 (3 tuần) | API đầy đủ cho contest, registration, submission; RLS policies; admin CMS cho cuộc thi |
| **M4** | Contest UI (Minimal) & Polish | 12/04 — 22/04/2026 (~1.5 tuần) | UI danh sách/chi tiết cuộc thi (chế độ "Under Development"), hoàn thiện admin dashboard |
| **M5** | Testing, Bug-fix & Go-live | 23/04 — 30/04/2026 (~1 tuần) | Test end-to-end, sửa lỗi, deploy production, tài liệu vận hành |

### 6.2 Chi tiết từng Milestone

#### M0 — Khởi động & Thiết kế (07/02 — 14/02)
- [x] Xác định phạm vi, viết Project Charter
- [x] Phân tích Requirements (FR/NFR)
- [x] Thiết kế Database Schema
- [ ] Thiết kế wireframe các trang chính (Home, Post Detail, Admin, Contest)
- [ ] Setup Git repo, CI cơ bản

#### M1 — Hạ tầng & Authentication (15/02 — 28/02)
- Tạo project Supabase, cấu hình Google OAuth provider
- Migration toàn bộ schema DB, áp dụng RLS
- Viết trigger `handle_new_auth_user` đồng bộ `auth.users` → `public.users`
- Tích hợp Supabase Auth vào Next.js proxy (`src/proxy.ts`)
- Trang đăng nhập Google-only với luồng chuyển hướng email → Google
- Trang profile tối giản

#### M2 — CMS & Public Blog (01/03 — 21/03)
- Admin CMS: tạo/sửa/xóa bài viết, quản lý tag
- Upload ảnh bìa vào bucket `post-images`
- Trang chủ, trang chi tiết bài viết (MDX render)
- Trang danh sách theo tag/category
- Tìm kiếm cơ bản

#### M3 — Contest Backend (22/03 — 11/04)
- API CRUD cho `contest`, `contest_registration`, `submission`
- Logic kiểm tra thời gian đăng ký, ràng buộc team size
- Tích hợp Storage bucket `submissions` với RLS
- Admin CMS cho cuộc thi (tạo/sửa, xem danh sách đăng ký)

#### M4 — Contest UI & Polish (12/04 — 22/04)
- Trang danh sách cuộc thi công khai
- Trang chi tiết cuộc thi với thông tin đầy đủ
- UI "Under Development" cho nút đăng ký/nộp bài
- Hoàn thiện Admin Dashboard tập trung

#### M5 — Testing & Go-live (23/04 — 30/04)
- Test luồng end-to-end (Google login → browse → admin tạo contest)
- Sửa bug, tối ưu performance
- Deploy production trên Vercel
- Viết tài liệu vận hành cho admin
- Handover và go-live chính thức

### 6.3 Rủi ro chính và phương án

| Rủi ro | Mức độ | Phương án giảm thiểu |
|---|---|---|
| PM kiêm dev một mình, quá tải | Cao | Ưu tiên chặt scope MVP, không thêm tính năng giữa chừng |
| Supabase free tier hết hạn mức | Trung bình | Theo dõi usage, chuẩn bị plan nâng cấp nếu vượt ngưỡng |
| Google OAuth config phức tạp | Thấp | Dành buffer trong M1 để xử lý, có tài liệu Supabase hỗ trợ |
| Contest UI bị cắt giảm quá nhiều | Trung bình | Đã chấp nhận trước: MVP để "Under Development", giai đoạn 2 sẽ hoàn thiện |

---

## 7. Stakeholders

| Vai trò | Tên | Trách nhiệm |
|---|---|---|
| Project Manager | Ngô Tiến Sỹ | Toàn quyền quyết định scope, timeline, kỹ thuật |
| Sponsor | Cộng đồng Toán Mô Hình Hà Nội | Cung cấp yêu cầu, phản hồi, go/no-go |
| End Users | Thí sinh, Admin, Độc giả | Phản hồi UAT, sử dụng sản phẩm cuối |

---

## 8. Phê duyệt

| Vai trò | Tên | Ngày phê duyệt | Chữ ký |
|---|---|---|---|
| Project Manager | Ngô Tiến Sỹ | ___/___/2026 | _______________ |
| Sponsor | Đại diện cộng đồng | ___/___/2026 | _______________ |
