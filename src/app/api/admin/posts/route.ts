import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { errorResponse, successResponse } from "@/lib/api-helpers";

// POST - Create a new post (as draft)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title, description, content, image_url, level, type,
            series_id, series_order, series_name, series_description,
            author_id, reading_time, tag_ids,
        } = body;

        // Validate required fields
        if (!title?.trim()) return errorResponse("Title is required", 400);
        if (!description?.trim()) return errorResponse("Description is required", 400);
        if (!content?.trim()) return errorResponse("Content is required", 400);
        if (!image_url?.trim()) return errorResponse("Image URL is required", 400);
        if (!level?.trim()) return errorResponse("Level is required", 400);
        if (!author_id) return errorResponse("Author is required", 400);
        if (!reading_time) return errorResponse("Reading time is required", 400);

        const formattedReadingTime = `${reading_time} min read`;

        if (tag_ids && tag_ids.length > 3) {
            return errorResponse("Maximum 3 tags allowed", 400);
        }

        const slug = generateSlug(title);

        // Check if slug or title already exists
        const existing = await sql`
            SELECT id FROM post WHERE slug = ${slug} OR title = ${title.trim()}
        `;
        if (existing.length > 0) {
            return errorResponse("A post with this title already exists", 409);
        }

        // Handle series creation if type is 'series' and new series name provided
        let finalSeriesId = series_id || null;
        if (type === "series") {
            if (!series_id && series_name?.trim()) {
                const seriesSlug = generateSlug(series_name);

                const existingSeries = await sql`
                    SELECT id FROM series WHERE slug = ${seriesSlug} OR name = ${series_name.trim()}
                `;

                if (existingSeries.length > 0) {
                    finalSeriesId = existingSeries[0].id;
                } else {
                    const newSeries = await sql`
                        INSERT INTO series (name, slug, description)
                        VALUES (${series_name.trim()}, ${seriesSlug}, ${series_description || null})
                        RETURNING id
                    `;
                    finalSeriesId = newSeries[0].id;
                }
            }

            if (!finalSeriesId) return errorResponse("Series is required for series type posts", 400);
            if (!series_order) return errorResponse("Series order is required for series type posts", 400);
        }

        const result = await sql`
            INSERT INTO post (
                slug, title, description, content, image_url, level, type,
                series_id, series_order, author_id, reading_time, published
            )
            VALUES (
                ${slug}, ${title.trim()}, ${description.trim()}, ${content.trim()},
                ${image_url.trim()}, ${level}, ${type || "standalone"},
                ${finalSeriesId}, ${series_order || null}, ${author_id},
                ${formattedReadingTime}, false
            )
            RETURNING *
        `;

        const postId = result[0].id;

        if (tag_ids && tag_ids.length > 0) {
            for (const tagId of tag_ids) {
                await sql`
                    INSERT INTO post_tags (post_id, tag_id)
                    VALUES (${postId}, ${tagId})
                    ON CONFLICT DO NOTHING
                `;
            }
        }

        return successResponse(result[0], "Post created as draft");
    } catch (error) {
        console.error("Error creating post:", error);
        return errorResponse("Failed to create post");
    }
}

// GET - Fetch all posts with related data
export async function GET() {
    try {
        const posts = await sql`
            SELECT p.*, a.name as author_name, s.name as series_name
            FROM post p
            LEFT JOIN author a ON p.author_id = a.id
            LEFT JOIN series s ON p.series_id = s.id
            ORDER BY p.created_at DESC
        `;

        const postsWithTags = await Promise.all(
            posts.map(async (post) => {
                const tags = await sql`
                    SELECT t.id, t.name, t.slug
                    FROM tag t
                    INNER JOIN post_tags pt ON t.id = pt.tag_id
                    WHERE pt.post_id = ${post.id}
                `;
                return { ...post, tags };
            })
        );

        return successResponse(postsWithTags);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return errorResponse("Failed to fetch posts");
    }
}
