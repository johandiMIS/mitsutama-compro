import type { NavTreeDto } from "@compro/types";
import { buildNavLinks, type NavLinkItem } from "@/components/nav/nav-links";
import { fetchPublic } from "./public-api";

/** Server-only. The header menu from published pages, or the bundled menu if the API is down. */
export async function getNavLinks(): Promise<NavLinkItem[]> {
  const result = await fetchPublic<NavTreeDto>("/nav", ["nav"]);
  return buildNavLinks(result.status === "ok" ? result.data : null);
}
