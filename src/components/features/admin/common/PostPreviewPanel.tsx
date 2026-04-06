"use client";

import { Eye, RefreshCw } from "lucide-react";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "@/../mdx-components";
import type { AdminTag, AdminAuthor } from "@/types/admin";

interface PostPreviewPanelProps {
    title: string;
    description: string;
    imageUrl: string;
    level: string;
    readingTime: string;
    authorId: string;
    authors: AdminAuthor[];
    selectedTags: number[];
    tags: AdminTag[];
    mdxSource: MDXRemoteSerializeResult | null;
    onRender?: () => void;
}

export function PostPreviewPanel({
    title,
    description,
    imageUrl,
    level,
    readingTime,
    authorId,
    authors,
    selectedTags,
    tags,
    mdxSource,
    onRender,
}: PostPreviewPanelProps) {
    const authorName = authors.find((a) => a.id.toString() === authorId)?.name || "Unknown Author";

    const levelStyles: Record<string, string> = {
        beginner: "bg-green-500/20 text-green-500",
        intermediate: "bg-yellow-500/20 text-yellow-500",
        advanced: "bg-red-500/20 text-red-500",
    };

    return (
        <div className="w-1/2 h-full flex flex-col bg-background">
            <div className="flex items-center gap-2 py-2 px-6 border-b border-(--border-color) text-foreground/70">
                <Eye size={20} />
                <span className="font-medium text-xs">Preview</span>
                {onRender && (
                    <button
                        onClick={onRender}
                        className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-(--border-color) rounded-md text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all cursor-pointer"
                        title="Refresh Preview"
                    >
                        <RefreshCw size={14} />
                        Render
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {/* Post Header - matching actual post page */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {title || "Untitled"}
                    </h1>
                    <p className="text-sm mt-2 text-foreground/70">
                        {description || "No description"}
                    </p>
                    {/* PostMeta style */}
                    <div className="flex items-center gap-2 text-foreground/50 text-sm mt-4 mb-3">
                        <span>{authorName}</span>
                        <span>•</span>
                        <span>{readingTime ? `${readingTime} min read` : "? min read"}</span>
                        {level && (
                            <>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${levelStyles[level] || ""}`}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </span>
                            </>
                        )}
                    </div>
                    {/* TagList style */}
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {selectedTags.map((tagId) => {
                                const tag = tags.find((t) => t.id === tagId);
                                return tag ? (
                                    <span
                                        key={tag.id}
                                        className="px-2.5 py-0.5 text-xs rounded-[4px] bg-accent/20 text-accent"
                                    >
                                        {tag.name}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                </header>

                {/* Featured Image */}
                {imageUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-(--border-color)">
                        <Image
                            src={imageUrl}
                            alt={title}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto object-cover"
                            unoptimized
                        />
                    </div>
                )}

                {/* MDX Content */}
                <div className="prose prose-invert max-w-none">
                    {mdxSource ? (
                        <MDXRemote {...mdxSource} components={mdxComponents} />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-foreground/40 italic gap-2">
                            <p>Click &quot;Preview&quot; to render content</p>
                            {onRender && (
                                <button
                                    onClick={onRender}
                                    className="flex items-center gap-2 px-3 py-1.5 mt-2 text-sm border border-(--border-color) rounded-md hover:bg-foreground/5 hover:text-foreground transition-colors cursor-pointer not-italic"
                                >
                                    <RefreshCw size={14} />
                                    Render Preview
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
