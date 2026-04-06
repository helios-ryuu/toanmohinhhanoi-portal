"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Eye, EyeOff } from "lucide-react";
import { FormMessage } from "./FormFields";
import { Button } from "./Button";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface LoginPopupProps {
    onSuccess: () => void;
    onClose: () => void;
}

// Simple math captcha generator
function generateCaptcha(): { question: string; answer: number } {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "×"];
    const operatorIndex = Math.floor(Math.random() * 3);
    const operator = operators[operatorIndex];

    let answer: number;
    switch (operator) {
        case "+":
            answer = num1 + num2;
            break;
        case "-":
            answer = num1 - num2;
            break;
        case "×":
            answer = num1 * num2;
            break;
        default:
            answer = num1 + num2;
    }

    return {
        question: `${num1} ${operator} ${num2} = ?`,
        answer,
    };
}

export default function LoginPopup({ onSuccess, onClose }: LoginPopupProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [captchaInput, setCaptchaInput] = useState("");
    const [captcha, setCaptcha] = useState({ question: "", answer: 0 });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const refreshCaptcha = useCallback(() => {
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
    }, []);

    useEffect(() => {
        refreshCaptcha();
    }, [refreshCaptcha]);

    // Close on Escape key
    useEscapeKey(onClose);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate captcha first
        if (parseInt(captchaInput) !== captcha.answer) {
            setError("Incorrect captcha answer");
            refreshCaptcha();
            return;
        }

        // Validate credentials
        if (!username.trim() || !password.trim() || !secretKey.trim()) {
            setError("Please enter all credentials");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, secretKey }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSuccess();
            } else {
                setError(data.message || "Invalid credentials");
                refreshCaptcha();
            }
        } catch {
            setError("Login failed. Please try again.");
            refreshCaptcha();
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
                className="relative w-full max-w-sm mx-4 p-6 rounded-xl border border-(--border-color) bg-background shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-foreground/50 hover:text-foreground transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-accent tracking-wider">ADMIN LOGIN</h2>
                    <p className="text-sm text-foreground/50 mt-1">Enter your credentials to continue</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-foreground/70 mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                            placeholder="Enter username"
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground/70 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 pr-10 rounded-md border border-(--border-color) bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                                placeholder="Enter password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Secret Key */}
                    <div>
                        <label htmlFor="secretKey" className="block text-sm font-medium text-foreground/70 mb-1">
                            Secret Key
                        </label>
                        <div className="relative">
                            <input
                                id="secretKey"
                                type={showSecretKey ? "text" : "password"}
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="w-full px-3 py-2 pr-10 rounded-md border border-(--border-color) bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                                placeholder="Enter secret key"
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSecretKey(!showSecretKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                title={showSecretKey ? "Hide secret key" : "Show secret key"}
                            >
                                {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Captcha */}
                    <div>
                        <label htmlFor="captcha" className="block text-sm font-medium text-foreground/70 mb-1">
                            Captcha
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center justify-center px-3 py-2 rounded-md border border-(--border-color) bg-foreground/5 font-mono text-lg tracking-wider">
                                {captcha.question}
                            </div>
                            <button
                                type="button"
                                onClick={refreshCaptcha}
                                className="p-2 rounded-md border border-(--border-color) text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                                title="Refresh captcha"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                        <input
                            id="captcha"
                            type="text"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            className="w-full mt-2 px-3 py-2 rounded-md border border-(--border-color) bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                            placeholder="Enter the answer"
                            autoComplete="off"
                        />
                    </div>

                    {/* Error message */}
                    {error && <FormMessage type="error" message={error} />}

                    {/* Submit button */}
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        isLoading={isLoading}
                        loadingText="Logging in..."
                        fullWidth
                    >
                        Login
                    </Button>
                </form>
            </div>
        </div>
    );
}
