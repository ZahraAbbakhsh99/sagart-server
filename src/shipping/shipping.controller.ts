import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@ApiBearerAuth()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const data = await this.shippingService.findAll();
    return { message: 'تنظیمات ارسال', data };
  }
}