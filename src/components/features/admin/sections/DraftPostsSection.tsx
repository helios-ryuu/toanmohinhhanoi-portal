"use client";

import { Edit3, Clock } from "lucide-react";
import Image from "next/image";

interface DraftPost {
    id: number;
    slug: string;
    title: string;
    description: string;
    image_url: string;
    level: string;
    type: string;
    created_at: string;
    updated_at: string;
    author_name: string | null;
    series_name: string | null;
    series_order: number | null;
}

interface DraftPostsSectionProps {
    draftPosts: DraftPost[];
    isLoading: boolean;
    onEditDraft: (id: number) => void;
}

export default function DraftPostsSection({ draftPosts, isLoading, onEditDraft }: DraftPostsSectionProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Edit3 size={20} className="text-yellow-500" />
                Draft Posts
            </h2>
            {isLoading ? (
                <div className="text-foreground/50 text-center py-8">Loading drafts...</div>
            ) : draftPosts.length === 0 ? (
                <div className="text-foreground/50 text-center py-8 border border-dashed border-(--border-color) rounded-lg">
                    No draft posts. Create a new post to get started.
                </div>
            ) : (
                <div className="grid gap-3">
                    {draftPosts.map((draft) => (
                        <button
                            key={draft.id}
                            onClick={() => onEditDraft(draft.id)}
                            className="p-4 rounded-lg border border-(--border-color) bg-(--post-card) hover:border-accent transition-colors text-left flex items-start gap-4"
                        >
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-foreground/10 shrink-0 relative">
                                {draft.image_url && (
                                    <Image
                                        src={draft.image_url}
                                        alt={draft.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground truncate">{draft.title}</h3>
                                <p className="text-sm text-foreground/60 line-clamp-1">{draft.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-foreground/40">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(draft.updated_at).toLocaleDateString()}
                                    </span>
                                    {draft.author_name && (
                                        <span>by {draft.author_name}</span>
                                    )}
                                    {draft.series_name && (
                                        <span className="text-accent">
                                            {draft.series_name} #{draft.series_order}
                                        </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${draft.level === "beginner" ? "bg-green-500/20 text-green-400" :
                                        draft.level === "intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                                            "bg-red-500/20 text-red-400"
                                        }`}>
                                        {draft.level}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
