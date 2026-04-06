"use client";

import { Check, Plus } from "lucide-react";

interface Tag {
    id: number;
    name: string;
    slug?: string;
}

interface TagSelectorProps {
    tags: Tag[];
    selectedTags: number[];
    maxTags?: number;
    onToggle: (tagId: number) => void;
    onAddNew?: () => void;
}

export function TagSelector({ 
    tags, 
    selectedTags, 
    maxTags = 3, 
    onToggle, 
    onAddNew 
}: TagSelectorProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-foreground/70">
                    Tags <span className="text-foreground/40">(max {maxTags})</span>
                </label>
                {onAddNew && (
                    <button
                        type="button"
                        onClick={onAddNew}
                        className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer"
                    >
                        <Plus size={14} />
                        Add New Tag
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2 p-3 rounded-md border border-(--border-color) bg-foreground/5 min-h-[60px]">
                {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    const isDisabled = !isSelected && selectedTags.length >= maxTags;
                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => onToggle(tag.id)}
                            disabled={isDisabled}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                                isSelected
                                    ? "bg-accent text-white cursor-pointer"
                                    : isDisabled
                                    ? "bg-foreground/10 text-foreground/30 cursor-not-allowed"
                                    : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20 cursor-pointer"
                            }`}
                        >
                            {isSelected && <Check size={14} />}
                            {tag.name}
                        </button>
                    );
                })}
                {tags.length === 0 && (
                    <span className="text-foreground/40 text-sm">No tags available</span>
                )}
            </div>
        </div>
    );
}
