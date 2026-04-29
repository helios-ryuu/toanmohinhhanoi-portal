"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard, PostListItem } from "@/components/features/post";
import Select from "@/components/ui/Select";
import MultiSelect from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import type { PostMeta, Level } from "@/types/post";
import type { PostCategory } from "@/types/database";

type ViewMode = "card" | "list";

interface PostListClientProps {
    posts: PostMeta[];
    allTags: string[];
    allLevels: Level[];
    allCategories?: PostCategory[];
}

const variants = {
    enter: (_direction: number) => ({
        opacity: 0,
    }),
    center: {
        opacity: 1,
    },
    exit: (_direction: number) => ({
        opacity: 0,
    }),
};

const CATEGORY_LABEL: Record<PostCategory, string> = {
    news: "Tin tức",
    announcement: "Thông báo",
    tutorial: "Hướng dẫn",
    result: "Kết quả",
};

// Helper: Level weight
const getLevelWeight = (level?: Level): number => {
    switch (level) {
        case 'beginner': return 1;
        case 'intermediate': return 2;
        case 'advanced': return 3;
        default: return 0;
    }
};

export default function PostListClient({ posts, allTags, allLevels, allCategories }: PostListClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Derived state from URL (Source of Truth)
    const selectedTags = useMemo(() => {
        const t = searchParams.get("tag");
        return t ? t.split(",").map(s => s.trim()).filter(Boolean) : [];
    }, [searchParams]);

    const selectedLevels = useMemo(() => {
        const l = searchParams.get("level");
        return l ? l.split(",").map(s => s.trim()).filter(Boolean) : [];
    }, [searchParams]);

    const selectedCategory = (searchParams.get("category") || "") as PostCategory | "";
    const selectedSort = searchParams.get("sort") || "newest";
    const viewMode = (searchParams.get("view") as ViewMode) || "card";

    const [currentPage, setCurrentPage] = useState(1);
    const [direction, setDirection] = useState(0);
    const [postsPerPage, setPostsPerPage] = useState(4);
    const [isMobile, setIsMobile] = useState(false);


    // Responsive posts per page and mobile detection
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 640;
            setIsMobile(mobile);

            if (viewMode === "list") {
                setPostsPerPage(10);
            } else if (mobile) {
                setPostsPerPage(Infinity);
            } else {
                setPostsPerPage(4);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [viewMode]);

    const updateUrl = (newParams: Partial<{ tags: string[], levels: string[], category: string, sort: string, view: ViewMode }>) => {
        const t = newParams.tags !== undefined ? newParams.tags : selectedTags;
        const l = newParams.levels !== undefined ? newParams.levels : selectedLevels;
        const c = newParams.category !== undefined ? newParams.category : selectedCategory;
        const s = newParams.sort !== undefined ? newParams.sort : selectedSort;
        const v = newParams.view !== undefined ? newParams.view : viewMode;

        const params = new URLSearchParams();
        if (t.length > 0) params.set("tag", t.join(","));
        if (l.length > 0) params.set("level", l.join(","));
        if (c) params.set("category", c);
        if (s !== "newest") params.set("sort", s);
        if (v !== "card") params.set("view", v);

        const query = params.toString();
        router.push(query ? `/post?${query}` : "/post", { scroll: false });
    };

    const handleTagsChange = (values: string[]) => {
        const newTags = values.includes("") ? [] : values;
        updateUrl({ tags: newTags });
    };

    const handleLevelsChange = (values: string[]) => {
        const newLevels = values.includes("") ? [] : values;
        updateUrl({ levels: newLevels });
    };

    const handleCategoryChange = (value: string) => {
        updateUrl({ category: value });
    };

    const handleSortChange = (value: string) => {
        const newSort = value === "" ? "newest" : value;
        updateUrl({ sort: newSort });
    };

    // Filter and sort posts
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        if (selectedTags.length > 0) {
            result = result.filter((post) =>
                post.tags?.some((t) =>
                    selectedTags.some((st) => t.toLowerCase() === st.toLowerCase())
                )
            );
        }
        if (selectedLevels.length > 0) {
            result = result.filter((post) =>
                post.level && selectedLevels.includes(post.level)
            );
        }
        if (selectedCategory) {
            result = result.filter((post) => post.category === selectedCategory);
        }

        result.sort((a, b) => {
            switch (selectedSort) {
                case "newest":
                    return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
                case "oldest":
                    return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
                case "a-z":
                    return a.title.localeCompare(b.title);
                case "z-a":
                    return b.title.localeCompare(a.title);
                case "easiest":
                    return getLevelWeight(a.level) - getLevelWeight(b.level);
                case "most-advanced":
                    return getLevelWeight(b.level) - getLevelWeight(a.level);
                default:
                    return 0;
            }
        });

        return result;
    }, [posts, selectedTags, selectedLevels, selectedCategory, selectedSort]);

    const clearFilters = () => {
        updateUrl({ tags: [], levels: [], category: "", sort: "newest" });
    };

    const hasActiveFilters = selectedTags.length > 0 || selectedLevels.length > 0 || selectedCategory !== "" || selectedSort !== "newest";

    const tagOptions = [
        { value: "", label: "All" },
        ...allTags.map((tag) => ({ value: tag, label: tag }))
    ];

    const levelOptions = [
        { value: "", label: "All" },
        ...allLevels.map((level) => ({
            value: level,
            label: level.charAt(0).toUpperCase() + level.slice(1),
        }))
    ];

    const categoryOptions = [
        { value: "", label: "All" },
        ...((allCategories ?? (["news", "announcement", "tutorial", "result"] as PostCategory[])).map((c) => ({
            value: c,
            label: CATEGORY_LABEL[c],
        }))),
    ];

    const sortOptions = [
        { value: "newest", label: "Newest" },
        { value: "oldest", label: "Oldest" },
        { value: "a-z", label: "A-Z" },
        { value: "z-a", label: "Z-A" },
        { value: "easiest", label: "Easiest" },
        { value: "most-advanced", label: "Most Advanced" },
    ];

    const viewOptions = [
        { value: "card", label: "Card", icon: LayoutGrid },
        { value: "list", label: "List", icon: List },
    ];

    const renderHeader = (label: string) => {
        return (
            <div className="flex items-center gap-1 select-none text-(--foreground-dim)">
                <span>{label}</span>
            </div>
        );
    };

    return (
        <>
            {/* Filters & Sort Bar */}
            <div className="mt-6">
                <div className="grid grid-cols-[1fr_auto] sm:flex sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 flex-1">
                        <div className="grid grid-cols-[3.5rem_1fr] sm:flex items-center gap-2">
                            <label className="text-xs text-(--foreground-dim) shrink-0">Tags:</label>
                            <MultiSelect
                                values={selectedTags}
                                onValuesChange={handleTagsChange}
                                options={tagOptions}
                                placeholder="All"
                                className="flex-1 cursor-pointer text-xs"
                                isActive={selectedTags.length > 0}
                            />
                        </div>

                        <div className="grid grid-cols-[3.5rem_1fr] sm:flex items-center gap-2">
                            <label className="text-xs text-(--foreground-dim) shrink-0">Level:</label>
                            <MultiSelect
                                values={selectedLevels}
                                onValuesChange={handleLevelsChange}
                                options={levelOptions}
                                placeholder="All"
                                className="flex-1 cursor-pointer text-xs"
                                isActive={selectedLevels.length > 0}
                            />
                        </div>

                        <div className="grid grid-cols-[3.5rem_1fr] sm:flex items-center gap-2">
                            <label className="text-xs text-(--foreground-dim) shrink-0">Loại:</label>
                            <Select
                                value={selectedCategory}
                                onValueChange={handleCategoryChange}
                                options={categoryOptions}
                                placeholder="All"
                                className="flex-1 cursor-pointer text-xs"
                                isActive={selectedCategory !== ""}
                            />
                        </div>

                        <div className="grid grid-cols-[3.5rem_1fr] sm:flex items-center gap-2">
                            <label className="text-xs text-(--foreground-dim) shrink-0">Sort:</label>
                            <Select
                                value={selectedSort}
                                onValueChange={handleSortChange}
                                options={sortOptions}
                                placeholder="Newest"
                                className="flex-1 cursor-pointer text-xs"
                                isActive={selectedSort !== "newest"}
                            />
                        </div>

                        {hasActiveFilters && (
                            <Button
                                onClick={clearFilters}
                                variant="secondary"
                                className="mx-auto sm:mx-0"
                            >
                                Reset filters
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto self-end">
                        <div className="flex items-center gap-1.5 text-xs text-(--foreground-dim)">
                            {viewMode === "card" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                        </div>
                        <Select
                            value={viewMode}
                            onValueChange={(v) => {
                                const newView = v as ViewMode;
                                updateUrl({ view: newView });
                            }}
                            options={viewOptions.map(o => ({ value: o.value, label: o.label }))}
                            placeholder="Card"
                            className="cursor-pointer text-xs"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full border-t border-(--foreground-dim)/30 mt-2"></div>

            <p className="mt-2 mb-2 text-xs text-(--foreground-dim)">
                Showing {filteredPosts.length} of {posts.length}
                {selectedCategory && (
                    <> <span className="text-accent">{CATEGORY_LABEL[selectedCategory]}</span></>
                )}{" "}posts
                {selectedTags.length > 0 && (
                    <> tagged &quot;<span className="text-accent">{selectedTags.join(", ")}</span>&quot;</>
                )}
                {selectedLevels.length > 0 && (
                    <> with level &quot;<span className="text-accent">{selectedLevels.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(", ")}</span>&quot;</>
                )}
            </p>

            {filteredPosts.length === 0 && (
                <p className="mt-10 text-foreground/50">No posts match your filters.</p>
            )}

            <div className={`mt-4 relative overflow-hidden ${!isMobile ? 'min-h-[300px]' : ''}`}>
                {viewMode === "list" ? (
                    <div className="flex flex-col gap-2 overflow-x-auto pb-2">
                        <div className="min-w-[1000px]">
                            <div className="grid grid-cols-[4fr_3fr_90px_80px_95px_120px] gap-4 px-4 py-2 text-xs font-semibold text-(--foreground-dim) border-b border-(--border-color) mb-4">
                                {renderHeader("Title")}
                                <span>Tags</span>
                                {renderHeader("Date")}
                                {renderHeader("Read")}
                                {renderHeader("Level")}
                                {renderHeader("Loại")}
                            </div>
                            <AnimatePresence initial={false} mode="wait" custom={direction}>
                                <motion.div
                                    key={currentPage}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="flex flex-col gap-2"
                                >
                                    {filteredPosts
                                        .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
                                        .map((post) => (
                                            <PostListItem
                                                key={post.slug}
                                                slug={post.slug}
                                                image={post.image}
                                                title={post.title}
                                                description={post.description}
                                                date={post.date}
                                                readingTime={post.readingTime}
                                                level={post.level}
                                                tags={post.tags}
                                                category={post.category}
                                                onClick={() => router.push(`/post/${post.slug}`)}
                                            />
                                        ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                ) : isMobile ? (
                    <div className="flex flex-col gap-4">
                        {filteredPosts.map((post) => (
                            <PostCard
                                key={post.slug}
                                slug={post.slug}
                                image={post.image}
                                title={post.title}
                                description={post.description}
                                date={post.date}
                                readingTime={post.readingTime}
                                level={post.level}
                                tags={post.tags}
                                category={post.category}
                                onClick={() => router.push(`/post/${post.slug}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence initial={false} mode="wait" custom={direction}>
                        <motion.div
                            key={currentPage}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                        >
                            {filteredPosts
                                .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
                                .map((post) => (
                                    <PostCard
                                        key={post.slug}
                                        slug={post.slug}
                                        image={post.image}
                                        title={post.title}
                                        description={post.description}
                                        date={post.date}
                                        readingTime={post.readingTime}
                                        level={post.level}
                                        tags={post.tags}
                                        category={post.category}
                                        onClick={() => router.push(`/post/${post.slug}`)}
                                    />
                                ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {filteredPosts.length > postsPerPage && (
                <div className="mt-2 flex items-center justify-center gap-4">
                    <button
                        onClick={() => {
                            setDirection(-1);
                            setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-(--border-color) bg-background-hover hover:bg-accent/20 hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-(--foreground-dim)">
                        Page {currentPage} of {Math.ceil(filteredPosts.length / postsPerPage)}
                    </span>
                    <button
                        onClick={() => {
                            setDirection(1);
                            setCurrentPage((p) => Math.min(Math.ceil(filteredPosts.length / postsPerPage), p + 1));
                        }}
                        disabled={currentPage >= Math.ceil(filteredPosts.length / postsPerPage)}
                        className="p-2 rounded-md border border-(--border-color) bg-background-hover hover:bg-accent/20 hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </>
    );
}
