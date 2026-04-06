"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, Send } from "lucide-react";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/../mdx-components";
import { FormMessage } from "../common/FormFields";
import { Button } from "../common/Button";

interface PostData {
    id: number;
    slug: string;
    title: string;
    description: string;
    content: string;
    image_url: string;
    level: string;
    type: string;
    author_name: string;
    series_name: string | null;
    reading_time: string;
    tags: { id: number; name: string; slug: string }[];
}

interface PostPreviewProps {
    postId: number;
    onClose: () => void;
}

export default function PostPreview({ postId, onClose }: PostPreviewProps) {
    const router = useRouter();
    const [post, setPost] = useState<PostData | null>(null);
    const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/admin/posts/${postId}`);
                const data = await response.json();

                if (data.success) {
                    setPost(data.data);
                    // Serialize MDX content
                    const mdx = await serialize(data.data.content, {
                        mdxOptions: {
                            remarkPlugins: [remarkGfm],
                        },
                    });
                    setMdxSource(mdx);
                } else {
                    setError(data.message || "Failed to load post");
                }
            } catch (err) {
                console.error("Error fetching post:", err);
                setError("Failed to load post");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    const handlePublish = async () => {
        if (!post) return;

        setIsPublishing(true);
        setError("");

        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "publish" }),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/post/${post.slug}`);
            } else {
                setError(data.message || "Failed to publish");
            }
        } catch {
            setError("Failed to publish post");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-foreground/50">Loading preview...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="p-6 rounded-xl border border-(--border-color) bg-background text-center">
                    <p className="text-red-500 mb-4">{error || "Post not found"}</p>
                    <Button
                        variant="cancel"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl mx-4 rounded-xl border border-(--border-color) bg-background shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-(--border-color) bg-background">
                    <div className="flex items-center gap-2 text-foreground/70">
                        <Eye size={20} />
                        <span className="font-medium">Preview Draft</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="publish"
                            onClick={handlePublish}
                            disabled={isPublishing}
                            isLoading={isPublishing}
                            loadingText="Publishing..."
                            icon={<Send size={16} />}
                        >
                            Publish
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 text-foreground/50 hover:text-foreground transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-4 mt-4">
                        <FormMessage type="error" message={error} />
                    </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {/* Post Meta */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-600 font-medium">
                                DRAFT
                            </span>
                            <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent">
                                {post.level}
                            </span>
                            <span className="px-2 py-1 text-xs rounded bg-foreground/10 text-foreground/70">
                                {post.type}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-3">{post.title}</h1>
                        <p className="text-foreground/60 mb-4">{post.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/50">
                            <span>By {post.author_name}</span>
                            <span>{post.reading_time}</span>
                            {post.series_name && <span>Series: {post.series_name}</span>}
                        </div>
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-2 py-1 text-xs rounded bg-foreground/10 text-foreground/70"
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Featured Image */}
                    {post.image_url && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-(--border-color)">
                            <Image
                                src={post.image_url}
                                alt={post.title}
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
                        {mdxSource && <MDXRemote {...mdxSource} components={mdxComponents} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
