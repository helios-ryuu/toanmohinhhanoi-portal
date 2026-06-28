import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, handleRouteError } from "@/lib/api-helpers";
import { dbUserToUser, deleteUser, updateUserAdmin, type UserAdminInput } from "@/lib/users-db";

function normalizePatch(body: Record<string, unknown>): Partial<UserAdminInput> | string {
    const patch: Partial<UserAdminInput> = {};
    if ("username" in body) {
        const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
        if (!/^[a-z0-9_]{3,30}$/.test(username)) return "username must be 3-30 lowercase letters, numbers, or underscores";
        patch.username = username;
    }
    if ("password" in body) {
        if (typeof body.password !== "string" || body.password.length < 1) return "password is required";
        patch.password = body.password;
    }
    if ("full_name" in body) {
        const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
        if (!fullName) return "full_name is required";
        patch.full_name = fullName;
    }
    for (const key of ["email", "phone", "school"] as const) {
        if (key in body) {
            patch[key] = typeof body[key] === "string" && body[key].trim() ? body[key].trim() : null;
        }
    }
    if ("role" in body) {
        if (body.role !== "user" && body.role !== "admin") return "role must be user or admin";
        patch.role = body.role;
    }
    return patch;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const patch = normalizePatch(body);
        if (typeof patch === "string") return apiError(patch, 400);
        const supabase = createSupabaseAdminClient();
        const updated = await updateUserAdmin(supabase, id, patch);
        return apiSuccess(dbUserToUser(updated));
    } catch (err) {
        return handleRouteError(err);
    }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const current = await requireAdmin();
        const { id } = await ctx.params;
        if (id === current.profile.id) return apiError("You cannot delete your own account", 400);
        const supabase = createSupabaseAdminClient();
        await deleteUser(supabase, id);
        return apiSuccess({ id });
    } catch (err) {
        return handleRouteError(err);
    }
}
