import type {
  AdminSessionStatus,
  CommitHeroImageRequest,
  HeroImageDto,
  PresignHeroImageRequest,
  PresignHeroImageResponse,
} from "@compro/types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3007"
).replace(/\/+$/, "");

/** Error carrying the HTTP status, so callers can distinguish 401 from a real failure. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    // The admin session is an httpOnly cookie on the API origin, so every call has
    // to opt in to sending it. The API sets `credentials: true` on CORS to match.
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Nest's exception filter returns `{ message }` as a string or an array of strings. */
async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // Fall through to the status text for non-JSON bodies.
  }
  return `${response.status} ${response.statusText}`;
}

export const adminApi = {
  session: {
    status: () => request<AdminSessionStatus>("/admin/session"),
    login: (password: string) =>
      request<AdminSessionStatus>("/admin/session", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
    logout: () =>
      request<AdminSessionStatus>("/admin/session", { method: "DELETE" }),
  },

  heroImages: {
    list: () => request<HeroImageDto[]>("/admin/hero-images"),

    presign: (body: PresignHeroImageRequest) =>
      request<PresignHeroImageResponse>("/admin/hero-images/presign", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    commit: (body: CommitHeroImageRequest) =>
      request<HeroImageDto>("/admin/hero-images", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    remove: (id: string) =>
      request<void>(`/admin/hero-images/${id}`, { method: "DELETE" }),
  },
};

/**
 * Uploads the file straight to S3 using a presigned POST. The bytes never pass through
 * our API — it only signs the request and, afterwards, verifies what landed.
 *
 * The order of the form fields matters: S3 ignores anything after the `file` part, so
 * every policy field has to be appended first.
 */
export async function uploadToS3(
  presigned: PresignHeroImageResponse,
  file: File,
): Promise<void> {
  const form = new FormData();
  for (const [key, value] of Object.entries(presigned.fields)) {
    form.append(key, value);
  }
  form.append("file", file);

  const response = await fetch(presigned.url, { method: "POST", body: form });

  if (!response.ok) {
    // S3 replies with an XML error document; surface its <Message> when present.
    const text = await response.text().catch(() => "");
    const message = /<Message>([^<]+)<\/Message>/.exec(text)?.[1];
    throw new ApiError(
      message ?? `Upload failed (${response.status})`,
      response.status,
    );
  }
}
