/** Server-only helper for reading the API's public (cookie-free) endpoints. */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3007").replace(/\/+$/, "");

/**
 * Time-based safety net behind on-demand revalidation. If the API can't reach
 * `/api/revalidate` (secret unset, web app down), content still refreshes on its own.
 */
export const CONTENT_REVALIDATE_SECONDS = 300;

export type PublicFetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  /** Network error, timeout or 5xx — callers decide on a fallback. */
  | { status: "unavailable"; reason: string };

export async function fetchPublic<T>(path: string, tags: string[]): Promise<PublicFetchResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags },
      // Don't hold a page render hostage to a hung API.
      signal: AbortSignal.timeout(3000),
    });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    // One line, not a stack trace: this is routine during `next build`, when the API
    // usually isn't running.
    const cause = (error as { cause?: { code?: string } }).cause?.code;
    const reason = cause ?? (error instanceof Error ? error.message : String(error));
    console.warn(`[api] ${path} unavailable (${reason}).`);
    return { status: "unavailable", reason };
  }
}
