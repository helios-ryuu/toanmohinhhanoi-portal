"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import ManagementTab from "@/components/features/admin/tabs/ManagementTab";
import AddTagForm from "@/components/features/admin/forms/AddTagForm";
import DeletePreviewPopup from "@/components/features/admin/common/DeletePreviewPopup";
import EditTagForm from "@/components/features/admin/forms/EditTagForm";
import type { DeleteConfirmData } from "@/components/features/admin/sections/DeleteSection";
import type { AdminPost, AdminTag } from "@/types/admin";

function AdminWorkspace() {
    const router = useRouter();
    const { showToast } = useToast();
    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [tags, setTags] = useState<AdminTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showAddTag, setShowAddTag] = useState(false);
    const [editTag, setEditTag] = useState<AdminTag | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmData | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const [postsRes, tagsRes] = await Promise.all([
                fetch("/api/admin/posts?pageSize=50"),
                fetch("/api/admin/tags"),
            ]);
            const postsJson = await postsRes.json();
            const tagsJson = await tagsRes.json();
            if (postsJson.success) setPosts(postsJson.data.items ?? []);
            if (tagsJson.success) setTags(tagsJson.data ?? []);
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { refresh(); }, [refresh]);

    async function confirmDelete() {
        if (!deleteTarget) return;
        const url = deleteTarget.type === "post"
            ? `/api/admin/posts/${deleteTarget.id}`
            : `/api/admin/tags/${deleteTarget.id}`;
        try {
            const res = await fetch(url, { method: "DELETE" });
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Delete failed");
            showToast("success", `${deleteTarget.type} deleted`);
            setDeleteTarget(null);
            refresh();
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Delete failed");
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-widest text-accent">ADMIN WORKSPACE</h1>
                <p className="text-sm text-foreground/60 mt-1">
                    Manage posts and tags. Contest admin tools coming with M4.
                </p>
            </header>

            <ManagementTab
                posts={posts}
                tags={tags}
                isLoading={isLoading}
                onRefresh={refresh}
                onAddPost={() => router.push("/admin/posts/new")}
                onAddTag={() => setShowAddTag(true)}
                onEditPost={(id) => router.push(`/admin/posts/${id}/edit`)}
                onEditTag={(tag) => setEditTag(tag)}
                onDeleteConfirm={(data) => setDeleteTarget(data)}
                onShowToast={showToast}
            />

            {showAddTag && (
                <AddTagForm
                    onSuccess={() => refresh()}
                    onClose={() => setShowAddTag(false)}
                />
            )}

            {editTag && (
                <EditTagForm
                    tag={editTag}
                    onSuccess={() => refresh()}
                    onClose={() => setEditTag(null)}
                />
            )}

            {deleteTarget && (
                <DeletePreviewPopup
                    data={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirmDelete={confirmDelete}
                />
            )}
        </div>
    );
}

export default function AdminPage() {
    return (
        <ToastProvider>
            <AdminWorkspace />
        </ToastProvider>
    );
}
