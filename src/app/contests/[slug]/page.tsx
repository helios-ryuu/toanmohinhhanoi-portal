import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getContestBySlug, listContests } from "@/lib/contests-db";
import { mdxComponents } from "../../../../mdx-components";
import {
    ContestStatusBadge,
    ContestTypeBadge,
} from "@/components/features/contest/ContestStatusBadge";
import ContestCountdown from "@/components/features/contest/ContestCountdown";
import ContestStageTimeline from "@/components/features/contest/ContestStageTimeline";
import ContestRegistrationCta from "@/components/features/contest/ContestRegistrationCta";
import type { ContestWithStages } from "@/types/database";

interface Props {
    params: Promise<{ slug: string }>;
}

const getCachedContest = unstable_cache(
    async (slug: string) => {
        const supabase = createSupabaseAdminClient();
        return getContestBySlug(supabase, slug);
    },
    ["public-contest"],
    { revalidate: 60, tags: ["contests"] },
);

export async function generateStaticParams() {
    const supabase = createSupabaseAdminClient();
    const contests = await listContests(supabase, {});
    return contests.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const contest = await getCachedContest(slug);
    if (!contest) {
        return { title: "Kỳ thi không tồn tại — Toán Mô Hình Hà Nội" };
    }
    return {
        title: `${contest.title} — Toán Mô Hình Hà Nội`,
        description: contest.description,
    };
}

function formatDateTime(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

export default async function ContestDetailPage({ params }: Props) {
    const { slug } = await params;
    const contest: ContestWithStages | null = await getCachedContest(slug);

    if (!contest) {
        notFound();
    }

    const t = await getTranslations("contests");
    const tType = await getTranslations("contestType");

    let rulesContent: React.ReactNode = null;
    if (contest.rules) {
        const { content } = await compileMDX({
            source: contest.rules,
            components: mdxComponents,
            options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
        });
        rulesContent = content;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-4">
                <Link
                    href="/contests"
                    className="text-xs text-foreground/60 hover:text-accent transition-colors"
                >
                    {t("back")}
                </Link>
            </div>

            {contest.cover_image_url && (
                <div className="relative w-full h-56 md:h-72 mb-6 rounded-xl overflow-hidden border border-(--border-color)">
                    <Image
                        src={contest.cover_image_url}
                        alt={contest.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-2">
                <ContestStatusBadge status={contest.status} />
                <ContestTypeBadge type={contest.participation_type} />
                {contest.participation_type !== "individual" && (
                    <span className="text-xs text-foreground/60">
                        {t("maxTeam", { count: contest.max_team_size })}
                    </span>
                )}
            </div>

            <h1 className="text-3xl font-bold tracking-wide mb-4">{contest.title}</h1>

            <div className="mb-6">
                <ContestCountdown contest={contest} />
            </div>

            <section className="mb-6">
                <h2 className="text-sm font-bold tracking-widest text-foreground/80 uppercase mb-2">
                    {t("intro")}
                </h2>
                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                    {contest.description}
                </p>
            </section>

            {rulesContent && (
                <section className="mb-6">
                    <h2 className="text-sm font-bold tracking-widest text-foreground/80 uppercase mb-2">
                        {t("rules")}
                    </h2>
                    <div className="text-sm text-foreground/80 leading-relaxed">
                        {rulesContent}
                    </div>
                </section>
            )}

            <section className="mb-6">
                <h2 className="text-sm font-bold tracking-widest text-foreground/80 uppercase mb-2">
                    {t("timeline")}
                </h2>
                <div className="rounded-lg border border-(--border-color) bg-(--post-card) px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-foreground/60">{t("grandStart")}</div>
                        <div className="text-sm">{formatDateTime(contest.start_at)}</div>
                    </div>
                    <div className="hidden sm:block text-foreground/30">→</div>
                    <div className="sm:text-right">
                        <div className="text-xs uppercase tracking-widest text-foreground/60">{t("grandEnd")}</div>
                        <div className="text-sm">{formatDateTime(contest.end_at)}</div>
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-sm font-bold tracking-widest text-foreground/80 uppercase mb-2">
                    {t("stages")}
                </h2>
                <ContestStageTimeline contest={contest} />
            </section>

            <section className="mb-6">
                <h2 className="text-sm font-bold tracking-widest text-foreground/80 uppercase mb-2">
                    {t("participation")}
                </h2>
                <p className="text-sm text-foreground/80">
                    {tType(contest.participation_type)}
                    {contest.participation_type !== "individual"
                        ? ` — ${t("maxTeam", { count: contest.max_team_size })}.`
                        : "."}
                </p>
            </section>

            <ContestRegistrationCta contest={contest} />
        </div>
    );
}
