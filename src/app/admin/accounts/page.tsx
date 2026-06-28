"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { Button } from "@/components/features/admin/common/Button";
import type { User } from "@/types/user";

type AccountDraft = {
    id?: string;
    username: string;
    password: string;
    full_name: string;
    email: string;
    phone: string;
    school: string;
    role: "user" | "admin";
};

const EMPTY_DRAFT: AccountDraft = {
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    school: "",
    role: "user",
};

function AccountManagement() {
    const { showToast } = useToast();
    const [accounts, setAccounts] = useState<User[]>([]);
    const [draft, setDraft] = useState<AccountDraft>(EMPTY_DRAFT);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/accounts", { cache: "no-store" });
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Không thể tải tài khoản.");
            setAccounts(json.data ?? []);
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Không thể tải tài khoản.");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    function edit(account: User) {
        setDraft({
            id: account.id,
            username: account.username,
            password: "",
            full_name: account.full_name,
            email: account.email ?? "",
            phone: account.phone ?? "",
            school: account.school ?? "",
            role: account.role,
        });
    }

    async function save() {
        if (!draft.username.trim() || !draft.full_name.trim() || (!draft.id && !draft.password)) {
            showToast("warning", "Username, họ tên và mật khẩu là bắt buộc khi tạo mới.");
            return;
        }
        setSaving(true);
        try {
            const body: Record<string, string> = {
                username: draft.username,
                full_name: draft.full_name,
                email: draft.email,
                phone: draft.phone,
                school: draft.school,
                role: draft.role,
            };
            if (draft.password) body.password = draft.password;
            const res = await fetch(draft.id ? `/api/admin/accounts/${draft.id}` : "/api/admin/accounts", {
                method: draft.id ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Lưu tài khoản thất bại.");
            showToast("success", draft.id ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản.");
            setDraft(EMPTY_DRAFT);
            refresh();
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Lưu tài khoản thất bại.");
        } finally {
            setSaving(false);
        }
    }

    async function remove(id: string) {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Xoá tài khoản thất bại.");
            showToast("success", "Đã xoá tài khoản.");
            refresh();
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Xoá tài khoản thất bại.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-widest text-accent">QUẢN LÝ TÀI KHOẢN</h1>
                <p className="text-sm text-foreground/70 mt-0.5">
                    Cấp tài khoản username/password cho thí sinh và quản trị viên.
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <section className="rounded-lg border border-(--border-color) bg-(--post-card) p-4 h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-widest">
                            {draft.id ? "Sửa tài khoản" : "Tạo tài khoản"}
                        </h2>
                        {draft.id && (
                            <button
                                type="button"
                                onClick={() => setDraft(EMPTY_DRAFT)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10"
                                aria-label="Đóng form sửa"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Field label="Username" value={draft.username} onChange={(v) => setDraft((d) => ({ ...d, username: v }))} />
                        <Field label={draft.id ? "Mật khẩu mới" : "Mật khẩu"} value={draft.password} type="password" onChange={(v) => setDraft((d) => ({ ...d, password: v }))} />
                        <Field label="Họ và tên" value={draft.full_name} onChange={(v) => setDraft((d) => ({ ...d, full_name: v }))} />
                        <Field label="Email" value={draft.email} type="email" onChange={(v) => setDraft((d) => ({ ...d, email: v }))} />
                        <Field label="Số điện thoại" value={draft.phone} onChange={(v) => setDraft((d) => ({ ...d, phone: v }))} />
                        <Field label="Trường/Tổ chức" value={draft.school} onChange={(v) => setDraft((d) => ({ ...d, school: v }))} />
                        <label className="block text-xs text-foreground/70">
                            Vai trò
                            <select
                                value={draft.role}
                                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as "user" | "admin" }))}
                                className="mt-1 w-full rounded-md border border-(--border-color) bg-background px-3 py-2 text-sm text-foreground outline-none"
                            >
                                <option value="user">Thí sinh</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                    </div>

                    <Button
                        variant="primary"
                        icon={draft.id ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        onClick={save}
                        isLoading={saving}
                        loadingText="Đang lưu..."
                        fullWidth
                        className="mt-4"
                    >
                        {draft.id ? "Lưu thay đổi" : "Tạo tài khoản"}
                    </Button>
                </section>

                <section className="rounded-lg border border-(--border-color) bg-(--post-card) overflow-hidden">
                    <div className="hidden md:grid grid-cols-[1.2fr_1.5fr_1.2fr_100px_130px] gap-3 px-4 py-3 text-xs font-semibold text-foreground/60 border-b border-(--border-color) bg-foreground/5">
                        <span>Username</span>
                        <span>Thông tin</span>
                        <span>Trường</span>
                        <span>Vai trò</span>
                        <span className="text-right">Thao tác</span>
                    </div>
                    {loading ? (
                        <div className="p-8 text-sm text-foreground/60 text-center">Đang tải...</div>
                    ) : accounts.length === 0 ? (
                        <div className="p-8 text-sm text-foreground/60 text-center">Chưa có tài khoản nào.</div>
                    ) : (
                        <div className="divide-y divide-(--border-color)">
                            {accounts.map((account) => (
                                <div key={account.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_1.2fr_100px_130px] gap-3 px-4 py-3 items-center">
                                    <div className="font-medium">@{account.username}</div>
                                    <div className="text-sm min-w-0">
                                        <div className="truncate">{account.full_name}</div>
                                        <div className="text-xs text-foreground/50 truncate">
                                            {[account.email, account.phone].filter(Boolean).join(" • ") || "—"}
                                        </div>
                                    </div>
                                    <div className="text-sm text-foreground/70 truncate">{account.school || "—"}</div>
                                    <div>
                                        <span className={`px-2 py-0.5 rounded text-xs ${account.role === "admin" ? "bg-red-500/15 text-red-400" : "bg-accent/15 text-accent"}`}>
                                            {account.role === "admin" ? "Admin" : "User"}
                                        </span>
                                    </div>
                                    <div className="flex justify-start md:justify-end gap-1.5">
                                        <Button size="sm" variant="save" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => edit(account)}>
                                            Sửa
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            icon={<Trash2 className="w-3.5 h-3.5" />}
                                            onClick={() => remove(account.id)}
                                            isLoading={deletingId === account.id}
                                            loadingText="..."
                                        >
                                            Xoá
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
}) {
    return (
        <label className="block text-xs text-foreground/70">
            {label}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-(--border-color) bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/50"
            />
        </label>
    );
}

export default function AccountsPage() {
    return (
        <ToastProvider>
            <AccountManagement />
        </ToastProvider>
    );
}
