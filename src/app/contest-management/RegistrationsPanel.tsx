"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, X as XIcon, Info } from "lucide-react";
import { Button } from "@/components/features/admin/common/Button";
import ConfirmPopup from "@/components/features/admin/common/ConfirmPopup";
import { useToast } from "@/components/ui/Toast";
import type {
    DbContest,
    DbContestRegistration,
    DbRegistrationMember,
    RegistrationStatus,
} from "@/types/database";

interface Props {
    contest: DbContest;
    onBack: () => void;
}

interface MemberWithUser extends DbRegistrationMember {
    users?: {
        username: string;
        display_name: string | null;
        school: string | null;
    };
}

type RegistrationWithMembers = DbContestRegistration & { members: MemberWithUser[] };

const STATUS_LABELS: Record<RegistrationStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    withdrawn: "Đã rút",
};

const STATUS_STYLES: Record<RegistrationStatus, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    approved: "bg-green-500/20 text-green-500",
    rejected: "bg-red-500/20 text-red-500",
    withdrawn: "bg-foreground/10 text-foreground/60",
};

const FILTERS: Array<RegistrationStatus | "all"> = ["all", "pending", "approved", "rejected", "withdrawn"];

export default function RegistrationsPanel({ contest, onBack }: Props) {
    const { showToast } = useToast();
    const [regs, setRegs] = useState<RegistrationWithMembers[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RegistrationStatus | "all">("all");
    const [actingId, setActingId] = useState<number | null>(null);
    const [infoReg, setInfoReg] = useState<RegistrationWithMembers | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/contests/${contest.id}/registrations`);
            const ct = res.headers.get("content-type") ?? "";
            if (!ct.includes("application/json")) {
                throw new Error(
                    res.status === 401 || res.status === 403
                        ? "Phiên đăng nhập hết hạn — vui lòng tải lại trang."
                        : `Lỗi máy chủ (${res.status})`,
                );
            }
            const json = await res.json();
            if (json.success) setRegs(json.data ?? []);
            else throw new Error(json.message || "Lỗi tải dữ liệu");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [contest.id, showToast]);

    useEffect(() => {
        refresh();
    }, [refresh]);

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
                        ? "Phiên đăng nhập hết hạn — vui lòng tải lại trang."
                        : `Lỗi máy chủ (${res.status})`,
                );
            }
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Cập nhật thất bại");
            showToast("success", status === "approved" ? "Đã duyệt đăng ký" : "Đã từ chối đăng ký");
            refresh();
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Cập nhật thất bại");
        } finally {
            setActingId(null);
        }
    }

    const filtered = filter === "all" ? regs : regs.filter((r) => r.status === filter);

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-accent transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
                <span className="text-foreground/30">/</span>
                <h2 className="text-lg font-semibold tracking-wide">{contest.title}</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {FILTERS.map((f) => {
                    const active = filter === f;
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
                            {f === "all" ? "Tất cả" : STATUS_LABELS[f]}
                            <span className="ml-1.5 text-foreground/50">
                                ({f === "all" ? regs.length : regs.filter((r) => r.status === f).length})
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-lg border border-(--border-color) bg-(--post-card)">
                {loading ? (
                    <div className="p-6 text-sm text-foreground/60">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-sm text-foreground/60">Không có đăng ký nào.</div>
                ) : (
                    <div className="divide-y divide-(--border-color)">
                        {filtered.map((r) => (
                            <div key={r.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => setInfoReg(r)}
                                            className="text-foreground/50 hover:text-accent transition-colors"
                                            title="Xem chi tiết đội"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-medium">
                                            {r.team_name || `Đăng ký #${r.id}`}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-[4px] ${STATUS_STYLES[r.status]}`}>
                                            {STATUS_LABELS[r.status]}
                                        </span>
                                    </div>
                                    <div className="text-xs text-foreground/60 mt-1">
                                        {r.members.length} thành viên • Đăng ký {new Date(r.registered_at).toLocaleString("vi-VN")}
                                    </div>
                                </div>

                                {r.status === "pending" && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="publish"
                                            icon={<Check className="w-4 h-4" />}
                                            onClick={() => setStatus(r.id, "approved")}
                                            isLoading={actingId === r.id}
                                            loadingText="..."
                                        >
                                            Duyệt
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            icon={<XIcon className="w-4 h-4" />}
                                            onClick={() => setStatus(r.id, "rejected")}
                                            isLoading={actingId === r.id}
                                            loadingText="..."
                                        >
                                            Từ chối
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {infoReg && (
                <ConfirmPopup
                    title={`Chi tiết đội: ${infoReg.team_name || "Đăng ký #" + infoReg.id}`}
                    message=""
                    onCancel={() => setInfoReg(null)}
                    icon={Info}
                    variant="info"
                    confirmText="Đóng"
                    hideCancelButton
                    onConfirm={async () => setInfoReg(null)}
                >
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {infoReg.members.map((m, i) => (
                            <div key={m.user_id} className="p-3 bg-foreground/5 rounded-md border border-(--border-color)">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                        {m.users?.display_name || "Không có tên"}
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded uppercase tracking-wider">
                                        {m.role === "leader" ? "Trưởng nhóm" : "Thành viên"}
                                    </span>
                                </div>
                                <div className="text-xs text-foreground/70 space-y-1">
                                    <p><span className="font-medium">Username:</span> {m.users?.username}</p>
                                    <p><span className="font-medium">UUID:</span> {m.user_id}</p>
                                    <p><span className="font-medium">Trường:</span> {m.users?.school || "Chưa cập nhật"}</p>
                                    <p><span className="font-medium">Tham gia lúc:</span> {new Date(m.joined_at).toLocaleString("vi-VN")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ConfirmPopup>
            )}
        </div>
    );
}
