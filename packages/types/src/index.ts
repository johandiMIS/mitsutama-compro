/**
 * Cross-app contracts shared by `apps/api` (which produces them) and `apps/web`
 * (which consumes them). Update this file first when a contract changes, so both
 * apps move together — see `docs/architecture.md`.
 *
 * IMPORTANT — keep every contract in this one file for now.
 *
 * This package has no build step: `package.json` points `main`/`types` straight at
 * `src/index.ts`, so consumers import raw TypeScript. Bundled builds (`next build`,
 * `nest build`) resolve that fine, but the compiled API is run as plain Node
 * (`node dist/main`), which loads this file through Node's type-stripping. Node's
 * ESM resolver then requires *explicit file extensions* on relative imports, so a
 * barrel like `export * from './hero-image'` compiles and builds cleanly and then
 * throws ERR_MODULE_NOT_FOUND at runtime.
 *
 * To split this into multiple files, give the package a real build step (tsc to
 * `dist`, `main` -> `dist/index.js`, a `build` script so Turborepo's `^build` runs
 * it before the apps) rather than adding a relative re-export here.
 */

// ---------------------------------------------------------------------------
// Hero carousel images — managed from the admin panel, stored in S3.
// ---------------------------------------------------------------------------

/**
 * The only format the hero carousel accepts. Enforced in three places, because no
 * single one of them is sufficient on its own:
 *
 * 1. the admin file picker (`accept`) — convenience only, trivially bypassed;
 * 2. the presigned POST policy — S3 rejects a mismatched `Content-Type` header,
 *    but a client can send that header with any bytes it likes;
 * 3. a magic-byte check on the stored object before the DB row is written — the
 *    only one that actually inspects the file.
 */
export const HERO_IMAGE_MIME = 'image/webp';
export const HERO_IMAGE_EXTENSION = '.webp';

/** Upper bound baked into the presigned POST policy, so S3 rejects oversized uploads itself. */
export const HERO_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** A hero image as returned to any caller, admin or public. */
export interface HeroImageDto {
  id: string;
  /** Absolute, permanently addressable URL — a public-read S3 object or its CDN alias. */
  url: string;
  /** Alt text. Empty string means intentionally decorative. */
  alt: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  createdAt: string;
}

/** Step 1 of an upload: ask the API to authorise one file. */
export interface PresignHeroImageRequest {
  /** Original filename, used only to validate the extension. */
  filename: string;
  contentType: string;
  sizeBytes: number;
}

/**
 * Step 2: the browser POSTs `fields` plus the file to `url` as multipart/form-data,
 * uploading straight to S3 without the bytes passing through the API.
 */
export interface PresignHeroImageResponse {
  url: string;
  fields: Record<string, string>;
  /** Opaque object key to hand back on commit. */
  key: string;
  expiresInSeconds: number;
}

/** Step 3: tell the API the upload landed, so it can verify the object and record it. */
export interface CommitHeroImageRequest {
  key: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface AdminSessionStatus {
  authenticated: boolean;
}
