import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JalaliDateUtil } from '../common/jalali';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createAdmin(username: string, password: string): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) {
      throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = this.userRepo.create({
      username,
      password: hashed,
      phone: `admin_${Date.now()}`,
      role: UserRole.ADMIN,
      isActive: true,
    });
    return this.userRepo.save(admin);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username, role: UserRole.ADMIN } });
  }

  async findAdminById(id: string): Promise<User> {
    const admin = await this.userRepo.findOne({ where: { id, role: UserRole.ADMIN } });
    if (!admin) throw new NotFoundException('ادمین یافت نشد');
    return admin;
  }

  async getCurrentAdmin(adminId: string): Promise<Partial<any>> {
    const admin = await this.findAdminById(adminId);
    return {
      id: admin.id,
      username: admin.username,
      createdAt: JalaliDateUtil.toJalali(admin.createdAt, 'jDD jMMMM jYYYY'),
    };
  }

  async updateAdmin(adminId: string, data: { username?: string; password?: string }): Promise<Partial<User>> {
    const admin = await this.findAdminById(adminId);

    if (data.username) {
      const existing = await this.userRepo.findOne({ where: { username: data.username } });
      if (existing && existing.id !== adminId) {
        throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
      }
      admin.username = data.username;
    }

    if (data.password) {
      admin.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.userRepo.save(admin);
    return {
      id: updated.id,
      username: updated.username,
      phone: updated.phone,
      role: updated.role,
      isActive: updated.isActive,
      fullName: updated.fullName,

      updatedAt: updated.updatedAt,
    };
  }
}