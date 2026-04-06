"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostMeta } from "@/types/post";

interface SeriesNavigationProps {
    currentPost: PostMeta;
    seriesPosts: PostMeta[];
}

export default function SeriesNavigation({ currentPost, seriesPosts }: SeriesNavigationProps) {
    if (!currentPost.seriesId || seriesPosts.length <= 1) {
        return null;
    }

    // Sort by seriesOrder
    const sortedPosts = [...seriesPosts].sort((a, b) =>
        (a.seriesOrder || 0) - (b.seriesOrder || 0)
    );

    const currentIndex = sortedPosts.findIndex(p => p.slug === currentPost.slug);
    const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

    return (
        <div className="mt-4 mb-8 pt-4 border-t border-(--border-color)">
            <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs font-bold tracking-widest text-accent">
                    SERIES
                </span>
                <span className="text-xs text-foreground/50">
                    Part {currentIndex + 1} of {sortedPosts.length}
                </span>
            </div>

            <div className="flex justify-between gap-4">
                {/* Previous */}
                <div className="flex-1">
                    {prevPost && (
                        <Link
                            href={`/post/${prevPost.slug}`}
                            className="group flex items-center gap-2 p-3 rounded-lg border border-(--border-color) hover:border-accent/50 hover:bg-accent/5 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-foreground/50 group-hover:text-accent" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground/50">Previous</p>
                                <p className="text-xs font-medium truncate group-hover:text-accent whitespace-normal">{prevPost.title}</p>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Next */}
                <div className="flex-1">
                    {nextPost && (
                        <Link
                            href={`/post/${nextPost.slug}`}
                            className="group flex items-center gap-2 p-3 rounded-lg border border-(--border-color) hover:border-accent/50 hover:bg-accent/5 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground/50">Next</p>
                                <p className="text-xs font-medium truncate group-hover:text-accent whitespace-normal">{nextPost.title}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-foreground/50 group-hover:text-accent" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
