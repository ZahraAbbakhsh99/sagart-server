import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService, 
  ) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const data = await this.adminService.getCurrentAdmin(req.user.id);
    return { message: 'اطلاعات ادمین', data };
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateAdminDto) {
    const data = await this.adminService.updateAdmin(req.user.id, dto);
    return { message: 'اطلاعات ادمین به‌روزرسانی شد', data };
  }

  @Get('users')
  async findAllUsers() {
    const data = await this.userService.findAllUsers();
    return { message: 'لیست کاربران', data };
  }
}