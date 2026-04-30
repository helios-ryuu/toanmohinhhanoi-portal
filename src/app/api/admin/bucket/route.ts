import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { POST_IMAGE_BUCKET, SUBMISSION_BUCKET } from "@/lib/storage";
import { apiSuccess, apiError, handleRouteError } from "@/lib/api-helpers";

type BucketName = typeof POST_IMAGE_BUCKET | typeof SUBMISSION_BUCKET;

const ALLOWED_BUCKETS: BucketName[] = [POST_IMAGE_BUCKET, SUBMISSION_BUCKET];

function pickBucket(req: NextRequest): BucketName | null {
    const raw = new URL(req.url).searchParams.get("bucket") ?? POST_IMAGE_BUCKET;
    return (ALLOWED_BUCKETS as string[]).includes(raw) ? (raw as BucketName) : null;
}

function safeFileName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-");
}

interface StorageEntry {
    name: string;
    id: string | null;
    updated_at: string | null;
    created_at: string | null;
    last_accessed_at?: string | null;
    metadata: { size?: number; mimetype?: string } | null;
}

// GET — list entries (files + folders) under a prefix.
// query: bucket=<post-images|submissions>&prefix=<folder/subfolder>
export async function GET(req: NextRequest) {
    try {
        await requireAdmin();
        const bucket = pickBucket(req);
        if (!bucket) return apiError("Invalid bucket", 400);

        const { searchParams } = new URL(req.url);
        const prefix = (searchParams.get("prefix") ?? "").replace(/^\/+|\/+$/g, "");

        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase.storage.from(bucket).list(prefix, {
            limit: 1000,
            offset: 0,
            sortBy: { column: "name", order: "asc" },
        });
        if (error) return apiError(error.message, 500);

        const entries = (data ?? []) as StorageEntry[];
        const folders: { name: string; path: string }[] = [];
        const files: {
            name: string;
            path: string;
            publicUrl: string;
            size: number;
            mimetype: string;
            createdAt: string | null;
            updatedAt: string | null;
        }[] = [];

        for (const entry of entries) {
            // Supabase returns folder placeholder rows with id === null and metadata === null.
            const isFolder = entry.id === null && entry.metadata === null;
            const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;

            if (isFolder) {
                folders.push({ name: entry.name, path: fullPath });
            } else {
                const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fullPath);
                files.push({
                    name: entry.name,
                    path: fullPath,
                    publicUrl: pub.publicUrl,
                    size: entry.metadata?.size ?? 0,
                    mimetype: entry.metadata?.mimetype ?? "application/octet-stream",
                    createdAt: entry.created_at,
                    updatedAt: entry.updated_at,
                });
            }
        }

        return apiSuccess({ bucket, prefix, folders, files });
    } catch (err) {
        return handleRouteError(err);
    }
}

// POST — upload a file (multipart/form-data).
// form: file (File), prefix? (string)
export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
        const bucket = pickBucket(req);
        if (!bucket) return apiError("Invalid bucket", 400);

        const form = await req.formData();
        const file = form.get("file");
        const prefix = (form.get("prefix") as string | null)?.replace(/^\/+|\/+$/g, "") ?? "";
        if (!(file instanceof File)) return apiError("file required", 400);

        const fileName = `${Date.now()}-${safeFileName(file.name)}`;
        const path = prefix ? `${prefix}/${fileName}` : fileName;

        const supabase = createSupabaseAdminClient();
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error } = await supabase.storage
            .from(bucket)
            .upload(path, buffer, { contentType: file.type, upsert: false });
        if (error) return apiError(error.message, 500);

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        return apiSuccess({ name: fileName, path, publicUrl: pub.publicUrl });
    } catch (err) {
        return handleRouteError(err);
    }
}

// DELETE — remove a file. body: { path: string }
export async function DELETE(req: NextRequest) {
    try {
        await requireAdmin();
        const bucket = pickBucket(req);
        if (!bucket) return apiError("Invalid bucket", 400);

        const { path } = await req.json();
        if (!path || typeof path !== "string") return apiError("path required", 400);

        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) return apiError(error.message, 500);

        return apiSuccess({ path });
    } catch (err) {
        return handleRouteError(err);
    }
}

// PATCH — rename a file (copy + delete). body: { from: string, to: string }
export async function PATCH(req: NextRequest) {
    try {
        await requireAdmin();
        const bucket = pickBucket(req);
        if (!bucket) return apiError("Invalid bucket", 400);

        const { from, to } = await req.json();
        if (!from || !to) return apiError("from and to required", 400);

        const supabase = createSupabaseAdminClient();
        const { error: copyErr } = await supabase.storage.from(bucket).copy(from, to);
        if (copyErr) return apiError(copyErr.message, 500);
        const { error: removeErr } = await supabase.storage.from(bucket).remove([from]);
        if (removeErr) return apiError(removeErr.message, 500);

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(to);
        return apiSuccess({ path: to, publicUrl: pub.publicUrl });
    } catch (err) {
        return handleRouteError(err);
    }
}
