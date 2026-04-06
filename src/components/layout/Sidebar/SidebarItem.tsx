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
}

export default function SidebarItem({ icon, label, href, className = "", onClick, disabled }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

    const baseClasses = `
        flex items-center gap-x-2 pl-2 py-1 my-0.5 mx-1 rounded-sm text-[12px]
        ${className}
    `;

    if (disabled) {
        return (
            <span
                className={`${baseClasses} text-(--foreground-dim) opacity-40 cursor-not-allowed`}
            >
                {icon && <span className="flex-none size-4 flex items-center justify-center [&>svg]:size-4">{icon}</span>}
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
            {icon && <span className="flex-none size-4 flex items-center justify-center [&>svg]:size-4">{icon}</span>}
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
}
