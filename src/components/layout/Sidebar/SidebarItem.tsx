"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
    icon?: React.ReactNode;
    label: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    underDevelopment?: boolean;
}

function isActiveHref(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    if (pathname === href) return true;
    // Only match subpaths for non-leaf admin routes.
    // /admin is a leaf page — don't highlight it for /admin/bucket or /admin/database.
    if (href === "/admin") return false;
    return pathname.startsWith(href + "/");
}

export default function SidebarItem({
    icon,
    label,
    href,
    className = "",
    onClick,
    disabled,
    underDevelopment,
}: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = isActiveHref(pathname, href);

    const baseClasses = `
        w-full flex items-center gap-x-2 px-4 py-1.5 my-0.5 rounded-sm text-[14px]
        ${className}
    `;

    if (disabled) {
        return (
            <span
                className={`${baseClasses} text-(--foreground-dim) opacity-40 cursor-not-allowed`}
                title={underDevelopment ? "Under development" : undefined}
            >
                {icon && <span className="flex-none size-[18px] flex items-center justify-center [&>svg]:size-[18px]">{icon}</span>}
                <span className="whitespace-nowrap">{label}</span>
            </span>
        );
    }

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                ${baseClasses} cursor-pointer
                ${isActive
                    ? "bg-accent/20 text-accent"
                    : "text-(--foreground-dim) hover:text-foreground hover:bg-foreground/5"
                }
            `}
        >
            {icon && <span className="flex-none size-[18px] flex items-center justify-center [&>svg]:size-[18px]">{icon}</span>}
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
}
