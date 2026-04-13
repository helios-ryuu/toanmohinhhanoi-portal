import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    DbContest,
    DbContestRegistration,
    DbRegistrationMember,
    DbSubmission,
    ContestParticipationType,
    ContestStatus,
} from "@/types/database";

const CONTEST_FIELDS = "id, slug, title, description, rules, cover_image_url, participation_type, max_team_size, registration_start, registration_end, contest_start, contest_end, submission_deadline, status, created_at, updated_at";

export async function listContests(
    supabase: SupabaseClient,
    opts: { status?: ContestStatus; includeAll?: boolean } = {},
): Promise<DbContest[]> {
    let query = supabase.from("contest").select(CONTEST_FIELDS).order("registration_start", { ascending: false });
    if (opts.status) query = query.eq("status", opts.status);
    else if (!opts.includeAll) query = query.neq("status", "draft");
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as DbContest[];
}

export async function getContestBySlug(
    supabase: SupabaseClient,
    slug: string,
    includeDraft = false,
): Promise<DbContest | null> {
    let query = supabase.from("contest").select(CONTEST_FIELDS).eq("slug", slug);
    if (!includeDraft) query = query.neq("status", "draft");
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    return (data as DbContest) ?? null;
}

export async function getContestById(
    supabase: SupabaseClient,
    id: number,
): Promise<DbContest | null> {
    const { data, error } = await supabase.from("contest").select(CONTEST_FIELDS).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as DbContest) ?? null;
}

export interface ContestInput {
    slug: string;
    title: string;
    description: string;
    rules?: string | null;
    cover_image_url?: string | null;
    participation_type: ContestParticipationType;
    max_team_size: number;
    registration_start: string;
    registration_end: string;
    contest_start: string;
    contest_end: string;
    submission_deadline: string;
    status?: ContestStatus;
}

function validateContest(input: ContestInput): string | null {
    if (input.participation_type === "individual" && input.max_team_size !== 1) {
        return "individual contests must have max_team_size = 1";
    }
    if (input.participation_type !== "individual" && input.max_team_size < 2) {
        return "team/both contests must have max_team_size >= 2";
    }
    const dates = [
        new Date(input.registration_start),
        new Date(input.registration_end),
        new Date(input.contest_start),
        new Date(input.contest_end),
        new Date(input.submission_deadline),
    ];
    if (dates.some((d) => Number.isNaN(d.getTime()))) return "invalid date(s)";
    if (!(dates[0] < dates[1] && dates[1] <= dates[2] && dates[2] < dates[3] && dates[3] <= dates[4])) {
        return "date order invalid: registration_start < registration_end <= contest_start < contest_end <= submission_deadline";
    }
    return null;
}

export async function createContest(
    supabase: SupabaseClient,
    input: ContestInput,
): Promise<DbContest> {
    const err = validateContest(input);
    if (err) throw new Error(err);
    const { data, error } = await supabase.from("contest").insert(input).select(CONTEST_FIELDS).single();
    if (error) throw new Error(error.message);
    return data as DbContest;
}

export async function updateContest(
    supabase: SupabaseClient,
    id: number,
    patch: Partial<ContestInput>,
): Promise<DbContest> {
    if (
        patch.participation_type !== undefined ||
        patch.max_team_size !== undefined ||
        patch.registration_start !== undefined ||
        patch.registration_end !== undefined ||
        patch.contest_start !== undefined ||
        patch.contest_end !== undefined ||
        patch.submission_deadline !== undefined
    ) {
        const existing = await getContestById(supabase, id);
        if (!existing) throw new Error("contest not found");
        const merged: ContestInput = {
            slug: patch.slug ?? existing.slug,
            title: patch.title ?? existing.title,
            description: patch.description ?? existing.description,
            rules: patch.rules ?? existing.rules,
            cover_image_url: patch.cover_image_url ?? existing.cover_image_url,
            participation_type: patch.participation_type ?? existing.participation_type,
            max_team_size: patch.max_team_size ?? existing.max_team_size,
            registration_start: patch.registration_start ?? existing.registration_start,
            registration_end: patch.registration_end ?? existing.registration_end,
            contest_start: patch.contest_start ?? existing.contest_start,
            contest_end: patch.contest_end ?? existing.contest_end,
            submission_deadline: patch.submission_deadline ?? existing.submission_deadline,
            status: patch.status ?? existing.status,
        };
        const err = validateContest(merged);
        if (err) throw new Error(err);
    }
    const { data, error } = await supabase.from("contest").update(patch).eq("id", id).select(CONTEST_FIELDS).single();
    if (error) throw new Error(error.message);
    return data as DbContest;
}

