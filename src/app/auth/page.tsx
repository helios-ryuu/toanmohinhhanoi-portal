"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/Toast";
import { FormField, FormInput, FormMessage } from "@/components/features/admin/common/FormFields";
import {
    PASSWORD_RULES,
    evaluatePasswordRules,
    getPasswordValidationError,
    type PasswordRuleStatus,
} from "@/lib/password-policy";

type Tab = "login" | "register";
type LoginField = "identifier" | "password";
type RegisterField = "email" | "username" | "password" | "confirmPassword";

interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasFieldErrors<T extends string>(errors: Partial<Record<T, string>>) {
    return Object.values(errors).some(Boolean);
}

function validateLoginForm(identifier: string, password: string): Partial<Record<LoginField, string>> {
    const errors: Partial<Record<LoginField, string>> = {};

    if (!identifier.trim()) {
        errors.identifier = "Email or username is required";
    }

    if (!password) {
        errors.password = "Password is required";
    }

    return errors;
}

function validateRegisterForm(form: RegisterFormData): Partial<Record<RegisterField, string>> {
    const errors: Partial<Record<RegisterField, string>> = {};
    const email = form.email.trim();
    const username = form.username.trim();

    if (!email) {
        errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
        errors.email = "Invalid email address";
    }

    if (!username) {
        errors.username = "Username is required";
    }

    if (!form.password) {
        errors.password = "Password is required";
    } else {
        const passwordError = getPasswordValidationError(form.password, form.username);
        if (passwordError) {
            errors.password = passwordError;
        }
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = "Confirm password is required";
    } else if (form.confirmPassword !== form.password) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
}

