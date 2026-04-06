import sql from "./db";
import type { DbPost, DbTag, DbAuthor, DbSeries, DbPostWithRelations } from "@/types/database";
import type { Post, PostMeta } from "@/types/post";

/**
 * Transform database post to application Post type
 */
function transformDbPostToPost(dbPost: DbPostWithRelations): Post {
    return {
        slug: dbPost.slug,
        title: dbPost.title,
        description: dbPost.description,
        content: dbPost.content,
        image: dbPost.image_url,
        level: dbPost.level,
        type: dbPost.type,
        date: dbPost.published_at
            ? new Date(dbPost.published_at).toISOString().split("T")[0]
            : new Date(dbPost.created_at).toISOString().split("T")[0],
        author: dbPost.author?.name,
        authorTitle: dbPost.author?.title,
        tags: dbPost.tags.map((t) => t.name),
        seriesId: dbPost.series?.slug,
        seriesOrder: dbPost.series_order ?? undefined,
        readingTime: dbPost.reading_time,
    };
}

/**
 * Transform database post to PostMeta (without content)
 */
function transformDbPostToMeta(dbPost: DbPostWithRelations): PostMeta {
    const { content: _content, ...rest } = transformDbPostToPost(dbPost);
    return rest;
}

/**
 * Fetch a single post by slug with all relations (optimized with JOINs)
 */
export async function getPostBySlugFromDb(slug: string): Promise<Post | null> {
    // Fetch post with author and series in a single query
    const postsWithRelations = await sql<(DbPost & {
        author_name: string | null;
        author_title: string | null;
        series_slug: string | null;
        series_name: string | null;
    })[]>`
        SELECT 
            p.*,
            a.name as author_name,
            a.title as author_title,
            s.slug as series_slug,
            s.name as series_name
        FROM post p
        LEFT JOIN author a ON p.author_id = a.id
        LEFT JOIN series s ON p.series_id = s.id
        WHERE p.slug = ${slug} AND p.published = true 
        LIMIT 1
    `;

    if (postsWithRelations.length === 0) return null;

    const post = postsWithRelations[0];

    // Fetch tags for this post
    const tags = await sql<DbTag[]>`
        SELECT t.* FROM tag t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ${post.id}
    `;

    const postWithRelations: DbPostWithRelations = {
        ...post,
        author: post.author_name ? {
            id: post.author_id!,
            name: post.author_name,
            title: post.author_title
        } as DbAuthor : null,
        series: post.series_slug ? {
            id: post.series_id!,
            slug: post.series_slug,
            name: post.series_name!
        } as DbSeries : null,
        tags,
    };

    return transformDbPostToPost(postWithRelations);
}

/**
 * Fetch all published posts metadata using optimized JOINs (single query)
 */
export async function getAllPostsMetaFromDb(): Promise<PostMeta[]> {
    // Fetch all posts with authors and series in a single query
    const postsWithRelations = await sql<(DbPost & {
        author_name: string | null;
        author_title: string | null;
        series_slug: string | null;
        series_name: string | null;
    })[]>`
        SELECT 
            p.*,
            a.name as author_name,
            a.title as author_title,
            s.slug as series_slug,
            s.name as series_name
        FROM post p
        LEFT JOIN author a ON p.author_id = a.id
        LEFT JOIN series s ON p.series_id = s.id
        WHERE p.published = true 
        ORDER BY p.published_at DESC, p.created_at DESC
    `;

    if (postsWithRelations.length === 0) return [];

    // Get all post IDs
    const postIds = postsWithRelations.map(p => p.id);

    // Fetch all tags for all posts in a single query
    const allTags = await sql<{ post_id: number; tag_name: string }[]>`
        SELECT pt.post_id, t.name as tag_name 
        FROM post_tags pt
        INNER JOIN tag t ON t.id = pt.tag_id
        WHERE pt.post_id = ANY(${postIds})
    `;

    // Group tags by post_id for O(1) lookup
    const tagsByPostId = new Map<number, string[]>();
    for (const tag of allTags) {
        if (!tagsByPostId.has(tag.post_id)) {
            tagsByPostId.set(tag.post_id, []);
        }
        tagsByPostId.get(tag.post_id)!.push(tag.tag_name);
    }

    // Transform all posts
    return postsWithRelations.map(post => {
        const postWithRelations: DbPostWithRelations = {
            ...post,
            author: post.author_name ? {
                id: post.author_id!,
                name: post.author_name,
                title: post.author_title
            } as DbAuthor : null,
            series: post.series_slug ? {
                id: post.series_id!,
                slug: post.series_slug,
                name: post.series_name!
            } as DbSeries : null,
            tags: (tagsByPostId.get(post.id) || []).map(name => ({ name } as DbTag)),
        };
        return transformDbPostToMeta(postWithRelations);
    });
}

/**
 * Fetch all unique tags from database
 */
export async function getAllTagsFromDb(): Promise<string[]> {
    const tags = await sql<DbTag[]>`
        SELECT DISTINCT t.* FROM tag t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        INNER JOIN post p ON pt.post_id = p.id
        WHERE p.published = true
        ORDER BY t.name ASC
    `;
    return tags.map((t) => t.name);
}

/**
 * Fetch all unique levels from database
 */
export async function getAllLevelsFromDb(): Promise<string[]> {
    const levels = await sql<{ level: string }[]>`
        SELECT DISTINCT level FROM post 
        WHERE published = true 
        ORDER BY level ASC
    `;
    return levels.map((l) => l.level).filter(Boolean);
}

/**
 * Fetch posts by tag
 */
export async function getPostsByTagFromDb(tagSlug: string): Promise<PostMeta[]> {
    const allPosts = await getAllPostsMetaFromDb();
    return allPosts.filter((post) =>
        post.tags?.some((t) => t.toLowerCase() === tagSlug.toLowerCase())
    );
}

/**
 * Fetch related posts based on matching tags
 */
export async function getRelatedPostsFromDb(
    currentSlug: string,
    tags: string[] = [],
    limit: number = 3
): Promise<PostMeta[]> {
    if (tags.length === 0) return [];

    const allPosts = await getAllPostsMetaFromDb();

    const scoredPosts = allPosts
        .filter((post) => post.slug !== currentSlug)
        .map((post) => {
            const matchingTags =
                post.tags?.filter((tag) =>
                    tags.some((t) => t.toLowerCase() === tag.toLowerCase())
                ) || [];
            return { post, score: matchingTags.length };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return scoredPosts.slice(0, limit).map((item) => item.post);
}

/**
 * Fetch all posts in the same series
 */
export async function getSeriesPostsFromDb(seriesSlug: string): Promise<PostMeta[]> {
    if (!seriesSlug) return [];

    const allPosts = await getAllPostsMetaFromDb();

    return allPosts
        .filter((post) => post.seriesId === seriesSlug)
        .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
}
