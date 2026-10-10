import {
  PAGE_SECTIONS,
  type PageDocument,
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

export interface ChildProductSource {
  slug: string;
  title: string;
  productGroup: string | null;
  sortOrder: number;
  /** The child's published document. */
  data: PageDocument;
}

/** Group name for children that have none set. */
export const DEFAULT_PRODUCT_GROUP = 'Other products';

const MAX_CARD_BULLETS = 4;
const LINE_BREAK = new RegExp('\\r?\\n');

/** A listing card derived from a child's own content: its intro image and key-feature list. */
function cardFrom(child: ChildProductSource, href: string) {
  const intro = child.data.content.find((block) => block.type === 'ProductIntro');
  const rich = child.data.content.find((block) => block.type === 'RichText');
  const image = intro?.type === 'ProductIntro' ? intro.props.image : undefined;
  const listed =
    rich?.type === 'RichText'
      ? rich.props.body
          .split(LINE_BREAK)
          .filter((line) => line.startsWith('- '))
          .map((line) => line.slice(2).trim())
          .slice(0, MAX_CARD_BULLETS)
      : [];
  const firstParagraph = intro?.type === 'ProductIntro' ? (intro.props.paragraphs[0] ?? '') : '';
  return {
    name: child.title,
    ...(image ? { image } : {}),
    badges: [] as never[],
    bullets: listed.length > 0 ? listed : firstParagraph ? [firstParagraph.slice(0, 290)] : [],
    href,
  };
}

/**
 * Adds a parent's published child pages to its "Categorised products" block, each under the
 * category named by the child's product group (created if the parent has no such category).
 * A card already present by name or link is left alone, so hand-made cards win.
 * Returns the document untouched when the parent has no such block or no children.
 */
export function mergeChildProducts(
  document: PageDocument,
  section: string,
  parentSlug: string,
  children: ChildProductSource[],
): PageDocument {
  if (children.length === 0) return document;
  const index = document.content.findIndex((block) => block.type === 'CategorizedProducts');
  if (index === -1) return document;
  const block = document.content[index];
  if (block.type !== 'CategorizedProducts') return document;

  const categories = block.props.categories.map((category) => ({
    ...category,
    products: [...category.products],
  }));
  const ordered = [...children].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  for (const child of ordered) {
    const wanted = (child.productGroup?.trim() || DEFAULT_PRODUCT_GROUP).toLowerCase();
    let category = categories.find((c) => c.name.trim().toLowerCase() === wanted);
    if (!category) {
      category = { name: child.productGroup?.trim() || DEFAULT_PRODUCT_GROUP, products: [] };
      categories.push(category);
    }
    const href = `/${section}/${parentSlug}/${child.slug}`;
    if (category.products.some((p) => p.href === href || p.name === child.title)) continue;
    category.products.push(cardFrom(child, href));
  }

  const content = [...document.content];
  content[index] = { ...block, props: { ...block.props, categories } };
  return { ...document, content };
}