export default function AuthPage() {
    const [tab, setTab] = useState<Tab>("login");
    const { user, refresh } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const next = searchParams.get("next") ?? "/";

    // Redirect if already logged in
    useEffect(() => {
        if (user) router.replace(next);
    }, [user, router, next]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                {/* Tabs */}
                <div className="flex border-b border-(--border-color) mb-6">
                    {(["login", "register"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px cursor-pointer ${
                                tab === t
                                    ? "border-accent text-accent"
                                    : "border-transparent text-foreground/50 hover:text-foreground/80"
                            }`}
                        >
                            {t === "login" ? "Login" : "Register"}
                        </button>
                    ))}
                </div>

                {tab === "login" ? (
                    <LoginForm onSuccess={async () => { await refresh(); router.push(next); }} showToast={showToast} />
                ) : (
                    <RegisterForm onSuccess={async () => { await refresh(); router.push(next); }} showToast={showToast} />
                )}

                {/* Google placeholder */}
                <div className="mt-4">
                    <div className="relative flex items-center gap-3 my-4">
                        <div className="flex-1 border-t border-(--border-color)" />
                        <span className="text-xs text-foreground/40">or</span>
                        <div className="flex-1 border-t border-(--border-color)" />
                    </div>
                    <button
                        type="button"
                        onClick={() => showToast("info", "Google sign-in is coming soon")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-(--border-color) text-sm text-foreground/70 hover:bg-foreground/5 transition-colors"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------

interface FormProps {
    onSuccess: () => Promise<void>;
    showToast: (type: "success" | "error" | "info" | "warning", message: string) => void;
}

function LoginForm({ onSuccess, showToast }: FormProps) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [touched, setTouched] = useState<Record<LoginField, boolean>>({
        identifier: false,
        password: false,
    });

    const fieldErrors = useMemo(() => validateLoginForm(identifier, password), [identifier, password]);
    const hasValidationErrors = hasFieldErrors(fieldErrors);

    const getVisibleError = (field: LoginField) => {
        if (touched[field] || submitAttempted) {
            return fieldErrors[field];
        }
        return undefined;
    };

    const identifierError = getVisibleError("identifier");
    const passwordError = getVisibleError("password");

    const markTouched = (field: LoginField) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSubmitAttempted(true);

        if (hasValidationErrors) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password }),
            });
            const json = await res.json();

            if (!res.ok) {
                setError(json.message ?? "Login failed");
                return;
            }

            showToast("success", "Welcome back!");
            await onSuccess();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email or Username" required error={identifierError}>
                <FormInput
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError("");
                    }}
                    onBlur={() => markTouched("identifier")}
                    placeholder="you@example.com or username"
                    autoComplete="username"
                    hasError={!!identifierError}
                />
            </FormField>
            <FormField label="Password" required error={passwordError}>
                <FormInput
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                    }}
                    onBlur={() => markTouched("password")}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    hasError={!!passwordError}
                />
            </FormField>
            {error && <FormMessage type="error" message={error} />}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
                {isLoading ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
}

// ---------------------------------------------------------------------------
// Register form
// ---------------------------------------------------------------------------

function RegisterForm({ onSuccess, showToast }: FormProps) {
    const [form, setForm] = useState<RegisterFormData>({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [touched, setTouched] = useState<Record<RegisterField, boolean>>({
        email: false,
        username: false,
        password: false,
        confirmPassword: false,
    });

    const passwordRuleStatus = useMemo(() => evaluatePasswordRules(form.password, form.username), [form.password, form.username]);
    const fieldErrors = useMemo(() => validateRegisterForm(form), [form]);
    const hasValidationErrors = hasFieldErrors(fieldErrors);

    const getVisibleError = (field: RegisterField) => {
        if (touched[field] || submitAttempted) {
            return fieldErrors[field];
        }
        return undefined;
    };

    const emailError = getVisibleError("email");
    const usernameError = getVisibleError("username");
    const passwordError = getVisibleError("password");
    const confirmPasswordError = getVisibleError("confirmPassword");

    function update(field: keyof typeof form) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((f) => ({ ...f, [field]: e.target.value }));
            setError("");
        };
    }

    function markTouched(field: RegisterField) {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSubmitAttempted(true);

        if (hasValidationErrors) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();

            if (!res.ok) {
                setError(json.message ?? "Registration failed");
                return;
            }

            showToast("success", "Account created! Welcome!");
            await onSuccess();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email" required error={emailError}>
                <FormInput
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    onBlur={() => markTouched("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    hasError={!!emailError}
                />
            </FormField>
            <FormField label="Username" required error={usernameError}>
                <FormInput
                    type="text"
                    value={form.username}
                    onChange={update("username")}
                    onBlur={() => markTouched("username")}
                    placeholder="your_username"
                    autoComplete="username"
                    hasError={!!usernameError}
                />
            </FormField>
            <FormField label="Phone" hint="optional">
                <FormInput
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+84 900 000 000"
                    autoComplete="tel"
                />
            </FormField>
            <FormField label="Password" required error={passwordError}>
                <div className="space-y-2">
                    <FormInput
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        onBlur={() => markTouched("password")}
                        placeholder="Min 8 characters"
                        autoComplete="new-password"
                        hasError={!!passwordError}
                    />
                    <PasswordRuleChecklist
                        status={passwordRuleStatus}
                        isActive={form.password.length > 0}
                    />
                </div>
            </FormField>
            <FormField label="Confirm Password" required error={confirmPasswordError}>
                <FormInput
                    type="password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    onBlur={() => markTouched("confirmPassword")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    hasError={!!confirmPasswordError}
                />
            </FormField>
            {error && <FormMessage type="error" message={error} />}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
                {isLoading ? "Creating account…" : "Create account"}
            </button>
        </form>
    );
}

function PasswordRuleChecklist({ status, isActive }: { status: PasswordRuleStatus; isActive: boolean }) {
    return (
        <div className="space-y-1">
            {PASSWORD_RULES.map((rule) => {
                const colorClass = !isActive
                    ? "text-foreground/40"
                    : status[rule.key]
                        ? "text-green-500"
                        : "text-red-500";

                return (
                    <p key={rule.key} className={`text-xs transition-colors ${colorClass}`}>
                        {rule.label}
                    </p>
                );
            })}
        </div>
    );
}
