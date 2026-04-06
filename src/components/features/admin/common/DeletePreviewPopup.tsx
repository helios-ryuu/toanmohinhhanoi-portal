"use client";

import { FileText, Tag, Users, Library, AlertTriangle } from "lucide-react";
import ConfirmPopup from "./ConfirmPopup";

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

interface DeletePreviewPopupProps {
    data: DeletePreviewData;
    onCancel: () => void;
    onConfirmDelete: () => void;
}

const typeIcons = { post: FileText, tag: Tag, author: Users, series: Library };
const typeLabels = { post: "Post", tag: "Tag", author: "Author", series: "Series" };

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="p-3 rounded-lg bg-foreground/5 border border-(--border-color)">
            <p className="text-xs text-foreground/50 mb-1">{label}</p>
            {children}
        </div>
    );
}

export default function DeletePreviewPopup({ data, onCancel, onConfirmDelete }: DeletePreviewPopupProps) {
    const warningMessage = data.type === "series" && data.relatedPostsCount && data.relatedPostsCount > 0
        ? `This will permanently delete the series and ${data.relatedPostsCount} related post${data.relatedPostsCount !== 1 ? "s" : ""}. This action cannot be undone.`
        : `You are about to delete this ${data.type}. This action cannot be undone.`;

    return (
        <ConfirmPopup
            variant="danger"
            icon={typeIcons[data.type]}
            title={`Delete ${typeLabels[data.type]}`}
            message={warningMessage}
            confirmText="Delete"
            onConfirm={onConfirmDelete}
            onCancel={onCancel}
        >
            {/* Preview Info */}
            <div className="space-y-3">
                <InfoRow label="Name">
                    <p className="font-medium text-foreground">{data.name}</p>
                </InfoRow>

                {(data.type === "post" || data.type === "series") && data.slug && (
                    <InfoRow label="Slug">
                        <p className="text-sm text-foreground font-mono">{data.slug}</p>
                    </InfoRow>
                )}

                {data.type === "post" && (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            {data.level && (
                                <InfoRow label="Level">
                                    <p className="text-sm text-foreground capitalize">{data.level}</p>
                                </InfoRow>
                            )}
                            {data.postType && (
                                <InfoRow label="Type">
                                    <p className="text-sm text-foreground capitalize">{data.postType}</p>
                                </InfoRow>
                            )}
                            {data.published !== undefined && (
                                <InfoRow label="Status">
                                    <p className={`text-sm ${data.published ? "text-green-500" : "text-yellow-500"}`}>
                                        {data.published ? "Published" : "Draft"}
                                    </p>
                                </InfoRow>
                            )}
                        </div>
                        {data.authorName && (
                            <InfoRow label="Author">
                                <p className="text-sm text-foreground">{data.authorName}</p>
                            </InfoRow>
                        )}
                        {data.tags && data.tags.length > 0 && (
                            <InfoRow label="Tags">
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {data.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </InfoRow>
                        )}
                    </>
                )}

                {data.type === "series" && data.relatedPostsCount !== undefined && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-xs text-red-400 mb-1">Posts to be deleted</p>
                        <p className="text-lg font-bold text-red-500">{data.relatedPostsCount}</p>
                    </div>
                )}
            </div>
        </ConfirmPopup>
    );
}
