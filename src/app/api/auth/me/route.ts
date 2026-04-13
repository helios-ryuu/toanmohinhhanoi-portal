import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function GET() {
    const current = await getCurrentUser();
    if (!current) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: current.profile });
}
