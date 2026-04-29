import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listContests } from "@/lib/contests-db";
import ContestListClient from "@/components/features/contest/ContestListClient";

export const metadata = {
    title: "Contests — Toán Mô Hình Hà Nội",
};

const getCachedContests = unstable_cache(
    async () => {
        const supabase = createSupabaseAdminClient();
        return listContests(supabase, { withStages: true });
    },
    ["public-contests"],
    { revalidate: 60, tags: ["contests"] },
);

export default async function ContestsPage() {
    const contests = await getCachedContests();
    const t = await getTranslations("contests");

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-widest text-accent">{t("pageTitle")}</h1>
                <p className="text-sm text-foreground/60 mt-1">{t("pageSubtitle")}</p>
            </header>

            <Suspense>
                <ContestListClient contests={contests as import("@/types/database").ContestWithStages[]} />
            </Suspense>
        </div>
    );
}
