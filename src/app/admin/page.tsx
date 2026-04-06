"use client";

import { useState, useEffect, useCallback } from "react";
import { Database, FolderOpen, FileText, LogOut } from "lucide-react";
import LoginPopup from "@/components/features/admin/common/LoginPopup";
import AddTagForm from "@/components/features/admin/forms/AddTagForm";
import AddPostForm from "@/components/features/admin/forms/AddPostForm";
import PreviewSection from "@/components/features/admin/sections/PreviewSection";
import EditPostForm from "@/components/features/admin/forms/EditPostForm";
import AuthorForm from "@/components/features/admin/forms/AuthorForm";
import EditSeriesForm from "@/components/features/admin/forms/EditSeriesForm";
import BucketManager from "@/components/features/admin/tabs/BucketManager";
import DatabaseTab from "@/components/features/admin/tabs/DatabaseTab";
import ManagementTab from "@/components/features/admin/tabs/ManagementTab";
import ConfirmPopup from "@/components/features/admin/common/ConfirmPopup";
import { Button } from "@/components/features/admin/common/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";

type TabType = "database" | "bucket" | "management";

interface Post {
    id: number;
    title: string;
    slug?: string;
    published?: boolean;
    level?: string;
    type?: string;
    author_name?: string | null;
    tags?: string[];
    [key: string]: unknown;
}

