import {
    HomeIcon,
    NewspaperIcon,
    ShieldIcon,
    DatabaseIcon,
    FolderIcon,
    TrophyIcon,
    type LucideIcon,
} from "lucide-react";

export interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    requiresAdmin?: boolean;
    underDevelopment?: boolean;
    /** Hide this item from the mobile dropdown (desktop-only features). */
    desktopOnly?: boolean;
}

export const menuItems: MenuItem[] = [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: NewspaperIcon, label: "Posts", href: "/post" },
    { icon: TrophyIcon, label: "Contest", href: "/contests" },
    { icon: ShieldIcon, label: "CMS", href: "/admin", requiresAdmin: true, desktopOnly: true },
    { icon: FolderIcon, label: "Bucket", href: "/admin/bucket", requiresAdmin: true, desktopOnly: true },
    { icon: DatabaseIcon, label: "Database", href: "/admin/database", requiresAdmin: true, desktopOnly: true },
    { icon: TrophyIcon, label: "Contest Management", href: "/contest-management", requiresAdmin: true, desktopOnly: true },
];
