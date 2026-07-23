import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard) 
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req?,
  ) {
    const userId = req.user?.id;
    const data = await this.productService.findAll(
      true,
      categoryId,
      search,
      page,
      limit,
      true,
      userId,
    );
    return { message: 'لیست محصولات', data };
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard) 
  @ApiBearerAuth()
  async findBySlug(@Param('slug') slug: string, @Request() req?) {
    const userId = req.user?.id;
    const data = await this.productService.findBySlug(slug, userId);
    return { message: 'اطلاعات محصول', data };
  }

  @Get(':slug/related')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard) 
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getRelatedProducts(
    @Param('slug') slug: string,
    @Query('limit') limit: number = 10,
    @Request() req?,
  ) {
    const userId = req.user?.id;
    const data = await this.productService.getRelatedProductsBySlug(slug, limit, userId);
    return { message: 'محصولات مشابه', data };
  }
}