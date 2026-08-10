import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingSetting, ShippingMethod } from './entities/shipping-setting.entity';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingSetting)
    private shippingRepo: Repository<ShippingSetting>,
  ) {}

  private formatSetting(setting: ShippingSetting) {
    return {
      id: setting.id,
      method: setting.method,
      minWeight: Number(setting.minWeight),
      maxWeight: Number(setting.maxWeight),
      cost: Number(setting.cost),
    };
  }

  async create(dto: CreateShippingDto) {
    const existing = await this.shippingRepo.findOne({
      where: {
        method: dto.method,
        minWeight: dto.minWeight,
        maxWeight: dto.maxWeight,
      },
    });
    if (existing) {
      throw new ConflictException('این محدوده وزنی قبلاً ثبت شده است');
    }
    const setting = this.shippingRepo.create(dto);
    return this.shippingRepo.save(setting);
  }

  async findAll() {
    const settings = await this.shippingRepo.find({
      where: { isActive: true },
      order: { method: 'ASC', minWeight: 'ASC' },
    });
    return settings.map((s) => this.formatSetting(s));
  }

  async findAllForAdmin() {
    const settings = await this.shippingRepo.find({
      order: { method: 'ASC', minWeight: 'ASC' },
    });
    return settings.map((s) => ({
      ...this.formatSetting(s),
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async findOne(id: string) {
    const setting = await this.shippingRepo.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('تنظیمات ارسال یافت نشد');
    return setting;
  }

  async update(id: string, dto: UpdateShippingDto) {
    const setting = await this.findOne(id);
    Object.assign(setting, dto);
    return this.shippingRepo.save(setting);
  }

  async delete(id: string) {
    const setting = await this.findOne(id);
    await this.shippingRepo.remove(setting);
    return { message: 'تنظیمات ارسال حذف شد' };
  }

  async toggleActive(id: string) {
    const setting = await this.findOne(id);
    setting.isActive = !setting.isActive;
    return this.shippingRepo.save(setting);
  }

  async getShippingCost(weight: number, method: ShippingMethod): Promise<number> {
    const setting = await this.shippingRepo.findOne({
      where: {
        method,
        minWeight: weight >= 0 ? weight : 0,
        maxWeight: weight <= 0 ? 0 : weight,
        isActive: true,
      },
    });

    if (!setting) {
      const settings = await this.shippingRepo.find({
        where: { method, isActive: true },
        order: { minWeight: 'ASC' },
      });

      for (const s of settings) {
        if (weight >= s.minWeight && weight <= s.maxWeight) {
          return s.cost;
        }
      }
      return 0; 
    }

    return Number(setting.cost);
  }
}