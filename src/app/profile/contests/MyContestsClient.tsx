"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Clock, Users, Upload, FileText, CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// ─── helpers ────────────────────────────────────────────────────────────────

function isSubmissionOpen(contest: any): boolean {
    if (!contest || contest.status !== "active" || !contest.contest_stage) return false;
    const now = Date.now();
    return contest.contest_stage.some((stage: any) => {
        if (!stage.allow_submission) return false;
        const start = new Date(stage.start_at).getTime();
        const end = new Date(stage.end_at).getTime();
        return start <= now && now <= end;
    });
}

function getActiveSubmissionStage(contest: any): any | null {
    if (!contest?.contest_stage) return null;
    const now = Date.now();
    return (
        contest.contest_stage.find((s: any) => {
            if (!s.allow_submission) return false;
            return new Date(s.start_at).getTime() <= now && now <= new Date(s.end_at).getTime();
        }) ?? null
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── UploadForm ─────────────────────────────────────────────────────────────

function UploadForm({
    registrationId,
    onSuccess,
    replacing,
}: {
    registrationId: number;
    onSuccess: () => void;
    replacing: boolean;
}) {
    const { showToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [note, setNote] = useState("");
    const [uploading, setUploading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) { showToast("warning", "Vui lòng chọn file để nộp"); return; }
        if (file.size > 5 * 1024 * 1024) { showToast("error", "Kích thước file không được vượt quá 5MB"); return; }

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("registration_id", registrationId.toString());
            fd.append("file", file);
            if (note) fd.append("note", note);

            const res = await fetch("/api/submissions", { method: "POST", body: fd });
            const json = await res.json();
            if (json.success) {
                showToast("success", replacing ? "Đã thay thế bài nộp!" : "Nộp bài thành công!");
                onSuccess();
            } else {
                showToast("error", json.message || "Lỗi khi nộp bài");
            }
        } catch {
            showToast("error", "Không thể nộp bài, vui lòng thử lại sau.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-background border border-(--border-color) space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
                {replacing ? <RefreshCw className="w-4 h-4 text-accent" /> : <Upload className="w-4 h-4 text-accent" />}
                {replacing ? "Thay thế bài nộp" : "Nộp bài"}
            </h4>
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    File đính kèm (tối đa 5 MB)
                </label>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                    className="block w-full text-sm text-foreground/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 transition-colors"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">Ghi chú (tuỳ chọn)</label>
                <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={uploading}
                    className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Ghi chú về bài giải…"
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={uploading || !file}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : replacing ? (
                        <RefreshCw className="w-4 h-4" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {replacing ? "Xác nhận thay thế" : "Xác nhận nộp bài"}
                </button>
            </div>
        </form>
    );
}

// ─── SubmissionSection ───────────────────────────────────────────────────────

function SubmissionSection({ registration, onRefresh }: { registration: any; onRefresh: () => void }) {
    const { showToast } = useToast();
    const [showReplaceForm, setShowReplaceForm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const open = isSubmissionOpen(registration.contest);
    const activeStage = getActiveSubmissionStage(registration.contest);
    const submissions: any[] = registration.submission ?? [];
    const existing = submissions[0] ?? null; // API returns most recent first
    const canResubmit: boolean = open && !!activeStage?.allow_resubmit;

    async function handleDelete() {
        if (!existing) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/submissions/${existing.id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                showToast("success", "Đã xoá bài nộp");
                onRefresh();
            } else {
                showToast("error", json.message || "Xoá thất bại");
            }
        } catch {
            showToast("error", "Xoá thất bại");
        } finally {
            setDeleting(false);
        }
    }

    if (!open) return null;

    // No existing submission → show upload form
    if (!existing) {
        return (
            <div className="mt-4 pt-4 border-t border-(--border-color)/80">
                <UploadForm
                    registrationId={registration.id}
                    replacing={false}
                    onSuccess={onRefresh}
                />
            </div>
        );
    }

    // Has existing submission
    return (
        <div className="mt-4 pt-4 border-t border-(--border-color)/80 space-y-3">
            {/* existing file card */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-600">Đã nộp bài</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <FileText className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
                        <span className="text-xs text-foreground/70 truncate">{existing.file_name}</span>
                        <span className="text-xs text-foreground/40 shrink-0">
                            ({formatBytes(existing.file_size_bytes)})
                        </span>
                    </div>
                    <p className="text-xs text-foreground/50 mt-0.5">
                        {new Date(existing.submitted_at).toLocaleString("vi-VN")}
                        {existing.note && <span className="ml-1 italic">— {existing.note}</span>}
                    </p>
                </div>
                {canResubmit && (
                    <div className="flex gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowReplaceForm((v) => !v)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded border border-(--border-color) hover:border-accent hover:text-accent transition-colors cursor-pointer"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Thay thế
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded border border-(--border-color) text-red-400 hover:border-red-400 hover:bg-red-400/10 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 className="w-3 h-3" />
                            {deleting ? "..." : "Xoá"}
                        </button>
                    </div>
                )}
            </div>

            {canResubmit && showReplaceForm && (
                <UploadForm
                    registrationId={registration.id}
                    replacing={true}
                    onSuccess={() => { setShowReplaceForm(false); onRefresh(); }}
                />
            )}

            {!canResubmit && open && (
                <p className="text-xs text-foreground/50 italic">
                    Giai đoạn này không cho phép nộp lại sau khi đã nộp.
                </p>
            )}
        </div>
    );
}

// ─── MyContestsClient ────────────────────────────────────────────────────────

export function MyContestsClient() {
    const t = useTranslations("contests");
    const { showToast } = useToast();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchRegs() {
        try {
            const res = await fetch("/api/users/me/registrations");
            if (res.ok) {
                const json = await res.json();
                if (json.success) setRegistrations(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchRegs(); }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Về hồ sơ
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cuộc thi của tôi</h1>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            ) : registrations.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-(--border-color) rounded-xl">
                    <p className="text-foreground/60">Bạn chưa đăng ký tham gia cuộc thi nào.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div key={reg.id} className="p-4 sm:p-5 rounded-xl border border-(--border-color) bg-(--post-card) shadow-sm flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <Link href={`/contests/${reg.contest?.slug}`} className="text-lg font-semibold hover:text-accent transition-colors">
                                        {reg.contest?.title || "Cuộc thi không tên"}
                                    </Link>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-foreground/60 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            Đăng ký lúc: {new Date(reg.registered_at).toLocaleDateString("vi-VN")}
                                        </span>
                                        {reg.team_name && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                Đội: {reg.team_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`shrink-0 text-xs px-2 py-1 rounded-md border font-medium ${
                                    reg.status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    reg.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                }`}>
                                    {t(`status_${reg.status}`)}
                                </span>
                            </div>

                            {reg.registration_member?.length > 0 && (
                                <div className="pt-3 border-t border-(--border-color)/50">
                                    <p className="text-xs font-medium text-foreground/50 mb-2 uppercase tracking-wide">Thành viên</p>
                                    <div className="flex flex-wrap gap-2">
                                        {reg.registration_member.map((m: any) => (
                                            <span key={m.user_id} className="text-xs px-2 py-1 rounded bg-foreground/5 border border-(--border-color)">
                                                {m.users?.username || "Ẩn danh"} {m.role === "leader" && "👑"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {reg.status === "approved" && (
                                <SubmissionSection registration={reg} onRefresh={fetchRegs} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
