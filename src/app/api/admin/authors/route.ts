import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

// GET - Fetch all authors
export async function GET() {
    try {
        const authors = await sql`SELECT id, name, title FROM author ORDER BY name ASC`;
        return successResponse(authors);
    } catch (error) {
        console.error("Error fetching authors:", error);
        return errorResponse("Failed to fetch authors");
    }
}

// POST - Create a new author
export async function POST(request: NextRequest) {
    try {
        const { name, title, avatar_url, github_url, linkedin_url } = await request.json();

        if (!name?.trim()) return errorResponse("Name is required", 400);
        if (!title?.trim()) return errorResponse("Title is required", 400);

        const existing = await sql`SELECT id FROM author WHERE name = ${name.trim()}`;
        if (existing.length > 0) return errorResponse("Author with this name already exists", 409);

        const result = await sql`
            INSERT INTO author (name, title, avatar_url, github_url, linkedin_url)
            VALUES (${name.trim()}, ${title.trim()}, ${avatar_url?.trim() || null}, ${github_url?.trim() || null}, ${linkedin_url?.trim() || null})
            RETURNING *
        `;

        return successResponse(result[0], "Author created successfully");
    } catch (error) {
        console.error("Error creating author:", error);
        return errorResponse("Failed to create author");
    }
}
