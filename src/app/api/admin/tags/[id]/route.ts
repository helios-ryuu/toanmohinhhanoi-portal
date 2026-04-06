import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { parseIdParam, errorResponse, successMessage } from "@/lib/api-helpers";

// DELETE - Delete a tag
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tagId = await parseIdParam(params, "tag ID");
        if (tagId instanceof NextResponse) return tagId;

        await sql`DELETE FROM post_tags WHERE tag_id = ${tagId}`;

        const result = await sql`
            DELETE FROM tag WHERE id = ${tagId}
            RETURNING id
        `;

        if (result.length === 0) return errorResponse("Tag not found", 404);

        return successMessage("Tag deleted successfully");
    } catch (error) {
        console.error("Error deleting tag:", error);
        return errorResponse("Failed to delete tag");
    }
}
