import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ShippingService } from '../../shipping/shipping.service';
import { CreateShippingDto } from '../../shipping/dto/create-shipping.dto';
import { UpdateShippingDto } from '../../shipping/dto/update-shipping.dto';

@ApiTags('admin-shipping')
@ApiBearerAuth()
@Controller('admin/shipping')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  async findAll() {
    const data = await this.shippingService.findAllForAdmin();
    return { message: 'لیست تنظیمات ارسال', data };
  }


  @Post()
  async create(@Body() dto: CreateShippingDto) {
    const data = await this.shippingService.create(dto);
    return { message: 'تنظیمات ارسال ایجاد شد', data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateShippingDto) {
    const data = await this.shippingService.update(id, dto);
    return { message: 'تنظیمات ارسال ویرایش شد', data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.shippingService.delete(id);
    return { message: data.message };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    const data = await this.shippingService.toggleActive(id);
    return { message: 'وضعیت تنظیمات ارسال تغییر کرد', data };
  }
}