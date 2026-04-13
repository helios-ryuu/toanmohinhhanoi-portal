"use client";

import { Trash2 } from "lucide-react";
import { SectionCard } from "../common/SectionCard";
import type { AdminPost, AdminTag } from "@/types/admin";
import { useState } from "react";

export interface DeleteConfirmData {
    type: "post" | "tag";
    id: number;
    name: string;
    slug?: string;
    category?: string;
    published?: boolean;
    tags?: string[];
}

interface DeleteSectionProps {
    posts: AdminPost[];
    tags: AdminTag[];
    onDeleteConfirm: (data: DeleteConfirmData) => void;
}

export default function DeleteSection({ posts, tags, onDeleteConfirm }: DeleteSectionProps) {
    const [postId, setPostId] = useState<string>("");
    const [tagId, setTagId] = useState<string>("");

    return (
        <section>
            <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                Delete
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SectionCard
                    title="Delete Post"
                    description="Permanently remove a post and its tag relations."
                    icon={Trash2}
                    colorVariant="red"
                    selectKey={posts.length}
                    selectValue={postId}
                    selectPlaceholder={posts.length ? "Select a post..." : "No posts"}
                    selectOptions={posts.map((p) => ({ value: p.id, label: p.title }))}
                    onSelectChange={setPostId}
                    selectDisabled={posts.length === 0}
                    buttonText="Delete Post"
                    buttonVariant="danger"
                    buttonDisabled={!postId}
                    onButtonClick={() => {
                        const p = posts.find((x) => x.id === Number(postId));
                        if (!p) return;
                        onDeleteConfirm({
                            type: "post",
                            id: p.id,
                            name: p.title,
                            slug: p.slug,
                            category: p.category,
                            published: p.published,
                            tags: p.tags,
                        });
                    }}
                />
                <SectionCard
                    title="Delete Tag"
                    description="Remove a tag. Posts using it will be untagged."
                    icon={Trash2}
                    colorVariant="red"
                    selectKey={tags.length}
                    selectValue={tagId}
                    selectPlaceholder={tags.length ? "Select a tag..." : "No tags"}
                    selectOptions={tags.map((t) => ({ value: t.id, label: t.name }))}
                    onSelectChange={setTagId}
                    selectDisabled={tags.length === 0}
                    buttonText="Delete Tag"
                    buttonVariant="danger"
                    buttonDisabled={!tagId}
                    onButtonClick={() => {
                        const t = tags.find((x) => x.id === Number(tagId));
                        if (!t) return;
                        onDeleteConfirm({ type: "tag", id: t.id, name: t.name, slug: t.slug });
                    }}
                />
            </div>
        </section>
    );
}
