import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbUser } from "@/types/database";
import type { User } from "@/types/user";

export function dbUserToUser(row: DbUser): User {
    return {
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        bio: row.bio,
        school: row.school,
        role: row.role,
        created_at: row.created_at,
    };
}

export async function getUserById(
    supabase: SupabaseClient,
    id: string,
): Promise<DbUser | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) return null;
    return (data as DbUser) ?? null;
}

export async function getUsersByIds(
    supabase: SupabaseClient,
    ids: string[],
): Promise<DbUser[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.from("users").select("*").in("id", ids);
    if (error) throw new Error(error.message);
    return (data ?? []) as DbUser[];
}

export async function updateUserProfile(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Pick<DbUser, "display_name" | "bio" | "school">>,
): Promise<DbUser> {
    const { data, error } = await supabase
        .from("users")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    return data as DbUser;
}
