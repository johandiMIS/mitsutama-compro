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

import { z } from 'zod';

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

// ---------------------------------------------------------------------------
// Content pages — /products, /services, /solutions. See docs/content-builder-plan.md.
// ---------------------------------------------------------------------------

export const PAGE_SECTIONS = ['products', 'services', 'solutions'] as const;
export type PageSection = (typeof PAGE_SECTIONS)[number];

/** Hard cap on one stored document, so a pasted blob can't bloat a row. */
export const PAGE_DOCUMENT_MAX_BYTES = 512 * 1024;

/** URL segment: lowercase words joined by single hyphens. */
export const PageSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, digits and single hyphens only');

/**
 * Certification badges. The JSON names one; the logo itself ships with the site
 * (`apps/web/public/badges/<id>.svg`), so content can never supply a badge image URL.
 */
export const BADGE_IDS = ['ce', 'rohs2', 'taiwan-excellence'] as const;
export type BadgeId = (typeof BADGE_IDS)[number];

/** Relative path (`/about`, `/products/x#y`) or absolute https. Rejects `javascript:` etc. */
export const LinkSchema = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) ||
      /^https:\/\/[^\s]+$/i.test(value),
    'must be a relative path starting with "/" or an https:// URL',
  );

/**
 * Images must be https. Which host is allowed depends on deployment config, so the API
 * adds that check on top; the shape is enforced here.
 */
export const ImageSchema = z.strictObject({
  url: z
    .string()
    .max(2048)
    .regex(/^https:\/\/[^\s]+$/i, 'must be an https:// URL'),
  alt: z.string().max(300).default(''),
});
export type PageImage = z.infer<typeof ImageSchema>;

const text = (max: number) => z.string().max(max);
const idField = { id: z.string().max(100).optional() };
const SideSchema = z.enum(['left', 'right']).default('right');

export const ProductIntroSchema = z.strictObject({
  ...idField,
  tagline: text(80).default(''),
  title: text(160),
  paragraphs: z.array(text(2000)).max(10).default([]),
  image: ImageSchema.optional(),
  imageSide: SideSchema,
});

export const ProductCardSchema = z.strictObject({
  name: text(160),
  model: text(80).optional(),
  image: ImageSchema.optional(),
  badges: z.array(z.enum(BADGE_IDS)).max(6).default([]),
  bullets: z.array(text(300)).max(12).default([]),
  href: LinkSchema.optional(),
});

export const ProductCategorySchema = z.strictObject({
  name: text(120),
  products: z.array(ProductCardSchema).max(60).default([]),
});

export const CategorizedProductsSchema = z.strictObject({
  ...idField,
  tagline: text(80).default(''),
  title: text(160),
  intro: text(1000).default(''),
  categories: z.array(ProductCategorySchema).min(1).max(30),
});

export const SectionHeadingSchema = z.strictObject({
  ...idField,
  tagline: text(80).default(''),
  title: text(160),
  intro: text(1000).default(''),
});

export const RichTextSchema = z.strictObject({
  ...idField,
  /** Markdown subset: paragraphs, `-` lists, **bold**, *italic*, [text](link). No HTML. */
  body: text(20000),
});

export const TextImageSchema = z.strictObject({
  ...idField,
  title: text(160).default(''),
  body: text(10000),
  image: ImageSchema,
  imageSide: SideSchema,
});

export const SpecTableSchema = z.strictObject({
  ...idField,
  title: text(160).default(''),
  rows: z
    .array(z.strictObject({ label: text(160), value: text(500) }))
    .min(1)
    .max(100),
});

export const FeatureGridSchema = z.strictObject({
  ...idField,
  items: z
    .array(z.strictObject({ title: text(120), text: text(600) }))
    .min(1)
    .max(24),
});

export const ContactCtaSchema = z.strictObject({ ...idField });

