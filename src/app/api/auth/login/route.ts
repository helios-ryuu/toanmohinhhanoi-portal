import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByUsername, dbUserToUser } from "@/lib/users-db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { errorResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { identifier, password } = body;

        if (!identifier?.trim()) return errorResponse("Email or username is required", 400);
        if (!password) return errorResponse("Password is required", 400);

        // Determine if identifier is email or username
        const isEmail = identifier.includes("@");
        const dbUser = isEmail
            ? await getUserByEmail(identifier.toLowerCase())
            : await getUserByUsername(identifier.toLowerCase());

        if (!dbUser) return errorResponse("Invalid credentials", 401);

        const isValid = await bcrypt.compare(password, dbUser.password_hash);
        if (!isValid) return errorResponse("Invalid credentials", 401);

        const user = dbUserToUser(dbUser);
        const token = await signToken({ sub: String(user.id), email: user.email, username: user.username });

        const response = NextResponse.json({ success: true, data: user });
        setAuthCookie(response, token);
        return response;
    } catch (error) {
        console.error("Error logging in:", error);
        return errorResponse("Failed to log in");
    }
}
