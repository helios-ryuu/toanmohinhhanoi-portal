"use client";

import { useState, useEffect, useMemo } from "react";
import { CHAR_LIMITS } from "@/types/admin";

export interface PostFormData {
    title: string;
    description: string;
    content: string;
    image_url: string;
    level: string;
    type: string;
    series_id: string;
    series_order: string;
    author_id: string;
    reading_time: string;
    // AddPostForm extras
    series_name?: string;
    series_description?: string;
}

export const INITIAL_POST_FORM_DATA: PostFormData = {
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
    series_name: "",
    series_description: "",
};

/**
 * Shared validation logic for Add/Edit post forms.
 */
export function usePostFormValidation(
    formData: PostFormData,
    opts?: { existingTitles?: string[] }
) {
    const [imageUrlValid, setImageUrlValid] = useState(true);

    // Check image URL validity
    useEffect(() => {
        if (!formData.image_url) {
            setImageUrlValid(true);
            return;
        }

        const img = new window.Image();
        img.onload = () => setImageUrlValid(true);
        img.onerror = () => setImageUrlValid(false);
        img.src = formData.image_url;
    }, [formData.image_url]);

    // Hard errors (block submit)
    const validationErrors = useMemo(() => {
        const errors: Record<string, string> = {};

        if (formData.title.length > CHAR_LIMITS.title) {
            errors.title = `Title exceeds ${CHAR_LIMITS.title} characters`;
        }

        if (formData.description.length > CHAR_LIMITS.description) {
            errors.description = `Description exceeds ${CHAR_LIMITS.description} characters`;
        }

        if (opts?.existingTitles?.some(t => t.toLowerCase() === formData.title.trim().toLowerCase())) {
            errors.title = "This title already exists. Please choose another one.";
        }

        return errors;
    }, [formData.title, formData.description, opts?.existingTitles]);

    // Soft warnings (can proceed)
    const validationWarnings = useMemo(() => {
        const warnings: Record<string, string> = {};

        if (formData.content.length > CHAR_LIMITS.content) {
            warnings.content = `Content exceeds ${CHAR_LIMITS.content} characters`;
        }

        const readingTime = parseInt(formData.reading_time);
        if (readingTime > 30) {
            warnings.reading_time = "Consider splitting into series or reducing content length";
        }

        if (!imageUrlValid && formData.image_url) {
            warnings.image_url = "Image URL may be invalid or inaccessible";
        }

        return warnings;
    }, [formData.content, formData.reading_time, formData.image_url, imageUrlValid]);

    const hasValidationErrors = Object.keys(validationErrors).length > 0;

    return {
        validationErrors,
        validationWarnings,
        hasValidationErrors,
        imageUrlValid,
    };
}

/**
 * Shared handleChange for post form inputs.
 */
export function handlePostFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setFormData: React.Dispatch<React.SetStateAction<PostFormData>>
) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
}
