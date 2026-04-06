"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Send, Edit3, Eye } from "lucide-react";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import AddTagForm from "./AddTagForm";
import ConfirmPopup from "../common/ConfirmPopup";
import { FormField, FormInput, FormTextarea, FormSelectDropdown, FormMessage } from "../common/FormFields";
import { TagSelector } from "../common/TagSelector";
import { SeriesFields } from "../common/SeriesFields";
import { PostPreviewPanel } from "../common/PostPreviewPanel";
import { Button } from "../common/Button";
import { useToast } from "../../../ui/Toast";
import type { AdminTag, AdminAuthor, AdminSeries } from "@/types/admin";
import { LEVELS, TYPES, CHAR_LIMITS } from "@/types/admin";
import { usePostFormValidation, type PostFormData } from "@/hooks/usePostFormValidation";

interface EditPostFormProps {
    postId: number;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditPostForm({ postId, onClose, onUpdate }: EditPostFormProps) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<PostFormData>({
        title: "",
        description: "",
        content: "",
        image_url: "",
        level: "beginner",
        type: "standalone",
        series_id: "",
        series_order: "",
        author_id: "",
        reading_time: "",
    });
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [tags, setTags] = useState<AdminTag[]>([]);
    const [authors, setAuthors] = useState<AdminAuthor[]>([]);
    const [seriesList, setSeriesList] = useState<AdminSeries[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUnpublishing, setIsUnpublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [error, setError] = useState("");
    const [showAddTag, setShowAddTag] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
    const [seriesOrderInfo, setSeriesOrderInfo] = useState<{
        existingOrders: number[];
        nextOrder: number;
    } | null>(null);
    const [orderError, setOrderError] = useState("");
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

    const { validationErrors, validationWarnings, hasValidationErrors, imageUrlValid } =
        usePostFormValidation(formData);



    const fetchData = useCallback(async () => {
        try {
            const [postRes, tagsRes, authorsRes, seriesRes] = await Promise.all([
                fetch(`/api/admin/posts/${postId}`),
                fetch("/api/admin/tags"),
                fetch("/api/admin/authors"),
                fetch("/api/admin/series"),
            ]);

            const [postData, tagsData, authorsData, seriesData] = await Promise.all([
                postRes.json(),
                tagsRes.json(),
                authorsRes.json(),
                seriesRes.json(),
            ]);

            if (tagsData.success) setTags(tagsData.data);
            if (authorsData.success) setAuthors(authorsData.data);
            if (seriesData.success) setSeriesList(seriesData.data);

            if (postData.success) {
                const post = postData.data;
                // Parse reading time to get just the number
                const readingTimeMatch = post.reading_time?.match(/(\d+)/);
                const readingTimeNum = readingTimeMatch ? readingTimeMatch[1] : "";

                // Set original values FIRST before setting formData
                // This ensures the useEffect for series orders has correct original values
                // Removed unused state setters

                // Handle boolean or truthy values (database may return string or boolean)
                setIsPublished(post.published === true || post.published === "true");
                setSelectedTags(post.tags?.map((t: AdminTag) => t.id) || []);

                setFormData({
                    title: post.title || "",
                    description: post.description || "",
                    content: post.content || "",
                    image_url: post.image_url || "",
                    level: post.level || "beginner",
                    type: post.type || "standalone",
                    series_id: post.series_id ? post.series_id.toString() : "",
                    series_order: post.series_order ? post.series_order.toString() : "",
                    author_id: post.author_id ? post.author_id.toString() : "",
                    reading_time: readingTimeNum,
                });
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load post data");
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fetch series order info when series is selected
    useEffect(() => {
        const fetchSeriesOrders = async () => {
            if (formData.series_id) {
                try {
                    // Exclude current post from the list to avoid "already taken" error
                    const res = await fetch(`/api/admin/series/${formData.series_id}/posts?excludePostId=${postId}`);
                    const data = await res.json();
                    if (data.success) {
                        setSeriesOrderInfo({
                            existingOrders: data.data.existingOrders,
                            nextOrder: data.data.nextOrder,
                        });
                    }
                } catch (err) {
                    console.error("Error fetching series orders:", err);
                }
            } else {
                setSeriesOrderInfo(null);
            }
        };
        fetchSeriesOrders();
    }, [formData.series_id, postId]);

    // Validate series order
    useEffect(() => {
        if (seriesOrderInfo && formData.series_order) {
            const order = parseInt(formData.series_order);
            // The API already excludes current post, so just check if order is taken
            if (seriesOrderInfo.existingOrders.includes(order)) {
                setOrderError(`Order ${order} is already taken`);
            } else {
                setOrderError("");
            }
        } else {
            setOrderError("");
        }
    }, [formData.series_order, seriesOrderInfo]);



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

    const generatePreview = useCallback(async () => {
        try {
            const mdx = await serialize(formData.content, {
                mdxOptions: {
                    remarkPlugins: [remarkGfm],
                },
            });
            setMdxSource(mdx);
            showToast("success", "Preview updated");
        } catch (err) {
            console.error("Error serializing MDX:", err);
            setError("Failed to generate preview");
        }
    }, [formData.content]);

    const handlePreview = async () => {
        if (showPreview) {
            setShowPreview(false);
            return;
        }

        await generatePreview();
        setShowPreview(true);
    };

    const handleSave = async () => {
        setError("");

        if (hasValidationErrors) {
            setError("Please fix validation errors before saving");
            return;
        }

        if (orderError) {
            setError(orderError);
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                series_id: formData.series_id ? parseInt(formData.series_id) : null,
                series_order: formData.series_order ? parseInt(formData.series_order) : null,
                author_id: parseInt(formData.author_id),
                reading_time: parseInt(formData.reading_time),
                tag_ids: selectedTags,
            };

            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("success", "Changes saved successfully");
                onUpdate();
            } else {
                setError(data.message || "Failed to save post");
            }
        } catch {
            setError("Failed to save post");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        // First save, then publish
        setError("");
        setShowPublishConfirm(false);

        if (hasValidationErrors) {
            setError("Please fix validation errors before publishing");
            return;
        }

        if (orderError) {
            setError(orderError);
            return;
        }

        setIsPublishing(true);

        try {
            // Save first
            const savePayload = {
                ...formData,
                series_id: formData.series_id ? parseInt(formData.series_id) : null,
                series_order: formData.series_order ? parseInt(formData.series_order) : null,
                author_id: parseInt(formData.author_id),
                reading_time: parseInt(formData.reading_time),
                tag_ids: selectedTags,
            };

            const saveResponse = await fetch(`/api/admin/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(savePayload),
            });

            if (!saveResponse.ok) {
                const saveData = await saveResponse.json();
                setError(saveData.message || "Failed to save post");
                return;
            }

            // Then publish
            const publishResponse = await fetch(`/api/admin/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "publish" }),
            });

            const publishData = await publishResponse.json();

            if (publishResponse.ok && publishData.success) {
                showToast("success", "Post published successfully");
                onUpdate();
                onClose();
            } else {
                setError(publishData.message || "Failed to publish");
            }
        } catch {
            setError("Failed to publish post");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        setError("");
        setShowUnpublishConfirm(false);
        setIsUnpublishing(true);

        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "unpublish" }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsPublished(false);
                showToast("success", "Post unpublished - now a draft");
                onUpdate();
                onClose();
            } else {
                setError(data.message || "Failed to unpublish");
            }
        } catch {
            setError("Failed to unpublish post");
        } finally {
            setIsUnpublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-foreground/50">Loading post...</div>
            </div>
        );
    }

    return (
        <>
            {showAddTag && (
                <AddTagForm
                    onSuccess={() => {
                        setShowAddTag(false);
                        // Refetch tags
                        fetch("/api/admin/tags")
                            .then((res) => res.json())
                            .then((data) => {
                                if (data.success) setTags(data.data);
                            });
                    }}
                    onClose={() => setShowAddTag(false)}
                />
            )}

            {showPublishConfirm && (
                <ConfirmPopup
                    variant="info"
                    title="Publish Post"
                    message="Are you sure you want to publish this post? It will be visible to all visitors."
                    itemName={formData.title}
                    confirmText="Publish"
                    onConfirm={handlePublish}
                    onCancel={() => setShowPublishConfirm(false)}
                />
            )}

            {showUnpublishConfirm && (
                <ConfirmPopup
                    variant="warning"
                    title="Unpublish Post"
                    message="Are you sure you want to unpublish this post? It will be reverted to draft status and no longer visible to visitors."
                    itemName={formData.title}
                    confirmText="Unpublish"
                    onConfirm={handleUnpublish}
                    onCancel={() => setShowUnpublishConfirm(false)}
                />
            )}

            <div
                className="fixed inset-0 z-100 flex bg-black/70 backdrop-blur-sm overflow-hidden"
                onClick={onClose}
            >
                <div
                    className="relative flex w-full h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Form Panel */}
                    <div className={`${showPreview ? "w-1/2" : "w-full"} h-full flex flex-col bg-background border-r border-(--border-color) transition-all`}>
                        {/* Header */}
                        <div className="flex items-center justify-between h-14 pl-6 pr-2 border-b border-(--border-color)">
                            <div className="flex items-center gap-2 text-accent">
                                <Edit3 size={20} />
                                <span className="font-bold tracking-wider">EDIT DRAFT</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePreview}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-(--border-color) rounded-md hover:bg-foreground/5 transition-colors cursor-pointer"
                                >
                                    <Eye size={16} />
                                    {showPreview ? "Hide Preview" : "Preview"}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-5xl mx-auto space-y-4">
                                {/* Title */}
                                <FormField
                                    label="Title"
                                    required
                                    error={validationErrors.title}
                                    charCount={{ current: formData.title.length, max: CHAR_LIMITS.title }}
                                >
                                    <FormInput
                                        name="title"
                                        type="text"
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

                                {/* Series fields */}
                                {formData.type === "series" && (
                                    <SeriesFields
                                        seriesList={seriesList}
                                        seriesId={formData.series_id}
                                        seriesOrder={formData.series_order}
                                        seriesOrderInfo={seriesOrderInfo}
                                        orderError={orderError}
                                        onSeriesIdChange={(value) => setFormData(prev => ({ ...prev, series_id: value }))}
                                        onSeriesOrderChange={(value) => setFormData(prev => ({ ...prev, series_order: value }))}
                                    />
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
                                        rows={16}
                                        className="font-mono resize-y"
                                        placeholder="Write your post content in Markdown..."
                                        hasWarning={!!validationWarnings.content}
                                        required
                                    />
                                </FormField>

                                {/* Error Messages */}
                                {error && <FormMessage type="error" message={error} />}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between p-4 border-t border-(--border-color) bg-background">
                            <Button
                                type="button"
                                variant="cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="save"
                                    onClick={handleSave}
                                    disabled={isSaving || isPublishing || isUnpublishing}
                                    isLoading={isSaving}
                                    loadingText="Saving..."
                                >
                                    {isPublished ? "Save Changes" : "Save Draft"}
                                </Button>
                                {isPublished ? (
                                    <Button
                                        variant="unpublish"
                                        onClick={() => setShowUnpublishConfirm(true)}
                                        disabled={isSaving || isUnpublishing}
                                        isLoading={isUnpublishing}
                                        loadingText="Unpublishing..."
                                        icon={<Edit3 size={16} />}
                                    >
                                        Unpublish
                                    </Button>
                                ) : (
                                    <Button
                                        variant="publish"
                                        onClick={() => setShowPublishConfirm(true)}
                                        disabled={isSaving || isPublishing}
                                        isLoading={isPublishing}
                                        loadingText="Publishing..."
                                        icon={<Send size={16} />}
                                    >
                                        Publish
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <PostPreviewPanel
                            title={formData.title}
                            description={formData.description}
                            imageUrl={formData.image_url}
                            level={formData.level}
                            readingTime={formData.reading_time}
                            authorId={formData.author_id}
                            authors={authors}
                            selectedTags={selectedTags}
                            tags={tags}
                            mdxSource={mdxSource}
                            onRender={generatePreview}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
