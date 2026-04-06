import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;



        // Check if credentials are configured
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SECRET_KEY) {
            console.error("Admin credentials not configured in environment variables");
            return NextResponse.json(
                { success: false, message: "Admin not configured" },
                { status: 500 }
            );
        }

        const { username, password, secretKey } = await request.json();

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD && secretKey === ADMIN_SECRET_KEY) {
            return NextResponse.json({
                success: true,
                message: "Login successful",
            });
        }

        return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: "Login failed" },
            { status: 500 }
        );
    }
}
