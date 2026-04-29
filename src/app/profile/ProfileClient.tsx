"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { Button } from "@/components/features/admin/common/Button";
import { FormField, FormInput, FormTextarea } from "@/components/features/admin/common/FormFields";
import { useUser } from "@/contexts/UserContext";
import type { User } from "@/types/user";

const LIMITS = { display_name: 100, school: 200, bio: 500 } as const;

function ProfileForm() {
    const { user: ctxUser, refresh } = useUser();
    const { showToast } = useToast();
    const t = useTranslations("profile");
    const [profile, setProfile] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [school, setSchool] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/auth/me", { cache: "no-store" });
                const json = await res.json();
                if (!cancelled && json.success) {
                    const data = json.data as User;
                    setProfile(data);
                    setDisplayName(data.display_name ?? "");
                    setSchool(data.school ?? "");
                    setBio(data.bio ?? "");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const overDisplay = displayName.length > LIMITS.display_name;
    const overSchool = school.length > LIMITS.school;
    const overBio = bio.length > LIMITS.bio;
    const hasError = overDisplay || overSchool || overBio;

    const onSave = async () => {
        if (hasError) {
            showToast("error", t("lengthError"));
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    display_name: displayName.trim() || null,
                    school: school.trim() || null,
                    bio: bio.trim() || null,
                }),
            });
            const json = await res.json();
            if (json.success) {
                showToast("success", t("saveSuccess"));
                setProfile(json.data as User);
                await refresh();
            } else {
                showToast("error", json.message ?? t("saveFailed"));
            }
        } catch {
            showToast("error", t("networkError"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="text-foreground/60 text-sm">{t("loading")}</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="text-red-500 text-sm">{t("loadFailed")}</div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold tracking-widest text-accent">{t("pageTitle")}</h1>
            <p className="text-sm text-foreground/60 mt-1 mb-6">{t("pageSubtitle")}</p>

            <div className="rounded-lg border border-(--border-color) bg-(--post-card) p-6 mb-6 space-y-4">
                <ReadonlyRow label={t("username")} value={profile.username} />
                <ReadonlyRow label={t("email")} value={profile.email ?? "—"} />
                <ReadonlyRow label={t("role")} value={profile.role === "admin" ? t("roleAdmin") : t("roleUser")} />
            </div>

            <div className="rounded-lg border border-(--border-color) bg-(--post-card) p-6 space-y-4">
                <h2 className="text-sm font-semibold tracking-widest text-foreground/80 uppercase">{t("editSection")}</h2>

                <FormField
                    label={t("displayName")}
                    error={overDisplay ? t("maxChars", { max: LIMITS.display_name }) : undefined}
                    charCount={{ current: displayName.length, max: LIMITS.display_name }}
                >
                    <FormInput
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t("displayNamePlaceholder")}
                        hasError={overDisplay}
                        maxLength={LIMITS.display_name + 20}
                    />
                </FormField>

                <FormField
                    label={t("school")}
                    error={overSchool ? t("maxChars", { max: LIMITS.school }) : undefined}
                    charCount={{ current: school.length, max: LIMITS.school }}
                >
                    <FormInput
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder={t("schoolPlaceholder")}
                        hasError={overSchool}
                        maxLength={LIMITS.school + 20}
                    />
                </FormField>

                <FormField
                    label={t("bio")}
                    error={overBio ? t("maxChars", { max: LIMITS.bio }) : undefined}
                    charCount={{ current: bio.length, max: LIMITS.bio }}
                >
                    <FormTextarea
                        rows={5}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={t("bioPlaceholder")}
                        hasError={overBio}
                        maxLength={LIMITS.bio + 50}
                    />
                </FormField>

                <div className="flex justify-end pt-2">
                    <Button
                        variant="primary"
                        onClick={onSave}
                        isLoading={saving}
                        loadingText={t("saving")}
                        disabled={hasError}
                    >
                        {t("save")}
                    </Button>
                </div>
            </div>

            {ctxUser?.role === "admin" && (
                <p className="text-xs text-foreground/40 mt-4">{t("adminNote")}</p>
            )}
        </div>
    );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="text-sm text-foreground/60 sm:w-40 shrink-0">{label}</div>
            <div className="text-sm text-foreground break-all">{value}</div>
        </div>
    );
}

export default function ProfileClient() {
    return (
        <ToastProvider>
            <ProfileForm />
        </ToastProvider>
    );
}
