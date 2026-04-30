import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Trophy, Users } from "lucide-react";
import { getAllPostsMeta } from "@/lib/posts";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { PostMeta } from "@/types/post";

const getCachedPosts = unstable_cache(
  async () => getAllPostsMeta(),
  ["home-posts"],
  { revalidate: 120, tags: ["posts"] }
);

function pickRandom(posts: PostMeta[], count: number): PostMeta[] {
  if (posts.length <= count) return posts;
  const shuffled = [...posts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function FeaturedPostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex flex-col rounded-xl border border-(--border-color) bg-(--post-card) hover:border-(--border-color-hover) hover:bg-(--post-card-hover) transition-all overflow-hidden"
    >
      {post.image && (
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-foreground/60 mt-1.5 line-clamp-2">
          {post.description}
        </p>
        <div className="mt-auto pt-3 flex items-center gap-2 text-[11px] text-foreground/40">
          {post.date && <span>{post.date}</span>}
          {post.tags && post.tags.length > 0 && (
            <>
              <span>·</span>
              <span className="truncate">{post.tags.slice(0, 2).join(", ")}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const allPosts = await getCachedPosts();
  const featured = pickRandom(allPosts, 3);
  const t = await getTranslations("home");

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-20 pb-14 md:pt-20 md:pb-20">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-accent mb-4">
            Toán Mô Hình Hà Nội
          </h1>
          <p className="text-foreground/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            {t.rich("heroSubtitle", {
              bold: (chunks) => (
                <span className="text-foreground font-medium">{chunks}</span>
              ),
            })}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/post"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-accent bg-accent/20 text-accent text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              {t("explorePosts")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contests"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-(--border-color) text-foreground/70 text-sm font-medium hover:border-foreground/30 hover:text-foreground transition-all"
            >
              <Trophy className="w-4 h-4" />
              {t("contestsBtn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-6 pb-10 md:pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-(--border-color) bg-(--post-card)">
            <BookOpen className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold mb-1">{t("card1Title")}</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                {t("card1Desc")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-(--border-color) bg-(--post-card)">
            <Trophy className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold mb-1">{t("card2Title")}</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                {t("card2Desc")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-(--border-color) bg-(--post-card)">
            <Users className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold mb-1">{t("card3Title")}</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                {t("card3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featured.length > 0 && (
        <section className="px-6 pb-16 md:pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold tracking-tight">{t("featuredPosts")}</h2>
              <Link
                href="/post"
                className="group flex items-center gap-1 text-xs text-accent hover:underline"
              >
                {t("viewAll")}
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featured.map((post) => (
                <FeaturedPostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
