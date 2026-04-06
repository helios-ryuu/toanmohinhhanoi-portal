import sql from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

// GET - Fetch all series
export async function GET() {
    try {
        const series = await sql`SELECT * FROM series ORDER BY name ASC`;
        return successResponse(series);
    } catch (error) {
        console.error("Error fetching series:", error);
        return errorResponse("Failed to fetch series");
    }
}
