import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    const data = await this.orderService.create(req.user.id, dto);
    return { message: 'سفارش با موفقیت ثبت شد', data };
  }

  @Get()
  async findAll(@Request() req) {
    const data = await this.orderService.findAll(req.user.id);
    return { message: 'لیست سفارش‌ها', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const data = await this.orderService.findOne(id, req.user.id);
    return { message: 'اطلاعات سفارش', data };
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req) {
    const data = await this.orderService.cancelOrder(id, req.user.id);
    return data;
  }
}