import sql from "./db";
import type { DbUser } from "@/types/database";
import type { User } from "@/types/user";

export function dbUserToUser(dbUser: DbUser): User {
    return {
        id: dbUser.id,
        email: dbUser.email,
        phone: dbUser.phone,
        username: dbUser.username,
        avatar_url: dbUser.avatar_url,
        display_name: dbUser.display_name,
        created_at: dbUser.created_at,
    };
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
    const rows = await sql<DbUser[]>`
        SELECT * FROM "user" WHERE email = ${email} LIMIT 1
    `;
    return rows[0] ?? null;
}

export async function getUserByUsername(username: string): Promise<DbUser | null> {
    const rows = await sql<DbUser[]>`
        SELECT * FROM "user" WHERE username = ${username} LIMIT 1
    `;
    return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<DbUser | null> {
    const rows = await sql<DbUser[]>`
        SELECT * FROM "user" WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
}

export async function createUser(data: {
    email: string;
    username: string;
    password_hash: string;
    phone?: string | null;
    display_name?: string | null;
}): Promise<DbUser> {
    const rows = await sql<DbUser[]>`
        INSERT INTO "user" (email, username, password_hash, phone, display_name)
        VALUES (
            ${data.email},
            ${data.username},
            ${data.password_hash},
            ${data.phone ?? null},
            ${data.display_name ?? null}
        )
        RETURNING *
    `;
    return rows[0];
}
