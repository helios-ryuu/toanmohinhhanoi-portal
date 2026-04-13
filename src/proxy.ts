import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PROTECTED_PAGE_PATTERNS = [
    /^\/profile(\/|$)/,
    /^\/admin(\/|$)/,
    /^\/contest-management(\/|$)/,
    /^\/contest\/[^/]+\/join(\/|$)/,
];

const ADMIN_PAGE_PATTERNS = [/^\/admin(\/|$)/, /^\/contest-management(\/|$)/];

const PROTECTED_API_PATTERNS = [
    /^\/api\/auth\/me$/,
    /^\/api\/users\/me(\/|$)/,
    /^\/api\/contests\/[^/]+\/register(\/|$)/,
    /^\/api\/submissions(\/|$)/,
];

const ADMIN_API_PATTERNS = [/^\/api\/admin(\/|$)/];

function matchesAny(pathname: string, patterns: RegExp[]) {
    return patterns.some((r) => r.test(pathname));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(toSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
                    toSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options as CookieOptions);
                    });
                },
            },
        },
    );

    // Refresh session cookie if needed.
    const { data: { user } } = await supabase.auth.getUser();

    const isProtectedPage = matchesAny(pathname, PROTECTED_PAGE_PATTERNS);
    const isAdminPage     = matchesAny(pathname, ADMIN_PAGE_PATTERNS);
    const isProtectedApi  = matchesAny(pathname, PROTECTED_API_PATTERNS);
    const isAdminApi      = matchesAny(pathname, ADMIN_API_PATTERNS);

    if (!isProtectedPage && !isProtectedApi && !isAdminPage && !isAdminApi) {
        return response;
    }

    if (!user) {
        if (isProtectedApi || isAdminApi) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAdminPage || isAdminApi) {
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            if (isAdminApi) {
                return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
            }
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/profile/:path*",
        "/admin/:path*",
        "/contest-management/:path*",
        "/contest/:slug/join/:path*",
        "/api/auth/me",
        "/api/users/me/:path*",
        "/api/admin/:path*",
        "/api/contests/:slug/register/:path*",
        "/api/submissions/:path*",
    ],
};
