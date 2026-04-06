"use client";

import { useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";

interface PostSidebarInjectorProps {
    content: string;
}

export default function PostSidebarInjector({ content }: PostSidebarInjectorProps) {
    const { setPostContent } = useSidebar();

    useEffect(() => {
        setPostContent(content);
        return () => setPostContent(null);
    }, [content, setPostContent]);

    return null;
}
