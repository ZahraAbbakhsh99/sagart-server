import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'زعفران سرگل' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'ZAF-001' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiProperty({ example: '100 گرم' })
  @IsString()
  @IsNotEmpty()
  measure!: string;

  @ApiProperty({ example: 100, description: 'وزن به گرم' })
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiProperty({ example: ['uploads/products/1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 'توضیحات کامل', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'نحوه برداشت', required: false })
  @IsOptional()
  @IsString()
  harvestMethod?: string;

  @ApiProperty({ example: 'نحوه نگهداری', required: false })
  @IsOptional()
  @IsString()
  storageMethod?: string;

  @ApiProperty({ example: 'مشخصات فنی', required: false })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({ example: 'نحوه بسته‌بندی', required: false })
  @IsOptional()
  @IsString()
  packagingShipping?: string;

  @ApiProperty({ example: 'راهنمای مصرف', required: false })
  @IsOptional()
  @IsString()
  usageGuide?: string;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;
}