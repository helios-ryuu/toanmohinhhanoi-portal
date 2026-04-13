"use client";

import DatabaseTab from "@/components/features/admin/tabs/DatabaseTab";
import { ToastProvider } from "@/components/ui/Toast";

export default function DatabasePage() {
    return (
        <ToastProvider>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-widest text-accent">DATABASE</h1>
                    <p className="text-sm text-foreground/60 mt-1">
                        Read-only inspector for the public schema tables.
                    </p>
                </header>
                <DatabaseTab />
            </div>
        </ToastProvider>
    );
}
