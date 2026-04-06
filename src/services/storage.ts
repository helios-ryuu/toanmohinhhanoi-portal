/**
 * Storage service for localStorage/sessionStorage operations
 */

type StorageType = "local" | "session";

function getStorage(type: StorageType): Storage | null {
    if (typeof window === "undefined") return null;
    return type === "local" ? localStorage : sessionStorage;
}

/**
 * Get item from storage with type safety
 */
export function getStorageItem<T>(
    key: string,
    defaultValue: T,
    type: StorageType = "local"
): T {
    const storage = getStorage(type);
    if (!storage) return defaultValue;

    try {
        const item = storage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item) as T;
    } catch {
        return defaultValue;
    }
}

/**
 * Set item in storage
 */
export function setStorageItem<T>(
    key: string,
    value: T,
    type: StorageType = "local"
): boolean {
    const storage = getStorage(type);
    if (!storage) return false;

    try {
        storage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Remove item from storage
 */
export function removeStorageItem(
    key: string,
    type: StorageType = "local"
): boolean {
    const storage = getStorage(type);
    if (!storage) return false;

    try {
        storage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * Clear all items from storage
 */
export function clearStorage(type: StorageType = "local"): boolean {
    const storage = getStorage(type);
    if (!storage) return false;

    try {
        storage.clear();
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(type: StorageType = "local"): boolean {
    const storage = getStorage(type);
    if (!storage) return false;

    try {
        const testKey = "__storage_test__";
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get item with expiry check
 */
export function getStorageItemWithExpiry<T>(
    key: string,
    defaultValue: T,
    type: StorageType = "local"
): T {
    const storage = getStorage(type);
    if (!storage) return defaultValue;

    try {
        const item = storage.getItem(key);
        if (item === null) return defaultValue;

        const parsed = JSON.parse(item) as { value: T; expiry: number };
        if (parsed.expiry && Date.now() > parsed.expiry) {
            storage.removeItem(key);
            return defaultValue;
        }
        return parsed.value;
    } catch {
        return defaultValue;
    }
}

/**
 * Set item with expiry time (in milliseconds)
 */
export function setStorageItemWithExpiry<T>(
    key: string,
    value: T,
    expiryMs: number,
    type: StorageType = "local"
): boolean {
    const storage = getStorage(type);
    if (!storage) return false;

    try {
        const item = {
            value,
            expiry: Date.now() + expiryMs,
        };
        storage.setItem(key, JSON.stringify(item));
        return true;
    } catch {
        return false;
    }
}
