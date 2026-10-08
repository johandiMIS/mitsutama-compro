import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, type NavGroup, type Page } from '@prisma/client';
import { z } from 'zod';
import {
  EMPTY_PAGE_DOCUMENT,
  PageDocumentSchema,
  type AdminPageDto,
  type BreadcrumbDto,
  type NavTreeDto,
  type PageDocument,
  type PageSection,
  type PageStatus,
  type PublicPageDto,
} from '@compro/types';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePageDto, ImportPageDto, UpdatePageDto } from './dto/page.dto';
import { validatePageDocument, withBlockIds } from './page-validator';
import { buildBreadcrumbs, buildNavTree, type BreadcrumbPage } from './page-tree';
import { RevalidateService } from './revalidate.service';

/** Uploaded content images live under this key prefix (see docs/content-builder-plan.md). */
const MEDIA_KEY_PREFIX = 'media/';
/** Deeper than any real menu; also stops a corrupted parent loop from spinning forever. */
const MAX_TREE_DEPTH = 8;

type PageWithGroup = Page & { group: NavGroup | null };

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly revalidator: RevalidateService,
  ) {}

  // ---- public ------------------------------------------------------------

  async nav(): Promise<NavTreeDto> {
    const rows = await this.prisma.page.findMany({
      where: { status: 'published', showInNav: true, groupId: { not: null } },
      include: { group: true },
    });
    return buildNavTree(rows);
  }

  async getPublished(section: string, slug: string): Promise<PublicPageDto> {
    const page = await this.prisma.page.findUnique({
      where: { section_slug: { section, slug } },
      include: { group: true },
    });
    if (!page || page.status !== 'published' || page.publishedData == null) {
      throw new NotFoundException('Page not found');
    }

    return {
      id: page.id,
      section: page.section as PageSection,
      slug: page.slug,
      title: page.title,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      breadcrumbs: await this.breadcrumbsFor(page),
      data: this.readStored(page.publishedData),
    };
  }

  // ---- admin -------------------------------------------------------------

  async list(): Promise<AdminPageDto[]> {
    const pages = await this.prisma.page.findMany({
      include: { group: true, _count: { select: { children: true } } },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
    });
    // The list view never needs document bodies; they can be large.
    return pages.map((page) => this.toAdminDto(page, page._count.children, false));
  }

  async get(id: string): Promise<AdminPageDto> {
    const page = await this.findOrThrow(id);
    const childCount = await this.prisma.page.count({ where: { parentId: id } });
    return this.toAdminDto(page, childCount, true);
  }

  async create(dto: CreatePageDto): Promise<AdminPageDto> {
    const draft = dto.draftData ? this.validateOrThrow(dto.draftData) : undefined;
    await this.assertPlacement(dto.section, dto.groupId, dto.parentId);

    try {
      const page = await this.prisma.page.create({
        data: {
          section: dto.section,
          slug: dto.slug,
          title: dto.title,
          navLabel: dto.navLabel || null,
          groupId: dto.groupId || null,
          parentId: dto.parentId || null,
          sortOrder: dto.sortOrder ?? 0,
          showInNav: dto.showInNav ?? true,
          seoTitle: dto.seoTitle || null,
          seoDescription: dto.seoDescription || null,
          draftData: draft as Prisma.InputJsonValue | undefined,
        },
        include: { group: true },
      });
      return this.toAdminDto(page, 0, true);
    } catch (error) {
      throw this.translateUnique(error, dto.section, dto.slug);
    }
  }

  async update(id: string, dto: UpdatePageDto): Promise<AdminPageDto> {
    const existing = await this.findOrThrow(id);

    // Renaming a live URL would 404 every link to it. Redirects arrive in Phase 3;
    // until then the slug is frozen while published.
    if (dto.slug !== undefined && dto.slug !== existing.slug && existing.status === 'published') {
      throw new ConflictException(
        'Unpublish the page before changing its slug — a live URL would break.',
      );
    }

    const groupId = dto.groupId === undefined ? existing.groupId : dto.groupId || null;
    const parentId = dto.parentId === undefined ? existing.parentId : dto.parentId || null;
    if (dto.groupId !== undefined || dto.parentId !== undefined) {
      await this.assertPlacement(existing.section as PageSection, groupId, parentId, id);
    }

    const draft = dto.draftData ? this.validateOrThrow(dto.draftData) : undefined;

    try {
      const page = await this.prisma.page.update({
        where: { id },
        data: {
          slug: dto.slug,
          title: dto.title,
          navLabel: dto.navLabel === undefined ? undefined : dto.navLabel || null,
          groupId: dto.groupId === undefined ? undefined : groupId,
          parentId: dto.parentId === undefined ? undefined : parentId,
          sortOrder: dto.sortOrder,
          showInNav: dto.showInNav,
          seoTitle: dto.seoTitle === undefined ? undefined : dto.seoTitle || null,
          seoDescription:
            dto.seoDescription === undefined ? undefined : dto.seoDescription || null,
          draftData: draft as Prisma.InputJsonValue | undefined,
        },
        include: { group: true },
      });

      // Title, menu placement and order are served from published data, so a live page
      // needs its caches dropped for metadata edits too — not only on Publish.
      if (page.status === 'published' && this.touchesLiveFields(dto)) {
        await this.revalidator.revalidate(this.tagsFor(page));
      }
      return this.toAdminDto(page, await this.childCount(id), true);
    } catch (error) {
      throw this.translateUnique(error, existing.section, dto.slug ?? existing.slug);
    }
  }

  async publish(id: string): Promise<AdminPageDto> {
    const existing = await this.findOrThrow(id);
    // Re-validate: the draft was valid when saved, but the block schemas may have
    // tightened since, and a bad document must never reach the live site.
    const document = this.validateOrThrow(existing.draftData ?? EMPTY_PAGE_DOCUMENT);

    const page = await this.prisma.page.update({
      where: { id },
      data: {
        status: 'published',
        publishedData: document as unknown as Prisma.InputJsonValue,
        publishedAt: new Date(),
      },
      include: { group: true },
    });
    await this.revalidator.revalidate(this.tagsFor(page));
    return this.toAdminDto(page, await this.childCount(id), true);
  }

  async unpublish(id: string): Promise<AdminPageDto> {
    await this.findOrThrow(id);
    const page = await this.prisma.page.update({
      where: { id },
      data: { status: 'draft', publishedData: Prisma.DbNull, publishedAt: null },
      include: { group: true },
    });
    await this.revalidator.revalidate(this.tagsFor(page));
    return this.toAdminDto(page, await this.childCount(id), true);
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOrThrow(id);
    const children = await this.childCount(id);
    if (children > 0) {
      throw new ConflictException(
        `This page has ${children} child page(s). Delete or move them first.`,
      );
    }
    await this.prisma.page.delete({ where: { id } });
    if (page.status === 'published') {
      await this.revalidator.revalidate(this.tagsFor(page));
    }
  }

  /**
   * Creates or replaces a page's **draft** from an AI-written envelope. Never publishes,
   * and never touches a published page's live data — a human reviews, then publishes.
   */
  async importPage(dto: ImportPageDto): Promise<AdminPageDto> {
    const document = withBlockIds(this.validateOrThrow(dto.data));

    let parentId: string | null | undefined;
    if (dto.parent) {
      const parent = await this.prisma.page.findUnique({
        where: { section_slug: { section: dto.section, slug: dto.parent } },
      });
      if (!parent) {
        throw new UnprocessableEntityException({
          message: 'Import failed',
          issues: [{ path: 'parent', message: `no ${dto.section} page with slug "${dto.parent}"` }],
        });
      }
      parentId = parent.id;
    }

    let groupId: string | null | undefined;
    if (dto.group) {
      const group = await this.prisma.navGroup.findUnique({
        where: { section_title: { section: dto.section, title: dto.group } },
      });
      if (!group) {
        throw new UnprocessableEntityException({
          message: 'Import failed',
          issues: [{ path: 'group', message: `no ${dto.section} menu group titled "${dto.group}"` }],
        });
      }
      groupId = group.id;
    }
    if (parentId && groupId) {
      throw new UnprocessableEntityException({
        message: 'Import failed',
        issues: [{ path: 'parent', message: 'give either "parent" or "group", not both' }],
      });
    }

    const existing = await this.prisma.page.findUnique({
      where: { section_slug: { section: dto.section, slug: dto.slug } },
    });

    const metadata = {
      title: dto.title,
      navLabel: dto.navLabel,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
    };

    if (existing) {
      if (parentId) await this.assertPlacement(dto.section, null, parentId, existing.id);
      const page = await this.prisma.page.update({
        where: { id: existing.id },
        data: {
          ...metadata,
          ...(parentId ? { parentId, groupId: null } : {}),
          ...(groupId ? { groupId, parentId: null } : {}),
          draftData: document as unknown as Prisma.InputJsonValue,
        },
        include: { group: true },
      });
      return this.toAdminDto(page, await this.childCount(page.id), true);
    }

    const page = await this.prisma.page.create({
      data: {
        section: dto.section,
        slug: dto.slug,
        ...metadata,
        // A child of a menu page is reachable by link, not listed in the menu.
        groupId: groupId ?? null,
        parentId: parentId ?? null,
        draftData: document as unknown as Prisma.InputJsonValue,
      },
      include: { group: true },
    });
    return this.toAdminDto(page, 0, true);
  }

  /** JSON Schema of a page document, for pasting into an AI prompt. */
  jsonSchema(): Record<string, unknown> {
    return z.toJSONSchema(PageDocumentSchema, { io: 'input' }) as Record<string, unknown>;
  }

  // ---- helpers -----------------------------------------------------------

  private async findOrThrow(id: string): Promise<PageWithGroup> {
    const page = await this.prisma.page.findUnique({ where: { id }, include: { group: true } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  private childCount(id: string): Promise<number> {
    return this.prisma.page.count({ where: { parentId: id } });
  }

  private allowedImagePrefix(): string {
    // With storage unconfigured no image can be legitimately hosted, so allow none
    // rather than silently skipping the check.
    return this.storage.isConfigured
      ? this.storage.publicUrl(MEDIA_KEY_PREFIX)
      : 'storage-not-configured:';
  }

  private validateOrThrow(input: unknown): PageDocument {
    const result = validatePageDocument(input, this.allowedImagePrefix());
    if (!result.ok) {
      throw new UnprocessableEntityException({
        message: 'Page content is invalid',
        issues: result.issues,
      });
    }
    return result.data;
  }

  /** Stored JSON was validated on write; re-parse so the shape (and defaults) are guaranteed. */
  private readStored(value: Prisma.JsonValue): PageDocument {
    const parsed = PageDocumentSchema.safeParse(value);
    return parsed.success ? parsed.data : EMPTY_PAGE_DOCUMENT;
  }

  /** A page is either under a menu group or under a parent page — not both — in one section. */
  private async assertPlacement(
    section: PageSection,
    groupId: string | null | undefined,
    parentId: string | null | undefined,
    selfId?: string,
  ): Promise<void> {
    if (groupId && parentId) {
      throw new BadRequestException('A page has either a menu group or a parent, not both.');
    }
    if (groupId) {
      const group = await this.prisma.navGroup.findUnique({ where: { id: groupId } });
      if (!group || group.section !== section) {
        throw new BadRequestException('Menu group not found in this section.');
      }
    }
    if (parentId) {
      let cursor: string | null = parentId;
      for (let depth = 0; cursor && depth < MAX_TREE_DEPTH; depth += 1) {
        if (cursor === selfId) {
          throw new BadRequestException('A page cannot be its own ancestor.');
        }
        const node: Pick<Page, 'section' | 'parentId'> | null =
          await this.prisma.page.findUnique({
            where: { id: cursor },
            select: { section: true, parentId: true },
          });
        if (!node) throw new BadRequestException('Parent page not found.');
        if (depth === 0 && node.section !== section) {
          throw new BadRequestException('Parent page is in a different section.');
        }
        cursor = node.parentId;
      }
    }
  }

  private async breadcrumbsFor(page: PageWithGroup): Promise<BreadcrumbDto[]> {
    const ancestors: BreadcrumbPage[] = [];
    let cursor = page.parentId;
    for (let depth = 0; cursor && depth < MAX_TREE_DEPTH; depth += 1) {
      const parent: PageWithGroup | null = await this.prisma.page.findUnique({
        where: { id: cursor },
        include: { group: true },
      });
      if (!parent) break;
      ancestors.push(parent);
      cursor = parent.parentId;
    }
    return buildBreadcrumbs(page, ancestors);
  }

  private tagsFor(page: Pick<Page, 'section' | 'slug'>): string[] {
    return ['nav', `page:${page.section}/${page.slug}`];
  }

  private touchesLiveFields(dto: UpdatePageDto): boolean {
    return (
      dto.title !== undefined ||
      dto.navLabel !== undefined ||
      dto.groupId !== undefined ||
      dto.parentId !== undefined ||
      dto.sortOrder !== undefined ||
      dto.showInNav !== undefined ||
      dto.seoTitle !== undefined ||
      dto.seoDescription !== undefined
    );
  }

  private translateUnique(error: unknown, section: string, slug: string): unknown {
    if ((error as { code?: string })?.code === 'P2002') {
      return new ConflictException(`A ${section} page with slug "${slug}" already exists.`);
    }
    return error;
  }

  private toAdminDto(
    page: PageWithGroup,
    childCount: number,
    includeDraft: boolean,
  ): AdminPageDto {
    const draft = page.draftData == null ? null : this.readStored(page.draftData);
    return {
      id: page.id,
      section: page.section as PageSection,
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      groupId: page.groupId,
      groupTitle: page.group?.title ?? null,
      parentId: page.parentId,
      sortOrder: page.sortOrder,
      showInNav: page.showInNav,
      status: page.status as PageStatus,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      updatedAt: page.updatedAt.toISOString(),
      hasUnpublishedChanges:
        page.status === 'published' &&
        JSON.stringify(page.draftData) !== JSON.stringify(page.publishedData),
      draftData: includeDraft ? draft : null,
      childCount,
    };
  }
}
