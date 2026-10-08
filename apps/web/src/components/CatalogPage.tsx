import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageHero, type Breadcrumb } from "@/components/PageHero";
import { findCatalogEntry, type CatalogSection } from "@/components/nav/nav-links";

const SECTION_LABELS: Record<CatalogSection, string> = {
  products: "Products",
  services: "Services",
  solutions: "Solutions",
};

/** "ac-power-source" -> "Ac Power Source". Only for slugs that aren't in the menu. */
function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveDetail(section: CatalogSection, slug: string) {
  const entry = findCatalogEntry(section, slug);
  const title = entry?.item.label ?? titleFromSlug(slug);
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "/" },
    { label: SECTION_LABELS[section], href: `/${section}` },
    // The menu group (e.g. Chroma, Calibration) has no page of its own yet.
    ...(entry ? [{ label: entry.group.title }] : []),
    { label: title },
  ];
  return { title, breadcrumbs };
}

function CatalogShell({ title, breadcrumbs }: { title: string; breadcrumbs: Breadcrumb[] }) {
  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <PageHero title={title} breadcrumbs={breadcrumbs} />
      {/* Content intentionally empty for now — page bodies come later (content builder). */}
      <section aria-label={`${title} content`} className="min-h-[40vh] w-full" />
      <ContactCta />
    </div>
  );
}

/** /<section> — placeholder index. */
export function CatalogIndexPage({ section }: { section: CatalogSection }) {
  const label = SECTION_LABELS[section];
  return (
    <CatalogShell title={label} breadcrumbs={[{ label: "Home", href: "/" }, { label }]} />
  );
}

/** /<section>/<slug> — placeholder body, used by the page route only while the API is unreachable. */
export function CatalogDetailPage({ section, slug }: { section: CatalogSection; slug: string }) {
  return <CatalogShell {...resolveDetail(section, slug)} />;
}

export function catalogIndexMetadata(section: CatalogSection): Metadata {
  return { title: `${SECTION_LABELS[section]} | Mitsutama Indo Teknik` };
}

export function catalogDetailMetadata(section: CatalogSection, slug: string): Metadata {
  const { title } = resolveDetail(section, slug);
  return { title: `${title} | ${SECTION_LABELS[section]} | Mitsutama Indo Teknik` };
}
