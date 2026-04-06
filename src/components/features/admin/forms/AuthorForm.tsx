"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, UserPen } from "lucide-react";
import { FormField, FormInput, FormMessage } from "../common/FormFields";
import { Button } from "../common/Button";

interface AuthorFormProps {
    /** If provided, form is in "edit" mode; otherwise, "add" mode. */
    authorId?: number;
    onSuccess: () => void;
    onClose: () => void;
}

interface AuthorData {
    name: string;
    title: string;
    avatar_url: string;
    github_url: string;
    linkedin_url: string;
}

const INITIAL_DATA: AuthorData = {
    name: "",
    title: "",
    avatar_url: "",
    github_url: "",
    linkedin_url: "",
};

export default function AuthorForm({ authorId, onSuccess, onClose }: AuthorFormProps) {
    const isEditing = !!authorId;
    const [formData, setFormData] = useState<AuthorData>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditing);
    const [error, setError] = useState("");

    // Load existing author data in edit mode
    useEffect(() => {
        if (!authorId) return;

        const fetchAuthor = async () => {
            try {
                const res = await fetch(`/api/admin/authors/${authorId}`);
                const data = await res.json();
                if (data.success) {
                    setFormData({
                        name: data.data.name || "",
                        title: data.data.title || "",
                        avatar_url: data.data.avatar_url || "",
                        github_url: data.data.github_url || "",
                        linkedin_url: data.data.linkedin_url || "",
                    });
                } else {
                    setError("Failed to load author data");
                }
            } catch {
                setError("Failed to load author data");
            } finally {
                setIsFetching(false);
            }
        };

        fetchAuthor();
    }, [authorId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return setError("Name is required");
        if (!formData.title.trim()) return setError("Title is required");

        setIsLoading(true);
        setError("");

        try {
            const endpoint = isEditing
                ? `/api/admin/authors/${authorId}`
                : "/api/admin/authors";

            const res = await fetch(endpoint, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
            } else {
                setError(data.message || `Failed to ${isEditing ? "update" : "add"} author`);
            }
        } catch {
            setError(`Failed to ${isEditing ? "update" : "add"} author`);
        } finally {
            setIsLoading(false);
        }
    };

    const Icon = isEditing ? UserPen : UserPlus;
    const title = isEditing ? "Edit Author" : "Add Author";
    const submitText = isEditing ? "Save Changes" : "Add Author";

    return (
        <div
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md mx-4 p-6 rounded-xl border border-(--border-color) bg-background shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                            <Icon size={20} className="text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {isFetching ? (
                    <p className="text-foreground/50 text-center py-8">Loading author data...</p>
                ) : (
                    <div className="space-y-4">
                        <FormField label="Name" required>
                            <FormInput
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Author full name"
                                required
                            />
                        </FormField>

                        <FormField label="Title" required>
                            <FormInput
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Senior Developer"
                                required
                            />
                        </FormField>

                        <FormField label="Avatar URL">
                            <FormInput
                                name="avatar_url"
                                value={formData.avatar_url}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </FormField>

                        <FormField label="GitHub URL">
                            <FormInput
                                name="github_url"
                                value={formData.github_url}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                            />
                        </FormField>

                        <FormField label="LinkedIn URL">
                            <FormInput
                                name="linkedin_url"
                                value={formData.linkedin_url}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </FormField>

                        <FormMessage type="error" message={error} />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="cancel" onClick={onClose}>Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.name.trim() || !formData.title.trim()}
                            >
                                {isLoading ? (isEditing ? "Saving..." : "Adding...") : submitText}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
