import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import type { MediaImageDto, PresignHeroImageResponse } from '@compro/types';
import { AdminGuard } from '../admin-auth/admin.guard';
import { CommitMediaDto, PresignMediaDto } from './dto/media.dto';
import { MediaService } from './media.service';

@Controller('admin/media')
@UseGuards(AdminGuard)
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Post('presign')
  @HttpCode(200)
  presign(@Body() dto: PresignMediaDto): Promise<PresignHeroImageResponse> {
    return this.media.presign(dto);
  }

  @Post()
  @HttpCode(200)
  commit(@Body() dto: CommitMediaDto): Promise<MediaImageDto> {
    return this.media.commit(dto);
  }
}
