"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import AddTagForm from "./AddTagForm";
import { FormField, FormInput, FormTextarea, FormSelectDropdown, FormMessage } from "../common/FormFields";
import { TagSelector } from "../common/TagSelector";
import { Button } from "../common/Button";
import type { AdminTag, AdminAuthor, AdminSeries } from "@/types/admin";
import { LEVELS, TYPES, CHAR_LIMITS } from "@/types/admin";
import { usePostFormValidation, handlePostFormChange, type PostFormData, INITIAL_POST_FORM_DATA } from "@/hooks/usePostFormValidation";

export interface AddPostInitialData {
    title?: string;
    description?: string;
    content?: string;
    image_url?: string;
    level?: string;
    type?: string;
    reading_time?: string;
    author_name?: string;
    tags?: string[];
}

interface AddPostFormProps {
    onSuccess: (postId: number, slug: string) => void;
    onClose: () => void;
    initialData?: AddPostInitialData;
    onShowToast?: (type: "success" | "error" | "info" | "warning", message: string) => void;
    existingTitles?: string[];
}

export default function AddPostForm({ onSuccess, onClose, initialData, onShowToast, existingTitles = [] }: AddPostFormProps) {
    const [formData, setFormData] = useState<PostFormData>(INITIAL_POST_FORM_DATA);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [tags, setTags] = useState<AdminTag[]>([]);
    const [authors, setAuthors] = useState<AdminAuthor[]>([]);
    const [seriesList, setSeriesList] = useState<AdminSeries[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAddTag, setShowAddTag] = useState(false);
    const [useNewSeries, setUseNewSeries] = useState(false);
    const [seriesOrderInfo, setSeriesOrderInfo] = useState<{
        existingOrders: number[];
        nextOrder: number;
    } | null>(null);
    const [orderError, setOrderError] = useState("");

    const { validationErrors, validationWarnings, hasValidationErrors, imageUrlValid } =
        usePostFormValidation(formData, { existingTitles });



    useEffect(() => {
        fetchData();
    }, []);

    // Pre-fill form with imported data
    // Pre-fill form with imported data
    useEffect(() => {
        if (initialData) {
            setFormData((prev) => {
                let readingTime = prev.reading_time;
                if (initialData.reading_time) {
                    const parsed = parseInt(initialData.reading_time);
                    if (!isNaN(parsed)) {
                        readingTime = parsed.toString();
                    }
                }

                return {
                    ...prev,
                    title: initialData.title || prev.title,
                    description: initialData.description || prev.description,
                    content: initialData.content || prev.content,
                    image_url: initialData.image_url || prev.image_url,
                    level: LEVELS.includes(initialData.level || "") ? initialData.level! : prev.level,
                    type: TYPES.includes(initialData.type || "") ? initialData.type! : prev.type,
                    reading_time: readingTime,
                };
            });

            // Map author name to ID
            if (initialData.author_name && authors.length > 0) {
                const matchedAuthor = authors.find(
                    (a) => a.name.toLowerCase() === initialData.author_name?.toLowerCase()
                );
                if (matchedAuthor) {
                    setFormData((prev) => ({ ...prev, author_id: matchedAuthor.id.toString() }));
                }
            }

            // Map tags to IDs
            if (initialData.tags && initialData.tags.length > 0 && tags.length > 0) {
                const matchedTagIds = tags
                    .filter((t) =>
                        initialData.tags?.some((it) => it.toLowerCase() === t.name.toLowerCase())
                    )
                    .map((t) => t.id);
                setSelectedTags(matchedTagIds);
            }
        }
    }, [initialData, authors, tags]);

    // Fetch series order info when series is selected
    useEffect(() => {
        const fetchSeriesOrders = async () => {
            if (formData.series_id && !useNewSeries) {
                try {
                    const res = await fetch(`/api/admin/series/${formData.series_id}/posts`);
                    const data = await res.json();
                    if (data.success) {
                        setSeriesOrderInfo(data.data);
                        // Auto-fill next order if empty
                        if (!formData.series_order) {
                            setFormData((prev) => ({ ...prev, series_order: data.data.nextOrder.toString() }));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching series orders:", err);
                }
            } else if (useNewSeries) {
                // For new series, order should always be 1
                setSeriesOrderInfo({ existingOrders: [], nextOrder: 1 });
                setFormData((prev) => ({ ...prev, series_order: "1" }));
            } else {
                setSeriesOrderInfo(null);
            }
        };
        fetchSeriesOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.series_id, useNewSeries]);

    // Validate series order
    useEffect(() => {
        if (seriesOrderInfo && formData.series_order) {
            const order = parseInt(formData.series_order);
            // Only check if order is already taken, allow any order number
            if (seriesOrderInfo.existingOrders.includes(order)) {
                setOrderError(`Order ${order} is already taken`);
            } else {
                setOrderError("");
            }
        } else {
            setOrderError("");
        }
    }, [formData.series_order, seriesOrderInfo]);

    const fetchData = async () => {
        try {
            const [tagsRes, authorsRes, seriesRes] = await Promise.all([
                fetch("/api/admin/tags"),
                fetch("/api/admin/authors"),
                fetch("/api/admin/series"),
            ]);

            const [tagsData, authorsData, seriesData] = await Promise.all([
                tagsRes.json(),
                authorsRes.json(),
                seriesRes.json(),
            ]);

            if (tagsData.success) setTags(tagsData.data);
            if (authorsData.success) setAuthors(authorsData.data);
            if (seriesData.success) setSeriesList(seriesData.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleTag = (tagId: number) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter((id) => id !== tagId));
        } else if (selectedTags.length < 3) {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (hasValidationErrors) {
            const errorMessages = Object.values(validationErrors).join(", ");
            onShowToast?.("error", errorMessages || "Please fix validation errors before creating");
            return;
        }

        if (orderError) {
            onShowToast?.("error", orderError);
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                series_id: formData.series_id ? parseInt(formData.series_id) : null,
                series_order: formData.series_order ? parseInt(formData.series_order) : null,
                author_id: parseInt(formData.author_id),
                tag_ids: selectedTags,
            };

            // If using new series, clear series_id
            if (useNewSeries) {
                payload.series_id = null;
            }

            const response = await fetch("/api/admin/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSuccess(data.data.id, data.data.slug);
            } else {
                setError(data.message || "Failed to create post");
            }
        } catch {
            setError("Failed to create post");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {showAddTag && (
                <AddTagForm
                    onSuccess={() => {
                        setShowAddTag(false);
                        fetchData();
                    }}
                    onClose={() => setShowAddTag(false)}
                />
            )}

            <div
                className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8"
                onClick={onClose}
            >
                <div
                    className="relative w-full max-w-5xl mx-4 p-6 rounded-xl border border-(--border-color) bg-background shadow-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-foreground/50 hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold text-accent tracking-wider mb-6">ADD POST</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <FormField
                            label="Title"
                            required
                            error={validationErrors.title}
                            charCount={{ current: formData.title.length, max: CHAR_LIMITS.title }}
                        >
                            <FormInput
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter post title"
                                hasError={!!validationErrors.title}
                                required
                            />
                        </FormField>

                        {/* Description */}
                        <FormField
                            label="Description"
                            required
                            error={validationErrors.description}
                            charCount={{ current: formData.description.length, max: CHAR_LIMITS.description }}
                        >
                            <FormTextarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Brief description of the post"
                                hasError={!!validationErrors.description}
                                required
                            />
                        </FormField>

                        {/* Image URL */}
                        <FormField
                            label="Image URL"
                            required
                            warning={validationWarnings.image_url}
                        >
                            <FormInput
                                name="image_url"
                                type="url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                hasWarning={!!validationWarnings.image_url}
                                required
                            />
                        </FormField>

                        {/* Level & Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Level" required>
                                <FormSelectDropdown
                                    name="level"
                                    value={formData.level}
                                    onChange={(val) => setFormData((prev) => ({ ...prev, level: val }))}
                                    options={LEVELS.map((level) => ({
                                        value: level,
                                        label: level.charAt(0).toUpperCase() + level.slice(1),
                                    }))}
                                />
                            </FormField>
                            <FormField label="Type" required>
                                <FormSelectDropdown
                                    name="type"
                                    value={formData.type}
                                    onChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
                                    options={TYPES.map((type) => ({
                                        value: type,
                                        label: type.charAt(0).toUpperCase() + type.slice(1),
                                    }))}
                                />
                            </FormField>
                        </div>

                        {/* Series fields (shown only when type is 'series') */}
                        {formData.type === "series" && (
                            <div className="p-4 rounded-lg border border-(--border-color) bg-foreground/5 space-y-4">
                                <h3 className="font-medium text-foreground">Series Information</h3>

                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!useNewSeries}
                                            onChange={() => setUseNewSeries(false)}
                                            className="accent-accent"
                                        />
                                        <span className="text-sm">Existing Series</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={useNewSeries}
                                            onChange={() => setUseNewSeries(true)}
                                            className="accent-accent"
                                        />
                                        <span className="text-sm">New Series</span>
                                    </label>
                                </div>

                                {!useNewSeries ? (
                                    <FormField label="Select Series" required>
                                        <FormSelectDropdown
                                            name="series_id"
                                            value={formData.series_id}
                                            onChange={(val) => setFormData((prev) => ({ ...prev, series_id: val }))}
                                            placeholder="Select a series"
                                            options={seriesList.map((series) => ({
                                                value: series.id.toString(),
                                                label: series.name,
                                            }))}
                                        />
                                    </FormField>
                                ) : (
                                    <>
                                        <FormField label="Series Name" required>
                                            <FormInput
                                                name="series_name"
                                                value={formData.series_name}
                                                onChange={handleChange}
                                                placeholder="Enter series name"
                                                required
                                            />
                                        </FormField>
                                        <FormField label="Series Description">
                                            <FormInput
                                                name="series_description"
                                                value={formData.series_description}
                                                onChange={handleChange}
                                                placeholder="Brief description of the series"
                                            />
                                        </FormField>
                                    </>
                                )}

                                <FormField
                                    label="Series Order"
                                    required
                                    hint={seriesOrderInfo ? `next: ${seriesOrderInfo.nextOrder}` : undefined}
                                    error={orderError}
                                >
                                    <FormInput
                                        name="series_order"
                                        type="number"
                                        min={1}
                                        value={formData.series_order}
                                        onChange={handleChange}
                                        placeholder="e.g., 1, 2, 3..."
                                        required
                                        hasError={!!orderError}
                                    />
                                    {seriesOrderInfo && seriesOrderInfo.existingOrders.length > 0 && (
                                        <p className="mt-1 text-xs text-foreground/40">
                                            Existing orders: {seriesOrderInfo.existingOrders.join(", ")}
                                        </p>
                                    )}
                                </FormField>
                            </div>
                        )}

                        {/* Author & Reading Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Author" required>
                                <FormSelectDropdown
                                    name="author_id"
                                    value={formData.author_id}
                                    onChange={(val) => setFormData((prev) => ({ ...prev, author_id: val }))}
                                    placeholder="Select author"
                                    options={authors.map((author) => ({
                                        value: author.id.toString(),
                                        label: author.name,
                                    }))}
                                />
                            </FormField>
                            <FormField
                                label="Reading Time"
                                required
                                hint="minutes"
                                warning={validationWarnings.reading_time}
                            >
                                <FormInput
                                    name="reading_time"
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={formData.reading_time}
                                    onChange={handleChange}
                                    restrictToPositiveInteger
                                    placeholder="e.g., 5"
                                    hasWarning={!!validationWarnings.reading_time}
                                    required
                                />
                            </FormField>
                        </div>

                        {/* Tags */}
                        <TagSelector
                            tags={tags}
                            selectedTags={selectedTags}
                            onToggle={toggleTag}
                            onAddNew={() => setShowAddTag(true)}
                        />

                        {/* Content (Markdown) */}
                        <FormField
                            label="Content"
                            required
                            hint="Markdown"
                            warning={validationWarnings.content}
                            charCount={{ current: formData.content.length, max: CHAR_LIMITS.content }}
                        >
                            <FormTextarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={12}
                                className="font-mono resize-y"
                                placeholder="Write your post content in Markdown..."
                                hasWarning={!!validationWarnings.content}
                                required
                            />
                        </FormField>

                        {/* Error */}
                        {error && <FormMessage type="error" message={error} />}

                        {/* Submit */}
                        <div className="flex gap-3 pt-4">
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
                                variant="primary"
                                disabled={isLoading}
                                isLoading={isLoading}
                                loadingText="Creating..."
                                fullWidth
                            >
                                Create Draft
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
