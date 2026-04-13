import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
    getRegistration,
    isRegistrationLeader,
    updateRegistrationTeam,
    withdrawRegistration,
} from "@/lib/contests-db";
import { apiSuccess, apiError, handleRouteError, revalidateContests } from "@/lib/api-helpers";

async function ensureLeader(registrationId: number, userId: string) {
    const supabase = createSupabaseAdminClient();
    const reg = await getRegistration(supabase, registrationId);
    if (!reg) throw new Error("registration not found");
    const ok = await isRegistrationLeader(supabase, registrationId, userId);
    if (!ok) throw new Error("FORBIDDEN");
    return { supabase, reg };
}

export async function PATCH(
    req: NextRequest,
    ctx: { params: Promise<{ slug: string; registrationId: string }> },
) {
    try {
        const current = await requireAuth();
        const { slug, registrationId } = await ctx.params;
        const regId = parseInt(registrationId, 10);
        if (Number.isNaN(regId)) return apiError("Invalid registration id", 400);

        const { supabase } = await ensureLeader(regId, current.profile.id);
        const body = await req.json().catch(() => ({}));

        const updated = await updateRegistrationTeam(supabase, regId, {
            team_name: body.team_name,
            member_ids: Array.isArray(body.member_ids) ? body.member_ids : undefined,
            leaderId: current.profile.id,
        });
        revalidateContests(slug);
        return apiSuccess(updated);
    } catch (err) {
        return handleRouteError(err);
    }
}

export async function DELETE(
    _req: NextRequest,
    ctx: { params: Promise<{ slug: string; registrationId: string }> },
) {
    try {
        const current = await requireAuth();
        const { slug, registrationId } = await ctx.params;
        const regId = parseInt(registrationId, 10);
        if (Number.isNaN(regId)) return apiError("Invalid registration id", 400);

        const { supabase } = await ensureLeader(regId, current.profile.id);
        const updated = await withdrawRegistration(supabase, regId);
        revalidateContests(slug);
        return apiSuccess(updated);
    } catch (err) {
        return handleRouteError(err);
    }
}
