# Toán Mô Hình Hà Nội — Portal

Portal chính thức của tổ chức **Toán Mô Hình Hà Nội**, xây dựng trên Next.js 16, React 19 và Supabase.

---

## Tính năng

### Blog & Nội dung
- **Posts**: Đăng bài về cuộc thi, chia sẻ kiến thức và sự kiện của tổ chức.
- **MDX Rendering**: Nội dung phong phú kết hợp Markdown và React component.
- **Syntax Highlighting**: Hiển thị code đẹp với Shiki và `rehype-pretty-code`.
- **Series**: Nhóm các bài viết liên quan theo chuỗi có thứ tự.
- **Tag**: Phân loại và lọc bài viết theo chủ đề.
- **Mức độ**: Phân loại `Beginner`, `Intermediate`, `Advanced`.

### Giao diện
- **Responsive**: Tương thích đầy đủ từ mobile đến desktop.
- **Dark / Light Theme**: Chuyển đổi giao diện sáng/tối.
- **Card & List View**: Hai chế độ hiển thị danh sách bài viết.
- **Sidebar thu gọn**: Ghim hoặc ẩn thanh điều hướng.
- **Animations**: Framer Motion và GSAP.

### Chia sẻ & Tải xuống
- **QR Code**: Tạo thẻ chia sẻ kèm mã QR cho từng bài viết.
- **Tải Markdown**: Xuất bài viết ra file `.md`.
- **Copy link**: Sao chép đường dẫn một click.

### CMS — Quản trị nội dung
- **Dashboard bảo mật**: Khu vực admin yêu cầu xác thực.
- **Quản lý bài viết**: Tạo, chỉnh sửa, xoá bài; hỗ trợ bản nháp.
- **Quản lý Tag & Series**: Thao tác trực tiếp từ giao diện admin.
- **Xem trước**: Preview bài viết trước khi xuất bản.

### Đang phát triển

**Contest (Cuộc thi)**
- Mở cuộc thi trong khoảng thời gian xác định.
- Người dùng đăng ký tham gia theo cá nhân hoặc đội nhóm tuỳ theo từng cuộc thi.
- Nộp bài làm với nhiều định dạng file khác nhau.

**Xác thực (Auth)**
- Đăng nhập bằng Google hoặc email.
- Tài khoản có username riêng.

---

## Tech Stack

| Hạng mục | Công nghệ |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Ngôn ngữ** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) với React Compiler |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) via `postgres` |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Content** | [MDX](https://mdxjs.com/) via `next-mdx-remote` |
| **Animation** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Code Syntax** | [Shiki](https://shiki.style/) + `rehype-pretty-code` |

---

## Bắt đầu

### Yêu cầu
- **Node.js**: v20 trở lên.
- **Supabase**: Một project Supabase (có thể dùng free tier tại [supabase.com](https://supabase.com)).

### Cài đặt

```bash
git clone https://github.com/helios-ryuu/toanmohinhhanoi-portal.git
cd toanmohinhhanoi-portal
npm install
```

### Biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
# Supabase Connection String (Project Settings > Database > Connection string > URI)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Database Schema

Các bảng cần thiết:
- `post` — Bài viết
- `author` — Thông tin tác giả
- `tag` — Tag phân loại
- `series` — Chuỗi bài viết
- `post_tags` — Quan hệ nhiều-nhiều giữa post và tag

### Chạy development

```bash
npm run dev
```

Mở [http://localhost:3456](http://localhost:3456) trên trình duyệt.

### Build production

```bash
npm run build
npm run start
```

---

## Cấu trúc thư mục

```
toanmohinhhanoi-portal/
├── public/                 # Ảnh, favicon và file tĩnh
├── src/
│   ├── app/                # Next.js App Router — pages & API routes
│   │   ├── api/            # API endpoints
│   │   │   ├── admin/      # Quản trị (auth, posts, tags, series, authors)
│   │   │   ├── post/       # Tải xuống bài viết
│   │   │   └── search/     # Tìm kiếm
│   │   ├── admin/          # Trang dashboard quản trị
│   │   ├── post/           # Danh sách và chi tiết bài viết
│   │   └── page.tsx        # Trang chủ
│   ├── components/
│   │   ├── features/       # Component theo tính năng (Post, Admin, ...)
│   │   ├── layout/         # Cấu trúc trang (Header, Sidebar, Footer)
│   │   └── ui/             # UI primitives (Button, Select, ...)
│   ├── config/             # Cấu hình điều hướng
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Tiện ích
│   │   ├── db.ts           # Kết nối PostgreSQL
│   │   ├── posts.ts        # API lấy bài viết
│   │   ├── posts-db.ts     # Query database
│   │   └── utils.ts        # Hàm tiện ích chung
│   ├── services/           # Tích hợp dịch vụ ngoài
│   └── types/              # TypeScript type definitions
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Quản lý nội dung

### Qua Admin Dashboard

Truy cập `/admin` để quản lý toàn bộ nội dung — bài viết, series, tag và tác giả. Yêu cầu xác thực.

### Qua Database trực tiếp

```sql
INSERT INTO post (slug, title, description, content, image_url, level, type, author_id, reading_time, published, published_at)
VALUES (
  'ten-bai-viet',
  'Tiêu đề bài viết',
  'Mô tả ngắn.',
  '## Nội dung MDX...',
  'https://url-anh.jpg',
  'beginner',   -- hoặc 'intermediate', 'advanced'
  'standalone', -- hoặc 'series'
  1,
  '5 min read',
  true,
  NOW()
);
```

### Schema bảng `post`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `slug` | string | Định danh URL |
| `title` | string | Tiêu đề |
| `description` | string | Mô tả ngắn |
| `content` | text | Nội dung MDX |
| `image_url` | string | Ảnh bìa |
| `level` | enum | `beginner`, `intermediate`, `advanced` |
| `type` | enum | `standalone` hoặc `series` |
| `series_id` | int? | Tham chiếu đến bảng series |
| `series_order` | int? | Thứ tự trong series |
| `author_id` | int? | Tham chiếu đến bảng author |
| `reading_time` | string | Ví dụ: "5 min read" |
| `published` | boolean | Trạng thái xuất bản |
| `published_at` | timestamp | Thời điểm xuất bản |

---

## Triển khai

Project tối ưu cho [Vercel](https://vercel.com/).

1. Push code lên GitHub.
2. Import project vào Vercel.
3. Thêm biến môi trường `DATABASE_URL`.
4. Deploy.

Với các nền tảng khác, dùng `npm run build` để tạo thư mục `.next`.
