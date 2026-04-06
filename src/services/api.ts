/**
 * API service for making fetch requests
 */

interface FetchOptions extends RequestInit {
    timeout?: number;
}

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Fetch JSON with error handling
 */
export async function fetchJSON<T>(
    url: string,
    options: FetchOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const response = await fetchWithTimeout(url, options);

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                return { success: false, error: "Request timeout" };
            }
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error" };
    }
}

/**
 * POST JSON data
 */
export async function postJSON<T>(
    url: string,
    body: unknown,
    options: FetchOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    return fetchJSON<T>(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * PUT JSON data
 */
export async function putJSON<T>(
    url: string,
    body: unknown,
    options: FetchOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    return fetchJSON<T>(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * DELETE request
 */
export async function deleteRequest<T>(
    url: string,
    options: FetchOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    return fetchJSON<T>(url, {
        method: "DELETE",
        ...options,
    });
}
