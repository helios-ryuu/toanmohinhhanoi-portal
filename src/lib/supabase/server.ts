import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbUser } from "@/types/database";

interface CookieToSet {
    name: string;
    value: string;
    options?: CookieOptions;
}

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(toSet: CookieToSet[]) {
                    try {
                        toSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options as CookieOptions);
                        });
                    } catch {
                        // Called from a Server Component — middleware handles refresh.
                    }
                },
            },
        },
    );
}

export async function getCurrentUser(): Promise<{ authUser: { id: string; email?: string }; profile: DbUser } | null> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    return profile ? { authUser: user, profile: profile as DbUser } : null;
}

export async function requireAuth() {
    const current = await getCurrentUser();
    if (!current) throw new Error("UNAUTHORIZED");
    return current;
}

export async function requireAdmin() {
    const current = await requireAuth();
    if (current.profile.role !== "admin") throw new Error("FORBIDDEN");
    return current;
}
