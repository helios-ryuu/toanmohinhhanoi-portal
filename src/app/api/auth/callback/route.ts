import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
        return NextResponse.redirect(`${origin}/auth?error=missing_code`);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`);
    }

    return NextResponse.redirect(`${origin}${next}`);
}
