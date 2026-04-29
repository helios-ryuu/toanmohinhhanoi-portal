"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import Banner from "@/components/layout/Banner";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/Toast";
import { UserProvider } from "@/contexts/UserContext";
import { Button } from "@/components/ui";
import DotGrid from "@/components/ui/DotGrid";

const BANNER_LINK = {
    app: "facebook",
    facebook: { webUrl: "https://www.facebook.com/toanmohinh.hanoi", appUrl: "fb://page/toanmohinh.hanoi" },
} as const;

function AppShellContent({ children }: { children: React.ReactNode }) {
    const { isPinned } = useSidebar();
    const pathname = usePathname();
    const tCommon = useTranslations("common");
    const isHomePage = pathname === "/";

    const isPostPage = pathname.startsWith("/post/");

    // Hide sidebar entirely on the dedicated post editor routes so the form can use full width.
    const isPostEditorRoute =
        pathname === "/admin/posts/new" || /^\/admin\/posts\/[^/]+\/edit$/.test(pathname);
    const showSidebar = !isHomePage && !isPostEditorRoute;

    return (
        <div className="flex flex-col min-h-screen md:h-screen md:overflow-hidden relative">
            {/* DotGrid Background - only on home page */}
            {isHomePage && (
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <DotGrid
                        dotSize={6}
                        gap={20}
                        proximity={150}
                        shockRadius={200}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={1.5}
                        useCssVars
                    />
                </div>
            )}


            <div className="relative z-10">
                <Banner
                    gradient="linear-gradient(to right, #f59e0b, #ea580c, #dc2626)"
                    content={
                        <>
                            <span className="text-xs mr-2">{tCommon("bannerText")}</span>
                            <Button
                                    className="bg-yellow-600 border-yellow-500 text-white hover:bg-yellow-400 hover:border-yellow-500"
                                    onClick={() => {
                                        const { webUrl, appUrl } = BANNER_LINK[BANNER_LINK.app];
                                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                                        if (isMobile) {
                                            window.location.href = appUrl;
                                            setTimeout(() => window.open(webUrl, "_blank"), 500);
                                        } else {
                                            window.open(webUrl, "_blank");
                                        }
                                    }}
                                >
                                    {tCommon("bannerCta")}
                                </Button>
                        </>
                    }
                    dismissible
                />
            </div>

            {/* Display container - contains header, sidebar, main */}
            <div className="relative z-10 flex-1 flex flex-col md:min-h-0">
                {/* Header - fixed height */}
                <Header noBorder={isHomePage} showMobileMenu={!isHomePage} transparent={isHomePage} isHomePage={isHomePage} />

                {/* Content area - sidebar + main */}
                <div className="relative flex-1 flex md:min-h-0">

                    {/* Sidebar - hidden on mobile, full height on desktop */}
                    {showSidebar && <Sidebar />}

                    {/* Main space - scrollable */}
                    <main className={`flex-1 overflow-auto ${isHomePage ? "bg-transparent" : "bg-background"} ${showSidebar && !isPinned ? "md:ml-10" : ""} ${isPostPage ? "lg:overflow-hidden" : ""}`}>
                        <div className={`${isPostPage ? "h-full" : "min-h-full"} flex flex-col ${!isPostPage ? "pb-[env(safe-area-inset-bottom)]" : ""}`}>
                            <div className="flex-1 min-h-0">{children}</div>
                            {isHomePage && <Footer transparent />}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" storageKey="helios-blog-theme" enableSystem={false}>
            <UserProvider>
                <SidebarProvider>
                    <ToastProvider>
                        <AppShellContent>{children}</AppShellContent>
                    </ToastProvider>
                </SidebarProvider>
            </UserProvider>
        </ThemeProvider>
    );
}
