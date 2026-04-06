export type Level = "beginner" | "intermediate" | "advanced";
export type PostType = "standalone" | "series";

export interface PostFrontmatter {
    author?: string;
    authorTitle?: string;
    title: string;
    description: string;
    date: string;
    image?: string;
    tags?: string[];
    level?: Level;
    type?: PostType;
    seriesId?: string;
    seriesOrder?: number;
}

export interface Post extends PostFrontmatter {
    slug: string;
    content: string;
    readingTime: string;
}

export interface PostMeta extends PostFrontmatter {
    slug: string;
    readingTime: string;
}

/** Shared props for PostCard and PostListItem */
export interface PostItemProps {
    slug: string;
    image?: string;
    author?: string;
    authorTitle?: string;
    title: string;
    description: string;
    date?: string;
    readingTime?: string;
    level?: Level;
    tags?: string[];
    type?: PostType;
    seriesOrder?: number;
    onClick?: () => void;
    className?: string;
}
