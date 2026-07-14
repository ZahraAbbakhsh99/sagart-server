import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('این نام قبلاً ثبت شده است');
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAllWithFilter(filter: { isActive?: boolean; name?: string } = {}): Promise<Category[]> {
    const queryBuilder = this.categoryRepo.createQueryBuilder('category');
    
    if (filter.isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive: filter.isActive });
    }
    if (filter.name) {
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${filter.name}%` });
    }
    
    return queryBuilder
    .select([
      'category.id',
      'category.name',
      'category.image',
      'category.coverImage',
      'category.label',
      'category.isActive',
    ])
    .orderBy('category.createdAt', 'ASC')
    .getMany();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoryRepo.findOne({ where: { name } });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('این نام قبلاً ثبت شده است');
    }
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoryRepo.remove(category);
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.findById(id);
    category.isActive = !category.isActive;
    return this.categoryRepo.save(category);
  }

  async seedDefaultCategories(): Promise<void> {
    const defaults = ['زعفران', 'زرشک', 'عناب', 'سوغات'];
    for (const name of defaults) {
      const exists = await this.categoryRepo.findOne({ where: { name } });
      if (!exists) {
        await this.categoryRepo.save(this.categoryRepo.create({ name }));
      }
    }
  }
}