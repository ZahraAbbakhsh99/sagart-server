import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { JalaliDateUtil } from '../common/jalali';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    private userService: UserService,
    private productService: ProductService,
  ) {}

  private generateSlug(title: string): string {
    return title
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]/g, '')
      .toLowerCase();
  }

  async create(authorId: string, dto: CreateArticleDto) {
    const slug = this.generateSlug(dto.title);

    const existing = await this.articleRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('این عنوان قبلاً استفاده شده است');
    }

    let products: Product[] = [];
    if (dto.productIds && dto.productIds.length > 0) {
      products = await this.productService.findAllByIds(dto.productIds);
    }

    const isPublished = dto.status === ArticleStatus.PUBLISHED;

    const articleData: DeepPartial<Article> = {
      title: dto.title,
      slug,
      excerpt: dto.excerpt ?? undefined,
      content: dto.content,
      featuredImage: dto.featuredImage ?? undefined,
      videoUrl: dto.videoUrl ?? undefined,
      readingTime: dto.readingTime ?? 0,
      publishedAt: isPublished ? new Date() : undefined,
      status: dto.status ?? ArticleStatus.DRAFT,
      authorId,
      products,
    };

    const article = this.articleRepo.create(articleData);
    await this.articleRepo.save(article);
    return this.findOne(article.id);
  }

  async findOneEntity(id: string): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: { products: {category: true} },
    });
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    return article;
  }

  private mapToDetailResponse(article: Article) {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      featuredImage: article.featuredImage,
      videoUrl: article.videoUrl,
      readingTime: article.readingTime,
      publishedAt: article.publishedAt
        ? JalaliDateUtil.toJalali(article.publishedAt, 'jDD jMMMM jYYYY')
        : null,
      status: article.status,
      views: article.views,
      products: article.products?.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        discountPercent: Number(p.discountPercent),
        priceAfterDiscount: p.priceAfterDiscount,
        measure: p.measure,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        isActive: p.isActive,
        categoryName: p.category?.name,
      })),
      createdAt: JalaliDateUtil.toJalali(article.createdAt, 'jDD jMMMM jYYYY'),
      updatedAt: JalaliDateUtil.toJalali(article.updatedAt, 'jDD jMMMM jYYYY'),
    };
  }

  async findOne(id: string) {
    const article = await this.findOneEntity(id);
    return this.mapToDetailResponse(article);
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepo.findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
      relations: { products: {category: true} },
    });
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    article.views += 1;
    await this.articleRepo.save(article);
    return this.mapToDetailResponse(article);
  }

  async findPublished(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.articleRepo.findAndCount({
      where: { status: ArticleStatus.PUBLISHED },
      relations: { products: true },
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });

    const formattedItems = items.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      readingTime: article.readingTime,
      views: article.views,
      productCount: article.products?.length || 0,
      publishedAt: article.publishedAt
        ? JalaliDateUtil.toJalali(article.publishedAt, 'jDD jMMMM jYYYY')
        : null,
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForAdmin(
    status?: ArticleStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.articleRepo.findAndCount({
      where,
      relations: { products: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const formattedItems = items.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      status: article.status,
      views: article.views,
      productCount: article.products?.length || 0,
      createdAt: JalaliDateUtil.toJalali(article.createdAt, 'jDD jMMMM jYYYY'),
      updatedAt: JalaliDateUtil.toJalali(article.updatedAt, 'jDD jMMMM jYYYY'),
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, dto: UpdateArticleDto, userId: string) {
    const article = await this.findOneEntity(id);

    if (dto.title && dto.title !== article.title) {
      const newSlug = this.generateSlug(dto.title);
      const existing = await this.articleRepo.findOne({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('این عنوان قبلاً استفاده شده است');
      }
      article.slug = newSlug;
    }

    if (dto.status && dto.status !== article.status) {
      if (dto.status === ArticleStatus.PUBLISHED) {
        article.publishedAt = new Date();
      } else {
        article.publishedAt = null;
      }
      article.status = dto.status;
    }

    if (dto.productIds !== undefined) {
      if (dto.productIds.length > 0) {
        const products = await this.productService.findAllByIds(dto.productIds);
        article.products = products;
      } else {
        article.products = [];
      }
    }

    const { status, productIds, ...rest } = dto;
    Object.assign(article, rest);

    await this.articleRepo.save(article);
    return this.findOne(id);
  }

  async delete(id: string) {
    const article = await this.findOneEntity(id);
    await this.articleRepo.remove(article);
    return { message: 'مقاله با موفقیت حذف شد' };
  }

  async changeStatus(id: string, status: ArticleStatus) {
    const article = await this.findOneEntity(id);
    article.status = status;
    if (status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    await this.articleRepo.save(article);
    return this.findOne(id);
  }

  async getArticlesByProduct(productId: string) {
    const articles = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoin('article.products', 'product')
      .where('product.id = :productId', { productId })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .orderBy('article.publishedAt', 'DESC')
      .getMany();

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      publishedAt: article.publishedAt
        ? JalaliDateUtil.toJalali(article.publishedAt, 'jDD jMMMM jYYYY')
        : null,
    }));
  }
}