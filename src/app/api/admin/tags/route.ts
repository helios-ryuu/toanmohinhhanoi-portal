import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { errorResponse, successResponse } from "@/lib/api-helpers";

// POST - Create a new tag
export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name || typeof name !== "string") return errorResponse("Tag name is required", 400);

        const trimmedName = name.trim();
        if (trimmedName.length === 0) return errorResponse("Tag name cannot be empty", 400);
        if (trimmedName.length > 15) return errorResponse("Tag name must be 15 characters or less", 400);

        const slug = generateSlug(trimmedName);

        const existing = await sql`SELECT id FROM tag WHERE name = ${trimmedName} OR slug = ${slug}`;
        if (existing.length > 0) return errorResponse("Tag already exists", 409);

        const result = await sql`
            INSERT INTO tag (name, slug)
            VALUES (${trimmedName}, ${slug})
            RETURNING *
        `;

        return successResponse(result[0], "Tag created successfully");
    } catch (error) {
        console.error("Error creating tag:", error);
        return errorResponse("Failed to create tag");
    }
}

// GET - Fetch all tags
export async function GET() {
    try {
        const tags = await sql`SELECT * FROM tag ORDER BY name ASC`;
        return successResponse(tags);
    } catch (error) {
        console.error("Error fetching tags:", error);
        return errorResponse("Failed to fetch tags");
    }
}
