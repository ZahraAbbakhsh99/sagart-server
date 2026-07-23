import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    const data = await this.reviewService.create(req.user.id, dto);
    return { message: data.message };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyReviews(@Request() req) {
    const data = await this.reviewService.getUserReviews(req.user.id);
    return { message: 'لیست نظرات شما', data };
  }

  @Get('product/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductReviews(@Param('productId') productId: string) {
    const data = await this.reviewService.getProductReviews(productId);
    return { message: 'نظرات محصول', data };
  }
}