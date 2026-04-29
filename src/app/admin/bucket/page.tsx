"use client";

import BucketManager from "@/components/features/admin/tabs/BucketManager";
import { ToastProvider } from "@/components/ui/Toast";

export default function BucketPage() {
    return (
        <ToastProvider>
            <div className="h-full flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 px-4">
                    <header className="py-8 mb-6">
                        <h1 className="text-2xl font-bold tracking-widest text-accent">BUCKET</h1>
                        <p className="text-sm text-foreground/60 mt-1">
                            Browse, upload, and manage files in Supabase Storage.
                        </p>
                    </header>
                    <div className="flex-1 overflow-hidden">
                        <BucketManager initialBucket="post-images" allowBucketSwitch mode="manage" />
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
}
