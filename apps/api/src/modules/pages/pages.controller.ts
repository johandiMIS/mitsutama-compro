import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PAGE_SECTIONS, type AdminPageDto, type NavTreeDto, type PublicPageDto } from '@compro/types';
import { AdminGuard } from '../admin-auth/admin.guard';
import { CreatePageDto, ImportPageDto, UpdatePageDto } from './dto/page.dto';
import { PagesService } from './pages.service';

/** Public reads, so the site can render pages and the menu without a session. */
@Controller()
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get('nav')
  nav(): Promise<NavTreeDto> {
    return this.pages.nav();
  }

  @Get('pages/:section/:slug')
  getPublished(
    @Param('section') section: string,
    @Param('slug') slug: string,
  ): Promise<PublicPageDto> {
    // Anything outside the three sections can't exist; skip the query.
    if (!(PAGE_SECTIONS as readonly string[]).includes(section)) {
      throw new NotFoundException('Page not found');
    }
    return this.pages.getPublished(section, slug);
  }
}

/** Everything that reads drafts or mutates sits behind the admin session cookie. */
@Controller('admin/pages')
@UseGuards(AdminGuard)
export class AdminPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  list(): Promise<AdminPageDto[]> {
    return this.pages.list();
  }

  // Static routes are declared before `:id` so "schema" is never read as an id.
  @Get('schema')
  schema(): Record<string, unknown> {
    return this.pages.jsonSchema();
  }

  @Post('import')
  @HttpCode(200)
  import(@Body() dto: ImportPageDto): Promise<AdminPageDto> {
    return this.pages.importPage(dto);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<AdminPageDto> {
    return this.pages.get(id);
  }

  @Post()
  create(@Body() dto: CreatePageDto): Promise<AdminPageDto> {
    return this.pages.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto): Promise<AdminPageDto> {
    return this.pages.update(id, dto);
  }

  @Post(':id/publish')
  @HttpCode(200)
  publish(@Param('id') id: string): Promise<AdminPageDto> {
    return this.pages.publish(id);
  }

  @Post(':id/unpublish')
  @HttpCode(200)
  unpublish(@Param('id') id: string): Promise<AdminPageDto> {
    return this.pages.unpublish(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.pages.remove(id);
  }
}
