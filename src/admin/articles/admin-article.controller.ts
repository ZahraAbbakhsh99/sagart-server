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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ArticleService } from '../../article/article.service';
import { CreateArticleDto } from '../../article/dto/create-article.dto';
import { UpdateArticleDto } from '../../article/dto/update-article.dto';
import { ArticleStatus } from '../../article/entities/article.entity';

@ApiTags('admin-articles')
@ApiBearerAuth()
@Controller('admin/articles')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: ArticleStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('status') status?: ArticleStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const data = await this.articleService.findAllForAdmin(status, page, limit);
    return { message: 'لیست مقالات', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.articleService.findOne(id);
    return { message: 'اطلاعات مقاله', data };
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateArticleDto) {
    await this.articleService.create(req.user.id, dto);
    return { message: 'مقاله با موفقیت ایجاد شد' };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateArticleDto,
  ) {
    await this.articleService.update(id, dto, req.user.id);
    return { message: 'مقاله با موفقیت ویرایش شد' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.articleService.delete(id);
    return { message: 'مقاله با موفقیت حذف شد' };
  }

  @Patch(':id/status')
  @ApiQuery({
    name: 'status',
    enum: ['draft', 'published', 'archived'],
    required: true,
  })
  async changeStatus(
    @Param('id') id: string,
    @Query('status') status: ArticleStatus,
  ) {
    await this.articleService.changeStatus(id, status);
    return { message: `وضعیت مقاله به ${status} تغییر یافت` };
  }
}