import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { HeroImage } from '@prisma/client';
import {
  HERO_IMAGE_EXTENSION,
  HERO_IMAGE_MAX_BYTES,
  HERO_IMAGE_MIME,
  type HeroImageDto,
  type PresignHeroImageResponse,
} from '@compro/types';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type {
  CommitHeroImageDto,
  PresignHeroImageDto,
} from './dto/hero-image.dto';

/** Enough bytes to cover the RIFF container header and the WEBP form marker. */
const MAGIC_BYTE_LENGTH = 16;

/**
 * Bucket folder this feature owns. Hardcoded rather than env-driven: it never differs
 * between environments, and each feature (products, news, ...) declares its own the
 * same way. Commits are confined to keys under it.
 */
const HERO_KEY_PREFIX = 'hero';

@Injectable()
export class HeroImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(): Promise<HeroImageDto[]> {
    const rows = await this.prisma.heroImage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => this.toDto(row));
  }

  /**
   * Step 1 of an upload. Validates what we can before anything is stored: the declared
   * MIME type, the extension and the size. These become S3 POST policy conditions, so
   * S3 enforces them at upload time rather than trusting the browser.
   */
  async presign(dto: PresignHeroImageDto): Promise<PresignHeroImageResponse> {
    if (dto.contentType !== HERO_IMAGE_MIME) {
      throw new BadRequestException(
        `Only ${HERO_IMAGE_MIME} is accepted, received "${dto.contentType}".`,
      );
    }
    if (!dto.filename.toLowerCase().endsWith(HERO_IMAGE_EXTENSION)) {
      throw new BadRequestException(
        `Only ${HERO_IMAGE_EXTENSION} files are accepted.`,
      );
    }
    if (dto.sizeBytes > HERO_IMAGE_MAX_BYTES) {
      throw new BadRequestException(
        `File is ${formatBytes(dto.sizeBytes)}; the limit is ${formatBytes(HERO_IMAGE_MAX_BYTES)}.`,
      );
    }

    const key = this.storage.buildKey(HERO_KEY_PREFIX, HERO_IMAGE_EXTENSION);
    return this.storage.presignUpload({
      key,
      contentType: HERO_IMAGE_MIME,
      maxBytes: HERO_IMAGE_MAX_BYTES,
    });
  }

  /**
   * Step 3, after the browser has uploaded straight to S3.
   *
   * This is the check that actually enforces "webp only". The presign conditions only
   * pin the `Content-Type` *header* — a client is free to send that header with, say, a
   * PDF or an HTML file as the body. So before writing a row we read the first bytes of
   * the stored object and confirm it is really a RIFF/WEBP container, deleting the
   * object if it isn't.
   */
  async commit(dto: CommitHeroImageDto): Promise<HeroImageDto> {
    // Confine commits to keys this API handed out, so an arbitrary key can't be
    // registered (or later deleted) through this endpoint.
    const expectedPrefix = `${HERO_KEY_PREFIX}/`;
    if (!dto.key.startsWith(expectedPrefix) || dto.key.includes('..')) {
      throw new BadRequestException('Unrecognised upload key.');
    }

    const existing = await this.prisma.heroImage.findUnique({
      where: { storageKey: dto.key },
    });
    if (existing) return this.toDto(existing);

    const stats = await this.storage.statObject(dto.key);
    if (!stats) {
      throw new BadRequestException(
        'Upload not found in storage. The upload may not have completed.',
      );
    }
    if (stats.sizeBytes > HERO_IMAGE_MAX_BYTES) {
      await this.storage.deleteObject(dto.key);
      throw new BadRequestException(
        `File is ${formatBytes(stats.sizeBytes)}; the limit is ${formatBytes(HERO_IMAGE_MAX_BYTES)}.`,
      );
    }

    const head = await this.storage.readHeadBytes(dto.key, MAGIC_BYTE_LENGTH);
    if (!head || !isWebp(head)) {
      await this.storage.deleteObject(dto.key);
      throw new BadRequestException(
        'That file is not a valid WebP image. Only .webp files are accepted.',
      );
    }

    const last = await this.prisma.heroImage.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const created = await this.prisma.heroImage.create({
      data: {
        storageKey: dto.key,
        alt: dto.alt?.trim() ?? '',
        sortOrder: (last?.sortOrder ?? -1) + 1,
        width: dto.width ?? null,
        height: dto.height ?? null,
        sizeBytes: stats.sizeBytes,
      },
    });

    return this.toDto(created);
  }

  /** Removes the row, then the object. Row first, so a failed S3 delete leaves an
   *  orphaned object rather than a row pointing at nothing. */
  async remove(id: string): Promise<void> {
    const row = await this.prisma.heroImage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Hero image not found');

    await this.prisma.heroImage.delete({ where: { id } });
    await this.storage.deleteObject(row.storageKey);
  }

  private toDto(row: HeroImage): HeroImageDto {
    return {
      id: row.id,
      url: this.storage.publicUrl(row.storageKey),
      alt: row.alt,
      sortOrder: row.sortOrder,
      width: row.width,
      height: row.height,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

/**
 * A WebP file is a RIFF container: bytes 0-3 are "RIFF", 4-7 are the little-endian
 * chunk size, and 8-11 are "WEBP". Checking both markers rules out other RIFF formats
 * such as WAV and AVI.
 *
 * Exported for tests: this is the check that actually enforces "webp only", so it is
 * worth covering directly rather than only through a live S3 round trip.
 */
export function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
