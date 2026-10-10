import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PAGE_SECTIONS, type PageSection } from '@compro/types';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MESSAGE = 'slug must be lowercase letters, digits and single hyphens';

export class CreatePageDto {
  @IsIn(PAGE_SECTIONS)
  section!: PageSection;

  @IsString()
  @MaxLength(120)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  navLabel?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  showInNav?: boolean;

  /** Empty string clears it. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDescription?: string;

  /** Validated against the block schemas by the service, not here. */
  @IsOptional()
  @IsObject()
  draftData?: Record<string, unknown>;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  /** Empty string clears it. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  navLabel?: string;

  /** Empty string clears it. */
  @IsOptional()
  @IsString()
  groupId?: string;

  /** Empty string clears it. */
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(-100000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  showInNav?: boolean;

  /** Empty string clears it. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDescription?: string;

  @IsOptional()
  @IsObject()
  draftData?: Record<string, unknown>;
}

export class ImportPageDto {
  @IsIn(PAGE_SECTIONS)
  section!: PageSection;

  @IsString()
  @MaxLength(120)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  parent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  group?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  navLabel?: string;

  /** Empty string clears it. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDescription?: string;

  @IsObject()
  data!: Record<string, unknown>;
}
