import {
  PAGE_SECTIONS,
  type BreadcrumbDto,
  type NavTreeDto,
  type PageSection,
} from '@compro/types';

export const SECTION_LABELS: Record<PageSection, string> = {
  products: 'Products',
  services: 'Services',
  solutions: 'Solutions',
};

export function pageHref(section: string, slug: string): string {
  return `/${section}/${slug}`;
}

export interface NavPageRow {
  section: string;
  slug: string;
  title: string;
  navLabel: string | null;
  sortOrder: number;
  group: { title: string; sortOrder: number } | null;
}

/**
 * The menu is a view of pages, not a list of its own: published top-level pages grouped
 * by their NavGroup, groups ordered by `sortOrder`, pages within a group likewise.
 * Ties fall back to the title so the order is stable across requests.
 */
export function buildNavTree(rows: NavPageRow[]): NavTreeDto {
  const tree: NavTreeDto = { products: [], services: [], solutions: [] };

  const byGroup = new Map<string, NavPageRow[]>();
  for (const row of rows) {
    if (!row.group || !PAGE_SECTIONS.includes(row.section as PageSection)) continue;
    const key = `${row.section}\u0000${row.group.title}`;
    byGroup.set(key, [...(byGroup.get(key) ?? []), row]);
  }

  const sections = PAGE_SECTIONS.map((section) => ({
    section,
    groups: [...byGroup.values()].filter((pages) => pages[0].section === section),
  }));

  for (const { section, groups } of sections) {
    groups.sort(
      (a, b) =>
        a[0].group!.sortOrder - b[0].group!.sortOrder ||
        a[0].group!.title.localeCompare(b[0].group!.title),
    );
    tree[section] = groups.map((pages) => ({
      title: pages[0].group!.title,
      items: [...pages]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
        .map((page) => ({
          label: page.navLabel ?? page.title,
          href: pageHref(page.section, page.slug),
        })),
    }));
  }
  return tree;
}

export interface BreadcrumbPage {
  section: string;
  slug: string;
  title: string;
  group: { title: string } | null;
}

/**
 * `ancestors` runs from the page's direct parent up to the top-level page. Menu groups
 * have no page of their own, so they appear as a label without a link.
 *
 * AC Power Source -> Power Electronic Test and Equipment -> Chroma -> Products
 */
export function buildBreadcrumbs(
  page: BreadcrumbPage,
  ancestors: BreadcrumbPage[],
): BreadcrumbDto[] {
  const section = page.section as PageSection;
  const trail = [...ancestors].reverse();
  const top = trail[0] ?? page;
  const crumbs: BreadcrumbDto[] = [
    { label: 'Home', href: '/' },
    { label: SECTION_LABELS[section] ?? page.section, href: `/${page.section}` },
  ];
  if (top.group) crumbs.push({ label: top.group.title });
  for (const ancestor of trail) {
    crumbs.push({ label: ancestor.title, href: pageHref(ancestor.section, ancestor.slug) });
  }
  crumbs.push({ label: page.title });
  return crumbs;
}
