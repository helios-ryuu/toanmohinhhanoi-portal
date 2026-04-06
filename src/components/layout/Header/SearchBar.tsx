"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchItem {
    type: "Home" | "Post" | "Roadmaps" | "Project" | "Tag";
    title: string;
    path: string;
    tags?: string[];
}

// Static routes for the blog
const staticRoutes: SearchItem[] = [
    { type: "Home", title: "Home", path: "/" },
    { type: "Post", title: "All Posts", path: "/post" },
];

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [posts, setPosts] = useState<SearchItem[]>([]);
    const [tags, setTags] = useState<SearchItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch posts and tags on mount
    useEffect(() => {
        fetch("/api/search")
            .then((res) => res.json())
            .then((data) => {
                setPosts(data.posts || []);
                setTags(data.tags || []);
            })
            .catch(console.error);
    }, []);

    // Filter results based on query
    const filterResults = useCallback((searchQuery: string) => {
        // Check if searching by tag (starts with #)
        if (searchQuery.startsWith("#")) {
            const tagQuery = searchQuery.slice(1).toLowerCase().trim();

            if (!tagQuery) {
                // Show all tags when just # is typed
                return tags;
            }

            // Filter tags that match the query
            const matchingTags = tags.filter((tag) =>
                tag.title.toLowerCase().includes(tagQuery)
            );

            // Also show posts that have matching tags
            const matchingPosts = posts.filter((post) =>
                post.tags?.some((t) => t.toLowerCase().includes(tagQuery))
            );

            return [...matchingTags, ...matchingPosts];
        }

        // Normal search
        const allItems = [...staticRoutes, ...posts];

        if (!searchQuery.trim()) {
            return allItems;
        }

        const lowerQuery = searchQuery.toLowerCase();
        return allItems.filter(
            (item) =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.type.toLowerCase().includes(lowerQuery)
        );
    }, [posts, tags]);

    // Derive results directly from query (no setState in effect)
    const results = useMemo(() => filterResults(query), [query, filterResults]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    router.push(results[selectedIndex].path);
                    setIsOpen(false);
                    setQuery("");
                }
                break;
            case "Escape":
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Only open dropdown if there's already a query
        if (query.trim()) {
            setIsOpen(true);
            // Results are now derived via useMemo based on query
        }
    };

    const handleBlur = () => {
        // Delay to allow click on dropdown items
        setTimeout(() => {
            setIsFocused(false);
            setQuery("");
            setIsOpen(false);
        }, 150);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1); // Reset selection when query changes
        // Open dropdown when user starts typing
        if (value.trim()) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleResultClick = (path: string) => {
        router.push(path);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div className="relative w-full max-w-140">
            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    className="w-full px-4 py-0.5 bg-background-hover/40 border border-(--border-color) rounded-sm text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-left"
                />
                {/* Centered icon + placeholder overlay */}
                {!isFocused && !query && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none text-(--foreground-dim) text-sm">
                        <Search strokeWidth={3} className="w-4 h-4" />
                        <span className="text-xs">Search posts by title, tag, or concept...</span>
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-(--border-color) rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
                >
                    {results.length > 0 ? (
                        <ul className="py-2">
                            {results.map((item, index) => (
                                <li key={`${item.type}-${item.path}`}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleResultClick(item.path);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-background-hover transition-colors flex items-center gap-2 ${selectedIndex === index
                                            ? "bg-background-hover text-accent"
                                            : "text-foreground"
                                            }`}
                                    >
                                        <span className="text-(--foreground-dim) font-medium min-w-[60px]">
                                            {item.type}:
                                        </span>
                                        <span className="truncate">{item.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-6 text-center text-(--foreground-dim) text-sm">
                            No matching results
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
