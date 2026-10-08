import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AdminNavGroupDto, PageSection } from '@compro/types';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNavGroupDto, UpdateNavGroupDto } from './dto/nav-group.dto';
import { RevalidateService } from './revalidate.service';

/** Menu columns. The public menu is derived from these plus published pages. */
@Injectable()
export class NavGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidator: RevalidateService,
  ) {}

  async list(): Promise<AdminNavGroupDto[]> {
    const groups = await this.prisma.navGroup.findMany({
      include: { _count: { select: { pages: true } } },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
    });
    return groups.map((group) => ({
      id: group.id,
      section: group.section as PageSection,
      title: group.title,
      sortOrder: group.sortOrder,
      pageCount: group._count.pages,
    }));
  }

  async create(dto: CreateNavGroupDto): Promise<AdminNavGroupDto> {
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const last = await this.prisma.navGroup.findFirst({
        where: { section: dto.section },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = (last?.sortOrder ?? -1) + 1;
    }
    try {
      const group = await this.prisma.navGroup.create({
        data: { section: dto.section, title: dto.title.trim(), sortOrder },
      });
      // A new group is empty, so it changes nothing on the live menu yet.
      return this.toDto(group, 0);
    } catch (error) {
      throw this.translateUnique(error, dto.title);
    }
  }

  async update(id: string, dto: UpdateNavGroupDto): Promise<AdminNavGroupDto> {
    await this.findOrThrow(id);
    try {
      const group = await this.prisma.navGroup.update({
        where: { id },
        data: { title: dto.title?.trim(), sortOrder: dto.sortOrder },
        include: { _count: { select: { pages: true } } },
      });
      await this.revalidator.revalidate(['nav']);
      return this.toDto(group, group._count.pages);
    } catch (error) {
      throw this.translateUnique(error, dto.title ?? '');
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    const pages = await this.prisma.page.count({ where: { groupId: id } });
    if (pages > 0) {
      throw new ConflictException(
        `This group still has ${pages} page(s). Move or delete them first.`,
      );
    }
    await this.prisma.navGroup.delete({ where: { id } });
  }

  private async findOrThrow(id: string) {
    const group = await this.prisma.navGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Menu group not found');
    return group;
  }

  private toDto(
    group: { id: string; section: string; title: string; sortOrder: number },
    pageCount: number,
  ): AdminNavGroupDto {
    return {
      id: group.id,
      section: group.section as PageSection,
      title: group.title,
      sortOrder: group.sortOrder,
      pageCount,
    };
  }

  private translateUnique(error: unknown, title: string): unknown {
    if ((error as { code?: string })?.code === 'P2002') {
      return new ConflictException(`A group titled "${title}" already exists in this section.`);
    }
    return error;
  }
}
