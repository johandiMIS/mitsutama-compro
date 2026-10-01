import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { HeroImageDto, PresignHeroImageResponse } from '@compro/types';
import { AdminGuard } from '../admin-auth/admin.guard';
import { CommitHeroImageDto, PresignHeroImageDto } from './dto/hero-image.dto';
import { HeroImagesService } from './hero-images.service';

/** Public read, so the site can render the carousel without a session. */
@Controller('hero-images')
export class HeroImagesController {
  constructor(private readonly heroImages: HeroImagesService) {}

  @Get()
  list(): Promise<HeroImageDto[]> {
    return this.heroImages.list();
  }
}

/** Everything that mutates sits behind the admin session cookie. */
@Controller('admin/hero-images')
@UseGuards(AdminGuard)
export class AdminHeroImagesController {
  constructor(private readonly heroImages: HeroImagesService) {}

  @Get()
  list(): Promise<HeroImageDto[]> {
    return this.heroImages.list();
  }

  @Post('presign')
  @HttpCode(200)
  presign(@Body() dto: PresignHeroImageDto): Promise<PresignHeroImageResponse> {
    return this.heroImages.presign(dto);
  }

  @Post()
  commit(@Body() dto: CommitHeroImageDto): Promise<HeroImageDto> {
    return this.heroImages.commit(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.heroImages.remove(id);
  }
}
