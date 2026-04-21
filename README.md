# Toán Mô Hình Hà Nội — Portal

Portal chính thức của tổ chức **Toán Mô Hình Hà Nội** — nơi đăng bài viết, chia sẻ kiến thức và tổ chức các cuộc thi toán mô hình. Xây dựng trên Next.js 16, React 19 và Supabase.

> **Contest UI — Under development.** Toàn bộ backend API (đăng ký, nộp bài, duyệt) đã hoàn thiện ở Milestone M3. Giao diện người dùng cho Contest sẽ được phát hành ở Milestone M4.
>
> **Đăng nhập — Google only.** Không hỗ trợ đăng ký bằng email/mật khẩu. Xác thực qua Supabase Auth + Google Identity Services.

---

## Tech Stack

| Hạng mục | Công nghệ |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler) |
| **UI** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [next-themes](https://github.com/pacocoursey/next-themes) |
| **Backend** | [Supabase](https://supabase.com/) — Postgres + Auth (Google) + Storage |
| **Supabase SDK** | `@supabase/supabase-js`, `@supabase/ssr` |
| **Content** | [MDX](https://mdxjs.com/) qua `next-mdx-remote` + [Shiki](https://shiki.style/) + `rehype-pretty-code` |
| **Animation** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## Cấu trúc thư mục

```
toanmohinhhanoi-portal/
├── public/                         # Ảnh, favicon, file tĩnh
├── docs/                           # Tài liệu dự án (Charter, Requirements, Schema, ...)
├── supabase/
│   └── schema.sql                  # DDL: bảng, enum, RLS, triggers, buckets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/               # callback, logout, me
│   │   │   ├── users/              # [id], me
│   │   │   ├── posts/              # GET list, GET [slug]
│   │   │   ├── tags/               # GET
│   │   │   ├── contests/           # GET list, GET [slug], [slug]/register
│   │   │   ├── submissions/        # POST, mark-final, download
│   │   │   └── admin/              # posts, tags, uploads, contests, registrations
│   │   ├── admin/                  # Dashboard quản trị (role = 'admin')
│   │   │   ├── bucket/             # Quản lý Storage bucket
│   │   │   ├── database/           # Xem dữ liệu DB
│   │   │   └── posts/              # Tạo / sửa bài viết (new, [id]/edit)
│   │   ├── auth/                   # Trang đăng nhập Google
│   │   ├── contest-management/     # Quản lý cuộc thi (admin)
│   │   ├── contests/               # Placeholder "Under development"
│   │   ├── post/                   # Danh sách + chi tiết bài viết
│   │   ├── not-found.tsx           # Trang 404
│   │   └── page.tsx                # Trang chủ
│   ├── components/
│   │   ├── features/               # post, admin, ui
│   │   └── layout/                 # Header, Sidebar, Footer, AppShell
│   ├── contexts/                   # UserContext, SidebarContext
│   ├── lib/
│   │   ├── supabase/               # server.ts, admin.ts, client.ts
│   │   ├── posts-db.ts             # Query bài viết (supabase-js)
│   │   ├── users-db.ts             # Query user
│   │   ├── tags-db.ts              # Query tag
│   │   ├── contests-db.ts          # Query + validate contest/registration/submission
│   │   ├── storage.ts              # Upload + signed URL
│   │   └── api-helpers.ts          # { success, data, message } + revalidateTag
│   ├── hooks/                      # usePostForm, useResizablePanel, usePostFormValidation
│   ├── config/                     # navigation.ts (sidebar menu items)
│   ├── types/                      # user, database, post, contest, admin
│   └── proxy.ts                    # Next.js 16 proxy (cũ: middleware)
├── package.json
└── README.md
```

---

## Setup

### Yêu cầu
- **Node.js** v20+
- **Supabase project** (free tier OK — [supabase.com](https://supabase.com))
- **Google Cloud OAuth Client ID** cho Google Identity Services

### 1. Cài đặt dependency

```bash
git clone https://github.com/helios-ryuu/toanmohinhhanoi-portal.git
cd toanmohinhhanoi-portal
npm install
```

### 2. Biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<secret-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3456
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-client-id>.apps.googleusercontent.com
```

### 3. Áp dụng schema Supabase

Mở Supabase Dashboard → **SQL Editor** → paste nội dung `supabase/schema.sql` → **Run**. Script tạo toàn bộ bảng, enum, RLS policy, trigger `handle_new_auth_user`, và 2 bucket `post-images` / `submissions`.

### 4. Bật Google provider

Supabase Dashboard → **Authentication → Providers → Google** → bật và dán `Client ID` + `Client Secret`. Đồng thời thêm `http://localhost:3456` vào **Authorized JavaScript origins** trong Google Cloud Console để Google Identity Services popup hoạt động.

### 5. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3456](http://localhost:3456).

### 6. Promote tài khoản thành admin

Sau lần đăng nhập đầu tiên, trigger `handle_new_auth_user` tự động tạo row trong `public.users` với `role = 'user'`. Để truy cập `/admin`:

```sql
UPDATE public.users SET role = 'admin' WHERE id = '<your-auth-uid>';
```

---

## Scripts

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Dev server tại port 3456 (Turbopack) |
| `npm run build` | Build production |
| `npm start` | Chạy bản production |
| `npm run lint` | ESLint |

---

## Kiến trúc

```
Pages/Components (App Router, React 19)
    ↓ fetch
API Routes (/api/*)  — { success, data?, message? }
    ↓ supabase-js
DB helpers (src/lib/*-db.ts)
    ↓
Supabase (Postgres + Auth + Storage, RLS bật trên mọi bảng)
```

### Auth flow

1. Người dùng bấm "Đăng nhập bằng Google" tại `/auth`.
2. Google Identity Services (GIS) mở popup native của Google — **không redirect, không hiển thị "Continue to …"**.
3. GIS trả về ID token; client gọi `supabase.auth.signInWithIdToken({ provider: 'google', token })`.
4. Supabase tạo session; trigger `handle_new_auth_user` INSERT vào `public.users` với `role = 'user'`.
5. `src/proxy.ts` kiểm tra session + role trên các route được bảo vệ (`/admin/**`, `/contest-management/**`, `/profile/**`, `/contest/[slug]/join`, `/api/admin/**`, `/api/auth/me`, `/api/users/me`, `/api/contests/*/register`, `/api/submissions/**`).

### Gating routes

| Pattern | Yêu cầu |
| :--- | :--- |
| `/admin/**`, `/contest-management/**`, `/api/admin/**` | Đăng nhập + `users.role = 'admin'` |
| `/profile/**`, `/contest/[slug]/join`, `/api/users/me`, `/api/auth/me` | Đăng nhập |
| `/api/contests/[slug]/register/**`, `/api/submissions/**` | Đăng nhập |
| Các route còn lại | Công khai |

---

## Notes

- **Contest UI: Under development.** Backend API đầy đủ; frontend cho Contest sẽ ra ở M4. Hiện `/contests` hiển thị placeholder "Chức năng đang được phát triển".
- **Login: Google only.** Không có email/mật khẩu. Muốn thêm provider khác, bật trong Supabase Dashboard và cập nhật `src/app/auth/page.tsx`.
- **Next.js 16 proxy.** File `src/proxy.ts` (xuất hàm `proxy`) thay thế cho `middleware.ts` theo convention mới của Next.js 16.

---

## Triển khai

Project tối ưu cho [Vercel](https://vercel.com/):

1. Push code lên GitHub.
2. Import project vào Vercel.
3. Thêm các biến môi trường ở mục [Setup](#2-biến-môi-trường).
4. Cập nhật `NEXT_PUBLIC_SITE_URL` thành domain production và thêm domain đó vào Google Cloud OAuth origins.
5. Deploy.
