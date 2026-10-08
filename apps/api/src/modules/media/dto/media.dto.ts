import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class PresignMediaDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(127)
  contentType!: string;

  @IsInt()
  @IsPositive()
  sizeBytes!: number;
}

export class CommitMediaDto {
  @IsString()
  @MaxLength(1024)
  key!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  height?: number;
}
