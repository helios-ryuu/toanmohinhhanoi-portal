"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, Trophy, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function AuthSection() {
    const { user, isLoading, logout } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return <div className="w-7 h-7 rounded-full bg-foreground/10 animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/auth"
                className="text-sm text-foreground/70 hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-accent/10"
            >
                Sign in
            </Link>
        );
    }

    const initial = (user.display_name ?? user.username).charAt(0).toUpperCase();

    async function handleLogout() {
        setIsOpen(false);
        await logout();
        router.push("/");
    }

    return (
        <div ref={dropdownRef} className="relative flex items-center gap-2">
            {/* Username — hidden on mobile */}
            <span className="hidden md:block text-sm text-foreground/60 select-none">
                @{user.username}
            </span>

            {/* Avatar button */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="w-7 h-7 rounded-full overflow-hidden border border-(--border-color) bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent hover:border-accent transition-colors flex-shrink-0"
                aria-label="User menu"
            >
                {initial}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-(--border-color) bg-background shadow-lg py-1 z-50">
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-accent hover:bg-accent/10 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <User size={14} />
                        Profile
                    </Link>
                    {user.role !== "admin" && (
                        <Link
                            href="/contests"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-accent hover:bg-accent/10 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Trophy size={14} />
                            My Contests
                        </Link>
                    )}
                    <div className="border-t border-(--border-color) my-1" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
