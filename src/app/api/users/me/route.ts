import { NextRequest } from "next/server";
import { createSupabaseServerClient, requireAuth } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleRouteError } from "@/lib/api-helpers";
import { updateUserProfile, dbUserToUser } from "@/lib/users-db";

const LIMITS = {
    display_name: 100,
    bio: 500,
    school: 200,
} as const;

const LABELS: Record<keyof typeof LIMITS, string> = {
    display_name: "Tên hiển thị",
    bio: "Giới thiệu",
    school: "Trường/Tổ chức",
};

function normalize(value: unknown): string | null | undefined {
    if (value === null) return null;
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

export async function GET() {
    try {
        const current = await requireAuth();
        return apiSuccess({
            ...dbUserToUser(current.profile),
            email: current.authUser.email ?? null,
        });
    } catch (err) {
        return handleRouteError(err);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const current = await requireAuth();
        const body = await req.json().catch(() => ({}));
        const patch: { display_name?: string | null; bio?: string | null; school?: string | null } = {};

        for (const key of ["display_name", "bio", "school"] as const) {
            if (!(key in body)) continue;
            const value = normalize(body[key]);
            if (value === undefined) {
                return apiError(`${LABELS[key]} không hợp lệ`, 400);
            }
            if (value !== null && value.length > LIMITS[key]) {
                return apiError(`${LABELS[key]} không vượt quá ${LIMITS[key]} ký tự`, 400);
            }
            patch[key] = value;
        }

        const supabase = await createSupabaseServerClient();
        const updated = await updateUserProfile(supabase, current.profile.id, patch);
        return apiSuccess(dbUserToUser(updated));
    } catch (err) {
        return handleRouteError(err);
    }
}
