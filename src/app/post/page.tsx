import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getAllPostsMeta, getAllTags, getAllLevels } from "@/lib/posts";
import { PostListClient } from "@/components/features/post";
import MobileSearchBar from "@/components/layout/MobileSearchBar";
import type { Level } from "@/types/post";
import { unstable_cache } from "next/cache";

// Cache post list data
const getCachedPostsData = unstable_cache(
    async () => {
        const [posts, allTags, allLevelsRaw] = await Promise.all([
            getAllPostsMeta(),
            getAllTags(),
            getAllLevels()
        ]);

        const allLevels = allLevelsRaw as Level[];

        return { posts, allTags, allLevels };
    },
    ["post-list"],
    { revalidate: 60, tags: ["posts"] }
);

export default async function PostPage() {
    const { posts, allTags, allLevels } = await getCachedPostsData();
    const t = await getTranslations("post");

    return (
        <>
            {/* Mobile Search Bar - below header */}
            <MobileSearchBar />

            <div className="w-full py-4 px-4 md:px-10">
                {/* Centered container */}
                <div className="mx-auto">
                    <h1 className="text-xl font-bold text-left text-accent tracking-widest">{t("pageTitle")}</h1>
                    <p className="text-xs mt-0.5 mb-4 text-foreground/70 text-left">{t("pageSubtitle")}</p>

                    <Suspense fallback={<div>Loading...</div>}>
                        <PostListClient
                            posts={posts}
                            allTags={allTags}
                            allLevels={allLevels}
                        />
                    </Suspense>

                    {posts.length === 0 && (
                        <p className="mt-6 text-foreground/50">{t("emptyState")}</p>
                    )}
                </div>
            </div>
        </>
    );
}
