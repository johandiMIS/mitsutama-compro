import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { HERO_IMAGE_MAX_BYTES } from '@compro/types';

export class PresignHeroImageDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(127)
  contentType!: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  sizeBytes!: number;
}

export class CommitHeroImageDto {
  @IsString()
  @MaxLength(1024)
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  height?: number;
}

export const MAX_UPLOAD_BYTES = HERO_IMAGE_MAX_BYTES;
