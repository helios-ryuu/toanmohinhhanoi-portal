import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getContestBySlug, createRegistration } from "@/lib/contests-db";
import { apiSuccess, apiError, handleRouteError, revalidateContests } from "@/lib/api-helpers";

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
    try {
        const current = await requireAuth();
        const { slug } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const memberIds: string[] = Array.isArray(body.member_ids) ? body.member_ids : [];
        const teamName: string | null = typeof body.team_name === "string" ? body.team_name : null;

        const supabase = createSupabaseAdminClient();
        const contest = await getContestBySlug(supabase, slug);
        if (!contest) return apiError("Contest not found", 404);

        const result = await createRegistration(supabase, {
            contest,
            leaderId: current.profile.id,
            teamName,
            memberIds,
        });
        revalidateContests(slug);
        return apiSuccess(result);
    } catch (err) {
        return handleRouteError(err);
    }
}
