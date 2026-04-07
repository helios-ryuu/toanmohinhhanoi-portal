export interface PasswordRuleStatus {
    minLength: boolean;
    hasLetter: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noUsername: boolean;
}

export type PasswordRuleKey = keyof PasswordRuleStatus;

export const PASSWORD_RULES: ReadonlyArray<{ key: PasswordRuleKey; label: string }> = [
    { key: "minLength", label: "At least 8 characters" },
    { key: "hasLetter", label: "At least 1 letter" },
    { key: "hasUppercase", label: "At least 1 uppercase letter" },
    { key: "hasNumber", label: "At least 1 number" },
    { key: "hasSpecial", label: "At least 1 special character" },
    { key: "noUsername", label: "Must not contain username" },
] as const;

export function evaluatePasswordRules(password: string, username: string): PasswordRuleStatus {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.toLowerCase();

    return {
        minLength: password.length >= 8,
        hasLetter: /[A-Za-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
        noUsername: !normalizedUsername || !normalizedPassword.includes(normalizedUsername),
    };
}

export function getPasswordValidationError(password: string, username: string): string | null {
    const status = evaluatePasswordRules(password, username);

    if (!status.minLength) return "Password must be at least 8 characters";
    if (!status.hasLetter) return "Password must contain at least 1 letter";
    if (!status.hasUppercase) return "Password must contain at least 1 uppercase letter";
    if (!status.hasNumber) return "Password must contain at least 1 number";
    if (!status.hasSpecial) return "Password must contain at least 1 special character";
    if (!status.noUsername) return "Password must not contain your username";

    return null;
}