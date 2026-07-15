import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ProductService } from '../../product/product.service';
import { CreateProductDto } from '../../product/dto/create-product.dto';
import { UpdateProductDto } from '../../product/dto/update-product.dto';
import { BulkCreateProductDto } from '../../product/dto/bulk-create-product.dto';

@ApiTags('admin-products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiQuery({ name: 'activeOnly', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const isActive = activeOnly === 'true' ? true : activeOnly === 'false' ? false : undefined;
    const data = await this.productService.findAll(isActive, categoryId, search, page, limit);
    return { message: 'لیست محصولات', data };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.productService.findById(id);
    return { message: 'اطلاعات محصول', data };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    await this.productService.create(dto);
    return { message: 'محصول با موفقیت ایجاد شد' };
  }

  @Post('bulk')
  async createBulk(@Body() dto: BulkCreateProductDto) {
    const data = await this.productService.createBulk(dto);
    return {
      message: `${data.length} محصول با موفقیت ایجاد شد`,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productService.update(id, dto);
    return { message: 'محصول با موفقیت ویرایش شد', data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productService.delete(id);
    return { message: 'محصول با موفقیت حذف شد' };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    const data = await this.productService.toggleActive(id);
    const isActive = data.isActive;
    return { message: 'وضعیت محصول تغییر کرد', isActive };
  }
}