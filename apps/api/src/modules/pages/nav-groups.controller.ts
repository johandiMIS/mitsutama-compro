import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AdminNavGroupDto } from '@compro/types';
import { AdminGuard } from '../admin-auth/admin.guard';
import { CreateNavGroupDto, UpdateNavGroupDto } from './dto/nav-group.dto';
import { NavGroupsService } from './nav-groups.service';

@Controller('admin/nav-groups')
@UseGuards(AdminGuard)
export class AdminNavGroupsController {
  constructor(private readonly groups: NavGroupsService) {}

  @Get()
  list(): Promise<AdminNavGroupDto[]> {
    return this.groups.list();
  }

  @Post()
  create(@Body() dto: CreateNavGroupDto): Promise<AdminNavGroupDto> {
    return this.groups.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNavGroupDto): Promise<AdminNavGroupDto> {
    return this.groups.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.groups.remove(id);
  }
}
