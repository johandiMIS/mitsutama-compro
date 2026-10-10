import type {
  AdminNavGroupDto,
  AdminPageDto,
  AdminSessionStatus,
  CommitHeroImageRequest,
  HeroImageDto,
  ImportPageRequest,
  MediaImageDto,
  PageSection,
  PageValidationIssue,
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
    /** Per-field problems from a 422 (page content validation), with document paths. */
    readonly issues: PageValidationIssue[] = [],
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
    const { message, issues } = await readError(response);
    throw new ApiError(message, response.status, issues);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Nest's exception filter returns `{ message }` as a string or array, plus `issues` for page validation. */
async function readError(
  response: Response,
): Promise<{ message: string; issues: PageValidationIssue[] }> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      issues?: PageValidationIssue[];
    };
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    if (message) return { message, issues: body.issues ?? [] };
  } catch {
    // Fall through to the status text for non-JSON bodies.
  }
  return { message: `${response.status} ${response.statusText}`, issues: [] };
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

  pages: {
    list: () => request<AdminPageDto[]>("/admin/pages"),
    get: (id: string) => request<AdminPageDto>(`/admin/pages/${id}`),
    create: (body: CreatePageBody) =>
      request<AdminPageDto>("/admin/pages", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdatePageBody) =>
      request<AdminPageDto>(`/admin/pages/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    publish: (id: string) => request<AdminPageDto>(`/admin/pages/${id}/publish`, { method: "POST" }),
    unpublish: (id: string) =>
      request<AdminPageDto>(`/admin/pages/${id}/unpublish`, { method: "POST" }),
    remove: (id: string) => request<void>(`/admin/pages/${id}`, { method: "DELETE" }),
    import: (body: ImportPageRequest) =>
      request<AdminPageDto>("/admin/pages/import", { method: "POST", body: JSON.stringify(body) }),
    schema: () => request<Record<string, unknown>>("/admin/pages/schema"),
  },

  navGroups: {
    list: () => request<AdminNavGroupDto[]>("/admin/nav-groups"),
    create: (body: { section: PageSection; title: string }) =>
      request<AdminNavGroupDto>("/admin/nav-groups", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { title?: string; sortOrder?: number }) =>
      request<AdminNavGroupDto>(`/admin/nav-groups/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) => request<void>(`/admin/nav-groups/${id}`, { method: "DELETE" }),
  },

  media: {
    presign: (body: PresignHeroImageRequest) =>
      request<PresignHeroImageResponse>("/admin/media/presign", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    commit: (body: { key: string; width?: number; height?: number }) =>
      request<MediaImageDto>("/admin/media", { method: "POST", body: JSON.stringify(body) }),
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

export interface CreatePageBody {
  section: PageSection;
  slug: string;
  title: string;
  navLabel?: string;
  groupId?: string;
  parentId?: string;
  showInNav?: boolean;
}

export interface UpdatePageBody {
  slug?: string;
  title?: string;
  /** Empty string clears the optional fields. */
  navLabel?: string;
  groupId?: string;
  parentId?: string;
  /** Empty string clears it. */
  productGroup?: string;
  sortOrder?: number;
  showInNav?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  draftData?: Record<string, unknown>;
}

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
