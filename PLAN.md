# Contest Management Platform — Upgrade Plan

## Context

Upgrading `toanmohinhhanoi-portal` from a personal blog into a Contest Management Platform. The blog core stays intact; contests are a new entity type alongside posts. All existing patterns (postgres queries, `{success, data, message}` API shape, `unstable_cache`, Tailwind CSS variables, `"use client"` client islands) are followed strictly.

---

## DATABASE SCHEMA ANALYSIS

### Current Schema

```sql
author(id, name, title, avatar_url, github_url, linkedin_url, created_at)
tag(id, name, slug, created_at)
series(id, name, slug, description, created_at)
post(id, slug, title, description, content, image_url, level, type,
     series_id→series, series_order, author_id→author,
     reading_time, published, published_at, created_at, updated_at)
post_tags(post_id→post, tag_id→tag, created_at)  [PK: (post_id, tag_id)]
```

### Proposed New Tables

```sql
-- Public users (NOT admin — admin auth stays as env-var localStorage)
CREATE TABLE public."user" (
    id            BIGSERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT UNIQUE,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url    TEXT,
    display_name  TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ
);

-- Contests (no level/type/series; has dates; reuses tag table)
CREATE TABLE public.contest (
    id           BIGSERIAL PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    content      TEXT NOT NULL DEFAULT '',  -- MDX body, same as post.content
    image_url    TEXT,
    start_date   TIMESTAMPTZ NOT NULL,
    end_date     TIMESTAMPTZ NOT NULL,
    published    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ
);
-- NOTE: no `status` column — computed from (start_date, end_date, NOW())

-- Reuse existing tag table
CREATE TABLE public.contest_tags (
    contest_id BIGINT NOT NULL REFERENCES public.contest(id) ON DELETE CASCADE,
    tag_id     BIGINT NOT NULL REFERENCES public.tag(id)    ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (contest_id, tag_id)
);

-- Who joined what
CREATE TABLE public.enrollment (
    id         BIGSERIAL PRIMARY KEY,
    contest_id BIGINT NOT NULL REFERENCES public.contest(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES public."user"(id)  ON DELETE CASCADE,
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contest_id, user_id)
);

-- File submissions per enrollment
CREATE TABLE public.submission (
    id            BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES public.enrollment(id) ON DELETE CASCADE,
    file_url      TEXT NOT NULL,   -- Supabase Storage public URL
    file_name     TEXT NOT NULL,
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified      BOOLEAN NOT NULL DEFAULT FALSE  -- email sent flag, prevents duplicate sends
);

-- Indexes
CREATE INDEX idx_contest_slug          ON public.contest(slug);
CREATE INDEX idx_contest_published     ON public.contest(published, published_at DESC);
CREATE INDEX idx_enrollment_user       ON public.enrollment(user_id);
CREATE INDEX idx_enrollment_contest    ON public.enrollment(contest_id);
CREATE INDEX idx_submission_enrollment ON public.submission(enrollment_id);
CREATE INDEX idx_user_email            ON public."user"(email);
```

---

## Phase Breakdown

| Phase | Scope | Key Deliverable |
|-------|-------|-----------------|
| **1** | Auth foundation | `user` table SQL, JWT auth API, `/auth` page, `UserContext`, Header `AuthSection` |
| **2** | Contests data + listing | `contest`/`contest_tags` tables, contests lib, `/contests` page, contest cards, nav update |
| **3** | Contest detail | `/contest/[slug]` page, `ContestMeta`, `ContestJoinButton`, share actions, Sidebar TOC fix |
| **4** | Enrollment + My Contest | `enrollment`/`submission` tables, `/mycontest/[slug]`, timeline UI, file upload, email |
| **5** | Admin panel extension | Admin contest CRUD tab, cache wiring, polish |

---

## Phase 1 — Auth Foundation

### Goal
Live user registration/login, JWT httpOnly cookies, `/auth` page, `UserContext`, and the Header `AuthSection`. No contest features yet.

### New Packages
- `jose` — Edge-compatible JWT (required in `src/middleware.ts`, Edge runtime)
- `bcryptjs` + `@types/bcryptjs` — password hashing (Node.js API routes only, never in middleware)

