import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const data = await this.productService.findAll(
      true, 
      categoryId,
      search,
      page,
      limit,
      true,
    );
    return { message: 'لیست محصولات', data };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.productService.findBySlug(slug);
  }

  @Get(':slug/related')
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getRelatedProducts(
    @Param('slug') slug: string,
    @Query('limit') limit: number = 10,
  ) {
    const data = await this.productService.getRelatedProductsBySlug(slug, limit);
    return { message: 'محصولات مشابه', data };
  }
}