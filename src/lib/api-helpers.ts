import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Parse a numeric ID from route params. Returns the number, or a 400 error response.
 */
export async function parseIdParam(
    params: Promise<{ id: string }>,
    entityName = "ID"
): Promise<number | NextResponse> {
    const { id } = await params;
    const parsed = parseInt(id, 10);

    if (isNaN(parsed)) {
        return NextResponse.json(
            { success: false, message: `Invalid ${entityName}` },
            { status: 400 }
        );
    }

    return parsed;
}

/**
 * Standard JSON error response.
 */
export function errorResponse(message: string, status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

/**
 * Standard JSON success response.
 */
export function successResponse<T>(data: T, message?: string) {
    return NextResponse.json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
}

/**
 * Standard JSON success response without data.
 */
export function successMessage(message: string) {
    return NextResponse.json({ success: true, message });
}

/**
 * Revalidate all post-related cache paths.
 */
export function revalidatePostCache(slug?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const revalidate = revalidateTag as any;
    revalidate("posts", "max");
    revalidate("admin-data", "max");
    revalidate("admin-drafts", "max");
    if (slug) {
        revalidate(`post-${slug}`, "max");
        revalidatePath(`/post/${slug}`);
    }
    revalidatePath("/");
    revalidatePath("/blog");
}

