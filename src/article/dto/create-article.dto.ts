import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @ApiProperty({ example: 'چگونه زعفران مرغوب را تشخیص دهیم؟' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'در این مقاله با روش‌های تشخیص زعفران اصل آشنا می‌شوید...', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: 'محتوای دلتا از Quill.js' })
  @IsNotEmpty()
  content: any;

  @ApiProperty({ example: 'uploads/articles/zafaran-guide.jpg', required: false })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=...', required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ example: 5, description: 'زمان مطالعه به دقیقه', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readingTime?: number;

  @ApiProperty({ enum: ArticleStatus, default: ArticleStatus.DRAFT, required: false })
  @IsOptional()
  status?: ArticleStatus;

  @ApiProperty({ example: ['product-uuid-1', 'product-uuid-2'], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  productIds?: string[];
}