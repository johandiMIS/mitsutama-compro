import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { StorageModule } from '../storage/storage.module';
import {
  AdminHeroImagesController,
  HeroImagesController,
} from './hero-images.controller';
import { HeroImagesService } from './hero-images.service';

@Module({
  imports: [StorageModule, AdminAuthModule],
  controllers: [HeroImagesController, AdminHeroImagesController],
  providers: [HeroImagesService],
})
export class HeroImagesModule {}
