"use client";

import { useTranslations } from "next-intl";

interface FooterProps {
    transparent?: boolean;
}

export default function Footer({ transparent = false }: FooterProps) {
    const t = useTranslations("footer");
    return (
        <footer className={`flex-none flex items-center justify-center h-12 ${transparent ? "bg-transparent" : "bg-background"}`}>
            <span className="text-sm text-(--foreground-dim)">
                {t("copyright")}
            </span>
        </footer>
    );
}
