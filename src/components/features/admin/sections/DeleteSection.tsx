"use client";

import { useState } from "react";
import { Trash2, FileText, Tag, Users, Library } from "lucide-react";
import { SectionCard } from "../common/SectionCard";
import { AdvancedSelector } from "../common/AdvancedSelector";
import DeletePreviewPopup from "../common/DeletePreviewPopup";
import type { AdminPost, AdminTag, AdminAuthor, AdminSeries } from "@/types/admin";
import { LEVELS, TYPES, STATUSES } from "@/types/admin";

interface DeleteConfirmData {
    type: "post" | "tag" | "author" | "series";
    id: number;
    name: string;
    relatedPostsCount?: number;
}

interface DeletePreviewData {
    type: "post" | "tag" | "author" | "series";
    id: number;
    name: string;
    slug?: string;
    level?: string;
    postType?: string;
    published?: boolean;
    authorName?: string;
    tags?: string[];
    relatedPostsCount?: number;
}

interface DeleteSectionProps {
    posts: AdminPost[];
    tags: AdminTag[];
    authors: AdminAuthor[];
    series: AdminSeries[];
    onDeleteConfirm: (data: DeleteConfirmData) => void;
}

export default function DeleteSection({ posts, tags, authors, series, onDeleteConfirm }: DeleteSectionProps) {
    const [activeSelector, setActiveSelector] = useState<"post" | "series" | "tag" | "author" | null>(null);
    const [previewData, setPreviewData] = useState<DeletePreviewData | null>(null);

    const previewPost = (post: AdminPost) => {
        setPreviewData({
            type: "post",
            id: post.id,
            name: post.title,
            slug: post.slug,
            level: post.level,
            postType: post.type,
            published: post.published,
            authorName: post.author_name || undefined,
            tags: post.tags,
        });
    };

    const previewSeries = (s: AdminSeries) => {
        const relatedPosts = posts.filter((p) => p.series_id === s.id);
        setPreviewData({
            type: "series",
            id: s.id,
            name: s.name,
            slug: s.slug,
            relatedPostsCount: relatedPosts.length,
        });
    };

    const handleConfirmDelete = () => {
        if (previewData) {
            onDeleteConfirm({
                type: previewData.type,
                id: previewData.id,
                name: previewData.name,
                relatedPostsCount: previewData.relatedPostsCount,
            });
            setPreviewData(null);
        }
    };

    const postOptions = posts.map((post) => ({ value: post.id as number, label: post.title as string }));
    const tagOptions = tags.map((tag) => ({ value: tag.id as number, label: tag.name as string }));
    const authorOptions = authors.map((author) => ({ value: author.id as number, label: author.name as string }));
    const seriesOptions = series.map((s) => ({ value: s.id, label: s.name }));

    return (
        <>
            <div className="bg-red-500/5 p-6 rounded-lg border border-red-500/70">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Trash2 size={20} className="text-red-500" />
                    Delete
                </h2>
                <div className="grid gap-4 grid-cols-4 auto-rows-fr">
                    <SectionCard
                        title="Delete Post"
                        description="Select a post to delete"
                        className="col-span-4 md:col-span-3"
                        colorVariant="red"
                        icon={FileText}
                        selectPlaceholder="Select a post..."
                        selectOptions={postOptions}
                        onSelectChange={(postId) => {
                            const post = posts.find((p) => String(p.id) === postId);
                            if (post) previewPost(post);
                        }}
                        onSecondaryButtonClick={() => setActiveSelector("post")}
                    />
                    <SectionCard
                        title="Delete Author"
                        description="Select an author to delete"
                        className="col-span-4 md:col-span-1"
                        colorVariant="red"
                        icon={Users}
                        selectPlaceholder="Select an author..."
                        selectOptions={authorOptions}
                        onSelectChange={(authorId) => {
                            const author = authors.find((a) => String(a.id) === authorId);
                            if (author) setPreviewData({ type: "author", id: author.id, name: author.name });
                        }}
                        onSecondaryButtonClick={() => setActiveSelector("author")}
                    />
                    <SectionCard
                        title="Delete Series"
                        description="Delete series and all related posts"
                        className="col-span-4 md:col-span-3"
                        colorVariant="red"
                        icon={Library}
                        selectPlaceholder="Select a series..."
                        selectOptions={seriesOptions}
                        onSelectChange={(seriesId) => {
                            const s = series.find((x) => String(x.id) === seriesId);
                            if (s) previewSeries(s);
                        }}
                        onSecondaryButtonClick={() => setActiveSelector("series")}
                    />
                    <SectionCard
                        title="Delete Tag"
                        description="Select a tag to delete"
                        className="col-span-4 md:col-span-1"
                        colorVariant="red"
                        icon={Tag}
                        selectPlaceholder="Select a tag..."
                        selectOptions={tagOptions}
                        onSelectChange={(tagId) => {
                            const tag = tags.find((t) => String(t.id) === tagId);
                            if (tag) setPreviewData({ type: "tag", id: tag.id, name: tag.name });
                        }}
                        onSecondaryButtonClick={() => setActiveSelector("tag")}
                    />
                </div>
            </div>

            {/* Generic AdvancedSelector modals */}
            {activeSelector === "post" && (
                <AdvancedSelector<AdminPost>
                    items={posts}
                    title="Select Post to Delete"
                    icon={FileText}
                    getKey={(p) => p.id}
                    searchFn={(p, q) => p.title.toLowerCase().includes(q.toLowerCase())}
                    getDate={(p) => p.created_at}
                    filters={[
                        { key: "level", placeholder: "Level", options: [{ value: "", label: "All Levels" }, ...LEVELS.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))] },
                        { key: "type", placeholder: "Type", options: [{ value: "", label: "All Types" }, ...TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))] },
                        { key: "status", placeholder: "Status", options: STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
                        { key: "tag", placeholder: "Tag", options: [{ value: "", label: "All Tags" }, ...tags.map((t) => ({ value: t.name, label: t.name }))] },
                    ]}
                    filterFn={(p, fv) => {
                        if (fv.level && p.level !== fv.level) return false;
                        if (fv.type && p.type !== fv.type) return false;
                        if (fv.status && fv.status !== "all") {
                            if (fv.status === "published" && !p.published) return false;
                            if (fv.status === "draft" && p.published) return false;
                        }
                        if (fv.tag && !p.tags?.includes(fv.tag)) return false;
                        return true;
                    }}
                    renderItem={(p) => (
                        <div className="flex items-center gap-3">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${p.published ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                                {p.published ? "PUB" : "DFT"}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                                <p className="text-xs text-foreground/50 capitalize">{p.level} • {p.type}</p>
                            </div>
                        </div>
                    )}
                    onSelect={(p) => { setActiveSelector(null); previewPost(p); }}
                    onClose={() => setActiveSelector(null)}
                />
            )}

            {activeSelector === "series" && (
                <AdvancedSelector<AdminSeries>
                    items={series}
                    title="Select Series to Delete"
                    icon={Library}
                    getKey={(s) => s.id}
                    searchFn={(s, q) => s.name.toLowerCase().includes(q.toLowerCase())}
                    getDate={(s) => s.created_at}
                    renderItem={(s) => (
                        <div>
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-foreground/50 font-mono">{s.slug}</p>
                        </div>
                    )}
                    onSelect={(s) => { setActiveSelector(null); previewSeries(s); }}
                    onClose={() => setActiveSelector(null)}
                />
            )}

            {activeSelector === "tag" && (
                <AdvancedSelector<AdminTag>
                    items={tags}
                    title="Select Tag to Delete"
                    icon={Tag}
                    getKey={(t) => t.id}
                    searchFn={(t, q) => t.name.toLowerCase().includes(q.toLowerCase())}
                    getDate={(t) => t.created_at}
                    renderItem={(t) => (
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                    )}
                    onSelect={(t) => { setActiveSelector(null); setPreviewData({ type: "tag", id: t.id, name: t.name }); }}
                    onClose={() => setActiveSelector(null)}
                />
            )}

            {activeSelector === "author" && (
                <AdvancedSelector<AdminAuthor>
                    items={authors}
                    title="Select Author to Delete"
                    icon={Users}
                    getKey={(a) => a.id}
                    searchFn={(a, q) => a.name.toLowerCase().includes(q.toLowerCase())}
                    getDate={(a) => a.created_at}
                    renderItem={(a) => (
                        <div>
                            <p className="text-sm font-medium text-foreground">{a.name}</p>
                            {a.title && <p className="text-xs text-foreground/50">{a.title}</p>}
                        </div>
                    )}
                    onSelect={(a) => { setActiveSelector(null); setPreviewData({ type: "author", id: a.id, name: a.name }); }}
                    onClose={() => setActiveSelector(null)}
                />
            )}

            {previewData && (
                <DeletePreviewPopup
                    data={previewData}
                    onCancel={() => setPreviewData(null)}
                    onConfirmDelete={handleConfirmDelete}
                />
            )}
        </>
    );
}
