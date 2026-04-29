import {
    HomeIcon,
    NewspaperIcon,
    ShieldIcon,
    FolderIcon,
    TrophyIcon,
    type LucideIcon,
} from "lucide-react";

export interface MenuItem {
    icon: LucideIcon;
    /** Fallback English label used if no translation key is wired in. */
    label: string;
    /** Translation key under the `nav` namespace (e.g. "home", "posts"). */
    labelKey: string;
    href: string;
    requiresAdmin?: boolean;
    underDevelopment?: boolean;
    /** Hide this item from the mobile dropdown (desktop-only features). */
    desktopOnly?: boolean;
}

export const menuItems: MenuItem[] = [
    { icon: HomeIcon, label: "Home", labelKey: "home", href: "/" },
    { icon: NewspaperIcon, label: "Posts", labelKey: "posts", href: "/post" },
    { icon: TrophyIcon, label: "Contests", labelKey: "contests", href: "/contests" },
    { icon: ShieldIcon, label: "Admin Workspace", labelKey: "adminWorkspace", href: "/admin", requiresAdmin: true, desktopOnly: true },
    { icon: FolderIcon, label: "Bucket", labelKey: "bucket", href: "/admin/bucket", requiresAdmin: true, desktopOnly: true },
    { icon: TrophyIcon, label: "Contest Management", labelKey: "contestManagement", href: "/contest-management", requiresAdmin: true, desktopOnly: true },
];