export async function deleteContest(
    supabase: SupabaseClient,
    id: number,
): Promise<void> {
    const { error } = await supabase.from("contest").delete().eq("id", id);
    if (error) throw new Error(error.message);
}

// ---------- Registrations ----------

export async function userHasRegistration(
    supabase: SupabaseClient,
    contestId: number,
    userId: string,
): Promise<boolean> {
    const { data: regs } = await supabase
        .from("contest_registration")
        .select("id")
        .eq("contest_id", contestId);
    const ids = ((regs ?? []) as Array<{ id: number }>).map((r) => r.id);
    if (ids.length === 0) return false;
    const { data: members } = await supabase
        .from("registration_member")
        .select("registration_id")
        .eq("user_id", userId)
        .in("registration_id", ids);
    return ((members as unknown[] | null)?.length ?? 0) > 0;
}

export async function createRegistration(
    supabase: SupabaseClient,
    args: { contest: DbContest; leaderId: string; teamName?: string | null; memberIds: string[] },
): Promise<{ registration: DbContestRegistration; members: DbRegistrationMember[] }> {
    const { contest, leaderId, teamName, memberIds } = args;
    const now = new Date();
    const regStart = new Date(contest.registration_start);
    const regEnd = new Date(contest.registration_end);
    if (now < regStart || now > regEnd) throw new Error("registration window closed");
    if (contest.status !== "open") throw new Error("contest is not open for registration");

    const allMembers = Array.from(new Set([leaderId, ...memberIds]));
    const teamSize = allMembers.length;

    if (contest.participation_type === "individual" && teamSize !== 1) {
        throw new Error("individual contest accepts only one member");
    }
    if (contest.participation_type === "team" && teamSize < 2) {
        throw new Error("team contest requires at least 2 members");
    }
    if (teamSize > contest.max_team_size) {
        throw new Error(`team exceeds max size ${contest.max_team_size}`);
    }

    for (const uid of allMembers) {
        if (await userHasRegistration(supabase, contest.id, uid)) {
            throw new Error(`user ${uid} already registered for this contest`);
        }
    }

    const { data: reg, error: regErr } = await supabase
        .from("contest_registration")
        .insert({ contest_id: contest.id, team_name: teamName ?? null, status: "pending" })
        .select("*")
        .single();
    if (regErr) throw new Error(regErr.message);
    const registration = reg as DbContestRegistration;

    const memberRows = allMembers.map((uid) => ({
        registration_id: registration.id,
        user_id: uid,
        role: uid === leaderId ? ("leader" as const) : ("member" as const),
    }));
    const { data: members, error: memErr } = await supabase
        .from("registration_member")
        .insert(memberRows)
        .select("*");
    if (memErr) {
        await supabase.from("contest_registration").delete().eq("id", registration.id);
        throw new Error(memErr.message);
    }

    return { registration, members: (members ?? []) as DbRegistrationMember[] };
}

export async function getRegistration(
    supabase: SupabaseClient,
    id: number,
): Promise<DbContestRegistration | null> {
    const { data, error } = await supabase
        .from("contest_registration")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as DbContestRegistration) ?? null;
}

export async function getRegistrationMembers(
    supabase: SupabaseClient,
    registrationId: number,
): Promise<DbRegistrationMember[]> {
    const { data, error } = await supabase
        .from("registration_member")
        .select("*")
        .eq("registration_id", registrationId);
    if (error) throw new Error(error.message);
    return (data ?? []) as DbRegistrationMember[];
}

export async function isRegistrationLeader(
    supabase: SupabaseClient,
    registrationId: number,
    userId: string,
): Promise<boolean> {
    const { data } = await supabase
        .from("registration_member")
        .select("role")
        .eq("registration_id", registrationId)
        .eq("user_id", userId)
        .maybeSingle();
    return (data as { role: string } | null)?.role === "leader";
}

export async function isApprovedMember(
    supabase: SupabaseClient,
    registrationId: number,
    userId: string,
): Promise<boolean> {
    const reg = await getRegistration(supabase, registrationId);
    if (!reg || reg.status !== "approved") return false;
    const { data } = await supabase
        .from("registration_member")
        .select("user_id")
        .eq("registration_id", registrationId)
        .eq("user_id", userId)
        .maybeSingle();
    return !!data;
}

