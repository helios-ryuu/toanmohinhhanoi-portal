import { NextRequest, NextResponse } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";
import sql from "@/lib/db";

// Cached function to fetch draft posts
const fetchDraftPosts = unstable_cache(
    async () => {
        const drafts = await sql`
            SELECT 
                p.id, p.slug, p.title, p.description, p.image_url, 
                p.level, p.type, p.created_at, p.updated_at,
                a.name as author_name,
                s.name as series_name,
                p.series_order
            FROM post p
            LEFT JOIN author a ON p.author_id = a.id
            LEFT JOIN series s ON p.series_id = s.id
            WHERE p.published = false
            ORDER BY p.updated_at DESC
        `;
        return drafts;
    },
    ["admin-draft-posts"],
    { revalidate: 300, tags: ["admin-drafts"] } // Cache for 5 minutes
);

// Direct fetch without cache
async function fetchDraftPostsDirect() {
    const drafts = await sql`
        SELECT 
            p.id, p.slug, p.title, p.description, p.image_url, 
            p.level, p.type, p.created_at, p.updated_at,
            a.name as author_name,
            s.name as series_name,
            p.series_order
        FROM post p
        LEFT JOIN author a ON p.author_id = a.id
        LEFT JOIN series s ON p.series_id = s.id
        WHERE p.published = false
        ORDER BY p.updated_at DESC
    `;
    return drafts;
}

// GET - Fetch all draft posts
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";

    try {
        if (refresh) {
            revalidateTag("admin-drafts", "max");
        }
        const drafts = refresh
            ? await fetchDraftPostsDirect()
            : await fetchDraftPosts();

        return NextResponse.json({ success: true, data: drafts });
    } catch (error) {
        console.error("Error fetching draft posts:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch draft posts" },
            { status: 500 }
        );
    }
}
