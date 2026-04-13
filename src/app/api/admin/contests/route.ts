import { NextRequest } from "next/server";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { listContests, createContest } from "@/lib/contests-db";
import { apiSuccess, handleRouteError, revalidateContests } from "@/lib/api-helpers";

export async function GET() {
    try {
        await requireAdmin();
        const supabase = await createSupabaseServerClient();
        const contests = await listContests(supabase, { includeAll: true });
        return apiSuccess(contests);
    } catch (err) {
        return handleRouteError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();
        const supabase = await createSupabaseServerClient();
        const contest = await createContest(supabase, body);
        revalidateContests(contest.slug);
        return apiSuccess(contest);
    } catch (err) {
        return handleRouteError(err);
    }
}
