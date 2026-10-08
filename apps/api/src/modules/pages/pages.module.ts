import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { StorageModule } from '../storage/storage.module';
import { AdminNavGroupsController } from './nav-groups.controller';
import { NavGroupsService } from './nav-groups.service';
import { AdminPagesController, PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { RevalidateService } from './revalidate.service';

@Module({
  imports: [StorageModule, AdminAuthModule],
  controllers: [PagesController, AdminPagesController, AdminNavGroupsController],
  providers: [PagesService, NavGroupsService, RevalidateService],
})
export class PagesModule {}
