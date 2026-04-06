// Database Types - matching Supabase schema

export interface DbAuthor {
    id: number;
    name: string;
    title: string;
    avatar_url: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    created_at: string;
}

export interface DbTag {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}

export interface DbSeries {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export interface DbPost {
    id: number;
    slug: string;
    title: string;
    description: string;
    content: string;
    image_url: string;
    level: "beginner" | "intermediate" | "advanced";
    type: "standalone" | "series";
    series_id: number | null;
    series_order: number | null;
    author_id: number | null;
    reading_time: string;
    published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface DbPostTag {
    post_id: number;
    tag_id: number;
    created_at: string;
}

// Extended types with joins
export interface DbPostWithRelations extends DbPost {
    author: DbAuthor | null;
    series: DbSeries | null;
    tags: DbTag[];
}
