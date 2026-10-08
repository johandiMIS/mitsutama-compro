import { randomUUID } from 'node:crypto';
import {
  PAGE_DOCUMENT_MAX_BYTES,
  PageDocumentSchema,
  type PageDocument,
  type PageValidationIssue,
} from '@compro/types';

export type ValidationResult =
  | { ok: true; data: PageDocument }
  | { ok: false; issues: PageValidationIssue[] };

/** `["content", 3, "props", "name"]` -> `content[3].props.name`. */
export function formatPath(path: readonly PropertyKey[]): string {
  let out = '';
  for (const segment of path) {
    if (typeof segment === 'number') out += `[${segment}]`;
    else out += out ? `.${String(segment)}` : String(segment);
  }
  return out || '(document)';
}

/** Every `image.url` in the document, with its path — so each can be host-checked. */
function collectImageUrls(
  node: unknown,
  path: PropertyKey[] = [],
  out: { path: string; url: string }[] = [],
): { path: string; url: string }[] {
  if (Array.isArray(node)) {
    node.forEach((item, index) => collectImageUrls(item, [...path, index], out));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (
        key === 'image' &&
        value &&
        typeof value === 'object' &&
        typeof (value as { url?: unknown }).url === 'string'
      ) {
        out.push({
          path: formatPath([...path, key, 'url']),
          url: (value as { url: string }).url,
        });
      } else {
        collectImageUrls(value, [...path, key], out);
      }
    }
  }
  return out;
}

/**
 * Validates an untrusted page document (AI output or editor save). Never throws; returns
 * every problem with its path so the caller can show them all at once.
 *
 * `allowedImagePrefix` is the only place content images may come from (our S3/CDN media
 * folder). Pass undefined to skip the host check, e.g. when storage isn't configured.
 */
export function validatePageDocument(
  input: unknown,
  allowedImagePrefix?: string,
): ValidationResult {
  let serialised: string;
  try {
    serialised = JSON.stringify(input) ?? '';
  } catch {
    return { ok: false, issues: [{ path: '(document)', message: 'not valid JSON' }] };
  }
  if (Buffer.byteLength(serialised, 'utf8') > PAGE_DOCUMENT_MAX_BYTES) {
    return {
      ok: false,
      issues: [
        {
          path: '(document)',
          message: `larger than ${PAGE_DOCUMENT_MAX_BYTES / 1024} KB`,
        },
      ],
    };
  }

  const parsed = PageDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        path: formatPath(issue.path),
        message: issue.message,
      })),
    };
  }

  if (allowedImagePrefix) {
    const issues = collectImageUrls(parsed.data)
      .filter(({ url }) => !url.startsWith(allowedImagePrefix))
      .map(({ path }) => ({
        path,
        message: `images must be uploaded to this site (${allowedImagePrefix}…)`,
      }));
    if (issues.length > 0) return { ok: false, issues };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Puck keys every block by `props.id` (for drag-and-drop and the outline) and the renderer
 * uses it as the section's DOM id. Documents written by hand or by an AI have none, so
 * give each block a stable one at import. Existing ids are kept.
 */
export function withBlockIds(document: PageDocument): PageDocument {
  return {
    ...document,
    content: document.content.map((block) =>
      block.props.id
        ? block
        : { ...block, props: { ...block.props, id: `${block.type}-${randomUUID()}` } },
    ) as PageDocument['content'],
  };
}
