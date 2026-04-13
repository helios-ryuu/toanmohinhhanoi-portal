"use client";

import { RefreshCw } from "lucide-react";
import CreateSection from "../sections/CreateSection";
import DraftPostsSection from "../sections/DraftPostsSection";
import EditSection from "../sections/EditSection";
import DeleteSection, { type DeleteConfirmData } from "../sections/DeleteSection";
import PreviewSection from "../sections/PreviewSection";
import { Button } from "../common/Button";
import type { AdminPost, AdminTag } from "@/types/admin";

interface ManagementTabProps {
    posts: AdminPost[];
    tags: AdminTag[];
    isLoading?: boolean;
    onRefresh: () => void;
    onAddPost: () => void;
    onAddTag: () => void;
    onEditPost: (id: number) => void;
    onEditTag: (tag: AdminTag) => void;
    onDeleteConfirm: (data: DeleteConfirmData) => void;
    onShowToast?: (type: "success" | "error" | "info" | "warning", message: string) => void;
}

export default function ManagementTab({
    posts,
    tags,
    isLoading,
    onRefresh,
    onAddPost,
    onAddTag,
    onEditPost,
    onEditTag,
    onDeleteConfirm,
    onShowToast,
}: ManagementTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Content Management</h2>
                <Button
                    variant="utility"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    isLoading={isLoading}
                    loadingText="Loading..."
                    icon={<RefreshCw size={14} />}
                >
                    Refresh
                </Button>
            </div>

            <CreateSection onAddPost={onAddPost} onAddTag={onAddTag} />
            <DraftPostsSection
                posts={posts}
                isLoading={isLoading}
                onEditDraft={onEditPost}
                onPublished={onRefresh}
                onShowToast={onShowToast}
            />
            <EditSection posts={posts} tags={tags} onEditPost={onEditPost} onEditTag={onEditTag} />
            <DeleteSection posts={posts} tags={tags} onDeleteConfirm={onDeleteConfirm} />
            <PreviewSection posts={posts} tags={tags} isLoading={isLoading} />
        </div>
    );
}
