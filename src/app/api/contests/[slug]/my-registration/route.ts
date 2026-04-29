import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getContestBySlug } from "@/lib/contests-db";
import { apiSuccess, apiError, handleRouteError } from "@/lib/api-helpers";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
    try {
        const current = await requireAuth();
        const { slug } = await ctx.params;
        const supabase = createSupabaseAdminClient();
        const contest = await getContestBySlug(supabase, slug);
        if (!contest) return apiError("Contest not found", 404);

        const { data: memberRows, error } = await supabase
            .from("registration_member")
            .select("registration_id")
            .eq("user_id", current.profile.id);

        if (error) throw new Error(error.message);

        const regIds = memberRows?.map(r => r.registration_id) || [];
        if (regIds.length === 0) {
            return apiSuccess(null);
        }

        const { data, error: errReg } = await supabase
            .from("contest_registration")
            .select("*")
            .eq("contest_id", contest.id)
            .in("id", regIds)
            .maybeSingle();

        if (errReg) throw new Error(errReg.message);
        
        return apiSuccess(data || null);
    } catch (err) {
        return handleRouteError(err);
    }
}
