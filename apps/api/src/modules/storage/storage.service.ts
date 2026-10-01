import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
  key: string;
  expiresInSeconds: number;
}

export interface StoredObjectStats {
  sizeBytes: number;
  contentType?: string;
}

/**
 * Thin wrapper over the S3 client. Everything that knows about buckets, keys and
 * presigning lives here; callers deal in keys and public URLs only.
 */
@Injectable()
export class StorageService implements OnModuleDestroy {
  private readonly logger = new Logger(StorageService.name);
  private client?: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  private readonly publicBaseUrl?: string;
  /** Optional canned ACL. Leave unset when the bucket has Object Ownership set to
   *  "Bucket owner enforced" (ACLs disabled) — the default for buckets created since
   *  April 2023 — and grant public read with a bucket policy instead. Sending an ACL
   *  to such a bucket makes S3 reject the upload. */
  private readonly uploadAcl?: string;

  constructor(private readonly config: ConfigService) {
    // Read config here but do NOT throw: an unset bucket must not stop the whole API
    // from booting, or the public site loses every endpoint because the admin panel's
    // storage isn't set up yet. Missing config surfaces on first use instead — see
    // `requireClient` — so only the hero-image routes fail.
    this.bucket = this.config.get<string>('S3_BUCKET') ?? '';
    this.region = this.config.get<string>('AWS_REGION') ?? '';
    this.publicBaseUrl = this.config
      .get<string>('S3_PUBLIC_BASE_URL')
      ?.replace(/\/+$/, '');
    this.uploadAcl = this.config.get<string>('S3_UPLOAD_ACL') || undefined;

    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    // Omitting credentials entirely lets the SDK fall back to its own chain (instance
    // role, shared config file, ambient env), which is what a deployed host should use.
    this.credentials =
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined;

    if (!this.isConfigured) {
      this.logger.warn(
        'S3 is not configured (AWS_REGION / S3_BUCKET). Hero image upload and delete will return 503 until it is — see apps/api/.env.example.',
      );
    }
  }

  onModuleDestroy() {
    this.client?.destroy();
  }

  get isConfigured(): boolean {
    return this.bucket.length > 0 && this.region.length > 0;
  }

  private requireClient(): S3Client {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'Image storage is not configured. Set AWS_REGION and S3_BUCKET in apps/api/.env.',
      );
    }
    this.client ??= new S3Client({
      region: this.region,
      ...(this.credentials ? { credentials: this.credentials } : {}),
    });
    return this.client;
  }

  /** Deterministic, collision-free key for a new object. */
  buildKey(prefix: string, extension: string): string {
    return `${prefix.replace(/^\/+|\/+$/g, '')}/${randomUUID()}${extension}`;
  }

  /**
   * Authorise one browser-to-S3 upload. `contentType` and `maxBytes` become policy
   * conditions, so S3 itself rejects a request that does not match — the bytes never
   * touch this API.
   */
  async presignUpload(params: {
    key: string;
    contentType: string;
    maxBytes: number;
    expiresInSeconds?: number;
  }): Promise<PresignedUpload> {
    const expiresInSeconds = params.expiresInSeconds ?? 300;

    const { url, fields } = await createPresignedPost(this.requireClient(), {
      Bucket: this.bucket,
      Key: params.key,
      Expires: expiresInSeconds,
      Conditions: [
        ['content-length-range', 1, params.maxBytes],
        ['eq', '$Content-Type', params.contentType],
        ...(this.uploadAcl ? [['eq', '$acl', this.uploadAcl] as const] : []),
      ] as Parameters<typeof createPresignedPost>[1]['Conditions'],
      Fields: {
        'Content-Type': params.contentType,
        ...(this.uploadAcl ? { acl: this.uploadAcl } : {}),
      },
    });

    return { url, fields, key: params.key, expiresInSeconds };
  }

  /** Size and declared content type of a stored object, or null if it isn't there. */
  async statObject(key: string): Promise<StoredObjectStats | null> {
    try {
      const head = await this.requireClient().send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        sizeBytes: head.ContentLength ?? 0,
        contentType: head.ContentType,
      };
    } catch (error) {
      if (this.isNotFound(error)) return null;
      throw error;
    }
  }

  /**
   * Read the first `length` bytes of an object. Used to check real magic bytes rather
   * than trusting the `Content-Type` the uploader declared — a ranged GET so we pay
   * for 16 bytes, not the whole image.
   */
  async readHeadBytes(key: string, length: number): Promise<Uint8Array | null> {
    try {
      const response = await this.requireClient().send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Range: `bytes=0-${length - 1}`,
        }),
      );
      if (!response.Body) return null;
      return await response.Body.transformToByteArray();
    } catch (error) {
      if (this.isNotFound(error)) return null;
      throw error;
    }
  }

  /** Best-effort delete. Never throws: callers use this to clean up after a rejection. */
  async deleteObject(key: string): Promise<void> {
    try {
      await this.requireClient().send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete orphaned object ${key}: ${String(error)}`,
      );
    }
  }

  /** Permanent public URL for a key — the CDN alias if configured, else the bucket URL. */
  publicUrl(key: string): string {
    const encoded = key.split('/').map(encodeURIComponent).join('/');
    if (this.publicBaseUrl) return `${this.publicBaseUrl}/${encoded}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encoded}`;
  }

  private isNotFound(error: unknown): boolean {
    const name = (error as { name?: string })?.name;
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;
    return name === 'NoSuchKey' || name === 'NotFound' || status === 404;
  }
}
