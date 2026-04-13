"use client";

import { FilePlus, Tag } from "lucide-react";
import { SectionCard } from "../common/SectionCard";

interface CreateSectionProps {
    onAddPost: () => void;
    onAddTag: () => void;
}

export default function CreateSection({ onAddPost, onAddTag }: CreateSectionProps) {
    return (
        <section>
            <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                Create
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SectionCard
                    title="New Post"
                    description="Create a blog post (news, announcement, tutorial, result)."
                    icon={FilePlus}
                    onClick={onAddPost}
                    colorVariant="accent"
                />
                <SectionCard
                    title="New Tag"
                    description="Create a tag for categorising posts."
                    icon={Tag}
                    onClick={onAddTag}
                    colorVariant="blue"
                />
            </div>
        </section>
    );
}
