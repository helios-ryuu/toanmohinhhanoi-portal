import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getContestBySlug, createRegistration } from "@/lib/contests-db";
import { getUsersByUsernames } from "@/lib/users-db";
import { apiSuccess, apiError, handleRouteError, revalidateContests } from "@/lib/api-helpers";

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
    try {
        const current = await requireAuth();
        if (current.profile.role === "admin") {
            return apiError("Admins cannot register for contests", 403);
        }

        const { slug } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const memberUsernames: string[] = Array.isArray(body.member_usernames) ? body.member_usernames : [];
        const teamName: string | null = typeof body.team_name === "string" ? body.team_name : null;

        const supabase = createSupabaseAdminClient();
        const contest = await getContestBySlug(supabase, slug);
        if (!contest) return apiError("Contest not found", 404);

        let memberIds: string[] = [];
        if (memberUsernames.length > 0) {
            const users = await getUsersByUsernames(supabase, memberUsernames);
            const foundUsernames = new Set(users.map((u) => u.username));
            const missing = memberUsernames.filter((u) => !foundUsernames.has(u));
            if (missing.length > 0) {
                return apiError(`Usernames not found: ${missing.join(", ")}`, 404);
            }
            const adminMembers = users.filter((u) => u.role === "admin").map((u) => u.username);
            if (adminMembers.length > 0) {
                return apiError(`Admins cannot be added to a contest team: ${adminMembers.join(", ")}`, 403);
            }
            memberIds = users.map((u) => u.id);
        }

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
