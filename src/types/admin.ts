/**
 * Shared admin types — used across admin forms, sections, and selectors
 */

export interface AdminTag {
    id: number;
    name: string;
    slug?: string;
    created_at?: string;
}

export interface AdminAuthor {
    id: number;
    name: string;
    title?: string;
    avatar_url?: string;
    github_url?: string;
    linkedin_url?: string;
    created_at?: string;
}

export interface AdminSeries {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    created_at?: string;
}

export interface AdminPost {
    id: number;
    title: string;
    slug?: string;
    description?: string;
    content?: string;
    image_url?: string;
    published?: boolean;
    level?: string;
    type?: string;
    series_id?: number;
    series_order?: number;
    author_id?: number;
    author_name?: string | null;
    reading_time?: string;
    tags?: string[];
    created_at?: string;
    [key: string]: unknown;
}

export interface SeriesOrderInfo {
    existingOrders: number[];
    nextOrder: number;
}

export const LEVELS = ["beginner", "intermediate", "advanced"];
export const TYPES = ["standalone", "series"];
export const STATUSES = ["all", "published", "draft"];

export const CHAR_LIMITS = {
    title: 60,
    description: 200,
    content: 20000,
} as const;
