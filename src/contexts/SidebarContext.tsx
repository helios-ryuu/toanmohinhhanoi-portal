"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    isPinned: boolean;
    setIsPinned: (value: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (value: boolean) => void;
    postContent: string | null;
    setPostContent: (content: string | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isPinned, setIsPinned] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [postContent, setPostContent] = useState<string | null>(null);

    return (
        <SidebarContext.Provider value={{ isPinned, setIsPinned, isMobileOpen, setIsMobileOpen, postContent, setPostContent }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
