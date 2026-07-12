import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminCreateDto } from './dto/admin-create.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.authService.sendOtp(dto.phone);
    return { message: 'کد تایید ارسال شد' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto.phone, dto.code);
    return {
      message: 'ورود با موفقیت انجام شد',
      data: {
        token: result.token,
        user: result.user,
      },
    };
  }

  @Post('admin/login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    const result = await this.authService.adminLogin(dto.username, dto.password);
    return {
      message: 'ورود ادمین با موفقیت انجام شد',
      data: result,
    };
  }

  @Post('admin/create')
  async createAdmin(@Body() dto: AdminCreateDto) {
    const user = await this.authService.createAdmin(dto.username, dto.password);
    return {
      message: 'ادمین با موفقیت ساخته شد',
      data: { id: user.id, username: user.username, role: user.role },
    };
  }
}