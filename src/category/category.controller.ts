import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return await this.categoryService.findAllWithFilter({ isActive: true });
  }

  // @Get(':id')
  // async findById(@Param('id') id: string) {
  //   return await this.categoryService.findById(id);
  // }
}