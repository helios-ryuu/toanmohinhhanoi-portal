import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
    getRegistration,
    isApprovedMember,
    getContestById,
    createSubmission,
} from "@/lib/contests-db";
import { uploadSubmissionFile, MAX_SUBMISSION_BYTES } from "@/lib/storage";
import { apiSuccess, apiError, handleRouteError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
    try {
        const current = await requireAuth();
        const form = await req.formData();
        const file = form.get("file");
        const registrationIdRaw = form.get("registration_id");
        const note = form.get("note");

        if (!(file instanceof File)) return apiError("file required", 400);
        if (typeof registrationIdRaw !== "string") return apiError("registration_id required", 400);
        const registrationId = parseInt(registrationIdRaw, 10);
        if (Number.isNaN(registrationId)) return apiError("invalid registration_id", 400);
        if (file.size > MAX_SUBMISSION_BYTES) return apiError("file exceeds 50MB", 400);

        const supabase = createSupabaseAdminClient();
        const reg = await getRegistration(supabase, registrationId);
        if (!reg) return apiError("registration not found", 404);

        const approved = await isApprovedMember(supabase, registrationId, current.profile.id);
        if (!approved) return apiError("Forbidden", 403);

        const contest = await getContestById(supabase, reg.contest_id);
        if (!contest) return apiError("contest not found", 404);
        if (new Date() > new Date(contest.submission_deadline)) {
            return apiError("submission deadline passed", 400);
        }

        const { path } = await uploadSubmissionFile(supabase, {
            contestId: reg.contest_id,
            registrationId,
            file,
        });

        const sub = await createSubmission(supabase, {
            registration_id: registrationId,
            storage_path: path,
            file_name: file.name,
            file_size_bytes: file.size,
            mime_type: file.type || "application/octet-stream",
            note: typeof note === "string" ? note : null,
            submitted_by: current.profile.id,
        });
        return apiSuccess(sub);
    } catch (err) {
        return handleRouteError(err);
    }
}
