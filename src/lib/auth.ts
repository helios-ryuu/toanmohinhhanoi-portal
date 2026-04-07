import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import type { AuthPayload } from "@/types/user";

const COOKIE_NAME = "auth_token";
const JWT_EXPIRY = "30d";

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET environment variable is not set");
    return new TextEncoder().encode(secret);
}

export async function signToken(payload: Omit<AuthPayload, "iat" | "exp">): Promise<string> {
    return new SignJWT(payload as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRY)
        .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return payload as unknown as AuthPayload;
    } catch {
        return null;
    }
}

export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

export function clearAuthCookie(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

export function getTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get(COOKIE_NAME)?.value ?? null;
}
