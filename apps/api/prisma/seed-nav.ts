/**
 * Moves the site's hard-coded menu into the database, once (and again, harmlessly).
 *
 *   pnpm --filter @compro/api seed:nav
 *
 * Creates a NavGroup per menu column and a published, empty Page per menu entry — same
 * slugs as the old links, so every existing URL and menu item keeps working and shows the
 * placeholder body until someone fills it in.
 *
 * Idempotent and non-destructive: rows are created if missing and otherwise left exactly as
 * they are, so re-running never overwrites a title, order or content edited in the admin.
 *
 * The source of truth for the seed is `nav-links.ts` itself, imported rather than copied,
 * so the two can't disagree. After this runs, the database is the menu.
 */
import { Prisma, PrismaClient } from '@prisma/client';
import { EMPTY_PAGE_DOCUMENT } from '@compro/types';
import { NAV_LINKS } from '../../web/src/components/nav/nav-links';

const prisma = new PrismaClient();
const EMPTY_DOCUMENT = EMPTY_PAGE_DOCUMENT as unknown as Prisma.InputJsonValue;

async function main() {
  let groupsCreated = 0;
  let pagesCreated = 0;
  const seen = new Set<string>();

  for (const link of NAV_LINKS) {
    if (!link.dropdown) continue;
    const section = link.href.slice(1);

    for (const [groupIndex, group] of link.groups.entries()) {
      const existingGroup = await prisma.navGroup.findUnique({
        where: { section_title: { section, title: group.title } },
      });
      const navGroup =
        existingGroup ??
        (await prisma.navGroup.create({
          data: { section, title: group.title, sortOrder: groupIndex },
        }));
      if (!existingGroup) groupsCreated += 1;

      for (const [itemIndex, item] of group.items.entries()) {
        const slug = item.href.slice(`/${section}/`.length);
        // The supplied Solutions menu lists IEC 61215 twice; one page serves both.
        if (seen.has(`${section}/${slug}`)) continue;
        seen.add(`${section}/${slug}`);

        const existing = await prisma.page.findUnique({
          where: { section_slug: { section, slug } },
        });
        if (existing) continue;

        await prisma.page.create({
          data: {
            section,
            slug,
            title: item.label,
            groupId: navGroup.id,
            sortOrder: itemIndex,
            status: 'published',
            publishedAt: new Date(),
            draftData: EMPTY_DOCUMENT,
            publishedData: EMPTY_DOCUMENT,
          },
        });
        pagesCreated += 1;
      }
    }
  }

  console.log(
    `seed:nav — ${groupsCreated} group(s) and ${pagesCreated} page(s) created; ` +
      `${seen.size} menu page(s) total.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
