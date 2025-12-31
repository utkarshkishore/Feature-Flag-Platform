import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';
import { FlagType } from '@prisma/client';

export class CreateFlagDto {
  @IsString()
  projectId!: string;

  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FlagType)
  type!: FlagType;

  @IsDefined()
  defaultValue!: any;

  @IsOptional()
  rules?: any;

  @IsOptional()
  envValues?: Record<string, any>;
}

export class UpdateFlagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  rules?: any;

  @IsOptional()
  envValues?: Record<string, any>;
}
