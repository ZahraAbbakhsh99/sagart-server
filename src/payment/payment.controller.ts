import { Controller, Post, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('request/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async requestPayment(@Param('orderId') orderId: string, @Request() req) {
    const data = await this.paymentService.requestPayment(orderId, req.user.id);
    return { message: 'درخواست پرداخت ثبت شد', data };
  }

  @Get('verify')
  async verifyPayment(@Query('Authority') authority: string, @Query('Status') status: string) {
    const data = await this.paymentService.verifyPayment(authority, status);
    return data;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPaymentStatus(@Param('id') id: string) {
    const data = await this.paymentService.getPaymentStatus(id);
    return { message: 'وضعیت پرداخت', data };
  }
}