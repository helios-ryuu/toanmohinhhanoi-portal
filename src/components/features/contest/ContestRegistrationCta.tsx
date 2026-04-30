"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/Toast";
import type { ContestWithStages, ContestParticipationType, DbContestRegistration } from "@/types/database";
import { ExternalLink } from "lucide-react";

function parseUsernames(raw: string): string[] {
    return raw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

function isRegistrationOpen(contest: ContestWithStages, now = Date.now()): boolean {
    if (contest.status !== "active") return false;
    return (contest.stages ?? []).some((stage) => {
        if (!stage.allow_registration) return false;
        const start = new Date(stage.start_at).getTime();
        const end = new Date(stage.end_at).getTime();
        return start <= now && now <= end;
    });
}

function initialMode(type: ContestParticipationType): "individual" | "team" {
    return type === "team" ? "team" : "individual";
}

function isAlreadyRegisteredMessage(message?: string): boolean {
    if (!message) return false;
    return /already registered/i.test(message);
}

export default function ContestRegistrationCta({ contest }: { contest: ContestWithStages }) {
    const t = useTranslations("contests");
    const router = useRouter();
    const { user, isLoading } = useUser();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [memberUsernamesRaw, setMemberUsernamesRaw] = useState("");
    const [mode, setMode] = useState<"individual" | "team">(initialMode(contest.participation_type));
    const [existingReg, setExistingReg] = useState<DbContestRegistration | null>(null);
    const [loadingReg, setLoadingReg] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoadingReg(false);
            return;
        }
        async function fetchReg() {
            try {
                const res = await fetch(`/api/contests/${contest.slug}/my-registration`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setExistingReg(json.data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingReg(false);
            }
        }
        fetchReg();
    }, [contest.slug, user]);

    const canRegister = useMemo(() => isRegistrationOpen(contest), [contest]);
    const allowTeam = contest.participation_type !== "individual";
    const allowModeChoice = contest.participation_type === "both";
    const useTeamMode = contest.participation_type === "team" || (allowModeChoice && mode === "team");

    const hint = existingReg
        ? ""
        : !canRegister
        ? t("registerHintClosed")
        : !user
        ? t("registerHintLogin")
        : t("registerHintOpen");

    const isDisabled = submitting || isLoading || loadingReg || !canRegister || !!existingReg;

    async function handleRegister() {
        if (!user && !isLoading) {
            router.push(`/auth?next=/contests/${contest.slug}`);
            return;
        }
        if (!canRegister || submitting) return;

        const memberUsernames = useTeamMode ? parseUsernames(memberUsernamesRaw) : [];
        const maxMembers = contest.max_team_size;

        if (useTeamMode) {
            if (memberUsernames.length === 0) {
                showToast("warning", t("registerNeedTeamMember"));
                return;
            }
            if (memberUsernames.length + 1 > maxMembers) {
                showToast("error", t("registerTeamTooLarge", { count: maxMembers }));
                return;
            }
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/contests/${contest.slug}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    team_name: useTeamMode ? (teamName.trim() || null) : null,
                    member_usernames: memberUsernames,
                }),
            });
            const ct = res.headers.get("content-type") ?? "";
            if (!ct.includes("application/json")) {
                if (res.status === 401 || res.status === 403) {
                    showToast("error", t("registerLoginRequired"));
                    router.push(`/auth?next=/contests/${contest.slug}`);
                    return;
                }
                showToast("error", t("registerFailed"));
                return;
            }
            const json = await res.json();
            if (!json.success) {
                if (isAlreadyRegisteredMessage(json.message)) {
                    showToast("info", t("registerAlready"));
                    return;
                }
                showToast("error", json.message || t("registerFailed"));
                return;
            }
            showToast("success", t("registerSuccess"));
            setTeamName("");
            setMemberUsernamesRaw("");
            setExistingReg({
                id: json.data.id,
                contest_id: contest.id,
                status: "pending",
                team_name: useTeamMode ? teamName.trim() || null : null,
                registered_at: new Date().toISOString(),
            } as any);
        } catch (err) {
            const message = err instanceof Error ? err.message : undefined;
            if (isAlreadyRegisteredMessage(message)) {
                showToast("info", t("registerAlready"));
            } else {
                showToast("error", message || t("registerFailed"));
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (!isLoading && user?.role === "admin") {
        return (
            <div className="mt-8 pt-6 border-t border-(--border-color)">
                <p className="text-xs text-foreground/50 italic">{t("registerAdminForbidden")}</p>
            </div>
        );
    }

    if (existingReg) {
        return (
            <div className="mt-8 pt-6 border-t border-(--border-color) flex flex-col gap-3">
                <div className="p-4 rounded-md border border-accent/20 bg-accent/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-foreground">{t("alreadyRegisteredTitle")}</p>
                        <p className="text-sm text-foreground/70 mt-1">
                            {t("statusLabel")} <span className="font-semibold">{t(`status_${existingReg.status}`)}</span>
                        </p>
                        {existingReg.team_name && (
                            <p className="text-sm text-foreground/70">
                                {t("teamLabel")} <span className="font-semibold">{existingReg.team_name}</span>
                            </p>
                        )}
                    </div>
                    {existingReg.status === "approved" && (
                        <button
                            type="button"
                            onClick={() => router.push("/profile/contests")}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent font-medium rounded-md transition-colors text-sm whitespace-nowrap cursor-pointer"
                        >
                            {t("goToMyContests")} <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!canRegister) {
        return null;
    }

    if (!isLoading && !loadingReg && !user) {
        return (
            <div className="mt-8 pt-6 border-t border-(--border-color) flex flex-col gap-3">
                <p className="text-sm text-foreground/60">{t("registerHintLogin")}</p>
                <button
                    type="button"
                    onClick={() => router.push(`/auth?next=/contests/${contest.slug}`)}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors cursor-pointer w-fit"
                >
                    {t("loginToRegister")}
                </button>
            </div>
        );
    }

    return (
        <div className="mt-8 pt-6 border-t border-(--border-color) flex flex-col gap-3">
            {hint && <p className="text-xs text-foreground/50">{hint}</p>}

            {allowModeChoice && (
                <div className="inline-flex rounded-md border border-(--border-color) bg-(--post-card) p-1 text-xs w-fit">
                    <button
                        type="button"
                        onClick={() => setMode("individual")}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            mode === "individual"
                                ? "bg-accent text-white"
                                : "text-foreground/70 hover:text-foreground"
                        }`}
                    >
                        {t("registerModeIndividual")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("team")}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            mode === "team" ? "bg-accent text-white" : "text-foreground/70 hover:text-foreground"
                        }`}
                    >
                        {t("registerModeTeam")}
                    </button>
                </div>
            )}

            {allowTeam && useTeamMode && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-foreground/70 flex flex-col gap-1">
                        {t("teamNameLabel")}
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder={t("teamNamePlaceholder")}
                            className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors border-(--border-color) focus:ring-accent/50"
                        />
                    </label>
                    <label className="text-xs text-foreground/70 flex flex-col gap-1">
                        {t("memberUsernamesLabel")}
                        <input
                            type="text"
                            value={memberUsernamesRaw}
                            onChange={(e) => setMemberUsernamesRaw(e.target.value)}
                            placeholder={t("memberUsernamesPlaceholder")}
                            className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors border-(--border-color) focus:ring-accent/50"
                        />
                        <span className="text-[11px] text-foreground/50">{t("memberUsernamesHint")}</span>
                    </label>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {allowTeam && (
                    <div className="text-xs text-foreground/50">
                        {t("registerCtaHelp", { count: contest.max_team_size })}
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleRegister}
                    disabled={isDisabled}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-md text-white font-medium text-sm transition-colors ${
                        isDisabled
                            ? "bg-accent/50 cursor-not-allowed"
                            : "bg-accent hover:bg-accent/90 cursor-pointer"
                    }`}
                >
                    {submitting ? t("registerSubmitting") : t("registerCta")}
                </button>
            </div>
        </div>
    );
}
