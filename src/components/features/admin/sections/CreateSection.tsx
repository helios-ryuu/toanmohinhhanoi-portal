"use client";

import { useRef } from "react";
import { FileText, Tag, Users, Plus, Upload } from "lucide-react";
import { SectionCard } from "../common/SectionCard";

export interface ImportedPostData {
    title: string;
    description: string;
    content: string;
    image_url: string;
    level: string;
    type: string;
    reading_time?: string;
    author_name?: string;
    tags?: string[];
}

interface CreateSectionProps {
    onAddPost: () => void;
    onAddTag: () => void;
    onAddAuthor: () => void;
    onImportPost?: (data: ImportedPostData) => void;
    onShowToast?: (type: "success" | "error" | "info" | "warning", message: string) => void;
}

// Parse YAML frontmatter from markdown content
function parseMarkdownFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { frontmatter: {}, body: content };
    }

    const yamlContent = match[1];
    const body = match[2].trim();
    const frontmatter: Record<string, unknown> = {};

    // Parse YAML-like format
    const lines = yamlContent.split("\n");
    let currentKey = "";
    let arrayValues: string[] = [];
    let inArray = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Check for array item
        if (inArray && trimmed.startsWith("- ")) {
            const value = trimmed.slice(2).replace(/^["']|["']$/g, "");
            arrayValues.push(value);
            continue;
        } else if (inArray && trimmed.match(/^\w+:/)) {
            // End of array
            frontmatter[currentKey] = arrayValues;
            inArray = false;
            arrayValues = [];
        }

        // Parse key: value pairs
        const keyMatch = trimmed.match(/^(\w+):\s*(.*)$/);
        if (keyMatch) {
            currentKey = keyMatch[1];
            let value = keyMatch[2].replace(/^["']|["']$/g, "");

            // Check if it's start of an array
            if (value === "" || value === "[]") {
                inArray = true;
                arrayValues = [];
            } else if (value.startsWith("[") && value.endsWith("]")) {
                // Inline array
                const arrayContent = value.slice(1, -1);
                frontmatter[currentKey] = arrayContent.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
            } else {
                frontmatter[currentKey] = value;
            }
        }
    }

    // Handle final array if still open
    if (inArray && arrayValues.length > 0) {
        frontmatter[currentKey] = arrayValues;
    }

    return { frontmatter, body };
}

export default function CreateSection({ onAddPost, onAddTag, onAddAuthor, onImportPost, onShowToast }: CreateSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_EXTENSIONS = [".md", ".mdx", ".txt"];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file extension
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            onShowToast?.("error", `Invalid file format. Only ${ALLOWED_EXTENSIONS.join(", ")} are allowed.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            onShowToast?.("error", "File too large. Maximum size is 50MB.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (!onImportPost) return;

        const text = await file.text();
        const { frontmatter, body } = parseMarkdownFrontmatter(text);

        const importedData: ImportedPostData = {
            title: String(frontmatter.title || ""),
            description: String(frontmatter.description || ""),
            content: body,
            image_url: String(frontmatter.image || ""),
            level: String(frontmatter.level || "beginner"),
            type: String(frontmatter.type || "standalone"),
            reading_time: frontmatter.readingTime ? String(frontmatter.readingTime) : undefined,
            author_name: frontmatter.author ? String(frontmatter.author) : undefined,
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : undefined,
        };

        onImportPost(importedData);
        onShowToast?.("success", `Imported "${file.name}" successfully!`);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-accent/5 p-6 rounded-lg border border-accent/70">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus size={20} className="text-accent" />
                Create
            </h2>
            <div className="grid gap-4 grid-cols-4 auto-rows-fr">
                <SectionCard
                    title="Add Post"
                    description="Create a new blog post"
                    className="col-span-2 md:col-span-1"
                    onClick={onAddPost}
                    icon={FileText}
                />
                <SectionCard
                    title="Import Post"
                    description="Import from .md, .mdx, .txt"
                    className="col-span-2 md:col-span-1"
                    onClick={() => fileInputRef.current?.click()}
                    icon={Upload}
                />
                <SectionCard
                    title="Add Tag"
                    description="Create a new tag"
                    className="col-span-2 md:col-span-1"
                    onClick={onAddTag}
                    icon={Tag}
                />
                <SectionCard
                    title="Add Author"
                    description="Create a new author"
                    className="col-span-2 md:col-span-1"
                    onClick={onAddAuthor}
                    icon={Users}
                />
            </div>

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".md,.mdx,.txt"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

