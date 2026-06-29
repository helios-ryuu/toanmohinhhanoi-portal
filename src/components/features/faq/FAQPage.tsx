"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/layout/PageHeader";

interface FAQItem {
    q: string;
    a: string;
}

function Accordion({ items }: { items: FAQItem[] }) {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <div className="divide-y divide-(--border-color) rounded-[8px] border border-(--border-color) bg-(--post-card) overflow-hidden">
            {items.map((item, i) => (
                <div key={i}>
                    <button
                        type="button"
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-foreground/5 transition-colors cursor-pointer"
                    >
                        <span>{item.q}</span>
                        {open === i ? (
                            <ChevronUp className="w-4 h-4 shrink-0 text-foreground/50" />
                        ) : (
                            <ChevronDown className="w-4 h-4 shrink-0 text-foreground/50" />
                        )}
                    </button>
                    {open === i && (
                        <div className="px-4 pb-4 text-sm text-foreground/74 leading-relaxed border-t border-(--border-color) pt-3">
                            {item.a}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function FAQPage({ mode = "user" }: { mode?: "user" | "admin" }) {
    const t = useTranslations("faq");

    const userItems: FAQItem[] = [
        { q: t("q1"), a: t("a1") },
        { q: t("q2"), a: t("a2") },
        { q: t("q3"), a: t("a3") },
        { q: t("q4"), a: t("a4") },
        { q: t("q5"), a: t("a5") },
        { q: t("q6"), a: t("a6") },
        { q: t("q7"), a: t("a7") },
        { q: t("q8"), a: t("a8") },
        { q: t("q9"), a: t("a9") },
    ];

    const adminItems: FAQItem[] = [
        { q: t("aq1"), a: t("aa1") },
        { q: t("aq2"), a: t("aa2") },
        { q: t("aq3"), a: t("aa3") },
        { q: t("aq4"), a: t("aa4") },
        { q: t("aq5"), a: t("aa5") },
        { q: t("aq6"), a: t("aa6") },
        { q: t("aq7"), a: t("aa7") },
        { q: t("aq8"), a: t("aa8") },
    ];

    const items = mode === "admin" ? adminItems : userItems;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            <PageHeader
                title={mode === "admin" ? t("adminPageTitle") : t("pageTitle")}
                description={mode === "admin" ? t("adminPageSubtitle") : t("pageSubtitle")}
                className="mb-0"
            />

            <section>
                <h2 className={`text-sm font-bold tracking-widest uppercase mb-3 ${mode === "admin" ? "text-accent" : "text-foreground/80"}`}>
                    {mode === "admin" ? t("adminSection") : t("userSection")}
                </h2>
                <Accordion items={items} />
            </section>
        </div>
    );
}
