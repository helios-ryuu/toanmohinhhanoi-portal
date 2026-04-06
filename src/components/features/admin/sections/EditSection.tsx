"use client";

import { useState } from "react";
import { Pencil, FileText, Users, Library } from "lucide-react";
import { SectionCard } from "../common/SectionCard";
import { AdvancedSelector } from "../common/AdvancedSelector";
import type { AdminPost, AdminSeries, AdminTag } from "@/types/admin";
import { LEVELS, TYPES, STATUSES } from "@/types/admin";

interface EditSectionProps {
    posts: AdminPost[];
    tags: AdminTag[];
    authors: { id: number; name: string; title?: string; avatar_url?: string; created_at?: string }[];
    series: AdminSeries[];
    onEditPost: (id: number) => void;
    onEditAuthor: (id: number) => void;
    onEditSeries?: (id: number) => void;
}

export default function EditSection({ posts, tags, authors, series, onEditPost, onEditAuthor, onEditSeries }: EditSectionProps) {
    const [showAdvancedPostSelector, setShowAdvancedPostSelector] = useState(false);
    const [showAdvancedSeriesSelector, setShowAdvancedSeriesSelector] = useState(false);

    const postOptions = posts.map((post) => ({
        value: post.id as number,
        label: `[${post.published ? "✓" : "○"}] ${post.title as string}`,
    }));

    const authorOptions = authors.map((author) => ({
        value: author.id as number,
        label: author.name as string,
    }));

    const seriesOptions = series.map((s) => ({
        value: s.id,
        label: s.name,
    }));

    return (
        <>
            <div className="bg-blue-500/5 p-6 rounded-lg border border-blue-500/70">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Pencil size={20} className="text-blue-500" />
                    Edit
                </h2>
                <div className="grid gap-4 grid-cols-4 md:grid-cols-8 auto-rows-fr">
                    <SectionCard
                        title="Edit Post"
                        description="Select a post to edit"
                        className="col-span-4 md:col-span-3"
                        colorVariant="blue"
                        icon={FileText}
                        selectPlaceholder="Select a post..."
                        selectOptions={postOptions}
                        onSelectChange={(value) => value && onEditPost(parseInt(value))}
                        onSecondaryButtonClick={() => setShowAdvancedPostSelector(true)}
                        legend="✓ = Published, ○ = Draft"
                    />
                    <SectionCard
                        title="Edit Series"
                        description="Modify series name/slug"
                        className="col-span-4 md:col-span-3"
                        colorVariant="blue"
                        icon={Library}
                        selectPlaceholder="Select a series..."
                        selectOptions={seriesOptions}
                        onSelectChange={(value) => value && onEditSeries?.(parseInt(value))}
                        onSecondaryButtonClick={() => setShowAdvancedSeriesSelector(true)}
                    />
                    <SectionCard
                        title="Edit Author"
                        description="Modify author info"
                        className="col-span-4 md:col-span-2"
                        colorVariant="blue"
                        icon={Users}
                        selectPlaceholder="Select an author..."
                        selectOptions={authorOptions}
                        onSelectChange={(value) => value && onEditAuthor(parseInt(value))}
                    />
                </div>
            </div>

            {showAdvancedPostSelector && (
                <AdvancedSelector<AdminPost>
                    items={posts}
                    title="Select Post to Edit"
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
                    onSelect={(p) => {
                        setShowAdvancedPostSelector(false);
                        onEditPost(p.id);
                    }}
                    onClose={() => setShowAdvancedPostSelector(false)}
                />
            )}

            {showAdvancedSeriesSelector && (
                <AdvancedSelector<AdminSeries>
                    items={series}
                    title="Select Series to Edit"
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
                    onSelect={(s) => {
                        setShowAdvancedSeriesSelector(false);
                        onEditSeries?.(s.id);
                    }}
                    onClose={() => setShowAdvancedSeriesSelector(false)}
                />
            )}
        </>
    );
}
