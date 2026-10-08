import { BadRequestException, Injectable } from '@nestjs/common';
import {
  HERO_IMAGE_EXTENSION,
  HERO_IMAGE_MIME,
  MEDIA_IMAGE_MAX_BYTES,
  type MediaImageDto,
  type PresignHeroImageResponse,
} from '@compro/types';
import { isWebp } from '../hero-images/hero-images.service';
import { StorageService } from '../storage/storage.service';
import type { CommitMediaDto, PresignMediaDto } from './dto/media.dto';

/**
 * Folder for images used inside page content. Pages may only reference URLs under it
 * (enforced by the page validator), so this is the one door content images come through.
 */
export const MEDIA_KEY_PREFIX = 'media';
const MAGIC_BYTE_LENGTH = 16;

/**
 * Same three-step, browser-direct, WebP-only flow as hero images, minus the database row:
 * a content image is just a URL stored inside a page document.
 */
@Injectable()
export class MediaService {
  constructor(private readonly storage: StorageService) {}

  presign(dto: PresignMediaDto): Promise<PresignHeroImageResponse> {
    if (dto.contentType !== HERO_IMAGE_MIME) {
      throw new BadRequestException(`Only ${HERO_IMAGE_MIME} is accepted, received "${dto.contentType}".`);
    }
    if (!dto.filename.toLowerCase().endsWith(HERO_IMAGE_EXTENSION)) {
      throw new BadRequestException(`Only ${HERO_IMAGE_EXTENSION} files are accepted.`);
    }
    if (dto.sizeBytes > MEDIA_IMAGE_MAX_BYTES) {
      throw new BadRequestException(`The limit is ${MEDIA_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`);
    }
    return this.storage.presignUpload({
      key: this.storage.buildKey(MEDIA_KEY_PREFIX, HERO_IMAGE_EXTENSION),
      contentType: HERO_IMAGE_MIME,
      maxBytes: MEDIA_IMAGE_MAX_BYTES,
    });
  }

  /** Verifies what landed is really a WebP (the presign only pins the header), then returns its URL. */
  async commit(dto: CommitMediaDto): Promise<MediaImageDto> {
    if (!dto.key.startsWith(`${MEDIA_KEY_PREFIX}/`) || dto.key.includes('..')) {
      throw new BadRequestException('Unrecognised upload key.');
    }
    const stats = await this.storage.statObject(dto.key);
    if (!stats) {
      throw new BadRequestException('Upload not found in storage. The upload may not have completed.');
    }
    if (stats.sizeBytes > MEDIA_IMAGE_MAX_BYTES) {
      await this.storage.deleteObject(dto.key);
      throw new BadRequestException('File is over the size limit.');
    }
    const head = await this.storage.readHeadBytes(dto.key, MAGIC_BYTE_LENGTH);
    if (!head || !isWebp(head)) {
      await this.storage.deleteObject(dto.key);
      throw new BadRequestException('That file is not a valid WebP image.');
    }
    return {
      url: this.storage.publicUrl(dto.key),
      width: dto.width ?? null,
      height: dto.height ?? null,
      sizeBytes: stats.sizeBytes,
    };
  }
}
