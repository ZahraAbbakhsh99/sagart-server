import { ApiProperty } from '@nestjs/swagger';
import { ArticleStatus } from '../entities/article.entity';

export class ArticleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  excerpt!: string;

  @ApiProperty()
  content!: any;

  @ApiProperty()
  featuredImage!: string;

  @ApiProperty()
  videoUrl!: string;

  @ApiProperty()
  readingTime!: number;

  @ApiProperty()
  publishedAt!: Date;

  @ApiProperty({ enum: ArticleStatus })
  status!: ArticleStatus;

  @ApiProperty()
  views!: number;

  @ApiProperty()
  author!: {
    id: string;
    fullName: string;
  };

  @ApiProperty({ type: [Object] })
  products!: {
    id: string;
    title: string;
    slug: string;
  }[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}