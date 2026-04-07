import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, getUserByUsername, dbUserToUser } from "@/lib/users-db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { errorResponse } from "@/lib/api-helpers";
import { getPasswordValidationError } from "@/lib/password-policy";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, username, password, confirmPassword, phone } = body;

        if (!email?.trim()) return errorResponse("Email is required", 400);
        if (!username?.trim()) return errorResponse("Username is required", 400);
        if (!password) return errorResponse("Password is required", 400);
        if (password !== confirmPassword) return errorResponse("Passwords do not match", 400);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return errorResponse("Invalid email address", 400);

        if (username.length < 3 || username.length > 30) {
            return errorResponse("Username must be between 3 and 30 characters", 400);
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return errorResponse("Username may only contain letters, numbers, and underscores", 400);
        }

        const passwordError = getPasswordValidationError(password, username);
        if (passwordError) return errorResponse(passwordError, 400);

        const [existingByEmail, existingByUsername] = await Promise.all([
            getUserByEmail(email.toLowerCase()),
            getUserByUsername(username.toLowerCase()),
        ]);

        if (existingByEmail) return errorResponse("Email already in use", 409);
        if (existingByUsername) return errorResponse("Username already taken", 409);

        const password_hash = await bcrypt.hash(password, 12);

        const dbUser = await createUser({
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password_hash,
            phone: phone?.trim() || null,
        });

        const user = dbUserToUser(dbUser);
        const token = await signToken({ sub: String(user.id), email: user.email, username: user.username });

        const response = NextResponse.json({ success: true, data: user });
        setAuthCookie(response, token);
        return response;
    } catch (error) {
        console.error("Error registering user:", error);
        return errorResponse("Failed to register user");
    }
}
