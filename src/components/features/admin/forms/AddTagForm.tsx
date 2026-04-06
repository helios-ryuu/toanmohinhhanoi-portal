"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FormField, FormInput, FormMessage } from "../common/FormFields";
import { Button } from "../common/Button";

interface AddTagFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

export default function AddTagForm({ onSuccess, onClose }: AddTagFormProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Tag name is required");
            return;
        }

        if (trimmedName.length > 15) {
            setError("Tag name must be 15 characters or less");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmedName }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSuccess();
            } else {
                setError(data.message || "Failed to create tag");
            }
        } catch {
            setError("Failed to create tag");
        } finally {
            setIsLoading(false);
        }
    };

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
                    className="absolute top-4 right-4 p-1 text-foreground/50 hover:text-foreground transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-accent tracking-wider mb-6">ADD TAG</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Tag Name" hint="max 15 characters">
                        <FormInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                            placeholder="Enter tag name"
                            autoFocus
                        />
                        <div className="text-right text-xs text-foreground/40 mt-1">
                            {name.length}/15
                        </div>
                    </FormField>

                    {error && <FormMessage type="error" message={error} />}

                    <div className="flex gap-3">
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
                            Create Tag
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
