import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { parseIdParam, errorResponse, successResponse, successMessage } from "@/lib/api-helpers";

// GET - Get an author by ID
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authorId = await parseIdParam(params, "author ID");
        if (authorId instanceof NextResponse) return authorId;

        const authors = await sql`
            SELECT id, name, title, avatar_url, github_url, linkedin_url
            FROM author WHERE id = ${authorId}
        `;

        if (authors.length === 0) return errorResponse("Author not found", 404);

        return successResponse(authors[0]);
    } catch (error) {
        console.error("Error fetching author:", error);
        return errorResponse("Failed to fetch author");
    }
}

// PUT - Update an author
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authorId = await parseIdParam(params, "author ID");
        if (authorId instanceof NextResponse) return authorId;

        const { name, title, avatar_url, github_url, linkedin_url } = await request.json();

        if (!name?.trim()) return errorResponse("Name is required", 400);
        if (!title?.trim()) return errorResponse("Title is required", 400);

        const result = await sql`
            UPDATE author SET
                name = ${name.trim()},
                title = ${title.trim()},
                avatar_url = ${avatar_url?.trim() || null},
                github_url = ${github_url?.trim() || null},
                linkedin_url = ${linkedin_url?.trim() || null}
            WHERE id = ${authorId}
            RETURNING id, name, title
        `;

        if (result.length === 0) return errorResponse("Author not found", 404);

        return successResponse(result[0], "Author updated successfully");
    } catch (error) {
        console.error("Error updating author:", error);
        return errorResponse("Failed to update author");
    }
}

// DELETE - Delete an author
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authorId = await parseIdParam(params, "author ID");
        if (authorId instanceof NextResponse) return authorId;

        const posts = await sql`SELECT id FROM post WHERE author_id = ${authorId} LIMIT 1`;
        if (posts.length > 0) {
            return errorResponse("Cannot delete author with existing posts. Please reassign or delete posts first.", 400);
        }

        const result = await sql`DELETE FROM author WHERE id = ${authorId} RETURNING id`;
        if (result.length === 0) return errorResponse("Author not found", 404);

        return successMessage("Author deleted successfully");
    } catch (error) {
        console.error("Error deleting author:", error);
        return errorResponse("Failed to delete author");
    }
}
