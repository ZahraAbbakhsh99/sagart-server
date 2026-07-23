import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { JalaliDateUtil } from '../common/jalali';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    private userService: UserService,
    private productService: ProductService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    await this.productService.findOneEntity(dto.productId);

    const existing = await this.reviewRepo.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      throw new BadRequestException('شما قبلاً برای این محصول نظر ثبت کرده‌اید');
    }

    const review = this.reviewRepo.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      comment: dto.comment,
      fullName: dto.fullName, 
      status: ReviewStatus.PENDING,
    });
    await this.reviewRepo.save(review);

    return { message: 'نظر شما با موفقیت ثبت شد و منتظر تایید ادمین است' };
  }

  async getProductReviews(productId: string) {
    const reviews = await this.reviewRepo.find({
      where: { productId, status: ReviewStatus.APPROVED },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      user: {
        fullName: review.fullName || review.user.fullName ,
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: JalaliDateUtil.toJalali(review.createdAt, 'jDD jMMMM jYYYY'),
    }));
  }

  async getUserReviews(userId: string) {
    const reviews = await this.reviewRepo.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      product: {
        id: review.product.id,
        title: review.product.title,
        slug: review.product.slug,
      },
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: JalaliDateUtil.toJalali(review.createdAt, 'jDD jMMMM jYYYY'),
    }));
  }

  // admin
  async getReviewsByStatus(status?: ReviewStatus) {
    const where: any = {};
    if (status) where.status = status;

    const reviews = await this.reviewRepo.find({
      where,
      relations: { user: true, product: true },
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      user: {
        id: review.user.id,
        fullName: review.fullName || review.user.fullName,
        phone: review.user.phone,
      },
      product: {
        id: review.product.id,
        title: review.product.title,
      },
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: JalaliDateUtil.toJalali(review.createdAt, 'jDD jMMMM jYYYY'),
      updatedAt: JalaliDateUtil.toJalali(review.updatedAt, 'jDD jMMMM jYYYY'),
    }));
  }

  async updateStatus(reviewId: string, dto: UpdateReviewStatusDto) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: { product: true },
    });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    const previousStatus = review.status;

    review.status = dto.status;
    await this.reviewRepo.save(review);

    if (dto.status === ReviewStatus.APPROVED && previousStatus !== ReviewStatus.APPROVED) {
      await this.updateProductRating(review.productId);
    }

    return { message: `وضعیت نظر به ${dto.status} تغییر یافت`, status: dto.status };
  }

  private async updateProductRating(productId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('ROUND(CAST(AVG(review.rating) AS numeric), 1)', 'avg')
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    const newRating = result?.avg ? parseFloat(result.avg) : 0;

    await this.productService.updateRating(productId, newRating);
  }

  async deleteReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: { product: true },
    });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    await this.reviewRepo.remove(review);

    if (review.status === ReviewStatus.APPROVED) {
      await this.updateProductRating(review.productId);
    }

    return { message: 'نظر با موفقیت حذف شد' };
  }
}