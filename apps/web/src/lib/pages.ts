import type { PageSection, PublicPageDto } from "@compro/types";
import { fetchPublic, type PublicFetchResult } from "./public-api";

/** Server-only. A published page, `not-found` if it doesn't exist, `unavailable` if the API is down. */
export function getPublishedPage(
  section: PageSection,
  slug: string,
): Promise<PublicFetchResult<PublicPageDto>> {
  return fetchPublic<PublicPageDto>(`/pages/${section}/${encodeURIComponent(slug)}`, [
    `page:${section}/${slug}`,
  ]);
}