### New Environment Variables
```
JWT_SECRET=      # ≥32 random bytes hex string
```
SMTP vars deferred to Phase 4. Google OAuth deferred indefinitely (placeholder button only).

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/types/user.ts` | `User` (frontend), `AuthPayload` (JWT claims) interfaces |
| `src/lib/auth.ts` | `signToken`, `verifyToken`, `setAuthCookie`, `clearAuthCookie`, `getTokenFromRequest` |
| `src/lib/users-db.ts` | `getUserByEmail`, `getUserByUsername`, `createUser` |
| `src/middleware.ts` | Route protection (jose only, never bcryptjs) |
| `src/app/api/auth/register/route.ts` | POST: validate, bcrypt.hash, insert user, set cookie |
| `src/app/api/auth/login/route.ts` | POST: find user, bcrypt.compare, set cookie |
| `src/app/api/auth/logout/route.ts` | POST: clearAuthCookie |
| `src/app/api/auth/me/route.ts` | GET: verify cookie, return fresh user from DB |
| `src/contexts/UserContext.tsx` | `useUser()` — `{ user, isLoading, refresh, logout }` |
| `src/components/layout/Header/AuthSection.tsx` | Avatar+dropdown (logged in) or "Sign in" link (logged out) |
| `src/app/auth/page.tsx` | Login/Register tabs + Google placeholder button |
| `src/app/auth/layout.tsx` | Auth page layout (no sidebar) |

### Files to MODIFY

| File | Change |
|------|--------|
| `src/types/database.ts` | Add `DbUser` interface |
| `src/components/layout/AppShell.tsx` | Wrap providers with `<UserProvider>` |
| `src/components/layout/Header/Header.tsx` | Add `<AuthSection />` to right side; update `routes` array |

### Middleware Protected Routes
```
/mycontest/:path*        → redirect to /auth?next=... if no valid cookie
/contest/:slug/join      → redirect to /auth?next=... if no valid cookie
/api/auth/me             → 401 JSON if no valid cookie
/api/contests/:path*     → 401 JSON if no valid cookie
```

### Header `routes` array after change
```typescript
const routes = [
    { path: "/post", label: "Post" },
    { path: "/contests", label: "Contests" },
    { path: "/contest", label: "Contest" },
    { path: "/mycontest", label: "My Contest" },
];
// Removes: /roadmaps, /project
```

### `AuthSection` behavior
- **Loading**: small skeleton placeholder
- **Logged in**: avatar circle (image or initial fallback) + `@username` (hidden on mobile) → Radix DropdownMenu with Profile, My Contests, Logout
- **Logged out**: "Sign in" link → `/auth`

### `/auth` page behavior
- Two tabs: Login | Register
- Login: `identifier` (email or username) + `password`
- Register: `email` + `username` + `password` + `confirmPassword` + optional `phone`
- Google button: placeholder only, shows "Coming soon" toast
- On success: `refresh()` then `router.push(next ?? "/")`
- Reuses `FormInput`, `FormField`, `FormMessage` from `src/components/features/admin/common/FormFields.tsx`

### Files NOT touched in Phase 1
- `src/config/navigation.ts` — Contests nav item added in Phase 2
- `src/components/layout/Sidebar/Sidebar.tsx` — TOC fix for `/contest/` paths in Phase 3
- All contest DB/API routes — Phase 2+
- Admin panel — Phase 5

---

## Phase 2 — Contests Data + Listing

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/types/contest.ts` | `Contest`, `ContestMeta`, `ContestItemProps`, `ContestStatus` |
| `src/lib/contest-utils.ts` | `computeContestStatus(startDate, endDate): ContestStatus` |
| `src/lib/contests-db.ts` | `getAllContestsMetaFromDb`, `getContestBySlugFromDb`, `getRelatedPostsForContestFromDb` |
| `src/lib/contests.ts` | Public API (mirrors `src/lib/posts.ts`) |
| `src/components/features/contest/card/ContestCard.tsx` | Visually distinct from PostCard; status badge instead of level badge |
| `src/components/features/contest/card/ContestStatColumns.tsx` | start/end dates, competitor count, status |
| `src/components/features/contest/list/ContestListClient.tsx` | Filter + grid layout |
| `src/components/features/contest/list/ContestListHeader.tsx` | "My Contests" or "Sign in to join" (client island) |
| `src/app/contests/page.tsx` | Server component, `getCachedContestsMeta`, renders listing |

### Files to MODIFY

| File | Change |
|------|--------|
| `src/types/database.ts` | Add `DbContest`, `DbContestTag`, `DbContestWithRelations` |
| `src/config/navigation.ts` | Remove Roadmaps+Projects; add `{ icon: TrophyIcon, label: "Contests", href: "/contests" }` |
| `src/lib/api-helpers.ts` | Add `revalidateContestCache(slug?: string)` |

### ContestStatus logic
```typescript
type ContestStatus = "upcoming" | "ongoing" | "ended";

function computeContestStatus(startDate: string, endDate: string): ContestStatus {
    const now = Date.now();
    if (now < new Date(startDate).getTime()) return "upcoming";
    if (now > new Date(endDate).getTime()) return "ended";
    return "ongoing";
}
```

---

