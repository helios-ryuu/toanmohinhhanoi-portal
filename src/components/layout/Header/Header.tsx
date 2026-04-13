"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import IconButton from "@/components/ui/IconButton";
import SocialButton from "@/components/ui/SocialButton";
import { Sun, Moon, Slash, SquareChevronDown, SquareChevronUp } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";
import MobileDropdown from "@/components/layout/MobileDropdown";
import SearchBar from "@/components/layout/Header/SearchBar";
import AuthSection from "@/components/layout/Header/AuthSection";
import { useMounted } from "@/hooks";

interface HeaderProps {
    noBorder?: boolean;
    showMobileMenu?: boolean;
    transparent?: boolean;
    isHomePage?: boolean;
}

export default function Header({ noBorder = false, showMobileMenu = true, transparent = false, isHomePage = false }: HeaderProps) {
    const mounted = useMounted();
    const { resolvedTheme, setTheme } = useTheme();
    const { isMobileOpen, setIsMobileOpen } = useSidebar();
    const pathname = usePathname();

    // Use "dark" as fallback during SSR, actual theme after mount
    const theme = (mounted ? resolvedTheme : "dark") as "light" | "dark";
    const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    const isPostEditor = pathname === "/admin/posts/new" || /^\/admin\/posts\/[^/]+\/edit$/.test(pathname);

    const routes = [
        { path: "/post", label: "Post" },
        { path: "/contests", label: "Contests" },
        { path: "/contest", label: "Contest" },
        { path: "/contest-management", label: "Contest Management" },
        { path: "/admin/bucket", label: "Bucket" },
        { path: "/admin/database", label: "Database" },
        { path: "/admin", label: "CMS" },
    ];
    const currentRoute = routes.find(r => pathname.startsWith(r.path));

    return (
        <header className={`relative flex-none flex h-10 items-center border-b ${transparent ? "bg-transparent" : "bg-background"} ${noBorder ? "border-transparent" : "border-(--border-color)"}`}>
            {/* Mobile menu button with dropdown */}
            {showMobileMenu && (
                <div className="md:hidden relative flex items-center justify-center h-full px-3 z-50">
                    <IconButton onClick={toggleMobileSidebar} className={` ${isMobileOpen ? "text-accent bg-accent-hover/20" : "text-(--foreground-dim)"}`}>
                        {isMobileOpen ? <SquareChevronUp strokeWidth={3} /> : <SquareChevronDown strokeWidth={3} />}
                    </IconButton>
                    <MobileDropdown />
                </div>
            )}

            {/* Logo & Breadcrumb - Fixed width for balance */}
            <div className="hidden md:flex flex-none items-center h-full text-foreground w-60">
                <Link href="/" className="ml-16 mr-2">
                    <Image src="/favicon.ico" alt="Helios" width={24} height={24} className="w-6 h-6" />
                </Link>
                {currentRoute && (
                    <>
                        <Slash className="w-4 h-4 text-(--foreground-dim)" />
                        <Link href={currentRoute.path} className="px-2 text-foreground hover:text-accent transition-colors text-sm">
                            {currentRoute.label}
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-none items-center h-full text-foreground">
                <Link href="/" className={`mr-2 ${isHomePage ? "ml-6" : "ml-2"}`}>
                    <Image src="/favicon.ico" alt="Helios" width={24} height={24} className="w-5 h-5" />
                </Link>
                {currentRoute && (
                    <>
                        <Slash className="w-4 h-4 text-(--foreground-dim)" />
                        <Link href={currentRoute.path} className="px-2 text-foreground hover:text-accent transition-colors">
                            {currentRoute.label}
                        </Link>
                    </>
                )}
            </div>

            {/* Search Bar - Center, flex-1 to expand */}
            <div className="hidden md:flex flex-1 justify-center px-4">
                <SearchBar />
            </div>

            {/* Right side - flex-1 on mobile, fixed width on desktop */}
            <div className="flex flex-1 md:flex-none items-center justify-end h-full pr-4 gap-1 md:w-52">
                <SocialButton
                    lightIcon="/InBug-Black.png"
                    darkIcon="/InBug-White.png"
                    alt="LinkedIn"
                    appUrl="linkedin://in/helios-nts"
                    webUrl="https://www.linkedin.com/in/helios-nts/"
                    theme={theme}
                />
                <SocialButton
                    lightIcon="/github-mark.svg"
                    darkIcon="/github-mark-white.svg"
                    alt="GitHub"
                    appUrl="github://user?username=helios-ryuu"
                    webUrl="https://github.com/helios-ryuu"
                    theme={theme}
                    className="mr-4"
                />
                {!isPostEditor && (
                    <IconButton onClick={toggleTheme} className={`text-(--foreground-dim) bg-background-hover ${theme === "light" ? "hover:text-blue-500" : "hover:text-yellow-500"}`}>
                        {theme === "light" ? <Moon strokeWidth={3} /> : <Sun strokeWidth={3} />}
                    </IconButton>
                )}
                <div className="ml-2">
                    <AuthSection />
                </div>
            </div>
        </header>
    );
}
