import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { getContestById, updateContest, deleteContest } from "@/lib/contests-db";
import { apiSuccess, apiError, handleRouteError, parseIdParam, revalidateContests } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const id = await parseIdParam(ctx.params, "contest id");
        if (id instanceof NextResponse) return id;
        const supabase = await createSupabaseServerClient();
        const contest = await getContestById(supabase, id);
        if (!contest) return apiError("Contest not found", 404);
        return apiSuccess(contest);
    } catch (err) {
        return handleRouteError(err);
    }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const id = await parseIdParam(ctx.params, "contest id");
        if (id instanceof NextResponse) return id;
        const body = await req.json();
        const supabase = await createSupabaseServerClient();
        const contest = await updateContest(supabase, id, body);
        revalidateContests(contest.slug);
        return apiSuccess(contest);
    } catch (err) {
        return handleRouteError(err);
    }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const id = await parseIdParam(ctx.params, "contest id");
        if (id instanceof NextResponse) return id;
        const supabase = await createSupabaseServerClient();
        const existing = await getContestById(supabase, id);
        await deleteContest(supabase, id);
        revalidateContests(existing?.slug);
        return apiSuccess({ id });
    } catch (err) {
        return handleRouteError(err);
    }
}
