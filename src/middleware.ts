import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

// Routes that require authentication — redirect to /auth with ?next=
const PROTECTED_PAGE_PATTERNS = [
    /^\/mycontest(\/|$)/,
    /^\/contest\/[^/]+\/join(\/|$)/,
];

// API routes that require authentication — return 401 JSON
const PROTECTED_API_PATTERNS = [
    /^\/api\/auth\/me$/,
    /^\/api\/contests\//,
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedPage = PROTECTED_PAGE_PATTERNS.some((r) => r.test(pathname));
    const isProtectedApi = PROTECTED_API_PATTERNS.some((r) => r.test(pathname));

    if (!isProtectedPage && !isProtectedApi) {
        return NextResponse.next();
    }

    const token = getTokenFromRequest(request);
    const payload = token ? await verifyToken(token) : null;

    if (!payload) {
        if (isProtectedApi) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/mycontest/:path*",
        "/contest/:slug/join/:path*",
        "/api/auth/me",
        "/api/contests/:path*",
    ],
};
