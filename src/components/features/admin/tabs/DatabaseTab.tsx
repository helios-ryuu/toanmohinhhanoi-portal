"use client";

import { RefreshCw, Download } from "lucide-react";
import DataTable from "../common/DataTable";
import { Button } from "../common/Button";

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

interface TableData {
    author: Record<string, unknown>[];
    post: Post[];
    tag: Record<string, unknown>[];
    series: Record<string, unknown>[];
    post_tags: Record<string, unknown>[];
}

interface DatabaseTabProps {
    tableData: TableData;
    isLoading: boolean;
    onRefresh: () => void;
}

export default function DatabaseTab({ tableData, isLoading, onRefresh }: DatabaseTabProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Database Tables</h2>
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

            <DataTable
                title="Authors"
                columns={[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "title", label: "Title" },
                    { key: "avatar_url", label: "Avatar" },
                    { key: "github_url", label: "GitHub" },
                    { key: "created_at", label: "Created At" },
                ]}
                data={tableData.author}
                isLoading={isLoading}
            />

            <DataTable
                title="Posts"
                columns={[
                    { key: "id", label: "ID" },
                    { key: "title", label: "Title" },
                    { key: "slug", label: "Slug" },
                    { key: "author_name", label: "Author" },
                    { key: "level", label: "Level" },
                    { key: "type", label: "Type" },
                    { key: "series_name", label: "Series" },
                    { key: "published", label: "Published" },
                    { key: "published_at", label: "Published At" },
                    { key: "created_at", label: "Created At" },
                    {
                        key: "actions",
                        label: "Actions",
                        render: (_, row) => {
                            if (!row.slug) return null;
                            return (
                                <a
                                    href={`/api/post/${row.slug}/download?format=md`}
                                    download={`${row.slug}.md`}
                                    className="text-accent hover:text-accent/80 transition-colors p-1 rounded-md hover:bg-accent/10 inline-flex"
                                    title="Download Markdown"
                                >
                                    <Download size={16} />
                                </a>
                            );
                        },
                    },
                ]}
                data={tableData.post}
                isLoading={isLoading}
            />

            <DataTable
                title="Tags"
                columns={[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "slug", label: "Slug" },
                    { key: "created_at", label: "Created At" },
                ]}
                data={tableData.tag}
                isLoading={isLoading}
            />

            <DataTable
                title="Series"
                columns={[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "slug", label: "Slug" },
                    { key: "description", label: "Description" },
                    { key: "created_at", label: "Created At" },
                ]}
                data={tableData.series}
                isLoading={isLoading}
            />

            <DataTable
                title="Post Tags"
                columns={[
                    { key: "post_id", label: "Post ID" },
                    { key: "post_title", label: "Post Title" },
                    { key: "tag_id", label: "Tag ID" },
                    { key: "tag_name", label: "Tag Name" },
                    { key: "created_at", label: "Created At" },
                ]}
                data={tableData.post_tags}
                isLoading={isLoading}
            />
        </div>
    );
}
