"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FormField, FormInput, FormMessage } from "../common/FormFields";
import { Button } from "../common/Button";
import { generateSlug } from "@/lib/utils";

interface EditSeriesFormProps {
    seriesId: number;
    onSuccess: () => void;
    onClose: () => void;
}

interface SeriesData {
    name: string;
    description: string;
}

export default function EditSeriesForm({ seriesId, onSuccess, onClose }: EditSeriesFormProps) {

    const [formData, setFormData] = useState<SeriesData>({
        name: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const res = await fetch(`/api/admin/series/${seriesId}`);
                const data = await res.json();
                if (data.success) {
                    setFormData({
                        name: data.data.name || "",
                        description: data.data.description || "",
                    });
                } else {
                    setError(data.message || "Failed to fetch series");
                }
            } catch {
                setError("Failed to fetch series");
            } finally {
                setIsFetching(false);
            }
        };

        fetchSeries();
    }, [seriesId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }

        setIsLoading(true);

        try {
            const slug = generateSlug(formData.name);
            const response = await fetch(`/api/admin/series/${seriesId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    slug,
                    description: formData.description.trim() || null,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSuccess();
            } else {
                setError(data.message || "Failed to update series");
            }
        } catch {
            setError("Failed to update series");
        } finally {
            setIsLoading(false);
        }
    };

    const previewSlug = generateSlug(formData.name);

    return (
        <div
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md mx-4 p-6 rounded-xl border border-(--border-color) bg-background shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-accent tracking-wider mb-6">EDIT SERIES</h2>

                {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-accent" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            label="Series Name"
                            required
                            warning={formData.name.length > 100 ? "Name exceeds 100 characters" : undefined}
                            charCount={{ current: formData.name.length, max: 100 }}
                        >
                            <FormInput
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter series name"
                                hasWarning={formData.name.length > 100}
                                autoFocus
                            />
                        </FormField>

                        {/* Slug Preview */}
                        {formData.name && (
                            <div className="p-3 rounded-lg bg-foreground/5 border border-(--border-color)">
                                <p className="text-xs text-foreground/50 mb-1">Generated Slug</p>
                                <p className="text-sm text-foreground font-mono">{previewSlug || "—"}</p>
                            </div>
                        )}

                        <FormField
                            label="Description"
                            charCount={{ current: formData.description.length, max: 500 }}
                        >
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of the series (optional)"
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                            />
                        </FormField>

                        {error && <FormMessage type="error" message={error} />}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="cancel"
                                onClick={onClose}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="save"
                                disabled={isLoading}
                                isLoading={isLoading}
                                loadingText="Saving..."
                                fullWidth
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
