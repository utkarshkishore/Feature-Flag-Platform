import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSegmentDto {
  @IsString()
  projectId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  rules!: any;
}
