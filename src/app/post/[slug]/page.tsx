import { getPostBySlug, getAllPostsMeta, getRelatedPosts, getSeriesPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "../../../../mdx-components";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { PostMeta, RelatedPosts, MobileTocBar, SeriesNavigation, PostShareActions } from "@/components/features/post";
import SidebarInjector from "@/components/layout/SidebarInjector";
import { TagList } from "@/components/ui";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

// Cache post data for faster subsequent loads
const getCachedPost = unstable_cache(
    async (slug: string) => getPostBySlug(slug),
    ["post"],
    { revalidate: 60, tags: ["posts"] }
);

const getCachedRelatedPosts = unstable_cache(
    async (slug: string, tags: string[]) => getRelatedPosts(slug, tags),
    ["related-posts"],
    { revalidate: 60, tags: ["posts"] }
);

const getCachedSeriesPosts = unstable_cache(
    async (seriesId: string) => getSeriesPosts(seriesId),
    ["series-posts"],
    { revalidate: 60, tags: ["posts"] }
);

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = await getAllPostsMeta();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    const baseUrl = "https://blog.helios.id.vn";

    return {
        title: `${post.title} - Helios Blog`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            url: `${baseUrl}/post/${slug}`,
            siteName: "Helios Blog",
            images: post.image ? [
                {
                    url: post.image,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ] : [],
            locale: "vi_VN",
            type: "article",
            publishedTime: post.date,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            images: post.image ? [post.image] : [],
        },
    };
}

const rehypePrettyCodeOptions = {
    theme: "github-dark",
    keepBackground: true,
};

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getCachedPost(slug);

    if (!post) {
        notFound();
    }

    // Fetch related and series posts in parallel
    const [relatedPosts, seriesPosts] = await Promise.all([
        getCachedRelatedPosts(slug, post.tags || []),
        post.seriesId ? getCachedSeriesPosts(post.seriesId) : Promise.resolve([])
    ]);

    return (
        <div className="flex flex-col lg:h-full lg:overflow-hidden">
            {/* Mobile TOC Bar */}
            <div className="shrink-0 z-40">
                <MobileTocBar title={post.title} content={post.content} />
            </div>

            <div className="flex gap-2 px-4 md:px-0 max-w-dvw mx-auto w-full lg:flex-1 lg:min-h-0">
                <SidebarInjector content={post.content} />

                {/* Main Content */}
                <article className="flex-1 min-w-0 mx-auto lg:h-full lg:overflow-y-auto py-6 md:py-4 md:px-6">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                        <p className="text-sm mt-2 text-foreground/70">{post.description}</p>
                        <PostMeta date={post.date} readingTime={post.readingTime} level={post.level} className="mt-4 mb-3" />
                        {post.tags && <TagList tags={post.tags} />}
                    </header>

                    <div className="prose prose-lg dark:prose-invert max-w-none pb-8">
                        <MDXRemote
                            source={post.content}
                            components={mdxComponents}
                            options={{
                                mdxOptions: {
                                    remarkPlugins: [remarkGfm],
                                    rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
                                },
                            }}
                        />
                        <PostShareActions post={post} />
                    </div>

                    {/* Series Navigation */}
                    {post.seriesId && seriesPosts.length > 1 && (
                        <SeriesNavigation currentPost={post} seriesPosts={seriesPosts} />
                    )}
                </article>

                {/* Right Sidebar - Related Posts */}
                <aside className="hidden xl:block w-62 flex-none h-full overflow-y-auto pt-6 pb-10 px-2">
                    <RelatedPosts posts={relatedPosts} />
                </aside>
            </div>
        </div>
    );
}
