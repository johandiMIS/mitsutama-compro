import { buildBreadcrumbs, buildNavTree, type NavPageRow } from './page-tree';

const row = (over: Partial<NavPageRow> & Pick<NavPageRow, 'slug' | 'title'>): NavPageRow => ({
  section: 'products',
  navLabel: null,
  sortOrder: 0,
  group: { title: 'Chroma', sortOrder: 0 },
  ...over,
});

describe('buildNavTree', () => {
  it('groups pages per section and orders groups then pages', () => {
    const tree = buildNavTree([
      row({ slug: 'b', title: 'B', sortOrder: 2 }),
      row({ slug: 'a', title: 'A', sortOrder: 1 }),
      row({ slug: 'g', title: 'G', group: { title: 'GRAS', sortOrder: 5 } }),
      row({ slug: 'i', title: 'I', group: { title: 'IMC', sortOrder: 1 } }),
      row({
        section: 'services',
        slug: 'cal',
        title: 'Cal',
        group: { title: 'Calibration', sortOrder: 0 },
      }),
    ]);

    expect(tree.products.map((g) => g.title)).toEqual(['Chroma', 'IMC', 'GRAS']);
    expect(tree.products[0].items.map((i) => i.href)).toEqual(['/products/a', '/products/b']);
    expect(tree.services[0]).toEqual({
      title: 'Calibration',
      items: [{ label: 'Cal', href: '/services/cal' }],
    });
    expect(tree.solutions).toEqual([]);
  });

  it('prefers navLabel over title', () => {
    const tree = buildNavTree([row({ slug: 'x', title: 'Long title here', navLabel: 'Short' })]);
    expect(tree.products[0].items[0].label).toBe('Short');
  });

  it('ignores pages without a group', () => {
    expect(buildNavTree([row({ slug: 'x', title: 'X', group: null })]).products).toEqual([]);
  });

  it('keeps same-titled groups in different sections apart', () => {
    const tree = buildNavTree([
      row({ slug: 'a', title: 'A', group: { title: 'Shared', sortOrder: 0 } }),
      row({ section: 'services', slug: 'b', title: 'B', group: { title: 'Shared', sortOrder: 0 } }),
    ]);
    expect(tree.products[0].items).toHaveLength(1);
    expect(tree.services[0].items).toHaveLength(1);
  });
});

describe('buildBreadcrumbs', () => {
  const category = {
    section: 'products',
    slug: 'power-electronic-test-and-equipment',
    title: 'Power Electronic Test and Equipment',
    group: { title: 'Chroma' },
  };

  it('top-level page: Home > Section > Group > Page', () => {
    expect(buildBreadcrumbs(category, [])).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Chroma' },
      { label: 'Power Electronic Test and Equipment' },
    ]);
  });

  it('child page: includes the group of the top-level ancestor and links ancestors', () => {
    const product = {
      section: 'products',
      slug: 'ac-power-source',
      title: 'AC Power Source',
      group: null,
    };
    expect(buildBreadcrumbs(product, [category])).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Chroma' },
      { label: category.title, href: `/products/${category.slug}` },
      { label: 'AC Power Source' },
    ]);
  });

  it('three levels: ancestors are listed top-down', () => {
    const mid = { section: 'products', slug: 'mid', title: 'Mid', group: null };
    const leaf = { section: 'products', slug: 'leaf', title: 'Leaf', group: null };
    const labels = buildBreadcrumbs(leaf, [mid, category]).map((c) => c.label);
    expect(labels).toEqual([
      'Home',
      'Products',
      'Chroma',
      category.title,
      'Mid',
      'Leaf',
    ]);
  });
});
