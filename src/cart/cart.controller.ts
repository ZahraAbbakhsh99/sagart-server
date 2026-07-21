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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    const data = await this.cartService.getCart(req.user.id);
    return { message: 'سبد خرید', data };
  }

  @Post('items')
  async addItem(@Request() req, @Body() dto: AddToCartDto) {
    await this.cartService.addItem(req.user.id, dto);
    return { message: 'محصول به سبد خرید اضافه شد' };
  }

  @Patch('items/:itemId')
  async updateQuantity(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateQuantity(req.user.id, itemId, dto);
    return { message: 'تعداد آیتم به‌روزرسانی شد', newQuantity: data.quantity };
  }

  @Delete('items/:itemId')
  async removeItem(@Request() req, @Param('itemId') itemId: string) {
    await this.cartService.removeItem(req.user.id, itemId);
    return { message: 'آیتم از سبد خرید حذف شد' };
  }

  @Delete()
  async clearCart(@Request() req) {
    const data = await this.cartService.clearCart(req.user.id);
    return { message: 'سبد خرید خالی شد', data };
  }
}