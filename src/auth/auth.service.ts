import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SmsService } from '../sms/sms.service';
import { User } from '../user/entities/user.entity';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { code: string; expires: number }>();

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private smsService: SmsService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(phone: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 2 * 60 * 1000;
    this.otpStore.set(phone, { code, expires });
    await this.smsService.sendOtp(phone, code);
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: Partial<User> }> {
    const record = this.otpStore.get(phone);
    if (!record || record.code !== code || record.expires < Date.now()) {
      throw new UnauthorizedException('کد نامعتبر یا منقضی شده');
    }
    this.otpStore.delete(phone);

    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.createCustomer({ phone });
    }
    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    const limitedUser = {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    };
    return { token, user: limitedUser };
  }

  async adminLogin(username: string, password: string): Promise<{ token: string }> {
    const admin = await this.adminService.findByUsername(username);
    if (!admin) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }
    const token = this.jwtService.sign(
      { sub: admin.id, role: admin.role },
      { expiresIn: '1d' },
    );
    return { token };
  }

  async createAdmin(username: string, password: string): Promise<User> {
    if (process.env.NODE_ENV !== 'development') {
      throw new UnauthorizedException('این عملیات فقط در محیط توسعه مجاز است');
    }
    return this.adminService.createAdmin(username, password);
  }
}