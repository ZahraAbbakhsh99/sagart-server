import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ReviewService } from '../../review/review.service';
import { UpdateReviewStatusDto } from '../../review/dto/update-review-status.dto';
import { ReviewStatus } from '../../review/entities/review.entity';

@ApiTags('admin-reviews')
@ApiBearerAuth()
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: ReviewStatus, required: false })
  async getReviews(@Query('status') status?: ReviewStatus) {
    const data = await this.reviewService.getReviewsByStatus(status);
    return { message: 'لیست نظرات', data };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    const data = await this.reviewService.updateStatus(id, dto);
    return { message: data.message, status: data.status };
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    const data = await this.reviewService.deleteReview(id);
    return { message: data.message };
  }
}