// Regenerates docs/content/content-status.md from the database (no admin login needed).
//   node docs/content/generate-content-status.mjs
// Needs the Postgres in apps/api/.env to be reachable; the API does not have to be running.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../apps/api/package.json'));
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SECTIONS = [['products', 'Products'], ['services', 'Services'], ['solutions', 'Solutions']];
const STATUSES = ['Not started', 'Need content', 'In progress', 'Ready for publish', 'Done'];

const blocksOf = (page) => (Array.isArray(page.draftData?.content) ? page.draftData.content.length : 0);

/** The legend in content-status.md. "Ready for publish" is set by hand, so it is never produced here. */
function statusOf(page, childCount) {
  const blocks = blocksOf(page);
  const published = page.status === 'published' && page.publishedData != null;
  const changed = published && JSON.stringify(page.draftData) !== JSON.stringify(page.publishedData);
  if (published && blocks > 0 && !changed) return 'Done';
  if (blocks === 0) return childCount > 0 ? 'Need content' : 'Not started';
  return 'In progress';
}

const pages = await prisma.page.findMany({ include: { group: true } });
const groups = await prisma.navGroup.findMany({ orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }] });
const kids = new Map();
for (const p of pages) if (p.parentId) kids.set(p.parentId, [...(kids.get(p.parentId) ?? []), p]);
const order = (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);

const esc = (s) => s.replace(/\|/g, '\\|');
const row = (p, nested, children) =>
  `| ${nested ? '&nbsp;&nbsp;↳ ' : ''}${esc(p.navLabel || p.title)} | \`${p.slug}\` | ${p.productGroup ?? '–'} | ${statusOf(p, children)} | ${blocksOf(p)} | ${nested ? '–' : children} |`;

const tally = {};
const out = [];
out.push(
  '# Content status',
  '',
  `Generated from the database by \`docs/content/generate-content-status.mjs\` on ${new Date().toISOString().slice(0, 10)}. Rows are the header-menu entries, with pages nested under them (grouped by product group).`,
  '',
  '| Status | Meaning |',
  '|---|---|',
  '| Not started | Menu entry exists, page body is the empty placeholder |',
  '| Need content | Page body is empty but child pages exist; it needs a landing body listing them |',
  '| In progress | Draft has content (imported or edited) but is not published, or has edits that are not published yet |',
  '| Ready for publish | Reviewed draft, set by hand after review (nothing is set automatically) |',
  '| Done | Published with content and no unpublished changes |',
  '',
  'On a landing page the product cards come from its published child pages, so its block count does not include them.',
);
for (const [section, label] of SECTIONS) {
  tally[section] = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  out.push('', `## ${label}`);
  for (const group of groups.filter((g) => g.section === section)) {
    out.push('', `### ${group.title}`, '', '| Menu item | Slug | Product group | Status | Blocks | Child pages |', '|---|---|---|---|---|---|');
    for (const top of pages.filter((p) => p.section === section && p.groupId === group.id && !p.parentId).sort(order)) {
      const children = (kids.get(top.id) ?? []).slice();
      // Groups follow the tab order of the parent's "Categorised products" block, then any others.
      const tabs = (top.draftData?.content ?? []).filter((b) => b.type === 'CategorizedProducts').flatMap((b) => b.props.categories.map((c) => c.name));
      const groupOrder = [...new Set([...tabs, ...children.sort(order).map((c) => c.productGroup ?? '')])];
      children.sort((a, b) => groupOrder.indexOf(a.productGroup ?? '') - groupOrder.indexOf(b.productGroup ?? '') || order(a, b));
      out.push(row(top, false, children.length));
      tally[section][statusOf(top, children.length)]++;
      for (const child of children) {
        out.push(row(child, true, 0));
        tally[section][statusOf(child, 0)]++;
      }
    }
  }
}
out.push('', '## Summary', '', `| Section | ${STATUSES.join(' | ')} |`, `|---|${STATUSES.map(() => '---').join('|')}|`);
for (const [section, label] of SECTIONS) out.push(`| ${label} | ${STATUSES.map((s) => tally[section][s]).join(' | ')} |`);
out.push('');

writeFileSync(join(here, 'content-status.md'), out.join('\n'));
console.log(out.slice(-6).join('\n'));
await prisma.$disconnect();