## Phase 3 — Contest Detail Page

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/components/features/contest/detail/ContestMeta.tsx` | startDate, endDate, status, competitor count |
| `src/components/features/contest/detail/ContestJoinButton.tsx` | Auth-aware join button (client component) |
| `src/components/features/contest/detail/ContestShareActions.tsx` | Mirrors PostShareActions (no markdown download) |
| `src/components/features/contest/detail/RelatedPostsForContest.tsx` | Wraps RelatedPosts with different heading |
| `src/app/contest/[slug]/page.tsx` | Server component, mirrors `post/[slug]/page.tsx` layout |
| `src/app/contest/[slug]/join/page.tsx` | "Under Development" placeholder |

### Files to MODIFY

| File | Change |
|------|--------|
| `src/components/layout/AppShell.tsx` | Extend `isPostPage` → `isDetailPage` to cover `/contest/[slug]` paths |
| `src/components/layout/Sidebar/Sidebar.tsx` | Same `isDetailPage` generalization for TOC mode |

### `ContestJoinButton` states
```
No user       → "Sign in to join"  → /auth?next=/contest/[slug]
User, ended   → disabled "Contest ended"
User, joined  → "Go to my contests" → /mycontest/[slug]
User, not joined → "Join the contest" → /contest/[slug]/join
```

---

## Phase 4 — Enrollment + My Contest Page

### New Packages
- `nodemailer` + `@types/nodemailer`

### New Environment Variables
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Contests <noreply@yourdomain.com>"
SUPABASE_URL=           (may already exist)
SUPABASE_STORAGE_BUCKET=contest-submissions
```

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/lib/mailer.ts` | nodemailer singleton, `sendSubmissionConfirmation(to, contestTitle, fileUrl)` |
| `src/lib/enrollments-db.ts` | `getEnrollmentByContestAndUser`, `createEnrollment` |
| `src/lib/submissions-db.ts` | `getSubmissionsForEnrollment`, `createSubmission`, `markSubmissionNotified` |
| `src/lib/supabase-storage.ts` | Direct Supabase Storage REST upload (contest submissions bucket) |
| `src/components/features/contest/journey/ContestTimeline.tsx` | Visual timeline derived from MDX H2 headings |
| `src/components/features/contest/journey/TimelineMilestone.tsx` | Individual milestone: upcoming/active/past states |
| `src/components/features/contest/submission/AssignmentSection.tsx` | Prompt display + upload form |
| `src/components/features/contest/submission/FileUploadArea.tsx` | Drag-and-drop file input |
| `src/components/features/contest/submission/SubmissionHistory.tsx` | List of past submissions |
| `src/app/mycontest/[slug]/page.tsx` | Server component: verify enrollment, render workspace |
| `src/app/api/contests/[slug]/enrollment/route.ts` | GET: check enrollment; POST: create enrollment |
| `src/app/api/contests/submit/route.ts` | POST: upload file, insert submission, send email |

### Files to MODIFY

| File | Change |
|------|--------|
| `src/types/database.ts` | Add `DbEnrollment`, `DbSubmission` |

### Submit API flow
1. Verify `auth_token` cookie → 401 if invalid
2. Parse multipart `formData()` — file + contestSlug
3. Validate: max 10 MB, allowed types: pdf/zip/md
4. Upload to Supabase Storage → get public URL
5. Insert `submission` row
6. Call `sendSubmissionConfirmation` → set `notified = true`
7. Return `{ submissionId, fileUrl }`

---

## Phase 5 — Admin Panel Extension

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/app/api/admin/contests/route.ts` | GET all (incl. drafts); POST create |
| `src/app/api/admin/contests/[id]/route.ts` | PUT update; DELETE |
| `src/components/features/admin/contest/ContestForm.tsx` | Create/edit contest form |
| `src/components/features/admin/contest/ContestList.tsx` | Contest list table in admin |

### Files to MODIFY

| File | Change |
|------|--------|
| `src/app/admin/page.tsx` | Add Contests tab alongside existing posts/tags/authors/series tabs |

---

## Cross-Cutting Notes

1. **`jose` in middleware**: `bcryptjs` must never be imported in `src/middleware.ts` — it's Node.js-only. Middleware uses `verifyToken` from `src/lib/auth.ts` (jose only).

2. **Admin auth is separate**: The existing admin panel uses env-var localStorage auth. The new `user` table and JWT cookie auth is for public contest users only. These two auth systems coexist independently.

3. **Status computed, never stored**: `contest.status` is always derived from `start_date`/`end_date` vs `Date.now()`. No cron jobs, no stale data.

4. **Tag reuse**: Contests share the existing `tag` table via `contest_tags`. Tags appear in both post and contest search/filtering.

5. **Submission email idempotency**: The `notified` boolean prevents duplicate emails. The mailer call is wrapped in try/catch — a failure logs but does not fail the HTTP response.

6. **`generateStaticParams` for contests**: Only `published = true` contests are statically generated, mirroring the posts pattern.

7. **File upload in API routes**: Next.js 16 App Router natively supports `request.formData()` — no multer/formidable needed.
