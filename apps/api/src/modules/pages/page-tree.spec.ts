import { buildBreadcrumbs, buildNavTree, type NavPageRow, mergeChildProducts, type ChildProductSource } from './page-tree';
import type { PageDocument } from '@compro/types';

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

describe('mergeChildProducts', () => {
  const card = (name: string, href?: string) => ({ name, badges: [], bullets: [], ...(href ? { href } : {}) });
  const landing = (categories: { name: string; products: ReturnType<typeof card>[] }[]) =>
    ({
      root: { props: {} },
      content: [{ type: 'CategorizedProducts', props: { title: 'T', tagline: '', intro: '', categories } }],
    }) as unknown as PageDocument;
  const child = (slug: string, title: string, productGroup: string | null, sortOrder = 0): ChildProductSource => ({
    slug,
    title,
    productGroup,
    sortOrder,
    data: {
      root: { props: {} },
      content: [
        {
          type: 'ProductIntro',
          props: { tagline: '', title, paragraphs: ['Intro text.'], imageSide: 'right', image: { url: 'https://h/media/a.webp', alt: '' } },
        },
        { type: 'RichText', props: { body: '- one\n- two\n- three\n- four\n- five' } },
      ],
    } as unknown as PageDocument,
  });
  const products = (doc: PageDocument, name: string) => {
    const block = doc.content[0];
    if (block.type !== 'CategorizedProducts') throw new Error('wrong block');
    return block.props.categories.find((c) => c.name === name)?.products ?? [];
  };

  it('lists a published child under its group, keeping hand-made cards', () => {
    const doc = landing([{ name: 'AC Power Source', products: [card('Regenerative Grid Simulator')] }]);
    const merged = mergeChildProducts(doc, 'products', 'power', [child('ac-61500', 'AC 61500', 'ac power source')]);
    const list = products(merged, 'AC Power Source');
    expect(list.map((p) => p.name)).toEqual(['Regenerative Grid Simulator', 'AC 61500']);
    expect(list[1]).toMatchObject({
      href: '/products/power/ac-61500',
      image: { url: 'https://h/media/a.webp' },
      bullets: ['one', 'two', 'three', 'four'],
    });
  });

  it('creates a group the parent does not have, and uses "Other products" when none is set', () => {
    const merged = mergeChildProducts(landing([{ name: 'A', products: [] }]), 'products', 'power', [
      child('x', 'X', 'Brand new group'),
      child('y', 'Y', null),
    ]);
    expect(products(merged, 'Brand new group').map((p) => p.name)).toEqual(['X']);
    expect(products(merged, 'Other products').map((p) => p.name)).toEqual(['Y']);
  });

  it('does not duplicate a card already linked or named, and does not mutate its input', () => {
    const doc = landing([{ name: 'A', products: [card('Same name'), card('Other', '/products/power/z')] }]);
    const before = JSON.stringify(doc);
    const merged = mergeChildProducts(doc, 'products', 'power', [child('q', 'Same name', 'A'), child('z', 'Z', 'A')]);
    expect(products(merged, 'A')).toHaveLength(2);
    expect(JSON.stringify(doc)).toBe(before);
  });

  it('returns the document as is without children or without a products block', () => {
    const doc = landing([{ name: 'A', products: [] }]);
    expect(mergeChildProducts(doc, 'products', 'p', [])).toBe(doc);
    const plain = { root: { props: {} }, content: [] } as unknown as PageDocument;
    expect(mergeChildProducts(plain, 'products', 'p', [child('x', 'X', 'A')])).toBe(plain);
  });
});
