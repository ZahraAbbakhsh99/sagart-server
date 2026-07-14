import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException, Post, Delete, Query } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { UserService } from '../../user/user.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CategoryService } from '../../category/category.service';
import { CreateCategoryDto } from '../../category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';

@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get('categories')
  @ApiQuery({ name: 'isActive', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'name', required: false })
  async findAll(@Query('isActive') isActive?: string, @Query('name') name?: string) {
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (name) filter.name = name;
    return await this.categoryService.findAllWithFilter(filter);
  }
  
  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    await this.categoryService.create(dto);
    return { message: 'دسته‌بندی با موفقیت ایجاد شد' };
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    await this.categoryService.update(id, dto);
    return { message: 'دسته‌بندی با موفقیت ویرایش شد' };
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }

  @Patch('categories/:id/toggle')
  async toggleCategory(@Param('id') id: string) {
    const data = await this.categoryService.toggleActive(id);
    const isActive = data.isActive
    return { message: 'وضعیت دسته‌بندی تغییر کرد' , isActive};
  }

  @Post('categories/seed')
  async seedCategories() {
    await this.categoryService.seedDefaultCategories();
    return { message: 'دسته‌بندی‌های پیش‌فرض ایجاد شدند' };
  }
}