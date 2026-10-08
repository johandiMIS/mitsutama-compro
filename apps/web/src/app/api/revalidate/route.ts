import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/** Tags the API may invalidate: the menu, and one page by `section/slug`. */
const ALLOWED_TAG = /^(nav|page:(products|services|solutions)\/[a-z0-9-]+)$/;

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Called by apps/api after publish/unpublish so cached pages and the menu update at once.
 * Fails closed: with REVALIDATE_SECRET unset nothing is accepted.
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !secretMatches(request.headers.get("x-revalidate-secret"), expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags : [];
  const valid = tags.filter((tag): tag is string => typeof tag === "string" && ALLOWED_TAG.test(tag));
  if (valid.length === 0 || valid.length !== tags.length) {
    return Response.json({ error: "invalid tags" }, { status: 400 });
  }

  // 'max' = stale-while-revalidate, the Next 16 two-argument form.
  for (const tag of valid) revalidateTag(tag, "max");
  return Response.json({ revalidated: valid });
}
