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
import LanguageSwitcher from "@/components/layout/Header/LanguageSwitcher";
import { useMounted } from "@/hooks";
import { useTranslations } from "next-intl";

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
    const tNav = useTranslations("nav");

    // Use "dark" as fallback during SSR, actual theme after mount
    const theme = (mounted ? resolvedTheme : "dark") as "light" | "dark";
    const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    const isPostEditor = pathname === "/admin/posts/new" || /^\/admin\/posts\/[^/]+\/edit$/.test(pathname);

    const routes = [
        { path: "/post", label: tNav("posts") },
        { path: "/contests", label: tNav("contests") },
        { path: "/contest", label: tNav("contests") },
        { path: "/faq", label: tNav("faq") },
        { path: "/contest-management", label: tNav("contestManagement") },
        { path: "/admin/bucket", label: tNav("bucket") },
        { path: "/admin", label: tNav("adminWorkspace") },
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
            <div className="hidden md:flex flex-none items-center h-full text-foreground w-80">
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

            {/* Right side - icons stay aligned right; auth section can grow without squishing icons */}
            <div className="flex flex-1 md:flex-none items-center justify-end h-full pr-4 gap-1 md:min-w-52">
                <button
                    type="button"
                    aria-label="Facebook"
                    onClick={() => {
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        const webUrl = "https://www.facebook.com/toanmohinh.hanoilink";
                        const appUrl = "fb://page/toanmohinh.hanoilink";
                        if (isMobile) {
                            window.location.href = appUrl;
                            setTimeout(() => window.open(webUrl, "_blank"), 500);
                        } else {
                            window.open(webUrl, "_blank");
                        }
                    }}
                    className="flex-none w-8 h-8 inline-flex items-center justify-center mx-0.5 rounded-md cursor-pointer hover:bg-background-hover text-foreground transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                        aria-hidden="true"
                    >
                        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z" />
                    </svg>
                </button>
                <SocialButton
                    lightIcon="/github-mark.svg"
                    darkIcon="/github-mark-white.svg"
                    alt="GitHub"
                    appUrl="github://user?username=helios-ryuu"
                    webUrl="https://github.com/helios-ryuu/toanmohinhhanoi-portal"
                    theme={theme}
                    className="flex-none mr-2"
                />
                <LanguageSwitcher />
                <div className="ml-2 min-w-0">
                    <AuthSection />
                </div>
                {!isPostEditor && (
                    <IconButton onClick={toggleTheme} className={`flex-none text-(--foreground-dim) bg-background-hover ${theme === "light" ? "hover:text-blue-500" : "hover:text-yellow-500"}`}>
                        {theme === "light" ? <Moon strokeWidth={3} /> : <Sun strokeWidth={3} />}
                    </IconButton>
                )}
            </div>
        </header>
    );
}
