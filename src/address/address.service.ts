import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
  ) {}

  private toResponse(address: Address) {
    return {
      id: address.id,
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      address: address.address,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    };
  }

  async findAll(userId: string) {
    const addresses = await this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
    return addresses.map((addr) => this.toResponse(addr));
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepo.findOne({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('آدرس یافت نشد');
    return this.toResponse(address);
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepo.create({
      userId,
      ...dto,
    });
    const saved = await this.addressRepo.save(address);
    return this.toResponse(saved);
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.addressRepo.findOne({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('آدرس یافت نشد');

    if (dto.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }

    Object.assign(address, dto);
    const saved = await this.addressRepo.save(address);
    return this.toResponse(saved);
  }

  async delete(id: string, userId: string) {
    const address = await this.addressRepo.findOne({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('آدرس یافت نشد');
    await this.addressRepo.remove(address);
    return { message: 'آدرس با موفقیت حذف شد' };
  }

  async setDefault(id: string, userId: string) {
    const address = await this.addressRepo.findOne({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('آدرس یافت نشد');

    await this.addressRepo.update({ userId }, { isDefault: false });

    address.isDefault = true;
    const saved = await this.addressRepo.save(address);
    return this.toResponse(saved);
  }
}