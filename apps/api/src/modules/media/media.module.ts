import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { StorageModule } from '../storage/storage.module';
import { AdminMediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [StorageModule, AdminAuthModule],
  controllers: [AdminMediaController],
  providers: [MediaService],
})
export class MediaModule {}
