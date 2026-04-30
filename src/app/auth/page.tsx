"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/Toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        config: Record<string, unknown>,
                    ) => void;
                };
            };
        };
    }
}

export default function AuthPage() {
    return (
        <Suspense fallback={null}>
            <AuthPageInner />
        </Suspense>
    );
}

function AuthPageInner() {
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const next = searchParams.get("next") ?? "/";
    const errorParam = searchParams.get("error");
    const [isLoading, setIsLoading] = useState(false);
    const hiddenBtnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) router.replace(next);
    }, [user, router, next]);

    useEffect(() => {
        if (errorParam) {
            showToast("error", decodeURIComponent(errorParam));
        }
    }, [errorParam, showToast]);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        async function onCredential({ credential }: { credential: string }) {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: credential,
            });
            if (error) {
                showToast("error", error.message);
                setIsLoading(false);
            }
            // On success: onAuthStateChange in UserContext fires → user updates → redirect
        }

        function initGIS() {
            if (!window.google || !hiddenBtnRef.current) return;
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: onCredential,
                cancel_on_tap_outside: true,
            });
            window.google.accounts.id.renderButton(hiddenBtnRef.current, {
                type: "icon",
                size: "large",
            });
        }

        if (window.google) {
            initGIS();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGIS;
        document.head.appendChild(script);

        return () => {
            script.onload = null;
            if (document.head.contains(script)) document.head.removeChild(script);
        };
    }, [showToast]);

    function handleGoogleSignIn() {
        const googleBtn = hiddenBtnRef.current?.querySelector<HTMLElement>("[role=button]");
        googleBtn?.click();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Đăng nhập</h1>
                    <p className="text-sm text-foreground/60">
                        Sử dụng tài khoản Google của bạn để tiếp tục.
                    </p>
                </div>

                {/* Hidden Google GIS button — receives clicks forwarded from the styled button below */}
                <div
                    ref={hiddenBtnRef}
                    aria-hidden="true"
                    style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
                />

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-(--border-color) text-sm font-medium hover:bg-foreground/5 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isLoading ? "Đang đăng nhập…" : "Đăng nhập bằng Google"}
                </button>
            </div>
        </div>
    );
}
