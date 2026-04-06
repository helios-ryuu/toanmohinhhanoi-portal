import { NextRequest, NextResponse } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";

const SUPABASE_URL = "https://zqvzvpgvzvpvbbrlhnzs.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "post-images";

interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    metadata: {
        size: number;
        mimetype: string;
    };
}

// Cached function to list files
const listBucketFiles = unstable_cache(
    async (path: string) => {
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/list/${BUCKET_NAME}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prefix: path,
                    limit: 100,
                    offset: 0,
                    sortBy: { column: "name", order: "asc" },
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to list files");
        }

        const files: StorageFile[] = await response.json();

        return files.map((file) => ({
            ...file,
            publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}${file.name}`,
        }));
    },
    ["bucket-files"],
    { revalidate: 300, tags: ["bucket"] } // Cache for 5 minutes
);

// GET - List all files in bucket (cached)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "";
    const refresh = searchParams.get("refresh") === "true";

    if (!SUPABASE_SERVICE_KEY) {
        return NextResponse.json(
            { success: false, message: "Storage not configured" },
            { status: 500 }
        );
    }

    try {
        let filesWithUrls;

        if (refresh) {
            // Invalidate cache and fetch directly
            revalidateTag("bucket", "max");
            const response = await fetch(
                `${SUPABASE_URL}/storage/v1/object/list/${BUCKET_NAME}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        prefix: path,
                        limit: 100,
                        offset: 0,
                        sortBy: { column: "name", order: "asc" },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error("Storage list error:", error);
                return NextResponse.json(
                    { success: false, message: "Failed to list files" },
                    { status: response.status }
                );
            }

            const files: StorageFile[] = await response.json();
            filesWithUrls = files.map((file) => ({
                ...file,
                publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}${file.name}`,
            }));
        } else {
            // Use cached version
            filesWithUrls = await listBucketFiles(path);
        }

        return NextResponse.json({ success: true, data: filesWithUrls });
    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json(
            { success: false, message: "Failed to list files" },
            { status: 500 }
        );
    }
}

// POST - Upload a file
export async function POST(request: NextRequest) {
    if (!SUPABASE_SERVICE_KEY) {
        return NextResponse.json(
            { success: false, message: "Storage not configured" },
            { status: 500 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const path = (formData.get("path") as string) || "";

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file provided" },
                { status: 400 }
            );
        }

        // Generate a safe filename
        const timestamp = Date.now();
        const safeName = file.name
            .toLowerCase()
            .replace(/[^a-z0-9.-]/g, "-")
            .replace(/-+/g, "-");
        const fileName = `${timestamp}-${safeName}`;
        const fullPath = path ? `${path}/${fileName}` : fileName;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fullPath}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                    "Content-Type": file.type,
                    "x-upsert": "true",
                },
                body: buffer,
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Upload error:", error);
            return NextResponse.json(
                { success: false, message: "Failed to upload file" },
                { status: response.status }
            );
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fullPath}`;

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            data: {
                name: fileName,
                path: fullPath,
                publicUrl,
            },
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { success: false, message: "Failed to upload file" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
    if (!SUPABASE_SERVICE_KEY) {
        return NextResponse.json(
            { success: false, message: "Storage not configured" },
            { status: 500 }
        );
    }

    try {
        const { fileName } = await request.json();

        if (!fileName) {
            return NextResponse.json(
                { success: false, message: "File name is required" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Delete error:", error);
            return NextResponse.json(
                { success: false, message: "Failed to delete file" },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete file" },
            { status: 500 }
        );
    }
}

// PATCH - Rename a file
export async function PATCH(request: NextRequest) {
    if (!SUPABASE_SERVICE_KEY) {
        return NextResponse.json(
            { success: false, message: "Storage not configured" },
            { status: 500 }
        );
    }

    try {
        const { oldName, newName } = await request.json();

        if (!oldName || !newName) {
            return NextResponse.json(
                { success: false, message: "Old name and new name are required" },
                { status: 400 }
            );
        }

        // Supabase doesn't have a rename API, so we need to:
        // 1. Copy the file to new name
        // 2. Delete the old file

        const copyResponse = await fetch(
            `${SUPABASE_URL}/storage/v1/object/copy`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bucketId: BUCKET_NAME,
                    sourceKey: oldName,
                    destinationKey: newName,
                }),
            }
        );

        if (!copyResponse.ok) {
            const error = await copyResponse.text();
            console.error("Copy error:", error);
            return NextResponse.json(
                { success: false, message: "Failed to rename file" },
                { status: copyResponse.status }
            );
        }

        // Delete old file
        await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${oldName}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                },
            }
        );

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${newName}`;

        return NextResponse.json({
            success: true,
            message: "File renamed successfully",
            data: { name: newName, publicUrl },
        });
    } catch (error) {
        console.error("Error renaming file:", error);
        return NextResponse.json(
            { success: false, message: "Failed to rename file" },
            { status: 500 }
        );
    }
}
