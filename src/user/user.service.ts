import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JalaliDateUtil } from '../common/jalali';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createCustomer(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException('این شماره تلفن قبلاً ثبت شده است');
    }
    const user = this.userRepo.create({
      phone: dto.phone,
      fullName: dto.fullName || 'یار دیرینه',
      role: UserRole.CUSTOMER,
    });
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { phone } });
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    const updated = await this.userRepo.save(user);
    return {
      id: updated.id,
      fullName: updated.fullName,
      phone: updated.phone,
      role: updated.role,
      isActive: updated.isActive,
    };
  }

  //  for admin
  async findAllUsers(): Promise<any[]> {
    const users = await this.userRepo.find({
      where: { role: UserRole.CUSTOMER },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return users.map(user => ({
      ...user,
      createdAt: JalaliDateUtil.toJalali(user.createdAt, 'jDD jMMMM jYYYY'),
    }));
  }
}