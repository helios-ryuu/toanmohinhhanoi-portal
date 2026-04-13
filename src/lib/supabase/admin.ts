import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function createSupabaseAdminClient(): SupabaseClient {
    if (cached) return cached;

    cached = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        },
    );

    return cached;
}
