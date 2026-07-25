import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const data = await this.articleService.findPublished(page, limit);
    return { message: 'لیست مقالات', data };
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.articleService.findBySlug(slug);
    return { message: 'اطلاعات مقاله', data };
  }

  @Get('product/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  async getArticlesByProduct(@Param('productId') productId: string) {
    const data = await this.articleService.getArticlesByProduct(productId);
    return { message: 'مقالات مرتبط با محصول', data };
  }
}