import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'زعفران', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'uploads/categories/zafaran-thumb.jpg', required: false })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({ example: 'uploads/categories/zafaran-cover.jpg', required: false })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiProperty({ example: 'پر فروش', required: false })
  @IsOptional()
  @IsString()
  label?: string;
}