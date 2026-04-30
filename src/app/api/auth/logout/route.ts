import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiMessage } from "@/lib/api-helpers";

export async function POST() {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return apiMessage("Logged out");
}
