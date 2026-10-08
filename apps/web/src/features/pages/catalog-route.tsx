import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Render, type Config } from "@puckeditor/core";
import type { NavTreeDto } from "@compro/types";
import { CatalogDetailPage, catalogDetailMetadata } from "@/components/CatalogPage";
import { ContactCta } from "@/components/ContactCta";
import { buildNavLinks, findCatalogEntry, type CatalogSection } from "@/components/nav/nav-links";
import { PageHero } from "@/components/PageHero";
import { getPublishedPage } from "@/lib/pages";
import { fetchPublic } from "@/lib/public-api";
import { pageConfig } from "./config";

const SECTION_LABELS: Record<CatalogSection, string> = {
  products: "Products",
  services: "Services",
  solutions: "Solutions",
};

/**
 * /<section>/<slug>. Renders the published page from the API.
 *
 * - API says 404  -> a real 404 (the page does not exist or is unpublished).
 * - API is down   -> the bundled placeholder for slugs in the static menu, so the site keeps
 *                    working (and `next build` succeeds) without the API; other slugs 404.
 */
export async function CatalogRoute({ section, slug }: { section: CatalogSection; slug: string }) {
  const result = await getPublishedPage(section, slug);

  if (result.status === "ok") {
    const page = result.data;
    return (
      <div className="flex flex-1 flex-col items-center bg-background">
        <PageHero title={page.title} breadcrumbs={page.breadcrumbs} />
        <div className="w-full">
          {/* The config is typed per block; Render takes the untyped shape, and the data was
              validated against the same schemas by the API. */}
          <Render config={pageConfig as unknown as Config} data={page.data} />
        </div>
        <ContactCta />
      </div>
    );
  }

  if (result.status === "unavailable" && findCatalogEntry(section, slug)) {
    return <CatalogDetailPage section={section} slug={slug} />;
  }
  notFound();
}

export async function catalogRouteMetadata(
  section: CatalogSection,
  slug: string,
): Promise<Metadata> {
  const result = await getPublishedPage(section, slug);
  if (result.status === "ok") {
    const { title, seoTitle, seoDescription } = result.data;
    return {
      title: seoTitle ?? `${title} | ${SECTION_LABELS[section]} | Mitsutama Indo Teknik`,
      ...(seoDescription ? { description: seoDescription } : {}),
    };
  }
  return result.status === "unavailable" && findCatalogEntry(section, slug)
    ? catalogDetailMetadata(section, slug)
    : {};
}

/**
 * Pre-renders the pages the menu lists. Reads the same `/nav` the header does (so it follows
 * the database), falling back to the bundled menu. Pages not listed render on first request.
 */
export async function catalogRouteStaticParams(
  section: CatalogSection,
): Promise<{ slug: string }[]> {
  const nav = await fetchPublic<NavTreeDto>("/nav", ["nav"]);
  const links = buildNavLinks(nav.status === "ok" ? nav.data : null);
  const link = links.find((entry) => entry.dropdown && entry.href === `/${section}`);
  if (!link?.dropdown) return [];
  const slugs = link.groups.flatMap((group) =>
    group.items.map((item) => item.href.slice(`/${section}/`.length)),
  );
  return [...new Set(slugs)].map((slug) => ({ slug }));
}
