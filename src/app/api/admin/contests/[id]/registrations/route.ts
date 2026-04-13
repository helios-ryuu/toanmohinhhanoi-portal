import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { listRegistrationsForContest, getRegistrationMembers } from "@/lib/contests-db";
import { apiSuccess, handleRouteError, parseIdParam } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const id = await parseIdParam(ctx.params, "contest id");
        if (id instanceof NextResponse) return id;
        const supabase = await createSupabaseServerClient();
        const regs = await listRegistrationsForContest(supabase, id);
        const enriched = await Promise.all(
            regs.map(async (r) => ({ ...r, members: await getRegistrationMembers(supabase, r.id) })),
        );
        return apiSuccess(enriched);
    } catch (err) {
        return handleRouteError(err);
    }
}
