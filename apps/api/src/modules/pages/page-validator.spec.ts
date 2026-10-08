import { formatPath, validatePageDocument, withBlockIds } from './page-validator';

const MEDIA = 'https://cdn.example.com/media/';

const intro = {
  type: 'ProductIntro',
  props: { title: 'AC Power Source', paragraphs: ['Hello'] },
};

const doc = (...content: unknown[]) => ({ root: { props: {} }, content });

function issuesOf(input: unknown, prefix: string | undefined = MEDIA) {
  const result = validatePageDocument(input, prefix);
  if (result.ok) throw new Error('expected validation to fail');
  return result.issues;
}

describe('validatePageDocument', () => {
  it('accepts a minimal valid document and fills defaults', () => {
    const result = validatePageDocument(doc(intro), MEDIA);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.content[0]).toMatchObject({
        type: 'ProductIntro',
        props: { tagline: '', imageSide: 'right' },
      });
    }
  });

  it('accepts an empty page', () => {
    expect(validatePageDocument(doc(), MEDIA).ok).toBe(true);
  });

  it('accepts the id Puck adds to every block', () => {
    const withId = { type: 'ContactCta', props: { id: 'ContactCta-1' } };
    expect(validatePageDocument(doc(withId), MEDIA).ok).toBe(true);
  });

  it('rejects an unknown block type', () => {
    const issues = issuesOf(doc({ type: 'Script', props: {} }));
    expect(issues[0].path).toBe('content[0].type');
  });

  it('reports a missing required prop with its full path', () => {
    const bad = {
      type: 'CategorizedProducts',
      props: {
        title: 'Tailored',
        categories: [{ name: 'AC', products: [{ name: 'a' }, { model: 'x' }] }],
      },
    };
    const issues = issuesOf(doc(intro, bad));
    expect(issues.map((i) => i.path)).toContain(
      'content[1].props.categories[0].products[1].name',
    );
  });

  it('rejects unknown props rather than silently dropping them', () => {
    const issues = issuesOf(
      doc({ type: 'SectionHeading', props: { title: 'x', html: '<b>' } }),
    );
    expect(issues[0].path).toBe('content[0].props');
  });

  it('rejects an unknown badge, so content cannot name its own badge asset', () => {
    const card = { name: 'a', badges: ['https://evil.test/x.png'] };
    const block = {
      type: 'CategorizedProducts',
      props: { title: 't', categories: [{ name: 'c', products: [card] }] },
    };
    expect(issuesOf(doc(block))[0].path).toContain('badges[0]');
  });

  describe('images', () => {
    const withImage = (url: string) =>
      doc({
        type: 'TextImage',
        props: { body: 'x', image: { url, alt: '' } },
      });

    it('accepts an image under the media prefix', () => {
      expect(validatePageDocument(withImage(`${MEDIA}a.webp`), MEDIA).ok).toBe(true);
    });

    it('rejects a foreign host', () => {
      const issues = issuesOf(withImage('https://evil.test/media/a.webp'));
      expect(issues[0].path).toBe('content[0].props.image.url');
    });

    it('rejects a lookalike host that merely starts with the same text', () => {
      expect(
        validatePageDocument(withImage('https://cdn.example.com.evil.test/media/a'), MEDIA).ok,
      ).toBe(false);
    });

    it('rejects non-https', () => {
      expect(issuesOf(withImage('http://cdn.example.com/media/a.webp')).length).toBeGreaterThan(0);
    });

    it('skips the host check when no prefix is given', () => {
      expect(
        validatePageDocument(withImage('https://anything.test/a.webp'), undefined).ok,
      ).toBe(true);
    });
  });

  describe('links', () => {
    const withHref = (href: string) =>
      doc({
        type: 'CategorizedProducts',
        props: {
          title: 't',
          categories: [{ name: 'c', products: [{ name: 'p', href }] }],
        },
      });

    it.each(['/products/x', '/products/x#y', 'https://example.com/a'])('accepts %s', (href) => {
      expect(validatePageDocument(withHref(href), MEDIA).ok).toBe(true);
    });

    it.each([
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'data:text/html,x',
      '//evil.test/x',
      'http://example.com',
      'products/x',
    ])('rejects %s', (href) => {
      expect(validatePageDocument(withHref(href), MEDIA).ok).toBe(false);
    });
  });

  it('rejects a document over the size cap', () => {
    const big = doc({ type: 'RichText', props: { body: 'x'.repeat(20000) } });
    const content = Array.from({ length: 30 }, () => big.content[0]);
    const issues = issuesOf({ root: {}, content });
    expect(issues[0].message).toMatch(/larger than/);
  });

  it('rejects a non-object', () => {
    expect(validatePageDocument('nope', MEDIA).ok).toBe(false);
    expect(validatePageDocument(null, MEDIA).ok).toBe(false);
  });
});

describe('formatPath', () => {
  it('joins keys and indexes', () => {
    expect(formatPath(['content', 3, 'props', 'name'])).toBe('content[3].props.name');
  });
});

describe('withBlockIds', () => {
  it('adds ids to blocks that lack one and keeps existing ones', () => {
    const parsed = validatePageDocument(
      {
        root: {},
        content: [
          { type: 'ContactCta', props: {} },
          { type: 'ContactCta', props: { id: 'keep-me' } },
        ],
      },
      undefined,
    );
    if (!parsed.ok) throw new Error('expected valid');
    const [a, b] = withBlockIds(parsed.data).content;
    expect(a.props.id).toMatch(/^ContactCta-/);
    expect(b.props.id).toBe('keep-me');
  });
});
