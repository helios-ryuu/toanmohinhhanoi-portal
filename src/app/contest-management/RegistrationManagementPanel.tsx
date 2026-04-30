"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Download, FileText, Search, X as XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/features/admin/common/Button";
import { useToast } from "@/components/ui/Toast";
import type {
    DbContest,
    DbContestRegistration,
    DbRegistrationMember,
    DbSubmission,
    RegistrationStatus,
} from "@/types/database";

interface MemberWithUser extends DbRegistrationMember {
    users?: {
        username: string;
        display_name: string | null;
        school: string | null;
    };
}

type RegistrationWithMembers = DbContestRegistration & { members: MemberWithUser[] };

interface Props {
    contest: DbContest;
    onBack: () => void;
}

const STATUS_STYLES: Record<RegistrationStatus, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    approved: "bg-green-500/20 text-green-500",
    rejected: "bg-red-500/20 text-red-500",
    withdrawn: "bg-foreground/10 text-foreground/60",
};

const FILTERS: Array<RegistrationStatus | "all"> = ["all", "pending", "approved", "rejected", "withdrawn"];

const STATUS_ORDER: Record<RegistrationStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
    withdrawn: 3,
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SubmissionRow({ sub }: { sub: DbSubmission }) {
    const { showToast } = useToast();
    const t = useTranslations("registrations");
    const [loading, setLoading] = useState(false);

    async function download() {
        setLoading(true);
        try {
            const metaRes = await fetch(`/api/admin/submissions/${sub.id}/signed-url`);
            const metaJson = await metaRes.json();
            if (!metaJson.success) throw new Error(metaJson.message || t("linkError"));

            const fileRes = await fetch(metaJson.data.url);
            if (!fileRes.ok) throw new Error(t("downloadError"));
            const blob = await fileRes.blob();

            const anchor = document.createElement("a");
            anchor.href = URL.createObjectURL(blob);
            anchor.download = sub.file_name;
            anchor.click();
            URL.revokeObjectURL(anchor.href);
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : t("downloadError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2 p-2 rounded bg-foreground/5 border border-(--border-color)">
            <FileText className="w-4 h-4 shrink-0 text-foreground/50" />
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{sub.file_name}</div>
                <div className="text-[10px] text-foreground/50 mt-0.5">
                    {formatBytes(sub.file_size_bytes)} •{" "}
                    {new Date(sub.submitted_at).toLocaleString("vi-VN")}
                    {sub.is_final && (
                        <span className="ml-1.5 px-1 py-0.5 bg-accent/20 text-accent rounded text-[9px] uppercase tracking-wider">
                            {t("isFinal")}
                        </span>
                    )}
                    {sub.note && <span className="ml-1 text-foreground/40 italic">"{sub.note}"</span>}
                </div>
            </div>
            <button
                type="button"
                onClick={download}
                disabled={loading}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-(--border-color) hover:border-accent hover:text-accent transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
                <Download className="w-3 h-3" />
                {loading ? "..." : t("download")}
            </button>
        </div>
    );
}

function RegistrationCard({
    reg,
    submissions,
    actingId,
    onSetStatus,
    statusLabels,
}: {
    reg: RegistrationWithMembers;
    submissions: DbSubmission[];
    actingId: number | null;
    onSetStatus: (id: number, status: "approved" | "rejected") => Promise<void>;
    statusLabels: Record<RegistrationStatus, string>;
}) {
    const t = useTranslations("registrations");
    const [expanded, setExpanded] = useState(false);
    const regSubs = submissions.filter((s) => s.registration_id === reg.id);

    return (
        <div className="rounded-lg border border-(--border-color) bg-(--post-card) overflow-hidden">
            {/* Row header */}
            <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        {expanded ? (
                            <ChevronUp className="w-4 h-4 shrink-0 text-foreground/40" />
                        ) : (
                            <ChevronDown className="w-4 h-4 shrink-0 text-foreground/40" />
                        )}
                        <span className="text-sm font-medium">
                            {reg.team_name || `${t("registrationFallback")} #${reg.id}`}
                        </span>
                        <span
                            className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-[4px] ${STATUS_STYLES[reg.status]}`}
                        >
                            {statusLabels[reg.status]}
                        </span>
                        {regSubs.length > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-[4px] bg-blue-500/20 text-blue-400">
                                {t("submissionCount", { count: regSubs.length })}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-foreground/50 mt-0.5 ml-6">
                        {t("memberCount", { count: reg.members.length })} •{" "}
                        {new Date(reg.registered_at).toLocaleString()}
                    </div>
                </button>

                {reg.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="publish"
                            icon={<Check className="w-4 h-4" />}
                            onClick={() => onSetStatus(reg.id, "approved")}
                            isLoading={actingId === reg.id}
                            loadingText="..."
                        >
                            {t("approve")}
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            icon={<XIcon className="w-4 h-4" />}
                            onClick={() => onSetStatus(reg.id, "rejected")}
                            isLoading={actingId === reg.id}
                            loadingText="..."
                        >
                            {t("reject")}
                        </Button>
                    </div>
                )}
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="border-t border-(--border-color) px-4 py-3 grid md:grid-cols-2 gap-4">
                    {/* Members */}
                    <div>
                        <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                            {t("membersHeader", { count: reg.members.length })}
                        </div>
                        <div className="space-y-2">
                            {reg.members.map((m) => (
                                <div key={m.user_id} className="p-2 bg-foreground/5 rounded border border-(--border-color)">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span
                                            className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                                                m.role === "leader"
                                                    ? "bg-accent/20 text-accent"
                                                    : "bg-foreground/10 text-foreground/60"
                                            }`}
                                        >
                                            {m.role === "leader" ? t("leaderRole") : t("memberRole")}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {m.users?.display_name || m.users?.username || m.user_id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-foreground/50 space-y-0.5 ml-0.5">
                                        <div>@{m.users?.username ?? "—"}</div>
                                        {m.users?.school && <div>{m.users.school}</div>}
                                        <div>
                                            {t("joinedAt")}: {new Date(m.joined_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submissions */}
                    <div>
                        <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                            {t("submissions")}
                        </div>
                        {regSubs.length === 0 ? (
                            <div className="text-xs text-foreground/40 italic">{t("noSubmissions")}</div>
                        ) : (
                            <div className="space-y-1.5">
                                {regSubs.map((s) => (
                                    <SubmissionRow key={s.id} sub={s} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RegistrationManagementPanel({ contest, onBack }: Props) {
    const { showToast } = useToast();
    const t = useTranslations("registrations");

    const statusLabels: Record<RegistrationStatus, string> = {
        pending: t("statusPending"),
        approved: t("statusApproved"),
        rejected: t("statusRejected"),
        withdrawn: t("statusWithdrawn"),
    };

    const sortOptions = [
        { value: "newest", label: t("sortNewest") },
        { value: "oldest", label: t("sortOldest") },
        { value: "status", label: t("sortStatus") },
    ];

    const [regs, setRegs] = useState<RegistrationWithMembers[]>([]);
    const [submissions, setSubmissions] = useState<DbSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RegistrationStatus | "all">("all");
    const [actingId, setActingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [regsRes, subsRes] = await Promise.all([
                fetch(`/api/admin/contests/${contest.id}/registrations`),
                fetch(`/api/admin/contests/${contest.id}/submissions`),
            ]);
            for (const res of [regsRes, subsRes]) {
                const ct = res.headers.get("content-type") ?? "";
                if (!ct.includes("application/json")) {
                    throw new Error(
                        res.status === 401 || res.status === 403
                            ? t("sessionExpired")
                            : t("serverError", { status: res.status }),
                    );
                }
            }
            const [regsJson, subsJson] = await Promise.all([regsRes.json(), subsRes.json()]);
            if (!regsJson.success) throw new Error(regsJson.message || t("loading"));
            if (!subsJson.success) throw new Error(subsJson.message || t("loading"));
            setRegs(regsJson.data ?? []);
            setSubmissions(subsJson.data ?? []);
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : t("loading"));
        } finally {
            setLoading(false);
        }
    }, [contest.id, showToast]);

    useEffect(() => { refresh(); }, [refresh]);

    async function setStatus(id: number, status: "approved" | "rejected") {
        setActingId(id);
        try {
            const res = await fetch(`/api/admin/registrations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const ct = res.headers.get("content-type") ?? "";
            if (!ct.includes("application/json")) {
                throw new Error(
                    res.status === 401 || res.status === 403
                        ? t("sessionExpired")
                        : t("serverError", { status: res.status }),
                );
            }
            const json = await res.json();
            if (!json.success) throw new Error(json.message || t("updateFailed"));
            showToast("success", status === "approved" ? t("approveSuccess") : t("rejectSuccess"));
            refresh();
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : t("updateFailed"));
        } finally {
            setActingId(null);
        }
    }

    const displayed = useMemo(() => {
        let result = filter === "all" ? [...regs] : regs.filter((r) => r.status === filter);

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter((r) => {
                if (r.team_name?.toLowerCase().includes(q)) return true;
                return r.members.some(
                    (m) =>
                        m.users?.username?.toLowerCase().includes(q) ||
                        m.users?.display_name?.toLowerCase().includes(q),
                );
            });
        }

        result.sort((a, b) => {
            if (sort === "oldest")
                return new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime();
            if (sort === "status") return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
            return new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime();
        });

        return result;
    }, [regs, filter, search, sort]);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-accent transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("backLabel")}
                </button>
                <span className="text-foreground/30">/</span>
                <h2 className="text-lg font-semibold tracking-wide">{contest.title}</h2>
                <span className="text-xs text-foreground/40">— {t("panelTitle")}</span>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("search")}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-(--border-color) bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded-md border border-(--border-color) bg-background text-foreground focus:outline-none cursor-pointer"
                >
                    {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                {FILTERS.map((f) => {
                    const active = filter === f;
                    const count = f === "all" ? regs.length : regs.filter((r) => r.status === f).length;
                    return (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
                                active
                                    ? "border-accent bg-accent/20 text-accent"
                                    : "border-(--border-color) text-foreground/70 hover:border-(--border-color-hover) hover:bg-foreground/5"
                            }`}
                        >
                            {f === "all" ? t("filterAll") : statusLabels[f]}
                            <span className="ml-1.5 text-foreground/50">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="rounded-lg border border-(--border-color) bg-(--post-card) p-8 text-center text-sm text-foreground/60">
                    {t("loading")}
                </div>
            ) : displayed.length === 0 ? (
                <div className="rounded-lg border border-(--border-color) bg-(--post-card) p-6 text-sm text-foreground/60">
                    {search ? t("noResults", { q: search }) : t("empty")}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((r) => (
                        <RegistrationCard
                            key={r.id}
                            reg={r}
                            submissions={submissions}
                            actingId={actingId}
                            onSetStatus={setStatus}
                            statusLabels={statusLabels}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
