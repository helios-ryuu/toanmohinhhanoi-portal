"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import FadeText from "@/components/ui/FadeText";
import SidebarItem from "./SidebarItem";
import { Menu, PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { useSidebar } from "@/contexts/SidebarContext";
import { menuItems } from "@/config/navigation";
import { usePathname } from "next/navigation";
import { TableOfContents } from "@/components/features/post";
import { useUser } from "@/contexts/UserContext";

export default function Sidebar() {
    const [hovered, setHovered] = useState(false);
    const { isPinned, setIsPinned, postContent } = useSidebar();
    const hoverCooldownRef = useRef(false);
    const pathname = usePathname();
    const { user } = useUser();
    const tNav = useTranslations("nav");
    const tCommon = useTranslations("common");
    const isAdmin = user?.role === "admin";
    const visibleItems = menuItems.filter((item) => !item.requiresAdmin || isAdmin);

    // Determine if we are on a post detail page based on path.
    // /post is the list, /post/anything-else is a detail page.
    const isPostPage = pathname.startsWith("/post/") && pathname !== "/post";
    const isExpanded = isPinned || hovered;

    // Wider sidebar for TOC; auto-width for menu so longer labels like "Contest Management" fit
    const expandedWidth = isPostPage ? "w-68" : "w-auto";

    const handleMouseEnter = useCallback(() => {
        if (!hoverCooldownRef.current) {
            setHovered(true);
        }
    }, []);

    const handleTogglePin = useCallback(() => {
        if (isPinned) {
            hoverCooldownRef.current = true;
            setHovered(false);
            setIsPinned(false);
            setTimeout(() => {
                hoverCooldownRef.current = false;
            }, 300);
        } else {
            setIsPinned(true);
        }
    }, [isPinned, setIsPinned]);

    return (
        <aside
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setHovered(false)}
            className={`
                hidden md:flex flex-col
                z-50 h-full border-r border-(--border-color) bg-background overflow-hidden
                ${isPinned ? "relative" : "absolute"} 
                ${isExpanded ? expandedWidth : "w-10"}
            `}
        >
            {/* Menu title / Back button for Post mode */}
            <div className="flex items-center p-2 relative">
                <div className={`absolute m-1`}>
                    <Menu strokeWidth={3} className="w-[18px] h-[18px] text-foreground/50" />
                </div>

                {isPostPage && isExpanded ? (
                    <div className="flex items-center gap-2 ml-1 text-foreground/50">
                        <FadeText text={tCommon("tableOfContents")} isVisible={isExpanded} duration={100} className="ml-7 font-medium text-sm" />
                    </div>
                ) : (
                    <FadeText text={tCommon("menu")} isVisible={isExpanded} duration={100} className="ml-8 font-medium text-sm text-foreground/50" />
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-(--border-color)" />

            {isPostPage ? (
                // TOC Mode
                <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                    <TableOfContents content={postContent || ""} />
                </div>
            ) : (
                // Standard Menu Mode
                <>
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <SidebarItem
                                key={item.href}
                                icon={<Icon strokeWidth={3} />}
                                label={<FadeText text={tNav(item.labelKey)} isVisible={isExpanded} duration={100} />}
                                className={isExpanded ? "gap-x-1.5" : "gap-x-0"}
                                href={item.href}
                                disabled={item.underDevelopment}
                                underDevelopment={item.underDevelopment}
                            />
                        );
                    })}

                    {/* Spacer */}
                    <div className="flex-1" />
                </>
            )}

            {/* Divider */}
            <div className="border-t border-(--border-color) mx-1.5" />

            {/* Pin button */}
            <div className="flex items-center justify-start ml-0.5">
                <IconButton
                    onClick={handleTogglePin}
                    className={`m-1 transition-colors text-(--foreground-dim) hover:bg-foreground/5`}
                >
                    {isPinned ? <PanelRightOpenIcon strokeWidth={3} /> : <PanelRightCloseIcon strokeWidth={2.5} />}
                </IconButton>
            </div>
        </aside>
    );
}
