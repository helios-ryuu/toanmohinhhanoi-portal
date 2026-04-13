"use client";

import { FileText, Tag } from "lucide-react";
import ConfirmPopup from "./ConfirmPopup";

interface DeletePreviewData {
    type: "post" | "tag";
    id: number;
    name: string;
    slug?: string;
    category?: string;
    published?: boolean;
    tags?: string[];
}

interface DeletePreviewPopupProps {
    data: DeletePreviewData;
    onCancel: () => void;
    onConfirmDelete: () => void;
}

const typeIcons = { post: FileText, tag: Tag };
const typeLabels = { post: "Post", tag: "Tag" };

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="p-3 rounded-lg bg-foreground/5 border border-(--border-color)">
            <p className="text-xs text-foreground/50 mb-1">{label}</p>
            {children}
        </div>
    );
}

export default function DeletePreviewPopup({ data, onCancel, onConfirmDelete }: DeletePreviewPopupProps) {
    return (
        <ConfirmPopup
            variant="danger"
            icon={typeIcons[data.type]}
            title={`Delete ${typeLabels[data.type]}`}
            message={`You are about to delete this ${data.type}. This action cannot be undone.`}
            confirmText="Delete"
            onConfirm={onConfirmDelete}
            onCancel={onCancel}
        >
            <div className="space-y-3">
                <InfoRow label="Name">
                    <p className="font-medium text-foreground">{data.name}</p>
                </InfoRow>

                {data.slug && (
                    <InfoRow label="Slug">
                        <p className="text-sm text-foreground font-mono">{data.slug}</p>
                    </InfoRow>
                )}

                {data.type === "post" && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            {data.category && (
                                <InfoRow label="Category">
                                    <p className="text-sm text-foreground capitalize">{data.category}</p>
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
            </div>
        </ConfirmPopup>
    );
}
