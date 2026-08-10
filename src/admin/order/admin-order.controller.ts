import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { OrderService } from '../../order/order.service';
import { UpdateOrderStatusDto } from '../../order/dto/update-order-status.dto';
import { OrderStatus } from '../../order/entities/order.entity';

@ApiTags('admin-orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const data = await this.orderService.findAllForAdmin(status, page, limit);
    return { message: 'لیست سفارش‌ها', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.orderService.findOneForAdmin(id);
    return { message: 'اطلاعات سفارش', data };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const data = await this.orderService.updateStatus(id, dto);
    return { message: 'وضعیت سفارش تغییر یافت', data };
  }
}