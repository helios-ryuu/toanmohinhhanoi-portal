import { CompassIcon, FlameIcon, HomeIcon, NewspaperIcon, ShieldIcon } from "lucide-react";

export const menuItems = [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: NewspaperIcon, label: "Posts", href: "/post" },
    { icon: ShieldIcon, label: "Admin", href: "/admin" },
    { icon: CompassIcon, label: "Roadmaps", href: "/roadmaps", disabled: true },
    { icon: FlameIcon, label: "Projects", href: "/project", disabled: true },
];
