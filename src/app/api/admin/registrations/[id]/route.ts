import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { setRegistrationStatus } from "@/lib/contests-db";
import { apiSuccess, apiError, handleRouteError, parseIdParam, revalidateContests } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const id = await parseIdParam(ctx.params, "registration id");
        if (id instanceof NextResponse) return id;
        const body = await req.json().catch(() => ({}));
        if (body.status !== "approved" && body.status !== "rejected") {
            return apiError("status must be approved or rejected", 400);
        }
        const supabase = createSupabaseAdminClient();
        const updated = await setRegistrationStatus(supabase, id, body.status);
        revalidateContests();
        return apiSuccess(updated);
    } catch (err) {
        return handleRouteError(err);
    }
}
