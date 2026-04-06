import { NextRequest, NextResponse } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";
import sql from "@/lib/db";

// Cached function to fetch table data
const fetchTableData = unstable_cache(
    async (table: string) => {
        let data: Record<string, unknown>[] = [];
        switch (table) {
            case "author":
                data = await sql`SELECT * FROM author ORDER BY id DESC`;
                break;
            case "post":
                data = await sql`
                    SELECT p.*, a.name as author_name, s.name as series_name
                    FROM post p
                    LEFT JOIN author a ON p.author_id = a.id
                    LEFT JOIN series s ON p.series_id = s.id
                    ORDER BY p.id DESC
                `;
                break;
            case "tag":
                data = await sql`SELECT * FROM tag ORDER BY id DESC`;
                break;
            case "series":
                data = await sql`SELECT * FROM series ORDER BY id DESC`;
                break;
            case "post_tags":
                data = await sql`
                    SELECT pt.*, p.title as post_title, t.name as tag_name
                    FROM post_tags pt
                    LEFT JOIN post p ON pt.post_id = p.id
                    LEFT JOIN tag t ON pt.tag_id = t.id
                    ORDER BY pt.post_id DESC
                `;
                break;
            default:
                data = [];
        }
        return data;
    },
    ["admin-table-data"],
    { revalidate: 300, tags: ["admin-data"] } // Cache for 5 minutes
);

// Direct fetch without cache
async function fetchTableDataDirect(table: string) {
    let data: Record<string, unknown>[] = [];
    switch (table) {
        case "author":
            data = await sql`SELECT * FROM author ORDER BY id DESC`;
            break;
        case "post":
            data = await sql`
                SELECT p.*, a.name as author_name, s.name as series_name
                FROM post p
                LEFT JOIN author a ON p.author_id = a.id
                LEFT JOIN series s ON p.series_id = s.id
                ORDER BY p.id DESC
            `;
            break;
        case "tag":
            data = await sql`SELECT * FROM tag ORDER BY id DESC`;
            break;
        case "series":
            data = await sql`SELECT * FROM series ORDER BY id DESC`;
            break;
        case "post_tags":
            data = await sql`
                SELECT pt.*, p.title as post_title, t.name as tag_name
                FROM post_tags pt
                LEFT JOIN post p ON pt.post_id = p.id
                LEFT JOIN tag t ON pt.tag_id = t.id
                ORDER BY pt.post_id DESC
            `;
            break;
        default:
            data = [];
    }
    return data;
}

// GET - Fetch all data from a specific table
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const refresh = searchParams.get("refresh") === "true";

    if (!table || !["author", "post", "tag", "series", "post_tags"].includes(table)) {
        return NextResponse.json(
            { success: false, message: "Invalid table name" },
            { status: 400 }
        );
    }

    try {
        if (refresh) {
            revalidateTag("admin-data", "max");
        }
        const data = refresh
            ? await fetchTableDataDirect(table)
            : await fetchTableData(table);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch data" },
            { status: 500 }
        );
    }
}