export async function updateRegistrationTeam(
    supabase: SupabaseClient,
    registrationId: number,
    patch: { team_name?: string | null; member_ids?: string[]; leaderId: string },
): Promise<DbContestRegistration> {
    const reg = await getRegistration(supabase, registrationId);
    if (!reg) throw new Error("registration not found");
    if (reg.status !== "pending") throw new Error("can only edit pending registration");

    if (patch.member_ids) {
        const contest = await getContestById(supabase, reg.contest_id);
        if (!contest) throw new Error("contest not found");
        const all = Array.from(new Set([patch.leaderId, ...patch.member_ids]));
        if (all.length > contest.max_team_size) {
            throw new Error(`team exceeds max size ${contest.max_team_size}`);
        }
        await supabase.from("registration_member").delete().eq("registration_id", registrationId);
        const rows = all.map((uid) => ({
            registration_id: registrationId,
            user_id: uid,
            role: uid === patch.leaderId ? ("leader" as const) : ("member" as const),
        }));
        const { error } = await supabase.from("registration_member").insert(rows);
        if (error) throw new Error(error.message);
    }

    if (patch.team_name !== undefined) {
        const { data, error } = await supabase
            .from("contest_registration")
            .update({ team_name: patch.team_name })
            .eq("id", registrationId)
            .select("*")
            .single();
        if (error) throw new Error(error.message);
        return data as DbContestRegistration;
    }
    return (await getRegistration(supabase, registrationId))!;
}

export async function withdrawRegistration(
    supabase: SupabaseClient,
    registrationId: number,
): Promise<DbContestRegistration> {
    const { data, error } = await supabase
        .from("contest_registration")
        .update({ status: "withdrawn" })
        .eq("id", registrationId)
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    return data as DbContestRegistration;
}

export async function setRegistrationStatus(
    supabase: SupabaseClient,
    registrationId: number,
    status: "approved" | "rejected",
): Promise<DbContestRegistration> {
    const { data, error } = await supabase
        .from("contest_registration")
        .update({ status })
        .eq("id", registrationId)
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    return data as DbContestRegistration;
}

export async function listRegistrationsForContest(
    supabase: SupabaseClient,
    contestId: number,
): Promise<DbContestRegistration[]> {
    const { data, error } = await supabase
        .from("contest_registration")
        .select("*")
        .eq("contest_id", contestId)
        .order("registered_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DbContestRegistration[];
}

// ---------- Submissions ----------

export async function listSubmissionsForRegistration(
    supabase: SupabaseClient,
    registrationId: number,
): Promise<DbSubmission[]> {
    const { data, error } = await supabase
        .from("submission")
        .select("*")
        .eq("registration_id", registrationId)
        .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DbSubmission[];
}

export async function listSubmissionsForContest(
    supabase: SupabaseClient,
    contestId: number,
): Promise<DbSubmission[]> {
    const { data: regs } = await supabase
        .from("contest_registration")
        .select("id")
        .eq("contest_id", contestId);
    const ids = ((regs ?? []) as Array<{ id: number }>).map((r) => r.id);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
        .from("submission")
        .select("*")
        .in("registration_id", ids)
        .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DbSubmission[];
}

export async function getSubmission(
    supabase: SupabaseClient,
    id: number,
): Promise<DbSubmission | null> {
    const { data, error } = await supabase.from("submission").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as DbSubmission) ?? null;
}

export async function createSubmission(
    supabase: SupabaseClient,
    input: Omit<DbSubmission, "id" | "submitted_at" | "is_final"> & { is_final?: boolean },
): Promise<DbSubmission> {
    const { data, error } = await supabase
        .from("submission")
        .insert({ ...input, is_final: input.is_final ?? false })
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    return data as DbSubmission;
}

export async function markSubmissionFinal(
    supabase: SupabaseClient,
    submissionId: number,
): Promise<DbSubmission> {
    const sub = await getSubmission(supabase, submissionId);
    if (!sub) throw new Error("submission not found");
    await supabase
        .from("submission")
        .update({ is_final: false })
        .eq("registration_id", sub.registration_id)
        .neq("id", submissionId);
    const { data, error } = await supabase
        .from("submission")
        .update({ is_final: true })
        .eq("id", submissionId)
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    return data as DbSubmission;
}

export async function deleteSubmission(
    supabase: SupabaseClient,
    id: number,
): Promise<void> {
    const { error } = await supabase.from("submission").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
