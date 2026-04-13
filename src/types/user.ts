// Public user types

export type UserRole = "user" | "admin";

export interface User {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    school: string | null;
    role: UserRole;
    created_at: string;
}
