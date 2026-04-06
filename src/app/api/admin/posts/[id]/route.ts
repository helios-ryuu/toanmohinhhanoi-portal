import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { parseIdParam, errorResponse, successResponse, successMessage, revalidatePostCache } from "@/lib/api-helpers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT - Update a post
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const postId = await parseIdParam(params, "post ID");
        if (postId instanceof NextResponse) return postId;

        const body = await request.json();
        const {
            title, description, content, image_url,
            level, type, series_id, series_order,
            author_id, reading_time, tag_ids,
        } = body;

        // Format reading time if it's a number
        const formattedReadingTime = typeof reading_time === "number"
            ? `${reading_time} min read`
            : reading_time;

        const result = await sql`
            UPDATE post
            SET 
                title = ${title},
                description = ${description},
                content = ${content},
                image_url = ${image_url},
                level = ${level},
                type = ${type},
                series_id = ${series_id || null},
                series_order = ${series_order || null},
                author_id = ${author_id},
                reading_time = ${formattedReadingTime},
                updated_at = NOW()
            WHERE id = ${postId}
            RETURNING *
        `;

        if (result.length === 0) return errorResponse("Post not found", 404);

        // Update tags
        await sql`DELETE FROM post_tags WHERE post_id = ${postId}`;
        if (tag_ids && tag_ids.length > 0) {
            for (const tagId of tag_ids) {
                await sql`
                    INSERT INTO post_tags (post_id, tag_id)
                    VALUES (${postId}, ${tagId})
                    ON CONFLICT DO NOTHING
                `;
            }
        }

        revalidatePostCache(result[0].slug);

        return successResponse(result[0], "Post updated successfully");
    } catch (error) {
        console.error("Error updating post:", error);
        return errorResponse("Failed to update post");
    }
}

// PATCH - Publish/unpublish a post
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const postId = await parseIdParam(params, "post ID");
        if (postId instanceof NextResponse) return postId;

        const { action } = await request.json();

        if (action === "publish") {
            const result = await sql`
                UPDATE post
                SET published = true, published_at = NOW(), updated_at = NOW()
                WHERE id = ${postId}
                RETURNING *
            `;
            if (result.length === 0) return errorResponse("Post not found", 404);
            revalidatePostCache(result[0].slug);
            return successResponse(result[0], "Post published successfully");
        }

        if (action === "unpublish") {
            const result = await sql`
                UPDATE post
                SET published = false, published_at = NULL, updated_at = NOW()
                WHERE id = ${postId}
                RETURNING *
            `;
            if (result.length === 0) return errorResponse("Post not found", 404);
            revalidatePostCache(result[0].slug);
            return successResponse(result[0], "Post unpublished successfully");
        }

        return errorResponse("Invalid action", 400);
    } catch (error) {
        console.error("Error updating post:", error);
        return errorResponse("Failed to update post");
    }
}

// GET - Fetch a single post by ID
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const postId = await parseIdParam(params, "post ID");
        if (postId instanceof NextResponse) return postId;

        const posts = await sql`
            SELECT p.*, a.name as author_name, s.name as series_name
            FROM post p
            LEFT JOIN author a ON p.author_id = a.id
            LEFT JOIN series s ON p.series_id = s.id
            WHERE p.id = ${postId}
        `;

        if (posts.length === 0) return errorResponse("Post not found", 404);

        const tags = await sql`
            SELECT t.id, t.name, t.slug
            FROM tag t
            INNER JOIN post_tags pt ON t.id = pt.tag_id
            WHERE pt.post_id = ${postId}
        `;

        return successResponse({ ...posts[0], tags });
    } catch (error) {
        console.error("Error fetching post:", error);
        return errorResponse("Failed to fetch post");
    }
}

// DELETE - Delete a post
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const postId = await parseIdParam(params, "post ID");
        if (postId instanceof NextResponse) return postId;

        await sql`DELETE FROM post_tags WHERE post_id = ${postId}`;

        const result = await sql`
            DELETE FROM post WHERE id = ${postId}
            RETURNING id, slug
        `;

        if (result.length === 0) return errorResponse("Post not found", 404);

        revalidatePostCache(result[0].slug);

        return successMessage("Post deleted successfully");
    } catch (error) {
        console.error("Error deleting post:", error);
        return errorResponse("Failed to delete post");
    }
}
