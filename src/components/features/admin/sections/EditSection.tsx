"use client";

import { Edit2 } from "lucide-react";
import { SectionCard } from "../common/SectionCard";
import type { AdminPost, AdminTag } from "@/types/admin";
import { useState } from "react";

interface EditSectionProps {
    posts: AdminPost[];
    tags: AdminTag[];
    onEditPost: (id: number) => void;
    onEditTag: (tag: AdminTag) => void;
}

export default function EditSection({ posts, tags, onEditPost, onEditTag }: EditSectionProps) {
    const [postId, setPostId] = useState<string>("");
    const [tagId, setTagId] = useState<string>("");

    return (
        <section>
            <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                Edit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SectionCard
                    title="Edit Post"
                    description="Pick a post to edit its content, category, or tags."
                    icon={Edit2}
                    colorVariant="accent"
                    selectKey={posts.length}
                    selectValue={postId}
                    selectPlaceholder={posts.length ? "Select a post..." : "No posts"}
                    selectOptions={posts.map((p) => ({ value: p.id, label: p.title }))}
                    onSelectChange={setPostId}
                    selectDisabled={posts.length === 0}
                    buttonText="Edit Post"
                    buttonDisabled={!postId}
                    onButtonClick={() => postId && onEditPost(Number(postId))}
                />
                <SectionCard
                    title="Edit Tag"
                    description={`Pick a tag to rename or change its slug.`}
                    icon={Edit2}
                    colorVariant="blue"
                    selectKey={tags.length}
                    selectValue={tagId}
                    selectPlaceholder={tags.length ? "Select a tag..." : "No tags"}
                    selectOptions={tags.map((t) => ({ value: t.id, label: t.name }))}
                    onSelectChange={setTagId}
                    selectDisabled={tags.length === 0}
                    buttonText="Edit Tag"
                    buttonDisabled={!tagId}
                    onButtonClick={() => {
                        const tag = tags.find((t) => String(t.id) === tagId);
                        if (tag) onEditTag(tag);
                    }}
                />
            </div>
        </section>
    );
}
