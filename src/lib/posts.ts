import type { Post, PostMeta } from "@/types/post";
import {
    getPostBySlugFromDb,
    getAllPostsMetaFromDb,
    getAllTagsFromDb,
    getPostsByTagFromDb,
    getRelatedPostsFromDb,
    getSeriesPostsFromDb,
} from "./posts-db";

// ============================================
// DATABASE-ONLY API
// All data is fetched from Supabase
// ============================================

/**
 * Get post data by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    return getPostBySlugFromDb(slug);
}

/**
 * Get all posts metadata (without content)
 */
export async function getAllPostsMeta(): Promise<PostMeta[]> {
    return getAllPostsMetaFromDb();
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
    return getAllTagsFromDb();
}

/**
 * Get all unique levels
 */
export async function getAllLevels(): Promise<string[]> {
    const { getAllLevelsFromDb } = await import("./posts-db");
    return getAllLevelsFromDb();
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
    return getPostsByTagFromDb(tag);
}

/**
 * Get related posts based on matching tags
 */
export async function getRelatedPosts(
    currentSlug: string,
    tags: string[] = [],
    limit: number = 3
): Promise<PostMeta[]> {
    return getRelatedPostsFromDb(currentSlug, tags, limit);
}

/**
 * Get all posts in the same series
 */
export async function getSeriesPosts(seriesSlug: string): Promise<PostMeta[]> {
    return getSeriesPostsFromDb(seriesSlug);
}
