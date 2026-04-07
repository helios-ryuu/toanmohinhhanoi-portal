import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { getUserById, dbUserToUser } from "@/lib/users-db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return errorResponse("Unauthorized", 401);

        const payload = await verifyToken(token);
        if (!payload) return errorResponse("Unauthorized", 401);

        const dbUser = await getUserById(Number(payload.sub));
        if (!dbUser) return errorResponse("User not found", 404);

        return successResponse(dbUserToUser(dbUser));
    } catch (error) {
        console.error("Error fetching current user:", error);
        return errorResponse("Failed to fetch user");
    }
}