interface Tag {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface TableData {
    author: Record<string, unknown>[];
    post: Post[];
    tag: Tag[];
    series: Record<string, unknown>[];
    post_tags: Record<string, unknown>[];
}

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

interface DeleteConfirmData {
    type: "post" | "tag" | "author" | "series";
    id: number;
    name: string;
    relatedPostsCount?: number;
}

export default function AdminPage() {
    return (
        <ToastProvider>
            <AdminPageContent />
        </ToastProvider>
    );
}

function AdminPageContent() {
    const { showToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("database");
    const [tableData, setTableData] = useState<TableData>({
        author: [],
        post: [],
        tag: [],
        series: [],
        post_tags: [],
    });
    const [dataLoading, setDataLoading] = useState(false);
    const [showAddTag, setShowAddTag] = useState(false);
    const [showAddPost, setShowAddPost] = useState(false);
    const [showAddAuthor, setShowAddAuthor] = useState(false);
    const [previewPostId, setPreviewPostId] = useState<number | null>(null);
    const [editDraftId, setEditDraftId] = useState<number | null>(null);
    const [editAuthorId, setEditAuthorId] = useState<number | null>(null);
    const [editSeriesId, setEditSeriesId] = useState<number | null>(null);
    const [draftPosts, setDraftPosts] = useState<DraftPost[]>([]);
    const [draftsLoading, setDraftsLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmData | null>(null);
    const [importPostData, setImportPostData] = useState<{ title?: string; description?: string; content?: string; image_url?: string; level?: string; type?: string; author_name?: string; tags?: string[] } | null>(null);

    const fetchTableData = useCallback(async (refresh = false) => {
        setDataLoading(true);
        try {
            const tables = ["author", "post", "tag", "series", "post_tags"];
            const results = await Promise.all(
                tables.map(async (table) => {
                    const url = refresh
                        ? `/api/admin/data?table=${table}&refresh=true`
                        : `/api/admin/data?table=${table}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    return { table, data: data.success ? data.data : [] };
                })
            );

            const newData: TableData = {
                author: [],
                post: [],
                tag: [],
                series: [],
                post_tags: [],
            };
            results.forEach(({ table, data }) => {
                newData[table as keyof TableData] = data;
            });
            setTableData(newData);
        } catch (error) {
            console.error("Error fetching table data:", error);
        } finally {
            setDataLoading(false);
        }
    }, []);

    const fetchDraftPosts = useCallback(async (refresh = false) => {
        setDraftsLoading(true);
        try {
            const url = refresh ? "/api/admin/posts/drafts?refresh=true" : "/api/admin/posts/drafts";
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setDraftPosts(data.data);
            }
        } catch (error) {
            console.error("Error fetching draft posts:", error);
        } finally {
            setDraftsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Check if user is authenticated
        const authToken = localStorage.getItem("admin_auth");
        if (authToken) {
            try {
                const { expiry } = JSON.parse(authToken);
                if (expiry && Date.now() < expiry) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("admin_auth");
                    setShowLogin(true);
                }
            } catch {
                localStorage.removeItem("admin_auth");
                setShowLogin(true);
            }
        } else {
            setShowLogin(true);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated && activeTab === "database") {
            fetchTableData();
        }
        if (isAuthenticated && activeTab === "management") {
            fetchDraftPosts();
            fetchTableData();
        }
    }, [isAuthenticated, activeTab, fetchTableData, fetchDraftPosts]);

    const handleLoginSuccess = () => {
        const authData = {
            authenticated: true,
            expiry: Date.now() + 0.5 * 60 * 60 * 1000,
        };
        localStorage.setItem("admin_auth", JSON.stringify(authData));
        setIsAuthenticated(true);
        setShowLogin(false);
        showToast("success", "Logged in successfully");
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_auth");
        setIsAuthenticated(false);
        setShowLogin(true);
        showToast("info", "Logged out successfully");
    };

    const handlePostCreated = () => {
        setShowAddPost(false);
        fetchTableData(true);
        fetchDraftPosts(true);
        showToast("success", "Draft created successfully");
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        const endpoint =
            deleteConfirm.type === "post"
                ? `/api/admin/posts/${deleteConfirm.id}`
                : deleteConfirm.type === "tag"
                    ? `/api/admin/tags/${deleteConfirm.id}`
                    : deleteConfirm.type === "series"
                        ? `/api/admin/series/${deleteConfirm.id}`
                        : `/api/admin/authors/${deleteConfirm.id}`;

        const res = await fetch(endpoint, { method: "DELETE" });
        if (res.ok) {
            const typeLabel = deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1);
            const message = deleteConfirm.type === "series" && deleteConfirm.relatedPostsCount
                ? `Series and ${deleteConfirm.relatedPostsCount} related posts deleted successfully`
                : `${typeLabel} deleted successfully`;
            showToast("success", message);
            fetchTableData(true);
            if (deleteConfirm.type === "post" || deleteConfirm.type === "series") {
                fetchDraftPosts(true);
            }
            // Reset the corresponding select
            const selectId =
                deleteConfirm.type === "post"
                    ? "deletePostSelect"
                    : deleteConfirm.type === "tag"
                        ? "deleteTagSelect"
                        : deleteConfirm.type === "series"
                            ? "deleteSeriesSelect"
                            : "deleteAuthorSelect";
            const select = document.getElementById(selectId) as HTMLSelectElement;
            if (select) select.value = "";
        }
        setDeleteConfirm(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-foreground/50">Loading...</div>
            </div>
        );
    }

    return (
        <>
            {/* Popups */}
            {showLogin && !isAuthenticated && (
                <LoginPopup
                    onSuccess={handleLoginSuccess}
                    onClose={() => setShowLogin(false)}
                />
            )}

            {showAddTag && (
                <AddTagForm
                    onSuccess={() => {
                        setShowAddTag(false);
                        fetchTableData(true);
                        showToast("success", "Tag created successfully");
                    }}
                    onClose={() => setShowAddTag(false)}
                />
            )}

            {showAddPost && (
                <AddPostForm
                    onSuccess={handlePostCreated}
                    onClose={() => {
                        setShowAddPost(false);
                        setImportPostData(null);
                    }}
                    initialData={importPostData || undefined}
                    onShowToast={showToast}
                    existingTitles={tableData.post.map((p) => p.title)}
                />
            )}

            {showAddAuthor && (
                <AuthorForm
                    onSuccess={() => {
                        setShowAddAuthor(false);
                        fetchTableData(true);
                        showToast("success", "Author created successfully");
                    }}
                    onClose={() => setShowAddAuthor(false)}
                />
            )}

            {previewPostId && (
                <PreviewSection
                    postId={previewPostId}
                    onClose={() => setPreviewPostId(null)}
                />
            )}

            {editDraftId && (
                <EditPostForm
                    postId={editDraftId}
                    onClose={() => setEditDraftId(null)}
                    onUpdate={() => {
                        fetchDraftPosts(true);
                        fetchTableData(true);
                    }}
                />
            )}

            {editAuthorId && (
                <AuthorForm
                    authorId={editAuthorId}
                    onClose={() => setEditAuthorId(null)}
                    onSuccess={() => {
                        setEditAuthorId(null);
                        fetchTableData(true);
                        showToast("success", "Author updated successfully");
                    }}
                />
            )}

            {editSeriesId && (
                <EditSeriesForm
                    seriesId={editSeriesId}
                    onClose={() => setEditSeriesId(null)}
                    onSuccess={() => {
                        setEditSeriesId(null);
                        fetchTableData(true);
                        showToast("success", "Series updated successfully");
                    }}
                />
            )}

            {deleteConfirm && (
                <ConfirmPopup
                    variant="danger"
                    title={`Delete ${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)}`}
                    message={`Are you sure you want to delete this ${deleteConfirm.type}?${deleteConfirm.type === "author" ? " Posts by this author will be orphaned." :
                        deleteConfirm.type === "tag" ? " All post associations will be removed." :
                            deleteConfirm.type === "series" && deleteConfirm.relatedPostsCount
                                ? ` This will also delete ${deleteConfirm.relatedPostsCount} related post${deleteConfirm.relatedPostsCount !== 1 ? "s" : ""}.`
                                : ""
                        }`}
                    itemName={deleteConfirm.name}
                    confirmText={`Delete ${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)}`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {/* Main Content */}
            {isAuthenticated ? (
                <div className="w-full py-8 px-4 md:px-10">
                    <div className="md:mx-6 mx-4 mb-50">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-xl font-bold text-accent tracking-widest">ADMIN WORKSPACE</h1>
                            <Button
                                variant="attention"
                                size="sm"
                                onClick={handleLogout}
                                icon={<LogOut size={14} />}
                            >
                                Logout
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 mb-4 border-b border-(--border-color)">
                            <button
                                onClick={() => setActiveTab("database")}
                                className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors cursor-pointer text-sm ${activeTab === "database"
                                    ? "border-accent text-accent"
                                    : "border-transparent text-foreground/50 hover:text-foreground"
                                    }`}
                            >
                                <Database size={18} />
                                Database
                            </button>
                            <button
                                onClick={() => setActiveTab("bucket")}
                                className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors cursor-pointer text-sm ${activeTab === "bucket"
                                    ? "border-accent text-accent"
                                    : "border-transparent text-foreground/50 hover:text-foreground"
                                    }`}
                            >
                                <FolderOpen size={18} />
                                Bucket
                            </button>
                            <button
                                onClick={() => setActiveTab("management")}
                                className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors cursor-pointer text-sm ${activeTab === "management"
                                    ? "border-accent text-accent"
                                    : "border-transparent text-foreground/50 hover:text-foreground"
                                    }`}
                            >
                                <FileText size={18} />
                                Management
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "database" && (
                            <DatabaseTab
                                tableData={tableData}
                                isLoading={dataLoading}
                                onRefresh={() => {
                                    fetchTableData(true);
                                    showToast("info", "Refreshing data...");
                                }}
                            />
                        )}

                        {activeTab === "bucket" && <BucketManager />}

                        {activeTab === "management" && (
                            <ManagementTab
                                posts={tableData.post}
                                tags={tableData.tag as { id: number; name: string; slug?: string; created_at?: string }[]}
                                authors={tableData.author as { id: number; name: string; title?: string; avatar_url?: string; created_at?: string }[]}
                                series={tableData.series as { id: number; name: string; slug: string; description?: string; created_at?: string }[]}
                                draftPosts={draftPosts}
                                draftsLoading={draftsLoading}
                                isLoading={dataLoading}
                                onRefresh={() => {
                                    fetchTableData(true);
                                    fetchDraftPosts(true);
                                    showToast("info", "Refreshing data...");
                                }}
                                onAddPost={() => setShowAddPost(true)}
                                onAddTag={() => setShowAddTag(true)}
                                onAddAuthor={() => setShowAddAuthor(true)}
                                onImportPost={(data) => {
                                    setImportPostData(data);
                                    setShowAddPost(true);
                                }}
                                onShowToast={showToast}
                                onEditDraft={setEditDraftId}
                                onEditPost={setEditDraftId}
                                onEditAuthor={setEditAuthorId}
                                onEditSeries={setEditSeriesId}
                                onDeleteConfirm={setDeleteConfirm}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-foreground/70 mb-4">Admin Access Required</h1>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors cursor-pointer"
                        >
                            Login
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
