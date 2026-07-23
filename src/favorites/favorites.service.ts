import { Injectable, NotFoundException, ConflictException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteItem } from './entities/favorite-item.entity';
import { ProductService } from '../product/product.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { In } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteItem)
    private favoriteRepo: Repository<FavoriteItem>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
  ) {}

  async getFavorites(userId: string) {
    const favorites = await this.favoriteRepo.find({
      where: { userId },
      relations: { product: { category: true } },
      order: { createdAt: 'DESC' },
    });

    const items = favorites.map((item) => {
      const product = item.product;
      const price = Number(product.price);
      const discount = Number(product.discountPercent);
      const finalPrice = price * (1 - discount / 100);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        code: product.code,
        measure: product.measure,
        price: price,
        priceAfterDiscount: Math.round(finalPrice),
        discountDisplay: discount > 0 ? `${Math.round(discount)}%` : '۰%',
        images: product.images,
        rating: product.rating,
        isActive: product.isActive,
        category: {
          id: product.category?.id,
          name: product.category?.name,
        },
        addedAt: item.createdAt,
      };
    });

    return {
      items,
      total: items.length,
    };
  }

  async addFavorite(userId: string, dto: AddFavoriteDto) {
    const { productId } = dto;

    const product = await this.productService.findOneEntity(productId);
    if (!product.isActive) {
      throw new BadRequestException('این محصول غیرفعال است');
    }

    const existing = await this.favoriteRepo.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('این محصول قبلاً به علاقمندی‌ها اضافه شده است');
    }

    const favorite = this.favoriteRepo.create({
      userId,
      productId,
    });
    await this.favoriteRepo.save(favorite);

    return this.getFavorites(userId);
  }

  async removeFavorite(userId: string, productId: string) {
    const favorite = await this.favoriteRepo.findOne({
      where: { userId, productId },
    });
    if (!favorite) {
      throw new NotFoundException('این محصول در علاقمندی‌های شما وجود ندارد');
    }

    await this.favoriteRepo.remove(favorite);
    return this.getFavorites(userId);
  }

  async getFavoriteProductIds(userId: string, productIds: string[]): Promise<Set<string>> {
    if (!userId || !productIds || productIds.length === 0) {
      return new Set();
    }

    const favorites = await this.favoriteRepo.find({
      where: {
        userId,
        productId: In(productIds),
      },
      select: {
        productId: true,
      },
    });

    return new Set(favorites.map((fav) => fav.productId));
  }
}