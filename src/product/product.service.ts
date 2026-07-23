import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkCreateProductDto } from './dto/bulk-create-product.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductDetailResponseDto } from './dto/product-detail-response.dto';
import { FavoritesService } from '../favorites/favorites.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
  ) {}

  private generateSlug(title: string, measure: string): string {
    const base = `${title} ${measure}`.trim();
    return base
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]/g, '')
      .toLowerCase();
  }

  private async getLastProductCode(prefix: string): Promise<number> {
    const products = await this.productRepo
      .createQueryBuilder('product')
      .where('product.code LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('product.code', 'DESC')
      .getMany();

    if (products.length === 0) return 0;

    const lastCode = products[0].code;
    const parts = lastCode.split('-');
    const lastNumber = parseInt(parts[parts.length - 1], 10);
    return isNaN(lastNumber) ? 0 : lastNumber;
  }

  public async findOneEntity(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  private mapToDetailDto(product: Product, isFavorite: boolean = false, isInCart: boolean = false,): ProductDetailResponseDto {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      code: product.code,
      price: Number(product.price),
      discountDisplay: product.discountPercent > 0 
        ? `${Math.round(Number(product.discountPercent))}%` 
        : '۰%',
      priceAfterDiscount: product.priceAfterDiscount,
      measure: product.measure,
      images: product.images,
      description: product.description,
      harvestMethod: product.harvestMethod,
      storageMethod: product.storageMethod,
      specifications: product.specifications,
      packagingShipping: product.packagingShipping,
      usageGuide: product.usageGuide,
      rating: product.rating,
      isActive: product.isActive,
      isFavorite,
      isInCart,
      category: {
        id: product.category?.id,
        name: product.category?.name,
      },
    };
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(dto.title, dto.measure);
    
    const existing = await this.productRepo.findOne({
      where: [{ code: dto.code }, { slug }],
    });
    if (existing) {
      throw new ConflictException('کد محصول یا عنوان با این اندازه تکراری است');
    }
    
    const product = this.productRepo.create({
      ...dto,
      slug,
    });
    return this.productRepo.save(product);
  }

  async createBulk(dto: BulkCreateProductDto): Promise<Product[]> {
    const { title, codePrefix, variants, categoryId, defaultDiscountPercent, ...rest } = dto;
    const products: Product[] = [];
    const errors: string[] = [];

    const lastNumber = await this.getLastProductCode(codePrefix);
    let nextNumber = lastNumber + 1;

    const measureSet = new Set<string>();
    for (const variant of variants) {
      if (measureSet.has(variant.measure)) {
        throw new BadRequestException(`اندازه "${variant.measure}" در لیست ورینت‌ها تکراری است`);
      }
      measureSet.add(variant.measure);
    }

    for (const variant of variants) {
      const code = `${codePrefix}-${String(nextNumber).padStart(3, '0')}`;
      const slug = this.generateSlug(title, variant.measure);

      const existing = await this.productRepo.findOne({
        where: [{ code }, { slug }],
      });

      if (existing) {
        errors.push(`اندازه "${variant.measure}" از قبل وجود دارد (کد: ${existing.code})`);
        continue;
      }

      const discount = variant.discountPercent ?? defaultDiscountPercent ?? 0;

      const product = this.productRepo.create({
        title,
        slug,
        code,
        measure: variant.measure,
        weight: variant.weight,
        price: variant.price,
        discountPercent: discount,
        categoryId,
        ...rest,
      });
      products.push(product);
      nextNumber++;
    }

    if (products.length === 0) {
      throw new BadRequestException(
        `هیچ محصول جدیدی ایجاد نشد. خطاها: ${errors.join('; ')}`
      );
    }

    return this.productRepo.save(products);
  }

  async findAll(
    activeOnly?: boolean,
    categoryId?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
    random: boolean = false,
    userId?: string,
  ): Promise<{
    items: ProductListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const countQuery = this.productRepo
      .createQueryBuilder('product')
      .where('1=1');
    if (activeOnly !== undefined) {
      countQuery.andWhere('product.isActive = :isActive', { isActive: activeOnly });
    }
    if (categoryId) {
      countQuery.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (search) {
      countQuery.andWhere('product.title ILIKE :search', { search: `%${search}%` });
    }
    const total = await countQuery.getCount();

    const idsQuery = this.productRepo
      .createQueryBuilder('product')
      .select('product.id')
      .where('1=1');
    if (activeOnly !== undefined) {
      idsQuery.andWhere('product.isActive = :isActive', { isActive: activeOnly });
    }
    if (categoryId) {
      idsQuery.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (search) {
      idsQuery.andWhere('product.title ILIKE :search', { search: `%${search}%` });
    }

    if (random) {
      idsQuery.orderBy('RANDOM()');
    } else {
      idsQuery.orderBy('product.createdAt', 'DESC');
    }

    idsQuery.skip(skip).take(limit);

    idsQuery.distinct(false);

    const idsResult = await idsQuery.getRawMany();
    const ids = idsResult.map((row: any) => row.product_id);

    if (ids.length === 0) {
      return {
        items: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const products = await this.productRepo.find({
      where: { id: In(ids) },
      relations: { category: true },
    });

    const orderedProducts = ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    let favoriteIds = new Set<string>();
    let cartIds = new Set<string>();
    if (userId && orderedProducts.length > 0) {
      const productIds = orderedProducts.map((p) => p.id);
      favoriteIds = await this.favoritesService.getFavoriteProductIds(userId, productIds);
      cartIds = await this.cartService.getCartProductIds(userId, productIds);
    }

    const items = orderedProducts.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      code: product.code,
      measure: product.measure,
      price: Number(product.price),
      priceAfterDiscount: product.priceAfterDiscount,
      discountDisplay: product.discountPercent > 0 
        ? `${Math.round(Number(product.discountPercent))}%` 
        : '۰%',
      images: product.images,
      rating: product.rating,
      isActive: product.isActive,
      isFavorite: favoriteIds.has(product.id),
      isInCart: cartIds.has(product.id),
      category: {
        id: product.category?.id,
        name: product.category?.name,
      },
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId?: string): Promise<ProductDetailResponseDto> {
    const product = await this.findOneEntity(id);
    let isFavorite = false;
    let isInCart = false;
    if (userId) {
      const favoriteIds = await this.favoritesService.getFavoriteProductIds(userId, [product.id]);
      isFavorite = favoriteIds.has(product.id);

      const cartIds = await this.cartService.getCartProductIds(userId, [product.id]);
      isInCart = cartIds.has(product.id);
    }
    return this.mapToDetailDto(product, isFavorite, isInCart);
  }

  async findBySlug(slug: string, userId?: string): Promise<ProductDetailResponseDto> {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    let isFavorite = false;
    let isInCart = false;
    if (userId) {
      const favoriteIds = await this.favoritesService.getFavoriteProductIds(userId, [product.id]);
      isFavorite = favoriteIds.has(product.id);

      const cartIds = await this.cartService.getCartProductIds(userId, [product.id]);
      isInCart = cartIds.has(product.id);
    }
    return this.mapToDetailDto(product, isFavorite, isInCart);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOneEntity(id);

    if (dto.title || dto.measure) {
      const newTitle = dto.title || product.title;
      const newMeasure = dto.measure || product.measure;
      const newSlug = this.generateSlug(newTitle, newMeasure);
      
      if (newSlug !== product.slug) {
        const existing = await this.productRepo.findOne({ where: { slug: newSlug } });
        if (existing && existing.id !== id) {
          throw new ConflictException('این عنوان با این اندازه قبلاً استفاده شده است');
        }
        product.slug = newSlug;
      }
    }

    if (dto.code && dto.code !== product.code) {
      const existing = await this.productRepo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== id) {
        throw new ConflictException('این کد قبلاً استفاده شده است');
      }
      product.code = dto.code;
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findOneEntity(id);
    await this.productRepo.remove(product);
  }

  async toggleActive(id: string): Promise<Product> {
    const product = await this.findOneEntity(id);
    product.isActive = !product.isActive;
    return this.productRepo.save(product);
  }

  async updateRating(productId: string, newRating: number): Promise<void> {
    await this.productRepo.update(productId, { rating: newRating });
  }

  async getRelatedProductsBySlug(
    slug: string,
    limit: number = 10,
    userId?: string,
  ): Promise<ProductDetailResponseDto[]> {
    const currentProduct = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: { category: true },
    });
    if (!currentProduct) throw new NotFoundException('محصول یافت نشد');

    const result: Product[] = [];
    const usedIds = new Set<string>([currentProduct.id]);

    const variants = await this.productRepo.find({
      where: { title: currentProduct.title, isActive: true },
      relations: { category: true },
    });
    const otherVariants = variants.filter((p) => p.id !== currentProduct.id);
    for (const v of otherVariants.slice(0, 3)) {
      result.push(v);
      usedIds.add(v.id);
    }

    const sameCategorySameWeight = await this.productRepo.find({
      where: {
        categoryId: currentProduct.categoryId,
        weight: currentProduct.weight,
        isActive: true,
      },
      relations: { category: true },
    });
    for (const p of sameCategorySameWeight
      .filter((p) => !usedIds.has(p.id) && p.title !== currentProduct.title)
      .slice(0, 3)) {
      result.push(p);
      usedIds.add(p.id);
    }

    const sameCategoryDifferentWeight = await this.productRepo.find({
      where: {
        categoryId: currentProduct.categoryId,
        isActive: true,
      },
      relations: { category: true },
    });
    for (const p of sameCategoryDifferentWeight
      .filter((p) => !usedIds.has(p.id) && p.weight !== currentProduct.weight)
      .slice(0, 2)) {
      result.push(p);
      usedIds.add(p.id);
    }

    const otherCategoriesSameWeight = await this.productRepo.find({
      where: {
        weight: currentProduct.weight,
        isActive: true,
      },
      relations: { category: true },
    });
    for (const p of otherCategoriesSameWeight
      .filter((p) => !usedIds.has(p.id) && p.categoryId !== currentProduct.categoryId)
      .slice(0, 2)) {
      result.push(p);
      usedIds.add(p.id);
    }

    if (result.length < limit) {
      const remaining = limit - result.length;
      const randomProducts = await this.productRepo.find({
        where: { isActive: true },
        relations: { category: true },
      });
      for (const p of randomProducts
        .filter((p) => !usedIds.has(p.id))
        .slice(0, remaining)) {
        result.push(p);
        usedIds.add(p.id);
      }
    }

    let favoriteIds = new Set<string>();
    let cartIds = new Set<string>();
    if (userId && result.length > 0) {
      const productIds = result.map((p) => p.id);
      favoriteIds = await this.favoritesService.getFavoriteProductIds(userId, productIds);
      cartIds = await this.cartService.getCartProductIds(userId, productIds);
    }

    return result.slice(0, limit).map((product) =>
      this.mapToDetailDto(product, favoriteIds.has(product.id), cartIds.has(product.id))
    );
  }
}