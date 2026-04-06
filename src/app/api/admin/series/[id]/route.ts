import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { parseIdParam, errorResponse, successResponse, successMessage } from "@/lib/api-helpers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// DELETE - Delete a series and all its posts (cascade)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const seriesId = await parseIdParam(params, "series ID");
        if (seriesId instanceof NextResponse) return seriesId;

        const postsInSeries = await sql`SELECT id FROM post WHERE series_id = ${seriesId}`;

        for (const post of postsInSeries) {
            await sql`DELETE FROM post_tags WHERE post_id = ${post.id}`;
        }

        await sql`DELETE FROM post WHERE series_id = ${seriesId}`;

        const result = await sql`
            DELETE FROM series WHERE id = ${seriesId}
            RETURNING id, name
        `;

        if (result.length === 0) return errorResponse("Series not found", 404);

        return successResponse(
            { deletedPostsCount: postsInSeries.length, seriesName: result[0].name },
            "Series and all related posts deleted successfully"
        );
    } catch (error) {
        console.error("Error deleting series:", error);
        return errorResponse("Failed to delete series");
    }
}

// GET - Get series with related posts count
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const seriesId = await parseIdParam(params, "series ID");
        if (seriesId instanceof NextResponse) return seriesId;

        const series = await sql`
            SELECT s.*, COUNT(p.id)::int as post_count
            FROM series s
            LEFT JOIN post p ON s.id = p.series_id
            WHERE s.id = ${seriesId}
            GROUP BY s.id
        `;

        if (series.length === 0) return errorResponse("Series not found", 404);

        const posts = await sql`
            SELECT id, title, slug, published
            FROM post
            WHERE series_id = ${seriesId}
            ORDER BY series_order ASC NULLS LAST, created_at ASC
        `;

        return successResponse({ ...series[0], posts });
    } catch (error) {
        console.error("Error fetching series:", error);
        return errorResponse("Failed to fetch series");
    }
}

// PUT - Update a series
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const seriesId = await parseIdParam(params, "series ID");
        if (seriesId instanceof NextResponse) return seriesId;

        const { name, slug, description } = await request.json();

        if (!name || !slug) return errorResponse("Name and slug are required", 400);

        const result = await sql`
            UPDATE series
            SET name = ${name}, slug = ${slug}, description = ${description || null}
            WHERE id = ${seriesId}
            RETURNING *
        `;

        if (result.length === 0) return errorResponse("Series not found", 404);

        return successResponse(result[0], "Series updated successfully");
    } catch (error) {
        console.error("Error updating series:", error);
        return errorResponse("Failed to update series");
    }
}
