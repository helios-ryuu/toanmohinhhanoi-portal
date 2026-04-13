import { NextRequest } from "next/server";
import { createSupabaseServerClient, requireAuth } from "@/lib/supabase/server";
import { apiSuccess, handleRouteError } from "@/lib/api-helpers";
import { updateUserProfile, dbUserToUser } from "@/lib/users-db";

export async function PATCH(req: NextRequest) {
    try {
        const current = await requireAuth();
        const body = await req.json().catch(() => ({}));
        const patch: { display_name?: string | null; bio?: string | null; school?: string | null } = {};
        if (typeof body.display_name === "string" || body.display_name === null) patch.display_name = body.display_name;
        if (typeof body.bio === "string" || body.bio === null) patch.bio = body.bio;
        if (typeof body.school === "string" || body.school === null) patch.school = body.school;

        const supabase = await createSupabaseServerClient();
        const updated = await updateUserProfile(supabase, current.profile.id, patch);
        return apiSuccess(dbUserToUser(updated));
    } catch (err) {
        return handleRouteError(err);
    }
}
