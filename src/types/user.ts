// Public user types

export interface User {
    id: number;
    email: string;
    phone: string | null;
    username: string;
    avatar_url: string | null;
    display_name: string | null;
    created_at: string;
}

// JWT payload stored in the auth cookie
export interface AuthPayload {
    sub: string;        // user id as string
    email: string;
    username: string;
    iat?: number;
    exp?: number;
}
