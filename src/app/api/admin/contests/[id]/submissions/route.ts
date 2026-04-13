import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { listSubmissionsForContest } from "@/lib/contests-db";
import { apiSuccess, handleRouteError, parseIdParam } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const id = await parseIdParam(ctx.params, "contest id");
        if (id instanceof NextResponse) return id;
        const supabase = await createSupabaseServerClient();
        const subs = await listSubmissionsForContest(supabase, id);
        return apiSuccess(subs);
    } catch (err) {
        return handleRouteError(err);
    }
}