/** Block type name -> props schema. The single source of truth for what a page may contain. */
export const BLOCK_SCHEMAS = {
  ProductIntro: ProductIntroSchema,
  CategorizedProducts: CategorizedProductsSchema,
  SectionHeading: SectionHeadingSchema,
  RichText: RichTextSchema,
  TextImage: TextImageSchema,
  SpecTable: SpecTableSchema,
  FeatureGrid: FeatureGridSchema,
  ContactCta: ContactCtaSchema,
} as const;
export type BlockType = keyof typeof BLOCK_SCHEMAS;
export const BLOCK_TYPES = Object.keys(BLOCK_SCHEMAS) as BlockType[];

const blockEntry = <K extends BlockType>(type: K) =>
  z.strictObject({ type: z.literal(type), props: BLOCK_SCHEMAS[type] });

export const PageBlockSchema = z.discriminatedUnion('type', [
  blockEntry('ProductIntro'),
  blockEntry('CategorizedProducts'),
  blockEntry('SectionHeading'),
  blockEntry('RichText'),
  blockEntry('TextImage'),
  blockEntry('SpecTable'),
  blockEntry('FeatureGrid'),
  blockEntry('ContactCta'),
]);

/** A Puck document: what the editor saves and what an AI writes. */
export const PageDocumentSchema = z.strictObject({
  root: z.looseObject({ props: z.record(z.string(), z.unknown()).optional() }).default({}),
  content: z.array(PageBlockSchema).max(100),
});
export type PageDocument = z.infer<typeof PageDocumentSchema>;
export type PageBlock = z.infer<typeof PageBlockSchema>;

export const EMPTY_PAGE_DOCUMENT: PageDocument = { root: { props: {} }, content: [] };

export interface BreadcrumbDto {
  label: string;
  /** Absent for the current page and for menu groups, which have no page of their own. */
  href?: string;
}

/** A published page as the public site renders it. */
export interface PublicPageDto {
  id: string;
  section: PageSection;
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  breadcrumbs: BreadcrumbDto[];
  data: PageDocument;
}

export interface NavItemDto {
  label: string;
  href: string;
}
export interface NavGroupDto {
  title: string;
  items: NavItemDto[];
}
/** The header/footer menu: published, in-menu pages grouped per section. */
export type NavTreeDto = Record<PageSection, NavGroupDto[]>;

export type PageStatus = 'draft' | 'published';

export interface AdminPageDto {
  id: string;
  section: PageSection;
  slug: string;
  title: string;
  navLabel: string | null;
  groupId: string | null;
  groupTitle: string | null;
  parentId: string | null;
  /** For a child page: the group (tab) it is listed under on its parent. */
  productGroup: string | null;
  sortOrder: number;
  showInNav: boolean;
  status: PageStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  /** True when the draft differs from what is live. */
  hasUnpublishedChanges: boolean;
  draftData: PageDocument | null;
  childCount: number;
}

/**
 * The envelope an AI (or `POST /admin/pages/import`) uses. Re-importing the same
 * `section` + `slug` replaces that page's draft; it never publishes.
 */
export interface ImportPageRequest {
  section: PageSection;
  slug: string;
  title: string;
  /** Slug of the parent page in the same section, for a child page. */
  parent?: string;
  /** Menu group title, for a top-level page. Must already exist. */
  group?: string;
  /** Product group (tab) on the parent page this child is listed under. */
  productGroup?: string;
  navLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
  data: unknown;
}

export interface PageValidationIssue {
  path: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Admin: menu groups and content media.
// ---------------------------------------------------------------------------

/** A menu column ("Chroma", "Calibration"). Pages belong to one through `groupId`. */
export interface AdminNavGroupDto {
  id: string;
  section: PageSection;
  title: string;
  sortOrder: number;
  pageCount: number;
}

/**
 * Content images are WebP only, like hero images, and uploaded browser-direct to S3 under
 * the `media/` prefix — the only place a page's image URL may point (see the API validator).
 * Presign/commit reuse the hero image request/response shapes.
 */
export const MEDIA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export interface MediaImageDto {
  /** Absolute URL to store in a block's `image.url`. */
  url: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
}
